export interface Device {
  ipv4: string;
  mac: string;
  vendor?: string;
  name: string;
  status: 'known' | 'new' | 'unknown';
  type: 'pc' | 'phone' | 'router' | 'unknown';
}

export interface ScanProfile {
  id: number;
  name: string;
  network: string;
  active: boolean;
  profile_type: 'primary' | 'secondary';
}