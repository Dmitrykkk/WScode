log_name = "backup_log";
EnableLog(log_name, true);

LogEvent(log_name, "Текущий почтовый сервер: " + global_settings.settings.own_org.smtp_server);

global_settings.settings.own_org.smtp_server = '10.10.30.4444';
global_settings.Doc.Save();

LogEvent(log_name, "Измененный почтовый сервер для блокировки отправки сообщений: " + global_settings.settings.own_org.smtp_server);

LogEvent(log_name, "Запуск проверки: был ли сделан бэкап базы данных за последние сутки");

time_back = ArrayFirstElem(XQuery("sql:SELECT 
    CASE 
        WHEN MAX(backup_finish_date) IS NOT NULL 
             AND DATEDIFF(DAY, MAX(backup_finish_date), GETDATE()) <= 1 
        THEN 'сделан'
        ELSE 'не сделан'
    END AS backup_status
FROM 
    msdb.dbo.backupset
WHERE 
    database_name = 'hsm'
    AND type = 'D';"));

LogEvent(log_name, "Результат проверки последнего бэкапа: " + time_back.backup_status);

if (time_back.backup_status == 'сделан') {
    LogEvent(log_name, "Бэкап найден. Инициируется выгрузка с сервера");
    oRes = CallServerMethod('tools', 'call_code_library_method', ['libMain', 'start_discharge_on_server', [RValue(7146010844574216197)]]);
    LogEvent(log_name, "Выгрузка успешно инициирована");
} else {
    LogEvent(log_name, "Бэкап не найден. Выгрузка не выполняется");
LogEvent(log_name, "Текущий почтовый сервер: " + global_settings.settings.own_org.smtp_server);

global_settings.settings.own_org.smtp_server = '10.10.30.4';
global_settings.Doc.Save();

LogEvent(log_name, "Измененный почтовый сервер для разблокировки отправки сообщений: " + global_settings.settings.own_org.smtp_server);
}