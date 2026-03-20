import { useRef, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Download, ZoomIn, ZoomOut, ChevronDown, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useDeal } from '@/hooks/useDeals';
import { TEMPLATES, getDefaultTemplateData, type TemplateData } from '@/data/marketingTemplates';

export default function MarketingEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || TEMPLATES[0].id;
  const navigate = useNavigate();
  const { data: deal } = useDeal(id);
  const canvasRef = useRef<HTMLDivElement>(null);

  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  const [data, setData] = useState<TemplateData>(() => getDefaultTemplateData());
  const [zoom, setZoom] = useState(0.5);
  const [basicsOpen, setBasicsOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);

  // Auto-fill from deal data
  useEffect(() => {
    if (deal) {
      setData(getDefaultTemplateData(deal));
    }
  }, [deal]);

  const updateField = useCallback((field: keyof TemplateData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: template.width,
        height: template.height,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-${data.address.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [template, data.address]);

  // Calculate scale to fit canvas in viewport
  const maxCanvasWidth = typeof window !== 'undefined' ? window.innerWidth - 400 : 800;
  const maxCanvasHeight = typeof window !== 'undefined' ? window.innerHeight - 120 : 600;
  const naturalScale = Math.min(maxCanvasWidth / template.width, maxCanvasHeight / template.height, 1);
  const scale = naturalScale * zoom;

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      {/* Top Toolbar */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="font-semibold text-sm">{template.name}</div>
            <div className="text-xs text-muted-foreground">{template.width}×{template.height} • {template.type}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={handleExport} size="sm" className="ml-4 gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-muted/50">
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
            }}
          >
            <div
              ref={canvasRef}
              className="shadow-2xl"
              style={{ width: template.width, height: template.height }}
            >
              {template.render(data, true)}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[340px] border-l bg-background shrink-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              {/* Basics */}
              <Collapsible open={basicsOpen} onOpenChange={setBasicsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold hover:text-foreground">
                  Property Details
                  <ChevronDown className={`h-4 w-4 transition-transform ${basicsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Headline</Label>
                    <Input value={data.headline} onChange={(e) => updateField('headline', e.target.value)} className="mt-1 h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Address</Label>
                    <Input value={data.address} onChange={(e) => updateField('address', e.target.value)} className="mt-1 h-8 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">City</Label>
                      <Input value={data.city} onChange={(e) => updateField('city', e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">State</Label>
                      <Input value={data.state} onChange={(e) => updateField('state', e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Zip</Label>
                      <Input value={data.zip} onChange={(e) => updateField('zip', e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Price</Label>
                    <Input value={data.price} onChange={(e) => updateField('price', e.target.value)} className="mt-1 h-8 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Beds</Label>
                      <Input value={data.beds} onChange={(e) => updateField('beds', e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Baths</Label>
                      <Input value={data.baths} onChange={(e) => updateField('baths', e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Sq Ft</Label>
                      <Input value={data.sqft} onChange={(e) => updateField('sqft', e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea value={data.description} onChange={(e) => updateField('description', e.target.value)} className="mt-1 text-sm" rows={3} />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Agent */}
              <Collapsible open={agentOpen} onOpenChange={setAgentOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold hover:text-foreground">
                  Agent Info
                  <ChevronDown className={`h-4 w-4 transition-transform ${agentOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pb-4">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input value={data.agentName} onChange={(e) => updateField('agentName', e.target.value)} className="mt-1 h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input value={data.agentTitle} onChange={(e) => updateField('agentTitle', e.target.value)} className="mt-1 h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={data.agentPhone} onChange={(e) => updateField('agentPhone', e.target.value)} className="mt-1 h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input value={data.agentEmail} onChange={(e) => updateField('agentEmail', e.target.value)} className="mt-1 h-8 text-sm" />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Open House specific fields */}
              {(template.category === 'Open House') && (
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold hover:text-foreground">
                    Open House Details
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pb-4">
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input value={data.openHouseDate} onChange={(e) => updateField('openHouseDate', e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Time</Label>
                      <Input value={data.openHouseTime} onChange={(e) => updateField('openHouseTime', e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
