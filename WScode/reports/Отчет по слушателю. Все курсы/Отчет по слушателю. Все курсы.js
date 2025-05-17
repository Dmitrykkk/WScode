sql = "sql: select 
	ass.name name, person_fullname person_fullname, max(start_usage_date) start_usage_date, max(last_usage_date) last_usage_date, max(score) score, 
    state_id = CASE max(state_id)
          when 0 then 'Назначен' 
          when 1 then 'В процессе' 
          when 2 then 'Завершён'
          when 3 then 'Не пройден'
          when 4 then 'Пройден'
          when 5 then 'Просмотрен'
        end,
         max(asss.data.value('(course/mastery_score)[1]', 'varchar(100)')) max_score,
max(al.data.value('(active_learning/parts/part[name=\"Итоговый тест\"])[1]/score[1]', 'varchar(100)')) as test_score,
concat(CONVERT(VARCHAR(15), CAST(REPLACE(w.start_learning_date, 12, 12) AS DATETIME2), 104), '') as date_start,
concat(CONVERT(VARCHAR(15), CAST(REPLACE(w.max_end_date, 12, 12) AS DATETIME2), 104), '') as end_date
  
from 
	active_learnings w
left join group_collaborators gcs on collaborator_id = person_id
left join courses ass on ass.id = course_id	
left join course asss on asss.id = ass.id
left join active_learning  al on al.id = w.id
where w.person_id = " + {PARAM1} + " " + " 
group by person_fullname, ass.name, w.start_learning_date, w.max_end_date
union
select 
	ass.name name, person_fullname person_fullname, max(start_usage_date) start_usage_date, max(last_usage_date) last_usage_date, max(score) score, state_id = CASE max(state_id)
          when 0 then 'Назначен' 
          when 1 then 'В процессе' 
          when 2 then 'Завершён'
          when 3 then 'Не пройден'
          when 4 then 'Пройден'
          when 5 then 'Просмотрен'
        end, 
      max(asss.data.value('(course/mastery_score)[1]', 'varchar(100)')) max_score,
max(al.data.value('(learning/parts/part[name=\"Итоговый тест\"])[1]/score[1]', 'varchar(100)')) as test_score,
concat(CONVERT(VARCHAR(15), CAST(REPLACE(q.start_learning_date, 12, 12) AS DATETIME2), 104), '') as date_start,
concat(CONVERT(VARCHAR(15), CAST(REPLACE(q.max_end_date, 12, 12) AS DATETIME2), 104), '') as end_date
  
from 
	learnings q
left join group_collaborators gcs on collaborator_id = person_id
left join courses ass on ass.id = course_id	
left join course asss on asss.id = ass.id
left join learning  al on al.id = q.id
where q.person_id = " + {PARAM1} + " " + " 
group by person_fullname, ass.name, q.start_learning_date, q.max_end_date
";
alert(sql)
finisharr = XQuery(sql)


return finisharr;