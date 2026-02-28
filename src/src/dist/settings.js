// frontend/src/api.ts
var API_WRAP = "/api/api.php";
async function api(action, params = {}) {
  const controller = new AbortController;
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  const query = new URLSearchParams({ action, ...params });
  const url = `${API_WRAP}?${query.toString()}`;
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error(`FAILURE. HTTP Error ${res.status}`);
      await TypeLog("FAILURE", `HTTP Error ${res.status}`, { action, errData });
      throw new Error(errData.error || `Server error: ${res.status}`);
    }
    const ct = res.headers.get("Content-Type") || "";
    if (!ct.includes("application/json")) {
      await TypeLog("WARNING", "Server returned non-JSON response!", { url });
      console.error("Non JSON Response!");
      return { error: "Server returned non-JSON response!" };
    }
    return await res.json();
  } catch (exc) {
    if (exc.name === "AbortError") {
      await TypeLog("FAILURE", "SCAN TIMEOUT", { action });
      return { error: "Scanner took too long, aborted." };
    }
    await TypeLog("FAILURE", "Fetch Failed!", {
      action,
      error: exc instanceof Error ? exc.message : String(exc)
    });
    return { error: exc instanceof Error ? exc.message : "Access denied! Check you ownership, dumbass" };
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
async function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  const sw = document.getElementById("theme-switch");
  if (sw) {
    if (isDark)
      sw.classList.add("active");
    else
      sw.classList.remove("active");
  }
  await TypeLog("info", `Theme changed to: ${isDark ? "dark" : "light"}`);
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
async function initSettings() {
  loadTheme();
  const sw = document.getElementById("theme-switch");
  if (sw) {
    sw.addEventListener("click", async () => {
      const isDark = document.documentElement.dataset.theme !== "dark";
      await applyTheme(isDark);
    });
  }
  const closeBtn = document.getElementById("settings-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", async () => {
      document.getElementById("settings")?.classList.remove("active");
      await TypeLog("info", "Settings closed");
    });
  }
  const openBtn = document.getElementById("settings-btn");
  if (openBtn) {
    openBtn.addEventListener("click", async () => {
      document.getElementById("settings")?.classList.add("active");
      await TypeLog("info", "Settings opened");
    });
  }
}
export {
  loadTheme,
  initSettings,
  applyTheme
};
