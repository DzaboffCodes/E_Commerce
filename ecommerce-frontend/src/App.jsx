import {Routes, Route, Link} from 'react-router-dom'
import "./App.css";

// Import component pages
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './components/home';
import ProductsPage from './components/products';
import NotFoundPage from './components/not_found';


function App() {
  return (
    <>
      <Header />

      {/* Routes matches current URL and chooses which page component to render */}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/products' element={<ProductsPage />} />
        {/* Catch all route for bad URLs */}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
