import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';

interface DeviceInfo {
  platform: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  model: string;
  isVirtual: boolean;
}

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const initializeCapacitor = async () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);

      if (native) {
        try {
          // Get device information
          const info = await Device.getInfo();
          setDeviceInfo(info);

          // Configure status bar
          await StatusBar.setStyle({ style: Style.Default });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });

          // Hide splash screen after initialization
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 1500);

          // Keyboard event listeners
          Keyboard.addListener('keyboardWillShow', () => {
            setIsKeyboardOpen(true);
          });

          Keyboard.addListener('keyboardWillHide', () => {
            setIsKeyboardOpen(false);
          });

          // Handle app state changes
          App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive);
          });

          // Handle deep links
          App.addListener('appUrlOpen', (event) => {
            console.log('App opened with URL:', event.url);
            // Handle deep link navigation here
          });

        } catch (error) {
          console.error('Error initializing Capacitor:', error);
        }
      }
    };

    initializeCapacitor();

    return () => {
      // Cleanup listeners
      if (isNative) {
        Keyboard.removeAllListeners();
        App.removeAllListeners();
      }
    };
  }, [isNative]);

  const setStatusBarStyle = async (style: Style) => {
    if (isNative) {
      try {
        await StatusBar.setStyle({ style });
      } catch (error) {
        console.error('Error setting status bar style:', error);
      }
    }
  };

  const setStatusBarColor = async (color: string) => {
    if (isNative) {
      try {
        await StatusBar.setBackgroundColor({ color });
      } catch (error) {
        console.error('Error setting status bar color:', error);
      }
    }
  };

  const exitApp = async () => {
    if (isNative) {
      try {
        await App.exitApp();
      } catch (error) {
        console.error('Error exiting app:', error);
      }
    }
  };

  return {
    isNative,
    deviceInfo,
    isKeyboardOpen,
    setStatusBarStyle,
    setStatusBarColor,
    exitApp,
  };
};