export default async function handler(req, res) {
  const { spaceId } = req.query

  if (!spaceId) {
    return res.status(400).json({ error: 'spaceId manquant' })
  }

  const apiKey = process.env.LESSONSPACE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API Lessonspace manquante' })
  }

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/spaces/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!data.recording || !data.recording.url) {
      return res.status(200).json({ recording_url: null })
    }

    return res.status(200).json({ recording_url: data.recording.url })
  } catch (error) {
    console.error('Erreur API Lessonspace:', error)
    return res.status(500).json({ error: 'Erreur lors de la récupération du lien d\'enregistrement.' })
  }
}
