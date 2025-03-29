// Fichier : /app/dashboard/tuteur/eleves/[id]/page.js
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { differenceInYears, parseISO } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function FicheEleve() {
  const { id } = useParams()
  const [eleve, setEleve] = useState(null)
  const [message, setMessage] = useState('Chargement...')

  useEffect(() => {
    const fetchEleve = async () => {
      const { data, error } = await supabase.from('eleves').select('*').eq('id', id).maybeSingle()
      if (error || !data) {
        setMessage("Erreur de chargement de l'élève")
      } else {
        setEleve(data)
        setMessage('')
      }
    }
    if (id) fetchEleve()
  }, [id])

  if (message) return <p className="p-6 text-center text-gray-600">{message}</p>

  const age = differenceInYears(new Date(), parseISO(eleve.date_naissance))

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Fiche de {eleve.prenom} {eleve.nom}</h2>
      <ul className="space-y-2">
        <li><strong>Courriel de l'élève:</strong> {eleve.email_eleve}</li>
        <li><strong>Courriel du parent:</strong> {eleve.parent_email}</li>
        <li><strong>Téléphone du parent:</strong> {eleve.telephone_parent}</li>
        <li><strong>Âge:</strong> {age} ans</li>
        <li><strong>Besoins spécifiques:</strong> {eleve.besoins || 'Non spécifiés'}</li>
        <li><strong>Espace Lessonspace:</strong> <a href={eleve.lien_lessonspace} className="text-blue-600 hover:underline" target="_blank">Accéder</a></li>
      </ul>
    </div>
  )
}
