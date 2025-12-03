
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

// Helper for position classes
const positionClasses = {
    top_left: "justify-start items-start",
    top_center: "justify-start items-center",
    top_right: "justify-start items-end",
    middle_left: "justify-center items-start",
    middle_center: "justify-center items-center",
    middle_right: "justify-center items-end",
    bottom_left: "justify-end items-start",
    bottom_center: "justify-end items-center",
    bottom_right: "justify-end items-end",
};

const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

const widthClasses = {
    narrow: "max-w-xl",
    medium: "max-w-3xl",
    wide: "max-w-5xl",
    full: "w-full px-12",
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
  
  // Theme & Style Logic
  const themeKey = slide.theme || 'trust_clarity';
  const theme = themeMap[themeKey] || themeMap.trust_clarity;
  
  // Advanced Layout Props
  const fontColor = slide.font_color || theme.headline;
  const textBgEnabled = slide.text_bg_enabled !== false; 
  
  const position = slide.text_position || 'middle_center';
  const align = slide.text_align || 'center';
  const width = slide.text_width || 'medium';
  const containerOpacity = slide.container_opacity !== undefined ? slide.container_opacity : 0.8;
  const hasShadow = slide.text_shadow || false;

  // CSS Vars
  const styleVars = {
    '--theme-headline': fontColor,
    '--theme-subheadline': fontColor, // simplified
  };

  // Container Style Calculation
  const isDarkTheme = theme.background.startsWith('#1') || theme.background.startsWith('#0');
  const baseBgColor = isDarkTheme ? '0,0,0' : '255,255,255';
  
  const textContainerStyle = textBgEnabled ? { 
    backgroundColor: `rgba(${baseBgColor}, ${containerOpacity})`,
    textShadow: hasShadow ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
  } : {
    textShadow: hasShadow ? '0 2px 10px rgba(0,0,0,0.8)' : 'none'
  };

  const renderContent = () => {
    // --- CTA SLIDES ---
    if (type === 'cta') {
      return (
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-16">
           {variant === '1' && (
             <div className={cn("space-y-8 w-full max-w-4xl p-12 rounded-xl backdrop-blur-sm border border-white/10 text-center")} style={textContainerStyle}>
                <div className={cn("text-8xl uppercase tracking-tighter whitespace-pre-wrap", font, effect)} style={{color: fontColor}} data-text={slide.title}>
                  {slide.title}
                </div>
                <div className="text-5xl font-medium px-12 py-8 rounded-full border inline-block whitespace-pre-wrap"
                    style={{ color: theme.background, backgroundColor: fontColor }}>
                    {slide.content}
                </div>
             </div>
           )}
           {variant === '2' && (
              <div className={cn("flex flex-col items-center justify-center text-center space-y-12 w-full max-w-3xl p-12 rounded-xl backdrop-blur-sm")} style={textContainerStyle}>
                <div className="w-64 h-64 rounded-full border-4 overflow-hidden relative" style={{borderColor: fontColor}}>
                   <div className="absolute inset-0 flex items-center justify-center text-6xl">👤</div>
                </div>
                <div className={cn("text-7xl uppercase tracking-tighter whitespace-pre-wrap", font, effect)} style={{color: fontColor}} data-text={slide.title}>
                 {slide.title}
               </div>
               <p className="text-4xl whitespace-pre-wrap" style={{color: fontColor}}>{slide.content}</p>
              </div>
           )}
           {variant === '3' && (
              <div className="flex flex-col items-center justify-center space-y-16 w-full max-w-5xl">
                <div className={cn("text-9xl uppercase tracking-tighter text-center drop-shadow-2xl whitespace-pre-wrap", font, effect)} style={{color: fontColor, textShadow: '0 4px 30px rgba(0,0,0,0.8)'}} data-text={slide.title}>
                  {slide.title}
                </div>
                <div className="w-full py-12 text-7xl font-bold uppercase flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-xl rounded-lg" style={{ backgroundColor: fontColor, color: theme.background }}>
                    {slide.content}
                </div>
              </div>
           )}
        </div>
      );
    }

    // --- HERO SLIDES ---
    if (type === 'hero') {
        if (!slide.content && !slide.title) return null;
        return (
            <div className={cn("relative z-10 h-full flex flex-col p-24", positionClasses[position])}>
                <div className={cn("flex flex-col gap-8 p-12 rounded-xl backdrop-blur-sm", widthClasses[width], alignClasses[align])} style={textContainerStyle}>
                    <div className={cn("text-9xl uppercase tracking-tighter leading-[0.85] whitespace-pre-wrap", font, effect)} style={{color: fontColor}} data-text={slide.title}>
                        {slide.title}
                    </div>
                    <p className="text-5xl font-body font-light leading-tight whitespace-pre-wrap" style={{color: fontColor}}>
                        {slide.content}
                    </p>
                </div>
            </div>
        );
    }

    // --- BODY SLIDES (Advanced Layout) ---
    return (
      <div className={cn("relative z-10 h-full flex flex-col p-24", positionClasses[position])}>
        <div className={cn("flex flex-col gap-8 p-12 rounded-xl backdrop-blur-sm border border-white/5 transition-all duration-300", widthClasses[width], alignClasses[align])} style={textContainerStyle}>
            <div className={cn(
                "uppercase tracking-tighter leading-[0.9] whitespace-pre-wrap",
                font, effect, "text-8xl"
            )} style={{color: fontColor}} data-text={slide.title}>
              {slide.title}
            </div>

            <p className={cn("font-medium leading-snug font-body text-5xl whitespace-pre-wrap")} style={{color: fontColor}}>
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
