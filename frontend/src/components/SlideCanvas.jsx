
import React from 'react';
import { cn } from '@/lib/utils';

// Font mapping
const fontMap = {
  modern: "font-heading",      // Outfit
  serif: "font-serif",         // Playfair (added in CSS)
  mono: "font-mono",           // JetBrains Mono
  bold: "font-black",          // Heavy weight
};

export const SlideCanvas = ({ slide, id }) => {
  // Proxy image URL to avoid CORS
  const bgUrl = slide.background_url 
    ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/proxy/image?url=${encodeURIComponent(slide.background_url)}`
    : null;

  const layout = slide.layout || 'default';
  const font = fontMap[slide.font] || fontMap.modern;

  return (
    <div
      id={id}
      className={cn(
        "relative w-[1080px] h-[1080px] flex overflow-hidden bg-black text-white shrink-0 transform origin-top-left select-none",
        // Layout classes
        layout === 'center' && "items-center justify-center text-center",
        layout === 'default' && "flex-col justify-between p-16",
        layout === 'split_left' && "flex-row",
        layout === 'split_right' && "flex-row-reverse",
        layout === 'minimalist' && "items-end justify-start p-24"
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

      {/* Overlay */}
      <div className={cn(
        "absolute inset-0 z-0",
        layout === 'center' ? "bg-black/60" : "bg-black/40",
        layout === 'minimalist' && "bg-gradient-to-t from-black via-transparent to-transparent opacity-90"
      )} />

      {/* Split Layout Masks */}
      {(layout === 'split_left' || layout === 'split_right') && (
         <div className="absolute inset-0 z-0 flex">
            <div className={cn("w-1/2 h-full bg-black", layout === 'split_left' ? "order-1" : "order-2")} />
         </div>
      )}

      {/* Content Layer */}
      <div className={cn(
        "relative z-10 flex flex-col",
        layout === 'default' && "h-full justify-between",
        layout === 'center' && "max-w-3xl space-y-8",
        (layout === 'split_left' || layout === 'split_right') && "w-1/2 h-full p-16 justify-center space-y-8",
        layout === 'minimalist' && "w-full space-y-6"
      )}>
        
        <div className={cn(
            "uppercase tracking-tighter leading-[0.9]",
            font,
            // Title Sizes
            layout === 'center' ? "text-9xl" : "text-7xl",
            layout === 'minimalist' && "text-8xl text-white mix-blend-difference",
            "text-primary"
        )}>
          {slide.title}
        </div>

        <div className={cn(
             // Content container
             layout === 'default' && "mt-auto",
        )}>
          <p className={cn(
            "font-medium leading-tight text-white font-body",
            // Body Sizes
            layout === 'center' ? "text-5xl" : "text-4xl"
          )}>
            {slide.content}
          </p>
          {layout !== 'minimalist' && <div className="w-24 h-2 mt-8 bg-primary" />}
        </div>
      </div>
      
      {/* Brand Watermark */}
      <div className="absolute bottom-8 right-8 z-10 text-xl font-mono opacity-50 text-white mix-blend-difference">
        AGENCY.OS
      </div>
    </div>
  );
};
