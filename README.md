# اسپرسو A1 — Espresso Web App

وب‌اپلیکیشن یادگیری ایتالیایی سطح A1 (هم‌راستا با ۱۰ درس Nuovo Espresso 1) با رابط فارسی، فلش‌کارت، آزمون، تلفظ و پشتیبانی آفلاین (PWA).

## 🌐 نمایش زنده (GitHub Pages)

اپلیکیشن به‌صورت دائمی روی GitHub Pages منتشر می‌شود:

**https://kasramoh030.github.io/Espresso-v.1.0.0/**

هر بار که تغییرات روی شاخه‌های `main` یا `arena/a4e2fada-espresso-v-1-0-0` push شود،
گردش کار `.github/workflows/deploy-pages.yml` سایت را به‌طور خودکار بازنشر می‌کند.

## ساختار

| مسیر | توضیح |
| --- | --- |
| `index.html` | پوستهٔ اصلی برنامه (RTL، فارسی) |
| `css/app.css` | سبک‌ها |
| `js/` | منطق برنامه (ui, app, spelling, community, ads, bazaar, native-tts, …) |
| `data/` | دادهٔ درس‌ها (lesson01–lesson10)، مرور، افعال و جملات |
| `fonts/` | فونت وزیرمتن (woff2) |
| `icons/` | آیکون‌های PWA |
| `manifest.webmanifest` | مانیفست PWA (نصب روی گوشی/دسکتاپ) |
| `sw.js` | سرویس‌ورکر برای کارکرد آفلاین |

## اجرای محلی

یک سرور ایستا کافی است:

```bash
python3 -m http.server 8000
# سپس http://localhost:8000 را باز کنید
```
