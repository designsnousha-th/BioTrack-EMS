import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Cpu, Plus, Loader2 } from 'lucide-react';

const machineSchema = z.object({
  company: z.string().min(2, 'Manufacturer name is required'),
  category: z.string().min(2, 'Equipment category is required'),
  name: z.string().min(2, 'Model name is required'),
  model: z.string().min(2, 'Model number is required'),
  serialNumber: z.string().min(3, 'Default serial or identifier is required'),
});

type MachineFormData = z.infer<typeof machineSchema>;

export const Equipment: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
  });

  // Query: Get all master machines
  const { data: machines, isLoading: machinesLoading } = useQuery({
    queryKey: ['machines-settings'],
    queryFn: async () => {
      const res = await api.get('/machines');
      return res.data || [];
    },
  });

  // Mutation: Create master machine
  const createMachineMutation = useMutation({
    mutationFn: (data: MachineFormData) => api.post('/machines', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines-settings'] });
      queryClient.invalidateQueries({ queryKey: ['machines-select'] });
      toast.success('Equipment added to Master Catalog!');
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error registering equipment');
    },
  });

  const onSubmitMachine = (data: MachineFormData) => {
    createMachineMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-500" /> Equipment Master Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register medical diagnostic machines sold by your company so they can be assigned to hospital installations.
          </p>
        </div>

        {/* Form to Add New Equipment */}
        <form onSubmit={handleSubmit(onSubmitMachine)} className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-4">
          <h4 className="font-bold text-xs text-slate-700">Add New Equipment Template</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Manufacturer (Company)</label>
              <input
                type="text"
                placeholder="e.g. Wipro GE"
                {...register('company')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.company && <p className="text-[10px] text-red-500 font-medium">{errors.company.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Category</label>
              <input
                type="text"
                placeholder="e.g. Ultrasound"
                {...register('category')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.category && <p className="text-[10px] text-red-500 font-medium">{errors.category.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Model Name</label>
              <input
                type="text"
                placeholder="e.g. Voluson E10"
                {...register('name')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Model Number</label>
              <input
                type="text"
                placeholder="e.g. Voluson-E10-2025"
                {...register('model')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.model && <p className="text-[10px] text-red-500 font-medium">{errors.model.message}</p>}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Serial Number / Unique SKU Identifier</label>
              <input
                type="text"
                placeholder="e.g. GE-US-VOL-9874"
                {...register('serialNumber')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.serialNumber && <p className="text-[10px] text-red-500 font-medium">{errors.serialNumber.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createMachineMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-500 shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {createMachineMutation.isPending ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Register Equipment
                </>
              )}
            </button>
          </div>
        </form>

        {/* List of current Master Equipment */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-700">Registered Master Catalog Models ({machines?.length || 0})</h4>
          <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {machinesLoading ? (
              <p className="text-xs text-slate-400 p-4">Loading equipment...</p>
            ) : machines && machines.length > 0 ? (
              machines.map((m: any) => (
                <div key={m.id} className="p-3 bg-white hover:bg-slate-50/50 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{m.name}</span>
                    <span className="text-slate-400 ml-2">({m.company} • {m.category})</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">Model: {m.model} • S/N: {m.serialNumber}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center">No master equipment registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
