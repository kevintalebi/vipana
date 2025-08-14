'use client';
import { useState, useEffect } from 'react';
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
  }, [pathname, isNavigating]);

  const navigateWithLoading = async (path: string) => {
    setIsNavigating(true);
    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  };

  return {
    isNavigating,
    navigateWithLoading,
    router
  };
}; 