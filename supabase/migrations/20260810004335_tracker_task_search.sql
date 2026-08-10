drop function if exists public.search_tracker_tasks(text,text,text,boolean,boolean,text,date,date,integer);
create function public.search_tracker_tasks(
  search_text text default null,
  assigned_to_filter text default null,
  section_filter text default null,
  completed_filter boolean default null,
  followup_filter boolean default null,
  priority_filter text default null,
  due_before_filter date default null,
  due_after_filter date default null,
  result_limit integer default 20
)
returns table (
  id bigint,
  created_at timestamptz,
  number integer,
  title text,
  text text,
  completed boolean,
  followup boolean,
  notes jsonb,
  date_added text,
  assigned_to text,
  completed_by text,
  completion_notes text,
  section text,
  status text,
  owner text,
  due_date date,
  priority text,
  tags jsonb,
  updated_at timestamptz,
  rank real
)
language sql
stable
security invoker
set search_path = public
as $$
  with base as (
    select
      t.*,
      concat_ws(' ',
        coalesce(t.title,''), coalesce(t.text,''), coalesce(t.assigned_to,''),
        coalesce(t.section,''), coalesce(t.status,''), coalesce(t.owner,''),
        coalesce(t.priority,''), coalesce(t.notes::text,''), coalesce(t.tags::text,'')
      ) as doc
    from public.tasks t
    where (assigned_to_filter is null or lower(coalesce(t.assigned_to,'')) = lower(assigned_to_filter))
      and (section_filter is null or lower(coalesce(t.section,'')) = lower(section_filter))
      and (completed_filter is null or t.completed = completed_filter)
      and (followup_filter is null or t.followup = followup_filter)
      and (priority_filter is null or lower(coalesce(t.priority,'')) = lower(priority_filter))
      and (due_before_filter is null or t.due_date <= due_before_filter)
      and (due_after_filter is null or t.due_date >= due_after_filter)
  )
  select
    b.id,b.created_at,b.number,b.title,b.text,b.completed,b.followup,b.notes,b.date_added,b.assigned_to,
    b.completed_by,b.completion_notes,b.section,b.status,b.owner,b.due_date,b.priority,b.tags,b.updated_at,
    case
      when nullif(trim(search_text),'') is null then 0::real
      else greatest(
        ts_rank_cd(to_tsvector('simple', b.doc), websearch_to_tsquery('simple', search_text)),
        case when b.doc ilike '%' || search_text || '%' then 0.75 else 0 end
      )::real
    end as rank
  from base b
  where nullif(trim(search_text),'') is null
     or to_tsvector('simple', b.doc) @@ websearch_to_tsquery('simple', search_text)
     or b.doc ilike '%' || search_text || '%'
  order by
    case when nullif(trim(search_text),'') is null then 0 else 1 end desc,
    rank desc,
    coalesce(b.updated_at,b.created_at) desc
  limit greatest(1, least(coalesce(result_limit,20),100));
$$;