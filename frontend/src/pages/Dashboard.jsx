
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGenerations, triggerGeneration } from '../services/api';
import { Plus, Loader2, Image as ImageIcon, Zap, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const themeOptions = [
  { id: "trust_clarity", name: "Trust & Clarity", color: "#0F172A" },
  { id: "modern_luxury", name: "Modern Luxury", color: "#1C1C1C" },
  { id: "swiss_minimalist", name: "Swiss Minimalist", color: "#000000" },
  { id: "forest_executive", name: "Forest Executive", color: "#064E3B" },
  { id: "warm_editorial", name: "Warm Editorial", color: "#4A3B32" },
  { id: "dark_mode_premium", name: "Dark Mode Premium", color: "#18181B" },
  { id: "slate_clay", name: "Slate & Clay", color: "#334155" },
  { id: "royal_academic", name: "Royal Academic", color: "#2E1065" },
  { id: "industrial_chic", name: "Industrial Chic", color: "#262626" },
  { id: "sunset_corporate", name: "Sunset Corporate", color: "#7C2D12" },
];

const Dashboard = () => {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [creating, setCreating] = useState(false);
  const [viralMode, setViralMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("trust_clarity");

  const load = async () => {
    try {
      const data = await getGenerations();
      setGenerations(data);
    } catch (e) {
      toast.error("Failed to load generations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTopic) return;
    setCreating(true);
    try {
      await triggerGeneration(newTopic, slideCount, viralMode ? 'viral' : '', selectedTheme);
      toast.success(viralMode ? "Text Generation Started (Images Manual)" : "Generation started");
      setNewTopic('');
      load();
    } catch (e) {
      toast.error("Failed to start generation");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8" data-testid="dashboard-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-white font-heading" data-testid="dashboard-title">CONTROL ROOM</h1>
            {viralMode && <span className="bg-primary text-black text-xs font-bold px-2 py-1 rounded uppercase animate-pulse">AI Viral Mode</span>}
        </div>
        
        <div className="bg-card border border-border p-4 rounded-sm w-full md:w-auto flex flex-col gap-4">
            <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground">TOPIC</label>
                    <input 
                        value={newTopic}
                        onChange={e => setNewTopic(e.target.value)}
                        placeholder="Enter topic..."
                        className="bg-secondary border border-border p-2 text-white w-64 focus:outline-none focus:border-primary h-10"
                        data-testid="new-topic-input"
                    />
                </div>
                
                <div className="space-y-2 w-32">
                    <label className="text-xs font-mono text-muted-foreground flex justify-between">
                        <span>SLIDES</span>
                        <span className="text-primary">{slideCount}</span>
                    </label>
                    <Slider 
                        value={[slideCount]} 
                        onValueChange={v => setSlideCount(v[0])}
                        min={1} 
                        max={10} 
                        step={1}
                        className="py-2"
                    />
                </div>

                <div className="space-y-2 w-48">
                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-2"><Palette size={12} /> THEME</label>
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                        <SelectTrigger className="bg-secondary border-border h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {themeOptions.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: t.color}} />
                                        <span className="text-xs">{t.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button type="submit" disabled={creating} className={cn("text-black h-10 w-40", viralMode ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600" : "bg-primary hover:bg-primary/80")} data-testid="new-project-button">
                    {creating ? <Loader2 className="animate-spin" /> : (viralMode ? <Zap className="mr-2" /> : <Plus className="mr-2" />)}
                    {viralMode ? "GENERATE" : "NEW PROJECT"}
                </Button>
            </form>
            
            <div className="flex items-center space-x-2 pt-2 border-t border-border">
                <Switch id="viral-mode" checked={viralMode} onCheckedChange={setViralMode} />
                <Label htmlFor="viral-mode" className="text-xs text-muted-foreground cursor-pointer">Enable <strong>AI Control Room</strong> (Advanced AI Flow)</Label>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generations.map(gen => (
                <Link key={gen.id} to={`/editor/${gen.id}`}>
                    <Card className={cn("p-6 bg-card border transition-colors cursor-pointer group h-full flex flex-col", gen.mode === 'viral' ? "border-purple-500/50 hover:border-purple-500" : "border-border hover:border-primary")}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2">
                                <span className={cn("text-xs font-mono px-2 py-1 uppercase", 
                                    gen.status === 'completed' ? 'bg-green-900 text-green-400' : 
                                    gen.status === 'failed' ? 'bg-red-900 text-red-400' : 
                                    'bg-yellow-900 text-yellow-400'
                                )}>
                                    {gen.status}
                                </span>
                                {gen.mode === 'viral' && <span className="text-xs font-mono px-2 py-1 uppercase bg-purple-900 text-purple-400"><Zap size={10} className="inline mr-1"/>VIRAL</span>}
                            </div>
                            <span className="text-muted-foreground text-xs">{new Date(gen.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary truncate">{gen.topic}</h3>
                        <div className="mt-auto flex items-center gap-2 text-muted-foreground">
                            <ImageIcon size={16} />
                            <span>{gen.slides?.length || 0} Slides</span>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
