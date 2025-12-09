import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import EventDirectory from './components/movies/EventDirectory';
import Home from './components/common/Home';
import Navigation from './components/common/Navigation';
import Footer from './components/common/Footer';
import RegistrationForm from './components/auth/RegistrationForm.jsx';
import Login from './components/auth/Login';
import Cart from './components/common/Cart';

function App() {

  // Datos de eventos
  const eventsData = [
    {
      id: 1,
      title: "Taylor Swift - The Eras Tour",
      price: 75000,
      description: "La gira más exitosa de todos los tiempos llega a Argentina. Un viaje musical a través de todas las eras de Taylor Swift.",
      interested: "45.2K",
      image: "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/1ee66645-dcba-45bd-8fe9-d28b15b14bb0/compose?",
      category: "Concierto"
    },
    {
      id: 2,
      title: "Boca vs River - Superclásico",
      price: 45000,
      description: "El partido más importante del fútbol argentino. La Bombonera vibra con el superclásico del fútbol sudamericano.",
      interested: "32.1K",
      image: "https://assets-us-01.kc-usercontent.com/31dbcbc6-da4c-0033-328a-d7621d0fa726/b613c867-9989-46f0-8580-36d77c59097f/Diseño%20sin%20título.png",
      category: "Deporte"
    },
    {
      id: 3,
      title: "Hamlet - Teatro Colón",
      price: 28000,
      description: "La obra maestra de Shakespeare cobra vida en el prestigioso Teatro Colón con un elenco de primer nivel.",
      interested: "3.8K",
      image: "https://media.ambito.com/p/a0260bef155ddf44203572e1a4cea3cf/adjuntos/239/imagenes/029/649/0029649034/1200x675/smart/la-tragedia-hamlet-musical.jpg",
      category: "Teatro"
    },
    {
      id: 4,
      title: "Oppenheimer - IMAX",
      price: 4500,
      description: "La película más aclamada del año en formato IMAX. La historia del padre de la bomba atómica.",
      interested: "12.4K",
      image: "https://images.ctfassets.net/c4ucztjx9pmu/SgeKDtMMcCxj70L05vLLf/cef81a871b6c862a1b2c73cb7d226b0b/OPPEN007_Updated_Exclusive_Art_2025x300px_V1_R1.jpg",
      category: "Cine"
    },
    {
      id: 5,
      title: "Luis Miguel - Tour 2025",
      price: 65000,
      description: "El Sol de México regresa con un espectacular show que recorre sus mayores éxitos.",
      interested: "28.9K",
      image: "https://images.sk-static.com/images/media/profile_images/artists/434434/huge_avatar",
      category: "Concierto"
    },
    {
      id: 6,
      title: "Festival Lollapalooza 2025",
      price: 85000,
      description: "Tres días de música non-stop con los mejores artistas internacionales y nacionales.",
      interested: "89.3K",
      image: "https://s.13.cl/sites/default/files/styles/manualcrop_1600x800/public/programas/articulos/field-imagen/2023-11/lollapalooza-chile-edicion-2024.jpg.jpeg?itok=bZpDl1mj",
      category: "Festival"
    },
    {
      id: 7,
      title: "Copa Davis - Argentina vs España",
      price: 35000,
      description: "Cuartos de final de la Copa Davis. Argentina busca su segundo título en casa.",
      interested: "15.7K",
      image: "https://media.tycsports.com/files/2020/11/11/136783/copa-davis-argentina-vs-espana_862x485.jpg",
      category: "Deporte"
    },
    {
      id: 8,
      title: "Cirque du Soleil - Crystal",
      price: 42000,
      description: "El espectáculo más mágico del mundo presenta su nueva producción llena de acrobacias imposibles.",
      interested: "21.6K",
      image: "https://m.media-amazon.com/images/M/MV5BYThlMjBlOWEtMjU0OS00MjczLWE1ZTgtNDA3ZmQzZmZiY2U2XkEyXkFqcGc@._V1_FMjpg_UX735_.jpg",
      category: "Circo"
    }
  ];

  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleAddToCart = (eventToAdd) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === eventToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === eventToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...eventToAdd, quantity: 1 }];
      }
    });
    console.log("Evento añadido/actualizado en el carrito:", eventToAdd.title);
  };

  // FUNCIÓN PARA ELIMINAR ITEMS CON CONFIRMACIÓN DE SWEETALERT2
  const handleRemoveFromCart = (eventIdToRemove) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "El evento se eliminará de tu carrito.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      // Si el usuario confirma la acción
      if (result.isConfirmed) {
        setCartItems(prevItems =>
          prevItems.filter(item => item.id !== eventIdToRemove)
        );
        // Pequeña notificación de éxito
        Swal.fire(
          '¡Eliminado!',
          'El evento ha sido eliminado.',
          'success'
        )
        console.log("Evento eliminado del carrito, ID:", eventIdToRemove);
      }
    });
  };

  // FINALIZAR COMPRA
  const handleCheckout = () => {
    Swal.fire({
      title: '¿Confirmar compra?',
      text: `Estás a punto de finalizar la compra de ${cartItems.reduce((total, item) => total + item.quantity, 0)} tickets por un total de ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Sí, ¡finalizar compra!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Vacia el carrito
        setCartItems([]);
        // Muestra mensaje de éxito
        Swal.fire(
          '¡Compra Exitosa!',
          'Tus tickets han sido comprados. ¡Disfruta el evento!',
          'success'
        );
        console.log("Compra finalizada con éxito.");
      }
    });
  };

  //Funcion de Autenticación

  const handleLogin = () => {
    setIsLoggedIn(true);

  };

  return (
    <Router>
      <div className="Ticketera">
        <Navigation cartItemCount={cartItems.length} />
        <main>
          <Routes>
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} events={eventsData} />} />
            <Route path="/eventos" element={<EventDirectory events={eventsData} onAddToCart={handleAddToCart} />} />
            <Route path="/registro" element={<RegistrationForm />} />
            <Route path="/carrito" element={<Cart cartItems={cartItems}
              onRemoveFromCart={handleRemoveFromCart} onCheckout={handleCheckout} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;