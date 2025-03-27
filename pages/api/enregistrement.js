// pages/api/enregistrement.js

export default async function handler(req, res) {
  const { spaceId } = req.query

  if (!spaceId) {
    return res.status(400).json({ error: 'Missing spaceId parameter' })
  }

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/recordings/${spaceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.LESSONSPACE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Erreur API Lessonspace:', data)
      return res.status(500).json({ error: data })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Erreur fetch API:', error)
    return res.status(500).json({ error: error.message })
  }
}
