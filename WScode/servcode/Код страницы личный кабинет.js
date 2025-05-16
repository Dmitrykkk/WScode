<%
var jsonRequest = tools.read_object(Request.Body, 'json')

switch (jsonRequest.action) {
    case 'returnMainData':
        // Получаем основные данные пользователя из таблицы collaborators и связанной таблицы collaborator
        // В выборке: полное имя, email, личный email из XML-данных, телефоны, должность, организация и ссылка на фото
        returnDataArray = ArrayOptFirstElem(XQuery("sql:    
            SELECT cs.fullname, cs.email, c.data.value('(/collaborator/system_email)[1]', 'VARCHAR(255)') AS personal_email,
                cs.phone, cs.mobile_phone, cs.position_name, cs.org_name, cs.pict_url
            FROM collaborators AS cs
            LEFT JOIN collaborator AS c ON c.id = cs.id
            WHERE cs.id = " + curUserID)); 
        
        Response.Write(tools.object_to_text(returnDataArray, 'json'))  // Возвращаем данные в формате JSON
    break;

    case 'postData':
        try {
            // Открываем документ пользователя по его ID для изменения
            var changeUser = OpenDoc(UrlFromDocID(curUserID));

            // Если в пришедших данных есть поле personal_email, обновляем системный email в карточке
            if (jsonRequest.data.HasProperty('personal_email')) {
                changeUser.TopElem.system_email = jsonRequest.data.personal_email;
            }

            // Если есть поле mobile_phone, обновляем мобильный телефон в карточке
            if (jsonRequest.data.HasProperty('mobile_phone')) {
                changeUser.TopElem.mobile_phone = jsonRequest.data.mobile_phone;
            }

            changeUser.Save();  // Сохраняем изменения
            Response.Write('Данные успешно обновлены');  // Успешный ответ
        }
        catch(error) {
            // В случае ошибки при сохранении выводим сообщение с текстом ошибки
            Response.Write('Ошибка сохранения: ' + error.message);
        }
    break;
}
%> 
