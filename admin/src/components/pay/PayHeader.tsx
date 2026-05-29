import Image from 'next/image';

export function PayHeader({
  merchantName,
  logoUrl,
  showBack,
  onBack,
}: {
  merchantName?: string;
  logoUrl?: string | null;
  showBack?: boolean;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-cp-outline-variant bg-cp-surface px-4 shadow-sm">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-2 text-cp-primary hover:bg-cp-surface-low"
            aria-label="Volver"
          >
            ←
          </button>
        ) : null}
        <span className="text-lg font-bold text-cp-primary">CanalPay</span>
      </div>
      {merchantName ? (
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-cp-outline-variant bg-cp-surface-container">
          {logoUrl ? (
            <Image src={logoUrl} alt={merchantName} width={40} height={40} className="object-cover" unoptimized />
          ) : (
            <span className="text-sm font-bold text-cp-primary">{merchantName.charAt(0)}</span>
          )}
        </div>
      ) : null}
    </header>
  );
}
