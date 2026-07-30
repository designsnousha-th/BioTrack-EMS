import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Plus,
  Search,
  UserCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  ClipboardList,
  Activity,
  X,
  CreditCard,
  Edit,
  Trash,
  Loader2,
  FileSignature,
} from 'lucide-react';

const createCallSchema = z.object({
  customerId: z.string().min(1, 'Select a hospital'),
  installationId: z.string().min(1, 'Select the installed machine'),
  reportedProblem: z.string().min(5, 'Describe the issue (min 5 chars)'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assignedEngineerId: z.string().optional(),
});

type CreateCallFormData = z.infer<typeof createCallSchema>;

export const ServiceCalls: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [targetBulkEngineer, setTargetBulkEngineer] = useState('');

  // Signature canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Completion Form State
  const [completeObservation, setCompleteObservation] = useState('');
  const [completeRemarks, setCompleteRemarks] = useState('');
  const [completeLabor, setCompleteLabor] = useState('0');
  const [completeTravel, setCompleteTravel] = useState('0');
  const [completeParts, setCompleteParts] = useState<{ partId: number; qty: number }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateCallFormData>({
    resolver: zodResolver(createCallSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const watchCustomerId = watch('customerId');

  // Queries
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', search, filterStatus, filterPriority],
    queryFn: async () => {
      const res = await api.get('/service-calls', {
        params: { search, status: filterStatus, priority: filterPriority },
      });
      return res.data;
    },
  });

  const { data: ticketDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['ticket', selectedCallId],
    queryFn: async () => {
      if (!selectedCallId) return null;
      const res = await api.get(`/service-calls/${selectedCallId}`);
      return res.data;
    },
    enabled: !!selectedCallId,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-calls-select'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data?.items || [];
    },
  });

  // Fetch installed items for selected customer
  const { data: customerInstallations } = useQuery({
    queryKey: ['customer-installations-select', watchCustomerId],
    queryFn: async () => {
      if (!watchCustomerId) return [];
      const res = await api.get('/installations', {
        params: { customerId: watchCustomerId },
      });
      return res.data || [];
    },
    enabled: !!watchCustomerId,
  });

  const { data: engineers } = useQuery({
    queryKey: ['engineers-calls-select'],
    queryFn: async () => {
      const res = await api.get('/auth/engineers');
      return res.data || [];
    },
  });

  const { data: spareParts } = useQuery({
    queryKey: ['spare-parts-select'],
    queryFn: async () => {
      const res = await api.get('/inventory');
      return res.data || [];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/service-calls', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Service call logged successfully!');
      setCreateModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error creating service call');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: any }) => api.put(`/service-calls/${payload.id}`, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', selectedCallId] });
      toast.success('Ticket closed and inventory updated!');
      setCompleteModalOpen(false);
      setSelectedCallId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error closing ticket');
    },
  });

  const bulkAssignMutation = useMutation({
    mutationFn: (payload: { ids: number[]; engineerId: number }) => api.post('/service-calls/bulk-assign', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Tickets assigned successfully!');
      setSelectedTickets([]);
      setBulkAssignOpen(false);
    },
  });

  const handleCreate = (data: CreateCallFormData) => {
    const payload = {
      customerId: parseInt(data.customerId, 10),
      installationId: parseInt(data.installationId, 10),
      reportedProblem: data.reportedProblem,
      priority: data.priority,
      assignedEngineerId: data.assignedEngineerId ? parseInt(data.assignedEngineerId, 10) : undefined,
    };
    createMutation.mutate(payload);
  };

  // Canvas Drawing
  useEffect(() => {
    if (completeModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [completeModalOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleCompleteSubmit = () => {
    if (!selectedCallId) return;
    const canvas = canvasRef.current;
    let signatureStr = '';
    if (canvas) {
      signatureStr = canvas.toDataURL(); // base64
    }

    const payload = {
      status: 'COMPLETED' as const,
      observation: completeObservation,
      remarks: completeRemarks,
      laborCharge: parseFloat(completeLabor || '0'),
      travelCharge: parseFloat(completeTravel || '0'),
      customerSignature: signatureStr,
      partsUsed: completeParts.map((p) => ({
        sparePartId: p.partId,
        quantity: p.qty,
      })),
    };

    updateMutation.mutate({ id: selectedCallId, data: payload });
  };

  const handleSelectTicket = (id: number) => {
    setSelectedTickets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssignSubmit = () => {
    if (selectedTickets.length === 0 || !targetBulkEngineer) return;
    bulkAssignMutation.mutate({
      ids: selectedTickets,
      engineerId: parseInt(targetBulkEngineer, 10),
    });
  };

  const handleAddPartRow = () => {
    setCompleteParts((prev) => [...prev, { partId: 0, qty: 1 }]);
  };

  const handleRemovePartRow = (index: number) => {
    setCompleteParts((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePartChange = (index: number, field: 'partId' | 'qty', value: number) => {
    setCompleteParts((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search call #, problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 text-sm focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Queue</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 text-sm focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedTickets.length > 0 && (
            <button
              onClick={() => setBulkAssignOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 cursor-pointer shadow"
            >
              <UserCheck className="h-4 w-4" /> Dispatch ({selectedTickets.length})
            </button>
          )}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow shadow-blue-500/20 cursor-pointer glow-btn"
          >
            <Plus className="h-4 w-4" /> Log Call
          </button>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List queue */}
        <div className={`lg:col-span-2 premium-card p-6 ${selectedCallId ? 'hidden lg:block' : ''}`}>
          <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-500" /> Active Service Tickets
          </h3>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : tickets && tickets.length > 0 ? (
              tickets.map((call: any) => {
                const isSelected = selectedTickets.includes(call.id);
                return (
                  <div
                    key={call.id}
                    className={`p-4 border rounded-2xl transition-all cursor-pointer flex items-start gap-4 ${
                      selectedCallId === call.id
                        ? 'border-blue-500 bg-blue-50/20 shadow-md'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedCallId(call.id)}
                  >
                    {/* Selection checkbox for bulk operations */}
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectTicket(call.id)}
                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{call.callNumber}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${
                            call.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : call.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {call.priority}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${
                            call.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : call.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {call.status}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-slate-800 text-xs truncate">{call.reportedProblem}</h4>

                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
                        <span>Hospital: <strong>{call.customer.name}</strong></span>
                        <span>Eng: <strong>{call.assignedEngineer?.name || 'Unassigned'}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-xs py-8 text-center">No service calls logged.</p>
            )}
          </div>
        </div>

        {/* Selected Call Detail Slide over panel */}
        <div className={`premium-card p-6 ${!selectedCallId ? 'hidden lg:block' : ''}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="font-bold text-slate-800 text-sm">Ticket Details</h3>
            <button
              onClick={() => setSelectedCallId(null)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {detailsLoading ? (
            <div className="space-y-4 py-8 animate-pulse">
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
              <div className="h-24 bg-slate-200 rounded-xl"></div>
              <div className="h-10 bg-slate-200 rounded-xl"></div>
            </div>
          ) : ticketDetails ? (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">TICKET LEDGER</span>
                <h4 className="font-extrabold text-slate-800 text-md">{ticketDetails.callNumber}</h4>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong>Reported Problem:</strong> {ticketDetails.reportedProblem}
                </p>
              </div>

              {/* Status checklist */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Service Information</h5>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span>Priority Level</span>
                    <span className="font-bold text-slate-800">{ticketDetails.priority}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span>Ticket Status</span>
                    <span className="font-bold text-blue-600">{ticketDetails.status}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span>Target Hospital</span>
                    <span className="font-bold text-slate-800">{ticketDetails.customer.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span>Equipment Serial</span>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {ticketDetails.installation.machine.serialNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Assigned Support</span>
                    <span className="font-semibold text-slate-800">
                      {ticketDetails.assignedEngineer?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Completed service logs */}
              {ticketDetails.status === 'COMPLETED' ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <h6 className="font-bold text-xs text-slate-800 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> Resolution Report
                  </h6>
                  <p className="text-xs text-slate-600"><strong>Observations:</strong> {ticketDetails.observation}</p>
                  {ticketDetails.partsUsed.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Parts Replaced</span>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        {ticketDetails.partsUsed.map((p: any) => (
                          <div key={p.id} className="flex justify-between">
                            <span>{p.sparePart.name}</span>
                            <span className="font-mono">Qty: {p.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-3 border-t border-slate-200 text-slate-500">
                    <span>Travel fee: <strong>INR {ticketDetails.travelCharge}</strong></span>
                    <span>Labor fee: <strong>INR {ticketDetails.laborCharge}</strong></span>
                  </div>

                  {ticketDetails.customerSignature && (
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Customer Signature</span>
                      <img
                        src={ticketDetails.customerSignature}
                        alt="Customer Signature"
                        className="h-16 w-32 border border-slate-200 rounded bg-white mt-1"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCompleteObservation('');
                    setCompleteRemarks('');
                    setCompleteLabor('0');
                    setCompleteTravel('0');
                    setCompleteParts([]);
                    setCompleteModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <FileSignature className="h-4 w-4" /> Close Ticket & Sign Off
                </button>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-xs py-8 text-center">Select a service call to view details.</p>
          )}
        </div>
      </div>

      {/* Logging Ticket Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setCreateModalOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden z-10 shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-md">Log Service Call Ticket</h4>
                <button onClick={() => setCreateModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleCreate)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital (Customer)</label>
                    <select
                      {...register('customerId')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="">Select Hospital</option>
                      {customers?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.customerId && <p className="text-xs text-red-500 font-medium">{errors.customerId.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Installed Machine</label>
                    <select
                      {...register('installationId')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                      disabled={!watchCustomerId}
                    >
                      <option value="">Select Machine</option>
                      {customerInstallations?.map((inst: any) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.machine.name} (S/N: {inst.machine.serialNumber})
                        </option>
                      ))}
                    </select>
                    {errors.installationId && <p className="text-xs text-red-500 font-medium">{errors.installationId.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Reported Problem</label>
                    <textarea
                      placeholder="Please details the equipment issue..."
                      rows={3}
                      {...register('reportedProblem')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    ></textarea>
                    {errors.reportedProblem && <p className="text-xs text-red-500 font-medium">{errors.reportedProblem.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority Level</label>
                    <select
                      {...register('priority')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Assign Engineer (Optional)</label>
                    <select
                      {...register('assignedEngineerId')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="">Leave Unassigned</option>
                      {engineers?.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-500 cursor-pointer"
                  >
                    Create Call Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispatch Bulk Assign Popover */}
      <AnimatePresence>
        {bulkAssignOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setBulkAssignOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden z-10 shadow-2xl p-6 space-y-4"
            >
              <h4 className="font-bold text-slate-800 text-sm">Assign Selected Tickets</h4>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Support Engineer</label>
                <select
                  value={targetBulkEngineer}
                  onChange={(e) => setTargetBulkEngineer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="">Select Support</option>
                  {engineers?.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setBulkAssignOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAssignSubmit}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Confirm Dispatch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Completion Signoff Modal */}
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
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden z-10 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-md">Close Call & Sign-Off Resolution</h4>
                <button onClick={() => setCompleteModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Resolution texts */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Engineer Observation</label>
                  <textarea
                    placeholder="Provide details of diagnostic findings..."
                    value={completeObservation}
                    onChange={(e) => setCompleteObservation(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks / Action Taken</label>
                  <input
                    type="text"
                    placeholder="e.g. Replaced defective sensor..."
                    value={completeRemarks}
                    onChange={(e) => setCompleteRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Charges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Labor Charge (INR)</label>
                    <input
                      type="number"
                      value={completeLabor}
                      onChange={(e) => setCompleteLabor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Travel Cost (INR)</label>
                    <input
                      type="number"
                      value={completeTravel}
                      onChange={(e) => setCompleteTravel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Spare Parts Ledger list */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Spare Parts Utilized</span>
                    <button
                      onClick={handleAddPartRow}
                      className="text-xs text-blue-600 font-semibold hover:text-blue-500 cursor-pointer"
                    >
                      + Add part
                    </button>
                  </div>

                  <div className="space-y-2">
                    {completeParts.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <select
                          value={item.partId}
                          onChange={(e) => handlePartChange(index, 'partId', parseInt(e.target.value, 10))}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                        >
                          <option value="0">Select Spare Part</option>
                          {spareParts?.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.partNumber} - Stock: {p.stock})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handlePartChange(index, 'qty', parseInt(e.target.value, 10))}
                          className="w-20 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                          min="1"
                        />
                        <button
                          onClick={() => handleRemovePartRow(index)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-xl"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Digital Canvas Signature pad */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Sign-off Signature</label>
                    <button
                      onClick={clearCanvas}
                      className="text-[10px] text-slate-400 font-semibold hover:text-slate-600 cursor-pointer"
                    >
                      Clear pad
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                    <canvas
                      ref={canvasRef}
                      width={520}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-36 cursor-crosshair touch-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSubmit}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-500 shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Sign-Off'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ServiceCalls;
