// Разбиваем строку OBJECTS_ID_STR по символу ";" на массив идентификаторов курсов
returnCourse = OBJECTS_ID_STR.split(";");

// Проходим по каждому элементу массива returnCourse
for (_returnCourse in returnCourse) {
  try {
    // Открываем документ курса по ID, преобразуя строку в число и получая URL документа
    OldCourseDoc = OpenDoc(UrlFromDocID(Int(_returnCourse))); 

    // Создаём новый документ на основе шаблона активного обучения
    NewCourseDoc = OpenNewDoc("x-local://wtv/wtv_active_learning.xmd");

    // Копируем содержимое (верхний элемент) из старого документа в новый
    NewCourseDoc.TopElem.AssignElem(OldCourseDoc.TopElem);

    // Привязываем новый документ к базе данных по умолчанию
    NewCourseDoc.BindToDb(DefaultDb);

    // Сохраняем новый документ с присвоением ему нового ID
    NewCourseDoc.Save();

    // Удаляем старый документ по URL, чтобы заменить его новым
    DeleteDoc(UrlFromDocID(Int(_returnCourse)));
  }
  catch(e) {
    // Если в процессе копирования произошла ошибка, выводим её пользователю
    alert("При копировании курса произошла ошибка " + e);
  }
}
