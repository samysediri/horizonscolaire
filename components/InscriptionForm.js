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
  const [profileDebug, setProfileDebug] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      console.log('Utilisateur actuel :', user)
      if (userError) console.error('Erreur utilisateur :', userError)

      if (user) {
        setUserId(user.id)
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        console.log('Profil reçu:', profile)
        if (error) console.error('Erreur de récupération du profil :', error)

        if (error || !profile) {
          setMessage("Profil introuvable. Veuillez vérifier l'ID dans la table 'profiles'.")
        } else {
          setPrenom(profile.first_name)
          setProfileDebug(profile)
          setMessage('')
        }
      } else {
        setMessage("Utilisateur non connecté.")
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {prenom ? `Bienvenue, ${prenom}!` : message}
      </h2>
      {userId && (
        <p className="text-sm text-gray-500 mb-4">ID utilisateur : {userId}</p>
      )}
      <p className="text-lg">Vous êtes connecté en tant que tuteur.</p>

      {profileDebug && (
        <pre className="mt-4 p-2 bg-gray-100 text-sm">
          {JSON.stringify(profileDebug, null, 2)}
        </pre>
      )}
    </div>
  )
}
