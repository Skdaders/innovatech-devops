import React from 'react';
import { Link } from 'react-router-dom';

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(price);
};

const Cart = ({ cartItems, onRemoveFromCart, onCheckout, onUpdateQuantity }) => {
    // Calcula el precio total
    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = totalPrice;
    const serviceFee = Math.round(totalPrice * 0.05); // 5% de cargo por servicio
    const finalTotal = subtotal + serviceFee;

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            onRemoveFromCart(itemId);
        } else {
            onUpdateQuantity(itemId, newQuantity);
        }
    };

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-12 mb-4">
                    <h2 className="mb-2">
                        <i className="bi bi-cart-check me-2"></i>
                        Carrito de compras
                    </h2>
                    {cartItems.length > 0 && (
                        <p className="text-muted mb-0">
                            {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} en tu carrito
                        </p>
                    )}
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div className="card border-0 shadow-lg cart-card-transparent">
                    <div className="card-body text-center py-5">
                        <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.6 }}>
                            <i className="bi bi-cart-x"></i>
                        </div>
                        <h4 className="mb-3">Tu carrito está vacío</h4>
                        <p className="text-muted mb-4">
                            Parece que aún no has agregado ningún evento a tu carrito.
                        </p>
                        <Link to="/eventos" className="btn btn-primary btn-lg">
                            <i className="bi bi-arrow-left me-2"></i>
                            Explorar eventos
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {/* Lista de Items */}
                    <div className="col-lg-8 mb-4">
                        <div className="card border-0 shadow-lg cart-card-transparent">
                            <div className="card-body p-0">
                                {cartItems.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className="cart-item p-4"
                                        style={{
                                            borderBottom: index < cartItems.length - 1 ? '1px solid rgba(128, 128, 128, 0.2)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div className="row align-items-center">
                                            {/* Imagen */}
                                            <div className="col-md-3 mb-3 mb-md-0">
                                                <div className="position-relative" style={{ 
                                                    borderRadius: '10px',
                                                    overflow: 'hidden',
                                                    background: 'rgba(0, 0, 0, 0.1)'
                                                }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-100"
                                                        style={{
                                                            height: '140px',
                                                            objectFit: 'cover',
                                                            display: 'block'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Información del Item */}
                                            <div className="col-md-5 mb-3 mb-md-0">
                                                <h5 className="mb-2">
                                                    {item.title}
                                                </h5>
                                                <div className="d-flex align-items-center mb-2">
                                                    <span className="badge bg-primary bg-opacity-25 text-primary border border-primary">
                                                        <i className="bi bi-tag me-1"></i>
                                                        {item.category}
                                                    </span>
                                                </div>
                                                <p className="text-muted mb-0 small">
                                                    Precio unitario: {formatPrice(item.price)}
                                                </p>
                                            </div>

                                            {/* Controles de Cantidad y Precio */}
                                            <div className="col-md-4">
                                                <div className="d-flex flex-column align-items-md-end">
                                                    {/* Controles de Cantidad */}
                                                    <div className="d-flex align-items-center mb-3 mb-md-2">
                                                        <label className="me-2 small text-muted">Cantidad:</label>
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                            >
                                                                <i className="bi bi-dash"></i>
                                                            </button>
                                                            <span 
                                                                className="btn btn-sm bg-primary bg-opacity-10 text-primary border border-primary"
                                                                style={{
                                                                    minWidth: '50px',
                                                                    borderLeft: 'none',
                                                                    borderRight: 'none',
                                                                    pointerEvents: 'none'
                                                                }}
                                                            >
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                            >
                                                                <i className="bi bi-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Precio Total del Item */}
                                                    <div className="mb-2">
                                                        <strong className="text-primary" style={{ fontSize: '1.2rem' }}>
                                                            {formatPrice(item.price * item.quantity)}
                                                        </strong>
                                                    </div>

                                                    {/* Botón Eliminar */}
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => onRemoveFromCart(item.id)}
                                                        style={{ fontSize: '0.85rem' }}
                                                    >
                                                        <i className="bi bi-trash me-1"></i>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Botón Continuar Comprando */}
                        <div className="mt-3">
                            <Link to="/eventos" className="btn btn-outline-primary">
                                <i className="bi bi-arrow-left me-2"></i>
                                Continuar comprando
                            </Link>
                        </div>
                    </div>

                    {/* Resumen de Compra */}
                    <div className="col-lg-4">
                        <aside className="card border-0 shadow-lg cart-card-transparent cart-summary-sticky">
                            <div className="card-header bg-primary bg-opacity-10 border-bottom border-primary border-opacity-25">
                                <h5 className="mb-0">
                                    <i className="bi bi-receipt me-2"></i>
                                    Resumen de compra
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Cargo por servicio (5%)
                                    </span>
                                    <span className="small">{formatPrice(serviceFee)}</span>
                                </div>
                                <hr className="opacity-25" />
                                <div className="d-flex justify-content-between mb-4">
                                    <strong style={{ fontSize: '1.2rem' }}>Total</strong>
                                    <strong className="text-primary" style={{ fontSize: '1.3rem' }}>
                                        {formatPrice(finalTotal)}
                                    </strong>
                                </div>

                                <button
                                    className="btn btn-primary w-100 btn-lg mb-3"
                                    onClick={onCheckout}
                                    style={{
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    <i className="bi bi-credit-card me-2"></i>
                                    Finalizar compra
                                </button>

                                <div className="text-center">
                                    <small className="text-muted">
                                        <i className="bi bi-shield-check me-1"></i>
                                        Compra 100% segura
                                    </small>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;