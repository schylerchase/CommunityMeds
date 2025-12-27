import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { SearchResults } from './pages/SearchResults';
import { DrugDetails } from './pages/DrugDetails';
import { PharmacyFinder } from './pages/PharmacyFinder';

// Get base path for GitHub Pages
const basename = import.meta.env.BASE_URL;

function App() {
  return (
    <BrowserRouter basename={basename}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main id="main-content" className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/drug/:id" element={<DrugDetails />} />
            <Route path="/pharmacies" element={<PharmacyFinder />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
