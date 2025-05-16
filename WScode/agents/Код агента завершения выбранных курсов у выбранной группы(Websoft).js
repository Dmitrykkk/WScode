var oParam = new Object();

// Получаем group_id: ищем в dmitry_group.group_id → group_id → по умолчанию ""
oParam.group_id = OptInt(Param.GetOptProperty("dmitry_group.group_id", Param.GetOptProperty("group_id", "")));

// Получаем course_ids: ищем в dmitry_group.course_ids → course_ids → по умолчанию ""
oParam.course_ids = Param.GetOptProperty("dmitry_group.course_ids", Param.GetOptProperty("course_ids", ""));

// Парсим JSON-массив
var parsedData = ParseJson(oParam.course_ids);

// Извлекаем __value из каждого объекта
var courseIdsArray = [];
for (var i = 0; i < parsedData.length; i++) {
    courseIdsArray.push(parsedData[i].__value);
}

// Формируем строку ID через запятую
oParam.course_ids = courseIdsArray.join(", ");

// Формируем SQL-запрос:
// - Ищем обучения сотрудников группы
// - Фильтруем по списку курсов
var sqlQuery = "sql:
SELECT al.id
FROM collaborators c
INNER JOIN group_collaborators gc ON gc.collaborator_id = c.id
INNER JOIN active_learnings al ON al.person_id = c.id
INNER JOIN courses co ON al.course_id = co.id
WHERE gc.group_id = " + oParam.group_id + " 
AND al.course_id IN (" + oParam.course_ids + ")";



// Выполняем запрос
var _course = ArraySelectAll(XQuery(sqlQuery));

// Завершаем активные обучения по найденным записям
for (course in _course) {
  tools.active_learning_finish(course.id);
}