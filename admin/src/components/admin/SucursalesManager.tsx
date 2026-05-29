'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminPageHeader } from './AdminPageHeader';

type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: string;
  merchant_id: string;
  merchants: { name: string } | { name: string }[] | null;
};

function merchantName(m: Branch['merchants']): string | null {
  if (!m) return null;
  return Array.isArray(m) ? m[0]?.name ?? null : m.name;
}

export function SucursalesManager({
  branches: initial,
  merchants,
  isSuperAdmin,
  defaultMerchantId,
}: {
  branches: Branch[];
  merchants: { id: string; name: string }[];
  isSuperAdmin: boolean;
  defaultMerchantId: string | null;
}) {
  const router = useRouter();
  const [branches, setBranches] = useState(initial);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    merchant_id: defaultMerchantId ?? merchants[0]?.id ?? '',
  });
  const [error, setError] = useState<string | null>(null);

  async function createBranch(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('branches')
      .insert({
        merchant_id: form.merchant_id,
        name: form.name.trim(),
        address: form.address || null,
        phone: form.phone || null,
        status: 'active',
      })
      .select('id, name, address, phone, status, merchant_id, merchants(name)')
      .single();

    if (err) {
      setError(err.message);
      return;
    }
    setBranches((b) => [...b, data as Branch]);
    setForm({ ...form, name: '', address: '', phone: '' });
    router.refresh();
  }

  return (
    <div>
      <AdminPageHeader title="Sucursales" subtitle="Puntos de venta por comercio" />
      <form
        onSubmit={createBranch}
        className="mb-8 rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest p-6"
      >
        <h2 className="mb-4 font-bold">Nueva sucursal</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {isSuperAdmin && (
            <select
              required
              value={form.merchant_id}
              onChange={(e) => setForm({ ...form, merchant_id: e.target.value })}
              className="rounded-lg border border-cp-outline-variant px-3 py-2 sm:col-span-2"
            >
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          <input
            required
            placeholder="Nombre *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
          <input
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
          <input
            placeholder="Dirección"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2 sm:col-span-2"
          />
        </div>
        {error && <p className="mt-2 text-sm text-cp-error">{error}</p>}
        <button
          type="submit"
          className="mt-4 rounded-xl bg-cp-primary px-6 py-2.5 font-semibold text-cp-on-primary"
        >
          Crear sucursal
        </button>
      </form>
      <ul className="divide-y divide-cp-outline-variant rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest">
        {branches.map((b) => (
          <li key={b.id} className="px-6 py-4">
            <p className="font-semibold">{b.name}</p>
            <p className="text-sm text-cp-on-surface-variant">
              {isSuperAdmin && merchantName(b.merchants) ? `${merchantName(b.merchants)} · ` : ''}
              {b.address ?? '—'} · {b.phone ?? '—'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
