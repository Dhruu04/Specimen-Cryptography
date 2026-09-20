import { tracks, lessons } from '../src/content/index';
import { tools } from '../src/lib/tools';
import * as fs from 'fs';

function escapeHtml(str: string) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const htmlHead = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Specimen Cryptography Laboratory — Complete Technical Specification & Manual</title>
  <style>
    :root {
      --bg: #ffffff;
      --fg: #111111;
      --fg-muted: #555555;
      --fg-subtle: #777777;
      --border: #e2e2e2;
      --border-subtle: #eeeeee;
      --surface: #fafafa;
      --surface-hover: #f4f4f4;
      --code-bg: #f5f5f5;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
      --sidebar-width: 310px;
      --topbar-height: 48px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      font-size: 14.5px;
      line-height: 1.65;
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--font-sans);
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      scroll-behavior: smooth;
    }
    body {
      min-height: 100vh;
      background: var(--bg);
      display: block;
      position: relative;
    }

    /* Fixed Topbar */
    #topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--topbar-height);
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 150;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .topbar-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      border-radius: 6px;
      font-size: 12px;
      font-family: var(--font-mono);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .topbar-toggle-btn:hover {
      background: var(--fg);
      color: var(--bg);
      border-color: var(--fg);
    }
    .kbd-tag {
      font-size: 10px;
      padding: 1px 4px;
      border: 1px solid var(--border);
      border-radius: 3px;
      background: var(--bg);
      color: var(--fg-muted);
    }
    .topbar-toggle-btn:hover .kbd-tag {
      background: #333;
      color: #fff;
      border-color: #444;
    }
    .topbar-title {
      font-size: 13.5px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--fg);
    }
    .topbar-return-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--fg-muted);
      text-decoration: none;
      padding: 5px 10px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--surface);
      transition: all 0.15s ease;
    }
    .topbar-return-btn:hover {
      background: var(--fg);
      color: var(--bg);
      border-color: var(--fg);
    }

    /* Fixed Retractable Sidebar */
    #sidebar {
      position: fixed;
      top: var(--topbar-height);
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      border-right: 1px solid var(--border);
      background: var(--bg);
      display: flex;
      flex-direction: column;
      z-index: 120;
      padding: 20px 16px;
      overflow-y: auto;
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    body.sidebar-collapsed #sidebar {
      transform: translateX(-100%);
    }

    #sidebarBackdrop {
      display: none;
      position: fixed;
      inset: 0;
      top: var(--topbar-height);
      background: rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(2px);
      z-index: 110;
    }

    .brand-block {
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 14px;
    }
    .brand-title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge-tag {
      font-family: var(--font-mono);
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border: 1px solid var(--border);
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--surface);
      font-weight: 600;
      color: var(--fg-muted);
    }
    .brand-sub {
      font-size: 11px;
      color: var(--fg-muted);
      margin-top: 4px;
      line-height: 1.4;
    }
    .sidebar-search {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 12px;
      font-family: var(--font-sans);
      background: var(--surface);
      color: var(--fg);
      margin-bottom: 12px;
      outline: none;
      transition: border-color 0.15s;
    }
    .sidebar-search:focus {
      border-color: var(--fg);
      background: var(--bg);
    }
    .nav-section-title {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--fg-subtle);
      margin-top: 14px;
      margin-bottom: 6px;
    }
    .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-link {
      display: block;
      padding: 4px 8px;
      font-size: 12px;
      color: var(--fg-muted);
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.1s ease;
      line-height: 1.35;
    }
    .nav-link:hover {
      background: var(--surface);
      color: var(--fg);
    }
    .nav-link.active {
      background: var(--fg);
      color: var(--bg);
      font-weight: 500;
    }

    /* Main Container */
    #main {
      margin-top: var(--topbar-height);
      margin-left: var(--sidebar-width);
      padding: 36px 56px 120px 56px;
      max-width: calc(var(--sidebar-width) + 980px);
      transition: margin-left 0.22s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    body.sidebar-collapsed #main {
      margin-left: auto;
      margin-right: auto;
      max-width: 1020px;
      padding: 36px 32px 120px 32px;
    }

    .article-header {
      border-bottom: 2px solid var(--fg);
      padding-bottom: 24px;
      margin-bottom: 36px;
    }
    .meta-line {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 10px;
      color: var(--fg);
    }
    .lead-paragraph {
      font-size: 15px;
      color: var(--fg-muted);
      line-height: 1.6;
    }

    /* Section Styling */
    section {
      margin-bottom: 56px;
      scroll-margin-top: 60px;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      margin-top: 38px;
      margin-bottom: 16px;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .sec-num {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 400;
      color: var(--fg-subtle);
    }
    h3 {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-top: 24px;
      margin-bottom: 8px;
    }
    p { margin-bottom: 12px; color: var(--fg); font-size: 14px; line-height: 1.65; }
    ul, ol { margin-bottom: 14px; padding-left: 20px; font-size: 13.5px; }
    li { margin-bottom: 5px; }

    /* Tables */
    .table-container {
      width: 100%;
      overflow-x: auto;
      margin: 16px 0 24px 0;
      border: 1px solid var(--border);
      border-radius: 6px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left; }
    th {
      background: var(--surface);
      font-weight: 600;
      font-family: var(--font-mono);
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
      color: var(--fg);
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: top;
      color: var(--fg);
      line-height: 1.5;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafafa; }

    /* Code & Callout */
    code, .mono {
      font-family: var(--font-mono);
      font-size: 12px;
      background: var(--code-bg);
      border: 1px solid var(--border);
      padding: 2px 4px;
      border-radius: 3px;
      color: var(--fg);
    }
    pre {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px 14px;
      font-family: var(--font-mono);
      font-size: 12px;
      overflow-x: auto;
      line-height: 1.5;
      margin: 12px 0 18px 0;
    }
    .callout {
      border-left: 3px solid var(--fg);
      background: var(--surface);
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 0 4px 4px 0;
      font-size: 13px;
    }
    .callout-title {
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    /* Cards */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px;
      margin: 16px 0 24px 0;
    }
    .spec-card {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 14px;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .spec-card:hover { border-color: #000; }
    .spec-card-title { font-size: 13.5px; font-weight: 700; margin-bottom: 4px; }
    .spec-card-tag {
      font-family: var(--font-mono);
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--fg-muted);
      margin-bottom: 6px;
      display: block;
    }
    .spec-card-body { font-size: 12px; color: var(--fg-muted); line-height: 1.45; }

    .tool-box {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 14px;
      background: var(--bg);
    }
    .tool-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .tool-id {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--fg);
    }
    .tool-tagline {
      font-size: 12.5px;
      color: var(--fg-muted);
      margin-bottom: 8px;
    }
    .field-tag {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 10px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 3px;
      padding: 2px 6px;
      margin-right: 4px;
      margin-bottom: 4px;
    }

    @media print {
      #topbar, #sidebar, #sidebarBackdrop { display: none !important; }
      #main { margin-top: 0 !important; margin-left: 0 !important; padding: 0 !important; max-width: 100% !important; }
      body { font-size: 11pt; line-height: 1.4; }
      h2 { page-break-after: avoid; }
    }

    /* Mobile / Tablet responsive */
    @media (max-width: 900px) {
      #sidebar {
        transform: translateX(-100%);
        box-shadow: 0 10px 30px rgba(0,0,0,0.18);
      }
      body.sidebar-mobile-open #sidebar {
        transform: translateX(0) !important;
      }
      body.sidebar-mobile-open #sidebarBackdrop {
        display: block;
      }
      #main {
        margin-left: 0 !important;
        padding: 24px 18px 100px !important;
        max-width: 100% !important;
      }
      .topbar-title {
        display: none;
      }
    }
  </style>
</head>
<body>

  <!-- Topbar with always-visible Outline button -->
  <header id="topbar">
    <div class="topbar-left">
      <button id="topbarToggleBtn" type="button" class="topbar-toggle-btn" onclick="toggleSidebar()" title="Toggle Chapters / Outline ([)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        <span id="toggleBtnLabel">Outline</span>
        <kbd class="kbd-tag">[</kbd>
      </button>
      <span class="topbar-title">Specimen Cryptography Laboratory — Technical Manual</span>
    </div>
    <div class="topbar-right">
      <a href="/" class="topbar-return-btn">
        <span>← Return to App</span>
      </a>
    </div>
  </header>

  <!-- Mobile Backdrop Overlay -->
  <div id="sidebarBackdrop" onclick="toggleSidebar()"></div>

  <!-- Retractable Navigation Sidebar -->
  <aside id="sidebar">
    <div class="brand-block">
      <div class="brand-title">
        <span>Specimen</span>
        <span class="badge-tag">Omnibus Manual</span>
      </div>
      <div class="brand-sub">Exhaustive Technical Catalog & Specifications</div>
    </div>

    <input type="text" id="navFilter" class="sidebar-search" placeholder="Filter sections, tools, lessons..." oninput="filterNav()" />

    <div class="nav-section-title">1. System Architecture</div>
    <ul class="nav-list">
      <li><a href="#sec-overview" class="nav-link" onclick="closeSidebarOnMobile()">1.1 Executive Overview</a></li>
      <li><a href="#sec-stack" class="nav-link" onclick="closeSidebarOnMobile()">1.2 System Architecture</a></li>
      <li><a href="#sec-zero-telemetry" class="nav-link" onclick="closeSidebarOnMobile()">1.3 Zero-Telemetry Boundary</a></li>
    </ul>

    <div class="nav-section-title">2. Curriculum Tracks (75 Lessons)</div>
    <ul class="nav-list">
      <li><a href="#track-classical" class="nav-link" onclick="closeSidebarOnMobile()">Track 1: Classical Ciphers (13)</a></li>
      <li><a href="#track-encoding" class="nav-link" onclick="closeSidebarOnMobile()">Track 2: Encoding & Data (7)</a></li>
      <li><a href="#track-symmetric" class="nav-link" onclick="closeSidebarOnMobile()">Track 3: Modern Symmetric (6)</a></li>
      <li><a href="#track-hashing" class="nav-link" onclick="closeSidebarOnMobile()">Track 4: Hashing & MACs (7)</a></li>
      <li><a href="#track-publickey" class="nav-link" onclick="closeSidebarOnMobile()">Track 5: Public Key & RSA (7)</a></li>
      <li><a href="#track-postquantum" class="nav-link" onclick="closeSidebarOnMobile()">Track 6: Post-Quantum PQC (13)</a></li>
      <li><a href="#track-numbertheory" class="nav-link" onclick="closeSidebarOnMobile()">Track 7: Number Theory (11)</a></li>
      <li><a href="#track-security" class="nav-link" onclick="closeSidebarOnMobile()">Track 8: Cyber Security Practice (11)</a></li>
    </ul>

    <div class="nav-section-title">3. Calculators & Engines (81 Tools)</div>
    <ul class="nav-list">
      <li><a href="#tools-classical" class="nav-link" onclick="closeSidebarOnMobile()">Classical Ciphers (15)</a></li>
      <li><a href="#tools-encoding" class="nav-link" onclick="closeSidebarOnMobile()">Encoding & Representation (10)</a></li>
      <li><a href="#tools-symmetric" class="nav-link" onclick="closeSidebarOnMobile()">Symmetric Encryption (7)</a></li>
      <li><a href="#tools-hashing" class="nav-link" onclick="closeSidebarOnMobile()">Hashing & Commitments (8)</a></li>
      <li><a href="#tools-publickey" class="nav-link" onclick="closeSidebarOnMobile()">Public Key & Key Exchange (6)</a></li>
      <li><a href="#tools-postquantum" class="nav-link" onclick="closeSidebarOnMobile()">Post-Quantum Lattice & Signatures (7)</a></li>
      <li><a href="#tools-numbertheory" class="nav-link" onclick="closeSidebarOnMobile()">Number Theory Engines (15)</a></li>
      <li><a href="#tools-security" class="nav-link" onclick="closeSidebarOnMobile()">Attacks & Protocol Labs (13)</a></li>
    </ul>

    <div class="nav-section-title">4. Interactive Labs</div>
    <ul class="nav-list">
      <li><a href="#lab-lattice" class="nav-link" onclick="closeSidebarOnMobile()">4.1 2D Lattice CVP / LWE</a></li>
      <li><a href="#lab-ecb" class="nav-link" onclick="closeSidebarOnMobile()">4.2 ECB Penguin Flaw</a></li>
      <li><a href="#lab-cbc" class="nav-link" onclick="closeSidebarOnMobile()">4.3 CBC Bit-Flipping Exploit</a></li>
      <li><a href="#lab-dh" class="nav-link" onclick="closeSidebarOnMobile()">4.4 Diffie-Hellman MITM</a></li>
      <li><a href="#lab-tls" class="nav-link" onclick="closeSidebarOnMobile()">4.5 TLS 1.3 Wire Inspector</a></li>
      <li><a href="#lab-zkp" class="nav-link" onclick="closeSidebarOnMobile()">4.6 ZKP Playground</a></li>
      <li><a href="#lab-pqc" class="nav-link" onclick="closeSidebarOnMobile()">4.7 Post-Quantum Lattice Studio</a></li>
      <li><a href="#lab-forensics" class="nav-link" onclick="closeSidebarOnMobile()">4.8 Steganography & Forensics Studio</a></li>
      <li><a href="#lab-pipeline" class="nav-link" onclick="closeSidebarOnMobile()">4.9 Crypto Pipeline Studio</a></li>
      <li><a href="#lab-benchmark" class="nav-link" onclick="closeSidebarOnMobile()">4.10 Benchmark & Avalanche Arena</a></li>
      <li><a href="#lab-enigma" class="nav-link" onclick="closeSidebarOnMobile()">4.11 Mechanical Enigma Simulator</a></li>
      <li><a href="#lab-flashcards" class="nav-link" onclick="closeSidebarOnMobile()">4.12 Spaced-Repetition Study Flashcards</a></li>
      <li><a href="#lab-notebook" class="nav-link" onclick="closeSidebarOnMobile()">4.13 Lab Notebook, Ranking & Certificate</a></li>
    </ul>

    <div class="nav-section-title">5. AI Assistant & Inspector</div>
    <ul class="nav-list">
      <li><a href="#sec-detector" class="nav-link" onclick="closeSidebarOnMobile()">5.1 Format Auto-Detector</a></li>
      <li><a href="#sec-solver" class="nav-link" onclick="closeSidebarOnMobile()">5.2 Formula Math Solver</a></li>
    </ul>

    <div class="nav-section-title">6. Challenges & Standards</div>
    <ul class="nav-list">
      <li><a href="#sec-challenges" class="nav-link" onclick="closeSidebarOnMobile()">6.1 Challenge Arena (CTF)</a></li>
      <li><a href="#sec-standards" class="nav-link" onclick="closeSidebarOnMobile()">6.2 Standards Matrix (FIPS)</a></li>
      <li><a href="#sec-ui" class="nav-link" onclick="closeSidebarOnMobile()">6.3 UI & Universal Scratchpad</a></li>
    </ul>
  </aside>

  <main id="main">
    <header class="article-header">
      <div class="meta-line">
        <span>Specimen Omnibus Reference</span>
        <span>·</span>
        <span>8 Tracks · 75 Lessons · 81 Tools · 6 Labs</span>
        <span>·</span>
        <span>Formal Release</span>
      </div>
      <h1>Specimen Cryptography & Cryptanalysis Comprehensive Manual</h1>
      <p class="lead-paragraph">
        Exhaustive reference document specifying every curriculum course, lesson objective, interactive mathematical converter, specialized attack laboratory, format auto-detector heuristic, and operational feature within the Specimen workbench.
      </p>
    </header>

    <!-- SECTION 1 -->
    <section id="sec-overview">
      <h2><span class="sec-num">1.1</span> Executive Summary & Mission</h2>
      <p>
        <strong>Specimen</strong> is an all-in-one, client-side, interactive cryptology laboratory designed to bridge the chasm between abstract algebraic definitions and concrete byte-level implementations. The system's foundational thesis is <em>"worked out by hand"</em>: every cipher, hash function, post-quantum polynomial reduction, and protocol exchange exposes every intermediate variable, matrix step, and state permutation directly in the browser.
      </p>
    </section>

    <section id="sec-stack">
      <h2><span class="sec-num">1.2</span> System Architecture</h2>
      <p>
        Specimen is engineered as an offline-first Single Page Application (SPA) powered by React 19, TypeScript 5.8, TanStack Router v1, and TanStack Query v5. The application requires zero backend API server: all calculations, Miller-Rabin witness iterations, Galois field arithmetic, and Babai lattice closest-vector calculations execute directly within the V8 / JavaScript engine.
      </p>
    </section>

    <section id="sec-zero-telemetry">
      <h2><span class="sec-num">1.3</span> Security Philosophy & Zero-Telemetry Boundary</h2>
      <p>
        The platform enforces a strict client-side evaluation boundary. No inputs, keys, plaintexts, or ciphertexts are ever sent over network sockets. The local storage is used solely for client-side persistence (scratchpad snippets, challenge victory flags).
      </p>
    </section>

    <!-- SECTION 2: TRACKS AND ALL 75 LESSONS -->
    <section id="sec-tracks">
      <h2><span class="sec-num">2.0</span> Complete Curriculum Breakdown (${tracks.length} Tracks, ${lessons.length} Lessons)</h2>
      <p>
        Below is the exhaustive syllabus of all 75 lessons across the 8 curriculum tracks, detailing the topic, linked converter, and worked out mathematical example.
      </p>
`;

let trackSectionContent = '';

for (const t of tracks) {
  const tLessons = lessons.filter(l => l.trackId === t.id);
  trackSectionContent += `
    <div id="track-${t.id}" style="margin-top: 36px; scroll-margin-top: 60px;">
      <h3>Track: ${escapeHtml(t.name)} (${tLessons.length} Lessons)</h3>
      <p><em>${escapeHtml(t.blurb)}</em>. ${escapeHtml(t.intro)}</p>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Lesson</th>
              <th style="width: 15%;">Tool Linked</th>
              <th style="width: 35%;">Worked Example</th>
              <th style="width: 25%;">Lesson ID</th>
            </tr>
          </thead>
          <tbody>
  `;

  for (const l of tLessons) {
    trackSectionContent += `
      <tr>
        <td><strong>${escapeHtml(l.title)}</strong></td>
        <td>${l.toolId ? `<code>${escapeHtml(l.toolId)}</code>` : '<span style="color:#999;">None</span>'}</td>
        <td>${l.workedExample ? `<em>${escapeHtml(l.workedExample.title)}</em> (${l.workedExample.steps.length} steps)` : '<span style="color:#999;">Direct study</span>'}</td>
        <td><code>${escapeHtml(l.id)}</code></td>
      </tr>
    `;
  }

  trackSectionContent += `
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// SECTION 3: ALL 81 TOOLS
let toolSectionContent = `
    <section id="sec-tools">
      <h2><span class="sec-num">3.0</span> Exhaustive Directory of All ${tools.length} Converters & Calculators</h2>
      <p>
        Every single tool in the Specimen laboratory is listed below with its identifier, track category, parameter input fields, validation defaults, and output description.
      </p>
`;

const trackCategories = [
  { id: "classical", name: "Classical Ciphers" },
  { id: "encoding", name: "Encoding & Representation" },
  { id: "symmetric", name: "Symmetric Encryption" },
  { id: "hashing", name: "Hashing & Integrity" },
  { id: "publickey", name: "Public Key Cryptography" },
  { id: "postquantum", name: "Post-Quantum Cryptography" },
  { id: "numbertheory", name: "Number Theory Foundations" },
  { id: "security", name: "Security Protocols & Attacks" }
];

for (const cat of trackCategories) {
  const catTools = tools.filter(tool => tool.trackId === cat.id);
  toolSectionContent += `
    <div id="tools-${cat.id}" style="margin-top: 32px; scroll-margin-top: 60px;">
      <h3>Category: ${cat.name} (${catTools.length} Tools)</h3>
      <div style="display: grid; gap: 12px; margin-top: 14px;">
  `;

  for (const tool of catTools) {
    const fields = tool.fields ?? [];
    toolSectionContent += `
      <div class="tool-box">
        <div class="tool-header">
          <span class="tool-id">tool: ${escapeHtml(tool.id)}</span>
          <span class="badge-tag">${escapeHtml(tool.trackId)}</span>
        </div>
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${escapeHtml(tool.name)}</div>
        <div class="tool-tagline">${escapeHtml(tool.tagline || '')}</div>
        <p style="font-size: 12.5px; margin-bottom: 8px;"><strong>Output Produced:</strong> <code>${escapeHtml(tool.outputLabel || 'Result')}</code></p>
        <div>
          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--fg-subtle); display: block; margin-bottom: 4px;">Configurable Input Fields:</span>
          ${fields.length > 0 
            ? fields.map(f => `<span class="field-tag"><strong>${escapeHtml(f.name)}</strong> (${escapeHtml(f.label)}) [${escapeHtml(f.type)}] default: "<code>${escapeHtml(f.default || '')}</code>"</span>`).join(' ')
            : '<span style="font-size: 12px; color: #999;">No user parameters (Zero-arg generator)</span>'
          }
        </div>
      </div>
    `;
  }

  toolSectionContent += `
      </div>
    </div>
  `;
}

// SECTION 4: SPECIALIZED LABS
const labsContent = `
    <!-- SECTION 4: SPECIALIZED LABS -->
    <section id="sec-labs">
      <h2><span class="sec-num">4.0</span> Specialized Interactive Simulation Labs</h2>
      <p>
        Beyond standard converters, Specimen features six dedicated interactive laboratories designed to simulate multi-party protocol dynamics, structural cryptographic leakage, and lattice geometry.
      </p>

      <div id="lab-lattice" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.1 2D Lattice Closest Vector Problem (CVP / LWE) Visualizer</h3>
        <p>
          Lattice-based cryptography underpins NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA). This visualizer renders a 2D Euclidean coordinate system demonstrating the hardness of the Closest Vector Problem (CVP):
        </p>
        <ul>
          <li><strong>Interactive Basis Vectors:</strong> Modify basis vectors b₁ and b₂ dynamically. Observe how non-orthogonal (skewed) bases distort the fundamental domain.</li>
          <li><strong>Babai's Nearest Plane Algorithm:</strong> Evaluates target points t = (t_x, t_y) by projecting onto basis vectors and rounding coefficients c_i = ⌊c_i⌉.</li>
          <li><strong>Gram-Schmidt Orthogonalization:</strong> Computes the orthogonalized private basis b₁*, b₂* to prove why the private key holder can effortlessly decode error-perturbed points while the public key holder fails.</li>
          <li><strong>Error Boundaries:</strong> Shows the Voronoi cell radius and visualizes decoding failure when error vector e exceeds the cell boundary.</li>
        </ul>
      </div>

      <div id="lab-ecb" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.2 The ECB "Penguin" Flaw Visualizer</h3>
        <p>
          Electronic Codebook (ECB) mode encrypts identical 16-byte blocks into identical 16-byte ciphertext blocks: C_i = E_K(P_i). This simulator takes a 64x64 bitmap with high macroscopic patterns. Encrypting with ECB reveals the exact silhouette to an eavesdropper, disproving semantic security (IND-CPA). Switching to CBC or CTR mode introduces an initialization vector (IV), achieving complete pseudo-random diffusion.
        </p>
      </div>

      <div id="lab-cbc" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.3 CBC Bit-Flipping Exploit Simulator</h3>
        <p>
          In CBC mode decryption, plaintext block P_i = D_K(C_i) ⊕ C_{i-1}. Flipping bit j in ciphertext block C_{i-1} flips bit j in resulting plaintext P_i. The simulator stages a session cookie: <code>comment=hello;admin=0;user=guest</code>. Flipping a single bit in the preceding ciphertext block alters the decrypted text to <code>admin=1</code> without knowing the AES key, demonstrating the necessity of authenticated encryption (AEAD).
        </p>
      </div>

      <div id="lab-dh" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.4 Diffie-Hellman MITM Interceptor</h3>
        <p>
          Three-column protocol simulator (Alice, Mallorie, Bob). When Diffie-Hellman key exchange is unauthenticated, an active interceptor substitutes public keys (A' = g^m mod p and B' = g^m mod p), establishing two independent shared secrets K_{AM} and K_{MB}. Mallorie transparently decrypts, modifies, and re-encrypts all communications.
        </p>
      </div>

      <div id="lab-tls" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.5 TLS 1.3 Handshake & Packet Wire Inspector</h3>
        <p>
          Inspects the 1-RTT protocol exchange: ClientHello, ServerHello, EncryptedExtensions, Certificate, CertificateVerify, and Finished messages. Includes an interactive <strong>MITM Tamper Engine</strong>: flipping a single byte in the transit ciphertext triggers an immediate <code>AEAD_BAD_TAG</code> authentication abort, illustrating AEAD integrity enforcement.
        </p>
      </div>

      <div id="lab-zkp" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.6 Zero-Knowledge Proofs (ZKP) Playground</h3>
        <p>
          Interactive implementations of two classic zero-knowledge paradigms:
        </p>
        <ol>
          <li><strong>Schnorr 3-Move Identification:</strong> Commitment (t = g^r mod p), Challenge (e), and Response (s = r + e·x mod p-1). Includes an Honest vs Imposter mode where an attacker guessing commitments is mathematically caught within 10 rounds.</li>
          <li><strong>Graph 3-Coloring Interactive Rounds:</strong> Verifier queries random edges in a permuted graph coloring, verifying zero-knowledge completeness and soundness without revealing the coloring matrix.</li>
        </ol>
      </div>

      <div id="lab-pqc" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.7 Post-Quantum Lattice Studio (NIST FIPS 203 & 204)</h3>
        <p>
          Comprehensive laboratory implementing the mathematical mechanics of modern lattice cryptography:
        </p>
        <ul>
          <li><strong>ML-KEM (FIPS 203 / Kyber):</strong> Step-by-step Ring-LWE key generation, encapsulation, and decapsulation over the quotient polynomial ring Z_q[X]/(X^n+1) with selectable moduli (q=17, q=257, q=3329) and degrees (n=4, 8, 16).</li>
          <li><strong>Noise Amplification & Failure Threshold:</strong> Interactive slider scaling error variance to demonstrate why total noise must satisfy |e_{total}| < ⌊q/4⌋ for correct decryption, illustrating the exact mathematical boundary where lattice decryption failures occur.</li>
          <li><strong>ML-DSA (FIPS 204 / Dilithium) Rejection Sampling:</strong> Visualizes the "Fiat-Shamir with Aborts" paradigm. Proves that without rejecting signatures whose norms approach the uniform boundary γ_1, the output vector z = y + c·s leaks the secret key through distribution skewing.</li>
          <li><strong>2D CVP Basis Geometry:</strong> Interactive canvas demonstrating the Babai closest vector projection using private orthogonal bases versus public skewed bases.</li>
        </ul>
      </div>

      <div id="lab-forensics" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.8 Steganography & Digital Forensics Studio (/forensics)</h3>
        <p>
          Interactive spatial and structural forensics inspection workbench with custom carrier image upload, real-time bit-plane slicing, lossless PNG export, and file signature parsing:
        </p>
        <ul>
          <li><strong>Custom Carrier Image Upload:</strong> Drag and drop or upload arbitrary user images (PNG, JPEG, WebP) or select from built-in procedural specimens (Emblem, Target, Spectrum) with automatic aspect-ratio-preserving canvas normalization.</li>
          <li><strong>8-Bit Plane Slicer:</strong> Isolates individual bit planes (Bit 0 LSB up to Bit 7 MSB) across Red, Green, Blue, and Grayscale luminance channels, stripping high-order visual data to expose hidden watermarks, concealed monochrome payloads, and spatial noise anomalies.</li>
          <li><strong>LSB Carrier Injection & Extraction:</strong> Injects secret text payloads into least-significant bits using a 32-bit magic header (<code>STEG</code>) and 32-bit length prefix, preventing premature EOF noise or garbage decoding. Features live extraction telemetry, an amplified visual difference mask, and mathematical fidelity metrics (Peak Signal-to-Noise Ratio PSNR in dB, Mean Squared Error MSE).</li>
          <li><strong>Lossless Stego Export & Roundtrip Testing:</strong> Download the encoded image as a pristine 24-bit PNG with <code>Download Stego PNG</code>, and upload external stego files with <code>Extract from External File</code> to verify end-to-end extraction across machines.</li>
          <li><strong>File Header & Magic Byte Inspector:</strong> Analyzes raw file signatures (JPEG, PNG, GIF, PDF, ZIP, ELF, PE) and automatically flags appended payloads and polyglot archive overlays trailing past official End-of-File (EOF) markers.</li>
        </ul>
      </div>

      <div id="lab-pipeline" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.9 Crypto Pipeline Studio (/pipeline)</h3>
        <p>
          Multi-stage sequential recipe workbench inspired by CyberChef, designed for modular deobfuscation and multi-layer cryptographic analysis:
        </p>
        <ul>
          <li><strong>Sequential Processing Chain:</strong> Drag, drop, toggle, reorder, and configure arbitrary transformation stages. Output of stage <em>n</em> feeds as input to stage <em>n+1</em>.</li>
          <li><strong>17+ Built-in Operations:</strong> Hex Decode/Encode, Base64 Decode/Encode, URL Decode/Encode, Caesar Shift, ROT13, Atbash, Reverse String, XOR with ASCII text key, XOR with Hex byte mask, Strip Whitespace, Uppercase, Lowercase, Shannon Entropy calculation, and Frequency Distribution analysis.</li>
          <li><strong>Live Intermediate Stage Inspection:</strong> Click "Inspect Stages" to view intermediate textual states, execution errors, and dynamic Shannon entropy values per step.</li>
          <li><strong>Curated Recipe Presets:</strong> Instant one-click loading for common real-world workflows: Defang & Decode, Caesar Bruteforce Stager, Multi-layer Stego Unmask, and Malicious Script Hex Deobfuscation.</li>
          <li><strong>Recipe Portability:</strong> Import and export recipe chains as JSON files or clipboard strings for reproducible cryptanalysis.</li>
        </ul>
      </div>

      <div id="lab-benchmark" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.10 Cryptographic Benchmark & Avalanche Arena (/benchmark)</h3>
        <p>
          Live hardware performance evaluation and diffusion criterion visualization suite:
        </p>
        <ul>
          <li><strong>Native Web Crypto Hardware Benchmarks:</strong> Executes genuine client-side CPU tests on AES-256-GCM, AES-128-CBC, SHA-256, SHA-512, HMAC-SHA256, RSA-OAEP 2048-bit key exchange, and Kyber-768 NTT polynomial butterfly lattice arithmetic. Reports operations per second, throughput in MB/s, and average operation latency.</li>
          <li><strong>Interactive 128-Bit Strict Avalanche Criterion (SAC) Grid:</strong> A 16-byte (128-bit) block interactive visualizer. Users flip individual input bits and observe immediate non-linear bit avalanche flips across the output block.</li>
          <li><strong>Shannon Diffusion Metrics:</strong> Calculates live Hamming distance between original and mutated states, output flip percentage (ideal SAC = 50.0%), and output Shannon entropy.</li>
        </ul>
      </div>

      <div id="lab-enigma" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.11 Mechanical Enigma Simulator</h3>
        <p>
          Authentic electromechanical simulation of the German military Enigma I / M3 machine:
        </p>
        <ul>
          <li><strong>German QWERTZ Military Interface:</strong> Physical keyboard layout with authentic illuminated lampboard reacting to keystrokes.</li>
          <li><strong>Steckerbrett Plugboard:</strong> Cross-connect letter pairs with patch cables; swaps are applied before entry into the entry wheel (ETW) and after return from the reflector.</li>
          <li><strong>Rotor Stepping & Double-Stepping Anomaly:</strong> Faithfully models the mechanical pawl-and-ratchet mechanism, including the famous middle-rotor double-stepping anomaly where the middle rotor steps on both consecutive keystrokes when in notch position.</li>
          <li><strong>Historical Rotor Library:</strong> Includes Rotors I through V with authentic internal wiring and turnover notches (Q, E, V, J, Z), plus Reflector B (Umkehrwalze B).</li>
          <li><strong>10-Stage Signal Pathway:</strong> Visualizes the complete electrical circuit: Key → Plugboard → Entry Wheel → Rotor 3 → Rotor 2 → Rotor 1 → Reflector → Rotor 1 (reverse) → Rotor 2 (reverse) → Rotor 3 (reverse) → Plugboard → Lamp.</li>
        </ul>
      </div>

      <div id="lab-flashcards" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.12 Spaced-Repetition Study Flashcards (/flashcards)</h3>
        <p>
          Active recall study engine designed for rigorous mastery of mathematical theorems, cipher mechanics, and cryptanalytic proofs:
        </p>
        <ul>
          <li><strong>185+ Rigorous Academic Cards:</strong> Deeply populated across all 8 curriculum tracks: Classical Ciphers, Encodings & Finite Fields, Symmetric Block & Stream Ciphers, Hashes & MACs, Asymmetric Cryptosystems, Post-Quantum Lattice Cryptography, Protocols & ZKP, and Number Theory.</li>
          <li><strong>Complete Formal Notation:</strong> Back of cards include exact algebraic identities, modular arithmetic proofs, and vulnerability criteria (e.g. CBC bit-flipping algebraic formulations, RSA-CRT Bellcore equations, Shannon Perfect Secrecy conditions).</li>
          <li><strong>3D Flip Animation & Active Recall:</strong> Keyboard-accessible self-assessment (Space to flip, 1 for "Needs Review", 2 for "Mastered", arrow keys for navigation).</li>
          <li><strong>Persistent Curriculum Mastery Telemetry:</strong> Tracks mastered vs. review vs. new cards in local storage with live percentage mastery meters and instant search/track filtering.</li>
        </ul>
      </div>

      <div id="lab-notebook" class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">4.13 Lab Notebook, Cryptanalyst Ranking & Verifiable Certificate (/notebook)</h3>
        <p>
          Researcher portfolio, competency verification, and academic certification engine:
        </p>
        <ul>
          <li><strong>6-Tier Cryptanalyst Ranking System:</strong> Automatically advances learner rank based on verified curriculum completion and captured CTF flags:
            <ol>
              <li><em>Recruit Cryptanalyst (Tier I):</em> Classical ciphers and elementary encodings.</li>
              <li><em>Cipher Operator (Tier II):</em> Polyalphabetic cryptanalysis and rotor mechanics.</li>
              <li><em>Symmetric Specialist (Tier III):</em> AES Galois field arithmetic and padding oracles.</li>
              <li><em>Number Theorist (Tier IV):</em> RSA factorization, CRT exploitation, and discrete logarithms.</li>
              <li><em>Protocol Exploiter (Tier V):</em> TLS 1.3 handshakes, replay vulnerabilities, and zero-knowledge proofs.</li>
              <li><em>Master Post-Quantum Cryptanalyst (Tier VI / Apex):</em> High-dimensional lattice reduction, Kyber/Dilithium NTT bounds.</li>
            </ol>
          </li>
          <li><strong>Verifiable Academic Certificate:</strong> Formal certificate modal with institutional borders, candidate name, completion metrics, and a cryptographically calculated SHA-256 verification fingerprint over the candidate dossier. Includes a dedicated single-page print stylesheet for physical diploma generation.</li>
          <li><strong>Curriculum Audit Checklist:</strong> Interactive tracking for all 75 lessons and 45+ CTF challenges with local persistence.</li>
          <li><strong>Researcher Field Notes:</strong> Persistent Markdown laboratory log for documenting findings, equations, and audit steps.</li>
        </ul>
      </div>
    </section>
`;

// SECTION 5: ASSISTANT & DETECTOR
const assistantContent = `
    <!-- SECTION 5: AI ASSISTANT & DETECTOR -->
    <section id="sec-detector">
      <h2><span class="sec-num">5.1</span> Instant Format Auto-Detector & Inspector</h2>
      <p>
        Activated via <code>⌘K</code> or the top navigation bar, the detection engine evaluates raw input buffers against a battery of cryptographic and structural rules:
      </p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Format Target</th>
              <th>Heuristic Rules & Patterns</th>
              <th>Inspector Decoded Output</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Base64 / Base64URL</strong></td><td><code>^[A-Za-z0-9+/=_-]+$</code>, length % 4 == 0, character entropy</td><td>ASCII / UTF-8 string + raw hex byte breakdown</td></tr>
            <tr><td><strong>Hexadecimal (Base 16)</strong></td><td><code>^[0-9a-fA-F]+$</code>, even length, key length detection (128/256-bit)</td><td>ASCII decode, binary bitstream, and Shannon entropy</td></tr>
            <tr><td><strong>PEM Certificates & Keys</strong></td><td><code>-----BEGIN (CERTIFICATE|RSA PRIVATE KEY|PUBLIC KEY)-----</code></td><td>ASN.1 DER header inspection, key size, and format identification</td></tr>
            <tr><td><strong>JSON Web Token (JWT)</strong></td><td>3 Base64URL segments separated by dots (<code>header.payload.sig</code>)</td><td>Decoded JSON header (<code>alg</code>, <code>typ</code>) and claims payload</td></tr>
            <tr><td><strong>Bitcoin / Ethereum Addresses</strong></td><td>ETH: <code>0x[a-fA-F0-9]{40}</code>; BTC: Base58Check / Bech32 <code>bc1...</code></td><td>Network classification (EVM, Bitcoin Mainnet, SegWit)</td></tr>
            <tr><td><strong>Password Hashes</strong></td><td>Bcrypt <code>$2a$...</code>, Argon2 <code>$argon2id$...</code>, PBKDF2 formats</td><td>Identifies cost factors, memory lanes, and salt boundaries</td></tr>
            <tr><td><strong>Classical Ciphertexts</strong></td><td>Index of Coincidence (IC) & Chi-Square frequency tests</td><td>Detects likely Caesar shift key or polyalphabetic substitution</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="sec-solver">
      <h2><span class="sec-num">5.2</span> Cryptographic Math Solver</h2>
      <p>
        The Assistant parses mathematical expressions directly in the search bar:
      </p>
      <ul>
        <li><code>modpow(base, exp, mod)</code>: BigInt modular exponentiation via binary square-and-multiply.</li>
        <li><code>gcd(a, b)</code> and <code>egcd(a, b)</code>: Extended Euclidean algorithm returning Bézout coefficients (x, y).</li>
        <li><code>totient(n)</code>: Computes Euler's totient function φ(n).</li>
        <li><code>factors(n)</code>: Prime factorization of composite integers.</li>
        <li><code>entropy(text)</code>: Evaluates Shannon entropy in bits per character.</li>
      </ul>
    </section>
`;

// SECTION 6: CHALLENGES, STANDARDS, UI
const challengesContent = `
    <!-- SECTION 6: CHALLENGES & STANDARDS -->
    <section id="sec-challenges">
      <h2><span class="sec-num">6.1</span> Challenge Arena (45+ Interactive CTF Cryptanalysis Puzzles)</h2>
      <p>
        Specimen incorporates an extensive cryptanalysis challenge arena featuring copyable intercepted artifacts, multi-stage hints, an embedded in-card Decryption Workbench (supporting Caesar, ROT13, Base64, Hex, Custom XOR, Modulo Exponentiation, and GCD Euclidean algorithms), and live vulnerability sandboxes across twelve operational domains:
      </p>
      <div class="card-grid">
        <div class="spec-card">
          <span class="spec-card-tag">Classical</span>
          <div class="spec-card-title">Substitution & Transposition Analysis</div>
          <div class="spec-card-body">Decrypt intercepted wartime dispatches using Index of Coincidence, Kasiski examination, digraph frequency patterns, Playfair matrices, Two-Time Pad crib dragging (C1 ⊕ C2), 2-rail zig-zag paths, and columnar keyword transposition matrices.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Symmetric</span>
          <div class="spec-card-title">Block Cipher & AEAD Exploits</div>
          <div class="spec-card-body">Stage CBC bit-flipping payload injections, exploit ECB cut-and-paste block independence, query live Vaudenay padding oracles, break Double DES via Meet-in-the-Middle (2⁵⁷ operations), and execute the AES-GCM Forbidden Attack on reused nonces.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Side-Channel</span>
          <div class="spec-card-title">Fault Injection & Timing Analysis</div>
          <div class="spec-card-body">Execute the 1996 Boneh-DeMillo-Lipton Bellcore laser fault injection attack on RSA-CRT via gcd(S' - S, N), and exploit non-constant-time byte comparison latency spikes to reconstruct secret authorization PINs.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Blockchain</span>
          <div class="spec-card-title">EVM & Merkle Tree Cryptography</div>
          <div class="spec-card-body">Compute secp256k1 ECDSA malleable signatures s' = (n - s) mod n to forge transaction hashes without private keys, and enforce RFC 6962 0x00 leaf domain separation to defeat Merkle second pre-image inclusion proofs.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Asymmetric</span>
          <div class="spec-card-title">RSA Mathematical & Factoring Attacks</div>
          <div class="spec-card-body">Execute small exponent (e=3) cube root attacks, Bleichenbacher PKCS#1 v1.5 low-exponent signature forgeries, Håstad's broadcast CRT reconstruction, Common Modulus recovery, batch GCD factorization of low-entropy IoT keys, Fermat factorization (p ≈ q), and Wiener's small private exponent d attack.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Discrete Log</span>
          <div class="spec-card-title">Diffie-Hellman & Subgroup Confinement</div>
          <div class="spec-card-body">Confine shared secrets using small subgroup attacks (A' = -1), execute parameter injection MITM exploits, crack smooth group orders via the Pohlig-Hellman algorithm, and recover ECDSA private keys from nonce collisions (k-reuse).</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Integrity</span>
          <div class="spec-card-title">Hash Length Extension & PRNGs</div>
          <div class="spec-card-body">Exploit Merkle–Damgård state exposure to append unauthorized API parameters without key knowledge, calculate Birthday collision bounds, and predict Linear Congruential Generator (LCG) seeds.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Post-Quantum</span>
          <div class="spec-card-title">Lattice Reduction & Knapsack Sums</div>
          <div class="spec-card-body">Decode noisy lattice vectors using Babai's nearest plane projection, calculate Kyber ML-KEM noise overflow failure boundaries (|e| ≥ ⌊q/4⌋), analyze Dilithium rejection sampling norm leakage, and solve Merkle-Hellman superincreasing knapsack subset sums.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Homomorphic</span>
          <div class="spec-card-title">Paillier Additive Homomorphism</div>
          <div class="spec-card-body">Decrypt confidential electronic voting ballot tallies from the modular ciphertext product c_sum = (c1 · c2) mod n² without decrypting individual voter choices.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Protocols</span>
          <div class="spec-card-title">Wireless & Web Token Security</div>
          <div class="spec-card-body">Exploit KRACK WPA2 4-Way Handshake nonce reinstallation resets in 802.11i, bypass JWT authentication via alg: none, and forge RS256 signatures via HMAC algorithm key confusion (CVE-2015-9235).</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Forensics</span>
          <div class="spec-card-title">LSB Steganography & Polyglot Files</div>
          <div class="spec-card-body">Extract concealed bitstreams from least significant image planes and detect appended ZIP/executable payloads hidden past PNG IEND chunk markers.</div>
        </div>
        <div class="spec-card">
          <span class="spec-card-tag">Threshold</span>
          <div class="spec-card-title">Shamir Secret Sharing & ZKPs</div>
          <div class="spec-card-body">Reconstruct cryptocurrency custody vault master secrets over GF(257) using Lagrange interpolation, and prove Schnorr identification soundness limits against imposter provers.</div>
        </div>
      </div>

      <div class="tool-box" style="margin-top: 24px;">
        <h3 style="margin-top: 0;">6.1.1 Live Interactive Vaudenay CBC Padding Oracle Sandbox</h3>
        <p>
          An authentic software replica of Serge Vaudenay's 2002 chosen-ciphertext attack on PKCS#7 block cipher padding:
        </p>
        <ul>
          <li><strong>Four Live Register Arrays:</strong> Displays the 16-byte original ciphertext block C₀, the mutated probe block C'₀, the recovered intermediate block I = D_K(C₁), and the final decrypted plaintext block P = I ⊕ C₀.</li>
          <li><strong>Manual & Auto-Solve Exploit Engines:</strong> Step through candidate bytes (0x00 through 0xFF) one at a time or trigger automated solving with configurable delay (fast, realistic, throttled).</li>
          <li><strong>Live HTTP Wire Diagnostics:</strong> Visualizes server oracle reactions: valid padding returns <code>HTTP 200 OK (Padding Valid)</code> while invalid padding yields <code>HTTP 500 Internal Server Error (Decryption Failed)</code>.</li>
          <li><strong>Mathematical Proof & Circuit Mechanics:</strong> Explains how setting target padding byte <em>pad</em> forces C'₀[k] = I[k] ⊕ pad, enabling exact algebraic recovery of I[k] and subsequent plaintext deduction P[k] = I[k] ⊕ C₀[k] without ever recovering key K.</li>
        </ul>
      </div>

      <div class="tool-box" style="margin-top: 20px;">
        <h3 style="margin-top: 0;">6.1.2 Live Interactive Håstad Broadcast CRT Solver Sandbox</h3>
        <p>
          An interactive laboratory solver demonstrating Johan Håstad's 1985 lattice/CRT broadcast theorem:
        </p>
        <ul>
          <li><strong>Configurable Secret & Moduli:</strong> Input an arbitrary secret message <em>m</em> and three distinct pairwise coprime RSA moduli (N₁, N₂, N₃) under public exponent e = 3.</li>
          <li><strong>Step 1 — Multi-Recipient Broadcast Encryption:</strong> Computes the three intercepted modular ciphertexts c₁ ≡ m³ (mod N₁), c₂ ≡ m³ (mod N₂), and c₃ ≡ m³ (mod N₃).</li>
          <li><strong>Step 2 — Chinese Remainder Theorem Reconstruction:</strong> Computes the compound product N = N₁ · N₂ · N₃, partial products M_i = N / N_i, and Bézout modular inverses M_i⁻¹ mod N_i via the Extended Euclidean Algorithm to assemble C ≡ m³ (mod N).</li>
          <li><strong>Step 3 — Exact Integer Root Recovery:</strong> Demonstrates that because m &lt; N_i, m³ &lt; N₁·N₂·N₃. Therefore, no modular wrap-around occurs over the compound modulus N. Taking the exact real cube root ∛C over the integers ℤ immediately recovers the secret plaintext m without factoring any modulus.</li>
        </ul>
      </div>
    </section>

    <section id="sec-standards">
      <h2><span class="sec-num">6.2</span> Cryptographic Standards Matrix (NIST FIPS & RFCs)</h2>
      <p>
        The Standards Matrix outlines standard specifications, bit security levels, and quantum resilience:
      </p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Standard</th>
              <th>Specification</th>
              <th>Category</th>
              <th>Security Level</th>
              <th>Quantum Resistance</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>AES-256-GCM</strong></td><td>NIST SP 800-38D</td><td>AEAD Block Cipher</td><td>256 bits</td><td>Safe (128-bit under Grover)</td></tr>
            <tr><td><strong>ChaCha20-Poly1305</strong></td><td>RFC 8439</td><td>AEAD Stream Cipher</td><td>256 bits</td><td>Safe (128-bit under Grover)</td></tr>
            <tr><td><strong>ML-KEM-768</strong></td><td>NIST FIPS 203 (Kyber)</td><td>Post-Quantum KEM</td><td>Category 3 (AES-192)</td><td>Fully Quantum-Safe (LWE)</td></tr>
            <tr><td><strong>ML-DSA-65</strong></td><td>NIST FIPS 204 (Dilithium)</td><td>Post-Quantum Signature</td><td>Category 3 (AES-192)</td><td>Fully Quantum-Safe (Lattice)</td></tr>
            <tr><td><strong>SLH-DSA</strong></td><td>NIST FIPS 205 (SPHINCS+)</td><td>Stateless Hash Signature</td><td>Category 1/3/5</td><td>Fully Quantum-Safe (Hash-based)</td></tr>
            <tr><td><strong>Ed25519</strong></td><td>RFC 8032 / FIPS 186-5</td><td>Elliptic Curve Signature</td><td>128 bits</td><td>Vulnerable (Broken by Shor)</td></tr>
            <tr><td><strong>RSA-3072 / 4096</strong></td><td>PKCS #1 v2.2 / RFC 8017</td><td>Asymmetric Encryption & Sig</td><td>128 / 140 bits</td><td>Vulnerable (Broken by Shor)</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="sec-ui">
      <h2><span class="sec-num">6.3</span> UI Ergonomics, Scratchpad & Keyboard Shortcuts</h2>
      <p>
        The user interface incorporates high-efficiency researcher tools:
      </p>
      <ul>
        <li><strong>Minimalist Decluttered Top Bar:</strong> Clean, spacious layout grouping experimental simulation tools under a minimal <code>Labs ▾</code> popover menu.</li>
        <li><strong>Universal Cryptographic Scratchpad:</strong> Persistent drawer on the right side allowing users to collect keys, intermediate hex arrays, and calculation outputs across routes.</li>
        <li><strong>Keyboard Navigation:</strong>
          <ul>
            <li><code>⌘K</code> or <code>Ctrl+K</code>: Launch Global Assistant, Calculator & Format Inspector.</li>
            <li><code>?</code>: Open Keyboard Shortcuts Cheat Sheet.</li>
            <li><code>Esc</code>: Close modals, drawers, and active popovers.</li>
          </ul>
        </li>
      </ul>
    </section>
  </main>

  <script>
    function isMobile() {
      return window.innerWidth <= 900;
    }

    function toggleSidebar() {
      if (isMobile()) {
        document.body.classList.toggle('sidebar-mobile-open');
      } else {
        const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
        try {
          localStorage.setItem('specimen_docs_collapsed', isCollapsed ? '1' : '0');
        } catch (e) {}
      }
    }

    function closeSidebarOnMobile() {
      if (isMobile()) {
        document.body.classList.remove('sidebar-mobile-open');
      }
    }

    try {
      if (!isMobile() && localStorage.getItem('specimen_docs_collapsed') === '1') {
        document.body.classList.add('sidebar-collapsed');
      }
    } catch (e) {}

    window.addEventListener('keydown', (e) => {
      if ((e.key === '[' || (e.ctrlKey && e.key === 'b')) && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleSidebar();
      }
    });

    function filterNav() {
      const q = document.getElementById('navFilter').value.toLowerCase();
      const links = document.querySelectorAll('.nav-link');
      links.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes(q)) {
          link.parentElement.style.display = '';
        } else {
          link.parentElement.style.display = 'none';
        }
      });
    }

    window.addEventListener('DOMContentLoaded', () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.nav-link').forEach(link => {
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, { rootMargin: '0px 0px -70% 0px' });

      document.querySelectorAll('section[id], div[id]').forEach(sec => observer.observe(sec));
    });
  </script>
</body>
</html>
`;

const finalHtml = htmlHead + trackSectionContent + toolSectionContent + labsContent + assistantContent + challengesContent;

fs.writeFileSync('d:/Projects/Crypto/documentation.html', finalHtml, 'utf-8');
fs.writeFileSync('d:/Projects/Crypto/Cypher/documentation.html', finalHtml, 'utf-8');
fs.writeFileSync('d:/Projects/Crypto/Cypher/public/documentation.html', finalHtml, 'utf-8');
console.log('SUCCESS! Regenerated documentation with robust topbar & retractable sidebar.');
