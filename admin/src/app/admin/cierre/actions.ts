'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function saveCashClosureAction(input: {
  merchant_id: string;
  branch_id: string | null;
  closure_date: string;
  total_orders: number;
  total_amount: number;
  total_paid: number;
  total_pending: number;
  total_failed: number;
  mark_reviewed: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const status = input.mark_reviewed ? 'reviewed' : 'draft';

  const { error } = await supabase.from('cash_closures').upsert(
    {
      merchant_id: input.merchant_id,
      branch_id: input.branch_id,
      closure_date: input.closure_date,
      total_orders: input.total_orders,
      total_amount: input.total_amount,
      total_paid: input.total_paid,
      total_pending: input.total_pending,
      total_failed: input.total_failed,
      status,
      reviewed_by: input.mark_reviewed ? user.id : null,
    },
    { onConflict: 'merchant_id,branch_id,closure_date' }
  );

  if (error) throw new Error(error.message);
  revalidatePath('/admin/cierre');
}
