// pages/api/enregistrement.js

export default async function handler(req, res) {
  const { spaceId } = req.query

  if (!spaceId) {
    return res.status(400).json({ error: 'spaceId requis' })
  }

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/spaces/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${process.env.LESSONSPACE_API_KEY}`
      }
    })

    const data = await response.json()

    if (!data || !data.recording_url) {
      return res.status(200).json({ message: 'Aucun enregistrement disponible', data })
    }

    return res.status(200).json({ recording_url: data.recording_url })
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la requête vers Lessonspace' })
  }
}
