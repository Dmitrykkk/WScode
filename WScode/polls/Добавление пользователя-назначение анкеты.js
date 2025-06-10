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
        tools.create_notification('44444', jsonRequest.coll_id
        , '');
        Response.Write("Отправлено уведомление");
        break;

    case 'collRef':
        try {
            var changeUser = OpenDoc(UrlFromDocID(jsonRequest.coll_id));
            changeUser.TopElem.sex = jsonRequest.sex;         
            changeUser.TopElem.birth_date = jsonRequest.birth_date;
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
        coll_top.sex = jsonRequest.sex;
        coll_top.birth_date = jsonRequest.birth_date;
        p_id=coll_new.DocID
        coll_new.BindToDb(DefaultDb)
        coll_new.Save()
        coll_pos=tools.new_doc_by_name( 'position', false ) 
        coll_pos_top=coll_pos.TopElem
        coll_pos_top.name='Тестируемый'
        coll_pos_top.org_id=7273825491646161985   
        coll_pos_top.basic_collaborator_id=p_id
        coll_pos.BindToDb(DefaultDb)
        coll_pos.Save()
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

    default:
        Response.Write("Отправьте нужный акшен");
        break;
}
%>
