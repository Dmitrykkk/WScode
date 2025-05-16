<%
// Один акшен 'structure', доступы настраиваются в группах в категории 'кабинеты доступы'

// Чтение тела запроса как JSON-объекта
var jsonRequest = tools.read_object(Request.Body, 'json')

// Объявление переменной для хранения всей структуры данных
var allStructure = {}

// Структура отчетов для отдела планирования и реализации программ (ОРП)
orp = [
  {
    title: 'Отчеты по группе',
    color: 'tur',
    array: [
      {val: 'Тест', a: '/_wt/6420344519756091574'},
      {val: 'Курс', a: '/_wt/6420345198808875930'},
      {val: 'Анкета', a: '/view_doc.html?mode=anketa_group'}
    ]
  },
  {
    title: 'Отчеты по слушателю',
    color: 'purple',
    array: [
      {val: 'Тест', a: '/_wt/7283838117154397585'},
      //{val: 'Тест (подробно)', a: '/view_doc.html?mode=doc_type&custom_web_template_id=6606242572569234137'},
      {val: 'Курс', a: '/_wt/6412941565844810942'},
      {val: 'Все курсы', a: '/_wt/6412926866376178567'}
    ]
  },
  {
    title: 'Инструменты',
    color: 'lilac',
    array: [
      //{val: 'Выгрузка вопросов по тесту', a: 'orp/assessment_question'},
      // {val: 'Реестр удостоверений', a: '/view_doc.html?mode=udt_reestr'},
      // {val: 'План-график обучения групп', a: '/view_doc.html?mode=plan_graf'},
      // {val: 'Логины и пароли слушателей', a: '/view_doc.html?mode=collaborators_log_pass'},
      // {val: 'Активация итогового теста и анкеты', a: 'orp/course_set_active'},
      // {val: 'Выгрузка в Excel', a: 'orp/create_excel'},
      // {val: 'Отчет по мотивации. Губернаторская.', a: '/_wt/6870369493651638308'},
      {val: 'Логины и пароли слушателей: все группы', a: '/_wt/6107130053124978683'}
    ]
  }
]

// Структура отчетов для отдела дизайна образовательных программ и экспертиз (ДИЗ)
diz = [
  {
    title: 'Отчеты по группе',
    color: 'tur',
    array: [
      {val: 'Тест', a: '/_wt/6420344519756091574'},
      {val: 'Курс', a: '/_wt/6420345198808875930'},
      {val: 'Анкета', a: '/view_doc.html?mode=anketa_group'}
    ]
  }
]

// Структура отчетов для отдела перспективных образовательных проектов (ОБП)
obp = [
  {
    title: 'Отчеты по группе',
    color: 'sea',
    array: [
      {val: 'Тест', a: '/_wt/6420344519756091574'},
      {val: 'Курс', a: '/_wt/6420345198808875930'},
      {val: 'Анкета', a: '/view_doc.html?mode=anketa_group'}//,
     // {val: 'Отчет по выпускникам ПП(ПП на доработке)', a: '/view_doc.html?mode=doc_type&custom_web_template_id=6813674421223381598'}
    ]
  },
  {
    title: 'Отчеты по слушателю',
    color: 'lilac',
    array: [
      {val: 'Тест', a: '/_wt/7283838117154397585'},
      //{val: 'Тест (подробно)', a: '/view_doc.html?mode=doc_type&custom_web_template_id=6606242572569234137'},
      {val: 'Курс', a: '/_wt/6412941565844810942'},
      {val: 'Все курсы', a: '/_wt/6412926866376178567'}
    ]
  }//,
  //{
   // title: 'Инструменты',
  //  color: 'lilac',
  //  array: [
   //   {val: 'Выгрузка в Excel(не работает на старом или неактуально, почему это нужно тоже, не знаю)', a: 'obp/create_excel'},
   //   {val: "Заявки выпускников президентской программы(ПП на доработке)", a: "obp/pp_request"},
   //   {val: 'Изучение готовности и мотивации к обучению (2 Модуль)(Опрос 21 года, новых данных по нему нет)', a: '/_wt/6898313577038742799'},
    //  {val: 'Анкета "Новая траектория – современные технологии управления и изменения как фактор успеха"', a: '/_wt/7082741632661085841'}
//
    // ]
   //}
]

// Структура отчетов для отдела оценки профессиональных компетенций, психодиагностики и подбора персонала (МАРК)
mark = [
  {
    title: 'Отчеты по группе',
    color: 'azure',
    array: [
      {val: 'Опрос', a: '/_wt/6615498957896178538'},
      //{val: 'Опрос 360', a: 'mark/group_polls_report'},
      {val: 'Курс', a: '/_wt/6615507913048281972'},
      {val: 'Кейс-курс 22', a: '/_wt/6615515818801891749'},
      {val: 'Кейс-курс 22 актуальный', a: '/_wt/7295741048622177623'},
      {val: 'Кейс-курс 28', a: '/_wt/6615518842433120585'},
      {val: 'Кейс-курс (20/20)', a: '/_wt/6768800084131270796'},
      {val: 'Отчет по оценке 360 new', a: '/_wt/7153520111947186173'}
    ]
  },
  {
    title: 'Отчеты по слушателю',
    color: 'purple',
    array: [
      {val: 'Опрос', a: '/_wt/6616273497735105436'},
      {val: 'Курс', a: '/_wt/6412941565844810942'},
      {val: 'Кейс-курс 22', a: '/_wt/6615518117469688256'},
      {val: 'Кейс-курс 28', a: '/_wt/6615518860552720805'},
      {val: 'Кейс-курс (20/20)', a: '/_wt/6615524328184636829'}
    ]
  },
  {
    title: 'Инструменты',
    color: 'lilac',
    array: [
      // {val: 'Отчет по оценке 360', a: 'mark/mark_360'},
      // {val: 'Выгрузка результатов опроса', a: 'mark/create_excel'},
      // {val: 'Отчет по подбору кандидатов', a: 'mark/mark_35'},
      {val: 'Отчет по мотивации. Губернаторская.', a: '/_wt/6870369493651638308'},
      {val: 'Изучение готовности и мотивации к обучению (2 Модуль)', a: '/_wt/6898313577038742799'},
    //{val: 'Изучение готовности и мотивации к обучению (4 поток)', a: '/_wt/6966948765424184448'},
  {val: 'Анкета "Новая траектория – современные технологии управления и изменения как фактор успеха"', a: '/_wt/6999883368943520851'},
  //{val: 'Анкета "Изучение готовности и мотивации к обучению (6 поток)"', a: '/_wt/7139890415313181612'},
{val: 'Анкета кандидата на участие в программе "Раскрытие личностного и профессионального потенциала через применение инструментов управления жизненной энергией на основе ценностей"', a: '/_wt/7424443153085582182'}
    ]
  }
]

// Структура отчетов для отдела электронных образовательных ресурсов (ОДО)
odo = [
  {
    title: 'Отчеты по группе',
    color: 'tur',
    array: [
      {val: 'Тест', a: '/_wt/6420344519756091574'},
      {val: 'Курс', a: '/_wt/6420345198808875930'},
      {val: 'Курс (для комитета)', a: '/_wt/7044135271489286619'},
      {val: 'Анкета', a: '/view_doc.html?mode=anketa_group'},
      {val: 'Отчет по курсам самообразования', a: '/_wt/6592927400081253110'},
      //{val: 'Электронное наставничество: все курсы', a: '/view_doc.html?mode=doc_type&custom_web_template_id=6473764756018971432'},
      {val: 'Электронное наставничество: все курсы. НОВЫЙ', a: '/view_doc.html?mode=en_beta'},
      {val: 'Электронное наставничество: анкета', a: '/_wt/6615490211447376644'},
    {val: 'Отчет для CRM', a: '/_wt/7306046297806758329'},
        {val: 'Отчет для CRM(по курсу, для самообразования)', a: '/_wt/7308693013014059159'},
{val: 'Отчет для CRM(по курсу(содержится ли часть введенного текста в названии курса), для самообразования)', a: '/_wt/7157291790908877565'}
    ]
  },
  {
    title: 'Отчеты по слушателю',
    color: 'purple',
    array: [
      {val: 'Тест', a: '/_wt/7283838117154397585'},
      {val: 'Тест (подробно)', a: '/view_doc.html?mode=doc_type&custom_web_template_id=6606242572569234137'},
      {val: 'Курс', a: '/_wt/6412941565844810942'},
      {val: 'Анкета', a: '/_wt/7080050976759570841'},
      {val: 'Все курсы', a: '/_wt/6412926866376178567'}
    ]
  },
  {
    title: 'Инструменты',
    color: 'lilac',
    array: [
      //{val: 'Часто задаваемые вопросы', a: 'odo/questions'},
      //{val: 'Прокторинг csv', a: 'odo/csv'},
      //{val: 'Выгрузка вопросов по тесту', a: 'odo/assessment_question'},
      //{val: 'Реестр удостоверений', a: '/view_doc.html?mode=udt_reestr'},
      {val: 'Реестр сертификатов', a: '/view_doc.html?mode=cert_type_table'},
      //{val: 'План-график обучения групп', a: '/view_doc.html?mode=plan_graf'},
      {val: 'Создание анкеты', a: '/view_doc.html?mode=poll_create'},
      {val: 'Логины и пароли слушателей: все группы', a: '/_wt/6107130053124978683'},
      //{val: 'Логины и пароли слушателей', a: '/view_doc.html?mode=collaborators_log_pass'},
      {val: 'Реестр курсов', a: '/view_doc.html?mode=course_wt'},
      //{val: 'Активация итогового теста и анкеты', a: 'odo/course_set_active'},
       // {val: 'Отчет по оценке 360', a: 'odo/mark_360'},
       // {val: 'Выгрузка в Excel', a: 'odo/create_excel'},
        //{val: 'Импорт слушателей', a: 'odo/collaborators_import'},
        //{val: 'Отчет по подбору кандидатов', a: 'odo/mark_35'},
    {val: 'Подсчет заходов на портал', a: '/portal_entry_count'},
    {val: 'Центр аналитики', a: '/analytics/category/learning'},
    ]
  },
    // {
    //   title: 'Инструкции',
    //   color: 'sea',
    //   array: [
    //     {val: 'Инструкция пользователя для ГГС', a: 'http://kurs.espbmrc.ru/odo_instruction/polzovatela_ggs.pdf'},
    //     {val: 'Инструкция пользователя для ПДД', a: 'http://kurs.espbmrc.ru/odo_instruction/polzovatela_pdd.pdf'},
    //     {val: 'Инструкция пользователя для ПДД (ДО)', a: 'http://kurs.espbmrc.ru/odo_instruction/polzovatela_pdd%28odo%29.pdf'},
    //     {val: 'Инструкция пользователя для МКР', a: 'http://kurs.espbmrc.ru/odo_instruction/polzovatela_mkr.pdf'},
    //     {val: 'Инструкция пользователя для ЭН', a: 'http://kurs.espbmrc.ru/odo_instruction/polzovatela_EN.pdf'},
    //     {val: 'Инструкция пользователя для БЗ', a: 'http://kurs.espbmrc.ru/odo_instruction/polzovatela_bz.pdf'},
    //     {val: 'Инструкция при проблемах входа на портал', a: 'http://kurs.espbmrc.ru/odo_instruction/pri_problemah_vhoda_na_portal.pdf'},
    //     {val: 'Инструкция по установке программы воспроизведения мультимедийного контента', a: 'http://kurs.espbmrc.ru/odo_instruction/mult_instruction.pdf'},
    //     {val: 'Инструкция по работе с реестром удостоверений', a: 'http://kurs.espbmrc.ru/odo_instruction/reestr_udost.pdf'}
    //   ]
    // },
    // {
    //   title: 'Полезные материалы',
    //   color: 'azure',
    //   array: [
    //     {val: 'Доверенность на получение документа', a: 'http://kurs.espbmrc.ru/odo_instruction/dover_doc.docx'},
    //     {val: 'Заявление на отправку удостоверения', a: 'http://kurs.espbmrc.ru/odo_instruction/zayv_ud.docx'},
    //     {val: 'Информационное письмо', a: 'http://kurs.espbmrc.ru/odo_instruction/info_letter.docx'},
    //     {val: 'Комплексная система профессионального развития (по целевым группам)', a: 'http://kurs.espbmrc.ru/odo_instruction/complex_system.pdf'},
    //     {val: 'Комплексная система профессионального развития (с оценкой)', a: 'http://kurs.espbmrc.ru/odo_instruction/shema_ocenka.jpg'},
    //     {val: 'Регламент доступа на портал', a: 'http://kurs.espbmrc.ru/odo_instruction/reglament_dostup.pdf'},
    //     {val: 'Согласие на обработку персональных данных', a: 'http://kurs.espbmrc.ru/odo_instruction/soglas_obrabot_person_data.docx'},
    //     {val: 'Схема «Электронное наставничество»', a: 'http://kurs.espbmrc.ru/odo_instruction/shema_EN.pdf'}
    //   ]
    // }
]

// Запрос к базе данных для получения информации о доступах текущего пользователя
accsessArray = XQuery("sql: 
DECLARE @id BIGINT = "+curUserID+";
CREATE TABLE #groupAccsess ([objects] NVARCHAR(20));
INSERT INTO #groupAccsess ([objects])
SELECT 
    CASE group_id 
        WHEN 7126181714841297762 THEN 'odo' 
        WHEN 7126181821841107061 THEN 'orp' 
        WHEN 7278631935229375265 THEN 'mark' 
        WHEN 7126181857746972985 THEN 'obp'
        WHEN 7138930906583786468 THEN 'diz' 
    END
FROM group_collaborators
WHERE collaborator_id = @id
AND group_id IN (7126181714841297762, 7126181821841107061, 7278631935229375265, 7126181857746972985, 7138930906583786468);
SELECT [objects] FROM #groupAccsess;");

// Функция для формирования структуры доступа с выбором кабинета
function accsessStructure() {
  var allStructure = {}
  for(accsess in accsessArray) {
    if (accsess.objects == 'odo') allStructure.odo =odo;
    if (accsess.objects == 'orp') allStructure.orp =orp;
    if (accsess.objects == 'mark') allStructure.mark =mark;
    if (accsess.objects == 'obp') allStructure.obp =obp;
    if (accsess.objects == 'diz') allStructure.diz =diz;
  }
  var choice = [];
  for(accsess in accsessArray) {
    if (accsess.objects == 'odo') choice.push({title: 'Кабинет отдела электронных образовательных ресурсов', a: 'odo'});
    if (accsess.objects == 'orp') choice.push({title: 'Кабинет отдела планирования и реализации программ', a: 'orp'});
    if (accsess.objects == 'mark') choice.push({title: 'Кабинет отдела оценки профессиональных компетенций, психодиагностики и подбора персонала', a: 'mark'});
    if (accsess.objects == 'obp') choice.push({title: 'Кабинет отдела перспективных образовательных проектов', a: 'obp'});
    if (accsess.objects == 'diz') choice.push({title: 'Кабинет отдела дизайна образовательных программ и экспертиз', a: 'diz'});
  }
  allStructure.choice = choice;
  Response.Write(tools.object_to_text(allStructure, 'json'));
}

// Функция для формирования структуры доступа без выбора кабинета
function accsessStructureD() {
  var allStructure = {}
  for(accsess in accsessArray) {
    if (accsess.objects == 'odo') allStructure.odo =odo;
    if (accsess.objects == 'orp') allStructure.orp =orp;
    if (accsess.objects == 'mark') allStructure.mark =mark;
    if (accsess.objects == 'obp') allStructure.obp =obp;
    if (accsess.objects == 'diz') allStructure.diz =diz;
  }
  Response.Write(tools.object_to_text(allStructure, 'json'));
}

// Функция для формирования списка доступных кабинетов
function accsessChoice() {
  var choice = [];
  for(accsess in accsessArray) {
    if (accsess.objects == 'odo') choice.push({title: 'Кабинет отдела электронных образовательных ресурсов', a: 'odo'});
    if (accsess.objects == 'orp') choice.push({title: 'Кабинет отдела планирования и реализации программ', a: 'orp'});
    if (accsess.objects == 'mark') choice.push({title: 'Кабинет отдела оценки профессиональных компетенций, психодиагностики и подбора персонала', a: 'mark'});
    if (accsess.objects == 'obp') choice.push({title: 'Кабинет отдела перспективных образовательных проектов', a: 'obp'});
    if (accsess.objects == 'diz') choice.push({title: 'Кабинет отдела дизайна образовательных программ и экспертиз', a: 'diz'});
  }
  Response.Write(tools.object_to_text(choice, 'json'));
}

// Обработка действия из запроса
switch(jsonRequest.action) {
  case 'structure': 
    accsessStructure()
    break;
  case 'structured': 
    accsessStructureD()
    break;
  case 'choice': 
    accsessChoice()
    break;
  default: 
    Response.Write("Отправьте нужный акшен");
    break;
}
%>