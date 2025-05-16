//выбираем всех уволенных сотрудников, у которых роль не архив
_dismiss_to_arh_array = XQuery("sql:
    select 
        cs.id as id 
    from 
        collaborators as cs 
    where 
        cs.is_dismiss = '1' 
        and cs.role_id<>'arh'
")

//проверям, пустой ли вернулся массив
if (ArrayCount(_dismiss_to_arh_array)!=0) {
    //убираем каждому галочку админа и присваем роль архив
    for (dismiss_to_arh_array in _dismiss_to_arh_array) {
	arhDoc=OpenDoc(UrlFromDocID(dismiss_to_arh_array.id))
	arhDoc.TopElem.access.access_role = "arh"
	arhDoc.TopElem.access.is_arm_admin = false
	arhDoc.Save()
    }
}