import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
}

const defaultSettings: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    'accessibility-settings',
    defaultSettings
  );

  useEffect(() => {
    const html = document.documentElement;

    if (settings.largeText) {
      html.classList.add('large-text');
    } else {
      html.classList.remove('large-text');
    }

    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
  }, [settings]);

  const toggleLargeText = () => {
    setSettings((prev) => ({ ...prev, largeText: !prev.largeText }));
  };

  const toggleHighContrast = () => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  };

  return {
    settings,
    toggleLargeText,
    toggleHighContrast,
  };
}
