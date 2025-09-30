import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from 'react-native';
import Colors from '../constants/Colors';

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  scrollable?: boolean;
  maxHeight?: DimensionValue;
}

export default function BottomModal({
  visible,
  onClose,
  title,
  children,
  titleStyle,
  contentStyle,
  scrollable = true,
  maxHeight = '80%',
}: BottomModalProps) {
  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable 
    ? { showsVerticalScrollIndicator: false, style: styles.scrollContent }
    : { style: styles.staticContent };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modalContent, 
              contentStyle,
              { maxHeight }
            ]}>
              {/* Handle indicator */}
              <View style={styles.handle} />
              
              {/* Title */}
              {title && (
                <Text style={[styles.title, titleStyle]}>
                  {title}
                </Text>
              )}
              
              {/* Content */}
              <ContentWrapper {...contentProps}>
                {children}
              </ContentWrapper>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalContent: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    padding: 30,
    paddingBottom: 10,
    margin: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#4A4459',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A4459',
    textAlign: 'left',
    marginBottom: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});