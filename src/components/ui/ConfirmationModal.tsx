import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";

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
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable 
        className="flex-1 bg-black/60 items-center justify-end"
        onPress={onCancel}
      >
        <Pressable onPress={(e) => e.stopPropagation()} className="bg-white dark:bg-neutral-900 w-full rounded-t-[40px] px-8 pt-10 pb-16 shadow-2xl">
          <View className="mb-8">
            <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-900 dark:text-neutral-50 text-2xl text-center">
              {title}
            </Text>
          </View>

          <View className="space-y-3">
            <TouchableOpacity 
              onPress={onConfirm}
              className="flex-row items-center justify-center p-5 rounded-2xl bg-red-500"
            >
              <Text style={{ fontFamily: 'Outfit-SemiBold' }} className="text-white text-[16px]">
                {confirmLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onCancel}
              className="flex-row items-center justify-center p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700"
            >
              <Text style={{ fontFamily: 'Outfit-SemiBold' }} className="text-neutral-600 dark:text-neutral-400 text-[16px]">
                {cancelLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
