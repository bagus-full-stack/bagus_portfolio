import { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabase.service';
import { Profile } from '../types';

let cachedProfile: Profile | null = null;
let profilePromise: Promise<Profile> | null = null;

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(cachedProfile);
  const [loading, setLoading] = useState(!cachedProfile);

  useEffect(() => {
    let mounted = true;

    if (cachedProfile) {
      setProfile(cachedProfile);
      setLoading(false);
      return;
    }

    if (!profilePromise) {
      profilePromise = SupabaseService.getProfile();
    }

    profilePromise.then(data => {
      if (mounted) {
        cachedProfile = data;
        setProfile(data);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const refreshProfile = async () => {
    profilePromise = SupabaseService.getProfile();
    const data = await profilePromise;
    cachedProfile = data;
    setProfile(data);
  };

  return { profile, loading, refreshProfile };
}
