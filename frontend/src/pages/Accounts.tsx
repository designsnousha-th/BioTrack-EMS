import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  IndianRupee,
  Eye,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Building,
  Wrench,
  X,
  Loader2,
  FileCode,
} from 'lucide-react';

const billingSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  serviceCallId: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'),
});

type BillingFormData = z.infer<typeof billingSchema>;

export const Accounts: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'INVOICES' | 'QUOTATIONS'>('INVOICES');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'INVOICE' | 'QUOTATION'>('INVOICE');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
  });

  const watchAmount = watch('amount');
  const numericAmount = parseFloat(watchAmount || '0');
  const calculatedTax = numericAmount * 0.18;
  const calculatedTotal = numericAmount + calculatedTax;

  // Queries
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/accounts/invoices');
      return res.data || [];
    },
  });

  const { data: quotations, isLoading: quotationsLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const res = await api.get('/accounts/quotations');
      return res.data || [];
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-accounts-select'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data?.items || [];
    },
  });

  const { data: serviceCalls } = useQuery({
    queryKey: ['service-calls-accounts-select'],
    queryFn: async () => {
      const res = await api.get('/service-calls');
      return res.data || [];
    },
  });

  // Mutations
  const createBillingMutation = useMutation({
    mutationFn: (payload: { type: 'INVOICE' | 'QUOTATION'; data: any }) => {
      const endpoint = payload.type === 'INVOICE' ? '/accounts/invoices' : '/accounts/quotations';
      return api.post(endpoint, payload.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type === 'INVOICE' ? 'invoices' : 'quotations'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success(`${variables.type === 'INVOICE' ? 'Invoice' : 'Quotation'} generated successfully!`);
      setCreateModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error('Error creating billing record');
    },
  });

  const payInvoiceMutation = useMutation({
    mutationFn: (id: number) => api.put(`/accounts/invoices/${id}/status`, { status: 'PAID' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('Invoice marked as PAID!');
    },
  });

  const handleCreateSubmit = (data: BillingFormData) => {
    const payload = {
      customerId: parseInt(data.customerId, 10),
      serviceCallId: data.serviceCallId ? parseInt(data.serviceCallId, 10) : undefined,
      amount: parseFloat(data.amount),
      taxAmount: parseFloat(calculatedTax.toFixed(2)),
      totalAmount: parseFloat(calculatedTotal.toFixed(2)),
    };
    createBillingMutation.mutate({ type: createType, data: payload });
  };

  const handleOpenPdf = (fileUrl: string) => {
    // Open in new tab for static PDF serving
    window.open(`${import.meta.env.VITE_API_URL}${fileUrl}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle tabs */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveSubTab('INVOICES')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'INVOICES' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Invoices List
          </button>
          <button
            onClick={() => setActiveSubTab('QUOTATIONS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'QUOTATIONS' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Quotations
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setCreateType('QUOTATION');
              setCreateModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 cursor-pointer shadow"
          >
            <Plus className="h-4 w-4" /> New Quotation
          </button>
          <button
            onClick={() => {
              setCreateType('INVOICE');
              setCreateModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow shadow-blue-500/20 cursor-pointer glow-btn"
          >
            <Plus className="h-4 w-4" /> New Invoice
          </button>
        </div>
      </div>

      {/* Grid listing */}
      <div className="premium-card p-6">
        {activeSubTab === 'INVOICES' ? (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> Accounts Invoices
            </h3>

            <div className="overflow-x-auto">
              {invoicesLoading ? (
                <div className="space-y-3 py-4 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 bg-slate-100 rounded-xl"></div>
                  ))}
                </div>
              ) : invoices && invoices.length > 0 ? (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Invoice Code</th>
                      <th className="pb-3">Client Hospital</th>
                      <th className="pb-3 text-right">Base Amount</th>
                      <th className="pb-3 text-right">Tax (18%)</th>
                      <th className="pb-3 text-right">Total (INR)</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 text-xs">
                    {invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-2 font-mono font-bold text-blue-600">{inv.invoiceNumber}</td>
                        <td className="py-4 font-semibold text-slate-700">{inv.customer.name}</td>
                        <td className="py-4 text-right font-mono">INR {inv.amount.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-right font-mono">INR {inv.taxAmount.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-right font-mono font-bold text-slate-800">
                          INR {inv.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                            inv.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {inv.paymentStatus !== 'PAID' && (
                              <button
                                onClick={() => payInvoiceMutation.mutate(inv.id)}
                                title="Mark PAID"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg cursor-pointer"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {inv.pdfFile && (
                              <button
                                onClick={() => handleOpenPdf(inv.pdfFile)}
                                title="Print Invoice"
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-400 text-xs py-8 text-center">No invoices recorded.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileCode className="h-4 w-4 text-blue-500" /> Quotations Master
            </h3>

            <div className="overflow-x-auto">
              {quotationsLoading ? (
                <div className="space-y-3 py-4 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 bg-slate-100 rounded-xl"></div>
                  ))}
                </div>
              ) : quotations && quotations.length > 0 ? (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Quotation Code</th>
                      <th className="pb-3">Client Hospital</th>
                      <th className="pb-3 text-right">Base Amount</th>
                      <th className="pb-3 text-right">Tax (18%)</th>
                      <th className="pb-3 text-right">Total (INR)</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 text-xs">
                    {quotations.map((qtn: any) => (
                      <tr key={qtn.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-2 font-mono font-bold text-blue-600">{qtn.quotationNumber}</td>
                        <td className="py-4 font-semibold text-slate-700">{qtn.customer.name}</td>
                        <td className="py-4 text-right font-mono">INR {qtn.amount.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-right font-mono">INR {qtn.taxAmount.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-right font-mono font-bold text-slate-800">
                          INR {qtn.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 text-right">
                          {qtn.pdfFile && (
                            <button
                              onClick={() => handleOpenPdf(qtn.pdfFile)}
                              title="Print Quotation"
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-400 text-xs py-8 text-center">No quotations generated.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Creation Modal Form */}
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
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden z-10 shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-md">
                  Generate {createType === 'INVOICE' ? 'Invoice' : 'Quotation'}
                </h4>
                <button onClick={() => setCreateModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleCreateSubmit)} className="p-6 space-y-4">
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Related Service Call (Optional)</label>
                  <select
                    {...register('serviceCallId')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="">Select Ticket</option>
                    {serviceCalls?.map((sc: any) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.callNumber} - {sc.reportedProblem.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Service Amount (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    {...register('amount')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.amount && <p className="text-xs text-red-500 font-medium">{errors.amount.message}</p>}
                </div>

                {/* Calculation summary */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Charge:</span>
                    <span className="font-semibold">INR {numericAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST/SGST (18%):</span>
                    <span className="font-semibold">INR {calculatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800 text-sm">
                    <span>Total Billing:</span>
                    <span>INR {calculatedTotal.toFixed(2)}</span>
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
                    disabled={createBillingMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-500 shadow flex items-center gap-2 cursor-pointer"
                  >
                    {createBillingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm billing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Accounts;
