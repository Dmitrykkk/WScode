<%
    var jsonRequest = tools.read_object(Request.Body, 'json');
    var compArray = [];
    switch (jsonRequest.action) {
        case 'getActive':
            resultArr = XQuery("sql:SELECT 
    course_name,
    course_id,
    CASE 
        WHEN state_id = 0 THEN 'Назначен' 
        WHEN state_id = 1 THEN 'В процессе' 
        WHEN state_id = 2 THEN 'Завершён' 
        WHEN state_id = 3 THEN 'Не пройден' 
        WHEN state_id = 4 THEN 'Пройден' 
        WHEN state_id = 5 THEN 'Просмотрен' 
        ELSE 'Неизвестен' 
    END AS status,
    CASE 
    WHEN start_learning_date IS NOT NULL THEN CONVERT(VARCHAR, start_learning_date, 23)
    WHEN start_usage_date IS NOT NULL THEN CONVERT(VARCHAR, start_usage_date, 23)
    ELSE 'null'
END AS start_usage_date,  
    CASE 
        WHEN max_end_date IS NULL THEN 'null'
        ELSE CONVERT(VARCHAR, max_end_date, 23)
    END AS max_end_date,
    CASE 
        WHEN is_self_enrolled IS NULL THEN '0'  -- Если NULL, выводим '0'
        ELSE CAST(is_self_enrolled AS VARCHAR)  -- Конвертируем в строку без изменений
    END AS is_self_enrolled,
    CASE 
        WHEN max_end_date IS NULL THEN 'null'
        ELSE CAST(DATEDIFF(DAY, GETDATE(), max_end_date) AS VARCHAR)
    END AS days_diff
FROM 
    active_learnings
WHERE 
    person_id = "+SqlLiteral(curUserID)+"")

resultArr=ArraySort( resultArr, 'max_end_date', '+')
Response.Write(tools.object_to_text(resultArr, 'json'));
            break;
        
case "getRecommendations":
    // Первый запрос: курсы по ролям пользователя, исключая роль 7121268408702515738
    resultArr = ArrayDirect(XQuery("sql:WITH RecursiveRoles AS (
        -- Получаем корневые категории (роли), к которым принадлежат курсы пользователя
        SELECT 
            r.id, 
            r.parent_role_id, 
            r.name
        FROM 
            roles r
        JOIN 
            courses c ON CAST(c.role_id AS NVARCHAR(MAX)) LIKE '%' + CAST(r.id AS NVARCHAR(MAX)) + '%'
        JOIN 
            learnings l ON l.course_id = c.id
        WHERE 
            l.person_id = " + SqlLiteral(curUserID) + "

        UNION ALL

        -- Рекурсивно добавляем подкатегории
        SELECT 
            r.id, 
            r.parent_role_id, 
            r.name
        FROM 
            roles r
        INNER JOIN 
            RecursiveRoles rr ON r.parent_role_id = rr.id
    )

    -- Основной запрос: выбираем курсы из категорий пользователя
    SELECT DISTINCT
        c.id AS course_id,              -- ID курса
        c.name AS course_name,          -- Название курса
        c.resource_id,                  -- ID ресурса
        rr.name AS competition_name,    -- Название подкатегории (текущий уровень)
        r2.name AS direction_name       -- Название родительской категории
    FROM 
        courses c
    LEFT JOIN 
        RecursiveRoles rr ON CAST(c.role_id AS NVARCHAR(MAX)) LIKE '%' + CAST(rr.id AS NVARCHAR(MAX)) + '%'
    LEFT JOIN 
        roles r2 ON rr.parent_role_id = r2.id
    WHERE 
        rr.id IS NOT NULL               -- Оставляем только курсы по найденным категориям
        AND rr.id != '7121268408702515738'  -- Исключаем нежелательную роль
        AND c.yourself_start = 1        -- Только активные курсы
        AND NOT EXISTS (                -- Исключаем уже завершённые курсы
            SELECT 1 
            FROM learnings l 
            WHERE l.course_id = c.id 
              AND l.person_id = " + SqlLiteral(curUserID) + "
        )
    ORDER BY 
        direction_name;                           -- Сортировка по родительской категории"
    ));

    // Определяем, является ли пользователь боссом
    boss = ArrayFirstElem(XQuery("sql:
        SELECT
            CASE 
                WHEN is_boss = 1 THEN 'is boss'
                ELSE 'not boss'
            END AS boss_status
        FROM positions
        WHERE basic_collaborator_id = " + SqlLiteral(curUserID)));

    if (boss.boss_status == "is boss") { 
        cat_course_id = "7415127911626185376";
    } else {
        cat_course_id = "7415127997716134951";
    }

    // Второй запрос: курсы для босса или обычного сотрудника
    var bossCourses = ArrayDirect(XQuery("sql:WITH RecursiveRoles AS (
        -- Начинаем с заданной категории
        SELECT id, parent_role_id, name
        FROM roles
        WHERE id = " + SqlLiteral(cat_course_id) + "

        UNION ALL

        -- Рекурсивно добавляем все подкатегории
        SELECT 
            r.id, 
            r.parent_role_id, 
            r.name
        FROM 
            roles r
        INNER JOIN 
            RecursiveRoles rr ON r.parent_role_id = rr.id
    )

    SELECT 
        c.id AS course_id, 
        c.name AS course_name, 
        c.resource_id,
        rr.name AS competition_name,
        r2.name AS direction_name
    FROM 
        courses c
    LEFT JOIN 
        RecursiveRoles rr ON CAST(c.role_id AS NVARCHAR(MAX)) LIKE '%' + CAST(rr.id AS NVARCHAR(MAX)) + '%'
    LEFT JOIN 
        roles r2 ON rr.parent_role_id = r2.id
    WHERE 
        rr.id IS NOT NULL AND NOT EXISTS (                -- Исключаем уже завершённые курсы
            SELECT 1 
            FROM learnings l 
            WHERE l.course_id = c.id 
              AND l.person_id = " + SqlLiteral(curUserID) + "
        );"
    ));

   // --- Объявляем переменные заранее ---
var selectedItems = [];
var i = 0;
var j = 0;
var randIndex = 0;
var course = null;
var isUnique = false;

var usedIndexes = [];
var bossUsedIndexes = [];

var countResult = ArrayCount(resultArr);
var countBoss = ArrayCount(bossCourses);

// --- Шаг 1: Если в resultArr больше 3 курсов — делаем случайную выборку из 3 ---

if (countResult > 3) {
    while (ArrayCount(selectedItems) < 3) {
        randIndex = Random(0, countResult - 1);
        isUnique = true;

        for (i = 0; i < ArrayCount(usedIndexes); i++) {
            if (usedIndexes[i] == randIndex) {
                isUnique = false;
                break;
            }
        }

        if (isUnique) {
            course = resultArr[randIndex];
            selectedItems[ArrayCount(selectedItems)] = course;
            usedIndexes[ArrayCount(usedIndexes)] = randIndex;
        }
    }
} else {
    // Если меньше 3 — копируем всё из resultArr
    for (i = 0; i < countResult; i++) {
        selectedItems[ArrayCount(selectedItems)] = resultArr[i];
    }
}

// --- Шаг 2: Добираем до 6 курсов из bossCourses ---
var remaining = 6 - ArrayCount(selectedItems);

if (remaining > 0 && countBoss > 0) {
    var bossCountNeeded = remaining;
    if (bossCountNeeded > countBoss) {
        bossCountNeeded = countBoss;
    }

    while (ArrayCount(selectedItems) < 6) {
        randIndex = Random(0, countBoss - 1);
        isUnique = true;

        for (i = 0; i < ArrayCount(bossUsedIndexes); i++) {
            if (bossUsedIndexes[i] == randIndex) {
                isUnique = false;
                break;
            }
        }

        if (isUnique) {
            course = bossCourses[randIndex];
            selectedItems[ArrayCount(selectedItems)] = course;
            bossUsedIndexes[ArrayCount(bossUsedIndexes)] = randIndex;
        }
    }
}

// --- Шаг 3: Перемешиваем выбранные курсы для хаотичного порядка ---
var finalArr = selectedItems;
var n = ArrayCount(finalArr);
var k = 0;
var temp = null;

while (n > 1) {
    n--;
    k = Random(0, n); // получаем случайный индекс

    temp = finalArr[k];
    finalArr[k] = finalArr[n];
    finalArr[n] = temp;
}

// --- Отправляем результат ---
Response.Write(tools.object_to_text(finalArr, "json"));
break;

        case 'getNewCourses':
// Передайте ID категории "Новые курсы"(id) ( '7438867960116628461') ТУТ МЕНЯТЬ АЙДИ НА АЙДИ категории  "Новые курсы" из самообразования
            arrCourses=XQuery("sql:WITH RecursiveRoles AS (
    -- Начинаем с корневой категории, заменяя ID динамически
    SELECT id, parent_role_id, name
    FROM roles
    WHERE id = '7121268408702515738'

    UNION ALL

    -- Рекурсивно добавляем все подкатегории
    SELECT r.id, r.parent_role_id, r.name
    FROM roles r
    INNER JOIN RecursiveRoles rr ON r.parent_role_id = rr.id
)

SELECT 
    c.id, 
    c.name, 
    c.resource_id,                     -- Данные по курсам
    rr.name AS competition_name,        -- Название подкатегории (текущий уровень)
    r2.name AS direction_name           -- Название родительской категории
FROM 
    courses c
LEFT JOIN RecursiveRoles rr ON CAST(c.role_id AS NVARCHAR(MAX)) LIKE '%' + CAST(rr.id AS NVARCHAR(MAX)) + '%'
LEFT JOIN roles r2 ON rr.parent_role_id = r2.id  -- Подтягиваем название родительской категории
WHERE 
    rr.id IS NOT NULL;  -- Проверка, чтобы выбрать курсы только из искомых категорий

");
            Response.Write(tools.object_to_text(arrCourses, 'json'));

            break;
    }
%>