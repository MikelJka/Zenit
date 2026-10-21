// Capa de anuncios y compras. En la web son «de mentira»: un aviso de 2 s en lugar del anuncio
// y una confirmación en lugar de Google Play. En Android se cambiará por AdMob y Google Play Billing.
import { t } from './texts';

const FAKE_AD_MS = 2000;

/** Muestra un anuncio con recompensa. Devuelve si se ha visto entero. */
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'ad-overlay';
    overlay.textContent = t('ad.fake');
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      resolve(true);
    }, FAKE_AD_MS);
  });
}

/** Compra del Pase de chatarrero. Devuelve si se ha comprado. */
export function buyPass(priceEur: number): Promise<boolean> {
  return Promise.resolve(window.confirm(t('pass.fakeConfirm', { price: priceEur.toFixed(2).replace('.', ',') })));
}
