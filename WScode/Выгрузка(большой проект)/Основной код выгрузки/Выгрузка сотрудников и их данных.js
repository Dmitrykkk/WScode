//Код автоматически помечает сотрудников как уволенных, если их данные неактуальны, и закрывает должности уволенных сотрудников. Все действия логируются в журнал.
log_name = "backup_log";
LogEvent(log_name, "Выгрузка сотрудников и их данных завершена");
LogEvent(log_name, "Начало поиска сотрудников с неактуальными данными для пометки как уволенных");

_dismiss_arr = XQuery("sql:SELECT c.id
  FROM collaborators c
  JOIN collaborator cb ON cb.id = c.id
  WHERE c.role_id = 'user_ggs'
AND is_dismiss = 'false'
    AND c.code LIKE '________-____-____-____-____________'
    AND (
      cb.data.exist('(collaborator/last_import_date)[1]') = 0
      OR cb.data.value('(collaborator/last_import_date)[1]', 'datetime') < DATEADD(HOUR, -1, GETDATE())
    )
    AND (
      cb.data.exist('(collaborator/custom_elems/custom_elem[name = \"f_vggs\"])[1]') = 0
      OR cb.data.value('(collaborator/custom_elems/custom_elem[name = \"f_vggs\"]/value)[1]', 'nvarchar(100)') = 'false'
    );");

if (ArrayCount(_dismiss_arr) != 0) {
LogEvent(log_name, "Обрабатываются уволенные сотрудники в количестве: " + ArrayCount(_dismiss_arr));
    for (dismiss_arr in _dismiss_arr) {
        arhDoc = OpenDoc(UrlFromDocID(dismiss_arr.id))
        arhDoc.TopElem.is_dismiss = true
        arhDoc.Save()
    }
    LogEvent(log_name, "Уволенные сотрудники обработаны.");
} else {
    LogEvent(log_name, "Сотрудники для увольнения не найдены");
}


LogEvent(log_name, "Начало закрытия должностей уволенных сотрудников");

_sid_arr = XQuery("sql:SELECT p.id
FROM positions p
JOIN collaborators c ON p.basic_collaborator_id = c.id
WHERE c.is_dismiss = 1 and p.is_position_finished = 'false'");

if (ArrayCount(_sid_arr) != 0) {
LogEvent(log_name, "Количество закрываемых должностей: " + ArrayCount(_sid_arr));
    for (sid_arr in _sid_arr) {
        arhDoc = OpenDoc(UrlFromDocID(sid_arr.id))
        arhDoc.TopElem.is_position_finished = true
        arhDoc.Save()
    }
    LogEvent(log_name, "Должности закрыты.");
} else {
    LogEvent(log_name, "Незакрытых должностей не найдено");
}