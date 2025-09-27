import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import Colors from "../constants/Colors";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue 👋</Text>
      <Link href="/terms" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Voir les Termes</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 40,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});
