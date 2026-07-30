import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  Edit,
  TrendingUp,
  X,
  Loader2,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';

const partSchema = z.object({
  partNumber: z.string().min(3, 'Part number must be at least 3 characters'),
  name: z.string().min(3, 'Name is required'),
  supplier: z.string().optional(),
  stock: z.string().min(1, 'Initial stock is required'),
  minStockLevel: z.string().min(1, 'Minimum stock warning level is required'),
  unitCost: z.string().min(1, 'Unit cost is required'),
});

type PartFormData = z.infer<typeof partSchema>;

export const Inventory: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<any | null>(null);
  const [restockQty, setRestockQty] = useState('10');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      stock: '0',
      minStockLevel: '5',
      unitCost: '0',
    },
  });

  // Query: Fetch Spare Parts
  const { data: parts, isLoading } = useQuery({
    queryKey: ['parts', search, lowStockOnly],
    queryFn: async () => {
      const res = await api.get('/inventory', {
        params: { search, lowStockOnly: lowStockOnly ? 'true' : 'false' },
      });
      return res.data || [];
    },
  });

  // Mutation: Create part
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/inventory', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Spare part added to inventory master!');
      setAddModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error creating part');
    },
  });

  // Mutation: Restock part
  const restockMutation = useMutation({
    mutationFn: (payload: { id: number; qty: number }) =>
      api.put(`/inventory/${payload.id}`, {
        stock: restockItem.stock + payload.qty,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Stock updated successfully!');
      setRestockItem(null);
    },
    onError: (err: any) => {
      toast.error('Error updating stock');
    },
  });

  const onSubmit = (data: PartFormData) => {
    const payload = {
      partNumber: data.partNumber,
      name: data.name,
      supplier: data.supplier,
      stock: parseInt(data.stock, 10),
      minStockLevel: parseInt(data.minStockLevel, 10),
      unitCost: parseFloat(data.unitCost),
    };
    createMutation.mutate(payload);
  };

  const handleRestockSubmit = () => {
    if (!restockItem) return;
    restockMutation.mutate({
      id: restockItem.id,
      qty: parseInt(restockQty, 10),
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search parts, suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 text-sm shadow-sm cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Low Stock Warning
            </span>
          </label>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow cursor-pointer glow-btn"
        >
          <Plus className="h-4 w-4" /> Add Spare Part
        </button>
      </div>

      {/* Spare Parts Grid table */}
      <div className="premium-card p-6">
        <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" /> Spare Parts Catalog
        </h3>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : parts && parts.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Part Details</th>
                  <th className="pb-3">Supplier Name</th>
                  <th className="pb-3">Asset Cost</th>
                  <th className="pb-3 text-center">In Stock</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {parts.map((part: any) => {
                  const isLowStock = part.stock <= part.minStockLevel;
                  return (
                    <tr key={part.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="font-bold text-slate-800 text-sm">{part.name}</div>
                        <div className="text-[9px] text-blue-600 font-mono mt-0.5">{part.partNumber}</div>
                      </td>
                      <td className="py-4 text-xs text-slate-600">{part.supplier || 'N/A'}</td>
                      <td className="py-4 text-xs font-semibold text-slate-700 font-mono">
                        INR {part.unitCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                            isLowStock ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {part.stock} units
                          </span>
                          {isLowStock && (
                            <span className="text-[8px] font-extrabold text-amber-600 uppercase tracking-wide">
                              Min Alert: {part.minStockLevel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => {
                            setRestockQty('10');
                            setRestockItem(part);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-400 text-xs py-8 text-center">No spare parts found.</p>
          )}
        </div>
      </div>

      {/* Add Part Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setAddModalOpen(false)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden z-10 shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-md">Add Spare Part to Inventory</h4>
                <button onClick={() => setAddModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Part Number / SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. SP-GE-PROBE-4C"
                    {...register('partNumber')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.partNumber && <p className="text-xs text-red-500 font-medium">{errors.partNumber.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Part Name</label>
                  <input
                    type="text"
                    placeholder="e.g. GE Ultrasound Probe 4C"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. GE Healthcare India"
                    {...register('supplier')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Initial Stock</label>
                    <input
                      type="number"
                      {...register('stock')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Min Warning Stock</label>
                    <input
                      type="number"
                      {...register('minStockLevel')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unit Cost (INR)</label>
                    <input
                      type="number"
                      {...register('unitCost')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-500 cursor-pointer"
                  >
                    Save Part
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restock Qty Modal */}
      <AnimatePresence>
        {restockItem && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setRestockItem(null)}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden z-10 shadow-2xl p-6 space-y-4"
            >
              <h4 className="font-bold text-slate-800 text-sm">Restock Parts Order</h4>
              <p className="text-xs text-slate-500">
                You are restocking: <strong>{restockItem.name}</strong>. Current stock: {restockItem.stock} units.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Restock Quantity</label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  min="1"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setRestockItem(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestockSubmit}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Update Stock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Inventory;
