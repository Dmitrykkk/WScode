var ggsGroupRole = '6089275719456474872';
var ggsCourseRole = '6308574856271786510';
var ggsPollRole = '6308588899911622566';
//поменять в 2020 году на новые категории
//это id 2020 года
//var ggsGroupSwapRole = '6779823760914583245';
//var ggsCourseSwapRole = '6781809445513343882';
//var ggsPollSwapRole = '6786931665835656913';


//var ggsGroupSwapRole = '6927155544195220779';
//var ggsCourseSwapRole = '6926846500251912356';
//var ggsPollSwapRole = '6934636703653056973';

// var ggsGroupSwapRole = '7055260881583361330';
// var ggsCourseSwapRole = '7055258373676864949';
// var ggsPollSwapRole = '7055262728770626372';

//var ggsGroupSwapRole = '7176925657105500391';
//var ggsCourseSwapRole = '7176925751838865710';
//var ggsPollSwapRole = '7176925506196811223';

//var ggsGroupSwapRole = '7325405657526921047';
//var ggsCourseSwapRole = '7325405847171371579';
//var ggsPollSwapRole = '7325405980497287610';

var ggsGroupSwapRole = '7458250077399291243';
var ggsCourseSwapRole = '7458250190337165948';
var ggsPollSwapRole = '7458250356928440038';



//логировать ли ошибки
var log = false;

//создаем дату за семь дней с текущей в формате для sql
//при необходимости поменять срок - работаем со вторым параметром (0-7)
var currDate = tools.AdjustDate(Date(), 0-7);
var sqlDifferentDate = Year(currDate) + (StrCharCount(Month(currDate)) === 1?'0':'') + Month(currDate) + (StrCharCount(Day(currDate)) === 1?'0':'') + Day(currDate);

//пустые массивы под запросы
var ggsGroupArray = new Array();
var ggsCourseArray = new Array();
var ggsPollArray = new Array();

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
ggsGroupArray = XQuery("sql:
  SELECT 
    gr.id AS id,
    DATEDIFF(day, CONVERT(DATETIME, '" + sqlDifferentDate + "',  120), CONVERT(DATETIME, REPLACE(SUBSTRING(gr.name, 12, 10), '_', ''), 120)) AS dateDifference
  FROM
    [groups] AS gr
  WHERE 
    CAST(gr.role_id AS varchar(100)) LIKE '%" + ggsGroupRole + "%' 
    AND gr.name LIKE '2%'
    AND SUBSTRING(gr.name, 12, 10) LIKE '2%' 
");
ggsCourseArray = XQuery("sql:
  SELECT 
    cr.id AS id,
    DATEDIFF(day, CONVERT(DATETIME, '" + sqlDifferentDate + "',  120), CONVERT(DATETIME, REPLACE(SUBSTRING(cr.name, 12, 10), '_', ''), 120)) AS dateDifference
  FROM
    courses AS cr
  WHERE 
    CAST(cr.role_id AS varchar(100)) LIKE '%" + ggsCourseRole + "%' 
    AND cr.name LIKE '2%'
    AND SUBSTRING(cr.name, 12, 10) LIKE '2%' 
");
ggsPollArray = XQuery("sql:
  SELECT 
    pl.id AS id,
    DATEDIFF(day, CONVERT(DATETIME, '" + sqlDifferentDate + "',  120), CONVERT(DATETIME, REPLACE(SUBSTRING(pl.name, 12, 10), '_', ''), 120)) AS dateDifference
  FROM
    polls AS pl
  WHERE 
    CAST(pl.role_id AS varchar(100)) LIKE '%" + ggsPollRole + "%' 
    AND pl.name LIKE '2%'
    AND SUBSTRING(pl.name, 12, 10) LIKE '2%' 
");

//блок вычисления разницы
for (_ggsGroupArray in ggsGroupArray) {
  if (_ggsGroupArray.dateDifference <= 0) {
    chengeRoll(_ggsGroupArray.id, ggsGroupSwapRole)
  }
}
for (_ggsCourseArray in ggsCourseArray) {
  if (_ggsCourseArray.dateDifference <= 0) {
    chengeRoll(_ggsCourseArray.id, ggsCourseSwapRole)
  }
}
for (_ggsPollArray in ggsPollArray) {
  if (_ggsPollArray.dateDifference <= 0) {
    chengeRoll(_ggsPollArray.id, ggsPollSwapRole)
  }
}