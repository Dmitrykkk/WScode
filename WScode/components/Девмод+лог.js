/**
 * Компонент: DEV-режим + унифицированное логирование
 * ---------------------------------------------------------------------------
 * Назначение:
 *  - В DEV (анонимный шаблон) включает заголовки для удобной разработки (CORS и пр.).
 *  - Предоставляет функцию log(message, type) для единого форматирования логов.
 * Использование:
 *  - Вставить компонент в шаблон/страницу и вызывать log().
 *  - type опционален: INFO|WARN|ERROR (по умолчанию INFO).
 */
var DEV_MODE = customWebTemplate.access.enable_anonymous_access;
if (DEV_MODE) {
  // Для тестирования, шаблон должен быть анонимным.
  Request.AddRespHeader("Access-Control-Allow-Origin", "*", false);
  Request.AddRespHeader("Access-Control-Expose-Headers", "Error-Message");
  Request.AddRespHeader("Access-Control-Allow-Headers", "origin, content-type, accept");
  Request.AddRespHeader("Access-Control-Allow-Credentials", "true");
}
// Базовые заголовки ответа и политики безопасности
Request.RespContentType = "application/json";
Request.AddRespHeader("Content-Security-Policy", "frame-ancestors 'self'");
Request.AddRespHeader("X-XSS-Protection", "1");
Request.AddRespHeader("X-Frame-Options", "SAMEORIGIN");
/* --- utils --- */

// Конфигурация канала логирования
var logConfig = {
  code: "tools_log",
  type: "tools",
  id: customWebTemplate.id
}

/**
 * Пишет лог: в DEV через alert, в PROD через LogEvent
 * @param {*} message Сообщение или объект/массив/последовательность
 * @param {string=} type Уровень: INFO|WARN|ERROR (по умолчанию INFO)
 */
function log(message, type) {
  type = IsEmptyValue(type) ? "INFO" : StrUpperCase(type);

  // Преобразуем сложные объекты в json
  if (ObjectType(message) === "JsObject" || ObjectType(message) === "JsArray" || ObjectType(message) === "XmLdsSeq") {
    message = tools.object_to_text(message, "json")
  }

  var log = "["+type+"]["+logConfig.type+"]["+logConfig.id+"]: "+message;

  if(DEV_MODE) {
    alert(log)
  } else {
    EnableLog(logConfig.code, true)
    LogEvent(logConfig.code, log);
    EnableLog(logConfig.code, false)
  }  
}
// Пример использования
// Текст лога или какой-то объект
testMessage = "testMessage"

log(testMessage)