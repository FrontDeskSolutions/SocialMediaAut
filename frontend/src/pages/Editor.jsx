
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGeneration, updateGeneration, generateImage } from '../services/api';
import { SlideCanvas } from '@/components/SlideCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import * as htmlToImage from 'html-to-image';
import { 
  Loader2, Save, Download, Wand2, ArrowLeft, Layout, Type, Palette, Sparkles, Plus, Trash2, Pipette 
} from 'lucide-react';
import '@/styles/effects.css'; // Import effects

const themeColors = {
  lime: '#ccff00',
  emerald: '#34d399',
  navy: '#bae6fd',
  burgundy: '#f472b6',
  slate: '#f8fafc',
};

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
    
    // UNIVERSAL THEME LOGIC
    if (field === 'theme') {
        // Update theme for ALL slides
        updatedSlides = updatedSlides.map(slide => ({ ...slide, theme: value }));
        toast.info("Theme updated for all slides");
    } else {
        // Update single property for active slide
        updatedSlides[activeSlideIndex] = { ...activeSlide, [field]: value };
    }

    setGeneration({ ...generation, slides: updatedSlides });
  };

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

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!generation) return <div>Not Found</div>;

  const addSlide = () => {
    const newSlide = {
        id: crypto.randomUUID(),
        title: "New Slide",
        content: "Add content...",
        background_prompt: "Abstract",
        type: "body",
        layout: "default",
        theme: activeSlide?.theme || 'lime' // Inherit theme
    };
    const newSlides = [...generation.slides, newSlide];
    setGeneration({ ...generation, slides: newSlides });
    setActiveSlideIndex(newSlides.length - 1);
  };

  const deleteSlide = (e, index) => {
    e.stopPropagation();
    if (generation.slides.length <= 1) return;
    const newSlides = generation.slides.filter((_, i) => i !== index);
    setGeneration({ ...generation, slides: newSlides });
    if (activeSlideIndex >= index && activeSlideIndex > 0) setActiveSlideIndex(activeSlideIndex - 1);
  };

  return (
    <div className="h-screen bg-background text-white flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
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
            <div className="w-48 border-r border-border bg-secondary/20 overflow-y-auto p-4 space-y-4 flex flex-col">
                {generation.slides.map((slide, idx) => (
                    <div key={slide.id} onClick={() => setActiveSlideIndex(idx)} className={cn("aspect-square bg-black border-2 cursor-pointer relative group", activeSlideIndex === idx ? "border-primary" : "border-border")}>
                        <div className="absolute top-1 left-1 bg-black/50 px-2 text-xs">{idx + 1}</div>
                        <button onClick={(e) => deleteSlide(e, idx)} className="absolute top-1 right-1 bg-red-500 p-1 opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                        <div className="p-2 text-[8px] mt-6 truncate">{slide.title}</div>
                    </div>
                ))}
                <Button onClick={addSlide} variant="outline"><Plus className="mr-2" /> Add Slide</Button>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-12 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
                <div className="transform scale-[0.55] shadow-2xl border border-white/10">
                    <SlideCanvas slide={activeSlide} id={`slide-${activeSlideIndex}`} />
                </div>
            </div>

            {/* Properties */}
            <div className="w-80 border-l border-border bg-background p-0 overflow-y-auto">
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
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground">BACKGROUND PROMPT</label>
                                <Textarea value={activeSlide.background_prompt} onChange={e => handleUpdateSlide('background_prompt', e.target.value)} className="bg-secondary border-transparent text-xs" rows={4} />
                                <Button onClick={handleGenerateImage} disabled={generatingImage} className="w-full bg-secondary hover:bg-secondary/80 border border-border">{generatingImage ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />} GENERATE ART</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="design" className="space-y-6 mt-0">
                             <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Palette size={12} /> GLOBAL THEME</label>
                                <Select value={activeSlide.theme || 'lime'} onValueChange={v => handleUpdateSlide('theme', v)}>
                                    <SelectTrigger className="bg-secondary border-transparent">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: themeColors[activeSlide.theme || 'lime']}} /> <SelectValue /></div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lime">Electric Lime</SelectItem>
                                        <SelectItem value="emerald">Emerald Green</SelectItem>
                                        <SelectItem value="navy">Deep Navy</SelectItem>
                                        <SelectItem value="burgundy">Rich Burgundy</SelectItem>
                                        <SelectItem value="slate">Clean Slate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                             <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Layout size={12} /> SLIDE TYPE</label>
                                <Select value={activeSlide.type || 'body'} onValueChange={v => handleUpdateSlide('type', v)}>
                                    <SelectTrigger className="bg-secondary border-transparent"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hero">Hero</SelectItem>
                                        <SelectItem value="body">Body</SelectItem>
                                        <SelectItem value="cta">CTA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Layout size={12} /> LAYOUT</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(activeSlide.type === 'hero' 
                                        ? ['default', 'hero_center', 'hero_left', 'hero_right'] 
                                        : ['default', 'center', 'split_left', 'split_right', 'minimalist']
                                    ).map(l => (
                                        <Button key={l} variant={activeSlide.layout === l ? 'default' : 'outline'} onClick={() => handleUpdateSlide('layout', l)} className="text-[10px] uppercase h-8">{l.replace('_', ' ')}</Button>
                                    ))}
                                </div>
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
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Sparkles size={12} /> TEXT EFFECT</label>
                                <Select value={activeSlide.text_effect || 'none'} onValueChange={v => handleUpdateSlide('text_effect', v)}>
                                    <SelectTrigger className="bg-secondary border-transparent"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="glow">Glow</SelectItem>
                                        <SelectItem value="gradient">Gradient</SelectItem>
                                        <SelectItem value="chrome">Chrome</SelectItem>
                                        <SelectItem value="glitch">Glitch</SelectItem>
                                        <SelectItem value="neon">Neon</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {activeSlide.type !== 'cta' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Pipette size={12} /> ARROW COLOR</label>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-8 h-8 rounded-full border border-border" style={{backgroundColor: activeSlide.arrow_color || '#ffffff'}} />
                                        <input type="color" value={activeSlide.arrow_color || '#ffffff'} onChange={(e) => handleUpdateSlide('arrow_color', e.target.value)} className="flex-1 h-8 bg-secondary border border-border cursor-pointer" />
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    </div>
  );
};

export default Editor;
