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
                                                    puestos_general.Id_Puesto
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
            // Guardar datos en sessionStorage
            const userData = result[0];
            sessionStorage.setItem('userData', JSON.stringify(userData));
            return true;
        } else {
            return false;
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
        const existe = await verificarDPI(dpi);
        if (existe) {
            window.location.href = path.join(__dirname, 'Home.html'); // Cambia la ruta según sea necesario
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