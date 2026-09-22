export interface MeasurementStatusEntry {
  measurementType: string;
  measurementUnit?: string | null;
  latestValue?: number | null;
  observedAt?: string | null;
  source?: string | null;
  zoneCode?: string | null;
  zoneName?: string | null;
}

export interface MeasurementStatusResponse {
  entries: MeasurementStatusEntry[];
  generatedAt?: string;
}