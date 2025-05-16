//Выгрузка данных в должности-для тех у кого теряется орга и подразделения первого уровня(они сами в подразделении первого уровня)
sub_code = Trim("{[DepartmentId]}");
org_code = Trim("{[OrganizationId]}");

try {
    // Получаем coll_id из базы данных
    sub_arr = ArraySelectAll(XQuery("sql:SELECT id, code FROM subdivisions where code='"+sub_code+"'"));

    // Проверяем, что результат не пустой и содержит данные
    if (sub_arr || sub_arr.length > 0) {
        curObject.parent_object_id = sub_arr[0].id; // Используем первый элемент массива
    } else {
        // Если данных по department нет, получаем данные по организации

        
        org_arr = ArraySelectAll(XQuery("sql:SELECT id, code FROM subdivisions where code='"+org_code+"'"));
        
        // Проверяем, что результат по организации не пустой
        if (org_arr || org_arr.length > 0) {
            curObject.parent_object_id = org_arr[0].id; // Подставляем id из организации

        } else {

        }
    }
} catch (error) {}