Sleep(15000);

// Конфигурация (редактируемые параметры)
logFolderPath = "C:/WebSoft/WebSoftServer/Logs/"; // Путь к папке с логами бэкапов
senderEmail = "distant@corpusspb.ru";               // Email отправителя
recipientEmails = [                                  // Список email-адресов получателей
    "d.krasnokutskij@corpusspb.ru",                  // Получатель 1
    "k.perchatkin@corpusspb.ru",                     // Получатель 2
    "v.popov@corpusspb.ru"                           // Получатель 3
];
emailSubject = "Информация о прошедшей выгрузке"; // Тема письма

date = Date();
year = Year(date);
month = Month(date);
day = Day(date);

if (month < 10) month = "0" + month;
if (day < 10) day = "0" + day;

formattedDate = year + '-' + month + '-' + day;
filePath = logFolderPath + "backup_log_" + formattedDate + ".log";

rawText = LoadFileText(filePath);
lines = StrSplitToLines(rawText);

fileContent = "<div style=\"font-family: Consolas; font-size: 15px;\">";
fileContent += "<h2 style=\"color: #2c3e50; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;\">" + emailSubject + "</h2>";

for (i = 0; i < lines.length; i++) {
    line = Trim(lines[i]);
    if (StrLen(line) == 0) continue;

    spacePos = StrOptSubStrPos(line, " ");
    if (spacePos > 0) {
        time = StrLeftCharRange(line, spacePos);
        message = StrRightRangePos(line, spacePos + 1);

        rightBracketPos = StrOptSubStrPos(message, "]");
        if (rightBracketPos > 0) {
            message = StrRightRangePos(message, rightBracketPos + 2);
        }

        fileContent += "<div><b>" + time + "</b> — " + message + "</div>";
    } else {
        fileContent += "<div>" + line + "</div>";
    }
}

fileContent += "</div>";

newNotificationDoc = OpenNewDoc('x-local://wtv/wtv_active_notification.xmd');
newNotificationDoc.BindToDb(DefaultDb);

newNotificationDoc.TopElem.sender.address = senderEmail;
newNotificationDoc.TopElem.status = 'active';
newNotificationDoc.TopElem.subject = emailSubject;
newNotificationDoc.TopElem.send_date = Date();

recipient = null;
for (i = 0; i < recipientEmails.length; i++) {
    recipient = newNotificationDoc.TopElem.recipients.AddChild("recipient");
    recipient.address = recipientEmails[i];
}

newNotificationDoc.TopElem.body_type = 'html';
newNotificationDoc.TopElem.body = fileContent;

newNotificationDoc.Save();
tools.create_notification('0', '7270474971410149713', null, null, null, null, newNotificationDoc);