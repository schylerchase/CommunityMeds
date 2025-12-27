import { useTranslation } from 'react-i18next';
import { AccessibilityToggle } from '../ui/AccessibilityToggle';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('footer.about')}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('footer.aboutText')}
            </p>
            <p className="text-gray-500 text-xs mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              {t('footer.disclaimer')}
            </p>
          </div>

          {/* Accessibility */}
          <div>
            <AccessibilityToggle />
          </div>

          {/* Links */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('common.learnMore')}
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.goodrx.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  GoodRx - Drug Coupons
                </a>
              </li>
              <li>
                <a
                  href="https://www.medicare.gov/drug-coverage-part-d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  Medicare Drug Coverage
                </a>
              </li>
              <li>
                <a
                  href="https://www.needymeds.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  NeedyMeds - Patient Assistance
                </a>
              </li>
              <li>
                <a
                  href="https://costplusdrugs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  Cost Plus Drugs
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} PublicRx.
            {' '}A free public resource.
          </p>
        </div>
      </div>
    </footer>
  );
}
