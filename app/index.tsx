import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Link, router } from "expo-router";
import Colors from "../constants/Colors";
import Button from "../components/Button";
import BottomModal from "../components/BottomModal";
import LanguageCard from "../components/LanguageCard";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "../components/AuthContext";

const { width } = Dimensions.get("window");
const CARD_SIZE = width * 0.35;

export default function LanguageSelection() {
  const { t } = useTranslation();
  const { state } = useContext(AuthContext);
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  const languages = [
    { code: "fr", label: "Français", icon: require("../assets/images/icons8-france-48.png") },
    { code: "en", label: "English", icon: require("../assets/images/icons8-great-britain-48.png") },
  ];

  // Check if this is the first launch
  useEffect(() => {
    checkFirstLaunch();
  }, []);

  // Handle navigation after auth state changes
  useEffect(() => {
    if (isFirstLaunch === false) {
      // Not first launch, redirect based on auth state
      redirectBasedOnAuthState();
    }
  }, [isFirstLaunch, state.isSignedIn]);

  const checkFirstLaunch = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      
      if (hasSeenOnboarding === 'true') {
        // Not first launch
        setIsFirstLaunch(false);
        
        // Load saved language if available
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
          setSelectedLang(savedLanguage);
        }
      } else {
        // First launch
        setIsFirstLaunch(true);
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(true); // Default to first launch on error
    }
  };

  const redirectBasedOnAuthState = () => {
    if (state.isSignedIn) {
      // User is logged in, redirect to appropriate home based on role
      const userRole = state.userInfo?.roles?.[0];
      if (userRole === 'Producer') {
        router.replace('/producer/home/producer-shop');
      } else if (userRole === 'Restaurant Owner') {
        router.replace('/restaurant/home/restaurant-home');
      } else {
        // Default fallback for logged in users without clear role
        router.replace('/restaurant/home/restaurant-home');
      }
    } else {
      // User not logged in, go to restaurant home (can browse without login)
      router.replace('/restaurant/home/restaurant-home');
    }
  };

  const handleAcceptTerms = async () => {
    try {
      // Save that user has completed onboarding
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      await AsyncStorage.setItem('selectedLanguage', selectedLang);
      
      setModalVisible(false);
      
      // After accepting terms, redirect based on auth state
      redirectBasedOnAuthState();
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      // Still proceed even if saving fails
      setModalVisible(false);
      redirectBasedOnAuthState();
    }
  };

  const handleSelect = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  };

  // Show loading or nothing while checking first launch
  if (isFirstLaunch === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  // If not first launch, component will redirect automatically
  if (isFirstLaunch === false) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/logo.png")} style={styles.logo} />
      <Text style={styles.title}>{t("welcome")}</Text>
      <Text style={styles.subtitle}>{t("language_selection")}</Text>

      <View style={styles.languages}>
        {languages.map((lang) => (
          <LanguageCard
            key={lang.code}
            code={lang.code}
            label={lang.label}
            icon={lang.icon}
            isSelected={selectedLang === lang.code}
            onPress={handleSelect}
            size={CARD_SIZE}
          />
        ))}
      </View>

      <Button
        title={t("terms")}
        onPress={() => setModalVisible(true)}
        variant="primary"
        style={styles.nextButton}
        textStyle={styles.nextButtonText}
      />

      {/* Terms Modal */}
      <BottomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t("terms")}
        scrollable={true}
      >
        <Text style={styles.description}>{t("terms_description")}</Text>

        <Button
          title={t("accept")}
          onPress={handleAcceptTerms}
          variant="accent"
          style={styles.acceptButton}
          textStyle={styles.acceptButtonText}
        />
      </BottomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFEF4",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: { width: 80, height: 80, borderRadius: 8, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: "700", color: "#4A4459", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#4A4459", marginBottom: 40 },
  languages: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  nextButton: {
    position: "absolute",
    bottom: 50,
    width: "60%",
    backgroundColor: "#89A083",
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  acceptButton: {
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center",
    paddingVertical: 16,
    borderRadius: 30,
    width: "60%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  acceptButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A4459",
  },
});
