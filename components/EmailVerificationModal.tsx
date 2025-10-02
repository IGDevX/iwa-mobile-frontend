import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from './Button';

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  onResend: () => void;
  onClose: () => void;
}

export default function EmailVerificationModal({
  visible,
  email,
  onResend,
  onClose
}: EmailVerificationModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.emailValidation}>
        <View style={styles.container}>
          {/* Email Icon */}
          <View style={styles.containerIcon}>
            <Image
              source={require('../assets/images/icons8-name-96.png')} // Using existing icon as placeholder
              style={styles.iconImage}
            />
          </View>

          {/* Title */}
          <View style={styles.paragraph}>
            <Text style={styles.verifyEmailText}>
              {t('auth.email_verification.title', 'Vérifiez votre email')}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.emailValidationParagraph}>
            <Text style={styles.descriptionText}>
              {t('auth.email_verification.description', 'Nous avons envoyé un lien de vérification à votre adresse email. Cliquez sur le lien pour activer votre compte.')}
            </Text>
          </View>

          {/* Email Display */}
          <View style={styles.emailValidationContainer}>
            <View style={styles.emailParagraph}>
              <Text style={styles.emailText}>{email}</Text>
            </View>
          </View>

          {/* Resend Button */}
          <View style={styles.resendContainer}>
            <Button
              title={t('auth.email_verification.resend', 'Renvoyer')}
              onPress={onResend}
              style={styles.resendButton}
              textStyle={styles.resendButtonText}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  emailValidation: {
    flex: 1,
    backgroundColor: '#E3E2D9',
    paddingTop: 190,
    paddingHorizontal: 26,
    paddingRight: 31,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    height: 550,
    backgroundColor: '#F7F6ED',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
  },
  containerIcon: {
    position: 'absolute',
    top: 80,
    left: '50%',
    marginLeft: -40, // Half of width to center
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#89A083',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 40,
    height: 40,
    tintColor: '#FFFEF4',
  },
  paragraph: {
    position: 'absolute',
    top: 200,
    left: 30,
    width: 313,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyEmailText: {
    fontSize: 24,
    lineHeight: 32,
    color: '#4A4459',
    textAlign: 'center',
    fontWeight: '600',
  },
  emailValidationParagraph: {
    position: 'absolute',
    top: 260,
    left: 30,
    width: 313,
    height: 72,
    justifyContent: 'center',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A4459',
    textAlign: 'center',
  },
  emailValidationContainer: {
    position: 'absolute',
    top: 340,
    left: 30,
    width: 313,
    height: 50,
    backgroundColor: '#EAE9E1',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailParagraph: {
    width: 283,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 16,
    lineHeight: 32,
    color: '#4A4459',
    textAlign: 'center',
  },
  resendContainer: {
    position: 'absolute',
    top: 420,
    left: 30,
    width: 313,
    height: 60,
  },
  resendButton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#89A083',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 20,
    lineHeight: 32,
    color: '#FFFEF4',
    fontWeight: '600',
  },
});