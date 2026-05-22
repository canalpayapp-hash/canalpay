import Link from 'next/link';
import { colors } from '@canalpay/shared';

export default async function SinAccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const params = await searchParams;
  const esMobile = params.motivo === 'mobile';

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-4 text-center">
        <h1 className="text-xl font-bold" style={{ color: colors.navy }}>
          Sin acceso al panel web
        </h1>
        <p style={{ color: colors.gray }}>
          {esMobile
            ? 'Tu cuenta es de vendedor o cajero. Usa la app móvil CanalPay para crear cobros y ver tus órdenes.'
            : 'No tienes permisos para esta sección. Contacta al administrador de tu comercio.'}
        </p>
        <Link href="/login" className="inline-block font-semibold" style={{ color: colors.teal }}>
          Volver al login
        </Link>
      </div>
    </main>
  );
}
