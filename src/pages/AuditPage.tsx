import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Download,
  Filter,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search
} from 'lucide-react';
import auditLogsData from '../data/auditLogs.json';
import { AuditLog } from '../types';
import { useToast } from '../hooks/useToast';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(auditLogsData as AuditLog[]);
  const [filterAction, setFilterAction] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const { showToast } = useToast();

  // Add some dynamic logs for demo
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newLog: AuditLog = {
        id: `LOG${Date.now()}`,
        timestamp: new Date().toISOString(),
        controller: 'Rajesh Kumar',
        action: ['Conflict Resolution', 'Manual Override', 'Route Change'][Math.floor(Math.random() * 3)],
        trainId: `${12000 + Math.floor(Math.random() * 1000)}`,
        suggestion: 'System recommendation accepted',
        actionTaken: 'Accepted',
        overrideReason: null,
        impact: `${Math.floor(Math.random() * 10) + 1} min delay avoided`,
        status: 'Completed'
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep only latest 50 logs
    }, 15000); // Add new log every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'All' || log.action === filterAction;
    const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
    const matchesSearch = log.trainId.includes(searchTerm) ||
      log.controller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering
    const logDate = new Date(log.timestamp);
    const today = new Date();
    const isToday = logDate.toDateString() === today.toDateString();
    const isThisWeek = (today.getTime() - logDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);

    let matchesDate = true;
    if (dateRange === 'today') matchesDate = isToday;
    else if (dateRange === 'week') matchesDate = isThisWeek;

    return matchesAction && matchesStatus && matchesSearch && matchesDate;
  });

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Controller', 'Action', 'Train ID', 'Suggestion', 'Action Taken', 'Override Reason', 'Impact', 'Status'],
      ...filteredLogs.map(log => [
        // FIX: Replaced the comma in the timestamp to prevent it from splitting into two cells.
        new Date(log.timestamp).toLocaleString().replace(',', ''),
        log.controller,
        log.action,
        log.trainId,
        log.suggestion,
        log.actionTaken,
        log.overrideReason || 'N/A',
        log.impact,
        log.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Export Successful',
      message: `${filteredLogs.length} audit logs exported to CSV file.`
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Conflict Resolution':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Manual Override':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'Route Change':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Conflict Resolution':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Manual Override':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Route Change':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const actionTypes = ['All', 'Conflict Resolution', 'Manual Override', 'Route Change', 'Emergency Action'];
  const statusTypes = ['All', 'Completed', 'Pending', 'Failed'];

  const stats = {
    total: filteredLogs.length,
    completed: filteredLogs.filter(l => l.status === 'Completed').length,
    overrides: filteredLogs.filter(l => l.action === 'Manual Override').length,
    conflicts: filteredLogs.filter(l => l.action === 'Conflict Resolution').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Controller actions and system decisions log</p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overrides</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overrides}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conflicts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conflicts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Logs */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-xl font-semibold">Activity Log</h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {actionTypes.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusTypes.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm font-medium text-gray-900">Train {log.trainId}</span>
                      <span className="text-sm text-gray-500">by {log.controller}</span>
                    </div>

                    <div className="text-sm text-gray-700">
                      <p><span className="font-medium">Suggestion:</span> {log.suggestion}</p>
                      <p><span className="font-medium">Action Taken:</span> {log.actionTaken}</p>
                      {log.overrideReason && (
                        <p><span className="font-medium text-red-600">Override Reason:</span> {log.overrideReason}</p>
                      )}
                      <p><span className="font-medium">Impact:</span> {log.impact}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                  <div className="text-right text-xs text-gray-500">
                    <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p>{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found matching your criteria.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};