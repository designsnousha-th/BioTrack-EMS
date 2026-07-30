import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  User,
  Plus,
  Cpu,
  Loader2,
  Users,
  Trash,
} from 'lucide-react';

const machineSchema = z.object({
  company: z.string().min(2, 'Manufacturer name is required'),
  category: z.string().min(2, 'Equipment category is required'),
  name: z.string().min(2, 'Model name is required'),
  model: z.string().min(2, 'Model number is required'),
  serialNumber: z.string().min(3, 'Default serial or identifier is required'),
});

type MachineFormData = z.infer<typeof machineSchema>;

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'EQUIPMENT' | 'USERS'>('EQUIPMENT');
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form states for creating/editing users
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('SERVICE_ENGINEER');

  // Equipment Form Setup
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

  // Query: Get all system users (only for admins)
  const { data: usersList, isLoading: usersLoading } = useQuery({
    queryKey: ['users-list-settings'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      return res.data || [];
    },
    enabled: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN',
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

  // Mutation: Create user account
  const createUserMutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list-settings'] });
      queryClient.invalidateQueries({ queryKey: ['engineers-select'] });
      queryClient.invalidateQueries({ queryKey: ['engineers-calls-select'] });
      toast.success('User account registered successfully!');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('SERVICE_ENGINEER');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error creating user account');
    },
  });

  // Mutation: Update user account
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/auth/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list-settings'] });
      queryClient.invalidateQueries({ queryKey: ['engineers-select'] });
      queryClient.invalidateQueries({ queryKey: ['engineers-calls-select'] });
      toast.success('User account updated successfully!');
      setEditingUser(null);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('SERVICE_ENGINEER');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error updating user account');
    },
  });

  // Mutation: Delete user account
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list-settings'] });
      queryClient.invalidateQueries({ queryKey: ['engineers-select'] });
      queryClient.invalidateQueries({ queryKey: ['engineers-calls-select'] });
      toast.success('User account deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error deleting user account');
    },
  });

  const onSubmitMachine = (data: MachineFormData) => {
    createMachineMutation.mutate(data);
  };

  const handleCreateOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      if (!newUserName || !newUserRole) {
        toast.error('Name and Role are required!');
        return;
      }
      updateUserMutation.mutate({
        id: editingUser.id,
        data: {
          name: newUserName,
          role: newUserRole,
          password: newUserPassword || undefined,
        },
      });
    } else {
      if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
        toast.error('All fields are required!');
        return;
      }
      createUserMutation.mutate({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column */}
        <div className="premium-card p-6 lg:col-span-2 space-y-6">
          {/* Tabs Selector for Admins */}
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
            <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1 max-w-[320px] mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('EQUIPMENT')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'EQUIPMENT' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Equipment Master
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('USERS')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'USERS' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                User Directory
              </button>
            </div>
          )}

          {activeTab === 'EQUIPMENT' ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-500" /> Equipment Master Catalog
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Register medical diagnostic machines sold by your company so they can be assigned to hospital installations.
                </p>
              </div>

              {/* Form to Add New Equipment */}
              <form onSubmit={handleSubmit(onSubmitMachine)} className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-4">
                <h4 className="font-bold text-xs text-slate-700">Add New Equipment Template</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
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

                  <div className="col-span-2 space-y-1.5">
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
          ) : (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" /> User Directory Management
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Add, edit, view, and manage logins for all system roles (Managers, Sales executives, Engineers, Accounts).
                </p>
              </div>

              {/* Form to Add / Edit User */}
              <form onSubmit={handleCreateOrUpdateUser} className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-700">
                    {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New Employee Account'}
                  </h4>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setNewUserName('');
                        setNewUserEmail('');
                        setNewUserPassword('');
                        setNewUserRole('SERVICE_ENGINEER');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tony Stark"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. tony@biotrack.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      disabled={!!editingUser}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {editingUser ? 'Reset Password (Optional)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Minimum 6 characters'}
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Security Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SALES_MANAGER">Sales Manager</option>
                      <option value="SALES_EXECUTIVE">Sales Executive</option>
                      <option value="SERVICE_MANAGER">Service Manager</option>
                      <option value="SERVICE_ENGINEER">Service Engineer</option>
                      <option value="ACCOUNTS">Accounts</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-500 shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {createUserMutation.isPending || updateUserMutation.isPending ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" /> {editingUser ? 'Save Updates' : 'Register Account'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* User Directory List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-700">System Users List ({usersList?.length || 0})</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {usersLoading ? (
                    <p className="text-xs text-slate-400 p-4">Loading user directory...</p>
                  ) : usersList && usersList.length > 0 ? (
                    usersList.map((u: any) => (
                      <div key={u.id} className="p-3 bg-white hover:bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{u.email}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">
                            {u.role.replace('_', ' ')}
                          </span>

                          <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(u);
                                setNewUserName(u.name);
                                setNewUserEmail(u.email);
                                setNewUserPassword('');
                                setNewUserRole(u.role);
                              }}
                              title="Edit User Info / Reset Password"
                              className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (u.email === user?.email) {
                                  toast.error('You cannot delete your own active account!');
                                  return;
                                }
                                if (window.confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email})?`)) {
                                  deleteUserMutation.mutate(u.id);
                                }
                              }}
                              title="Delete User Account"
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 p-4 text-center">No users registered.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: User / System Configurations */}
        <div className="space-y-6">
          <div className="premium-card p-6 space-y-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" /> User profile
            </h3>

            {user && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center font-bold font-display">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Security Clearance:</span>
                    <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="premium-card p-6 space-y-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-blue-500" /> BioTrack Company Settings
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Company Name</span>
                <input type="text" value="BioTrack Medical Solutions Pvt Ltd" disabled className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">System Contact Email</span>
                <input type="text" value="support@biotrackems.com" disabled className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Tax Structure</span>
                <input type="text" value="GST 18%" disabled className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
