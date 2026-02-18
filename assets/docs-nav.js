(() => {
  const MEDIA = {
    github: "https://github.com/einsid",
    x: "https://x.com/eins_id",
    email: "mailto:hello@eins.id",
  };

  const ICONS = {
    github: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.72c-2.78.61-3.37-1.2-3.37-1.2-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.88 1.52 2.32 1.08 2.89.83.09-.64.35-1.08.63-1.33-2.22-.26-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.11-.26-.45-1.3.1-2.72 0 0 .84-.27 2.75 1.03A9.57 9.57 0 0 1 12 6.85c.85 0 1.71.11 2.5.33 1.9-1.3 2.75-1.03 2.75-1.03.55 1.42.21 2.46.1 2.72.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.93.68 1.88v2.79c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 3h4.19l4.21 5.91L17.42 3H21l-6.84 7.82L22 21h-4.2l-4.65-6.5L7.36 21H3.78l7.1-8.11L4 3Zm4.83 2.43H7.2l8.03 13.14h1.63L8.83 5.43Z"/></svg>`,
    email: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 5h18v14H3V5Zm2 2v.24L12 12l7-4.76V7H5Zm14 10V9.68l-7 4.77-7-4.77V17h14Z"/></svg>`,
  };

  const NAV_ITEMS = [
    {
      label: "Accountability and Backtracking",
      href: "accountability-and-backtracking.html",
    },
    { label: "Appendix", href: "appendix.html" },
    { label: "Audit workflow", href: "audit-workflow.html" },
    { label: "Developer guide", href: "developer-guide.html" },
    { label: "Forensic Investigation", href: "forensic-investigation.html" },
    { label: "Governance", href: "governance.html" },
    { label: "Overview", href: "overview.html" },
    { label: "Roadmap", href: "roadmap.html" },
    { label: "Shield MCP", href: "shield-mcp.html" },
    { label: "Terms and Services", href: "terms-and-services.html" },
    { label: "Whitepaper", href: "whitepaper.html" },
  ];

  const sidebar = document.getElementById("docs-sidebar");
  if (!sidebar) return;

  // ── Inject shared top-bar header ──────────────────────────────
  const topBar = document.createElement("header");
  topBar.className = "top-bar";
  topBar.innerHTML = `
    <a href="../index.html" class="eyebrow" style="text-decoration:none;">EINZ → TPM-ANCHORED AGENT IDENTITY</a>
    <nav class="top-nav" aria-label="Main navigation">
     
      <a href="overview.html">Docs</a>
      <a href="whitepaper.html">Whitepaper</a>
      <a href="https://github.com/einsid" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="../contact.html">Contact</a>
    </nav>
  `;

  // ── Wrap main in page-shell ───────────────────────────────────
  const main = document.querySelector("main.wrap");
  if (main) {
    const shell = document.createElement("div");
    shell.className = "page-shell";
    main.parentNode.insertBefore(shell, main);
    shell.appendChild(topBar);
    shell.appendChild(main);
  }

  // ── Build sidebar ─────────────────────────────────────────────
  const currentPage = sidebar.dataset.currentPage || "";
  const navLinks = NAV_ITEMS.map((item) => {
    const current = item.href === currentPage ? ' aria-current="page"' : "";
    return `<li><a href="${item.href}"${current}>${item.label}</a></li>`;
  }).join("");

  sidebar.innerHTML = `
  
    <h2>Docs</h2>
    <ul>${navLinks}</ul>
    <div class="sidebar-footer">
      <nav class="sidebar-media" aria-label="Media links">
        <a href="${MEDIA.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${ICONS.github}<span class="sr-only">GitHub</span></a>
        <a href="${MEDIA.x}" target="_blank" rel="noopener noreferrer" aria-label="X">${ICONS.x}<span class="sr-only">X</span></a>
        <a href="${MEDIA.email}" aria-label="Email">${ICONS.email}<span class="sr-only">Email</span></a>
      </nav>
    </div>
  `;

  // ── Global site footer ────────────────────────────────────────
  if (!document.getElementById("global-site-footer")) {
    const footer = document.createElement("footer");
    footer.id = "global-site-footer";
    footer.className = "site-footer";
    footer.innerHTML = `
      <p><strong>Protocol signal:</strong> identity is cheap in software, expensive in silicon. Responsibility should inherit that cost.</p>
      <nav class="footer-media" aria-label="Media links">
        <a href="${MEDIA.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${ICONS.github}<span class="sr-only">GitHub</span></a>
        <a href="${MEDIA.x}" target="_blank" rel="noopener noreferrer" aria-label="X">${ICONS.x}<span class="sr-only">X</span></a>
        <a href="${MEDIA.email}" aria-label="Email">${ICONS.email}<span class="sr-only">Email</span></a>
      </nav>
      <nav class="footer-legal" aria-label="Legal links">
        <a href="../legal.html">Imprint & Privacy</a>
      </nav>
    `;
    document.body.appendChild(footer);
  }
})();
