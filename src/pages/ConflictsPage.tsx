import React, { useState,   } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Eye,
  XCircle,
  Settings,
  Save,
  Edit // NEW: Imported Edit icon
} from 'lucide-react';
import conflictsData from '../data/conflicts.json';
import { Conflict } from '../types';
import { useToast } from '../hooks/useToast';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';

export const ConflictsPage: React.FC = () => {
  const [conflicts, setConflicts] = useState<Conflict[]>(() => {
    const savedConflicts = localStorage.getItem('conflictsState');
    if (savedConflicts) {
      return JSON.parse(savedConflicts);
    } else {
      return conflictsData as Conflict[];
    }
  });
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [overrideConflict, setOverrideConflict] = useState<Conflict | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const { showToast } = useToast();
  const { isTimerActive, countdown, stopAlarm, stopCriticalTimer } = useTimer();
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);

  useEffect(() => {
    localStorage.setItem('conflictsState', JSON.stringify(conflicts));
  }, [conflicts]);

  useEffect(() => {
    // Check for pending critical conflicts in the CURRENT state
    const hasCriticalPendingConflict = conflicts.some(
      c => c.severity === 'Critical' && c.status === 'Pending'
    );
    // Only show the alert if the timer is active AND a critical conflict still exists
    if (isTimerActive && hasCriticalPendingConflict) {
      setShowCriticalAlert(true);
    } else {
      setShowCriticalAlert(false);
    }
  }, [isTimerActive, conflicts]); // <-- IMPORTANT: Add 'conflicts' to the dependency array
 
  // Helper to format the countdown time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const filteredConflicts = conflicts.filter(conflict => {
    const matchesStatus = statusFilter === 'All' || conflict.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || conflict.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const handleResolve = (conflictId: string) => {
    stopAlarm();
    setConflicts(prev => {
      const newConflicts = prev.map(conflict =>
        conflict.id === conflictId
          ? { ...conflict, status: 'Resolved' as const, resolvedAt: new Date().toISOString() }
          : conflict
      );

      // Check if there are any critical pending conflicts LEFT
      const hasMoreCritical = newConflicts.some(
        c => c.severity === 'Critical' && c.status === 'Pending'
      );

      // If not, stop the master timer
      if (!hasMoreCritical) {
        stopCriticalTimer();
      }

      return newConflicts;
    });

    showToast({
      type: 'success',
      title: 'Conflict Resolved',
      message: 'The conflict has been resolved successfully.'
    });

    setSelectedConflict(null);
  };

  //NEW handleViewConflicts FUNCTION HERE
  const handleViewConflicts = () => {
    const firstCritical = conflicts.find(
      (c) => c.severity === 'Critical' && c.status === 'Pending'
    );

    if (firstCritical) {
      const element = document.getElementById(`conflict-${firstCritical.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Find the button within the card and click it
      const detailsButton = element?.querySelector('.details-button');

      // Use a short timeout to ensure the scroll has finished
      setTimeout(() => {
        if (detailsButton instanceof HTMLElement) {
          detailsButton.click();
        }
      }, 500); // 500ms delay
    }
    setShowCriticalAlert(false);
  };

  // NEW: Function to revert a conflict to Pending status
  const handleEdit = (conflictId: string) => {
    setConflicts(prev =>
      prev.map(conflict => {
        if (conflict.id === conflictId) {
          // FIXED: Safely create a new object without resolution-specific properties
          const { overrideReason, resolvedAt, ...restOfConflict } = conflict;
          return {
            ...restOfConflict,
            status: 'Pending' as const,
          };
        }
        return conflict;
      })
    );

    showToast({
      type: 'info',
      title: 'Conflict Re-opened',
      message: 'The conflict status has been reset to Pending.'
    });
  };

  const handleOverride = (conflictId: string) => {
    if (!overrideReason.trim()) {
      showToast({
        type: 'error',
        title: 'Reason Required',
        message: 'Please provide a reason for overriding this conflict.'
      });
      return;
    }
    stopAlarm();
    setConflicts(prev =>
      prev.map(conflict =>
        conflict.id === conflictId
          ? {
            ...conflict,
            status: 'Overridden' as const,
            overrideReason: overrideReason,
            resolvedAt: new Date().toISOString()
          }
          : conflict
      )
    );

    showToast({
      type: 'warning',
      title: 'Conflict Overridden',
      message: 'The conflict has been manually overridden.'
    });

    setOverrideConflict(null);
    setOverrideReason('');
  };

  const handleResetConflicts = () => {
    localStorage.removeItem('conflictsState');
    setConflicts(conflictsData as Conflict[]);
    showToast({
      type: 'info',
      title: 'Conflicts Reset',
      message: 'All conflicts have been reset to their default state.',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-red-600';
      case 'Resolved':
        return 'text-green-600';
      case 'Overridden':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Overridden':
        return <Settings className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const pendingCount = conflicts.filter(c => c.status === 'Pending').length;
  const resolvedCount = conflicts.filter(c => c.status === 'Resolved').length;
  const overriddenCount = conflicts.filter(c => c.status === 'Overridden').length;
  // FIXED: Removed the unused 'criticalCount' variable

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conflict Management</h1>
        <p className="text-gray-600">Monitor and resolve railway section conflicts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overridden</p>
              <p className="text-2xl font-bold text-gray-900">{overriddenCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900">12m</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Conflicts List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">All Conflicts</h2>
          <div className="flex items-center space-x-4">
            <Button onClick={handleResetConflicts} variant="outline" size="sm">
              Reset All
            </Button>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Overridden">Overridden</option>
              </select>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConflicts.map((conflict, index) => (
            <motion.div
              key={conflict.id}
              id={`conflict-${conflict.id}`} // <-- ADD THIS LINE
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(conflict.severity)}`}>
                    {conflict.severity}
                  </span>
                  <div className={`flex items-center space-x-1 ${getStatusColor(conflict.status)}`}>
                    {getStatusIcon(conflict.status)}
                    <span className="text-sm font-medium">{conflict.status}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{conflict.type}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{conflict.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>Trains: {conflict.trainA}, {conflict.trainB}</span>
                  <span>{new Date(conflict.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="bg-blue-50 p-3 rounded mb-4">
                  <p className="text-blue-900 text-sm font-medium mb-1">Recommendation:</p>
                  <p className="text-blue-800 text-sm">{conflict.recommendation.action}</p>
                </div>
              </div>

              <div className="flex space-x-2 mt-auto pt-4 border-t">
                <Button
                  onClick={() => setSelectedConflict(conflict)}
                  size="sm"
                  variant="outline"
                  className="flex-1 details-button"
                > 
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                {/* NEW: Conditional rendering for action buttons */}
                {conflict.status === 'Pending' ? (
                  <>
                    <Button
                      onClick={() => handleResolve(conflict.id)}
                      size="sm"
                      variant="success"
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                    <Button
                      onClick={() => setOverrideConflict(conflict)}
                      size="sm"
                      variant="secondary" // FIXED: Changed variant from "warning" to "secondary"
                      className="flex-1"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Override
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleEdit(conflict.id)}
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* --- ALL MODALS REMAIN THE SAME --- */}
      {/* Conflict Detail Modal */}
      {selectedConflict && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedConflict(null)}
          title="Conflict Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedConflict.type}</h3>
                <p className="text-gray-600">{selectedConflict.id}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(selectedConflict.severity)}`}>
                  {selectedConflict.severity} Priority
                </span>
                <div className={`flex items-center space-x-2 ${getStatusColor(selectedConflict.status)}`}>
                  {getStatusIcon(selectedConflict.status)}
                  <span className="font-medium">{selectedConflict.status}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{selectedConflict.description}</p>
            </div>

            {/* Train Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Train A</h4>
                <p className="text-blue-800">{selectedConflict.trainA}</p>
                <p className="text-blue-700 text-sm mt-1">Primary affected train</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Train B</h4>
                <p className="text-blue-800">{selectedConflict.trainB}</p>
                <p className="text-blue-700 text-sm mt-1">Secondary affected train</p>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Location Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedConflict.platform && (
                  <div>
                    <span className="font-medium">Platform:</span> {selectedConflict.platform}
                  </div>
                )}
                {selectedConflict.signal && (
                  <div>
                    <span className="font-medium">Signal:</span> {selectedConflict.signal}
                  </div>
                )}
                {selectedConflict.track && (
                  <div>
                    <span className="font-medium">Track:</span> {selectedConflict.track}
                  </div>
                )}
                {selectedConflict.block && (
                  <div>
                    <span className="font-medium">Block:</span> {selectedConflict.block}
                  </div>
                )}
              </div>
            </div>

            {/* System Recommendation */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">System Recommendation</h4>
              <p className="text-green-800 mb-2">{selectedConflict.recommendation.action}</p>
              <p className="text-green-700 text-sm mb-3">{selectedConflict.recommendation.details}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Estimated Delay:</span> {selectedConflict.recommendation.estimatedDelay} minutes
                </div>
                {selectedConflict.recommendation.alternativePlatform && (
                  <div>
                    <span className="font-medium">Alternative Platform:</span> {selectedConflict.recommendation.alternativePlatform}
                  </div>
                )}
                {selectedConflict.recommendation.alternativeRoute && (
                  <div>
                    <span className="font-medium">Alternative Route:</span> {selectedConflict.recommendation.alternativeRoute}
                  </div>
                )}
              </div>
            </div>

            {/* Override Reason (if overridden) */}
            {selectedConflict.status === 'Overridden' && selectedConflict.overrideReason && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Override Reason</h4>
                <p className="text-yellow-800">{selectedConflict.overrideReason}</p>
                {selectedConflict.resolvedAt && (
                  <p className="text-yellow-700 text-sm mt-2">
                    Overridden at: {new Date(selectedConflict.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Timeline</h4>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Detected at: {format(new Date(selectedConflict.timestamp), 'dd-MM-yyyy p')}</span>

              </div>
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <Clock className="w-4 h-4 mr-2" />
                <span>Scheduled time: {selectedConflict.time}</span>
              </div>
            </div>

            {/* Actions */}
            {selectedConflict.status === 'Pending' && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  onClick={() => setSelectedConflict(null)}
                  variant="outline"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setOverrideConflict(selectedConflict)}
                  variant="secondary" // FIXED: Changed variant from "warning" to "secondary"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manual Override
                </Button>
                <Button
                  onClick={() => handleResolve(selectedConflict.id)}
                  variant="success"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Override Modal */}
      {overrideConflict && (
        <Modal
          isOpen={true}
          onClose={() => {
            setOverrideConflict(null);
            setOverrideReason('');
          }}
          title="Manual Override"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{overrideConflict.type}</h3>
              <p className="text-gray-600 text-sm">{overrideConflict.id}</p>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Warning:</strong> You are about to manually override this conflict.
                Please provide a detailed reason for this action.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Override *
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why you are overriding the system recommendation..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => {
                  setOverrideConflict(null);
                  setOverrideReason('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleOverride(overrideConflict.id)}
                variant="secondary" // FIXED: Changed variant from "warning" to "secondary"
                disabled={!overrideReason.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Confirm Override
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* Critical Alert Modal */}
      {showCriticalAlert && (
        <Modal
          isOpen={true}
          onClose={() => setShowCriticalAlert(false)}
          title="Critical Conflict Alert"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-red-900 font-semibold text-lg mb-2">Immediate Action Required</h3>
              <p className="text-red-800">
                There are critical conflicts pending resolution. Please address these conflicts within the next <strong>{formatTime(countdown)}</strong> to avoid any collisions or incidents.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => setShowCriticalAlert(false)}
                variant="outline"
              >
                Dismiss
              </Button>
              <Button
                 onClick={handleViewConflicts}
                variant="danger"
              >
                View Conflicts
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};