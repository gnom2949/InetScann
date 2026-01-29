function showPage(id: string) {
  document.querySelectorAll(".page, .panel").forEach(p => {
    (p as HTMLElement).style.display = "none";
  });
  const page = document.getElementById(id);
  if (page) page.style.display = "block";
}

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const view = card.getAttribute("data-view");
    if (view) showPage("page-" + view);
  });
});

document.querySelector(".settings-btn")?.addEventListener("click", () => {
  document.getElementById("settings")!.style.display = "flex";
});

document.getElementById("settings")?.addEventListener("click", (ev) => {
  if (ev.target === document.getElementById("settings")) {
    document.getElementById("settings")!.style.display = "none";
  }
});

// Показываем главную страницу при загрузке
showPage("page-main");
