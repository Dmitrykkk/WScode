// Получаем данные из первого, второго и третьего столбцов Excel, обрезая пробелы
_question = Trim('{[1]}');       // Вопрос из первого столбца
_responses = Trim('{[2]}');      // Ответы из второго столбца (разделены символом '#')
_name = Trim('{[3]}');           // Название опроса из третьего столбца

// Выполняем SQL-запрос, чтобы найти ID опроса по его имени
poll_arr = ArraySelectAll(XQuery("sql:select id from polls where name='" + _name + "'"));

// Проверяем, найден ли ровно один опрос с таким именем
if (ArrayCount(poll_arr) == 1) {
  // Открываем документ опроса по найденному ID
  doc = tools.open_doc(poll_arr[0].id);
  te = doc.TopElem;

  // Создаём новый дочерний элемент в списке вопросов
  _child = te.questions.AddChild();

  // Устанавливаем заголовок вопроса
  _child.title = _question;

  // Разбиваем ответы по символу '#', чтобы получить массив вариантов ответа
  _answers = _responses.split('#');

  // Добавляем каждый вариант ответа как дочерний элемент
  for (_answer in _answers) {
    _child.entries.AddChild().value = _answer;
  }
  // Сохраняем изменения в документе
  doc.Save()
  // Флаг, что операция прошла успешно
  continueFlag = true

} else {
  // Если опрос с таким именем не найден или найдено несколько

  // Работам с текущим объектом опроса, устанавливаем имя
  curObject.name = _name;

  try {
    // Пытаемся найти существующий вопрос с таким же заголовком
    _child = ArrayFind(curObject.questions, 'title == _question');
  } catch (ss) {
    // Если вопрос не найден — создаём новый
    _child = curObject.questions.AddChild();
  }

  // Устанавливаем заголовок вопроса (если был найден, обновляем)
  _child.title = _question;

  // Разбиваем ответы по символу '#' на отдельные варианты
  _answers = _responses.split('#');

  // Добавляем варианты ответа в список entries
  for (_answer in _answers) {
    _child.entries.AddChild().value = _answer;
  }
}
