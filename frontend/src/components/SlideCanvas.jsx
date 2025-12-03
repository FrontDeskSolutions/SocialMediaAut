
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

// Effect mapping
const effectMap = {
  none: "",
  glow: "effect-glow",
  gradient: "effect-gradient",
  chrome: "effect-chrome",
  glitch: "effect-glitch",
  neon: "effect-neon",
};

// Theme Definition
const themeMap = {
  trust_clarity: { 
    name: "Trust & Clarity", 
    headline: '#0F172A', // Deep Navy Slate
    subheadline: '#475569', // Cool Grey
    background: '#EFF6FF' // Very Pale Blue
  },
  modern_luxury: { 
    name: "Modern Luxury", 
    headline: '#1C1C1C', // Near Black
    subheadline: '#6D6D6D', // Neutral Charcoal
    background: '#F5F5F0' // Alabaster
  },
  swiss_minimalist: { 
    name: "Swiss Minimalist", 
    headline: '#000000', // True Black
    subheadline: '#555555', // Medium Grey
    background: '#FFFFFF' // Pure White
  },
  forest_executive: { 
    name: "Forest Executive", 
    headline: '#064E3B', // Deep Emerald
    subheadline: '#3F6258', // Desaturated Sage
    background: '#F2F7F5' // Mint Cream
  },
  warm_editorial: { 
    name: "Warm Editorial", 
    headline: '#4A3B32', // Dark Espresso
    subheadline: '#8C7B70', // Warm Taupe
    background: '#FAF6F1' // Linen
  },
  dark_mode_premium: { 
    name: "Dark Mode Premium", 
    headline: '#FFFFFF', // White
    subheadline: '#A1A1AA', // Light Zinc
    background: '#18181B' // Rich Black
  },
  slate_clay: { 
    name: "Slate & Clay", 
    headline: '#334155', // Slate Blue-Grey
    subheadline: '#94A3B8', // Muted Blue-Grey
    background: '#EBE5E0' // Pale Clay
  },
  royal_academic: { 
    name: "Royal Academic", 
    headline: '#2E1065', // Deep Imperial Purple
    subheadline: '#584A6D', // Muted Lavender Grey
    background: '#FAF5FF' // Whisper Purple
  },
  industrial_chic: { 
    name: "Industrial Chic", 
    headline: '#262626', // Carbon
    subheadline: '#737373', // Concrete Grey
    background: '#E5E5E5' // Light Concrete
  },
  sunset_corporate: { 
    name: "Sunset Corporate", 
    headline: '#7C2D12', // Deep Burnt Orange
    subheadline: '#A87666', // Muted Terracotta
    background: '#FFF7ED' // Pale Peach
  },
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
  
  // Theme Logic
  const themeKey = slide.theme || 'trust_clarity';
  const theme = themeMap[themeKey] || themeMap.trust_clarity;
  const arrowColor = slide.arrow_color || theme.headline;
  const textBgEnabled = slide.text_bg_enabled !== false; // Default true

  // CSS Variables for Effects
  const styleVars = {
    '--theme-headline': theme.headline,
    '--theme-subheadline': theme.subheadline,
    '--theme-background': theme.background,
  };

  // Text Container Style
  const textContainerClass = cn(
    "transition-all duration-300",
    textBgEnabled && "p-12 rounded-xl shadow-2xl border border-black/5 backdrop-blur-sm"
  );
  
  const textContainerStyle = textBgEnabled ? { backgroundColor: `${theme.background}E6` } : {}; // E6 = 90% opacity

  const renderContent = () => {
    // --- CTA SLIDES ---
    if (type === 'cta') {
      return (
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-16">
           {/* CTA Variant 1: Big Link */}
           {variant === '1' && (
             <div className={cn("text-center space-y-8 w-full max-w-4xl", textContainerClass)} style={textContainerStyle}>
                <div className={cn("text-8xl uppercase tracking-tighter whitespace-pre-wrap", font, effect)} style={{color: theme.headline}} data-text={slide.title}>
                  {slide.title}
                </div>
                <div 
                    className="text-5xl font-medium px-12 py-8 rounded-full border inline-block whitespace-pre-wrap"
                    style={{ color: theme.background, backgroundColor: theme.headline, borderColor: theme.subheadline }}
                >
                    {slide.content}
                </div>
             </div>
           )}

           {/* CTA Variant 2: Profile Style */}
           {variant === '2' && (
              <div className={cn("flex flex-col items-center justify-center text-center space-y-12 w-full max-w-3xl", textContainerClass)} style={textContainerStyle}>
                <div className="w-64 h-64 rounded-full border-4 overflow-hidden relative" style={{borderColor: theme.headline}}>
                   <div className="absolute inset-0 flex items-center justify-center text-6xl">👤</div>
                </div>
                <div className={cn("text-7xl uppercase tracking-tighter whitespace-pre-wrap", font, effect)} style={{color: theme.headline}} data-text={slide.title}>
                 {slide.title}
               </div>
               <p className="text-4xl whitespace-pre-wrap" style={{color: theme.subheadline}}>{slide.content}</p>
              </div>
           )}

           {/* CTA Variant 3: Big Button */}
           {variant === '3' && (
              <div className="flex flex-col items-center justify-center space-y-16 w-full max-w-5xl">
                <div className={cn("text-9xl uppercase tracking-tighter text-center drop-shadow-2xl whitespace-pre-wrap", font, effect)} style={{color: theme.headline, textShadow: textBgEnabled ? 'none' : '0 4px 20px rgba(0,0,0,0.5)'}} data-text={slide.title}>
                  {slide.title}
                </div>
                <div 
                  className="w-full py-12 text-7xl font-bold uppercase flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xl rounded-lg"
                  style={{ backgroundColor: theme.headline, color: theme.background }}
                >
                    {slide.content}
                </div>
              </div>
           )}
        </div>
      );
    }

    // --- HERO SLIDES (Unified Logic) ---
    if (type === 'hero') {
        return (
            <div className="relative z-10 h-full flex flex-col justify-center p-24 w-full">
                <div className={cn(
                    "flex flex-col gap-8 max-w-5xl",
                    layout === 'hero_center' && "mx-auto text-center items-center",
                    layout === 'hero_right' && "ml-auto text-right items-end",
                    (layout === 'default' || layout === 'hero_left') && "mr-auto text-left items-start",
                    textContainerClass
                )} style={textContainerStyle}>
                    <div className={cn(
                        "text-9xl uppercase tracking-tighter leading-[0.85] whitespace-pre-wrap", 
                        font, effect
                    )} style={{color: theme.headline}} data-text={slide.title}>
                        {slide.title}
                    </div>
                    
                    <div className="h-2 w-32" style={{backgroundColor: theme.subheadline}} />

                    <p className={cn(
                        "text-5xl font-body font-light leading-tight whitespace-pre-wrap",
                    )} style={{color: theme.subheadline}}>
                        {slide.content}
                    </p>
                </div>
            </div>
        );
    }

    // --- BODY SLIDES ---
    return (
      <div className={cn(
        "relative z-10 flex flex-col w-full h-full",
        layout === 'default' && "justify-between p-24",
        layout === 'center' && "items-center justify-center text-center p-24 space-y-12",
        (layout === 'split_left' || layout === 'split_right') && "w-1/2 p-20 justify-center space-y-12",
        layout === 'minimalist' && "justify-end p-24 space-y-8"
      )}>
        
        <div className={cn(
            "uppercase tracking-tighter leading-[0.9] drop-shadow-xl whitespace-pre-wrap",
            font, effect,
            layout === 'center' ? "text-9xl" : "text-8xl",
            layout === 'minimalist' && "text-9xl mix-blend-difference",
        )} style={{color: layout === 'minimalist' ? '#fff' : theme.headline}} data-text={slide.title}>
          {slide.title}
        </div>

        <div className={cn(
            "relative whitespace-pre-wrap max-w-4xl",
            layout !== 'minimalist' && textContainerClass
        )} style={layout !== 'minimalist' ? textContainerStyle : {}}>
            
            {layout === 'default' && <div className="absolute -left-1 top-8 bottom-8 w-1 rounded-full" style={{backgroundColor: theme.headline}} />}
            
            <p className={cn(
                "font-medium leading-snug font-body", 
                layout === 'center' ? "text-6xl" : "text-5xl",
                layout === 'minimalist' ? "text-white drop-shadow-md" : ""
            )} style={{color: layout === 'minimalist' ? '#fff' : theme.subheadline}}>
                {slide.content}
            </p>
        </div>
      </div>
    );
  };

  return (
    <div
      id={id}
      className={cn(
        "relative w-[1080px] h-[1080px] flex overflow-hidden shrink-0 transform origin-top-left select-none",
        layout === 'split_left' && "flex-row",
        layout === 'split_right' && "flex-row-reverse",
      )}
      style={{...styleVars, backgroundColor: theme.background}} // Slide base color
    >
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Overlay Logic - Adjusted for Light/Dark themes */}
      <div className={cn(
        "absolute inset-0 z-0 transition-all duration-300",
        // If no image, the base background color shows. If image, we might need a slight tint based on theme
      )} style={{backgroundColor: bgUrl ? 'rgba(0,0,0,0.1)' : 'transparent'}} />

      {/* Split Layout Masks */}
      {(layout === 'split_left' || layout === 'split_right') && (
         <div className="absolute inset-0 z-0 flex pointer-events-none">
            <div 
                className={cn("w-1/2 h-full backdrop-blur-lg", layout === 'split_left' ? "order-1" : "order-2")} 
                style={{backgroundColor: `${theme.background}F2`}} // 95% opacity theme bg
            />
         </div>
      )}

      {/* Content */}
      {renderContent()}
      
      {/* Navigation Arrow */}
      {type !== 'cta' && (
        <div 
            className="absolute bottom-12 right-12 z-20 p-4 rounded-full backdrop-blur-md shadow-lg border"
            style={{backgroundColor: `${theme.background}80`, borderColor: `${theme.headline}20`}}
        >
           <ArrowRight size={64} color={arrowColor} strokeWidth={3} />
        </div>
      )}
      
      {/* Watermark */}
      <div className="absolute bottom-12 left-12 z-20 text-2xl font-mono opacity-30 tracking-widest" style={{color: theme.headline}}>
        AGENCY.OS
      </div>
    </div>
  );
};
