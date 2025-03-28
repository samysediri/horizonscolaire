'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { fr as frLocale } from 'date-fns/locale'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

export default function HeuresCompletees() {
  const [userId, setUserId] = useState('')
  const [mois, setMois] = useState(new Date())
  const [heuresParEleve, setHeuresParEleve] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()
      if (userError) return

      setUserId(user.id)

      const debut = format(startOfMonth(mois), 'yyyy-MM-dd')
      const fin = format(endOfMonth(mois), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('seances')
        .select('eleve_nom, duree_reelle')
        .eq('tuteur_id', user.id)
        .gte('date', debut)
        .lte('date', fin)

      if (!error && data) {
        const heures = {}
        data.forEach(s => {
          if (!s.duree_reelle) return
          if (!heures[s.eleve_nom]) heures[s.eleve_nom] = 0
          heures[s.eleve_nom] += s.duree_reelle
        })
        const heuresArray = Object.entries(heures).map(([eleve, duree]) => ({ eleve, heures: (duree / 60).toFixed(2) }))
        setHeuresParEleve(heuresArray)
      }
    }
    fetchData()
  }, [mois])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Heures complétées - {format(mois, 'MMMM yyyy', { locale: frLocale })}</h2>
      <div className="flex gap-4 mb-4">
        <button onClick={() => setMois(subMonths(mois, 1))} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">← Mois précédent</button>
        <button onClick={() => setMois(addMonths(mois, 1))} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Mois suivant →</button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Élève</th>
            <th className="p-2 border">Heures complétées</th>
          </tr>
        </thead>
        <tbody>
          {heuresParEleve.map(({ eleve, heures }) => (
            <tr key={eleve} className="text-center">
              <td className="border p-2 font-medium">{eleve}</td>
              <td className="border p-2">{heures} h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
