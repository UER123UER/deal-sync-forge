import { useNavigate } from 'react-router-dom';
import { Copy, Edit, MoreHorizontal, Plus, Send, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSigningSessions, useUpdateSigningSession, type SigningSession } from '@/hooks/useSigningSessions';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  voided: 'bg-red-100 text-red-700',
};

interface SigningSessionsPanelProps {
  dealId: string;
  embedded?: boolean;
  className?: string;
  showHeading?: boolean;
}

function SessionRow({
  dealId,
  session,
  onAction,
}: {
  dealId: string;
  session: SigningSession;
  onAction: (action: string, sessionId: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <button
          type="button"
          className="text-left"
          onClick={() => navigate(`/transactions/${dealId}/signing-session/${session.id}/setup`)}
        >
          <div className="text-sm font-medium">{session.session_name || 'Untitled Session'}</div>
          <div className="text-xs text-muted-foreground">
            {session.created_at ? format(new Date(session.created_at), 'MMM d, yyyy') : ''}
          </div>
        </button>
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            statusColors[session.status] || statusColors.draft
          }`}
        >
          {session.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {session.date_sent ? format(new Date(session.date_sent), 'MMM d, yyyy h:mm a') : 'Draft'}
      </td>
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction('edit', session.id)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('resend', session.id)}>
              <Send className="mr-2 h-4 w-4" /> Resend
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('clone', session.id)}>
              <Copy className="mr-2 h-4 w-4" /> Clone
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction('void', session.id)}
              className="text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" /> Void
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function SigningSessionsPanel({
  dealId,
  embedded = false,
  className,
  showHeading = true,
}: SigningSessionsPanelProps) {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSigningSessions(dealId);
  const updateSession = useUpdateSigningSession();

  const handleAction = (action: string, sessionId: string) => {
    if (action === 'edit') {
      navigate(`/transactions/${dealId}/signing-session/${sessionId}/setup`);
      return;
    }

    if (action === 'void') {
      updateSession.mutate(
        { id: sessionId, status: 'voided' },
        {
          onSuccess: () => toast.success('Session voided'),
          onError: () => toast.error('Failed to void session'),
        }
      );
      return;
    }

    if (action === 'clone') {
      toast.info('Clone coming soon');
      return;
    }

    toast.info('Resend coming soon');
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        {showHeading ? (
          <div>
            <h2 className={cn('font-semibold text-foreground', embedded ? 'text-lg' : 'text-xl')}>
              Signing Sessions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review draft, sent, and completed signing sessions for this deal.
            </p>
          </div>
        ) : (
          <div />
        )}
        <Button onClick={() => navigate(`/transactions/${dealId}/signing-session/new/setup`)}>
          <Plus className="mr-2 h-4 w-4" /> Create Signing Session
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border py-12 text-center text-muted-foreground">Loading...</div>
      ) : !sessions?.length ? (
        <div className="rounded-lg border py-12 text-center">
          <p className="mb-4 text-muted-foreground">No signing sessions yet</p>
          <Button onClick={() => navigate(`/transactions/${dealId}/signing-session/new/setup`)}>
            <Plus className="mr-2 h-4 w-4" /> Create Your First Session
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                  Session
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                  Sent
                </th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <SessionRow
                  key={session.id}
                  dealId={dealId}
                  session={session}
                  onAction={handleAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
