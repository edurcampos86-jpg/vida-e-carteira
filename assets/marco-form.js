window.VidaCarteiraMarcos = (function() {

  "use strict";

  var PILARES = [

    { id: "saude",           label: "Saude",           stroke: "#A32D2D" },

    { id: "familia",         label: "Familia",         stroke: "#993C1D" },

    { id: "trabalho",        label: "Trabalho",        stroke: "#854F0B" },

    { id: "relacionamentos", label: "Relacionamentos", stroke: "#534AB7" },

    { id: "material",        label: "Material",        stroke: "#0F6E56" },

    { id: "espiritual",      label: "Espiritual",      stroke: "#185FA5" }

  ];

  var ACENTOS = {

    saude: "pilar-saude", familia: "pilar-familia", trabalho: "pilar-trabalho",

    relacionamentos: "pilar-relacionamentos", material: "pilar-material", espiritual: "pilar-espiritual"

  };

  var state = {

    masterKey: null,

    marcos: [],

    selectedPilar: "trabalho",

    tipo: "historico"

  };

  function el(tag, attrs, children) {

    var node = document.createElement(tag);

    if (attrs) {

      Object.keys(attrs).forEach(function(k){

        if (k === "class") node.className = attrs[k];

        else if (k === "html") node.innerHTML = attrs[k];

        else if (k === "text") node.textContent = attrs[k];

        else node.setAttribute(k, attrs[k]);

      });

    }

    (children || []).forEach(function(c){ if (c) node.appendChild(c); });

    return node;

  }

  function nomePilar(id) {

    var p = PILARES.find(function(x){ return x.id === id; });

    return p ? p.label : id;

  }

  function render(masterKey) {

    if (masterKey) state.masterKey = masterKey;

    var app = document.getElementById("app");

    app.innerHTML = "";

    var shell = el("div", { class: "app-shell" });

    var header = el("div", { class: "app-header" }, [

      el("h1", { text: "Vida & Carteira" }),

      (function(){

        var b = el("button", { class: "lock-btn", text: "Bloquear" });

        b.addEventListener("click", lock);

        return b;

      })()

    ]);

    shell.appendChild(header);

    shell.appendChild(buildForm());

    shell.appendChild(buildList());

    app.appendChild(shell);

  }

  function buildForm() {

    var card = el("div", { class: "section-card" });

    card.appendChild(el("h2", { text: "Novo marco" }));

    card.appendChild(el("p", { class: "hint", text: "Registre um evento da sua trajetoria. Historico se ja aconteceu, prospectivo se e planejado." }));

    var toggle = el("div", { class: "type-toggle" });

    var btnHist = el("button", { text: "Historico", class: state.tipo === "historico" ? "active" : "" });

    var btnProsp = el("button", { text: "Prospectivo", class: state.tipo === "prospectivo" ? "active" : "" });

    btnHist.addEventListener("click", function(){ state.tipo = "historico"; render(); });

    btnProsp.addEventListener("click", function(){ state.tipo = "prospectivo"; render(); });

    toggle.appendChild(btnHist); toggle.appendChild(btnProsp);

    card.appendChild(toggle);

    var fTitle = el("div", { class: "field" });

    fTitle.appendChild(el("label", { text: "Titulo" }));

    var inTitle = el("input", { type: "text", id: "f-title", placeholder: "Ex: mudanca para Salvador, fundacao da Onix..." });

    fTitle.appendChild(inTitle);

    card.appendChild(fTitle);

    var row = el("div", { class: "field field-row" });

    var colAno = el("div", {});

    colAno.appendChild(el("label", { text: "Ano" }));

    colAno.appendChild(el("input", { type: "number", id: "f-year", min: "1986", max: "2031", value: "2013" }));

    var colMes = el("div", {});

    colMes.appendChild(el("label", { text: "Mes (opcional)" }));

    var sel = el("select", { id: "f-month" });

    sel.appendChild(el("option", { value: "", text: "-" }));

    for (var m = 1; m <= 12; m++) sel.appendChild(el("option", { value: String(m), text: String(m) }));

    colMes.appendChild(sel);

    row.appendChild(colAno); row.appendChild(colMes);

    card.appendChild(row);

    var fPilar = el("div", { class: "field" });

    fPilar.appendChild(el("label", { text: "Pilar" }));

    var grid = el("div", { class: "pilar-grid" });

    PILARES.forEach(function(p){

      var b = el("button", { class: "pilar-btn " + ACENTOS[p.id] + (state.selectedPilar === p.id ? " active" : ""), text: p.label });

      b.addEventListener("click", function(){ state.selectedPilar = p.id; render(); });

      grid.appendChild(b);

    });

    fPilar.appendChild(grid);

    card.appendChild(fPilar);

    var fWeight = el("div", { class: "field" });

    var lblW = el("label", { html: "Peso / importancia: <span class='weight-readout' id='peso-out'>5</span>" });

    fWeight.appendChild(lblW);

    var range = el("input", { type: "range", id: "f-weight", min: "1", max: "10", step: "1", value: "5" });

    range.addEventListener("input", function(){ document.getElementById("peso-out").textContent = range.value; });

    fWeight.appendChild(range);

    var scale = el("div", { class: "weight-scale" }, [ el("span", { text: "leve" }), el("span", { text: "definidor" }) ]);

    fWeight.appendChild(scale);

    card.appendChild(fWeight);

    var fDesc = el("div", { class: "field" });

    fDesc.appendChild(el("label", { text: "Descricao" }));

    fDesc.appendChild(el("textarea", { id: "f-desc", rows: "2", placeholder: "O que aconteceu?" }));

    card.appendChild(fDesc);

    if (state.tipo === "historico") {

      var refl = el("div", { class: "reflection-block" });

      refl.appendChild(el("p", { class: "reflection-title", text: "Reflexao" }));

      refl.appendChild(el("p", { class: "reflection-sub", text: "O coracao do sistema: um marco sem reflexao e incompleto." }));

      var fL = el("div", { class: "field" });

      fL.appendChild(el("label", { text: "O que aprendi" }));

      fL.appendChild(el("input", { type: "text", id: "f-learning", placeholder: "Aprendizado deste marco..." }));

      refl.appendChild(fL);

      var fB = el("div", { class: "field" });

      fB.appendChild(el("label", { text: "Crenca que reforcou" }));

      fB.appendChild(el("input", { type: "text", id: "f-belief", placeholder: "Que crenca pessoal isso confirmou..." }));

      refl.appendChild(fB);

      card.appendChild(refl);

    }

    var save = el("button", { class: "save-btn", text: "Adicionar marco" });

    save.addEventListener("click", addMarco);

    card.appendChild(save);

    return card;

  }

  function buildList() {

    var card = el("div", { class: "section-card" });

    var head = el("div", { style: "display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;" }, [

      el("h2", { text: "Marcos", style: "margin:0;" }),

      el("span", { class: "count-badge", text: state.marcos.length + (state.marcos.length === 1 ? " marco" : " marcos") })

    ]);

    card.appendChild(head);

    if (state.marcos.length === 0) {

      card.appendChild(el("div", { class: "empty-state", html: "Nenhum marco ainda.<br>Cadastre o primeiro acima." }));

      return card;

    }

    var ordem = { saude:1, familia:2, trabalho:3, relacionamentos:4, material:5, espiritual:6 };

    var sorted = state.marcos.slice().sort(function(a,b){

      if (a.year !== b.year) return a.year - b.year;

      return (ordem[a.dimension]||9) - (ordem[b.dimension]||9);

    });

    var ul = el("ul", { class: "marcos-list" });

    sorted.forEach(function(mk){

      var li = el("li", { class: "marco-item " + ACENTOS[mk.dimension] });

      li.appendChild(el("div", { class: "marco-dot" }));

      var body = el("div", { class: "marco-body" });

      body.appendChild(el("div", { class: "marco-title", text: mk.title }));

      var meta = nomePilar(mk.dimension) + " - " + mk.year + (mk.month ? "/" + mk.month : "") + " - peso " + mk.weight + " - " + (mk.type === "historico" ? "historico" : "prospectivo");

      body.appendChild(el("div", { class: "marco-meta", text: meta }));

      li.appendChild(body);

      ul.appendChild(li);

    });

    card.appendChild(ul);

    var exp = el("button", { class: "lock-btn", style: "width:100%; margin-top:1rem;", text: "Exportar marcos (criptografado)" });

    exp.addEventListener("click", exportarCriptografado);

    card.appendChild(exp);

    return card;

  }

  function addMarco() {

    var title = (document.getElementById("f-title").value || "").trim();

    if (!title) { document.getElementById("f-title").focus(); return; }

    var marco = {

      id: "m_" + Date.now(),

      type: state.tipo,

      title: title,

      year: parseInt(document.getElementById("f-year").value, 10),

      month: document.getElementById("f-month").value ? parseInt(document.getElementById("f-month").value, 10) : null,

      dimension: state.selectedPilar,

      weight: parseInt(document.getElementById("f-weight").value, 10),

      description: (document.getElementById("f-desc").value || "").trim() || null,

      tags: [],

      people: [],

      created_at: new Date().toISOString()

    };

    if (state.tipo === "historico") {

      marco.reflection = {

        learning: (document.getElementById("f-learning").value || "").trim() || null,

        belief_reinforced: (document.getElementById("f-belief").value || "").trim() || null

      };

    }

    state.marcos.push(marco);

    render();

  }

  async function exportarCriptografado() {

    if (!state.masterKey) { alert("Sessao sem chave. Bloqueie e desbloqueie novamente."); return; }

    try {

      var payload = JSON.stringify({ version: 1, exported_at: new Date().toISOString(), marcos: state.marcos });

      var encrypted = await window.VidaCarteiraCrypto.encryptText(payload, state.masterKey);

      var json = JSON.stringify(encrypted, null, 2);

      var blob = new Blob([json], { type: "application/json" });

      var url = URL.createObjectURL(blob);

      var a = document.createElement("a");

      a.href = url; a.download = "marcos.json.enc";

      document.body.appendChild(a); a.click(); document.body.removeChild(a);

      URL.revokeObjectURL(url);

    } catch (e) {

      alert("Erro ao exportar: " + e.message);

    }

  }

  function lock() {

    state.masterKey = null;

    state.marcos = [];

    if (window.VidaCarteiraGate && window.VidaCarteiraGate.relock) {

      window.VidaCarteiraGate.relock();

    } else {

      location.reload();

    }

  }

  return { render: render };

})();
