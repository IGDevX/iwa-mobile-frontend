import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const categories = [
  { label: "Légume", icon: "https://placehold.co/60x60" },
  { label: "Fruit", icon: "https://placehold.co/60x60" },
  { label: "Viande", icon: "https://placehold.co/60x60" },
  { label: "Miel", icon: "https://placehold.co/60x60" },
  { label: "Vin", icon: "https://placehold.co/60x60" },
];

const filters = ["Livraison", "Label", "Date"];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Image source={{ uri: "https://placehold.co/30x30" }} style={styles.topIcon} />
        <View style={styles.locationBox}>
          <Image source={{ uri: "https://placehold.co/30x30" }} style={styles.locationIcon} />
          <Text style={styles.locationText}>Montpellier</Text>
        </View>
        <Image source={{ uri: "https://placehold.co/40x40" }} style={styles.topIcon} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Image source={{ uri: "https://placehold.co/30x30" }} style={styles.searchIcon} />
        <Text style={styles.searchText}>Chercher....</Text>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((cat) => (
          <View key={cat.label} style={styles.categoryCard}>
            <Image source={{ uri: cat.icon }} style={styles.categoryIcon} />
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Image source={{ uri: "https://placehold.co/40x40" }} style={styles.navIcon} />
        <Image source={{ uri: "https://placehold.co/40x40" }} style={styles.navIcon} />
        <Image source={{ uri: "https://placehold.co/40x40" }} style={styles.navIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F6ED" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 15,
  },
  topIcon: { width: 40, height: 40, borderRadius: 8 },
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
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 90,
    backgroundColor: "#FFFEF4",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  navIcon: { width: 40, height: 40 },
});
