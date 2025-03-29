'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { startOfMonth, endOfMonth, format, parseISO, subMonths, addMonths } from 'date-fns'
import fr from 'date-fns/locale/fr'
import Link from 'next/link'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

export default function HeuresCompletees() {
  const [prenom, setPrenom] = useState('')
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('Chargement en cours...')
  const [seances, setSeances] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const fetchUserAndSeances = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError) {
        setMessage(userError.message)
        return
      }

      if (user) {
        setUserId(user.id)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile || profileError) {
          setMessage("Profil non trouvé. Vérifie la table 'profiles'")
          return
        }

        setPrenom(profile.first_name)
        setMessage('')

        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

        const { data: seanceData, error: seanceError } = await supabase
          .from('seances')
          .select('*')
          .eq('tuteur_id', user.id)
          .gte('date', start)
          .lte('date', end)

        if (!seanceData || seanceError) {
          setMessage("Erreur lors du chargement des séances")
        } else {
          setSeances(seanceData)
        }
      }
    }

    fetchUserAndSeances()
  }, [currentMonth])

  const groupedByEleve = useMemo(() => {
    const grouped = {}
    for (const s of seances) {
      if (!s.duree_reelle) continue
      if (!grouped[s.eleve_nom]) grouped[s.eleve_nom] = 0
      grouped[s.eleve_nom] += s.duree_reelle
    }
    return grouped
  }, [seances])

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{prenom ? `Bienvenue, ${prenom}!` : message}</h2>

      <div className="mb-6 flex gap-6">
        <Link href="/dashboard/tuteur" className="text-blue-600 hover:underline">Horaire</Link>
        <Link href="/dashboard/heures" className="text-blue-600 hover:underline">Heures complétées</Link>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="bg-gray-200 px-3 py-1 rounded">← Mois précédent</button>
        <span className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="bg-gray-200 px-3 py-1 rounded">Mois suivant →</button>
      </div>

      <table className="w-full text-left border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Élève</th>
            <th className="p-2 border">Heures complétées</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByEleve).map(([eleve, minutes]) => (
            <tr key={eleve}>
              <td className="p-2 border font-medium">{eleve}</td>
              <td className="p-2 border">{(minutes / 60).toFixed(2)} h</td>
            </tr>
          ))}
          {Object.keys(groupedByEleve).length === 0 && (
            <tr>
              <td colSpan={2} className="p-4 text-center italic text-gray-500">Aucune séance complétée ce mois-ci.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
