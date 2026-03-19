import { useState, useEffect, useRef } from 'react';

const HERE_API_KEY = 'AiDx3Qd6umV3vVKcvr2gJRiituEHhQ4UOBu8LJPE8xw';

export interface AddressSuggestion {
  address: string;
  city: string;
  state: string;
  zip: string;
  label: string;
}

export function useAddressAutocomplete(query: string) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(query)}&in=countryCode:USA&types=address&limit=6&apiKey=${HERE_API_KEY}`
        );
        if (!res.ok) throw new Error('HERE API error');
        const data = await res.json();

        const parsed: AddressSuggestion[] = (data.items || [])
          .filter((item: any) => item.address)
          .map((item: any) => {
            const addr = item.address;
            return {
              address: [addr.houseNumber, addr.street].filter(Boolean).join(' ') || addr.label || '',
              city: addr.city || '',
              state: addr.stateCode || addr.state || '',
              zip: addr.postalCode || '',
              label: item.title || '',
            };
          });

        setSuggestions(parsed);
      } catch (err) {
        console.error('Address autocomplete error:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { suggestions, isLoading };
}
