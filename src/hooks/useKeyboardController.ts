import { useEffect, useState } from 'react';
import { Platform, Keyboard } from 'react-native';

let useKeyboardAnimationHook: any = null;
let useKeyboardStateHook: any = null;
let KeyboardProviderComponent: any = null;

if (Platform.OS !== 'web') {
  try {
    const keyboardController = require('react-native-keyboard-controller');
    useKeyboardAnimationHook = keyboardController.useKeyboardAnimation;
    useKeyboardStateHook = keyboardController.useKeyboardState;
    KeyboardProviderComponent = keyboardController.KeyboardProvider;
  } catch (error) {
    console.warn('react-native-keyboard-controller not available:', error);
  }
}

export const useKeyboardAnimation = useKeyboardAnimationHook;
export const useKeyboardState = useKeyboardStateHook;
export const KeyboardProvider = KeyboardProviderComponent;

// Fallback hook for when the library isn't available (web fallback)
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
      }
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return { keyboardHeight, keyboardVisible };
}
