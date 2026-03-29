import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, MoreHorizontal, Send, Copy, XCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSigningSessions, useUpdateSigningSession } from '@/hooks/useSigningSessions';
import { useSessionRecipients } from '@/hooks/useSigningSessions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  voided: 'bg-red-100 text-red-700',
};

function SessionRow({ session, onAction }: { session: any; onAction: (action: string, id: string) => void }) {
  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-sm">{session.session_name || 'Untitled Session'}</div>
        <div className="text-xs text-muted-foreground">{session.created_at ? format(new Date(session.created_at), 'MMM d, yyyy') : ''}</div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[session.status] || statusColors.draft}`}>
          {session.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {session.date_sent ? format(new Date(session.date_sent), 'MMM d, yyyy h:mm a') : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction('edit', session.id)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('resend', session.id)}>
              <Send className="w-4 h-4 mr-2" /> Resend
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('clone', session.id)}>
              <Copy className="w-4 h-4 mr-2" /> Clone
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('void', session.id)} className="text-destructive">
              <XCircle className="w-4 h-4 mr-2" /> Void
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export default function SigningSessions() {
  const { id: dealId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSigningSessions(dealId);
  const updateSession = useUpdateSigningSession();

  const handleAction = (action: string, sessionId: string) => {
    if (action === 'edit') {
      navigate(`/transactions/${dealId}/signing-session/${sessionId}/setup`);
    } else if (action === 'void') {
      updateSession.mutate({ id: sessionId, status: 'voided' }, {
        onSuccess: () => toast.success('Session voided'),
      });
    } else if (action === 'clone') {
      toast.info('Clone coming soon');
    } else if (action === 'resend') {
      toast.info('Resend coming soon');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${dealId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Signing Sessions</h1>
        </div>
        <Button onClick={() => navigate(`/transactions/${dealId}/signing-session/new/setup`)}>
          <Plus className="w-4 h-4 mr-2" /> Create Signing Session
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : !sessions?.length ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No signing sessions yet</p>
          <Button onClick={() => navigate(`/transactions/${dealId}/signing-session/new/setup`)}>
            <Plus className="w-4 h-4 mr-2" /> Create Your First Session
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Session</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Sent</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <SessionRow key={s.id} session={s} onAction={handleAction} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
