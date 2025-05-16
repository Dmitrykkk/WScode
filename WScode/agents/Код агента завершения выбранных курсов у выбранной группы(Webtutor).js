var oParam = new Object();

// Получаем group_id: ищем в dmitry_group.group_id → group_id → по умолчанию ""
oParam.group_id = OptInt(Param.GetOptProperty("dmitry_group.group_id", Param.GetOptProperty("group_id", "")));

// Получаем course_ids: ищем в dmitry_group.course_id1 - course_id7 → course_id1 - course_id7 → по умолчанию ""
oParam.course_id1 = Param.GetOptProperty("dmitry_group.course_id1", Param.GetOptProperty("course_id1", ""));
oParam.course_id2 = Param.GetOptProperty("dmitry_group.course_id2", Param.GetOptProperty("course_id2", ""));
oParam.course_id3 = Param.GetOptProperty("dmitry_group.course_id3", Param.GetOptProperty("course_id3", ""));
oParam.course_id4 = Param.GetOptProperty("dmitry_group.course_id4", Param.GetOptProperty("course_id4", ""));
oParam.course_id5 = Param.GetOptProperty("dmitry_group.course_id5", Param.GetOptProperty("course_id5", ""));
oParam.course_id6 = Param.GetOptProperty("dmitry_group.course_id6", Param.GetOptProperty("course_id6", ""));
oParam.course_id7 = Param.GetOptProperty("dmitry_group.course_id7", Param.GetOptProperty("course_id7", ""));

// Проверяем и объединяем только непустые course_id
var courseIds = "";
if (oParam.course_id1 !== "") courseIds += oParam.course_id1 + ", ";
if (oParam.course_id2 !== "") courseIds += oParam.course_id2 + ", ";
if (oParam.course_id3 !== "") courseIds += oParam.course_id3 + ", ";
if (oParam.course_id4 !== "") courseIds += oParam.course_id4 + ", ";
if (oParam.course_id5 !== "") courseIds += oParam.course_id5 + ", ";
if (oParam.course_id6 !== "") courseIds += oParam.course_id6 + ", ";
if (oParam.course_id7 !== "") courseIds += oParam.course_id7 + ", ";

// Удаляем последнюю запятую, используя StrRangePos
if (courseIds.length > 0) {
  courseIds = StrRangePos(courseIds, 0, courseIds.length - 2); // Убираем последние два символа ", "
}

// Формируем SQL-запрос:
// - Ищем обучения сотрудников группы
// - Фильтруем по списку курсов
var sqlQuery = "sql:" +
  "SELECT al.id " +
  "FROM collaborators c " +
  "INNER JOIN group_collaborators gc ON gc.collaborator_id = c.id " +
  "INNER JOIN active_learnings al ON al.person_id = c.id " +
  "INNER JOIN courses co ON al.course_id = co.id " +
  "WHERE gc.group_id = " + oParam.group_id + 
  " AND al.course_id IN (" + courseIds + ")";


// Выполняем запрос
var _course = ArraySelectAll(XQuery(sqlQuery));


 for (course in _course) {
   tools.active_learning_finish(course.id);
 }