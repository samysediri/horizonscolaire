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
        setMessage("Profil non trouvé.")
        return
      }

      setPrenom(profile.first_name)
      setMessage('')

      const weekStart = format(currentWeekStart, 'yyyy-MM-dd')
      const weekEnd = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd')

      const { data: seanceData, error: seanceError } = await supabase
        .from('seances')
        .select('*')
        .eq('tuteur_id', user.id)
        .gte('date', weekStart)
        .lte('date', weekEnd)
        .order('date', { ascending: true })

      if (seanceError) {
        setMessage("Erreur lors du chargement des séances : " + seanceError.message)
      } else {
        const updatedSeances = await Promise.all(
          seanceData.map(async (s) => {
            if (!s.lien_revoir && s.lien_lessonspace && s.lien_lessonspace.includes('thelessonspace.com')) {
              const spaceId = s.lien_lessonspace.split('/').pop()
              try {
                const response = await fetch(`${LESSONSPACE_API_URL}${spaceId}`, {
                  headers: {
                    Authorization: `Bearer ${LESSONSPACE_API_KEY}`
                  }
                })
                const json = await response.json()
                console.log("Réponse de Lessonspace :", json)

                if (json.recording_url) {
                  await supabase
                    .from('seances')
                    .update({ lien_revoir: json.recording_url })
                    .eq('id', s.id)
                  return { ...s, lien_revoir: json.recording_url }
                }
              } catch (error) {
                console.log("Erreur API Lessonspace :", error)
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
}, [currentWeekStart])
