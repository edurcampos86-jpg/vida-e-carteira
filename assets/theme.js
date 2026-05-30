/* Vida & Carteira — Modulo de Tema
   Constituicao visual / Sprint 2A

   Gerencia alternancia entre modo "dark" (Onix) e "light" (Papel).
   Persiste a escolha em localStorage.
   Notifica listeners via evento customizado "vc-theme-change".

   API publica:
   - VidaCarteiraTheme.get()       -> "dark" | "light"
   - VidaCarteiraTheme.set(mode)   -> aplica e persiste
   - VidaCarteiraTheme.toggle()    -> alterna entre os dois
   - VidaCarteiraTheme.onChange(fn)-> registra listener
*/

window.VidaCarteiraTheme = (function() {
  "use strict";

  var STORAGE_KEY = "vc-theme-mode";
  var DEFAULT_MODE = "dark";
  var listeners = [];

  function get() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") return stored;
    } catch (e) {}
    return DEFAULT_MODE;
  }

  function set(mode) {
    if (mode !== "dark" && mode !== "light") return;
    document.documentElement.setAttribute("data-mode", mode);
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    listeners.forEach(function(fn) {
      try { fn(mode); } catch (e) {}
    });
    document.dispatchEvent(new CustomEvent("vc-theme-change", { detail: { mode: mode } }));
  }

  function toggle() {
    set(get() === "dark" ? "light" : "dark");
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  set(get());

  return { get: get, set: set, toggle: toggle, onChange: onChange };
})();
