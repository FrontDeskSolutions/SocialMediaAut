
import React from 'react';
import { cn } from '@/lib/utils';

export const SlideCanvas = ({ slide, id }) => {
  return (
    <div
      id={id}
      className={cn(
        "relative w-[1080px] h-[1080px] flex flex-col justify-between p-16 overflow-hidden bg-black text-white shrink-0 transform origin-top-left",
        // "scale-[0.3]" // handled by parent
      )}
      style={{
        backgroundImage: slide.background_url ? `url(${slide.background_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
        {/* Overlay for readability */}
       <div className="absolute inset-0 bg-black/40 z-0" />

      <div className="relative z-10 font-bold uppercase tracking-tighter text-7xl font-heading text-primary">
        {slide.title}
      </div>

      <div className="relative z-10 mt-auto">
        <p className="text-4xl font-medium leading-tight text-white font-body">
          {slide.content}
        </p>
        <div className="w-24 h-2 mt-8 bg-primary" />
      </div>
      
      {/* Brand Watermark */}
      <div className="absolute bottom-8 right-8 z-10 text-xl font-mono opacity-50">
        AGENCY.OS
      </div>
    </div>
  );
};
