import Image from 'next/image';
import Link from 'next/link';
import { MaterialIcon } from './MaterialIcon';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDdnpPRl7tMPJ0RSOgN5qOAkv5CMYiUVngdv24UaMipwzjICDaC9rzvVWFRgSxqXMXiGMGnRDDtnuKxZC3TY5BabZ8BbxYa9rR0oIeTdysYK578Tx5qTvSlvNBhPjOBnThuoIdsOSE51JHBSlo2qrMAn55Rg325w7rBkuyc3LKqogmPQvGG58vuriZfxPzuCKV7eSNUxry10vUzSZr4f2VucpYGeikjlpjMiz2n59_YhexxGoMl4i9O86MhK4mZyHZCMza5h5GINvB-';

const BANCARIBE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBC1hSoq6zvqgYqScZ2o0kQp8P_09Z2SHddDYcrmzmg2o9dfcmQxEWLJJuiRg6c4sL8Ap8WEpLMENcWofqZWIex4ZDiRbN8gpSTE9KrBPvyqNjncurh4kJh0APoGeyxmcJ3okkT1oNE0K512NKbXTmGCMUNZa2EmP44s1UjVMIFtvEAL46lqwDjzEv-ZRUiOzqw6UyMffocRgFULdpPEYQ6BPMUigZSs4wplLjUYvY6RN7q5tJb8t-2B8_pfx2MoUAMpnAmEdPq3Bxb';

const TESTIMONIAL_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB7xLJ4xkEzz2VndbpG4RQ0is0CbacAg9Mfdo3tdb2L0sxMtr8N2TdyKe3phzmg-z9dP15KLr5PlAR8q4y2BnSIlQ9_RaQhts_IQI8rUBtn0yaVePIvnMcCm5ryNCcAaWvm8eRynTksLaM_vhXxzEyeisllnph5gN_r23nEtDVTQYr6TLoLFR1bIlcaa3p58rkk-iFfsDxgJ0CRQrUXgLX0CkVoU-QrsOf9yU4hAwsYCKPt6umpT5jt4HLKaeaoU6C-U2hBNMk_g6pp';

export function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#fdf7ff] text-[#1d1b20] selection:bg-[#00B8A9]/30">
      <header className="sticky top-0 z-50 border-b border-[#cbc4d2]/40 bg-[#fdf7ff]/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <MaterialIcon name="account_balance_wallet" className="text-[32px] text-[#4f378a]" />
            <span className="text-xl font-bold text-[#4f378a]">CanalPay</span>
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#solucion"
              className="hidden text-[#494551] transition-colors hover:text-[#4f378a] sm:inline"
            >
              Solución
            </a>
            <a
              href="#alianza"
              className="hidden text-[#494551] transition-colors hover:text-[#4f378a] sm:inline"
            >
              Alianza
            </a>
            <Link
              href="/login"
              className="rounded-full border border-[#4f378a] px-5 py-2 text-sm font-bold text-[#4f378a] transition-all hover:bg-[#4f378a]/5 active:scale-95"
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="landing-hero-gradient overflow-hidden pb-24 pt-16 md:pb-32 md:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
            <div className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center rounded-full bg-[#00B8A9]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00B8A9]">
                Fintech bancarizada
              </span>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#062B5F] md:text-5xl lg:text-[3rem] lg:leading-[1.1]">
                Vende por WhatsApp y cobra como un banco
              </h1>
              <p className="max-w-lg text-lg text-[#494551]">
                La infraestructura de pagos más robusta para comercios en redes sociales. Automatiza
                cobros, confirma transacciones en tiempo real y gestiona tus finanzas con seguridad de
                grado bancario.
              </p>
              <div className="mt-2 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="rounded-xl bg-[#00B8A9] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#00B8A9]/20 transition-all hover:brightness-110 active:scale-95"
                >
                  Empezar ahora
                </Link>
                <Link
                  href="/pagar/CP-1002"
                  className="flex items-center gap-2 rounded-xl border border-[#cbc4d2] bg-white px-8 py-4 text-lg font-bold text-[#062B5F] transition-all hover:bg-[#f8f2fa] active:scale-95"
                >
                  <MaterialIcon name="play_circle" />
                  Ver demo
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-10 -top-10 -z-10 h-[500px] w-[500px] rounded-full bg-[#4f378a]/5 blur-3xl" />
              <Image
                src={HERO_IMG}
                alt="App CanalPay en un smartphone"
                width={480}
                height={960}
                className="mx-auto w-full max-w-[480px] rounded-[40px] border-[12px] border-[#062B5F] shadow-2xl"
                priority
              />
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="bg-[#f8f2fa] py-24">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 text-center md:px-6">
            <h2 className="text-3xl font-bold text-[#062B5F]">
              ¿Pierdes tiempo confirmando pagos manualmente?
            </h2>
            <div className="mt-4 grid gap-8 text-left md:grid-cols-2">
              <article className="flex flex-col gap-4 rounded-2xl border border-[#cbc4d2] bg-white p-8 shadow-sm">
                <MaterialIcon name="warning" className="text-[40px] text-[#ba1a1a]" />
                <h3 className="text-xl font-semibold text-[#062B5F]">El caos de los comprobantes</h3>
                <p className="text-[#494551]">
                  Revisar cientos de capturas de pantalla en WhatsApp es una receta para el error
                  humano y el fraude. Los comprobantes falsos son una amenaza real para tu
                  rentabilidad.
                </p>
              </article>
              <article className="flex flex-col gap-4 rounded-2xl border border-[#cbc4d2] bg-white p-8 shadow-sm">
                <MaterialIcon name="leak_remove" className="text-[40px] text-[#ba1a1a]" />
                <h3 className="text-xl font-semibold text-[#062B5F]">Falta de orden operativo</h3>
                <p className="text-[#494551]">
                  Sin una integración bancaria real, la conciliación de final de día se convierte en
                  horas de trabajo manual. No puedes escalar tu negocio si el proceso de cobro te
                  detiene.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section id="solucion" className="overflow-hidden bg-[#fdf7ff] py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-16 flex flex-col gap-2 text-center">
              <h2 className="text-3xl font-bold text-[#062B5F]">
                Tu negocio, ahora en piloto automático
              </h2>
              <p className="text-lg text-[#494551]">Control total desde una sola plataforma profesional.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: 'verified_user',
                  color: 'bg-[#00B8A9]/10 text-[#00B8A9]',
                  title: 'Adiós a los captures falsos',
                  text: 'Validación automática con la entidad bancaria. Si el dinero no está en tu cuenta, el sistema no aprueba el pago.',
                },
                {
                  icon: 'query_stats',
                  color: 'bg-[#4f378a]/10 text-[#4f378a]',
                  title: 'Trazabilidad total',
                  text: 'Historial detallado de cada transacción. Filtra por fecha, cliente o sucursal con un solo clic.',
                },
                {
                  icon: 'link',
                  color: 'bg-[#63597c]/10 text-[#63597c]',
                  title: 'Links de pago en segundos',
                  text: 'Genera enlaces personalizados y envíalos por cualquier red social. Tus clientes pagan en un flujo impecable.',
                },
              ].map((f) => (
                <article
                  key={f.title}
                  className="flex flex-col gap-4 rounded-[32px] border border-[#cbc4d2] bg-white p-10 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className={`mb-2 flex h-14 w-14 items-center justify-center rounded-2xl ${f.color}`}
                  >
                    <MaterialIcon name={f.icon} className="text-[32px]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#062B5F]">{f.title}</h3>
                  <p className="text-sm text-[#494551]">{f.text}</p>
                </article>
              ))}
            </div>

            {/* Bancaribe alliance */}
            <div
              id="alianza"
              className="relative mt-8 flex flex-col items-center gap-12 overflow-hidden rounded-[40px] bg-[#062B5F] p-12 text-white md:flex-row"
            >
              <div className="absolute right-0 top-0 h-full w-1/2 skew-x-12 translate-x-32 bg-[#00B8A9]/10" />
              <div className="relative z-10 flex-1">
                <div className="mb-8 flex items-center gap-4">
                  <Image
                    src={BANCARIBE_IMG}
                    alt="Bancaribe"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full border-2 border-white/20 object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#00B8A9]">
                      Alianza estratégica
                    </p>
                    <p className="text-2xl font-bold">Impulsado por Bancaribe</p>
                  </div>
                </div>
                <div className="grid gap-8 sm:grid-cols-3">
                  {[
                    { icon: 'sync_alt', title: 'Conciliación automática', text: 'Cruce de cuentas instantáneo con el banco.' },
                    { icon: 'account_balance', title: 'Cierre de caja', text: 'Reportes consolidados listos para contabilidad.' },
                    { icon: 'store', title: 'Gestión de sucursales', text: 'Control multi-tienda desde un panel central.' },
                  ].map((item) => (
                    <div key={item.title} className="flex flex-col gap-2">
                      <MaterialIcon name={item.icon} className="text-[#00B8A9]" />
                      <h5 className="text-lg font-bold">{item.title}</h5>
                      <p className="text-sm text-white/70">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="border-y border-[#cbc4d2]/30 bg-[#f8f2fa] py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
              <div className="text-center md:text-left">
                <p className="text-5xl font-bold text-[#00B8A9]">99.9%</p>
                <p className="text-xl font-semibold text-[#062B5F]">Tiempo de actividad (Uptime)</p>
              </div>
              <div className="hidden h-20 w-px bg-[#cbc4d2] md:block" />
              <blockquote className="max-w-xl text-center text-xl italic text-[#494551] md:text-left">
                &ldquo;CanalPay transformó nuestra operación en WhatsApp. Pasamos de confirmar pagos
                manualmente a tener un flujo 100% automatizado en menos de una semana.&rdquo;
                <footer className="mt-4 flex items-center justify-center gap-3 not-italic md:justify-start">
                  <Image
                    src={TESTIMONIAL_IMG}
                    alt="Carlos Mendoza"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="text-lg font-bold text-[#062B5F]">Carlos Mendoza</span>
                  <span className="text-sm text-[#494551]">· CEO, Tienda Global</span>
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="relative overflow-hidden rounded-[40px] bg-[#00B8A9] p-12 text-center text-white shadow-2xl shadow-[#00B8A9]/20 md:p-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <h2 className="text-4xl font-bold md:text-5xl">Únete a la nueva era de pagos</h2>
                <p className="max-w-2xl text-lg opacity-90">
                  Regístrate hoy y comienza a cobrar con la eficiencia de una multinacional. Sin
                  costos ocultos, sin esperas largas.
                </p>
                <Link
                  href="/login"
                  className="mt-4 rounded-2xl bg-[#062B5F] px-12 py-5 text-xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Crear cuenta gratis
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#cbc4d2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-12 md:flex-row md:items-center md:px-6">
          <div className="max-w-sm">
            <div className="mb-4 flex items-center gap-2">
              <MaterialIcon name="account_balance_wallet" className="text-[24px] text-[#4f378a]" />
              <span className="text-lg font-bold">CanalPay</span>
            </div>
            <p className="text-sm text-[#494551]">
              © {year} CanalPay. Todos los derechos reservados. Soluciones de pago fintech de alta
              fiabilidad operadas bajo estándares internacionales de seguridad.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-sm text-[#494551]">
            <div>
              <h5 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#062B5F]">
                Producto
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="#solucion" className="hover:text-[#4f378a]">
                    Características
                  </a>
                </li>
                <li>
                  <Link href="/pagar/CP-1002" className="hover:text-[#4f378a]">
                    Demo de pago
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#062B5F]">
                Acceso
              </h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="hover:text-[#4f378a]">
                    Panel administrador
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
