import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DrugDetail {
  id: string;
  medication_id: string | null;
  drug_name: string;
  generic_name: string | null;
  pronunciation: string | null;
  brand_names: string[];
  drug_class: string | null;
  description: string | null;
  uses: string[];
  warnings: string[];
  before_taking: string[];
  side_effects_emergency: string[];
  side_effects_common: string[];
  dosage_notes: string | null;
  interactions_note: string | null;
  pregnancy_category: string | null;
  controlled_substance: string | null;
  availability: string | null;
  related_conditions: string[];
  faq: { question: string; answer: string }[];
  source_url: string | null;
  scraped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  name: string;
  generic_name: string | null;
  category_id: string | null;
  quantity: number | null;
  unit: string | null;
  ndc_codes: string[] | null;
  rxcui: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  prices?: Price[];
}

export interface Price {
  id: string;
  medication_id: string;
  pharmacy_name: string;
  price: number;
  source: string | null;
  source_url: string | null;
  quantity: number | null;
  last_verified_at: string | null;
  is_current: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}
