<%
var jsonRequest = tools.read_object(Request.Body, 'json');

switch (jsonRequest.action) {

    case 'getColl':
        coll_res = ArrayDirect(XQuery("sql:
            SELECT [id]
                  ,[fullname]
                  ,[email]
                  ,[phone]
                  ,CASE 
                      WHEN [birth_date] IS NULL THEN 'Дата рождения не указана'
                      ELSE CONVERT(varchar, [birth_date], 104)
                  END AS [birth_date]
                  ,CASE 
                      WHEN [sex] = 'm' THEN 'мужской'
                      WHEN [sex] = 'w' THEN 'женский'
                      ELSE 'Пол не указан'
                  END AS [sex]
                  ,[org_name]
            FROM [collaborators]
            WHERE [email] = " + SqlLiteral(jsonRequest.email) + "
        "));
        Response.Write(tools.object_to_text(coll_res, 'json'));
        break;

    case 'collBack':
        Response.Write("Отправьте нужный акшен");
        break;

    case 'collRef':
        try {
            var changeUser = OpenDoc(UrlFromDocID(jsonRequest.coll_id));

            if (jsonRequest.data.HasProperty('sex')) {
                changeUser.TopElem.sex = jsonRequest.data.sex;
            }

            if (jsonRequest.data.HasProperty('birth_date')) {
                changeUser.TopElem.birth_date = jsonRequest.data.birth_date;
            }

            changeUser.Save();

            coll_res = ArrayDirect(XQuery("sql:
                SELECT [id]
                      ,[fullname]
                      ,[email]
                      ,[phone]
                      ,CASE 
                          WHEN [birth_date] IS NULL THEN 'Дата рождения не указана'
                          ELSE CONVERT(varchar, [birth_date], 104)
                      END AS [birth_date]
                      ,CASE 
                          WHEN [sex] = 'm' THEN 'мужской'
                          WHEN [sex] = 'w' THEN 'женский'
                          ELSE 'Пол не указан'
                      END AS [sex]
                      ,[org_name]
                FROM [collaborators]
                WHERE [id] = " + SqlLiteral(jsonRequest.coll_id) + "
            "));
            Response.Write(tools.object_to_text(coll_res, 'json'));
        }
        catch (error) {
            Response.Write('Ошибка сохранения: ' + error.message);
        }

        break;

    case 'collCreate':
        coll_new=tools.new_doc_by_name( 'collaborator', false ) 
        coll_top=coll_new.TopElem
        coll_top.login=jsonRequest.email
        coll_top.email=jsonRequest.email
        coll_top.fullname=jsonRequest.fullname
        coll_top.sex = jsonRequest.data.sex;
        coll_top.birth_date = jsonRequest.data.birth_date;
        coll_new.BindToDb(DefaultDb)
        coll_new.Save()
        coll_new.DocID
        coll_pos=tools.new_doc_by_name( 'position', false ) 
        coll_pos_top=coll_pos.TopElem
        
        coll_pos.BindToDb(DefaultDb)
        coll_pos.Save()

        break;

    default:
        Response.Write("Отправьте нужный акшен");
        break;
}
%>
