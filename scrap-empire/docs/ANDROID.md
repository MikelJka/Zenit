# Android (Capacitor)

La web del juego se empaqueta tal cual con [Capacitor](https://capacitorjs.com/) (MIT, gratis).

- `capacitor.config.json`: identificador `studio.zenit.scrapempire` y nombre «Scrap Empire: Idle Factory». **El identificador (nombre del paquete) no se puede cambiar una vez publicado en Google Play**; Mikel lo confirma junto con la cuenta de desarrollador de Play, más adelante (2026-10-21).
- `CAPACITOR=1 npm run build` genera la web con rutas relativas (sin ello, la base es `/Zenit/scrap-empire/` para GitHub Pages).
- El proyecto `android/` no se sube al repositorio: el workflow «Android (APK de prueba)» lo genera (`npx cap add android`), compila `assembleDebug` y deja el APK como artefacto de la ejecución (Actions → Android → «scrap-empire-debug-apk»). Se lanza a mano o al subir una rama `sesion/*` que toque la configuración.
- En local: `npm run build:android` y abrir `android/` con Android Studio (tras `npx cap add android`).

## Falta

- Clave de firma (keystore) y AAB firmado para Google Play: la crea Mikel junto con su cuenta de desarrollador de Play (pago único de la tienda, no de herramientas). Se guardaría como secretos de GitHub y el workflow generaría `bundleRelease`.
- Icono adaptable y pantalla de inicio de Android (hay iconos en `public/press/`).
- Anuncios: **hechos con AdMob en modo de prueba** (2026-10-23, plugin `@capacitor-community/admob`, MIT). Los identificadores están en `src/data/ads.json` (los de prueba públicos de Google) y el flujo mete el `APPLICATION_ID` en el manifiesto de Android. Al arrancar la app se pregunta el consentimiento de la UE (Google UMP) y en Ajustes sale «Consentimiento de anuncios». **Para los reales, Mikel:** crea la app en AdMob (gratis), un bloque «Bonificado» y el mensaje de consentimiento RGPD en «Privacidad y mensajes»; se cambian `androidAppId` y `androidRewardedId` y se pone `testing: false`.
- Compra del pase (Play Billing): plugin aparte, otra tarea.
- Política de privacidad y clasificación por edades.
