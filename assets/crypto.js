/* Vida & Carteira — Módulo de Criptografia
   Privacy Guardian — Fase 1
   
   Princípios:
   - Zero conhecimento: senha nunca é gravada
   - PBKDF2 100k iterações SHA-256 (padrão Bitwarden/1Password)
   - AES-GCM 256-bit (IV único por gravação)
   - Apenas Web Crypto API nativa, sem dependências externas
*/

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_LENGTH = 256;
const SENTINEL_PLAINTEXT = "vida-e-carteira-v1";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/* Converte ArrayBuffer para string base64 */
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/* Converte string base64 para ArrayBuffer */
function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/* Gera salt aleatório */
function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

/* Gera IV aleatório (uso único por gravação) */
function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_BYTES));
}

/* Deriva chave AES-GCM a partir da senha usando PBKDF2 */
async function deriveKey(password, salt) {
  const passwordBuffer = encoder.encode(password);
  
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
  
  return derivedKey;
}

/* Criptografa texto com a chave derivada
   Retorna objeto serializável: { salt, iv, ciphertext } em base64 */
async function encryptText(plaintext, password) {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(password, salt);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(plaintext)
  );
  
  return {
    version: 1,
    algorithm: "AES-GCM-256",
    kdf: "PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertext)
  };
}

/* Descriptografa objeto produzido por encryptText */
async function decryptText(encryptedObj, password) {
  const salt = new Uint8Array(base64ToBuffer(encryptedObj.salt));
  const iv = new Uint8Array(base64ToBuffer(encryptedObj.iv));
  const ciphertext = base64ToBuffer(encryptedObj.ciphertext);
  
  const key = await deriveKey(password, salt);
  
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
    return decoder.decode(plaintext);
  } catch (e) {
    throw new Error("DECRYPT_FAILED");
  }
}

/* Cria um sentinel criptografado para validar senha mestra */
async function createSentinel(password) {
  return await encryptText(SENTINEL_PLAINTEXT, password);
}

/* Valida senha contra um sentinel existente */
async function validateSentinel(password, sentinelObj) {
  try {
    const decrypted = await decryptText(sentinelObj, password);
    return decrypted === SENTINEL_PLAINTEXT;
  } catch (e) {
    return false;
  }
}

/* Tenta carregar o sentinel do arquivo data/sentinel.enc */
async function loadSentinel() {
  try {
    const response = await fetch("data/sentinel.enc?t=" + Date.now(), { cache: "no-store" });
    if (!response.ok) return null;
    const text = await response.text();
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

/* Trigger de download do sentinel.enc gerado */
function downloadSentinel(sentinelObj) {
  const json = JSON.stringify(sentinelObj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sentinel.enc";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* Exporta as funções no escopo global do módulo */
window.VidaCarteiraCrypto = {
  encryptText,
  decryptText,
  createSentinel,
  validateSentinel,
  loadSentinel,
  downloadSentinel
};
