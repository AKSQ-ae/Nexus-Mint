import { supabase } from '@/integrations/supabase/client';

export interface PropertyFilter {
  status?: string;
  type?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getProperties(filter?: PropertyFilter) {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('is_active', true);

  if (filter?.type) {
    query = query.eq('property_type', filter.type);
  }

  if (filter?.city) {
    query = query.eq('city', filter.city);
  }

  if (filter?.minPrice) {
    query = query.gte('price_per_token', filter.minPrice);
  }

  if (filter?.maxPrice) {
    query = query.lte('price_per_token', filter.maxPrice);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_documents(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getFeaturedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data || [];
}