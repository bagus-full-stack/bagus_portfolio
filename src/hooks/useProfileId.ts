import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase.service';

const useProfileId = () => {
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id')
      .single()
      .then(({ data }) => {
        if (data) setProfileId(data.id);
      });
  }, []);

  return profileId;
};

export default useProfileId;
