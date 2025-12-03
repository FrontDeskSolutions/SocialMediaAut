
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

const positionMap = {
    top_left: { top: '10%', left: '10%', transform: 'none' },
    top_center: { top: '10%', left: '50%', transform: 'translateX(-50%)' },
    top_right: { top: '10%', right: '10%', transform: 'none' },
    
    middle_left: { top: '50%', left: '10%', transform: 'translateY(-50%)' },
    middle_center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    middle_right: { top: '50%', right: '10%', transform: 'translateY(-50%)' },
    
    bottom_left: { bottom: '10%', left: '10%', transform: 'none' },
    bottom_center: { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
    bottom_right: { bottom: '10%', right: '10%', transform: 'none' },
};

const widthClasses = {
    narrow: "w-[500px]",
    medium: "w-[800px]",
    wide: "w-[1000px]",
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
  
  const headlineColor = slide.headline_color || "#FACC15";
  const bodyColor = slide.font_color || "#FFFFFF";
  const themeMode = slide.theme_mode || "dark";
  const glassIntensity = slide.glass_intensity || "high";
  const containerOpacity = slide.container_opacity !== undefined ? slide.container_opacity : 0.6;
  
  const textBgEnabled = slide.text_bg_enabled !== false; 
  
  const position = slide.text_position || 'middle_center';
  const align = slide.text_align || 'center'; 
  const width = slide.text_width || 'medium';
  const hasShadow = slide.text_shadow || false;

  const isDarkMode = themeMode === 'dark';
  const baseBg = isDarkMode ? '15, 23, 42' : '255, 255, 255'; 
  
  const blurValue = { none: '0px', low: '8px', medium: '16px', high: '24px' }[glassIntensity] || '16px';

  const containerStyle = textBgEnabled ? { 
    backgroundColor: `rgba(${baseBg}, ${containerOpacity})`,
    backdropFilter: `blur(${blurValue})`,
    WebkitBackdropFilter: `blur(${blurValue})`,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
  } : {};

  const posStyle = positionMap[position] || positionMap.middle_center;

  const renderContent = () => {
    if (type === 'cta') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 z-10">
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
            <div className="absolute z-10 flex flex-col gap-8" style={{...posStyle}}>
                {/* REMOVED HARDCODED backdrop-blur-sm */}
                <div className={cn("p-12 rounded-3xl transition-all", widthClasses[width], `text-${align}`)} style={containerStyle}>
                    <div className={cn("text-9xl uppercase tracking-tighter leading-[0.85] whitespace-pre-wrap mb-8", font, effect)} style={{color: headlineColor}} data-text={slide.title}>
                        {slide.title}
                    </div>
                    {slide.content && (
                        <p className="text-5xl font-body font-light leading-tight whitespace-pre-wrap" style={{color: bodyColor}}>
                            {slide.content}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
      <div className="absolute z-10 flex flex-col gap-6" style={{...posStyle}}>
        <div className={cn(
            "uppercase tracking-tighter leading-[0.9] drop-shadow-2xl whitespace-pre-wrap z-20",
            font, effect, "text-8xl",
            widthClasses[width],
            `text-${align}`
        )} style={{color: headlineColor}} data-text={slide.title}>
          {slide.title}
        </div>

        <div className={cn(
            "relative whitespace-pre-wrap p-10 rounded-2xl z-10", 
            widthClasses[width],
            `text-${align}`
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
    >
      <div className="absolute inset-0 z-0" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-0 bg-black/20" />

      {renderContent()}
      
      {type !== 'cta' && (
        <div className="absolute bottom-12 right-12 z-20 p-4 rounded-full backdrop-blur-md border border-white/10 shadow-xl" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
           <ArrowRight size={64} color={headlineColor} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};
