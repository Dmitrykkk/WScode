filter_status = {PARAM4};
if (filter_status!=null) {ind = 1}
if (filter_status==null) {ind = 2}
switch (ind) {
case 1:
arr1 = XQuery ("for $elem in learnings where $elem/start_usage_date>= ('" +{PARAM1} + "') and  $elem/start_usage_date< ('" + {PARAM2} + "') and  $elem/course_id= ('" + {PARAM4} + "') return $elem");
arr2 = XQuery ("for $elem in active_learnings where $elem/start_usage_date>= ('" +{PARAM1} + "') and  $elem/start_usage_date< ('" + {PARAM2} + "') and  $elem/course_id= ('" + {PARAM4} + "') return $elem");
break;
case 2:
arr1 = XQuery ("for $elem in learnings where $elem/start_usage_date>= ('" +{PARAM1} + "') and  $elem/start_usage_date< ('" + {PARAM2} + "') return $elem");
arr2 = XQuery ("for $elem in active_learnings where $elem/start_usage_date>= ('" +{PARAM1} + "') and  $elem/start_usage_date< ('" + {PARAM2} + "') return $elem");
break;
}
arr3 = ArrayUnion (arr1, arr2);
var finisharr = new Array();
for (_a in arr3)
{
_person = ArrayOptFirstElem(XQuery("for $elem in group_collaborators where $elem/collaborator_id="+_a.person_id+" and $elem/group_id="+{PARAM3}+" return $elem"));

if (_person != undefined)
finisharr[finisharr.length]= _a;
}

return finisharr;