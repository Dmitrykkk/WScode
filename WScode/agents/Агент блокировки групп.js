/**
 * Агент блокировки сотрудников по дате блокировки в карточке группы
 * ---------------------------------------------------------------------------
 * Назначение:
 *  - Найти группы, у которых дата блокировки ('vrem_date') меньше текущей даты.
 *  - Заблокировать всех участников этих групп: установить флаг web_banned = true.
 *
 * Кодстайл:
 *  - Используется CONFIG, явные переменные, единое логирование, XQuery вне циклов.
 */

// Конфигурация
var CONFIG = {
    LOG_KEY: 'group_person_block'    // Имя лога агента
};

// Логирование
EnableLog(CONFIG.LOG_KEY, true);
LogEvent(CONFIG.LOG_KEY, 'Старт блокировки сотрудников по дате блокировки в карточке группы');

// Переменные
/** @type {Array} */
var rows;
/** @type {Array} */
var row;
/** @type {number} */
var personId;
/** @type {Doc} */
var personDoc;
var updatedCount;

// 1) Получаем ID сотрудников одним SQL-запросом
rows = XQuery("sql:
    SELECT gc.collaborator_id
    FROM [group] g
    JOIN [group_collaborators] gc ON g.id = gc.group_id
    JOIN collaborators c ON c.id = gc.collaborator_id
    WHERE g.data.value('(//custom_elem[name=\"vrem_date\"]/value)[1]', 'datetimeoffset') < SYSDATETIMEOFFSET()
      AND c.web_banned = 0");

if (!ArrayCount(rows)) {
    LogEvent(CONFIG.LOG_KEY, 'Нет сотрудников для блокировки по дате блокировки в карточке группы');
    EnableLog(CONFIG.LOG_KEY, false);
    return;
}

updatedCount = 0;

// 2) Блокировка: устанавливаем web_banned = true
for (row in rows) {
    personId = OptInt(row.collaborator_id);
    if (personId == undefined) continue;

    personDoc = tools.open_doc(personId);
    if (personDoc.TopElem.access.web_banned != true) {
        personDoc.TopElem.access.web_banned = true;
        personDoc.Save();
        updatedCount = updatedCount + 1;
    }
}

LogEvent(
    CONFIG.LOG_KEY,
    'Завершено. Заблокировано сотрудников: ' + updatedCount
);

EnableLog(CONFIG.LOG_KEY, false);