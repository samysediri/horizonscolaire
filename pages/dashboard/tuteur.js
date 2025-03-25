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
  const [newSeance, setNewSeance] = useState({ eleve_nom: '', date: '', heure: '', duree: '', lien_lessonspace: '' })

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
                const spaceId = s.lien_lessonspace.split('/').pop()
                try {
                  const response = await fetch(`${LESSONSPACE_API_URL}${spaceId}`, {
                    headers: {
                      Authorization: `Bearer ${LESSONSPACE_API_KEY}`
                    }
                  })
                  const json = await response.json()
                  const lienRevoir = json.recording_url || null

                  if (lienRevoir) {
                    await supabase
                      .from('seances')
                      .update({ lien_revoir: lienRevoir })
                      .eq('id', s.id)
                    return { ...s, lien_revoir: lienRevoir }
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
    if (!newSeance.eleve_nom || !newSeance.date || !newSeance.heure || !newSeance.duree) {
      alert("Veuillez remplir tous les champs.")
      return
    }
    const { error } = await supabase.from('seances').insert([{ ...newSeance, tuteur_id: userId }])
    if (error) {
      alert("Erreur lors de la création de la séance")
    } else {
      alert("Séance ajoutée!")
      window.location.reload()
    }
  }

  const renderSchedule = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
    return (
      <div>
        <div className="flex justify-between mb-4">
          <button onClick={prevWeek} className="px-3 py-1 bg-gray-200 rounded">← Semaine précédente</button>
          <h3 className="text-lg font-semibold">Semaine du {format(currentWeekStart, 'dd MMM yyyy')}</h3>
          <button onClick={nextWeek} className="px-3 py-1 bg-gray-200 rounded">Semaine suivante →</button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div key={day} className="border p-2 h-64 overflow-y-auto">
              <h4 className="font-bold text-sm mb-2">{format(day, 'EEEE dd')}</h4>
              {seances.filter(s => s.date === format(day, 'yyyy-MM-dd')).map((s, i) => (
                <div key={i} className="bg-blue-100 rounded p-2 mb-2">
                  <p className="font-medium">{s.eleve_nom}</p>
                  <p>{s.heure} - {s.duree} min</p>
                  <div className="mt-1 space-x-2">
                    <a href={s.lien_lessonspace} target="_blank" className="text-blue-600 text-sm underline">Accéder</a>
                    <button onClick={() => handleCompleter(s.id)} className="text-green-600 text-sm underline">Compléter</button>
                    {s.lien_revoir && <a href={s.lien_revoir} target="_blank" className="text-purple-600 text-sm underline">Revoir</a>}
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
      <h2 className="text-2xl font-bold mb-4">
        {prenom ? `Bienvenue, ${prenom}!` : message}
      </h2>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Ajouter une séance</h3>
        <div className="grid grid-cols-5 gap-2 mb-2">
          <input type="text" placeholder="Élève" className="border p-1" onChange={e => setNewSeance({ ...newSeance, eleve_nom: e.target.value })} />
          <input type="date" className="border p-1" onChange={e => setNewSeance({ ...newSeance, date: e.target.value })} />
          <input type="time" className="border p-1" onChange={e => setNewSeance({ ...newSeance, heure: e.target.value })} />
          <input type="number" placeholder="Durée" className="border p-1" onChange={e => setNewSeance({ ...newSeance, duree: e.target.value })} />
          <input type="text" placeholder="Lien Lessonspace" className="border p-1" onChange={e => setNewSeance({ ...newSeance, lien_lessonspace: e.target.value })} />
        </div>
        <button onClick={handleAddSeance} className="bg-green-500 text-white px-3 py-1 rounded">Ajouter</button>
      </div>
      <p className="text-lg mb-6">Voici votre horaire hebdomadaire :</p>
      {renderSchedule()}
    </div>
  )
}
