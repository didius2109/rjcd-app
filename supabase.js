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
