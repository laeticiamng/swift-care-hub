export type ZoneKey = 'sau' | 'uhcd' | 'dechocage';

export interface ZoneConfig {
  key: ZoneKey;
  label: string;
  boxCount: number;
  color: string;
  bgColor: string;
}

export const ZONE_CONFIGS: ZoneConfig[] = [
  { key: 'sau', label: 'SAU', boxCount: 17, color: 'bg-medical-info', bgColor: 'bg-medical-info/5' },
  { key: 'uhcd', label: 'UHCD', boxCount: 8, color: 'bg-medical-warning', bgColor: 'bg-medical-warning/5' },
  { key: 'dechocage', label: 'Déchocage', boxCount: 5, color: 'bg-medical-critical', bgColor: 'bg-medical-critical/5' },
];

export function getZoneConfig(zone: ZoneKey): ZoneConfig {
  return ZONE_CONFIGS.find(z => z.key === zone)!;
}
