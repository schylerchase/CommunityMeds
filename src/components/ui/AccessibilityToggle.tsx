import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

export function AccessibilityToggle() {
  const { t } = useTranslation();
  const { settings, toggleLargeText, toggleHighContrast } = useAccessibility();

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-gray-900">{t('accessibility.settings')}</h3>

      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={settings.largeText}
            onChange={toggleLargeText}
            className="sr-only peer"
            aria-describedby="large-text-desc"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
        </div>
        <span id="large-text-desc" className="text-gray-700">
          {t('accessibility.largeText')}
        </span>
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={toggleHighContrast}
            className="sr-only peer"
            aria-describedby="high-contrast-desc"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
        </div>
        <span id="high-contrast-desc" className="text-gray-700">
          {t('accessibility.highContrast')}
        </span>
      </label>
    </div>
  );
}
