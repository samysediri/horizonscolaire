import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

export default function InscriptionForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('élève')
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    setMessage('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setMessage(`Erreur: ${error.message}`)
      return
    }

    const user = data.user
    if (user) {
      await supabase.from('profiles').insert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        role: role
      })
      setMessage('Inscription réussie! 🎉')
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Créer un compte</h2>
      <div className="space-y-4 p-4 border rounded shadow">
        <input placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2 border rounded" />
        <input placeholder="Nom de famille" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2 border rounded" />
        <input placeholder="Courriel" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <input placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" />
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded">
          <option value="élève">Élève</option>
          <option value="parent">Parent</option>
          <option value="tuteur">Tuteur</option>
        </select>
        <button onClick={handleSignup} className="w-full p-2 bg-blue-600 text-white rounded">S'inscrire</button>
        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      </div>
    </div>
  )
}