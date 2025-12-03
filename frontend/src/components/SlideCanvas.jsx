
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

export const SlideCanvas = ({ slide, id }) => {
  if (!slide) return null;

  const bgUrl = slide.background_url 
    ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/proxy/image?url=${encodeURIComponent(slide.background_url)}`
    : null;

  const font = fontMap[slide.font] || fontMap.modern;
  const effect = effectMap[slide.text_effect] || "";
  const type = slide.type || 'body';
  const variant = slide.variant || '1';
  
  // Advanced Layout Props
  const headlineColor = slide.headline_color || "#FACC15"; // Default Yellow-400
  const bodyColor = slide.font_color || "#FFFFFF";
  const themeMode = slide.theme_mode || "dark";
  const glassIntensity = slide.glass_intensity || "high";
  const containerOpacity = slide.container_opacity !== undefined ? slide.container_opacity : 0.6;
  const layout = slide.layout || 'centered_stack';
  const textBgEnabled = slide.text_bg_enabled !== false; 

  // CSS Vars
  const styleVars = {
    '--theme-headline': headlineColor,
    '--theme-subheadline': bodyColor,
  };

  // Container Logic (The "Dark Glass")
  const isDarkMode = themeMode === 'dark';
  const baseBg = isDarkMode ? '15, 23, 42' : '255, 255, 255'; // Dark Slate vs White
  
  // Blur logic
  const blurValue = {
      none: '0px',
      low: '8px',
      medium: '16px',
      high: '24px'
  }[glassIntensity] || '16px';

  const containerStyle = textBgEnabled ? { 
    backgroundColor: `rgba(${baseBg}, ${containerOpacity})`,
    backdropFilter: `blur(${blurValue})`,
    WebkitBackdropFilter: `blur(${blurValue})`,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
  } : {};

  const renderContent = () => {
    if (type === 'cta') {
      return (
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-16">
           {variant === '1' && (
             <div className={cn("space-y-8 w-full max-w-4xl p-16 rounded-3xl text-center")} style={containerStyle}>
                <div className={cn("text-8xl uppercase tracking-tighter whitespace-pre-wrap", font, effect)} style={{color: headlineColor}} data-text={slide.title}>
                  {slide.title}
                </div>
                <div className="text-5xl font-medium px-12 py-8 rounded-full border inline-block whitespace-pre-wrap border-white/20"
                    style={{ color: isDarkMode ? '#000' : '#fff', backgroundColor: isDarkMode ? headlineColor : '#000' }}>
                    {slide.content}
                </div>
             </div>
           )}
        </div>
      );
    }

    if (type === 'hero') {
        return (
            <div className="relative z-10 h-full flex flex-col justify-center p-24 items-center text-center">
                <div className="space-y-8 max-w-5xl">
                    <div className={cn("text-9xl uppercase tracking-tighter leading-[0.85] whitespace-pre-wrap drop-shadow-2xl", font, effect)} style={{color: headlineColor}} data-text={slide.title}>
                        {slide.title}
                    </div>
                    {slide.content && (
                        <div className="p-8 rounded-2xl inline-block backdrop-blur-md" style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>
                            <p className="text-5xl font-body font-light leading-tight whitespace-pre-wrap text-white">
                                {slide.content}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- BODY SLIDES (Centered Stack Strategy) ---
    return (
      <div className={cn(
          "relative z-10 flex flex-col h-full p-20",
          layout === 'centered_stack' && "items-center justify-center space-y-12",
          layout === 'split_left' && "items-start justify-center", 
          layout === 'split_right' && "items-end justify-center",
      )}>
        
        {/* HEADLINE: Floating above, connected to background */}
        <div className={cn(
            "uppercase tracking-tighter leading-[0.9] drop-shadow-2xl whitespace-pre-wrap max-w-5xl z-20",
            font, effect, 
            layout === 'centered_stack' ? "text-center text-8xl" : "text-7xl text-left"
        )} style={{color: headlineColor}} data-text={slide.title}>
          {slide.title}
        </div>

        {/* BODY: In the Glass Container */}
        <div className={cn(
            "relative whitespace-pre-wrap p-12 rounded-3xl z-10", 
            layout === 'centered_stack' ? "text-center max-w-4xl" : "max-w-2xl"
        )} style={containerStyle}>
            <p className={cn("font-medium leading-relaxed font-body text-5xl")} style={{color: bodyColor}}>
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
      style={{...styleVars}}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      
      {/* Overlay: Darken slightly to ensure neon pops but text is readable */}
      <div className="absolute inset-0 z-0 bg-black/20" />

      {/* Content */}
      {renderContent()}
      
      {/* Arrow */}
      {type !== 'cta' && (
        <div className="absolute bottom-12 right-12 z-20 p-4 rounded-full backdrop-blur-md border border-white/10 shadow-xl" 
             style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
           <ArrowRight size={64} color={headlineColor} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};
