import type { TemplateData } from '@/data/marketingTemplates';

export interface RecentEntry {
  templateId: string;
  data: TemplateData;
  lastEdited: number;
  customName?: string;
}

const RECENTS_LIMIT = 20;

export function marketingRecentsKey(dealId: string) {
  return `uer_marketing_recents_${dealId}`;
}

export function loadMarketingRecents(dealId: string): RecentEntry[] {
  try {
    const raw = localStorage.getItem(marketingRecentsKey(dealId));
    return raw ? (JSON.parse(raw) as RecentEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveMarketingRecents(dealId: string, entries: RecentEntry[]): boolean {
  try {
    localStorage.setItem(
      marketingRecentsKey(dealId),
      JSON.stringify(entries.slice(0, RECENTS_LIMIT)),
    );
    return true;
  } catch (error) {
    console.warn('[Marketing] localStorage quota exceeded:', error);
    return false;
  }
}

export function upsertMarketingRecent(
  dealId: string,
  templateId: string,
  data: TemplateData,
) {
  const entries = loadMarketingRecents(dealId).filter((entry) => entry.templateId !== templateId);
  const updated: RecentEntry[] = [
    { templateId, data, lastEdited: Date.now() },
    ...entries,
  ];
  saveMarketingRecents(dealId, updated);
  return updated;
}
