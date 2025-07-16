import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  address?: string;
  kyc_status: 'pending' | 'in_review' | 'approved' | 'rejected';
  accredited_investor: boolean;
  investment_experience?: 'beginner' | 'intermediate' | 'experienced' | 'professional';
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
  preferred_investment_size?: number;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address' | 'bank_statement';
  file_url: string;
  file_name: string;
  file_size?: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<any> {
  try {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function createUserProfile(profile: any): Promise<any> {
  try {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: any): Promise<any> {
  try {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function getKYCDocuments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching KYC documents:', error);
    throw error;
  }
}

export async function uploadKYCDocument(document: any): Promise<any> {
  try {
    const { data, error } = await (supabase as any)
      .from('kyc_documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading KYC document:', error);
    throw error;
  }
}

export async function uploadFileToStorage(file: File, bucket: string, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicData;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}