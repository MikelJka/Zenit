// Punto de entrada: monta la pantalla principal. Las reglas viven en src/sim/.
import './style.css';
import { startApp } from './ui/app';

startApp(document.getElementById('app')!);

// Quita la pantalla de carga cuando la escena ya está dibujada.
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    const boot = document.getElementById('boot');
    if (!boot) return;
    boot.style.opacity = '0';
    setTimeout(() => boot.remove(), 450);
  }),
);
