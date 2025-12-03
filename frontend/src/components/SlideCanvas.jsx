
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const fontMap = {
  modern: "font-heading",
  serif: "font-serif",
  mono: "font-mono",
  bold: "font-black",
  handwritten: "font-handwritten",
  futuristic: "font-futuristic",
  editorial: "font-editorial",
};

const effectMap = {
  none: "",
  glow: "effect-glow",
  gradient: "effect-gradient",
  chrome: "effect-chrome",
  glitch: "effect-glitch",
  neon: "effect-neon",
};

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

// Refined Position Classes (Using simple absolute + transform to guarantee center)
const positionMap = {
    top_left: "top-16 left-16 items-start text-left",
    top_center: "top-16 left-1/2 -translate-x-1/2 items-center text-center",
    top_right: "top-16 right-16 items-end text-right",
    
    middle_left: "top-1/2 -translate-y-1/2 left-16 items-start text-left",
    middle_center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center text-center",
    middle_right: "top-1/2 -translate-y-1/2 right-16 items-end text-right",
    
    bottom_left: "bottom-16 left-16 items-start text-left",
    bottom_center: "bottom-16 left-1/2 -translate-x-1/2 items-center text-center",
    bottom_right: "bottom-16 right-16 items-end text-right",
};

const widthClasses = {
    narrow: "w-[600px]",
    medium: "w-[800px]",
    wide: "w-[950px]",
};

export const SlideCanvas = ({ slide, id }) => {
  if (!slide) return null;

  const bgUrl = slide.background_url 
    ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/proxy/image?url=${encodeURIComponent(slide.background_url)}`
    : null;

  const font = fontMap[slide.font] || fontMap.modern;
  const effect = effectMap[slide.text_effect] || "";
  const type = slide.type || 'body';
  const variant = slide.variant || '1';
  
  const themeKey = slide.theme || 'trust_clarity';
  const theme = themeMap[themeKey] || themeMap.trust_clarity;
  
  // Colors
  const bodyColor = slide.font_color || theme.headline;
  const headColor = slide.headline_color || bodyColor; // Use specific headline color if available
  
  const textBgEnabled = slide.text_bg_enabled !== false; 
  
  const position = slide.text_position || 'middle_center';
  const width = slide.text_width || 'medium';
  const containerOpacity = slide.container_opacity !== undefined ? slide.container_opacity : 0.8;
  const hasShadow = slide.text_shadow || false;

  const styleVars = {
    '--theme-headline': headColor,
    '--theme-subheadline': bodyColor,
  };

  const isDarkTheme = theme.background.startsWith('#1') || theme.background.startsWith('#0');
  const baseBgColor = isDarkTheme ? '0,0,0' : '255,255,255';
  
  // Container background applies mainly to the Body Text box now, or both if unified.
  const containerStyle = textBgEnabled ? { 
    backgroundColor: `rgba(${baseBgColor}, ${containerOpacity})`,
    textShadow: hasShadow ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
  } : {
    textShadow: hasShadow ? '0 2px 10px rgba(0,0,0,0.8)' : 'none'
  };

  const renderContent = () => {
    if (type === 'cta') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 z-10">
           {variant === '1' && (
             <div className="space-y-8 w-full max-w-4xl p-12 rounded-3xl backdrop-blur-sm border border-white/10 text-center" style={containerStyle}>
                <div className={cn("text-8xl uppercase tracking-tighter whitespace-pre-wrap", font, effect)} style={{color: headColor}} data-text={slide.title}>
                  {slide.title}
                </div>
                <div className="text-5xl font-medium px-12 py-8 rounded-full border inline-block whitespace-pre-wrap"
                    style={{ color: theme.background, backgroundColor: headColor }}>
                    {slide.content}
                </div>
             </div>
           )}
           {/* CTA variants 2 and 3 omitted for brevity but follow similar pattern */}
        </div>
      );
    }

    if (type === 'hero') {
        if (!slide.content && !slide.title) return null;
        // Hero uses the same positioning logic as body now for flexibility
        return (
            <div className={cn("absolute z-10 flex flex-col gap-8", positionMap[position], widthClasses[width])}>
                <div className={cn("p-12 rounded-3xl backdrop-blur-sm transition-all", textBgEnabled ? "shadow-2xl" : "")} style={containerStyle}>
                    <div className={cn("text-9xl uppercase tracking-tighter leading-[0.85] whitespace-pre-wrap mb-8", font, effect)} style={{color: headColor}} data-text={slide.title}>
                        {slide.title}
                    </div>
                    <p className="text-5xl font-body font-light leading-tight whitespace-pre-wrap" style={{color: bodyColor}}>
                        {slide.content}
                    </p>
                </div>
            </div>
        );
    }

    // --- BODY SLIDES (Split Containers) ---
    return (
      <div className={cn("absolute z-10 flex flex-col gap-6", positionMap[position], widthClasses[width])}>
        
        {/* Headline - Independent */}
        <div className={cn(
            "uppercase tracking-tighter leading-[0.9] drop-shadow-xl whitespace-pre-wrap text-center w-full",
            font, effect, "text-8xl"
        )} style={{color: headColor}} data-text={slide.title}>
          {slide.title}
        </div>

        {/* Body Text - In Container */}
        <div className={cn("relative whitespace-pre-wrap p-10 rounded-2xl backdrop-blur-sm transition-all w-full", textBgEnabled ? "border border-white/5 shadow-xl" : "")} style={containerStyle}>
            <p className={cn("font-medium leading-snug font-body text-5xl", `text-${slide.text_align || 'center'}`)} style={{color: bodyColor}}>
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
      <div className="absolute inset-0 z-0" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      
      {renderContent()}
      
      {type !== 'cta' && (
        <div className="absolute bottom-12 right-12 z-20 p-4 rounded-full backdrop-blur-md border border-white/20 shadow-lg" 
             style={{backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}}>
           <ArrowRight size={64} color={bodyColor} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};
