import { ZoneKey } from './box-config';

export interface FloorBox {
  zone: ZoneKey;
  boxNumber: number;
  label: string;
  /** CSS grid column start / end */
  col: string;
  /** CSS grid row start / end */
  row: string;
}

/**
 * SAU boxes: 17 boxes arranged in a realistic ER layout
 * Rows 1-3: 5 boxes each (standard exam rooms)
 * Row 4: 2 larger boxes (trauma/procedure rooms)
 */
const SAU_BOXES: FloorBox[] = [
  // Row 1
  { zone: 'sau', boxNumber: 1, label: 'Box 1', col: '1 / 2', row: '1 / 2' },
  { zone: 'sau', boxNumber: 2, label: 'Box 2', col: '2 / 3', row: '1 / 2' },
  { zone: 'sau', boxNumber: 3, label: 'Box 3', col: '3 / 4', row: '1 / 2' },
  { zone: 'sau', boxNumber: 4, label: 'Box 4', col: '4 / 5', row: '1 / 2' },
  { zone: 'sau', boxNumber: 5, label: 'Box 5', col: '5 / 6', row: '1 / 2' },
  // Row 2
  { zone: 'sau', boxNumber: 6, label: 'Box 6', col: '1 / 2', row: '2 / 3' },
  { zone: 'sau', boxNumber: 7, label: 'Box 7', col: '2 / 3', row: '2 / 3' },
  { zone: 'sau', boxNumber: 8, label: 'Box 8', col: '3 / 4', row: '2 / 3' },
  { zone: 'sau', boxNumber: 9, label: 'Box 9', col: '4 / 5', row: '2 / 3' },
  { zone: 'sau', boxNumber: 10, label: 'Box 10', col: '5 / 6', row: '2 / 3' },
  // Row 3
  { zone: 'sau', boxNumber: 11, label: 'Box 11', col: '1 / 2', row: '3 / 4' },
  { zone: 'sau', boxNumber: 12, label: 'Box 12', col: '2 / 3', row: '3 / 4' },
  { zone: 'sau', boxNumber: 13, label: 'Box 13', col: '3 / 4', row: '3 / 4' },
  { zone: 'sau', boxNumber: 14, label: 'Box 14', col: '4 / 5', row: '3 / 4' },
  { zone: 'sau', boxNumber: 15, label: 'Box 15', col: '5 / 6', row: '3 / 4' },
  // Row 4: larger rooms
  { zone: 'sau', boxNumber: 16, label: 'Box 16', col: '1 / 3', row: '4 / 5' },
  { zone: 'sau', boxNumber: 17, label: 'Box 17', col: '3 / 5', row: '4 / 5' },
];

/**
 * UHCD: 8 beds in 2 rows of 4
 */
const UHCD_BOXES: FloorBox[] = [
  { zone: 'uhcd', boxNumber: 1, label: 'Lit 1', col: '1 / 2', row: '1 / 2' },
  { zone: 'uhcd', boxNumber: 2, label: 'Lit 2', col: '2 / 3', row: '1 / 2' },
  { zone: 'uhcd', boxNumber: 3, label: 'Lit 3', col: '3 / 4', row: '1 / 2' },
  { zone: 'uhcd', boxNumber: 4, label: 'Lit 4', col: '4 / 5', row: '1 / 2' },
  { zone: 'uhcd', boxNumber: 5, label: 'Lit 5', col: '1 / 2', row: '2 / 3' },
  { zone: 'uhcd', boxNumber: 6, label: 'Lit 6', col: '2 / 3', row: '2 / 3' },
  { zone: 'uhcd', boxNumber: 7, label: 'Lit 7', col: '3 / 4', row: '2 / 3' },
  { zone: 'uhcd', boxNumber: 8, label: 'Lit 8', col: '4 / 5', row: '2 / 3' },
];

/**
 * Déchocage: 5 boxes — 3 standard + 2 larger
 */
const DECHOCAGE_BOXES: FloorBox[] = [
  { zone: 'dechocage', boxNumber: 1, label: 'Déch 1', col: '1 / 2', row: '1 / 2' },
  { zone: 'dechocage', boxNumber: 2, label: 'Déch 2', col: '2 / 3', row: '1 / 2' },
  { zone: 'dechocage', boxNumber: 3, label: 'Déch 3', col: '3 / 4', row: '1 / 2' },
  { zone: 'dechocage', boxNumber: 4, label: 'Déch 4', col: '1 / 3', row: '2 / 3' },
  { zone: 'dechocage', boxNumber: 5, label: 'Déch 5', col: '3 / 5', row: '2 / 3' },
];

export const FLOOR_PLAN: Record<ZoneKey, FloorBox[]> = {
  sau: SAU_BOXES,
  uhcd: UHCD_BOXES,
  dechocage: DECHOCAGE_BOXES,
};

export const ZONE_GRID_TEMPLATES: Record<ZoneKey, { columns: string; rows: string }> = {
  sau: { columns: 'repeat(5, 1fr)', rows: 'repeat(4, 1fr)' },
  uhcd: { columns: 'repeat(4, 1fr)', rows: 'repeat(2, 1fr)' },
  dechocage: { columns: 'repeat(4, 1fr)', rows: 'repeat(2, 1fr)' },
};
