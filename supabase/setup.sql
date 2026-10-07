-- ══════════════════════════════════════════════
-- Babil Şehri — Supabase kurulumu
-- Supabase panelinde SQL Editor'a yapıştırıp bir kez çalıştır. Tekrar çalıştırmak güvenlidir.
-- Oyun bu betik çalıştırılmadan da açılır; ama haftalık sıralama ve
-- arkadaşların çevrimiçi durumu bu sütunlar olmadan kapalı kalır.
-- ══════════════════════════════════════════════

-- 1) Ek sütunlar: çevrimiçi durumu, avatar, haftalık sıralama
alter table users       add column if not exists last_seen  timestamptz;
alter table users       add column if not exists avatar     text;
alter table leaderboard add column if not exists week_key   text;           -- ör. '2026-W41' (ISO hafta)
alter table leaderboard add column if not exists week_stars int not null default 0;

-- 2) Tekillik: aynı kullanıcı adı / aynı bölüm satırı iki kez oluşmasın
create unique index if not exists users_username_lower_uq on users (lower(username));
create unique index if not exists game_progress_uq        on game_progress (user_id, building_index, level_index);
create unique index if not exists leaderboard_user_uq     on leaderboard (user_id);
create unique index if not exists friends_pair_uq         on friends (user_id, friend_id);
create unique index if not exists inventory_uq            on inventory (user_id, item_id);

-- 3) Sıralama sorguları için indeksler
create index if not exists leaderboard_stars_idx on leaderboard (total_stars desc, total_score desc);
create index if not exists leaderboard_week_idx  on leaderboard (week_key, week_stars desc);
create index if not exists friends_friend_idx    on friends (friend_id);

-- 4) Erişim: oyun kendi giriş sistemini kullandığı için tüm istekler "anon" rolüyle gelir.
--    DİKKAT: Bu kurallar publishable key'e sahip herkese (sayfanın kaynağında görünür)
--    tüm tablolarda okuma/yazma izni verir. Hile ve veri koruması gerekiyorsa
--    Supabase Auth + auth.uid() tabanlı kurallara geçilmelidir.
do $$
declare t text;
begin
  foreach t in array array['users','game_progress','leaderboard','friends','inventory'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists babil_anon_all on %I', t);
    execute format('create policy babil_anon_all on %I for all to anon using (true) with check (true)', t);
    execute format('grant select, insert, update, delete on %I to anon', t);
  end loop;
end $$;
