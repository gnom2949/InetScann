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
      console.error ("Warning, Server Returned non-JSON response!")
    }

    return await res.json();
  } catch (exc) {
    fetch('/api/api.php?action=log', {
      method: 'POST',
      body: JSON.stringify ({
        level: 'FAILURE',
        msg: 'Fetch execution failed!',
        ctx: { error: exc.message, action }
      })
    });
    
    return { error: "Access denied! Check you ownership, dumbass" };
  }
}

export async function TypeLog(level: string, msg: string, ctx: any = {}) 
{
  return await fetch (`/api/api.php?action=log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify ({ level, msg, ctx})
  });  
}