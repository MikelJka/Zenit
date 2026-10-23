/**
 * Primeros pasos (propuesta D, aprobada por Mikel el 2026-10-22; el 2026-10-23 eligió que lo cuente
 * una voz por la radio y alargarlo con comida y agua, armas, investigación y defensa). Los pasos, sus
 * textos, cuándo cuentan como hechos (`check`) y a qué botón señala la flecha (`target`) están en
 * `tutorial.json`, junto con la narradora, la bienvenida y la despedida.
 */
import data from './tutorial.json';
import { BuildingCategory } from './buildings';

/** Cuándo cuenta un paso como hecho (basta con que se cumpla una de las condiciones puestas). */
export interface TutorialCheck {
  /** Hay alguna casilla designada con este trabajo (talar, minar o saquear). */
  designation?: string;
  /** Hay alguna zona de almacén. */
  storageZone?: boolean;
  /** Hay algún huerto. */
  growZone?: boolean;
  /** Hay alguna de estas construcciones (en plano o terminada). */
  buildings?: string[];
  /** Hay alguna construcción de esta categoría (en plano o terminada). */
  category?: BuildingCategory;
  /** Algún taller tiene encargado fabricar un arma. */
  weaponBill?: boolean;
  /** Se está investigando algo (o ya se ha terminado algún proyecto). */
  researching?: boolean;
  /** Algún colono está reclutado. */
  drafted?: boolean;
  /** Ningún colono está reclutado. */
  noneDrafted?: boolean;
}

/**
 * A qué señala la flecha: el botón de la barra, la orden o la construcción dentro de su hoja; o
 * (`element`) el primer elemento visible de `selectors`.
 */
export interface TutorialTarget {
  menu: 'orders' | 'build' | 'element';
  mode?: string;
  category?: BuildingCategory;
  build?: string;
  selectors?: string[];
}

export interface TutorialStep {
  id: string;
  title: string;
  text: string;
  check: TutorialCheck;
  /** Sin él no hay flecha (p. ej. cuando hay que tocar algo del mapa). */
  target?: TutorialTarget;
}

/** Quién lo cuenta y cómo saluda y se despide. */
export interface TutorialNarrator {
  name: string;
  station: string;
  /** Retrato que se dibuja junto a la tarjeta (de momento, la radio). */
  portrait: string;
}

export interface TutorialMessage {
  title: string;
  text: string;
}

export const TUTORIAL_STEPS: readonly TutorialStep[] = data.steps as TutorialStep[];
export const TUTORIAL_NARRATOR: TutorialNarrator = data.narrator;
export const TUTORIAL_INTRO: TutorialMessage = data.intro;
export const TUTORIAL_OUTRO: TutorialMessage = data.outro;
