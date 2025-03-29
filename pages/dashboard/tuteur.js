'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import addDays from 'date-fns/addDays'
import fr from 'date-fns/locale/fr'
import Link from 'next/link'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'fr': fr }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

export default function DashboardTuteur() {
  const [prenom, setPrenom] = useState('')
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('Chargement en cours...')
  const [seances, setSeances] = useState([])
  const [selectedSeance, setSelectedSeance] = useState(null)
  const [newSeance, setNewSeance] = useState({ eleve_nom: '', date: '', heure: '', duree: '', lien_lessonspace: '', recurrence: 1, parent_email: '' })

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

        const { data: seanceData, error: seanceError } = await supabase
          .from('seances')
          .select('*')
          .eq('tuteur_id', user.id)

        if (seanceError) {
          setMessage("Erreur lors du chargement des séances : " + seanceError.message)
        } else {
          const updatedSeances = await Promise.all(
            seanceData.map(async (s) => {
              if (!s.lien_revoir && s.lien_lessonspace) {
                const spaceId = s.lien_lessonspace.split('/').pop().split('?')[0]
                try {
                  const response = await fetch(`/api/enregistrement?spaceId=${spaceId}`)
                  const json = await response.json()

                  if (!json.recording_url) {
                    return s
                  }

                  const { error } = await supabase
                    .from('seances')
                    .update({ lien_revoir: json.recording_url })
                    .eq('id', s.id)

                  if (!error) {
                    return { ...s, lien_revoir: json.recording_url }
                  }
                } catch (error) {
                  console.error("Erreur lors de la récupération de l'enregistrement:", error)
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
  }, [])

  const handleDelete = async (seanceId) => {
    if (!confirm("Es-tu sûr de vouloir supprimer cette séance?")) return
    const { error } = await supabase.from('seances').delete().eq('id', seanceId)
    if (error) {
      alert("Erreur lors de la suppression.")
    } else {
      setSeances(prev => prev.filter(s => s.id !== seanceId))
      setSelectedSeance(null)
    }
  }

  const handleAddSeance = async () => {
    const { eleve_nom, date, heure, duree, lien_lessonspace, recurrence, parent_email } = newSeance
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
      parent_email,
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

  const events = useMemo(() => seances.map(s => ({
    id: s.id,
    title: `${s.eleve_nom}`,
    start: new Date(`${s.date}T${s.heure}`),
    end: new Date(new Date(`${s.date}T${s.heure}`).getTime() + s.duree * 60000),
    resource: s
  })), [seances])

  const handleSelectEvent = (event) => {
    setSelectedSeance(event.resource)
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{prenom ? `Bienvenue, ${prenom}!` : message}</h2>

      <div className="mb-6 flex gap-6">
        <Link href="/dashboard/tuteur" className="text-blue-600 hover:underline">Horaire</Link>
        <Link href="/dashboard/heures" className="text-blue-600 hover:underline">Heures complétées</Link>
      </div>

      <div className="mb-6 grid grid-cols-7 gap-2">
        <input type="text" placeholder="Élève" className="border rounded p-2 col-span-1" onChange={e => setNewSeance({ ...newSeance, eleve_nom: e.target.value })} />
        <input type="date" className="border rounded p-2 col-span-1" onChange={e => setNewSeance({ ...newSeance, date: e.target.value })} />
        <input type="time" className="border rounded p-2 col-span-1" onChange={e => setNewSeance({ ...newSeance, heure: e.target.value })} />
        <input type="number" placeholder="Durée" className="border rounded p-2 col-span-1" onChange={e => setNewSeance({ ...newSeance, duree: e.target.value })} />
        <input type="text" placeholder="Lien Lessonspace" className="border rounded p-2 col-span-1" onChange={e => setNewSeance({ ...newSeance, lien_lessonspace: e.target.value })} />
        <input type="number" placeholder="# de semaines" className="border rounded p-2 col-span-1" onChange={e => setNewSeance({ ...newSeance, recurrence: parseInt(e.target.value) })} />
        <input type="email" placeholder="Courriel parent" className="border rounded p-2 col-span-1" onChange={e => setNewSeance({ ...newSeance, parent_email: e.target.value })} />
      </div>
      <button onClick={handleAddSeance} className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Ajouter les séances</button>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleSelectEvent}
        views={['week', 'day']}
        defaultView="week"
      />

      {selectedSeance && (
        <div className="fixed bottom-6 right-6 bg-white shadow-xl border rounded-lg p-4 max-w-xs w-full z-50">
          <h4 className="font-semibold mb-2">{selectedSeance.eleve_nom}</h4>
          <div className="flex flex-col gap-2">
            <button onClick={() => window.open(selectedSeance.lien_lessonspace, '_blank')} className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">Accéder</button>
            <button onClick={() => {
              const duree = prompt("Durée réelle en minutes?")
              if (!duree) return
              supabase.from('seances').update({ duree_reelle: parseInt(duree) }).eq('id', selectedSeance.id).then(({ error }) => {
                if (error) alert("Erreur lors de la mise à jour.")
                else alert("Séance complétée!")
              })
            }} className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600">Compléter</button>
            {selectedSeance.lien_revoir && (
              <button onClick={() => window.open(selectedSeance.lien_revoir, '_blank')} className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600">Revoir</button>
            )}
            <button onClick={() => handleDelete(selectedSeance.id)} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Supprimer</button>
            <button onClick={() => setSelectedSeance(null)} className="text-gray-500 hover:underline mt-2 text-sm">Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}
