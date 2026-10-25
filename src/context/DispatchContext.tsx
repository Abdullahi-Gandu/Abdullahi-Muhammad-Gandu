import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  FeederLine,
  TransformerUnit,
  DispatchAlert,
  DispatchLogEntry,
  SubstationMetrics,
  GridStatus,
  BreakerState,
  OperatorProfile,
  OperatorSession,
  ElectricalHourlyLog,
} from '../types/dispatch';
import { dispatchAudio } from '../utils/audioAlert';
import { dispatchNotifier } from '../utils/notifications';
import { smsDispatcher } from '../utils/smsNotifier';

interface DispatchContextType {
  // State
  metrics: SubstationMetrics;
  feeders: FeederLine[];
  transformers: TransformerUnit[];
  alerts: DispatchAlert[];
  logs: DispatchLogEntry[];
  hourlyLogs: ElectricalHourlyLog[];
  operators: OperatorProfile[];
  activeOperator: OperatorProfile;
  activeScenario: string;
  soundMuted: boolean;
  notificationPermission: NotificationPermission;

  smsRecipient: string;
  updateSmsRecipient: (phone: string) => void;
  isSmsModalOpen: boolean;
  openSmsModal: () => void;
  closeSmsModal: () => void;

  isOperatorModalOpen: boolean;
  openOperatorModal: () => void;
  closeOperatorModal: () => void;

  isStatusModalOpen: boolean;
  openStatusModal: () => void;
  closeStatusModal: () => void;
  sendSMSAlert: (title: string, body: string) => Promise<void>;

  // Operator Auth & Unique Login
  isLoggedIn: boolean;
  currentSession: OperatorSession | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginOperator: (id: string, pin: string) => { success: boolean; error?: string };
  logoutOperator: () => void;
  lockConsole: () => void;
  unlockConsole: (pin: string) => { success: boolean; error?: string };
  updateOperatorPin: (id: string, oldPin: string, newPin: string) => { success: boolean; error?: string };

  // Actions
  setActiveOperatorById: (id: string) => void;
  updateActiveOperator: (updated: Partial<OperatorProfile>) => void;
  updateOperator: (id: string, updated: Partial<OperatorProfile>) => void;
  deleteOperator: (id: string) => void;
  addOperator: (operator: OperatorProfile) => void;
  updateFeeder: (id: string, updated: Partial<FeederLine>) => void;
  toggleFeederBreaker: (feederId: string) => void;
  adjustTransformerTap: (txId: string, delta: number) => void;
  toggleCoolingFans: (txId: string) => void;
  emergencyShedFeeder: (feederId: string, reason?: string) => void;
  restoreAllFeeders: () => void;
  acknowledgeAlert: (alertId: string) => void;
  acknowledgeAllAlerts: () => void;
  clearResolvedAlerts: () => void;
  saveElectricalHourlyLog: (logData: Omit<ElectricalHourlyLog, 'id' | 'timestamp' | 'date'>) => void;
  deleteHourlyLog: (id: string) => void;
  addLogEntry: (
    category: DispatchLogEntry['category'],
    action: string,
    equipment: string,
    details: string
  ) => void;
  runScenario: (scenarioKey: 'normal' | 'hadejia-trip' | 'kafin-hausa-trip' | 'tx-overheat' | 'grid-low-freq' | 'irrigation-surge') => void;
  toggleSound: () => void;
  requestNotificationPermission: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  setIncomingVoltage: (kv: number) => void;
}

const DispatchContext = createContext<DispatchContextType | null>(null);

const DEFAULT_OPERATORS: OperatorProfile[] = [
  {
    id: 'FX-OP-01',
    name: 'A. Muhammad Gandu',
    role: 'Lead Despatch Engineer',
    shift: 'Morning Shift (06:00 - 14:00)',
    phone: '+234 803 123 4567',
    avatarColor: 'bg-sky-600',
    pin: '1234',
    badgeNumber: 'TCN-FX-7041',
    lastLogin: 'Today, 06:00 WAT',
  },
  {
    id: 'FX-OP-02',
    name: 'S. Ibrahim',
    role: 'Duty System Operator',
    shift: 'Afternoon Shift (14:00 - 22:00)',
    phone: '+234 802 987 6543',
    avatarColor: 'bg-emerald-600',
    pin: '2345',
    badgeNumber: 'TCN-FX-7082',
    lastLogin: 'Yesterday, 14:00 WAT',
  },
  {
    id: 'FX-OP-03',
    name: 'B. Haruna',
    role: 'Switchyard Tech',
    shift: 'Morning Shift (06:00 - 14:00)',
    phone: '+234 805 555 1212',
    avatarColor: 'bg-amber-600',
    pin: '3456',
    badgeNumber: 'TCN-FX-7103',
    lastLogin: 'Yesterday, 06:00 WAT',
  },
  {
    id: 'FX-OP-04',
    name: 'M. Abdullahi',
    role: 'Control Room Operator',
    shift: 'Night Shift (22:00 - 06:00)',
    phone: '+234 806 777 8899',
    avatarColor: 'bg-purple-600',
    pin: '4567',
    badgeNumber: 'TCN-FX-7158',
    lastLogin: '2 days ago, 22:00 WAT',
  },
];

// Exactly the 8 11kV receiving feeders requested by the user
const INITIAL_11KV_FEEDERS: FeederLine[] = [
  {
    id: 'FDR-11K-01',
    name: 'Hadejia 11kV Feeder',
    townName: 'Hadejia',
    substation: 'FutureX 132/33/11kV Substation',
    ratedVoltageKV: 11,
    actualVoltageKV: 11.15,
    ratedCapacityMW: 6.5,
    currentMW: 5.2,
    reactiveMVAR: 1.4,
    currentAmps: 284,
    powerFactor: 0.96,
    frequencyHz: 50.00,
    breakerState: 'CLOSED',
    overloadThresholdPct: 92,
    isCriticalCustomer: true,
    customersCount: 68000,
    protectionTripped: false,
  },
  {
    id: 'FDR-11K-02',
    name: 'Kafin Hausa 11kV Feeder',
    townName: 'Kafin Hausa',
    substation: 'FutureX 132/33/11kV Substation',
    ratedVoltageKV: 11,
    actualVoltageKV: 11.10,
    ratedCapacityMW: 5.5,
    currentMW: 4.1,
    reactiveMVAR: 1.1,
    currentAmps: 224,
    powerFactor: 0.96,
    frequencyHz: 50.00,
    breakerState: 'CLOSED',
    overloadThresholdPct: 90,
    isCriticalCustomer: false,
    customersCount: 42000,
    protectionTripped: false,
  },
  {
    id: 'FDR-11K-03',
    name: 'Auyo 11kV Feeder',
    townName: 'Auyo',
    substation: 'FutureX 132/33/11kV Substation',
    ratedVoltageKV: 11,
    actualVoltageKV: 11.12,
    ratedCapacityMW: 5.0,
    currentMW: 3.8,
    reactiveMVAR: 0.9,
    currentAmps: 208,
    powerFactor: 0.97,
    frequencyHz: 50.00,
    breakerState: 'CLOSED',
    overloadThresholdPct: 90,
    isCriticalCustomer: false,
    customersCount: 31000,
    protectionTripped: false,
  },
  {
    id: 'FDR-11K-04',
    name: 'Malam Madori 11kV Feeder',
    townName: 'Malam Madori',
    substation: 'FutureX 132/33/11kV Substation',
    ratedVoltageKV: 11,
    actualVoltageKV: 11.08,
    ratedCapacityMW: 5.5,
    currentMW: 4.4,
    reactiveMVAR: 1.2,
    currentAmps: 241,
    powerFactor: 0.96,
    frequencyHz: 50.00,
    breakerState: 'CLOSED',
    overloadThresholdPct: 90,
    isCriticalCustomer: false,
    customersCount: 45000,
    protectionTripped: false,
  },
  {
    id: 'FDR-11K-05',
    name: 'Guri 11kV Feeder',
    townName: 'Guri',
    substation: 'FutureX 132/33/11kV Substation',
    ratedVoltageKV: 11,
    actualVoltageKV: 11.05,
    ratedCapacityMW: 4.0,
    currentMW: 2.7,
    reactiveMVAR: 0.7,
    currentAmps: 148,
    powerFactor: 0.97,
    frequencyHz: 50.00,
    breakerState: 'CLOSED',
    overloadThresholdPct: 90,
    isCriticalCustomer: false,
    customersCount: 26000,
    protectionTripped: false,
  },
  {
    id: 'FDR-11K-06',
    name: 'Kirikasamma 11kV Feeder',
    townName: 'Kirikasamma',
    substation: 'FutureX 132/33/11kV Substation',
    ratedVoltageKV: 11,
    actualVoltageKV: 11.10,
    ratedCapacityMW: 4.5,
    currentMW: 3.1,
    reactiveMVAR: 0.8,
    currentAmps: 170,
    powerFactor: 0.96,
    frequencyHz: 50.00,
    breakerState: 'CLOSED',
    overloadThresholdPct: 90,
    isCriticalCustomer: false,
    customersCount: 29000,
    protectionTripped: false,
  },
  {
    id: 'FDR-11K-07',
    name: 'Kaugama 11kV Feeder',
    townName: 'Kaugama',
    substation: 'FutureX 132/33/11kV Substation',
    ratedVoltageKV: 11,
    actualVoltageKV: 11.14,
    ratedCapacityMW: 4.5,
    currentMW: 2.9,
    reactiveMVAR: 0.75,
    currentAmps: 159,
    powerFactor: 0.96,
    frequencyHz: 50.00,
    breakerState: 'CLOSED',
    overloadThresholdPct: 90,
    isCriticalCustomer: false,
    customersCount: 28000,
    protectionTripped: false,
  },
  {
    id: 'FDR-11K-08',
    name: 'Birniwa 11kV Feeder',
    townName: 'Birniwa',
    substation: 'FutureX 132/33/11kV Substation',
    ratedVoltageKV: 11,
    actualVoltageKV: 11.06,
    ratedCapacityMW: 4.5,
    currentMW: 3.2,
    reactiveMVAR: 0.85,
    currentAmps: 175,
    powerFactor: 0.96,
    frequencyHz: 50.00,
    breakerState: 'CLOSED',
    overloadThresholdPct: 90,
    isCriticalCustomer: false,
    customersCount: 33000,
    protectionTripped: false,
  },
];

// Transformers at FutureX Substation: 132/33kV Power Transformers & 33/11kV Injection Transformers
const INITIAL_TRANSFORMERS: TransformerUnit[] = [
  {
    id: 'TX-132-T1',
    name: 'Power Transformer T1A (60 MVA)',
    designation: '132/33kV Power Transformer',
    ratingMVA: 60,
    highKV: 132,
    lowKV: 33,
    oilTempC: 58.2,
    windingTempC: 66.4,
    ambientTempC: 34.2,
    tapPosition: 9,
    tapMax: 17,
    tapMin: 1,
    loadPct: 54,
    activeMW: 16.2,
    reactiveMVAR: 4.2,
    sf6GasPressureBar: 6.2,
    coolingFansAuto: true,
    coolingFansRunning: false,
    status: 'NORMAL',
  },
  {
    id: 'TX-132-T2',
    name: 'Power Transformer T2A (60 MVA)',
    designation: '132/33kV Power Transformer',
    ratingMVA: 60,
    highKV: 132,
    lowKV: 33,
    oilTempC: 55.6,
    windingTempC: 63.8,
    ambientTempC: 34.2,
    tapPosition: 9,
    tapMax: 17,
    tapMin: 1,
    loadPct: 45,
    activeMW: 13.2,
    reactiveMVAR: 3.6,
    sf6GasPressureBar: 6.3,
    coolingFansAuto: true,
    coolingFansRunning: false,
    status: 'NORMAL',
  },
  {
    id: 'TX-33-TR1',
    name: 'Injection Transformer TR-1 (15 MVA)',
    designation: '33/11kV Step-down to 11kV Bus A',
    ratingMVA: 15,
    highKV: 33,
    lowKV: 11,
    oilTempC: 54.0,
    windingTempC: 61.2,
    ambientTempC: 34.2,
    tapPosition: 5,
    tapMax: 9,
    tapMin: 1,
    loadPct: 76,
    activeMW: 15.6,
    reactiveMVAR: 4.1,
    sf6GasPressureBar: 6.1,
    coolingFansAuto: true,
    coolingFansRunning: true,
    status: 'NORMAL',
  },
  {
    id: 'TX-33-TR2',
    name: 'Injection Transformer TR-2 (15 MVA)',
    designation: '33/11kV Step-down to 11kV Bus B',
    ratingMVA: 15,
    highKV: 33,
    lowKV: 11,
    oilTempC: 52.8,
    windingTempC: 59.7,
    ambientTempC: 34.2,
    tapPosition: 5,
    tapMax: 9,
    tapMin: 1,
    loadPct: 69,
    activeMW: 13.8,
    reactiveMVAR: 3.7,
    sf6GasPressureBar: 6.2,
    coolingFansAuto: true,
    coolingFansRunning: true,
    status: 'NORMAL',
  },
];

export const DispatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Operators
  const [operators, setOperators] = useState<OperatorProfile[]>(() => {
    const saved = localStorage.getItem('futurex_operators');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((op: Partial<OperatorProfile>, idx: number) => ({
            ...DEFAULT_OPERATORS[idx % DEFAULT_OPERATORS.length],
            ...op,
            pin: op.pin || DEFAULT_OPERATORS[idx % DEFAULT_OPERATORS.length]?.pin || '1234',
            badgeNumber: op.badgeNumber || DEFAULT_OPERATORS[idx % DEFAULT_OPERATORS.length]?.badgeNumber || `TCN-FX-${7040 + idx * 30}`,
            lastLogin: op.lastLogin || 'Today, 06:00 WAT',
          }));
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_OPERATORS;
  });

  const [activeOperator, setActiveOperator] = useState<OperatorProfile>(() => {
    return operators[0] || DEFAULT_OPERATORS[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('futurex_is_logged_in');
    return saved !== null ? saved === 'true' : true;
  });

  const [currentSession, setCurrentSession] = useState<OperatorSession | null>(() => {
    const saved = localStorage.getItem('futurex_current_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const initialOp = DEFAULT_OPERATORS[0];
    return {
      sessionId: 'SES-001',
      operatorId: initialOp.id,
      operatorName: initialOp.name,
      role: initialOp.role,
      shift: initialOp.shift,
      loginTime: new Date().toLocaleTimeString([], { hour12: false }),
      loginDate: new Date().toLocaleDateString(),
      isActive: true,
    };
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  // State
  const [feeders, setFeeders] = useState<FeederLine[]>(INITIAL_11KV_FEEDERS);
  const [transformers, setTransformers] = useState<TransformerUnit[]>(INITIAL_TRANSFORMERS);
  const [alerts, setAlerts] = useState<DispatchAlert[]>([]);
  const [incomingVoltage132kV, setIncomingVoltage132kV] = useState<number>(132.4);
  const [activeScenario, setActiveScenario] = useState<string>('Normal Grid Operation');
  const [soundMuted, setSoundMuted] = useState<boolean>(dispatchAudio.getMuted());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    dispatchNotifier.getStatus().permission
  );
  const [smsRecipient, setSmsRecipient] = useState<string>(() => smsDispatcher.getRecipient());
  const [isSmsModalOpen, setIsSmsModalOpen] = useState<boolean>(false);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);

  const openSmsModal = useCallback(() => setIsSmsModalOpen(true), []);
  const closeSmsModal = useCallback(() => setIsSmsModalOpen(false), []);

  const openOperatorModal = useCallback(() => setIsOperatorModalOpen(true), []);
  const closeOperatorModal = useCallback(() => setIsOperatorModalOpen(false), []);

  const openStatusModal = useCallback(() => setIsStatusModalOpen(true), []);
  const closeStatusModal = useCallback(() => setIsStatusModalOpen(false), []);

  const updateSmsRecipient = useCallback((phone: string) => {
    const updated = smsDispatcher.setRecipient(phone);
    setSmsRecipient(updated);
    dispatchAudio.playAckChime();
  }, []);

  const sendSMSAlert = useCallback(async (title: string, body: string) => {
    await smsDispatcher.sendSMS({
      title,
      body,
      type: 'OUTAGE',
    });
  }, []);

  // Electrical parameter hourly logs
  const [hourlyLogs, setHourlyLogs] = useState<ElectricalHourlyLog[]>(() => {
    const saved = localStorage.getItem('futurex_electrical_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Seed initial historical log
    return [
      {
        id: 'LOG-HR-001',
        timestamp: '07:00:00',
        date: new Date().toLocaleDateString(),
        operatorId: 'FX-OP-01',
        operatorName: 'A. Muhammad Gandu',
        shift: 'Morning Shift (06:00 - 14:00)',
        voltage132kV: 132.4,
        voltage33kV: 33.2,
        voltage11kVBusA: 11.15,
        voltage11kVBusB: 11.12,
        frequencyHz: 50.02,
        ambientTempC: 33.8,
        stationBatteryVoltDC: 118.6,
        sf6GasPressureBar: 6.2,
        t1OilTempC: 58.2,
        t1WindingTempC: 66.4,
        t2OilTempC: 55.6,
        t2WindingTempC: 63.8,
        feederReadings: {
          'Hadejia 11kV Feeder': { currentAmps: 284, mw: 5.2, voltageKV: 11.15, status: 'CLOSED' },
          'Kafin Hausa 11kV Feeder': { currentAmps: 224, mw: 4.1, voltageKV: 11.10, status: 'CLOSED' },
          'Auyo 11kV Feeder': { currentAmps: 208, mw: 3.8, voltageKV: 11.12, status: 'CLOSED' },
          'Malam Madori 11kV Feeder': { currentAmps: 241, mw: 4.4, voltageKV: 11.08, status: 'CLOSED' },
          'Guri 11kV Feeder': { currentAmps: 148, mw: 2.7, voltageKV: 11.05, status: 'CLOSED' },
          'Kirikasamma 11kV Feeder': { currentAmps: 170, mw: 3.1, voltageKV: 11.10, status: 'CLOSED' },
          'Kaugama 11kV Feeder': { currentAmps: 159, mw: 2.9, voltageKV: 11.14, status: 'CLOSED' },
          'Birniwa 11kV Feeder': { currentAmps: 175, mw: 3.2, voltageKV: 11.06, status: 'CLOSED' },
        },
        totalLoadMW: 29.4,
        totalCurrentAmps: 1609,
        remarks: 'Normal morning load. All 8 receiving 11kV town feeders energized. Battery bank on float charge.',
      },
    ];
  });

  // Shift & Dispatch Logs
  const [logs, setLogs] = useState<DispatchLogEntry[]>([
    {
      id: 'LOG-001',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      operatorId: activeOperator.id,
      operatorName: activeOperator.name,
      action: 'Shift Handover Accepted',
      equipment: 'FutureX 132/33kV Control Room',
      details: 'Assumed duty as Lead Despatch Operator. All 8 11kV feeders in service. System frequency 50.00 Hz.',
      category: 'COMMUNICATION',
    },
  ]);

  const prevFrequencyRef = useRef<number>(50.00);
  const isContinuousSirenPlayingRef = useRef<boolean>(false);

  // Persistence helpers
  useEffect(() => {
    localStorage.setItem('futurex_operators', JSON.stringify(operators));
  }, [operators]);

  useEffect(() => {
    localStorage.setItem('futurex_electrical_logs', JSON.stringify(hourlyLogs));
  }, [hourlyLogs]);

  // Compute live substation metrics
  const totalFeederLoadMW = feeders
    .filter((f) => f.breakerState === 'CLOSED')
    .reduce((sum, f) => sum + f.currentMW, 0);

  const totalFeederMVAR = feeders
    .filter((f) => f.breakerState === 'CLOSED')
    .reduce((sum, f) => sum + f.reactiveMVAR, 0);

  const totalCapacityMW = feeders.reduce((sum, f) => sum + f.ratedCapacityMW, 0);

  const apparentPowerMVA = Math.sqrt(
    totalFeederLoadMW * totalFeederLoadMW + totalFeederMVAR * totalFeederMVAR
  );
  const powerFactor = apparentPowerMVA > 0 ? Number((totalFeederLoadMW / apparentPowerMVA).toFixed(3)) : 0.96;

  // Realistic frequency dynamics around 50.00 Hz
  const baseFreq = 50.00;
  const loadDeficitMW = totalFeederLoadMW - 29.4;
  const liveFreq = Number((baseFreq - loadDeficitMW * 0.008).toFixed(3));

  const busVoltage33kV = Number(((incomingVoltage132kV / 4.0) * (transformers[0].tapPosition / 9)).toFixed(2));
  const busVoltage11kVA = Number(((busVoltage33kV / 3.0) * (transformers[2].tapPosition / 5)).toFixed(2));
  const busVoltage11kVB = Number(((busVoltage33kV / 3.0) * (transformers[3].tapPosition / 5)).toFixed(2));

  const outageCount = feeders.filter(
    (f) => f.breakerState !== 'CLOSED' || f.protectionTripped
  ).length;

  const activeCriticalAlerts = alerts.filter(
    (a) => a.severity === 'CRITICAL' && !a.cleared
  ).length;

  let gridStatus: GridStatus = 'NORMAL';
  if (activeCriticalAlerts > 0 || outageCount > 0 || Math.abs(liveFreq - baseFreq) > 0.3) {
    gridStatus = activeCriticalAlerts > 1 || Math.abs(liveFreq - baseFreq) > 0.6 ? 'EMERGENCY' : 'ALERT';
  }

  const metrics: SubstationMetrics = {
    substationName: 'FutureX Substation',
    substationType: '132/33/11kV Transmission Substation',
    incomingVoltage132kV: Number(incomingVoltage132kV.toFixed(1)),
    busVoltage33kV,
    busVoltage11kVA,
    busVoltage11kVB,
    frequencyHz: liveFreq,
    rocofHzPerSec: Number(((liveFreq - prevFrequencyRef.current) / 2.0).toFixed(3)),
    totalIncomingMW: Number((totalFeederLoadMW + 0.6).toFixed(1)), // includes ~0.6MW transformer copper/iron losses
    totalFeederLoadMW: Number(totalFeederLoadMW.toFixed(1)),
    totalCapacityMW,
    totalReactiveMVAR: Number(totalFeederMVAR.toFixed(1)),
    powerFactor,
    ambientTempC: 34.2,
    stationBatteryVoltDC: 118.5,
    gridStatus,
    outageCount,
    criticalAlertCount: activeCriticalAlerts,
    activeOperator,
  };

  // Sound and siren control
  useEffect(() => {
    const unacknowledgedCritical = alerts.some(
      (a) => a.severity === 'CRITICAL' && !a.acknowledged && !a.cleared
    );
    if (unacknowledgedCritical && !soundMuted) {
      if (!isContinuousSirenPlayingRef.current) {
        dispatchAudio.startContinuousSiren();
        isContinuousSirenPlayingRef.current = true;
      }
    } else {
      if (isContinuousSirenPlayingRef.current) {
        dispatchAudio.stopContinuousSiren();
        isContinuousSirenPlayingRef.current = false;
      }
    }
  }, [alerts, soundMuted]);

  // Log dispatch entry
  const addLogEntry = useCallback(
    (
      category: DispatchLogEntry['category'],
      action: string,
      equipment: string,
      details: string
    ) => {
      const newEntry: DispatchLogEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleTimeString(),
        operatorId: activeOperator.id,
        operatorName: activeOperator.name,
        action,
        equipment,
        details,
        category,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 79)]);
    },
    [activeOperator]
  );

  // Trigger alert and automated push notification
  const triggerAlert = useCallback(
    (alert: Omit<DispatchAlert, 'id' | 'timestamp' | 'acknowledged' | 'cleared'>) => {
      const id = `ALT-${Date.now().toString().slice(-6)}`;
      const timestamp = new Date().toLocaleTimeString();
      const fullAlert: DispatchAlert = {
        ...alert,
        id,
        timestamp,
        acknowledged: false,
        cleared: false,
      };

      setAlerts((prev) => [fullAlert, ...prev]);

      if (alert.severity === 'CRITICAL') {
        dispatchAudio.playCriticalAlarmPulse();
        // Automated SMS text message to +2348067254663
        smsDispatcher.sendSMS({
          title: `CRITICAL ALERT: ${alert.title}`,
          body: `${alert.equipmentName}: ${alert.details}`,
          type: 'OUTAGE',
          equipment: alert.equipmentName,
        });
      } else if (alert.severity === 'WARNING') {
        dispatchAudio.playWarningChime();
      }

      // Automated Push Notification with vibration to Android/PC
      dispatchNotifier.sendAlert({
        title: `[${alert.severity}] FutureX 132/33kV: ${alert.title}`,
        body: `${alert.equipmentName}: ${alert.details}`,
        severity: alert.severity,
        tag: `futurex-${alert.equipmentId}`,
      });

      addLogEntry(
        alert.severity === 'CRITICAL' ? 'OUTAGE' : 'PROTECTION',
        `ALARM: ${alert.title}`,
        alert.equipmentName,
        alert.details
      );
    },
    [addLogEntry]
  );

  // Live telemetry subtle fluctuation
  useEffect(() => {
    const interval = window.setInterval(() => {
      setFeeders((prev) =>
        prev.map((f) => {
          if (f.breakerState !== 'CLOSED') return f;
          const noise = (Math.random() - 0.5) * 0.12;
          const newMW = Math.max(0.5, Math.min(f.ratedCapacityMW, Number((f.currentMW + noise).toFixed(2))));
          const newAmps = Math.round((newMW * 1000) / (Math.sqrt(3) * f.actualVoltageKV * f.powerFactor));
          return {
            ...f,
            currentMW: newMW,
            currentAmps: newAmps,
          };
        })
      );

      // Transformer temperatures slight diurnal fluctuation
      setTransformers((prev) =>
        prev.map((t) => ({
          ...t,
          oilTempC: Number((t.oilTempC + (Math.random() - 0.5) * 0.08).toFixed(1)),
          windingTempC: Number((t.windingTempC + (Math.random() - 0.5) * 0.08).toFixed(1)),
        }))
      );

      prevFrequencyRef.current = liveFreq;
    }, 2500);

    return () => clearInterval(interval);
  }, [liveFreq]);

  // Operator management
  const setActiveOperatorById = useCallback(
    (id: string) => {
      const found = operators.find((op) => op.id === id);
      if (found) {
        setActiveOperator(found);
        dispatchAudio.playAckChime();
        addLogEntry(
          'COMMUNICATION',
          'Duty Operator Handover',
          'FutureX Console',
          `Active control handed over to ${found.name} (${found.role}, ${found.shift})`
        );
      }
    },
    [addLogEntry, operators]
  );

  const addOperator = useCallback((newOp: OperatorProfile) => {
    setOperators((prev) => [...prev, newOp]);
    setActiveOperator(newOp);
    dispatchAudio.playAckChime();
    addLogEntry(
      'COMMUNICATION',
      'New Operator Enrolled',
      'FutureX Console',
      `Registered operator: ${newOp.name} (${newOp.role}, ${newOp.shift})`
    );
  }, [addLogEntry]);

  // Update active operator's name and details
  const updateActiveOperator = useCallback(
    (updated: Partial<OperatorProfile>) => {
      setActiveOperator((prev) => {
        const next = { ...prev, ...updated };
        setOperators((ops) => ops.map((op) => (op.id === prev.id ? next : op)));
        addLogEntry(
          'COMMUNICATION',
          'Duty Operator Name / Profile Assigned',
          'FutureX Console',
          `Active operator name changed to: ${next.name} (${next.role}, ${next.shift})`
        );
        return next;
      });
      dispatchAudio.playAckChime();
    },
    [addLogEntry]
  );

  // Update any operator in the station directory
  const updateOperator = useCallback(
    (id: string, updated: Partial<OperatorProfile>) => {
      setOperators((ops) =>
        ops.map((op) => {
          if (op.id === id) {
            const next = { ...op, ...updated };
            if (activeOperator.id === id) {
              setActiveOperator(next);
            }
            return next;
          }
          return op;
        })
      );
      dispatchAudio.playAckChime();
    },
    [activeOperator.id]
  );

  // Remove an operator
  const deleteOperator = useCallback(
    (id: string) => {
      setOperators((ops) => {
        if (ops.length <= 1) return ops;
        const next = ops.filter((op) => op.id !== id);
        if (activeOperator.id === id) {
          setActiveOperator(next[0]);
        }
        return next;
      });
      dispatchAudio.playAckChime();
    },
    [activeOperator.id]
  );

  // Unique Operator Login, Logout, Lock, and PIN management
  const loginOperator = useCallback(
    (id: string, pin: string) => {
      const op = operators.find((o) => o.id === id);
      if (!op) {
        return { success: false, error: 'Operator profile not found.' };
      }
      if (op.pin !== pin) {
        dispatchAudio.playWarningChime();
        return { success: false, error: 'Incorrect PIN. Authorization denied.' };
      }

      const now = new Date();
      const newSession: OperatorSession = {
        sessionId: `SES-${Date.now().toString().slice(-6)}`,
        operatorId: op.id,
        operatorName: op.name,
        role: op.role,
        shift: op.shift,
        loginTime: now.toLocaleTimeString([], { hour12: false }),
        loginDate: now.toLocaleDateString(),
        isActive: true,
      };

      setActiveOperator(op);
      setCurrentSession(newSession);
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);

      const loginTimestampStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setOperators((prev) =>
        prev.map((o) => (o.id === id ? { ...o, lastLogin: loginTimestampStr } : o))
      );

      localStorage.setItem('futurex_is_logged_in', 'true');
      localStorage.setItem('futurex_current_session', JSON.stringify(newSession));

      dispatchAudio.playAckChime();
      addLogEntry(
        'COMMUNICATION',
        'Operator Authenticated / Shift Login',
        'SCADA Security Gateway',
        `Operator ${op.name} (${op.id}) authenticated with PIN. Assumed active control of FutureX 132/33kV.`
      );

      return { success: true };
    },
    [operators, addLogEntry]
  );

  const logoutOperator = useCallback(() => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        logoutTime: new Date().toLocaleTimeString([], { hour12: false }),
        isActive: false,
      };
      setCurrentSession(endedSession);
      localStorage.setItem('futurex_current_session', JSON.stringify(endedSession));
    }
    setIsLoggedIn(false);
    localStorage.setItem('futurex_is_logged_in', 'false');
    setIsLoginModalOpen(true);
    dispatchAudio.playWarningChime();
    addLogEntry(
      'COMMUNICATION',
      'Operator Logged Out / Console Secured',
      'SCADA Security Gateway',
      `Operator ${activeOperator.name} signed off duty. SCADA controls secured.`
    );
  }, [currentSession, activeOperator.name, addLogEntry]);

  const lockConsole = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.setItem('futurex_is_logged_in', 'false');
    setIsLoginModalOpen(true);
    dispatchAudio.playWarningChime();
    addLogEntry(
      'COMMUNICATION',
      'Console Lock Screen Engaged',
      'SCADA Security Gateway',
      `Station console locked by Operator ${activeOperator.name}. PIN authorization required to operate breakers.`
    );
  }, [activeOperator.name, addLogEntry]);

  const unlockConsole = useCallback(
    (pin: string) => {
      if (activeOperator.pin === pin) {
        setIsLoggedIn(true);
        localStorage.setItem('futurex_is_logged_in', 'true');
        setIsLoginModalOpen(false);
        dispatchAudio.playAckChime();
        addLogEntry(
          'COMMUNICATION',
          'Console Unlocked',
          'SCADA Security Gateway',
          `Console unlocked by ${activeOperator.name} via security PIN.`
        );
        return { success: true };
      } else {
        dispatchAudio.playWarningChime();
        return { success: false, error: 'Incorrect PIN. Console remains locked.' };
      }
    },
    [activeOperator, addLogEntry]
  );

  const updateOperatorPin = useCallback(
    (id: string, oldPin: string, newPin: string) => {
      const op = operators.find((o) => o.id === id);
      if (!op) return { success: false, error: 'Operator not found.' };
      if (op.pin !== oldPin) {
        return { success: false, error: 'Current PIN is incorrect.' };
      }
      if (!newPin || newPin.length < 4) {
        return { success: false, error: 'New PIN must be at least 4 digits.' };
      }

      setOperators((prev) =>
        prev.map((o) => (o.id === id ? { ...o, pin: newPin } : o))
      );
      if (activeOperator.id === id) {
        setActiveOperator((prev) => ({ ...prev, pin: newPin }));
      }

      dispatchAudio.playAckChime();
      addLogEntry(
        'COMMUNICATION',
        'Operator PIN Changed',
        'SCADA Security Gateway',
        `Security PIN updated for Operator ${op.name} (${op.id}).`
      );
      return { success: true };
    },
    [operators, activeOperator.id, addLogEntry]
  );

  // Update Feeder name, town, or capacity
  const updateFeeder = useCallback((id: string, updated: Partial<FeederLine>) => {
    setFeeders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updated } : f))
    );
    dispatchAudio.playAckChime();
  }, []);

  // Feeder Breaker Toggle (Trip / Close)
  const toggleFeederBreaker = useCallback(
    (feederId: string) => {
      if (!isLoggedIn) {
        setIsLoginModalOpen(true);
        dispatchAudio.playWarningChime();
        return;
      }
      setFeeders((prev) =>
        prev.map((f) => {
          if (f.id !== feederId) return f;
          const willBeClosed = f.breakerState !== 'CLOSED';
          const nextState: BreakerState = willBeClosed ? 'CLOSED' : 'OPEN';

          dispatchAudio.playBreakerSound(willBeClosed ? 'CLOSE' : 'TRIP');

          addLogEntry(
            'PARAM_CHANGE',
            willBeClosed ? '11kV Feeder Breaker Closed' : '11kV Feeder Breaker Tripped/Opened',
            f.name,
            `${willBeClosed ? 'Re-energized' : 'Manual isolation by'} Operator ${activeOperator.name}. Load: ${f.currentMW} MW.`
          );

          if (!willBeClosed) {
            triggerAlert({
              equipmentId: f.id,
              equipmentName: f.name,
              severity: 'CRITICAL',
              title: `11kV LINE OUTAGE - ${f.townName.toUpperCase()}`,
              details: `${f.name} circuit breaker opened by Operator ${activeOperator.name}. ${f.customersCount.toLocaleString()} customers in ${f.townName} affected.`,
            });
          }

          return {
            ...f,
            breakerState: nextState,
            protectionTripped: false,
            tripReason: undefined,
          };
        })
      );
    },
    [activeOperator.name, addLogEntry, triggerAlert]
  );

  // Emergency load shed a specific feeder
  const emergencyShedFeeder = useCallback(
    (feederId: string, reason = 'Load Shedding Directive') => {
      if (!isLoggedIn) {
        setIsLoginModalOpen(true);
        dispatchAudio.playWarningChime();
        return;
      }
      setFeeders((prev) =>
        prev.map((f) => {
          if (f.id !== feederId) return f;
          dispatchAudio.playBreakerSound('TRIP');

          triggerAlert({
            equipmentId: f.id,
            equipmentName: f.name,
            severity: 'CRITICAL',
            title: `EMERGENCY LOAD SHED: ${f.townName.toUpperCase()}`,
            details: `${f.name} shed by Operator ${activeOperator.name}. Reason: ${reason}. Load relief: ${f.currentMW} MW.`,
            autoShedTriggered: true,
          });

          return {
            ...f,
            breakerState: 'TRIPPED',
            protectionTripped: true,
            tripReason: reason,
          };
        })
      );
    },
    [isLoggedIn, activeOperator.name, triggerAlert]
  );

  // Restore all 8 feeders and turn alarm OFF
  const restoreAllFeeders = useCallback(() => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      dispatchAudio.playWarningChime();
      return;
    }
    // 1. Immediately turn off the alarm siren and play restoration chime
    dispatchAudio.stopContinuousSiren();
    dispatchAudio.playRestorationChime();
    isContinuousSirenPlayingRef.current = false;

    // 2. Mark all alerts cleared & acknowledged
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true, cleared: true })));

    // 3. Close all 8 11kV receiving feeders
    setFeeders((prev) =>
      prev.map((f) => ({
        ...f,
        breakerState: 'CLOSED',
        protectionTripped: false,
        tripReason: undefined,
      }))
    );

    // 4. Reset transformers to normal
    setTransformers((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'NORMAL',
        windingTempC: Math.min(66.4, t.windingTempC),
        oilTempC: Math.min(58.2, t.oilTempC),
      }))
    );

    // 5. Send automated SMS text message to +2348067254663
    smsDispatcher.sendSMS({
      title: 'SYSTEM RESTORED - ALARM OFF',
      body: `FutureX 132/33kV: All 8 receiving 11kV feeders (Hadejia, Kafin Hausa, Auyo, Malam Madori, Guri, Kirikasamma, Kaugama, Birniwa) closed & energized. Frequency 50.00 Hz nominal. Sirens deactivated. Operator: ${activeOperator.name}`,
      type: 'RESTORATION',
    });

    addLogEntry(
      'OUTAGE',
      'All 8 11kV Receiving Feeders Restored (Alarm Off)',
      'FutureX 11kV Switchboard',
      `Full re-energization executed by Operator ${activeOperator.name}. Alarm siren deactivated, SMS sent to +2348067254663.`
    );
  }, [isLoggedIn, activeOperator.name, addLogEntry]);

  // Transformer Tap Adjustment
  const adjustTransformerTap = useCallback(
    (txId: string, delta: number) => {
      if (!isLoggedIn) {
        setIsLoginModalOpen(true);
        dispatchAudio.playWarningChime();
        return;
      }
      setTransformers((prev) =>
        prev.map((t) => {
          if (t.id !== txId) return t;
          const newTap = Math.max(t.tapMin, Math.min(t.tapMax, t.tapPosition + delta));
          dispatchAudio.playBreakerSound('CLOSE');

          addLogEntry(
            'PARAM_CHANGE',
            'OLTC Tap Changer Position Changed',
            t.name,
            `Operator ${activeOperator.name} adjusted tap from ${t.tapPosition} to ${newTap}. Low-side voltage regulated.`
          );

          return {
            ...t,
            tapPosition: newTap,
          };
        })
      );
    },
    [isLoggedIn, activeOperator.name, addLogEntry]
  );

  // Toggle cooling fans
  const toggleCoolingFans = useCallback(
    (txId: string) => {
      setTransformers((prev) =>
        prev.map((t) => {
          if (t.id !== txId) return t;
          const nextRunning = !t.coolingFansRunning;
          addLogEntry(
            'PARAM_CHANGE',
            `Transformer Cooling Forced ${nextRunning ? 'ON' : 'OFF'}`,
            t.name,
            `Operator ${activeOperator.name} changed forced ventilation state.`
          );
          return {
            ...t,
            coolingFansRunning: nextRunning,
          };
        })
      );
    },
    [activeOperator.name, addLogEntry]
  );

  // Save hourly electrical parameter logsheet entry
  const saveElectricalHourlyLog = useCallback(
    (logData: Omit<ElectricalHourlyLog, 'id' | 'timestamp' | 'date'>) => {
      const now = new Date();
      const newEntry: ElectricalHourlyLog = {
        ...logData,
        id: `LOG-HR-${Date.now().toString().slice(-6)}`,
        timestamp: now.toLocaleTimeString([], { hour12: false }),
        date: now.toLocaleDateString(),
      };
      setHourlyLogs((prev) => [newEntry, ...prev]);
      dispatchAudio.playAckChime();
      addLogEntry(
        'DISPATCH',
        'Hourly Electrical Logsheet Recorded',
        'FutureX Station Log',
        `Operator ${activeOperator.name} recorded parameters. Bus 132kV: ${logData.voltage132kV}kV, 33kV: ${logData.voltage33kV}kV, 11kV: ${logData.voltage11kVBusA}kV, Freq: ${logData.frequencyHz}Hz, Total Load: ${logData.totalLoadMW}MW.`
      );
    },
    [activeOperator.name, addLogEntry]
  );

  const deleteHourlyLog = useCallback((id: string) => {
    setHourlyLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Alert acknowledgments
  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      dispatchAudio.playAckChime();
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
      );
      addLogEntry('ALARM_ACK', 'Alert Acknowledged by Operator', alertId, `Acknowledged by ${activeOperator.name}`);
    },
    [activeOperator.name, addLogEntry]
  );

  const acknowledgeAllAlerts = useCallback(() => {
    dispatchAudio.playAckChime();
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    addLogEntry('ALARM_ACK', 'All Active Station Alarms Acknowledged', 'FutureX Console', `Silenced by ${activeOperator.name}`);
  }, [activeOperator.name, addLogEntry]);

  const clearResolvedAlerts = useCallback(() => {
    setAlerts((prev) => prev.filter((a) => !a.acknowledged));
  }, []);

  // Simulation drill scenarios for the user and operators
  const runScenario = useCallback(
    (scenarioKey: 'normal' | 'hadejia-trip' | 'kafin-hausa-trip' | 'tx-overheat' | 'grid-low-freq' | 'irrigation-surge') => {
      if (scenarioKey === 'normal') {
        setActiveScenario('Normal Grid Operation');
        dispatchAudio.stopContinuousSiren();
        dispatchAudio.playRestorationChime();
        isContinuousSirenPlayingRef.current = false;
        setFeeders(INITIAL_11KV_FEEDERS);
        setTransformers(INITIAL_TRANSFORMERS);
        setIncomingVoltage132kV(132.4);
        setAlerts([]);
        addLogEntry('DISPATCH', 'Substation Reset to Normal Operation (Alarm Off)', 'FutureX Switchyard', 'All 8 11kV feeders and transformers nominal.');
        smsDispatcher.sendSMS({
          title: 'SYSTEM RESTORED (NORMAL)',
          body: `FutureX 132/33kV: All 8 receiving 11kV town feeders nominal. Grid frequency 50.00 Hz. Alarm siren deactivated. Operator: ${activeOperator.name}`,
          type: 'RESTORATION',
        });
      } else if (scenarioKey === 'hadejia-trip') {
        setActiveScenario('Hadejia 11kV Feeder Overcurrent Trip');
        setFeeders((prev) =>
          prev.map((f) => {
            if (f.id === 'FDR-11K-01') {
              return {
                ...f,
                breakerState: 'TRIPPED',
                protectionTripped: true,
                tripReason: 'Overcurrent Relay 50/51 Trip - Phase B-C Fault',
                relayTarget: 'Overcurrent 50/51',
              };
            }
            return f;
          })
        );
        dispatchAudio.playBreakerSound('TRIP');
        triggerAlert({
          equipmentId: 'FDR-11K-01',
          equipmentName: 'Hadejia 11kV Feeder',
          severity: 'CRITICAL',
          title: '11kV LINE OUTAGE - HADEJIA TOWN',
          details: 'Phase B-C fault on Hadejia distribution ring. CB-11K-01 tripped on Relay 50/51. 5.2 MW dropped. 68,000 customers off.',
        });
      } else if (scenarioKey === 'kafin-hausa-trip') {
        setActiveScenario('Kafin Hausa 11kV Earth Fault Trip');
        setFeeders((prev) =>
          prev.map((f) => {
            if (f.id === 'FDR-11K-02') {
              return {
                ...f,
                breakerState: 'TRIPPED',
                protectionTripped: true,
                tripReason: 'Earth Fault Relay 51N Trip - Tree Branch Contact',
                relayTarget: 'Earth Fault 51N',
              };
            }
            return f;
          })
        );
        dispatchAudio.playBreakerSound('TRIP');
        triggerAlert({
          equipmentId: 'FDR-11K-02',
          equipmentName: 'Kafin Hausa 11kV Feeder',
          severity: 'CRITICAL',
          title: '11kV LINE OUTAGE - KAFIN HAUSA',
          details: 'Earth fault detected on Kafin Hausa 11kV line. CB-11K-02 tripped on 51N. 4.1 MW dropped. 42,000 customers affected.',
        });
      } else if (scenarioKey === 'tx-overheat') {
        setActiveScenario('Power Transformer T1A High Winding Temp');
        setTransformers((prev) =>
          prev.map((t) => {
            if (t.id === 'TX-132-T1') {
              return {
                ...t,
                windingTempC: 98.4,
                oilTempC: 86.2,
                status: 'CRITICAL',
                coolingFansRunning: true,
              };
            }
            return t;
          })
        );
        triggerAlert({
          equipmentId: 'TX-132-T1',
          equipmentName: 'Power Transformer T1A (60 MVA)',
          severity: 'CRITICAL',
          title: 'TRANSFORMER THERMAL OVERLOAD (>95°C)',
          details: 'T1A winding temperature reached 98.4°C. Check cooling radiator fans and transfer 33kV load to Transformer T2A.',
        });
      } else if (scenarioKey === 'grid-low-freq') {
        setActiveScenario('National Grid Low Frequency Excursion (49.32 Hz)');
        triggerAlert({
          equipmentId: 'GRID-132KV',
          equipmentName: 'Incoming 132kV Grid Tie',
          severity: 'WARNING',
          title: 'GRID UNDER-FREQUENCY WARNING (49.32 Hz)',
          details: 'National Grid frequency dropped below statutory tolerance (49.80 - 50.20 Hz). Under-Frequency Load Shedding (UFLS) stage armed.',
        });
      } else if (scenarioKey === 'irrigation-surge') {
        setActiveScenario('Auyo & Guri Evening Irrigation Pumping Surge');
        setFeeders((prev) =>
          prev.map((f) => {
            if (f.id === 'FDR-11K-03') return { ...f, currentMW: 4.9, currentAmps: 268 }; // Auyo
            if (f.id === 'FDR-11K-05') return { ...f, currentMW: 3.8, currentAmps: 208 }; // Guri
            return f;
          })
        );
        triggerAlert({
          equipmentId: 'FDR-11K-03',
          equipmentName: 'Auyo 11kV Feeder',
          severity: 'WARNING',
          title: 'FEEDER THERMAL OVERLOAD WARNING (98%)',
          details: 'Auyo irrigation pumping peak pushed feeder to 4.9 MW (rated 5.0 MW). Monitor 11kV bus voltage.',
        });
      }
    },
    [addLogEntry, triggerAlert]
  );

  const toggleSound = useCallback(() => {
    const next = dispatchAudio.toggleMute();
    setSoundMuted(next);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    const perm = await dispatchNotifier.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      dispatchNotifier.sendAlert({
        title: 'FutureX Substation Alerts Enabled',
        body: 'Automated push notifications armed for Hadejia, Kafin Hausa, Auyo, Malam Madori, Guri, Kirikasamma, Kaugama, Birniwa.',
        severity: 'INFO',
        tag: 'futurex-welcome',
      });
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    await dispatchNotifier.sendAlert({
      title: 'TEST DISPATCH ALERT - FutureX 132/33kV',
      body: `Automated push alert test by Operator ${activeOperator.name}. Haptic pulse verified for 11kV receiving feeders.`,
      severity: 'CRITICAL',
      tag: 'test-futurex',
    });
    dispatchAudio.playWarningChime();
  }, [activeOperator.name]);

  const setIncomingVoltage = useCallback((kv: number) => {
    setIncomingVoltage132kV(kv);
  }, []);

  return (
    <DispatchContext.Provider
      value={{
        metrics,
        feeders,
        transformers,
        alerts,
        logs,
        hourlyLogs,
        operators,
        activeOperator,
        activeScenario,
        soundMuted,
        notificationPermission,
        smsRecipient,
        updateSmsRecipient,
        isSmsModalOpen,
        openSmsModal,
        closeSmsModal,
        isOperatorModalOpen,
        openOperatorModal,
        closeOperatorModal,
        isStatusModalOpen,
        openStatusModal,
        closeStatusModal,
        sendSMSAlert,
        // Operator Auth & Unique Login
        isLoggedIn,
        currentSession,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginOperator,
        logoutOperator,
        lockConsole,
        unlockConsole,
        updateOperatorPin,
        setActiveOperatorById,
        updateActiveOperator,
        updateOperator,
        deleteOperator,
        addOperator,
        updateFeeder,
        toggleFeederBreaker,
        adjustTransformerTap,
        toggleCoolingFans,
        emergencyShedFeeder,
        restoreAllFeeders,
        acknowledgeAlert,
        acknowledgeAllAlerts,
        clearResolvedAlerts,
        saveElectricalHourlyLog,
        deleteHourlyLog,
        addLogEntry,
        runScenario,
        toggleSound,
        requestNotificationPermission,
        sendTestNotification,
        setIncomingVoltage,
      }}
    >
      {children}
    </DispatchContext.Provider>
  );
};

export function useDispatch() {
  const ctx = useContext(DispatchContext);
  if (!ctx) {
    throw new Error('useDispatch must be used within a DispatchProvider');
  }
  return ctx;
}
