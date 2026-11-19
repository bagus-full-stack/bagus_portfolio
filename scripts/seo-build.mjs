// Post-build SEO: pre-renders the home and project pages (FR + EN), and writes
// sitemap.xml, llms.txt and llms-full.txt from the Supabase data.
// Needs VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (env or .env); without them it
// leaves dist untouched and the static files from public/ stay in place.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const SITE = 'https://assamibaga.com';
const DIST = 'dist';
const GITHUB = 'https://github.com/bagus-full-stack';
const LINKEDIN = 'https://linkedin.com/in/assami-baga';

const env = { ...process.env };
if (fs.existsSync('.env')) {
  for (const l of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const URL_ = env.VITE_SUPABASE_URL, KEY = env.VITE_SUPABASE_ANON_KEY;
if (!URL_ || !KEY) {
  console.warn('[seo-build] VITE_SUPABASE_URL/ANON_KEY missing: skipped, static SEO files kept.');
  process.exit(0);
}

const get = async (table, query = '') => {
  const r = await fetch(`${URL_}/rest/v1/${table}?select=*${query}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Accept-Profile': 'portfolio' },
  });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status}`);
  return r.json();
};

// A data problem must never block a deploy: keep the static SEO files and move on.
let profile, projects, experiences;
try {
  [profile, projects, experiences] = await Promise.all([
    get('profiles', '&limit=1').then(r => r[0] || {}),
    get('projects'),
    get('experiences', '&order=start_date.desc'),
  ]);
  if (!projects.length) throw new Error('no projects returned');
} catch (e) {
  console.warn(`[seo-build] skipped (${e.message}): static SEO files kept.`);
  process.exit(0);
}

const pick = (o, f, lang) => [o[`${f}_${lang}`], o[`${f}_fr`], o[f]].find(v => typeof v === 'string' && v.trim()) || '';
const pickArr = (o, f, lang) => [o[`${f}_${lang}`], o[`${f}_fr`], o[f]].find(v => Array.isArray(v) && v.length) || [];
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = u => (u && /^https?:\/\//.test(u) ? u : `${SITE}/og-image.png`);

const L = {
  fr: { prefix: '', locale: 'fr_FR', projects: 'Projets', exp: 'Expériences', stack: 'Stack', ctx: 'Contexte', choices: 'Choix techniques', challenges: 'Défis', results: 'Résultats', back: 'Tous les projets', news: 'Actualités', present: 'Présent', home: 'Accueil',
    title: 'Assami Baga — Ingénieur Full Stack & IA | Île-de-France', fallbackRole: 'Ingénieur Full Stack & IA' },
  en: { prefix: '/en', locale: 'en_US', projects: 'Projects', exp: 'Experience', stack: 'Stack', ctx: 'Context', choices: 'Technical choices', challenges: 'Challenges', results: 'Results', back: 'All projects', news: 'News', present: 'Present', home: 'Home',
    title: 'Assami Baga — Full Stack & AI Engineer | Île-de-France', fallbackRole: 'Full Stack & AI Engineer' },
};
// '' -> home. FR home has no trailing slash, as in index.html.
const urlOf = (lang, p) => (lang === 'fr' ? SITE + p : `${SITE}/en${p || '/'}`);
const prodProjects = projects.filter(p => p.slug);

const tplRaw = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (!tplRaw.includes('<div id="root">')) throw new Error('[seo-build] unexpected dist/index.html');

const setTag = (html, re, tag) => {
  if (!re.test(html)) throw new Error(`[seo-build] tag not found in template: ${re}`);
  return html.replace(re, tag);
};
const meta = (attr, name) => new RegExp(`<meta ${attr}="${name}"[^>]*>`);

function render({ lang, p, title, desc, body, graph, image, type = 'website' }) {
  const url = urlOf(lang, p), frU = urlOf('fr', p), enU = urlOf('en', p);
  let h = tplRaw;
  h = h.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
  h = setTag(h, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  h = setTag(h, meta('name', 'description'), `<meta name="description" content="${esc(desc)}" />`);
  h = setTag(h, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  h = setTag(h, /<link rel="alternate" hreflang="fr"[^>]*>/,
    `<link rel="alternate" hreflang="fr" href="${frU}" />\n    <link rel="alternate" hreflang="en" href="${enU}" />\n    <link rel="alternate" hreflang="x-default" href="${frU}" />`);
  h = h.replace(/<meta http-equiv="content-language"[^>]*>/, `<meta http-equiv="content-language" content="${lang}" />`);
  h = setTag(h, meta('property', 'og:title'), `<meta property="og:title" content="${esc(title)}" />`);
  h = setTag(h, meta('property', 'og:description'), `<meta property="og:description" content="${esc(desc)}" />`);
  h = setTag(h, meta('property', 'og:url'), `<meta property="og:url" content="${url}" />`);
  h = setTag(h, meta('property', 'og:type'), `<meta property="og:type" content="${type}" />`);
  h = setTag(h, meta('property', 'og:locale'), `<meta property="og:locale" content="${L[lang].locale}" />`);
  h = setTag(h, meta('property', 'og:image'), `<meta property="og:image" content="${image || `${SITE}/og-image.png`}" />`);
  h = setTag(h, meta('name', 'twitter:title'), `<meta name="twitter:title" content="${esc(title)}" />`);
  h = setTag(h, meta('name', 'twitter:description'), `<meta name="twitter:description" content="${esc(desc)}" />`);
  h = setTag(h, meta('name', 'twitter:image'), `<meta name="twitter:image" content="${image || `${SITE}/og-image.png`}" />`);
  h = setTag(h, /<div id="root">[\s\S]*?<\/main>\s*<\/div>/, `<div id="root">${body}</div>`);
  h = setTag(h, /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>`);
  return h;
}

const wrap = inner => `<main style="max-width:720px;margin:0 auto;padding:96px 24px;font-family:system-ui,sans-serif;color:#e6e8eb;line-height:1.6">${inner}</main>`;
const a = (href, text) => `<a href="${href}" style="color:#E08A3E">${esc(text)}</a>`;

// Person + WebSite nodes come from the template; parse them once to reuse.
const tplGraph = JSON.parse(tplRaw.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const personNode = tplGraph['@graph'].find(n => n['@type'] === 'Person');

function homePage(lang) {
  const l = L[lang];
  const role = pick(profile, 'title', lang) || l.fallbackRole;
  const bio = pick(profile, 'bio_short', lang) || pick(profile, 'bio', lang);
  const bioFull = pick(profile, 'bio_full', lang);
  const desc = (bio || `${role} — ${profile.location || 'Île-de-France'}`).slice(0, 155);
  const list = prodProjects.map(p => `<li>${a(urlOf(lang, `/projects/${p.slug}`), pick(p, 'title', lang))} — ${esc(pick(p, 'description', lang))}</li>`).join('\n');
  const exps = experiences.map(e => `<li><strong>${esc(pick(e, 'title', lang))}</strong> — ${esc(pick(e, 'organization', lang))} (${esc(e.start_date)} – ${esc(e.end_date || l.present)})<br/>${esc(pick(e, 'description', lang))}</li>`).join('\n');
  const body = wrap(`<h1>Assami Baga — ${esc(role)}</h1><p>${esc(bio)}</p>${bioFull ? `<p>${esc(bioFull)}</p>` : ''}
<h2>${l.projects}</h2><ul>${list}</ul>
<h2>${l.exp}</h2><ul>${exps}</ul>
<p>${a(urlOf(lang, '/news'), l.news)} · ${a(profile.github_url || GITHUB, 'GitHub')} · ${a(profile.linkedin_url || LINKEDIN, 'LinkedIn')}</p>`);
  const person = { ...personNode, jobTitle: role, ...(bio && { description: bio }), url: SITE };
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      ...tplGraph['@graph'].filter(n => n['@type'] === 'WebSite'),
      {
        '@type': 'ProfilePage', '@id': `${urlOf(lang, '')}#profile`, url: urlOf(lang, ''), inLanguage: lang,
        name: l.title, dateModified: new Date().toISOString(), mainEntity: { '@id': personNode['@id'] },
      },
    ],
  };
  return render({ lang, p: '', title: l.title, desc, body, graph });
}

function projectPage(lang, pr) {
  const l = L[lang];
  const title = pick(pr, 'title', lang), desc = pick(pr, 'description', lang);
  const p = `/projects/${pr.slug}`;
  const choices = pickArr(pr, 'technical_choices', lang), chal = pickArr(pr, 'challenges', lang), res = pickArr(pr, 'results', lang);
  const ctx = pick(pr, 'context', lang);
  const body = wrap(`<p>${a(urlOf(lang, ''), l.home)} › ${a(urlOf(lang, '') + (lang === 'fr' ? '/#projects' : '#projects'), l.projects)}</p>
<h1>${esc(title)}</h1><p>${esc(desc)}</p>
${pr.stack?.length ? `<p><strong>${l.stack}:</strong> ${esc(pr.stack.join(', '))}</p>` : ''}
${ctx ? `<h2>${l.ctx}</h2><p>${esc(ctx)}</p>` : ''}
${choices.length ? `<h2>${l.choices}</h2><ul>${choices.map(c => `<li><strong>${esc(c.choice)}</strong> — ${esc(c.reason)}</li>`).join('')}</ul>` : ''}
${chal.length ? `<h2>${l.challenges}</h2><ul>${chal.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
${res.length ? `<h2>${l.results}</h2><ul>${res.map(r => `<li>${esc(r.metric)}: ${esc(r.value)}</li>`).join('')}</ul>` : ''}
${pr.github_url ? `<p>${a(pr.github_url, 'GitHub')}</p>` : ''}`);
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareSourceCode', name: title, description: desc, url: urlOf(lang, p), inLanguage: lang,
        author: { '@id': personNode['@id'] }, programmingLanguage: pr.stack || [],
        ...(pr.github_url && { codeRepository: pr.github_url }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: l.home, item: urlOf(lang, '') },
          { '@type': 'ListItem', position: 2, name: title, item: urlOf(lang, p) },
        ],
      },
      personNode,
    ],
  };
  return render({ lang, p, title: `${title} | Assami Baga`, desc: desc.slice(0, 155), body, graph, image: abs(pr.cover_image), type: 'article' });
}

const written = [];
const write = (rel, content) => {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
  // nginx uses gzip_static: refresh the precompressed copies so they never go stale
  fs.writeFileSync(f + '.gz', zlib.gzipSync(content, { level: 9 }));
  fs.writeFileSync(f + '.br', zlib.brotliCompressSync(Buffer.from(content)));
  written.push(rel);
};

for (const lang of ['fr', 'en']) {
  write(lang === 'fr' ? 'index.html' : 'en/index.html', homePage(lang));
  for (const pr of prodProjects) write(`${L[lang].prefix.slice(1)}${L[lang].prefix ? '/' : ''}projects/${pr.slug}/index.html`, projectPage(lang, pr));
}

// sitemap with hreflang alternates
const today = new Date().toISOString().slice(0, 10);
const entry = (p, freq, prio) => `  <url>
    <loc>${urlOf('fr', p)}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${urlOf('fr', p)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${urlOf('en', p)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlOf('fr', p)}"/>
    <lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority>
  </url>
  <url>
    <loc>${urlOf('en', p)}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${urlOf('fr', p)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${urlOf('en', p)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlOf('fr', p)}"/>
    <lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority>
  </url>`;
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[entry('', 'weekly', '1.0'), entry('/news', 'daily', '0.6'), ...prodProjects.map(p => entry(`/projects/${p.slug}`, 'monthly', '0.8'))].join('\n')}
</urlset>
`);

// llms.txt (index) and llms-full.txt (content), French first then English
const role = lang => pick(profile, 'title', lang) || L[lang].fallbackRole;
write('llms.txt', `# Assami Baga

> ${role('en')} based in Île-de-France, open to full-time roles. / ${role('fr')} basé en Île-de-France, disponible pour un CDI. Full content: ${SITE}/llms-full.txt

## Links
- [Portfolio (FR)](${SITE}/) · [Portfolio (EN)](${SITE}/en/)
- [GitHub](${profile.github_url || GITHUB})
- [LinkedIn](${profile.linkedin_url || LINKEDIN})

## Projects
${prodProjects.map(p => `- [${pick(p, 'title', 'fr')}](${urlOf('fr', `/projects/${p.slug}`)}) · [EN](${urlOf('en', `/projects/${p.slug}`)}): ${pick(p, 'description', 'en').slice(0, 140)}`).join('\n')}
`);
const full = lang => `# Assami Baga — ${role(lang)} [${lang}]

${pick(profile, 'bio_short', lang)}

${pick(profile, 'bio_full', lang)}

## ${L[lang].exp}
${experiences.map(e => `- ${pick(e, 'title', lang)} — ${pick(e, 'organization', lang)} (${e.start_date} – ${e.end_date || L[lang].present}): ${pick(e, 'description', lang)}`).join('\n')}

## ${L[lang].projects}
${prodProjects.map(p => `### ${pick(p, 'title', lang)}
${urlOf(lang, `/projects/${p.slug}`)}
${pick(p, 'description', lang)}
${p.stack?.length ? `${L[lang].stack}: ${p.stack.join(', ')}\n` : ''}${pick(p, 'context', lang)}`).join('\n\n')}
`;
write('llms-full.txt', `${full('fr')}\n\n---\n\n${full('en')}`);

console.log(`[seo-build] ${written.length} files written (${prodProjects.length} projects x 2 languages).`);
