import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Link } from "expo-router";
import Colors from "../constants/Colors";
import Button from "../components/Button";
import BottomModal from "../components/BottomModal";
import LanguageCard from "../components/LanguageCard";

const { width } = Dimensions.get("window");
const CARD_SIZE = width * 0.35;

export default function LanguageSelection() {
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const [modalVisible, setModalVisible] = useState(false);

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

        <Link href="/restaurant/home/restaurant-home" asChild>
          <Button
            title={t("accept")}
            onPress={() => setModalVisible(false)}
            variant="accent"
            style={styles.acceptButton}
            textStyle={styles.acceptButtonText}
          />
        </Link>
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
