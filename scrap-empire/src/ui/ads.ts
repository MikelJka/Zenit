// Capa de anuncios y compras. En la web son «de mentira»: un aviso de 2 s en lugar del anuncio
// y una confirmación en lugar de Google Play. En Android (Capacitor) los anuncios van con AdMob
// (plugin @capacitor-community/admob, MIT), por ahora con los identificadores de prueba de Google,
// y antes de pedir anuncios se pregunta el consentimiento de la UE con Google UMP.
// La compra del Pase con Google Play Billing es otra tarea.
import { Capacitor } from '@capacitor/core';
import ADS from '../data/ads.json';
import { t } from './texts';

const FAKE_AD_MS = 2000;
const NOTICE_MS = 2000;

type AdMobModule = typeof import('@capacitor-community/admob');

let admob: Promise<AdMobModule | null> | null = null;
let privacyOptionsRequired = false;

/** Si el juego va empaquetado como app (Android) y no en el navegador. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/** Arranca AdMob y pregunta el consentimiento (UE) si hace falta. Solo en la app; en la web no hace nada. */
export function initAds(): Promise<void> {
  if (!isNativeApp()) return Promise.resolve();
  if (!admob) {
    admob = (async () => {
      try {
        const mod = await import('@capacitor-community/admob');
        await mod.AdMob.initialize({ initializeForTesting: ADS.testing });
        let info = await mod.AdMob.requestConsentInfo(
          ADS.testing ? { debugGeography: mod.AdmobConsentDebugGeography.EEA } : {},
        );
        if (info.isConsentFormAvailable && info.status === mod.AdmobConsentStatus.REQUIRED) {
          info = await mod.AdMob.showConsentForm();
        }
        privacyOptionsRequired = info.status !== mod.AdmobConsentStatus.NOT_REQUIRED;
        return mod;
      } catch (err) {
        console.warn('AdMob no arranca', err);
        return null;
      }
    })();
  }
  return admob.then(() => undefined);
}

/** Si hay que ofrecer en Ajustes cambiar el consentimiento de anuncios (solo en la app, en la UE). */
export function adPrivacyOptionsAvailable(): boolean {
  return privacyOptionsRequired;
}

/** Vuelve a enseñar el formulario de consentimiento de anuncios. */
export async function showAdPrivacyOptions(): Promise<void> {
  const mod = admob ? await admob : null;
  if (!mod) return;
  try {
    await mod.AdMob.showPrivacyOptionsForm();
  } catch (err) {
    console.warn('No se pudo abrir el consentimiento', err);
  }
}

function notice(text: string, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'ad-overlay';
    overlay.textContent = text;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      resolve();
    }, ms);
  });
}

async function showNativeRewardedAd(): Promise<boolean> {
  await initAds();
  const mod = admob ? await admob : null;
  if (!mod) {
    await notice(t('ad.unavailable'), NOTICE_MS);
    return false;
  }
  const { AdMob, RewardAdPluginEvents } = mod;
  let rewarded = false;
  let finish: (shown: boolean) => void = () => {};
  // Se espera a que el anuncio se cierre (o no se pueda enseñar): la promesa de «show» no siempre
  // se resuelve si el jugador lo cierra antes de tiempo.
  const closed = new Promise<boolean>((resolve) => (finish = resolve));
  const handles = await Promise.all([
    AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
      rewarded = true;
    }),
    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish(true)),
    AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish(false)),
  ]);
  let shown = false;
  try {
    await AdMob.prepareRewardVideoAd({ adId: ADS.androidRewardedId, isTesting: ADS.testing });
    AdMob.showRewardVideoAd().catch(() => finish(false));
    shown = await closed;
  } catch (err) {
    console.warn('Anuncio no disponible', err);
  }
  await Promise.all(handles.map((h) => h.remove()));
  if (!shown) {
    await notice(t('ad.unavailable'), NOTICE_MS);
    return false;
  }
  // El aviso de recompensa puede llegar justo después del de cierre.
  await new Promise((r) => setTimeout(r, 300));
  return rewarded;
}

/** Muestra un anuncio con recompensa. Devuelve si se ha visto entero. */
export async function showRewardedAd(): Promise<boolean> {
  if (isNativeApp()) return showNativeRewardedAd();
  await notice(t('ad.fake'), FAKE_AD_MS);
  return true;
}

/** Compra del Pase de chatarrero. Devuelve si se ha comprado. */
export function buyPass(priceEur: number): Promise<boolean> {
  return Promise.resolve(window.confirm(t('pass.fakeConfirm', { price: priceEur.toFixed(2).replace('.', ',') })));
}
