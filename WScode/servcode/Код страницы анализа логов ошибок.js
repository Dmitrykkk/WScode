<%
    // Считываем JSON из тела запроса
    var jsonRequest = tools.read_object(Request.Body, 'json');
    // Массив для результата, который будет в итоге отправлен клиенту
    var responseObjArr = new Array();
    var tmpTxt = "";
    // Получаем текущую дату и форматируем её, заменяя точки на пробелы
    var dateStr = String(ParseDate(Date())).split('.').join(' ');
    // Получаем месяц и год из запроса, приводим к числу
    var currMonth = OptInt (jsonRequest.month);
    var currYear = OptInt (jsonRequest.year);
    // Вспомогательные массивы для обработки данных
    partTmpArr = new Array();
    tempArrtemp = new Array();
    emailParts = new Array();

    // Функция проверки, является ли год високосным
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    // Функция для определения количества дней в месяце с учётом високосного года
    function getDaysInMonth(month, year) {
        var monthsWith30Days = [3, 5, 8, 10]; // Апрель, Июнь, Сентябрь, Ноябрь
        var monthsWith31Days = [0, 2, 4, 6, 7, 9, 11]; // Январь, Март, Май, Июль, Август, Октябрь, Декабрь
        if (month === 1) { // Февраль
            return isLeapYear(year) ? 29 : 28;
        } else if (monthsWith30Days.indexOf(month) !== -1) {
            return 30;
        } else if (monthsWith31Days.indexOf(month) !== -1) {
            return 31;
        } else {
            throw new Error('Некорректный номер месяца. Должно быть от 1 до 12.');
        }
    }

    // Функция загрузки логов по дате (год, месяц, день)
    function loadLogFiles(currYear, currMonth, i) {
        // Выбираем разделитель в названии файла в зависимости от даты
        var delimiter = currMonth < 1 && currYear < 2025 || currYear < 2025 ? '-' : '_';
        var nextMonth = currMonth + 1;
        // Форматируем месяц с ведущим нулём если нужно
        var monthPart = currMonth < 9 ? '0' + nextMonth : '' + nextMonth;
        var day = i + 1;
        // Форматируем день с ведущим нулём если нужно
        var dayPart = i < 9 ? '0' + day : '' + day;
        var baseFileName = currYear + '-' + monthPart + '-' + dayPart;
        var currDay = dayPart + '.' + monthPart + '.' + currYear;

        // Внутренняя функция для загрузки конкретного файла по префиксу
        function loadFile(prefix) {
            // Проверяем, не совпадает ли дата лога с текущей датой
            if (String(ParseDate(Date())) != String(currDay)) {
                // Формируем полный путь к файлу лога
                var fileName = 'C:/WebSoft/WebSoftServer/Logs/' + prefix + delimiter + baseFileName + '.log';
                try {
                    // Пытаемся загрузить содержимое файла
                    return LoadFileText(fileName);
                } catch (e) {
                    // Если файл не найден, возвращаем пустую строку
                    return '';
                }
            } else {
                // Если дата совпадает с текущей, лог ещё не сформирован, возвращаем пустую строку
                return '';
            }
        };

        // Возвращаем объект с двумя типами логов: события авторизации и email ошибки
        return {
            responseText: loadFile('auth-events'),
            responseError: loadFile('email')
        };
    }

    // Цикл по всем дням указанного месяца
    for (i = 0; i < getDaysInMonth(currMonth, currYear); i++) {
        // Загружаем логи для текущего дня
        result = loadLogFiles(currYear, currMonth, i);
        responseText = result.responseText;
        responseError = result.responseError;

        // Разбиваем содержимое логов авторизации по строкам
        try {
            authStringArr = responseText.split("\n");
        }
        catch (e) {
            authStringArr = "";
        }

        // Разбиваем содержимое email логов по строкам
        try {
            errorStringList = responseError.split("\n");
        }
        catch (e) {
            errorStringArr = "";
        }

        // Инициализация массивов и счётчиков на каждый день
        emailStringArr = new Array();
        errorStringArr = new Array();
        itemElementLog = new Array();
        employeePortalCount = 0;
        pddCount = 0;
        ggsCount = 0;
        errorEmployeePortalCount = 0;

        // Обработка каждой строки лога авторизации
        for (authStringArrItem in authStringArr) {
            if (authStringArrItem) {
                elementAuthLog = authStringArrItem.split("\t");
                arrayTmp = ArrayDirect(elementAuthLog);
                try {
                    // Выбираем нужный элемент массива в зависимости от даты
                    emailStringArr.push(arrayTmp[currMonth < 1 && currYear < 2025 || currYear < 2025 ? 4 : 3]);
                }
                catch (e) {
                    emailStringArr.push("");
                }
            }
        }

        // Обработка каждой строки логов ошибок email
        for (errorStringListItem in errorStringList) {
            if (errorStringListItem) {
                elementErrorLog = new Array();
                elementErrorLog = errorStringListItem.split(". ");
                errorStringArr.push(elementErrorLog);
            }
        }

        // Анализируем email адреса из лога авторизации
        for (m = 0; m < emailStringArr.length; m++) {
            try {
                emailItem = emailStringArr[m];
                emailParts = emailItem.split(':');
                tempArrtemp = ArrayDirect(emailParts)
                try {
                    partTmpArr.push(emailParts[1]);
                }
                catch (e) {
                    // Ошибка при обработке email части
                }
                // Считаем статистику по ключевым IP и адресам
                if (emailParts.length != 1) {
                    part = emailParts[1];
                    if (part === "10.148.117.100" || part === "https://10.148.117.100/view_doc.html?mode=home") {
                        employeePortalCount++;
                    } else if (part === "//spb.corpusspb.ru") {
                        pddCount++;
                    } else if (part === "//e.corpusspb.ru") {
                        ggsCount++;
                    }
                }
            }
            catch (e) {
                // Ошибка при разборе email строки
            }
        }

        // Анализируем логи ошибок email, считаем успешные отправки на конкретные адреса
        for (errorStringArrItem in errorStringArr) {
            if (errorStringArrItem.length > 1) {
                if (
                    errorStringArrItem[1] === "Email sending to d.krasnokutskij@spbmrc.ru, t.melikhov@spbmrc.ru successful"
                    ||
                    errorStringArrItem[1] === "Email sending to d.krasnokutskij@spbmrc.ru, k.perchatkin@spbmrc.ru successful"
                ) {
                    errorEmployeePortalCount++;
                }
            }
        }

        // Формируем объект с данными за текущий день
        itemDay = {
            employeePortal: String(employeePortalCount),
            pdd: String(pddCount),
            ggs: String(ggsCount),
            errorEmployeePortalCount: String(errorEmployeePortalCount),
            currentDay: dateStr,
        }
        // Добавляем результат в массив
        responseObjArr.push(itemDay)
    }

    // Возвращаем JSON с результатами
    Response.Write(tools.array_to_text (responseObjArr, 'json'));
%>
