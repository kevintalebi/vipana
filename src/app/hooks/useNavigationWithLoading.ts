'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useNavigationWithLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Reset loading state when pathname changes (navigation completes)
  useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [pathname]); // Remove isNavigating from dependencies

  const navigateWithLoading = useCallback(async (path: string) => {
    setIsNavigating(true);
    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if we're already on the target path
      if (pathname === path) {
        console.log('Already on target path:', path);
        setIsNavigating(false);
        return;
      }
      
      console.log('Navigating to:', path);
      router.push(path);
      
      // Set a timeout to reset loading state if navigation takes too long
      setTimeout(() => {
        setIsNavigating(false);
      }, 5000);
      
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
      
      // Fallback: try to navigate using window.location
      if (typeof window !== 'undefined') {
        try {
          window.location.href = path;
        } catch (fallbackError) {
          console.error('Fallback navigation error:', fallbackError);
        }
      }
    }
  }, [pathname, router]);

  return {
    isNavigating,
    navigateWithLoading,
    router
  };
}; 