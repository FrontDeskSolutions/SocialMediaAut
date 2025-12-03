
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
      return (
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-16">
           {/* CTA Variant 1: Big Link */}
           {variant === '1' && (
             <div className="text-center space-y-8 backdrop-blur-sm bg-black/20 p-12 rounded-3xl border border-white/10 w-full max-w-3xl">
                <div className={cn("text-7xl uppercase tracking-tighter", font, effect, "text-primary")} data-text={slide.title}>
                  {slide.title}
                </div>
                <div className="text-4xl font-medium text-white bg-white/10 px-12 py-6 rounded-full border border-white/20 inline-block">
                    {slide.content}
                </div>
             </div>
           )}

           {/* CTA Variant 2: Profile Style */}
           {variant === '2' && (
              <div className="flex flex-col items-center justify-center text-center space-y-12 backdrop-blur-md bg-black/40 p-16 rounded-xl border border-primary/30 w-full max-w-3xl">
                <div className="w-64 h-64 rounded-full bg-gray-800 border-4 border-primary overflow-hidden relative shadow-[0_0_50px_rgba(204,255,0,0.2)]">
                   <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-600">👤</div>
                </div>
                <div className={cn("text-6xl uppercase tracking-tighter", font, effect, "text-white")} data-text={slide.title}>
                 {slide.title}
               </div>
               <p className="text-3xl text-muted-foreground">{slide.content}</p>
              </div>
           )}

           {/* CTA Variant 3: Big Button */}
           {variant === '3' && (
              <div className="flex flex-col items-center justify-center space-y-16 w-full max-w-4xl">
                <div className={cn("text-8xl uppercase tracking-tighter text-center drop-shadow-2xl", font, effect, "text-white")} data-text={slide.title}>
                  {slide.title}
                </div>
                <div className="w-full py-12 bg-primary text-black text-6xl font-bold uppercase flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_60px_rgba(204,255,0,0.4)] cursor-pointer">
                    {slide.content}
                </div>
              </div>
           )}
        </div>
      );
    }

    // --- HERO SLIDES ---
    if (type === 'hero') {
        return (
            <div className="relative z-10 h-full flex flex-col justify-center p-24">
                <div className="backdrop-blur-sm bg-black/20 p-12 -mx-12 rounded-r-3xl border-l-8 border-primary">
                    <div className={cn("text-9xl uppercase tracking-tighter leading-[0.85] drop-shadow-lg", font, effect, "text-white")} data-text={slide.title}>
                        {slide.title}
                    </div>
                    <p className="text-5xl text-white/90 mt-12 max-w-4xl font-body font-light leading-tight">
                        {slide.content}
                    </p>
                </div>
            </div>
        );
    }

    // --- BODY SLIDES (Standard) ---
    return (
      <div className={cn(
        "relative z-10 flex flex-col",
        layout === 'default' && "h-full justify-between p-20",
        layout === 'center' && "h-full items-center justify-center text-center max-w-5xl mx-auto space-y-12 p-20",
        (layout === 'split_left' || layout === 'split_right') && "w-1/2 h-full p-20 justify-center space-y-12 bg-black/20 backdrop-blur-sm",
        layout === 'minimalist' && "h-full items-start justify-end p-24 space-y-8"
      )}>
        
        <div className={cn(
            "uppercase tracking-tighter leading-[0.9] drop-shadow-xl",
            font,
            effect,
            // Sizes
            layout === 'center' ? "text-9xl" : "text-8xl",
            layout === 'minimalist' && "text-9xl text-white mix-blend-difference",
            "text-primary"
        )} data-text={slide.title}>
          {slide.title}
        </div>

        <div className={cn(
            layout === 'default' && "mt-auto bg-black/40 p-8 -mx-8 backdrop-blur-md border-l-4 border-primary",
            layout === 'center' && "bg-black/40 p-12 rounded-2xl backdrop-blur-md border border-white/10"
        )}>
          <p className={cn(
            "font-medium leading-tight text-white font-body",
            layout === 'center' ? "text-5xl" : "text-4xl"
          )}>
            {slide.content}
          </p>
          {layout !== 'minimalist' && layout !== 'center' && <div className="hidden" />}
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
        "absolute inset-0 z-0 transition-all duration-300",
        layout === 'center' ? "bg-black/70" : "bg-black/40",
        layout === 'minimalist' && "bg-gradient-to-t from-black via-transparent to-transparent opacity-90",
        type === 'hero' && "bg-gradient-to-r from-black/90 via-black/50 to-transparent",
        type === 'cta' && "bg-black/60"
      )} />

      {/* Split Layout Masks */}
      {(layout === 'split_left' || layout === 'split_right') && (
         <div className="absolute inset-0 z-0 flex pointer-events-none">
            <div className={cn("w-1/2 h-full bg-black/80 backdrop-blur-lg", layout === 'split_left' ? "order-1" : "order-2")} />
         </div>
      )}

      {/* Content */}
      {renderContent()}
      
      {/* Watermark */}
      <div className="absolute bottom-10 right-10 z-20 text-2xl font-mono opacity-40 text-white mix-blend-difference tracking-widest">
        AGENCY.OS
      </div>
    </div>
  );
};
