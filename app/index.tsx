import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from "react-native";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Link } from "expo-router";

const { width } = Dimensions.get("window");

export default function LanguageSelection() {
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  const languages = [
    { code: "fr", label: "Français", icon: require("../assets/images/icons8-france-48.png") },
    { code: "en", label: "English", icon: require("../assets/images/icons8-great-britain-48.png") },
  ];

  const handleSelect = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("welcome")}</Text>
      <Text style={styles.subtitle}>{t("language_selection")}</Text>

      <View style={styles.languages}>
        {languages.map((lang, index) => {
          const isSelected = selectedLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langCard,
                isSelected && styles.selectedLangCard,
                { transform: [{ scale: isSelected ? 1.1 : 1 }] },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelect(lang.code)}
            >
              <Image source={lang.icon} style={styles.langIcon} />
              <Text style={[styles.langText, isSelected && styles.selectedLangText]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Link href="/terms" asChild>
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>{t("terms")}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const CARD_SIZE = width * 0.35;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFEF4",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4A4459",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A4459",
    marginBottom: 40,
  },
  languages: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  langCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    backgroundColor: "#F7F6ED",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedLangCard: {
    borderColor: "#89A083",
    shadowOpacity: 0.25,
  },
  langIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  langText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4A4459",
  },
  selectedLangText: {
    color: "#89A083",
    fontWeight: "700",
  },
  nextButton: {
    position: "absolute",
    bottom: 50,
    width: "60%",
    backgroundColor: "#89A083",
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
