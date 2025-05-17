arr1 = XQuery ("for $elem in learnings 
where contains($elem/person_org_name, 'Выпускники') 
      and $elem/person_fullname != '' 
return $elem
");
arr2 = XQuery ("for $elem in active_learnings 
where contains($elem/person_org_name, 'Выпускники') 
      and $elem/person_fullname != '' 
return $elem
");
arr3 = ArrayUnion (arr1, arr2);


return arr3;