import { createClient } from '@supabase/supabase-js';

// Helper to check if a value is a valid, usable string key
const isValidKey = (val: any): val is string => {
  return typeof val === 'string' && val.length > 0 && val !== 'undefined' && val !== 'null';
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vldggoqlwcoohcuchmkd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a safe mock client to prevent app crashes if keys are missing
const createMockClient = () => {
  console.warn("Supabase keys are missing or invalid. Using mock client for preview.");
  const mockResponse = { data: null, error: null };
  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signInWithPassword: () => Promise.resolve(mockResponse),
    signUp: () => Promise.resolve(mockResponse),
    signOut: () => Promise.resolve(mockResponse),
  };

  return new Proxy({ auth: mockAuth } as any, {
    get: (target, prop) => {
      if (prop === 'auth') return mockAuth;
      if (prop === 'from') return () => ({
        select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve(mockResponse) }) }),
        insert: () => Promise.resolve(mockResponse),
        upsert: () => Promise.resolve(mockResponse),
      });
      return () => Promise.resolve(mockResponse);
    }
  });
};

// Only call createClient if the keys are actually valid
export const supabase = (isValidKey(supabaseUrl) && isValidKey(supabaseAnonKey))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

export const getProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateProfile = async (updates: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    throw error;
  }
};
