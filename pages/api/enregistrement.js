// pages/api/enregistrement.js

export default async function handler(req, res) {
  const { spaceId } = req.query

  if (!spaceId) {
    return res.status(400).json({ error: 'Missing spaceId in query params.' })
  }

  const apiKey = process.env.LESSONSPACE_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing LESSONSPACE_API_KEY in env variables.' })
  }

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/spaces/${spaceId}/recordings/`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({ error: errorData })
    }

    const data = await response.json()
    const recording_url = data?.recordings?.[0]?.url || null

    res.status(200).json({ recording_url })
  } catch (err) {
    console.error('Erreur dans /api/enregistrement:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
