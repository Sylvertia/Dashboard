import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #07090F;
    --card: #0D1120;
    --card2: #111827;
    --accent: #b36700;
    --accent-dim: rgba(179,103,0,0.12);
    --accent-glow: rgba(179,103,0,0.25);
    --text: #F0F4FF;
    --muted: #6B7A99;
    --border: rgba(255,255,255,0.06);
    --red: #FF5E7A;
    --amber: #FFBE3A;
    --max: 430px;
  }

  html, body, #root {
    min-height: 100dvh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Roboto', sans-serif;
    display: flex;
    justify-content: center;
  }

  #root { width: 100%; }

  .app {
    width: 100%;
    max-width: var(--max);
    margin: 0 auto;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    position: relative;
    background: var(--bg);
  }

  /* HEADER */
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(7,9,15,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    padding: 14px 18px 0;
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .client-info { display: flex; flex-direction: column; }
  .client-label { font-size: 10px; color: var(--muted); letter-spacing: .12em; text-transform: uppercase; }
  .client-name { font-family: 'Roboto', sans-serif; font-size: 17px; font-weight: 700; color: var(--text); margin-top: 1px; }

  .health-ring {
    position: relative;
    width: 56px;
    height: 56px;
  }
  .health-ring svg { transform: rotate(-90deg); }
  .health-ring .score {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .health-ring .score span { font-size: 7px; color: var(--muted); font-family: 'Roboto', sans-serif; margin-top: 1px; }

  .period-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .period-toggle {
    display: flex;
    background: var(--card);
    border-radius: 8px;
    padding: 3px;
    flex: 1;
  }

  .period-btn {
    flex: 1;
    padding: 6px 0;
    border: none;
    background: transparent;
    color: var(--muted);
    font-family: 'Roboto', sans-serif;
    font-size: 11px;
    letter-spacing: .06em;
    cursor: pointer;
    border-radius: 6px;
    transition: all .2s;
  }
  .period-btn.active {
    background: var(--accent);
    color: #07090F;
    font-weight: 500;
  }

  .nav-arrow {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;
    transition: border-color .2s, background .2s;
  }
  .nav-arrow:active { background: var(--accent-dim); border-color: var(--accent); }
  .nav-arrow:disabled { opacity: .3; cursor: default; }

  .period-label {
    font-size: 11px;
    color: var(--muted);
    text-align: center;
    flex: 1;
    white-space: nowrap;
  }

  /* TABS */
  .tabs-bar {
    display: flex;
    overflow-x: auto;
    gap: 4px;
    scrollbar-width: none;
    padding: 0 18px 14px;
  }
  .tabs-bar::-webkit-scrollbar { display: none; }

  .tab-btn {
    flex-shrink: 0;
    padding: 6px 13px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    font-family: 'Roboto', sans-serif;
    font-size: 11px;
    cursor: pointer;
    white-space: nowrap;
    transition: all .2s;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .tab-btn.active {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: var(--accent);
  }

  /* CONTENT */
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px 100px;
  }

  /* KPI CARDS */
  .kpi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }

  .kpi-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    position: relative;
    overflow: hidden;
    transition: border-color .2s;
  }
  .kpi-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent-glow), transparent);
    opacity: 0;
    transition: opacity .3s;
  }
  .kpi-card:active::before { opacity: 1; }

  .kpi-icon {
    font-size: 18px;
    margin-bottom: 8px;
    display: block;
  }

  .kpi-label {
    font-size: 9px;
    color: var(--muted);
    letter-spacing: .1em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .kpi-value {
    font-family: 'Roboto', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
    line-height: 1;
    margin-bottom: 6px;
  }

  .kpi-trend {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 20px;
  }
  .kpi-trend.up { background: rgba(100,220,120,0.12); color: #4cde7a; }
  .kpi-trend.down { background: rgba(255,94,122,.12); color: var(--red); }
  .kpi-trend.neutral { background: rgba(255,190,58,.1); color: var(--amber); }

  /* CHART */
  .chart-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .chart-title {
    font-family: 'Roboto', sans-serif;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 14px;
    color: var(--text);
  }

  /* AI TAB */
  .ai-section { display: flex; flex-direction: column; gap: 14px; }

  .ai-header {
    background: var(--card);
    border: 1px solid var(--accent);
    border-radius: 16px;
    padding: 18px;
    background: linear-gradient(135deg, rgba(179,103,0,0.05), transparent);
  }

  .ai-header h2 {
    font-family: 'Roboto', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: var(--accent);
    margin-bottom: 6px;
  }

  .ai-header p {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.6;
  }

  .ai-metrics-summary {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
  }

  .ai-metrics-summary h3 {
    font-family: 'Roboto', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: .1em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
  }
  .metric-row:last-child { border-bottom: none; }
  .metric-row .label { color: var(--muted); }
  .metric-row .val { color: var(--text); font-weight: 500; }

  .analyze-btn {
    width: 100%;
    padding: 16px;
    border-radius: 14px;
    border: none;
    background: var(--accent);
    color: #07090F;
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    letter-spacing: .04em;
    transition: opacity .2s, transform .1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .analyze-btn:active { transform: scale(.98); opacity: .9; }
  .analyze-btn:disabled { opacity: .5; cursor: default; }

  .ai-response {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text);
    white-space: pre-wrap;
  }

  .ai-response h4 {
    font-family: 'Roboto', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .loading-dots {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .loading-dots span {
    width: 8px; height: 8px;
    background: var(--accent);
    border-radius: 50%;
    animation: bounce .8s ease-in-out infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: .15s; }
  .loading-dots span:nth-child(3) { animation-delay: .3s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(.7); opacity: .5; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* CSV banner */
  .csv-banner {
    margin: 0 0 14px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .csv-banner.ok { background: rgba(179,103,0,0.08); color: var(--accent); border: 1px solid rgba(179,103,0,0.2); }
  .csv-banner.err { background: rgba(255,94,122,.08); color: var(--red); border: 1px solid rgba(255,94,122,.2); }
  .csv-banner.loading { background: rgba(255,190,58,.08); color: var(--amber); border: 1px solid rgba(255,190,58,.2); }

  /* TOOLTIP */
  .custom-tooltip {
    background: #1A2035;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 11px;
  }
  .custom-tooltip .label { color: var(--muted); margin-bottom: 2px; }
  .custom-tooltip .value { color: var(--accent); font-family: 'Roboto', sans-serif; font-weight: 700; font-size: 14px; }
`;

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const WEEK_LABELS = ["S-5", "S-4", "S-3", "S-2", "S-1", "Cette S."];
const MONTH_LABELS = ["Oct", "Nov", "Déc", "Jan", "Fév", "Mars"];

const DEMO = {
  ventes: {
    weekly: [
      { ca: 4200, commandes: 87, panier: 48, taux_conv: 2.1, retours: 5, marge: 38 },
      { ca: 3800, commandes: 79, panier: 48, taux_conv: 1.9, retours: 7, marge: 35 },
      { ca: 5100, commandes: 103, panier: 50, taux_conv: 2.4, retours: 4, marge: 41 },
      { ca: 4750, commandes: 96, panier: 49, taux_conv: 2.2, retours: 6, marge: 39 },
      { ca: 5600, commandes: 112, panier: 50, taux_conv: 2.6, retours: 3, marge: 43 },
      { ca: 6100, commandes: 124, panier: 49, taux_conv: 2.8, retours: 4, marge: 44 },
    ],
    monthly: [
      { ca: 18200, commandes: 372, panier: 49, taux_conv: 2.1, retours: 22, marge: 37 },
      { ca: 16500, commandes: 338, panier: 49, taux_conv: 1.9, retours: 28, marge: 35 },
      { ca: 24100, commandes: 492, panier: 49, taux_conv: 2.5, retours: 18, marge: 42 },
      { ca: 21800, commandes: 445, panier: 49, taux_conv: 2.3, retours: 21, marge: 40 },
      { ca: 19400, commandes: 396, panier: 49, taux_conv: 2.2, retours: 19, marge: 39 },
      { ca: 26800, commandes: 547, panier: 49, taux_conv: 2.9, retours: 15, marge: 45 },
    ],
    kpis: ["ca", "commandes", "panier", "taux_conv", "retours", "marge"],
    labels: ["CA (€)", "Commandes", "Panier Moy (€)", "Taux Conv %", "Retours", "Marge %"],
    icons: ["💰", "📦", "🛒", "🎯", "↩️", "📊"],
    fmt: [(v) => `${(v / 1000).toFixed(1)}k€`, (v) => v, (v) => `${v}€`, (v) => `${v}%`, (v) => v, (v) => `${v}%`],
    chartKey: "ca",
    chartLabel: "CA (€)",
  },
  pub: {
    weekly: [
      { depenses: 1200, roas: 3.5, cpc: 0.82, impressions: 48000, ctr: 2.3, conversions: 42 },
      { depenses: 980, roas: 3.1, cpc: 0.91, impressions: 39000, ctr: 2.1, conversions: 36 },
      { depenses: 1450, roas: 4.1, cpc: 0.75, impressions: 57000, ctr: 2.6, conversions: 54 },
      { depenses: 1300, roas: 3.8, cpc: 0.79, impressions: 52000, ctr: 2.4, conversions: 48 },
      { depenses: 1600, roas: 4.4, cpc: 0.71, impressions: 63000, ctr: 2.8, conversions: 62 },
      { depenses: 1750, roas: 4.8, cpc: 0.68, impressions: 69000, ctr: 3.1, conversions: 71 },
    ],
    monthly: [
      { depenses: 5200, roas: 3.5, cpc: 0.85, impressions: 205000, ctr: 2.3, conversions: 182 },
      { depenses: 4400, roas: 3.2, cpc: 0.92, impressions: 172000, ctr: 2.1, conversions: 156 },
      { depenses: 6100, roas: 4.2, cpc: 0.76, impressions: 241000, ctr: 2.7, conversions: 224 },
      { depenses: 5700, roas: 3.9, cpc: 0.80, impressions: 228000, ctr: 2.5, conversions: 208 },
      { depenses: 5100, roas: 3.6, cpc: 0.88, impressions: 201000, ctr: 2.2, conversions: 191 },
      { depenses: 6800, roas: 4.6, cpc: 0.70, impressions: 271000, ctr: 3.0, conversions: 259 },
    ],
    kpis: ["depenses", "roas", "cpc", "impressions", "ctr", "conversions"],
    labels: ["Dépenses (€)", "ROAS", "CPC (€)", "Impressions", "CTR %", "Conversions"],
    icons: ["💸", "📈", "🖱️", "👁️", "🎯", "✅"],
    fmt: [(v) => `${v}€`, (v) => `x${v}`, (v) => `${v}€`, (v) => `${(v / 1000).toFixed(0)}k`, (v) => `${v}%`, (v) => v],
    chartKey: "roas",
    chartLabel: "ROAS",
  },
  reseaux: {
    weekly: [
      { abonnes: 8400, reach: 21000, engagement: 4.2, posts: 12, clics: 840, stories: 28 },
      { abonnes: 8520, reach: 18500, engagement: 3.8, posts: 10, clics: 720, stories: 24 },
      { abonnes: 8710, reach: 25000, engagement: 4.9, posts: 14, clics: 980, stories: 32 },
      { abonnes: 8900, reach: 23000, engagement: 4.5, posts: 13, clics: 910, stories: 30 },
      { abonnes: 9150, reach: 28000, engagement: 5.2, posts: 15, clics: 1100, stories: 35 },
      { abonnes: 9420, reach: 31000, engagement: 5.8, posts: 16, clics: 1250, stories: 38 },
    ],
    monthly: [
      { abonnes: 8400, reach: 89000, engagement: 4.1, posts: 52, clics: 3600, stories: 120 },
      { abonnes: 8650, reach: 79000, engagement: 3.7, posts: 44, clics: 3100, stories: 104 },
      { abonnes: 8900, reach: 105000, engagement: 4.8, posts: 60, clics: 4200, stories: 138 },
      { abonnes: 9150, reach: 98000, engagement: 4.5, posts: 56, clics: 3900, stories: 130 },
      { abonnes: 9420, reach: 112000, engagement: 5.0, posts: 58, clics: 4400, stories: 142 },
      { abonnes: 9800, reach: 131000, engagement: 5.7, posts: 64, clics: 5100, stories: 156 },
    ],
    kpis: ["abonnes", "reach", "engagement", "posts", "clics", "stories"],
    labels: ["Abonnés", "Reach", "Engagement %", "Posts", "Clics", "Stories"],
    icons: ["👥", "📡", "❤️", "📝", "🔗", "⚡"],
    fmt: [(v) => `${(v / 1000).toFixed(1)}k`, (v) => `${(v / 1000).toFixed(0)}k`, (v) => `${v}%`, (v) => v, (v) => `${(v / 1000).toFixed(1)}k`, (v) => v],
    chartKey: "reach",
    chartLabel: "Reach",
  },
  emails: {
    weekly: [
      { liste: 5200, ouverture: 24.2, clic: 3.8, envois: 3, desabo: 12, ca_email: 820 },
      { liste: 5240, ouverture: 22.1, clic: 3.2, envois: 2, desabo: 9, ca_email: 640 },
      { liste: 5290, ouverture: 27.4, clic: 4.5, envois: 4, desabo: 8, ca_email: 1100 },
      { liste: 5340, ouverture: 25.8, clic: 4.1, envois: 3, desabo: 10, ca_email: 980 },
      { liste: 5400, ouverture: 29.2, clic: 5.0, envois: 4, desabo: 7, ca_email: 1350 },
      { liste: 5480, ouverture: 31.5, clic: 5.8, envois: 5, desabo: 5, ca_email: 1620 },
    ],
    monthly: [
      { liste: 5200, ouverture: 24.0, clic: 3.7, envois: 14, desabo: 48, ca_email: 3400 },
      { liste: 5240, ouverture: 21.8, clic: 3.2, envois: 11, desabo: 42, ca_email: 2800 },
      { liste: 5320, ouverture: 27.0, clic: 4.4, envois: 17, desabo: 38, ca_email: 4600 },
      { liste: 5400, ouverture: 25.5, clic: 4.0, envois: 15, desabo: 41, ca_email: 4100 },
      { liste: 5480, ouverture: 28.8, clic: 4.9, envois: 16, desabo: 35, ca_email: 5200 },
      { liste: 5600, ouverture: 31.0, clic: 5.6, envois: 18, desabo: 28, ca_email: 6400 },
    ],
    kpis: ["liste", "ouverture", "clic", "envois", "desabo", "ca_email"],
    labels: ["Taille Liste", "Taux Ouv %", "Taux Clic %", "Envois", "Désabos", "CA Email (€)"],
    icons: ["📋", "📬", "👆", "📤", "🚫", "💌"],
    fmt: [(v) => `${(v / 1000).toFixed(1)}k`, (v) => `${v}%`, (v) => `${v}%`, (v) => v, (v) => v, (v) => `${v}€`],
    chartKey: "ouverture",
    chartLabel: "Taux Ouverture %",
  },
  lancements: {
    weekly: [
      { revenus: 0, inscrits: 0, webinaires: 0, emails_seq: 0, taux_achat: 0, produits: 1 },
      { revenus: 0, inscrits: 142, webinaires: 1, emails_seq: 3, taux_achat: 0, produits: 1 },
      { revenus: 0, inscrits: 381, webinaires: 2, emails_seq: 6, taux_achat: 0, produits: 1 },
      { revenus: 12400, inscrits: 392, webinaires: 1, emails_seq: 4, taux_achat: 8.4, produits: 1 },
      { revenus: 8200, inscrits: 58, webinaires: 0, emails_seq: 3, taux_achat: 11.2, produits: 1 },
      { revenus: 2100, inscrits: 22, webinaires: 0, emails_seq: 2, taux_achat: 4.1, produits: 2 },
    ],
    monthly: [
      { revenus: 0, inscrits: 0, webinaires: 0, emails_seq: 0, taux_achat: 0, produits: 0 },
      { revenus: 18500, inscrits: 840, webinaires: 3, emails_seq: 12, taux_achat: 7.2, produits: 1 },
      { revenus: 0, inscrits: 120, webinaires: 1, emails_seq: 4, taux_achat: 0, produits: 0 },
      { revenus: 31200, inscrits: 1240, webinaires: 4, emails_seq: 16, taux_achat: 8.8, produits: 1 },
      { revenus: 4800, inscrits: 280, webinaires: 2, emails_seq: 8, taux_achat: 5.2, produits: 1 },
      { revenus: 22700, inscrits: 975, webinaires: 3, emails_seq: 14, taux_achat: 9.4, produits: 2 },
    ],
    kpis: ["revenus", "inscrits", "webinaires", "emails_seq", "taux_achat", "produits"],
    labels: ["Revenus (€)", "Inscrits", "Webinaires", "Emails Séq.", "Taux Achat %", "Produits"],
    icons: ["🚀", "✍️", "🎙️", "📨", "💳", "📦"],
    fmt: [(v) => `${(v / 1000).toFixed(1)}k€`, (v) => v, (v) => v, (v) => v, (v) => `${v}%`, (v) => v],
    chartKey: "revenus",
    chartLabel: "Revenus (€)",
  },
};

const TABS = [
  { id: "ventes", label: "Ventes", icon: "💰" },
  { id: "pub", label: "Pub", icon: "📣" },
  { id: "reseaux", label: "Réseaux", icon: "📱" },
  { id: "emails", label: "Emails", icon: "✉️" },
  { id: "lancements", label: "Lancements", icon: "🚀" },
  { id: "ia", label: "IA", icon: "✨" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function trend(curr, prev) {
  if (!prev || prev === 0) return 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const vals = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      const v = vals[i]?.trim();
      obj[h] = isNaN(v) || v === "" ? v : parseFloat(v);
    });
    return obj;
  });
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function HealthRing({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  const color = score >= 75 ? "#b36700" : score >= 50 ? "#FFBE3A" : "#FF5E7A";
  return (
    <div className="health-ring">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="score">
        {score}
        <span>santé</span>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, prev, fmt }) {
  const t = trend(value, prev);
  const tClass = t > 0 ? "up" : t < 0 ? "down" : "neutral";
  const arrow = t > 0 ? "▲" : t < 0 ? "▼" : "–";
  return (
    <div className="kpi-card">
      <span className="kpi-icon">{icon}</span>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{fmt(value)}</div>
      <span className={`kpi-trend ${tClass}`}>
        {arrow} {Math.abs(t).toFixed(1)}%
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <div className="label">{label}</div>
        <div className="value">{payload[0].value?.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [period, setPeriod] = useState("weekly");
  const [periodIdx, setPeriodIdx] = useState(5);
  const [activeTab, setActiveTab] = useState("ventes");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [csvStatus, setCsvStatus] = useState("loading");
  const [csvData, setCsvData] = useState(null);

  const maxIdx = 5;
  const labels = period === "weekly" ? WEEK_LABELS : MONTH_LABELS;

  // Fetch CSV on mount
  useEffect(() => {
    const url =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSlZdG5Qb_WCY_GuPvE0Onbs2Dd2gMZnYe5jvfidUSBkx2Le_vX0dZjXhl_oFdxA/pub?output=csv";
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then((text) => {
        const parsed = parseCSV(text);
        if (parsed && parsed.length > 0) {
          setCsvData(parsed);
          setCsvStatus("ok");
        } else {
          setCsvStatus("err");
        }
      })
      .catch(() => setCsvStatus("err"));
  }, []);

  // Compute health score
  const tab = DEMO[activeTab !== "ia" ? activeTab : "ventes"];
  const curr = tab[period][periodIdx];
  const prev = periodIdx > 0 ? tab[period][periodIdx - 1] : curr;
  const trends = tab.kpis.map((k) => trend(curr[k], prev[k]));
  const healthScore = Math.round(
    Math.min(100, Math.max(0, 72 + trends.reduce((a, b) => a + b, 0) / trends.length))
  );

  // Chart data
  const chartData = labels.map((label, i) => ({
    label,
    value: tab[period][i]?.[tab.chartKey] || 0,
  }));

  const allMetrics = Object.entries(DEMO).map(([key, d]) => {
    const c = d[period][periodIdx];
    const p = periodIdx > 0 ? d[period][periodIdx - 1] : c;
    return { tab: key, kpi: d.kpis[0], label: d.labels[0], value: c[d.kpis[0]], fmt: d.fmt[0], trend: trend(c[d.kpis[0]], p[d.kpis[0]]) };
  });

  const handleAnalyze = useCallback(async () => {
    setAiLoading(true);
    setAiResponse("");
    const summary = allMetrics
      .map((m) => `${m.tab} – ${m.label}: ${m.fmt(m.value)} (${m.trend > 0 ? "+" : ""}${m.trend.toFixed(1)}%)`)
      .join("\n");
    const prompt = `Tu es un analyste e-commerce expert. Voici les KPIs de la boutique en ligne pour la période "${labels[periodIdx]}" (${period === "weekly" ? "semaine" : "mois"}) :\n\n${summary}\n\nFais une analyse concise en français (5-8 phrases max) :\n• Points forts à souligner\n• Alertes / points d'attention\n• 2 actions prioritaires recommandées\n\nSois direct, précis et orienté action.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((c) => c.text || "").join("\n") || "Réponse vide.";
      setAiResponse(text);
    } catch {
      setAiResponse("❌ Erreur lors de l'analyse. Vérifiez votre connexion.");
    } finally {
      setAiLoading(false);
    }
  }, [allMetrics, labels, periodIdx, period]);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* HEADER */}
        <div className="header">
          <div className="header-top">
            <div className="client-info">
              <span className="client-label">FlowBoard</span>
              <span className="client-name">Boutique Lumière</span>
            </div>
            <HealthRing score={healthScore} />
          </div>

          <div className="period-nav">
            <button
              className="nav-arrow"
              disabled={periodIdx === 0}
              onClick={() => setPeriodIdx((i) => i - 1)}
            >‹</button>
            <div className="period-toggle">
              <button className={`period-btn ${period === "weekly" ? "active" : ""}`} onClick={() => { setPeriod("weekly"); setPeriodIdx(5); }}>Semaine</button>
              <button className={`period-btn ${period === "monthly" ? "active" : ""}`} onClick={() => { setPeriod("monthly"); setPeriodIdx(5); }}>Mois</button>
            </div>
            <span className="period-label" style={{ flex: "none", minWidth: 40, fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{labels[periodIdx]}</span>
            <button
              className="nav-arrow"
              disabled={periodIdx === maxIdx}
              onClick={() => setPeriodIdx((i) => i + 1)}
            >›</button>
          </div>

          <div className="tabs-bar">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          {/* CSV status */}
          {csvStatus === "loading" && (
            <div className="csv-banner loading">⏳ Connexion aux données en cours…</div>
          )}
          {csvStatus === "ok" && (
            <div className="csv-banner ok">✓ Données Google Sheets chargées ({csvData?.length} lignes)</div>
          )}
          {csvStatus === "err" && (
            <div className="csv-banner err">⚠ Données CSV indisponibles — démo activée</div>
          )}

          {activeTab !== "ia" && (() => {
            const tabData = DEMO[activeTab];
            const current = tabData[period][periodIdx];
            const previous = periodIdx > 0 ? tabData[period][periodIdx - 1] : current;
            const chartD = labels.map((label, i) => ({
              label,
              value: tabData[period][i]?.[tabData.chartKey] || 0,
            }));

            return (
              <>
                <div className="kpi-grid">
                  {tabData.kpis.map((kpi, i) => (
                    <KPICard
                      key={kpi}
                      icon={tabData.icons[i]}
                      label={tabData.labels[i]}
                      value={current[kpi]}
                      prev={previous[kpi]}
                      fmt={tabData.fmt[i]}
                    />
                  ))}
                </div>

                <div className="chart-card">
                  <div className="chart-title">{tabData.chartLabel} — 6 dernières périodes</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chartD} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#b36700" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#b36700" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fill: "#6B7A99", fontSize: 10, fontFamily: "Roboto" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6B7A99", fontSize: 9, fontFamily: "Roboto" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#b36700"
                        strokeWidth={2}
                        fill="url(#areaGrad)"
                        dot={{ r: 3, fill: "#b36700", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#b36700" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            );
          })()}

          {activeTab === "ia" && (
            <div className="ai-section">
              <div className="ai-header">
                <h2>✨ Analyse IA</h2>
                <p>Claude analyse l'ensemble de vos KPIs pour {labels[periodIdx]} et génère des recommandations actionnables.</p>
              </div>

              <div className="ai-metrics-summary">
                <h3>Données analysées</h3>
                {allMetrics.map((m) => (
                  <div className="metric-row" key={m.tab}>
                    <span className="label">{m.tab} — {m.label}</span>
                    <span className="val" style={{ color: m.trend >= 0 ? "var(--accent)" : "var(--red)" }}>
                      {m.fmt(m.value)} {m.trend >= 0 ? "▲" : "▼"}{Math.abs(m.trend).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              <button className="analyze-btn" onClick={handleAnalyze} disabled={aiLoading}>
                {aiLoading ? "Analyse en cours…" : "✨ Analyser avec Claude"}
              </button>

              {aiLoading && (
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
              )}

              {aiResponse && !aiLoading && (
                <div className="ai-response">
                  <h4>Analyse FlowBoard — {labels[periodIdx]}</h4>
                  {aiResponse}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
