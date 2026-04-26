/**
 * Convert relative file path to full API URL
 * @param relativePath - Path like "media/students/uuid.jpg"
 * @returns Full URL like "http://localhost:8000/media/students/uuid.jpg"
 */
export const getFileUrl = (relativePath: string | null | undefined): string => {
  if (!relativePath) return '';
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  // Get backend URL from environment or construct from current location
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : 'http://localhost:8000');
  
  return `${backendUrl}/${cleanPath}`;
};
