
// admin.js - Funcionalidades para el panel de administración

// Variables globales
let currentUser = null
const charts = {}
const availableDates = {
  creacion: new Set(),
  inicio: new Set(),
  fin: new Set(),
}

// Declarations for functions that are not defined in this file
function loadUsersTable() {
  console.warn("loadUsersTable function is not defined in this file")
}

function loadProjectsTable() {
  console.warn("loadProjectsTable function is not defined in this file")
}

function loadNotifications() {
  console.warn("loadNotifications function is not defined in this file")
}

function populatePRSTSelects() {
  console.warn("populatePRSTSelects function is not defined in this file")
}

function extractAvailableDates() {
  console.warn("extractAvailableDates function is not defined in this file")
}

// Inicialización cuando el DOM está cargado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado - Inicializando panel de administración")

  try {
    // Inicializar el almacenamiento
    if (typeof Storage !== "undefined" && Storage.init) {
      Storage.init()
      console.log("Storage inicializado correctamente")
    } else {
      console.error("Error: Storage no está disponible o no tiene método init")
      alert("Error crítico: No se pudo inicializar el almacenamiento. Por favor, contacte al administrador.")
      return
    }

    // Verificar si el usuario está logueado y tiene el rol correcto
    const loggedUser = Storage.getLoggedUser()
    console.log("Usuario logueado:", loggedUser)

    if (!loggedUser) {
      console.error("No hay usuario logueado, redirigiendo a login")
      window.location.href = "login.html"
      return
    } else if (loggedUser.rol !== "admin") {
      console.error(`Usuario con rol incorrecto: ${loggedUser.rol}, redirigiendo a dashboard`)
      window.location.href = "index.html"
      return
    }

    // Guardar el usuario actual en la variable global
    currentUser = loggedUser
    console.log("Usuario administrador autenticado:", currentUser)

    // Inicializar componentes
    initializeComponents()

    // Cargar datos iniciales
    loadUserData()
    loadDashboardData()
    loadUsersTableData()
    loadProjectsTableData()
    loadNotificationsData()
    populatePRSTSelectsData()
    extractAvailableDatesData()
    populateDateSelectors()

    // Configurar eventos
    setupEventListeners()

    console.log("Inicialización completada correctamente")
  } catch (error) {
    console.error("Error crítico durante la inicialización:", error)
    alert("Error crítico durante la inicialización. Por favor, recargue la página o contacte al administrador.")
  }
})

// Inicializar componentes de la interfaz
function initializeComponents() {
  console.log("Inicializando componentes de la interfaz")

  try {
    // Inicializar tooltips de Bootstrap
    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
      tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
      console.log("Tooltips inicializados")
    } else {
      console.warn("Bootstrap no está disponible o no tiene Tooltip")
    }

    // Inicializar popovers de Bootstrap
    if (typeof bootstrap !== "undefined" && bootstrap.Popover) {
      const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
      popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))
      console.log("Popovers inicializados")
    } else {
      console.warn("Bootstrap no está disponible o no tiene Popover")
    }

    // Inicializar nuevos componentes
    setupPasswordToggle()
    setupToggleUserStatus()
    setupDashboardCards()
    setupProjectsFlowChart()
    setupDepartmentChart()

    // Agregar listeners para las pestañas
    const inProgressTab = document.getElementById("in-progress-tab");
  if (inProgressTab) {
    inProgressTab.addEventListener("shown.bs.tab", (e) => {
      loadInManagementProjects(); // Cambiado de loadInProgressProjects
    });
  }

    const completedTab = document.getElementById("completed-tab")
    if (completedTab) {
      completedTab.addEventListener("shown.bs.tab", (e) => {
        loadCompletedProjects()
      })
    }

    console.log("Componentes adicionales inicializados")
  } catch (error) {
    console.error("Error al inicializar componentes:", error)
  }
}

// Configurar listeners de eventos
function setupEventListeners() {
  console.log("Configurando listeners de eventos");

  try {
    // 1. Cerrar sesión
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Cerrando sesión");
        Storage.logout();
        window.location.href = "login.html";
      });
    } else {
      console.warn("Elemento logout-button no encontrado");
    }

    // 2. Mostrar perfil desde el navbar (corregido)
    const profileButtons = [
      document.getElementById("profile-button"),
      document.querySelector(".nav-profile")
    ].filter(Boolean);
    
    profileButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Mostrando perfil");
        showProfileModal();
      });
    });

    // 3. Cambiar contraseña
    const changePasswordBtn = document.getElementById("change-password-btn");
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", () => {
        console.log("Mostrando modal de cambio de contraseña");
        showChangePasswordModal();
      });
    }

    // 4. Guardar nueva contraseña
    const savePasswordBtn = document.getElementById("save-password-btn");
    if (savePasswordBtn) {
      savePasswordBtn.addEventListener("click", () => {
        console.log("Guardando nueva contraseña");
        saveNewPassword();
      });
    }

    // 5. Nuevo usuario
    const newUserButton = document.getElementById("new-user-button");
    if (newUserButton) {
      newUserButton.addEventListener("click", () => {
        console.log("Mostrando formulario de nuevo usuario");
        showUserModal();
      });
    } else {
      console.warn("Elemento new-user-button no encontrado");
    }

    // 6. Guardar usuario
    const saveUserButton = document.getElementById("save-user-button");
    if (saveUserButton) {
      saveUserButton.addEventListener("click", () => {
        console.log("Guardando usuario");
        saveUser();
      });
    } else {
      console.warn("Elemento save-user-button no encontrado");
    }

    // 7. Cambiar estado de proyecto
    const changeProjectStatusButton = document.getElementById("change-project-status-button");
    if (changeProjectStatusButton) {
      changeProjectStatusButton.addEventListener("click", () => {
        console.log("Mostrando modal de cambio de estado");
        showChangeStatusModal();
      });
    } else {
      console.warn("Elemento change-project-status-button no encontrado");
    }

    // 8. Guardar cambio de estado
    const saveStatusButton = document.getElementById("save-status-button");
    if (saveStatusButton) {
      saveStatusButton.addEventListener("click", () => {
        console.log("Guardando cambio de estado");
        saveProjectStatus();
      });
    } else {
      console.warn("Elemento save-status-button no encontrado");
    }

    // 9. Cambio en tipo de fecha para filtros
    const filterDateType = document.getElementById("filter-date-type");
    if (filterDateType) {
      filterDateType.addEventListener("change", () => {
        console.log("Cambiando tipo de fecha para filtros");
        populateDateSelectors();
        filterProjects();
      });
    } else {
      console.warn("Elemento filter-date-type no encontrado");
    }

    // 10. Cerrar sección de proyectos por departamento
    const closeDepartmentProjects = document.getElementById("close-department-projects");
    if (closeDepartmentProjects) {
      closeDepartmentProjects.addEventListener("click", () => {
        document.getElementById("department-projects-section").classList.add("d-none");
      });
    }

    // 11. Volver al dashboard desde la vista de departamento
    const backToDashboard = document.getElementById("back-to-dashboard");
    if (backToDashboard) {
      backToDashboard.addEventListener("click", () => {
        document.getElementById("main-dashboard-content").classList.remove("d-none");
        document.getElementById("department-dashboard-content").classList.add("d-none");
      });
    }

    // 12. Eventos para pestañas
    const inProgressTab = document.getElementById("in-progress-tab");
    if (inProgressTab) {
      inProgressTab.addEventListener("shown.bs.tab", (e) => {
        loadInManagementProjects();
      });
    }

    const completedTab = document.getElementById("completed-tab");
    if (completedTab) {
      completedTab.addEventListener("shown.bs.tab", (e) => {
        loadCompletedProjects();
      });
    }

    // 13. Eventos para tarjetas del dashboard
    setupDashboardCards();

    console.log("Listeners de eventos configurados correctamente");
  } catch (error) {
    console.error("Error al configurar listeners de eventos:", error);
    alert("Error al configurar la página. Por favor, recargue la página.");
  }
}

// Función auxiliar para configurar las tarjetas del dashboard
function setupDashboardCards() {
  // Tarjeta de usuarios
  const usersCard = document.getElementById("show-users-card");
  if (usersCard) {
    usersCard.addEventListener("click", () => {
      const usersTab = document.getElementById("users-tab");
      if (usersTab) usersTab.click();
    });
  }

  // Tarjeta de proyectos
  const projectsCard = document.getElementById("show-projects-card");
  if (projectsCard) {
    projectsCard.addEventListener("click", () => {
      const projectsTab = document.getElementById("projects-tab");
      if (projectsTab) projectsTab.click();
    });
  }

  // Tarjeta de proyectos en gestión
  const inProgressCard = document.getElementById("show-in-progress-card");
  if (inProgressCard) {
    inProgressCard.addEventListener("click", () => {
      const inProgressTab = document.getElementById("in-progress-tab");
      if (inProgressTab) inProgressTab.click();
    });
  }

  // Tarjeta de proyectos finalizados
  const completedCard = document.getElementById("show-completed-card");
  if (completedCard) {
    completedCard.addEventListener("click", () => {
      const completedTab = document.getElementById("completed-tab");
      if (completedTab) completedTab.click();
    });
  }
}

// Función para mostrar/ocultar contraseña
function setupPasswordToggle() {
  const togglePasswordButton = document.getElementById("toggle-password")
  const passwordInput = document.getElementById("user-password")

  if (togglePasswordButton && passwordInput) {
    togglePasswordButton.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      // Cambiar el icono
      const icon = this.querySelector("i")
      if (icon) {
        icon.classList.toggle("fa-eye")
        icon.classList.toggle("fa-eye-slash")
      }
    })
  }
}

// Función para configurar el botón de desactivar usuario
function setupToggleUserStatus() {
  const toggleButton = document.getElementById("toggle-user-status-btn")
  const confirmButton = document.getElementById("confirm-deactivate-btn")

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const userId = document.getElementById("user-id").value
      const userName =
        document.getElementById("user-nombre").value + " " + document.getElementById("user-apellido").value
      const isActive = document.getElementById("user-activo").value === "true"

      // Actualizar texto del modal
      document.getElementById("user-to-deactivate").textContent = userName
      document.getElementById("action-text").textContent = isActive ? "desactivar" : "activar"
      document.getElementById("deactivation-reason").value = ""

      // Mostrar modal
      const deactivateModal = new bootstrap.Modal(document.getElementById("deactivateUserModal"))
      deactivateModal.show()
    })
  }

  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      const reason = document.getElementById("deactivation-reason").value.trim()

      if (!reason) {
        alert("Por favor, escriba una razón para esta acción.")
        return
      }

      // Cambiar el estado del usuario
      const userId = document.getElementById("user-id").value
      const currentStatus = document.getElementById("user-activo").value === "true"
      document.getElementById("user-activo").value = (!currentStatus).toString()
      document.getElementById("user-activo-text").value = !currentStatus ? "Activo" : "Inactivo"

      // Actualizar texto del botón
      const toggleButton = document.getElementById("toggle-user-status-btn")
      const toggleText = document.getElementById("toggle-status-text")
      if (toggleButton && toggleText) {
        toggleText.textContent = !currentStatus ? "Desactivar Usuario" : "Activar Usuario"
        toggleButton.classList.toggle("btn-warning")
        toggleButton.classList.toggle("btn-success")
      }

      // Guardar la razón (en una implementación real, esto se guardaría en la base de datos)
      console.log(`Usuario ${userId} ${!currentStatus ? "activado" : "desactivado"}. Razón: ${reason}`)

      // Cerrar modal
      const deactivateModal = bootstrap.Modal.getInstance(document.getElementById("deactivateUserModal"))
      deactivateModal.hide()
    })
  }
  // En la función setupEventListeners, agregar:
const backToDashboard = document.getElementById("back-to-dashboard");
if (backToDashboard) {
  backToDashboard.addEventListener("click", () => {
    document.getElementById("main-dashboard-content").classList.remove("d-none");
    document.getElementById("department-dashboard-content").classList.add("d-none");
  });
}
}

// Función para configurar las tarjetas de navegación del dashboard
function setupDashboardCards() {
  // Tarjeta de usuarios
  const usersCard = document.getElementById("show-users-card")
  if (usersCard) {
    usersCard.addEventListener("click", () => {
      // Activar la pestaña de usuarios
      const usersTab = document.getElementById("users-tab")
      if (usersTab) {
        usersTab.click()
      }
    })
  }

  // Tarjeta de proyectos
  const projectsCard = document.getElementById("show-projects-card")
  if (projectsCard) {
    projectsCard.addEventListener("click", () => {
      // Activar la pestaña de proyectos
      const projectsTab = document.getElementById("projects-tab")
      if (projectsTab) {
        projectsTab.click()
      }
    })
  }

  // Tarjeta de proyectos en proceso
  const inProgressCard = document.getElementById("show-in-progress-card")
  if (inProgressCard) {
    inProgressCard.addEventListener("click", () => {
      // Activar la pestaña de proyectos en proceso
      const inProgressTab = document.getElementById("in-progress-tab")
      if (inProgressTab) {
        inProgressTab.click()
      }
    })
  }

  // Tarjeta de proyectos finalizados
  const completedCard = document.getElementById("show-completed-card")
  if (completedCard) {
    completedCard.addEventListener("click", () => {
      // Activar la pestaña de proyectos finalizados
      const completedTab = document.getElementById("completed-tab")
      if (completedTab) {
        completedTab.click()
      }
    })
  }
}

// Función para obtener todos los proyectos
function getAllProjects() {
  return Storage.getProjects()
}

// Función para obtener proyectos por estado
function getProjectsByStatus(status) {
  const projects = Storage.getProjects()
  return projects.filter((project) => project.estado === status)
}

// Función para mostrar proyectos filtrados
function showFilteredProjects(title, projects) {
  const filteredSection = document.getElementById("filtered-projects-section")
  const filteredTitle = document.getElementById("filtered-projects-title")
  const filteredTable = document.getElementById("filtered-projects-table")

  if (!filteredSection || !filteredTitle || !filteredTable) {
    console.error("No se encontraron elementos necesarios para mostrar proyectos filtrados")
    return
  }

  // Actualizar título
  filteredTitle.textContent = title

  // Mostrar sección
  filteredSection.classList.remove("d-none")

  // Limpiar tabla
  filteredTable.innerHTML = ""

  // Si no hay proyectos, mostrar mensaje
  if (projects.length === 0) {
    filteredTable.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">No hay proyectos para mostrar</td>
      </tr>
    `
    return
  }

  // Llenar tabla con proyectos
  projects.forEach((project) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${project.id || "N/A"}</td>
      <td>${project.nombre || "Sin nombre"}</td>
      <td>${project.prstNombre || "N/A"}</td>
      <td>${project.departamento || "N/A"}</td>
      <td>${formatDate(project.fechaCreacion) || "N/A"}</td>
      <td><span class="badge ${getBadgeClass(project.estado)}">${project.estado || "No definido"}</span></td>
      <td>
        <button class="btn btn-info btn-sm view-project" data-id="${project.id}" title="Ver Detalles">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `
    filteredTable.appendChild(row)
  })

  // Agregar eventos a los botones de ver detalles
  const viewButtons = filteredTable.querySelectorAll(".view-project")
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const projectId = this.getAttribute("data-id")
      viewProjectDetails(projectId)
    })
  })

  // Hacer scroll a la sección
  filteredSection.scrollIntoView({ behavior: "smooth" })
}

// Función para configurar el gráfico de flujo de proyectos
function setupProjectsFlowChart() {
  const timePeriodButtons = document.querySelectorAll(".time-period-btn")

  if (timePeriodButtons.length > 0) {
    timePeriodButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Quitar clase activa de todos los botones
        timePeriodButtons.forEach((btn) => btn.classList.remove("active"))

        // Agregar clase activa al botón clickeado
        this.classList.add("active")

        // Actualizar gráfico según el período seleccionado
        const period = this.getAttribute("data-period")
        loadProjectsFlowChart(period)
      })
    })
  }
}

// Función para cargar el gráfico de flujo de proyectos
function loadProjectsFlowChart(period = "month") {
  console.log(`Cargando gráfico de flujo de proyectos por ${period}`);

  try {
    const ctx = document.getElementById("projects-flow-chart");
    if (!ctx) {
      console.warn("Elemento projects-flow-chart no encontrado");
      return;
    }

    // Limpiar el contenedor del gráfico
    ctx.innerHTML = '';
    const canvas = document.createElement('canvas');
    ctx.appendChild(canvas);

    // Destruir gráfico existente si hay uno
    if (charts.projectsFlow && typeof charts.projectsFlow.destroy === 'function') {
      charts.projectsFlow.destroy();
    }

    const projects = Storage.getProjects();
    if (!projects || !Array.isArray(projects)) {
      throw new Error("No se pudieron cargar los proyectos");
    }

    // Preparar datos según el período
    const labels = [];
    const datasets = [
      {
        label: "Nuevos Proyectos",
        data: [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Proyectos en Gestión",
        data: [],
        backgroundColor: "rgba(255, 206, 86, 0.5)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
      {
        label: "Proyectos Finalizados",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ];

    // Lógica para diferentes períodos
    if (period === "month") {
      // Datos por mes (últimos 12 meses)
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const currentDate = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        labels.push(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
        
        // Inicializar contadores para este mes
        const monthProjects = projects.filter(project => {
          if (!project.fechaCreacion) return false;
          const projectDate = new Date(project.fechaCreacion);
          return (
            projectDate.getMonth() === date.getMonth() &&
            projectDate.getFullYear() === date.getFullYear()
          );
        });

        // Contar proyectos por estado
        datasets[0].data.push(monthProjects.filter(p => p.estado === "Nuevo").length);
        datasets[1].data.push(monthProjects.filter(p => 
          p.estado !== "Nuevo" && p.estado !== "Finalizado"
        ).length);
        datasets[2].data.push(monthProjects.filter(p => p.estado === "Finalizado").length);
      }
    } else if (period === "day") {
      // Similar lógica para días
      // ...
    } else if (period === "year") {
      // Similar lógica para años
      // ...
    }

    // Crear gráfico
    charts.projectsFlow = new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: `Flujo de Proyectos por ${period === "month" ? "Mes" : period === "day" ? "Día" : "Año"}`,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Número de Proyectos",
            },
          },
        },
      },
    });

    console.log("Gráfico de flujo de proyectos cargado correctamente");
  } catch (error) {
    console.error("Error al cargar gráfico de flujo de proyectos:", error);
    const ctx = document.getElementById("projects-flow-chart");
    if (ctx) {
      ctx.innerHTML = '<div class="alert alert-danger">Error al cargar el gráfico de flujo</div>';
    }
  }
}

// Función para hacer interactivo el gráfico de departamentos
function setupDepartmentChart() {
  // Modificar la función loadProjectsByDepartmentChart para hacerla interactiva
  window.loadProjectsByDepartmentChart = (projects) => {
    console.log("Cargando gráfico interactivo de proyectos por departamento")

    try {
      const ctx = document.getElementById("projects-by-department-chart")
      if (!ctx) {
        console.warn("Elemento projects-by-department-chart no encontrado")
        return
      }

      // Destruir gráfico existente si hay uno
      if (charts.projectsByDepartment) {
        charts.projectsByDepartment.destroy()
      }

      // Contar proyectos por departamento
      const departmentCounts = {
        Atlántico: 0,
        "La Guajira": 0,
        Magdalena: 0,
        "No definido": 0,
      }

      projects.forEach((project) => {
        const department = project.departamento
        if (department && departmentCounts.hasOwnProperty(department)) {
          departmentCounts[department]++
        } else {
          departmentCounts["No definido"]++
        }
      })

      // Preparar datos para el gráfico
      const labels = Object.keys(departmentCounts)
      const data = Object.values(departmentCounts)
      const backgroundColors = [
        "rgba(255, 99, 132, 0.7)",
        "rgba(54, 162, 235, 0.7)",
        "rgba(255, 206, 86, 0.7)",
        "rgba(75, 192, 192, 0.7)",
      ]

      // Crear gráfico
      charts.projectsByDepartment = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "right",
            },
            title: {
              display: true,
              text: "Distribución de Proyectos por Departamento",
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const department = labels[index];
              showDepartmentProjects(department, projects);
            }
          },
        },
      })

      console.log("Gráfico de proyectos por departamento cargado correctamente")
    } catch (error) {
      console.error("Error al cargar gráfico de proyectos por departamento:", error)
    }
  }
}

// Función para mostrar proyectos de un departamento específico
function showDepartmentProjects(department, allProjects) {
  console.log(`Mostrando proyectos del departamento: ${department}`);

  const mainContent = document.getElementById("main-dashboard-content");
  const departmentContent = document.getElementById("department-dashboard-content");
  const departmentTitle = document.getElementById("department-projects-title");
  const departmentTable = document.getElementById("department-projects-table");

  if (!mainContent || !departmentContent || !departmentTitle || !departmentTable) {
    console.warn("Elementos necesarios no encontrados");
    return;
  }

  // Filtrar proyectos por departamento
  const filteredProjects = allProjects.filter((project) =>
    department === "No definido"
      ? !project.departamento || !["Atlántico", "La Guajira", "Magdalena"].includes(project.departamento)
      : project.departamento === department
  );

  // Actualizar título
  departmentTitle.textContent = `Proyectos en ${department}`;

  // Limpiar tabla
  departmentTable.innerHTML = "";

  // Si no hay proyectos, mostrar mensaje
  if (filteredProjects.length === 0) {
    departmentTable.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">No hay proyectos en este departamento</td>
      </tr>
    `;
  } else {
    // Llenar tabla con proyectos
    filteredProjects.forEach((project) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${project.id || "N/A"}</td>
        <td>${project.nombre || "Sin nombre"}</td>
        <td>${project.prstNombre || "N/A"}</td>
        <td>${project.departamento || "N/A"}</td>
        <td>${formatDate(project.fechaCreacion) || "N/A"}</td>
        <td><span class="badge ${getBadgeClass(project.estado)}">${project.estado || "No definido"}</span></td>
        <td>
          <button class="btn btn-info btn-sm view-project" data-id="${project.id}" title="Ver Detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-secondary btn-sm history-project" data-id="${project.id}" title="Ver Historial">
            <i class="fas fa-history"></i>
          </button>
        </td>
      `;
      departmentTable.appendChild(row);
    });

    // Agregar eventos a los botones
    const viewButtons = departmentTable.querySelectorAll(".view-project");
    viewButtons.forEach((button) => {
      button.addEventListener("click", function() {
        const projectId = this.getAttribute("data-id");
        viewProjectDetails(projectId);
      });
    });

    const historyButtons = departmentTable.querySelectorAll(".history-project");
    historyButtons.forEach((button) => {
      button.addEventListener("click", function() {
        const projectId = this.getAttribute("data-id");
        showProjectHistory(projectId);
      });
    });
  }

  // Cambiar entre las vistas
  mainContent.classList.add("d-none");
  departmentContent.classList.remove("d-none");

  // Hacer scroll al inicio de la página
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Función para cargar datos del usuario
function loadUserData() {
  console.log("Cargando datos del usuario")

  if (!currentUser) {
    console.error("No hay usuario actual para cargar datos")
    return
  }

  try {
    // Mostrar nombre del usuario en la barra de navegación
    const userNameElement = document.getElementById("user-name")
    if (userNameElement) {
      userNameElement.textContent = `${currentUser.nombre} ${currentUser.apellido || ""}`
    } else {
      console.warn("Elemento user-name no encontrado")
    }

    console.log("Datos del usuario cargados correctamente")
  } catch (error) {
    console.error("Error al cargar datos del usuario:", error)
    alert("Hubo un problema al cargar los datos del perfil. Por favor, recargue la página.")
  }
}

// Función para cargar datos del dashboard
function loadDashboardData() {
  console.log("Cargando datos del dashboard");

  try {
    // Obtener datos
    const users = Storage.getUsers();
    const projects = Storage.getProjects();

    // Verificar que hay datos
    if (!users || !projects) {
      throw new Error("No se pudieron cargar los datos de usuarios o proyectos");
    }

    // Actualizar contadores
    updateCounters(users, projects);

    // Cargar gráficos (con manejo de errores individual)
    try {
      loadCharts(users, projects);
    } catch (chartError) {
      console.error("Error al cargar gráficos:", chartError);
      // Continuar aunque falle un gráfico
    }

    // Cargar gráfico de flujo de proyectos
    try {
      loadProjectsFlowChart("month");
    } catch (flowError) {
      console.error("Error al cargar gráfico de flujo:", flowError);
    }

    // Cargar datos para las pestañas
    try {
      loadInManagementProjects();
      loadCompletedProjects();
    } catch (tabError) {
      console.error("Error al cargar pestañas:", tabError);
    }

    console.log("Datos del dashboard cargados correctamente");
  } catch (error) {
    console.error("Error al cargar datos del dashboard:", error);
    // Mostrar mensaje más específico
    alert(`Error al cargar el dashboard: ${error.message}. Por favor, recargue la página.`);
  }
}

// Función para actualizar contadores
function updateCounters(users, projects) {
  console.log("Actualizando contadores");

  try {
    // Total de usuarios
    const totalUsersElement = document.getElementById("total-users");
    if (totalUsersElement) {
      totalUsersElement.textContent = users.length;
    }

    // Total de proyectos
    const totalProjectsElement = document.getElementById("total-projects");
    if (totalProjectsElement) {
      totalProjectsElement.textContent = projects.length;
    }

    // Proyectos en proceso de viabilidad (corregido)
    const inProgressProjectsElement = document.getElementById("in-progress-projects");
    if (inProgressProjectsElement) {
      const inProgressCount = projects.filter(
        (project) => project.estado === "En Proceso de Viabilidad"
      ).length;
      inProgressProjectsElement.textContent = inProgressCount;
    }

    // Proyectos finalizados
    const completedProjectsElement = document.getElementById("completed-projects");
    if (completedProjectsElement) {
      const completedCount = projects.filter(
        (project) => project.estado === "Finalizado"
      ).length;
      completedProjectsElement.textContent = completedCount;
    }

    console.log("Contadores actualizados correctamente");
  } catch (error) {
    console.error("Error al actualizar contadores:", error);
  }
}

// Función para cargar gráficos
function loadCharts(users, projects) {
  console.log("Cargando gráficos");

  // Destruir gráficos existentes para evitar duplicados
  Object.values(charts).forEach((chart) => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });

  // Cargar cada gráfico con manejo de errores individual
  const chartLoaders = [
    { name: 'projectsByStatus', loader: () => loadProjectsByStatusChart(projects) },
    { name: 'projectsByPRST', loader: () => loadProjectsByPRSTChart(projects) },
    { name: 'projectsByDepartment', loader: () => window.loadProjectsByDepartmentChart(projects) },
    { name: 'usersByRole', loader: () => loadUsersByRoleChart(users) }
  ];

  chartLoaders.forEach(({ name, loader }) => {
    try {
      loader();
      console.log(`Gráfico ${name} cargado correctamente`);
    } catch (error) {
      console.error(`Error al cargar gráfico ${name}:`, error);
    }
  });
}

// Función para cargar gráfico de proyectos por estado
// Función para cargar gráfico de proyectos por estado
function loadProjectsByStatusChart(projects) {
  console.log("Cargando gráfico de proyectos por estado");
  
  try {
    const ctx = document.getElementById("projects-by-status-chart");
    if (!ctx) {
      console.warn("Elemento projects-by-status-chart no encontrado");
      return;
    }

    // Definir los estados que queremos mostrar
    const statusesToShow = [
      "Nuevo",
      "En Proceso de Viabilidad", 
      "En Asignación",
      "En Gestión por Analista",
      "En Gestión por Brigada",
      "En Revisión de Verificación",
      "Generación de Informe",
      "Opción Mejorar",
      "Documentación Errada",
      "Finalizado"
    ];

    // Contar proyectos por estado
    const statusCounts = {};
    projects.forEach((project) => {
      const status = project.estado || "No definido";
      if (statusesToShow.includes(status)) {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });

    // Preparar datos para el gráfico
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    
    // Asignar colores según el estado
    const backgroundColors = labels.map(status => {
      switch(status) {
        case "Nuevo": return "#6c757d"; // Gris
        case "En Proceso de Viabilidad": return "#ffc107"; // Amarillo
        case "En Asignación": return "#17a2b8"; // Cyan
        case "En Gestión por Analista": 
        case "En Gestión por Brigada": return "#0dcaf0"; // Azul claro
        case "En Revisión de Verificación": return "#6610f2"; // Violeta
        case "Generación de Informe": return "#20c997"; // Verde agua
        case "Opción Mejorar": return "#fd7e14"; // Naranja
        case "Documentación Errada": return "#dc3545"; // Rojo
        case "Finalizado": return "#198754"; // Verde
        default: return "#6c757d"; // Gris por defecto
      }
    });

    // Destruir gráfico existente si hay uno
    if (charts.projectsByStatus && typeof charts.projectsByStatus.destroy === 'function') {
      charts.projectsByStatus.destroy();
    }

    // Crear gráfico
    charts.projectsByStatus = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          title: {
            display: true,
            text: "Proyectos por Estado",
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    console.log("Gráfico de proyectos por estado cargado correctamente");
  } catch (error) {
    console.error("Error al cargar gráfico de proyectos por estado:", error);
    // Mostrar mensaje de error en el elemento del gráfico
    const ctx = document.getElementById("projects-by-status-chart");
    if (ctx) {
      ctx.innerHTML = '<div class="text-danger">Error al cargar el gráfico</div>';
    }
  }
}

// Función para cargar gráfico de proyectos por PRST
function loadProjectsByPRSTChart(projects) {
  console.log("Cargando gráfico de proyectos por PRST")

  try {
    const ctx = document.getElementById("projects-by-prst-chart")
    if (!ctx) {
      console.warn("Elemento projects-by-prst-chart no encontrado")
      return
    }

    // Contar proyectos por PRST
    const prstCounts = {}
    projects.forEach((project) => {
      const prst = project.prstNombre || "No definido"
      prstCounts[prst] = (prstCounts[prst] || 0) + 1
    })

    // Preparar datos para el gráfico
    const labels = Object.keys(prstCounts)
    const data = Object.values(prstCounts)
    const backgroundColors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
    ]

    // Crear gráfico
    charts.projectsByPRST = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Número de Proyectos",
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        indexAxis: "y", // Para hacerlo horizontal
        plugins: {
          legend: {
            display: false, // Ocultar leyenda
          },
          title: {
            display: true,
            text: "Proyectos por PRST",
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
        },
      },
    })

    console.log("Gráfico de proyectos por PRST cargado correctamente")
  } catch (error) {
    console.error("Error al cargar gráfico de proyectos por PRST:", error)
  }
}

// Función para cargar gráfico de usuarios por rol
function loadUsersByRoleChart(users) {
  console.log("Cargando gráfico de usuarios por rol")

  try {
    const ctx = document.getElementById("users-by-role-chart")
    if (!ctx) {
      console.warn("Elemento users-by-role-chart no encontrado")
      return
    }

    // Contar usuarios por rol
    const roleCounts = {}
    users.forEach((user) => {
      const role = user.rol || "No definido"
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })

    // Preparar datos para el gráfico
    const labels = Object.keys(roleCounts)
    const data = Object.values(roleCounts)
    const backgroundColors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
    ]

    // Crear gráfico
    charts.usersByRole = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          title: {
            display: true,
            text: "Usuarios por Rol",
          },
        },
      },
    })

    console.log("Gráfico de usuarios por rol cargado correctamente")
  } catch (error) {
    console.error("Error al cargar gráfico de usuarios por rol:", error)
  }
}

// Función para cargar la tabla de usuarios
function loadUsersTableData() {
  console.log("Cargando tabla de usuarios")

  try {
    const users = Storage.getUsers()
    const usersTableBody = document.getElementById("users-table-body")

    if (!usersTableBody) {
      console.warn("Elemento users-table-body no encontrado")
      return
    }

    // Limpiar tabla
    usersTableBody.innerHTML = ""

    // Si no hay usuarios, mostrar mensaje
    if (users.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center">No hay usuarios para mostrar</td>
        </tr>
      `
      return
    }

    // Llenar tabla con usuarios
    users.forEach((user) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${user.id || "N/A"}</td>
        <td>${user.nombre || ""} ${user.apellido || ""}</td>
        <td>${user.usuario || "N/A"}</td>
        <td>${user.correo || "N/A"}</td>
        <td>${user.rol || "N/A"}</td>
        <td><span class="badge ${user.activo ? "bg-success" : "bg-danger"}">${user.activo ? "Activo" : "Inactivo"}</span></td>
        <td>
          <button class="btn btn-info btn-sm view-user" data-id="${user.id}" title="Ver Detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-warning btn-sm edit-user" data-id="${user.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      `
      usersTableBody.appendChild(row)
    })

    // Agregar eventos a los botones de ver y editar
    const viewButtons = usersTableBody.querySelectorAll(".view-user")
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-id")
        viewUserDetails(userId)
      })
    })

    const editButtons = usersTableBody.querySelectorAll(".edit-user")
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-id")
        showUserModal(userId)
      })
    })

    console.log("Tabla de usuarios cargada correctamente")
  } catch (error) {
    console.error("Error al cargar tabla de usuarios:", error)
  }
}

// Add a function to view user details
function viewUserDetails(userId) {
  console.log(`Mostrando detalles del usuario con ID: ${userId}`)

  try {
    const user = Storage.getUserById(userId)

    if (!user) {
      console.error(`No se encontró el usuario con ID: ${userId}`)
      alert("No se encontró el usuario. Por favor, recargue la página.")
      return
    }

    // Mostrar modal de detalles de usuario
    const userDetailsModal = document.getElementById("userDetailsModal")
    const detailUserId = document.getElementById("detail-user-id")
    const detailUserNombre = document.getElementById("detail-user-nombre")
    const detailUserUsuario = document.getElementById("detail-user-usuario")
    const detailUserCorreo = document.getElementById("detail-user-correo")
    const detailUserRol = document.getElementById("detail-user-rol")
    const detailUserEstado = document.getElementById("detail-user-estado")
    const detailUserAdditionalInfo = document.getElementById("detail-user-additional-info")

    if (
      !userDetailsModal ||
      !detailUserId ||
      !detailUserNombre ||
      !detailUserUsuario ||
      !detailUserCorreo ||
      !detailUserRol ||
      !detailUserEstado ||
      !detailUserAdditionalInfo
    ) {
      console.error("Elementos del modal de detalles de usuario no encontrados")
      return
    }

    // Llenar datos básicos
    detailUserId.textContent = user.id
    detailUserNombre.textContent = `${user.nombre} ${user.apellido}`
    detailUserUsuario.textContent = user.usuario
    detailUserCorreo.textContent = user.correo
    detailUserRol.textContent = user.rol
    detailUserEstado.textContent = user.activo ? "Activo" : "Inactivo"

    // Llenar información adicional según el rol
    let additionalInfoHTML = ""

    switch (user.rol) {
      case "prst":
        additionalInfoHTML = `
          <tr>
            <th>Nombre PRST:</th>
            <td>${user.nombrePRST || "N/A"}</td>
          </tr>
          <tr>
            <th>Cédula:</th>
            <td>${user.cedula || "N/A"}</td>
          </tr>
          <tr>
            <th>Matrícula Profesional:</th>
            <td>${user.matriculaProfesional || "N/A"}</td>
          </tr>
          <tr>
            <th>Celular:</th>
            <td>${user.celular || "N/A"}</td>
          </tr>
          <tr>
            <th>Dirección:</th>
            <td>${user.direccion || "N/A"}</td>
          </tr>
          <tr>
            <th>Barrio:</th>
            <td>${user.barrio || "N/A"}</td>
          </tr>
          <tr>
            <th>Ciudad:</th>
            <td>${user.ciudad || "N/A"}</td>
          </tr>
        `
        break
      case "ejecutiva":
        const prstList = user.responsablePRST ? user.responsablePRST.join(", ") : "N/A"
        additionalInfoHTML = `
          <tr>
            <th>PRST Responsables:</th>
            <td>${prstList}</td>
          </tr>
        `
        break
      case "coordinador":
        additionalInfoHTML = `
          <tr>
            <th>Tipo de Coordinador:</th>
            <td>${user.tipoCoordinador || "N/A"}</td>
          </tr>
        `
        break
      case "brigada":
        additionalInfoHTML = `
          <tr>
            <th>Departamento Asignado:</th>
            <td>${user.departamento || "N/A"}</td>
          </tr>
        `
        break
      default:
        additionalInfoHTML = `
          <tr>
            <td colspan="2" class="text-center">No hay información adicional disponible</td>
          </tr>
        `
    }

    detailUserAdditionalInfo.innerHTML = additionalInfoHTML

    // Mostrar modal
    const modal = new bootstrap.Modal(userDetailsModal)
    modal.show()

    console.log("Detalles del usuario mostrados correctamente")
  } catch (error) {
    console.error("Error al mostrar detalles del usuario:", error)
    alert("Error al mostrar los detalles del usuario. Por favor, inténtelo de nuevo.")
  }
}

// Función para cargar la tabla de proyectos
function loadProjectsTableData() {
  console.log("Cargando tabla de proyectos");

  try {
    const projects = Storage.getProjects();
    const projectsTableBody = document.getElementById("projects-table-body");

    if (!projectsTableBody) {
      console.warn("Elemento projects-table-body no encontrado");
      return;
    }

    // Limpiar tabla
    projectsTableBody.innerHTML = "";

    // Si no hay proyectos, mostrar mensaje
    if (projects.length === 0) {
      projectsTableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">No hay proyectos para mostrar</td>
        </tr>
      `;
      return;
    }

    // Verificar si el usuario es admin
    const isAdmin = currentUser && currentUser.rol === "admin";

    // Llenar tabla con proyectos
    projects.forEach((project) => {
      const row = document.createElement("tr");
      
      // Columnas básicas
      row.innerHTML = `
        <td>${project.id || "N/A"}</td>
        <td>${project.nombre || "Sin nombre"}</td>
        <td>${project.prstNombre || "N/A"}</td>
        <td>${project.departamento || "N/A"}</td>
        <td>${formatDate(project.fechaCreacion) || "N/A"}</td>
        <td>${formatDate(project.fechaInicio) || "N/A"}</td>
        <td>${formatDate(project.fechaFin) || "N/A"}</td>
        <td><span class="badge ${getBadgeClass(project.estado)}">${project.estado || "No definido"}</span></td>
        <td>
          <button class="btn btn-info btn-sm view-project" data-id="${project.id}" title="Ver Detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-secondary btn-sm history-project" data-id="${project.id}" title="Ver Historial">
            <i class="fas fa-history"></i>
          </button>
      `;
      
      // Agregar botones de edición/eliminación solo si no es admin
      if (!isAdmin) {
        row.innerHTML += `
          <button class="btn btn-primary btn-sm edit-project" data-id="${project.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm delete-project" data-id="${project.id}" title="Eliminar">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
      }
      
      row.innerHTML += `</td>`;
      projectsTableBody.appendChild(row);
    });

    // Agregar eventos a los botones
    addProjectTableEventListeners();

    console.log("Tabla de proyectos cargada correctamente");
  } catch (error) {
    console.error("Error al cargar tabla de proyectos:", error);
  }
}

// Función para cargar las notificaciones
function loadNotificationsData() {
  console.log("Cargando notificaciones")

  try {
    const notifications = Storage.getNotifications()
    const notificationsList = document.getElementById("notifications-list")
    const notificationBadge = document.getElementById("notification-badge")

    if (!notificationsList || !notificationBadge) {
      console.warn("Elementos de notificaciones no encontrados")
      return
    }

    // Limpiar lista
    notificationsList.innerHTML = ""

    // Contar notificaciones no leídas
    const unreadCount = notifications.filter((n) => !n.leido).length

    // Actualizar badge
    if (unreadCount > 0) {
      notificationBadge.textContent = unreadCount
      notificationBadge.classList.remove("d-none")
    } else {
      notificationBadge.classList.add("d-none")
    }

    // Si no hay notificaciones, mostrar mensaje
    if (notifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="dropdown-item text-center">No tienes notificaciones</div>
      `
      return
    }

    // Ordenar notificaciones por fecha (más recientes primero)
    notifications.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    // Mostrar solo las 10 notificaciones más recientes
    const recentNotifications = notifications.slice(0, 10)

    // Llenar lista con notificaciones
    recentNotifications.forEach((notification) => {
      const item = document.createElement("div")
      item.className = `dropdown-item notification-item ${notification.leido ? "" : "unread"}`
      item.innerHTML = `
        <div class="notification-text">${notification.mensaje}</div>
        <div class="d-flex justify-content-between align-items-center">
          <small class="notification-time">${formatDate(notification.fecha)}</small>
          ${notification.leido ? "" : '<span class="notification-badge"></span>'}
        </div>
      `
      item.addEventListener("click", () => {
        markNotificationAsRead(notification.id)
      })
      notificationsList.appendChild(item)
    })

    // Agregar botón para ver todas las notificaciones
    if (notifications.length > 10) {
      const viewAllItem = document.createElement("div")
      viewAllItem.className = "dropdown-item text-center"
      viewAllItem.innerHTML = `<a href="#" class="text-primary">Ver todas las notificaciones</a>`
      notificationsList.appendChild(viewAllItem)
    }

    console.log("Notificaciones cargadas correctamente")
  } catch (error) {
    console.error("Error al cargar notificaciones:", error)
  }
}

// Add a function to mark a notification as read
function markNotificationAsRead(notificationId) {
  console.log(`Marcando notificación ${notificationId} como leída`)

  try {
    Storage.markNotificationAsRead(notificationId)
    loadNotificationsData() // Recargar notificaciones
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error)
  }
}

// Función para popular los select de PRST
function populatePRSTSelectsData() {
  console.log("Populating PRST selects")

  try {
    const prsts = Storage.getPRSTs()
    const prstSelects = document.querySelectorAll(".prst-select")

    if (!prstSelects || prstSelects.length === 0) {
      console.warn("No se encontraron elementos con la clase prst-select")
      return
    }

    prstSelects.forEach((select) => {
      // Limpiar select
      select.innerHTML = ""

      // Agregar opción por defecto
      const defaultOption = document.createElement("option")
      defaultOption.value = ""
      defaultOption.textContent = "Seleccione un PRST"
      select.appendChild(defaultOption)

      // Llenar select con PRSTs
      prsts.forEach((prst) => {
        const option = document.createElement("option")
        option.value = prst.id
        option.textContent = prst.nombre
        select.appendChild(option)
      })
    })

    console.log("PRST selects populados correctamente")
  } catch (error) {
    console.error("Error al popular PRST selects:", error)
  }
}

// Función para extraer las fechas disponibles de los proyectos
function extractAvailableDatesData() {
  console.log("Extrayendo fechas disponibles de los proyectos")

  try {
    const projects = Storage.getProjects()

    // Limpiar sets
    availableDates.creacion.clear()
    availableDates.inicio.clear()
    availableDates.fin.clear()

    // Extraer fechas
    projects.forEach((project) => {
      if (project.fechaCreacion) {
        availableDates.creacion.add(project.fechaCreacion)
      }
      if (project.fechaInicio) {
        availableDates.inicio.add(project.fechaInicio)
      }
      if (project.fechaFin) {
        availableDates.fin.add(project.fechaFin)
      }
    })

    console.log("Fechas disponibles extraídas correctamente")
  } catch (error) {
    console.error("Error al extraer fechas disponibles:", error)
  }
}

// Función para popular los select de fechas
function populateDateSelectors() {
  console.log("Populating date selectors")

  try {
    const filterDateType = document.getElementById("filter-date-type")
    const filterDateFrom = document.getElementById("filter-date-from")
    const filterDateTo = document.getElementById("filter-date-to")

    if (!filterDateType || !filterDateFrom || !filterDateTo) {
      console.warn("Uno o más elementos de filtro de fecha no encontrados")
      return
    }

    const dateType = filterDateType.value
    let dates = []

    switch (dateType) {
      case "creacion":
        dates = Array.from(availableDates.creacion)
        break
      case "inicio":
        dates = Array.from(availableDates.inicio)
        break
      case "fin":
        dates = Array.from(availableDates.fin)
        break
      default:
        console.warn("Tipo de fecha no válido")
        return
    }

    // Limpiar selectores
    filterDateFrom.innerHTML = ""
    filterDateTo.innerHTML = ""

    // Agregar opción por defecto
    const defaultOptionFrom = document.createElement("option")
    defaultOptionFrom.value = ""
    defaultOptionFrom.textContent = "Desde"
    filterDateFrom.appendChild(defaultOptionFrom)

    const defaultOptionTo = document.createElement("option")
    defaultOptionTo.value = ""
    defaultOptionTo.textContent = "Hasta"
    filterDateTo.appendChild(defaultOptionTo)

    // Llenar selectores con fechas
    dates.forEach((date) => {
      const optionFrom = document.createElement("option")
      optionFrom.value = date
      optionFrom.textContent = formatDate(date)
      filterDateFrom.appendChild(optionFrom)

      const optionTo = document.createElement("option")
      optionTo.value = date
      optionTo.textContent = formatDate(date)
      filterDateTo.appendChild(optionTo)
    })

    console.log("Selectores de fecha populados correctamente")
  } catch (error) {
    console.error("Error al popular selectores de fecha:", error)
  }
}

// Función para filtrar proyectos
function filterProjects() {
  console.log("Filtrando proyectos")

  try {
    const filterDateType = document.getElementById("filter-date-type")
    const filterDateFrom = document.getElementById("filter-date-from")
    const filterDateTo = document.getElementById("filter-date-to")

    if (!filterDateType || !filterDateFrom || !filterDateTo) {
      console.warn("Uno o más elementos de filtro de fecha no encontrados")
      return
    }

    const dateType = filterDateType.value
    const dateFrom = filterDateFrom.value
    const dateTo = filterDateTo.value

    // Obtener todos los proyectos
    let projects = Storage.getProjects()

    // Filtrar por tipo de fecha
    if (dateType && dateFrom && dateTo) {
      projects = projects.filter((project) => {
        let projectDate = null

        switch (dateType) {
          case "creacion":
            projectDate = project.fechaCreacion
            break
          case "inicio":
            projectDate = project.fechaInicio
            break
          case "fin":
            projectDate = project.fechaFin
            break
          default:
            console.warn("Tipo de fecha no válido")
            return false
        }

        if (!projectDate) {
          return false
        }

        return projectDate >= dateFrom && projectDate <= dateTo
      })
    }

    // Mostrar proyectos filtrados
    showFilteredProjects("Proyectos Filtrados", projects)

    console.log("Proyectos filtrados correctamente")
  } catch (error) {
    console.error("Error al filtrar proyectos:", error)
  }
}

// Función para mostrar el modal de usuario
function showUserModal(userId = null) {
  console.log(`Mostrando modal de usuario para el usuario con ID: ${userId}`)

  try {
    const userModal = document.getElementById("userModal")
    const userTitle = document.getElementById("user-title")
    const userIdInput = document.getElementById("user-id")
    const userNombreInput = document.getElementById("user-nombre")
    const userApellidoInput = document.getElementById("user-apellido")
    const userEmailInput = document.getElementById("user-email")
    const userPasswordInput = document.getElementById("user-password")
    const userRolInput = document.getElementById("user-rol")
    const userActivoInput = document.getElementById("user-activo")
    const userActivoTextInput = document.getElementById("user-activo-text")
    const toggleUserStatusBtn = document.getElementById("toggle-user-status-btn")
    const toggleStatusText = document.getElementById("toggle-status-text")

    // Limpiar campos
    userIdInput.value = ""
    userNombreInput.value = ""
    userApellidoInput.value = ""
    userEmailInput.value = ""
    userPasswordInput.value = ""
    userRolInput.value = "usuario"
    userActivoInput.value = "true"
    userActivoTextInput.value = "Activo"

    // Si se está editando un usuario, cargar los datos
    if (userId) {
      const user = Storage.getUser(userId)

      if (!user) {
        console.error(`No se encontró el usuario con ID: ${userId}`)
        alert("No se encontró el usuario. Por favor, recargue la página.")
        return
      }

      userTitle.textContent = "Editar Usuario"
      userIdInput.value = user.id
      userNombreInput.value = user.nombre
      userApellidoInput.value = user.apellido
      userEmailInput.value = user.email
      userRolInput.value = user.rol
      userActivoInput.value = user.activo.toString()
      userActivoTextInput.value = user.activo ? "Activo" : "Inactivo"

      // Cambiar texto del botón
      if (toggleUserStatusBtn && toggleStatusText) {
        toggleStatusText.textContent = user.activo ? "Desactivar Usuario" : "Activar Usuario"
        if (user.activo) {
          toggleUserStatusBtn.classList.remove("btn-success")
          toggleUserStatusBtn.classList.add("btn-warning")
        } else {
          toggleUserStatusBtn.classList.remove("btn-warning")
          toggleUserStatusBtn.classList.add("btn-success")
        }
      }
    } else {
      userTitle.textContent = "Nuevo Usuario"
      if (toggleUserStatusBtn && toggleStatusText) {
        toggleStatusText.textContent = "Desactivar Usuario"
        toggleUserStatusBtn.classList.remove("btn-success")
        toggleUserStatusBtn.classList.add("btn-warning")
      }
    }

    // Mostrar modal
    const modal = new bootstrap.Modal(userModal)
    modal.show()

    console.log("Modal de usuario mostrado correctamente")
  } catch (error) {
    console.error("Error al mostrar modal de usuario:", error)
    alert("Error al mostrar el formulario. Por favor, recargue la página.")
  }
}

// Función para guardar un usuario
function saveUser() {
  console.log("Guardando usuario")

  try {
    const userIdInput = document.getElementById("user-id")
    const userNombreInput = document.getElementById("user-nombre")
    const userApellidoInput = document.getElementById("user-apellido")
    const userEmailInput = document.getElementById("user-email")
    const userPasswordInput = document.getElementById("user-password")
    const userRolInput = document.getElementById("user-rol")
    const userActivoInput = document.getElementById("user-activo")

    const userId = userIdInput.value
    const userNombre = userNombreInput.value
    const userApellido = userApellidoInput.value
    const userEmail = userEmailInput.value
    const userPassword = userPasswordInput.value
    const userRol = userRolInput.value
    const userActivo = userActivoInput.value === "true"

    // Validar campos
    if (!userNombre || !userApellido || !userEmail || !userRol) {
      alert("Por favor, complete todos los campos.")
      return
    }

    // Crear objeto usuario
    const user = {
      id: userId || generateId(),
      nombre: userNombre,
      apellido: userApellido,
      email: userEmail,
      rol: userRol,
      activo: userActivo,
    }

    // Si es un nuevo usuario, generar una contraseña
    if (!userId) {
      user.password = userPassword || generatePassword()
    } else {
      // Si se está editando un usuario, mantener la contraseña existente
      const existingUser = Storage.getUser(userId)
      user.password = existingUser.password
    }

    // Guardar usuario
    Storage.saveUser(user)

    // Cerrar modal
    const userModal = document.getElementById("userModal")
    const modal = bootstrap.Modal.getInstance(userModal)
    modal.hide()

    // Recargar tabla de usuarios
    loadUsersTableData()

    // Recargar gráfico de usuarios por rol
    loadCharts(Storage.getUsers(), Storage.getProjects())

    console.log("Usuario guardado correctamente")
  } catch (error) {
    console.error("Error al guardar usuario:", error)
    alert("Error al guardar el usuario. Por favor, inténtelo de nuevo.")
  }
}

// Función para eliminar un usuario
function deleteUser(userId) {
  console.log(`Eliminando usuario con ID: ${userId}`)

  try {
    if (!confirm("¿Está seguro de que desea eliminar este usuario?")) {
      return
    }

    // Eliminar usuario
    Storage.deleteUser(userId)

    // Recargar tabla de usuarios
    loadUsersTableData()

    // Recargar gráfico de usuarios por rol
    loadCharts(Storage.getUsers(), Storage.getProjects())

    console.log("Usuario eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    alert("Error al eliminar el usuario. Por favor, inténtelo de nuevo.")
  }
}

// Función para mostrar el modal de proyecto
function showProjectModal(projectId = null) {
  console.log(`Mostrando modal de proyecto para el proyecto con ID: ${projectId}`)

  try {
    const projectModal = document.getElementById("projectModal")
    const projectTitle = document.getElementById("project-title")
    const projectIdInput = document.getElementById("project-id")
    const projectNombreInput = document.getElementById("project-nombre")
    const projectPRSTSelect = document.getElementById("project-prst")
    const projectDepartamentoInput = document.getElementById("project-departamento")
    const projectFechaCreacionInput = document.getElementById("project-fecha-creacion")
    const projectFechaInicioInput = document.getElementById("project-fecha-inicio")
    const projectFechaFinInput = document.getElementById("project-fecha-fin")
    const projectEstadoInput = document.getElementById("project-estado")

    // Limpiar campos
    projectIdInput.value = ""
    projectNombreInput.value = ""
    projectPRSTSelect.value = ""
    projectDepartamentoInput.value = ""
    projectFechaCreacionInput.value = ""
    projectFechaInicioInput.value = ""
    projectFechaFinInput.value = ""
    projectEstadoInput.value = "Nuevo"

    // Si se está editando un proyecto, cargar los datos
    if (projectId) {
      const project = Storage.getProject(projectId)

      if (!project) {
        console.error(`No se encontró el proyecto con ID: ${projectId}`)
        alert("No se encontró el proyecto. Por favor, recargue la página.")
        return
      }

      projectTitle.textContent = "Editar Proyecto"
      projectIdInput.value = project.id
      projectNombreInput.value = project.nombre
      projectPRSTSelect.value = project.prstId
      projectDepartamentoInput.value = project.departamento
      projectFechaCreacionInput.value = project.fechaCreacion
      projectFechaInicioInput.value = project.fechaInicio
      projectFechaFinInput.value = project.fechaFin
      projectEstadoInput.value = project.estado
    } else {
      projectTitle.textContent = "Nuevo Proyecto"
    }

    // Mostrar modal
    const modal = new bootstrap.Modal(projectModal)
    modal.show()

    console.log("Modal de proyecto mostrado correctamente")
  } catch (error) {
    console.error("Error al mostrar modal de proyecto:", error)
    alert("Error al mostrar el formulario. Por favor, recargue la página.")
  }
}

// Función para guardar un proyecto
function saveProject() {
  console.log("Guardando proyecto")

  try {
    const projectIdInput = document.getElementById("project-id")
    const projectNombreInput = document.getElementById("project-nombre")
    const projectPRSTSelect = document.getElementById("project-prst")
    const projectDepartamentoInput = document.getElementById("project-departamento")
    const projectFechaCreacionInput = document.getElementById("project-fecha-creacion")
    const projectFechaInicioInput = document.getElementById("project-fecha-inicio")
    const projectFechaFinInput = document.getElementById("project-fecha-fin")
    const projectEstadoInput = document.getElementById("project-estado")

    const projectId = projectIdInput.value
    const projectNombre = projectNombreInput.value
    const projectPRSTId = projectPRSTSelect.value
    const projectPRST = Storage.getPRST(projectPRSTId)
    const projectPRSTNombre = projectPRST ? projectPRST.nombre : "N/A"
    const projectDepartamento = projectDepartamentoInput.value
    const projectFechaCreacion = projectFechaCreacionInput.value
    const projectFechaInicio = projectFechaInicioInput.value
    const projectFechaFin = projectFechaFinInput.value
    const projectEstado = projectEstadoInput.value

    // Validar campos
    if (
      !projectNombre ||
      !projectPRSTId ||
      !projectDepartamento ||
      !projectFechaCreacion ||
      !projectFechaInicio ||
      !projectFechaFin ||
      !projectEstado
    ) {
      alert("Por favor, complete todos los campos.")
      return
    }

    // Crear objeto proyecto
    const project = {
      id: projectId || generateId(),
      nombre: projectNombre,
      prstId: projectPRSTId,
      prstNombre: projectPRSTNombre,
      departamento: projectDepartamento,
      fechaCreacion: projectFechaCreacion,
      fechaInicio: projectFechaInicio,
      fechaFin: projectFechaFin,
      estado: projectEstado,
    }

    // Guardar proyecto
    Storage.saveProject(project)

    // Cerrar modal
    const projectModal = document.getElementById("projectModal")
    const modal = bootstrap.Modal.getInstance(projectModal)
    modal.hide()

    // Recargar tabla de proyectos
    loadProjectsTableData()

    // Recargar gráficos
    loadCharts(Storage.getUsers(), Storage.getProjects())

    // Recargar gráfico de flujo de proyectos
    loadProjectsFlowChart()

    // Recargar tabla de proyectos filtrados si está visible
    const filteredSection = document.getElementById("filtered-projects-section")
    if (filteredSection && !filteredSection.classList.contains("d-none")) {
      filterProjects()
    }

    console.log("Proyecto guardado correctamente")
  } catch (error) {
    console.error("Error al guardar proyecto:", error)
    alert("Error al guardar el proyecto. Por favor, inténtelo de nuevo.")
  }
}

// Función para eliminar un proyecto
function deleteProject(projectId) {
  console.log(`Eliminando proyecto con ID: ${projectId}`)

  try {
    if (!confirm("¿Está seguro de que desea eliminar este proyecto?")) {
      return
    }

    // Eliminar proyecto
    Storage.deleteProject(projectId)

    // Recargar tabla de proyectos
    loadProjectsTableData()

    // Recargar gráficos
    loadCharts(Storage.getUsers(), Storage.getProjects())

    // Recargar gráfico de flujo de proyectos
    loadProjectsFlowChart()

    // Recargar tabla de proyectos filtrados si está visible
    const filteredSection = document.getElementById("filtered-projects-section")
    if (filteredSection && !filteredSection.classList.contains("d-none")) {
      filterProjects()
    }

    console.log("Proyecto eliminado correctamente")
  } catch (error) {
    console.error("Error al eliminar proyecto:", error)
    alert("Error al eliminar el proyecto. Por favor, inténtelo de nuevo.")
  }
}

// Función para mostrar los detalles de un proyecto
function viewProjectDetails(projectId) {
  console.log(`Mostrando detalles del proyecto con ID: ${projectId}`);

  try {
    const project = Storage.getProjectById(projectId);
    
    if (!project) {
      console.error(`No se encontró el proyecto con ID: ${projectId}`);
      alert("No se encontró el proyecto. Por favor, recargue la página.");
      return;
    }

    // Obtener referencias a los elementos del modal
    const projectDetailsModal = document.getElementById("modalDetalleProyecto");
    const detailProjectId = document.getElementById("detalleProyectoId");
    const detailProjectNombre = document.getElementById("detalleProyectoNombre");
    const detailProjectPrst = document.getElementById("detalleProyectoPrst");
    const detailProjectDepartamento = document.getElementById("detalleProyectoDepartamento");
    const detailProjectMunicipio = document.getElementById("detalleProyectoMunicipio");
    const detailProjectBarrios = document.getElementById("detalleProyectoBarrios");
    const detailProjectFechaCreacion = document.getElementById("detalleProyectoFechaCreacion");
    const detailProjectFechaInicio = document.getElementById("detalleProyectoFechaInicio");
    const detailProjectFechaFin = document.getElementById("detalleProyectoFechaFin");
    const detailProjectEstado = document.getElementById("detalleProyectoEstado");
    const detailProjectPostes = document.getElementById("detalleProyectoPostes");
    const detailProjectTipoSolicitud = document.getElementById("detalleProyectoTipoSolicitud");
    const detailProjectCreador = document.getElementById("detalleProyectoCreador");
    const detailProjectEjecutiva = document.getElementById("detalleProyectoEjecutiva");
    const detailProjectAnalista = document.getElementById("detalleProyectoAnalista");
    const detailProjectBrigada = document.getElementById("detalleProyectoBrigada");

    // Función para formatear el tipo de solicitud
    const formatTipoSolicitud = (tipo) => {
      switch(tipo) {
        case "SEV":
          return "Solicitud de Estudio de Viabilidad (SEV): Nuevo Proyecto a Construir";
        case "SDR":
          return "Solicitud de Desmonte de Redes (SDR): Desmonte de Proyecto Existente";
        case "SIPRST":
          return "Solicitud de Intervenciones PRST (SIPRST): Mantenimiento a Red Existente";
        default:
          return tipo || "No especificado";
      }
    };

    // Llenar datos básicos
    if (detailProjectId) detailProjectId.textContent = project.id || "N/A";
    if (detailProjectNombre) detailProjectNombre.textContent = project.nombre || "Sin nombre";
    if (detailProjectPrst) detailProjectPrst.textContent = project.prstNombre || "N/A";
    if (detailProjectDepartamento) detailProjectDepartamento.textContent = project.departamento || "N/A";
    if (detailProjectMunicipio) detailProjectMunicipio.textContent = project.municipio || "N/A";
    if (detailProjectBarrios) detailProjectBarrios.textContent = project.barrios ? project.barrios.join(", ") : "N/A";
    if (detailProjectFechaCreacion) detailProjectFechaCreacion.textContent = formatDate(project.fechaCreacion) || "N/A";
    if (detailProjectFechaInicio) detailProjectFechaInicio.textContent = formatDate(project.fechaInicio) || "N/A";
    if (detailProjectFechaFin) detailProjectFechaFin.textContent = formatDate(project.fechaFin) || "N/A";
    if (detailProjectEstado) detailProjectEstado.textContent = project.estado || "No definido";
    if (detailProjectPostes) detailProjectPostes.textContent = project.numPostes || "N/A";
    if (detailProjectTipoSolicitud) detailProjectTipoSolicitud.textContent = formatTipoSolicitud(project.tipoSolicitud);

    // Llenar información de asignaciones
    if (detailProjectCreador) {
      const creador = project.creadorId ? Storage.getUserById(project.creadorId) : null;
      detailProjectCreador.textContent = creador ? `${creador.nombre} ${creador.apellido}` : "N/A";
    }
    
    if (detailProjectEjecutiva) {
      const ejecutiva = project.ejecutivaId ? Storage.getUserById(project.ejecutivaId) : null;
      detailProjectEjecutiva.textContent = ejecutiva ? `${ejecutiva.nombre} ${ejecutiva.apellido}` : "N/A";
    }
    
    if (detailProjectAnalista) {
      const analista = project.analistaId ? Storage.getUserById(project.analistaId) : null;
      detailProjectAnalista.textContent = analista ? `${analista.nombre} ${analista.apellido}` : "N/A";
    }
    
    if (detailProjectBrigada) {
      const brigada = project.brigadaId ? Storage.getUserById(project.brigadaId) : null;
      detailProjectBrigada.textContent = brigada ? `${brigada.nombre} ${brigada.apellido}` : "N/A";
    }

    // Mostrar modal
    const modal = new bootstrap.Modal(projectDetailsModal);
    modal.show();

    console.log("Detalles del proyecto mostrados correctamente");
  } catch (error) {
    console.error("Error al mostrar detalles del proyecto:", error);
    alert("Error al mostrar los detalles del proyecto. Por favor, inténtelo de nuevo.");
  }
}

// Función para mostrar el historial en el formato exacto requerido
// Función para mostrar el historial del proyecto (similar a prst.js)
function showProjectHistory(projectId) {
  console.log(`Mostrando historial del proyecto: ${projectId}`);

  try {
    const project = Storage.getProjectById(projectId);
    if (!project) {
      console.error(`Proyecto no encontrado: ${projectId}`);
      alert("No se encontró el proyecto solicitado");
      return;
    }

    // Crear historial si no existe o está vacío
    if (!project.historial || project.historial.length === 0) {
      console.log("Creando historial para el proyecto");
      project.historial = [];

      // Agregar estado inicial de creación
      project.historial.push({
        estado: "Nuevo",
        fecha: project.fechaCreacion,
        usuario: project.creadorNombre || "Sistema",
        rol: "PRST",
        descripcion: "Proyecto creado y enviado a revisión",
      });

      // Agregar otros estados según las fechas registradas
      if (project.fechaEnvio) {
        project.historial.push({
          estado: "En Proceso de Viabilidad",
          fecha: project.fechaEnvio,
          usuario: project.creadorNombre || "Sistema",
          rol: "PRST",
          descripcion: "Proyecto enviado a revisión",
        });
      }

      if (project.fechaRechazo) {
        project.historial.push({
          estado: "Documentación Errada",
          fecha: project.fechaRechazo,
          usuario: project.ejecutivaNombre || "Ejecutiva",
          rol: "Ejecutiva",
          descripcion: project.observacionesEjecutiva || "Proyecto rechazado por documentación incorrecta",
        });
      }

      if (project.fechaReenvio) {
        project.historial.push({
          estado: "En Proceso de Viabilidad",
          fecha: project.fechaReenvio,
          usuario: project.creadorNombre || "Sistema",
          rol: "PRST",
          descripcion: "Proyecto reenviado a revisión después de correcciones",
        });
      }

      if (project.fechaAprobacion) {
        project.historial.push({
          estado: "En Asignación",
          fecha: project.fechaAprobacion,
          usuario: project.ejecutivaNombre || "Ejecutiva",
          rol: "Ejecutiva",
          descripcion: "Proyecto aprobado y enviado a coordinación",
        });
      }

      // Guardar el historial
      Storage.saveProject(project);
    }

    // Ordenar historial por fecha (más recientes primero)
    const sortedHistory = [...project.historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    console.log(`Entradas en el historial: ${sortedHistory.length}`);

    // Mapeo de estados para mostrar nombres consistentes
    const estadoMapping = {
      "Nuevo": "Nuevo",
      "En Proceso de Viabilidad": "En Proceso de Viabilidad",
      "Documentación Errada": "Documentación Errada",
      "En Asignación": "En Asignación",
      "En Gestión por Analista": "En Gestión por Analista",
      "En Gestión por Brigada": "En Gestión por Brigada",
      "Gestionado por Analista (Aprobado)": "Gestionado por Analista (Aprobado)",
      "Gestionado por Analista con Observación": "Gestionado por Analista con Observación",
      "Gestionado por Brigada (Aprobado)": "Gestionado por Brigada (Aprobado)",
      "Gestionado por Brigada con Observación": "Gestionado por Brigada con Observación",
      "En Revisión de Verificación": "En Revisión de Verificación",
      "Generación de Informe": "Generación de Informe",
      "Opción Mejorar": "Opción Mejorar",
      "Finalizado": "Finalizado"
    };

    // Crear modal para mostrar historial
    const modalHtml = `
      <div class="modal fade" id="historialModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Historial del Proyecto: ${project.id}</h5>
              <button type="button" class="btn btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>Estado</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sortedHistory
                      .map(
                        (item) => `
                      <tr>
                        <td>${formatDateTime(item.fecha)}</td>
                        <td><span class="badge ${getBadgeClass(item.estado)}">${estadoMapping[item.estado] || item.estado}</span></td>
                        <td>${item.usuario || "No especificado"}</td>
                        <td>${item.rol || "No especificado"}</td>
                        <td>${item.descripcion || "No hay descripción"}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Eliminar modal anterior si existe
    const oldModal = document.getElementById("historialModal");
    if (oldModal) {
      oldModal.remove();
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Mostrar modal
    const historialModal = new bootstrap.Modal(document.getElementById("historialModal"));
    historialModal.show();
  } catch (error) {
    console.error("Error al mostrar historial del proyecto:", error);
    alert("Error al cargar el historial del proyecto. Por favor, intente nuevamente.");
  }
}

// Función auxiliar para formatear fecha y hora
function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Función para formatear fecha exactamente como se requiere
function formatDateTimeExact(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Función para formatear nombres de usuario (nombre + primer apellido)
function formatUserName(fullName) {
  if (!fullName) return "Usuario desconocido";
  
  // Eliminar segundos apellidos si existen
  const parts = fullName.split(' ');
  if (parts.length <= 2) return fullName; // Ya está en formato correcto
  
  return `${parts[0]} ${parts[1]}`; // Nombre + primer apellido
}

// Función para obtener el historial ordenado (más reciente primero)
function getProjectHistoryFromStorage(projectId) {
  const project = Storage.getProjectById(projectId);
  if (!project) return [];

  const history = [];
  const users = Storage.getUsers();

  // Función para obtener información del usuario formateada
  const getUserInfoFormatted = (userId) => {
    if (!userId) return { name: "Sistema", role: "sistema" };
    const user = users.find(u => u.id === userId);
    
    if (!user) return { name: "Usuario desconocido", role: "desconocido" };
    
    // Formatear nombre (nombre + primer apellido)
    const formattedName = formatUserName(`${user.nombre} ${user.apellido}`);
    
    return { 
      name: formattedName, 
      role: user.rol.toLowerCase() 
    };
  };

  // 1. Creación del proyecto
  if (project.fechaCreacion) {
    const creator = getUserInfoFormatted(project.creadorId);
    history.push({
      fecha: project.fechaCreacion,
      estado: "Nuevo",
      usuario: creator.name,
      rol: creator.role,
      descripcion: "Proyecto creado por PRST",
      ot: project.id
    });
  }

  // 2. Procesar el historial de estados
  if (project.historialEstados && Array.isArray(project.historialEstados)) {
    project.historialEstados.forEach(change => {
      const user = getUserInfoFormatted(change.usuarioId);
      history.push({
        fecha: change.fecha,
        estado: change.nuevoEstado,
        usuario: user.name,
        rol: user.role,
        descripcion: getStatusDescription(change.nuevoEstado, change.estadoAnterior, change.comentario),
        ot: project.id
      });
    });
  }

  // 3. Ordenar por fecha (más reciente primero)
  history.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return history;
}

// Función auxiliar para obtener el historial (simulada)
// Función auxiliar para obtener el historial completo del proyecto
// Función mejorada para obtener el historial completo del proyecto
// Función mejorada para obtener el historial completo del proyecto
function getProjectHistoryFromStorage(projectId) {
  const project = Storage.getProjectById(projectId);
  if (!project) return [];

  const history = [];
  const users = Storage.getUsers();

  // Función para obtener información del usuario
  const getUserInfo = (userId) => {
    if (!userId) return { name: "Sistema", role: "Sistema" };
    const user = users.find(u => u.id === userId);
    return user ? { name: `${user.nombre} ${user.apellido}`, role: user.rol } : { name: "Usuario desconocido", role: "Rol desconocido" };
  };

  // 1. Creación del proyecto (siempre debe estar)
  if (project.fechaCreacion) {
    const creator = getUserInfo(project.creadorId);
    history.push({
      fecha: project.fechaCreacion,
      estado: "Nuevo",
      usuario: creator.name,
      rol: creator.role,
      descripcion: "Proyecto creado por PRST",
      ot: project.id
    });
  }

  // 2. Procesar el historial de estados en orden cronológico
  if (project.historialEstados && Array.isArray(project.historialEstados)) {
    project.historialEstados.forEach(change => {
      const user = getUserInfo(change.usuarioId);
      history.push({
        fecha: change.fecha,
        estado: change.nuevoEstado,
        usuario: user.name,
        rol: user.role,
        descripcion: getStatusDescription(change.nuevoEstado, change.estadoAnterior, change.comentario),
        ot: project.id
      });
    });
  }

  // 3. Ordenar por fecha (más antiguo primero para el procesamiento)
  history.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // 4. Reconstruir el flujo completo en el orden correcto
  const orderedHistory = [];
  const estadosPresentes = history.map(item => item.estado);
  
  // Nuevo (siempre primero)
  const nuevoIndex = estadosPresentes.indexOf("Nuevo");
  if (nuevoIndex !== -1) orderedHistory.push(history[nuevoIndex]);

  // En Proceso de Viabilidad (ejecutiva)
  const viabilidadIndex = estadosPresentes.indexOf("En Proceso de Viabilidad");
  if (viabilidadIndex !== -1) orderedHistory.push(history[viabilidadIndex]);

  // Documentación Errada (si existe)
  const docErradaIndex = estadosPresentes.indexOf("Documentacion Errada");
  if (docErradaIndex !== -1) orderedHistory.push(history[docErradaIndex]);

  // En Asignación (coordinador)
  const asignacionIndex = estadosPresentes.indexOf("En Asignación");
  if (asignacionIndex !== -1) orderedHistory.push(history[asignacionIndex]);

  // En Gestión por Analista
  const gestionAnalistaIndex = estadosPresentes.indexOf("En Gestion por Analista");
  if (gestionAnalistaIndex !== -1) orderedHistory.push(history[gestionAnalistaIndex]);

  // Gestionado por Analista (Aprobado/Observación)
  const analistaAprobadoIndex = estadosPresentes.findIndex(e => e.includes("Gestionado por Analista"));
  if (analistaAprobadoIndex !== -1) orderedHistory.push(history[analistaAprobadoIndex]);

  // En Gestión por Brigada
  const gestionBrigadaIndex = estadosPresentes.indexOf("En Gestion por Brigada");
  if (gestionBrigadaIndex !== -1) orderedHistory.push(history[gestionBrigadaIndex]);

  // Gestionado por Brigada (Aprobado/Observación)
  const brigadaAprobadoIndex = estadosPresentes.findIndex(e => e.includes("Gestionado por Brigada"));
  if (brigadaAprobadoIndex !== -1) orderedHistory.push(history[brigadaAprobadoIndex]);

  // En Revisión de Verificación
  const revisionIndex = estadosPresentes.indexOf("En Revision de Verificacion");
  if (revisionIndex !== -1) orderedHistory.push(history[revisionIndex]);

  // Generación de Informe
  const informeIndex = estadosPresentes.indexOf("Generacion de Informe");
  if (informeIndex !== -1) orderedHistory.push(history[informeIndex]);

  // Opción Mejorar
  const mejorarIndex = estadosPresentes.indexOf("Opcion Mejorar");
  if (mejorarIndex !== -1) orderedHistory.push(history[mejorarIndex]);

  // Finalizado
  const finalizadoIndex = estadosPresentes.indexOf("Finalizado");
  if (finalizadoIndex !== -1) orderedHistory.push(history[finalizadoIndex]);

  // 5. Invertir el orden para mostrar los más recientes primero
  return orderedHistory.reverse();
}

// Función para mostrar el historial en la tabla
function showProjectHistory(projectId) {
  const project = Storage.getProjectById(projectId);
  if (!project) return;

  const historyModal = document.getElementById("projectHistoryModal");
  const historyBody = document.getElementById("project-history-body");
  const projectNameElement = document.getElementById("history-project-name");

  if (!historyModal || !historyBody || !projectNameElement) return;

  // Limpiar tabla
  historyBody.innerHTML = "";

  // Obtener historial ordenado (más reciente primero)
  const historial = getProjectHistoryFromStorage(projectId);

  // Llenar tabla
  historial.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDateTime(item.fecha)}</td>
      <td>${item.ot || "N/A"}</td>
      <td><span class="badge ${getBadgeClass(item.estado)}">${item.estado}</span></td>
      <td>${item.usuario}</td>
      <td>${item.rol}</td>
      <td>${item.descripcion}</td>
    `;
    historyBody.appendChild(row);
  });

  // Mostrar modal
  const modal = new bootstrap.Modal(historyModal);
  modal.show();
}

// Función para formatear fecha y hora
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Función mejorada para descripciones de estado
function getStatusDescription(nuevoEstado, estadoAnterior, comentario = "") {
  const descriptions = {
    "Nuevo": "Proyecto creado por PRST",
    "En Proceso de Viabilidad": "Proyecto en revisión por ejecutiva",
    "En Asignación": "Proyecto asignado a coordinador",
    "En Gestion por Analista": "Proyecto asignado a analista",
    "Gestionado por Analista (Aprobado)": "Analista completó revisión sin observaciones" + (comentario ? ": " + comentario : ""),
    "Gestionado por Analista con Observación": "Analista encontró observaciones" + (comentario ? ": " + comentario : ""),
    "En Gestion por Brigada": "Proyecto asignado a brigada",
    "Gestionado por Brigada (Aprobado)": "Brigada completó revisión sin observaciones" + (comentario ? ": " + comentario : ""),
    "Gestionado por Brigada con Observación": "Brigada encontró observaciones" + (comentario ? ": " + comentario : ""),
    "En Revision de Verificacion": "Coordinador verificando información" + (comentario ? ": " + comentario : ""),
    "Generacion de Informe": "Coordinador generó informe final",
    "Opcion Mejorar": "Ejecutiva encontró observaciones" + (comentario ? ": " + comentario : ""),
    "Documentacion Errada": "Ejecutiva rechazó documentación" + (comentario ? ": " + comentario : ""),
    "Finalizado": "Proyecto completado"
  };

  return descriptions[nuevoEstado] || `Cambio de estado: ${estadoAnterior} → ${nuevoEstado}` + (comentario ? " (" + comentario + ")" : "");
}

// Función mejorada para generar descripciones específicas de cada estado
function getStatusDescription(nuevoEstado, estadoAnterior, comentario = "") {
  const descriptions = {
    "Nuevo": "Proyecto creado por PRST",
    "En Proceso de Viabilidad": "En revisión por ejecutiva",
    "Documentacion Errada": `Documentación rechazada por ejecutiva${comentario ? ": " + comentario : ""}`,
    "En Asignación": "Asignado a coordinador",
    "En Gestion por Analista": "Asignado a analista",
    "Gestionado por Analista (Aprobado)": "Revisión completada sin observaciones",
    "Gestionado por Analista con Observación": `Revisión con observaciones${comentario ? ": " + comentario : ""}`,
    "En Gestion por Brigada": "Asignado a brigada",
    "Gestionado por Brigada (Aprobado)": "Revisión completada sin observaciones",
    "Gestionado por Brigada con Observación": `Revisión con observaciones${comentario ? ": " + comentario : ""}`,
    "En Revision de Verificacion": "En verificación por coordinador",
    "Generacion de Informe": "Informe generado por coordinador",
    "Opcion Mejorar": `Observaciones de ejecutiva${comentario ? ": " + comentario : ""}`,
    "Finalizado": "Proyecto completado"
  };

  return descriptions[nuevoEstado] || `Cambio de estado: ${estadoAnterior} → ${nuevoEstado}${comentario ? " (" + comentario + ")" : ""}`;
}

// Función para generar descripciones específicas de cada estado
function getStatusDescription(nuevoEstado, estadoAnterior) {
  const descriptions = {
    "Nuevo": "Proyecto creado por PRST",
    "En Proceso de Viabilidad": "En revisión por ejecutiva",
    "Documentacion Errada": "Documentación rechazada por ejecutiva",
    "En Asignación": "Asignado a coordinador",
    "En Gestion por Analista": "Asignado a analista",
    "Gestionado por Analista (Aprobado)": "Revisión completada sin observaciones",
    "Gestionado por Analista con Observación": "Revisión con observaciones",
    "En Gestion por Brigada": "Asignado a brigada",
    "Gestionado por Brigada (Aprobado)": "Revisión completada sin observaciones",
    "Gestionado por Brigada con Observación": "Revisión con observaciones",
    "En Revision de Verificacion": "En verificación por coordinador",
    "Generacion de Informe": "Informe generado por coordinador",
    "Opcion Mejorar": "Observaciones de ejecutiva",
    "Finalizado": "Proyecto completado"
  };

  return descriptions[nuevoEstado] || `Cambio de estado: ${estadoAnterior} → ${nuevoEstado}`;
}

// Función para generar descripciones específicas de cada estado
function getStatusDescription(nuevoEstado, estadoAnterior) {
  const descriptions = {
    "Nuevo": "Proyecto creado por PRST",
    "En Proceso de Viabilidad": "Proyecto en revisión por ejecutiva",
    "En Asignación": "Proyecto asignado a coordinador",
    "En Gestion por Analista": "Proyecto asignado a analista",
    "Gestionado por Analista (Aprobado)": "Analista completó revisión sin observaciones",
    "Gestionado por Analista con Observación": "Analista encontró observaciones",
    "En Gestion por Brigada": "Proyecto asignado a brigada",
    "Gestionado por Brigada (Aprobado)": "Brigada completó revisión sin observaciones",
    "Gestionado por Brigada con Observación": "Brigada encontró observaciones",
    "En Revision de Verificacion": "Coordinador verificando información",
    "Generacion de Informe": "Coordinador generó informe final",
    "Opcion Mejorar": "Ejecutiva encontró observaciones",
    "Documentacion Errada": "Ejecutiva rechazó documentación",
    "Finalizado": "Proyecto completado"
  };

  return descriptions[nuevoEstado] || `Cambio de estado: ${estadoAnterior} → ${nuevoEstado}`;
}
// Función auxiliar para formatear fechas
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
}

// Función auxiliar para las clases de los badges
function getBadgeClass(estado) {
  const statusClasses = {
    "Nuevo": "bg-secondary",
    "En Proceso de Viabilidad": "bg-info",
    "En Asignación": "bg-primary",
    "En Gestion por Analista": "bg-warning",
    "Gestionado por Analista (Aprobado)": "bg-success",
    "Gestionado por Analista con Observación": "bg-warning",
    "En Gestion por Brigada": "bg-warning",
    "Gestionado por Brigada (Aprobado)": "bg-success",
    "Gestionado por Brigada con Observación": "bg-warning",
    "En Revision de Verificacion": "bg-info",
    "Generacion de Informe": "bg-primary",
    "Opcion Mejorar": "bg-warning",
    "Documentacion Errada": "bg-danger",
    "Finalizado": "bg-success"
  };

  return statusClasses[estado] || "bg-secondary";
}

// Función auxiliar para formatear fechas
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
}

// Función auxiliar para las clases de los badges
function getBadgeClass(estado) {
  switch (estado) {
      case 'Nuevo': return 'bg-secondary';
      case 'En Proceso': return 'bg-info';
      case 'Completado': return 'bg-success';
      case 'Pendiente': return 'bg-warning';
      case 'Rechazado': return 'bg-danger';
      default: return 'bg-primary';
  }
}

// Función auxiliar para descargar documentos (ejemplo)
function descargarDocumento(documentoId) {
  console.log(`Descargando documento con ID: ${documentoId}`);
  // Aquí implementarías la lógica real para descargar el documento
  alert(`Función de descarga para documento ${documentoId} se ejecutaría aquí`);
}

// Función para mostrar el modal de cambio de estado
function showChangeStatusModal() {
  console.log("Mostrando modal de cambio de estado")

  try {
    const changeStatusModal = document.getElementById("changeStatusModal")
    const projectIdInput = document.getElementById("project-id-status")
    const projectStatusSelect = document.getElementById("project-status")

    // Limpiar campos
    projectIdInput.value = ""
    projectStatusSelect.value = "Nuevo"

    // Mostrar modal
    const modal = new bootstrap.Modal(changeStatusModal)
    modal.show()

    console.log("Modal de cambio de estado mostrado correctamente")
  } catch (error) {
    console.error("Error al mostrar modal de cambio de estado:", error)
    alert("Error al mostrar el formulario. Por favor, recargue la página.")
  }
}

// Función para guardar el cambio de estado de un proyecto
function saveProjectStatus() {
  console.log("Guardando cambio de estado")

  try {
    const projectIdInput = document.getElementById("project-id-status")
    const projectStatusSelect = document.getElementById("project-status")

    const projectId = projectIdInput.value
    const projectStatus = projectStatusSelect.value

    // Validar campos
    if (!projectId || !projectStatus) {
      alert("Por favor, complete todos los campos.")
      return
    }

    // Obtener proyecto
    const project = Storage.getProject(projectId)

    if (!project) {
      console.error(`No se encontró el proyecto con ID: ${projectId}`)
      alert("No se encontró el proyecto. Por favor, recargue la página.")
      return
    }

    // Actualizar estado
    project.estado = projectStatus

    // Guardar proyecto
    Storage.saveProject(project)

    // Cerrar modal
    const changeStatusModal = document.getElementById("changeStatusModal")
    const modal = bootstrap.Modal.getInstance(changeStatusModal)
    modal.hide()

    // Recargar tabla de proyectos
    loadProjectsTableData()

    // Recargar gráficos
    loadCharts(Storage.getUsers(), Storage.getProjects())

    // Recargar gráfico de flujo de proyectos
    loadProjectsFlowChart()

    // Recargar tabla de proyectos filtrados si está visible
    const filteredSection = document.getElementById("filtered-projects-section")
    if (filteredSection && !filteredSection.classList.contains("d-none")) {
      filterProjects()
    }

    console.log("Cambio de estado guardado correctamente")
  } catch (error) {
    console.error("Error al guardar cambio de estado:", error)
    alert("Error al guardar el cambio de estado. Por favor, inténtelo de nuevo.")
  }
}

// Función para generar un ID único
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Función para generar una contraseña aleatoria
function generatePassword() {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
  let password = ""
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n))
  }
  return password
}

// Función para formatear una fecha
function formatDate(dateString) {
  if (!dateString) return "No especificada";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  } catch (e) {
    console.error("Error formateando fecha:", e);
    return "Fecha inválida";
  }
}

// Función para obtener la clase de badge según el estado del proyecto
function getBadgeClass(estado) {
  switch (estado) {
      case "Nuevo": return "bg-secondary";
      case "En Proceso de Viabilidad": return "bg-warning";
      case "En Gestión": return "bg-info";
      case "En Revisión de Verificación": return "bg-primary";
      case "Generación de Informe": return "bg-success";
      case "Opción Mejorar": return "bg-warning";
      case "Documentación Errada": return "bg-danger";
      case "Finalizado": return "bg-success";
      default: return "bg-secondary";
  }
}

// Add a function to show the profile modal
function showProfileModal() {
  const profileModal = document.getElementById("profileModal")
  const profileNombre = document.getElementById("profile-nombre")
  const profileApellido = document.getElementById("profile-apellido")
  const profileUsuario = document.getElementById("profile-usuario")
  const profileCorreo = document.getElementById("profile-correo")
  const profileRol = document.getElementById("profile-rol")

  if (!profileModal || !profileNombre || !profileApellido || !profileUsuario || !profileCorreo || !profileRol) {
    console.error("Elementos del perfil no encontrados")
    return
  }

  // Obtener datos del usuario actual
  const user = currentUser

  if (!user) {
    console.error("No hay usuario actual")
    return
  }

  // Llenar datos del perfil
  profileNombre.textContent = user.nombre || "No disponible"
  profileApellido.textContent = user.apellido || "No disponible"
  profileUsuario.textContent = user.usuario || "No disponible"
  profileCorreo.textContent = user.correo || "No disponible"
  profileRol.textContent = user.rol || "No disponible"

  // Mostrar modal
  const modal = new bootstrap.Modal(profileModal)
  modal.show()
}

// Add a function to show the change password modal
function showChangePasswordModal() {
  const changePasswordModal = document.getElementById("changePasswordModal")
  const currentPasswordInput = document.getElementById("current-password")
  const newPasswordInput = document.getElementById("new-password")
  const confirmPasswordInput = document.getElementById("confirm-password")

  if (!changePasswordModal || !currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    console.error("Elementos del cambio de contraseña no encontrados")
    return
  }

  // Limpiar campos
  currentPasswordInput.value = ""
  newPasswordInput.value = ""
  confirmPasswordInput.value = ""

  // Cerrar modal de perfil
  const profileModal = bootstrap.Modal.getInstance(document.getElementById("profileModal"))
  if (profileModal) {
    profileModal.hide()
  }

  // Mostrar modal de cambio de contraseña
  const modal = new bootstrap.Modal(changePasswordModal)
  modal.show()
}

// Add a function to save the new password
function saveNewPassword() {
  const currentPasswordInput = document.getElementById("current-password")
  const newPasswordInput = document.getElementById("new-password")
  const confirmPasswordInput = document.getElementById("confirm-password")

  if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
    console.error("Elementos del cambio de contraseña no encontrados")
    return
  }

  const currentPassword = currentPasswordInput.value
  const newPassword = newPasswordInput.value
  const confirmPassword = confirmPasswordInput.value

  // Validar campos
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Por favor, complete todos los campos.")
    return
  }

  // Validar que la contraseña actual sea correcta
  if (currentPassword !== currentUser.password) {
    alert("La contraseña actual es incorrecta.")
    return
  }

  // Validar que las nuevas contraseñas coincidan
  if (newPassword !== confirmPassword) {
    alert("Las nuevas contraseñas no coinciden.")
    return
  }

  // Validar longitud mínima
  if (newPassword.length < 6) {
    alert("La nueva contraseña debe tener al menos 6 caracteres.")
    return
  }

  // Actualizar contraseña
  const updatedUser = { ...currentUser, password: newPassword }
  Storage.saveUser(updatedUser)
  currentUser = updatedUser

  // Cerrar modal
  const changePasswordModal = bootstrap.Modal.getInstance(document.getElementById("changePasswordModal"))
  if (changePasswordModal) {
    changePasswordModal.hide()
  }

  alert("Contraseña actualizada correctamente.")
}

// Función para cargar proyectos en proceso de viabilidad
function loadInManagementProjects() {
  console.log("Cargando proyectos en gestión");

  try {
    // Definir los estados que se consideran "en gestión"
    const estadosEnGestion = [
      "Nuevo",
      "En Proceso de Viabilidad",
      "En Asignación",
      "En Gestion por Analista",
      "Gestionado por Analista (Aprobado)",
      "Gestionado por Analista con Observación",
      "En Gestion por Brigada",
      "Gestionado por Brigada (Aprobado)",
      "Gestionado por Brigada con Observación",
      "En Revision de Verificacion",
      "Generacion de Informe",
      "Opcion Mejorar",
      "Documentacion Errada"
    ];

    // Obtener todos los proyectos con los estados especificados
    const projects = Storage.getProjects().filter(project => 
      estadosEnGestion.includes(project.estado)
    );
    
    const tableBody = document.getElementById("in-progress-table-body");

    if (!tableBody) {
      console.warn("Elemento in-progress-table-body no encontrado");
      return;
    }

    // Limpiar tabla
    tableBody.innerHTML = "";

    // Si no hay proyectos, mostrar mensaje
    if (projects.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">No hay proyectos en gestión</td>
        </tr>
      `;
      return;
    }

    // Llenar tabla con proyectos
    projects.forEach((project) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${project.id || "N/A"}</td>
        <td>${project.nombre || "Sin nombre"}</td>
        <td>${project.prstNombre || "N/A"}</td>
        <td>${project.departamento || "N/A"}</td>
        <td>${formatDate(project.fechaCreacion) || "N/A"}</td>
        <td>${formatDate(project.fechaInicio) || "N/A"}</td>
        <td>${formatDate(project.fechaFin) || "N/A"}</td>
        <td><span class="badge ${getBadgeClass(project.estado)}">${project.estado || "No definido"}</span></td>
        <td>
          <button class="btn btn-info btn-sm view-project" data-id="${project.id}" title="Ver Detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-secondary btn-sm history-project" data-id="${project.id}" title="Ver Historial">
            <i class="fas fa-history"></i>
          </button>
      `;
      
      // Agregar botón de edición solo si no es admin
      if (currentUser && currentUser.rol !== "admin") {
        row.innerHTML += `
          <button class="btn btn-primary btn-sm edit-project" data-id="${project.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
        `;
      }
      
      row.innerHTML += `</td>`;
      tableBody.appendChild(row);
    });

    // Agregar eventos a los botones
    addProjectTableEventListeners();

    console.log("Proyectos en gestión cargados correctamente");
  } catch (error) {
    console.error("Error al cargar proyectos en gestión:", error);
  }
}

// Función auxiliar para obtener la clase de badge según el estado del proyecto
function getBadgeClass(estado) {
  const statusClasses = {
    "Nuevo": "bg-secondary",
    "En Proceso de Viabilidad": "bg-info",
    "En Asignación": "bg-primary",
    "En Gestion por Analista": "bg-warning",
    "Gestionado por Analista (Aprobado)": "bg-success",
    "Gestionado por Analista con Observación": "bg-warning",
    "En Gestion por Brigada": "bg-warning",
    "Gestionado por Brigada (Aprobado)": "bg-success",
    "Gestionado por Brigada con Observación": "bg-warning",
    "En Revision de Verificacion": "bg-info",
    "Generacion de Informe": "bg-primary",
    "Opcion Mejorar": "bg-warning",
    "Documentacion Errada": "bg-danger",
    "Finalizado": "bg-success"
  };

  return statusClasses[estado] || "bg-secondary";
}

function addProjectTableEventListeners() {
  // Agregar eventos a los botones de ver detalles
  const viewButtons = document.querySelectorAll(".view-project");
  viewButtons.forEach((button) => {
    button.addEventListener("click", function() {
      const projectId = this.getAttribute("data-id");
      viewProjectDetails(projectId);
    });
  });

  // Agregar eventos a los botones de historial
  const historyButtons = document.querySelectorAll(".history-project");
  historyButtons.forEach((button) => {
    button.addEventListener("click", function() {
      const projectId = this.getAttribute("data-id");
      showProjectHistory(projectId);
    });
  });

  // Agregar eventos a los botones de edición (si existen)
  const editButtons = document.querySelectorAll(".edit-project");
  editButtons.forEach((button) => {
    button.addEventListener("click", function() {
      const projectId = this.getAttribute("data-id");
      showProjectModal(projectId);
    });
  });

  // Agregar eventos a los botones de eliminación (si existen)
  const deleteButtons = document.querySelectorAll(".delete-project");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function() {
      const projectId = this.getAttribute("data-id");
      deleteProject(projectId);
    });
  });
}

function loadCompletedProjects() {
  console.log("Cargando proyectos finalizados")

  try {
    const projects = Storage.getProjects().filter((project) => project.estado === "Finalizado")
    const tableBody = document.getElementById("completed-table-body")

    if (!tableBody) {
      console.warn("Elemento completed-table-body no encontrado")
      return
    }

    // Limpiar tabla
    tableBody.innerHTML = ""

    // Si no hay proyectos, mostrar mensaje
    if (projects.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">No hay proyectos finalizados para mostrar</td>
        </tr>
      `
      return
    }

    // Llenar tabla con proyectos
    projects.forEach((project) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${project.id || "N/A"}</td>
        <td>${project.nombre || "Sin nombre"}</td>
        <td>${project.prstNombre || "N/A"}</td>
        <td>${project.departamento || "N/A"}</td>
        <td>${formatDate(project.fechaCreacion) || "N/A"}</td>
        <td>${formatDate(project.fechaInicio) || "N/A"}</td>
        <td>${formatDate(project.fechaFin) || "N/A"}</td>
        <td><span class="badge ${getBadgeClass(project.estado)}">${project.estado || "No definido"}</span></td>
        <td>
          <button class="btn btn-info btn-sm view-project" data-id="${project.id}" title="Ver Detalles">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      `
      tableBody.appendChild(row)
    })

    // Agregar eventos a los botones
    const viewButtons = tableBody.querySelectorAll(".view-project")
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const projectId = this.getAttribute("data-id")
        viewProjectDetails(projectId)
      })
    })

    console.log("Proyectos finalizados cargados correctamente")
  } catch (error) {
    console.error("Error al cargar proyectos finalizados:", error)
  }
}

// Modify the loadProjectsFlowChart function to use different colors
function loadProjectsFlowChart(period = "month") {
  console.log(`Cargando gráfico de flujo de proyectos por ${period}`)

  try {
    const ctx = document.getElementById("projects-flow-chart")
    if (!ctx) {
      console.warn("Elemento projects-flow-chart no encontrado")
      return
    }

    // Destruir gráfico existente si hay uno
    if (charts.projectsFlow) {
      charts.projectsFlow.destroy()
    }

    const projects = Storage.getProjects()

    // Preparar datos según el período
    const labels = []
    let datasets = []

    if (period === "month") {
      // Datos por mes (últimos 12 meses)
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      // Crear etiquetas para los últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const month = (currentMonth - i + 12) % 12
        const year = currentYear - Math.floor((i - currentMonth) / 12)
        labels.push(`${monthNames[month]} ${year}`)
      }

      // Contar proyectos por mes
      const newProjects = new Array(12).fill(0)
      const inProgressProjects = new Array(12).fill(0)
      const completedProjects = new Array(12).fill(0)

      projects.forEach((project) => {
        if (project.fechaCreacion) {
          const creationDate = new Date(project.fechaCreacion)
          const monthDiff = (currentDate.getMonth() - creationDate.getMonth() + 12) % 12
          const yearDiff = currentDate.getFullYear() - creationDate.getFullYear()

          if (yearDiff === 0 || (yearDiff === 1 && monthDiff < 12)) {
            const index = 11 - monthDiff
            if (index >= 0 && index < 12) {
              if (project.estado === "Nuevo") {
                newProjects[index]++
              } else if (project.estado === "En Proceso de Viabilidad" || project.estado.includes("En Gestión")) {
                inProgressProjects[index]++
              } else if (project.estado === "Finalizado") {
                completedProjects[index]++
              }
            }
          }
        }
      })

      datasets = [
        {
          label: "Nuevos Proyectos",
          data: newProjects,
          backgroundColor: "rgba(255, 99, 132, 0.5)", // Rojo
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Proyectos en Gestión",
          data: inProgressProjects,
          backgroundColor: "rgba(255, 206, 86, 0.5)", // Amarillo
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
        },
        {
          label: "Proyectos Finalizados",
          data: completedProjects,
          backgroundColor: "rgba(75, 192, 192, 0.5)", // Verde
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ]
    } else if (period === "day") {
      // Datos por día (últimos 14 días)
      const currentDate = new Date()

      // Crear etiquetas para los últimos 14 días
      for (let i = 13; i >= 0; i--) {
        const date = new Date(currentDate)
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }))
      }

      // Contar proyectos por día
      const newProjects = new Array(14).fill(0)
      const inProgressProjects = new Array(14).fill(0)
      const completedProjects = new Array(14).fill(0)

      projects.forEach((project) => {
        if (project.fechaCreacion) {
          const creationDate = new Date(project.fechaCreacion)
          const dayDiff = Math.floor((currentDate - creationDate) / (1000 * 60 * 60 * 24))

          if (dayDiff >= 0 && dayDiff < 14) {
            const index = 13 - dayDiff
            if (project.estado === "Nuevo") {
              newProjects[index]++
            } else if (project.estado === "En Proceso de Viabilidad" || project.estado.includes("En Gestión")) {
              inProgressProjects[index]++
            } else if (project.estado === "Finalizado") {
              completedProjects[index]++
            }
          }
        }
      })

      datasets = [
        {
          label: "Nuevos Proyectos",
          data: newProjects,
          backgroundColor: "rgba(255, 99, 132, 0.5)", // Rojo
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Proyectos en Gestión",
          data: inProgressProjects,
          backgroundColor: "rgba(255, 206, 86, 0.5)", // Amarillo
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
        },
        {
          label: "Proyectos Finalizados",
          data: completedProjects,
          backgroundColor: "rgba(75, 192, 192, 0.5)", // Verde
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ]
    } else if (period === "year") {
      // Datos por año (últimos 5 años)
      const currentYear = new Date().getFullYear()

      // Crear etiquetas para los últimos 5 años
      for (let i = 4; i >= 0; i--) {
        labels.push((currentYear - i).toString())
      }

      // Contar proyectos por año
      const newProjects = new Array(5).fill(0)
      const inProgressProjects = new Array(5).fill(0)
      const completedProjects = new Array(5).fill(0)

      projects.forEach((project) => {
        if (project.fechaCreacion) {
          const creationYear = new Date(project.fechaCreacion).getFullYear()
          const yearDiff = currentYear - creationYear

          if (yearDiff >= 0 && yearDiff < 5) {
            const index = 4 - yearDiff
            if (project.estado === "Nuevo") {
              newProjects[index]++
            } else if (project.estado === "En Proceso de Viabilidad" || project.estado.includes("En Gestión")) {
              inProgressProjects[index]++
            } else if (project.estado === "Finalizado") {
              completedProjects[index]++
            }
          }
        }
      })

      datasets = [
        {
          label: "Nuevos Proyectos",
          data: newProjects,
          backgroundColor: "rgba(255, 99, 132, 0.5)", // Rojo
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Proyectos en Gestión",
          data: inProgressProjects,
          backgroundColor: "rgba(255, 206, 86, 0.5)", // Amarillo
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
        },
        {
          label: "Proyectos Finalizados",
          data: completedProjects,
          backgroundColor: "rgba(75, 192, 192, 0.5)", // Verde
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ]
    }

    // Crear gráfico
    charts.projectsFlow = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: `Flujo de Proyectos por ${period === "month" ? "Mes" : period === "day" ? "Día" : "Año"}`,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Número de Proyectos",
            },
          },
        },
      },
    })

    console.log("Gráfico de flujo de proyectos cargado correctamente")
  } catch (error) {
    console.error("Error al cargar gráfico de flujo de proyectos:", error)
  }
}
