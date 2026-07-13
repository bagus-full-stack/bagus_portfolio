import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase.service';

export const useProfileId = () => {
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id')
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          setProfileId(data.id);
        }
      });
  }, []);

  return profileId;
};
