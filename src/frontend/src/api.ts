//api.ts \\ основная API обертка для удобных query в TypeScript

const API_WRAP = '/api/api.php';

export async function api (action: string, params: Record<string, string> = {}) 
{
  const query = new URLSearchParams ({ action, ...params });
  const url = `${API_WRAP}?${query.toString()}`;

  try {
    const res = await fetch (url);
    const ct = res.headers.get ("Content-Type") || "";

    if (!ct.includes ("application/json")) {
      return { error: "Server returned non-JSON Response!" };
      await TypeLog ("WARNING", "Non-JSON Response!", { url });
    }

    return await res.json();
  } catch (exc) {
    await TypeLog ("FAILURE", "Fetch Failed!", {
      action, 
      error: exc?.message || String (exc)
    });
    return { error: "Access denied! Check you ownership, dumbass" };
  }
}

export async function TypeLog(level: string, msg: string, ctx: Record<string, any> = {}) 
{
  try {
    await fetch (`${API_WRAP}?action=log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify ({ level, msg, ctx })
    });
  } catch (e) {
    console.error ("WARNING", "LOGGING CATCHED ERROR", e);
  }
}