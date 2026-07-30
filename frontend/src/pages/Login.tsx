import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Invalid credentials or connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    setValue('email', email);
    let pw = 'password123';
    if (email === 'Prashob@gmail.com') pw = 'prashob123';
    else if (email === 'krishnendhu@gmail.com') pw = 'krishnendhu123';
    else if (email === 'vishnu@gmail.com') pw = 'vishnu123';
    else if (email === 'ashwathy@gmail.com') pw = 'ashwathy123';
    else if (email === 'rony@gmail.com') pw = 'rony123';
    else if (email === 'aju@gmail.com') pw = 'aju123';
    setValue('password', pw);
  };

  const mockUsers = [
    { label: 'Super Admin', email: 'Prashob@gmail.com' },
    { label: 'Sales Manager', email: 'vishnu@gmail.com' },
    { label: 'Sales Executive', email: 'rony@gmail.com' },
    { label: 'Service Manager', email: 'krishnendhu@gmail.com' },
    { label: 'Service Engineer', email: 'aju@gmail.com' },
    { label: 'Accounts', email: 'ashwathy@gmail.com' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans px-4">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center z-10 relative">
        {/* Left Side: Brand presentation */}
        <div className="text-left hidden md:block pr-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Activity className="h-6 w-6 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              BioTrack EMS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight"
          >
            Enterprise-Grade Biomedical Sales & Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-slate-400 mt-4 leading-relaxed text-md"
          >
            Manage hospital installations, automate PM schedules, dispatch service engineers, track AMC renewals, and review spare parts ledgers on a single premium platform.
          </motion.p>
        </div>

        {/* Right Side: Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl w-full"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Sign In</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your details to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  placeholder="name@hospital.com"
                  {...register('email')}
                  className="w-full pl-11 pr-4 py-3 border border-white/[0.08] rounded-2xl bg-white/[0.02] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/[0.04] transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-11 pr-4 py-3 border border-white/[0.08] rounded-2xl bg-white/[0.02] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/[0.04] transition-all text-sm"
                />
              </div>
              {errors.password && <p className="text-xs text-red-400 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 border-t border-white/10 cursor-pointer disabled:opacity-50 transition-all text-sm mt-8 glow-btn"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Auto-Fill */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Quick Login (Testing)</h4>
            <div className="grid grid-cols-2 gap-2">
              {mockUsers.map((mu) => (
                <button
                  key={mu.label}
                  onClick={() => handleQuickLogin(mu.email)}
                  className="px-3 py-2 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.1] rounded-xl text-[11px] text-slate-300 transition-all font-medium text-left cursor-pointer"
                >
                  <div className="text-white font-bold">{mu.label}</div>
                  <div className="text-slate-500 text-[9px] truncate">{mu.email}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Login;
