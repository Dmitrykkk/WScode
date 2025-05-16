//Код актуализирует ИОГВ у сотрудников, отменяет отправку сообщений с изменением текста получателей, изменяет SMTP-сервер и логирует результаты выгрузки отчёта и списка групп с уволенными.
log_name = "backup_log";

LogEvent(log_name, "Запуск актуализации ИОГВ у сотрудников");

_iogv_arr = XQuery("sql:WITH hierarchy AS (
    SELECT 
        c.id AS collaborator_id,
        s.id AS subdivision_id,
        s.parent_object_id,
        s.name AS iogv_name,
        c.org_id,
        c.id AS join_id
    FROM collaborators c
    JOIN subdivisions s ON c.position_parent_id = s.id
    WHERE c.org_id =7265611849315002349
      AND s.org_id =7265611849315002349

    UNION ALL

    SELECT 
        h.collaborator_id,
        s.id AS subdivision_id,
        s.parent_object_id,
        s.name AS iogv_name,
        h.org_id,
        h.join_id
    FROM hierarchy h
    JOIN subdivisions s ON h.parent_object_id = s.id
    WHERE s.org_id =7265611849315002349
)

SELECT 
    h.collaborator_id,
    h.iogv_name AS calculated_iogv_name,
    cb.data.value('(collaborator/custom_elems/custom_elem[name = \"f_iogv\"]/value)[1]', 'nvarchar(100)') AS xml_iogv_name
FROM (
    SELECT 
        collaborator_id,
        iogv_name,
        join_id
    FROM hierarchy
    WHERE parent_object_id IS NULL
) h
JOIN collaborator cb ON cb.id = h.join_id
WHERE cb.data.value('(collaborator/custom_elems/custom_elem[name = \"f_iogv\"]/value)[1]', 'nvarchar(100)') IS NULL
   OR cb.data.value('(collaborator/custom_elems/custom_elem[name = \"f_iogv\"]/value)[1]', 'nvarchar(100)') != h.iogv_name
");

if (ArrayCount(_iogv_arr) != 0) {
LogEvent(log_name, "Добавляем ИОГВ у "+ ArrayCount(_iogv_arr) +" сотрудников");
    for (iogv_arr in _iogv_arr) {
        arhDoc = OpenDoc(UrlFromDocID(iogv_arr.collaborator_id))
        arhDoc.TopElem.custom_elems.ObtainChildByKey("f_iogv").value = iogv_arr.calculated_iogv_name
        arhDoc.Save()
    }
    LogEvent(log_name, "Добавлено ИОГВ у сотрудников.");
} else {
    LogEvent(log_name, "Несоответствий ИОГВ не обнаружено");
}
_not_ids = XQuery("sql:SELECT id FROM active_notifications where create_date > (SELECT last_run_date FROM server_agents WHERE id=7148451145125663399)");
// --- Функция для определения правильного склонения ---
function GetDeclension(count, one, two, five) {
    var n = count;

    // Аналог n % 10
    while (n >= 10) { n = n - 10; }
    var remainder10 = n;

    // Аналог n % 100
    n = count;
    while (n >= 100) { n = n - 100; }
    var remainder100 = n;

    if (remainder10 == 1 && remainder100 != 11) return one;
    if ((remainder10 == 2 || remainder10 == 3 || remainder10 == 4) &&
        (remainder100 < 10 || remainder100 > 20)) return two;
    return five;
}

// --- Основной блок кода ---
LogEvent(log_name, "Начало отмены отправки сообщений");

var count = ArrayCount(_not_ids);

if (count != 0) {
    var word = GetDeclension(count, "сообщение", "сообщения", "сообщений");
    LogEvent(log_name, "Отменена отправка у " + count + " " + word);
    
    for (not_id in _not_ids) {
        docActNotif = tools.open_doc(not_id.id);
        teDoc = docActNotif.TopElem;

        for (rep in teDoc.recipients) {
            address_old = rep.address;
            rep.address = "Не отправлено во время выгрузки, почта отправляемого - " + address_old;
        }

        docActNotif.Save();
    }
} else {
    LogEvent(log_name, "Нет сообщений для отмены отправки");
}

LogEvent(log_name, "Конец отмены отправки сообщений");

LogEvent(log_name, "Текущий почтовый сервер: " + global_settings.settings.own_org.smtp_server);

global_settings.settings.own_org.smtp_server = '10.10.30.4';
global_settings.Doc.Save();

LogEvent(log_name, "Измененный почтовый сервер для разблокировки отправки сообщений: " + global_settings.settings.own_org.smtp_server);
formatted_report = ArrayFirstElem(XQuery("sql:SELECT 
    CONCAT(
        '<br>---<br>', 
        REPLACE(ar_data.data.value('(/action_report/report_text/text())[1]', 'NVARCHAR(MAX)'), CHAR(10), '<br>'), 
        '---<br>'
    ) AS formatted_report_text
FROM 
    action_reports ar
JOIN 
    action_report ar_data ON ar.id = ar_data.id
WHERE
    ar.type = 'odbc_to_wt' 
    AND ar_data.created >= (SELECT last_run_date FROM server_agents WHERE id = 7148451145125663399);"));

LogEvent(log_name, "Отформатированный текст отчета выгрузки: " + formatted_report.formatted_report_text);
LogEvent(log_name, "Конец текста отчета выгрузки");
formatted_gs = ArrayFirstElem(XQuery("sql:SELECT 
    COALESCE(
        STRING_AGG(CONCAT(gc.name, ' - ', c.fullname, '<br>'), ''), 
        'Таких групп нет'
    ) AS unique_group_name
FROM group_collaborators gc
LEFT JOIN collaborators c ON gc.collaborator_id = c.id
JOIN [group] g ON gc.group_id = g.id
WHERE c.is_dismiss = '1'
  AND c.role_id <> 'arh'
  AND g.created >= DATEADD(DAY, -60, (SELECT last_run_date FROM server_agents WHERE id = 7148451145125663399))"));

LogEvent(log_name, "Название групп и уволенных людей в ней не в архиве, в группах созданных менее 60 дней назад: <br>---<br>" + formatted_gs.unique_group_name +"<br>---");
LogEvent(log_name, "Конец списка названий групп и уволенных людей в ней не в архиве, в группах созданных менее 60 дней назад");


LogEvent(log_name, "Завершение всех операций. Логирование отключается");
EnableLog(log_name, false);
tools.start_agent(7148514473328701479);