import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { usePayment } from '../../hooks/usePayment';

export default function PaymentScreen() {
  const { loading, openPaymentSheet } = usePayment({
    amount: 1099, // $10.99 in cents
    currency: 'usd',
    merchantDisplayName: 'Your Business Name',
  });

  const handlePayment = async () => {
    const result = await openPaymentSheet();
    
    if (result.success) {
      Alert.alert('Success', 'Your payment was confirmed!');
      // Navigate to success/confirmation screen
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      {loading && <Text>Loading payment...</Text>}
      <Button
        disabled={loading}
        title="Checkout"
        onPress={handlePayment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});