export function initMainPage() {
  document.querySelectorAll('.menu-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-page');
      showPage(target!);
    });
  });
}

function showPage(pageId: string) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`${pageId}-page`)?.classList.add('active');
}