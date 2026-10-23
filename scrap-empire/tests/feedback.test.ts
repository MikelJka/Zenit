import { describe, expect, it } from 'vitest';
import { FeedbackContext, feedbackBody, feedbackIssueUrl, feedbackTitle } from '../src/sim/feedback';

const ctx = (errors: string[] = []): FeedbackContext => ({
  at: '2026-10-23T17:00:00.000Z',
  url: 'https://mikeljka.github.io/Zenit/scrap-empire/',
  userAgent: 'Prueba',
  viewport: '390×844',
  lang: 'es',
  saveVersion: 1,
  playSeconds: 3725,
  dollars: 1234.7,
  totalEarned: 99999.9,
  zonesOpen: ['crusher', 'press'],
  hasPass: false,
  errors,
});

describe('botón 🐞', () => {
  it('el título lleva el tipo y la primera línea, recortada', () => {
    expect(feedbackTitle('bug', 'Se cuelga\nal abrir la zona')).toBe('[Fallo] Se cuelga');
    expect(feedbackTitle('request', '   ')).toBe('[Petición] Sin descripción');
    expect(feedbackTitle('bug', 'x'.repeat(100)).length).toBeLessThanOrEqual(8 + 70);
  });

  it('el cuerpo lleva el texto y los datos de la partida', () => {
    const body = feedbackBody('bug', 'No carga', ctx(['TypeError: a']));
    expect(body).toContain('No carga');
    expect(body).toContain('Tiempo jugado: 1 h 2 min');
    expect(body).toContain('Dinero: 1234 $ (ganado en total: 99999 $)');
    expect(body).toContain('Zonas abiertas (2): crusher, press');
    expect(body).toContain('TypeError: a');
  });

  it('el enlace abre una incidencia en Zenit con las etiquetas feedback y scrap-empire', () => {
    const url = new URL(feedbackIssueUrl('request', 'Más zonas', ctx()));
    expect(url.origin + url.pathname).toBe('https://github.com/MikelJka/Zenit/issues/new');
    expect(url.searchParams.get('labels')).toBe('feedback,scrap-empire');
    expect(url.searchParams.get('title')).toBe('[Petición] Más zonas');
  });

  it('con muchos errores o mucho texto el enlace no pasa del límite', () => {
    const many = Array.from({ length: 40 }, (_, i) => `Error ${i}: ${'z'.repeat(400)}`);
    expect(feedbackIssueUrl('bug', 'a', ctx(many)).length).toBeLessThanOrEqual(7000);
    expect(feedbackIssueUrl('bug', 'b'.repeat(9000), ctx()).length).toBeLessThanOrEqual(7000);
  });
});
