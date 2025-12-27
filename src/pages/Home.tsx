import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Large pool of medications to rotate through
const allPopularDrugs = [
  'Metformin',
  'Lisinopril',
  'Atorvastatin',
  'Omeprazole',
  'Amlodipine',
  'Levothyroxine',
  'Sertraline',
  'Gabapentin',
  'Losartan',
  'Pantoprazole',
  'Montelukast',
  'Escitalopram',
  'Rosuvastatin',
  'Albuterol',
  'Fluoxetine',
  'Prednisone',
  'Tramadol',
  'Trazodone',
  'Metoprolol',
  'Hydrochlorothiazide',
  'Amoxicillin',
  'Alprazolam',
  'Cyclobenzaprine',
  'Meloxicam',
];

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
  { icon: '25', label: 'Languages', description: 'Multilingual support' },
];

const faqs = [
  {
    question: 'Is PublicRx really free?',
    answer: 'Yes! PublicRx is completely free to use. We do not charge any fees or require payment.',
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
  const [displayedDrugs, setDisplayedDrugs] = useState<string[]>(() =>
    shuffleArray(allPopularDrugs).slice(0, 6)
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Rotate drugs every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setDisplayedDrugs(shuffleArray(allPopularDrugs).slice(0, 6));
        setIsTransitioning(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col bg-warm-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6 shadow-lg">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold">Save up to 97% on prescriptions</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Affordable Medications<br />
              <span className="text-primary-200">for Everyone</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Compare prices from pharmacies, insurance plans, and discount programs.
              Find the lowest price for your prescriptions in seconds.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-2xl p-2 shadow-warm-lg">
              <SearchBar autoFocus />
            </div>
          </div>

          {/* Popular Searches */}
          <div className="text-center">
            <p className="text-white/80 text-sm mb-3">{t('home.popularSearches')}:</p>
            <div
              className={`flex flex-wrap justify-center gap-2 transition-opacity duration-300 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {displayedDrugs.map((drug) => (
                <Link
                  key={drug}
                  to={`/search?q=${encodeURIComponent(drug)}`}
                  className="px-4 py-2 bg-white/25 backdrop-blur-sm rounded-full text-sm text-white font-medium hover:bg-white/40 transition-all duration-200 border border-white/30 shadow-sm hover:scale-105"
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
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-warm-50"/>
          </svg>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-10 bg-warm-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="p-4">
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-1">{feature.icon}</div>
                <div className="font-semibold text-warm-900">{feature.label}</div>
                <div className="text-sm text-warm-600">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-warm-600 max-w-2xl mx-auto">
              Finding affordable medications shouldn't be complicated. We make it simple in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <Card className="h-full p-8" hover>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                    {item.icon}
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-warm">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-warm-900 mb-3">{item.title}</h3>
                  <p className="text-warm-600">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Savings */}
      <section className="py-16 bg-warm-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mb-4">
              Real Savings on Popular Medications
            </h2>
            <p className="text-lg text-warm-600 max-w-2xl mx-auto">
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
                <Card className="h-full p-6" hover>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 text-xs font-semibold rounded-full mb-2">
                        {drug.condition}
                      </span>
                      <h3 className="font-bold text-warm-900 group-hover:text-primary-600 transition-colors">
                        {drug.name}
                      </h3>
                      <p className="text-sm text-warm-500">Generic for {drug.genericFor}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-warm-500">Retail price:</span>
                      <span className="text-warm-400 line-through">${drug.retailPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-secondary-700">Best price:</span>
                      <span className="text-2xl font-bold text-secondary-600">${drug.ourPrice}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-warm-200">
                      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-center py-2 rounded-xl font-semibold shadow-sm">
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
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mb-4">
              We Compare All Major Discount Programs
            </h2>
            <p className="text-lg text-warm-600 max-w-2xl mx-auto">
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
              <Card key={index} className="text-center" hover>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-warm-900 mb-1">{program.name}</h3>
                <p className="text-sm text-warm-500">{program.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Find Pharmacies CTA */}
      <section className="py-16 bg-warm-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-warm-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  Find Pharmacies Near You
                </h2>
                <p className="text-secondary-100 text-lg max-w-xl">
                  Use our interactive map to locate nearby pharmacies, compare prices, and get directions.
                </p>
              </div>
              <Link to="/pharmacies">
                <Button
                  size="lg"
                  className="bg-white text-secondary-700 hover:bg-secondary-50 px-8 shadow-lg whitespace-nowrap"
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
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-warm-900 mb-2 flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    Q
                  </span>
                  {faq.question}
                </h3>
                <p className="text-warm-600 ml-9">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Multilingual Support Banner */}
      <section className="py-12 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Available in 25 Languages</h2>
          <p className="text-white/90 mb-6">
            We support 25 languages to serve our diverse communities and ensure everyone can access affordable medications.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['English', 'Español', '中文', 'Tagalog', 'Tiếng Việt', 'العربية', '한국어', 'Русский', 'Français', 'हिन्दी', 'Português', 'Kreyòl', 'नेपाली', 'Kiswahili', 'Soomaali', 'བོད་སྐད', 'ကညီ', 'Maay', 'עברית', 'دری', 'မြန်မာ', 'Українська', 'Lingala', 'Brasil', 'Samoa'].map((lang, index) => (
              <span key={index} className="px-3 py-1.5 bg-white/15 rounded-full text-sm backdrop-blur-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-warm-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mb-4">
            Start Saving on Your Medications Today
          </h2>
          <p className="text-lg text-warm-600 mb-8">
            No account needed. No fees. Just search and save.
          </p>
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
