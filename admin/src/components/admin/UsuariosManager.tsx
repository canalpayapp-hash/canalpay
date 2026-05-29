'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@canalpay/shared';
import { getRoleLabel } from '@canalpay/shared';
import { inviteUserAction, updateProfileAction } from '@/app/admin/usuarios/actions';
import { AdminPageHeader } from './AdminPageHeader';

type ProfileRow = {
  id: string;
  full_name: string;
  role: string;
  status: string;
  merchant_id: string | null;
  branch_id: string | null;
  merchants: { name: string } | { name: string }[] | null;
  branches: { name: string } | { name: string }[] | null;
};

const STAFF_ROLES: UserRole[] = ['merchant_admin', 'supervisor', 'seller', 'cashier'];
const SUPER_ROLES: UserRole[] = ['super_admin', ...STAFF_ROLES];

function relName(rel: { name: string } | { name: string }[] | null | undefined): string | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0]?.name ?? null : rel.name;
}

export function UsuariosManager({
  profiles,
  merchants,
  branches,
  isSuperAdmin,
  defaultMerchantId,
}: {
  profiles: ProfileRow[];
  merchants: { id: string; name: string }[];
  branches: { id: string; name: string; merchant_id: string }[];
  isSuperAdmin: boolean;
  defaultMerchantId: string | null;
}) {
  const router = useRouter();
  const roleOptions = isSuperAdmin ? SUPER_ROLES : STAFF_ROLES;

  const [invite, setInvite] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'seller' as UserRole,
    merchant_id: defaultMerchantId ?? '',
    branch_id: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await inviteUserAction({
        email: invite.email,
        password: invite.password,
        full_name: invite.full_name,
        role: invite.role,
        merchant_id: invite.role === 'super_admin' ? null : invite.merchant_id || null,
        branch_id: invite.branch_id || null,
      });
      setInvite({
        email: '',
        password: '',
        full_name: '',
        role: 'seller',
        merchant_id: defaultMerchantId ?? '',
        branch_id: '',
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
    setLoading(false);
  }

  async function saveProfile(p: ProfileRow, updates: Partial<ProfileRow>) {
    setError(null);
    try {
      await updateProfileAction({
        id: p.id,
        full_name: updates.full_name ?? p.full_name,
        role: (updates.role ?? p.role) as UserRole,
        merchant_id: updates.merchant_id !== undefined ? updates.merchant_id : p.merchant_id,
        branch_id: updates.branch_id !== undefined ? updates.branch_id : p.branch_id,
        status: updates.status ?? p.status,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  const filteredBranches = (merchantId: string | null) =>
    branches.filter((b) => !merchantId || b.merchant_id === merchantId);

  return (
    <div>
      <AdminPageHeader
        title="Usuarios"
        subtitle={
          isSuperAdmin
            ? 'Gestiona todos los usuarios y roles de la plataforma'
            : 'Equipo de tu comercio'
        }
      />

      <form
        onSubmit={handleInvite}
        className="mb-8 rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest p-6"
      >
        <h2 className="mb-4 font-bold text-cp-on-surface">Invitar usuario</h2>
        <p className="mb-4 text-sm text-cp-on-surface-variant">
          Requiere <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> en el servidor web.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            type="email"
            placeholder="Email *"
            value={invite.email}
            onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
          <input
            required
            type="password"
            placeholder="Contraseña temporal *"
            value={invite.password}
            onChange={(e) => setInvite({ ...invite, password: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
          <input
            required
            placeholder="Nombre completo *"
            value={invite.full_name}
            onChange={(e) => setInvite({ ...invite, full_name: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
          <select
            value={invite.role}
            onChange={(e) => setInvite({ ...invite, role: e.target.value as UserRole })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {getRoleLabel(r)}
              </option>
            ))}
          </select>
          {isSuperAdmin && invite.role !== 'super_admin' && (
            <select
              required
              value={invite.merchant_id}
              onChange={(e) => setInvite({ ...invite, merchant_id: e.target.value, branch_id: '' })}
              className="rounded-lg border border-cp-outline-variant px-3 py-2 sm:col-span-2"
            >
              <option value="">Comercio *</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          {invite.role !== 'super_admin' && (
            <select
              value={invite.branch_id}
              onChange={(e) => setInvite({ ...invite, branch_id: e.target.value })}
              className="rounded-lg border border-cp-outline-variant px-3 py-2"
            >
              <option value="">Sucursal (opcional)</option>
              {filteredBranches(invite.merchant_id || defaultMerchantId).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-cp-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-xl bg-cp-primary px-6 py-2.5 font-semibold text-cp-on-primary disabled:opacity-50"
        >
          {loading ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest">
        <table className="w-full text-sm">
          <thead className="bg-cp-surface-container-low text-left text-xs font-bold uppercase text-cp-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
              {isSuperAdmin && <th className="px-4 py-3">Comercio</th>}
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cp-outline-variant">
            {profiles.map((p) => (
              <ProfileRowEditor
                key={p.id}
                profile={p}
                isSuperAdmin={isSuperAdmin}
                merchants={merchants}
                branches={filteredBranches(p.merchant_id)}
                roleOptions={roleOptions}
                onSave={saveProfile}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfileRowEditor({
  profile,
  isSuperAdmin,
  merchants,
  branches,
  roleOptions,
  onSave,
}: {
  profile: ProfileRow;
  isSuperAdmin: boolean;
  merchants: { id: string; name: string }[];
  branches: { id: string; name: string; merchant_id: string }[];
  roleOptions: UserRole[];
  onSave: (p: ProfileRow, u: Partial<ProfileRow>) => void;
}) {
  const [role, setRole] = useState(profile.role);
  const [status, setStatus] = useState(profile.status);
  const [merchantId, setMerchantId] = useState(profile.merchant_id ?? '');

  return (
    <tr className="hover:bg-cp-surface-container-low">
      <td className="px-4 py-3 font-semibold">{profile.full_name}</td>
      <td className="px-4 py-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded border border-cp-outline-variant px-2 py-1 text-xs"
        >
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {getRoleLabel(r)}
            </option>
          ))}
        </select>
      </td>
        {isSuperAdmin && (
          <td className="px-4 py-3 text-cp-on-surface-variant">
            {relName(profile.merchants) ?? '— (plataforma)'}
          </td>
        )}
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-cp-outline-variant px-2 py-1 text-xs"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() =>
            onSave(profile, {
              role,
              status,
              merchant_id: role === 'super_admin' ? null : merchantId || profile.merchant_id,
            })
          }
          className="text-sm font-semibold text-cp-primary hover:underline"
        >
          Guardar
        </button>
      </td>
    </tr>
  );
}
