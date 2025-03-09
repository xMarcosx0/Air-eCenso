document.addEventListener("DOMContentLoaded", function () {
    const cantidadPostes = document.getElementById("cantidadPostes");
    const postesContainer = document.getElementById("postesContainer");
    const censoForm = document.getElementById("censoForm");
    const modalGuardado = new bootstrap.Modal(document.getElementById("modalGuardado"));

    // Generar formularios dinámicos según la cantidad de postes seleccionada
    cantidadPostes.addEventListener("change", function () {
        generarFormularios(parseInt(cantidadPostes.value));
    });

    function generarFormularios(cantidad) {
        postesContainer.innerHTML = ""; // Limpiar el contenedor antes de agregar nuevos formularios
        for (let i = 1; i <= cantidad; i++) {
            const formPoste = document.createElement("div");
            formPoste.classList.add("poste-form", "mb-4", "p-3", "border", "rounded");
            formPoste.innerHTML = `
                <h4>Poste N°${i}</h4>
                <label>Altura:</label>
                <input type="number" class="form-control mb-2" placeholder="Altura" required>
                <label>Cables:</label>
                <input type="number" class="form-control mb-2" placeholder="Cables" required>
                <label>Caja de empalme:</label>
                <input type="number" class="form-control mb-2" placeholder="Caja de empalme" required>
                <label>Reserva:</label>
                <input type="number" class="form-control mb-2" placeholder="Reserva" required>
                <label>NAP:</label>
                <input type="number" class="form-control mb-2" placeholder="NAP" required>
                <label>SPT:</label>
                <input type="number" class="form-control mb-2" placeholder="SPT" required>
                <label>Bajante:</label>
                <input type="number" class="form-control mb-2" placeholder="Bajante" required>
            `;
            postesContainer.appendChild(formPoste);
        }
    }

    // Manejar el envío del formulario con modal de confirmación
    censoForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita la recarga de la página

        // Mostrar el modal de confirmación
        modalGuardado.show();

        // Después de cerrar el modal, limpiar el formulario y los campos dinámicos
        document.getElementById("modalGuardado").addEventListener("hidden.bs.modal", function () {
            censoForm.reset(); // Restablecer los campos principales
            postesContainer.innerHTML = ""; // Limpiar los formularios dinámicos
        });
    });
});
