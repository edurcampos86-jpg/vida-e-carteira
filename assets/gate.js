/* Vida & Carteira — Lógica do Gate de Senha
   Privacy Guardian — Fase 1
   
   Estados:
   - first-time: nenhum sentinel.enc existe → criar senha mestra
   - normal: sentinel.enc existe → validar senha digitada
   - unlocked: senha validada → sistema desbloqueado (placeholder por ora)
*/

(function() {
  "use strict";
  
  let currentState = "loading";
  let sentinel = null;
  let masterKeyInMemory = null; // Apenas durante a sessão
  
  /* ===== Renderização ===== */
  
  function render(state) {
    const app = document.getElementById("app");
    currentState = state;
    
    if (state === "loading") {
      app.innerHTML = `
        <div class="gate-card">
          <h1>Vida & Carteira</h1>
          <p class="subtitle">Carregando...</p>
        </div>
      `;
      return;
    }
    
    if (state === "first-time") {
      app.innerHTML = `
        <div class="gate-card">
          <h1>Bem-vindo ao Vida & Carteira</h1>
          <p class="subtitle">
            Esta é a primeira vez que você abre o sistema. Crie sua senha mestra agora.
            <strong>Esta senha não pode ser recuperada.</strong> Guarde-a com segurança.
          </p>
          
          <label for="pw1">Senha mestra</label>
          <input type="password" id="pw1" autocomplete="new-password" autofocus />
          
          <label for="pw2">Confirme a senha</label>
          <input type="password" id="pw2" autocomplete="new-password" />
          
          <button id="btn-create">Criar senha mestra</button>
          
          <div class="message" id="msg"></div>
          
          <p class="footer-note">
            Privacidade por criptografia: AES-GCM 256-bit + PBKDF2 100k iterações.
            Sua senha nunca sai deste navegador.
          </p>
        </div>
      `;
      
      document.getElementById("btn-create").addEventListener("click", handleCreate);
      document.getElementById("pw2").addEventListener("keydown", function(e) {
        if (e.key === "Enter") handleCreate();
      });
      return;
    }
    
    if (state === "normal") {
      app.innerHTML = `
        <div class="gate-card">
          <h1>Vida & Carteira</h1>
          <p class="subtitle">Digite sua senha mestra para desbloquear.</p>
          
          <label for="pw">Senha mestra</label>
          <input type="password" id="pw" autocomplete="current-password" autofocus />
          
          <button id="btn-unlock">Desbloquear</button>
          
          <div class="message" id="msg"></div>
          
          <p class="footer-note">
            Esqueceu a senha? Não há recuperação por design — esta é a essência do
            zero-knowledge. Os dados são ininteligíveis sem a senha correta.
          </p>
        </div>
      `;
      
      document.getElementById("btn-unlock").addEventListener("click", handleUnlock);
      document.getElementById("pw").addEventListener("keydown", function(e) {
        if (e.key === "Enter") handleUnlock();
      });
      return;
    }
    
    if (state === "unlocked") {
      app.innerHTML = `
        <div class="gate-card">
          <h1>Sistema desbloqueado</h1>
          <p class="subtitle">
            Autenticação concluída. As próximas features do Vida & Carteira serão
            adicionadas aqui — constelação de marcos, ritual trimestral, painel
            do futuro.
          </p>
          
          <div class="message info show">
            Próximo passo do roadmap: implementar o Schema Keeper e cadastrar
            os primeiros marcos.
          </div>
          
          <button id="btn-lock">Bloquear sistema</button>
          
          <p class="footer-note">
            Fase 1 concluída — Privacy Guardian ativo.
          </p>
        </div>
      `;
      
      document.getElementById("btn-lock").addEventListener("click", handleLock);
      return;
    }
  }
  
  /* ===== Mensagens ===== */
  
  function showMessage(text, type) {
    const msg = document.getElementById("msg");
    if (!msg) return;
    msg.textContent = text;
    msg.className = "message show " + type;
  }
  
  function clearMessage() {
    const msg = document.getElementById("msg");
    if (msg) msg.className = "message";
  }
  
  /* ===== Handlers ===== */
  
  async function handleCreate() {
    clearMessage();
    const pw1 = document.getElementById("pw1").value;
    const pw2 = document.getElementById("pw2").value;
    const btn = document.getElementById("btn-create");
    
    if (pw1.length < 8) {
      showMessage("A senha precisa ter pelo menos 8 caracteres.", "error");
      return;
    }
    
    if (pw1 !== pw2) {
      showMessage("As senhas não coincidem.", "error");
      return;
    }
    
    btn.disabled = true;
    btn.textContent = "Gerando sentinel...";
    
    try {
      const sentinelObj = await window.VidaCarteiraCrypto.createSentinel(pw1);
      window.VidaCarteiraCrypto.downloadSentinel(sentinelObj);
      
      showMessage(
        "Sentinel criptografado gerado e baixado como sentinel.enc. " +
        "Suba esse arquivo no GitHub em data/sentinel.enc e atualize esta página. " +
        "Veja instruções detalhadas em docs/PRIVACY.md.",
        "success"
      );
      btn.textContent = "Sentinel gerado";
    } catch (e) {
      showMessage("Erro ao gerar sentinel: " + e.message, "error");
      btn.disabled = false;
      btn.textContent = "Criar senha mestra";
    }
  }
  
  async function handleUnlock() {
    clearMessage();
    const pw = document.getElementById("pw").value;
    const btn = document.getElementById("btn-unlock");
    
    if (!pw) {
      showMessage("Digite a senha mestra.", "error");
      return;
    }
    
    btn.disabled = true;
    btn.textContent = "Validando...";
    
    try {
      const valid = await window.VidaCarteiraCrypto.validateSentinel(pw, sentinel);
      
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
  
  function handleLock() {
    masterKeyInMemory = null;
    render("normal");
  }
  
  /* ===== Inicialização ===== */
  
  async function init() {
    render("loading");
    sentinel = await window.VidaCarteiraCrypto.loadSentinel();
    
    if (sentinel === null) {
      render("first-time");
    } else {
      render("normal");
    }
  }
  
  document.addEventListener("DOMContentLoaded", init);
})();
