(function () {
  'use strict';

  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const API = window.SYT_API_BASE || (local ? 'http://127.0.0.1:8000' : 'https://api.arriendostrajestobas.cl');
  const codeKey = 'syt_client_code';
  let code = sessionStorage.getItem(codeKey) || '';
  let currentRental = null;
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
  const money = (value) => '$' + Number(value || 0).toLocaleString('es-CL');
  const headers = (json = false) => ({
    ...(json ? {'Content-Type': 'application/json'} : {}),
    'X-Client-Code': code
  });

  async function request(path, options = {}) {
    const response = await fetch(API + path, options);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('json') ? await response.json() : await response.blob();
    if (!response.ok) {
      const detail = data && data.detail;
      const message = typeof detail === 'string' ? detail : detail?.mensaje || 'No pudimos completar esta acción.';
      throw new Error(message);
    }
    return data;
  }

  function error(message) {
    const node = $('login-err');
    node.textContent = message;
    node.style.display = 'block';
  }

  function setLoginLoading(loading) {
    const button = document.querySelector('.btn-login');
    if (!button) return;
    button.disabled = loading;
    button.textContent = loading ? 'Verificando…' : 'Ingresar a mi arriendo';
  }

  async function login() {
    const entered = $('codigo').value.trim();
    if (entered.length < 8) return error('Revisa el código que recibiste al confirmar tu solicitud.');
    $('login-err').style.display = 'none';
    setLoginLoading(true);
    try {
      const data = await request('/api/intranet/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({codigo: entered})
      });
      code = entered;
      sessionStorage.setItem(codeKey, code);
      renderDashboard(data);
    } catch (err) {
      sessionStorage.removeItem(codeKey);
      code = '';
      error(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function renderDashboard(data) {
    currentRental = data.arriendo;
    $('login-screen').style.display = 'none';
    $('dash-screen').style.display = 'block';
    $('cliente-nombre').textContent = data.cliente_nombre || 'cliente';
    const rental = data.arriendo;
    const status = esc(rental.estado || 'reservado');
    const milestones = (rental.hitos || []).map((item) =>
      `<div class="hito ${item.completo ? 'ok' : ''}"><span class="dot">${item.completo ? '✓' : '○'}</span>${esc(item.nombre)}</div>`
    ).join('');
    const sheetState = rental.ficha_online_estado || 'cerrada';
    const sheetDisabled = sheetState === 'bloqueada' ? 'disabled' : '';
    $('arriendos-list').innerHTML = `
      <article class="arriendo-card">
        <div class="head">
          <div>
            <span class="identificador">${esc(rental.identificador || 'Arriendo')}</span>
            <div class="curso">${esc(rental.colegio || 'Colegio')} · ${esc(rental.curso || 'Curso por confirmar')}</div>
            <div style="font-size:.9rem;color:var(--text-muted);margin-top:4px">Presentación: <strong>${esc(rental.fecha_baile || 'por confirmar')}</strong>${rental.horario_baile ? ' · ' + esc(rental.horario_baile) : ''}</div>
          </div>
          <span class="estado ${status}">${status}</span>
        </div>
        <div class="data-grid">
          <div class="data-cell"><div class="l">Trajes</div><div class="v">${rental.total_trajes}</div></div>
          <div class="data-cell"><div class="l">Hombres</div><div class="v">${rental.cant_hombres}</div></div>
          <div class="data-cell"><div class="l">Mujeres</div><div class="v">${rental.cant_mujeres}</div></div>
          <div class="data-cell"><div class="l">Color</div><div class="v">${esc(rental.color_traje || 'por confirmar')}</div></div>
        </div>
        <div class="data-grid">
          <div class="data-cell"><div class="l">Arriendo</div><div class="v price">${money(rental.total_arriendo)}</div></div>
          <div class="data-cell"><div class="l">Garantía</div><div class="v">${money(rental.garantia)}</div></div>
          <div class="data-cell"><div class="l">Abonado</div><div class="v green">${money(rental.abonado)}</div></div>
          <div class="data-cell"><div class="l">Saldo total</div><div class="v price">${money(rental.saldo_total)}</div></div>
        </div>
        <div class="hitos">${milestones}</div>
        <div class="portal-note"><strong>Antes de tu reunión:</strong> descarga e imprime el compromiso oficial cuando aparezca disponible. Debe llegar impreso para firmarlo presencialmente.</div>
        <div class="actions">
          <button class="btn-ficha" data-open-sheet ${sheetDisabled}>${sheetState === 'bloqueada' ? 'Ficha enviada (solo lectura)' : 'Completar ficha de tallaje'}</button>
          <button class="btn-doc" data-load-docs>Ver documentos e imprimir</button>
        </div>
        <div id="documentos-cliente" class="client-documents" hidden></div>
      </article>`;
    document.querySelector('[data-open-sheet]').addEventListener('click', () => openSheet(rental.id));
    document.querySelector('[data-load-docs]').addEventListener('click', () => loadDocuments(rental.id));
  }

  async function resume() {
    if (!code) return;
    try {
      const data = await request('/api/intranet/login', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({codigo: code})
      });
      renderDashboard(data);
    } catch (_) {
      sessionStorage.removeItem(codeKey);
      code = '';
    }
  }

  async function loadDocuments(rentalId) {
    const box = $('documentos-cliente');
    box.hidden = false;
    box.innerHTML = '<p>Cargando documentos…</p>';
    try {
      const data = await request(`/api/intranet/documentos/${rentalId}`, {headers: headers()});
      if (!data.documentos.length) {
        box.innerHTML = '<p><strong>Aún no hay documentos disponibles.</strong> El compromiso aparecerá aquí después de confirmar disponibilidad y reunión.</p>';
        return;
      }
      box.innerHTML = data.documentos.map((doc) => `
        <button class="doc-row" data-doc-id="${doc.id}">
          <span><strong>${esc(doc.tipo.replaceAll('_', ' '))}</strong><small>${esc(doc.formato.toUpperCase())} · listo para descargar o imprimir</small></span>
          <span>Descargar ↓</span>
        </button>`).join('');
      box.querySelectorAll('[data-doc-id]').forEach((button) => button.addEventListener('click', () => downloadDocument(rentalId, button.dataset.docId)));
    } catch (err) {
      box.innerHTML = `<p class="err">${esc(err.message)}</p>`;
    }
  }

  async function downloadDocument(rentalId, documentId) {
    try {
      const blob = await request(`/api/intranet/documentos/${rentalId}/${documentId}/descargar`, {headers: headers()});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'documento-sol-y-tierra';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      alert(err.message);
    }
  }

  const sizes = {
    hombres: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    mujeres: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
  };
  function options(values, selected) {
    return values.map((value) => `<option ${value === selected ? 'selected' : ''}>${value}</option>`).join('');
  }
  function addRow(item = {}) {
    const type = item.tipo || 'mujeres';
    const row = document.createElement('div');
    row.className = 'ficha-row';
    row.innerHTML = `
      <input type="text" required maxlength="160" placeholder="Nombre y apellido" data-k="nombre" value="${esc(item.nombre || '')}">
      <select data-k="tipo"><option value="mujeres" ${type === 'mujeres' ? 'selected' : ''}>Mujer</option><option value="hombres" ${type === 'hombres' ? 'selected' : ''}>Hombre</option></select>
      <select data-k="color">${options(['Rojo', 'Azul', 'Fucsia'], item.color_traje || currentRental.color_traje)}</select>
      <select data-k="talla_chaqueta">${options(sizes[type], item.talla_chaqueta)}</select>
      <select data-k="talla_faldon">${options(sizes[type], item.talla_faldon)}</select>
      <button class="rm" type="button" aria-label="Eliminar fila">×</button>`;
    row.querySelector('.rm').addEventListener('click', () => row.remove());
    row.querySelector('[data-k="tipo"]').addEventListener('change', (event) => {
      row.querySelectorAll('[data-k="talla_chaqueta"],[data-k="talla_faldon"]').forEach((select) => {
        select.innerHTML = options(sizes[event.target.value]);
      });
    });
    $('fichas-container').appendChild(row);
  }

  async function openSheet(rentalId) {
    currentRental = {...currentRental, id: rentalId};
    $('modal-ficha').classList.add('active');
    $('modal-arriendo-info').textContent = 'Cargando ficha…';
    $('fichas-container').innerHTML = '';
    $('ficha-msg').innerHTML = '';
    try {
      const data = await request(`/api/intranet/fichas/${rentalId}`, {headers: headers()});
      $('modal-arriendo-info').textContent = `${data.fichas.length} de ${data.total_esperado} alumnos ingresados · estado: ${data.estado}`;
      (data.fichas.length ? data.fichas : [{}]).forEach(addRow);
    } catch (err) {
      $('ficha-msg').innerHTML = `<div class="err">${esc(err.message)}</div>`;
    }
  }

  function readRows() {
    return Array.from(document.querySelectorAll('#fichas-container .ficha-row')).map((row) => {
      const get = (key) => row.querySelector(`[data-k="${key}"]`).value.trim();
      return {nombre: get('nombre'), tipo: get('tipo'), color_traje: get('color'), talla_chaqueta: get('talla_chaqueta'), talla_faldon: get('talla_faldon')};
    }).filter((row) => row.nombre);
  }

  async function saveSheet(finalizar) {
    const people = readRows();
    if (!people.length) return $('ficha-msg').innerHTML = '<div class="err">Agrega al menos un alumno.</div>';
    const button = finalizar ? $('btn-final-ficha') : $('btn-save-ficha');
    button.disabled = true;
    try {
      const data = await request('/api/intranet/fichas', {
        method: 'POST', headers: headers(true),
        body: JSON.stringify({arriendo_id: currentRental.id, fichas: people, finalizar})
      });
      $('ficha-msg').innerHTML = `<div class="ok-msg">✓ ${data.total} alumnos guardados. ${finalizar ? 'La ficha fue enviada para revisión.' : 'Puedes volver y continuar después.'}</div>`;
      if (finalizar) setTimeout(() => location.reload(), 1200);
    } catch (err) {
      $('ficha-msg').innerHTML = `<div class="err">${esc(err.message)}</div>`;
    } finally {
      button.disabled = false;
    }
  }

  function logout() {
    sessionStorage.removeItem(codeKey);
    location.href = 'intranet.html';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const queryCode = new URLSearchParams(location.search).get('code');
    if (queryCode) $('codigo').value = queryCode;
    $('codigo').addEventListener('keydown', (event) => { if (event.key === 'Enter') login(); });
    document.querySelector('.btn-login').addEventListener('click', login);
    document.querySelector('.btn-logout').addEventListener('click', logout);
    document.querySelector('.modal .close').addEventListener('click', () => $('modal-ficha').classList.remove('active'));
    document.querySelector('.add-ficha').addEventListener('click', () => addRow());
    $('btn-save-ficha').addEventListener('click', () => saveSheet(false));
    $('btn-final-ficha').addEventListener('click', () => saveSheet(true));
    resume();
  });
})();
