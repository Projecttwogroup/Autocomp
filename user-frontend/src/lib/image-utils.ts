import React from 'react';
import { performanceService } from '@/services/performance-service';
import { imageCache } from './cache';

interface ImageDimensions {
  width: number;
  height: number;
}

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export class ImageOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async optimizeImage(
    imageFile: File,
    options: OptimizationOptions = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      format = 'webp'
    } = options;

    performanceService.startMeasure('image:optimization', {
      originalSize: imageFile.size,
      format,
    });

    try {
      const image = await this.loadImage(imageFile);
      const dimensions = this.calculateDimensions(
        image.width,
        image.height,
        maxWidth,
        maxHeight
      );

      this.canvas.width = dimensions.width;
      this.canvas.height = dimensions.height;

      // Draw and resize image
      this.ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);

      // Convert to desired format
      const blob = await new Promise<Blob>((resolve) =>
        this.canvas.toBlob(
          (b) => resolve(b!),
          `image/${format}`,
          quality
        )
      );

      performanceService.endMeasure('image:optimization', {
        success: true,
        originalSize: imageFile.size,
        optimizedSize: blob.size,
        format,
      });

      return blob;
    } catch (error) {
      performanceService.endMeasure('image:optimization', {
        success: false,
        error,
      });
      throw error;
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  private calculateDimensions(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number
  ): ImageDimensions {
    let newWidth = width;
    let newHeight = height;

    if (width > maxWidth) {
      newWidth = maxWidth;
      newHeight = (height * maxWidth) / width;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = (width * maxHeight) / height;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }
}

export function createImageUrl(file: File | Blob): string {
  return URL.createObjectURL(file);
}

export function revokeImageUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// React hook for lazy loading images
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    let observer: IntersectionObserver;
    let cleanup = () => {};

    const loadImage = () => {
      const cachedSrc = imageCache.get(src);
      if (cachedSrc) {
        setIsLoaded(true);
        return;
      }

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
        imageCache.set(src, src);
      };

      cleanup = () => {
        img.onload = null;
      };
    };

    if (imgRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.disconnect();
        }
      }, options);

      observer.observe(imgRef.current);
    }

    return () => {
      observer?.disconnect();
      cleanup();
    };
  }, [src, options]);

  return { imgRef, isLoaded };
}