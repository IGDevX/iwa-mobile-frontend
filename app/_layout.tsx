import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import { usePathname } from "expo-router";
import { AuthProvider } from "../components/AuthContext";
import BottomNavigation from "../components/BottomNavigation";

// Screens that should show the bottom navigation
const SCREENS_WITH_BOTTOM_NAV = [
  '/home-page',
  '/protected-page',
];

function LayoutContent() {
  const pathname = usePathname();
  const shouldShowBottomNav = SCREENS_WITH_BOTTOM_NAV.includes(pathname);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {shouldShowBottomNav && <BottomNavigation />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LayoutContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
