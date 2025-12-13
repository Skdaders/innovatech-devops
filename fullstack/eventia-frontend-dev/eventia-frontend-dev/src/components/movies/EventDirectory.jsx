import React, { useState } from 'react';

const EventDirectory = ({ events, onAddToCart }) => {

    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortOrder, setSortOrder] = useState('none');

    // Obtener categorías únicas
    const categories = ['Todos', ...new Set(events.map(event => event.category))];

    // Filtrar eventos basado en todos los criterios
    const filteredEvents = events
        .filter(event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === 'Todos' || event.category === selectedCategory) &&
            (maxPrice === '' || event.price <= parseInt(maxPrice))
        )
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.price - b.price;
            } else if (sortOrder === 'desc') {
                return b.price - a.price;
            }
            return 0;
        });

    // Función para formatear precio
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="container py-4">
            {/* Filtros */}
            <div className="row mb-4">
                {/* Primera fila de filtros */}
                <div className="col-12 col-md-6 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-6 mb-3">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'Todos' ? 'Todas las categorías' : category}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Segunda fila de filtros */}
                <div className="col-12 col-md-6 mb-3">
                    <div className="input-group">
                        <span className="input-group-text">Precio máximo $</span>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Ej: 50000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min="0"
                            step="1000"
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6 mb-3">
                    <select
                        className="form-select"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="none">Ordenar por precio</option>
                        <option value="asc">Menor a mayor precio</option>
                        <option value="desc">Mayor a menor precio</option>
                    </select>
                </div>
            </div>

            {/* Lista de eventos */}
            <div className="row">
                <div className="col-12">
                    {filteredEvents.length === 0 ? (
                        <div className="alert alert-info text-center">
                            No se encontraron eventos.
                        </div>
                    ) : (
                        <div className="list-group">
                            {filteredEvents.map(event => (
                                <div key={event.id} className="list-group-item">
                                    <div className="row align-items-center">
                                        {/* Imagen del evento */}
                                        <div className="col-12 col-md-3 mb-3 mb-md-0">
                                            <img
                                                src={event.image}
                                                alt={event.title}
                                                className="img-fluid rounded"
                                            />
                                        </div>
                                        {/* Detalles del evento */}
                                        <div className="col-12 col-md-7">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h5 className="mb-1">{event.title}</h5>
                                                <span className="badge bg-primary rounded-pill">
                                                    {event.category}
                                                </span>
                                            </div>
                                            <p className="mb-1">
                                                <span className="h5 text-success">
                                                    {formatPrice(event.price)}
                                                </span>
                                            </p>
                                            <p className="mb-1 text-muted">
                                                {event.description}
                                            </p>
                                            <small className="text-muted">
                                                <i className="bi bi-people-fill"></i> {event.interested} interesados
                                            </small>
                                        </div>
                                        {/* Botón de compra */}
                                        <div className="col-12 col-md-2 text-end">
                                            {/* Llama a la función onAddToCart con el evento actual al hacer clic */}
                                            <button className="btn btn-primary" onClick={() => onAddToCart(event)}>
                                                Comprar Ticket
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDirectory;