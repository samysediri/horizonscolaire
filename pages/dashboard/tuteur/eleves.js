'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ElevesTuteur() {
  const [eleves, setEleves] = useState([])
  const [prenom, setPrenom] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) return

      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (profile) setPrenom(profile.first_name)

      const { data: eleveData, error: eleveError } = await supabase
        .from('eleves')
        .select('*')
        .eq('tuteur_id', user.id)

      if (!eleveError && eleveData) setEleves(eleveData)
    }

    fetchData()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Mes élèves</h2>
      <ul className="space-y-4">
        {eleves.map((eleve) => (
          <li key={eleve.id} className="border p-4 rounded hover:bg-gray-50">
            <Link href={`/dashboard/tuteur/eleves/${eleve.id}`} className="text-blue-600 text-lg font-semibold hover:underline">
              {eleve.prenom} {eleve.nom}
            </Link>
            <p className="text-sm text-gray-600">Parent : {eleve.parent_email}</p>
          </li>
        ))}
        {eleves.length === 0 && <p className="text-gray-500">Aucun élève trouvé.</p>}
      </ul>
    </div>
  )
}
