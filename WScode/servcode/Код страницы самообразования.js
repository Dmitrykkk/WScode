<%
    var jsonRequest = tools.read_object(Request.Body, 'json');
    var compArray = [];
    
    // Функция для получения списка категорий верхнего уровня (родительская категория)
    function requestCompetitions()
    {
        // Получаем все роли с catalog_name = 'course' и заданным parent_role_id
        compArray = XQuery("sql: SELECT id, name FROM roles WHERE catalog_name = 'course' AND parent_role_id = '7240046282904955541' order by name");
    }

    switch (jsonRequest.action) {
        case 'getDirections':
            // Получаем категории первого уровня (направления) по фиксированному родительскому ID
            requestCompetitions();
            Response.Write(tools.array_to_text(compArray, 'json'));
            break;
        
        case 'getCompetitions':
            // Для каждой категории первого уровня получаем дочерние категории (конкурсы/поднаправления)
            arrDirectionList = [];
            requestCompetitions();
            for(compArrayItem in compArray) {
                arrDirection = XQuery("sql: SELECT id, name FROM roles WHERE catalog_name = 'course' AND parent_role_id = "+SqlLiteral(compArrayItem.id));
                
                if (ArrayCount(arrDirection) > 0) {
                    arrDirectionList = ArrayUnion(arrDirectionList, arrDirection);
                }
            } 
            // Сортируем итоговый список дочерних категорий по имени
            arrDirectionList=ArraySort(arrDirectionList, 'name', '+');
            Response.Write(tools.object_to_text(arrDirectionList, 'json'));
            break;
        
        case 'getCourses':
            // Получаем курсы, принадлежащие к заданной категории и всем её подкатегориям рекурсивно
            arrCourses = XQuery("sql:WITH RecursiveRoles AS (
                SELECT id, parent_role_id, name
                FROM roles
                WHERE id = "+SqlLiteral(jsonRequest.id)+"

                UNION ALL

                SELECT r.id, r.parent_role_id, r.name
                FROM roles r
                INNER JOIN RecursiveRoles rr ON r.parent_role_id = rr.id
            )

            SELECT 
                c.id, 
                c.name, 
                c.resource_id,                     -- Идентификатор ресурса курса
                rr.name AS competition_name,       -- Название категории или подкатегории, к которой относится курс
                r2.name AS direction_name          -- Название родительской категории (направления)
            FROM 
                courses c
            LEFT JOIN RecursiveRoles rr ON CAST(c.role_id AS NVARCHAR(MAX)) LIKE '%' + CAST(rr.id AS NVARCHAR(MAX)) + '%'
            LEFT JOIN roles r2 ON rr.parent_role_id = r2.id
            WHERE 
                rr.id IS NOT NULL;
            ");
            Response.Write(tools.object_to_text(arrCourses, 'json'));
            break;
    }
%>
