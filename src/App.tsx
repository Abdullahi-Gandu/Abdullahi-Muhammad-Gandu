import React, { useState } from 'react';
import {
  DispatchProvider,
  useDispatch,
} from './context/DispatchContext';
import { DispatchHeader } from './components/DispatchHeader';
import { GridOverviewCard } from './components/GridOverviewCard';
import { SingleLineDiagram } from './components/SingleLineDiagram';
import { FeedersOutagePanel } from './components/FeedersOutagePanel';
import { SubstationTransformersPanel } from './components/SubstationTransformersPanel';
import { ElectricalLogsheetPanel } from './components/ElectricalLogsheetPanel';
import { AlertsAndOutageLog } from './components/AlertsAndOutageLog';
import { DispatchLogbook } from './components/DispatchLogbook';
import { SimulationControlsModal } from './components/SimulationControlsModal';
import { StatusProblemDetailsModal } from './components/StatusProblemDetailsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Activity,
  Layers,
  Zap,
  Bell,
  BookOpen,
  ClipboardList,
  Sliders,
} from 'lucide-react';

type TabView = 'OVERVIEW' | 'SLD' | 'FEEDERS' | 'TRANSFORMERS' | 'LOGSHEET' | 'ALERTS' | 'LOGS';

function FutureXConsole() {
  const { metrics, alerts, activeOperator, isStatusModalOpen, closeStatusModal } = useDispatch();
  const [activeTab, setActiveTab] = useState<TabView>('OVERVIEW');
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  const unackAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <DispatchHeader
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenLogModal={() => setActiveTab('LOGS')}
      />

      {/* Navigation Bar (Desktop Tabs & Mobile Pills) */}
      <nav className="bg-slate-950/90 border-b border-slate-800/90 sticky top-14 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 flex items-center justify-between overflow-x-auto scrollbar-none py-1.5 sm:py-2 gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'OVERVIEW'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>OVERVIEW HUD</span>
            </button>

            <button
              onClick={() => setActiveTab('SLD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'SLD'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>SLD SCHEMATIC</span>
            </button>

            <button
              onClick={() => setActiveTab('FEEDERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 whitespace-nowrap relative ${
                activeTab === 'FEEDERS'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>8 x 11kV FEEDERS</span>
              {metrics.outageCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('TRANSFORMERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'TRANSFORMERS'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>TRANSFORMERS (132/33 & 33/11)</span>
            </button>

            <button
              onClick={() => setActiveTab('LOGSHEET')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'LOGSHEET'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
              <span>OPERATOR LOGSHEET</span>
            </button>

            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 whitespace-nowrap relative ${
                activeTab === 'ALERTS'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-rose-400" />
              <span>PUSH ALERTS</span>
              {unackAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold animate-pulse">
                  {unackAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'LOGS'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>SHIFT LOGBOOK</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>OPERATOR: <strong className="text-slate-200">{activeOperator.name}</strong></span>
            <span>•</span>
            <span>FEEDER LOAD: <strong className="text-sky-400">{metrics.totalFeederLoadMW} MW</strong></span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4 pb-20 sm:pb-8">
        {/* Top Macro HUD */}
        <GridOverviewCard onNavigateToAlerts={() => setActiveTab('ALERTS')} />

        {/* Tab-Specific Views */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            <SingleLineDiagram />
            <FeedersOutagePanel />
            <SubstationTransformersPanel />
            <ElectricalLogsheetPanel />
            <AlertsAndOutageLog />
          </div>
        )}

        {activeTab === 'SLD' && (
          <div className="space-y-4">
            <SingleLineDiagram />
            <FeedersOutagePanel />
          </div>
        )}

        {activeTab === 'FEEDERS' && (
          <div className="space-y-4">
            <FeedersOutagePanel />
          </div>
        )}

        {activeTab === 'TRANSFORMERS' && (
          <div className="space-y-4">
            <SubstationTransformersPanel />
          </div>
        )}

        {activeTab === 'LOGSHEET' && (
          <div className="space-y-4">
            <ElectricalLogsheetPanel />
          </div>
        )}

        {activeTab === 'ALERTS' && (
          <div className="space-y-4">
            <AlertsAndOutageLog />
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="space-y-4">
            <DispatchLogbook />
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation for Android Phones */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 z-40 backdrop-blur-md px-1 py-1 flex items-center justify-around font-mono">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex flex-col items-center py-1 px-1.5 rounded text-[10px] ${
            activeTab === 'OVERVIEW' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Activity className="w-4 h-4 mb-0.5" />
          <span>HUD</span>
        </button>

        <button
          onClick={() => setActiveTab('SLD')}
          className={`flex flex-col items-center py-1 px-1.5 rounded text-[10px] ${
            activeTab === 'SLD' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>SLD</span>
        </button>

        <button
          onClick={() => setActiveTab('FEEDERS')}
          className={`flex flex-col items-center py-1 px-1.5 rounded text-[10px] relative ${
            activeTab === 'FEEDERS' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4 mb-0.5" />
          <span>Feeders</span>
          {metrics.outageCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('TRANSFORMERS')}
          className={`flex flex-col items-center py-1 px-1.5 rounded text-[10px] ${
            activeTab === 'TRANSFORMERS' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>TXs</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGSHEET')}
          className={`flex flex-col items-center py-1 px-1.5 rounded text-[10px] ${
            activeTab === 'LOGSHEET' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ClipboardList className="w-4 h-4 mb-0.5" />
          <span>Logsheet</span>
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`flex flex-col items-center py-1 px-1.5 rounded text-[10px] relative ${
            activeTab === 'ALERTS' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Bell className="w-4 h-4 mb-0.5" />
          <span>Alerts</span>
          {unackAlertsCount > 0 && (
            <span className="px-1 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-bold absolute top-0.5 right-0.5">
              {unackAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex flex-col items-center py-1 px-1.5 rounded text-[10px] ${
            activeTab === 'LOGS' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Logs</span>
        </button>
      </nav>

      {/* Simulation Controls Modal */}
      <SimulationControlsModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
      />

      {/* Substation Problems & Health Diagnostic Modal */}
      <StatusProblemDetailsModal
        isOpen={isStatusModalOpen}
        onClose={closeStatusModal}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <DispatchProvider>
      <FutureXConsole />
    </DispatchProvider>
  );
}
