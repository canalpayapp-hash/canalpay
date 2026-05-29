import { CheckoutView } from '@/components/pay/CheckoutView';

type Props = { params: Promise<{ code: string }> };

export default async function PagarPage({ params }: Props) {
  const { code } = await params;
  return <CheckoutView code={code} />;
}
