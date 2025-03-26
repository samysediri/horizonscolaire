'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

const LESSONSPACE_API_KEY = 'cdee0709-2ffe-4758-a0b9-25f92f91c0a7'
const LESSONSPACE_API_URL = 'https://api.thelessonspace.com/v2/recordings/'

export default function DashboardTuteur() {
  const [prenom, setPrenom] = useState('')
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('Chargement en cours...')
  const [seances, setSeances] = useState([])
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [newSeance, setNewSeance] = useState({ eleve_nom: '', date: '', heure: '', duree: '', lien_lessonspace: '', recurrence: 1 })

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
          setMessage("Profil non trouvé. Vérifie la table 'profiles' pour l'ID suivant :")
          return
        }

        setPrenom(profile.first_name)
        setMessage('')

        const weekStart = format(currentWeekStart, 'yyyy-MM-dd')
        const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')

        const { data: seanceData, error: seanceError } = await supabase
          .from('seances')
          .select('*')
          .eq('tuteur_id', user.id)
          .gte('date', weekStart)
          .lte('date', weekEnd)
          .order('date', { ascending: true })

        if (seanceError) {
          setMessage("Erreur lors du chargement des séances : " + seanceError.message)
        } else {
          const updatedSeances = await Promise.all(
            seanceData.map(async (s) => {
              if (!s.lien_revoir && s.lien_lessonspace) {
                const spaceId = s.lien_lessonspace.split('/').pop().split('?')[0]
                try {
                  const response = await fetch(`${LESSONSPACE_API_URL}${spaceId}`, {
                    headers: {
                      Authorization: `Bearer ${LESSONSPACE_API_KEY}`
                    }
                  })
                  const json = await response.json()
                  const lienRevoir = json.recording_url || null

                  if (lienRevoir) {
                    const { error } = await supabase
                      .from('seances')
                      .update({ lien_revoir: lienRevoir })
                      .eq('id', s.id)

                    if (!error) {
                      return { ...s, lien_revoir: lienRevoir }
                    }
                  }
                } catch (error) {
                  console.error('Erreur lors de la récupération de l’enregistrement :', error)
                }
              }
              return s
            })
          )

          setSeances(updatedSeances)
        }
      }
    }
    fetchUserAndSeances()
  }, [currentWeekStart])

  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7))
  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7))

  const handleCompleter = async (seanceId) => {
    const duree = prompt("Entrez la durée réelle de la séance (en minutes) :")
    if (!duree) return

    const { error } = await supabase
      .from('seances')
      .update({ duree_reelle: parseInt(duree) })
      .eq('id', seanceId)

    if (error) {
      alert("Erreur lors de la mise à jour de la séance")
    } else {
      alert("Séance complétée avec succès!")
      window.location.reload()
    }
  }

  const handleAddSeance = async () => {
    const { eleve_nom, date, heure, duree, lien_lessonspace, recurrence } = newSeance
    if (!eleve_nom || !date || !heure || !duree || recurrence < 1) {
      alert("Veuillez remplir tous les champs.")
      return
    }

    const dates = Array.from({ length: recurrence }, (_, i) =>
      format(addDays(new Date(date), 7 * i), 'yyyy-MM-dd')
    )

    const seancesToAdd = dates.map(d => ({
      eleve_nom,
      date: d,
      heure,
      duree,
      lien_lessonspace,
      tuteur_id: userId
    }))

    const { error } = await supabase.from('seances').insert(seancesToAdd)
    if (error) {
      alert("Erreur lors de la création des séances")
    } else {
      alert("Séances ajoutées!")
      window.location.reload()
    }
  }

  const renderSchedule = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevWeek} className="px-4 py-2 bg-blue-200 hover:bg-blue-300 rounded shadow">← Semaine précédente</button>
          <h3 className="text-xl font-bold">Semaine du {format(currentWeekStart, 'dd MMM yyyy')}</h3>
          <button onClick={nextWeek} className="px-4 py-2 bg-blue-200 hover:bg-blue-300 rounded shadow">Semaine suivante →</button>
        </div>
        <div className="grid grid-cols-7 gap-4 border-t pt-4">
          {days.map(day => (
            <div key={day} className="bg-white rounded-lg shadow p-3">
              <h4 className="font-semibold text-center text-sm border-b pb-2 mb-2">{format(day, 'EEEE dd')}</h4>
              {seances.filter(s => s.date === format(day, 'yyyy-MM-dd')).map((s, i) => (
                <div key={i} className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                  <p className="font-medium text-blue-800">{s.eleve_nom}</p>
                  <p className="text-sm text-gray-600">{s.heure} • {s.duree} min</p>
                  <div className="flex flex-col gap-1 mt-2">
                    <a href={s.lien_lessonspace} target="_blank" className="text-sm text-blue-600 hover:underline">Accéder</a>
                    <button onClick={() => handleCompleter(s.id)} className="text-sm text-green-600 hover:underline">Compléter</button>
                    {s.lien_revoir && <a href={s.lien_revoir} target="_blank" className="text-sm text-purple-600 hover:underline">Revoir</a>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
        {prenom ? `Bienvenue, ${prenom}!` : message}
      </h2>
      <div className="mb-8 bg-white shadow p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Ajouter une ou plusieurs séances</h3>
        <div className="grid grid-cols-6 gap-3 mb-3">
          <input type="text" placeholder="Élève" className="border rounded p-2" onChange={e => setNewSeance({ ...newSeance, eleve_nom: e.target.value })} />
          <input type="date" className="border rounded p-2" onChange={e => setNewSeance({ ...newSeance, date: e.target.value })} />
          <input type="time" className="border rounded p-2" onChange={e => setNewSeance({ ...newSeance, heure: e.target.value })} />
          <input type="number" placeholder="Durée" className="border rounded p-2" onChange={e => setNewSeance({ ...newSeance, duree: e.target.value })} />
          <input type="text" placeholder="Lien Lessonspace" className="border rounded p-2" onChange={e => setNewSeance({ ...newSeance, lien_lessonspace: e.target.value })} />
          <input type="number" placeholder="# de semaines" className="border rounded p-2" onChange={e => setNewSeance({ ...newSeance, recurrence: parseInt(e.target.value) })} />
        </div>
        <button onClick={handleAddSeance} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Ajouter les séances</button>
      </div>
      <p className="text-xl font-medium mb-4">Votre horaire hebdomadaire</p>
      {renderSchedule()}
    </div>
  )
}
