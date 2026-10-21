// Aspecto de cada contenido, por id (colores y rasgos de dibujo). Solo apariencia: ninguna regla de juego.

export interface ZoneLook {
  wall: string;
  roof: string;
}

export const ZONE_LOOKS: Record<string, ZoneLook> = {
  crusher: { wall: '#c96a3b', roof: '#8a3f1f' },
  smelter: { wall: '#d98b2b', roof: '#9a5310' },
  sheet: { wall: '#6f8fa6', roof: '#41596b' },
  pipes: { wall: '#4f9a8a', roof: '#2d6156' },
  beams: { wall: '#8d7bb5', roof: '#57487d' },
  'engine-parts': { wall: '#b9584f', roof: '#7a2f29' },
  engines: { wall: '#5d7fc4', roof: '#334f8a' },
  cars: { wall: '#d4a72c', roof: '#8f6d12' },
  wagons: { wall: '#b5523b', roof: '#6e2c1d' },
  containers: { wall: '#2f8fa3', roof: '#1b5563' },
};

export type Accessory = 'hardhat' | 'goggles' | 'beard' | 'cap' | 'bandana' | 'spiky' | 'glasses' | 'helmet';

export interface HelperLook {
  skin: string;
  hair: string;
  accessory: Accessory;
  /** Color del casco, gorra o pañuelo. */
  gear: string;
}

export const HELPER_LOOKS: Record<string, HelperLook> = {
  tuerca: { skin: '#f2c28e', hair: '#c0392b', accessory: 'hardhat', gear: '#f4c430' },
  chispa: { skin: '#c68a5a', hair: '#2b2118', accessory: 'goggles', gear: '#3fa7a0' },
  yunque: { skin: '#e0a979', hair: '#6b3d1f', accessory: 'beard', gear: '#6b3d1f' },
  codo: { skin: '#f0c9a0', hair: '#5a3a22', accessory: 'cap', gear: '#2f6fb3' },
  grua: { skin: '#8d5a3b', hair: '#f1d36b', accessory: 'bandana', gear: '#d9443a' },
  piston: { skin: '#f5d0b0', hair: '#1f1f2e', accessory: 'spiky', gear: '#1f1f2e' },
  bujia: { skin: '#d8a27a', hair: '#7a4b2a', accessory: 'glasses', gear: '#ff8c2a' },
  vagon: { skin: '#e0b48c', hair: '#d9d9d9', accessory: 'cap', gear: '#3b4a6b' },
  ancla: { skin: '#b97a50', hair: '#1c1c1c', accessory: 'bandana', gear: '#2f8fa3' },
  turbo: { skin: '#b97a50', hair: '#222', accessory: 'helmet', gear: '#e63946' },
};
