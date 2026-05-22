import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-[#062B5F]">Página no encontrada</h1>
      <Link href="/" className="text-[#00B8A9] font-medium">
        Volver al inicio
      </Link>
    </main>
  );
}
