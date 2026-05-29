export function PayFooter() {
  return (
    <footer className="shrink-0 border-t border-cp-outline-variant bg-cp-surface px-4 py-3 text-center">
      <p className="text-xs text-cp-on-surface-variant">
        en alianza con <span className="font-bold italic">BANCARIBE</span>
      </p>
      <p className="mt-1 text-[10px] text-cp-on-surface-variant opacity-70">
        Pago simulado en MVP · sin cargo bancario real
      </p>
      <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-cp-outline-variant" />
    </footer>
  );
}
