<%
/* ====== DEV ====== */
var DEV_MODE = customWebTemplate.access.enable_anonymous_access;

if (DEV_MODE) {
  Request.AddRespHeader("Access-Control-Allow-Origin", "*", false);
  Request.AddRespHeader("Access-Control-Expose-Headers", "Error-Message");
  Request.AddRespHeader("Access-Control-Allow-Headers", "origin, content-type, accept");
  Request.AddRespHeader("Access-Control-Allow-Credentials", "true");
}

/* ====== COMMON HEADERS ====== */
Request.RespContentType = "application/json";
Request.AddRespHeader("Content-Security-Policy", "frame-ancestors 'self'");
Request.AddRespHeader("X-XSS-Protection", "1");
Request.AddRespHeader("X-Frame-Options", "SAMEORIGIN");

/* ====== CURRENT USER ====== */
var curUserId = DEV_MODE
  ? OptInt("7423375591651963208")
  : OptInt(Request.Session.Env.curUserID);

var curUser = DEV_MODE
  ? tools.open_doc(curUserId).TopElem
  : Request.Session.Env.curUser;

var jsonRequest = tools.read_object(Request.Body, 'json');
info=ArrayDirect(XQuery("sql:WITH
polls_static AS (
    SELECT * FROM (VALUES
        (3,  '7408074938175353792', N'Тест 3'),
        (4,  '7407807195698568194', N'Тест 4'),
        (5,  '7181427040203034175', N'Тест 5'),
        (6,  '7181428800607700770', N'Тест 6'),
        (7,  '7405915494714512291', N'Тест 7'),
        (8,  '7408170339217005728', N'Тест 8'),
        (9,  '7182045453011040724', N'Тест 9'),
        (10, '7183173063057810530', N'Тест 10'),
        (11, '7183521310449808960', N'Тест 11'),
        (12, '7183523101755727527', N'Тест 12')
    ) AS t(test_num, poll_id, poll_label)
),


group_members AS (
    SELECT c.id AS person_id, c.fullname, c.org_name, c.sex, c.birth_date
    FROM dbo.group_collaborators gc
    JOIN dbo.collaborators c ON gc.collaborator_id = c.id
    WHERE gc.group_id = 7185681485015249795
),


test_nums AS (
    SELECT 2 AS num UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
),


base_polls AS (
    SELECT
        gm.person_id,
        ISNULL(gm.fullname, '') AS person_fullname,
        ISNULL(gm.org_name, '') AS person_org_name,
        gm.sex,
        gm.birth_date,
        t.num AS test_num,
        CASE
            WHEN t.num = 2 THEN CASE WHEN gm.sex = 'm' THEN '7407789404203480436' ELSE '7407767153813862210' END
            ELSE ps.poll_id
        END AS poll_id,
        CASE
            WHEN t.num = 2 THEN CASE WHEN gm.sex = 'm' THEN N'Тест 2 (для мужчин)' ELSE N'Тест 2 (для женщин)' END
            ELSE ps.poll_label
        END AS poll_name
    FROM group_members gm
    CROSS JOIN test_nums t
    LEFT JOIN polls_static ps ON ps.test_num = t.num
),

poll_results_data AS (
    SELECT
        ISNULL(r.name, '') AS name,
        CAST(r.poll_id AS varchar(50)) AS poll_id,
        CAST(r.person_id AS varchar(50)) AS person_id,
        ISNULL(c.fullname, '') AS person_fullname,
        ISNULL(c.org_name, '') AS person_org_name,
        CASE WHEN r.is_done = 1 THEN N'пройден' WHEN r.is_done = 0 THEN N'в процессе' ELSE N'неизвестно' END AS status,
        CONVERT(varchar, r.create_date, 104) + ' ' + CONVERT(varchar, r.create_date, 108) AS create_date,
        CASE WHEN c.sex = 'm' THEN N'мужской' WHEN c.sex = 'w' THEN N'женский' ELSE N'не установлен' END AS sex,
        CASE WHEN c.birth_date IS NULL THEN N'дата не установлена' ELSE CONVERT(varchar, c.birth_date, 104) END AS birth_date,
        CASE WHEN c.birth_date IS NULL THEN N'отсутствует' ELSE CAST(
            DATEDIFF(YEAR, c.birth_date, GETDATE()) -
            CASE WHEN MONTH(c.birth_date) > MONTH(GETDATE())
               OR (MONTH(c.birth_date) = MONTH(GETDATE()) AND DAY(c.birth_date) > DAY(GETDATE()))
            THEN 1 ELSE 0 END AS varchar)
        END AS years
    FROM dbo.poll_results r
    LEFT JOIN dbo.collaborators c ON r.person_id = c.id
    WHERE ISNULL(r.person_fullname, '') <> ''  
),


combined_learnings AS (
    SELECT
        CASE WHEN l.course_name = N'Хабаровск оценка' THEN N'Тест 1' ELSE ISNULL(l.course_name, '') END AS name,
        CAST(l.id AS varchar(50)) AS poll_id,
        CAST(l.person_id AS varchar(50)) AS person_id,
        ISNULL(l.person_fullname, c.fullname) AS person_fullname,
        ISNULL(l.person_org_name, c.org_name) AS person_org_name,
        N'пройден' AS status,
        CONVERT(varchar, l.creation_date, 104) + ' ' + CONVERT(varchar, l.creation_date, 108) AS create_date,
        CASE WHEN c.sex = 'm' THEN N'мужской' WHEN c.sex = 'w' THEN N'женский' ELSE N'не установлен' END AS sex,
        CASE WHEN c.birth_date IS NULL THEN N'дата не установлена' ELSE CONVERT(varchar, c.birth_date, 104) END AS birth_date,
        CASE WHEN c.birth_date IS NULL THEN N'отсутствует' ELSE CAST(
            DATEDIFF(YEAR, c.birth_date, GETDATE()) -
            CASE WHEN MONTH(c.birth_date) > MONTH(GETDATE())
               OR (MONTH(c.birth_date) = MONTH(GETDATE()) AND DAY(c.birth_date) > DAY(GETDATE()))
            THEN 1 ELSE 0 END AS varchar)
        END AS years
    FROM dbo.learnings l
    LEFT JOIN dbo.collaborators c ON l.person_id = c.id
    WHERE l.course_id = 7180996561271644478
      AND EXISTS (
          SELECT 1 FROM dbo.group_collaborators gc WHERE gc.collaborator_id = l.person_id AND gc.group_id = 7185681485015249795
      )

    UNION ALL

    SELECT
        CASE WHEN a.course_name = N'Хабаровск оценка' THEN N'Тест 1' ELSE ISNULL(a.course_name, '') END AS name,
        CAST(a.id AS varchar(50)) AS poll_id,
        CAST(a.person_id AS varchar(50)) AS person_id,
        ISNULL(a.person_fullname, c.fullname) AS person_fullname,
        ISNULL(a.person_org_name, c.org_name) AS person_org_name,
        N'назначен' AS status,
        CONVERT(varchar, a.creation_date, 104) + ' ' + CONVERT(varchar, a.creation_date, 108) AS create_date,
        CASE WHEN c.sex = 'm' THEN N'мужской' WHEN c.sex = 'w' THEN N'женский' ELSE N'не установлен' END AS sex,
        CASE WHEN c.birth_date IS NULL THEN N'дата не установлена' ELSE CONVERT(varchar, c.birth_date, 104) END AS birth_date,
        CASE WHEN c.birth_date IS NULL THEN N'отсутствует' ELSE CAST(
            DATEDIFF(YEAR, c.birth_date, GETDATE()) -
            CASE WHEN MONTH(c.birth_date) > MONTH(GETDATE())
               OR (MONTH(c.birth_date) = MONTH(GETDATE()) AND DAY(c.birth_date) > DAY(GETDATE()))
            THEN 1 ELSE 0 END AS varchar)
        END AS years
    FROM dbo.active_learnings a
    LEFT JOIN dbo.collaborators c ON a.person_id = c.id
    WHERE a.course_id = 7180996561271644478
      AND EXISTS (
          SELECT 1 FROM dbo.group_collaborators gc WHERE gc.collaborator_id = a.person_id AND gc.group_id = 7185681485015249795
      )
)

SELECT
    ROW_NUMBER() OVER (
    ORDER BY 
        CAST(person_id AS varchar(50)),
        CASE name
            WHEN N'Тест 1' THEN 1
            WHEN N'Тест 2 (для мужчин)' THEN 2
            WHEN N'Тест 2 (для женщин)' THEN 2
            WHEN N'Тест 3' THEN 3
            WHEN N'Тест 4' THEN 4
            WHEN N'Тест 5' THEN 5
            WHEN N'Тест 6' THEN 6
            WHEN N'Тест 7' THEN 7
            WHEN N'Тест 8' THEN 8
            WHEN N'Тест 9' THEN 9
            WHEN N'Тест 10' THEN 10
            WHEN N'Тест 11' THEN 11
            WHEN N'Тест 12' THEN 12
            ELSE 999
        END
) AS row_id,
    name,
    poll_id,
    person_id,
    person_fullname,
    person_org_name,
    status,
    create_date,
    sex,
    birth_date,
    years
FROM (

    SELECT * FROM combined_learnings

    UNION ALL

    SELECT
        COALESCE(pr.name, bp.poll_name) AS name,
        CAST(bp.poll_id AS varchar(50)) AS poll_id,
        CAST(bp.person_id AS varchar(50)) AS person_id,
        ISNULL(bp.person_fullname, '') AS person_fullname,
        ISNULL(bp.person_org_name, '') AS person_org_name,
        CASE WHEN pr.person_id IS NOT NULL THEN pr.status ELSE N'назначен' END AS status,
        CASE WHEN pr.person_id IS NOT NULL THEN pr.create_date ELSE '01.01.2001 00:00:00' END AS create_date,
        CASE WHEN bp.sex = 'm' THEN N'мужской' WHEN bp.sex = 'w' THEN N'женский' ELSE N'не установлен' END AS sex,
        CASE WHEN bp.birth_date IS NULL THEN N'дата не установлена' ELSE CONVERT(varchar, bp.birth_date, 104) END AS birth_date,
        CASE WHEN bp.birth_date IS NULL THEN N'отсутствует' ELSE CAST(
            DATEDIFF(YEAR, bp.birth_date, GETDATE()) -
            CASE WHEN MONTH(bp.birth_date) > MONTH(GETDATE())
               OR (MONTH(bp.birth_date) = MONTH(GETDATE()) AND DAY(bp.birth_date) > DAY(GETDATE()))
            THEN 1 ELSE 0 END AS varchar)
        END AS years
    FROM base_polls bp
    LEFT JOIN poll_results_data pr
        ON pr.poll_id = bp.poll_id
       AND pr.person_id = CAST(bp.person_id AS varchar(50))
) AS all_data
ORDER BY 
    CAST(person_id AS varchar(50)),
    CASE name
        WHEN N'Тест 1' THEN 1
        WHEN N'Тест 2 (для мужчин)' THEN 2
        WHEN N'Тест 2 (для женщин)' THEN 2
        WHEN N'Тест 3' THEN 3
        WHEN N'Тест 4' THEN 4
        WHEN N'Тест 5' THEN 5
        WHEN N'Тест 6' THEN 6
        WHEN N'Тест 7' THEN 7
        WHEN N'Тест 8' THEN 8
        WHEN N'Тест 9' THEN 9
        WHEN N'Тест 10' THEN 10
        WHEN N'Тест 11' THEN 11
        WHEN N'Тест 12' THEN 12
        ELSE 999
    END;
"))
Response.Write(tools.object_to_text(info, 'json'));
%>