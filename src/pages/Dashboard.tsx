import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Train,
  Clock,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Calendar,
  Map,
  Settings,
  X
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import trainsData from '../data/trains.json';
import { Train as TrainType } from '../types';

export const Dashboard: React.FC = () => {
  const [trains] = useState<TrainType[]>(trainsData as TrainType[]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [conflictsCount] = useState(4); // Assuming this comes from an API or context later
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();

  const [sortConfig, setSortConfig] = useState<{ key: keyof TrainType; direction: 'ascending' | 'descending' } | null>({ key: 'delay', direction: 'descending' });

  // --- Priority weights for calculations ---
  const priorityWeights = { Express: 10, Local: 4, Freight: 2, Special: 7 };

  // --- Function for Weighted Average Delay ---
  const calculateWeightedAvgDelay = (currentTrains: TrainType[]) => {
    const totalWeightedDelay = currentTrains.reduce((sum, train) => {
      const weight = priorityWeights[train.type as keyof typeof priorityWeights] || 0;
      return sum + (train.delay * weight);
    }, 0);

    const totalWeight = currentTrains.reduce((sum, train) => {
      const weight = priorityWeights[train.type as keyof typeof priorityWeights] || 0;
      return sum + weight;
    }, 0);

    if (totalWeight === 0) return 0;
    return Math.round(totalWeightedDelay / totalWeight);
  };

  // --- Functions for Throughput Percentage ---
  const calculateThroughputScore = (currentTrains: TrainType[]) => {
    return currentTrains.reduce((score, train) => {
      const weight = priorityWeights[train.type as keyof typeof priorityWeights] || 0;
      const delayPenalty = Math.max(0, 1 - (train.delay / 60));
      return score + (weight * train.speed * delayPenalty);
    }, 0);
  };

  const maxThroughputScore = useMemo(() => {
    return trains.reduce((score, train) => {
      const weight = priorityWeights[train.type as keyof typeof priorityWeights] || 0;
      return score + (weight * train.speed);
    }, 0);
  }, [trains]);

  // --- Stats object using the new calculation ---
  const stats = {
    activeTrains: trains.length,
    avgDelay: calculateWeightedAvgDelay(trains),
    throughputPercentage: maxThroughputScore > 0 ? Math.round((calculateThroughputScore(trains) / maxThroughputScore) * 100) : 0,
    punctuality: Math.round((trains.filter(t => t.delay <= 5).length / trains.length) * 100)
  };

  const filteredTrains = trains.filter(train => {
    const matchesFilter = filter === 'All' || train.type === filter;
    const matchesSearch = train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      train.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const sortedTrains = useMemo(() => {
    let sortableItems = [...filteredTrains];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTrains, sortConfig]);

  const requestSort = (key: keyof TrainType) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof TrainType) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const delayedTrains = trains.filter(t => t.delay > 10).sort((a, b) => b.delay - a.delay);

  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const navigateToPage = (page: string) => navigate(`/${page}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg"><Train className="w-6 h-6 text-blue-600" /></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Trains</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeTrains}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-yellow-600" /></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Delay (Weighted)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgDelay} min</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-green-600" /></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Throughput</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.throughputPercentage}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg"><Target className="w-6 h-6 text-purple-600" /></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Punctuality</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.punctuality}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Train List */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Active Trains</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search trains..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="relative">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                      <option value="All">All Types</option>
                      <option value="Express">Express</option>
                      <option value="Local">Local</option>
                      <option value="Freight">Freight</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Train</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4">
                        <button onClick={() => requestSort('delay')} className="font-semibold text-gray-700 flex items-center">
                          Delay
                          <span className="ml-1">{getSortIndicator('delay')}</span>
                        </button>
                      </th>
                      <th className="text-left py-3 px-4">
                        <button onClick={() => requestSort('speed')} className="font-semibold text-gray-700 flex items-center">
                          Speed
                          <span className="ml-1">{getSortIndicator('speed')}</span>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTrains.slice(0, 10).map((train, index) => (
                      <motion.tr key={train.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div><p className="font-medium">{train.name}</p><p className="text-sm text-gray-500">{train.id}</p></div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${train.type === 'Express' ? 'bg-blue-100 text-blue-800' : train.type === 'Local' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {train.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {train.status === 'On Time' ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />}
                            <span className={train.status === 'On Time' ? 'text-green-700' : 'text-yellow-700'}>{train.status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${train.delay < 1 ? 'text-green-600' : train.delay <= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Math.round(train.delay)} min
                          </span>
                        </td>
                        <td className="py-3 px-4">{train.speed} km/h</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Priority Alerts</h3>
              <div className="space-y-3">
                {delayedTrains.length > 0 ? delayedTrains.slice(0, 4).map((train) => (
                  <div key={train.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 text-sm">{train.name}</p>
                      <p className="text-red-700 text-xs">Delayed by {Math.round(train.delay)} minutes</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-500">No major delays to report.</p>}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => openModal('schedule')}
                  className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center"
                >
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">View Live Schedule</p>
                    <p className="text-blue-700 text-sm">Monitor train movements</p>
                  </div>
                </button>
                <button
                  onClick={() => openModal('conflicts')}
                  className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors flex items-center"
                >
                  <Settings className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Resolve Conflicts</p>
                    <p className="text-yellow-700 text-sm">{conflictsCount} pending conflicts</p>
                  </div>
                </button>
                <button
                  onClick={() => openModal('simulation')}
                  className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center"
                >
                  <Map className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Run Simulation</p>
                    <p className="text-green-700 text-sm">Test new scenarios</p>
                  </div>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'schedule' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Live Schedule</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">View and monitor real-time train movements across the network.</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Current Active Trains: {trains.length}</h4>
                  <div className="space-y-2">
                    {trains.slice(0, 3).map(train => (
                      <div key={train.id} className="flex justify-between text-sm">
                        <span>{train.name}</span>
                        <span className={train.delay > 5 ? 'text-red-600' : 'text-green-600'}>
                          {train.delay > 5 ? `Delayed by ${Math.round(train.delay)} min` : 'On Time'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => navigateToPage('schedule')} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Detailed Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeModal === 'conflicts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Resolve Conflicts</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Resolve scheduling conflicts to optimize train movements.</p>
                {conflictsCount > 0 ? (
                  <>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">{conflictsCount} Pending Conflict{conflictsCount !== 1 ? 's' : ''}</h4>
                      <p className="text-sm text-yellow-700">These conflicts are affecting schedule efficiency. Resolve them to improve operations.</p>
                    </div>
                    <button onClick={() => navigateToPage('conflicts')} className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                      Resolve Conflicts
                    </button>
                  </>
                ) : (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-800 text-center">All conflicts resolved! System is operating optimally.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeModal === 'simulation' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Run Simulation</h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Run simulations to test new scheduling scenarios and optimize operations.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gray-100 py-3 rounded-lg hover:bg-gray-200 transition-colors"><div className="text-blue-600 mb-1"><Train className="w-6 h-6 mx-auto" /></div><span className="text-sm">Peak Hours</span></button>
                  <button className="bg-gray-100 py-3 rounded-lg hover:bg-gray-200 transition-colors"><div className="text-green-600 mb-1"><Clock className="w-6 h-6 mx-auto" /></div><span className="text-sm">Off-Peak</span></button>
                  <button className="bg-gray-100 py-3 rounded-lg hover:bg-gray-200 transition-colors"><div className="text-red-600 mb-1"><AlertTriangle className="w-6 h-6 mx-auto" /></div><span className="text-sm">Emergency</span></button>
                  <button className="bg-gray-100 py-3 rounded-lg hover:bg-gray-200 transition-colors"><div className="text-purple-600 mb-1"><Settings className="w-6 h-6 mx-auto" /></div><span className="text-sm">Custom</span></button>
                </div>
                <button onClick={() => navigateToPage('simulation')} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Start Simulation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};