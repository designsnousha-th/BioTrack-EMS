import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Plus,
  Search,
  QrCode,
  Award,
  Calendar,
  User as UserIcon,
  ShieldCheck,
  Building,
  Wrench,
  X,
  Printer,
  Loader2,
  FileCheck,
  History as HistoryIcon,
  Edit,
} from 'lucide-react';

const installSchema = z.object({
  customerId: z.string().min(1, 'Please select a hospital'),
  machineId: z.string().min(1, 'Please select equipment'),
  warrantyCardNumber: z.string().optional(),
  installationDate: z.string().min(1, 'Select installation date'),
  warrantyYears: z.string().min(1, 'Select warranty duration'),
  pmIntervalMonths: z.string().min(1, 'Select PM checkup interval'),
  engineerId: z.string().min(1, 'Select installation engineer'),
  invoiceNumber: z.string().optional(),
  customerPo: z.string().optional(),
});

type InstallFormData = z.infer<typeof installSchema>;

export const Installations: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [activeStickerItem, setActiveStickerItem] = useState<any | null>(null);
  const [activeCertificateItem, setActiveCertificateItem] = useState<any | null>(null);
  const [editingInstallation, setEditingInstallation] = useState<any | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [historyActiveTab, setHistoryActiveTab] = useState<'PMS' | 'SERVICES'>('PMS');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstallFormData>({
    resolver: zodResolver(installSchema),
    defaultValues: {
      warrantyYears: '1',
      pmIntervalMonths: '3',
    },
  });

  // Fetch Installations
  const { data: installations, isLoading } = useQuery({
    queryKey: ['installations', search, warrantyStatus],
    queryFn: async () => {
      const res = await api.get('/installations', {
        params: { search, warrantyStatus },
      });
      return res.data;
    },
  });

  // Fetch Customers for select
  const { data: customers } = useQuery({
    queryKey: ['customers-select'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data?.items || [];
    },
  });

  // Fetch Machines for select
  const { data: machines } = useQuery({
    queryKey: ['machines-select'],
    queryFn: async () => {
      const res = await api.get('/machines');
      return res.data || [];
    },
  });

  // Fetch Engineers for select
  const { data: engineers } = useQuery({
    queryKey: ['engineers-select'],
    queryFn: async () => {
      const res = await api.get('/auth/engineers');
      return res.data || [];
    },
  });

  // Mutation: Create installation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/installations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations'] });
      toast.success('Machine installed and PM scheduled successfully!');
      setFormModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error processing installation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: any }) => api.put(`/installations/${payload.id}`, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations'] });
      toast.success('Installation updated successfully!');
      setFormModalOpen(false);
      setEditingInstallation(null);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error updating installation');
    },
  });

  const { data: installationHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['installation-history', selectedHistoryItem?.id],
    queryFn: async () => {
      if (!selectedHistoryItem) return null;
      const res = await api.get(`/installations/${selectedHistoryItem.id}`);
      return res.data;
    },
    enabled: !!selectedHistoryItem,
  });

  const handleOpenEdit = (inst: any) => {
    setEditingInstallation(inst);
    reset({
      customerId: String(inst.customerId),
      machineId: String(inst.machineId),
      warrantyCardNumber: inst.warrantyCardNumber || '',
      installationDate: new Date(inst.installationDate).toISOString().split('T')[0],
      warrantyYears: String(Math.round((new Date(inst.warrantyEndDate).getTime() - new Date(inst.installationDate).getTime()) / (365 * 24 * 60 * 60 * 1000))) || '1',
      pmIntervalMonths: String(inst.pmIntervalMonths),
      engineerId: String(inst.engineerId),
      invoiceNumber: inst.invoiceNumber || '',
      customerPo: inst.customerPo || '',
    });
    setFormModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingInstallation(null);
    reset({
      customerId: '',
      machineId: '',
      warrantyCardNumber: '',
      installationDate: '',
      warrantyYears: '1',
      pmIntervalMonths: '3',
      engineerId: '',
      invoiceNumber: '',
      customerPo: '',
    });
    setFormModalOpen(true);
  };

  const onSubmit = (data: InstallFormData) => {
    const payload = {
      customerId: parseInt(data.customerId, 10),
      machineId: parseInt(data.machineId, 10),
      warrantyCardNumber: data.warrantyCardNumber,
      installationDate: data.installationDate,
      warrantyYears: parseInt(data.warrantyYears, 10),
      pmIntervalMonths: parseInt(data.pmIntervalMonths, 10),
      engineerId: parseInt(data.engineerId, 10),
      invoiceNumber: data.invoiceNumber,
      customerPo: data.customerPo,
    };
    if (editingInstallation) {
      updateMutation.mutate({ id: editingInstallation.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search serial number, model, hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <select
            value={warrantyStatus}
            onChange={(e) => setWarrantyStatus(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 text-sm focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="">All Warranties</option>
            <option value="active">Active Warranty</option>
            <option value="expiring">Expiring (30 days)</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-50 transition-all cursor-pointer glow-btn"
        >
          <Plus className="h-4 w-4" /> Log Installation
        </button>
      </div>

      {/* Installations Table Grid */}
      <div className="premium-card p-6">
        <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
          <Compass className="h-4 w-4 text-blue-500" /> Active Installations Logs
        </h3>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : installations && installations.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Machine Details</th>
                  <th className="pb-3">Hospital Location</th>
                  <th className="pb-3">Dates & Service</th>
                  <th className="pb-3">Warranty</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {installations.map((inst: any) => {
                  const isWarrantyActive = new Date(inst.warrantyEndDate) > new Date();
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="font-bold text-slate-800 text-sm">{inst.machine.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {inst.machine.company} • Model: {inst.machine.model}
                        </div>
                        <div className="text-[9px] text-blue-600 font-mono mt-0.5">S/N: {inst.machine.serialNumber}</div>
                      </td>
                      <td className="py-4">
                        <div className="font-semibold text-slate-700 text-xs">{inst.customer.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{inst.customer.district}, {inst.customer.state}</div>
                      </td>
                      <td className="py-4 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Ins: {new Date(inst.installationDate).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5 text-slate-400" /> PM: Every {inst.pmIntervalMonths} Months</div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                            isWarrantyActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {isWarrantyActive ? 'Active' : 'Expired'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Ends: {new Date(inst.warrantyEndDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedHistoryItem(inst);
                              setHistoryModalOpen(true);
                            }}
                            title="View History & PMs"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-semibold"
                          >
                            <HistoryIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(inst)}
                            title="Edit Installation"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-semibold"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setActiveStickerItem(inst)}
                            title="Generate QR Sticker"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setActiveCertificateItem(inst)}
                            title="Print Certificate"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Award className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-400 text-xs py-8 text-center">No installations logged.</p>
          )}
        </div>
      </div>

      {/* Logging Modal Form */}
      <AnimatePresence>
        {formModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setFormModalOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden z-10 shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-md">
                  {editingInstallation ? 'Edit Installation Details' : 'Register Machine Installation'}
                </h4>
                <button
                  onClick={() => {
                    setFormModalOpen(false);
                    setEditingInstallation(null);
                    reset();
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital (Customer)</label>
                    <select
                      {...register('customerId')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select Hospital</option>
                      {customers?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.customerId && <p className="text-xs text-red-500 font-medium">{errors.customerId.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipment Master</label>
                    <select
                      {...register('machineId')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select Equipment</option>
                      {machines?.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.company} - {m.serialNumber})</option>
                      ))}
                    </select>
                    {errors.machineId && <p className="text-xs text-red-500 font-medium">{errors.machineId.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Installation Date</label>
                    <input
                      type="date"
                      {...register('installationDate')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.installationDate && <p className="text-xs text-red-500 font-medium">{errors.installationDate.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Warranty Years</label>
                    <select
                      {...register('warrantyYears')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="5">5 Years</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">PM Interval</label>
                    <select
                      {...register('pmIntervalMonths')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="3">Every 3 Months</option>
                      <option value="4">Every 4 Months</option>
                      <option value="6">Every 6 Months</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Support Engineer</label>
                    <select
                      {...register('engineerId')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select Engineer</option>
                      {engineers?.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                    {errors.engineerId && <p className="text-xs text-red-500 font-medium">{errors.engineerId.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Warranty Card Number</label>
                    <input
                      type="text"
                      placeholder="e.g. WC-88392"
                      {...register('warrantyCardNumber')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer PO / Invoice Number</label>
                    <input
                      type="text"
                      placeholder="e.g. PO-7729"
                      {...register('customerPo')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setFormModalOpen(false);
                      setEditingInstallation(null);
                      reset();
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-500 shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingInstallation ? (
                      'Save Changes'
                    ) : (
                      'Register & Schedule PM'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Sticker Modal */}
      <AnimatePresence>
        {activeStickerItem && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setActiveStickerItem(null)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden z-10 shadow-2xl p-6 relative text-center space-y-4"
            >
              <button
                onClick={() => setActiveStickerItem(null)}
                className="absolute right-4 top-4 p-1 text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                <X className="h-4 w-4" />
              </button>

              <h4 className="font-bold text-slate-800 text-sm">Machine Asset QR Sticker</h4>

              {/* STYLIZED QR STICKER CARD */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[10px] text-blue-600 uppercase font-mono tracking-wider">BioTrack EMS Asset</span>
                  <span className="text-[9px] text-slate-400 font-mono">ID: #{activeStickerItem.id}</span>
                </div>

                {/* Draw a stylized SVG QR Code */}
                <div className="flex justify-center py-2 bg-white rounded-xl border border-slate-100">
                  <svg className="h-32 w-32" viewBox="0 0 100 100">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="20" height="20" fill="black" />
                    <rect x="14" y="14" width="12" height="12" fill="white" />
                    <rect x="17" y="17" width="6" height="6" fill="black" />
                    
                    <rect x="70" y="10" width="20" height="20" fill="black" />
                    <rect x="74" y="14" width="12" height="12" fill="white" />
                    <rect x="77" y="17" width="6" height="6" fill="black" />

                    <rect x="10" y="70" width="20" height="20" fill="black" />
                    <rect x="14" y="74" width="12" height="12" fill="white" />
                    <rect x="17" y="77" width="6" height="6" fill="black" />

                    <rect x="40" y="20" width="10" height="10" fill="black" />
                    <rect x="50" y="40" width="20" height="10" fill="black" />
                    <rect x="30" y="50" width="10" height="30" fill="black" />
                    <rect x="50" y="70" width="30" height="10" fill="black" />
                    <rect x="80" y="50" width="10" height="20" fill="black" />
                    <rect x="60" y="20" width="5" height="15" fill="black" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-800 text-xs">{activeStickerItem.machine.name}</div>
                  <p className="text-[10px] text-slate-500 truncate">Hospital: {activeStickerItem.customer.name}</p>
                  <p className="text-[9px] text-slate-400 font-mono">S/N: {activeStickerItem.machine.serialNumber}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print Sticker
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Certificate Frame Modal */}
      <AnimatePresence>
        {activeCertificateItem && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setActiveCertificateItem(null)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden z-10 shadow-2xl p-8 relative flex flex-col items-center text-center space-y-6"
            >
              <button
                onClick={() => setActiveCertificateItem(null)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>

              {/* CERTIFICATE LAYOUT */}
              <div className="w-full border-4 border-double border-blue-900 p-8 rounded-xl bg-slate-50/50 space-y-6 text-slate-800">
                <div className="flex flex-col items-center">
                  <Award className="h-12 w-12 text-blue-900 mb-2" />
                  <h2 className="font-extrabold text-2xl tracking-wide uppercase text-blue-900 font-display">Certificate of Installation</h2>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-1">BioTrack EMS Quality Assurance</p>
                </div>

                <div className="space-y-4 text-sm leading-relaxed text-slate-600 max-w-lg mx-auto">
                  <p>
                    This document certifies that the medical diagnostic equipment, model{' '}
                    <strong className="text-slate-800">{activeCertificateItem.machine.name}</strong>, carrying Serial Number{' '}
                    <strong className="text-blue-900 font-mono">{activeCertificateItem.machine.serialNumber}</strong>, has been successfully installed, calibrated, and commissioned at
                  </p>

                  <h3 className="font-extrabold text-slate-900 text-md uppercase font-display tracking-tight">
                    {activeCertificateItem.customer.name}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Location: {activeCertificateItem.customer.address}, {activeCertificateItem.customer.district},{' '}
                    {activeCertificateItem.customer.state}
                  </p>

                  <p className="text-xs">
                    The machine is registered under warranty card{' '}
                    <strong className="font-mono text-slate-800">{activeCertificateItem.warrantyCardNumber || 'N/A'}</strong> valid until{' '}
                    <strong>{new Date(activeCertificateItem.warrantyEndDate).toLocaleDateString()}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                  <div className="space-y-1">
                    <div className="font-bold border-b border-slate-300 pb-1 mx-auto max-w-[150px] font-mono">
                      {activeCertificateItem.engineer?.name || 'Assigned Engineer'}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Installation Engineer</span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold border-b border-slate-300 pb-1 mx-auto max-w-[150px] font-mono">
                      Sarah Connor
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">System Director</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full max-w-sm">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print Certificate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Installation History Modal */}
      <AnimatePresence>
        {historyModalOpen && selectedHistoryItem && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                setHistoryModalOpen(false);
                setSelectedHistoryItem(null);
              }}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden z-10 shadow-2xl flex flex-col max-h-[80vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-md">
                    {selectedHistoryItem.machine.name} History
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    S/N: {selectedHistoryItem.machine.serialNumber} • Location: {selectedHistoryItem.customer.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setHistoryModalOpen(false);
                    setSelectedHistoryItem(null);
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Sub-tabs */}
              <div className="px-6 py-2 border-b border-slate-100 flex gap-4 text-xs font-semibold bg-slate-50/50">
                <button
                  onClick={() => setHistoryActiveTab('PMS')}
                  className={`pb-2 pt-1 border-b-2 transition-colors cursor-pointer ${
                    historyActiveTab === 'PMS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  PM Checklists Log
                </button>
                <button
                  onClick={() => setHistoryActiveTab('SERVICES')}
                  className={`pb-2 pt-1 border-b-2 transition-colors cursor-pointer ${
                    historyActiveTab === 'SERVICES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Breakdown Tickets
                </button>
              </div>

              {/* Scrollable Logs Grid */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {historyLoading ? (
                  <div className="space-y-3 py-4 animate-pulse">
                    <div className="h-10 bg-slate-100 rounded-xl"></div>
                    <div className="h-10 bg-slate-100 rounded-xl"></div>
                  </div>
                ) : historyActiveTab === 'PMS' ? (
                  <div className="space-y-3">
                    {installationHistory?.pms && installationHistory.pms.length > 0 ? (
                      installationHistory.pms.map((pm: any) => (
                        <div key={pm.id} className="p-3.5 border border-slate-100 bg-slate-50/30 rounded-2xl flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">PM Checkup Visit</span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                              pm.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              {pm.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 leading-relaxed font-mono">
                            Target Date: {new Date(pm.scheduledDate).toLocaleDateString()}
                          </div>
                          {pm.status === 'COMPLETED' && (
                            <div className="mt-1 bg-white p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600 space-y-1">
                              <p className="font-semibold text-slate-800">Checklist Report:</p>
                              <pre className="font-sans whitespace-pre-wrap leading-tight text-slate-500">{pm.checklistReport}</pre>
                              <p className="text-[9px] text-slate-400 pt-1">Actual Checked Date: {new Date(pm.actualDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">No preventive maintenance checkups scheduled.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {installationHistory?.serviceCalls && installationHistory.serviceCalls.length > 0 ? (
                      installationHistory.serviceCalls.map((call: any) => (
                        <div key={call.id} className="p-3.5 border border-slate-100 bg-slate-50/30 rounded-2xl flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-600 font-mono">{call.callNumber}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                              call.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {call.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            <strong>Problem:</strong> {call.reportedProblem}
                          </p>
                          {call.status === 'COMPLETED' && (
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600 space-y-1.5">
                              <p><strong>Observation:</strong> {call.observation}</p>
                              <p><strong>Remarks:</strong> {call.remarks}</p>
                              {call.customerSignature && (
                                <div className="pt-1">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Customer Sign-off</span>
                                  <img src={call.customerSignature} alt="Sig" className="h-10 w-24 border border-slate-200 rounded mt-1 bg-white" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">No breakdown service tickets reported for this unit.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Installations;
