import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Shield,
  ShieldAlert,
  Trash2,
  Edit2,
  HardDrive,
  Check,
  X,
  UserCheck,
  UserX,
  Zap,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const {
    users,
    updateUserStatus,
    updateUserProfile,
    deleteUser,
    createUserAdmin,
    confirm,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');

  // Modal for new user creation
  const [addUserModal, setAddUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newPlan, setNewPlan] = useState<'free' | 'pro' | 'business' | 'custom'>('pro');
  const [newQuotaMB, setNewQuotaMB] = useState(25600); // 25 GB for Pro

  // Modal for assigning plan / editing quota
  const [editingQuotaUser, setEditingQuotaUser] = useState<User | null>(null);
  const [assignPlan, setAssignPlan] = useState<'free' | 'pro' | 'business' | 'custom'>('pro');
  const [assignQuotaMB, setAssignQuotaMB] = useState(25600);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.full_name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handlePlanSelection = (
    plan: 'free' | 'pro' | 'business' | 'custom',
    target: 'new' | 'assign'
  ) => {
    let mb = 1024;
    if (plan === 'free') mb = 1024;
    else if (plan === 'pro') mb = 25600; // 25 GB
    else if (plan === 'business') mb = 102400; // 100 GB

    if (target === 'new') {
      setNewPlan(plan);
      if (plan !== 'custom') setNewQuotaMB(mb);
    } else {
      setAssignPlan(plan);
      if (plan !== 'custom') setAssignQuotaMB(mb);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newPassword) return;

    const planName =
      newPlan === 'pro'
        ? 'Pro Creator (25 GB)'
        : newPlan === 'business'
        ? 'Business Studio (100 GB)'
        : newPlan === 'free'
        ? 'Free Starter (1 GB)'
        : `Custom Plan (${(newQuotaMB / 1024).toFixed(1)} GB)`;

    createUserAdmin({
      full_name: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
      storage_limit_mb: newQuotaMB,
      plan: newPlan,
      plan_name: planName,
      password: newPassword,
    });

    setAddUserModal(false);
    setNewFullName('');
    setNewEmail('');
    setNewPassword('');
    setNewPlan('pro');
    setNewQuotaMB(25600);
  };

  const handleToggleStatus = (u: User) => {
    const nextStatus: UserStatus = u.status === 'active' ? 'banned' : 'active';
    confirm({
      title: `${nextStatus === 'banned' ? 'Ban' : 'Unban'} User "${u.full_name}"?`,
      message:
        nextStatus === 'banned'
          ? 'Banning this user will block their login and hide their images from public sharing.'
          : 'Reactivate this user account?',
      confirmLabel: nextStatus === 'banned' ? 'Ban User' : 'Unban User',
      isDestructive: nextStatus === 'banned',
      onConfirm: () => {
        updateUserStatus(u.id, nextStatus);
      },
    });
  };

  const handleToggleRole = (u: User) => {
    const nextRole: UserRole = u.role === 'admin' ? 'user' : 'admin';
    confirm({
      title: `Change Role to ${nextRole.toUpperCase()}?`,
      message: `Are you sure you want to change ${u.full_name}'s permissions to ${nextRole}?`,
      confirmLabel: 'Confirm Role Change',
      onConfirm: () => {
        updateUserProfile(u.id, { role: nextRole });
      },
    });
  };

  const handleDeleteUser = (u: User) => {
    confirm({
      title: `Delete User "${u.full_name}"?`,
      message: `This will permanently wipe this user and all of their uploaded images and folders from the database.`,
      confirmLabel: 'Delete User & Data',
      isDestructive: true,
      onConfirm: () => {
        deleteUser(u.id);
      },
    });
  };

  const openAssignPlanModal = (u: User) => {
    setEditingQuotaUser(u);
    const mb = Math.round(u.storage_limit / (1024 * 1024));
    setAssignQuotaMB(mb);
    if (u.plan === 'pro' || (mb >= 20000 && mb < 60000)) {
      setAssignPlan('pro');
    } else if (u.plan === 'business' || mb >= 60000) {
      setAssignPlan('business');
    } else if (u.plan === 'free' || mb <= 2048) {
      setAssignPlan('free');
    } else {
      setAssignPlan('custom');
    }
  };

  const handleSavePlanAndQuota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuotaUser) return;

    const planName =
      assignPlan === 'pro'
        ? 'Pro Creator (25 GB)'
        : assignPlan === 'business'
        ? 'Business Studio (100 GB)'
        : assignPlan === 'free'
        ? 'Free Starter (1 GB)'
        : `Custom Plan (${(assignQuotaMB / 1024).toFixed(1)} GB)`;

    updateUserProfile(editingQuotaUser.id, {
      storage_limit: assignQuotaMB * 1024 * 1024,
      plan: assignPlan,
      plan_name: planName,
    });

    addToast(
      'Storage & Plan Assigned',
      `Assigned ${planName} (${(assignQuotaMB / 1024).toFixed(1)} GB) to ${editingQuotaUser.full_name} successfully!`,
      'success'
    );
    setEditingQuotaUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Management ({filteredUsers.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View accounts, ban or reactivate users, assign roles, and adjust storage allocations.
          </p>
        </div>

        <button
          onClick={() => setAddUserModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="admin">Platform Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="banned">Banned Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">User Profile</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Plan & Storage Quota</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => {
                const limitGB = u.storage_limit / (1024 * 1024 * 1024);
                const isPro = u.plan === 'pro' || (limitGB >= 20 && limitGB < 60);
                const isBusiness = u.plan === 'business' || limitGB >= 60;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u.full_name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.full_name}</span>
                            {u.role === 'admin' && (
                              <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 hover:bg-purple-200'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title="Click to toggle role"
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-colors ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100'
                        }`}
                        title="Click to toggle active/banned status"
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {isBusiness ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Award className="w-3 h-3" />
                              <span>Business (100 GB)</span>
                            </span>
                          ) : isPro ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                              <Zap className="w-3 h-3" />
                              <span>Pro Plan (25 GB)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              <span>Free (1 GB)</span>
                            </span>
                          )}

                          <button
                            onClick={() => openAssignPlanModal(u)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition-colors flex items-center gap-1"
                            title="Assign Plan or Storage Quota"
                          >
                            <HardDrive className="w-3 h-3" />
                            <span>Assign Plan</span>
                          </button>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {(u.storage_used / (1024 * 1024)).toFixed(1)} MB / {limitGB.toFixed(1)} GB
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAssignPlanModal(u)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                          title="Assign Storage & Plan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'active'
                              ? 'text-slate-400 hover:text-amber-600'
                              : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'active' ? 'Ban User' : 'Activate User'}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create User Account & Assign Storage
                </h3>
                <p className="text-xs text-slate-400">
                  Provision client account with designated storage tier immediately.
                </p>
              </div>
              <button
                onClick={() => setAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Client Full Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="e.g. client123"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="user">Client User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Plan Selection presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Storage Tier Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlanSelection('free', 'new')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newPlan === 'free'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Free Starter</div>
                    <div className="text-[10px] text-slate-400">1 GB Storage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection('pro', 'new')}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      newPlan === 'pro'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Zap className="w-3 h-3 text-purple-600" />
                      <span>Pro Creator</span>
                    </div>
                    <div className="text-[10px] text-purple-600 font-semibold">25 GB Storage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection('business', 'new')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newPlan === 'business'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>Business</span>
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold">100 GB Storage</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Storage Allocation (MB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={newQuotaMB}
                    onChange={(e) => {
                      setNewQuotaMB(Number(e.target.value));
                      setNewPlan('custom');
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-xs font-bold text-purple-600 shrink-0">
                    = {(newQuotaMB / 1024).toFixed(1)} GB
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddUserModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
                >
                  Create & Assign Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Plan & Storage Quota Modal for Existing User */}
      {editingQuotaUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Assign Storage Plan
                </h3>
                <p className="text-xs text-slate-400">
                  {editingQuotaUser.full_name} ({editingQuotaUser.email})
                </p>
              </div>
              <button
                onClick={() => setEditingQuotaUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlanAndQuota} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Plan to Assign
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlanSelection('free', 'assign')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      assignPlan === 'free'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Free Starter</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">1 GB Storage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection('pro', 'assign')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      assignPlan === 'pro'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                      <span>Pro Plan</span>
                    </div>
                    <div className="text-[10px] text-purple-600 font-semibold mt-0.5">25 GB Storage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlanSelection('business', 'assign')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      assignPlan === 'business'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Business</span>
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold mt-0.5">100 GB Storage</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Storage Quota (MB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={assignQuotaMB}
                    onChange={(e) => {
                      setAssignQuotaMB(Number(e.target.value));
                      setAssignPlan('custom');
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-xs font-bold text-purple-600 shrink-0">
                    = {(assignQuotaMB / 1024).toFixed(1)} GB
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Current Usage: {(editingQuotaUser.storage_used / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuotaUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
                >
                  Save & Assign Storage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
