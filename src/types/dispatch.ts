export type BreakerState = 'CLOSED' | 'OPEN' | 'TRIPPED';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type GridStatus = 'NORMAL' | 'ALERT' | 'EMERGENCY' | 'RESTORATION';

export interface OperatorProfile {
  id: string; // e.g. FX-OP-01
  name: string; // e.g. A. Muhammad Gandu
  role: 'Lead Despatch Engineer' | 'Duty System Operator' | 'Switchyard Tech' | 'Protection Engineer' | 'Control Room Operator';
  shift: 'Morning Shift (06:00 - 14:00)' | 'Afternoon Shift (14:00 - 22:00)' | 'Night Shift (22:00 - 06:00)';
  phone?: string;
  avatarColor: string;
  pin: string; // Confidential login PIN / passcode (e.g. '1234')
  badgeNumber?: string;
  lastLogin?: string;
}

export interface OperatorSession {
  sessionId: string;
  operatorId: string;
  operatorName: string;
  role: string;
  shift: string;
  loginTime: string;
  loginDate: string;
  logoutTime?: string;
  isActive: boolean;
}

export interface OperatorShiftHandoverReport {
  operatorId: string;
  operatorName: string;
  shift: string;
  date: string;
  startTime: string;
  endTime: string;
  totalLogsRecorded: number;
  totalBreakerOperations: number;
  totalAlarmsAcknowledged: number;
  totalOutagesManaged: number;
  avgSystemFrequencyHz: number;
  peakLoadMW: number;
  handoverRemarks: string;
}


export interface FeederLine {
  id: string;
  name: string; // e.g. Hadejia 11kV Feeder
  townName: string;
  substation: string;
  ratedVoltageKV: number; // 11
  actualVoltageKV: number;
  ratedCapacityMW: number;
  currentMW: number;
  reactiveMVAR: number;
  currentAmps: number;
  powerFactor: number;
  frequencyHz: number;
  breakerState: BreakerState;
  overloadThresholdPct: number;
  isCriticalCustomer: boolean;
  customersCount: number;
  protectionTripped: boolean;
  tripReason?: string;
  relayTarget?: 'Overcurrent 50/51' | 'Earth Fault 51N' | 'Under-Voltage 27' | 'Instantaneous 50' | 'Manual Shed';
}

export interface TransformerUnit {
  id: string;
  name: string;
  designation: string;
  ratingMVA: number;
  highKV: number;
  lowKV: number;
  oilTempC: number;
  windingTempC: number;
  ambientTempC: number;
  tapPosition: number; // e.g. 1 to 17
  tapMax: number;
  tapMin: number;
  loadPct: number;
  activeMW: number;
  reactiveMVAR: number;
  sf6GasPressureBar: number; // e.g. 6.2 bar
  coolingFansAuto: boolean;
  coolingFansRunning: boolean;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface ElectricalHourlyLog {
  id: string;
  timestamp: string;
  date: string;
  operatorId: string;
  operatorName: string;
  shift: string;
  // Substation Bus Voltages
  voltage132kV: number;
  voltage33kV: number;
  voltage11kVBusA: number;
  voltage11kVBusB: number;
  frequencyHz: number;
  ambientTempC: number;
  stationBatteryVoltDC: number; // e.g. 118.5 V DC
  sf6GasPressureBar: number; // e.g. 6.2 bar
  // Transformer temperatures
  t1OilTempC: number;
  t1WindingTempC: number;
  t2OilTempC: number;
  t2WindingTempC: number;
  // 8 Feeders readings (Current Amps & MW)
  feederReadings: {
    [feederName: string]: {
      currentAmps: number;
      mw: number;
      voltageKV: number;
      status: BreakerState;
    };
  };
  totalLoadMW: number;
  totalCurrentAmps: number;
  remarks: string;
}

export interface DispatchAlert {
  id: string;
  timestamp: string;
  equipmentId: string;
  equipmentName: string;
  severity: AlertSeverity;
  title: string;
  details: string;
  acknowledged: boolean;
  cleared: boolean;
  autoShedTriggered?: boolean;
}

export interface DispatchLogEntry {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  action: string;
  equipment: string;
  details: string;
  category: 'DISPATCH' | 'PROTECTION' | 'OUTAGE' | 'COMMUNICATION' | 'ALARM_ACK' | 'PARAM_CHANGE';
}

export interface SubstationMetrics {
  substationName: string;
  substationType: string; // 132/33/11kV
  incomingVoltage132kV: number;
  busVoltage33kV: number;
  busVoltage11kVA: number;
  busVoltage11kVB: number;
  frequencyHz: number;
  rocofHzPerSec: number;
  totalIncomingMW: number;
  totalFeederLoadMW: number;
  totalCapacityMW: number;
  totalReactiveMVAR: number;
  powerFactor: number;
  ambientTempC: number;
  stationBatteryVoltDC: number;
  gridStatus: GridStatus;
  outageCount: number;
  criticalAlertCount: number;
  activeOperator: OperatorProfile;
}
