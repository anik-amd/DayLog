import { useState, useEffect } from 'react';
import { Keyboard, Platform, KeyboardEvent, Dimensions } from 'react-native';

export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListenerConfig = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardWillShow';
    const hideListenerConfig = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardWillHide';

    const showHandler = (event: KeyboardEvent) => {
      const height = event.endCoordinates.height;
      const screenHeight = Dimensions.get('window').height;
      
      // On Android, sometimes the keyboard height includes the navigation bar
      // We need to check if the keyboard is actually above the bottom navigation
      // Using a threshold - if keyboard height is more than 50% of screen, it likely includes nav bar
      const effectiveHeight = Platform.OS === 'android' && height > screenHeight * 0.5 
        ? height - Dimensions.get('window').height + (Dimensions.get('screen').height - Dimensions.get('window').height)
        : height;
      
      setKeyboardHeight(effectiveHeight);
    };

    const hideHandler = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showListenerConfig, showHandler);
    const hideSub = Keyboard.addListener(hideListenerConfig, hideHandler);

    // Android fallback - some keyboards only fire keyboardDidShow
    let didShowSub: any = null;
    if (Platform.OS === 'android') {
      didShowSub = Keyboard.addListener('keyboardDidShow', (event: KeyboardEvent) => {
        // Only update if we haven't already detected keyboard
        if (keyboardHeight === 0) {
          setKeyboardHeight(event.endCoordinates.height);
        }
      });
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      if (didShowSub) {
        didShowSub.remove();
      }
    };
  }, []);

  return keyboardHeight;
}