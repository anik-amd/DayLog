import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmationModalProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { fontSize, spacing } = useResponsive();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable 
        className="flex-1 items-center justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={onCancel}
      >
        <Pressable 
          onPress={(e) => e.stopPropagation()} 
          style={{ 
            backgroundColor: colors.surface, 
            width: '100%', 
            borderTopLeftRadius: moderateScale(40), 
            borderTopRightRadius: moderateScale(40), 
            paddingHorizontal: moderateScale(32), 
            paddingTop: moderateScale(40), 
            paddingBottom: moderateScale(64), 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: -4 }, 
            shadowOpacity: 0.15, 
            shadowRadius: 12, 
            elevation: 8 
          }}
        >
          <View className="mb-8">
            <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.xl, color: colors.text, textAlign: 'center' }}>
              {title}
            </Text>
            {message && (
              <Text style={{ fontFamily: 'Outfit-Regular', fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }}>
                {message}
              </Text>
            )}
          </View>

          <View className="space-y-3">
            <TouchableOpacity 
              onPress={onConfirm}
              style={{ 
                backgroundColor: isDestructive ? colors.error : colors.accent, 
                padding: moderateScale(20), 
                borderRadius: moderateScale(16), 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Text style={{ fontFamily: 'Outfit-SemiBold', fontSize: fontSize.md, color: '#ffffff' }}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onCancel}
              style={{ 
                padding: moderateScale(20), 
                borderRadius: moderateScale(16), 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderWidth: 1, 
                borderColor: colors.border 
              }}
            >
              <Text style={{ fontFamily: 'Outfit-SemiBold', fontSize: fontSize.md, color: colors.textSecondary }}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}