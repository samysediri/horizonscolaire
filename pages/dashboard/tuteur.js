'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import addDays from 'date-fns/addDays'
import endOfWeek from 'date-fns/endOfWeek'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

const localizer = momentLocalizer({ format, parse, startOfWeek, getDay })

export default function DashboardTuteur() {
  const [prenom, setPrenom] = useState('')
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('Chargement en cours...')
  const [seances, setSeances] = useState([])

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
          setSeances(seanceData)
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
    }
  }

  const events = useMemo(() => seances.map(s => ({
    id: s.id,
    title: `${s.eleve_nom} (${s.duree} min)`,
    start: new Date(`${s.date}T${s.heure}`),
    end: new Date(new Date(`${s.date}T${s.heure}`).getTime() + s.duree * 60000),
    resource: s
  })), [seances])

  const handleSelectEvent = (event) => {
    const seance = event.resource
    const action = prompt(`Action pour ${seance.eleve_nom} ? (compléter / supprimer)`).toLowerCase()

    if (action === 'compléter') {
      const duree = prompt("Durée réelle en minutes?")
      if (!duree) return
      supabase.from('seances').update({ duree_reelle: parseInt(duree) }).eq('id', seance.id)
        .then(({ error }) => {
          if (error) alert("Erreur lors de la mise à jour.")
          else alert("Séance complétée!")
        })
    } else if (action === 'supprimer') {
      handleDelete(seance.id)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{prenom ? `Bienvenue, ${prenom}!` : message}</h2>
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
    </div>
  )
}
