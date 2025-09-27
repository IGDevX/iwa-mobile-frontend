import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert } from "react-native";
import Colors from "../constants/Colors";

const { width, height } = Dimensions.get("window");

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.appName}>[NOM APP]</Text>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.title}>Termes & Conditions</Text>
        </View>

        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac
          scelerisque libero, sed mollis ipsum. Praesent luctus velit sed
          dignissim faucibus. In at purus at ante
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("OUI pressed")}>
          <Text style={styles.buttonText}>OUI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  header: {
    position: "absolute",
    top: 230,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 27,
  },
  appName: {
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 32,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    width,
    height: 332,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 26,
    paddingTop: 31,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  description: {
    marginTop: 40,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  button: {
    marginTop: 40,
    backgroundColor: "#F7F6ED",
    borderRadius: 16,
    height: 53,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 32,
    color: Colors.textPrimary,
  },
});
