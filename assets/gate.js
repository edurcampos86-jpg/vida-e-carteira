/* Vida & Carteira — Logica do Gate de Senha
   Privacy Guardian / Fase 1 + integracao Fase 2 + Sprint 2A (identidade visual)

   Estados:
   - loading: verificando se existe sentinel
   - first-time: nenhum sentinel.enc existe -> criar senha mestra
   - normal: sentinel.enc existe -> validar senha digitada
   - unlocked: senha validada -> entrega a tela de marcos
*/

window.VidaCarteiraGate = (function() {
  "use strict";

  var currentState = "loading";
  var sentinel = null;
  var masterKeyInMemory = null;

  function themeButtonHTML() {
    var mode = (window.VidaCarteiraTheme && window.VidaCarteiraTheme.get()) || "dark";
    var icon = mode === "dark" ? "ti-moon" : "ti-sun";
    var label = mode === "dark" ? "Modo Onix" : "Modo Papel";
    return ''
      + '<button class="theme-toggle" id="btn-theme" type="button" aria-label="Alternar tema">'
      + '<i class="ti ' + icon + '" id="theme-icon" aria-hidden="true"></i>'
      + '<span id="theme-label">' + label + '</span>'
      + '</button>';
  }

  function headerHTML() {
    return ''
      + '<div class="gate-header">'
      + '<span class="gate-brand">Vida<span class="amp"> & </span>Carteira</span>'
      + themeButtonHTML()
      + '</div>';
  }

  function wireThemeButton() {
    var btn = document.getElementById("btn-theme");
    if (!btn || !window.VidaCarteiraTheme) return;
    btn.addEventListener("click", function() {
      window.VidaCarteiraTheme.toggle();
      var mode = window.VidaCarteiraTheme.get();
      var icon = document.getElementById("theme-icon");
      var label = document.getElementById("theme-label");
      if (icon) icon.className = "ti " + (mode === "dark" ? "ti-moon" : "ti-sun");
      if (label) label.textContent = mode === "dark" ? "Modo Onix" : "Modo Papel";
    });
  }

  function render(state) {
    var app = document.getElementById("app");
    currentState = state;

    if (state === "loading") {
      app.innerHTML = ''
        + headerHTML()
        + '<div class="gate-card">'
        + '<p class="eyebrow">Sistema pessoal &middot; v1</p>'
        + '<h1>Vida<span class="amp"> & </span>Carteira</h1>'
        + '<p class="subtitle">Carregando...</p>'
        + '</div>';
      wireThemeButton();
      return;
    }

    if (state === "first-time") {
      app.innerHTML = ''
        + headerHTML()
        + '<div class="gate-card">'
        + '<p class="eyebrow">Primeiro acesso</p>'
        + '<h1>Bem-vindo</h1>'
        + '<p class="subtitle">Crie sua senha mestra agora. <strong><em>Esta senha nao pode ser recuperada</em></strong> &mdash; guarde-a com seguranca.</p>'
        + '<label for="pw1">Senha mestra</label>'
        + '<input type="password" id="pw1" autocomplete="new-password" placeholder="m&iacute;nimo 8 caracteres" autofocus />'
        + '<label for="pw2">Confirme a senha</label>'
        + '<input type="password" id="pw2" autocomplete="new-password" placeholder="repita a senha" />'
        + '<button id="btn-create">Criar senha mestra</button>'
        + '<div class="message" id="msg"></div>'
        + '<p class="footer-note">Privacidade por criptografia: AES-GCM 256-bit + PBKDF2 100k itera&ccedil;&otilde;es. <em>Sua senha nunca sai deste navegador.</em></p>'
        + '</div>';
      wireThemeButton();
      document.getElementById("btn-create").addEventListener("click", handleCreate);
      document.getElementById("pw2").addEventListener("keydown", function(e){ if (e.key === "Enter") handleCreate(); });
      return;
    }

    if (state === "normal") {
      app.innerHTML = ''
        + headerHTML()
        + '<div class="gate-card">'
        + '<p class="eyebrow">Sistema pessoal &middot; v1</p>'
        + '<h1>Vida<span class="amp"> & </span>Carteira</h1>'
        + '<p class="subtitle">Digite sua senha mestra para <em>desbloquear</em>.</p>'
        + '<label for="pw">Senha mestra</label>'
        + '<input type="password" id="pw" autocomplete="current-password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" autofocus />'
        + '<button id="btn-unlock">Desbloquear</button>'
        + '<div class="message" id="msg"></div>'
        + '<p class="footer-note">Esqueceu a senha? <em>Nao ha recuperacao por design</em> &mdash; esta &eacute; a ess&ecirc;ncia do zero-knowledge.</p>'
        + '</div>';
      wireThemeButton();
      document.getElementById("btn-unlock").addEventListener("click", handleUnlock);
      document.getElementById("pw").addEventListener("keydown", function(e){ if (e.key === "Enter") handleUnlock(); });
      return;
    }

    if (state === "unlocked") {
      if (window.VidaCarteiraMarcos && typeof window.VidaCarteiraMarcos.render === "function") {
        window.VidaCarteiraMarcos.render(masterKeyInMemory);
      } else {
        app.innerHTML = ''
          + headerHTML()
          + '<div class="gate-card">'
          + '<p class="eyebrow">Autenticado</p>'
          + '<h1>Sistema desbloqueado</h1>'
          + '<p class="subtitle">O modulo de marcos nao foi carregado.</p>'
          + '<button id="btn-lock">Bloquear sistema</button>'
          + '</div>';
        wireThemeButton();
        document.getElementById("btn-lock").addEventListener("click", relock);
      }
      return;
    }
  }

  function showMessage(text, type) {
    var msg = document.getElementById("msg");
    if (!msg) return;
    msg.textContent = text;
    msg.className = "message show " + type;
  }

  function clearMessage() {
    var msg = document.getElementById("msg");
    if (msg) msg.className = "message";
  }

  async function handleCreate() {
    clearMessage();
    var pw1 = document.getElementById("pw1").value;
    var pw2 = document.getElementById("pw2").value;
    var btn = document.getElementById("btn-create");

    if (pw1.length < 8) { showMessage("A senha precisa ter pelo menos 8 caracteres.", "error"); return; }
    if (pw1 !== pw2) { showMessage("As senhas nao coincidem.", "error"); return; }

    btn.disabled = true;
    btn.textContent = "Gerando sentinel...";

    try {
      var sentinelObj = await window.VidaCarteiraCrypto.createSentinel(pw1);
      window.VidaCarteiraCrypto.downloadSentinel(sentinelObj);
      showMessage("Sentinel criptografado gerado e baixado como sentinel.enc. Suba esse arquivo no GitHub em data/sentinel.enc e atualize esta pagina.", "success");
      btn.textContent = "Sentinel gerado";
    } catch (e) {
      showMessage("Erro ao gerar sentinel: " + e.message, "error");
      btn.disabled = false;
      btn.textContent = "Criar senha mestra";
    }
  }

  async function handleUnlock() {
    clearMessage();
    var pw = document.getElementById("pw").value;
    var btn = document.getElementById("btn-unlock");

    if (!pw) { showMessage("Digite a senha mestra.", "error"); return; }

    btn.disabled = true;
    btn.textContent = "Validando...";

    try {
      var valid = await window.VidaCarteiraCrypto.validateSentinel(pw, sentinel);
      if (valid) {
        masterKeyInMemory = pw;
        render("unlocked");
      } else {
        showMessage("Senha incorreta.", "error");
        btn.disabled = false;
        btn.textContent = "Desbloquear";
        document.getElementById("pw").value = "";
        document.getElementById("pw").focus();
      }
    } catch (e) {
      showMessage("Erro ao validar: " + e.message, "error");
      btn.disabled = false;
      btn.textContent = "Desbloquear";
    }
  }

  function relock() {
    masterKeyInMemory = null;
    render("normal");
  }

  async function init() {
    render("loading");
    sentinel = await window.VidaCarteiraCrypto.loadSentinel();
    if (sentinel === null) render("first-time");
    else render("normal");
  }

  document.addEventListener("DOMContentLoaded", init);

  return { relock: relock };
})();
