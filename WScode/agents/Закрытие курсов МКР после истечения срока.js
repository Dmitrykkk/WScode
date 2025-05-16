// Формируем SQL-запрос для получения данных
var mcrQuery = "sql: select 
al.id as id,
al.person_fullname as person_fullname,
al.time as time,
CONVERT(VARCHAR(15), CAST(GETDATE() AS DATETIME2), 104) today,
concat(CONVERT(VARCHAR(15), CAST(REPLACE(al.start_learning_date, 12, 10) AS DATETIME2), 104), '') start_date,
concat(CONVERT(VARCHAR(15), CAST(REPLACE(al.max_end_date, 12, 10) AS DATETIME2), 104), '') end_date
from 
collaborators c 
left join 
active_learnings al on al.person_id = c.id 
where 
c.position_parent_id = 7273786632308679325 
AND al.max_end_date < GETDATE()
";

// Выполняем запрос и сохраняем результат в массив
var mcrArray = XQuery(mcrQuery);

// Проходим по каждому результату и завершаем обучение
for (course in mcrArray) {
  tools.active_learning_finish(course.id);
}
