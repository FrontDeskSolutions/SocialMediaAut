
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getGeneration, updateGeneration, generateImage } from '../services/api';
import { SlideCanvas } from '@/components/SlideCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, Download, Wand2, ArrowLeft, Layout, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Editor = () => {
  const { id } = useParams();
  const [generation, setGeneration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [generatingImage, setGeneratingImage] = useState(false);
  
  // Refs for export
  const slideRefs = useRef([]);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const data = await getGeneration(id);
      setGeneration(data);
    } catch (e) {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlide = (field, value) => {
    const newSlides = [...generation.slides];
    newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], [field]: value };
    setGeneration({ ...generation, slides: newSlides });
  };

  const saveChanges = async () => {
    try {
      await updateGeneration(id, { slides: generation.slides });
      toast.success("Saved changes");
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const handleGenerateImage = async () => {
    const slide = generation.slides[activeSlideIndex];
    if (!slide) return;
    
    setGeneratingImage(true);
    try {
      const res = await generateImage(id, slide.id);
      // Update local state
      const newSlides = [...generation.slides];
      newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], background_url: res.url };
      setGeneration({ ...generation, slides: newSlides });
      toast.success("Image generated");
    } catch (e) {
      toast.error("Image generation failed");
    } finally {
      setGeneratingImage(false);
    }
  };

  const downloadSlide = async () => {
    const node = document.getElementById(`slide-${activeSlideIndex}`);
    if (!node) return;
    
    try {
        // Use proxy logic implicitly handled by SlideCanvas
        const dataUrl = await htmlToImage.toPng(node, {
            cacheBust: true,
        });
        const link = document.createElement('a');
        link.download = `slide-${activeSlideIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Exported!");
    } catch (error) {
        console.error('Export failed:', error);
        toast.error("Download failed - try saving first");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!generation) return <div>Not found</div>;
  
  // Handle case where generation has no slides (failed generation)
  if (!generation.slides || generation.slides.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center flex-col space-y-4">
        <h2 className="text-2xl font-bold text-white">No Slides Available</h2>
        <p className="text-muted-foreground">This generation failed or has no slides yet.</p>
        <p className="text-sm text-muted-foreground">Status: {generation.status}</p>
        <Link to="/"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  const activeSlide = generation.slides[activeSlideIndex];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden" data-testid="editor-container">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur">
            <div className="flex items-center gap-4">
                <Link to="/"><Button variant="ghost" size="icon" data-testid="back-button"><ArrowLeft /></Button></Link>
                <h1 className="font-heading font-bold text-xl truncate w-64" data-testid="project-title">{generation.topic}</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={saveChanges} variant="outline" className="gap-2" data-testid="save-button"><Save size={16} /> Save</Button>
                <Button onClick={downloadSlide} className="bg-primary text-black gap-2" data-testid="export-button"><Download size={16} /> Export PNG</Button>
            </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar: Thumbnails */}
            <div className="w-48 border-r border-border bg-secondary/20 overflow-y-auto p-4 space-y-4" data-testid="slides-sidebar">
                {generation.slides.map((slide, idx) => (
                    <div 
                        key={slide.id}
                        onClick={() => setActiveSlideIndex(idx)}
                        data-testid={`slide-thumbnail-${idx}`}
                        className={cn(
                            "aspect-square bg-black border-2 cursor-pointer relative group transition-all",
                            activeSlideIndex === idx ? "border-primary shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "border-border hover:border-primary/50"
                        )}
                    >
                        <div className="absolute top-1 left-1 bg-black/50 px-2 text-xs font-mono text-white">{idx + 1}</div>
                        {/* Mini preview could go here */}
                        <div className="p-2 text-[8px] text-white truncate mt-6">{slide.title}</div>
                    </div>
                ))}
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
                        </TabsContent>
                    </div>
                </Tabs>

            </div>
        </div>
    </div>
  );
};

export default Editor;
