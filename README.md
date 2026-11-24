# babil
mobil oyun

## Testler

```
npm install   # bir kez: test ortamı (jsdom)
npm test
```

`tests/` altındaki testler oyunu `index.html` ve tüm `js/` dosyalarıyla birlikte jsdom içinde (çevrimdışı) yükler:
eşleşme/güç taşları, giriş-kayıt, enerji, ilerleme ve kilitler, veri bütünlüğü, haritalar ve her medeniyetten
bölümleri baştan sona oynayan bir bot. Yeni bir JS dosyası eklendiğinde `index.html`'e `<script>` eklenmezse test uyarır.

## Yönetici paneli

`users.role = 'admin'` olan kullanıcı haritada sağ üstte **⚙ Yönetici** butonu görür:
kullanıcı listesi, banla/ban kaldır, liderliği sıfırla. Normal oyuncular butonu hiç görmez.

Kurulum:
1. `supabase/setup.sql` içindeki `role` / `banned` sütunlarını ekle (dosyayı SQL Editor'da çalıştır).
2. Kendini yönetici yap: `update users set role='admin' where lower(username)=lower('ADIN');`

> ⚠ **Güvenlik:** Bu panel yalnızca arayüz kapısıdır. Oyun herkese açık `anon` anahtarıyla
> bağlanır ve varsayılan RLS bu role tüm tablolarda yazma izni verir — yani ban/sıfırlama
> sorguları teknik olarak herkesçe çalıştırılabilir. Gerçek koruma için Supabase'de
> RLS politikaları (ya da SECURITY DEFINER bir RPC) gerekir. Obfuscation bunu değiştirmez.

## Kod gizleme (obfuscation)

```
npm run obfuscate              # dist/ : gizlenmiş js + index.html + css/music kopyası
BABIL_ROOT=dist npm test       # dağıtmadan önce: dist oyunun çalıştığını doğrula
npm run deploy:ghpages         # dist/ -> gh-pages dalı (sonra Pages kaynağını gh-pages yap)
```

- **Güvenlik değildir.** Yalnızca kaynağı okumayı zorlaştırır; geri çözülebilir, Supabase
  adresi/anon anahtarı ve tüm mantık yine görünür.
- `stringArray` bu oyunda kayıt/yükleme ve enerji mantığını bozduğu için **kapalı** (build-obfuscate.js'de açıklandı);
  bu yüzden gizleme hafiftir (yerel değişkenler gizli, string'ler okunur).
- Obfuscation çalışma hızını düşürür; mobilde test edilmeden canlıya alınması önerilmez.
- `dist/` git'e girmez (.gitignore); canlı site `main`'den yayınlanır.
