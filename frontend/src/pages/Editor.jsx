
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getGeneration, updateGeneration, generateImage } from '../services/api';
import { SlideCanvas } from '@/components/SlideCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  Save, 
  Download, 
  Wand2, 
  ArrowLeft, 
  Layout, 
  Type, 
  Palette, 
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';

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
        toast.error("No slides found in this generation");
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
    
    const updatedSlides = generation.slides.map((slide, idx) => 
      idx === activeSlideIndex ? { ...slide, [field]: value } : slide
    );
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  if (!generation || !generation.slides || generation.slides.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No slides found</h2>
          <p className="text-muted-foreground">This generation doesn't have any slides yet.</p>
        </div>
      </div>
    );
  }

  const addSlide = () => {
    const newSlide = {
        id: crypto.randomUUID(),
        title: "New Slide",
        content: "Add your content here.",
        background_prompt: "Abstract background",
        type: "body",
        layout: "default",
        font: "modern"
    };
    const newSlides = [...generation.slides, newSlide];
    setGeneration({ ...generation, slides: newSlides });
    setActiveSlideIndex(newSlides.length - 1);
    toast.success("Slide added");
  };

  const deleteSlide = (e, index) => {
    e.stopPropagation();
    if (generation.slides.length <= 1) {
        toast.error("Cannot delete the only slide");
        return;
    }
    const newSlides = generation.slides.filter((_, i) => i !== index);
    setGeneration({ ...generation, slides: newSlides });
    if (activeSlideIndex >= index && activeSlideIndex > 0) {
        setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  return (
    <div className="h-screen bg-background text-white flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                    <ArrowLeft className="mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-xl font-bold">{generation.topic}</h1>
                    <p className="text-sm text-muted-foreground">Slide {activeSlideIndex + 1} of {generation.slides.length}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={saving} className="bg-primary text-black hover:bg-primary/80">
                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                    Save
                </Button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar: Thumbnails */}
            <div className="w-48 border-r border-border bg-secondary/20 overflow-y-auto p-4 space-y-4 flex flex-col" data-testid="slides-sidebar">
                {generation.slides.map((slide, idx) => (
                    <div 
                        key={slide.id}
                        onClick={() => setActiveSlideIndex(idx)}
                        data-testid={`slide-thumbnail-${idx}`}
                        className={cn(
                            "aspect-square bg-black border-2 cursor-pointer relative group transition-all shrink-0",
                            activeSlideIndex === idx ? "border-primary shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "border-border hover:border-primary/50"
                        )}
                    >
                        <div className="absolute top-1 left-1 bg-black/50 px-2 text-xs font-mono text-white z-10">{idx + 1}</div>
                        <button 
                            onClick={(e) => deleteSlide(e, idx)}
                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                            <Trash2 size={12} />
                        </button>
                        <div className="p-2 text-[8px] text-white truncate mt-6 pointer-events-none">{slide.title}</div>
                    </div>
                ))}
                
                <Button onClick={addSlide} variant="outline" className="w-full border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary">
                    <Plus size={16} className="mr-2"/> Add Slide
                </Button>
            </div>

            {/* Center: Canvas */}
            <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-12 relative overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                    style={{backgroundImage: 'linear-gradient(#262626 1px, transparent 1px), linear-gradient(90deg, #262626 1px, transparent 1px)', backgroundSize: '40px 40px'}} 
                />
                
                <div className="transform scale-[0.5] origin-center shadow-2xl border border-border/50">
                    <SlideCanvas slide={activeSlide} id={`slide-${activeSlideIndex}`} />
                </div>
            </div>

            {/* Right: Properties */}
            <div className="w-80 border-l border-border bg-background p-0 overflow-y-auto" data-testid="properties-panel">
                
                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 rounded-none bg-secondary/50 p-0 h-12">
                        <TabsTrigger value="content" className="data-[state=active]:bg-background rounded-none h-full border-b-2 data-[state=active]:border-primary border-transparent">CONTENT</TabsTrigger>
                        <TabsTrigger value="design" className="data-[state=active]:bg-background rounded-none h-full border-b-2 data-[state=active]:border-primary border-transparent">DESIGN</TabsTrigger>
                    </TabsList>
                    
                    <div className="p-6 space-y-6">
                        <TabsContent value="content" className="space-y-6 mt-0">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground">HEADLINE</label>
                                <Textarea 
                                    value={activeSlide.title} 
                                    onChange={e => handleUpdateSlide('title', e.target.value)}
                                    className="font-heading font-bold text-lg bg-secondary border-transparent focus:border-primary"
                                    rows={3}
                                    data-testid="input-headline"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground">BODY CONTENT</label>
                                <Textarea 
                                    value={activeSlide.content} 
                                    onChange={e => handleUpdateSlide('content', e.target.value)}
                                    className="font-body text-sm bg-secondary border-transparent focus:border-primary"
                                    rows={6}
                                    data-testid="input-content"
                                />
                            </div>

                             <div className="h-px bg-border my-4" />

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground">BACKGROUND PROMPT</label>
                                <Textarea 
                                    value={activeSlide.background_prompt} 
                                    onChange={e => handleUpdateSlide('background_prompt', e.target.value)}
                                    className="text-xs bg-secondary border-transparent focus:border-primary font-mono"
                                    rows={4}
                                    data-testid="input-prompt"
                                />
                                <Button 
                                    onClick={handleGenerateImage} 
                                    disabled={generatingImage}
                                    className="w-full mt-2 bg-secondary hover:bg-secondary/80 border border-border"
                                    data-testid="generate-art-button"
                                >
                                    {generatingImage ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                                    GENERATE ART
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="design" className="space-y-6 mt-0">
                             <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                    <Layout size={12} /> SLIDE TYPE
                                </label>
                                <Select 
                                    value={activeSlide.type || 'body'} 
                                    onValueChange={v => handleUpdateSlide('type', v)}
                                >
                                    <SelectTrigger className="bg-secondary border-transparent">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hero">Hero (Hook)</SelectItem>
                                        <SelectItem value="body">Body (Content)</SelectItem>
                                        <SelectItem value="cta">CTA (Action)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {activeSlide.type === 'cta' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                        <Palette size={12} /> CTA STYLE
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button variant={activeSlide.variant === '1' ? 'default' : 'outline'} onClick={() => handleUpdateSlide('variant', '1')} className="text-xs">Link</Button>
                                        <Button variant={activeSlide.variant === '2' ? 'default' : 'outline'} onClick={() => handleUpdateSlide('variant', '2')} className="text-xs">Profile</Button>
                                        <Button variant={activeSlide.variant === '3' ? 'default' : 'outline'} onClick={() => handleUpdateSlide('variant', '3')} className="text-xs">Button</Button>
                                    </div>
                                </div>
                            )}

                             <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                    <Layout size={12} /> LAYOUT STYLE
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['default', 'center', 'split_left', 'split_right', 'minimalist'].map(l => (
                                        <Button 
                                            key={l}
                                            variant={activeSlide.layout === l ? 'default' : 'outline'}
                                            onClick={() => handleUpdateSlide('layout', l)}
                                            className="text-xs uppercase justify-start h-10"
                                        >
                                            {l.replace('_', ' ')}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                    <Type size={12} /> TYPOGRAPHY
                                </label>
                                <Select 
                                    value={activeSlide.font || 'modern'} 
                                    onValueChange={v => handleUpdateSlide('font', v)}
                                >
                                    <SelectTrigger className="bg-secondary border-transparent">
                                        <SelectValue placeholder="Select Font" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="modern">Modern (Outfit)</SelectItem>
                                        <SelectItem value="serif">Classic (Playfair)</SelectItem>
                                        <SelectItem value="mono">Tech (Mono)</SelectItem>
                                        <SelectItem value="bold">Impact (Heavy)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                    <Sparkles size={12} /> TEXT EFFECT
                                </label>
                                <Select 
                                    value={activeSlide.text_effect || 'none'} 
                                    onValueChange={v => handleUpdateSlide('text_effect', v)}
                                >
                                    <SelectTrigger className="bg-secondary border-transparent">
                                        <SelectValue placeholder="Select Effect" />
                                    </SelectTrigger>
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
                        </TabsContent>
                    </div>
                </Tabs>

            </div>
        </div>
    </div>
  );
};

export default Editor;
