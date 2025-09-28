import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useToast } from '../hooks/useToast';
import { 
  Settings, 
  Train, 
  Signal, 
  MapPin,
  Bell,
  Shield,
  Save,
  RefreshCw,
  BellOff
} from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isAudioUnlocked, unlockAudio, isAlarmEnabled, toggleAlarmPreference } = useTimer();

  const [sectionConfig, setSectionConfig] = useState({
    sectionName: 'Northern Railway - Delhi Division',
    totalTracks: 6,
    platforms: 8,
    signals: 24,
    maxTrainsPerHour: 30,
    emergencyBuffer: 5,
    maintenanceWindow: '02:00-04:00'
  });

  const [notifications, setNotifications] = useState({
    delayAlerts: true,
    conflictWarnings: true,
    systemUpdates: true,
    emergencyAlerts: true,
    emailReports: true
  });

  const [systemSettings, setSystemSettings] = useState({
    autoRefreshInterval: 30,
    conflictDetectionSensitivity: 'Medium',
    backupFrequency: 'Hourly',
    logRetentionDays: 90
  });

  const handleSectionConfigChange = (field: string, value: string | number) => {
    setSectionConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemSettingChange = (field: string, value: string | number) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = () => {
    // Simulate API call to save settings
    setTimeout(() => {
      showToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'All configuration changes have been saved successfully.'
      });
    }, 500);
  };

  const resetToDefaults = () => {
    setSectionConfig({
      sectionName: 'Northern Railway - Delhi Division',
      totalTracks: 6,
      platforms: 8,
      signals: 24,
      maxTrainsPerHour: 30,
      emergencyBuffer: 5,
      maintenanceWindow: '02:00-04:00'
    });
    
    setNotifications({
      delayAlerts: true,
      conflictWarnings: true,
      systemUpdates: true,
      emergencyAlerts: true,
      emailReports: true
    });

    setSystemSettings({
      autoRefreshInterval: 30,
      conflictDetectionSensitivity: 'Medium',
      backupFrequency: 'Hourly',
      logRetentionDays: 90
    });

    showToast({
      type: 'info',
      title: 'Settings Reset',
      message: 'All settings have been reset to default values.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure section parameters and system preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={resetToDefaults} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* NEW: Audio Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold">Audio Settings</h2>
          </div>

          {/* Enable Audio Row */}
          {!isAudioUnlocked && (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <h3 className="font-medium text-yellow-900">Browser Permission Required</h3>
                <p className="text-yellow-700 text-sm">
                  Click the button to enable sound for this session.
                </p>
              </div>
              <Button onClick={unlockAudio} variant="secondary">
                <BellOff className="w-4 h-4 mr-2" />
                Enable Sound Alerts
              </Button>
            </div>
          )}

          {/* Toggle Switch Row */}
          <div className={`flex items-center justify-between mt-4 ${!isAudioUnlocked ? 'opacity-50' : ''}`}>
            <div>
              <h3 className="font-medium">Audible Alarm Toggle</h3>
              <p className="text-gray-500 text-sm">
                Turn critical conflict alarms on or off.
              </p>
            </div>
            <button
              onClick={toggleAlarmPreference}
              disabled={!isAudioUnlocked}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:cursor-not-allowed ${
                isAlarmEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAlarmEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Train className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Section Configuration</h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Section Name"
                value={sectionConfig.sectionName}
                onChange={(e) => handleSectionConfigChange('sectionName', e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Total Tracks"
                  type="number"
                  value={sectionConfig.totalTracks}
                  onChange={(e) => handleSectionConfigChange('totalTracks', parseInt(e.target.value))}
                />
                <Input
                  label="Platforms"
                  type="number"
                  value={sectionConfig.platforms}
                  onChange={(e) => handleSectionConfigChange('platforms', parseInt(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Total Signals"
                  type="number"
                  value={sectionConfig.signals}
                  onChange={(e) => handleSectionConfigChange('signals', parseInt(e.target.value))}
                />
                <Input
                  label="Max Trains/Hour"
                  type="number"
                  value={sectionConfig.maxTrainsPerHour}
                  onChange={(e) => handleSectionConfigChange('maxTrainsPerHour', parseInt(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Emergency Buffer (min)"
                  type="number"
                  value={sectionConfig.emergencyBuffer}
                  onChange={(e) => handleSectionConfigChange('emergencyBuffer', parseInt(e.target.value))}
                />
                <Input
                  label="Maintenance Window"
                  value={sectionConfig.maintenanceWindow}
                  onChange={(e) => handleSectionConfigChange('maintenanceWindow', e.target.value)}
                  placeholder="HH:MM-HH:MM"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Theme and Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">Display & Appearance</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Theme Selection
                </label>
                <ThemeToggle />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto Refresh Interval
                </label>
                <select
                  value={systemSettings.autoRefreshInterval}
                  onChange={(e) => handleSystemSettingChange('autoRefreshInterval', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conflict Detection Sensitivity
                </label>
                <select
                  value={systemSettings.conflictDetectionSensitivity}
                  onChange={(e) => handleSystemSettingChange('conflictDetectionSensitivity', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical Only</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <button
                    onClick={() => handleNotificationChange(key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">System Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={systemSettings.backupFrequency}
                  onChange={(e) => handleSystemSettingChange('backupFrequency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                >
                  <option value="Hourly">Every Hour</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <Input
                label="Log Retention (days)"
                type="number"
                value={systemSettings.logRetentionDays}
                onChange={(e) => handleSystemSettingChange('logRetentionDays', parseInt(e.target.value))}
                helperText="Number of days to keep audit logs"
              />

              <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Signal className="w-4 h-4 mr-2" />
                    Test Signal Connectivity
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Calibrate Position System
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset System Cache
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-3">
                <Shield className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">System Health</p>
              <p className="text-lg font-bold text-green-600">Excellent</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg mb-3">
                <Signal className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Signal Status</p>
              <p className="text-lg font-bold text-blue-600">24/24 Active</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-lg mb-3">
                <Train className="w-8 h-8 text-yellow-600 mx-auto" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Track Status</p>
              <p className="text-lg font-bold text-yellow-600">6/6 Operational</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-lg mb-3">
                <Settings className="w-8 h-8 text-purple-600 mx-auto" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Last Update</p>
              <p className="text-lg font-bold text-purple-600">2 min ago</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};