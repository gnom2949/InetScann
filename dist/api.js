// src/frontend/src/api.ts
var API_WRAP = "/api/api.php";
async function api(action, params = {}) {
  const query = new URLSearchParams({ action, ...params });
  const url = `${API_WRAP}?${query.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      await TypeLog("FAILURE", `HTTP Error ${res.status}`, { action, errData });
      throw new Error(errData.error || `Server error: ${res.status}`);
    }
    const ct = res.headers.get("Content-Type") || "";
    if (!ct.includes("application/json")) {
      await TypeLog("WARNING", "Server returned non-JSON response!", { url });
      return { error: "Server returned non-JSON response!" };
    }
    return await res.json();
  } catch (exc) {
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
export {
  api,
  TypeLog
};
