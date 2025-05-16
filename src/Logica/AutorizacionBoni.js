const odbc = require('odbc');
const Swal = require('sweetalert2');
const conexion = 'DSN=recursos';
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'Kj8#mP9$vL2@nQ5&xR7*cY4^hN3$mB90';
const IV_LENGTH = 16;
async function connectionString() {
    try {
        const connection = await odbc.connect(conexion);
        await connection.query('SET NAMES utf8mb4');
        return connection;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
}
function decrypt(text) {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Error al desencriptar:', error);
        return '0'; // Valor por defecto en caso de error
    }
}

function mostrarError(error, contexto) {
    console.error(`Error en ${contexto}:`, error);
    let mensajeError = 'Error desconocido';

    if (error.message && error.message.includes('CONNECTION')) {
        mensajeError = 'Error de conexión a la base de datos. Verifique que el servicio esté activo.';
    } else if (error.message && error.message.includes('SQL')) {
        mensajeError = 'Error en la consulta SQL: ' + error.message;
    } else if (error.message && error.message.includes('timeout')) {
        mensajeError = 'La operación ha excedido el tiempo de espera. Por favor, inténtelo nuevamente.';
    } else if (error.message && error.message.includes('Authentication')) {
        mensajeError = 'Error de autenticación en la base de datos. Contacte al administrador.';
    } else if (error.message) {
        mensajeError = error.message;
    }

    Swal.fire({
        icon: 'error',
        title: `Error en ${contexto}`,
        text: mensajeError,
        footer: 'Si el problema persiste, contacte al administrador del sistema'
    });
}

async function cargarBonificaciones() {
    let connection;
    try {
        connection = await connectionString();
        const query = `
            SELECT
                b.IdBonificacion, 
                CONCAT(p.Primer_Nombre, ' ', IFNULL(p.Segundo_Nombre, ''), ' ', 
                      p.Primer_Apellido, ' ', IFNULL(p.Segundo_Apellido, '')) AS NombreEncargado, 
                d.Nombre AS Departamento, 
                b.FechaGenerado, 
                b.MontoTotal,
                b.Estado,
                eb.DescripcionEstado
            FROM Bonificaciones b
            INNER JOIN personal p ON b.IdUsuario = p.Id
            INNER JOIN departamentos d ON b.IdDepartamento = d.Id_Departamento
            INNER JOIN EstadoBonificaciones eb ON b.Estado = eb.IdEstado
            WHERE b.Estado = 1
        `;
        
        const result = await connection.query(query);
        const tbody = document.getElementById('bonificacionesBody');
        tbody.innerHTML = '';

        let totalAmount = 0;
        let pendingCount = 0;
        let lastMonthCount = 0;
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

        result.forEach(row => {
            const montoDecrypt = decrypt(row.MontoTotal);
            const montoNumerico = parseFloat(montoDecrypt);
            const fechaBonificacion = new Date(row.FechaGenerado);
            
            totalAmount += montoNumerico;
            pendingCount++;
            if (fechaBonificacion >= lastMonth) lastMonthCount++;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${row.IdBonificacion}</td>
                <td>${row.NombreEncargado}</td>
                <td>${row.Departamento}</td>
                <td>${fechaBonificacion.toLocaleDateString()}</td>
                <td>Q${montoNumerico.toFixed(2)}</td>
                <td>
                    <span class="estado-badge estado-${row.DescripcionEstado.toLowerCase()}">
                        ${row.DescripcionEstado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-ver" onclick="window.location.href='DetalleAutorizacionBoni.html?id=${row.IdBonificacion}'">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-rechazar" onclick="rechazarBonificacion(${row.IdBonificacion})">
                        <i class="fas fa-times"></i> Rechazar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('totalAmount').textContent = `Q${totalAmount.toFixed(2)}`;
        document.getElementById('lastMonthCount').textContent = lastMonthCount;

    } catch (error) {
        mostrarError(error, 'carga de bonificaciones');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error al cerrar la conexión:', error);
            }
        }
    }
}

async function autorizarBonificacion(id) {
    let connection;
    try {
        const result = await Swal.fire({
            title: '¿Autorizar bonificación?',
            text: '¿Está seguro de autorizar esta bonificación?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, autorizar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            connection = await odbc.connect(conexion);
            await connection.query('UPDATE Bonificaciones SET Estado = 2 WHERE IdBonificacion = ?', [id]);
            
            Swal.fire('¡Éxito!', 'Bonificación autorizada correctamente', 'success');
            await cargarBonificaciones();
        }
    } catch (error) {
        mostrarError(error, 'autorización de bonificación');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error al cerrar la conexión:', error);
            }
        }
    }
}

async function rechazarBonificacion(id) {
    let connection;
    try {
        const result = await Swal.fire({
            title: '¿Rechazar bonificación?',
            text: '¿Está seguro de rechazar esta bonificación?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            connection = await odbc.connect(conexion);
            await connection.query('UPDATE Bonificaciones SET Estado = 5 WHERE IdBonificacion = ?', [id]);
            
            Swal.fire('¡Éxito!', 'Bonificación rechazada correctamente', 'success');
            await cargarBonificaciones();
        }
    } catch (error) {
        mostrarError(error, 'rechazo de bonificación');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error al cerrar la conexión:', error);
            }
        }
    }
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#bonificacionesBody tr');
    let visibleRows = 0;
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleRows++;
    });

    // Mostrar/ocultar estado vacío
    document.getElementById('emptyState').style.display = 
        visibleRows === 0 ? 'block' : 'none';
});
document.addEventListener('DOMContentLoaded', cargarBonificaciones);