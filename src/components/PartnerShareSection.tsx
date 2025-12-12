import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerShare } from '@/hooks/usePartnerShare';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Users, 
  Link2, 
  Copy, 
  Trash2, 
  LogIn,
  Plus,
  Check,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function PartnerShareSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shares, loading, createShareLink, deactivateShare, deleteShare, getShareUrl } = usePartnerShare(user?.id);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateShare = async () => {
    await createShareLink(partnerEmail || undefined);
    setPartnerEmail('');
    setDialogOpen(false);
  };

  const handleCopyLink = async (shareCode: string, shareId: string) => {
    const url = getShareUrl(shareCode);
    await navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    toast.success('Link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Partner Sharing</p>
            <p className="text-sm text-muted-foreground">
              Sign in to share with your partner
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/auth')}
          variant="outline"
          className="w-full rounded-xl"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In to Enable
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Partner Sharing</p>
            <p className="text-sm text-muted-foreground">
              Share cycle predictions with your partner
            </p>
          </div>
        </div>
      </div>

      {/* Active Shares */}
      {shares.length > 0 && (
        <div className="space-y-2">
          {shares.map((share) => (
            <div 
              key={share.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border',
                share.is_active ? 'border-border bg-background' : 'border-border/50 bg-muted/50'
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Link2 className={cn(
                  'w-4 h-4 flex-shrink-0',
                  share.is_active ? 'text-safe' : 'text-muted-foreground'
                )} />
                <div className="truncate">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    share.is_active ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {share.partner_email || 'Anyone with link'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {share.is_active ? 'Active' : 'Deactivated'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {share.is_active && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleCopyLink(share.share_code, share.id)}
                    >
                      {copiedId === share.id ? (
                        <Check className="w-4 h-4 text-safe" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deactivateShare(share.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {!share.is_active && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteShare(share.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Share */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Create Share Link
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Share with Partner</DialogTitle>
            <DialogDescription>
              Create a link to share your cycle predictions. Your partner will only see basic cycle info, not detailed symptoms or notes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="Partner's email (optional)"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Leave empty to create a link anyone can use
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateShare} className="w-full gradient-primary rounded-xl">
              Create Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
