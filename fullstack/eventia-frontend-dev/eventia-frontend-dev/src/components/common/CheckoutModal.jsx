import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(price);
};

const CheckoutModal = ({ cartItems, total, onClose, onConfirmPurchase }) => {
    const [paymentMethod, setPaymentMethod] = useState(''); // 'card' o 'presencial'
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    const [showQR, setShowQR] = useState(false);

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const serviceFee = Math.round(subtotal * 0.05);
    const finalTotal = subtotal + serviceFee;

    // Generar datos para el QR en formato legible simple
    const generateQRData = () => {
        const orderId = `ORD-${Date.now()}`;
        
        // Formato simple y legible sin JSON
        let qrText = `EVENTIA - COMPRA\n`;
        qrText += `Orden: ${orderId}\n\n`;
        
        // Información de cada evento
        cartItems.forEach((item, index) => {
            qrText += `EVENTO ${index + 1}:\n`;
            qrText += `${item.title}\n`;
            qrText += `Entradas: ${item.quantity}\n`;
            qrText += `Precio: ${formatPrice(item.price)}\n`;
            if (index < cartItems.length - 1) {
                qrText += `\n---\n\n`;
            }
        });
        
        qrText += `\nTOTAL: ${formatPrice(finalTotal)}`;
        
        return qrText;
    };

    // Formatear datos del QR para mostrar de forma legible
    const formatQRDataForDisplay = () => {
        const orderId = `ORD-${Date.now()}`;
        const date = new Date().toLocaleString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            orderId,
            date,
            items: cartItems.map(item => ({
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            })),
            subtotal,
            serviceFee,
            total: finalTotal
        };
    };

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\s/g, '');
        if (value.length <= 16) {
            value = value.match(/.{1,4}/g)?.join(' ') || value;
            setCardData({ ...cardData, cardNumber: value });
        }
    };

    const handleExpiryDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 4) {
            value = value.match(/.{1,2}/g)?.join('/') || value;
            setCardData({ ...cardData, expiryDate: value });
        }
    };

    const handleCvvChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 3) {
            setCardData({ ...cardData, cvv: value });
        }
    };

    const handleConfirmCardPayment = () => {
        // Validar datos de tarjeta
        if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
            Swal.fire('Error', 'Por favor ingresa un número de tarjeta válido (16 dígitos)', 'error');
            return;
        }
        if (!cardData.cardHolder || cardData.cardHolder.length < 3) {
            Swal.fire('Error', 'Por favor ingresa el nombre del titular de la tarjeta', 'error');
            return;
        }
        if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
            Swal.fire('Error', 'Por favor ingresa una fecha de vencimiento válida (MM/AA)', 'error');
            return;
        }
        if (!cardData.cvv || cardData.cvv.length !== 3) {
            Swal.fire('Error', 'Por favor ingresa un CVV válido (3 dígitos)', 'error');
            return;
        }

        // Confirmar pago con tarjeta
        Swal.fire({
            title: 'Procesando pago...',
            text: 'Por favor espera mientras procesamos tu pago',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Simular procesamiento de pago
        setTimeout(() => {
            Swal.close();
            onConfirmPurchase('tarjeta');
        }, 2000);
    };

    const handlePresencialPayment = () => {
        setShowQR(true);
    };

    const handleConfirmPresencialPayment = () => {
        onConfirmPurchase('presencial');
    };

    return (
        <div 
            className="modal fade show d-block" 
            tabIndex="-1" 
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content cart-card-transparent border-0">
                    <div className="modal-header border-bottom border-secondary">
                        <h5 className="modal-title">
                            <i className="bi bi-credit-card me-2"></i>
                            Método de pago
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        {!showQR ? (
                            <>
                                {/* Resumen de compra */}
                                <div className="card mb-4 cart-card-transparent">
                                    <div className="card-body">
                                        <h6 className="mb-3">Resumen de compra</h6>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted small">Cargo por servicio (5%)</span>
                                            <span className="small">{formatPrice(serviceFee)}</span>
                                        </div>
                                        <hr className="opacity-25" />
                                        <div className="d-flex justify-content-between">
                                            <strong>Total</strong>
                                            <strong className="text-primary" style={{ fontSize: '1.2rem' }}>
                                                {formatPrice(finalTotal)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Selección de método de pago */}
                                <div className="mb-4">
                                    <h6 className="mb-3">Selecciona tu método de pago</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div
                                                className={`card payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                                                onClick={() => setPaymentMethod('card')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="card-body text-center">
                                                    <i className="bi bi-credit-card-2-front" style={{ fontSize: '3rem', color: 'var(--color-primary)' }}></i>
                                                    <h6 className="mt-3">Tarjeta de crédito/débito</h6>
                                                    <small className="text-muted">Pago seguro en línea</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div
                                                className={`card payment-method-card ${paymentMethod === 'presencial' ? 'selected' : ''}`}
                                                onClick={() => setPaymentMethod('presencial')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="card-body text-center">
                                                    <i className="bi bi-cash-coin" style={{ fontSize: '3rem', color: 'var(--color-primary)' }}></i>
                                                    <h6 className="mt-3">Pago presencial</h6>
                                                    <small className="text-muted">Paga al momento de retirar</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Formulario de tarjeta */}
                                {paymentMethod === 'card' && (
                                    <div className="card cart-card-transparent">
                                        <div className="card-body">
                                            <h6 className="mb-3">
                                                <i className="bi bi-shield-lock me-2"></i>
                                                Datos de la tarjeta
                                            </h6>
                                            <div className="mb-3">
                                                <label className="form-label">Número de tarjeta</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={cardData.cardNumber}
                                                    onChange={handleCardNumberChange}
                                                    maxLength="19"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Titular de la tarjeta</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="NOMBRE APELLIDO"
                                                    value={cardData.cardHolder}
                                                    onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                                                />
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Fecha de vencimiento</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="MM/AA"
                                                        value={cardData.expiryDate}
                                                        onChange={handleExpiryDateChange}
                                                        maxLength="5"
                                                    />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">CVV</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="123"
                                                        value={cardData.cvv}
                                                        onChange={handleCvvChange}
                                                        maxLength="3"
                                                    />
                                                </div>
                                            </div>
                                            <div className="alert alert-info small mb-0">
                                                <i className="bi bi-info-circle me-2"></i>
                                                Tus datos están protegidos con encriptación SSL
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Información de pago presencial */}
                                {paymentMethod === 'presencial' && (
                                    <div className="card cart-card-transparent">
                                        <div className="card-body text-center">
                                            <i className="bi bi-info-circle text-primary" style={{ fontSize: '3rem' }}></i>
                                            <h6 className="mt-3">Pago presencial</h6>
                                            <p className="text-muted">
                                                Podrás realizar el pago al momento de retirar tus tickets en nuestras oficinas o puntos de venta autorizados.
                                            </p>
                                            <p className="mb-0">
                                                <strong>Se generará un código QR</strong> que deberás presentar al momento del pago.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Vista de QR para pago presencial */
                            <div className="text-center">
                                <h5 className="mb-4">Código QR de compra</h5>
                                <div className="card cart-card-transparent d-inline-block p-4 mb-4">
                                    <QRCodeSVG
                                        value={generateQRData()}
                                        size={256}
                                        level="M"
                                        includeMargin={true}
                                    />
                                </div>
                                
                                {/* Información del comprobante formateada */}
                                {(() => {
                                    const displayData = formatQRDataForDisplay();
                                    return (
                                        <div className="card cart-card-transparent mb-4">
                                            <div className="card-body text-start">
                                                <h6 className="mb-3">
                                                    <i className="bi bi-receipt me-2"></i>
                                                    Información del comprobante
                                                </h6>
                                                <div className="mb-3">
                                                    <strong>Número de orden:</strong> {displayData.orderId}
                                                </div>
                                                <div className="mb-3">
                                                    <strong>Fecha:</strong> {displayData.date}
                                                </div>
                                                <div className="mb-3">
                                                    <strong>Eventos:</strong>
                                                    <ul className="mt-2 mb-0">
                                                        {displayData.items.map((item, index) => (
                                                            <li key={index} className="mb-2">
                                                                {item.title}<br />
                                                                <small className="text-muted">
                                                                    Cantidad: {item.quantity} | 
                                                                    Precio unitario: {formatPrice(item.price)} | 
                                                                    Subtotal: {formatPrice(item.subtotal)}
                                                                </small>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <hr className="opacity-25" />
                                                <div className="mb-2">
                                                    <strong>Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}):</strong> {formatPrice(displayData.subtotal)}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>Cargo por servicio (5%):</strong> {formatPrice(displayData.serviceFee)}
                                                </div>
                                                <div className="mb-0">
                                                    <strong className="text-primary" style={{ fontSize: '1.1rem' }}>
                                                        Total a pagar: {formatPrice(displayData.total)}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                
                                <div className="card cart-card-transparent mb-4">
                                    <div className="card-body text-start">
                                        <h6 className="mb-3">Instrucciones:</h6>
                                        <ol className="mb-0">
                                            <li>Guarda este código QR en tu dispositivo</li>
                                            <li>Acude a nuestras oficinas o puntos de venta autorizados</li>
                                            <li>Presenta el código QR al momento del pago</li>
                                            <li>Recibirás tus tickets después del pago</li>
                                        </ol>
                                    </div>
                                </div>
                                <div className="alert alert-warning">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    <strong>Importante:</strong> Este código QR es válido por 48 horas. Después de ese tiempo, deberás generar uno nuevo.
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer border-top border-secondary">
                        {!showQR ? (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </button>
                                {paymentMethod === 'card' && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleConfirmCardPayment}
                                    >
                                        <i className="bi bi-lock-fill me-2"></i>
                                        Confirmar pago
                                    </button>
                                )}
                                {paymentMethod === 'presencial' && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handlePresencialPayment}
                                    >
                                        <i className="bi bi-qr-code me-2"></i>
                                        Generar código QR
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowQR(false)}
                                >
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Volver
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleConfirmPresencialPayment}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    Confirmar compra
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;

