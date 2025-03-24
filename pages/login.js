import { useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(`Erreur : ${error.message}`)
      return
    }

    const { user } = data
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

      if (profile) {
        const role = profile.role
        if (role === 'élève') router.push('/dashboard/eleve')
        else if (role === 'parent') router.push('/dashboard/parent')
        else if (role === 'tuteur') router.push('/dashboard/tuteur')
        else setMessage("Rôle inconnu. Contactez l'administrateur.")
      } else {
        setMessage("Profil introuvable.")
      }
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Connexion</h2>
      <div className="space-y-4 p-4 border rounded shadow">
        <input placeholder="Courriel" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <input placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" />
        <button onClick={handleLogin} className="w-full p-2 bg-green-600 text-white rounded">Se connecter</button>
        {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
      </div>
    </div>
  )
}
