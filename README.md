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
