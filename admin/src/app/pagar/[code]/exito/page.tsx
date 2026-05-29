import { Suspense } from 'react';
import { SuccessView } from '@/components/pay/SuccessView';

type Props = { params: Promise<{ code: string }> };

function SuccessFallback() {
  return (
    <div className="flex min-h-[40dvh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cp-primary border-t-transparent" />
    </div>
  );
}

export default async function PagoExitoPage({ params }: Props) {
  const { code } = await params;
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessView code={code} />
    </Suspense>
  );
}
