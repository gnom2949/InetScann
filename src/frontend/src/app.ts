// app.ts \\ файл который управляет страницами и основным UI
import { api, TypeLog } from "./api";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

/* Система страниц */
export function showPage (id: string)
{
    document.querySelectorAll (".page").forEach (p => p.classList.remove ("active"));

    const el = document.getElementById (id);
    if (el) el.classList.add ("active");
}

export function openSet ()
{
    document.getElementById ("settings")?.classList.add ("active");
}

export function closeSet()
{
    document.getElementById ("settings")?.classList.remove ("active");
}

/* Логика страниц */

export async function Pingify ()
{
    const ip = (document.getElementById ("ping-ip") as HTMLInputElement)?.value;
    const output = document.getElementById ("ping-output");

    if (!ip || !output) return;

    console.log (`INFO | Pinging device ${ ip }`);
    output.textContent = `Please wait, Pinging ${ ip }`;
    const res = await api ("ping", { ip });

    output.textContent = res.error
        ? `Some error was equired ${res.error}`
        : JSON.stringify (res, null, 2);
}

export async function macify() 
{
    console.log (`INFO`)
    const output = document.getElementById ("mac-output");
    if (!output) return;
    
    output.textContent = "Scanning MAC addresses...";

    const res = await api ("mac");

    output.textContent = res.error
        ? `Some error was equired ${res.error}`
        : JSON.stringify (res, null, 2);
}