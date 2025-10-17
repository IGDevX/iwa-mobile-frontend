import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useCart } from "../../../components/CartContext";

export default function OrderConfirmationScreen() {
  const { t } = useTranslation();
  const { state } = useCart();

  const handleBack = () => {
    router.back();
  };

  const handleConfirmOrder = () => {
    // Process the order confirmation

    // Navigate back to home and clear cart
    router.push('../home/restaurant-home');
  };

  const getProducerName = (): string => {
    if (state.items.length > 0) {
      return state.items[0].producerName;
    }
    return "Ferme Bio Laurent";
  };

  const getProducerDescription = (): string => {
    return "Maraîcher bio";
  };

  const getDeliveryFee = (): number => {
    return 5.00; // Assuming delivery was selected
  };

  const getTotalWithDelivery = (): number => {
    return state.totalPrice + getDeliveryFee();
  };

  const getCurrentDate = (): string => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    return today.toLocaleDateString('fr-FR', options);
  };

  const getPaymentDueDate = (): string => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
    return dueDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('../../../assets/images/icons8-arrow-96.png')}
            style={styles.backButtonIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('confirmation.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Producer Section */}
        <View style={[styles.section, { marginTop: 15 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Image
                source={require('../../../assets/images/icons8-farmer-96.png')}
                style={styles.logo}
              />
            </View>
            <Text style={styles.sectionTitle}>{t('confirmation.producer')}</Text>
          </View>

          <View style={styles.producerInfo}>
            <View style={styles.producerAvatar}>
              <Image
                source={{ uri: 'https://photo-cdn2.icons8.com/vVsONpHf7-sTgM9mNbSkmX0iCJP6YF9_Ux93NilJJkY/rs:fit:576:384/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNTA1L2NkNjhm/ODcwLWVjMmMtNDU2/OC1hNmE5LTk3ZGQw/NWE3Mjc3Mi5qcGc.webp' }}
                style={styles.producerAvatar}
              />
            </View>
            <View style={styles.producerDetails}>
              <Text style={styles.producerName}>{getProducerName()}</Text>
              <Text style={styles.producerDescription}>{getProducerDescription()}</Text>
            </View>
          </View>
        </View>

        {/* Ordered Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Image
                source={require('../../../assets/images/icons8-cardboard-box-96.png')}
                style={styles.logo}
              />
            </View>
            <Text style={styles.sectionTitle}>{t('confirmation.ordered_products')}</Text>
          </View>

          <View style={styles.productsList}>
            {state.items.map((item, index) => (
              <View key={index} style={[styles.productItem, index < state.items.length - 1 && styles.productItemBorder]}>
                <View style={styles.productInfo}>
                  <View style={styles.productIcon}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.productIconImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>{item.price.toFixed(2)}€/{item.unit}</Text>
                  </View>
                </View>
                <View style={styles.productQuantityPrice}>
                  <Text style={styles.productQuantity}>x{item.quantity}</Text>
                  <Text style={styles.productTotal}>{(item.price * item.quantity).toFixed(2)}€</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Image
                source={require('../../../assets/images/icons8-delivery-96.png')}
                style={styles.logo}
              />
            </View>
            <Text style={styles.sectionTitle}>{t('confirmation.delivery')}</Text>
          </View>

          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryItem}>
              <View style={styles.deliveryIcon}>
                <Image
                  source={require('../../../assets/images/icons8-date-96.png')}
                  style={styles.logoSmall}
                />
              </View>
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryDate}>{getCurrentDate()}</Text>
                <Text style={styles.deliveryTime}>9h00 - 12h00</Text>
              </View>
            </View>

            <View style={styles.deliveryItem}>
              <View style={styles.deliveryIcon}>
                <Image
                  source={require('../../../assets/images/icons8-map-pin-96.png')}
                  style={styles.logoSmall}
                />
              </View>
              <View style={styles.deliveryDetails}>
                <Text style={styles.deliveryAddressTitle}>{t('confirmation.address')}</Text>
                <Text style={styles.deliveryAddress}>
                  Restaurant Le Bistrot, 45 Rue de la Paix, 34000 Montpellier
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Image
                source={require('../../../assets/images/icons8-card-96.png')}
                style={styles.logo}
              />
            </View>
            <Text style={styles.sectionTitle}>{t('confirmation.payment')}</Text>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>{t('confirmation.subtotal')}</Text>
              <Text style={styles.paymentAmount}>{state.totalPrice.toFixed(2)}€</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>{t('confirmation.delivery_fee')}</Text>
              <Text style={styles.paymentAmount}>{getDeliveryFee().toFixed(2)}€</Text>
            </View>

            <View style={[styles.paymentRow, styles.paymentTotal]}>
              <Text style={styles.paymentTotalLabel}>{t('confirmation.total')}</Text>
              <Text style={styles.paymentTotalAmount}>{getTotalWithDelivery().toFixed(2)}€</Text>
            </View>
          </View>

          <View style={styles.paymentNote}>
            <Text style={styles.paymentNoteText}>{t('confirmation.payment_method')}</Text>
            <Text style={styles.paymentDueText}>
              {t('confirmation.payment_due', { date: getPaymentDueDate() })}
            </Text>
          </View>
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
          <Text style={styles.confirmButtonText}>
            {t('confirmation.place_order')}
          </Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          {t('confirmation.terms_acceptance')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6ED",
    paddingTop: 40
  },

  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 19,
    paddingVertical: 21,
    backgroundColor: "#F7F6ED",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonIcon: {
    width: 20,
    height: 20
  },
  backButtonText: {
    fontSize: 20,
    color: "#4A4459",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 27,
    color: '#16131dff',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Section styles
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 16,
  },
  logo: {
    width: 25,
    height: 25,
    borderRadius: 0,
  },
  logoSmall: {
    width: 20,
    height: 20,
    borderRadius: 0,
  },

  sectionTitle: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#4A4459",
  },

  // Producer section
  producerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  producerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
  },
  producerDetails: {
    flex: 1,
  },
  producerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 4,
  },
  producerDescription: {
    fontSize: 14,
    color: "#4A4459",
    opacity: 0.7,
  },

  // Products section
  productsList: {
    gap: 12,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 20,
  },
  productItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productIconImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  productEmoji: {
    fontSize: 20,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    color: "#4A4459",
    opacity: 0.7,
  },
  productQuantityPrice: {
    alignItems: "flex-end",
  },
  productQuantity: {
    fontSize: 14,
    color: "#4A4459",
    marginBottom: 2,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#89A083",
  },

  // Delivery section
  deliveryInfo: {
    gap: 12,
  },
  deliveryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  deliveryIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  deliveryIconText: {
    fontSize: 14,
    opacity: 0.7,
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 2,
  },
  deliveryTime: {
    fontSize: 12,
    color: "#4A4459",
    opacity: 0.7,
  },
  deliveryAddressTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4459",
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 12,
    color: "#4A4459",
    opacity: 0.7,
    lineHeight: 18,
  },

  // Payment section
  paymentDetails: {
    gap: 8,
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 14,
    color: "#4A4459",
  },
  paymentAmount: {
    fontSize: 14,
    color: "#4A4459",
  },
  paymentTotal: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
    marginTop: 8,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4459",
  },
  paymentTotalAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#89A083",
  },
  paymentNote: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  paymentNoteText: {
    fontSize: 12,
    color: "#4A4459",
  },
  paymentDueText: {
    fontSize: 12,
    color: "#4A4459",
    opacity: 0.7,
  },

  // Bottom section
  bottomSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: "#89A083",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.15,
  },
  termsText: {
    fontSize: 12,
    color: "#4A4459",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 18,
  },
});
