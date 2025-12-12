import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PartnerShare {
  id: string;
  share_code: string;
  partner_email: string | null;
  is_active: boolean;
  created_at: string;
}

export function usePartnerShare(userId: string | undefined) {
  const [shares, setShares] = useState<PartnerShare[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShares = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_shares')
        .select('*')
        .eq('owner_id', userId);

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error('Error fetching shares:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const createShareLink = useCallback(async (partnerEmail?: string) => {
    if (!userId) return null;

    try {
      const shareCode = crypto.randomUUID().slice(0, 8);
      
      const { data, error } = await supabase
        .from('partner_shares')
        .insert({
          owner_id: userId,
          share_code: shareCode,
          partner_email: partnerEmail || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchShares();
      toast.success('Share link created!');
      return data;
    } catch (error) {
      console.error('Error creating share:', error);
      toast.error('Failed to create share link');
      return null;
    }
  }, [userId, fetchShares]);

  const deactivateShare = useCallback(async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('partner_shares')
        .update({ is_active: false })
        .eq('id', shareId);

      if (error) throw error;

      await fetchShares();
      toast.success('Share link deactivated');
    } catch (error) {
      console.error('Error deactivating share:', error);
      toast.error('Failed to deactivate share link');
    }
  }, [fetchShares]);

  const deleteShare = useCallback(async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('partner_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      await fetchShares();
      toast.success('Share link deleted');
    } catch (error) {
      console.error('Error deleting share:', error);
      toast.error('Failed to delete share link');
    }
  }, [fetchShares]);

  const getShareUrl = (shareCode: string) => {
    return `${window.location.origin}/shared/${shareCode}`;
  };

  return {
    shares,
    loading,
    createShareLink,
    deactivateShare,
    deleteShare,
    getShareUrl,
    refreshShares: fetchShares,
  };
}
