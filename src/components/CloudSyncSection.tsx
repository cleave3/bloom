import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { Button } from '@/components/ui/button';
import { Cloud, CloudUpload, CloudDownload, LogIn, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function CloudSyncSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { syncing, lastSynced, syncToCloud, syncFromCloud } = useCloudSync(user?.id);

  if (!user) {
    return (
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Cloud className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Cloud Backup</p>
            <p className="text-sm text-muted-foreground">
              Sign in to sync across devices
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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-safe/10">
          <Cloud className="w-5 h-5 text-safe" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">Cloud Backup</p>
          <p className="text-sm text-muted-foreground">
            {lastSynced 
              ? `Last synced ${format(lastSynced, 'MMM d, h:mm a')}`
              : 'Not synced yet'
            }
          </p>
        </div>
        {lastSynced && (
          <div className="p-1.5 rounded-full bg-safe/10">
            <Check className="w-4 h-4 text-safe" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={syncToCloud}
          disabled={syncing}
          variant="outline"
          className="flex-1 rounded-xl"
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CloudUpload className="w-4 h-4 mr-2" />
          )}
          Backup
        </Button>
        <Button
          onClick={syncFromCloud}
          disabled={syncing}
          variant="outline"
          className="flex-1 rounded-xl"
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CloudDownload className="w-4 h-4 mr-2" />
          )}
          Restore
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Signed in as {user.email}
      </p>
    </div>
  );
}
