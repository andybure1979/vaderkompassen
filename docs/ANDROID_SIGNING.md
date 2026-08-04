# Android signing och Play App Signing

Aktivera Google Play App Signing i Play Console. Google förvaltar app signing key; Andreas signerar uppladdningar med en separat upload key. Skapa nyckeln manuellt med Android Studio eller `keytool`, välj starka unika lösenord och säkerhetskopiera keystore krypterat på en separat plats.

Lägg aldrig keystore eller lösenord i repot. Lägg följande i användarens `~/.gradle/gradle.properties` utan citattecken:

```properties
VADERKOMPASSEN_UPLOAD_STORE_FILE=/absolut/lokal/sökväg/vaderkompassen-upload.jks
VADERKOMPASSEN_UPLOAD_STORE_PASSWORD=hemligt-värde
VADERKOMPASSEN_UPLOAD_KEY_ALIAS=upload
VADERKOMPASSEN_UPLOAD_KEY_PASSWORD=hemligt-värde
```

Samma namn kan sättas som tillfälliga miljövariabler. Äldre `VK_ANDROID_*` stöds för bakåtkompatibilitet. `verifyReleaseSigning` kräver samtliga värden och att filen finns innan signerad AAB byggs. Kontrollera certifikatets fingerprint lokalt och registrera upload certificate i Play Console. Låt aldrig service account-JSON, upload key eller signinglösenord hamna i CI-loggar eller Git.

Bygg med `npm run android:bundle:release`. Förvara backup av upload key separat. Om upload key förloras används Play Consoles process för reset av upload key; app signing key ska aldrig exporteras eller användas lokalt.
