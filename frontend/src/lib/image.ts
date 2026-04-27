export interface ImageOptions {
  removeBackground?: boolean;
  width?: number;
  height?: number;
  crop?: string;
}

export const resolveImageUrl = (value?: string | null, options: ImageOptions = {}) => {
  if (!value) return '';
  
  // 1. If it's a Cloudinary URL, we can inject transformations directly
  if (value.includes('cloudinary.com') && value.includes('/upload/')) {
    let transformedUrl = value;
    let transformations: string[] = [];
    
    // Check for explicit "keep background" flag in the URL
    const explicitKeepBg = value.includes('keep-bg=1');
    // Check if it's a JPG/JPEG filename (which in our project signifies a manual revert to keep backgrounds)
    const isOriginalJpg = /\.(jpg|jpeg)(\?|$)/i.test(value);
    
    // Inject background removal ONLY if requested AND not explicitly disabled
    if (options.removeBackground && !explicitKeepBg && !isOriginalJpg) {
      transformations.push('e_background_removal');
    }

    // Default enhance for quality: use best quality auto setting and auto format
    transformations.push('f_auto,q_auto:best');

    // You can add more dynamic transformations here if needed (width, height, etc)
    if (options.width || options.height) {
      transformations.push(`w_${options.width || 'auto'},h_${options.height || 'auto'},c_${options.crop || 'limit'}`);
    }

    if (transformations.length > 0) {
      // Replace /upload/ with /upload/transformations/
      transformedUrl = transformedUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }

    return transformedUrl;
  }

  // 2. If it's already a full URL (external and NOT Cloudinary), return as-is
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }
  
  // 3. For local paths, use VITE_IMAGE_URL or fallback to VITE_API_URL
  let baseUrl = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_API_URL || '';
  const cleaned = value.replace(/^\/+/, '');
  
  // If no base URL is configured, return the path as-is (will be relative)
  if (!baseUrl) {
    return `/${cleaned}`;
  }

  // If baseUrl contains /api, strip it for static asset paths like /uploads/**
  baseUrl = baseUrl.replace(/\/+$/, '');
  if (/^uploads\//i.test(cleaned) && /\/api$/i.test(baseUrl)) {
    baseUrl = baseUrl.replace(/\/api$/i, '');
  }

  return `${baseUrl}/${cleaned}`;
};

