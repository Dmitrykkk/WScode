<%
var jsonRequest = tools.read_object(Request.Body, 'json');

switch (jsonRequest.action) {
    case 'getLearnings':
        arrLearningsList = [];

        // Запрос получает объединённый список обучений пользователя из двух таблиц: active_learnings и learnings
        // Для каждого обучения собирается детальная информация о курсе, статусе, результатах тестов и сроках
        arrLearningsList = XQuery("sql:
        SELECT 
            ass.name AS name,                              -- Название курса
            w.id AS id,                                   -- ID обучения
            w.course_id AS course_id,                      -- ID курса
            ass.resource_id AS resource_id,                -- Идентификатор ресурса курса
            MAX(score) AS score,                           -- Максимальный балл по обучению
            ass.mastery_score AS mastery_score,            -- Балл мастерства курса
            ass.max_score AS max_score,                     -- Максимально возможный балл курса
            CASE MAX(state_id)                             -- Статус обучения с переводом в текст
                WHEN 0 THEN 'Назначен' 
                WHEN 1 THEN 'В процессе' 
                WHEN 2 THEN 'Завершён'
                WHEN 3 THEN 'Не пройден'
                WHEN 4 THEN 'Пройден'
                WHEN 5 THEN 'Просмотрен'
            END AS state_id,
            MAX(al.data.value('(active_learning/parts/part[name=\"Итоговый тест\"])[1]/score[1]', 'varchar(100)')) AS test_score,  -- Балл итогового теста (для active_learnings)
            CONCAT(CONVERT(VARCHAR(15), CAST(REPLACE(w.start_usage_date, 12, 12) AS DATETIME2), 23), '') AS start_usage_date,       -- Дата начала использования курса
            CONCAT(CONVERT(VARCHAR(15), CAST(REPLACE(w.start_learning_date, 12, 12) AS DATETIME2), 23), '') AS start_learning_date,   -- Дата начала обучения
            CONCAT(CONVERT(VARCHAR(15), CAST(REPLACE(w.max_end_date, 12, 12) AS DATETIME2), 23), '') AS max_end_date,               -- Дата максимального окончания обучения
            CASE 
                WHEN max_end_date IS NULL THEN 160119990400  -- Если дата окончания не указана, ставим фиксированное значение (очень большое)
                ELSE CAST(DATEDIFF(DAY, GETDATE(), max_end_date) AS INT) -- Кол-во дней до окончания обучения
            END AS days_diff,
            CASE 
                WHEN w.is_self_enrolled IS NULL THEN '0'  -- Если признак самостоятельной записи NULL, выводим '0'
                ELSE CAST(is_self_enrolled AS VARCHAR)   -- Иначе выводим как есть
            END AS is_self_enrolled  
        FROM 
            active_learnings w
        LEFT JOIN 
            group_collaborators gcs ON gcs.collaborator_id = w.person_id
        LEFT JOIN 
            courses ass ON ass.id = w.course_id 
        LEFT JOIN 
            course asss ON asss.id = ass.id
        LEFT JOIN 
            active_learning al ON al.id = w.id
        LEFT JOIN 
            collaborators col ON w.person_id = col.id
        WHERE
            col.id = " + SqlLiteral(curUserID) + "  -- Фильтрация по текущему пользователю
        GROUP BY 
            ass.name, ass.resource_id, w.id, w.course_id, w.start_usage_date, w.start_learning_date, w.max_end_date, ass.max_score, ass.mastery_score, w.is_self_enrolled
        
        UNION

        SELECT 
            ass.name AS name,                                -- Аналогичные поля для второй таблицы learnings
            q.id AS id,
            q.course_id AS course_id,
            ass.resource_id AS resource_id,
            MAX(score) AS score, 
            ass.mastery_score AS mastery_score,
            ass.max_score AS max_score,
            CASE MAX(state_id)
                WHEN 0 THEN 'Назначен' 
                WHEN 1 THEN 'В процессе' 
                WHEN 2 THEN 'Завершён'
                WHEN 3 THEN 'Не пройден'
                WHEN 4 THEN 'Пройден'
                WHEN 5 THEN 'Просмотрен'
            END AS state_id,
            MAX(al.data.value('(learning/parts/part[name=\"Итоговый тест\"])[1]/score[1]', 'varchar(100)')) AS test_score,   -- Балл итогового теста (для learnings)
            CONCAT(CONVERT(VARCHAR(15), CAST(REPLACE(q.start_usage_date, 12, 12) AS DATETIME2), 23), '') AS start_usage_date, 
            CONCAT(CONVERT(VARCHAR(15), CAST(REPLACE(q.start_learning_date, 12, 12) AS DATETIME2), 23), '') AS start_learning_date,
            CONCAT(CONVERT(VARCHAR(15), CAST(REPLACE(q.max_end_date, 12, 12) AS DATETIME2), 23), '') AS max_end_date,
            CASE 
                WHEN q.max_end_date IS NULL THEN 160119990400
                ELSE CAST(DATEDIFF(DAY, GETDATE(), q.max_end_date) AS INT)
            END AS days_diff,
            CASE 
                WHEN q.is_self_enrolled IS NULL THEN '0'  
                ELSE CAST(is_self_enrolled AS VARCHAR)  
            END AS is_self_enrolled   
        FROM 
            learnings q
        LEFT JOIN 
            group_collaborators gcs ON gcs.collaborator_id = q.person_id
        LEFT JOIN 
            courses ass ON ass.id = q.course_id 
        LEFT JOIN 
            course asss ON asss.id = ass.id
        LEFT JOIN 
            active_learning al ON al.id = q.id
        LEFT JOIN 
            collaborators col ON q.person_id = col.id
        WHERE
            col.id = " + SqlLiteral(curUserID) + "  -- Фильтрация по текущему пользователю
        GROUP BY 
            ass.name, ass.resource_id, q.id, q.course_id, q.start_learning_date, q.start_usage_date, q.max_end_date, ass.max_score, ass.mastery_score, q.is_self_enrolled
        
        ORDER BY 
            days_diff ASC  -- Сортируем по оставшимся дням до окончания обучения (сначала те, у кого меньше всего дней)
        ");
        
        Response.Write(tools.object_to_text(arrLearningsList, 'json'));
        break;

    default:
        Response.Write("{\"error\": \"Unknown action\"}");
        break;
}
%>
