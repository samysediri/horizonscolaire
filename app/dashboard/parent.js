// Fichier : /pages/dashboard/parent.js ou /pages/dashboard/eleve.js
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

export default function DashboardParentOuEleve() {
  const [prenom, setPrenom] = useState('')
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('')
  const [seances, setSeances] = useState([])
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (profile) {
        setPrenom(profile.first_name)
        setRole(profile.role)

        const { data: seanceData } = await supabase
          .from('seances')
          .select('*')
          .gte('date', format(currentWeekStart, 'yyyy-MM-dd'))
          .lte('date', format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd'))

        const filteredSeances = seanceData.filter(s =>
          (profile.role === 'parent' && s.parent_email === user.email) ||
          (profile.role === 'eleve' && s.eleve_nom.toLowerCase().includes(profile.first_name.toLowerCase()))
        )

        setSeances(filteredSeances)
      }
    }
    fetchUser()
  }, [currentWeekStart])

  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7))
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Bienvenue, {prenom}</h2>
      <div className="flex justify-between mb-4">
        <button onClick={prevWeek} className="px-4 py-2 bg-gray-200 rounded">← Semaine précédente</button>
        <p className="text-lg">Semaine du {format(currentWeekStart, 'dd MMM yyyy')}</p>
        <button onClick={nextWeek} className="px-4 py-2 bg-gray-200 rounded">Semaine suivante →</button>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)).map(day => (
          <div key={day} className="bg-white shadow p-3 rounded">
            <h4 className="text-center font-semibold border-b mb-2 pb-1">{format(day, 'EEEE dd')}</h4>
            {seances.filter(s => s.date === format(day, 'yyyy-MM-dd')).map((s, idx) => (
              <div key={idx} className="border border-gray-300 p-2 rounded mb-2">
                <p className="font-medium">{s.eleve_nom}</p>
                <p className="text-sm text-gray-600">{s.heure} • {s.duree} min</p>
                <a href={s.lien_lessonspace} target="_blank" className="text-blue-600 text-sm hover:underline">Accéder</a>
                {s.lien_revoir && <a href={s.lien_revoir} target="_blank" className="text-purple-600 text-sm hover:underline block mt-1">Revoir</a>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
