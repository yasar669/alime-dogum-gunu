# Alime icin Dogum Gunu Kutlamasi

Alime'nin dogum gunu icin hazirlanmis, terminal gorunumlu bir kutlama sayfasi.
Saf HTML, CSS ve JavaScript ile yazildi; ek bir kutuphane kullanmaz.

## Nasil calisir

- Sayfa acilinca kisa bir "sistem acilis" yazisi gorunur ve `[ BIR DILEK TUT ]`
  dugmesi beklemeye baslar. Kutlama yazilari hemen akmaz.
- Dugmeye dokununca (ya da bir tusa basinca) kutlama sahne sahne yazilir.
- Her sahnenin sonunda `[ devam etmek icin dokun ]` cikar; dokununca bir
  sonraki sahne gelir. Boylece her bolum kendi hizinda okunur.
- Sahneler: dilek ve kutlama, anilar dizini, karar, dilek muhru, kapanis mesaji.

## Dosyalar

- `index.html` - sayfa iskeleti
- `stil.css`   - modern koyu tema (camgobegi + eflatun) ve duzen
- `kutlama.js` - sahne motoru, daktilo efekti, arka plan akisi

## Yerelde calistirma

Bu klasorde basit bir sunucu calistirip tarayicida acabilirsiniz:

    python3 -m http.server

Ardindan tarayicidan `http://localhost:8000` adresini acin.
