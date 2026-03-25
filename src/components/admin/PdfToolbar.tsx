import { MousePointer2, Type, PenTool, Minus, Highlighter, Pencil, Stamp, Hash, CalendarDays, Trash2, Undo2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type ToolMode =
  | 'select'
  | 'text'
  | 'sign'
  | 'initials'
  | 'highlight'
  | 'draw'
  | 'line'
  | 'textbox'
  | 'designate-signature'
  | 'designate-initials'
  | 'designate-date';

interface PdfToolbarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  onDelete: () => void;
  onUndo: () => void;
  onSave: () => void;
  onSendToClient: () => void;
  hasSelection: boolean;
  isSaving: boolean;
}

const tools: { mode: ToolMode; icon: React.ElementType; label: string }[] = [
  { mode: 'select', icon: MousePointer2, label: 'Select' },
  { mode: 'text', icon: Type, label: 'Text' },
  { mode: 'sign', icon: PenTool, label: 'Sign' },
  { mode: 'initials', icon: Hash, label: 'Initials' },
  { mode: 'highlight', icon: Highlighter, label: 'Highlight' },
  { mode: 'draw', icon: Pencil, label: 'Draw' },
  { mode: 'line', icon: Minus, label: 'Line' },
];

const designateTools: { mode: ToolMode; label: string; color: string }[] = [
  { mode: 'designate-signature', label: 'Signature Field', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { mode: 'designate-initials', label: 'Initials Field', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { mode: 'designate-date', label: 'Date Field', color: 'bg-green-100 text-green-800 border-green-300' },
];

export function PdfToolbar({
  activeTool,
  onToolChange,
  onDelete,
  onUndo,
  onSave,
  onSendToClient,
  hasSelection,
  isSaving,
}: PdfToolbarProps) {
  return (
    <div className="bg-card border-b px-4 py-2 flex items-center gap-1 flex-wrap sticky top-0 z-10">
      {tools.map((t) => (
        <Button
          key={t.mode}
          variant={activeTool === t.mode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onToolChange(t.mode)}
          title={t.label}
          className="gap-1"
        >
          <t.icon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{t.label}</span>
        </Button>
      ))}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {designateTools.map((t) => (
        <Button
          key={t.mode}
          variant="outline"
          size="sm"
          onClick={() => onToolChange(t.mode)}
          className={cn('gap-1 text-xs', activeTool === t.mode && t.color)}
        >
          <Stamp className="w-3 h-3" />
          {t.label}
        </Button>
      ))}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button variant="ghost" size="sm" onClick={onDelete} disabled={!hasSelection} title="Delete Selected">
        <Trash2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onUndo} title="Undo">
        <Undo2 className="w-4 h-4" />
      </Button>

      <div className="flex-1" />

      <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving} className="gap-1">
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
      <Button size="sm" onClick={onSendToClient} className="gap-1">
        <Send className="w-4 h-4" />
        Send to Client
      </Button>
    </div>
  );
}
