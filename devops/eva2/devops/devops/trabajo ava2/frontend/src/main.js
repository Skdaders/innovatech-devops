const api =
  typeof import.meta.env.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL
    : "";

document.querySelector("#app").innerHTML = `
  <main style="font-family:system-ui;margin:2rem;">
    <h1>Frontend OK</h1>
    <p>VITE_API_URL (build-time): <code>${api || "(no definida)"}</code></p>
    <p>Este es nuestro Proyecto, Thomas manquepan, khaterine</p>
  </main>
`;
