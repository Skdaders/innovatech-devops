import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ events, isLoggedIn }) => {

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <h1 className="display-6 mb-3">Bienvenid@ a Eventia</h1>
                    <img
                        src="/Eventia.png"
                        alt="Eventia Logo"
                        className="img-fluid d-block mx-auto mb-0"
                        style={{ height: 'auto' }}
                    />
                    <p className="lead mt-0 mb-4">
                        Tu destino para encontrar los mejores eventos independientes y mainstream.
                        Desde conciertos hasta obras de teatro, todo en un solo lugar.
                    </p>

                    <div className="mb-5">
                        <Link to="/registro" className="btn btn-success btn-lg">
                            Crea tu cuenta gratis
                        </Link>
                    </div>

                    <div className="mb-2 fs-2 fw-bold">
                        EVENTOS DESTACADOS
                    </div>

                    <div
                        id="eventsCarousel"
                        className="carousel slide"
                        data-bs-ride="carousel"
                        style={{ height: '300px', maxWidth: '500px', margin: '0 auto', backgroundColor: '#000000ff' }}
                    >
                        {/* Indicadores (sin cambios) */}
                        <div className="carousel-indicators">
                            {events.map((event, index) => (
                                <button
                                    key={event.id}
                                    type="button"
                                    data-bs-target="#eventsCarousel"
                                    data-bs-slide-to={index}
                                    className={index === 0 ? 'active' : ''}
                                    aria-current={index === 0 ? 'true' : 'false'}
                                    aria-label={`Slide ${index + 1}`}
                                ></button>
                            ))}
                        </div>

                        {/* Contenedor de las imágenes */}
                        <div className="carousel-inner rounded h-100"> {/* Añadimos h-100 para que ocupe toda la altura del padre */}
                            {events.map((event, index) => (
                                <div key={event.id} className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`}>
                                    <img
                                        src={event.image}
                                        // 2. AJUSTE DE IMAGEN: Añadimos 'object-fit-contain'
                                        className="d-block w-100 h-100 object-fit-contain"
                                        alt={event.title}
                                    />

                                    <div
                                        className="carousel-caption d-none d-md-block "
                                        style={{ top: 0, bottom: 'auto', paddingTop: '1.25rem' }}
                                    >

                                        <h5 className='bg-light bg-opacity-75' >
                                            {event.title}
                                        </h5>
                                    </div>
                                </div>

                            ))}

                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#eventsCarousel" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#eventsCarousel" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                    <div className="row g-4 py-4">
                        <div className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">Eventos</h5>
                                    <p className="card-text">Explora nuestra selección de eventos destacados.</p>
                                    <Link to="/eventos" className="btn btn-primary">Ver Eventos</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">Próximamente</h5>
                                    <p className="card-text">Descubre los eventos que están por venir.</p>
                                    <button className="btn btn-secondary" disabled>Muy Pronto</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">Mis Tickets</h5>
                                    <p className="card-text">Gestiona tus entradas y reservas.</p>
                                    <Link to="/login" className="btn btn-primary">Ver mis Tickets</Link>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;