const odbc = require('odbc');
const path = require('path');
const Swal = require('sweetalert2');
const conexion = 'DSN=recursos'; // Asegúrate de tener configurado el DSN correctamente

async function verificarDPI(dpi) {
    try {
        const connection = await odbc.connect(conexion);
        const result = await connection.query(`SELECT
                                                    personal.Id, 
                                                    CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto, 
                                                    personal.Id_Departamento, 
                                                    departamentos.Nombre, 
                                                    puestos_general.Id_Puesto,
                                                    personal.PIN
                                                FROM
                                                    personal
                                                    INNER JOIN
                                                    departamentos
                                                    ON 
                                                        personal.Id_Departamento = departamentos.Id_Departamento
                                                    INNER JOIN
                                                    puestos
                                                    ON 
                                                        personal.Id_Puesto = puestos.Id_Puesto
                                                    INNER JOIN
                                                    puestos_general
                                                    ON 
                                                        puestos.Id_PuestoGeneral = puestos_general.Id_Puesto
                                                WHERE
                                                    No_DPI = ?`, [dpi]);
        await connection.close();
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error de conexión o consulta:', error);
        throw error;
    }
}

function validarEntrada(event) {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, ''); // Eliminar cualquier carácter que no sea un número
}

function habilitarBoton() {
    const input = document.getElementById('dpi');
    const boton = document.querySelector('.btn');
    boton.disabled = input.value.length !== 13; // Habilitar el botón solo si hay 13 dígitos
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const dpi = document.getElementById('dpi').value;

    try {
        const userData = await verificarDPI(dpi);
        if (userData) {
            // Mostrar campo para ingresar PIN
            Swal.fire({
                title: 'Ingrese su PIN',
                input: 'password',
                inputAttributes: {
                    autocapitalize: 'off',
                    maxlength: 6,
                    inputmode: 'numeric',
                    pattern: '[0-9]*'
                },
                showCancelButton: true,
                confirmButtonText: 'Verificar',
                showLoaderOnConfirm: true,
                preConfirm: (pin) => {
                    // Validar que el PIN sea numérico y tenga la longitud correcta
                    if (!/^\d+$/.test(pin)) {
                        Swal.showValidationMessage('El PIN debe contener solo números');
                        return false;
                    }
                    if (pin.length !== 6) {
                        Swal.showValidationMessage('El PIN debe tener 6 dígitos');
                        return false;
                    }
                    if (pin === userData.PIN) {
                        sessionStorage.setItem('userData', JSON.stringify(userData));
                        return true;
                    } else {
                        Swal.showValidationMessage('PIN incorrecto');
                        return false;
                    }
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = path.join(__dirname, 'Home.html');
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'DPI no encontrado',
                text: 'El número de DPI ingresado no existe en la base de datos.',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'Hubo un problema al conectar con la base de datos o realizar la consulta.',
            confirmButtonText: 'Aceptar'
        });
    }
});

document.getElementById('dpi').addEventListener('input', (event) => {
    validarEntrada(event);
    habilitarBoton();
});

// Inicializar el estado del botón al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    habilitarBoton();
});