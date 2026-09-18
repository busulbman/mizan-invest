/** Read-only dashboard aggregates. Admin RLS is the authorization boundary. */

import { supabase } from '@/lib/supabase';

export interface AdminDashboardCounts {
  publishedProperties: number;
  pendingProperties: number;
  partners: number;
  leads: number;
}

async function count(result: PromiseLike<{ count: number | null; error: { message: string } | null }>): Promise<number> {
  const { count: total, error } = await result;
  if (error) throw error;
  return total ?? 0;
}

export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const [publishedProperties, pendingProperties, partners, leads] = await Promise.all([
    count(supabase.from('properties').select('*', { count: 'exact', head: true }).eq('publication_status', 'published')),
    count(supabase.from('properties').select('*', { count: 'exact', head: true }).eq('publication_status', 'pending_review')),
    count(supabase.from('partners').select('*', { count: 'exact', head: true }).is('deleted_at', null)),
    count(supabase.from('leads').select('*', { count: 'exact', head: true })),
  ]);

  return { publishedProperties, pendingProperties, partners, leads };
}
