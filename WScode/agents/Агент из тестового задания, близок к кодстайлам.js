/**
 * Агент для назначения курса группе сотрудников
 * ---------------------------------------------------------------------------
 * Назначение:
 *  - Массовое назначение курса всем сотрудникам указанной группы.
 *  - Работа с большими объёмами данных без лишних обращений к БД.
 *
 * Логика работы:
 *  - Курс назначается только тем сотрудникам, у которых он не завершён (отсутствует в таблице learnings).
 *  - Проверка активных назначений (active_learnings) не требуется, так как
 *    функция tools.activate_course_to_person сама обрабатывает дубликаты.
 *
 * Логирование:
 *  - Лог: 'course_assignment'
 *  - Фиксируются только итоговые результаты и критические события.
 */

// Конфигурация агента
var CONFIG = {
    GROUP_ID: 7186760286810899670,   // ID группы сотрудников
    COURSE_TO_ASSIGN: 7028192885261758073 // ID курса для назначения
  };
  
  // Включаем отдельное логирование
  EnableLog('course_assignment', true);
  
  // Объявление переменных с типизацией
  /** @type {XmlTopElem} Документ группы сотрудников */
  var groupDoc;
  /** @type {number} ID курса для назначения */
  var courseToAssign;
  /** @type {number} Счётчик успешно назначенных курсов */
  var assignedCount;
  /** @type {number[]} Список ID сотрудников группы */
  var collaboratorIds;
  /** @type {string} Строка ID для использования в MatchSome */
  var collaboratorIdsStr;
  /** @type {Array} Данные сотрудников группы */
  var targetCollaborators;
  /** @type {Array} Завершённые курсы сотрудников */
  var completedCourses;
  /** @type {Array} Активные назначения курсов (для анализа результатов) */
  var activeAssignments;
  /** @type {XmlElem|undefined} Текущий элемент группы */
  var col;
  /** @type {XmlElem|undefined} Найденный сотрудник */
  var foundCollaborator;
  /** @type {XmlElem|undefined} Сотрудник для логирования */
  var personToLog;
  /** @type {XmlElem|undefined} Элемент обучения */
  var learning;
  /** @type {XmlElem|undefined} Проверка завершённого курса */
  var completedCourse;
  /** @type {XmlElem|undefined} Проверка активного назначения в цикле логирования */
  var wasAlreadyAssigned;
  /** @type {number} ID текущего сотрудника */
  var collaboratorId;
  /** @type {number} ID сотрудника для назначения */
  var personId;
  
  // Получаем документ группы
  groupDoc = tools.open_doc(CONFIG.GROUP_ID).TopElem;
  courseToAssign = CONFIG.COURSE_TO_ASSIGN;
  assignedCount = 0;
  collaboratorIds = [];
  
  // Сбор ID сотрудников группы
  for (col in groupDoc.collaborators) {
    collaboratorId = OptInt(col.collaborator_id);
    if (collaboratorId == undefined) continue;
    collaboratorIds.push(collaboratorId);
  }
  
  // Проверка наличия сотрудников в группе
  if (!ArrayCount(collaboratorIds)) {
    LogEvent('course_assignment', 'В группе нет сотрудников для назначения курса');
    EnableLog('course_assignment', false);
    return;
  }
  
  // Формирование строки ID для запросов
  collaboratorIdsStr = '(' + collaboratorIds.join(',') + ')';
  
  // Получаем данные сотрудников группы
  targetCollaborators = XQuery(
    'for $elem in collaborators ' +
    'where MatchSome($elem/id, ' + collaboratorIdsStr + ') ' +
    'return $elem'
  );
  
  // Проверяем завершённые курсы (ключевое условие для назначения)
  completedCourses = XQuery(
    'for $elem in learnings ' +
    'where MatchSome($elem/person_id, ' + collaboratorIdsStr + ') ' +
    'and $elem/course_id=' + CONFIG.COURSE_TO_ASSIGN + ' ' +
    'return $elem'
  );
  
  // Получаем текущие активные назначения (для анализа результатов)
  activeAssignments = XQuery(
    'for $elem in active_learnings ' +
    'where MatchSome($elem/person_id, ' + collaboratorIdsStr + ') ' +
    'and $elem/course_id=' + CONFIG.COURSE_TO_ASSIGN + ' ' +
    'return $elem'
  );
  
  // Назначаем курс только тем, у кого он не завершён
  for (collaboratorId in collaboratorIds) {
    foundCollaborator = ArrayOptFind(targetCollaborators, 'This.id == ' + collaboratorId);
    if (foundCollaborator == undefined) {
      LogEvent('course_assignment', 'Сотрудник с ID ' + collaboratorId + ' не найден');
      continue;
    }
  
    personId = OptInt(foundCollaborator.id);
    if (personId == undefined) continue;
  
    // Проверяем, завершил ли сотрудник курс ранее
    completedCourse = ArrayOptFind(completedCourses, 'This.person_id == ' + personId);
    
    // Если курс не завершён, назначаем
    if (completedCourse == undefined) {
      tools.activate_course_to_person(personId, courseToAssign);
      assignedCount++;
    }
  }
  
  // Анализируем результаты назначения
  var newActiveLearnings = XQuery(
    'for $elem in active_learnings ' +
    'where MatchSome($elem/person_id, ' + collaboratorIdsStr + ') ' +
    'and $elem/course_id=' + CONFIG.COURSE_TO_ASSIGN + ' ' +
    'return $elem'
  );
  var newAssignmentsCount = ArrayCount(newActiveLearnings) - ArrayCount(activeAssignments);
  
  // Логируем новые назначения
  for (learning in newActiveLearnings) {
    wasAlreadyAssigned = ArrayOptFind(activeAssignments, 'This.person_id == ' + learning.person_id);
    if (wasAlreadyAssigned == undefined) {
      personToLog = ArrayOptFind(targetCollaborators, 'This.id == ' + learning.person_id);
      if (personToLog != undefined) {
        LogEvent('course_assignment', 'Курс назначен: ' + personToLog.fullname);
      }
    }
  }
  
  // Формируем итоговый отчёт
  LogEvent(
    'course_assignment',
    'Назначено: ' + newAssignmentsCount + ' из ' + ArrayCount(collaboratorIds) + ' сотрудников'
  );
  
  // Отключаем логирование
  EnableLog('course_assignment', false);