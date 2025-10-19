import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../components/AuthContext';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

interface NotificationSettings {
  orderStatus: boolean;
  paymentDue: boolean;
  deliveryScheduled: boolean;
  pickupScheduled: boolean;
  incompleteProfile: boolean;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { state } = useContext(AuthContext);
  
  // Form state
  const [email, setEmail] = useState(state.userInfo?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationSettings>({
    orderStatus: true,
    paymentDue: true,
    deliveryScheduled: true,
    pickupScheduled: false,
    incompleteProfile: true,
  });

  const handleBack = () => {
    router.back();
  };

  const handleSaveEmail = () => {
    Alert.alert(
      t('common.info', 'Information'),
      'Email update functionality will be implemented here.',
      [{ text: t('common.ok', 'OK') }]
    );
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        t('common.error', 'Error'),
        'Please fill all password fields.',
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t('common.error', 'Error'),
        'New passwords do not match.',
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }

    Alert.alert(
      t('common.info', 'Information'),
      'Password change functionality will be implemented here.',
      [{ text: t('common.ok', 'OK') }]
    );
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.account_management.delete_account'),
      t('settings.account_management.delete_warning'),
      [
        { text: t('profile.signout.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('settings.account_management.delete_account'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('common.info', 'Information'),
              'Account deletion functionality will be implemented here.',
              [{ text: t('common.ok', 'OK') }]
            );
          }
        }
      ]
    );
  };

  const PasswordInput = ({ 
    value, 
    onChangeText, 
    placeholder, 
    showPassword, 
    onToggleShow 
  }: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleShow: () => void;
  }) => (
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.passwordInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        placeholderTextColor="rgba(74, 68, 89, 0.5)"
      />
      <TouchableOpacity onPress={onToggleShow} style={styles.eyeButton}>
        <Ionicons
          name={showPassword ? "eye-off" : "eye"}
          size={16}
          color="#4A4459"
        />
      </TouchableOpacity>
    </View>
  );

  const NotificationRow = ({ 
    title, 
    description, 
    value, 
    onToggle 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.notificationRow}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationDescription}>{description}</Text>
      </View>
      <View style={[styles.toggle, value ? styles.toggleActive : styles.toggleInactive]}>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#d1d5dc', true: '#89A083' }}
          thumbColor={value ? '#fff' : '#fff'}
          ios_backgroundColor="#d1d5dc"
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color="#4A4459" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Login Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.login_info.title')}</Text>
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t('settings.login_info.email')}</Text>
          <View style={styles.emailRow}>
            <TextInput
              style={styles.emailInput}
              value={email}
              onChangeText={setEmail}
              placeholder="pierre.martin@restaurant-le-gourmet.fr"
              placeholderTextColor="#4A4459"
              editable={false}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmail}>
              <Text style={styles.saveButtonText}>{t('settings.login_info.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{t('settings.login_info.change_password')}</Text>
          <View style={styles.passwordSection}>
            <PasswordInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('settings.login_info.current_password')}
              showPassword={showCurrentPassword}
              onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            />
            <PasswordInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('settings.login_info.new_password')}
              showPassword={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
            />
            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('settings.login_info.confirm_password')}
              showPassword={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
              <Text style={styles.changePasswordButtonText}>
                {t('settings.login_info.change_password_button')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notification Preferences Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.notifications.title')}</Text>
        </View>

        <View style={styles.notificationsContainer}>
          <NotificationRow
            title={t('settings.notifications.order_status')}
            description={t('settings.notifications.order_status_desc')}
            value={notifications.orderStatus}
            onToggle={() => handleNotificationToggle('orderStatus')}
          />
          <NotificationRow
            title={t('settings.notifications.payment_due')}
            description={t('settings.notifications.payment_due_desc')}
            value={notifications.paymentDue}
            onToggle={() => handleNotificationToggle('paymentDue')}
          />
          <NotificationRow
            title={t('settings.notifications.delivery_scheduled')}
            description={t('settings.notifications.delivery_scheduled_desc')}
            value={notifications.deliveryScheduled}
            onToggle={() => handleNotificationToggle('deliveryScheduled')}
          />
          <NotificationRow
            title={t('settings.notifications.pickup_scheduled')}
            description={t('settings.notifications.pickup_scheduled_desc')}
            value={notifications.pickupScheduled}
            onToggle={() => handleNotificationToggle('pickupScheduled')}
          />
          <NotificationRow
            title={t('settings.notifications.incomplete_profile')}
            description={t('settings.notifications.incomplete_profile_desc')}
            value={notifications.incompleteProfile}
            onToggle={() => handleNotificationToggle('incompleteProfile')}
          />
        </View>
      </View>

      {/* Account Management Section */}
      <View style={{...styles.section, marginBottom: 92 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('settings.account_management.title')}</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>
            {t('settings.account_management.delete_account')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.deleteWarning}>
          {t('settings.account_management.delete_warning')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f6ed',
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    lineHeight: 30,
    color: '#4A4459',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginHorizontal: 24,
    backgroundColor: '#eae9e1',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: '#4a4459',
    lineHeight: 24,
    fontWeight: '700',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Roboto',
    color: '#4a4459',
    lineHeight: 21,
    marginBottom: 8,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailInput: {
    flex: 1,
    height: 39,
    borderRadius: 10,
    backgroundColor: '#f7f6ed',
    borderWidth: 1,
    borderColor: '#4a4459',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#4a4459',
  },
  saveButton: {
    height: 39,
    width: 98,
    borderRadius: 10,
    backgroundColor: '#89a083',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 12,
    color: '#fffef4',
    lineHeight: 18,
  },
  passwordSection: {
    gap: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 39,
    borderRadius: 10,
    backgroundColor: '#f7f6ed',
    borderWidth: 1,
    borderColor: '#4a4459',
    paddingHorizontal: 12,
    paddingRight: 40,
    fontSize: 14,
    color: '#4a4459',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: 39,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
  },
  changePasswordButton: {
    height: 37,
    borderRadius: 10,
    backgroundColor: '#89a083',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePasswordButtonText: {
    fontSize: 14,
    color: '#fffef4',
    lineHeight: 21,
  },
  notificationsContainer: {
    gap: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 16,
  },
  notificationTitle: {
    fontSize: 14,
    color: '#4a4459',
    lineHeight: 21,
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 12,
    color: '#4a4459',
    opacity: 0.7,
    lineHeight: 18,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#89a083',
  },
  toggleInactive: {
    backgroundColor: '#d1d5dc',
  },
  deleteButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#c2295aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 21,
  },
  deleteWarning: {
    fontSize: 12,
    color: '#4a4459',
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
  },
});
