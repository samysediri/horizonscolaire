'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AccueilTuteur() {
  const [prenom, setPrenom] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      if (error) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) setPrenom(profile.first_name)
    }
    fetchUser()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Bienvenue, {prenom}!</h1>
      <p className="mb-6 text-gray-700">Voici ton tableau de bord.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/tuteur/horaire" className="bg-blue-100 hover:bg-blue-200 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">📅 Horaire</h2>
          <p>Voir et gérer les séances à venir.</p>
        </Link>

        <Link href="/dashboard/tuteur/heures" className="bg-green-100 hover:bg-green-200 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">⏱️ Heures complétées</h2>
          <p>Consulter les heures complétées par élève.</p>
        </Link>

        <Link href="/dashboard/tuteur/eleves" className="bg-yellow-100 hover:bg-yellow-200 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">👦👧 Élèves</h2>
          <p>Voir ou ajouter un élève.</p>
        </Link>

        {/* Autres liens possibles à venir */}
      </div>
    </div>
  )
}
