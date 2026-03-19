

## Create Supabase Tables for Real Data Persistence

Replace all in-memory mock data with Supabase-backed tables. No auth yet — tables will be created with RLS enabled but permissive policies for now (we'll tighten after auth is added).

### Database Schema

**5 tables** matching the current data models:

#### 1. `contacts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK (default gen_random_uuid()) | |
| first_name | text NOT NULL | |
| last_name | text NOT NULL | |
| email | text | |
| phone | text | |
| company | text | |
| role | text | e.g. "Seller Agent", "Buyer" |
| current_address | text | |
| mls_id | text | |
| mls | text | |
| commission | text | |
| commission_type | text | 'percentage' or 'dollars' |
| tags | text[] DEFAULT '{}' | For People page filtering |
| last_touch | timestamptz | |
| next_touch | timestamptz | |
| created_at | timestamptz DEFAULT now() | |

#### 2. `deals`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK (default gen_random_uuid()) | |
| property_type | text NOT NULL | |
| address | text NOT NULL | |
| city | text NOT NULL | |
| state | text NOT NULL | |
| zip | text NOT NULL | |
| representation_side | text NOT NULL DEFAULT 'seller' | buyer/seller/both |
| status | text NOT NULL DEFAULT 'draft' | draft/active/pending/archive |
| price | text DEFAULT '$0' | |
| mls_number | text | |
| listing_start_date | date | |
| listing_expiration | date | |
| primary_agent | text DEFAULT 'Unassigned' | |
| created_at | timestamptz DEFAULT now() | |

#### 3. `deal_contacts` (join table)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| deal_id | uuid FK → deals(id) ON DELETE CASCADE | |
| contact_id | uuid FK → contacts(id) ON DELETE CASCADE | |
| role | text | Role within this deal |

#### 4. `checklist_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| deal_id | uuid FK → deals(id) ON DELETE CASCADE | |
| name | text NOT NULL | |
| has_digital_form | boolean DEFAULT false | |
| completed | boolean DEFAULT false | |
| sort_order | integer DEFAULT 0 | |
| created_at | timestamptz DEFAULT now() | |

#### 5. `tasks`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text NOT NULL | |
| description | text | |
| type | text NOT NULL DEFAULT 'todo' | todo/call/meeting/note |
| due_date | timestamptz | |
| end_date | timestamptz | |
| assignee | text | |
| created_at | timestamptz DEFAULT now() | |

### RLS Policies

All tables get RLS enabled with permissive `SELECT`, `INSERT`, `UPDATE`, `DELETE` for `anon` role for now. A note will be added that auth must be implemented to secure these.

### Code Changes

1. **Run migration** — create all 5 tables + RLS policies + seed sample data (the 3 existing deals, 15 contacts, checklist items, and join records)
2. **Update `src/store/deals.ts`** — replace hardcoded arrays with Supabase queries; keep Zustand for local UI state (newDeal wizard) but fetch/mutate deals via Supabase
3. **Update `src/pages/People.tsx`** — fetch contacts from Supabase instead of `MOCK_CONTACTS`
4. **Update `src/pages/Tasks.tsx`** — fetch/create tasks from Supabase
5. **Create `src/hooks/useDeals.ts`** — custom hook for CRUD operations on deals
6. **Create `src/hooks/useContacts.ts`** — custom hook for contacts CRUD
7. **Create `src/hooks/useTasks.ts`** — custom hook for tasks CRUD

### Important Note
Auth is not implemented yet. The permissive RLS policies allow all operations without login. Once auth is added, policies will be tightened to scope data per user.

