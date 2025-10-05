"use client";
import { useState, useEffect, useRef } from "react";

interface MousePosition {
  x: number | null;
  y: number | null;
}

// Utility function to merge classNames
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export const MaskContainer = ({
  children,
  revealText,
  size = 10,
  revealSize = 600,
  className,
}: {
  children?: string | React.ReactNode;
  revealText?: string | React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: null, y: null });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const updateMousePosition = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener("mousemove", updateMousePosition);
    return () => {
      container.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);
  
  const maskSize = isHovered ? revealSize : size;
  const backgroundColor = isHovered ? "rgb(15 23 42)" : "rgb(255 255 255)"; // slate-900 : white
  
  return (
    <div
      ref={containerRef}
      className={cn("relative h-screen transition-colors duration-300", className)}
      style={{ backgroundColor }}
    >
      <div
        className="absolute flex h-full w-full items-center justify-center bg-black text-6xl dark:bg-white"
        style={{
          maskImage: "url(/mask.svg)",
          WebkitMaskImage: "url(/mask.svg)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: `${maskSize}px`,
          WebkitMaskSize: `${maskSize}px`,
          maskPosition: `${(mousePosition.x ?? 0) - maskSize / 2}px ${
            (mousePosition.y ?? 0) - maskSize / 2
          }px`,
          WebkitMaskPosition: `${(mousePosition.x ?? 0) - maskSize / 2}px ${
            (mousePosition.y ?? 0) - maskSize / 2
          }px`,
          transition: "mask-size 0.3s ease-in-out, mask-position 0.15s linear, -webkit-mask-size 0.3s ease-in-out, -webkit-mask-position 0.15s linear",
        }}
      >
        <div className="absolute inset-0 z-0 h-full w-full bg-black opacity-50 dark:bg-white" />
        <div
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          className="relative z-20 mx-auto max-w-4xl text-center text-4xl font-bold"
        >
          {children}
        </div>
      </div>
      <div className="flex h-full w-full items-center justify-center">
        {revealText}
      </div>
    </div>
  );
};