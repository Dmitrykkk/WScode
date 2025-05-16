// Выполняем SQL-запрос для выбора курсов, где пользователь сам записался (is_self_enrolled=1)
// и дата начала использования курса более 90 дней назад
var selfArray = XQuery("sql:select 
 al.id as id, 
 al.person_fullname as person_fullname, 
 al.time as time, 
 CONVERT(VARCHAR(15), CAST(GETDATE() AS DATETIME2), 104) today, 
 concat(CONVERT(VARCHAR(15), CAST(REPLACE(al.start_usage_date, 12, 10) AS DATETIME2), 104), '') start_date, 
 concat(CONVERT(VARCHAR(15), CAST(REPLACE(al.max_end_date, 12, 10) AS DATETIME2), 104), '') end_date,
 CASE 
        WHEN al.is_self_enrolled IS NULL THEN '0'  -- Если NULL, выводим '0'
        ELSE CAST(al.is_self_enrolled AS VARCHAR)  -- Иначе преобразуем в строку
    END AS is_self_enrolled
 from 
 active_learnings al
left join
 collaborators c on al.person_id = c.id 
  where
 al.is_self_enrolled=1 and
 al.start_usage_date<GETDATE()-90");

// Проходим по полученным курсам и завершаем обучение для каждого
for (course in selfArray) {
  tools.active_learning_finish(course.id);
}
