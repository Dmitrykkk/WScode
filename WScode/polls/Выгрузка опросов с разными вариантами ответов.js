_question = Trim('{[1]}');
_responses = Trim('{[2]}');
_name = Trim('{[3]}');

poll_arr = ArraySelectAll(XQuery("sql:select id from polls where name='" + _name + "'"));

if (ArrayCount(poll_arr) == 1) {
  doc = tools.open_doc(poll_arr[0].id);
  te = doc.TopElem;


  _child = te.questions.AddChild();
  

  _child.title = _question;
  _answers = _responses.split('#');

  for (_answer in _answers) {
    _child.entries.AddChild().value = _answer;
  }
doc.Save()
continueFlag = true
} else {
  curObject.name = _name;

  try {
    _child = ArrayFind(curObject.questions, 'title == _question');
  } catch (ss) {
    _child = curObject.questions.AddChild();
  }

  _child.title = _question;
  _answers = _responses.split('#');

  for (_answer in _answers) {
    _child.entries.AddChild().value = _answer;
  }
}