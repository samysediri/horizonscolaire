import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
      <Card>
        <CardContent className="space-y-4 p-4">
          <Input placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <Input placeholder="Nom de famille" value={lastName} onChange={e => setLastName(e.target.value)} />
          <Input placeholder="Courriel" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded">
            <option value="élève">Élève</option>
            <option value="parent">Parent</option>
            <option value="tuteur">Tuteur</option>
          </select>
          <Button onClick={handleSignup}>S'inscrire</Button>
          {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
