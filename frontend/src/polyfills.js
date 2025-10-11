// main.jsx
import './polyfills.js';



// Ensure Node-ish globals exist in the browser for sockjs-client, etc.
if (typeof window !== 'undefined') {
  // Some libs check for global
  // eslint-disable-next-line no-undef
  window.global = window.global || window;
  // Some check for process.env
  window.process = window.process || { env: {} };
}
