
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGeneration, updateGeneration, generateImage } from '../services/api';
import { SlideCanvas } from '@/components/SlideCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import * as htmlToImage from 'html-to-image';
import { 
  Loader2, Save, Download, Wand2, ArrowLeft, Layout, Type, Palette, Sparkles, Plus, Trash2, Pipette, Frame, Zap, Move, AlignLeft, AlignCenter, AlignRight, Eye
} from 'lucide-react';
import '@/styles/effects.css';

const Editor = () => {
  const { id } = useParams();
  const [generation, setGeneration] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const activeSlide = generation?.slides?.[activeSlideIndex];

  useEffect(() => {
    loadGeneration();
  }, [id]);

  const loadGeneration = async () => {
    try {
      const data = await getGeneration(id);
      setGeneration(data);
      if (!data.slides || data.slides.length === 0) {
        toast.error("No slides found");
        return;
      }
    } catch (e) {
      toast.error("Failed to load generation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlide = (field, value) => {
    if (!generation || !activeSlide) return;
    
    let updatedSlides = [...generation.slides];
    updatedSlides[activeSlideIndex] = { ...activeSlide, [field]: value };
    setGeneration({ ...generation, slides: updatedSlides });
  };

  // ... (Save, Generate, Download handlers same as before) ...
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGeneration(id, generation);
      toast.success("Saved successfully");
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!activeSlide) return;
    setGeneratingImage(true);
    try {
      const result = await generateImage(id, activeSlide.id);
      const updatedSlides = generation.slides.map((slide, idx) => 
        idx === activeSlideIndex ? { ...slide, background_url: result.url } : slide
      );
      setGeneration({ ...generation, slides: updatedSlides });
      toast.success("Image generated");
    } catch (e) {
      toast.error("Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  const downloadSlide = async () => {
    const node = document.getElementById(`slide-${activeSlideIndex}`);
    if (!node) return;
    try {
        const dataUrl = await htmlToImage.toPng(node, { cacheBust: true });
        const link = document.createElement('a');
        link.download = `slide-${activeSlideIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Exported!");
    } catch (error) {
        toast.error("Download failed");
    }
  };

  const handleGenerateViralVisuals = async () => {
    setGeneratingImage(true);
    try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/generations/${id}/generate-viral-visuals`, {
            method: 'POST',
        });
        if (res.ok) {
            toast.success("Generating Assets... (Check back in 1 min)");
            setTimeout(loadGeneration, 15000);
        } else {
            toast.error("Failed to trigger");
        }
    } catch (e) {
        toast.error("Error connecting to server");
    } finally {
        setGeneratingImage(false);
    }
  };

  const addSlide = () => {
    const newSlide = {
        id: crypto.randomUUID(),
        title: "New Slide",
        content: "Add content...",
        background_prompt: "Abstract",
        type: "body",
        layout: "centered_stack",
        theme_mode: "dark",
        text_bg_enabled: true
    };
    const slidesWithoutCTA = generation.slides.filter(s => s.type !== 'cta');
    const ctaSlide = generation.slides.find(s => s.type === 'cta');
    const newSlides = [...slidesWithoutCTA, newSlide];
    if (ctaSlide) newSlides.push(ctaSlide);
    setGeneration({ ...generation, slides: newSlides });
    setActiveSlideIndex(newSlides.length - (ctaSlide ? 2 : 1));
  };

  const deleteSlide = (e, index) => {
    e.stopPropagation();
    if (generation.slides.length <= 1) return;
    const newSlides = generation.slides.filter((_, i) => i !== index);
    setGeneration({ ...generation, slides: newSlides });
    if (activeSlideIndex >= index && activeSlideIndex > 0) setActiveSlideIndex(activeSlideIndex - 1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  if (!generation) return <div>Not Found</div>;

  return (
    <div className="h-screen bg-background text-white flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2" /> Back</Button></Link>
                <h1 className="text-xl font-bold truncate w-64">{generation.topic}</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={saving} variant="outline">{saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />} Save</Button>
                <Button onClick={downloadSlide} className="bg-primary text-black"><Download className="mr-2" /> Export PNG</Button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-48 border-r border-border bg-secondary/20 overflow-y-auto p-4 space-y-4 flex flex-col shrink-0">
                {generation.slides.map((slide, idx) => (
                    <div key={slide.id} onClick={() => setActiveSlideIndex(idx)} className={cn("aspect-square bg-black border-2 cursor-pointer relative group shrink-0", activeSlideIndex === idx ? "border-primary" : "border-border")}>
                        <div className="absolute top-1 left-1 bg-black/50 px-2 text-xs text-white">{idx + 1}</div>
                        <button onClick={(e) => deleteSlide(e, idx)} className="absolute top-1 right-1 bg-red-500 p-1 opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                        <div className="p-2 text-[8px] mt-6 truncate text-white">{slide.title || "Untitled"}</div>
                    </div>
                ))}
                <Button onClick={addSlide} variant="outline" className="shrink-0"><Plus className="mr-2" /> Add Slide</Button>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-12 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
                <div className="transform scale-[0.55] shadow-2xl border border-white/10">
                    <SlideCanvas slide={activeSlide} id={`slide-${activeSlideIndex}`} />
                </div>
            </div>

            {/* Properties Panel */}
            <div className="w-80 border-l border-border bg-background p-0 overflow-y-auto shrink-0">
                
                {generation.mode === 'viral' && !generation.slides[0].background_url && (
                    <div className="p-4 bg-purple-900/20 border-b border-purple-500/30">
                        <h3 className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2"><Zap size={12} /> AI CONTROL ROOM</h3>
                        <Button onClick={handleGenerateViralVisuals} disabled={generatingImage} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 h-8 text-xs">
                            {generatingImage ? <Loader2 className="animate-spin mr-2 h-3" /> : <Sparkles className="mr-2 h-3" />} GENERATE VISUALS
                        </Button>
                    </div>
                )}

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 rounded-none bg-secondary/50 p-0 h-12">
                        <TabsTrigger value="content" className="rounded-none h-full border-b-2 data-[state=active]:border-primary">CONTENT</TabsTrigger>
                        <TabsTrigger value="design" className="rounded-none h-full border-b-2 data-[state=active]:border-primary">DESIGN</TabsTrigger>
                    </TabsList>
                    
                    <div className="p-6 space-y-6">
                        <TabsContent value="content" className="space-y-6 mt-0">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground">HEADLINE</label>
                                <Textarea value={activeSlide.title} onChange={e => handleUpdateSlide('title', e.target.value)} className="bg-secondary border-transparent font-heading font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground">BODY</label>
                                <Textarea value={activeSlide.content} onChange={e => handleUpdateSlide('content', e.target.value)} className="bg-secondary border-transparent font-body" rows={6} />
                            </div>
                            {/* Colors */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Pipette size={12} /> HEADLINE COLOR</label>
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded-full border border-border" style={{backgroundColor: activeSlide.headline_color || '#FACC15'}} />
                                    <input type="color" value={activeSlide.headline_color || '#FACC15'} onChange={(e) => handleUpdateSlide('headline_color', e.target.value)} className="flex-1 h-8 bg-secondary border border-border cursor-pointer" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Pipette size={12} /> BODY COLOR</label>
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded-full border border-border" style={{backgroundColor: activeSlide.font_color || '#FFFFFF'}} />
                                    <input type="color" value={activeSlide.font_color || '#FFFFFF'} onChange={(e) => handleUpdateSlide('font_color', e.target.value)} className="flex-1 h-8 bg-secondary border border-border cursor-pointer" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground">BACKGROUND PROMPT</label>
                                <Textarea value={activeSlide.background_prompt} onChange={e => handleUpdateSlide('background_prompt', e.target.value)} className="bg-secondary border-transparent text-xs" rows={4} />
                                <Button onClick={handleGenerateImage} disabled={generatingImage} className="w-full bg-secondary hover:bg-secondary/80 border border-border">{generatingImage ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />} GENERATE ART</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="design" className="space-y-6 mt-0">
                            
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Eye size={12} /> GLASS & THEME</label>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <Button variant={activeSlide.theme_mode === 'dark' ? 'default' : 'outline'} onClick={() => handleUpdateSlide('theme_mode', 'dark')} className="text-xs h-8">Dark Mode</Button>
                                    <Button variant={activeSlide.theme_mode === 'light' ? 'default' : 'outline'} onClick={() => handleUpdateSlide('theme_mode', 'light')} className="text-xs h-8">Light Mode</Button>
                                </div>
                                <Select value={activeSlide.glass_intensity || 'high'} onValueChange={v => handleUpdateSlide('glass_intensity', v)}>
                                    <SelectTrigger className="bg-secondary border-transparent"><SelectValue placeholder="Glass Intensity" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Blur</SelectItem>
                                        <SelectItem value="low">Low Blur</SelectItem>
                                        <SelectItem value="medium">Medium Blur</SelectItem>
                                        <SelectItem value="high">High Blur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Frame size={12} /> CONTAINER OPACITY</label>
                                <div className="flex items-center justify-between border border-border p-2 rounded-md bg-secondary/20 mb-2">
                                    <Label htmlFor="text-bg" className="text-xs">Enable Container</Label>
                                    <Switch id="text-bg" checked={activeSlide.text_bg_enabled !== false} onCheckedChange={(v) => handleUpdateSlide('text_bg_enabled', v)} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground"><span>Opacity</span><span>{Math.round((activeSlide.container_opacity !== undefined ? activeSlide.container_opacity : 0.6) * 100)}%</span></div>
                                    <Slider value={[activeSlide.container_opacity !== undefined ? activeSlide.container_opacity : 0.6]} min={0} max={1} step={0.1} onValueChange={v => handleUpdateSlide('container_opacity', v[0])} />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Layout size={12} /> LAYOUT</label>
                                <Select value={activeSlide.layout || 'centered_stack'} onValueChange={v => handleUpdateSlide('layout', v)}>
                                    <SelectTrigger className="bg-secondary border-transparent"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="centered_stack">Centered Stack</SelectItem>
                                        <SelectItem value="split_left">Split Left</SelectItem>
                                        <SelectItem value="split_right">Split Right</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Type size={12} /> TYPOGRAPHY</label>
                                <Select value={activeSlide.font || 'modern'} onValueChange={v => handleUpdateSlide('font', v)}>
                                    <SelectTrigger className="bg-secondary border-transparent"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="modern">Modern</SelectItem>
                                        <SelectItem value="serif">Classic</SelectItem>
                                        <SelectItem value="mono">Tech</SelectItem>
                                        <SelectItem value="bold">Impact</SelectItem>
                                        <SelectItem value="handwritten">Handwritten</SelectItem>
                                        <SelectItem value="futuristic">Futuristic</SelectItem>
                                        <SelectItem value="editorial">Editorial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    </div>
  );
};

export default Editor;
