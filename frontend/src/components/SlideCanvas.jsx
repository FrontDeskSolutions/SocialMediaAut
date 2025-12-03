
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

// Font mapping
const fontMap = {
  modern: "font-heading",
  serif: "font-serif",
  mono: "font-mono",
  bold: "font-black",
};

// Effect mapping - Now applied to specific classes
const effectMap = {
  none: "",
  glow: "effect-glow",
  gradient: "effect-gradient",
  chrome: "effect-chrome",
  glitch: "effect-glitch",
  neon: "effect-neon",
};

// Theme mapping
const themeMap = {
  lime: { primary: '#ccff00', secondary: '#1a1a1a', text: '#ffffff' },
  emerald: { primary: '#34d399', secondary: '#064e3b', text: '#ffffff' },
  navy: { primary: '#bae6fd', secondary: '#0c4a6e', text: '#ffffff' },
  burgundy: { primary: '#f472b6', secondary: '#831843', text: '#ffffff' },
  slate: { primary: '#f8fafc', secondary: '#475569', text: '#ffffff' },
};

export const SlideCanvas = ({ slide, id }) => {
  const bgUrl = slide.background_url 
    ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/proxy/image?url=${encodeURIComponent(slide.background_url)}`
    : null;

  const layout = slide.layout || 'default';
  const font = fontMap[slide.font] || fontMap.modern;
  const effect = effectMap[slide.text_effect] || "";
  const type = slide.type || 'body';
  const variant = slide.variant || '1';
  
  const themeName = slide.theme || 'lime';
  const theme = themeMap[themeName];
  const arrowColor = slide.arrow_color || '#ffffff';

  // --- HERO SLIDE LOGIC (Inverted Colors) ---
  if (type === 'hero') {
    // Inverted: Background is Primary, Text is Black/Dark
    const heroStyle = {
        color: '#000000', // Inverted text
        '--theme-primary': theme.primary,
    };

    return (
        <div
            id={id}
            className={cn(
                "relative w-[1080px] h-[1080px] flex overflow-hidden shrink-0 transform origin-top-left select-none",
                "bg-black text-white" // Default base
            )}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            
            {/* Hero Overlay - Darker to make the "Inverted" text container pop, OR fully colored container */}
            <div className="absolute inset-0 z-0 bg-black/40" />

            <div className="relative z-10 w-full h-full p-16 flex flex-col justify-center">
                {/* Inverted Container */}
                <div 
                    className={cn(
                        "p-16 rounded-3xl shadow-2xl flex flex-col gap-8",
                        layout === 'hero_center' && "items-center text-center",
                        layout === 'hero_right' && "items-end text-right ml-auto max-w-3xl",
                        (layout === 'default' || layout === 'hero_left') && "items-start text-left max-w-3xl",
                    )}
                    style={{ backgroundColor: theme.primary }} // MAIN INVERSION
                >
                    <div 
                        className={cn("text-8xl uppercase tracking-tighter leading-[0.85] text-black whitespace-pre-wrap", font, effect)} 
                        data-text={slide.title}
                    >
                        {slide.title}
                    </div>
                    
                    <div className="h-2 w-32 bg-black/20" />

                    <p className="text-4xl text-black/80 font-body font-medium leading-tight whitespace-pre-wrap">
                        {slide.content}
                    </p>
                </div>
            </div>

            {/* Branding */}
            <div className="absolute bottom-12 left-12 z-20 text-2xl font-mono opacity-50 text-white mix-blend-difference tracking-widest">
                AGENCY.OS
            </div>
        </div>
    );
  }

  // --- CTA & BODY SLIDES (Standard Dark Mode) ---
  return (
    <div
      id={id}
      className={cn(
        "relative w-[1080px] h-[1080px] flex overflow-hidden bg-black text-white shrink-0 transform origin-top-left select-none",
        layout === 'split_left' && "flex-row",
        layout === 'split_right' && "flex-row-reverse",
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className={cn("absolute inset-0 z-0 transition-all duration-300", layout === 'center' ? "bg-black/80" : "bg-black/50", type === 'cta' && "bg-black/70")} />

      {/* Split Layout Masks */}
      {(layout === 'split_left' || layout === 'split_right') && (
         <div className="absolute inset-0 z-0 flex pointer-events-none">
            <div className={cn("w-1/2 h-full bg-black/90 backdrop-blur-lg", layout === 'split_left' ? "order-1" : "order-2")} />
         </div>
      )}

      {/* CONTENT RENDER */}
      <div className={cn(
        "relative z-10 flex flex-col w-full h-full",
        type === 'cta' && "items-center justify-center p-16",
        type === 'body' && layout === 'default' && "justify-between p-24",
        type === 'body' && layout === 'center' && "items-center justify-center text-center p-24 space-y-12",
        type === 'body' && (layout === 'split_left' || layout === 'split_right') && "w-1/2 p-20 justify-center space-y-12",
        type === 'body' && layout === 'minimalist' && "justify-end p-24 space-y-8"
      )}>
        
        {/* CTA Content */}
        {type === 'cta' && (
            <>
                {variant === '1' && (
                    <div className="text-center space-y-8 backdrop-blur-md bg-neutral-900/80 p-16 rounded-3xl border border-white/10 w-full max-w-4xl shadow-2xl">
                        <div className={cn("text-8xl uppercase tracking-tighter whitespace-pre-wrap", font, effect)} style={{color: theme.primary}} data-text={slide.title}>{slide.title}</div>
                        <div className="text-5xl font-medium text-white bg-white/5 px-12 py-8 rounded-full border border-white/10 inline-block whitespace-pre-wrap">{slide.content}</div>
                    </div>
                )}
                {variant === '2' && (
                    <div className="flex flex-col items-center justify-center text-center space-y-12 p-16 rounded-xl w-full max-w-3xl border-2" style={{borderColor: theme.primary, backgroundColor: 'rgba(0,0,0,0.8)'}}>
                        <div className="w-64 h-64 rounded-full bg-gray-800 border-4 overflow-hidden relative" style={{borderColor: theme.primary}}>
                            <div className="absolute inset-0 flex items-center justify-center text-6xl">👤</div>
                        </div>
                        <div className={cn("text-7xl uppercase tracking-tighter text-white whitespace-pre-wrap", font, effect)} data-text={slide.title}>{slide.title}</div>
                        <p className="text-4xl text-muted-foreground whitespace-pre-wrap">{slide.content}</p>
                    </div>
                )}
                {variant === '3' && (
                    <div className="flex flex-col items-center justify-center space-y-16 w-full max-w-5xl">
                        <div className={cn("text-9xl uppercase tracking-tighter text-center drop-shadow-2xl text-white whitespace-pre-wrap", font, effect)} data-text={slide.title}>{slide.title}</div>
                        <div className="w-full py-12 text-black text-7xl font-bold uppercase flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xl rounded-lg" style={{ backgroundColor: theme.primary }}>
                            {slide.content}
                        </div>
                    </div>
                )}
            </>
        )}

        {/* Body Content */}
        {type === 'body' && (
            <>
                <div className={cn(
                    "uppercase tracking-tighter leading-[0.9] drop-shadow-xl whitespace-pre-wrap",
                    font, effect,
                    layout === 'center' ? "text-9xl" : "text-8xl",
                    layout === 'minimalist' && "text-9xl text-white mix-blend-difference",
                )} style={{color: layout === 'minimalist' ? 'white' : theme.primary}} data-text={slide.title}>
                    {slide.title}
                </div>

                <div className={cn(
                    "relative whitespace-pre-wrap",
                    layout === 'default' && "bg-neutral-900/90 p-12 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl max-w-4xl",
                    layout === 'center' && "bg-neutral-900/80 p-12 rounded-2xl backdrop-blur-md border border-white/10 max-w-5xl"
                )}>
                    {layout === 'default' && <div className="absolute -left-1 top-8 bottom-8 w-1 rounded-full" style={{backgroundColor: theme.primary}} />}
                    <p className={cn("font-medium leading-snug text-white font-body", layout === 'center' ? "text-6xl" : "text-5xl")}>
                        {slide.content}
                    </p>
                </div>
            </>
        )}
      </div>
      
      {/* Navigation Arrow (Except CTA) */}
      {type !== 'cta' && (
        <div className="absolute bottom-12 right-12 z-20 p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors">
           <ArrowRight size={64} color={arrowColor} strokeWidth={3} />
        </div>
      )}
      
      {/* Watermark */}
      <div className="absolute bottom-12 left-12 z-20 text-2xl font-mono opacity-30 text-white mix-blend-difference tracking-widest">
        AGENCY.OS
      </div>
    </div>
  );
};
