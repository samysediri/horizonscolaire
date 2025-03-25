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
  const [form, setForm] = useState({ eleve_nom: '', date: '', heure: '', duree: '', lien_lessonspace: '' })
  const [formError, setFormError] = useState('')

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!userId) return

    const { error } = await supabase.from('seances').insert([
      {
        ...form,
        duree: parseInt(form.duree),
        tuteur_id: userId
      }
    ])

    if (error) {
      setFormError('Erreur : ' + error.message)
    } else {
      setFormError('')
      alert('Séance ajoutée!')
      setForm({ eleve_nom: '', date: '', heure: '', duree: '', lien_lessonspace: '' })
      location.reload()
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {prenom ? `Bienvenue, ${prenom}!` : message}
      </h2>
      <p className="text-lg mb-6">Voici votre horaire de tutorat :</p>

      {formError && <div className="mb-4 text-red-600 font-semibold">{formError}</div>}

      <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <input name="eleve_nom" value={form.eleve_nom} onChange={handleChange} placeholder="Nom de l'élève" required className="p-2 border rounded" />
          <input name="date" type="date" value={form.date} onChange={handleChange} required className="p-2 border rounded" />
          <input name="heure" value={form.heure} onChange={handleChange} placeholder="Heure (ex: 16:00)" required className="p-2 border rounded" />
          <input name="duree" value={form.duree} onChange={handleChange} placeholder="Durée (en minutes)" required className="p-2 border rounded" />
          <input name="lien_lessonspace" value={form.lien_lessonspace} onChange={handleChange} placeholder="Lien Lessonspace" required className="p-2 border rounded col-span-2" />
        </div>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Ajouter la séance</button>
      </form>

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
