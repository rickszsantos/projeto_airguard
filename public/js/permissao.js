(function () {
  'use strict';

  /* ── Estilos injetados automaticamente ── */
  const CSS = `
    .pg-overlay {
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity .18s ease;
    }
    .pg-overlay.aberto { opacity: 1; pointer-events: all; }

    .pg-box {
      background: #fff; border-radius: 14px;
      box-shadow: 0 8px 40px rgba(0,0,0,.18);
      width: 100%; max-width: 400px; margin: 16px;
      transform: translateY(18px);
      transition: transform .18s ease;
    }
    .pg-overlay.aberto .pg-box { transform: translateY(0); }

    .pg-header {
      display: flex; align-items: flex-start;
      gap: 12px; padding: 20px 20px 0;
    }
    .pg-icon {
      width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .pg-icon.danger  { background: #fee2e2; color: #dc2626; }
    .pg-icon.warning { background: #fef9c3; color: #ca8a04; }
    .pg-icon.info    { background: #e0f2fe; color: #0284c7; }
    .pg-icon.success { background: #dcfce7; color: #16a34a; }

    .pg-titulo { font-size: 15px; font-weight: 700; color: #111; margin: 0 0 3px; }
    .pg-sub    { font-size: 13px; color: #6b7280; margin: 0; }

    .pg-close {
      margin-left: auto; background: none; border: none;
      font-size: 18px; color: #9ca3af; cursor: pointer; padding: 0;
      line-height: 1;
    }
    .pg-close:hover { color: #374151; }

    .pg-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }

    .pg-aviso {
      display: flex; gap: 8px; align-items: flex-start;
      padding: 10px 12px; border-radius: 8px; font-size: 13px;
    }
    .pg-aviso.danger  { background: #fff5f5; border: 1px solid #fecaca; color: #b91c1c; }
    .pg-aviso.warning { background: #fefce8; border: 1px solid #fde68a; color: #92400e; }
    .pg-aviso.info    { background: #f0f9ff; border: 1px solid #bae6fd; color: #075985; }

    .pg-campo label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
    .pg-campo input {
      width: 100%; padding: 9px 12px; border-radius: 8px;
      border: 1px solid #d1d5db; font-size: 14px; box-sizing: border-box;
      outline: none; transition: border-color .15s;
    }
    .pg-campo input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }

    .pg-erro {
      font-size: 13px; color: #dc2626; background: #fff5f5;
      border: 1px solid #fecaca; border-radius: 7px;
      padding: 8px 12px; display: none;
    }

    .pg-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 0 20px 20px; flex-wrap: wrap;
    }

    .pg-btn {
      padding: 9px 18px; border-radius: 8px; font-size: 14px;
      font-weight: 600; cursor: pointer; border: none; transition: opacity .15s, background .15s;
    }
    .pg-btn:disabled { opacity: .5; cursor: not-allowed; }
    .pg-btn.cancelar { background: #f3f4f6; color: #374151; }
    .pg-btn.cancelar:hover:not(:disabled) { background: #e5e7eb; }
    .pg-btn.confirmar-danger  { background: #dc2626; color: #fff; }
    .pg-btn.confirmar-warning { background: #f59e0b; color: #fff; }
    .pg-btn.confirmar-info    { background: #0284c7; color: #fff; }
    .pg-btn.confirmar-success { background: #16a34a; color: #fff; }
    .pg-btn.confirmar-danger:hover:not(:disabled)  { background: #b91c1c; }
    .pg-btn.confirmar-warning:hover:not(:disabled) { background: #d97706; }
    .pg-btn.confirmar-info:hover:not(:disabled)    { background: #0369a1; }
    .pg-btn.confirmar-success:hover:not(:disabled) { background: #15803d; }
  `;

  function _injetarCSS() {
    if (document.getElementById('_pg_css')) return;
    const s = document.createElement('style');
    s.id = '_pg_css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const ICONES = {
    danger:  '🗑',
    warning: '⚠️',
    info:    'ℹ️',
    success: '✅',
  };

  function _criarModal(html) {
    _injetarCSS();
    const div = document.createElement('div');
    div.innerHTML = html;
    const overlay = div.firstElementChild;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('aberto'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) _fecharModal(overlay);
    });
    return overlay;
  }

  function _fecharModal(overlay) {
    overlay.classList.remove('aberto');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }


  window.confirmarAcao = function ({ titulo, texto, tipo = 'warning', btnLabel = 'Confirmar', onConfirm }) {
    const overlay = _criarModal(`
      <div class="pg-overlay">
        <div class="pg-box">
          <div class="pg-header">
            <div class="pg-icon ${tipo}">${ICONES[tipo] || '❓'}</div>
            <div>
              <p class="pg-titulo">${titulo}</p>
              ${texto ? `<p class="pg-sub">${texto}</p>` : ''}
            </div>
            <button class="pg-close" title="Fechar">✕</button>
          </div>
          <div class="pg-body"></div>
          <div class="pg-footer">
            <button class="pg-btn cancelar">Cancelar</button>
            <button class="pg-btn confirmar-${tipo}">${btnLabel}</button>
          </div>
        </div>
      </div>
    `);

    overlay.querySelector('.pg-close').onclick = () => _fecharModal(overlay);
    overlay.querySelector('.pg-btn.cancelar').onclick = () => _fecharModal(overlay);

    const btnConf = overlay.querySelector(`.pg-btn.confirmar-${tipo}`);
    btnConf.onclick = async () => {
      btnConf.disabled = true;
      btnConf.textContent = 'Aguarde...';
      try { await onConfirm(); _fecharModal(overlay); }
      catch (e) {
        console.error(e);
        btnConf.disabled = false;
        btnConf.textContent = btnLabel;
      }
    };
  };





  window.confirmarSuperAdmin = function ({ titulo, texto, tipo = 'danger', btnLabel = 'Confirmar', onConfirm }) {
    const overlay = _criarModal(`
      <div class="pg-overlay">
        <div class="pg-box">
          <div class="pg-header">
            <div class="pg-icon ${tipo}">${ICONES[tipo] || '🔐'}</div>
            <div>
              <p class="pg-titulo">${titulo}</p>
              ${texto ? `<p class="pg-sub">${texto}</p>` : ''}
            </div>
            <button class="pg-close" title="Fechar">✕</button>
          </div>
          <div class="pg-body">
            ${texto ? `
            <div class="pg-aviso ${tipo}">
              <span>⚠️</span>
              <span>${texto}</span>
            </div>` : ''}
            <div class="pg-campo">
              <label>Senha do SuperAdmin <span style="color:#dc2626">*</span></label>
              <input type="password" id="_pg_senha_sa" placeholder="Digite a senha de permissão" autocomplete="current-password" />
            </div>
            <div class="pg-erro" id="_pg_erro_sa"></div>
          </div>
          <div class="pg-footer">
            <button class="pg-btn cancelar">Cancelar</button>
            <button class="pg-btn confirmar-${tipo}">${btnLabel}</button>
          </div>
        </div>
      </div>
    `);

    const inputSenha = overlay.querySelector('#_pg_senha_sa');
    const erroDiv    = overlay.querySelector('#_pg_erro_sa');
    const btnConf    = overlay.querySelector(`.pg-btn.confirmar-${tipo}`);

    setTimeout(() => inputSenha.focus(), 120);
    overlay.querySelector('.pg-close').onclick = () => _fecharModal(overlay);
    overlay.querySelector('.pg-btn.cancelar').onclick = () => _fecharModal(overlay);
    inputSenha.addEventListener('keydown', (e) => { if (e.key === 'Enter') btnConf.click(); });

    btnConf.onclick = async () => {
      const senha = inputSenha.value.trim();
      if (!senha) {
        erroDiv.textContent = 'Digite a senha do SuperAdmin.';
        erroDiv.style.display = 'block';
        inputSenha.focus();
        return;
      }
      erroDiv.style.display = 'none';
      btnConf.disabled = true;
      btnConf.textContent = 'Verificando...';

      try {
        await onConfirm(senha);
        _fecharModal(overlay);
      } catch (e) {
        const msg = e?.mensagem || e?.message || 'Senha incorreta ou sem permissão.';
        erroDiv.textContent = msg;
        erroDiv.style.display = 'block';
        btnConf.disabled = false;
        btnConf.textContent = btnLabel;
        inputSenha.focus();
        inputSenha.select();
      }
    };
  };

 
  window.pedirValor = function ({
    titulo,
    label,
    tipo = 'text',
    valorAtual = '',
    placeholder = '',
    min,
    max,
    btnLabel = 'Salvar',
    requerSuperAdmin = false,
    onConfirm,
  }) {
    const minAttr = (tipo === 'number' && min !== undefined) ? `min="${min}"` : '';
    const maxAttr = (tipo === 'number' && max !== undefined) ? `max="${max}"` : '';

    const overlay = _criarModal(`
      <div class="pg-overlay">
        <div class="pg-box">
          <div class="pg-header">
            <div class="pg-icon info">✏️</div>
            <div>
              <p class="pg-titulo">${titulo}</p>
            </div>
            <button class="pg-close" title="Fechar">✕</button>
          </div>
          <div class="pg-body">
            <div class="pg-campo">
              <label>${label}</label>
              <input type="${tipo}" id="_pg_valor_input" value="${valorAtual}"
                placeholder="${placeholder}" ${minAttr} ${maxAttr} />
            </div>
            ${requerSuperAdmin ? `
            <div class="pg-campo">
              <label>Senha do SuperAdmin <span style="color:#dc2626">*</span></label>
              <input type="password" id="_pg_valor_senha" placeholder="Senha de permissão" autocomplete="current-password" />
            </div>` : ''}
            <div class="pg-erro" id="_pg_valor_erro"></div>
          </div>
          <div class="pg-footer">
            <button class="pg-btn cancelar">Cancelar</button>
            <button class="pg-btn confirmar-info">${btnLabel}</button>
          </div>
        </div>
      </div>
    `);

    const inputValor = overlay.querySelector('#_pg_valor_input');
    const inputSenha = overlay.querySelector('#_pg_valor_senha');
    const erroDiv    = overlay.querySelector('#_pg_valor_erro');
    const btnConf    = overlay.querySelector('.pg-btn.confirmar-info');

    setTimeout(() => inputValor.focus(), 120);
    overlay.querySelector('.pg-close').onclick = () => _fecharModal(overlay);
    overlay.querySelector('.pg-btn.cancelar').onclick = () => _fecharModal(overlay);

    const confirmar = async () => {
      const valor = inputValor.value.trim();
      const senha = inputSenha ? inputSenha.value.trim() : null;

      if (!valor) {
        erroDiv.textContent = 'Preencha o campo.';
        erroDiv.style.display = 'block';
        inputValor.focus();
        return;
      }
      if (requerSuperAdmin && !senha) {
        erroDiv.textContent = 'Digite a senha do SuperAdmin.';
        erroDiv.style.display = 'block';
        if (inputSenha) inputSenha.focus();
        return;
      }
      erroDiv.style.display = 'none';
      btnConf.disabled = true;
      btnConf.textContent = 'Salvando...';

      try {
        await onConfirm(valor, senha);
        _fecharModal(overlay);
      } catch (e) {
        const msg = e?.mensagem || e?.message || 'Erro ao salvar.';
        erroDiv.textContent = msg;
        erroDiv.style.display = 'block';
        btnConf.disabled = false;
        btnConf.textContent = btnLabel;
      }
    };

    inputValor.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmar(); });
    if (inputSenha) inputSenha.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmar(); });
    btnConf.onclick = confirmar;
  };

 




  window.apiProtegida = async function (url, opcoes = {}) {
    const res = await fetch(url, opcoes);

    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }

    let json;
    try { json = await res.json(); } catch { json = {}; }

    if (!res.ok) {
      const err = new Error(json.erro || json.message || `Erro ${res.status}`);
      err.mensagem = err.message;
      err.status   = res.status;
      err.dados    = json;
      throw err;
    }

    return json;
  };

})();