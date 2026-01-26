import { initMainPage } from './pages/main.js';
import { initConsolePage } from './pages/console.js';

// Инициализация всех страниц
document.addEventListener('DOMContentLoaded', () => {
  initMainPage();
  initConsolePage();

  // Обработка кнопок "Back"
  document.querySelectorAll('.back-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-page');
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(`${target}-page`)?.classList.add('active');
    });
  });
});