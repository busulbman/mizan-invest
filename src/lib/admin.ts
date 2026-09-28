/**
 * ============================================
 * ADMIN DATA
 * ============================================
 *
 * Reads and writes for the Mizan Management workspace.
 *
 * AUTHORIZATION IS NOT HERE
 * Every query below relies on `is_admin()` in RLS. Nothing in this module
 * grants anything: a non-admin running the same calls gets empty results and
 * failed writes, because the policies — not this file — decide.
 *
 * NO SERVICE ROLE
 * The client holds only the publishable key. Anything needing elevated rights
 * is an RPC (`review_property`, `review_partner_application`), never a
 * privileged key shipped in the bundle.
 */

import { supabase } from '@/lib/supabase';

export interface AdminDashboardCounts {
  /** Listings waiting on a review decision — the admin's actual queue. */
  pendingProperties: number;
  publishedProperties: number;
  /** Partner organisations that are live. */
  activePartners: number;
  /** Partner applications awaiting a decision. */
  pendingApplications: number;
  /** Leads not yet actioned. */
  newLeads: number;
  totalLeads: number;
}

async function count(
  result: PromiseLike<{ count: number | null; error: { message: string } | null }>
): Promise<number> {
  const { count: total, error } = await result;
  if (error) throw error;
  return total ?? 0;
}

/**
 * Dashboard aggregates.
 *
 * `head: true` with an exact count means the rows are never transferred — only
 * the count — so this stays cheap as the tables grow.
 */
export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const [
    pendingProperties,
    publishedProperties,
    activePartners,
    pendingApplications,
    newLeads,
    totalLeads,
  ] = await Promise.all([
    count(
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('publication_status', 'pending_review')
        .is('deleted_at', null)
    ),
    count(
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('publication_status', 'published')
        .is('deleted_at', null)
    ),
    count(
      supabase
        .from('partners')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .is('deleted_at', null)
    ),
    count(
      supabase
        .from('partner_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
    ),
    count(supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new')),
    count(supabase.from('leads').select('*', { count: 'exact', head: true })),
  ]);

  return {
    pendingProperties,
    publishedProperties,
    activePartners,
    pendingApplications,
    newLeads,
    totalLeads,
  };
}

/**
 * ============================================
 * LEADS
 * ============================================
 *
 * WHAT THE SCHEMA ALLOWS, verified against the live database:
 *   SELECT  — admin only (`leads_select_admin`), plus a customer reading their
 *             own rows. Never readable by anon.
 *   UPDATE  — admin only, and `tg_leads_protect_snapshot` rejects any change to
 *             the attribution snapshot, source, lead_kind or created_at. In
 *             practice that leaves `status` (and `assigned_admin`) writable.
 *   DELETE  — blocked for everyone including service_role
 *             (`tg_leads_block_delete`). 'spam' is the disposal route.
 *
 * The contact fields here are what a CUSTOMER gave Mizan when enquiring. They
 * are Mizan's own lead data and are shown to Mizan admins only. This is not
 * partner private contact data — that lives in `private.partner_private`, a
 * schema PostgREST does not serve — and nothing here changes the company-only
 * customer contact model.
 */
export const LEAD_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'matched_to_partner',
  'closed_won',
  'closed_lost',
  'spam',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface AdminLead {
  id: string;
  referenceCode: string;
  status: LeadStatus;
  source: string;
  /** Frozen at creation; immutable by database trigger. */
  propertyTitleSnapshot: string;
  propertyRefSnapshot: string;
  partnerNameSnapshot: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  message: string | null;
  createdAt: string;
  closedAt: string | null;
}

export async function getAdminLeads(status?: LeadStatus): Promise<AdminLead[]> {
  let query = supabase
    .from('leads')
    .select(
      `id, reference_code, status, source, property_title_snapshot, property_ref_snapshot,
       partner_name_snapshot, contact_name, contact_phone, contact_email, message,
       created_at, closed_at`
    )
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(`[getAdminLeads] ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    referenceCode: row.reference_code,
    status: row.status as LeadStatus,
    source: row.source,
    propertyTitleSnapshot: row.property_title_snapshot,
    propertyRefSnapshot: row.property_ref_snapshot,
    partnerNameSnapshot: row.partner_name_snapshot,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    message: row.message,
    createdAt: row.created_at,
    closedAt: row.closed_at,
  }));
}

/**
 * Moves a lead through the pipeline.
 *
 * Only `status` is sent. Attribution is immutable by trigger, so including a
 * snapshot column would turn a normal update into a permission error rather
 * than achieving anything. `closed_at` is set by the database when the status
 * becomes closed_won or closed_lost — it is deliberately not set here.
 */
export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
  if (error) throw new Error(`[updateLeadStatus] ${error.message}`);
}
