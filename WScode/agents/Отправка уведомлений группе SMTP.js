/**
 * Агент: Отправка уведомлений участникам группы через SMTP
 * ---------------------------------------------------------------------------
 * Назначение:
 *  - По `CONFIG.GROUP_ID` получить список email участников группы
 *  - Отправить письмо каждому адресу через SMTP
 *  - Залогировать итоговый список адресов, которым ушли письма
 * Входные данные:
 *  - CONFIG (ниже) — параметры SMTP и идентификатор группы
 * Выходные данные:
 *  - Логи с кодом `CONFIG.LOG_KEY`
 */
// Конфигурация
var CONFIG = {
  LOG_KEY: 'group_smtp_notify',
  HOST_AND_PORT: 'smtp.yandex.ru:465',
  USE_TLS_PORT: true,
  LOGIN: login, // укажите логин, либо используйте переменную окружения login
  PASSWORD: password, // укажите пароль, либо используйте переменную окружения password
  SENDER_NAME: 'Имя отправителя',
  SUBJECT: 'Пример письма через SmtpClient',
  GROUP_ID: GROUP_ID
};


// Тело письма
var bodyHtml ='<html>
<head>
<meta charset="UTF-8">
<style>
body { margin: 0; padding: 20px; background-color: #f5f5f5; }
TABLE { font-size: 13pt; font-family: calibri; width: 100%; max-width: 600px; margin: 0 auto; background-color: white; }
.col { color: rgb(51, 141, 201); }
.indent { padding-left: 50px; display: block; }
.container { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
.email-wrapper { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
</style>
</head>
<body>
<div class="container">
<div class="email-wrapper">
<table align="center">
<tr><td align="center">Здравствуйте!<br><br></td></tr>
<tr><td align="center">
Вам назначено прохождение тестирования на Портале оценки.<br><br>
</td></tr>
<tr><td align="left">
<span class="indent">Для входа в систему используйте свои учетные данные:<br><br></span></td></tr>
<tr><td align="left"><span class="indent">Ваш логин:</span></td></tr>
<tr><td align="left"><span class="indent">Ваш пароль:</span></td></tr>
<tr><td align="left">
<span class="indent">Для прохождения тестирования перейдите по <span class="col"><u>ссылке</u></span>.<br><br>
По итогам теста результаты будут зафиксированы в системе.<br><br>
Благодарим Вас за участие!<br><br>
С уважением,<br>
Команда Корпоративного университета<br><br>
<a href="mailto:'
+CONFIG.LOGIN+
'">'
+CONFIG.LOGIN+
'</a><br>
</span></td></tr>
<tr><td align="center">
<img src="https://e.corpusspb.ru/img/notification/OpenAccess/logocprpg.png" width="220" height="65" alt="https://corpusspb.ru"><br><br>
</td></tr>
</table>
</div>
</div>
</body>
</html>';

// Объявления переменных (явно, для читаемости и предотвращения неявного hoisting)
/** @type {string} */
var sql;
/** @type {Array} */
var rows;
/** @type {Object} */
var row;
/** @type {Array<string>} */
var emails;
/** @type {string} */
var emailsStr;
/** @type {SmtpClient} */
var oSmtpClient;
/** @type {MailMessage} */
var message;
/** @type {*} */
var recipient;
/** @type {string} */
var personalizedBody;

// Логирование
EnableLog(CONFIG.LOG_KEY, true);
LogEvent(CONFIG.LOG_KEY, 'Старт отправки уведомлений группе через SMTP');

// 1) Получаем список email участников группы одной выборкой
sql = "sql:
SELECT
  c.email,
  c.id,
  c.login AS login,
  cd.data.value('(collaborator/password)[1]', 'varchar(50)') AS password
FROM [group] g
JOIN [group_collaborators] gc ON g.id = gc.group_id
JOIN [collaborators] c ON c.id = gc.collaborator_id
JOIN collaborator cd ON cd.id = c.id
WHERE g.id = " + CONFIG.GROUP_ID;

rows = XQuery(sql);

if (!ArrayCount(rows)) {
  LogEvent(CONFIG.LOG_KEY, 'Нет сотрудников для отправки уведомлений');
  EnableLog(CONFIG.LOG_KEY, false);
  return;
}

// 2) Рассылаем письма и копим адреса для итогового лога
emails = [];

for (row in rows) {
  // 2.1 SMTP-сессия
  oSmtpClient = SmtpClient();
  oSmtpClient.UseTLSPort = CONFIG.USE_TLS_PORT;
  oSmtpClient.OpenSession(CONFIG.HOST_AND_PORT);
  oSmtpClient.Authenticate(CONFIG.LOGIN, CONFIG.PASSWORD);

  // 2.2 Письмо
  message = new MailMessage();
  message.sender.address = CONFIG.LOGIN;
  message.sender.name = CONFIG.SENDER_NAME;

  // 2.3 Получатель
  recipient = message.recipients.AddChild();
  recipient.address = row.email;
  recipient.name = 'Получатель';

  emails.push(row.email);

  message.subject = CONFIG.SUBJECT;
  // Персонализируем тело письма логином/паролем текущего получателя
  personalizedBody = StrReplace(
        StrReplace(bodyHtml, 'Ваш логин: ;', 'Ваш логин: ' + row.login + ';'),
    'Ваш пароль: ;', 'Ваш пароль: ' + row.password + ';'
  );
  message.html_body = personalizedBody;

  // 2.4 Отправка и закрытие сессии
  oSmtpClient.SendMessage(message);
  oSmtpClient.CloseSession();
}

// 3) Итоговый лог — выводим адреса
emailsStr = emails.join(', ');
LogEvent(CONFIG.LOG_KEY, 'Сообщения отправлены. Почты: ' + emailsStr);
LogEvent(CONFIG.LOG_KEY, 'Завершение отправки уведомлений группе через SMTP');
EnableLog(CONFIG.LOG_KEY, false);