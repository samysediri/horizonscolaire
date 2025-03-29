'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminSeances() {
  const [seances, setSeances] = useState([])
  const [message, setMessage] = useState('Chargement...')

  useEffect(() => {
    const fetchSeances = async () => {
      const { data, error } = await supabase.from('seances').select('*').order('date', { ascending: false })
      if (error) {
        setMessage("Erreur : " + error.message)
      } else {
        setSeances(data)
        setMessage('')
      }
    }
    fetchSeances()
  }, [])

  const forcerLienRevoir = async (seance) => {
    if (!seance.space_id) return alert("Pas de space_id")
    try {
      const res = await fetch(`/api/enregistrement?spaceId=${seance.space_id}`)
      const data = await res.json()
      if (data.recording_url) {
        await supabase.from('seances').update({ lien_revoir: data.recording_url }).eq('id', seance.id)
        alert("Lien revoir mis à jour!")
        location.reload()
      } else {
        alert("Aucun enregistrement trouvé")
      }
    } catch (err) {
      alert("Erreur lors de l'appel API")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Toutes les séances</h1>
      {message && <p>{message}</p>}
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Élève</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Heure</th>
            <th className="border px-2 py-1">Space ID</th>
            <th className="border px-2 py-1">Lien revoir</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {seances.map(s => (
            <tr key={s.id} className="text-sm">
              <td className="border px-2 py-1">{s.eleve_nom}</td>
              <td className="border px-2 py-1">{s.date}</td>
              <td className="border px-2 py-1">{s.heure}</td>
              <td className="border px-2 py-1 text-xs">{s.space_id || '-'}</td>
              <td className="border px-2 py-1 text-xs">
                {s.lien_revoir ? <a href={s.lien_revoir} target="_blank" className="text-blue-600 underline">Voir</a> : '—'}
              </td>
              <td className="border px-2 py-1">
                {!s.lien_revoir && s.space_id && (
                  <button onClick={() => forcerLienRevoir(s)} className="text-yellow-600 underline">Forcer Revoir</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
