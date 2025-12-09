import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; //Importa SweetAlert2

function RegistrationForm() {
    const navigate = useNavigate();
    // Estado para manejar todos los campos del formulario en un solo objeto
    const [formData, setFormData] = useState({
        rut: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        genero: '',
        ciudad: '',
        celular: '',
        email: '',
        password: ''
    });

    // ESTADO PARA ERRORES
    const [errors, setErrors] = useState({});

    // Función para manejar los cambios en cualquier input del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Limpia error del campo si el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    // FUNCIÓN DE VALIDACIÓN DEL FORMULARIO
    const validateForm = () => {
        let newErrors = {}; // Esta es la variable local
        let isValid = true;

        //  Validar Nombres
        if (!formData.nombres.trim()) {
            newErrors.nombres = 'Los nombres son obligatorios.';
            isValid = false;
        }

        // Validar Apellidos
        if (!formData.apellidos.trim()) {
            newErrors.apellidos = 'Los apellidos son obligatorios.';
            isValid = false;
        }

        // Validar RUT Chileno
        const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/;
        if (!formData.rut.trim()) {
            newErrors.rut = 'El RUT es obligatorio.';
            isValid = false;
        } else if (!rutRegex.test(formData.rut.trim())) {
            newErrors.rut = 'Formato de RUT inválido (ej: 12.345.678-9).';
            isValid = false;
        }

        // Validar Fecha de Nacimiento
        if (!formData.fechaNacimiento) {
            newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
            isValid = false;
        } else {
            const today = new Date();
            const birthDate = new Date(formData.fechaNacimiento);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                newErrors.fechaNacimiento = 'Debes ser mayor de 18 años para registrarte.';
                isValid = false;
            }
        }

        // Validar Género
        if (!formData.genero) {
            newErrors.genero = 'Debes seleccionar un género.';
            isValid = false;
        }

        // Validar Ciudad
        if (!formData.ciudad.trim()) {
            newErrors.ciudad = 'La ciudad es obligatoria.';
            isValid = false;
        }

        //  Validar Celular
        const celularRegex = /^[9]\d{8}$/; // formato chileno después del +56
        if (!formData.celular.trim()) {
            newErrors.celular = 'El número de celular es obligatorio.';
            isValid = false;
        } else if (!celularRegex.test(formData.celular.trim())) {
            newErrors.celular = 'El celular debe tener 9 dígitos y empezar con 9.';
            isValid = false;
        }

        // Validar Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio.';
            isValid = false;
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = 'El formato del email es inválido.';
            isValid = false;
        }

        //  Validar Contraseña
        if (!formData.password.trim()) {
            newErrors.password = 'La contraseña es obligatoria.';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
            isValid = false;
        }

        setErrors(newErrors); // Actualiza el estado 'errors' con los nuevos errores
        return isValid;
    };

    // lógica de validación y envío
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) { // validateForm() ya actualiza el estado 'errors'
            // Si la validación pasa, aquí se "enviarían" los datos
            /*console.log('Formulario enviado con éxito:', formData);
            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: 'Tu cuenta ha sido creada correctamente.',
                showConfirmButton: false,
                timer: 2500 // El mensaje desaparecerá después de 2.5 segundos
            }).then(() => {
                navigate('/'); 
            });*/

            try {
                const response = await fetch("http://localhost:8081/api/usuarios/registro", {
                    method: "POST", 
                    headers: {
                        "Content-Type": "application/json"
                    }, 
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorData = await response.json(); 
                    throw new Error(errorData.error || 'Error al registrar usuario');
                }

                const data = await response.json(); 

                Swal.fire({
                    icon: 'success', 
                    title: '¡Registro exitoso!', 
                    text: data.mensaje || 'Tu información ha sido guardada.'
                });

                navigate('/');
            
            } catch (error) {
                console.error ("Error:", error); 

                Swal.fie({
                    icon: 'error', 
                    title: 'Error en el registro', 
                    text: error.message
                });
            }

        } else {
            // Si hay errores, muestra SweetAlert2 de error
            console.log('Errores en el formulario:', errors); // Usamos el estado 'errors'

            // Construir una lista HTML de errores usando el estado 'errors'
            const errorList = Object.values(errors).filter(Boolean).map((error, index) => (
                `<li key=${index}>${error}</li>`
            )).join('');

            Swal.fire({
                icon: 'error',
                title: '¡Errores de Validación!',
                html: `Por favor, corrige los siguientes problemas:<ul style="text-align: left; margin-top: 10px;">${errorList}</ul>`,
                confirmButtonText: 'Entendido',
                customClass: {
                    container: 'my-swal-container',
                    popup: 'my-swal-popup',
                }
            });
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    <div className="card shadow-sm p-4">
                        <h2 className="text-center mb-4">Crear Cuenta</h2>
                        <form onSubmit={handleSubmit} noValidate>
                            {/* --- INFORMACIÓN PERSONAL --- */}
                            <fieldset className="border p-3 mb-4">
                                <legend className="w-auto px-2 h5">1. Información Personal</legend>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="nombres" className="form-label">Nombres</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.nombres ? 'is-invalid' : ''}`} // Clase para error
                                            id="nombres"
                                            name="nombres"
                                            value={formData.nombres}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.nombres && <div className="invalid-feedback">{errors.nombres}</div>} {/* Mensaje de error */}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="apellidos" className="form-label">Apellidos</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                                            id="apellidos"
                                            name="apellidos"
                                            value={formData.apellidos}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.apellidos && <div className="invalid-feedback">{errors.apellidos}</div>}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="rut" className="form-label">RUT</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.rut ? 'is-invalid' : ''}`}
                                        id="rut"
                                        name="rut"
                                        placeholder="12.345.678-9"
                                        value={formData.rut}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            className={`form-control ${errors.fechaNacimiento ? 'is-invalid' : ''}`}
                                            id="fechaNacimiento"
                                            name="fechaNacimiento"
                                            value={formData.fechaNacimiento}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.fechaNacimiento && <div className="invalid-feedback">{errors.fechaNacimiento}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="genero" className="form-label">Género</label>
                                        <select
                                            className={`form-select ${errors.genero ? 'is-invalid' : ''}`}
                                            id="genero"
                                            name="genero"
                                            value={formData.genero}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="" disabled>Seleccionar...</option>
                                            <option value="femenino">Femenino</option>
                                            <option value="masculino">Masculino</option>
                                            <option value="no-binario">No binario</option>
                                            <option value="otro">Otro</option>
                                            <option value="no-especificar">Prefiero no decir</option>
                                        </select>
                                        {errors.genero && <div className="invalid-feedback">{errors.genero}</div>}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="ciudad" className="form-label">Ciudad</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.ciudad ? 'is-invalid' : ''}`}
                                        id="ciudad"
                                        name="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.ciudad && <div className="invalid-feedback">{errors.ciudad}</div>}
                                </div>
                            </fieldset>

                            {/* --- 2. INFORMACIÓN DE CONTACTO --- */}
                            <fieldset className="border p-3 mb-4">
                                <legend className="w-auto px-2 h5">2. Información de Contacto</legend>

                                <div className="mb-3">
                                    <label htmlFor="celular" className="form-label">Celular</label>
                                    <div className="input-group">
                                        <span className="input-group-text">+56</span>
                                        <input
                                            type="tel"
                                            className={`form-control ${errors.celular ? 'is-invalid' : ''}`}
                                            id="celular"
                                            name="celular"
                                            placeholder="9 1234 5678"
                                            value={formData.celular}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.celular && <div className="invalid-feedback">{errors.celular}</div>}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                            </fieldset>

                            {/* --- 3. INFORMACIÓN DE SEGURIDAD --- */}
                            <fieldset className="border p-3 mb-4">
                                <legend className="w-auto px-2 h5">3. Información de Seguridad</legend>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>
                            </fieldset>

                            <div className="d-grid">
                                <button type="submit" className="btn btn-primary btn-lg">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegistrationForm;