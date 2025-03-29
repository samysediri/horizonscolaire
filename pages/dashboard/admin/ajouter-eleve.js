'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AjouterEleve() {
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email_eleve: '',
    parent_email: '',
    telephone_parent: '',
    date_naissance: '',
    besoins: '',
    lien_lessonspace: '',
    tuteur_id: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()
      if (error || !user) return
      setForm((prev) => ({ ...prev, tuteur_id: user.id }))
    }
    fetchUser()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('eleves').insert([form])
    if (error) {
      console.error(error)
      setMessage("Erreur : " + error.message)
    } else {
      setMessage('Élève ajouté avec succès!')
      setForm({
        prenom: '',
        nom: '',
        email_eleve: '',
        parent_email: '',
        telephone_parent: '',
        date_naissance: '',
        besoins: '',
        lien_lessonspace: '',
        tuteur_id: form.tuteur_id
      })
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ajouter un élève</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="prenom" placeholder="Prénom" className="w-full p-2 border rounded" value={form.prenom} onChange={handleChange} required />
        <input name="nom" placeholder="Nom" className="w-full p-2 border rounded" value={form.nom} onChange={handleChange} required />
        <input name="email_eleve" type="email" placeholder="Courriel de l'élève" className="w-full p-2 border rounded" value={form.email_eleve} onChange={handleChange} required />
        <input name="parent_email" type="email" placeholder="Courriel du parent" className="w-full p-2 border rounded" value={form.parent_email} onChange={handleChange} required />
        <input name="telephone_parent" placeholder="Téléphone du parent" className="w-full p-2 border rounded" value={form.telephone_parent} onChange={handleChange} required />
        <input name="date_naissance" type="date" className="w-full p-2 border rounded" value={form.date_naissance} onChange={handleChange} required />
        <textarea name="besoins" placeholder="Besoins spécifiques" className="w-full p-2 border rounded" value={form.besoins} onChange={handleChange} />
        <input name="lien_lessonspace" placeholder="Lien Lessonspace" className="w-full p-2 border rounded" value={form.lien_lessonspace} onChange={handleChange} />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Ajouter</button>
      </form>
      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  )
}
