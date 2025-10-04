import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/AuthContext';

interface ProfileStatus {
  isComplete: boolean;
  missingFields: string[];
  isLoading: boolean;
  error?: string;
}

/**
 * Hook to check user profile completion status
 * @returns ProfileStatus object with completion info
 */
export const useProfileCompletion = () => {
  const { checkProfileCompletion } = useContext(AuthContext);
  const [status, setStatus] = useState<ProfileStatus>({
    isComplete: false,
    missingFields: [],
    isLoading: true,
  });

  const checkProfile = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: undefined }));
      const result = await checkProfileCompletion();
      setStatus({
        isComplete: result.isComplete,
        missingFields: result.missingFields,
        isLoading: false,
      });
    } catch (error) {
      setStatus({
        isComplete: false,
        missingFields: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check profile',
      });
    }
  };

  useEffect(() => {
    checkProfile();
  }, []);

  return { ...status, refresh: checkProfile };
};

/**
 * Hook to redirect to profile completion if profile is incomplete
 * @param redirectPath - Path to redirect to if profile is incomplete (default: '/complete-profile')
 */
export const useRequireCompleteProfile = (redirectPath: string = '/complete-profile') => {
  const { isComplete, isLoading } = useProfileCompletion();
  
  useEffect(() => {
    if (!isLoading && !isComplete) {
      // You can add navigation logic here if needed
      console.log('Profile incomplete, should redirect to:', redirectPath);
    }
  }, [isComplete, isLoading, redirectPath]);

  return { isComplete, isLoading };
};