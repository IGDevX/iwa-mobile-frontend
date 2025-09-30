import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useAuthContext } from "../components/AuthContext";
import { useTranslation } from "react-i18next";
import Button from "../components/Button";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function HomeScreen() {

  const { t } = useTranslation();

  const categories = [
    { label: t("home.categories.vegetables"), icon: require("../assets/images/icons8-broccoli-96.png") },
    { label: t("home.categories.fruits"), icon: require("../assets/images/icons8-watermelon-96.png") },
    { label: t("home.categories.meat"), icon: require("../assets/images/icons8-steak-96.png") },
    { label: t("home.categories.honey"), icon: require("../assets/images/icons8-honeycombs-96.png") },
    { label: t("home.categories.wine"), icon: require("../assets/images/icons8-wine-96.png") },
  ];

  const filters = [
    t("home.filters.delivery"),
    t("home.filters.label"),
    t("home.filters.date")
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Image source={{ uri: "https://placehold.co/30x30" }} style={styles.topIcon} />
        <View style={styles.locationBox}>
          <Image source={{ uri: "https://placehold.co/30x30" }} style={styles.locationIcon} />
          <Text style={styles.locationText}>{t("home.location")}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Image source={{ uri: "https://placehold.co/30x30" }} style={styles.searchIcon} />
        <Text style={styles.searchText}>{t("home.search_placeholder")}</Text>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((cat) => (
          <View key={cat.label} style={styles.categoryCard}>
            <Image source={cat.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Filters */}
      <View style={styles.filters}>
        {filters.map((f) => (
          <View key={f} style={styles.filterButton}>
            <Text style={styles.filterText}>{f}</Text>
            <Text style={styles.filterIcon}>􀆈</Text>
          </View>
        ))}
      </View>

      {/* Menu / Placeholder Cards */}
      <ScrollView style={styles.menuList} contentContainerStyle={{ paddingBottom: 120 }}>
        {[1, 2, 3].map((_, idx) => (
          <View key={idx} style={styles.menuCard}>
            <View style={styles.menuInner} />
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F6ED" },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 15,
  },
  topIcon: { width: 20, height: 20, borderRadius: 8 },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#5E5DF0',
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4459',
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAE9E1",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
  },
  locationIcon: { width: 30, height: 30, marginRight: 5 },
  locationText: { fontSize: 16, color: "#4A4459" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAE9E1",
    marginHorizontal: 15,
    padding: 5,
    borderRadius: 15,
    marginBottom: 20,
    height: 60,
  },
  searchIcon: { width: 30, height: 30, marginRight: 10 },
  searchText: { fontSize: 16, color: "#4A4459" },
  categoriesScroll: { marginBottom: 20, paddingLeft: 15 },
  categoryCard: {
    width: 75,
    height: 101,
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: { width: 60, height: 60, borderRadius: 10 },
  categoryText: { marginTop: 3, fontSize: 13, textAlign: "center", color: "#4A4459" },
  filters: { flexDirection: "row", justifyContent: "space-around", marginHorizontal: 15, marginBottom: 15 },
  filterButton: {
    width: 120,
    flexDirection: "row",
    backgroundColor: "#EAE9E1",
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterText: { fontSize: 16, color: "#4A4459" },
  filterIcon: { fontSize: 19, color: "rgba(74,68,89,0.42)" },
  menuList: { paddingHorizontal: 15 },
  menuCard: {
    height: 146,
    backgroundColor: "rgba(137,160,131,0.5)",
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuInner: { width: "100%", height: 64 },
  loginPromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginPromptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A4459',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginPromptSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  loginPromptButton: {
    width: '70%',
  },
});
