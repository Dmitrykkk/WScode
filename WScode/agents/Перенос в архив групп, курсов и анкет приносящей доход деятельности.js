var pddGroupRole = '6089275719456474871';
var pddCourseRole = '6308575233714566162';
var pddPollRole = '6333123166841830499';
//поменять в 2020 году на новые категории
//var pddGroupSwapRole = '6779823794912561580';
//var pddCourseSwapRole = '6781809497473633046';
//var pddPollSwapRole = '6786931790083486805';

//var pddGroupSwapRole = '6927155584133594360';
//var pddCourseSwapRole = '6926847281917596774';
//var pddPollSwapRole = '6934636999492463992';

// var pddGroupSwapRole = '7055261727634110933';
// var pddCourseSwapRole = '7055258481875712486';
// var pddPollSwapRole = '7055263497374038186';


// var pddGroupSwapRole = '7325405700195497707';
// var pddCourseSwapRole = '7325405885792483733';
// var pddPollSwapRole = '7325406043724651656';

var pddGroupSwapRole = '7458250128817089165';
var pddCourseSwapRole = '7458250236670068078';
var pddPollSwapRole = '7458250430438259597';




//логировать ли ошибки
var log = false;

//создаем дату за семь дней с текущей в формате для sql
//при необходимости поменять срок - работаем со вторым параметром (0-7)
var currDate = tools.AdjustDate(Date(), 0-7);
var sqlDifferentDate = Year(currDate) + (StrCharCount(Month(currDate)) === 1?'0':'') + Month(currDate) + (StrCharCount(Day(currDate)) === 1?'0':'') + Day(currDate);

//пустые массивы под запросы
var pddGroupArray = new Array();
var pddCourseArray = new Array();
var pddPollArray = new Array();

//функция смены роли 
function chengeRoll(id, roleID) {
  try {
    changeDoc = OpenDoc(UrlFromDocID(Int(id)));
    changeDoc.TopElem.role_id.Clear();
    changeDoc.TopElem.role_id.ObtainByValue(roleID);
    changeDoc.Save();
  }
  catch(changeError) {
    log && alert(changeError);
  }  
}

//блок запросов id
pddGroupArray = XQuery("sql:
  SELECT 
    gr.id AS id,
    DATEDIFF(day, CONVERT(DATETIME, '" + sqlDifferentDate + "',  120), CONVERT(DATETIME, REPLACE(SUBSTRING(gr.name, 12, 10), '_', ''), 120)) AS dateDifference
  FROM
    [groups] AS gr
  WHERE 
    CAST(gr.role_id AS varchar(100)) LIKE '%" + pddGroupRole + "%' 
    AND gr.name LIKE '2%'
    AND SUBSTRING(gr.name, 12, 10) LIKE '2%' 
");
pddCourseArray = XQuery("sql:
  SELECT 
    cr.id AS id,
    DATEDIFF(day, CONVERT(DATETIME, '" + sqlDifferentDate + "',  120), CONVERT(DATETIME, REPLACE(SUBSTRING(cr.name, 12, 10), '_', ''), 120)) AS dateDifference
  FROM
    courses AS cr
  WHERE 
    CAST(cr.role_id AS varchar(100)) LIKE '%" + pddCourseRole + "%' 
    AND cr.name LIKE '2%'
    AND SUBSTRING(cr.name, 12, 10) LIKE '2%' 
");
pddPollArray = XQuery("sql:
  SELECT 
    pl.id AS id,
    DATEDIFF(day, CONVERT(DATETIME, '" + sqlDifferentDate + "',  120), CONVERT(DATETIME, REPLACE(SUBSTRING(pl.name, 12, 10), '_', ''), 120)) AS dateDifference
  FROM
    polls AS pl
  WHERE 
    CAST(pl.role_id AS varchar(100)) LIKE '%" + pddPollRole + "%' 
    AND pl.name LIKE '2%'
    AND SUBSTRING(pl.name, 12, 10) LIKE '2%' 
");

//блок вычисления разницы
for (_pddGroupArray in pddGroupArray) {
  if (_pddGroupArray.dateDifference <= 0) {
    chengeRoll(_pddGroupArray.id, pddGroupSwapRole)
  }
}
for (_pddCourseArray in pddCourseArray) {
  if (_pddCourseArray.dateDifference <= 0) {
    chengeRoll(_pddCourseArray.id, pddCourseSwapRole)
  }
}
for (_pddPollArray in pddPollArray) {
  if (_pddPollArray.dateDifference <= 0) {
    chengeRoll(_pddPollArray.id, pddPollSwapRole)
  }
}