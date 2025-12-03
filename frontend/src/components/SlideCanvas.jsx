
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

// Theme Definition (Partial for brevity, assumes full list)
const themeMap = {
  trust_clarity: { headline: '#0F172A', subheadline: '#475569', background: '#EFF6FF' },
  modern_luxury: { headline: '#1C1C1C', subheadline: '#6D6D6D', background: '#F5F5F0' },
  // ... (rest of themes handled by fallback or backend data)
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
  const theme = themeMap[themeKey] || { headline: '#000', subheadline: '#666', background: '#fff' };
  
  // AI-Analyzed Overrides
  const fontColor = slide.font_color || theme.headline;
  const spacingStyle = slide.spacing || 'normal';
  
  const textBgEnabled = slide.text_bg_enabled !== false; 

  // Dynamic Padding based on 'spacing' analysis
  const containerPadding = spacingStyle === 'wide' ? 'p-32' : spacingStyle === 'compact' ? 'p-16' : 'p-24';

  // CSS Vars
  const styleVars = {
    '--theme-headline': fontColor, // Use analyzed color if present
    '--theme-subheadline': theme.subheadline,
  };

  const textContainerClass = cn(
    "transition-all duration-300",
    textBgEnabled && "p-12 rounded-xl shadow-2xl border border-black/5 backdrop-blur-md"
  );
  const textContainerStyle = textBgEnabled ? { backgroundColor: 'rgba(255,255,255,0.85)' } : {};

  const renderContent = () => {
    if (type === 'hero') {
        // Hero: Text baked into image usually, but we render overlay if content exists
        if (!slide.content) return null; 
        // If content exists (fallback or standard mode), render standard hero
        return (
            <div className={cn("relative z-10 h-full flex flex-col justify-center w-full", containerPadding)}>
                <div className={cn("flex flex-col gap-8 max-w-5xl", textContainerClass)} style={textContainerStyle}>
                    <div className={cn("text-9xl uppercase tracking-tighter", font, effect)} style={{color: fontColor}} data-text={slide.title}>{slide.title}</div>
                    <p className="text-5xl font-body" style={{color: fontColor}}>{slide.content}</p>
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

        <div className={cn(
            "relative whitespace-pre-wrap max-w-4xl",
            textContainerClass
        )} style={textContainerStyle}>
            <p className={cn("font-medium leading-snug font-body", layout === 'center' ? "text-6xl" : "text-5xl")} style={{color: '#000'}}> 
                {/* Body text usually dark on the light container */}
                {slide.content}
            </p>
        </div>
      </div>
    );
  };

  return (
    <div
      id={id}
      className="relative w-[1080px] h-[1080px] flex overflow-hidden shrink-0 transform origin-top-left select-none bg-gray-100"
      style={styleVars}
    >
      <div className="absolute inset-0 z-0" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      {renderContent()}
      
      {/* Arrow */}
      {type !== 'cta' && (
        <div className="absolute bottom-12 right-12 z-20 p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/40">
           <ArrowRight size={64} color={fontColor} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};
