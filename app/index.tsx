import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal, TouchableWithoutFeedback } from "react-native";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Link } from "expo-router";
import Colors from "../constants/Colors";

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
        {languages.map((lang) => {
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

      <TouchableOpacity style={styles.nextButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.nextButtonText}>{t("terms")}</Text>
      </TouchableOpacity>

      {/* Modal for Terms */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.title}>{t("terms")}</Text>
                <Text style={styles.description}>{t("terms_description")}</Text>

                <Link href="/home_restaurateur" asChild>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>{t("accept")}</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  selectedLangCard: { borderColor: "#89A083", shadowOpacity: 0.25 },
  langIcon: { width: 60, height: 60, marginBottom: 12 },
  langText: { fontSize: 18, fontWeight: "500", color: "#4A4459" },
  selectedLangText: { color: "#89A083", fontWeight: "700" },
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
  nextButtonText: { color: "#fff", fontSize: 20, fontWeight: "700" },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  modalContent: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 30,
  },
  description: { marginTop: 20, fontSize: 16, lineHeight: 24, color: Colors.textPrimary },
  button: {
    marginTop: 30,
    width: "60%",
    backgroundColor: "#F7F6ED",
    borderRadius: 30,
    height: 53,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { fontSize: 20, fontWeight: "700", color: Colors.textPrimary },
});
