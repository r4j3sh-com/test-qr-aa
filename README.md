# Aadhaar QR Scanner — v1 (online)

A working mobile app that scans an Aadhaar **Secure QR** (or old XML QR) and displays the
cardholder's demographic data. Runs fully in the browser; nothing is uploaded.

Files: `index.html` (the whole app), `manifest.json` (for installable/APK build).

## Test it in 2 minutes (no build needed)
The camera needs HTTPS, so serve it over a link:

1. Put `index.html` + `manifest.json` in any folder.
2. Deploy for free — easiest options:
   - Drag the folder onto **https://app.netlify.com/drop**, or
   - Push to GitHub and enable **GitHub Pages**, or
   - Run locally with HTTPS: `npx serve` then open the LAN URL on your phone (some phones need real HTTPS).
3. Open the HTTPS link on your phone → **Start camera** → point at the QR.

On Android Chrome you can also tap the menu → **Add to Home screen** to get an app icon
that opens full-screen (a PWA — behaves like an installed app).

## Turn it into a real .apk

### Option A — PWABuilder (easiest, no Android SDK) ✅ recommended
1. Deploy the app to an HTTPS URL (step above).
2. Go to **https://www.pwabuilder.com**, paste your URL.
3. Click **Package for stores → Android → Download**.
4. You get a signed **.apk / .aab** you can install (`adb install app.apk`) or upload to Play.

### Option B — Cordova (build locally)
Requires Node, Java JDK 17, and Android SDK / Android Studio installed on your machine.
```bash
npm install -g cordova
cordova create aadhaarapp com.example.aadhaar "Aadhaar Scanner"
cd aadhaarapp
# replace www/ contents with index.html + manifest.json from here
cordova platform add android
cordova plugin add cordova-plugin-camera
cordova build android          # -> platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### Option C — Capacitor (if you later add a JS framework)
```bash
npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/camera
npx cap init "Aadhaar Scanner" com.example.aadhaar --web-dir=.
npx cap add android
npx cap open android            # build the APK from Android Studio
```

## What v1 does / doesn't do
- ✅ Scans Secure QR + old XML QR, shows name, DOB, gender, full address, last-4 of Aadhaar.
- ✅ Extracts the embedded photo (JPEG shows inline; older JPEG2000 offered as download —
  rendering JP2 needs an extra decoder, planned for v2).
- ⏳ **Signature verification against UIDAI's certificate = the offline v2 step.** v1 only
  *reads* the QR; it does not yet cryptographically prove the card is genuine.

## Compliance
Only scan a card with the holder's consent. Don't store the demographic data beyond your
KYC purpose. Signature verification (v2) is what makes it a true *verification* tool.
