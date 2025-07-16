import React, { createContext, useContext, useEffect, useState } from 'react';
import brandingDefaults from '@/config/branding.config';
import { supabase } from '@/integrations/supabase/client';

export interface BrandingSettings extends typeof brandingDefaults {}

const BrandingContext = createContext<typeof brandingDefaults>(brandingDefaults);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<typeof brandingDefaults>(brandingDefaults);

  useEffect(() => {
    // Attempt to load dynamic branding overrides from Supabase table `branding_settings`
    supabase
      .from('branding_settings')
      .select('*')
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          // Merge overrides
          setBranding({ ...brandingDefaults, ...data });
        }
      });
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);