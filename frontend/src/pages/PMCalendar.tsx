import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CheckCircle,
  Clock,
  User,
  Activity,
  X,
  FileCheck,
  Loader2,
} from 'lucide-react';

export const PMCalendar: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPm, setSelectedPm] = useState<any | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  // Checklist states
  const [calibrationOk, setCalibrationOk] = useState(false);
  const [filtersCleaned, setFiltersCleaned] = useState(false);
  const [batteryTested, setBatteryTested] = useState(false);
  const [generalRemarks, setGeneralRemarks] = useState('');

  // Fetch PM schedules
  const { data: pms, isLoading } = useQuery({
    queryKey: ['pms'],
    queryFn: async () => {
      const res = await api.get('/pms');
      return res.data || [];
    },
  });

  // Mutation: Complete PM
  const completeMutation = useMutation({
    mutationFn: (payload: { id: number; data: any }) => api.put(`/pms/${payload.id}/complete`, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pms'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('Preventive Maintenance completed and logged!');
      setCompleteModalOpen(false);
      setSelectedPm(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error completing PM');
    },
  });

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i),
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month padding
  const totalSlots = 42; // 6 rows * 7 days
  const remainingSlots = totalSlots - calendarDays.length;
  for (let i = 1; i <= remainingSlots; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDayEvents = (date: Date) => {
    if (!pms) return [];
    const dateString = date.toISOString().split('T')[0];
    return pms.filter((pm: any) => {
      const pmDateString = new Date(pm.scheduledDate).toISOString().split('T')[0];
      return pmDateString === dateString;
    });
  };

  const handleCompleteSubmit = () => {
    if (!selectedPm) return;
    const checklistStr = `1. Electrical & Calibration Tests: ${calibrationOk ? 'PASSED' : 'FAILED'} \n2. Air/Fluid Filters Cleaned: ${filtersCleaned ? 'YES' : 'NO'} \n3. Internal Battery Capacity Test: ${batteryTested ? 'PASSED' : 'FAILED'} \nRemarks: ${generalRemarks}`;

    const payload = {
      checklistReport: checklistStr,
      engineerId: selectedPm.installation.engineerId || 6, // default Tony Stark
      signature: 'Dr. Sarah Connor',
    };

    completeMutation.mutate({ id: selectedPm.id, data: payload });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar monthly Grid */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col justify-between">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-500" /> PM Schedule Calendar
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="font-bold text-sm text-slate-800 font-display min-w-[120px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Calendar Week Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Days Slots */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[360px]">
            {calendarDays.map((cell, idx) => {
              const dayEvents = getDayEvents(cell.date);
              return (
                <div
                  key={idx}
                  className={`p-2 border border-slate-100 rounded-xl min-h-[70px] flex flex-col justify-between relative transition-all ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-400'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold ${
                    cell.isCurrentMonth ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {cell.day}
                  </span>
                  
                  {/* Event indicators */}
                  <div className="space-y-1 mt-1">
                    {dayEvents.map((pm: any) => (
                      <div
                        key={pm.id}
                        onClick={() => setSelectedPm(pm)}
                        className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider cursor-pointer truncate ${
                          pm.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100 animate-pulse'
                        }`}
                      >
                        {pm.installation.machine.name.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected PM checklist view */}
        <div className="premium-card p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-6 border-b border-slate-100 pb-4">PM Ticket Details</h3>

          {isLoading ? (
            <div className="h-40 bg-slate-100 animate-pulse rounded-xl"></div>
          ) : selectedPm ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">PM CALENDAR UNIT</span>
                <h4 className="font-extrabold text-slate-800 text-sm">{selectedPm.installation.machine.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono">S/N: {selectedPm.installation.machine.serialNumber}</p>
              </div>

              <div className="space-y-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p><strong>Hospital Name:</strong> {selectedPm.installation.customer.name}</p>
                  <p><strong>Target Date:</strong> {new Date(selectedPm.scheduledDate).toLocaleDateString()}</p>
                  <p><strong>PM Status:</strong> <span className="font-bold uppercase text-blue-600">{selectedPm.status}</span></p>
                </div>
              </div>

              {selectedPm.status === 'COMPLETED' ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl space-y-2">
                  <h5 className="font-bold text-xs flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-500" /> PM Check Complete</h5>
                  <pre className="text-[10px] font-sans whitespace-pre-wrap leading-relaxed mt-1 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                    {selectedPm.checklistReport}
                  </pre>
                  <span className="text-[9px] text-slate-400 font-mono block pt-1">Actual date: {new Date(selectedPm.actualDate).toLocaleDateString()}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCalibrationOk(false);
                    setFiltersCleaned(false);
                    setBatteryTested(false);
                    setGeneralRemarks('');
                    setCompleteModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow shadow-blue-500/10 cursor-pointer"
                >
                  <ClipboardCheck className="h-4 w-4" /> Run PM Safety Check
                </button>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-xs py-8 text-center">Select a calendar event to view PM details.</p>
          )}
        </div>
      </div>

      {/* Complete PM Checklist Modal */}
      <AnimatePresence>
        {completeModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setCompleteModalOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden z-10 shadow-2xl p-6 space-y-5"
            >
              <h4 className="font-extrabold text-slate-800 text-md">PM Diagnostic Checklist</h4>

              {/* Checkboxes items */}
              <div className="space-y-4 pt-2">
                <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calibrationOk}
                    onChange={(e) => setCalibrationOk(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700">Electrical & Calibration Tests</p>
                    <p className="text-slate-400 text-[10px]">Verify voltage calibration values are in range</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtersCleaned}
                    onChange={(e) => setFiltersCleaned(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700">Air/Fluid Filters Servicing</p>
                    <p className="text-slate-400 text-[10px]">Clean filters or replace them if necessary</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batteryTested}
                    onChange={(e) => setBatteryTested(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700">Internal Battery Capacity Test</p>
                    <p className="text-slate-400 text-[10px]">Run battery load check to verify backup power</p>
                  </div>
                </label>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks / Observation Notes</label>
                  <textarea
                    placeholder="Describe any diagnostic comments..."
                    value={generalRemarks}
                    onChange={(e) => setGeneralRemarks(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSubmit}
                  disabled={completeMutation.isPending}
                  className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-500 shadow flex items-center gap-2 cursor-pointer"
                >
                  {completeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log PM Visit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default PMCalendar;
