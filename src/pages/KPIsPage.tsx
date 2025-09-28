import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card'; // Assuming this path is correct
import {
  TrendingUp,
  Clock,
  Train,
  Target,
  BarChart3
} from 'lucide-react';
import {
  BarChart, Bar,
  LineChart, Line, // Ensure LineChart and Line are imported
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';
import trainsData from '../data/trains.json'; // Assuming this path is correct
import { Train as TrainType } from '../types'; // Assuming this path is correct

// --- Helper Components & Other Components (unchanged) ---

type ActiveTrainsPieChartProps = {
  trains: TrainType[];
};

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

const ActiveTrainsPieChart: React.FC<ActiveTrainsPieChartProps> = ({ trains }) => {
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    trains.forEach(train => {
      counts[train.type] = (counts[train.type] || 0) + 1;
    });
    const orderedTypes = ['Express', 'Freight', 'Local'];
    return orderedTypes.map(type => ({ type, count: counts[type] || 0 })).filter(d => d.count > 0);
  }, [trains]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Active Trains by Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={typeCounts}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
            label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
          >
            {typeCounts.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <RechartsLegend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};


// --- Main Page Component ---

export const KPIsPage: React.FC = () => {
  const [liveTrains] = useState<TrainType[]>(trainsData as TrainType[]);

  const priorityWeights = { Express: 10, Local: 4, Freight: 2, Special: 7 };

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

  const kpiData = useMemo(() => {
    const trains = liveTrains;
    if (!trains || trains.length === 0) {
      return {
        punctuality: 0, avgDelay: 0, throughputPercentage: 0, utilization: 0,
        throughputTrend: [], delaysByType: [], individualTrainPerformance: []
      };
    }

    const punctuality = Math.round((trains.filter(t => t.delay <= 5).length / trains.length) * 100);
    const avgDelay = calculateWeightedAvgDelay(trains);
    const maxThroughputScore = trains.reduce((score, train) => {
      const weight = priorityWeights[train.type as keyof typeof priorityWeights] || 0;
      return score + (weight * train.speed);
    }, 0);
    const currentThroughputScore = trains.reduce((score, train) => {
      const weight = priorityWeights[train.type as keyof typeof priorityWeights] || 0;
      const delayPenalty = Math.max(0, 1 - (train.delay / 60));
      return score + (weight * train.speed * delayPenalty);
    }, 0);
    const throughputPercentage = maxThroughputScore > 0 ? Math.round((currentThroughputScore / maxThroughputScore) * 100) : 0;

    const hourlyGroups = trains.reduce((acc, train) => {
      const hour = train.scheduledDeparture.split(':')[0];
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(train);
      return acc;
    }, {} as Record<string, TrainType[]>);

    const startHour = 6;
    const endHour = 18;
    const allHours = Array.from({ length: endHour - startHour + 1 }, (_, i) => (i + startHour).toString().padStart(2, '0'));

    const throughputTrend = allHours.map(hour => {
      const group = hourlyGroups[hour];
      if (group && group.length > 0) {
        const hourlyScore = group.reduce((score, train) => {
          const weight = priorityWeights[train.type as keyof typeof priorityWeights] || 0;
          const delayPenalty = Math.max(0, 1 - (train.delay / 60));
          return score + (weight * train.speed * delayPenalty);
        }, 0);
        return { time: `${hour}:00`, score: Math.round(hourlyScore) };
      }
      return { time: `${hour}:00`, score: 0 };
    });
    
    const typeGroups = trains.reduce((acc, train) => {
      if (!acc[train.type]) acc[train.type] = [];
      acc[train.type].push(train);
      return acc;
    }, {} as Record<string, TrainType[]>);

    const delaysByType = Object.keys(typeGroups).map(type => {
      const group = typeGroups[type];
      return { type, delay: calculateWeightedAvgDelay(group) };
    });

    // Data for the new "Punctuality Trend" line chart
    const individualTrainPerformance = trains.map(train => ({
      name: train.name,
      delay: train.delay,
    }));

    const utilization = Math.round((trains.length / 15) * 100);

    return { punctuality, avgDelay, throughputPercentage, utilization, throughputTrend, delaysByType, individualTrainPerformance };
  }, [liveTrains]);

  const getDelayColor = (delay: number) => {
    if (delay <= 5) return 'text-green-600';
    if (delay <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header and KPI Cards are unchanged */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KPIs & Analytics</h1>
        <p className="text-gray-600">Performance metrics and operational insights</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Punctuality</p>
                <p className="text-2xl font-bold text-green-600">{kpiData.punctuality}%</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Target className="w-3 h-3 mr-1" />
                  Target: 90%
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg"><Target className="w-6 h-6 text-green-600" /></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weighted Avg Delay</p>
                <p className={`text-2xl font-bold ${getDelayColor(kpiData.avgDelay)}`}>
                  {kpiData.avgDelay} min
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Target: &lt;5 min
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-yellow-600" /></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Throughput</p>
                <p className="text-2xl font-bold text-blue-600">{kpiData.throughputPercentage}%</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Efficiency Score
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg"><Train className="w-6 h-6 text-blue-600" /></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-purple-600">{kpiData.utilization}%</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Optimal: 75-85%
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg"><BarChart3 className="w-6 h-6 text-purple-600" /></div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <ActiveTrainsPieChart trains={liveTrains} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Weighted Avg Delay by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData.delaysByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis unit=" min" />
                <Tooltip />
                <Bar dataKey="delay" name="Weighted Avg Delay (min)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        
        {/* --- REPLACEMENT --- */}
        {/* Item 3: Punctuality Trend Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Punctuality Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={kpiData.individualTrainPerformance}
                margin={{ top: 5, right: 20, left: 10, bottom: 70 }} // Increased bottom margin for labels
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                <YAxis unit=" min" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="delay" name="Delay (min)" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hourly Throughput Score Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData.throughputTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                <Legend />
                <Bar dataKey="score" name="Throughput Score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};