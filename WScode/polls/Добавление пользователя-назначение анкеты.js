<%
var jsonRequest = tools.read_object(Request.Body, 'json');

switch (jsonRequest.action) {

  case 'getColl':
    coll_res = ArrayDirect(XQuery("sql:
      SELECT [id], [fullname], [email], [phone],
             CASE 
                 WHEN [birth_date] IS NULL THEN 'Дата рождения не указана'
                 ELSE CONVERT(varchar, [birth_date], 104)
             END AS [birth_date],
             CASE 
                 WHEN [sex] = 'm' THEN 'мужской'
                 WHEN [sex] = 'w' THEN 'женский'
                 ELSE 'Пол не указан'
             END AS [sex],
             [org_name]
      FROM [collaborators]
      WHERE [email] = " + SqlLiteral(jsonRequest.email) + "
    "));

    if (coll_res.length == 0) {
      Response.Write("Сотрудник с таким email не найден");
    } else {
      Response.Write(tools.object_to_text(coll_res, 'json'));
    }
    break;

  case 'collBack':
    userDoc = tools.open_doc(jsonRequest.coll_id);
    userLogin = userDoc.TopElem.login;
    userPassword = userDoc.TopElem.password;

    newNotificationDoc = OpenNewDoc('x-local://wtv/wtv_active_notification.xmd');
    newNotificationDoc.BindToDb(DefaultDb);

    newNotificationDoc.TopElem.sender.address = 'distant@corpusspb.ru';
    recipient = newNotificationDoc.TopElem.recipients.AddChild("recipient");
    recipient.address = userDoc.TopElem.email;
    newNotificationDoc.TopElem.status = 'active';
    newNotificationDoc.TopElem.subject = 'Вам назначена анкета';
    newNotificationDoc.TopElem.send_date = Date();
    newNotificationDoc.TopElem.body_type = 'html';

    htmlBody = '<div style="font-family: Arial, sans-serif; font-size: 16px; color: #2c3e50;">';
    htmlBody += '<h2 style="color: #1a73e8;">Добрый день!</h2>';
    htmlBody += '<p>Вам назначена новая анкета для прохождения:</p>';
    htmlBody += '<p><a href="https://e.corpusspb.ru/pplayer2/7158466837741482069" style="color: #1a73e8; font-weight: bold;">Перейти к анкете</a></p>';
    htmlBody += '<hr style="margin: 20px 0;">';
    htmlBody += '<p><strong>Данные для входа в систему:</strong></p>';
    htmlBody += '<p>Логин: <b>' + userLogin + '</b></p>';
    htmlBody += '<p>Пароль: <b>' + userPassword + '</b></p>';
    htmlBody += '<p style="font-size: 14px; color: #777;">Рекомендуем сменить пароль после первого входа.</p>';
    htmlBody += '<hr style="margin: 20px 0;">';
    htmlBody += '<p>С уважением,<br>Корпоративный университет</p>';
    htmlBody += '</div>';

    newNotificationDoc.TopElem.body = htmlBody;
    newNotificationDoc.Save();

    tools.create_notification('0', jsonRequest.coll_id, null, null, null, null, newNotificationDoc);

    Response.Write("Отправлено уведомление");
    break;

  case 'collRef':
    try {
      var changeUser = tools.open_doc(jsonRequest.coll_id);
      changeUser.TopElem.sex = jsonRequest.sex;
      changeUser.TopElem.birth_date = Date(jsonRequest.birth_date);
      changeUser.Save();

      coll_res = ArrayDirect(XQuery("sql:
        SELECT [id], [fullname], [email], [phone],
               CASE 
                   WHEN [birth_date] IS NULL THEN 'Дата рождения не указана'
                   ELSE CONVERT(varchar, [birth_date], 104)
               END AS [birth_date],
               CASE 
                   WHEN [sex] = 'm' THEN 'мужской'
                   WHEN [sex] = 'w' THEN 'женский'
                   ELSE 'Пол не указан'
               END AS [sex],
               [org_name]
        FROM [collaborators]
        WHERE [id] = " + SqlLiteral(jsonRequest.coll_id) + "
      "));

      Response.Write(tools.object_to_text(coll_res, 'json'));
    } catch (error) {
      Response.Write('Ошибка сохранения: ' + (error && error.message ? error.message : String(error)));
    }
    break;

  case 'collCreate':
    try {
      var coll_new = tools.new_doc_by_name('collaborator', false);
      var coll_top = coll_new.TopElem;

      coll_top.login = jsonRequest.email;
      coll_top.email = jsonRequest.email;
      coll_top.password = tools.random_string(8);
      coll_top.lastname = jsonRequest.lastname;
      coll_top.firstname = jsonRequest.firstname;
      coll_top.middlename = jsonRequest.middlename;

      coll_top.sex = jsonRequest.sex;
      coll_top.birth_date = Date(jsonRequest.birth_date);

      coll_new.BindToDb(DefaultDb);
      coll_new.Save();

      var coll_pos = tools.new_doc_by_name('position', false);
      var coll_pos_top = coll_pos.TopElem;

      coll_pos_top.name = 'Тестируемый';
      coll_pos_top.org_id = 7273825491646161985;
      coll_pos_top.basic_collaborator_id = coll_new.DocID;

      coll_pos.BindToDb(DefaultDb);
      coll_pos.Save();

      var changeUser = OpenDoc(UrlFromDocID(coll_new.DocID));
      changeUser.TopElem.position_id = coll_pos.DocID;
      changeUser.Save();

      coll_res = ArrayDirect(XQuery("sql:
        SELECT [id], [fullname], [email], [phone],
               CASE 
                   WHEN [birth_date] IS NULL THEN 'Дата рождения не указана'
                   ELSE CONVERT(varchar, [birth_date], 104)
               END AS [birth_date],
               CASE 
                   WHEN [sex] = 'm' THEN 'мужской'
                   WHEN [sex] = 'w' THEN 'женский'
                   ELSE 'Пол не указан'
               END AS [sex],
               [org_name]
        FROM [collaborators]
        WHERE [email] = " + SqlLiteral(jsonRequest.email) + "
      "));

      Response.Write(tools.object_to_text(coll_res, 'json'));
    } catch (error) {
      Response.Write("Ошибка при создании сотрудника: " + (error && error.message ? error.message : String(error)));
    }
    break;

  default:
    Response.Write("Отправьте нужный акшен");
    break;
}
%>
