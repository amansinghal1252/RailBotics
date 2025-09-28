import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  RotateCcw,
  ArrowLeft,
  Clock,
  Train,
  AlertTriangle,
  CloudRain,
  Settings,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

// --- DATA IMPORT ---
import trainsData from '../data/trains.json';
import conflictsData from '../data/conflicts.json';
import { Train as TrainType } from '../types';

// --- HELPER COMPONENTS ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>{children}</div>
);
const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'outline'; className?: string; }> = ({ children, onClick, disabled, variant, className }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors px-4 py-2";
  const variantClasses = variant === 'outline' ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : 'bg-purple-600 text-white hover:bg-purple-700';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  return <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}>{children}</button>;
};
const useToast = () => {
  const showToast = ({ type, title, message }: { type: string, title: string, message: string }) => { console.log(`[Toast: ${type}] ${title}: ${message}`); };
  return { showToast };
};

// --- SIMULATION RESULTS COMPONENT ---
const SimulationResults: React.FC<{ results: any; }> = ({ results }) => {
  const getChangeColor = (before: number, after: number, lowerIsBetter = false) => {
    if (before === after) return 'text-gray-600';
    const improved = lowerIsBetter ? after < before : after > before;
    return improved ? 'text-green-600' : 'text-red-600';
  };
  const formatChange = (before: number, after: number, unit = '') => {
    const change = after - before;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(0)}${unit}`;
  };
  const getChangeIcon = (before: number, after: number, lowerIsBetter = false) => {
    if (before === after) return <TrendingUp className="w-5 h-5 text-gray-600 rotate-45" />;
    const improved = lowerIsBetter ? after < before : after > before;
    return improved ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div><h2 className="text-2xl font-bold text-gray-900">Simulation Complete</h2><p className="font-semibold text-gray-700">Scenario: {results.scenarioTitle}</p></div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6">Performance Impact Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(['punctuality', 'averageDelay', 'throughputPercentage', 'utilization'] as const).map(key => {
            const keyMap: { [key: string]: string } = { punctuality: 'Punctuality', averageDelay: 'Avg Delay', throughputPercentage: 'Throughput', utilization: 'Utilization' };
            const lowerIsBetter = key === 'averageDelay';
            const unit = (key.includes('Percentage') || key.includes('punctuality') || key.includes('utilization')) ? '%' : ' min';
            const before = results.before[key];
            const after = results.after[key];
            return (
              <div key={key} className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-gray-700 mb-2">{keyMap[key]}</h4>
                <p className="text-3xl font-bold text-gray-900">{after.toFixed(0)}{unit}</p>
                <div className={`flex items-center justify-center space-x-1 font-semibold ${getChangeColor(before, after, lowerIsBetter)}`}>
                  {getChangeIcon(before, after, lowerIsBetter)}
                  <span>{formatChange(before, after, unit)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">from {before.toFixed(0)}{unit}</p>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Delay Impact by Train Type (mins)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results.delaysByType}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="type" /><YAxis /><Tooltip /><Legend /><Bar dataKey="before" fill="#10B981" name="Before" radius={[4, 4, 0, 0]} /><Bar dataKey="after" fill="#EF4444" name="After (Simulated)" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Punctuality Trend (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.punctualityTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis domain={[50, 100]} /><Tooltip /><Legend /><Line type="monotone" dataKey="before" stroke="#10B981" strokeWidth={2} name="Before" /><Line type="monotone" dataKey="after" stroke="#EF4444" strokeWidth={2} name="After (Simulated)" /></LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI-Generated Action Plan</h3>
        <div className="space-y-3">
          {results.recommendations.map((rec: string, index: number) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="bg-blue-100 text-blue-600 font-bold text-sm rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">{index + 1}</div>
              <p className="text-blue-900 font-medium">{rec}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

type Scenario = { id: string; title: string; description: string; icon: React.ReactNode; color: string; bgColor: string; impact: string; defaultDelay?: string; };

export const SimulationPage: React.FC = () => {
  const [view, setView] = useState<'selection' | 'configuration' | 'results'>('selection');
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<string>('');
  const [additionalDelay, setAdditionalDelay] = useState<string>('');
  const [rerouteOption, setRerouteOption] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const { showToast } = useToast();

  const allTrains: TrainType[] = trainsData as TrainType[];
  const scenarios: Scenario[] = [
    { id: 'delay', title: 'Express Train Delay', description: 'Simulate major express train delay and analyze cascading effects on schedule.', icon: <Clock className="w-6 h-6" />, color: 'text-yellow-600', bgColor: 'bg-yellow-100', impact: 'High impact on punctuality', defaultDelay: '20' },
    { id: 'breakdown', title: 'Engine Breakdown Emergency', description: 'Critical engine failure requiring immediate track clearance and rerouting.', icon: <AlertTriangle className="w-6 h-6" />, color: 'text-red-600', bgColor: 'bg-red-100', impact: 'Critical impact on capacity', defaultDelay: '45' },
    { id: 'weather', title: 'Heavy Monsoon Impact', description: 'Severe weather conditions affecting visibility and track conditions.', icon: <CloudRain className="w-6 h-6" />, color: 'text-blue-600', bgColor: 'bg-blue-100', impact: 'Moderate impact on speed', defaultDelay: '15' },
    { id: 'maintenance', title: 'Emergency Track Maintenance', description: 'Urgent track repair requiring section closure and traffic diversion.', icon: <Settings className="w-6 h-6" />, color: 'text-purple-600', bgColor: 'bg-purple-100', impact: 'High impact on routing', defaultDelay: '60' },
    { id: 'signal', title: 'Signal System Failure', description: 'Multiple signal failures requiring manual control and reduced speeds.', icon: <AlertTriangle className="w-6 h-6" />, color: 'text-orange-600', bgColor: 'bg-orange-100', impact: 'Critical impact on operations', defaultDelay: '30' },
    { id: 'passenger', title: 'Medical Emergency', description: 'Passenger medical emergency requiring immediate station stop.', icon: <AlertTriangle className="w-6 h-6" />, color: 'text-pink-600', bgColor: 'bg-pink-100', impact: 'Moderate impact on schedule', defaultDelay: '25' }
  ];
  const baselineData = {
    punctuality: 92,
    averageDelay: 8,
    throughputPercentage: 88,
    utilization: 76,
    delaysByType: [{ type: 'Express', before: 6 }, { type: 'Local', before: 5 }, { type: 'Freight', before: 15 }],
    punctualityTrend: [{ time: '08:00', before: 95 }, { time: '10:00', before: 92 }, { time: '12:00', before: 90 }, { time: '14:00', before: 88 }, { time: '16:00', before: 91 }, { time: '18:00', before: 89 }]
  };
  const scenarioRecommendations = {
    delay: ['Prioritize high-speed trains and adjust local train schedules to minimize platform congestion.', 'Communicate revised ETAs to passengers and connecting stations immediately.', 'Analyze the root cause of the delay to prevent future occurrences.', 'Temporarily increase headway between following trains to create buffer time.'],
    breakdown: ['Dispatch the nearest emergency engineering team to the breakdown location.', 'Reroute all approaching traffic to alternative tracks or loop lines.', 'Arrange for a rescue locomotive to tow the failed train to the nearest yard.', 'Provide clear updates to affected passengers regarding the rescue operation timeline.'],
    weather: ['Impose a temporary speed restriction across the entire affected section.', 'Increase patrol frequency to monitor track conditions, signals, and overhead lines.', 'Activate contingency plans for potential waterlogging at low-lying stations.', 'Advise passengers of potential widespread delays and offer ticket flexibility.'],
    maintenance: ['Establish a clear block corridor for the maintenance crew with safety protocols.', 'Divert all traffic using pre-defined alternative routes for the duration of the repair.', 'Coordinate with station masters to manage passenger flow and platform changes.', 'Conduct a post-repair inspection and speed test before resuming normal operations.'],
    signal: ['Switch to manual authorization protocols for train movement in the affected area.', 'Deploy technical staff to the nearest signal cabin for on-site diagnosis.', 'Instruct locomotive pilots to proceed with extreme caution and reduced visibility rules.', 'Run a full system diagnostic after the fault is rectified to ensure system integrity.'],
    passenger: ['Arrange for paramedics and station staff to meet the train at the next designated stop.', 'Make onboard announcements to inform other passengers of the unscheduled stop.', 'Coordinate with control to minimize the delay to the schedule post-emergency.', 'Log the incident and the total delay incurred for performance review.']
  };

  const rerouteOptions = useMemo(() => {
    const options = new Set<string>();
    conflictsData.forEach(c => {
      if (c.recommendation.alternativeRoute) options.add(c.recommendation.alternativeRoute);
      if (c.recommendation.alternativePlatform) options.add(`Platform ${c.recommendation.alternativePlatform}`);
    });
    return Array.from(options);
  }, []);

  const handleScenarioSelect = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setAdditionalDelay(scenario.defaultDelay || '10');
    setDescription(scenario.description);
    const firstExpress = allTrains.find(t => t.type === 'Express');
    setSelectedTrain(firstExpress ? firstExpress.id : allTrains[0]?.id || '');
    setRerouteOption('');
    setView('configuration');
  };

  const handleRunSimulation = () => {
    if (!activeScenario) return;
    setIsSimulating(true);
    showToast({ type: 'info', title: 'Simulation Started', message: `Running ${activeScenario.title}...` });

    setTimeout(() => {
      const delayFactor = (parseInt(additionalDelay, 10) || 10) / 20;
      const afterMetrics = {
        punctuality: Math.max(0, baselineData.punctuality - (10 * delayFactor)),
        averageDelay: baselineData.averageDelay + (15 * delayFactor),
        throughputPercentage: Math.max(0, baselineData.throughputPercentage - (5 * delayFactor)),
        utilization: Math.min(100, baselineData.utilization + (8 * delayFactor)),
      };
      const newDelaysByType = baselineData.delaysByType.map(d => ({ ...d, after: d.before + (5 * delayFactor) }));
      const newPunctualityTrend = baselineData.punctualityTrend.map(p => ({ ...p, after: Math.max(0, p.before - (8 * delayFactor)) }));

      const recommendations = [...scenarioRecommendations[activeScenario.id as keyof typeof scenarioRecommendations]];
      if (rerouteOption) {
        recommendations.unshift(`Prioritize executing the selected '${rerouteOption}' option to mitigate congestion.`);
      }

      setSimulationResults({
        scenarioTitle: activeScenario.title,
        before: baselineData,
        after: afterMetrics,
        delaysByType: newDelaysByType,
        punctualityTrend: newPunctualityTrend,
        recommendations: recommendations.slice(0, 4)
      });
      setIsSimulating(false);
      setView('results');
      showToast({ type: 'success', title: 'Simulation Complete', message: 'Results are ready.' });
    }, 2000);
  };

  const handleReset = () => {
    if (!activeScenario) return;
    setAdditionalDelay(activeScenario.defaultDelay || '10');
    setDescription(activeScenario.description);
    setRerouteOption('');
  };

  const handleStartNewSimulation = () => {
    setView('selection');
    setSimulationResults(null);
    setActiveScenario(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold text-gray-900">What-if Simulation</h1><p className="text-gray-600 mt-1">Test scenarios and analyze system response</p></div>
          {view === 'configuration' && (<Button onClick={() => setView('selection')} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Scenarios</Button>)}
          {view === 'results' && (<Button onClick={handleStartNewSimulation}><RotateCcw className="w-4 h-4 mr-2" /> Run New Simulation</Button>)}
        </div>

        {view === 'selection' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Available Simulation Scenarios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map((scenario, i) => (
                  <motion.div key={scenario.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => handleScenarioSelect(scenario)} className="cursor-pointer border-2 bg-white rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all">
                    <div className="flex items-start space-x-4">
                      <div className={`${scenario.bgColor} p-3 rounded-lg`}><div className={scenario.color}>{scenario.icon}</div></div>
                      <div><h3 className="font-semibold text-gray-900 mb-2">{scenario.title}</h3><div className="mt-auto p-2 bg-gray-50 rounded text-xs"><strong>Impact:</strong> {scenario.impact}</div></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {view === 'configuration' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-8 max-w-3xl mx-auto">
              {isSimulating ? (
                <div className="text-center py-20">
                  <div className="animate-spin mb-4"><Settings className="w-16 h-16 text-purple-600 mx-auto" /></div>
                  <h2 className="text-2xl font-semibold text-gray-800">Simulating Scenario...</h2>
                  <p className="text-gray-600 mt-2">Analyzing impacts and generating recommendations.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">Scenario Configuration</h2>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Scenario Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Train (Optional)</label><select value={selectedTrain} onChange={e => setSelectedTrain(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2"><option value="">System-wide Impact</option>{allTrains.map(train => <option key={train.id} value={train.id}>{train.name} ({train.id})</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Additional Delay (minutes)</label><input type="number" value={additionalDelay} onChange={e => setAdditionalDelay(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Reroute Option</label><select value={rerouteOption} onChange={e => setRerouteOption(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2"><option value="">No rerouting</option>{rerouteOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                  <div className="flex items-center space-x-3 pt-4 border-t">
                    <Button onClick={handleRunSimulation} disabled={isSimulating} className="w-full"><Play className="w-4 h-4 mr-2" />Run Simulation</Button>
                    <Button onClick={handleReset} variant="outline" disabled={isSimulating}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {view === 'results' && simulationResults && (
          <SimulationResults results={simulationResults} />
        )}
      </div>
    </div>
  );
};