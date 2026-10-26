export type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi';
export type HazardType = 'KTA' | 'TTA';
export type HazardStatus = 'Open' | 'In Progress' | 'Closed';

export type MiningArea = 
  | 'Pit North / Front Loading'
  | 'Pit South / Front Loading'
  | 'Hauling Road'
  | 'Disposal Area'
  | 'ROM Stockpile'
  | 'Workshop / Plant'
  | 'Port / Jetty Pelabuhan'
  | 'Camp / Office Area'
  | 'Fuel Station';

export type HazardCategory =
  | 'Jalan Tambang, Tanggul, & Lereng'
  | 'Kelaikan Unit & Kendaraan Tambang'
  | 'Housekeeping & Kerapian 5S'
  | 'Kepatuhan Alat Pelindung Diri'
  | 'Tumpahan Oli, BBM, & Lingkungan'
  | 'Blind Spot, Debu, & Rambu Keselamatan'
  | 'Bahaya Kelistrikan & Panas';

export interface HazardReport {
  id: string;
  timestamp: string;
  reporterName: string;
  reporterNik: string;
  department: string;
  area: MiningArea;
  locationDetail: string;
  hazardType: HazardType;
  category: HazardCategory;
  riskLevel: RiskLevel;
  description: string;
  photoUrl: string;
  immediateAction?: string;
  status: HazardStatus;
  picPerbaikan?: string;
  closedDate?: string;
  syncedToSheets: boolean;
}
