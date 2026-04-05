
Fix the issue in two parts: the current build errors, and the actual persistence/rendering gap that causes placed items to disappear on the signer link.

1. Fix the build blockers first
- Update the Fabric serialization calls in:
  - `src/pages/AdminPdfEditor.tsx`
  - `src/pages/SigningSessionPrepare.tsx`
- The errors at lines like `toJSON(FABRIC_CUSTOM_PROPS)` indicate the current Fabric version no longer accepts that argument shape there.
- Replace those calls with the project’s Fabric v6-compatible serialization approach so custom props like `fieldType`, `customType`, and `recipientId` are still preserved.

2. Make all canvas edits actually register as changes
- In `src/components/admin/PdfCanvas.tsx`, expand change reporting so `onCanvasChange` fires for all tool-created objects, not just path/modify/text edit events.
- Right now drag tools and freehand can be tracked, but click-added objects like:
  - text/textbox
  - signature/initials stamps
  - designated signer fields
  - strikethrough and other markup
  can be added without reliably updating the parent snapshot store.
- Add explicit parent notifications after each object insertion/finalization, and ensure newly created drag objects also trigger a save event on mouse up.

3. Make the signing prep page persist the latest page before send/preview
- In `src/pages/SigningSessionPrepare.tsx`, keep the existing in-memory per-document/per-page snapshot flow, but ensure the current live canvas state is always serialized before:
  - Preview (`handleNext`)
  - Send (`handleSend`)
  - Page/document switch
- Reuse the current `saveCurrentAnnotations()` path so the latest freeform/text edits are included even if the object was just placed.

4. Keep custom metadata on serialized objects
- When saving session fields from `collectFields()`, ensure every saved object still includes:
  - `fieldType`
  - `customType`
  - `recipientId`
- This is required so the signer view can distinguish:
  - interactive signer fields to click/sign
  - passive markup/freeform overlays to display only

5. Verify signer-page reconstruction logic matches saved data
- In `src/pages/SignDocument.tsx`, keep the existing split between:
  - interactive fields (`signature`, `initials`, `date`)
  - passive overlays (`markup:*`)
- Tighten the reconstruction logic so saved text boxes, freehand paths, lines, highlights, ellipses, and image stamps render from `storedPayload.object` whenever present.
- Confirm that recipient filtering only excludes signer-assigned interactive fields for other users, while passive markup remains visible to everyone.

6. Review the session fetch edge function
- Check and align `supabase/functions/get-signing-session/index.ts` with the frontend expectations:
  - return `fields` exactly as stored
  - do not strip `value`
  - keep document and recipient data intact
- Also fix any Deno/TypeScript issues in this file that are causing the current build report.

7. Review the email function build issues separately
- Check `supabase/functions/send-signing-email/index.ts` for Deno/typing/runtime compatibility issues introduced during the SMTP/Zoho changes.
- Keep the sending behavior from `noreply@unitedestatesre.com`, but clean up the function so it builds without affecting the signing data flow.

8. Expected result after implementation
- Anything placed in the field editor should survive:
  - preview
  - send
  - signer link open
- Signer-assigned fields should be clickable on the document.
- Freeform/text/markup should appear as read-only overlays in the signer view.
- Build errors in `AdminPdfEditor.tsx`, `SigningSessionPrepare.tsx`, and the two edge functions should be resolved.

Technical details
- Root cause is very likely a combination of:
  1. outdated Fabric serialization API usage causing build failure
  2. incomplete change notifications in `PdfCanvas`, so newly placed objects never make it into `annotationsByDocument`
  3. signer page depending entirely on saved `session_fields`, which means any unsaved canvas edits disappear from the email link
- The good news: the overall architecture is already close. The main fix is to make saving reliable for every tool and keep serialization compatible with the installed Fabric version.
