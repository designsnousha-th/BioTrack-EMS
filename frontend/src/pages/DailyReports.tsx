import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  X,
  PlusCircle,
  Building,
  Users,
  Phone,
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export const DailyReports: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'SUBMIT' | 'HISTORY' | 'REVIEW'>('SUBMIT');

  // Input states for report tags
  const [visitInput, setVisitInput] = useState('');
  const [meetingInput, setMeetingInput] = useState('');
  const [callInput, setCallInput] = useState('');

  // Form states
  const [hospitalVisits, setHospitalVisits] = useState<string[]>([]);
  const [meetings, setMeetings] = useState<string[]>([]);
  const [calls, setCalls] = useState<string[]>([]);
  const [workCompleted, setWorkCompleted] = useState('');
  const [problems, setProblems] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');

  // Audit modal states
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // AI Generation Simulation
  const [aiSynthesizing, setAiSynthesizing] = useState(false);

  const isManager = ['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'SALES_MANAGER'].includes(user?.role || '');

  // Queries
  const { data: reportsList, isLoading } = useQuery({
    queryKey: ['daily-reports-list'],
    queryFn: async () => {
      const res = await api.get('/daily-reports');
      return res.data || [];
    },
  });

  // Mutations: Create Report
  const createReportMutation = useMutation({
    mutationFn: (data: any) => api.post('/daily-reports', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports-list'] });
      toast.success('Daily report submitted successfully!');
      // Reset form
      setHospitalVisits([]);
      setMeetings([]);
      setCalls([]);
      setWorkCompleted('');
      setProblems('');
      setTomorrowPlan('');
      setActiveTab('HISTORY');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error submitting report');
    },
  });

  // Mutations: Review Report
  const reviewReportMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/daily-reports/${id}/review`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reports-list'] });
      toast.success('Report reviewed and status updated.');
      setAuditModalOpen(false);
      setSelectedReport(null);
      setReviewRemarks('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error saving review remarks');
    },
  });

  // AI Narrative Synthesizer
  const handleAISynthesize = () => {
    if (hospitalVisits.length === 0 && meetings.length === 0 && calls.length === 0) {
      toast.error('Add some visits, meetings, or calls first to synthesize a report!');
      return;
    }
    setAiSynthesizing(true);
    setTimeout(() => {
      const visitsText = hospitalVisits.length > 0 ? `Completed field site visits at ${hospitalVisits.join(', ')}.` : '';
      const meetingsText = meetings.length > 0 ? `Conducted technical alignment meetings regarding ${meetings.join('; ')}.` : '';
      const callsText = calls.length > 0 ? `Handled support and follow-up consultation calls with ${calls.join(', ')}.` : '';
      
      setWorkCompleted(
        `[AI Synthesized Narrative]\n${visitsText} ${meetingsText} ${callsText}\nInspected active installations, verified scanning calibration matrices, and confirmed normal operation values.`
      );
      setTomorrowPlan('Conduct follow-up maintenance reviews, finalize service ticket signatures, and restock catalog spare parts.');
      setAiSynthesizing(false);
      toast.success('AI Synthesizer generated narrative summary!');
    }, 1200);
  };

  const handleAddTag = (
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!input.trim()) return;
    if (list.includes(input.trim())) {
      toast.error('Entry already added!');
      return;
    }
    setList([...list, input.trim()]);
    setInput('');
  };

  const handleRemoveTag = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(list.filter((x) => x !== item));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workCompleted || !tomorrowPlan) {
      toast.error('Work Completed and Tomorrow\'s Plan are required!');
      return;
    }
    createReportMutation.mutate({
      workCompleted,
      problems: problems || undefined,
      tomorrowPlan,
      hospitalVisits,
      meetings,
      calls,
    });
  };

  const triggerOpenReview = (report: any) => {
    setSelectedReport(report);
    setReviewRemarks(report.reviewRemarks || '');
    setAuditModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7 text-blue-600" /> Daily Activity Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log site visits, customer calls, and daily progress narratives with minimal typing.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1 max-w-[420px]">
          <button
            onClick={() => setActiveTab('SUBMIT')}
            className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'SUBMIT' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Log
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'HISTORY' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            History
          </button>
          {isManager && (
            <button
              onClick={() => setActiveTab('REVIEW')}
              className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer relative ${
                activeTab === 'REVIEW' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Audits
              {reportsList?.filter((r: any) => r.status === 'PENDING').length > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-black animate-pulse">
                  {reportsList.filter((r: any) => r.status === 'PENDING').length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: SUBMIT REPORT */}
        {activeTab === 'SUBMIT' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key="submit"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Fields Column */}
            <div className="lg:col-span-2 premium-card p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">File Activity Report</h3>
                <button
                  type="button"
                  onClick={handleAISynthesize}
                  disabled={aiSynthesizing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${aiSynthesizing ? 'animate-spin' : ''}`} />
                  AI Synthesize
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
                {/* Horizontal Quick Tag List Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Visits */}
                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <Building className="h-3.5 w-3.5 text-blue-500" /> Hospital Visits
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Fortis"
                        value={visitInput}
                        onChange={(e) => setVisitInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(visitInput, setVisitInput, hospitalVisits, setHospitalVisits))}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(visitInput, setVisitInput, hospitalVisits, setHospitalVisits)}
                        className="p-2 bg-blue-600 text-white hover:bg-blue-500 rounded-xl"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hospitalVisits.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded border border-blue-100">
                          {item}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(item, hospitalVisits, setHospitalVisits)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meetings */}
                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <Users className="h-3.5 w-3.5 text-emerald-500" /> Meetings
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Director PO"
                        value={meetingInput}
                        onChange={(e) => setMeetingInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(meetingInput, setMeetingInput, meetings, setMeetings))}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(meetingInput, setMeetingInput, meetings, setMeetings)}
                        className="p-2 bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {meetings.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded border border-emerald-100">
                          {item}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(item, meetings, setMeetings)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Calls */}
                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <Phone className="h-3.5 w-3.5 text-purple-500" /> Support Calls
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Dr. Roy"
                        value={callInput}
                        onChange={(e) => setCallInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(callInput, setCallInput, calls, setCalls))}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(callInput, setCallInput, calls, setCalls)}
                        className="p-2 bg-purple-600 text-white hover:bg-purple-500 rounded-xl"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {calls.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded border border-purple-100">
                          {item}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(item, calls, setCalls)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Narratives */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Work Completed today</label>
                  <textarea
                    rows={4}
                    placeholder="Details about client interactions, hardware calibrations, spare parts consumption, or repairs..."
                    value={workCompleted}
                    onChange={(e) => setWorkCompleted(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs leading-relaxed"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Problems / Blockers (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Spare transducer out of stock; purchase order pending approval..."
                    value={problems}
                    onChange={(e) => setProblems(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs leading-relaxed"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tomorrow's Activity Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="Visits or follow-up schedules planned for tomorrow..."
                    value={tomorrowPlan}
                    onChange={(e) => setTomorrowPlan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={createReportMutation.isPending}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {createReportMutation.isPending ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" /> Submit Report Log
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar quick counts info */}
            <div className="space-y-6">
              <div className="premium-card p-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Summary Guidelines
                </h3>
                <div className="text-xs text-slate-500 space-y-3 leading-relaxed">
                  <p>
                    Daily reports help the management track engineering performance and customer follow-up statuses.
                  </p>
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <p className="font-semibold text-slate-700">Recommended Steps:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Use the **AI Synthesize** wizard to auto-compile lists into narratives.</li>
                      <li>Highlight critical parts shortages or hospital access blockers in the **Problems** section.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SUBMISSIONS HISTORY */}
        {activeTab === 'HISTORY' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key="history"
            className="premium-card p-6"
          >
            <h3 className="font-bold text-slate-800 text-sm mb-6">Submitted Activity Logs</h3>

            <div className="space-y-4">
              {isLoading ? (
                <p className="text-xs text-slate-400">Loading submission records...</p>
              ) : reportsList && reportsList.length > 0 ? (
                reportsList.map((report: any) => (
                  <div key={report.id} className="p-4 border border-slate-100 hover:border-slate-200 rounded-2xl bg-slate-50/20 text-xs transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{report.user.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({new Date(report.date).toLocaleDateString()})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                          report.status === 'REVIEWED'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Visits</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.hospitalVisits && report.hospitalVisits.length > 0 ? (
                            report.hospitalVisits.map((v: string) => (
                              <span key={v} className="px-1.5 py-0.5 bg-blue-50/50 text-blue-600 text-[9px] rounded font-semibold border border-blue-100/50">{v}</span>
                            ))
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px] italic">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Meetings</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.meetings && report.meetings.length > 0 ? (
                            report.meetings.map((m: string) => (
                              <span key={m} className="px-1.5 py-0.5 bg-emerald-50/50 text-emerald-600 text-[9px] rounded font-semibold border border-emerald-100/50">{m}</span>
                            ))
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px] italic">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Calls</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.calls && report.calls.length > 0 ? (
                            report.calls.map((c: string) => (
                              <span key={c} className="px-1.5 py-0.5 bg-purple-50/50 text-purple-600 text-[9px] rounded font-semibold border border-purple-100/50">{c}</span>
                            ))
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px] italic">None</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Work Completed</span>
                      <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100/50 whitespace-pre-line">{report.workCompleted}</p>
                    </div>

                    {report.problems && (
                      <div className="space-y-1 p-2 bg-red-50/30 border border-red-100/30 rounded-xl">
                        <span className="text-[9px] text-red-500 font-bold uppercase block flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> Blockers & Problems
                        </span>
                        <p className="text-red-700 leading-relaxed">{report.problems}</p>
                      </div>
                    )}

                    {report.reviewRemarks && (
                      <div className="space-y-1 p-2.5 bg-emerald-50/30 border border-emerald-100/30 rounded-xl">
                        <span className="text-[9px] text-emerald-600 font-bold uppercase block flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Manager Audit Comments ({report.reviewedBy?.name})
                        </span>
                        <p className="text-emerald-800 font-medium italic">"{report.reviewRemarks}"</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">No daily activity reports logged yet.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: MANAGER AUDITS BOARD */}
        {activeTab === 'REVIEW' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key="review"
            className="premium-card p-6"
          >
            <h3 className="font-bold text-slate-800 text-sm mb-6">Review Queue & Auditing</h3>

            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <p className="text-xs text-slate-400">Loading audit queues...</p>
              ) : reportsList && reportsList.length > 0 ? (
                reportsList.map((report: any) => (
                  <div key={report.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{report.user.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({new Date(report.date).toLocaleDateString()})</span>
                      </div>
                      <p className="text-slate-500 mt-1 truncate max-w-lg">{report.workCompleted}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          report.status === 'REVIEWED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {report.status}
                        </span>
                        {report.hospitalVisits?.length > 0 && (
                          <span className="text-[10px] text-slate-400">• {report.hospitalVisits.length} visits</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => triggerOpenReview(report)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-all self-start md:self-auto cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Log
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">No reports in audit queue.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Remarks Modal Dialog */}
      <AnimatePresence>
        {auditModalOpen && selectedReport && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setAuditModalOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden z-10 shadow-2xl flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Audit Activity Log: {selectedReport.user.name}
                </h4>
                <button onClick={() => setAuditModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Work Narrative</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line mt-1">
                    {selectedReport.workCompleted}
                  </p>
                </div>

                {selectedReport.problems && (
                  <div>
                    <span className="text-[10px] text-red-500 font-bold uppercase block">Reported Problems</span>
                    <p className="text-red-700 bg-red-50/50 p-2.5 rounded-xl border border-red-100 leading-relaxed mt-1">
                      {selectedReport.problems}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tomorrow's Objectives</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed mt-1">
                    {selectedReport.tomorrowPlan}
                  </p>
                </div>

                {/* Audit Form */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Review Remarks</span>
                  <textarea
                    rows={3}
                    placeholder="Enter audit feedback or remarks..."
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
                <button
                  onClick={() => setAuditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => reviewReportMutation.mutate({
                    id: selectedReport.id,
                    data: { status: 'REVIEWED', reviewRemarks },
                  })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Mark Reviewed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default DailyReports;
