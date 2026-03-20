import { useNavigate } from 'react-router-dom';
import { useDeals } from '@/hooks/useDeals';
import { cn } from '@/lib/utils';

export default function Listings() {
  const { data: deals = [], isLoading } = useDeals();
  const navigate = useNavigate();
  const listings = deals.filter((d) => d.status === 'active');

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">Listings</h1>
        <span className="ml-3 text-sm text-muted-foreground">{listings.length} active</span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : listings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted-foreground">No active listings. Create a deal and set its status to Active.</p></div>
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((deal) => (
              <div
                key={deal.id}
                className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-card"
                onClick={() => navigate(`/transactions/${deal.id}`)}
              >
                <div className="h-36 bg-muted flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground truncate">{deal.address}</h3>
                  <p className="text-xs text-muted-foreground">{deal.city}, {deal.state} {deal.zip}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-medium text-foreground">{deal.price || '$0'}</span>
                    {deal.mls_number && <span className="text-xs text-muted-foreground">MLS# {deal.mls_number}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
