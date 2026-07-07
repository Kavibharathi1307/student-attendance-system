import { useEffect, useState, useCallback } from 'react';
import { UserRound, Mail, ShieldCheck, GraduationCap, Building2, Phone, CalendarDays, BadgeCheck, PencilLine, X, Save, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { setToken, setStoredUser } from '../utils/authStorage.js';

const cardBase = 'rounded-[24px] border border-slate-200 bg-white/80 shadow-sm';
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500';
const btnClass = 'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition';

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Icon size={14} className="text-indigo-500" />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-slate-900">{value || '—'}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({ fullName: '', email: '', department: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    api.get('/profile')
      .then(r => {
        setProfile(r.data.profile);
        setForm({
          fullName: r.data.profile.fullName || '',
          email: r.data.profile.email || '',
          department: r.data.profile.department || '',
          phone: r.data.profile.phone || ''
        });
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile.' }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handlePwChange = useCallback((e) => {
    setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setMessage({ type: 'error', text: 'Full name must be at least 2 characters.' });
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setMessage({ type: 'error', text: 'A valid email address is required.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/profile', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        department: form.department.trim() || undefined,
        phone: form.phone.trim() || undefined
      });
      setProfile(res.data.profile);
      setToken(res.data.token);
      setStoredUser(res.data.profile);
      setMessage({ type: 'success', text: res.data.message || 'Profile updated successfully.' });
      setEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  }, [form]);

  const handleChangePassword = useCallback(async () => {
    if (!pwForm.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required.' });
      return;
    }
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/profile/change-password', pwForm);
      setMessage({ type: 'success', text: res.data.message || 'Password updated successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSaving(false);
    }
  }, [pwForm]);

  const cancelEdit = useCallback(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
        department: profile.department || '',
        phone: profile.phone || ''
      });
    }
    setEditing(false);
    setMessage(null);
  }, [profile]);

  const roleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      faculty: 'bg-cyan-100 text-cyan-700',
      student: 'bg-emerald-100 text-emerald-700'
    };
    return styles[role] || 'bg-slate-100 text-slate-700';
  };

  const statusBadge = (status) => {
    const styles = {
      Active: 'bg-emerald-100 text-emerald-700',
      Inactive: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="animate-pulse rounded-[28px] bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-900 p-6">
          <div className="h-4 w-32 rounded bg-slate-600" />
          <div className="mt-3 h-8 w-64 rounded bg-slate-600" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-2 h-5 w-36 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-900 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-white shadow-lg backdrop-blur-sm">
            <UserRound size={36} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Profile</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{profile?.fullName || 'User'}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${roleBadge(profile?.role)}`}>
                {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || 'User'}
              </span>
              {profile?.accountStatus && (
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusBadge(profile.accountStatus)}`}>
                  {profile.accountStatus}
                </span>
              )}
            </div>
          </div>
          {!editing && (
            <button onClick={() => { setEditing(true); setMessage(null); }}
              className={`${btnClass} bg-white/10 text-white hover:bg-white/20 border border-white/10`}>
              <PencilLine size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`rounded-[24px] border p-4 text-sm font-medium shadow-sm ${
          message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
          'border-red-200 bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Info */}
      <div className={`${cardBase} p-6`}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Account Information</h3>
          </div>
          {editing && (
            <button onClick={cancelEdit}
              className={`${btnClass} border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200`}>
              <X size={16} />
              Cancel
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange}
                  className={inputClass} placeholder="Enter full name" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className={inputClass} placeholder="Enter email" />
              </div>
              {(profile?.role === 'student' || profile?.role === 'faculty') && (
                <div>
                  <label className={labelClass}>Department</label>
                  <input name="department" value={form.department} onChange={handleChange}
                    className={inputClass} placeholder="Enter department" />
                </div>
              )}
              {profile?.role === 'student' && (
                <div>
                  <label className={labelClass}>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    className={inputClass} placeholder="Enter phone number" />
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={handleSave} disabled={saving}
                className={`${btnClass} bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/20`}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DetailRow icon={UserRound} label="Full Name" value={profile?.fullName} />
            <DetailRow icon={Mail} label="Email" value={profile?.email} />
            <DetailRow icon={ShieldCheck} label="Role" value={profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)} />
            <DetailRow icon={Building2} label="Department" value={profile?.department} />
            {profile?.studentId != null && (
              <DetailRow icon={GraduationCap} label="Register Number" value={profile?.studentId} />
            )}
            {profile?.phone != null && (
              <DetailRow icon={Phone} label="Phone" value={profile?.phone} />
            )}
            <DetailRow icon={BadgeCheck} label="Account Status" value={profile?.accountStatus || 'Active'} />
            <DetailRow icon={CalendarDays} label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className={`${cardBase} p-6`}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Change Password</h3>
          </div>
          {!changingPassword && (
            <button onClick={() => { setChangingPassword(true); setMessage(null); }}
              className={`${btnClass} border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200`}>
              <Lock size={16} />
              Change
            </button>
          )}
        </div>

        {changingPassword ? (
          <div className="space-y-4 max-w-lg">
            <div>
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <input name="currentPassword" type={showCurrent ? 'text' : 'password'} value={pwForm.currentPassword} onChange={handlePwChange}
                  className={`${inputClass} pr-10`} placeholder="Enter current password" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <input name="newPassword" type={showNew ? 'text' : 'password'} value={pwForm.newPassword} onChange={handlePwChange}
                  className={`${inputClass} pr-10`} placeholder="Enter new password (min 6 chars)" />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <div className="relative">
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={pwForm.confirmPassword} onChange={handlePwChange}
                  className={`${inputClass} pr-10`} placeholder="Confirm new password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleChangePassword} disabled={saving}
                className={`${btnClass} bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/20`}>
                <Lock size={16} />
                {saving ? 'Updating...' : 'Update Password'}
              </button>
              <button onClick={() => { setChangingPassword(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setMessage(null); }}
                className={`${btnClass} border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200`}>
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Your password was last set when you created your account. You can update it anytime.</p>
        )}
      </div>
    </section>
  );
}
