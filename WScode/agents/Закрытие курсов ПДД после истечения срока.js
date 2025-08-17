/**
 * Агент для закрытия курсов ПДД после истечения срока
 * ---------------------------------------------------------------------------
 * Назначение:
 *  - Автоматическое завершение обучения по курсам ПДД, у которых истек срок.
 *  - Работа с сотрудниками определенной позиции (ПДД).
 *
 * Логика работы:
 *  - Находит все активные обучения по курсам ПДД с истекшим сроком.
 *  - Завершает обучение для каждого найденного курса.
 *  - Логирует только итоговые результаты.
 *
 * Логирование:
 *  - Лог: 'pdd_course_closure'
 *  - Фиксируются только итоговые результаты и критические события.
 */

// Конфигурация агента
var CONFIG = {
  // ID позиции ПДД (можно вынести в параметры агента)
  POSITION_PARENT_ID: 7130016065580089286,
  
  // Настройки процесса
  MAX_ITERATIONS: 1000, // Ограничение итераций цикла
  
  // Префикс для логов
  LOG_PREFIX: '[Закрытие курсов ПДД]',
  
  // Настройки SQL (если разрешено использование)
  USE_SQL: true // Флаг для возможности отключения SQL
};

// Включаем отдельное логирование
EnableLog('pdd_course_closure', true);

// Объявление переменных с типизацией
/** @type {string} SQL-запрос для получения данных */
var mcrQuery;
/** @type {Array} Результат выполнения SQL-запроса */
var mcrArray;
/** @type {number} Счётчик успешно завершённых курсов */
var closedCount;
/** @type {number} Счётчик ошибок при завершении */
var errorCount;
/** @type {XmlElem|undefined} Текущий курс в цикле */
var course;
/** @type {number} ID текущего курса */
var courseId;

// Функция завершения курса
function finishCourse(courseId) {
  if (!courseId) {
    return false;
  }
  
  tools.active_learning_finish(courseId);
  return true;
}

// Основной код агента
// Проверяем возможность использования SQL
if (!CONFIG.USE_SQL) {
  LogEvent('pdd_course_closure', CONFIG.LOG_PREFIX + ' ОШИБКА: Использование SQL не разрешено в данном проекте');
  EnableLog('pdd_course_closure', false);
  return;
}

// Формируем SQL-запрос для получения данных
mcrQuery = "sql: select " +
  "al.id as id, " +
  "al.person_fullname as person_fullname, " +
  "al.time as time, " +
  "CONVERT(VARCHAR(15), CAST(GETDATE() AS DATETIME2), 104) today, " +
  "concat(CONVERT(VARCHAR(15), CAST(REPLACE(al.start_learning_date, 12, 10) AS DATETIME2), 104), '') start_date, " +
  "concat(CONVERT(VARCHAR(15), CAST(REPLACE(al.max_end_date, 12, 10) AS DATETIME2), 104), '') end_date " +
  "from " +
  "collaborators c " +
  "left join " +
  "active_learnings al on al.person_id = c.id " +
  "where " +
  "c.position_parent_id = " + CONFIG.POSITION_PARENT_ID + " " +
  "AND al.max_end_date < GETDATE()";

// Выполняем запрос и сохраняем результат в массив
mcrArray = XQuery(mcrQuery);

// Проверяем результат запроса
if (!mcrArray || ArrayCount(mcrArray) === 0) {
  LogEvent('pdd_course_closure', CONFIG.LOG_PREFIX + ' Курсы с истекшим сроком не найдены');
  EnableLog('pdd_course_closure', false);
  return;
}

// Инициализируем счётчики
closedCount = 0;
errorCount = 0;

// Проходим по каждому результату и завершаем обучение
for (var i = 0; i < ArrayCount(mcrArray) && i < CONFIG.MAX_ITERATIONS; i++) {
  course = mcrArray[i];
  
  // Проверяем наличие необходимых данных
  if (!course || !course.id) {
    continue;
  }
  
  courseId = OptInt(course.id);
  if (courseId == undefined) {
    continue;
  }
  
  // Завершаем курс
  if (finishCourse(courseId)) {
    closedCount++;
  } else {
    errorCount++;
  }
}

// Проверяем, не превышено ли ограничение итераций
if (ArrayCount(mcrArray) >= CONFIG.MAX_ITERATIONS) {
  LogEvent('pdd_course_closure', CONFIG.LOG_PREFIX + ' ВНИМАНИЕ: Превышено максимальное количество итераций (' + CONFIG.MAX_ITERATIONS + ')');
}

// Формируем итоговый отчёт
LogEvent('pdd_course_closure', CONFIG.LOG_PREFIX + ' Агент завершён. Завершено курсов: ' + closedCount + ', ошибок: ' + errorCount);

// Отключаем логирование
EnableLog('pdd_course_closure', false);
