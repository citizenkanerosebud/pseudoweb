// ─────────────────────────────────────────────────────────────────────────────
// PseudoWeb — Compartir programa por URL
// Codifica el texto del editor en base64 URL-safe y lo mete en el hash de la URL.
// Maneja UTF-8 correctamente (acentos, ñ, emojis).
// ─────────────────────────────────────────────────────────────────────────────

const HASH_PREFIX = '#code=';

function encodeShare(text) {
    if (!text) return '';
    // JS strings son UTF-16. Pasamos a bytes UTF-8 y luego a base64.
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    // String.fromCharCode con muchos args puede desbordar el stack; vamos por trozos.
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin)
        .replace(/\+/g, '-')   // URL-safe: + → -
        .replace(/\//g, '_')   // URL-safe: / → _
        .replace(/=+$/,  '');  // sin padding
}

function decodeShare(encoded) {
    if (!encoded) return '';
    // Re-padding y des-URL-safe
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    let bin;
    try { bin = atob(b64); }
    catch (e) { throw new Error('La URL compartida está dañada o incompleta'); }
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}

function buildShareURL(text, baseUrl) {
    const base = baseUrl || (window.location.origin + window.location.pathname);
    return base + HASH_PREFIX + encodeShare(text);
}

function readSharedCodeFromHash() {
    const h = window.location.hash || '';
    if (!h.startsWith(HASH_PREFIX)) return null;
    try {
        return decodeShare(h.slice(HASH_PREFIX.length));
    } catch (e) {
        console.warn('No se pudo decodificar #code=:', e.message);
        return null;
    }
}

function clearHashFromURL() {
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
}

window.PseudoShare = {
    encodeShare,
    decodeShare,
    buildShareURL,
    readSharedCodeFromHash,
    clearHashFromURL,
    HASH_PREFIX,
};
