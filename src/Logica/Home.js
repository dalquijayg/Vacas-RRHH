document.addEventListener('DOMContentLoaded', async() => {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const nombreCompleto = userData.NombreCompleto;
    const idencargado = userData.Id;
    const idDepartamento = userData.Id_Departamento;
    const idPersonal = userData.Id;
    const validarpuesto = userData.Id_Puesto;
    const odbc = require('odbc');
    const conexion = 'DSN=recursos';
    await checkEmployeesNearingAnniversary();
    const inicioTab = document.getElementById('inicio-tab');
    inicioTab.addEventListener('click', async function(e) {
        e.preventDefault();
        closeAllOptions();
        document.querySelector('.saludo-card').style.display = 'block';
        await checkEmployeesNearingAnniversary(true);
    });

    let selectedEmployeeId = null;
    let selectedEmployeePlanilla = null;
    let selectedEmployeeDepartamento = null;
    let selectedEmployeeInicioPlanilla = null;
    let selectedEmployeeDiasMinVT = null;
    const adminTab = document.getElementById('administracion-tab');
    const vacacionesTab = document.getElementById('gestion-vacaciones-tab');
    const adminSubmenu = document.getElementById('administracion-submenu');
    const vacacionesSubmenu = document.getElementById('gestion-vacaciones-submenu');
    const submenuContainer = document.querySelector('.submenu-container');

    function toggleSubmenu(submenu) {
        const isActive = submenu.classList.contains('active');
        
        // Ocultar todos los submenús
        adminSubmenu.classList.remove('active');
        vacacionesSubmenu.classList.remove('active');
        
        if (!isActive) {
            // Mostrar el submenú seleccionado
            submenu.classList.add('active');
            submenuContainer.classList.add('active');
            submenuContainer.style.animation = 'slideDown 0.3s ease-out forwards';
            
            // Activar la primera sección del submenú por defecto
            const firstTitle = submenu.querySelector('.submenu-title');
            if (firstTitle) {
                activateSubmenuSection(firstTitle);
            }
        } else {
            // Ocultar el contenedor de submenús
            submenuContainer.classList.remove('active');
            submenuContainer.style.animation = 'slideUp 0.3s ease-in forwards';
        }
    }
    function hideSubmenu() {
        adminSubmenu.classList.remove('active');
        vacacionesSubmenu.classList.remove('active');
        submenuContainer.classList.remove('active');
        submenuContainer.style.animation = 'slideUp 0.3s ease-in forwards';
        adminTab.classList.remove('active');
        vacacionesTab.classList.remove('active');
    }

    function activateSubmenuSection(title) {
        const submenu = title.closest('.submenu');
        submenu.querySelectorAll('.submenu-title').forEach(t => t.classList.remove('active'));
        submenu.querySelectorAll('.submenu-section').forEach(s => s.classList.remove('active'));
        
        title.classList.add('active');
        const targetSection = document.getElementById(title.dataset.target + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    adminTab.addEventListener('click', function(e) {
        e.preventDefault();
        toggleSubmenu(adminSubmenu);
        adminTab.classList.toggle('active');
        vacacionesTab.classList.remove('active');
    });

    vacacionesTab.addEventListener('click', function(e) {
        e.preventDefault();
        toggleSubmenu(vacacionesSubmenu);
        vacacionesTab.classList.toggle('active');
        adminTab.classList.remove('active');
    });

    // Manejar clics en los títulos de submenú
    document.querySelectorAll('.submenu-title').forEach(title => {
        title.addEventListener('click', function(e) {
            e.preventDefault();
            activateSubmenuSection(this);
        });
    });

    // Manejar clics en los elementos del submenú
    document.querySelectorAll('.submenu-section a').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Acción seleccionada:', this.id);
            // Aquí puedes agregar la lógica para cada acción del menú
            hideSubmenu();
        });
    });
    document.getElementById('menu-historial-por-departamento').addEventListener('click', async () => {
        closeAllOptions();
        document.getElementById('historial-por-departamento-section').style.display = 'block';
        await departamentostodos();
    });

    async function conectar() {
    try {
          const connection = await odbc.connect(conexion);
          await connection.query('SET NAMES utf8mb4');
          return connection;
        } catch (error) {
          console.error('Error al conectar a la base de datos:', error);
          throw error;
        }
    }

    function showLoader() {
        document.getElementById('loader-overlay').style.display = 'flex';
    }

    function hideLoader() {
        document.getElementById('loader-overlay').style.display = 'none';
    }
    function closeAllOptions() {
        document.getElementById('personal-form').style.display = 'none';
        document.getElementById('vacation-section').style.display = 'none';
        document.getElementById('calendar-container').style.display = 'none';
        document.getElementById('vacation-payment-info').style.display = 'none';
        document.querySelector('.saludo-card').style.display = 'none';
        document.getElementById('doc-vacaciones-tomadas-section').style.display = 'none';
        document.getElementById('pago-vacaciones-section').style.display ='none';
        document.getElementById('anniversary-employees-section').style.display='none';
        document.getElementById('reporte-pagos-section').style.display='none';
        document.getElementById('historial-por-departamento-section').style.display='none';
        document.getElementById('reporte-vacaciones-section').style.display='none';
        document.getElementById('reporte-vacaciones-grid').style.display='none';
        document.getElementById('pagos-autorizados-section').style.display='none';
    }
    async function verificarPermiso(codigo) {
        try {
            const connection = await odbc.connect(conexion);
            const query = `
                SELECT Codigo AS tienePermiso
                FROM TransaccionesRRHH
                WHERE IdPersonal = ? AND Codigo = ? AND Activo = 1
            `;
            const result = await connection.query(query, [idencargado, codigo]);
            await connection.close();
    
            return result[0].tienePermiso > 0;
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            return false;
        }
    }
    async function tienePermiso123() {
        try {
            const connection = await odbc.connect(conexion);
            const query = `
                SELECT Codigo AS tienePermiso
                FROM TransaccionesRRHH
                WHERE IdPersonal = ? AND Codigo = '123' AND Activo = 1
            `;
            const result = await connection.query(query, [idencargado]);
            await connection.close();
            return result[0].tienePermiso = 123;
        } catch (error) {
            console.error('Error al verificar permiso 123:', error);
            return false;
        }
    }    
    document.getElementById('menu-ingreso-personal').addEventListener('click', async () => {
        showLoader();
        try {
            if (await verificarPermiso('100') || await verificarPermiso('123')) {
                closeAllOptions();
                document.getElementById('personal-form').style.display = 'block';
                document.getElementById('vacation-section').style.display = 'none';
                document.querySelector('.saludo-card').style.display = 'none';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta sección. Transaccion:100',Bodegona_LaDemocracia
                });
            }
        } finally {
            hideLoader();
        }
    });

    // Mostrar calendario al hacer clic en "Toma de Vacaciones"
    document.getElementById('menu-toma-vacaciones').addEventListener('click', async () => {
        showLoader();
        try {
            if (await verificarPermiso('101') || await verificarPermiso('123')) {
                closeAllOptions();
                document.getElementById('personal-form').style.display = 'none';
                document.getElementById('vacation-section').style.display = 'block';
                document.getElementById('calendar-container').style.display = 'none';
                document.querySelector('.saludo-card').style.display = 'none';
                document.getElementById('employee-table').className = 'toma-vacaciones';
                document.getElementById('action-title').textContent = 'Registro para Toma de vacaciones';
                await loadEmployeeList('toma-vacaciones');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta sección. Transaccion "101"',
                });
            }
        } finally {
            hideLoader();
        }
    });
    document.getElementById('menu-solicitar-pago-vacaciones').addEventListener('click', async () => {
        showLoader();
        try {
            if (await verificarPermiso('101') || await verificarPermiso('123')) {
                closeAllOptions();
                document.getElementById('personal-form').style.display = 'none';
                document.getElementById('vacation-section').style.display = 'block';
                document.getElementById('calendar-container').style.display = 'none';
                document.getElementById('vacation-payment-info').style.display = 'none';
                document.querySelector('.saludo-card').style.display = 'none';
                document.getElementById('employee-table').className = 'pago-vacaciones';
                document.getElementById('action-title').textContent = 'Solicitud pago vacaciones';
                await loadEmployeeList('pago-vacaciones');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta sección. Transaccion "101"',
                });
            }
        } finally {
            hideLoader();
        }
    });
    document.getElementById('menu-registro-vacaciones').addEventListener('click', async () => {
        showLoader();
        if (await verificarPermiso('102') || await verificarPermiso('123')) {
            closeAllOptions();
            document.getElementById('personal-form').style.display = 'none';
            document.getElementById('vacation-section').style.display = 'block';
            document.getElementById('calendar-container').style.display = 'none';
            document.querySelector('.saludo-card').style.display = 'none';
            document.getElementById('action-title').textContent = 'Registro para Toma de vacaciones';
            loadEmployeeList('registro-vacaciones');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permiso para acceder a esta sección. Transaccion: "102"',
            });
        }
        hideLoader();
    });
    
    document.getElementById('menu-registro-pago-vacaciones').addEventListener('click', async () => {
        showLoader();
        if (await verificarPermiso('102') || await verificarPermiso('123')) {
            closeAllOptions();
            document.getElementById('personal-form').style.display = 'none';
            document.getElementById('vacation-section').style.display = 'block';
            document.getElementById('calendar-container').style.display = 'none';
            document.getElementById('vacation-payment-info').style.display = 'none';
            document.querySelector('.saludo-card').style.display = 'none';
            document.getElementById('action-title').textContent = 'Solicitud pago vacaciones';
            loadEmployeeList('registro-pago-vacaciones');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permiso para acceder a esta sección. Transaccion: "102"',
            });
        }
        hideLoader();
    });
    document.getElementById('menu-pago-vacaciones').addEventListener('click', async () => {
        showLoader();
        try {
            if (await verificarPermiso('105') || await verificarPermiso('123')) {
                closeAllOptions();
                document.getElementById('pago-vacaciones-section').style.display = 'block';
                await Listadopagosporautorizar();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta sección. Transaccion: "105"',
                });
            }
        } finally {
            hideLoader();
        }
    });
    document.getElementById('menu-pagos-autorizados').addEventListener('click', async () => {
        showLoader();
        try {
            if (await verificarPermiso('106') || await verificarPermiso('123')) {
                closeAllOptions();
                document.getElementById('pagos-autorizados-section').style.display = 'block';
                await cargarPagosAutorizados();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta sección.',
                });
            }
        } finally {
            hideLoader();
        }
    });
    document.getElementById('menu-doc-vacaciones-tomadas').addEventListener('click', async () => {
        showLoader();
        if (await verificarPermiso('103') || await verificarPermiso('123')) {
            closeAllOptions();
            document.getElementById('personal-form').style.display = 'none';
            document.getElementById('vacation-section').style.display = 'none';
            document.getElementById('pago-vacaciones-section').style.display = 'none';
            document.getElementById('doc-vacaciones-tomadas-section').style.display = 'block';
            document.querySelector('.saludo-card').style.display = 'none';
            DocVacacionesTomadas();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permiso para acceder a esta sección. Transaccion: "103"',
            });
        }
        hideLoader();
    });
    document.getElementById('menu-reporte-pagos').addEventListener('click', async () => {
        showLoader();
        try {
            if (await verificarPermiso('104') || await verificarPermiso('123')) {
                closeAllOptions();
                document.getElementById('reporte-pagos-section').style.display = 'block';
                await cargarEstadosPago();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta sección.',
                });
            }
        } finally {
            hideLoader();
        }
    });
    document.getElementById('menu-reporte-vacaciones').addEventListener('click', async () => {
        showLoader();
        try {
            if (await verificarPermiso('104') || await verificarPermiso('123')) {
                closeAllOptions();
                await cargarDepartamentosReporteVacaciones();
                document.getElementById('reporte-vacaciones-section').style.display = 'block';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta sección.',
                });
            }
        } finally {
            hideLoader();
        }
    });
    
    const employeeListToggle = document.getElementById('employee-list-toggle');
    const employeeList = document.getElementById('employee-list');
    const calendarContainer = document.getElementById('calendar-container');

    employeeListToggle.addEventListener('click', () => {
        employeeListToggle.classList.toggle('collapsed');
        employeeList.classList.toggle('collapsed');
        if (calendarContainer.style.display !== 'none') {
            calendarContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });
    async function verificarPermiso(codigo) {
        try {
            const connection = await odbc.connect(conexion);
            const query = `
                SELECT COUNT(*) AS tienePermiso
                FROM TransaccionesRRHH
                WHERE IdPersonal = ? AND Codigo = ? AND Activo = 1
            `;
            const result = await connection.query(query, [idencargado, codigo]);
            await connection.close();
    
            return result[0].tienePermiso > 0;
        } catch (error) {
            console.error('Error al verificar permisos:', error);
            return false;
        }
    }
    
    async function loadEmployeeList(mode = 'toma-vacaciones') {
        showLoader();
        try {
            const connection = await conectar();
            let query;
            let queryParams;
    
            if (mode === 'registro-vacaciones' || mode === 'registro-pago-vacaciones') {
                query = `
                    SELECT 
                        personal.Id AS IdPersonal,
                        CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                        personal.Inicio_Planilla,
                        puestos.Nombre AS NombrePuesto,
                        departamentos.Nombre AS NombreDepartamento,
                        ((DATEDIFF(NOW(), personal.Inicio_Planilla) DIV 365 * 15) - IFNULL(vp.TotalDiasSolicitados, 0) - IFNULL(vt.TotalDiasSolicitados, 0)) AS DiasDisponibles,
                        planillas.Nombre_Planilla,
                        personal.Id_Planilla,
                        personal.Id_Departamento, 
                        personal.DiasMinVT, 
                        personal.DiasMinVP
                    FROM 
                        personal 
                        INNER JOIN puestos ON personal.Id_Puesto = puestos.Id_Puesto
                        INNER JOIN departamentos ON puestos.Id_Departamento = departamentos.Id_Departamento
                        INNER JOIN planillas ON personal.Id_Planilla = planillas.Id_Planilla
                        LEFT JOIN (
                            SELECT
                                vacacionespagadas.IdPersonal, 
                                SUM(vacacionespagadas.DiasSolicitado) AS TotalDiasSolicitados
                            FROM
                                vacacionespagadas
                            WHERE
                                vacacionespagadas.Estado IN (1, 2, 3)
                            GROUP BY
                                vacacionespagadas.IdPersonal
                        ) vp ON personal.Id = vp.IdPersonal
                        LEFT JOIN (
                            SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                            FROM vacacionestomadas
                            GROUP BY IdPersonal
                        ) vt ON personal.Id = vt.IdPersonal
                    WHERE
                        personal.Estado IN (1, 2)
                    ORDER BY 
                        DiasDisponibles DESC
                `;
                queryParams = [];
            } else if (validarpuesto == 94) {
                query = `
                    SELECT
                        personal.Id AS IdPersonal,
                        CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                        personal.Inicio_Planilla,
                        puestos.Nombre AS NombrePuesto,
                        departamentos.Nombre AS NombreDepartamento,
                        ((DATEDIFF(NOW(), personal.Inicio_Planilla) DIV 365 * 15) - IFNULL(vp.TotalDiasSolicitados, 0) - IFNULL(vt.TotalDiasSolicitados, 0)) AS DiasDisponibles,
                        planillas.Nombre_Planilla,
                        personal.Id_Planilla,
                        personal.Id_Departamento, 
                        personal.DiasMinVT, 
                        personal.DiasMinVP
                    FROM
                        personal
                        INNER JOIN puestos ON personal.Id_Puesto = puestos.Id_Puesto
                        INNER JOIN departamentos ON puestos.Id_Departamento = departamentos.Id_Departamento
                        INNER JOIN planillas ON personal.Id_Planilla = planillas.Id_Planilla
                        LEFT JOIN (
                            SELECT
                                vacacionespagadas.IdPersonal, 
                                SUM(vacacionespagadas.DiasSolicitado) AS TotalDiasSolicitados
                            FROM
                                vacacionespagadas
                            WHERE
                                vacacionespagadas.Estado IN (1, 2, 3)
                            GROUP BY
                                vacacionespagadas.IdPersonal
                        ) vp ON personal.Id = vp.IdPersonal
                        LEFT JOIN (
                            SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                            FROM vacacionestomadas
                            GROUP BY IdPersonal
                        ) vt ON personal.Id = vt.IdPersonal
                    WHERE
                        puestos.Id_PuestoGeneral IN (91, 143) AND
                        personal.Estado IN (1, 2) AND
                        departamentos.idivision = 2
                    ORDER BY
                        departamentos.Nombre ASC
                `;
                queryParams = [];
            } else if (validarpuesto == 95) {
                query = `
                    SELECT
                        personal.Id AS IdPersonal,
                        CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                        personal.Inicio_Planilla,
                        puestos.Nombre AS NombrePuesto,
                        departamentos.Nombre AS NombreDepartamento,
                        ((DATEDIFF(NOW(), personal.Inicio_Planilla) DIV 365 * 15) - IFNULL(vp.TotalDiasSolicitados, 0) - IFNULL(vt.TotalDiasSolicitados, 0)) AS DiasDisponibles,
                        planillas.Nombre_Planilla,
                        personal.Id_Planilla,
                        personal.Id_Departamento, 
                        personal.DiasMinVT, 
                        personal.DiasMinVP
                    FROM
                        personal
                        INNER JOIN puestos ON personal.Id_Puesto = puestos.Id_Puesto
                        INNER JOIN departamentos ON puestos.Id_Departamento = departamentos.Id_Departamento
                        INNER JOIN planillas ON personal.Id_Planilla = planillas.Id_Planilla
                        LEFT JOIN (
                                SELECT
                                            vacacionespagadas.IdPersonal, 
                                            SUM(vacacionespagadas.DiasSolicitado) AS TotalDiasSolicitados
                                        FROM
                                            vacacionespagadas
                                        WHERE
                                            vacacionespagadas.Estado IN (1, 2, 3)
                                        GROUP BY
                                            vacacionespagadas.IdPersonal
                        ) vp ON personal.Id = vp.IdPersonal
                        LEFT JOIN (
                            SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                            FROM vacacionestomadas
                            GROUP BY IdPersonal
                        ) vt ON personal.Id = vt.IdPersonal
                    WHERE
                        puestos.Id_PuestoGeneral IN (91, 143) AND
                        personal.Estado IN (1, 2) AND
                        departamentos.idivision = 3
                    ORDER BY
                        departamentos.Nombre ASC
                `;
                queryParams = [];
            } else {
                query = `
                    SELECT
                        personal.Id AS IdPersonal, 
                        CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto, 
                        personal.Inicio_Planilla, 
                        puestos.Nombre AS NombrePuesto, 
                        departamentos.Nombre AS NombreDepartamento, 
                        ((DATEDIFF(NOW(), personal.Inicio_Planilla) DIV 365 * 15) - IFNULL(vp.TotalDiasSolicitados, 0) - IFNULL(vt.TotalDiasSolicitados, 0)) AS DiasDisponibles, 
                        planillas.Nombre_Planilla, 
                        personal.Id_Planilla, 
                        personal.Id_Departamento, 
                        personal.DiasMinVT, 
                        personal.DiasMinVP
                    FROM
                        personal
                        INNER JOIN
                        puestos
                        ON 
                            personal.Id_Puesto = puestos.Id_Puesto
                        INNER JOIN
                        departamentos
                        ON 
                            puestos.Id_Departamento = departamentos.Id_Departamento
                        INNER JOIN
                        planillas
                        ON 
                            personal.Id_Planilla = planillas.Id_Planilla
                        LEFT JOIN
                        (
                            SELECT
                                vacacionespagadas.IdPersonal, 
                                SUM(vacacionespagadas.DiasSolicitado) AS TotalDiasSolicitados
                            FROM
                                vacacionespagadas
                            WHERE
                                vacacionespagadas.Estado IN (1, 2, 3)
                            GROUP BY
                                vacacionespagadas.IdPersonal
                        ) AS vp
                        ON 
                            personal.Id = vp.IdPersonal
                        LEFT JOIN
                        (
                            SELECT
                                vacacionestomadas.IdPersonal, 
                                SUM(vacacionestomadas.DiasSolicitado) AS TotalDiasSolicitados
                            FROM
                                vacacionestomadas
                            GROUP BY
                                vacacionestomadas.IdPersonal
                        ) AS vt
                        ON 
                            personal.Id = vt.IdPersonal
                        INNER JOIN
                        puestos_general
                        ON 
                            puestos.Id_PuestoGeneral = puestos_general.Id_Puesto
                    WHERE
                        personal.Id_Departamento = ? AND
                        personal.Estado IN (1,2) AND
                        personal.Id != ? AND
                        puestos_general.Id_Puesto != 91 AND
                        puestos_general.Id_Puesto != 143
                    ORDER BY
                        DiasDisponibles DESC;`;
                queryParams = [idDepartamento, idPersonal];
            }
    
            const result = await connection.query(query, queryParams);
            await connection.close();
    
            const tableBody = document.querySelector('#employee-table tbody');
            const searchInput = document.getElementById('employee-search');
            const departamentoSelect = document.getElementById('departamento-filter');
            showLoader();
            await cargarDepartamentosEnFiltro();
            function renderEmployees(employees) {
                tableBody.innerHTML = '';
                employees.forEach(employee => {
                    const row = tableBody.insertRow();
                    row.insertCell(0).textContent = employee.NombreCompleto;
                    row.insertCell(1).textContent = formatofecha(employee.Inicio_Planilla);
                    const diasDisponiblesCell = row.insertCell(2);
                    diasDisponiblesCell.textContent = employee.DiasDisponibles;
                    diasDisponiblesCell.className = 'dias-disponibles';
                    row.insertCell(3).textContent = employee.NombrePuesto;
                    row.insertCell(4).textContent = employee.NombreDepartamento;
                    row.insertCell(5).textContent = employee.Nombre_Planilla;
                    
                    
                    row.dataset.employeeId = employee.IdPersonal;
                    row.dataset.employeeName = employee.NombreCompleto;
                    row.dataset.employeeDays = employee.DiasDisponibles;
                    row.dataset.employeePlanilla = employee.Id_Planilla;
                    row.dataset.employeeDepartamento = employee.Id_Departamento;
                    row.dataset.employeeInicioPlanilla = employee.Inicio_Planilla;
                    row.dataset.employeeDiasMinVT = employee.DiasMinVT;
    
                    row.addEventListener('click', () => {
                        if (mode === 'toma-vacaciones' || mode === 'registro-vacaciones') {
                            selectEmployee(row, employee.IdPersonal, employee.NombreCompleto, employee.DiasDisponibles, employee.Id_Planilla, employee.Id_Departamento, employee.Inicio_Planilla, employee.DiasMinVT);
                        } else if (mode === 'pago-vacaciones' || mode === 'registro-pago-vacaciones') {
                            showVacationPaymentInfo(employee.IdPersonal);
                        }
                    });
                });
            }
            hideLoader();

            function filterEmployees() {
                const searchTerm = searchInput.value.toLowerCase();
                const selectedDepartamento = departamentoSelect.value;
                const terms = searchTerm.split(' ');
                return result.filter(employee => {
                    const fullName = `${employee.NombreCompleto}`.toLowerCase();
                    const departamentoMatch = !selectedDepartamento || employee.Id_Departamento.toString() === selectedDepartamento;
                    return terms.every(term => fullName.includes(term)) && departamentoMatch;
                });
            }

            renderEmployees(result);

            searchInput.addEventListener('input', (e) => {
                const filteredEmployees = filterEmployees(e.target.value);
                renderEmployees(filteredEmployees);
                if (employeeList.classList.contains('collapsed')) {
                    employeeList.classList.remove('collapsed');
                    employeeListToggle.classList.remove('collapsed');
                }
            });
            departamentoSelect.addEventListener('change', () => {
                const filteredEmployees = filterEmployees();
                renderEmployees(filteredEmployees);
                if (employeeList.classList.contains('collapsed')) {
                    employeeList.classList.remove('collapsed');
                    employeeListToggle.classList.remove('collapsed');
                }
            });
        } catch (error) {
            console.error('Error loading employee list:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar la lista de Colaboradores.',
            });
        }
        hideLoader();
    }
    async function cargarDepartamentosEnFiltro() {
        try {
            const connection = await conectar();
            const query = `SELECT Id_Departamento, Nombre FROM departamentos ORDER BY Nombre ASC`;
            const departamentos = await connection.query(query);
            await connection.close();
    
            const select = document.getElementById('departamento-filter');
            select.innerHTML = '<option value="">Todos los departamentos</option>';
            departamentos.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.Id_Departamento;
                option.textContent = dept.Nombre;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departamentos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los departamentos.',
            });
        }
    }
    async function updateEmployeeInfo(employeeId, periodo) {
        try {
            const connection = await conectar();
            const query = `
                SELECT 
                    CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                    ((DATEDIFF(NOW(), personal.Inicio_Planilla) DIV 365 * 15) - IFNULL(vp.TotalDiasSolicitados, 0) - IFNULL(vt.TotalDiasSolicitados, 0)) AS DiasDisponibles
                FROM 
                    personal 
                    LEFT JOIN (
                        SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                        FROM vacacionespagadas
                        WHERE
                            vacacionespagadas.Estado IN (1, 2, 3)
                        GROUP BY IdPersonal
                    ) vp ON personal.Id = vp.IdPersonal
                    LEFT JOIN (
                        SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                        FROM vacacionestomadas
                        GROUP BY IdPersonal
                    ) vt ON personal.Id = vt.IdPersonal
                WHERE 
                    personal.Id = ?
            `;
            const result = await connection.query(query, [employeeId]);
            await connection.close();
    
            if (result.length > 0) {
                selectedEmployeeName = result[0].NombreCompleto;
                selectedEmployeeDays = result[0].DiasDisponibles;
                document.getElementById('selected-employee-info').textContent = `${selectedEmployeeName} - Días disponibles: ${selectedEmployeeDays}`;
            }
        } catch (error) {
            console.error('Error updating employee info:', error);
        }
    }
    async function showVacationPaymentInfo(employeeId) {
        showLoader();
        try {
            const connection = await conectar();
    
            // Paso 1: Obtener información del empleado
            const employeeQuery = `
                SELECT 
                    personal.Id, 
                    personal.Id_Planilla, 
                    personal.Id_Departamento, 
                    personal.Inicio_Planilla,
                    CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                    personal.DiasMinVP
                FROM personal
                INNER JOIN puestos p ON personal.Id_Puesto = p.Id_Puesto
                WHERE personal.Id = ?
            `;
            const employeeResult = await connection.query(employeeQuery, [employeeId]);
            
            if (employeeResult.length === 0) {
                throw new Error('Empleado no encontrado');
            }

            const employee = employeeResult[0];
            selectedEmployeeId = employee.Id;
            selectedEmployeePlanilla = employee.Id_Planilla;
            selectedEmployeeDepartamento = employee.Id_Departamento;
            selectedEmployeeInicioPlanilla = employee.Inicio_Planilla;
            selectedEmployeeName = employee.NombreCompleto;
            selectedEmployeeDiasMinVP = employee.DiasMinVP;
    
            // Paso 2: Ejecutar la consulta principal para obtener información de vacaciones
            const queries = [
                `SET @id_empleado = ?;`,
                `SET @inicio = ?;`,
                `SET @hoy = CURDATE();`,
                `SET @dias_por_periodo = 15;`,
                `
                SELECT 
                    CONCAT(
                        DATE_FORMAT(periodo_inicio, '%d-%m-%Y'),
                        ' al ',
                        DATE_FORMAT(periodo_fin, '%d-%m-%Y')
                    ) AS periodo,
                    GREATEST(0, @dias_por_periodo - COALESCE(SUM(dias_vacaciones), 0)) AS dias_disponibles
                FROM (
                    SELECT 
                        DATE_ADD(CAST(@inicio AS DATE), INTERVAL n YEAR) AS periodo_inicio,
                        DATE_SUB(DATE_ADD(CAST(@inicio AS DATE), INTERVAL n+1 YEAR), INTERVAL 1 DAY) AS periodo_fin
                    FROM (
                        SELECT a.N + b.N * 10 + c.N * 100 AS n
                        FROM (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
                        CROSS JOIN (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
                        CROSS JOIN (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
                    ) numbers
                    WHERE DATE_ADD(CAST(@inicio AS DATE), INTERVAL n+1 YEAR) <= @hoy
                ) periodos
                LEFT JOIN (
                    SELECT Periodo, DiasSolicitado AS dias_vacaciones
                    FROM vacacionestomadas
                    WHERE IdPersonal = @id_empleado
                    UNION ALL
                    SELECT Periodo, DiasSolicitado
                    FROM vacacionespagadas
                    WHERE IdPersonal = @id_empleado AND Estado IN (1,2,3)
                ) vacaciones ON vacaciones.Periodo BETWEEN periodos.periodo_inicio AND periodos.periodo_fin
                GROUP BY 
                    periodo_inicio, periodo_fin
                ORDER BY 
                    periodo_inicio;
                `
            ];
    
            let result;
            for (let i = 0; i < queries.length; i++) {
                if (i < 2) {
                    result = await connection.query(queries[i], i === 0 ? [employeeId] : [selectedEmployeeInicioPlanilla]);
                } else {
                    result = await connection.query(queries[i]);
                }
            }
    
            await connection.close();
    
            // Mostrar los resultados en el elemento HTML
            const vacationPaymentInfo = document.getElementById('vacation-payment-info');
            vacationPaymentInfo.innerHTML = `<h3>Información de Vacaciones Disponibles para ${selectedEmployeeName}</h3>`;
            const table = document.createElement('table');
            table.innerHTML = `
            <thead>
                <tr>
                    <th>Periodo</th>
                    <th>Días Disponibles</th>
                    <th>Días a Solicitar</th>
                </tr>
            </thead>
            <tbody>
                ${result.map((row, index) => `
                    <tr>
                        <td class="periodo-cell">${row.periodo}</td>
                        <td class="dias-disponibles">${row.dias_disponibles}</td>
                        <td>
                            <input type="number" class="input-dias" value="0" min="0" max="${row.dias_disponibles}" data-index="${index}" data-periodo="${row.periodo}">
                        </td>
                    </tr>
                `).join('')}
            </tbody>
            `;
            vacationPaymentInfo.appendChild(table);

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Guardar Solicitud de Vacaciones';
            saveButton.classList.add('save-vacation-button');
            saveButton.addEventListener('click', () => saveVacationRequest(selectedEmployeeId));
            vacationPaymentInfo.appendChild(saveButton);
    
            // Agregar eventos a los inputs
            const inputsDias = table.querySelectorAll('.input-dias');
            inputsDias.forEach(input => {
                input.addEventListener('change', actualizarDias);
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        actualizarDias.call(this, e);
                    }
                });
            });
    
            vacationPaymentInfo.style.display = 'block';
    
            // Ocultar otros elementos
            document.getElementById('calendar-container').style.display = 'none';
            document.getElementById('employee-list').classList.add('collapsed');
        } catch (error) {
            console.error('Error detallado al cargar la información de vacaciones:', error);
            let errorMessage = 'Hubo un problema al cargar la información de vacaciones. ';
            
            if (error.message) {
                errorMessage += 'Detalles del error: ' + error.message;
            }
            
            if (error.sqlState) {
                errorMessage += ' SQL State: ' + error.sqlState;
            }
            
            if (error.code) {
                errorMessage += ' Código de error: ' + error.code;
            }
    
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            });
        }
        hideLoader();
    }
    function reformatearPeriodo(periodoOriginal) {
        const [inicio, fin] = periodoOriginal.split(' al ');
        const [mesInicio, diaInicio, anioInicio] = inicio.split('-');
        const [mesFin, diaFin, anioFin] = fin.split('-');
        
        return `${anioInicio}-${diaInicio}-${mesInicio} al ${anioFin}-${diaFin}-${mesFin}`;
    }
    
    async function saveVacationRequest(employeeId) {
        if (!employeeId || !selectedEmployeePlanilla || !selectedEmployeeDepartamento) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Información del empleado incompleta. Por favor, seleccione un empleado nuevamente.',
            });
            return;
        }
    
        let connection;
        try {
            connection = await odbc.connect(conexion);
            const inputs = document.querySelectorAll('.input-dias');
            const requests = [];
            const esAdmin = await tienePermiso123();
            for (const input of inputs) {
                const diasSolicitados = parseInt(input.value);
                if (diasSolicitados > 0) {
                    const periodo = reformatearPeriodo(input.dataset.periodo);
                    
                    // Obtener información de vacaciones para este período
                    const query = `
                        SELECT 
                            IFNULL(SUM(CASE WHEN tipo = 'tomadas' THEN dias ELSE 0 END), 0) AS DiasTomados,
                            IFNULL(SUM(CASE WHEN tipo = 'pagadas' THEN dias ELSE 0 END), 0) AS DiasPagados
                        FROM (
                            SELECT 'tomadas' AS tipo, DiasSolicitado AS dias 
                            FROM vacacionestomadas 
                            WHERE IdPersonal = ? AND Periodo = ?
                            UNION ALL
                            SELECT 'pagadas' AS tipo, DiasSolicitado AS dias 
                            FROM vacacionespagadas 
                            WHERE IdPersonal = ? AND Periodo = ? AND Estado IN (1,2,3)
                        ) AS vacaciones
                    `;
                    const [vacationInfo] = await connection.query(query, [employeeId, periodo, employeeId, periodo]);
                    
                    const totalDiasTomados = vacationInfo.DiasTomados + vacationInfo.DiasPagados;
                    const diasDisponiblesEnPeriodo = 15 - totalDiasTomados;
    
                    if (!esAdmin) {
                        if (totalDiasTomados >= 7.5) { // Más del 50% de los días ya utilizados
                            if (diasSolicitados < diasDisponiblesEnPeriodo) {
                                throw new Error(`Para el período ${periodo}, debe solicitar todos los ${diasDisponiblesEnPeriodo} días restantes.`);
                            }
                        } else {
                            if (diasSolicitados < selectedEmployeeDiasMinVP) {
                                throw new Error(`Para el período ${periodo}, debe solicitar al menos ${selectedEmployeeDiasMinVP} días de vacaciones.`);
                            }
                        }
                    }
    
                    requests.push({
                        IdPersonal: employeeId,
                        Fecha: new Date().toISOString().split('T')[0],
                        DiasSolicitado: diasSolicitados,
                        Periodo: periodo,
                        IdEncargado: idencargado,
                        IdDepartamento: selectedEmployeeDepartamento,
                        IdPlanilla: selectedEmployeePlanilla
                    });
                }
            }
    
            if (requests.length === 0) {
                throw new Error('Por favor, seleccione al menos un día de vacaciones para solicitar.');
            }
    
            // Guardar las solicitudes en la base de datos
            for (const request of requests) {
                const insertQuery = `
                    INSERT INTO vacacionespagadas 
                    (IdPersonal, FechaRegistro, DiasSolicitado, Periodo, IdEncargado, IdDepartamento, IdPlanilla)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await connection.query(insertQuery, [
                    request.IdPersonal,
                    request.Fecha,
                    request.DiasSolicitado,
                    request.Periodo,
                    request.IdEncargado,
                    request.IdDepartamento,
                    request.IdPlanilla
                ]);
            }
    
            await connection.close();
    
            Swal.fire({
                icon: 'success',
                title: 'Solicitud guardada',
                text: 'La solicitud de vacaciones ha sido guardada exitosamente.'
            });
    
            showVacationPaymentInfo(employeeId);
        } catch (error) {
            console.error('Error al guardar la solicitud de vacaciones:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Hubo un problema al guardar la solicitud de vacaciones. Por favor, intente nuevamente.',
            });
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error al cerrar la conexión:', closeError);
                }
            }
        }
    }
    function actualizarDias(event) {
        const index = event.target.dataset.index;
        const input = event.target;
        const diasDisponiblesElement = input.closest('tr').querySelector('.dias-disponibles');
        const valorAnterior = parseInt(input.defaultValue);
        let nuevoValor = parseInt(input.value);
    
        const maxDias = parseInt(diasDisponiblesElement.textContent);
    
        if (isNaN(nuevoValor) || nuevoValor < 0) {
            nuevoValor = 0;
        } else if (nuevoValor > maxDias) {
            nuevoValor = maxDias;
            Swal.fire({
                icon: 'warning',
                title: 'Exceso de días',
                text: `No puedes solicitar más de ${maxDias} días para este período.`,
            });
        }
        input.value = nuevoValor;
        input.defaultValue = nuevoValor;
    
        // Actualizar el mensaje de error solo si es necesario
        if (maxDias > 0 && nuevoValor === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Días disponibles',
                text: `Puedes solicitar hasta ${maxDias} días para este período.`,
            });
        }
    }
    function actualizarDiasDisponibles(index, diferencia) {
        const diasDisponibles = document.querySelectorAll('.dias-disponibles')[index];
        diasDisponibles.textContent = parseInt(diasDisponibles.textContent) + diferencia;
    }

    async function selectEmployee(row, employeeId, employeeName, employeeDays, employeePlanilla, employeeDepartamento, employeeInicioPlanilla, employeeDiasMinVT) {
        const allRows = document.querySelectorAll('#employee-table tbody tr');
        allRows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedEmployeeId = employeeId;
        selectedEmployeeName = employeeName;
        selectedEmployeeDays = employeeDays;
        selectedEmployeePlanilla = employeePlanilla;
        selectedEmployeeDepartamento = employeeDepartamento;
        selectedEmployeeInicioPlanilla = employeeInicioPlanilla;
        selectedEmployeeDiasMinVT = employeeDiasMinVT;
    
        // Calcular el período de vacaciones
        const periodo = await getPeriodoVacaciones(selectedEmployeeInicioPlanilla, selectedEmployeeId);
        
        updateEmployeeInfo(employeeId, periodo);
    
        employeeListToggle.classList.add('collapsed');
        employeeList.classList.add('collapsed');
        calendarContainer.style.display = 'block';
        calendarContainer.scrollIntoView({ behavior: 'smooth' });
        
        document.getElementById('calendar-container').style.display = 'block';
        document.getElementById('selected-employee-info').textContent = `${selectedEmployeeName} - Días disponibles: ${selectedEmployeeDays}`;
        initializeCalendar(periodo);
    }
    async function getVacationInfo(employeeId, periodo) {
        try {
            const connection = await odbc.connect(conexion);
            const query = `
                SELECT 
                    IFNULL(SUM(vt.DiasSolicitado), 0) + IFNULL(SUM(vp.DiasSolicitado), 0) AS DiasTomados,
                    pe.DiasMinVT
                FROM personal pe
                INNER JOIN puestos p ON pe.Id_Puesto = p.Id_Puesto
                LEFT JOIN vacacionestomadas vt ON pe.Id = vt.IdPersonal AND vt.Periodo = ?
                LEFT JOIN vacacionespagadas vp ON pe.Id = vp.IdPersonal AND vp.Periodo = ? AND vp.Estado IN (1,2,3)
                WHERE pe.Id = ?
                GROUP BY pe.Id, pe.DiasMinVT
            `;
            const result = await connection.query(query, [periodo, periodo, employeeId]);
            await connection.close();
            
            return result[0] || { DiasTomados: 0, DiasMinVT: 0 };
        } catch (error) {
            console.error('Error getting vacation info:', error);
            throw error;
        }
    }
    let calendar;
    async function getPeriodoVacaciones(inicioPlanilla, idPersonal) {
        try {
            const connection = await odbc.connect(conexion);
            
            const query = `
                SELECT 
                    CONCAT(
                        DATE_FORMAT(p.FechaInicio, '%Y-%m-%d'), 
                        ' al ', 
                        DATE_FORMAT(DATE_ADD(p.FechaInicio, INTERVAL 1 YEAR) - INTERVAL 1 DAY, '%Y-%m-%d')
                    ) AS Periodo,
                    COALESCE(
                        (SELECT SUM(DiasSolicitado)
                         FROM vacacionespagadas
                         WHERE IdPersonal = ? 
                           AND Periodo = CONCAT(DATE_FORMAT(p.FechaInicio, '%Y-%m-%d'), ' al ', DATE_FORMAT(DATE_ADD(p.FechaInicio, INTERVAL 1 YEAR) - INTERVAL 1 DAY, '%Y-%m-%d'))
                        ), 0
                    ) +
                    COALESCE(
                        (SELECT SUM(DiasSolicitado)
                         FROM vacacionestomadas
                         WHERE IdPersonal = ? 
                           AND Periodo = CONCAT(DATE_FORMAT(p.FechaInicio, '%Y-%m-%d'), ' al ', DATE_FORMAT(DATE_ADD(p.FechaInicio, INTERVAL 1 YEAR) - INTERVAL 1 DAY, '%Y-%m-%d'))
                        ), 0
                    ) AS DiasUsados
                FROM 
                    (
                        SELECT DATE_ADD(STR_TO_DATE(?, '%Y-%m-%d'), INTERVAL n YEAR) AS FechaInicio
                        FROM (
                            SELECT a.N + b.N * 10 + c.N * 100 AS n
                            FROM (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
                            CROSS JOIN (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
                            CROSS JOIN (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
                        ) as nums
                    ) AS p
                HAVING DiasUsados < 15
                ORDER BY p.FechaInicio
                LIMIT 1
            `;
    
            const result = await connection.query(query, [idPersonal, idPersonal, inicioPlanilla]);
            await connection.close();
    
            if (result.length > 0) {
                return result[0].Periodo;
            } else {
                throw new Error('No se pudo determinar el período de vacaciones');
            }
        } catch (error) {
            console.error('Error getting vacation period:', error);
            throw error;
        }
    }

    async function saveVacationDays(start, end, totalDays) {
        showLoader();
        try {
            const currentViewDate = calendar.currentViewDate || start;
            const connection = await odbc.connect(conexion);
            let remainingDays = totalDays;
            let currentDate = new Date(start);
    
            const periodo = await getPeriodoVacaciones(selectedEmployeeInicioPlanilla, selectedEmployeeId);
            
            if (!periodo) {
                throw new Error('No se pudo determinar el período de vacaciones');
            }
            
            const vacationInfo = await getVacationInfo(selectedEmployeeId, periodo);
            const totalDiasTomados = vacationInfo.DiasTomados + totalDays;
            const diasMinimos = selectedEmployeeDiasMinVT;

            const esAdmin = await tienePermiso123();

            // Modificamos esta parte para incluir la nueva condición
            if (!esAdmin && diasMinimos > 1 && totalDiasTomados < 15 * 0.5 && totalDays < diasMinimos) {
                throw new Error(`Debe seleccionar al menos ${diasMinimos} días de vacaciones.`);
            }
    
            while (remainingDays > 0) {
                const periodo = await getPeriodoVacaciones(selectedEmployeeInicioPlanilla, selectedEmployeeId);
                
                if (!periodo) {
                    throw new Error('No se pudo determinar el período de vacaciones');
                }
    
                // Obtener los días ya usados en este período
                const [periodoInicio, periodoFin] = periodo.split(' al ');
                const queryDiasUsados = `
                    SELECT IFNULL(SUM(DiasSolicitado), 0) AS DiasUsados
                    FROM (
                        SELECT DiasSolicitado FROM vacacionespagadas WHERE Periodo = ? AND IdPersonal = ? AND Estado IN (1,2,3)
                        UNION ALL
                        SELECT DiasSolicitado FROM vacacionestomadas WHERE Periodo = ? AND IdPersonal = ?
                    ) AS vacaciones
                `;
                const resultDiasUsados = await connection.query(queryDiasUsados, [periodo, selectedEmployeeId, periodo, selectedEmployeeId]);
                const diasUsados = resultDiasUsados[0].DiasUsados;
                const diasDisponibles = 15 - diasUsados;
    
                const diasAGuardar = Math.min(remainingDays, diasDisponibles);
    
                // Guardar cada fecha individual
                for (let i = 0; i < diasAGuardar; i++) {
                    if (currentDate >= end) break;
    
                    if (!esFechaNoValida(currentDate)) {
                        const query = `
                            INSERT INTO vacacionestomadas 
                            (IdPersonal, IdPlanilla, IdDepartamento, IdEncargadoRegistra, DiasSolicitado, Periodo, FechasTomadas) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `;
                        await connection.query(query, [
                            selectedEmployeeId, 
                            selectedEmployeePlanilla, 
                            selectedEmployeeDepartamento, 
                            idencargado, 
                            1, // Cada inserción es para un día
                            periodo,
                            currentDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
                        ]);
                        remainingDays--;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
    
            await connection.close();
    
            const periodoCompleto = await verificarDiasVacacionesCompletos(selectedEmployeeId, periodo);
            if (periodoCompleto) {
                // Obtener información del empleado
                const employeeInfo = await getEmployeeInfo(selectedEmployeeId);
                
                // Generar y descargar el PDF
                await generateVacationDocument(selectedEmployeeId, periodo, employeeInfo.NombreCompleto, employeeInfo.No_DPI, employeeInfo.Nombre_Planilla);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Período de vacaciones completado',
                    text: 'Se ha generado automáticamente el documento de vacaciones.',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Vacaciones guardadas',
                    text: 'Las vacaciones han sido registradas correctamente.',
                });
            }
    
            // Actualizar la lista de empleados y el calendario
            await updateEmployeeInfo(selectedEmployeeId);
            await loadEmployeeList();
            await initializeCalendar();
            calendar.gotoDate(currentViewDate);
        } catch (error) {
            console.error('Error saving vacation days:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Hubo un problema al guardar las vacaciones. Por favor, intente nuevamente.',
            });
        }
        hideLoader();
    }
    async function getEmployeeInfo(employeeId) {
        try {
            const connection = await conectar();
            const query = `
                SELECT 
                    CONCAT(Primer_Nombre, ' ', IFNULL(Segundo_Nombre, ''), ' ', Primer_Apellido, ' ', IFNULL(Segundo_Apellido, '')) AS NombreCompleto,
                    No_DPI,
                    planillas.Nombre_Planilla
                FROM personal
                JOIN planillas ON personal.Id_Planilla = planillas.Id_Planilla
                WHERE personal.Id = ?
            `;
            const [result] = await connection.query(query, [employeeId]);
            await connection.close();
            return result;
        } catch (error) {
            console.error('Error al obtener información del empleado:', error);
            throw error;
        }
    }
    const sectionHeaders = document.querySelectorAll('.form-section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
        });
    });
    const FechaFestivos = [
        { month: 0, day: 1 }, // Año Nuevo
        { month: 4, day: 1 }, // Día del Trabajo
        { month: 5, day: 30 }, // Día del Ejército
        { month: 8, day: 15 }, // Día de la Independencia
        { month: 9, day: 20 }, // Día de la Revolución
        { month: 10, day: 1 }, // Día de Todos los Santos
        { month: 11, day: 1 }, // Navidad
        { month: 11, day: 2 },
        { month: 11, day: 3 },
        { month: 11, day: 4 },
        { month: 11, day: 5 },
        { month: 11, day: 6 },
        { month: 11, day: 7 },
        { month: 11, day: 8 },
        { month: 11, day: 9 },
        { month: 11, day: 10 },
        { month: 11, day: 11 },
        { month: 11, day: 12 },
        { month: 11, day: 13 },
        { month: 11, day: 14 },
        { month: 11, day: 15 },
        { month: 11, day: 16 },
        { month: 11, day: 17 },
        { month: 11, day: 18 },
        { month: 11, day: 19 },
        { month: 11, day: 20 },
        { month: 11, day: 21 },
        { month: 11, day: 22 },
        { month: 11, day: 23 },
        { month: 11, day: 24 },
        { month: 11, day: 25 },
        { month: 11, day: 26 },
        { month: 11, day: 27 },
        { month: 11, day: 28 },
        { month: 11, day: 29 },
        { month: 11, day: 30 },
        { month: 11, day: 31 },
    ];
    // Función para determinar si es Semana Santa
    function esSemanaSanta(fecha) {
        const anio = fecha.getFullYear();
        const a = anio % 19;
        const b = Math.floor(anio / 100);
        const c = anio % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const mesPascua = Math.floor((h + l - 7 * m + 114) / 31);
        const diaPascua = ((h + l - 7 * m + 114) % 31) + 1;
        const pascua = new Date(anio, mesPascua - 1, diaPascua);
    
        const domingoRamos = new Date(pascua);
        domingoRamos.setDate(pascua.getDate() - 7);
    
        const juevesSanto = new Date(pascua);
        juevesSanto.setDate(pascua.getDate() - 3);
    
        const viernesSanto = new Date(pascua);
        viernesSanto.setDate(pascua.getDate() - 2);
    
        const domingoResurreccion = pascua;
    
        return fecha >= domingoRamos && fecha <= domingoResurreccion;
    }
    async function getVacationDates(employeeId) {
        try {
            const connection = await odbc.connect(conexion);
            const query = `
                SELECT FechasTomadas
                FROM vacacionestomadas
                WHERE IdPersonal = ?
            `;
            const result = await connection.query(query, [employeeId]);
            await connection.close();
            return result.map(row => {
                // Ajustar la fecha para manejar el desfase de zona horaria
                const date = new Date(row.FechasTomadas);
                return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            });
        } catch (error) {
            console.error('Error fetching vacation dates:', error);
            return [];
        }
    }
    async function verificarDiasVacacionesCompletos(employeeId, periodo) {
        try {
            const connection = await odbc.connect(conexion);
            const query = `
                SELECT 
                    IFNULL(SUM(CASE WHEN tipo = 'tomadas' THEN dias ELSE 0 END), 0) AS DiasTomados,
                    IFNULL(SUM(CASE WHEN tipo = 'pagadas' THEN dias ELSE 0 END), 0) AS DiasPagados
                FROM (
                    SELECT 'tomadas' AS tipo, DiasSolicitado AS dias 
                    FROM vacacionestomadas 
                    WHERE IdPersonal = ? AND Periodo = ?
                    UNION ALL
                    SELECT 'pagadas' AS tipo, DiasSolicitado AS dias 
                    FROM vacacionespagadas 
                    WHERE IdPersonal = ? AND Periodo = ? AND Estado IN (1,2,3)
                ) AS vacaciones
            `;
            const [result] = await connection.query(query, [employeeId, periodo, employeeId, periodo]);
            await connection.close();
    
            const totalDiasConsumidos = result.DiasTomados + result.DiasPagados;
            return totalDiasConsumidos >= 15;
        } catch (error) {
            console.error('Error al verificar días de vacaciones completos:', error);
            return false;
        }
    }
    async function confirmarEliminarVacacion(fecha) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        if (fecha < today) {
            Swal.fire({
                icon: 'error',
                title: 'Acción no permitida',
                text: 'No se pueden eliminar fechas de vacaciones pasadas.',
            });
            return;
        }
    
        if (await tienePermiso123()) {
            const result = await Swal.fire({
                title: '¿Eliminar vacación?',
                text: `¿Estás seguro de que quieres eliminar la vacación del ${fecha.toLocaleDateString()}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });
    
            if (result.isConfirmed) {
                await eliminarVacacion(fecha);
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Permiso denegado',
                text: 'No tienes permiso para eliminar fechas de vacaciones.',
            });
        }
    }
    
    async function eliminarVacacion(fecha) {
        if (!await tienePermiso123()) {
            Swal.fire({
                icon: 'error',
                title: 'Permiso denegado',
                text: 'No tienes permiso para eliminar fechas de vacaciones.',
            });
            return;
        }
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        if (fecha < today) {
            Swal.fire({
                icon: 'error',
                title: 'Acción no permitida',
                text: 'No se pueden eliminar fechas de vacaciones pasadas.',
            });
            return;
        }
    
        let connection;
        try {
            connection = await odbc.connect(conexion);
    
            // Iniciar transacción
            await connection.query('START TRANSACTION');
    
            // Primero, insertar en la tabla FechasVacacionesEliminadas
            const insertQuery = `
                INSERT INTO FechasVacacionesEliminadas 
                (IdPersonal, FechaTomada, FechaEliminacion, IdEncargadoelimino)
                VALUES (?, ?, CURDATE(), ?)
            `;
            await connection.query(insertQuery, [
                selectedEmployeeId,
                fecha.toISOString().split('T')[0],
                idencargado
            ]);
    
            // Luego, eliminar de la tabla vacacionestomadas
            const deleteQuery = `
                DELETE FROM vacacionestomadas 
                WHERE IdPersonal = ? AND FechasTomadas = ?
            `;
            await connection.query(deleteQuery, [selectedEmployeeId, fecha.toISOString().split('T')[0]]);
    
            // Confirmar transacción
            await connection.query('COMMIT');
    
            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'La fecha de vacación ha sido eliminada y registrada.',
            });
    
            // Actualizar la información del empleado y el calendario
            await updateEmployeeInfo(selectedEmployeeId);
            await loadEmployeeList();
            await initializeCalendar();
        } catch (error) {
            // Si hay un error, revertir la transacción
            if (connection) {
                await connection.query('ROLLBACK');
            }
            console.error('Error eliminando vacación:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al eliminar la fecha de vacación: ' + error.message,
            });
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    async function initializeCalendar() {
        if (calendar) {
            calendar.destroy();
        }
    
        const vacationDates = await getVacationDates(selectedEmployeeId);
        const permiso001 = await tienePermiso123();
    
        const calendarEl = document.getElementById('vacation-calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            selectable: true,
            headerToolbar: {
                left: 'prev,next today monthYearSelector',
                center: 'title',
                right: 'today prev,next'
            },
            dateClick: async function(info) {
                const clickedDate = info.date;
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Establecer la hora a medianoche para comparar solo fechas
    
                if (esFechaVacaciones(clickedDate, vacationDates)) {
                    if (await tienePermiso123()) {
                        if (clickedDate >= today) {
                            confirmarEliminarVacacion(clickedDate);
                        } else {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Acción no permitida',
                                text: 'No se pueden eliminar fechas de vacaciones pasadas.',
                            });
                        }
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Permiso denegado',
                            text: 'No tienes permiso para eliminar fechas de vacaciones.',
                        });
                    }
                } else if (!esFechaNoValida(clickedDate) && (clickedDate >= today || permiso123)) {
                    // Aquí puedes mantener la lógica existente para agregar nuevas fechas
                    // O puedes llamar a una función separada para manejar la adición de nuevas fechas
                }
            },
            customButtons: {
                monthYearSelector: {
                    text: 'Seleccionar Mes/Año',
                    click: function() {
                        showMonthYearSelector();
                    }
                }
            },
            datesSet: function(info) {
                calendar.currentViewDate = info.view.currentStart;
            },
            locale: 'es',
            headerToolbar: {
                left: 'prev,next today monthYearSelector',
                center: 'title'
            },
            dayCellDidMount: function(info) {
                const date = info.date;
                const dayOfWeek = date.getDay();
    
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    info.el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                }
    
                const isFestivo = FechaFestivos.some(festivo => 
                    festivo.month === date.getMonth() && festivo.day === date.getDate()
                );
                if (isFestivo) {
                    info.el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                }
    
                if (esSemanaSanta(date)) {
                    info.el.style.backgroundColor = 'rgba(128, 0, 128, 0.1)';
                }
    
                // Marcar días de vacaciones registrados
                if (esFechaVacaciones(date, vacationDates)) {
                    info.el.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
                    info.el.classList.add('fc-day-disabled');
                }
            },
            selectAllow: function(selectInfo) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const isAfterToday = selectInfo.start >= today || permiso001;
                const isStartValid = !esFechaNoValida(selectInfo.start);
                let isEndValid = true;

                // Verificar si es una selección de un solo día
                const isSingleDaySelection = selectInfo.start.getTime() === selectInfo.end.getTime() - 86400000;

                if (!isSingleDaySelection) {
                    // Para selecciones de múltiples días, ajustar si termina en sábado
                    if (selectInfo.end.getDay() === 6) {
                        selectInfo.end = new Date(selectInfo.end.getTime() - 86400000);
                    }
                    isEndValid = !esFechaNoValida(new Date(selectInfo.end.getTime() - 86400000));
                }

                const isNotVacationStart = !esFechaVacaciones(selectInfo.start, vacationDates);
                const isNotVacationEnd = !esFechaVacaciones(new Date(selectInfo.end.getTime() - 86400000), vacationDates);

                console.log('Fecha seleccionada:', selectInfo.start);
                console.log('Es después de hoy:', isAfterToday);
                console.log('Inicio válido:', isStartValid);
                console.log('Fin válido:', isEndValid);
                console.log('No es vacación (inicio):', isNotVacationStart);
                console.log('No es vacación (fin):', isNotVacationEnd);
                console.log('Es selección de un solo día:', isSingleDaySelection);

                return isAfterToday && isStartValid && isEndValid && isNotVacationStart && isNotVacationEnd;
            },
            select: async function(info) {
                const start = info.start;
                const end = info.end;
                const days = contarDiasValidos(start, end, vacationDates);

                if (days > selectedEmployeeDays) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Exceso de días',
                        text: `Has seleccionado ${days} día(s), pero solo tienes ${selectedEmployeeDays} días disponibles.`,
                    });
                    return;
                }

                try {
                    const periodo = await getPeriodoVacaciones(selectedEmployeeInicioPlanilla, selectedEmployeeId);

                    const connection = await odbc.connect(conexion);
                    const queryDiasUsados = `
                        SELECT 
                            IFNULL(SUM(CASE WHEN tipo = 'tomadas' THEN dias ELSE 0 END), 0) AS DiasTomados,
                            IFNULL(SUM(CASE WHEN tipo = 'pagadas' THEN dias ELSE 0 END), 0) AS DiasPagados
                        FROM (
                            SELECT 'tomadas' AS tipo, DiasSolicitado AS dias 
                            FROM vacacionestomadas 
                            WHERE IdPersonal = ? AND Periodo = ?
                            UNION ALL
                            SELECT 'pagadas' AS tipo, DiasSolicitado AS dias 
                            FROM vacacionespagadas 
                            WHERE IdPersonal = ? AND Periodo = ? AND Estado IN (1,2,3)
                        ) AS vacaciones
                    `;
                    const [vacationInfo] = await connection.query(queryDiasUsados, [selectedEmployeeId, periodo, selectedEmployeeId, periodo]);
                    await connection.close();
                    
                    const diasTotalesUsados = vacationInfo.DiasTomados + vacationInfo.DiasPagados;
                    const diasDisponibles = 15 - diasTotalesUsados;
                    const esAdmin = await tienePermiso123();
                    if (!esAdmin && selectedEmployeeDiasMinVT > 1) {  // Añadimos esta condición
                        if (diasTotalesUsados >= 7.5) { // Más del 50% de los días ya utilizados
                            if (days < diasDisponibles) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Días insuficientes',
                                    text: `Debe seleccionar todos los ${diasDisponibles} días restantes del periodo.`,
                                });
                                return;
                            }
                        } else {
                            if (days < selectedEmployeeDiasMinVT) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Días insuficientes',
                                    text: `Debe seleccionar al menos ${selectedEmployeeDiasMinVT} días de vacaciones.`,
                                });
                                return;
                            }
                        }
                    }

                    let message;
                    if (days === 1) {
                        message = `
                            <p>Fecha: ${start.toLocaleDateString('es-ES')}</p>
                            <p>Días solicitados: 1</p>
                            <p>Período: ${periodo}</p>
                        `;
                    } else {
                        const endDate = new Date(end.getTime() - 1);
                        message = `
                            <p>Fecha de inicio: ${start.toLocaleDateString('es-ES')}</p>
                            <p>Fecha de fin: ${endDate.toLocaleDateString('es-ES')}</p>
                            <p>Días solicitados: ${days}</p>
                            <p>Período: ${periodo}</p>
                        `;
                    }

                    Swal.fire({
                        title: days === 1 ? 'Confirmar fecha de vacaciones' : 'Confirmar rango de vacaciones',
                        html: message,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Guardar',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            saveVacationDays(start, end, days);
                        }
                    });
                } catch (error) {
                    console.error('Error al validar las vacaciones:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un problema al validar las vacaciones. Por favor, intente nuevamente.',
                    });
                }
            }
        });
        calendar.render();
    }
    
    function esFechaVacaciones(date, vacationDates) {
        return vacationDates.some(vDate => 
            vDate.getDate() === date.getDate() && 
            vDate.getMonth() === date.getMonth() && 
            vDate.getFullYear() === date.getFullYear()
        );
    }
    function showMonthYearSelector() {
        const currentDate = calendar.getDate();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const years = [];
        for (let i = currentYear - 10; i <= currentYear + 5; i++) {
            years.push(i);
        }

        const months = [
            {value: 0, name: 'Enero'}, {value: 1, name: 'Febrero'}, 
            {value: 2, name: 'Marzo'}, {value: 3, name: 'Abril'},
            {value: 4, name: 'Mayo'}, {value: 5, name: 'Junio'},
            {value: 6, name: 'Julio'}, {value: 7, name: 'Agosto'},
            {value: 8, name: 'Septiembre'}, {value: 9, name: 'Octubre'},
            {value: 10, name: 'Noviembre'}, {value: 11, name: 'Diciembre'}
        ];

        Swal.fire({
            title: 'Seleccionar Mes y Año',
            html:
                '<div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">' +
                '<select id="swal-month" class="swal2-select" style="width: 90%; max-width: 250px;">' +
                months.map(m => `<option value="${m.value}" ${m.value === currentMonth ? 'selected' : ''}>${m.name}</option>`).join('') +
                '</select>' +
                '<select id="swal-year" class="swal2-select" style="width: 90%; max-width: 250px;">' +
                years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('') +
                '</select>' +
                '</div>',
            focusConfirm: false,
            width: '300px',
            customClass: {
                container: 'my-swal-container'
            },
            preConfirm: () => {
                const month = document.getElementById('swal-month').value;
                const year = document.getElementById('swal-year').value;
                calendar.gotoDate(new Date(year, month, 1));
            }
        });

        // Estilo adicional para asegurar que los selectores se muestren completamente
        const style = document.createElement('style');
        style.textContent = `
            .my-swal-container .swal2-html-container {
                margin: 1em 0 !important;
                overflow: visible !important;
            }
            .my-swal-container .swal2-select {
                padding-right: 25px !important;
            }
        `;
        document.head.appendChild(style);
    }

    function esFechaNoValida(date) {
        const dayOfWeek = date.getDay();
        const isFestivo = FechaFestivos.some(festivo => 
            festivo.month === date.getMonth() && festivo.day === date.getDate()
        );
        return dayOfWeek === 0 || dayOfWeek === 6 ||isFestivo || esSemanaSanta(date); 
    }

    function contarDiasValidos(start, end) {
        let count = 0;
        let currentDate = new Date(start);
        while (currentDate < end) {
            if (!esFechaNoValida(currentDate)) {
                count++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return count;
    }
    async function Listadopagosporautorizar() {
        showLoader();
        try {
            const connection = await conectar();
            
            // Cargar los departamentos en el combobox
            await cargarDepartamentosPagosVacaciones();
            
            const query = `
                SELECT 
                    vacacionespagadas.Idpagovacas, 
                    CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                    vacacionespagadas.FechaRegistro,
                    vacacionespagadas.DiasSolicitado,
                    vacacionespagadas.Periodo,
                    planillas.Nombre_Planilla,
                    departamentos.Nombre AS NombreDepartamento,
                    departamentos.Id_Departamento,
                    CONCAT(encargado.Primer_Nombre, ' ', IFNULL(encargado.Segundo_Nombre, ''), ' ', encargado.Primer_Apellido, ' ', IFNULL(encargado.Segundo_Apellido, '')) AS NombreEncargado,
                    IF(planillas.tipo = 1, salariosbase.SalarioDiarioGuate, salariosbase.SalarioDiario) AS SalarioDiario,
                    ROUND(IF(planillas.tipo = 1, salariosbase.SalarioDiarioGuate, salariosbase.SalarioDiario) * vacacionespagadas.DiasSolicitado, 2) AS SalarioTotal
                FROM vacacionespagadas
                INNER JOIN personal ON vacacionespagadas.IdPersonal = personal.Id
                INNER JOIN planillas ON vacacionespagadas.IdPlanilla = planillas.Id_Planilla
                INNER JOIN departamentos ON vacacionespagadas.IdDepartamento = departamentos.Id_Departamento
                INNER JOIN personal AS encargado ON vacacionespagadas.IdEncargado = encargado.Id
                LEFT JOIN salariosbase ON salariosbase.Anyo = SUBSTRING_INDEX(SUBSTRING_INDEX(vacacionespagadas.Periodo, 'al', -1), '-', 1) AND planillas.Id_Planilla = vacacionespagadas.IdPlanilla
                WHERE vacacionespagadas.Estado = 1
            `;
            const result = await connection.query(query);
            await connection.close();
    
            const tableBody = document.querySelector('#pago-vacaciones-table tbody');
            
            function renderTable(data) {
                tableBody.innerHTML = '';
                data.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.Idpagovacas}</td>
                        <td>${row.NombreCompleto}</td>
                        <td>${formatofecha(row.FechaRegistro)}</td>
                        <td>${row.DiasSolicitado}</td>
                        <td>${formatPeriodo(row.Periodo)}</td>
                        <td>${row.Nombre_Planilla}</td>
                        <td>${row.NombreDepartamento}</td>
                        <td>${row.NombreEncargado}</td>
                        <td>${formatCurrency(row.SalarioDiario)}</td>
                        <td><input type="number" value="${row.SalarioTotal}" step="0.01" min="0" class="salario-total-input"></td>
                        <td>
                            <button class="save-button" data-id="${row.Idpagovacas}">Autorizar</button></td>
                        <td><button class="anular-button" data-id="${row.Idpagovacas}">Anulación</button></td>
                    `;
                    tableBody.appendChild(tr);
                });
    
                // Agregar event listeners a los botones
                document.querySelectorAll('.save-button').forEach(button => {
                    button.addEventListener('click', (event) => RegistroAutorizacion(event.target.dataset.id));
                });
                document.querySelectorAll('.anular-button').forEach(button => {
                    button.addEventListener('click', (event) => Anularpagodevacaciones(event.target.dataset.id));
                });
            }
    
            renderTable(result);
    
            // Agregar evento de cambio al combobox de departamentos
            document.getElementById('departamento-filter-pago').addEventListener('change', function() {
                const selectedDepartamento = this.value;
                const filteredData = selectedDepartamento 
                    ? result.filter(row => row.Id_Departamento.toString() === selectedDepartamento)
                    : result;
                renderTable(filteredData);
            });
    
        } catch (error) {
            console.error('Error loading pago vacaciones:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los datos de pago de vacaciones.',
            });
        }
        hideLoader();
    }
    async function Anularpagodevacaciones(id) {
        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: "Esta acción anulará el pago de vacaciones",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, anular',
                cancelButtonText: 'Cancelar'
            });
    
            if (result.isConfirmed) {
                const connection = await odbc.connect(conexion);
                
                // Obtener la fecha actual en formato MySQL (YYYY-MM-DD HH:MM:SS)
                const fechaAnulacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
                
                const query = `
                    UPDATE vacacionespagadas
                    SET Estado = 4, IdPerAutAnu = ?, FechaAutAnu = ?
                    WHERE Idpagovacas = ?
                `;
                await connection.query(query, [idencargado, fechaAnulacion, id]);
                await connection.close();
    
                Swal.fire(
                    'Anulado',
                    'El pago de vacaciones ha sido anulado.',
                    'success'
                );
    
                // Recargar los datos para reflejar los cambios
                await Listadopagosporautorizar();
            }
        } catch (error) {
            console.error('Error anulando pago de vacaciones:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al anular el pago de vacaciones.',
            });
        }
    }

    async function RegistroAutorizacion(id) {
        try {
            const row = document.querySelector(`button[data-id="${id}"]`).closest('tr');
            const salarioTotalInput = row.querySelector('.salario-total-input');
            const salarioTotal = parseFloat(salarioTotalInput.value);
    
            if (isNaN(salarioTotal) || salarioTotal < 0) {
                throw new Error('El salario total debe ser un número válido y no negativo.');
            }
    
            const fechaPago = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
            const connection = await odbc.connect(conexion);
            const query = `
                UPDATE vacacionespagadas
                SET TotalaRecibir = ?, IdPerAutAnu = ?, FechaAutAnu = ?, Estado = 2
                WHERE Idpagovacas = ?
            `;
            await connection.query(query, [salarioTotal, idencargado, fechaPago, id]);
            await connection.close();
    
            Swal.fire({
                icon: 'success',
                title: 'Guardado exitoso',
                text: 'Los datos se han guardado correctamente.',
            });
    
            await Listadopagosporautorizar();
        } catch (error) {
            console.error('Error saving vacation payment:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar los datos del pago de vacaciones: ' + error.message,
            });
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount);
    }
    async function DocVacacionesTomadas() {
        showLoader();
        try {
            const connection = await conectar();
            
            // Verificar si el usuario tiene la transacción 123
            const permiso123 = await tienePermiso123();
    
            let query;
            let queryParams = [];
    
            if (permiso123) {
                query = `
                    SELECT
                        vacacionestomadas.IdPersonal, 
                        CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto, 
                        personal.No_DPI, 
                        planillas.Nombre_Planilla,
                        vacacionestomadas.Periodo, 
                        COUNT(*) AS CantidadDatos
                    FROM
                        vacacionestomadas
                        INNER JOIN personal ON vacacionestomadas.IdPersonal = personal.Id
                        INNER JOIN planillas ON vacacionestomadas.IdPlanilla = planillas.Id_Planilla
                    GROUP BY
                        vacacionestomadas.IdPersonal, 
                        vacacionestomadas.Periodo
                `;
            } else {
                query = `
                    SELECT
                        vacacionestomadas.IdPersonal, 
                        CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto, 
                        personal.No_DPI, 
                        planillas.Nombre_Planilla,
                        vacacionestomadas.Periodo, 
                        COUNT(*) AS CantidadDatos
                    FROM
                        vacacionestomadas
                        INNER JOIN personal ON vacacionestomadas.IdPersonal = personal.Id
                        INNER JOIN planillas ON vacacionestomadas.IdPlanilla = planillas.Id_Planilla
                    WHERE
                        vacacionestomadas.IdDepartamento = ?
                    GROUP BY
                        vacacionestomadas.IdPersonal, 
                        vacacionestomadas.Periodo
                `;
                queryParams.push(idDepartamento);
            }
    
            const result = await connection.query(query, queryParams);
            await connection.close();
    
            const tableBody = document.querySelector('#doc-vacaciones-tomadas-table tbody');
            tableBody.innerHTML = '';
    
            result.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.IdPersonal}</td>
                    <td>${row.NombreCompleto}</td>
                    <td>${row.No_DPI}</td>
                    <td>${row.Nombre_Planilla}</td>
                    <td>${row.Periodo}</td>
                    <td>${row.CantidadDatos}</td>
                    <td><button class="generate-btn">Generar</button></td>
                `;
                const generateBtn = tr.querySelector('.generate-btn');
                generateBtn.addEventListener('click', () => generateVacationDocument(row.IdPersonal, row.Periodo, row.NombreCompleto, row.No_DPI, row.Nombre_Planilla));
                tableBody.appendChild(tr);
            });
            setupDocVacacionesSearch();
        } catch (error) {
            console.error('Error loading vacation documentation:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar la documentación de vacaciones tomadas.',
            });
        }
        hideLoader();
    }
    
    async function generateVacationDocument(idPersonal, periodo, nombreCompleto, noDPI, nombrePlanilla) {
        try {
            const connection = await odbc.connect(conexion);
            const query = `
                SELECT v.FechasTomadas
                FROM vacacionestomadas v
                WHERE v.IdPersonal = ? AND v.Periodo = ?
                ORDER BY v.FechasTomadas
            `;
            const result = await connection.query(query, [idPersonal, periodo]);
            await connection.close();
    
            if (result.length === 0) {
                throw new Error('No se encontraron datos de vacaciones para este empleado y periodo.');
            }
    
            // Crear el documento PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
    
            // Configurar fuente y tamaño
            doc.setFont("helvetica");
            doc.setFontSize(12);
    
            // Funciones auxiliares
            const addHeaderFooter = () => {
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(nombrePlanilla.toUpperCase(), 105, 15, { align: "center" });
                doc.setFontSize(10);
                doc.text("DEPARTAMENTO DE RECURSOS HUMANOS", 105, 22, { align: "center" });
                doc.text("FICHA DE CONTROL DE PERÍODO DE VACACIONES", 105, 29, { align: "center" });
                doc.setFont("helvetica", "normal");
                doc.line(20, 31, 190, 31);
            };
    
            // Función para formatear fecha a DD/MM/AAAA
            const formatearFecha = (fechaStr) => {
                const [year, month, day] = fechaStr.split('-');
                return `${day}/${month}/${year}`;
            };
    
            // Agregar encabezado
            addHeaderFooter();
    
            // Agregar información del empleado
            doc.setFontSize(11);
            doc.text("NOMBRE:", 20, 40);
            doc.text(nombreCompleto, 40, 40);
            doc.text("DPI:", 20, 48);
            doc.text(noDPI, 30, 48);
    
            // Agregar período de vacaciones
            doc.text("PERIODO DE VACACIONES", 20, 60);
            doc.text("DEL:", 20, 68);
            doc.text("AL:", 60, 68);
    
            const [fechaInicio, fechaFin] = periodo.split(' al ');
            doc.text(formatearFecha(fechaInicio), 35, 68);
            doc.text(formatearFecha(fechaFin), 70, 68);
    
            // Agregar tabla de fechas
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("FECHAS DIAS VACACIONES", 105, 80, { align: "center" });
            doc.line(20, 83, 190, 83);
            doc.text("NO.", 25, 88);
            doc.text("FECHA DESCANSO", 60, 88);
            doc.text("FIRMA COLABORADOR", 140, 88);
            doc.setFont("helvetica", "normal");
            doc.line(20, 91, 190, 91);
    
            let y = 99;
            result.forEach((row, index) => {
                if (y > 260) {
                    doc.addPage();
                    addHeaderFooter();
                    y = 40;
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text("NO.", 25, y);
                    doc.text("FECHA DESCANSO", 60, y);
                    doc.text("FIRMA COLABORADOR", 140, y);
                    doc.setFont("helvetica", "normal");
                    doc.line(20, y + 3, 190, y + 3);
                    y += 10;
                }
    
                // Corregir el problema de la zona horaria y formatear la fecha
                const fecha = new Date(row.FechasTomadas + 'T00:00:00Z');
                const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    timeZone: 'UTC'
                });
    
                doc.text((index + 1).toString(), 27, y);
                doc.text(fechaFormateada, 62, y);
                doc.line(25, y + 5, 185, y + 5); // Línea para firma extendida
                y += 10;
            });
            // Guardar el PDF
            doc.save(`Vacaciones_${nombreCompleto}_${periodo}.pdf`);
    
            // Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: 'Documento generado',
                text: 'El documento de vacaciones se ha generado correctamente.',
            });
    
        } catch (error) {
            console.error('Error generating vacation document:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al generar el documento de vacaciones: ' + error.message,
            });
        }
    }
    function setupDocVacacionesSearch() {
        const searchInput = document.getElementById('doc-vacaciones-search');
        searchInput.addEventListener('input', filterDocVacaciones);
    }
    
    function filterDocVacaciones() {
        const searchInput = document.getElementById('doc-vacaciones-search');
        const filter = searchInput.value.toLowerCase();
        const table = document.getElementById('doc-vacaciones-tomadas-table');
        const tr = table.getElementsByTagName('tr');
    
        for (let i = 1; i < tr.length; i++) {
            const td = tr[i].getElementsByTagName('td')[1]; // Índice 1 corresponde a la columna "Nombre Completo"
            if (td) {
                const txtValue = td.textContent || td.innerText;
                if (isFlexibleMatch(txtValue, filter)) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
    
    function isFlexibleMatch(fullText, searchText) {
        const fullTextLower = fullText.toLowerCase();
        const searchTerms = searchText.toLowerCase().split(/\s+/);
        return searchTerms.every(term => fullTextLower.includes(term));
    }
    function formatPeriodo(periodo) {
        const [inicio, fin] = periodo.split(' al ');
        return `${formatofecha(inicio)} al ${formatofecha(fin)}`;
    }
    function formatofecha(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    async function checkEmployeesNearingAnniversary() {
        try {
            const permiso123 = await tienePermiso123(idencargado);
            const connection = await conectar();
            
            let query;
            let queryParams = [];
    
            const baseQuery = `
                SELECT 
                    p.Id,
                    CONCAT(p.Primer_Nombre, ' ', IFNULL(p.Segundo_Nombre, ''), ' ', p.Primer_Apellido, ' ', IFNULL(p.Segundo_Apellido, '')) AS NombreCompleto,
                    p.Inicio_Planilla,
                    DATEDIFF(DATE_ADD(p.Inicio_Planilla, 
                        INTERVAL YEAR(CURDATE())-YEAR(p.Inicio_Planilla) + 
                        IF(DAYOFYEAR(CURDATE()) > DAYOFYEAR(p.Inicio_Planilla),1,0) YEAR),
                        CURDATE()) AS DiasRestantes,
                    d.Nombre AS NombreDepartamento,
                    ((DATEDIFF(NOW(), p.Inicio_Planilla) DIV 365 * 15) - IFNULL(vp.TotalDiasSolicitados, 0) - IFNULL(vt.TotalDiasSolicitados, 0)) AS DiasDisponibles
                FROM personal p
                INNER JOIN departamentos d ON p.Id_Departamento = d.Id_Departamento
                LEFT JOIN (
                    SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                    FROM vacacionespagadas
                    WHERE
                        Estado IN (1,2,3)
                    GROUP BY IdPersonal
                ) vp ON p.Id = vp.IdPersonal
                LEFT JOIN (
                    SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                    FROM vacacionestomadas
                    GROUP BY IdPersonal
                ) vt ON p.Id = vt.IdPersonal
                WHERE 
                    DATEDIFF(DATE_ADD(p.Inicio_Planilla, 
                        INTERVAL YEAR(CURDATE())-YEAR(p.Inicio_Planilla) + 
                        IF(DAYOFYEAR(CURDATE()) > DAYOFYEAR(p.Inicio_Planilla),1,0) YEAR),
                        CURDATE()) <= 30 AND
                        p.Estado IN (1,2)
            `;
    
            if (permiso123) {
                query = baseQuery + ' ORDER BY DiasDisponibles DESC';
            } else {
                query = baseQuery + ' AND p.Id_Departamento = ? ORDER BY DiasRestantes ASC';
                queryParams.push(idDepartamento);
            }
    
            const result = await connection.query(query, queryParams);
            await connection.close();
    
            if (result.length > 0) {
                const mensaje = permiso123 
                    ? `Hay ${result.length} Colaboradore(s) que cumplirán un nuevo periodo de vacaciones en los próximos 30 días.`
                    : `Hay ${result.length} Colaboradore(s) de tu departamento que cumplirán un nuevo perido de vacaciones en los próximos 30 días.`;
    
                Swal.fire({
                    title: 'Colaboradores próximos a cumplir un nuevo periodo de vacaciones',
                    text: mensaje,
                    icon: 'info',
                    confirmButtonText: 'Ver detalles'
                }).then((swalResult) => {
                    if (swalResult.isConfirmed) {
                        showAnniversaryEmployees(result);
                    }
                });
            }
    
            return result;
        } catch (error) {
            console.error('Error checking employees nearing anniversary:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al verificar los aniversarios de los colaboradores.',
            });
        }
    }
    
    function showAnniversaryEmployees(employees) {
        // Ocultar el saludo
        document.querySelector('.saludo-card').style.display = 'none';
    
        // Mostrar la sección de empleados próximos a aniversario
        const anniversarySection = document.getElementById('anniversary-employees-section');
        anniversarySection.style.display = 'block';
    
        const tableBody = document.querySelector('#anniversary-employees-table tbody');
        tableBody.innerHTML = ''; // Limpiar el contenido existente
    
        employees.forEach(employee => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${employee.NombreCompleto}</td>
                <td>${employee.NombreDepartamento}</td>
                <td class="center-align">${formatofecha(employee.Inicio_Planilla)}</td>
                <td class="days-remaining center-align">${employee.DiasRestantes}</td>
                <td class="days-accumulated center-align">${employee.DiasDisponibles}</td>
            `;
        });
    }   
    async function departamentostodos() {
        try {
            const connection = await conectar();
            const query = `SELECT Id_Departamento, Nombre FROM departamentos ORDER BY Nombre ASC`;
            const departamentos = await connection.query(query);
            await connection.close();
    
            const select = document.getElementById('departamento-select');
            select.innerHTML = '<option value="todos">Todos los departamentos</option>';
            departamentos.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.Id_Departamento;
                option.textContent = dept.Nombre;
                select.appendChild(option);
            });
    
            // Event listener para cambios en el combobox
            select.addEventListener('change', (e) => loadEmpleadosPorDepartamento(e.target.value));
        } catch (error) {
            console.error('Error loading departamentos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los departamentos.',
            });
        }
    }
    async function cargarDepartamentosPagosVacaciones() {
        try {
            const connection = await conectar();
            const query = `SELECT Id_Departamento, Nombre FROM departamentos ORDER BY Nombre ASC`;
            const departamentos = await connection.query(query);
            await connection.close();
    
            const select = document.getElementById('departamento-filter-pago');
            select.innerHTML = '<option value="">Todos los departamentos</option>';
            departamentos.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.Id_Departamento;
                option.textContent = dept.Nombre;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departamentos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los departamentos.',
            });
        }
    }
    // Nuevo: Función para cargar empleados por departamento
    async function loadEmpleadosPorDepartamento(departamentoId) {
        try {
            const connection = await conectar();
            let query = `
                SELECT 
                    p.Id,
                    CONCAT(p.Primer_Nombre, ' ', IFNULL(p.Segundo_Nombre, ''), ' ', p.Primer_Apellido, ' ', IFNULL(p.Segundo_Apellido, '')) AS NombreCompleto,
                    p.Inicio_Planilla,
                    d.Nombre AS NombreDepartamento,
                    ((DATEDIFF(NOW(), p.Inicio_Planilla) DIV 365 * 15) - IFNULL(vp.TotalDiasSolicitados, 0) - IFNULL(vt.TotalDiasSolicitados, 0)) AS DiasDisponibles
                FROM personal p
                INNER JOIN departamentos d ON p.Id_Departamento = d.Id_Departamento
                LEFT JOIN (
                    SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                    FROM vacacionespagadas
                    WHERE 
                        Estado IN (1,2,3)
                    GROUP BY IdPersonal
                ) vp ON p.Id = vp.IdPersonal
                LEFT JOIN (
                    SELECT IdPersonal, SUM(DiasSolicitado) AS TotalDiasSolicitados
                    FROM vacacionestomadas
                    GROUP BY IdPersonal
                ) vt ON p.Id = vt.IdPersonal
                WHERE 
                    p.Estado IN (1,2)
            `;
    
            let queryParams = [];
    
            if (departamentoId !== 'todos') {
                query += ' AND p.Id_Departamento = ?';
                queryParams.push(departamentoId);
            }
    
            query += ' ORDER BY DiasDisponibles DESC';
    
            const empleados = await connection.query(query, queryParams);
            await connection.close();
    
            const tableBody = document.querySelector('#empleados-table tbody');
            tableBody.innerHTML = '';
    
            empleados.forEach(emp => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = emp.Id;
                row.insertCell(1).textContent = emp.NombreCompleto;
                row.insertCell(2).textContent = formatofecha(emp.Inicio_Planilla);
                row.insertCell(3).textContent = emp.NombreDepartamento;
                
                const diasDisponiblesCell = row.insertCell(4);
                diasDisponiblesCell.textContent = emp.DiasDisponibles;
                diasDisponiblesCell.className = 'dias-disponibles';
            });
        } catch (error) {
            console.error('Error loading empleados:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los empleados del departamento.',
            });
        }
    }
    async function cargarEstadosPago() {
        try {
            const connection = await conectar();
            const query = `SELECT IdEstado, Estado FROM EstadopagoVacas`;
            const estados = await connection.query(query);
            await connection.close();
    
            const select = document.getElementById('estado-pago-select');
            select.innerHTML = '<option value="">Seleccione un estado de pago</option>';
            estados.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.IdEstado;
                option.textContent = estado.Estado;
                select.appendChild(option);
            });
    
            select.addEventListener('change', (e) => cargarReportePagos(e.target.value));
        } catch (error) {
            console.error('Error cargando estados de pago:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los estados de pago.',
            });
        }
    }
    
    async function cargarReportePagos(estadoPago) {
        if (!estadoPago) return;
    
        showLoader();
        try {
            const connection = await conectar();
            let query;
            let columns;
    
            switch (estadoPago) {
                case '1': // Por Autorizar
                    query = `
                        SELECT
                            vacacionespagadas.Idpagovacas, 
                            CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                            vacacionespagadas.FechaRegistro, 
                            vacacionespagadas.DiasSolicitado, 
                            vacacionespagadas.Periodo, 
                            planillas.Nombre_Planilla, 
                            departamentos.Nombre AS NombreDepartamento, 
                            CONCAT(encargado.Primer_Nombre, ' ', IFNULL(encargado.Segundo_Nombre, ''), ' ', encargado.Primer_Apellido, ' ', IFNULL(encargado.Segundo_Apellido, '')) AS PersonaRegistro
                        FROM
                            vacacionespagadas
                            INNER JOIN personal ON vacacionespagadas.IdPersonal = personal.Id
                            INNER JOIN planillas ON vacacionespagadas.IdPlanilla = planillas.Id_Planilla
                            INNER JOIN departamentos ON vacacionespagadas.IdDepartamento = departamentos.Id_Departamento
                            INNER JOIN personal AS encargado ON vacacionespagadas.IdEncargado = encargado.Id
                        WHERE vacacionespagadas.Estado = 1
                    `;
                    columns = ['ID', 'Nombre Completo', 'Fecha Registro', 'Días Solicitados', 'Periodo', 'Planilla', 'Departamento', 'Persona Registro'];
                    break;
                case '2': // En Trámite
                    query = `
                        SELECT
                            vacacionespagadas.Idpagovacas, 
                            CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                            vacacionespagadas.FechaRegistro, 
                            vacacionespagadas.DiasSolicitado, 
                            vacacionespagadas.Periodo, 
                            planillas.Nombre_Planilla, 
                            departamentos.Nombre AS NombreDepartamento, 
                            CONCAT(encargado.Primer_Nombre, ' ', IFNULL(encargado.Segundo_Nombre, ''), ' ', encargado.Primer_Apellido, ' ', IFNULL(encargado.Segundo_Apellido, '')) AS PersonaRegistro,
                            vacacionespagadas.TotalaRecibir,
                            vacacionespagadas.FechaAutAnu,
                            CONCAT(autorizo.Primer_Nombre, ' ', IFNULL(autorizo.Segundo_Nombre, ''), ' ', autorizo.Primer_Apellido, ' ', IFNULL(autorizo.Segundo_Apellido, '')) AS PersonaAutorizo
                        FROM
                            vacacionespagadas
                            INNER JOIN personal ON vacacionespagadas.IdPersonal = personal.Id
                            INNER JOIN planillas ON vacacionespagadas.IdPlanilla = planillas.Id_Planilla
                            INNER JOIN departamentos ON vacacionespagadas.IdDepartamento = departamentos.Id_Departamento
                            INNER JOIN personal AS autorizo ON vacacionespagadas.IdPerAutAnu = autorizo.Id
                            INNER JOIN personal AS encargado ON vacacionespagadas.IdEncargado = encargado.Id
                        WHERE vacacionespagadas.Estado = 2
                    `;
                    columns = ['ID', 'Nombre Completo', 'Fecha Registro', 'Días Solicitados', 'Periodo', 'Planilla', 'Departamento', 'Persona Registro', 'Total a Recibir', 'Fecha Autorización', 'Persona Autorizó'];
                    break;
                case '3': // Pagado
                    query = `
                        SELECT
                            vacacionespagadas.Idpagovacas, 
                            CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                            vacacionespagadas.FechaRegistro, 
                            vacacionespagadas.DiasSolicitado, 
                            vacacionespagadas.Periodo, 
                            planillas.Nombre_Planilla, 
                            departamentos.Nombre AS NombreDepartamento, 
                            CONCAT(encargado.Primer_Nombre, ' ', IFNULL(encargado.Segundo_Nombre, ''), ' ', encargado.Primer_Apellido, ' ', IFNULL(encargado.Segundo_Apellido, '')) AS PersonaRegistro,
                            vacacionespagadas.TotalaRecibir,
                            vacacionespagadas.FechaAutAnu,
                            CONCAT(autorizo.Primer_Nombre, ' ', IFNULL(autorizo.Segundo_Nombre, ''), ' ', autorizo.Primer_Apellido, ' ', IFNULL(autorizo.Segundo_Apellido, '')) AS PersonaAutorizo,
                            CONCAT(pago.Primer_Nombre, ' ', IFNULL(pago.Segundo_Nombre, ''), ' ', pago.Primer_Apellido, ' ', IFNULL(pago.Segundo_Apellido, '')) AS personapago,
                            vacacionespagadas.FechaPago
                        FROM
                            vacacionespagadas
                            INNER JOIN personal ON vacacionespagadas.IdPersonal = personal.Id
                            INNER JOIN planillas ON vacacionespagadas.IdPlanilla = planillas.Id_Planilla
                            INNER JOIN departamentos ON vacacionespagadas.IdDepartamento = departamentos.Id_Departamento
                            INNER JOIN personal AS autorizo ON vacacionespagadas.IdPerAutAnu = autorizo.Id
                            INNER JOIN personal AS encargado ON vacacionespagadas.IdEncargado = encargado.Id
                            LEFT JOIN personal AS pago ON vacacionespagadas.IdPersonalpago = pago.Id
                        WHERE vacacionespagadas.Estado = 3
                    `;
                    columns = ['ID', 'Nombre Completo', 'Fecha Registro', 'Días Solicitados', 'Periodo', 'Planilla', 'Departamento', 'Persona Registro', 'Total a Recibir', 'Fecha Autorización', 'Persona Autorizó', 'Persona Pago', 'Fecha Pago'];
                    break;
                case '4': // Anulado
                    query = `
                        SELECT
                            vacacionespagadas.Idpagovacas, 
                            CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                            vacacionespagadas.FechaRegistro, 
                            vacacionespagadas.DiasSolicitado, 
                            vacacionespagadas.Periodo, 
                            planillas.Nombre_Planilla, 
                            departamentos.Nombre AS NombreDepartamento, 
                            CONCAT(encargado.Primer_Nombre, ' ', IFNULL(encargado.Segundo_Nombre, ''), ' ', encargado.Primer_Apellido, ' ', IFNULL(encargado.Segundo_Apellido, '')) AS PersonaRegistro,
                            vacacionespagadas.FechaAutAnu,
                            CONCAT(autorizo.Primer_Nombre, ' ', IFNULL(autorizo.Segundo_Nombre, ''), ' ', autorizo.Primer_Apellido, ' ', IFNULL(autorizo.Segundo_Apellido, '')) AS Personaanulo
                        FROM
                            vacacionespagadas
                            INNER JOIN personal ON vacacionespagadas.IdPersonal = personal.Id
                            INNER JOIN planillas ON vacacionespagadas.IdPlanilla = planillas.Id_Planilla
                            INNER JOIN departamentos ON vacacionespagadas.IdDepartamento = departamentos.Id_Departamento
                            INNER JOIN personal AS autorizo ON vacacionespagadas.IdPerAutAnu = autorizo.Id
                            INNER JOIN personal AS encargado ON vacacionespagadas.IdEncargado = encargado.Id
                        WHERE vacacionespagadas.Estado = 4
                    `;
                    columns = ['ID', 'Nombre Completo', 'Fecha Registro', 'Días Solicitados', 'Periodo', 'Planilla', 'Departamento', 'Persona Registro', 'Fecha Anulación', 'Persona Anuló'];
                    break;
                default:
                    throw new Error('Estado de pago no válido');
            }
    
            const reportePagos = await connection.query(query);
        await connection.close();

        const tableHead = document.querySelector('#reporte-pagos-table thead');
        const tableBody = document.querySelector('#reporte-pagos-table tbody');
        
        // Actualizar encabezados de la tabla
        tableHead.innerHTML = '<tr>' + columns.map(col => `<th>${col}</th>`).join('') + '</tr>';
        
        // Limpiar y llenar el cuerpo de la tabla
        tableBody.innerHTML = '';
        reportePagos.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                let value = '';
                switch(col) {
                    case 'ID':
                        value = row.Idpagovacas;
                        break;
                    case 'Nombre Completo':
                        value = row.NombreCompleto;
                        break;
                    case 'Fecha Registro':
                        value = formatofecha(row.FechaRegistro);
                        break;
                    case 'Días Solicitados':
                        value = row.DiasSolicitado;
                        break;
                    case 'Periodo':
                        value = formatPeriodo(row.Periodo);
                        break;
                    case 'Planilla':
                        value = row.Nombre_Planilla;
                        break;
                    case 'Departamento':
                        value = row.NombreDepartamento;
                        break;
                    case 'Persona Registro':
                        value = row.PersonaRegistro;
                        break;
                    case 'Total a Recibir':
                        value = row.TotalaRecibir;
                        break;
                    case 'Fecha Autorización':
                        value = row.FechaAutAnu;
                        break;
                    case 'Persona Autorizó':
                        value = row.PersonaAutorizo;
                        break;
                    case 'Fecha Anulación':
                        value = row.FechaAutAnu;
                        break;
                    case 'Persona Anuló':
                        value = row.Personaanulo;
                        break;
                    case 'Persona Pago':
                        value = row.personapago;
                        break;
                    case 'Fecha Pago':
                        value = row.FechaPago;
                        break;
                    // Agregar casos para otras columnas según sea necesario
                }
                td.textContent = value;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });

        adjustTableColumns();
        } catch (error) {
            console.error('Error cargando reporte de pagos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar el reporte de pagos: ' + error.message,
            });
        } finally {
            hideLoader();
        }
    }
    function adjustTableColumns() {
        const table = document.getElementById('reporte-pagos-table');
        const headerCells = table.querySelectorAll('th');
        
        headerCells.forEach((th, index) => {
            let maxWidth = th.offsetWidth;
            const bodyCells = table.querySelectorAll(`td:nth-child(${index + 1})`);
            
            bodyCells.forEach(td => {
                if (td.offsetWidth > maxWidth) {
                    maxWidth = td.offsetWidth;
                }
            });
            
            th.style.width = `${maxWidth}px`;
            bodyCells.forEach(td => {
                td.style.width = `${maxWidth}px`;
            });
        });
    }
    async function cargarDepartamentosReporteVacaciones() {
        try {
            const connection = await conectar();
            const query = `SELECT Id_Departamento, Nombre FROM departamentos ORDER BY Nombre ASC`;
            const departamentos = await connection.query(query);
            await connection.close();
    
            const select = document.getElementById('departamento-filter-reporte');
            select.innerHTML = '<option value="">Todos los departamentos</option>';
            departamentos.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.Id_Departamento;
                option.textContent = dept.Nombre;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departamentos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los departamentos.',
            });
        }
    }
    document.getElementById('generar-reporte-vacaciones').addEventListener('click', generarReporteVacaciones);
    async function generarReporteVacaciones() {
        const fechaDesde = document.getElementById('fecha-desde').value;
        const fechaHasta = document.getElementById('fecha-hasta').value;
        const departamentoId = document.getElementById('departamento-filter-reporte').value;
    
        if (!fechaDesde || !fechaHasta) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, selecciona ambas fechas.',
            });
            return;
        }
    
        showLoader();
        try {
            const connection = await conectar();
            let query = `
                SELECT
                    vacacionestomadas.IdPersonal,
                    CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto, 
                    vacacionestomadas.Periodo, 
                    departamentos.Nombre AS Departamento,
                    COUNT(vacacionestomadas.IdVacastomadas) AS TotalVacaciones
                FROM
                    vacacionestomadas
                    INNER JOIN personal ON vacacionestomadas.IdPersonal = personal.Id
                    INNER JOIN departamentos ON vacacionestomadas.IdDepartamento = departamentos.Id_Departamento
                WHERE
                    vacacionestomadas.FechasTomadas BETWEEN ? AND ?
            `;
    
            const queryParams = [fechaDesde, fechaHasta];
    
            if (departamentoId) {
                query += ` AND vacacionestomadas.IdDepartamento = ?`;
                queryParams.push(departamentoId);
            }
    
            query += `
                GROUP BY
                    personal.Id, vacacionestomadas.Periodo, departamentos.Nombre
                ORDER BY
                    NombreCompleto
            `;
    
            const reporteVacaciones = await connection.query(query, queryParams);
            await connection.close();
    
            const tableBody = document.querySelector('#reporte-vacaciones-table tbody');
            tableBody.innerHTML = '';
    
            if (reporteVacaciones.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">No se encontraron datos para el período seleccionado.</td></tr>';
            } else {
                reporteVacaciones.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.NombreCompleto}</td>
                        <td>${row.Periodo}</td>
                        <td>${row.Departamento}</td>
                        <td>${row.TotalVacaciones}</td>
                    `;
                    tr.addEventListener('click', () => mostrarDetalleVacaciones(row.IdPersonal, row.Periodo, row.NombreCompleto, fechaDesde, fechaHasta));
                    tableBody.appendChild(tr);
                });
            }
    
            document.getElementById('reporte-vacaciones-section').style.display = 'block';
            document.getElementById('reporte-vacaciones-grid').style.display = 'block';
        } catch (error) {
            console.error('Error generando reporte de vacaciones:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al generar el reporte de vacaciones.',
            });
        } finally {
            hideLoader();
        }
    }
    
    async function mostrarDetalleVacaciones(idPersonal, periodo, nombreCompleto, fechaDesde, fechaHasta) {
        showLoader();
        try {
            const connection = await conectar();
            const query = `
                SELECT FechasTomadas
                FROM vacacionestomadas
                WHERE IdPersonal = ? AND Periodo = ? AND FechasTomadas BETWEEN ? AND ?
                ORDER BY FechasTomadas
            `;
            const detalleVacaciones = await connection.query(query, [idPersonal, periodo, fechaDesde, fechaHasta]);
            await connection.close();
    
            const modalContent = document.querySelector('.modal-content');
            const detalleEmpleadoInfo = document.getElementById('detalle-empleado-info');
            const tableBody = document.querySelector('#detalle-vacaciones-table tbody');
    
            detalleEmpleadoInfo.textContent = `${nombreCompleto} - Periodo: ${periodo}`;
            tableBody.innerHTML = '';
    
            detalleVacaciones.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${formatofecha(row.FechasTomadas)}</td>`;
                tableBody.appendChild(tr);
            });
    
            const modal = document.getElementById('detalle-vacaciones-modal');
            modal.style.display = 'block';
    
            const closeBtn = document.getElementsByClassName('close')[0];
            closeBtn.onclick = function() {
                modal.style.display = 'none';
            }
    
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error mostrando detalle de vacaciones:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al mostrar el detalle de vacaciones.',
            });
        } finally {
            hideLoader();
        }
    }
    async function cargarPagosAutorizados() {
        try {
            const connection = await conectar();
            
            // Cargar los departamentos en el combobox
            await cargarDepartamentosPagosAutorizados();
            
            const query = `
                SELECT 
                    vacacionespagadas.Idpagovacas, 
                    CONCAT(personal.Primer_Nombre, ' ', IFNULL(personal.Segundo_Nombre, ''), ' ', personal.Primer_Apellido, ' ', IFNULL(personal.Segundo_Apellido, '')) AS NombreCompleto,
                    vacacionespagadas.FechaRegistro,
                    vacacionespagadas.DiasSolicitado,
                    vacacionespagadas.Periodo,
                    planillas.Nombre_Planilla,
                    departamentos.Nombre AS NombreDepartamento,
                    departamentos.Id_Departamento,
                    CONCAT(encargado.Primer_Nombre, ' ', IFNULL(encargado.Segundo_Nombre, ''), ' ', encargado.Primer_Apellido, ' ', IFNULL(encargado.Segundo_Apellido, '')) AS NombreEncargado,
                    vacacionespagadas.TotalaRecibir
                FROM vacacionespagadas
                INNER JOIN personal ON vacacionespagadas.IdPersonal = personal.Id
                INNER JOIN planillas ON vacacionespagadas.IdPlanilla = planillas.Id_Planilla
                INNER JOIN departamentos ON vacacionespagadas.IdDepartamento = departamentos.Id_Departamento
                INNER JOIN personal AS encargado ON vacacionespagadas.IdEncargado = encargado.Id
                LEFT JOIN salariosbase ON salariosbase.Anyo = SUBSTRING_INDEX(SUBSTRING_INDEX(vacacionespagadas.Periodo, 'al', -1), '-', 1) AND planillas.Id_Planilla = vacacionespagadas.IdPlanilla
                WHERE vacacionespagadas.Estado = 2
            `;
            const result = await connection.query(query);
            await connection.close();
    
            const tableBody = document.querySelector('#pagos-autorizados-table tbody');
            
            function renderTable(data) {
                tableBody.innerHTML = '';
                data.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.Idpagovacas}</td>
                        <td>${row.NombreCompleto}</td>
                        <td>${formatofecha(row.FechaRegistro)}</td>
                        <td>${row.DiasSolicitado}</td>
                        <td>${formatPeriodo(row.Periodo)}</td>
                        <td>${row.Nombre_Planilla}</td>
                        <td>${row.NombreDepartamento}</td>
                        <td>${row.NombreEncargado}</td>
                        <td>${formatCurrency(row.TotalaRecibir)}</td>
                        <td><input type="text" class="no-recibo" placeholder="No. Recibo"></td>
                        <td><input type="text" class="no-cheque" placeholder="No. Cheque"></td>
                        <td><button class="finalizar-pago-button" data-id="${row.Idpagovacas}">Finalizar Pago</button></td>
                    `;
                    tableBody.appendChild(tr);
                });
    
                // Agregar event listeners a los botones
                document.querySelectorAll('.finalizar-pago-button').forEach(button => {
                    button.addEventListener('click', (event) => finalizarPago(event.target.dataset.id));
                });
            }
    
            renderTable(result);
    
            // Agregar evento de cambio al combobox de departamentos
            document.getElementById('departamento-filter-pagos-autorizados').addEventListener('change', function() {
                const selectedDepartamento = this.value;
                const filteredData = selectedDepartamento 
                    ? result.filter(row => row.Id_Departamento.toString() === selectedDepartamento)
                    : result;
                renderTable(filteredData);
            });
    
        } catch (error) {
            console.error('Error loading pagos autorizados:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los datos de pagos autorizados.',
            });
        }
    }
    
    async function cargarDepartamentosPagosAutorizados() {
        try {
            const connection = await conectar();
            const query = `SELECT Id_Departamento, Nombre FROM departamentos ORDER BY Nombre ASC`;
            const departamentos = await connection.query(query);
            await connection.close();
    
            const select = document.getElementById('departamento-filter-pagos-autorizados');
            select.innerHTML = '<option value="">Todos los departamentos</option>';
            departamentos.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.Id_Departamento;
                option.textContent = dept.Nombre;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departamentos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al cargar los departamentos.',
            });
        }
    }
    
    async function finalizarPago(id) {
        try {
            const row = document.querySelector(`button[data-id="${id}"]`).closest('tr');
            const noRecibo = row.querySelector('.no-recibo').value;
            const noCheque = row.querySelector('.no-cheque').value;
    
            if (!noRecibo || !noCheque) {
                throw new Error('Debe ingresar tanto el No. de Recibo como el No. de Cheque.');
            }
    
            const connection = await odbc.connect(conexion);
            const query = `
                UPDATE vacacionespagadas
                SET NoCheque = ?, NoRecibo = ?, IdPersonalpago = ?, FechaPago = CURDATE(), Estado = 3
                WHERE Idpagovacas = ?
            `;
            await connection.query(query, [noCheque, noRecibo, idencargado, id]);
            await connection.close();
    
            Swal.fire({
                icon: 'success',
                title: 'Pago finalizado',
                text: 'El pago ha sido finalizado exitosamente.',
            });
    
            await cargarPagosAutorizados();
        } catch (error) {
            console.error('Error finalizando pago:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al finalizar el pago: ' + error.message,
            });
        }
    }
});
window.onload = function() {
    const saludoTitle = document.getElementById('saludo-title');
    const saludoMessage = document.getElementById('saludo-message');
    const saludoIcon = document.getElementById('saludo-icon');
    
    const now = new Date();
    const hours = now.getHours();

    let title;
    let message;
    let iconUrl;

    if (hours < 12) {
        title = "¡Buenos días!";
        message = "Espero que tengas un excelente inicio de jornada.";
        iconUrl = "../Imagenes/Buenosdias.png"; // Cambia por el ícono de buenos días
    } else if (hours < 18) {
        title = "¡Buenas tardes!";
        message = "¡Que tu día continúe siendo productivo!";
        iconUrl = "../Imagenes/Buenastarde.png"; // Cambia por el ícono de buenas tardes
    } else {
        title = "¡Buenas noches!";
        message = "Espero que hayas tenido un gran día. ¡Descansa bien!";
        iconUrl = "../Imagenes/buenasnoches.png"; // Cambia por el ícono de buenas noches
    }

    saludoTitle.textContent = title;
    saludoMessage.textContent = message;
    saludoIcon.src = iconUrl;
};