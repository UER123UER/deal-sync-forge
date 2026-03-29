import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SigningSessionsPanel } from '@/components/deal/SigningSessionsPanel';

export default function SigningSessions() {
  const { id: dealId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${dealId}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Signing Sessions</h1>
        </div>
      </div>

      {dealId && <SigningSessionsPanel dealId={dealId} showHeading={false} />}
    </div>
  );
}
