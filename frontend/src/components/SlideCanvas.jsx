
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

// Font mapping
const fontMap = {
  modern: "font-heading",
  serif: "font-serif",
  mono: "font-mono",
  bold: "font-black",
  handwritten: "font-handwritten",
  futuristic: "font-futuristic",
  editorial: "font-editorial",
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
  trust_clarity: { headline: '#0F172A', subheadline: '#475569', background: '#EFF6FF' },
  modern_luxury: { headline: '#1C1C1C', subheadline: '#6D6D6D', background: '#F5F5F0' },
  swiss_minimalist: { headline: '#000000', subheadline: '#555555', background: '#FFFFFF' },
  forest_executive: { headline: '#064E3B', subheadline: '#3F6258', background: '#F2F7F5' },
  warm_editorial: { headline: '#4A3B32', subheadline: '#8C7B70', background: '#FAF6F1' },
  dark_mode_premium: { headline: '#FFFFFF', subheadline: '#A1A1AA', background: '#18181B' },
  slate_clay: { headline: '#334155', subheadline: '#94A3B8', background: '#EBE5E0' },
  royal_academic: { headline: '#2E1065', subheadline: '#584A6D', background: '#FAF5FF' },
  industrial_chic: { headline: '#262626', subheadline: '#737373', background: '#E5E5E5' },
  sunset_corporate: { headline: '#7C2D12', subheadline: '#A87666', background: '#FFF7ED' },
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
  
  // Theme & Style Logic
  const themeKey = slide.theme || 'trust_clarity';
  const theme = themeMap[themeKey] || themeMap.trust_clarity;
  
  // AI-Analyzed Overrides (or defaults)
  const fontColor = slide.font_color || theme.headline;
  const subheadColor = slide.font_color ? slide.font_color : theme.subheadline; // If AI chose color, use it for subhead too (simplified)
  const spacingStyle = slide.spacing || 'normal';
  
  const textBgEnabled = slide.text_bg_enabled !== false; 

  // Dynamic Padding
  const containerPadding = spacingStyle === 'wide' ? 'p-32' : spacingStyle === 'compact' ? 'p-16' : 'p-24';

  // CSS Vars for Effects
  const styleVars = {
    '--theme-headline': fontColor,
    '--theme-subheadline': subheadColor,
  };

  const textContainerClass = cn(
    "transition-all duration-300",
    textBgEnabled && "p-12 rounded-xl shadow-2xl border border-black/5 backdrop-blur-md"
  );
  
  // Intelligent background for text: White-ish for light themes, Dark for dark themes
  // We can guess darkness by checking if background is #1... or #0...
  const isDarkTheme = theme.background.startsWith('#1') || theme.background.startsWith('#0');
  const textContainerStyle = textBgEnabled ? { 
    backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' 
  } : {};

  const renderContent = () => {
    // --- CTA SLIDES ---
    if (type === 'cta') {
      return (
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-16">
           {variant === '1' && (
             <div className={cn("text-center space-y-8 w-full max-w-4xl", textContainerClass)} style={textContainerStyle}>
                <div className={cn("text-8xl uppercase tracking-tighter whitespace-pre-wrap", font, effect)} style={{color: fontColor}} data-text={slide.title}>
                  {slide.title}
                </div>
                <div className="text-5xl font-medium px-12 py-8 rounded-full border inline-block whitespace-pre-wrap"
                    style={{ color: theme.background, backgroundColor: fontColor, borderColor: subheadColor }}>
                    {slide.content}
                </div>
             </div>
           )}
           {/* Add other variants here if needed, keeping it simple for fix */}
        </div>
      );
    }

    // --- HERO SLIDES ---
    if (type === 'hero') {
        // If there is no content (pure image hero), show nothing
        if (!slide.content && !slide.title) return null;

        return (
            <div className={cn("relative z-10 h-full flex flex-col justify-center w-full", containerPadding)}>
                <div className={cn("flex flex-col gap-8 max-w-5xl", textContainerClass)} style={textContainerStyle}>
                    <div className={cn("text-9xl uppercase tracking-tighter leading-[0.85] whitespace-pre-wrap", font, effect)} style={{color: fontColor}} data-text={slide.title}>
                        {slide.title}
                    </div>
                    <p className="text-5xl font-body font-light leading-tight whitespace-pre-wrap" style={{color: subheadColor}}>
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
        layout === 'default' && `justify-between ${containerPadding}`,
        layout === 'center' && `items-center justify-center text-center ${containerPadding} space-y-12`,
      )}>
        
        <div className={cn(
            "uppercase tracking-tighter leading-[0.9] drop-shadow-xl whitespace-pre-wrap",
            font, effect,
            layout === 'center' ? "text-9xl" : "text-8xl",
        )} style={{color: fontColor}} data-text={slide.title}>
          {slide.title}
        </div>

        <div className={cn("relative whitespace-pre-wrap max-w-4xl", textContainerClass)} style={textContainerStyle}>
            <p className={cn("font-medium leading-snug font-body", layout === 'center' ? "text-6xl" : "text-5xl")} 
               style={{color: isDarkTheme ? '#fff' : '#000'}}>
                {slide.content}
            </p>
        </div>
      </div>
    );
  };

  return (
    <div
      id={id}
      className="relative w-[1080px] h-[1080px] flex overflow-hidden shrink-0 transform origin-top-left select-none bg-black"
      style={{...styleVars, backgroundColor: theme.background}}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      
      {/* Content */}
      {renderContent()}
      
      {/* Arrow (Not on CTA) */}
      {type !== 'cta' && (
        <div className="absolute bottom-12 right-12 z-20 p-4 rounded-full backdrop-blur-md border border-white/20 shadow-lg" 
             style={{backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}}>
           <ArrowRight size={64} color={fontColor} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};
