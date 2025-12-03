
import React from 'react';
import { cn } from '@/lib/utils';

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

export const SlideCanvas = ({ slide, id }) => {
  const bgUrl = slide.background_url 
    ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/proxy/image?url=${encodeURIComponent(slide.background_url)}`
    : null;

  const layout = slide.layout || 'default';
  const font = fontMap[slide.font] || fontMap.modern;
  const effect = effectMap[slide.text_effect] || "";
  const type = slide.type || 'body';
  const variant = slide.variant || '1';

  const renderContent = () => {
    // --- CTA SLIDES ---
    if (type === 'cta') {
      // CTA Variant 1: Big Link
      if (variant === '1') {
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className={cn("text-8xl uppercase tracking-tighter", font, effect, "text-primary")} data-text={slide.title}>
              {slide.title}
            </div>
             <div className="text-4xl font-medium text-white bg-white/10 px-8 py-4 rounded-full border border-white/20 backdrop-blur-md">
                {slide.content}
             </div>
          </div>
        );
      }
      // CTA Variant 2: Profile Style
      if (variant === '2') {
        return (
           <div className="h-full flex flex-col items-center justify-center text-center space-y-12">
             <div className="w-64 h-64 rounded-full bg-gray-800 border-4 border-primary overflow-hidden relative">
                {/* Placeholder Profile */}
                <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-600">👤</div>
             </div>
             <div className={cn("text-6xl uppercase tracking-tighter", font, effect, "text-white")} data-text={slide.title}>
              {slide.title}
            </div>
            <p className="text-3xl text-muted-foreground">{slide.content}</p>
           </div>
        );
      }
      // CTA Variant 3: Big Button
      return (
         <div className="h-full flex flex-col items-center justify-center space-y-16">
            <div className={cn("text-9xl uppercase tracking-tighter text-center", font, effect, "text-white")} data-text={slide.title}>
              {slide.title}
            </div>
            <div className="w-full max-w-2xl h-32 bg-primary text-black text-5xl font-bold uppercase flex items-center justify-center hover:scale-105 transition-transform">
                {slide.content}
            </div>
         </div>
      );
    }

    // --- HERO SLIDES ---
    if (type === 'hero') {
        return (
            <div className="h-full flex flex-col justify-center p-16">
                <div className="w-32 h-2 bg-primary mb-8" />
                <div className={cn("text-9xl uppercase tracking-tighter leading-[0.85]", font, effect, "text-white")} data-text={slide.title}>
                    {slide.title}
                </div>
                <p className="text-4xl text-muted-foreground mt-8 max-w-3xl font-body">
                    {slide.content}
                </p>
            </div>
        );
    }

    // --- BODY SLIDES (Standard) ---
    return (
      <div className={cn(
        "relative z-10 flex flex-col",
        layout === 'default' && "h-full justify-between",
        layout === 'center' && "h-full items-center justify-center text-center max-w-4xl mx-auto space-y-8",
        (layout === 'split_left' || layout === 'split_right') && "w-1/2 h-full p-16 justify-center space-y-8",
        layout === 'minimalist' && "h-full items-start justify-end p-24 space-y-6"
      )}>
        
        <div className={cn(
            "uppercase tracking-tighter leading-[0.9]",
            font,
            effect,
            // Sizes
            layout === 'center' ? "text-9xl" : "text-7xl",
            layout === 'minimalist' && "text-8xl text-white mix-blend-difference",
            "text-primary"
        )} data-text={slide.title}>
          {slide.title}
        </div>

        <div className={cn(layout === 'default' && "mt-auto")}>
          <p className={cn(
            "font-medium leading-tight text-white font-body",
            layout === 'center' ? "text-5xl" : "text-4xl"
          )}>
            {slide.content}
          </p>
          {layout !== 'minimalist' && <div className="w-24 h-2 mt-8 bg-primary" />}
        </div>
      </div>
    );
  };

  return (
    <div
      id={id}
      className={cn(
        "relative w-[1080px] h-[1080px] flex overflow-hidden bg-black text-white shrink-0 transform origin-top-left select-none",
        layout === 'split_left' && "flex-row",
        layout === 'split_right' && "flex-row-reverse",
      )}
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

      {/* Overlay Logic */}
      <div className={cn(
        "absolute inset-0 z-0",
        layout === 'center' ? "bg-black/70" : "bg-black/40",
        layout === 'minimalist' && "bg-gradient-to-t from-black via-transparent to-transparent opacity-90",
        type === 'hero' && "bg-gradient-to-r from-black via-black/80 to-transparent"
      )} />

      {/* Split Layout Masks */}
      {(layout === 'split_left' || layout === 'split_right') && (
         <div className="absolute inset-0 z-0 flex">
            <div className={cn("w-1/2 h-full bg-black", layout === 'split_left' ? "order-1" : "order-2")} />
         </div>
      )}

      {/* Content */}
      {renderContent()}
      
      {/* Watermark */}
      <div className="absolute bottom-8 right-8 z-10 text-xl font-mono opacity-50 text-white mix-blend-difference">
        AGENCY.OS
      </div>
    </div>
  );
};
