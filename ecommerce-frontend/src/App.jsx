import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import "./App.css";

// Import component pages
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProductsPage from './components/Products';
import NotFoundPage from './components/Not_found';
import RegisterPage from './components/Register';
import LoginPage from './components/Login';
import ProductDetailsPage from './components/ProductDetailsPage';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import ProfilePage from './components/ProfilePage';
import CheckoutPage from './components/CheckoutPage';
import OrderPayPage from './components/OrderPayPage';


function App() {
  // Add user state to show logged in user
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include"
        })
        const data = await response.json();
        
        if (response.ok) {
          setUser(data?.data?.user || null);
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setAuthChecked(true);
      }
    };
    checkSession();
  }, []);

  if (!authChecked) {
    return <div>Checking session...</div>
  }

  return (
    <>
      <Header user={user} setUser={setUser}/>

      {/* Routes matches current URL and chooses which page component to render */}
      <Routes>
        <Route path='/' element={<ProductsPage user={user} />} />
        <Route path='/products' element={<ProductsPage user={user} />} />
        <Route path='/products/:id' element={<ProductDetailsPage user={user}/>} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage setUser={setUser} />} />
        <Route path='/profile' element={<ProfilePage user={user} setUser={setUser} />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/orders' element={<OrdersPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/orders/:id/pay' element={<OrderPayPage />} />
        {/* Catch all route for bad URLs */}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
