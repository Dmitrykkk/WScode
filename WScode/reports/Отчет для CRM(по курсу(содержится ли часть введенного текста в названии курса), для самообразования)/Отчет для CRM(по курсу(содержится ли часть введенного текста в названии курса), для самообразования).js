arr1 = XQuery ("for $elem in learnings where contains($elem/course_name,'"+{PARAM3}+"') and $elem/start_usage_date>= ('" +{PARAM1} + "') and  $elem/start_usage_date< ('" + {PARAM2} + "') return $elem");
arr2 = XQuery ("for $elem in active_learnings where contains($elem/course_name,'"+{PARAM3}+"') and $elem/start_usage_date>= ('" +{PARAM1} + "') and  $elem/start_usage_date< ('" + {PARAM2} + "') return $elem");
arr3 = ArrayUnion (arr1, arr2);
return arr3;