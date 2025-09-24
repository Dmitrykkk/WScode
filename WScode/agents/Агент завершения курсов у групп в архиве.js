/**
 * Агент завершения курсов у групп «в архиве»
 * ---------------------------------------------------------------------------
 * Назначение:
 *  - Находит активные обучения с истёкшим сроком у сотрудников групп, где роль содержит 'архив'.
 *  - Завершает найденные активные обучения (tools.active_learning_finish).
 */

// Конфигурация (параметры для настройки отбора)
var CONFIG = {
  // Имя лога
  LOG_KEY: 'archive_groups_course_finish',
  
  // На сколько дней просрочено активное обучение (max_end_date < GETDATE() - DAYS_OVERDUE)
  DAYS_OVERDUE: 14,
  
  // Фильтр по названию роли группы (LIKE N'%значение%')
  ROLE_NAME_FILTER: 'архив',
  
  // Исключаем курсы, прикреплённые к этим role_id (МКР и ЭН)
  EXCLUDE_COURSE_ROLE_IDS: [7251967416823993702, 7197952896432782699],
  
  // Исключаем группы, у которых parent_role_id МКР
  PARENT_ROLE_ID_NOT_EQUAL: 7267918516068180210,
  
  // Ограничение по организациям (Агент работает только для МКР, ГГС и Корпус)
  ORG_IDS: [7311242143644286815, 7265611849315002349, 7222977324060565395]
};

// Включаем логирование выполнения агента
EnableLog(CONFIG.LOG_KEY, true);

/** @type {string} */
var likeRoleName;
/** @type {string} */
var sqlQuery;
/** @type {Array} */
var rows;
/** @type {XmlElem|undefined} */
var row;
/** @type {number} */
var finishedCount;

// Подготавливаем значение для оператора LIKE по названию роли
likeRoleName = "N'%" + CONFIG.ROLE_NAME_FILTER + "%'";

// Собираем один SQL-запрос (многострочная строка)
sqlQuery = "sql: 
SELECT a.id
FROM [active_learnings] a
JOIN (
    SELECT [id] AS course_id
    FROM [courses]
    WHERE role_id.exist('/role_id[text()='''" + CONFIG.EXCLUDE_COURSE_ROLE_IDS[0] + "''']') = 0
      AND role_id.exist('/role_id[text()='''" + CONFIG.EXCLUDE_COURSE_ROLE_IDS[1] + "''']') = 0
) c ON a.course_id = c.course_id
JOIN [group_collaborators] g ON a.person_id = g.collaborator_id
JOIN [groups] gr ON g.group_id = gr.id
JOIN [roles] r ON gr.[role_id].value('(role_id)[1]', 'bigint') = r.[id]
JOIN [collaborators] c2 ON a.person_id = c2.id
WHERE a.max_end_date IS NOT NULL
  AND a.max_end_date < GETDATE()-" + CONFIG.DAYS_OVERDUE + "
  AND gr.[role_id].exist('(role_id)[1]') = 1
  AND r.[name] LIKE " + likeRoleName + " COLLATE Cyrillic_General_CI_AS
  AND (r.parent_role_id IS NULL OR r.parent_role_id <> " + CONFIG.PARENT_ROLE_ID_NOT_EQUAL + ")
  AND c2.org_id IN (" + CONFIG.ORG_IDS.join(', ') + ")
ORDER BY a.[max_end_date] DESC";

// Выполняем запрос, приводим к обычному массиву для быстрого прохода
rows = ArrayDirect(XQuery(sqlQuery));

// Если записей нет — выходим
if (!rows || ArrayCount(rows) == 0) {
  LogEvent(CONFIG.LOG_KEY, 'Нет активных обучений к завершению для архивных групп');
  EnableLog(CONFIG.LOG_KEY, false);
  return;
}

// Счётчик завершённых записей
finishedCount = 0;

// Проходим по найденным активным обучениям и завершаем каждое
for (row in rows) {
  if (!row || !row.id) continue;
  tools.active_learning_finish(row.id);
  finishedCount = finishedCount + 1;
}

// Финальный лог с количеством завершённых обучений
LogEvent(CONFIG.LOG_KEY, 'Завершено активных обучений: ' + finishedCount);
// Выключаем логирование
EnableLog(CONFIG.LOG_KEY, false);
