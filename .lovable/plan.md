

## Give Agent Mode Full Admin Tabs & Tools

### Problem
Agent mode (`mode='agent'`) currently only shows Signers and Tools tabs, and hides Markup tools. The user wants agents to have access to all tabs (Signers, Docs, Tools, Layouts, Options — skip Feedback) and all tools including Text Box, Highlight, Line, Freehand, Strikethrough, Ellipse.

### Changes

| File | Change |
|------|--------|
| `src/components/admin/PdfEditorSidebar.tsx` | Update `agentTabs` to include `['signers', 'docs', 'tools', 'layouts', 'options']`. Remove the `!agentMode` guard around the Markup section in `ToolsPanel` so markup tools always render. |

Two line changes:
1. Line 63: `const agentTabs: SidebarTab[] = ['signers', 'docs', 'tools', 'layouts', 'options'];`
2. In `ToolsPanel`, remove the `{!agentMode && ( ... )}` conditional wrapper around the Markup tools section — just render them always.

