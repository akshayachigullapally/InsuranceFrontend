export interface SessionResponse {
  id: number;
  deviceName: string;
  ipAddress: string;
  active: boolean;
  createdAt?: string;
  lastAccessedAt?: string;
}