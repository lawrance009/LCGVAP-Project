/**
 * StudentDashboard.jsx
 * ---------------------------------------------------------------
 * The graduate's home after login. Shows:
 *   - Account status (pending / verified)
 *   - Degree submission status summary
 *   - Quick links (profile, directory, add degree)
 *   - Verification steps guide for pending users
 * ---------------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  AlertTriangle,
  UserCircle2,
  PlusCircle,
  Search,
  GraduationCap,
  Clock3,
  FileWarning,
  FileText,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/degrees')
      .then(res => setDegrees(res.data?.degrees || []))
      .catch(() => setDegrees([]))
      .finally(() => setLoading(false));
  }, []);

  const verified = degrees.filter(d => d.is_verified);
  const pending = degrees.filter(d => !d.is_verified && !d.rejection_reason);
  const rejected = degrees.filter(d => d.rejection_reason);

  const firstName = user?.first_name || 'Graduate';
  const isVerified = user?.is_verified;

  const steps = [
    { done: true, label: 'Account Created', desc: 'Your registration was received.' },
    { done: degrees.length > 0, label: 'Degree Submitted', desc: 'At least one degree document uploaded.' },
    { done: verified.length > 0, label: 'Degree Verified', desc: 'An admin has verified your credential.' },
    { done: isVerified, label: 'Directory Ready', desc: 'Your public alumni profile is now discoverable.' },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.section
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Veteran Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, {firstName}. Track your verification journey and manage your credentials.</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border ${
              isVerified
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {isVerified ? (
                <BadgeCheck className="w-3.5 h-3.5" />
              ) : (
                <Clock3 className="w-3.5 h-3.5" />
              )}
              {isVerified ? 'Verified Veteran' : 'Pending Veteran Verification'}
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-gray-600">Onboarding Progress</span>
              <span className="font-bold text-indigo-700">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Degrees', value: degrees.length, icon: GraduationCap },
            { label: 'Verified', value: verified.length, icon: BadgeCheck },
            { label: 'Pending Review', value: pending.length, icon: Clock3 },
            { label: 'Needs Attention', value: rejected.length, icon: FileWarning },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{stat.label}</p>
                <stat.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mt-3">
                {loading ? <span className="inline-block w-6 h-6 rounded bg-gray-200 animate-pulse" /> : stat.value}
              </p>
            </motion.div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition">
                  <UserCircle2 className="w-5 h-5 text-indigo-700" />
                  <div>
                    <p className="text-sm font-bold text-indigo-800">Manage Profile</p>
                    <p className="text-xs text-indigo-500">Update bio and veteran details</p>
                  </div>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition">
                  <PlusCircle className="w-5 h-5 text-emerald-700" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Submit New Degree</p>
                    <p className="text-xs text-emerald-500">Upload credential for review</p>
                  </div>
                </Link>
                <Link to="/directory" className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition">
                  <Search className="w-5 h-5 text-blue-700" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">Browse Directory</p>
                    <p className="text-xs text-blue-500">Explore verified veterans</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">Verification Checklist</h2>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      step.done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                        {step.done ? <BadgeCheck className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${step.done ? 'text-green-700' : 'text-gray-600'}`}>{step.label}</p>
                      <p className="text-xs text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2 space-y-6"
          >
            {rejected.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Action Required: Rejected Credentials
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  {rejected.length} credential{rejected.length > 1 ? 's were' : ' was'} rejected. Review feedback and resubmit from your profile.
                </p>
                <div className="space-y-2">
                  {rejected.slice(0, 3).map(d => (
                    <div key={d.id} className="bg-white border border-red-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-gray-800">{d.degree_type} {d.university_name ? `— ${d.university_name}` : ''}</p>
                      <p className="text-xs text-red-600 mt-1">Reason: {d.rejection_reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">Credential Pipeline</h2>
                <Link to="/profile" className="text-xs text-indigo-600 font-semibold hover:underline">Open Full Profile →</Link>
              </div>

              {loading ? (
                <p className="text-sm text-gray-400 py-6">Loading credentials…</p>
              ) : degrees.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">No credentials submitted yet</p>
                  <p className="text-xs text-gray-400 mt-1">Submit your first degree to begin verification.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {degrees.map(d => {
                    const tone = d.is_verified
                      ? 'bg-green-100 text-green-700'
                      : d.rejection_reason
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700';
                    const status = d.is_verified ? 'Verified' : d.rejection_reason ? 'Rejected' : 'Pending';
                    return (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{d.degree_type}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {d.university_name || 'University not set'}
                            {d.graduation_year ? ` · ${d.graduation_year}` : ''}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tone}`}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
