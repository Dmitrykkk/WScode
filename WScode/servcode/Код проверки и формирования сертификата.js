<%
var jsonRequest = tools.read_object(Request.Body, 'json')
switch(jsonRequest.action) {
  case 'check_sert': 
    // Приводим user ID и learning ID к безопасному формату для SQL-запроса
    user_id = SqlLiteral(curUserID)
    learning_id = SqlLiteral(jsonRequest.learning_id)
    // Преобразуем learning_id в целое число для открытия документа
    lid = Int(jsonRequest.learning_id)
    // Открываем документ курса по learning_id
    course_top = OpenDoc(UrlFromDocID(lid)).TopElem
    course_name = course_top.course_name
    course_score = course_top.score
    course_maxscore = course_top.max_score

    // Проверяем, существует ли уже сертификат с данным learning_id для пользователя
    check_arr = XQuery("sql:
    SELECT p.person_id, c.data.value('(certificate/desc)[1]', 'NVARCHAR(MAX)') AS learning_id 
    FROM certificates p 
    LEFT JOIN certificate c ON p.id = c.id 
    WHERE p.person_id = " + user_id + " AND c.data.value('(certificate/desc)[1]', 'NVARCHAR(MAX)') = " + learning_id)

    // Получаем количество найденных сертификатов
    check = ArrayCount(check_arr)   

    if (check === 0) {
        // Если сертификат не найден, создаём новый документ сертификата
        cert_cr = tools.new_doc_by_name('certificate', false) 
        cert_bind = cert_cr.TopElem
        cert_bind.person_id = curUserID
        // Заполняем общие поля документа по пользователю
        tools.common_filling('collaborator', cert_cr.TopElem, curUserID)
        cert_bind.desc = jsonRequest.learning_id  // Описание сертификата — ID обучения
        cert_bind.type_id = 7133997414053745692  // Тип сертификата — электронный курс
        cert_bind.type_name = 'Электронный курс'
        cert_bind.serial = course_name             // В серию записываем название курса
        cert_bind.signed_by_name = course_score + ' из ' + course_maxscore  // Оценка курса
        cert_bind.delivery_date = CurDate          // Дата выдачи сертификата
        cert_cr.BindToDb(DefaultDb)                 // Привязываем к базе данных
        cert_cr.Save()                              // Сохраняем новый сертификат

        // После сохранения открываем сертификат для обновления номера
        cert_op = tools.open_doc(cert_cr.DocID)
        cert_num = cert_op.TopElem
        cert_num.number = Int(cert_num.number) + 20000   // Прибавляем 20000 к номеру сертификата
        cert_op.Save()                                    // Сохраняем изменения

        Response.Write('add')   // Сообщаем, что сертификат создан
    } else if (check === 1) {
        // Если сертификат уже существует — возвращаем 'ok'
        Response.Write('ok');
    } else {
        // Если найдено более одного сертификата — возвращаем 'bad'
        Response.Write('bad');
    }
    
    break;

  default: 
    // Если action неизвестен, просим отправить корректный кейс
    Response.Write('Отправьте кейс');
    break;
}
%>
