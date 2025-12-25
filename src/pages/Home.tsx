import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const popularDrugs = [
  'Metformin',
  'Lisinopril',
  'Atorvastatin',
  'Omeprazole',
  'Amlodipine',
  'Levothyroxine',
];

// Featured medications with real savings examples
const featuredSavings = [
  {
    name: 'Metformin',
    genericFor: 'Glucophage',
    condition: 'Diabetes',
    retailPrice: 45,
    ourPrice: 4,
    savings: 91,
  },
  {
    name: 'Lisinopril',
    genericFor: 'Prinivil/Zestril',
    condition: 'Blood Pressure',
    retailPrice: 38,
    ourPrice: 4,
    savings: 89,
  },
  {
    name: 'Atorvastatin',
    genericFor: 'Lipitor',
    condition: 'Cholesterol',
    retailPrice: 285,
    ourPrice: 9,
    savings: 97,
  },
  {
    name: 'Sertraline',
    genericFor: 'Zoloft',
    condition: 'Mental Health',
    retailPrice: 68,
    ourPrice: 4,
    savings: 94,
  },
];

const howItWorks = [
  {
    step: 1,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Search Your Medication',
    description: 'Type in your prescription drug name - brand or generic',
  },
  {
    step: 2,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Compare All Prices',
    description: 'See cash prices, insurance estimates, and discount programs side-by-side',
  },
  {
    step: 3,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Find a Pharmacy',
    description: 'Locate nearby pharmacies and get the best deal in your area',
  },
];

const trustFeatures = [
  { icon: '100%', label: 'Free to Use', description: 'No fees, no hidden costs' },
  { icon: '65+', label: 'Medications', description: 'Common prescriptions covered' },
  { icon: '6', label: 'Languages', description: 'Multilingual support' },
];

const faqs = [
  {
    question: 'Is CommunityMeds really free?',
    answer: 'Yes! CommunityMeds is completely free to use. We do not charge any fees or require payment.',
  },
  {
    question: 'How accurate are the prices?',
    answer: 'Prices are updated regularly and based on data from major pharmacies. However, prices can vary by location, so always confirm the final price at your pharmacy.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No account is needed. Just search for your medication and compare prices immediately.',
  },
  {
    question: 'What discount programs do you show?',
    answer: 'We show prices from major discount programs including Walmart $4 Generics, Costco, Mark Cuban\'s Cost Plus Drugs, and GoodRx coupons.',
  },
];

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Save up to 97% on prescriptions</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Stop Overpaying for<br />Your Medications
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Compare prices from pharmacies, insurance plans, and discount programs.
              Find the lowest price for your prescriptions in seconds.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-2xl p-2 shadow-2xl">
              <SearchBar autoFocus />
            </div>
          </div>

          {/* Popular Searches */}
          <div className="text-center">
            <p className="text-blue-200 text-sm mb-3">{t('home.popularSearches')}:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularDrugs.map((drug) => (
                <Link
                  key={drug}
                  to={`/search?q=${encodeURIComponent(drug)}`}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white hover:bg-white/20 transition-colors border border-white/20"
                >
                  {drug}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="p-4">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">{feature.icon}</div>
                <div className="font-semibold text-gray-900">{feature.label}</div>
                <div className="text-sm text-gray-500">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Finding affordable medications shouldn't be complicated. We make it simple in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    {item.icon}
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Savings */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Real Savings on Popular Medications
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how much you could save on commonly prescribed medications
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSavings.map((drug) => (
              <Link
                key={drug.name}
                to={`/search?q=${encodeURIComponent(drug.name)}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-2">
                        {drug.condition}
                      </span>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {drug.name}
                      </h3>
                      <p className="text-sm text-gray-500">Generic for {drug.genericFor}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Retail price:</span>
                      <span className="text-gray-400 line-through">${drug.retailPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">Best price:</span>
                      <span className="text-2xl font-bold text-green-600">${drug.ourPrice}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <div className="bg-green-100 text-green-800 text-center py-2 rounded-lg font-semibold">
                        Save {drug.savings}%
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/search?q=">
              <Button size="lg" className="px-8">
                Search All Medications
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Discount Programs Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              We Compare All Major Discount Programs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't overpay! We show you prices from the biggest pharmacy discount programs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Walmart $4 Generics', description: '30-day supply for $4' },
              { name: 'Costco Pharmacy', description: 'No membership needed for Rx' },
              { name: 'Cost Plus Drugs', description: 'Mark Cuban\'s transparent pricing' },
              { name: 'GoodRx', description: 'Free discount coupons' },
            ].map((program, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{program.name}</h3>
                <p className="text-sm text-gray-500">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Pharmacies CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  Find Pharmacies Near You
                </h2>
                <p className="text-green-100 text-lg max-w-xl">
                  Use our interactive map to locate nearby pharmacies, compare prices, and get directions.
                </p>
              </div>
              <Link to="/pharmacies">
                <Button
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 px-8 shadow-lg whitespace-nowrap"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('pharmacy.title')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    Q
                  </span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-9">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multilingual Support Banner */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Available in 6 Languages</h2>
          <p className="text-blue-100 mb-6">
            We support English, Spanish, Chinese, Tagalog, Vietnamese, and Arabic to serve our diverse communities.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['English', 'Espanol', '中文', 'Tagalog', 'Tieng Viet', 'العربية'].map((lang, index) => (
              <span key={index} className="px-4 py-2 bg-white/10 rounded-full text-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Start Saving on Your Medications Today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            No account needed. No fees. Just search and save.
          </p>
          <div className="max-w-xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-4 shadow-inner">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
