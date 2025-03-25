import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

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
          setMessage("Profil non trouvé. Vérifie la table 'profiles' pour l'ID suivant :")
          return
        }

        setPrenom(profile.first_name)
        setMessage('')

        // Charger les séances associées au tuteur
        const { data: seanceData, error: seanceError } = await supabase
          .from('seances')
          .select('*')
          .eq('tuteur_id', user.id)
          .order('date', { ascending: true })

        if (seanceError) {
          setMessage("Erreur lors du chargement des séances : " + seanceError.message)
        } else {
          setSeances(seanceData)
        }
      }
    }
    fetchUserAndSeances()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {prenom ? `Bienvenue, ${prenom}!` : message}
      </h2>
      <p className="text-lg mb-6">Voici votre horaire de tutorat :</p>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Élève</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Heure</th>
            <th className="border p-2">Durée</th>
            <th className="border p-2">Lien</th>
          </tr>
        </thead>
        <tbody>
          {seances.length > 0 ? (
            seances.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.eleve_nom}</td>
                <td className="p-2">{new Date(s.date).toLocaleDateString()}</td>
                <td className="p-2">{s.heure}</td>
                <td className="p-2">{s.duree} min</td>
                <td className="p-2">
                  <a
                    href={s.lien_lessonspace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Accéder
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                Aucune séance prévue.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
