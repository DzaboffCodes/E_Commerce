import {Routes, Route, Link} from 'react-router-dom'
import "./App.css";

// Import component pages
import HomePage from './components/home';
import ProductsPage from './components/products';


function App() {
  return (
    <>
      <header>
        <h1>E-Commerce Frontend</h1>

        {/* Link changes URL without full page refresh */}
        <nav>
          <Link to="/">Home</Link> | <Link to="/products">Products</Link>
        </nav>

      </header>


      {/* Routes matches current URL and chooses which page component to render */}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/products' element={<ProductsPage />} />
      </Routes>
    </>
  );
}

export default App;
