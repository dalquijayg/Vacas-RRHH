const odbc = require('odbc');
const Swal = require('sweetalert2');
const conexion = 'DSN=recursos';

async function conectar() {
    try{
        const connection = await odbc.connect(conexion);
        await connection.query('SET NAMES utf8mb4');
        return connection;
    }catch(error){
        throw error;
    }
}
function mostrarSpinner() {
    Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espere mientras se carga la información.',
        allowOutsideClick: false, // Evita que se cierre al hacer clic fuera
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        },
    });
}
function ocultarSpinner() {
    Swal.close(); // Cierra el spinner
}