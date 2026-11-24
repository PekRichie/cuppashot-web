# CuppaShot – cuppashot.hu

Statikus weboldal (HTML + CSS + JS), build és szerver nélkül.

## Felépítés
```
index.html            – az oldal (Hero, Számok, Étlap, Projektek, Recept, Technológiák, Kapcsolat)
assets/css/style.css  – design (színek a :root változókban)
assets/js/main.js     – animációk (adathálózat, gépelő terminál, számlálók, menü)
assets/img/           – logó, csésze (átlátszó háttér), favicon, OG-kép
```

## Megnézni helyben
Elég megnyitni az `index.html`-t böngészőben.

## Feltöltés a Rackhostra (később)
1. Rackhost ügyfélkapu → tárhely → cPanel → Fájlkezelő (vagy FTP).
2. A mappa **tartalmát** (`index.html` + `assets/`) a `public_html` könyvtárba kell feltölteni.
3. cPanel → SSL/TLS (AutoSSL / Let's Encrypt) → ingyenes HTTPS-tanúsítvány a cuppashot.hu-ra.
4. Ha a domain és a tárhely ugyanott van, a DNS magától beáll (új domainnél ez néhány óra is lehet).

## Teendők a következő körre
- Szövegek véglegesítése (az önéletrajz alapján készült vázlat).
- A Google Fonts betűtípusok saját tárhelyre költöztetése (GDPR).
- `.htaccess`: átirányítás HTTPS-re, gyorsítótárazás.
- Adatvédelmi tájékoztató / impresszum, ha lesz kapcsolati űrlap vagy analitika.
