import React, { useState, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './AuthContext';
import { router, usePathname } from 'expo-router';
import SignupChoiceModal from './SignupChoiceModal';

interface TabItem {
  nameKey: string; // Translation key
  path: string;
  icon: any; // Image require() or source
  requiresAuth?: boolean;
}

export default function BottomNavigation() {
  const { t } = useTranslation();
  const { state, checkProfileCompletion } = useContext(AuthContext);
  const isAuthenticated = state.isSignedIn;
  const pathname = usePathname();

  const tabs: TabItem[] = [
    {
      nameKey: 'navigation.home',
      path: '/home-page',
      icon: require('../assets/images/icons8-home-96.png'),
    },
    {
      nameKey: 'navigation.profile',
      path: '/profile-page', // Will be dynamically determined
      icon: require('../assets/images/icons8-name-96.png'),
    },
  ];
  
  // Modal states
  const [showSignupChoice, setShowSignupChoice] = useState(false);

  const handleTabPress = async (tab: TabItem) => {
    // Special handling for profile tab when not authenticated
    if (tab.nameKey === 'navigation.profile' && !isAuthenticated) {
      setShowSignupChoice(true);
      return;
    }
    
    // Special handling for profile tab when authenticated - check profile completion
    if (tab.nameKey === 'navigation.profile' && isAuthenticated) {
      try {
        const profileStatus = await checkProfileCompletion();
        if (profileStatus.isComplete) {
          router.push('/profile-page');
        } else {
          router.push('/complete-profile');
        }
        return;
      } catch (error) {
        console.error('Error checking profile completion:', error);
        // Default to complete profile on error
        router.push('/complete-profile');
        return;
      }
    }
    
    if (tab.requiresAuth && !isAuthenticated) {
      setShowSignupChoice(true);
      return;
    }
    
    router.push(tab.path as any);
  };

  const handleExistingUserPress = () => {
    setShowSignupChoice(false);
  };

  const handleCloseModals = () => {
    setShowSignupChoice(false);
  };

  const getVisibleTabs = () => {
    if (!isAuthenticated) {
      // Show only basic tabs when not authenticated
      return tabs.filter(tab => !tab.requiresAuth);
    }
    return tabs;
  };

  const visibleTabs = getVisibleTabs();

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {visibleTabs.map((tab) => {
          const isActive = pathname === tab.path;
          
          return (
            <TouchableOpacity
              key={tab.nameKey}
              style={[styles.tab]}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              <Image 
                source={tab.icon} 
                style={[styles.icon]} 
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Signup Choice Modal */}
      <SignupChoiceModal
        visible={showSignupChoice}
        onClose={handleCloseModals}
        onExistingUser={handleExistingUserPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFEF4',
    paddingBottom: Platform.OS === 'ios' ? 35 : 30,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    width: 35,
    height: 35,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#5E5DF0',
    fontWeight: '600',
  },
});