_item = Trim('{[1]}');
_responses = Trim('{[2]}');

_questions = _item.split('#');
_answers = _responses.split('#');

for (_question in _questions) {
  try {
    _child = ArrayFind(curObject.questions, 'title == _question');
  } catch (ss) {
    _child = curObject.questions.AddChild();
  }

  _child.title = _question;

  // Добавляем каждый ответ сразу с текстом
  for (_answer in _answers) {
    _child.entries.AddChild().value = _answer;  // Прямо в AddChild добавляем значение в поле value
  }
}