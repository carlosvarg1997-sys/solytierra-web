/**
 * intranet.js - Portal del cliente Sol y Tierra
 * Manejo de acceso por código, visualización de arriendos, hitos y ficha de tallaje
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var codigoInput = document.getElementById('codigo');
    var btnLogin = document.querySelector('.btn-login');
    var loginErr = document.getElementById('login-err');
    var loginScreen = document.getElementById('login-screen');
    var dashScreen = document.getElementById('dash-screen');
    var clienteNombre = document.getElementById('cliente-nombre');
    var arriendosList = document.getElementById('arriendos-list');
    var btnLogout = document.querySelector('.btn-logout');

    var modalFicha = document.getElementById('modal-ficha');
    var modalClose = modalFicha ? modalFicha.querySelector('.close') : null;
    var fichasContainer = document.getElementById('fichas-container');
    var btnAddFicha = document.querySelector('.add-ficha');
    var btnSaveFicha = document.getElementById('btn-save-ficha');
    var btnFinalFicha = document.getElementById('btn-final-ficha');
    var fichaMsg = document.getElementById('ficha-msg');

    var STORAGE_KEY = 'syt_portal_session';
    var FICHAS_KEY = 'syt_fichas_data';

    // Arriendo por defecto para demo/cliente
    var demoArriendo = {
      codigo: 'SY-2026-A1042',
      colegio: 'Colegio San Ignacio',
      curso: '4to Medio B',
      nombre: 'Isabel Margarita Fuentes',
      telefono: '+56 9 8765 4321',
      fecha: '11 de Septiembre, 2026',
      hora: '10:30 hrs',
      retiro: 'Noche previa (18:00 a 22:30)',
      devolucion: '3 horas post-baile (13:30 hrs)',
      hombres: 14,
      mujeres: 18,
      total: 32,
      color: 'Rojo Clásico',
      arriendo: '$1.120.000',
      garantia: '$320.000 (reembolsable)',
      reserva: '$880.000 (Pagado)',
      saldo: '$560.000 (Antes del retiro)',
      estado: 'reservado'
    };

    function renderDashboard(data) {
      if (clienteNombre) clienteNombre.textContent = data.nombre + ' (' + data.curso + ')';

      if (arriendosList) {
        arriendosList.innerHTML = 
          '<article class="arriendo-card">' +
            '<div class="head">' +
              '<div>' +
                '<span class="identificador">' + data.codigo + '</span>' +
                '<div class="curso">' + data.curso + ' · ' + data.colegio + '</div>' +
                '<div style="color:var(--text-muted);font-size:.9rem">Encargado: ' + data.nombre + ' · ' + data.telefono + '</div>' +
              '</div>' +
              '<div><span class="estado reservado">✓ Reserva confirmada</span></div>' +
            '</div>' +

            '<div class="data-grid">' +
              '<div class="data-cell"><div class="l">Fecha del evento</div><div class="v">' + data.fecha + '</div></div>' +
              '<div class="data-cell"><div class="l">Hora presentación</div><div class="v">' + data.hora + '</div></div>' +
              '<div class="data-cell"><div class="l">Retiro en taller</div><div class="v">' + data.retiro + '</div></div>' +
              '<div class="data-cell"><div class="l">Devolución</div><div class="v">' + data.devolucion + '</div></div>' +
              '<div class="data-cell"><div class="l">Trajes solicitados</div><div class="v">' + data.total + ' (' + data.color + ')</div></div>' +
              '<div class="data-cell"><div class="l">Reserva pagada</div><div class="v green">' + data.reserva + '</div></div>' +
              '<div class="data-cell"><div class="l">Saldo restante</div><div class="v price">' + data.saldo + '</div></div>' +
              '<div class="data-cell"><div class="l">Garantía reembolsable</div><div class="v green">' + data.garantia + '</div></div>' +
            '</div>' +

            '<h3 style="font-size:1.05rem;margin:24px 0 10px">Hitos del arriendo</h3>' +
            '<div class="hitos">' +
              '<div class="hito ok"><div class="dot">✓</div><span>01 · Solicitud enviada</span></div>' +
              '<div class="hito ok"><div class="dot">✓</div><span>02 · 50% Reserva pagada</span></div>' +
              '<div class="hito ok"><div class="dot">✓</div><span>03 · Set de tallaje entregado</span></div>' +
              '<div class="hito" id="hito-ficha"><div class="dot">•</div><span>04 · Ficha de tallas</span></div>' +
              '<div class="hito"><div class="dot">•</div><span>05 · Saldo 24h antes</span></div>' +
              '<div class="hito"><div class="dot">•</div><span>06 · Retiro noche previa</span></div>' +
              '<div class="hito"><div class="dot">•</div><span>07 · Devolución 3h post</span></div>' +
            '</div>' +

            '<div class="actions">' +
              '<button type="button" class="btn-ficha" id="openFichaBtn">📋 Completar / Editar Ficha de Tallas</button>' +
              '<a class="btn-wa" href="https://wa.me/56997424911?text=Hola%20Sol%20y%20Tierra,%20consulto%20por%20mi%20arriendo%20' + data.codigo + '" target="_blank" rel="noopener">WhatsApp de Coordinación</a>' +
            '</div>' +
          '</article>';

        var openBtn = document.getElementById('openFichaBtn');
        if (openBtn) {
          openBtn.addEventListener('click', openModal);
        }
      }
    }

    function doLogin() {
      var code = (codigoInput.value || '').trim().toUpperCase();
      if (!code) {
        showError('Por favor ingresa tu código de acceso privado.');
        return;
      }

      // Validar o aceptar formato
      loginErr.style.display = 'none';
      var sessionData = Object.assign({}, demoArriendo, { codigo: code });
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      } catch (e) {}

      loginScreen.style.display = 'none';
      dashScreen.style.display = 'block';
      renderDashboard(sessionData);
      loadSavedFichas();
    }

    function showError(msg) {
      if (loginErr) {
        loginErr.textContent = msg;
        loginErr.style.display = 'block';
      }
    }

    function doLogout() {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      dashScreen.style.display = 'none';
      loginScreen.style.display = 'block';
      if (codigoInput) codigoInput.value = '';
    }

    // Modal de fichas
    function openModal() {
      if (modalFicha) {
        modalFicha.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeModal() {
      if (modalFicha) {
        modalFicha.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    function addFichaRow(alumno) {
      alumno = alumno || { nombre: '', genero: 'Mujer', color: 'Rojo', chaq: 'M', falda: 'M' };
      var row = document.createElement('div');
      row.className = 'ficha-row';
      row.innerHTML = 
        '<input type="text" placeholder="Nombre completo" value="' + (alumno.nombre || '') + '" class="f-nombre">' +
        '<select class="f-genero">' +
          '<option value="Mujer"' + (alumno.genero === 'Mujer' ? ' selected' : '') + '>Mujer</option>' +
          '<option value="Hombre"' + (alumno.genero === 'Hombre' ? ' selected' : '') + '>Hombre</option>' +
        '</select>' +
        '<select class="f-color">' +
          '<option value="Rojo"' + (alumno.color === 'Rojo' ? ' selected' : '') + '>Rojo</option>' +
          '<option value="Azul"' + (alumno.color === 'Azul' ? ' selected' : '') + '>Azul</option>' +
          '<option value="Fucsia"' + (alumno.color === 'Fucsia' ? ' selected' : '') + '>Fucsia</option>' +
          '<option value="Morado"' + (alumno.color === 'Morado' ? ' selected' : '') + '>Morado</option>' +
        '</select>' +
        '<select class="f-chaq">' +
          ['16','XS','S','M','L','XL','2XL','3XL','4XL'].map(function(t) {
            return '<option value="' + t + '"' + (alumno.chaq === t ? ' selected' : '') + '>' + t + '</option>';
          }).join('') +
        '</select>' +
        '<select class="f-falda">' +
          ['16','XS','S','M','L','XL','2XL','3XL','4XL'].map(function(t) {
            return '<option value="' + t + '"' + (alumno.falda === t ? ' selected' : '') + '>' + t + '</option>';
          }).join('') +
        '</select>' +
        '<button type="button" class="rm" title="Eliminar fila">×</button>';

      row.querySelector('.rm').addEventListener('click', function() {
        row.remove();
        updateStockTally();
      });

      row.querySelectorAll('select').forEach(function(sel) {
        sel.addEventListener('change', updateStockTally);
      });

      if (fichasContainer) fichasContainer.appendChild(row);
      updateStockTally();
    }

    function updateStockTally() {
      var tallas = { 'XS':0, 'S':0, 'M':0, 'L':0, 'XL':0, '2XL':0, '3XL':0 };
      if (fichasContainer) {
        var chaqs = fichasContainer.querySelectorAll('.f-chaq');
        chaqs.forEach(function(sel) {
          var val = sel.value;
          if (tallas.hasOwnProperty(val)) tallas[val]++;
        });
      }
      Object.keys(tallas).forEach(function(k) {
        var el = document.getElementById('st-' + k.toLowerCase());
        if (el) el.textContent = tallas[k] + ' pedidos';
      });
    }

    function saveFichas(isFinal) {
      if (!fichasContainer) return;
      var rows = fichasContainer.querySelectorAll('.ficha-row');
      var list = [];
      rows.forEach(function(r) {
        list.push({
          nombre: r.querySelector('.f-nombre').value,
          genero: r.querySelector('.f-genero').value,
          color: r.querySelector('.f-color').value,
          chaq: r.querySelector('.f-chaq').value,
          falda: r.querySelector('.f-falda').value
        });
      });

      try {
        localStorage.setItem(FICHAS_KEY, JSON.stringify(list));
      } catch (e) {}

      if (fichaMsg) {
        if (isFinal) {
          fichaMsg.className = 'ok-msg';
          fichaMsg.textContent = '✓ Ficha final enviada con éxito (' + list.length + ' alumnos registrados). Tu pedido está consolidado.';
          var hito = document.getElementById('hito-ficha');
          if (hito) {
            hito.classList.add('ok');
            hito.querySelector('.dot').textContent = '✓';
          }
        } else {
          fichaMsg.className = 'ok-msg';
          fichaMsg.textContent = '✓ Borrador guardado localmente (' + list.length + ' alumnos). Puedes seguir completando cuando quieras.';
        }
      }
    }

    function loadSavedFichas() {
      if (!fichasContainer) return;
      fichasContainer.innerHTML = '';
      var saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(FICHAS_KEY));
      } catch (e) {}

      if (Array.isArray(saved) && saved.length) {
        saved.forEach(function(item) { addFichaRow(item); });
      } else {
        // Filas iniciales de ejemplo
        addFichaRow({ nombre: 'Sofía Valenzuela', genero: 'Mujer', color: 'Rojo', chaq: 'S', falda: 'M' });
        addFichaRow({ nombre: 'Matías González', genero: 'Hombre', color: 'Rojo', chaq: 'L', falda: 'L' });
        addFichaRow({ nombre: 'Catalina Muñoz', genero: 'Mujer', color: 'Rojo', chaq: 'M', falda: 'M' });
      }
    }

    // Bindings
    if (btnLogin) btnLogin.addEventListener('click', doLogin);
    if (codigoInput) {
      codigoInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doLogin();
      });
    }
    if (btnLogout) btnLogout.addEventListener('click', doLogout);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (btnAddFicha) btnAddFicha.addEventListener('click', function() { addFichaRow(); });
    if (btnSaveFicha) btnSaveFicha.addEventListener('click', function() { saveFichas(false); });
    if (btnFinalFicha) btnFinalFicha.addEventListener('click', function() { saveFichas(true); });

    // Auto-login si ya hay sesión activa
    try {
      var savedSession = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (savedSession && savedSession.codigo) {
        loginScreen.style.display = 'none';
        dashScreen.style.display = 'block';
        renderDashboard(savedSession);
        loadSavedFichas();
      }
    } catch (e) {}
  });
})();
