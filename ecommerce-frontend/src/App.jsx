import {Routes, Route, Link} from 'react-router-dom'
import "./App.css";

// Import component pages
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './components/Home';
import ProductsPage from './components/Products';
import NotFoundPage from './components/Not_found';
import RegisterPage from './components/Register';
import LoginPage from './components/Login';


function App() {
  return (
    <>
      <Header />

      {/* Routes matches current URL and chooses which page component to render */}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/products' element={<ProductsPage />} />
        <Route path='/register' element={<RegisterPage />}/>
        <Route path='/login' element={<LoginPage />}/>
        {/* Catch all route for bad URLs */}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
