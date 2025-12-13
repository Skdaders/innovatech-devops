import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-5 pb-4">
            <div className="container text-center text-md-start">
                <div className="row text-center text-md-start">

                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 fw-bold text-success">EVENTIA</h5>
                    </div>

                    {/* Columna de Navegación */}
                    <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 fw-bold">Navegación</h5>
                        <p>
                            <Link to="/" className="text-white" style={{ textDecoration: 'none' }}>Inicio</Link>
                        </p>
                        <p>
                            <Link to="/eventos" className="text-white" style={{ textDecoration: 'none' }}>Eventos</Link>
                        </p>
                        <p>
                            <Link to="/carrito" className="text-white" style={{ textDecoration: 'none' }}>Carrito</Link>
                        </p>
                    </div>

                    {/* Columna de Cuenta */}
                    <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 fw-bold">Cuenta</h5>
                        <p>
                            <Link to="/login" className="text-white" style={{ textDecoration: 'none' }}>Iniciar Sesión</Link>
                        </p>
                        <p>
                            <Link to="/registro" className="text-white" style={{ textDecoration: 'none' }}>Registro</Link>
                        </p>
                        <p>
                            {/* Este enlace puede ir a una futura página de perfil */}
                            <Link to="/login" className="text-white" style={{ textDecoration: 'none' }}>Mis Tickets</Link>
                        </p>
                    </div>

                    {/* Contacto y Redes Sociales */}
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 fw-bold">Contacto</h5>
                        <p>
                            <i className="bi bi-geo-alt-fill me-2"></i> Santiago, Chile
                        </p>
                        <p>
                            <i className="bi bi-envelope-fill me-2"></i> contacto@eventia.cl
                        </p>
                        <p>
                            <i className="bi bi-telephone-fill me-2"></i> +56 9 1234 5678
                        </p>
                    </div>

                </div>

                <hr className="mb-4" />

                {/* Sección de Copyright y Redes Sociales */}
                <div className="row align-items-center">
                    <div className="col-md-7 col-lg-8">
                        <p>
                            © {new Date().getFullYear()} Copyright:
                            <a href="#" className="text-white" style={{ textDecoration: 'none', fontWeight: 'bold' }}> EVENTIA</a>
                        </p>
                    </div>
                    <div className="col-md-5 col-lg-4">
                        <div className="text-center text-md-end">
                            <ul className="list-unstyled list-inline">
                                <li className="list-inline-item">
                                    <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}><i className="bi bi-facebook"></i></a>
                                </li>
                                <li className="list-inline-item">
                                    <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}><i className="bi bi-twitter-x"></i></a>
                                </li>
                                <li className="list-inline-item">
                                    <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}><i className="bi bi-instagram"></i></a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;