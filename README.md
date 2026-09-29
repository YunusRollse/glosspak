# GlossPak — landing page

Bitta fayl: `index.html`. Hech qanday build kerak emas — istalgan hostingga
(Netlify, Vercel, cPanel, nginx) shundayligicha yuklash mumkin.

## Vercel'ga chiqarish

Loyiha statik: `index.html`, `img/` va bitta serverless funksiya `api/lead.js`.
Build kerak emas, framework tanlash ham shart emas.

```bash
cd /Users/yunusbekpulatov/glosspak-landing && npx vercel
```

Birinchi marta ishga tushganda savollar beradi:

| Savol | Javob |
|---|---|
| Set up and deploy? | `y` |
| Which scope? | o'z akkauntingiz |
| Link to existing project? | `n` |
| Project name? | `glosspak` |
| In which directory is your code? | `./` |
| Modify settings? | `n` |

Natijada sinov (preview) manzili chiqadi. Hammasi joyida bo'lsa, jangovar
manzilga chiqaring:

```bash
cd /Users/yunusbekpulatov/glosspak-landing && npx vercel --prod
```

## Telegramni ulash (Vercel'da)

`api/lead.js` bot tokenini **server tomondan** oladi, shuning uchun token
sahifa kodiga tushmaydi va uni hech kim ko'ra olmaydi.

1. Telegramda [@BotFather](https://t.me/BotFather) → `/newbot` → tokenni oling.
2. Botni arizalar tushadigan guruhga qo'shing.
3. Guruhga bitta xabar yozing, so'ng oching:
   `https://api.telegram.org/bot<TOKEN>/getUpdates` — javobdan `chat.id` ni oling
   (guruh id'lari `-100...` bilan boshlanadi).
4. Vercel'da loyihaning **Settings → Environment Variables** bo'limiga qo'shing:

   | Nomi | Qiymati |
   |---|---|
   | `BOT_TOKEN` | `123456789:AA...` |
   | `CHAT_ID` | `-1001234567890` |

5. **Redeploy** qiling — yangi o'zgaruvchilar shundan keyin kuchga kiradi.

Terminaldan ham qo'shsa bo'ladi:

```bash
cd /Users/yunusbekpulatov/glosspak-landing && npx vercel env add BOT_TOKEN production
```

### Mahalliy serverda

`python3 -m http.server` serverless funksiyalarni bilmaydi, shuning uchun
mahalliy sinovda forma "Yuborishda xatolik" beradi — bu normal.
Funksiya bilan birga sinash uchun:

```bash
cd /Users/yunusbekpulatov/glosspak-landing && npx vercel dev
```

## Chiqarishdan oldin tekshiring

- Kalkulyatordagi `MACHINE_PRICE` (160 000 000) va plyonka narxi (28 000) —
  haqiqiy raqamlaringizga moslang.

## Tezlik

Sahifa tashqi serverga **umuman murojaat qilmaydi** — hamma narsa o'zimizdan
keladi. Sekin mobil internetda eng ko'p vaqt aynan tashqi domenlarga
ulanishga ketadi, shuning uchun bu eng katta yutuq.

| Nima | Qanday |
|---|---|
| Shrift | Google Fonts o'rniga `fonts/inter-latin.woff2` (48 KB, bitta fayl, barcha qalinliklar) |
| Rasmlar | WebP, ko'rsatiladigan o'lchamga qirqilgan: 453 KB → 98 KB |
| Sferalar | 4 ta emas 3 ta, blur 90px → 60px, animatsiyada `scale` olib tashlandi |
| Panellar | `backdrop-filter` olib tashlandi — aylantirishda eng qimmat amal edi |
| Kesh | `vercel.json`: rasm va shrift bir yil keshlanadi |

Jami: **~181 KB**, tashqi so'rovlar — 0, layout siljishi (CLS) — 0.

### Rasm qo'shsangiz

Yangi suratni ham WebP ga o'tkazing va `<img>` ga `width`/`height` yozing —
bularsiz rasm yuklanganda sahifa sakraydi:

```bash
cd /Users/yunusbekpulatov/glosspak-landing && python3 -c "
from PIL import Image
im = Image.open('img/yangi.jpg')
im.thumbnail((900, 900))
im.save('img/yangi.webp', 'WEBP', quality=84, method=6)
print(im.size)"
```

### Shriftni yangilash

`fonts/inter-latin.woff2` — Google Fonts'ning `latin` poddasti. Sahifadagi
barcha belgilar shu poddastga kiradi (tekshirilgan), shuning uchun
`latin-ext` kerak emas. Shriftni almashtirsangiz, `@font-face` ichidagi
`unicode-range` ni ham yangilang.

## Rasmlar

`img/` papkasidagi fayllar:

| Fayl | Nima | Izoh |
|---|---|---|
| `logo-light.png` | sarlavhadagi logo | to'q fon uchun: yozuv oq, to'lqin qizil |
| `logo.png` | asl logo | oq fon uchun (hujjat, xat, bosma) |
| `palletayzer-1.png` | katta, keng surat | fon shaffof |
| `palletayzer-2.jpg` | chapdagi tik surat | plyonkani tortish uzeli |
| `palletayzer-3.jpg` | o'ngdagi tik surat | boshqaruv paneli |

Suratlar oq plastinka ustida turadi: aslida ular oq fonda olingani uchun
surat cheti ko'rinmaydi, natijada katalog kartasi effekti chiqadi.
`object-fit: contain` ishlatilgan — hech narsa kesilmaydi.

Suratni almashtirmoqchi bo'lsangiz, shu nomdagi faylni almashtirsangiz kifoya.
Fayl yo'q bo'lsa, o'rnida punktir ramka va fayl nomi ko'rinadi — sahifa buzilmaydi.
Izohlarni `<figcaption>` ichida o'zgartiring.

**Logoni yangilasangiz:** to'q fon uchun versiyani qo'lda tayyorlash shart emas —
asl logoni `img/logo.png` qilib qo'ying va to'q siyohni oqqa aylantiring
(qizil elementlar o'z rangida qoladi), natijani `img/logo-light.png` deb saqlang.

## Sahifa tartibi

1. Hero — sarlavha, tavsif, ikkita tugma
2. Kalkulyator — uchta maydon va natija
3. Lid forma — Telegramga ketadi
4. Uskuna fotolari

## Kalkulyator formulasi

Mijoz **uchta** maydonni qo'lda to'ldiradi — o'zi aniq biladigan raqamlarni:
kuniga nechta poddon o'raydi, hozir bitta poddonga qancha plyonka ketadi,
plyonkaning 1 kg narxi. Qolgani oldindan qo'yilgan.

Maydonlar **bo'sh boshlanadi**. Uchalasi to'ldirilmaguncha natija ham,
plyonka solishtiruvi ham ko'rinmaydi — o'rnida "Uchta maydonni to'ldiring"
degan yozuv turadi. Shunda mijoz faqat o'z raqamlariga asoslangan hisobni
ko'radi. Biror maydon tozalansa, kalkulyator yana kutish holatiga qaytadi.

Maydondan chiqilganda juda katta son `data-max` bilan cheklanadi.

```
Oylik hajm      = poddon/kun × 26 ish kuni

Tejalgan plyonka = qo'lda g/poddon × 55%          ← ULUSH, qat'iy gramm emas
Plyonka          = tejalgan g × oylik hajm ÷ 1000 × plyonka narxi
Vaqt             = 1 daqiqa × oylik hajm ÷ 60 × (4 500 000 ÷ (26 × 8))

Oylik tejash    = Plyonka + Vaqt
Yillik tejash   = Oylik × 12
Qoplash muddati = 160 000 000 ÷ Oylik
3 yillik foyda  = Oylik × 36 − 160 000 000
```

**Muhim.** Palletayzer qat'iy gramm sarflamaydi — u hozirgi sarfning bir
ULUSHINI tejaydi. Shuning uchun hisob har doim `FILM_SAVE_RATE` foizini oladi:
mijoz 800 g sarflasa ham, 1500 g sarflasa ham tejash 55% bo'lib qoladi, faqat
so'mdagi summa o'zgaradi. Bu haqiqatga mos va bo'rttirilgan va'da bermaydi.

Standart qiymatlarda (40 poddon/kun, 1100 g, 28 000 so'm/kg):
**17 992 600 so'm/oy**, yiliga 215 911 200 so'm, uskuna **9 oyda** qoplanadi.

Farazlarni script boshidagi konstantalardan o'zgartiring:

```js
const FILM_SAVE_RATE = 0.55;       // o'rtacha tejash ULUSHI (50-60% oralig'ining o'rtasi)
const MIN_SAVED      = 1;          // bir poddonda tejaladigan vaqt, daqiqa
const WORK_DAYS      = 26;         // oyiga ish kunlari
const HOURS_PER_DAY  = 8;          // smena uzunligi, soat
const WORKER_SALARY  = 4500000;    // ishchining oylik xarajati, so'm
const MACHINE_PRICE  = 160000000;  // palletayzer narxi, so'm
```

Plyonka solishtiruvi (qizil «Qo'lda» va ko'k «Palletayzer bilan» chiziqlar)
shu ulushdan avtomatik chiziladi: ko'k chiziq har doim qizilning 45% i.

## O'zgartirish kerak bo'lgan joylar

- Footer'dagi telefon raqami: `+998 00 000 00 00` (2 joyda — `href` va matn).
- `MACHINE_PRICE` — o'z narxingizga moslang.
- `FILM_SAVE_RATE` — hozir 0.55. Amaliyotda 50-60% bo'lsa, shu oraliqdan
  eng ehtiyotkor raqamni tanlagan ma'qul: mijoz keyin ko'proq tejasa xursand
  bo'ladi, kamroq tejasa — ishonch yo'qoladi.
- Standart plyonka narxi `28 000` so'm/kg — bozor narxiga qarab yangilang.
