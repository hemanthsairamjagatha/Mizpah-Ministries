import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import type { AdminProfile } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import { Users, ShieldCheck, ShieldAlert, UserPlus, Key } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { profile: currentAdminProfile, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const list = await authService.listAdminProfiles();
      setAdmins(list);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load admin profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleRoleToggle = async (targetAdmin: AdminProfile) => {
    if (!isSuperAdmin) {
      toast.error('Only superadministrators can change admin roles');
      return;
    }

    if (targetAdmin.id === currentAdminProfile?.id) {
      toast.error('You cannot change your own superadmin role');
      return;
    }

    const newRole = targetAdmin.role === 'superadmin' ? 'admin' : 'superadmin';

    try {
      await authService.updateAdminProfile(targetAdmin.id, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || 'Failed to change role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-inter text-2xl font-bold text-navy-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-sky-500" />
            Admin Users & Authorization
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Manage authenticated team administrators, superadmin privileges, and access levels
          </p>
        </div>
      </div>

      {loading && <TableSkeleton rows={3} />}

      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy-800">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-navy-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Admin Name</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Created Date</th>
                {isSuperAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-semibold text-navy-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                        {adm.display_name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{adm.display_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        adm.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {adm.role === 'superadmin' ? (
                        <ShieldAlert className="w-3 h-3 text-purple-600" />
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-sky-600" />
                      )}
                      {adm.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-navy-400">
                    {adm.id.substring(0, 18)}...
                  </td>
                  <td className="py-4 px-4 text-xs text-navy-500">
                    {formatDate(adm.created_at)}
                  </td>
                  {isSuperAdmin && (
                    <td className="py-4 px-4 text-right">
                      {adm.id !== currentAdminProfile?.id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleToggle(adm)}
                          className="text-xs"
                        >
                          Switch to {adm.role === 'superadmin' ? 'Admin' : 'Superadmin'}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Current Session</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Security Guidance Note */}
      <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-sky-800 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <Key className="w-4 h-4 text-sky-600" />
          <span>Security & Registration Policy</span>
        </div>
        <p className="text-sky-700 leading-relaxed">
          Public visitors cannot self-register as administrators. Additional church administrators must be invited or created via the Supabase Auth Dashboard or superadmin backend script to guarantee high database security.
        </p>
      </div>
    </div>
  );
};
