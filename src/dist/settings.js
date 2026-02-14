// frontend/src/api.ts
var API_WRAP = "/api/api.php";
async function api(action, params = {}) {
  const query = new URLSearchParams({ action, ...params });
  const url = `${API_WRAP}?${query.toString()}`;
  try {
    const res = await fetch(url);
    const ct = res.headers.get("Content-Type") || "";
    if (!ct.includes("application/json")) {
      await TypeLog("WARNING", "Non-JSON Response!", { url });
      return { error: "Server returned non-JSON Response!" };
    }
    return await res.json();
  } catch (exc) {
    await TypeLog("FAILURE", "Fetch Failed!", {
      action,
      error: exc instanceof Error ? exc.message : String(exc)
    });
    return { error: "Access denied! Check you ownership, dumbass" };
  }
}
async function TypeLog(level, msg, ctx = {}) {
  try {
    await fetch(`${API_WRAP}?action=log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, msg, ctx })
    });
  } catch (e) {
    console.error("WARNING", "LOGGING CATCHED ERROR", e);
  }
}

// frontend/src/settings.ts
function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  const sw = document.getElementById("theme-switch");
  if (sw) {
    if (isDark)
      sw.classList.add("active");
    else
      sw.classList.remove("active");
  }
  TypeLog("info", `Theme changed to: ${isDark ? "dark" : "light"}`);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}
function loadTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.documentElement.dataset.theme = "dark";
    document.getElementById("theme-switch")?.classList.add("active");
  } else {
    document.documentElement.dataset.theme = "light";
    document.getElementById("theme-switch")?.classList.remove("active");
  }
}
function initSettings() {
  loadTheme();
  const sw = document.getElementById("theme-switch");
  if (sw) {
    sw.addEventListener("click", () => {
      const isDark = document.documentElement.dataset.theme !== "dark";
      applyTheme(isDark);
    });
  }
  const closeBtn = document.getElementById("settings-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("settings")?.classList.remove("active");
      TypeLog("info", "Settings closed");
    });
  }
  const openBtn = document.getElementById("settings-btn");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      document.getElementById("settings")?.classList.add("active");
      TypeLog("info", "Settings opened");
    });
  }
}
export {
  loadTheme,
  initSettings,
  applyTheme
};
