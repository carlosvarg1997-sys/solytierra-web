document.addEventListener('DOMContentLoaded', () => {
  // --- 1. SET UP GENERAL WHATSAPP LINKS ---
  setupGeneralWhatsAppLinks();

  // --- 2. COSTUME GRID FILTERING ---
  initCostumeFiltering();

  // --- 3. QUOTE CALCULATOR LOGIC ---
  initQuoteCalculator();
});

/**
 * Sets up the static WhatsApp buttons in header, footer, floating, etc.
 * with customized messages.
 */
function setupGeneralWhatsAppLinks() {
  if (typeof window.getWhatsAppLink !== 'function') return;

  const links = [
    { id: 'header-whatsapp-cta', text: 'Hola Sol y Tierra! Me gustaría cotizar arriendo de trajes de Tobas para colegio.' },
    { id: 'mobile-whatsapp-cta', text: 'Hola Sol y Tierra! Quisiera cotizar arriendo de trajes de Tobas.' },
    { id: 'floating-whatsapp-btn', text: 'Hola Sol y Tierra! Me interesa cotizar trajes de Tobas para Fiestas Patrias.' },
    { id: 'popup-whatsapp-cta', text: 'Hola Sol y Tierra! Vi el mensaje y me gustaría cotizar trajes de Tobas para mi curso.' },
    { id: 'footer-large-whatsapp-cta', text: 'Hola! Estoy listo para reservar los trajes de Tobas de mi curso para el 18 de septiembre.' }
  ];

  links.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      el.href = window.getWhatsAppLink(item.text);
    }
  });

  // Individual costume cards buttons
  document.querySelectorAll('.whatsapp-costume-btn').forEach(btn => {
    const costumeName = btn.getAttribute('data-costume');
    if (costumeName) {
      const text = `Hola Sol y Tierra! Quisiera consultar la disponibilidad del traje: "${costumeName}" para Fiestas Patrias.`;
      btn.href = window.getWhatsAppLink(text);
    }
  });
}

/**
 * Handles the filtering of costumes by color chip selection.
 */
function initCostumeFiltering() {
  const container = document.getElementById('filter-container');
  const cards = document.querySelectorAll('.costume-card');
  if (!container || cards.length === 0) return;

  const chips = container.querySelectorAll('.filter-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      // 1. Update active styling
      chips.forEach(c => {
        c.classList.remove('active', 'bg-tierra', 'text-white', 'border-tierra');
        c.classList.add('bg-white', 'text-carbon', 'border-crema-dark');
        c.classList.remove('hover:bg-tierra', 'hover:text-white');
        c.classList.add('hover:bg-tierra', 'hover:text-white');
      });

      chip.classList.add('active', 'bg-tierra', 'text-white', 'border-tierra');
      chip.classList.remove('bg-white', 'text-carbon', 'border-crema-dark', 'hover:bg-tierra', 'hover:text-white');

      // 2. Filter logic
      const filter = chip.getAttribute('data-filter');

      cards.forEach(card => {
        const color = card.getAttribute('data-color');
        
        // Inline transition styles
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        if (filter === 'todos' || color === filter) {
          card.classList.remove('hidden');
          // Brief timeout to let browser register 'hidden' removal for animation
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          
          // Wait for transition to finish before hiding display
          const onTransitionEnd = (e) => {
            if (e.propertyName === 'opacity') {
              card.classList.add('hidden');
              card.removeEventListener('transitionend', onTransitionEnd);
            }
          };
          card.addEventListener('transitionend', onTransitionEnd);
        }
      });
    });
  });
}

/**
 * Handles quote calculations, form validations, API dispatching and WhatsApp output.
 */
function initQuoteCalculator() {
  const form = document.getElementById('cotizador-form');
  if (!form) return;

  const fechaInput = document.getElementById('fecha_baile');
  const comunaSelect = document.getElementById('comuna');
  const cantMujeresInput = document.getElementById('cant_mujeres');
  const cantHombresInput = document.getElementById('cant_hombres');

  // Display elements
  const displayTotalTrajes = document.getElementById('display_total_trajes');
  const displayTotalArriendo = document.getElementById('display_total_arriendo');
  const displayTotalGarantia = document.getElementById('display_total_garantia');
  const displayReserva = document.getElementById('display_reserva');
  const displaySaldo = document.getElementById('display_saldo');
  
  // CTA & Alerts
  const calcWhatsAppCta = document.getElementById('calc-whatsapp-cta');
  const alertContainer = document.getElementById('calculator-alert');

  // Constants
  const PRECIO_ARRIENDO = 35000;
  const PRECIO_GARANTIA = 10000;

  // Formatter for CLP
  const formatCLP = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Set minimum date selector to today
  const today = new Date().toISOString().split('T')[0];
  fechaInput.min = today;

  // Update calculations logic
  const updateCalculations = () => {
    const mujeres = parseInt(cantMujeresInput.value) || 0;
    const hombres = parseInt(cantHombresInput.value) || 0;
    const total = mujeres + hombres;

    // Calculations
    const totalArriendo = total * PRECIO_ARRIENDO;
    const totalGarantia = total * PRECIO_GARANTIA;
    const reserva = (totalArriendo / 2) + totalGarantia;
    const saldo = totalArriendo / 2;

    // Render displays
    if (displayTotalTrajes) displayTotalTrajes.textContent = total;
    if (displayTotalArriendo) displayTotalArriendo.textContent = formatCLP(totalArriendo);
    if (displayTotalGarantia) displayTotalGarantia.textContent = formatCLP(totalGarantia);
    if (displayReserva) displayReserva.textContent = formatCLP(reserva);
    if (displaySaldo) displaySaldo.textContent = formatCLP(saldo);

    // Business Rules Alert
    if (alertContainer) {
      if (total > 0 && total < 5) {
        alertContainer.className = 'p-4 rounded-xl text-sm font-semibold bg-tierra/10 text-tierra';
        alertContainer.textContent = '⚠️ Nota: El arriendo mínimo recomendado es de 5 trajes por curso.';
        alertContainer.classList.remove('hidden');
      } else {
        alertContainer.classList.add('hidden');
      }
    }

    // Dynamic WhatsApp Link
    if (calcWhatsAppCta && typeof window.getWhatsAppLink === 'function') {
      const comuna = comunaSelect.value || '[No seleccionada]';
      const fecha = fechaInput.value ? formatDate(fechaInput.value) : '[No seleccionada]';

      let msg = `Hola Sol y Tierra! Vengo del cotizador web. Quiero solicitar presupuesto para el arriendo de trajes de Tobas:\n\n`;
      msg += `📍 Comuna: ${comuna}\n`;
      msg += `📅 Fecha Presentación: ${fecha}\n`;
      msg += `👥 Cantidad: ${total} trajes (${mujeres} Damas, ${hombres} Varones)\n\n`;
      msg += `💰 Estimación del Presupuesto:\n`;
      msg += `* Total Arriendo: ${formatCLP(totalArriendo)}\n`;
      msg += `* Total Garantía: ${formatCLP(totalGarantia)} (100% reembolsable)\n`;
      msg += `* Reserva para asegurar fecha (50% arriendo + garantía): ${formatCLP(reserva)}\n`;
      msg += `* Saldo restante (al retirar): ${formatCLP(saldo)}`;

      calcWhatsAppCta.href = window.getWhatsAppLink(msg);
    }
  };

  // Helper date formatter (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Bind input listeners
  cantMujeresInput.addEventListener('input', updateCalculations);
  cantHombresInput.addEventListener('input', updateCalculations);
  fechaInput.addEventListener('change', updateCalculations);
  comunaSelect.addEventListener('change', updateCalculations);

  // Initialize values
  updateCalculations();

  // Form Submit (calls POST /api/cotizar)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const mujeres = parseInt(cantMujeresInput.value) || 0;
    const hombres = parseInt(cantHombresInput.value) || 0;
    const total = mujeres + hombres;

    if (total === 0) {
      showAlert('Por favor, ingresa al menos 1 traje para cotizar.', 'error');
      return;
    }

    const payload = {
      fecha_baile: fechaInput.value,
      comuna: comunaSelect.value,
      cant_hombres: hombres,
      cant_mujeres: mujeres,
      total_trajes: total,
      total_arriendo: total * PRECIO_ARRIENDO,
      garantia: total * PRECIO_GARANTIA,
      reserva: (total * PRECIO_ARRIENDO / 2) + (total * PRECIO_GARANTIA),
      saldo: total * PRECIO_ARRIENDO / 2
    };

    console.log('Enviando cotización a API:', payload);

    // Call actual POST endpoint
    fetch('/api/cotizar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta de API:', data);
        showAlert('✅ Cotización guardada con éxito en el sistema. ¡Recuerda confirmar por WhatsApp!', 'success');
      } else {
        throw new Error(`Error en el servidor: Status ${response.status}`);
      }
    })
    .catch(error => {
      console.error('Error enviando cotización:', error);
      // Fallback for mock/demo mode
      showAlert(
        `💡 Cotización calculada con éxito (Demo frontal). Para asegurar la reserva, haz clic en el botón de WhatsApp abajo para enviar los detalles directamente a Loreto.`,
        'success-mock'
      );
    });
  });

  // Custom alert display helper
  const showAlert = (message, type) => {
    if (!alertContainer) return;

    alertContainer.classList.remove('hidden');
    alertContainer.className = 'p-4 rounded-xl text-sm font-semibold transition-all duration-300 ';

    if (type === 'error') {
      alertContainer.classList.add('bg-tierra/10', 'text-tierra');
    } else if (type === 'success') {
      alertContainer.classList.add('bg-whatsapp/15', 'text-whatsapp');
    } else if (type === 'success-mock') {
      alertContainer.classList.add('bg-sol/15', 'text-tierra-dark');
    }

    alertContainer.textContent = message;

    // Scroll to alert if not visible
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
}
