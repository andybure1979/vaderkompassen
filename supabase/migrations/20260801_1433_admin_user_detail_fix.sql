-- Väderkompassen v14.3.3 – entydiga kolumnreferenser i admin_get_user_detail().
-- Kör efter 20260801_1430_admin_console.sql. Migrationen är idempotent.

create or replace function public.admin_get_user_detail(target_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare result jsonb;
begin
  if not public.is_current_user_admin() then raise exception 'Endast Admin'; end if;
  select jsonb_build_object(
    'account',jsonb_build_object('user_id',p.id,'email',coalesce(p.email,u.email),'display_name',p.display_name,'created_at',p.created_at,'last_sign_in_at',u.last_sign_in_at,'role',p.role,'account_status',p.account_status,'account_status_reason',p.account_status_reason),
    'subscription',(select to_jsonb(s)-'provider_payload'-'purchase_token_hash'-'provider_customer_id'-'provider_subscription_id' from public.subscriptions s where s.user_id=p.id order by s.updated_at desc limit 1),
    'entitlement',(select to_jsonb(e) from public.admin_entitlements e where e.user_id=p.id and e.revoked_at is null order by e.created_at desc limit 1),
    'trial_used',exists(select 1 from public.trial_entitlements t where t.user_id=p.id),
    'settings',jsonb_build_object('activity',p.app_settings->>'activity','regions',p.app_settings->'regions','settings_updated_at',p.settings_updated_at),
    'history',(select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc),'[]'::jsonb) from (select log.id,log.action,log.entity_type,log.reason,log.created_at from public.admin_audit_log log where log.target_user_id=p.id order by log.created_at desc limit 20)a),
    'notes',(select coalesce(jsonb_agg(to_jsonb(n) order by n.created_at desc),'[]'::jsonb) from (select note.id,note.note,note.created_by,note.created_at,note.updated_at from public.admin_user_notes note where note.user_id=p.id order by note.created_at desc limit 20)n)
  ) into result
  from public.profiles p
  join auth.users u on u.id=p.id
  where p.id=admin_get_user_detail.target_user_id;
  if result is null then raise exception 'Användaren saknas'; end if;
  return result;
end $$;

revoke all on function public.admin_get_user_detail(uuid) from public, anon;
grant execute on function public.admin_get_user_detail(uuid) to authenticated;
