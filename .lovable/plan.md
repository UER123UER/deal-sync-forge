

## Fix 5 UI Issues

### Changes

#### 1. Remove "Current Address" field from Seller step (NewDeal.tsx)
Remove lines 398-431 (the entire Current Address field with autocomplete) from the Step 5 seller form. Also remove the related state variables (`sellerAddressSearch`, `showSellerAddresses`, `sellerAddressSuggestions`, `sellerAddressLoading`) and the `currentAddress` field from the `sellerForm` state.

#### 2. Remove animate-pulse from signing fields (SignDocument.tsx)
Remove `animate-pulse` from the active field class in the `FieldOverlay` component (line 237). The active state will keep its highlight (`bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-lg`) but without flickering.

#### 3. Fix completed step headers flickering (NewDeal.tsx)
The `CompletedStep` component uses `motion.div` with `initial={{ opacity: 0, y: 10 }}` and `animate={{ opacity: 1, y: 0 }}`. Because it re-renders when typing (state changes), the animation replays causing flicker. Fix by removing the motion animation from `CompletedStep` — use a plain `div` instead of `motion.div`.

#### 4. Change "Make Visible To Office" to "Send to Office" (DealDetail.tsx)
Update the button text on line 323 from `'Make Visible To Office'` / `'Hide From Office'` to `'Send to Office'` / `'Sent to Office'`.

#### 5. Remove Open House from sidebar and app (AppSidebar.tsx, App.tsx)
- Remove the Open House nav item from `navItems` array in `AppSidebar.tsx` (line 11)
- Remove the Open House route from `App.tsx` (line 43)
- Remove the OpenHouse import from `App.tsx` (line 17)
- Keep the Open House dropdown in DealDetail.tsx since that's deal-specific scheduling (not a standalone page)

### Files Modified
- `src/pages/NewDeal.tsx` — remove Current Address field + fix CompletedStep flicker
- `src/pages/SignDocument.tsx` — remove animate-pulse
- `src/pages/DealDetail.tsx` — rename visibility button text
- `src/components/layout/AppSidebar.tsx` — remove Open House nav item
- `src/App.tsx` — remove Open House route and import

