// RJCD App – Supabase Verbindung
const SUPABASE_URL = 'https://grxpfsrctfhtamwrqooz.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeHBmc3JjdGZodGFtd3Jxb296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MjExMTUsImV4cCI6MjA5NTQ5NzExNX0.gNADsG6yxVv8T3_Vni7DrOrLoMBQbu57zhy5f8pALbI'

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
}

async function sbGet(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`Fehler beim Laden von ${table}: ${res.status}`)
  return res.json()
}

async function sbPost(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Fehler beim Speichern in ${table}: ${res.status}`)
  return res.json()
}

async function sbPatch(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Fehler beim Aktualisieren in ${table}: ${res.status}`)
  return res.json()
}

async function sbDelete(table, id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS
  })
  if (!res.ok) throw new Error(`Fehler beim Löschen in ${table}: ${res.status}`)
  return true
}

// Löschen nach beliebigem Filter (z.B. auftrag_id=eq.xyz)
async function sbDeleteWhere(table, filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'DELETE',
    headers: HEADERS
  })
  // 404 ist ok — bedeutet nichts zu löschen
  if (!res.ok && res.status !== 404) {
    throw new Error(`Fehler beim Löschen in ${table}: ${res.status}`)
  }
  return true
}

// ── DESIGN EINSTELLUNGEN ──────────────────────────────────────
async function ladeDesign() {
  try {
    const rows = await sbGet('app_einstellungen', 'select=schluessel,wert')
    const d = {}
    rows.forEach(r => d[r.schluessel] = r.wert)
    return d
  } catch(e) {
    console.log('Design laden:', e)
    return {}
  }
}

async function speichereDesign(schluessel, wert) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_einstellungen?schluessel=eq.${schluessel}`, {
      method: 'PATCH',
      headers: { ...HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify({ wert, aktualisiert: new Date().toISOString() })
    })
    if(!res.ok) throw new Error(await res.text())
    return true
  } catch(e) {
    console.log('Design speichern:', e)
    return false
  }
}

async function wendeDesignAn(d) {
  if(!d) return

  // Firmenname
  const nameEls = document.querySelectorAll('.app-firmenname')
  nameEls.forEach(el => el.textContent = d.firmenname || 'RJCD Gebäudereinigung')

  // Akzentfarbe als CSS-Variable setzen
  if(d.farbe) {
    document.documentElement.style.setProperty('--accent', d.farbe)
    document.documentElement.style.setProperty('--accent-bg', d.farbe_bg || '#E6F1FB')
  }

  // Logo
  const logoEls = document.querySelectorAll('.app-logo')
  logoEls.forEach(el => {
    if(d.logo) {
      el.innerHTML = `<img src="${d.logo}" style="height:24px;object-fit:contain;vertical-align:middle;margin-right:6px" alt="Logo">${d.firmenname||'RJCD'}`
    } else {
      el.textContent = `${d.emoji||'🏢'} ${d.firmenname||'RJCD Gebäudereinigung'}`
    }
  })

  // Schriftart
  const fonts = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    inter:  '"Inter", sans-serif',
    roboto: '"Roboto", sans-serif',
  }
  if(d.schrift && fonts[d.schrift]) {
    document.documentElement.style.setProperty('--font-custom', fonts[d.schrift])
    document.body.style.fontFamily = fonts[d.schrift]
  }

  // Modus
  if(d.modus === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else if(d.modus === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else if(d.modus === 'contrast') {
    document.documentElement.setAttribute('data-theme', 'contrast')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}
