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

- Footer'dagi telefon raqami hali `+998 00 000 00 00` — o'zingiznikiga almashtiring.
- Kalkulyatordagi `MACHINE_PRICE` (160 000 000) va plyonka narxi (28 000) —
  haqiqiy raqamlaringizga moslang.

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

Maydondan chiqilganda qiymat tekshiriladi: bo'sh qolsa standart qiymat
qaytariladi, juda katta son `data-max` bilan cheklanadi.

```
Oylik hajm      = poddon/kun × 26 ish kuni

Plyonka         = (qo'lda g/poddon − 350 g) × oylik hajm ÷ 1000 × plyonka narxi
Vaqt            = 1 daqiqa × oylik hajm ÷ 60 × (4 500 000 ÷ (26 × 8))

Oylik tejash   = Plyonka + Vaqt
Yillik tejash  = Oylik × 12
Qoplash muddati= 160 000 000 ÷ Oylik
3 yillik foyda = Oylik × 36 − 160 000 000
```

Standart qiymatlarda (40 poddon/kun, 1100 g, 28 000 so'm/kg) natija:
**22 215 000 so'm/oy**, yiliga 266 580 000 so'm, uskuna **7 oyda** qoplanadi.

Farazlarni script boshidagi konstantalardan o'zgartiring:

```js
const MACHINE_FILM_G = 350;        // palletayzer bir poddonga sarflaydigan plyonka, g
const MIN_SAVED      = 1;          // bir poddonda tejaladigan vaqt, daqiqa
const WORK_DAYS      = 26;         // oyiga ish kunlari
const HOURS_PER_DAY  = 8;          // smena uzunligi, soat
const WORKER_SALARY  = 4500000;    // ishchining oylik xarajati, so'm
const MACHINE_PRICE  = 160000000;  // palletayzer narxi, so'm
```

Plyonka solishtiruvi (qizil «Qo'lda» va ko'k «Palletayzer bilan» chiziqlar)
shu raqamlardan avtomatik chiziladi — alohida sozlash kerak emas.

## O'zgartirish kerak bo'lgan joylar

- Footer'dagi telefon raqami: `+998 00 000 00 00` (2 joyda — `href` va matn).
- `MACHINE_PRICE` va `MACHINE_FILM_G` — o'z uskunangiz ko'rsatkichlariga moslang.
- Standart plyonka narxi `28 000` so'm/kg — bozor narxiga qarab yangilang.
