'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AjoutEleveAdmin() {
  const [tuteurs, setTuteurs] = useState([])
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    date_naissance: '',
    email_eleve: '',
    parent_email: '',
    telephone_parent: '',
    besoins: '',
    tuteur_id: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchTuteurs = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'tuteur')
      if (!error) setTuteurs(data)
    }
    fetchTuteurs()
  }, [])

  const handleSubmit = async () => {
    const { error } = await supabase.from('eleves').insert({
      ...form,
      date_naissance: form.date_naissance ? new Date(form.date_naissance).toISOString() : null
    })

    if (error) setMessage('Erreur: ' + error.message)
    else {
      setMessage('Élève ajouté avec succès!')
      setForm({ prenom: '', nom: '', date_naissance: '', email_eleve: '', parent_email: '', telephone_parent: '', besoins: '', tuteur_id: '' })
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ajouter un élève</h2>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      <div className="grid grid-cols-1 gap-4 mb-6">
        <select className="border p-2 rounded" value={form.tuteur_id} onChange={e => setForm({ ...form, tuteur_id: e.target.value })}>
          <option value="">Sélectionner un tuteur</option>
          {tuteurs.map(t => (
            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
          ))}
        </select>

        <input type="text" placeholder="Prénom de l'élève" className="border p-2 rounded" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
        <input type="text" placeholder="Nom de l'élève" className="border p-2 rounded" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
        <input type="date" placeholder="Date de naissance" className="border p-2 rounded" value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} />
        <input type="email" placeholder="Courriel de l'élève" className="border p-2 rounded" value={form.email_eleve} onChange={e => setForm({ ...form, email_eleve: e.target.value })} />
        <input type="email" placeholder="Courriel du parent" className="border p-2 rounded" value={form.parent_email} onChange={e => setForm({ ...form, parent_email: e.target.value })} />
        <input type="tel" placeholder="Téléphone du parent" className="border p-2 rounded" value={form.telephone_parent} onChange={e => setForm({ ...form, telephone_parent: e.target.value })} />
        <textarea placeholder="Besoins spécifiques" className="border p-2 rounded" rows={3} value={form.besoins} onChange={e => setForm({ ...form, besoins: e.target.value })}></textarea>
      </div>

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ajouter l'élève</button>
    </div>
  )
}
