import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { Stack, usePathname } from "expo-router";
import { useCallback, useEffect } from 'react';
import { Linking, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../components/AuthContext";
import BottomNavigation from "../components/BottomNavigation";
import { CartProvider } from "../components/CartContext";
import { PaymentProvider } from "../components/PaymentContext";
import { useAccountService } from "../hooks/useAccountService";

// Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUB_KEY || '';

// Screens that should show the bottom navigation
const SCREENS_WITH_BOTTOM_NAV = [
  '/home',
  '/protected',
  '/restaurant-home',
  '/restaurant/home/restaurant-home',
  '/producer/home/producer-shop',
  '/order/orders-list',
  '/producer/home/dashboard',
];

// Component to handle deep links (must be inside StripeProvider)
function DeepLinkHandler() {
  const { handleURLCallback } = useStripe();

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          console.log('[DeepLink] Stripe handled the URL');
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleDeepLink(event.url);
      }
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  return null;
}

function LayoutContent() {
  const pathname = usePathname();
  const shouldShowBottomNav = SCREENS_WITH_BOTTOM_NAV.includes(pathname);

  // Initialize account service (token provider, retry pending notifications)
  useAccountService();

  return (
    <View style={{ flex: 1 }}>
      <DeepLinkHandler />
      <Stack screenOptions={{ headerShown: false }} />
      {shouldShowBottomNav && <BottomNavigation />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <PaymentProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <StripeProvider
                publishableKey={STRIPE_PUBLISHABLE_KEY}
                urlScheme="expoapp"
                merchantIdentifier="merchant.com.marchconclu"
              >
                <LayoutContent />
              </StripeProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </PaymentProvider>
      </CartProvider>
    </AuthProvider>
  );
}
