import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fbkgvmynpiprderzbuld.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZia2d2bXlucGlwcmRlcnpidWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4Mzk2MDAsImV4cCI6MjA1ODQxNTYwMH0.AR2R5f-VFxE0RwHZDQyUuVB3hmcSZBPu8AxkxC1beg0'
)

export default function DashboardEleve() {
  const [prenom, setPrenom] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single()

        if (profile) {
          setPrenom(profile.first_name)
        }
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Bienvenue, {prenom}!</h2>
      <p className="text-lg">Vous êtes connecté en tant qu'élève.</p>
    </div>
  )
}
