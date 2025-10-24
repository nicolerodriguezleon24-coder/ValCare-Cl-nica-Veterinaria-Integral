// ...existing code...
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formContacto');
  const respuesta = document.getElementById('respuesta');

  if (!form || !respuesta) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const tipo = document.getElementById('tipo').value;
    const mensaje = document.getElementById('mensaje').value.trim();

    // Validación básica
    if (!nombre || !email || !mensaje) {
      respuesta.textContent = 'Por favor completa los campos obligatorios: nombre, correo y mensaje.';
      respuesta.style.color = 'crimson';
      return;
    }

    // Simular envío y mostrar resumen
    const datosCliente = {
      nombre, email, telefono, tipo, mensaje, fecha: new Date().toLocaleString()
    };

    // Puedes reemplazar esto por envío real (fetch) a un servidor.
    console.log('Envío de formulario:', datosCliente);

    respuesta.style.color = 'green';
    respuesta.innerHTML = `
      <strong>Gracias, ${escapeHtml(nombre)}.</strong> Hemos recibido tu consulta.<br>
      Resumen: ${escapeHtml(tipo)} — ${escapeHtml(email)} — ${escapeHtml(telefono || 'sin teléfono')}<br>
      Mensaje: ${escapeHtml(mensaje)}
    `;

    form.reset();
  });

  // función simple para evitar inyección en el HTML de respuesta
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
});
// ...existing code...