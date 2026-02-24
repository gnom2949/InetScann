//api.ts \\ основная API обертка для удобных query в TypeScript

const API_WRAP = '/api/api.php';

export async function api<T = any>(action: string, params: Record<string, string> = {}): Promise<T> 
{
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  const query = new URLSearchParams ({ action, ...params });
  const url = `${API_WRAP}?${query.toString()}`;

  try {
    const res = await fetch (url, { signal: controller.signal });
    clearTimeout (timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error (`FAILURE. HTTP Error ${res.status}`);
      await TypeLog ("FAILURE", `HTTP Error ${res.status}`, { action, errData});

      throw new Error (errData.error || `Server error: ${res.status}`);
    }

    const ct = res.headers.get ("Content-Type") || "";
    if (!ct.includes ("application/json")) {
      await TypeLog ("WARNING", "Server returned non-JSON response!", { url });
      console.error ("Non JSON Response!");
      return { error: "Server returned non-JSON response!" } as T;
    }

    return await res.json() as T;
  } catch (exc: any) {
    if (exc.name === 'AbortError') {
      await TypeLog ("FAILURE", "SCAN TIMEOUT", { action });
      return { error: "Scanner took too long, aborted." } as T;
    }
    await TypeLog ("FAILURE", "Fetch Failed!", {
      action, 
      error: exc instanceof Error ? exc.message : String (exc)
    });
    return { error: exc instanceof Error ? exc.message : "Access denied! Check you ownership, dumbass" } as T;
  }
}

export async function TypeLog(level: string, msg: string, ctx: Record<string, any> = {}): Promise<void>  
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