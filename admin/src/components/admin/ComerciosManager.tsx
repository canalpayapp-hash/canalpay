'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminPageHeader } from './AdminPageHeader';

type Merchant = {
  id: string;
  name: string;
  rif: string | null;
  email: string | null;
  phone: string | null;
  status: string;
};

export function ComerciosManager({ initialMerchants }: { initialMerchants: Merchant[] }) {
  const router = useRouter();
  const [merchants, setMerchants] = useState(initialMerchants);
  const [form, setForm] = useState({ name: '', rif: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createMerchant(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('merchants')
      .insert({
        name: form.name.trim(),
        rif: form.rif || null,
        email: form.email || null,
        phone: form.phone || null,
        status: 'active',
      })
      .select('id, name, rif, email, phone, status')
      .single();

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMerchants((m) => [...m, data as Merchant].sort((a, b) => a.name.localeCompare(b.name)));
    setForm({ name: '', rif: '', email: '', phone: '' });
    router.refresh();
  }

  async function toggleStatus(m: Merchant) {
    const supabase = createClient();
    const next = m.status === 'active' ? 'inactive' : 'active';
    const { error: err } = await supabase.from('merchants').update({ status: next }).eq('id', m.id);
    if (err) {
      setError(err.message);
      return;
    }
    setMerchants((list) => list.map((x) => (x.id === m.id ? { ...x, status: next } : x)));
  }

  return (
    <div>
      <AdminPageHeader
        title="Comercios"
        subtitle="Alta y control de comercios en la plataforma CanalPay"
      />

      <form
        onSubmit={createMerchant}
        className="mb-8 rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest p-6"
      >
        <h2 className="mb-4 font-bold text-cp-on-surface">Nuevo comercio</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Nombre *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
          <input
            placeholder="RIF"
            value={form.rif}
            onChange={(e) => setForm({ ...form, rif: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
          <input
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-lg border border-cp-outline-variant px-3 py-2"
          />
        </div>
        {error && <p className="mt-2 text-sm text-cp-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-xl bg-cp-primary px-6 py-2.5 font-semibold text-cp-on-primary disabled:opacity-50"
        >
          {loading ? 'Guardando…' : 'Crear comercio'}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest">
        <table className="w-full text-sm">
          <thead className="bg-cp-surface-container-low text-left text-xs font-bold uppercase text-cp-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">RIF</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cp-outline-variant">
            {merchants.map((m) => (
              <tr key={m.id} className="hover:bg-cp-surface-container-low">
                <td className="px-4 py-3 font-semibold">{m.name}</td>
                <td className="px-4 py-3">{m.rif ?? '—'}</td>
                <td className="px-4 py-3 text-cp-on-surface-variant">
                  {m.email ?? '—'}
                  {m.phone ? ` · ${m.phone}` : ''}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      m.status === 'active'
                        ? 'bg-cp-success-bg text-cp-success'
                        : 'bg-cp-error-container text-cp-on-error-container'
                    }`}
                  >
                    {m.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleStatus(m)}
                    className="text-sm font-semibold text-cp-primary hover:underline"
                  >
                    {m.status === 'active' ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
