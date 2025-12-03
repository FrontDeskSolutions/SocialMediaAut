
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGenerations, triggerGeneration } from '../services/api';
import { Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const Dashboard = () => {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [creating, setCreating] = useState(false);

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
      // Pass slide_count to API
      await triggerGeneration(newTopic, slideCount);
      toast.success("Generation started");
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
        <h1 className="text-4xl font-bold text-white font-heading" data-testid="dashboard-title">CONTROL ROOM</h1>
        
        <div className="bg-card border border-border p-4 rounded-sm w-full md:w-auto">
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

                <Button type="submit" disabled={creating} className="bg-primary text-black hover:bg-primary/80 h-10" data-testid="new-project-button">
                    {creating ? <Loader2 className="animate-spin" /> : <Plus />}
                    NEW PROJECT
                </Button>
            </form>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generations.map(gen => (
                <Link key={gen.id} to={`/editor/${gen.id}`}>
                    <Card className="p-6 bg-card border-border hover:border-primary transition-colors cursor-pointer group h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className={cn("text-xs font-mono px-2 py-1 uppercase", 
                                gen.status === 'completed' ? 'bg-green-900 text-green-400' : 
                                gen.status === 'failed' ? 'bg-red-900 text-red-400' : 
                                'bg-yellow-900 text-yellow-400'
                            )}>
                                {gen.status}
                            </span>
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

import { cn } from '@/lib/utils';
export default Dashboard;
