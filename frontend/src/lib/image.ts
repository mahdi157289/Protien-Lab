export const resolveImageUrl = (value?: string | null) => {
  if (!value) return '';
  
  // If it's already a full URL (Cloudinary or external), return as-is
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }
  
  // For local paths, use VITE_IMAGE_URL or fallback to VITE_API_URL
  const baseUrl = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_API_URL || '';
  const cleaned = value.replace(/^\/+/, '');
  
  // If no base URL is configured, return the path as-is (will be relative)
  if (!baseUrl) {
    return `/${cleaned}`;
  }
  
  return `${baseUrl}/${cleaned}`;
};

