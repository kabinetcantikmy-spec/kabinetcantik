-- KabinetCantik — Seed data (jalankan SELEPAS schema.sql)
-- Isi tetapan harga + kandungan contoh supaya laman tidak kosong semasa launch.

-- ---------- PRICING (memandu instant estimate awam) ----------
insert into public.settings (key, value) values
('pricing', '{
  "categories": [
    {"key":"dapur_bawah","name":"Kabinet Dapur (bawah)","unit":"kaki lari","economy":240,"standard":375,"premium":620},
    {"key":"dapur_atas","name":"Kabinet Dapur (atas)","unit":"kaki lari","economy":200,"standard":320,"premium":520},
    {"key":"wardrobe","name":"Wardrobe","unit":"kaki lari","economy":220,"standard":350,"premium":580},
    {"key":"tv","name":"TV Cabinet","unit":"kaki lari","economy":200,"standard":320,"premium":520},
    {"key":"panel","name":"Wall Panelling","unit":"kaki persegi","economy":60,"standard":110,"premium":180}
  ],
  "publicRangePct": 20,
  "depositSplit": [50,40,10],
  "sstEnabled": false,
  "sstRate": 6
}'::jsonb)
on conflict (key) do update set value = excluded.value;

-- ---------- PORTFOLIO contoh (terbit) ----------
insert into public.portfolio (slug, tajuk, kategori, gaya, cover_url, kawasan, bahan, keterangan, featured, diterbitkan) values
('dapur-moden-monokrom-damansara','Dapur Moden Monokrom','dapur', array['moden','minimalis'],
 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1200&q=80','Damansara',
 array['Laminat E0','Sintered stone','4G glass'],
 'Dapur moden dengan palet monokrom, island lapang dan storan tersembunyi. Difabrikasi khas dengan hardware Blum untuk penggunaan tahan lama.', true, true),
('walk-in-wardrobe-mewah-mont-kiara','Walk-in Wardrobe Mewah','wardrobe', array['luxury','moden'],
 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1200&q=80','Mont Kiara',
 array['Acrylic','LED profile'],
 'Walk-in wardrobe dengan pencahayaan LED, laci soft-close dan rak boleh laras untuk susun atur peribadi.', true, true),
('tv-cabinet-feature-wall-cheras','TV Cabinet & Feature Wall','tv', array['moden'],
 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80','Cheras',
 array['Fluted panel','Laminat'],
 'Feature wall dengan fluted panel dan storan tersembunyi — menjadikan ruang tamu pusat perhatian.', true, true)
on conflict (slug) do nothing;

-- ---------- BLOG contoh (terbit, SEO) ----------
insert into public.blog_posts (slug, tajuk, ringkasan, kandungan, cover_url, diterbitkan) values
('panduan-kos-kabinet-dapur-klang-valley','Panduan Kos Kabinet Dapur di Klang Valley',
 'Berapa bajet sebenar untuk kabinet dapur kustom? Kami pecahkan mengikut tier bahan & saiz dapur.',
 'Merancang dapur baru? Kos kabinet dapur di Klang Valley biasanya bergantung pada tiga faktor: saiz (kaki lari), tier bahan, dan hardware.

Sebagai panduan kasar, dapur sederhana (10–15 kaki) dengan laminat E0 berkualiti bermula sekitar RM10,000–RM18,000 termasuk pemasangan.

Untuk kemasan premium seperti acrylic atau sintered stone, bajet naik mengikut pilihan. Cara terbaik: dapatkan sebut harga percuma dan ukur tapak supaya harga tepat mengikut ruang anda.',
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', true),
('5-tip-wardrobe-walk-in','5 Tip Reka Wardrobe Walk-in Yang Kemas',
 'Dari pencahayaan hingga susun atur — tip praktikal untuk wardrobe impian.',
 'Wardrobe walk-in bukan sekadar ruang simpan — ia pengalaman harian. Berikut 5 tip:

1. Rancang zon (gantung, lipat, aksesori) sebelum reka.
2. Pencahayaan LED buat perbezaan besar.
3. Laci soft-close untuk ketahanan.
4. Cermin badan penuh menjimatkan ruang.
5. Pilih bahan tahan lembap untuk iklim Malaysia.',
 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1200&q=80', true)
on conflict (slug) do nothing;

-- ---------- ADMIN pertama (isi selepas cipta user di Supabase Auth) ----------
-- 1) Supabase Dashboard > Authentication > Users > Add user (emel + kata laluan)
-- 2) Salin UUID user, ganti di bawah, kemudian jalankan:
-- insert into public.profiles (id, nama, emel, role)
-- values ('<AUTH-USER-UUID>', 'Nama Owner', 'owner@email.com', 'admin')
-- on conflict (id) do update set role = 'admin';
