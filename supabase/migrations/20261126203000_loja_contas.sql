begin;

create table public.shop_cart (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null check (product_id ~ '^[A-Za-z0-9_-]{1,128}$'),
  option_id text not null default '' check (option_id ~ '^[A-Za-z0-9_-]{0,128}$'),
  quantity smallint not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  primary key (user_id, product_id, option_id)
);

create table public.shop_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null check (product_id ~ '^[A-Za-z0-9_-]{1,128}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.shop_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 60),
  recipient text not null check (char_length(btrim(recipient)) between 1 and 120),
  postal_code text not null check (postal_code ~ '^[0-9]{8}$'),
  street text not null check (char_length(btrim(street)) between 1 and 160),
  number text not null check (char_length(btrim(number)) between 1 and 32),
  complement text not null default '' check (char_length(complement) <= 100),
  district text not null check (char_length(btrim(district)) between 1 and 100),
  city text not null check (char_length(btrim(city)) between 1 and 100),
  state text not null check (state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index shop_one_default_address on public.shop_addresses (user_id) where is_default;
create unique index shop_unique_address on public.shop_addresses
  (user_id, postal_code, lower(btrim(street)), lower(btrim(number)), lower(btrim(complement)));

create table public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique check (char_length(btrim(reference)) between 1 and 60),
  status text not null check (status in ('pending','paid','preparing','packed','shipped','delivered','cancelled')),
  total_cents integer not null check (total_cents >= 0),
  tracking_code text check (char_length(tracking_code) <= 120),
  created_at timestamptz not null default now()
);

create index shop_order_history on public.shop_orders (user_id, created_at desc);

alter table public.shop_cart enable row level security;
alter table public.shop_favorites enable row level security;
alter table public.shop_addresses enable row level security;
alter table public.shop_orders enable row level security;

create policy shop_cart_owner on public.shop_cart for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy shop_favorites_owner on public.shop_favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy shop_addresses_owner on public.shop_addresses for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy shop_orders_owner on public.shop_orders for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.shop_cart, public.shop_favorites, public.shop_addresses, public.shop_orders from public, anon, authenticated;
grant select, insert, update, delete on public.shop_cart, public.shop_favorites, public.shop_addresses to authenticated;
grant select on public.shop_orders to authenticated;

create function public.shop_merge_cart(lines jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then
    raise insufficient_privilege;
  end if;
  if jsonb_typeof(lines) is distinct from 'array' or jsonb_array_length(lines) > 100 then
    raise invalid_parameter_value;
  end if;
  if exists (
    select from jsonb_to_recordset(lines) as entry(product_id text, option_id text, quantity smallint)
    where entry.quantity is null or entry.quantity not between 1 and 99
  ) then
    raise invalid_parameter_value;
  end if;

  insert into public.shop_cart (user_id, product_id, option_id, quantity)
  select owner_id, entry.product_id, coalesce(entry.option_id, ''), max(entry.quantity)
  from jsonb_to_recordset(lines) as entry(product_id text, option_id text, quantity smallint)
  group by entry.product_id, coalesce(entry.option_id, '')
  order by entry.product_id, coalesce(entry.option_id, '')
  on conflict (user_id, product_id, option_id) do update
  set quantity = greatest(shop_cart.quantity, excluded.quantity);
end;
$$;

create function public.shop_save_address(address jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  entry public.shop_addresses;
begin
  if owner_id is null then
    raise insufficient_privilege;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('shop_addresses:' || owner_id::text, 0));
  entry := jsonb_populate_record(null::public.shop_addresses, address);
  if entry.id is not null and not exists (
    select from public.shop_addresses where id = entry.id and user_id = owner_id
  ) then
    raise no_data_found;
  end if;

  if entry.is_default then
    update public.shop_addresses set is_default = false where user_id = owner_id and is_default;
  end if;
  if entry.id is null then
    insert into public.shop_addresses
      (user_id, label, recipient, postal_code, street, number, complement, district, city, state, is_default)
    values
      (owner_id, entry.label, entry.recipient, entry.postal_code, entry.street, entry.number, entry.complement,
       entry.district, entry.city, entry.state, entry.is_default)
    returning id into entry.id;
  else
    update public.shop_addresses
    set label = entry.label, recipient = entry.recipient, postal_code = entry.postal_code, street = entry.street,
        number = entry.number, complement = entry.complement, district = entry.district, city = entry.city,
        state = entry.state, is_default = entry.is_default
    where id = entry.id and user_id = owner_id;
  end if;

  if not exists (select from public.shop_addresses where user_id = owner_id and is_default) then
    update public.shop_addresses set is_default = true where id = (
      select id from public.shop_addresses where user_id = owner_id
      order by (id = entry.id), created_at, id limit 1
    );
  end if;
end;
$$;

create function public.shop_remove_address(address_id uuid) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  was_default boolean;
begin
  if owner_id is null then
    raise insufficient_privilege;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('shop_addresses:' || owner_id::text, 0));
  delete from public.shop_addresses where id = address_id and user_id = owner_id
    returning is_default into was_default;
  if not found then
    raise no_data_found;
  end if;
  if was_default then
    update public.shop_addresses set is_default = true where id = (
      select id from public.shop_addresses where user_id = owner_id order by created_at, id limit 1
    );
  end if;
end;
$$;

revoke all on function public.shop_merge_cart(jsonb), public.shop_save_address(jsonb), public.shop_remove_address(uuid)
  from public, anon, authenticated;
grant execute on function public.shop_merge_cart(jsonb), public.shop_save_address(jsonb), public.shop_remove_address(uuid)
  to authenticated;

commit;
