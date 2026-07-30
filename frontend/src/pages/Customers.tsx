import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  MinusCircle,
  Building,
  Mail,
  Phone,
  FileText,
  Bookmark,
  MapPin,
  Loader2,
  Tag,
} from 'lucide-react';

// Form validation schema
const customerSchema = z.object({
  name: z.string().min(3, 'Hospital name must be at least 3 characters'),
  address: z.string().min(5, 'Address is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pin: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  gst: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  contacts: z.array(z.object({
    name: z.string().min(2, 'Name is required'),
    designation: z.string().min(2, 'Designation is required'),
    phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
    email: z.string().email('Enter a valid email address'),
  })).min(1, 'At least one contact person is required'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export const Customers: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [activeTab, setActiveTab] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // Form Setup
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      contacts: [{ name: '', designation: '', phone: '', email: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

  // Query: Get all customers
  const { data: customerList, isLoading } = useQuery({
    queryKey: ['customers', search, filterState],
    queryFn: async () => {
      const res = await api.get('/customers', {
        params: { search, state: filterState },
      });
      return res.data;
    },
  });

  React.useEffect(() => {
    if (customerList && customerList.items && customerList.items.length > 0 && selectedCustomerId === null) {
      setSelectedCustomerId(customerList.items[0].id);
    }
  }, [customerList, selectedCustomerId]);

  // Query: Get single customer details
  const { data: customerDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      const res = await api.get(`/customers/${selectedCustomerId}`);
      return res.data;
    },
    enabled: !!selectedCustomerId,
  });

  // Mutation: Create customer
  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => api.post('/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully!');
      setFormModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error creating customer');
    },
  });

  // Mutation: Update customer
  const updateMutation = useMutation({
    mutationFn: (data: CustomerFormData) => api.put(`/customers/${editingCustomer.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', editingCustomer.id] });
      toast.success('Customer updated successfully!');
      setFormModalOpen(false);
      setEditingCustomer(null);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error updating customer');
    },
  });

  // Mutation: Delete customer
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer archived successfully!');
      if (selectedCustomerId) setSelectedCustomerId(null);
      setActiveTab('LIST');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error archiving customer');
    },
  });

  const handleOpenEdit = (customer: any) => {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      address: customer.address,
      district: customer.district,
      state: customer.state,
      pin: customer.pin,
      gst: customer.gst || '',
      notes: customer.notes || '',
      tags: customer.tags ? customer.tags.join(', ') : '',
      contacts: customer.contacts.map((c: any) => ({
        name: c.name,
        designation: c.designation,
        phone: c.phone,
        email: c.email,
      })),
    });
    setFormModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    reset({
      name: '',
      address: '',
      district: '',
      state: '',
      pin: '',
      gst: '',
      notes: '',
      tags: '',
      contacts: [{ name: '', designation: '', phone: '', email: '' }],
    });
    setFormModalOpen(true);
  };

  const onSubmitForm = (data: CustomerFormData) => {
    const payload = {
      ...data,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0) : [],
    };
    if (editingCustomer) {
      updateMutation.mutate(payload as any);
    } else {
      createMutation.mutate(payload as any);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search hospitals, state, GST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* Filter dropdown */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 text-sm focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="">All States</option>
            <option value="Haryana">Haryana</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-all cursor-pointer glow-btn"
        >
          <Plus className="h-4 w-4" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customers List */}
        <div className={`lg:col-span-2 premium-card p-6 overflow-hidden ${activeTab === 'DETAIL' ? 'hidden lg:block' : ''}`}>
          <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-500" /> Hospital Directory
          </h3>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : customerList?.items?.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-left">
                    <th className="pb-3 pl-2">Hospital Name</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Tags</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {customerList.items.map((customer: any) => (
                    <tr
                      key={customer.id}
                      className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${
                        selectedCustomerId === customer.id ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => {
                        setSelectedCustomerId(customer.id);
                        setActiveTab('DETAIL');
                      }}
                    >
                      <td className="py-4 pl-2">
                        <div className="font-bold text-slate-800 text-sm">{customer.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">GST: {customer.gst || 'N/A'}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs text-slate-600">{customer.district}</div>
                        <div className="text-[10px] text-slate-400">{customer.state}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] rounded font-semibold border border-blue-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(customer)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(customer.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-400 text-xs py-8 text-center">No customers found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Customer Details Panel */}
        <div className={`premium-card p-6 ${activeTab === 'LIST' ? 'hidden lg:block' : ''}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="font-bold text-slate-800 text-sm">Customer Profile</h3>
            <button
              onClick={() => setActiveTab('LIST')}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {detailsLoading ? (
            <div className="space-y-4 py-8 animate-pulse">
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded-xl"></div>
              <div className="h-10 bg-slate-200 rounded-xl"></div>
            </div>
          ) : customerDetails ? (
            <div className="space-y-6">
              {/* Header Profile */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-600/10 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xl font-display">
                  {customerDetails.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-800 text-md leading-tight">{customerDetails.name}</h4>
                  <span className="inline-flex mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] rounded font-bold uppercase font-mono">
                    Active Account
                  </span>
                </div>
              </div>

              {/* Physical Address */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700">Address Location</p>
                    <p className="mt-0.5 leading-snug">{customerDetails.address}</p>
                    <p className="mt-0.5 font-mono">{customerDetails.district}, {customerDetails.state} - {customerDetails.pin}</p>
                  </div>
                </div>
              </div>

              {/* Contacts Panel */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Contact Persons</h5>
                <div className="space-y-2">
                  {customerDetails.contacts.map((c: any) => (
                    <div key={c.id} className="p-3 border border-slate-100 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-700">{c.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">
                          {c.designation}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</span>
                        <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {c.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installations Timeline */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Installed Inventory ({customerDetails.installations.length})</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customerDetails.installations.map((inst: any) => (
                    <div key={inst.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-700">{inst.machine.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">S/N: {inst.machine.serialNumber}</div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        new Date(inst.warrantyEndDate) > new Date()
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {new Date(inst.warrantyEndDate) > new Date() ? 'Warranty Active' : 'Expired'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              {customerDetails.notes && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <h6 className="font-bold text-[10px] text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Account Memo
                  </h6>
                  <p className="text-[11px] text-blue-700 leading-relaxed">{customerDetails.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-xs py-8 text-center">Select a hospital to view details.</p>
          )}
        </div>
      </div>

      {/* Form Modal Dialog */}
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
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden z-10 shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-extrabold text-slate-800 text-md">
                  {editingCustomer ? 'Update Customer' : 'Create New Customer'}
                </h4>
                <button onClick={() => setFormModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Fortis Healthcare"
                      {...register('name')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Address Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 100 Main Road"
                      {...register('address')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">District</label>
                    <input
                      type="text"
                      placeholder="e.g. Gurgaon"
                      {...register('district')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.district && <p className="text-xs text-red-500 font-medium">{errors.district.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Haryana"
                      {...register('state')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.state && <p className="text-xs text-red-500 font-medium">{errors.state.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">PIN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 122001"
                      {...register('pin')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {errors.pin && <p className="text-xs text-red-500 font-medium">{errors.pin.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">GSTIN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 06AAAAA1111A1Z1"
                      {...register('gst')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Corporate, Key Account"
                      {...register('tags')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Contacts Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Contacts (At Least 1)</span>
                    <button
                      type="button"
                      onClick={() => append({ name: '', designation: '', phone: '', email: '' })}
                      className="text-xs text-blue-600 font-semibold hover:text-blue-500 flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" /> Add contact
                    </button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl relative space-y-3">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute right-2 top-2 text-slate-400 hover:text-red-500"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Name"
                              {...register(`contacts.${index}.name` as const)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                            />
                            {errors.contacts?.[index]?.name && (
                              <p className="text-[10px] text-red-500 font-medium">{errors.contacts[index]?.name?.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Designation"
                              {...register(`contacts.${index}.designation` as const)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                            />
                            {errors.contacts?.[index]?.designation && (
                              <p className="text-[10px] text-red-500 font-medium">{errors.contacts[index]?.designation?.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Phone"
                              {...register(`contacts.${index}.phone` as const)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                            />
                            {errors.contacts?.[index]?.phone && (
                              <p className="text-[10px] text-red-500 font-medium">{errors.contacts[index]?.phone?.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Email"
                              {...register(`contacts.${index}.email` as const)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                            />
                            {errors.contacts?.[index]?.email && (
                              <p className="text-[10px] text-red-500 font-medium">{errors.contacts[index]?.email?.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {errors.contacts && !Array.isArray(errors.contacts) && (
                      <p className="text-xs text-red-500 font-medium">{errors.contacts.message}</p>
                    )}
                  </div>
                </div>

                {/* Additional Memo */}
                <div className="space-y-1.5 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Notes / Memos</label>
                  <textarea
                    placeholder="Provide special delivery requirements or notes..."
                    rows={3}
                    {...register('notes')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  ></textarea>
                </div>

                {/* Modal Footer actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setFormModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-500 shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
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
export default Customers;
