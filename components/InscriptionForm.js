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
  const [role, setRole] = useState('tuteur')
  const [message, setMessage] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setMessage('Inscription en cours...')

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError) {
      setMessage(`Erreur : ${signUpError.message}`)
      return
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage("Erreur lors de la récupération de l'utilisateur.")
      return
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      role: role
    })

    if (insertError) {
      setMessage(`Erreur lors de l’insertion du profil : ${insertError.message}`)
      return
    }

    setMessage('Inscription réussie! 🎉')
  }

  return (
    <form onSubmit={handleSignup} className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Créer un compte</h2>
      <input
        type="text"
        placeholder="Prénom"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Nom de famille"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="email"
        placeholder="Adresse courriel"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block w-full mb-4 p-2 border rounded"
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="block w-full mb-4 p-2 border rounded"
      >
        <option value="tuteur">Tuteur</option>
        <option value="eleve">Élève</option>
        <option value="parent">Parent</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        S'inscrire
      </button>
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </form>
  )
}
