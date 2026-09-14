/** Read/write boundary for the public create_lead RPC. */

import type { Language } from '@/constants/translations';
import { supabase } from '@/lib/supabase';

export type LeadSource =
  | 'interested_button'
  | 'whatsapp'
  | 'phone_call'
  | 'reel'
  | 'share'
  | 'property_detail'
  | 'search_result'
  | 'notification'
  | 'web'
  | 'other';

export type LeadPlatform = 'ios' | 'android' | 'web';

export interface CreateLeadInput {
  propertyId: string;
  source: LeadSource;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  message?: string;
  preferredLanguage?: Language;
  appVersion?: string;
  platform?: LeadPlatform;
}

export interface CreatedLead {
  leadId: string;
  referenceCode: string;
}

interface CreateLeadRpcRow {
  lead_id: string;
  reference_code: string;
}

function cleanOptional(value: string | undefined): string | null {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

/**
 * Creates a lead through the database's public RPC only. This deliberately
 * never calls public.leads.insert: the RPC owns validation and immutable
 * property/partner attribution snapshots.
 */
export async function createLead(input: CreateLeadInput): Promise<CreatedLead> {
  const { data, error } = await supabase
    .rpc('create_lead', {
      p_property_id: input.propertyId,
      p_source: input.source,
      p_contact_name: cleanOptional(input.contactName),
      p_contact_phone: cleanOptional(input.contactPhone),
      p_contact_email: cleanOptional(input.contactEmail),
      p_message: cleanOptional(input.message),
      p_preferred_language: input.preferredLanguage ?? null,
      p_source_detail: {},
      p_app_version: cleanOptional(input.appVersion),
      p_platform: input.platform ?? null,
    })
    .returns<CreateLeadRpcRow[]>();

  if (error) {
    throw new Error(`[leads] ${error.code ?? 'unknown'}: ${error.message}`);
  }

  const result = Array.isArray(data) ? data[0] : undefined;
  if (!result?.lead_id || !result.reference_code) {
    throw new Error('[leads] create_lead returned no lead reference');
  }

  return {
    leadId: result.lead_id,
    referenceCode: result.reference_code,
  };
}
