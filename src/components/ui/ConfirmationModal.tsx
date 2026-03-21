import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
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
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 justify-center items-center px-6 bg-black/40 dark:bg-black/60">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View 
              className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-[32px] overflow-hidden shadow-2xl border border-neutral-100 dark:border-neutral-800"
            >
              <View className="p-8 items-center">
                <View className={`w-16 h-16 rounded-full items-center justify-center mb-6 ${isDestructive ? 'bg-red-50 dark:bg-red-900/20' : 'bg-neutral-50 dark:bg-neutral-800'}`}>
                  <Ionicons 
                    name={isDestructive ? "trash-outline" : "help-circle-outline"} 
                    size={32} 
                    color={isDestructive ? "#ef4444" : "#737373"} 
                  />
                </View>
                
                <Text style={{ fontFamily: 'Outfit-Bold' }} className="text-xl text-neutral-900 dark:text-neutral-50 mb-2 text-center">
                  {title}
                </Text>
                
                <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500 dark:text-neutral-400 text-center leading-6">
                  {message}
                </Text>
              </View>

              <View className="flex-row border-t border-neutral-100 dark:border-neutral-800">
                <TouchableOpacity 
                  onPress={onCancel}
                  className="flex-1 py-5 items-center justify-center"
                >
                  <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-500 dark:text-neutral-400">
                    {cancelLabel}
                  </Text>
                </TouchableOpacity>
                
                <View className="w-[1px] bg-neutral-100 dark:border-neutral-800" />
                
                <TouchableOpacity 
                  onPress={onConfirm}
                  className="flex-1 py-5 items-center justify-center"
                >
                  <Text 
                    style={{ fontFamily: 'Outfit-Bold' }} 
                    className={isDestructive ? "text-red-500" : "text-neutral-900 dark:text-neutral-50"}
                  >
                    {confirmLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
