import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ cartItemCount, isLoggedIn }) => {
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">EVENTIA <i class="bi bi-ticket-perforated"></i></Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                                to="/"
                            >
                                Inicio  <i class="bi bi-house" me-2></i>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${location.pathname === '/eventos' ? 'active' : ''}`}
                                to="/eventos"
                            >
                                Eventos <i class="bi bi-calendar-event" me-2></i>
                            </Link>
                        </li>

                        {!isLoggedIn && (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                                        to="/login">Iniciar Sesión <i class="bi bi-box-arrow-in-left" me-2></i></Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/registro' ? 'active' : ''}`}
                                        to="/registro">Registro <i class="bi bi-person-plus" me-2></i></Link>
                                </li>
                            </>
                        )}

                        <li className="nav-item">

                            <Link className={`nav-link ${location.pathname === '/carrito' ? 'active' : ''}`} to="/carrito">
                                Carrito <i class="bi bi-cart" me-2></i>
                                {cartItemCount > 0 && (
                                    <span className="badge bg-danger ms-1">{cartItemCount}</span>
                                )}

                            </Link>

                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;