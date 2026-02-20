import { api } from "./api";

function riskClass(risk: string): string 
{
    switch (risk)
    {
        case "high": return "risk-badge risk-high";
        case "medium": return "risk-badge risk-medium";
        default: return "risk-badge risk-low";
    }
}

export async function spawnAuditPage(): Promise<string>
{
    const data = await api ("audit");

    const stats = data.stats;
    const devices = data.devices || [];
    const cves = data.cves || [];
}