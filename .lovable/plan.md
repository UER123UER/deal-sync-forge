
Deep audit focused on saving/hydration. Main conclusion: this is not one bug. It is a save pipeline problem with at least 4 high-confidence breakpoints, plus several secondary render gaps.

What I believe is happening
1. Edits are often only living in local canvas memory, not in `session_fields`.
2. When you reopen the editor, the saved rows may exist, but the page canvas is not reliably rehydrated.
3. When the signer link opens, the signer page only shows what made it into `session_fields`, so anything not persisted disappears.

High-confidence reasons found in code
1. `PdfCanvas` never calls `onCanvasReady`.
   - File: `src/components/admin/PdfCanvas.tsx`
   - Effect: `SigningSessionPrepare.handleCanvasReady()` never runs, so saved page snapshots are not reliably loaded into the canvas.
   - Fix: call `onCanvasReadyRef.current?.()` immediately after Fabric canvas init and after the component is ready to accept `loadFromJSON`.

2. Reopen/edit flow depends on `handleCanvasReady`, but that callback is currently dead.
   - File: `src/pages/SigningSessionPrepare.tsx`
   - Effect: even if `session_fields` were saved, reopening the session can still look blank because hydration happens before the canvas exists, then never re-runs into the mounted canvas.
   - Fix: trigger hydration from `onCanvasReady` and also re-run load when `currentDocumentId/currentPage` changes.

3. Leaving the field editor does not persist to Supabase unless you hit Preview or Send.
   - File: `src/pages/SigningSessionPrepare.tsx`
   - Effect: if you place fields, then go back to setup or leave the route, those edits were only in `annotationsByDocument` memory and are lost on reopen.
   - Fix: save to `session_fields` before route back, before browser unload, and optionally with debounce autosave.

4. The current validation only checks interactive fields, not markup/freeform/text.
   - File: `src/pages/SigningSessionPrepare.tsx`
   - Effect: freeform overlays can silently fail to persist and the app still continues because only signature/date/initials counts are validated.
   - Fix: verify total saved object count and compare persisted rows vs collected rows, not just interactive count.

5. `useSaveSessionFields()` does destructive delete-then-insert.
   - File: `src/hooks/useSigningSessions.ts`
   - Effect: if insert fails after delete, all previous fields are wiped out.
   - Fix: switch to transactional/upsert-style persistence, or write new rows first and only replace on confirmed success.

6. Race condition if Preview/Send is clicked while a late object is still being inserted.
   - Files: `PdfCanvas.tsx`, `SigningSessionPrepare.tsx`
   - Effect: async objects like image stamps can miss the final snapshot if the user clicks immediately.
   - Fix: await object insertion/finalization before enabling Preview/Send, or flush the Fabric canvas after async stamp load.

7. Recipient assignment can be rewritten on save.
   - File: `SigningSessionPrepare.tsx` in `collectFields()`
   - Effect: if an object is missing `recipientId`, it falls back to `selectedSigner`, so fields can end up assigned to the wrong signer and disappear on the signer link for the intended person.
   - Fix: never use current UI selection as fallback for existing objects; require stored `recipientId` on designated fields.

8. Saved data may exist but not reload when switching page/document.
   - Files: `SigningSessionPrepare.tsx`, `PdfCanvas.tsx`
   - Effect: page/document switch saves current page, but the destination page is not guaranteed to load its saved snapshot because ready/hydration timing is broken.
   - Fix: explicitly load destination snapshot after canvas mount for every page/document change.

Likely secondary reasons
9. `loadFromJSON` usage is inconsistent across files.
   - Effect: some places use promise style, one place uses callback style. If Fabric v6 behavior differs, history/apply-state can become unreliable.
   - Fix: standardize on one Fabric v6 pattern everywhere.

10. Hydration is one-shot because `hydratedSavedFieldsRef` prevents reprocessing later updates.
   - Effect: if `sessionFields` arrive before the canvas is mounted, hydration data is cached but not applied visually.
   - Fix: separate “data parsed” from “canvas hydrated” and only mark hydrated after the load completes.

11. Preview screen shows local collected field count, not guaranteed persisted count.
   - Effect: preview can look fine while reopen/signer link stays blank.
   - Fix: preview should use refetched persisted rows after save, not only local memory.

12. Freehand/path overlays may save but render invisibly.
   - File: `src/pages/SignDocument.tsx`
   - Effect: path reconstruction ignores Fabric path offset/transform nuances, so saved drawing can exist in DB but not show correctly.
   - Fix: normalize overlay rendering from Fabric object data more faithfully.

13. Some overlay renderers ignore transforms/scaling details.
   - Effect: lines/ellipses/highlights can appear misplaced or zero-sized on signer view.
   - Fix: centralize object-to-overlay reconstruction with Fabric-compatible geometry handling.

14. Non-supported interactive types are coerced badly on signer page.
   - File: `SignDocument.tsx`
   - Effect: `fullname`, `email`, `time` are not mapped properly for interaction and can appear wrong or vanish from intended flow.
   - Fix: support all interactive field types explicitly or exclude them from signer flow until supported.

15. Group-based objects are only partly supported in reconstruction.
   - Effect: grouped objects without expected metadata may disappear on signer page.
   - Fix: preserve group metadata and add group render support where needed.

16. Async stamp placement can appear “placed” to the user but still miss the save snapshot.
   - Effect: especially for signature/initial image stamps.
   - Fix: on image `onload`, trigger a guaranteed parent save notification and disable navigation until it lands.

17. No DB-side save timestamp/version for fields.
   - Effect: hard to know whether reopen is loading old rows or no rows.
   - Fix: log save version/count in the client and optionally add a persisted checksum/debug field in the payload.

18. Delete/insert persistence can lose data on repeated clicks or double submission.
   - Effect: intermittent blank session after send.
   - Fix: lock send/preview actions during save and make save idempotent.

19. `get-signing-session` does not look like the main save bug.
   - Audit result: it returns `fields` with `value` intact and does not appear to strip metadata.
   - Fix: keep it aligned, but focus effort on frontend persistence first.

20. Email function is unrelated to field loss.
   - Audit result: it may have build/runtime issues, but it does not control whether `session_fields` were saved.
   - Fix: treat separately.

Recommended fix order
1. Fix `PdfCanvas` lifecycle:
   - call `onCanvasReady`
   - guarantee `onCanvasChange` after every insert/finalization
   - flush async image stamp insertions

2. Fix persistence triggers in `SigningSessionPrepare`:
   - save current canvas before preview/send/page switch/document switch/back navigation
   - add route-leave autosave
   - validate total persisted object count, not only interactive fields

3. Fix data integrity:
   - stop delete-then-insert data loss pattern
   - preserve `fieldType`, `customType`, `recipientId` for every object
   - remove `selectedSigner` fallback for existing objects

4. Fix hydration/reopen behavior:
   - apply saved snapshot after canvas mount every time
   - make hydration rerunnable, not one-shot-before-canvas

5. Fix signer reconstruction:
   - render from `storedPayload.object` consistently
   - keep passive markup visible to everyone
   - filter only interactive signer-assigned fields by recipient

Expected result after these fixes
- Place a field or markup
- Leave and reopen the session
- The PDF editor still shows the placed objects
- Preview uses persisted data, not just local memory
- Send writes the same objects into `session_fields`
- Signer link shows clickable signer fields and read-only freeform/markup overlays

Implementation plan
1. Patch `PdfCanvas` so mount/finalization events are complete and deterministic.
2. Patch `SigningSessionPrepare` so every exit path persists the live canvas first.
3. Replace fragile session field save logic with non-destructive persistence.
4. Rework reopen hydration to load saved snapshots after the canvas is actually mounted.
5. Tighten signer-page reconstruction so saved objects render from stored payloads exactly.

Technical note
Based on the code audit, the two strongest root causes are:
- missing `onCanvasReady` invocation, which breaks reload/hydration
- edits only being saved to memory until Preview/Send, which breaks reopen/back-edit behavior

Those two alone can fully explain: “I placed fields, sent/reopened, and nothing was there.”
