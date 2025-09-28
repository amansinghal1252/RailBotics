export interface Train {
  id: string;
  name: string;
  type: 'Express' | 'Local' | 'Freight' | 'Special';
  priority: 'High' | 'Medium' | 'Low';
  origin: string;
  destination: string;
  scheduledArrival: string;
  actualArrival: string;
  scheduledDeparture: string;
  actualDeparture: string;
  delay: number;
  status: 'On Time' | 'Delayed' | 'Cancelled' | 'Diverted';
  platform: string;
  coaches: number;
  passengers: number;
  position: number;
  speed: number;
  nextStation: string;
}

export interface Conflict {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  trainA: string;
  trainB: string;
  platform?: string;
  signal?: string;
  track?: string;
  block?: string;
  time: string;
  description: string;
  recommendation: {
    action: string;
    details: string;
    estimatedDelay: number;
    alternativePlatform?: string;
    alternativeRoute?: string;
  };
  status: 'Pending' | 'Resolved' | 'Overridden';
  timestamp: string;

  // FIXED PROPERTIES
  overrideReason?: string; // Should be an optional string
  resolvedAt?: string;     // Should be an optional string (to store the ISO date)
}

export interface AuditLog {
  id: string;
  timestamp: string;
  controller: string;
  action: string;
  trainId: string;
  suggestion: string;
  actionTaken: string;
  overrideReason: string | null;
  impact: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  section: string;
}

export type Theme = 'light' | 'dark' | 'high-contrast';

export interface KPIData {
  punctuality: number;
  averageDelay: number;
  throughput: number;
  utilization: number;
  delaysByType: Array<{ type: string; delay: number }>;
  punctualityTrend: Array<{ time: string; value: number }>;
}