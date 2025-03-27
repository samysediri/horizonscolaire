// pages/api/enregistrement.js

export default async function handler(req, res) {
  const { spaceId } = req.query

  console.log("spaceId reçu :", spaceId)

  if (!spaceId) {
    return res.status(400).json({ error: 'Missing spaceId parameter' })
  }

  const apiKey = process.env.LESSONSPACE_API_KEY
  console.log("Clé API utilisée :", apiKey)

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/recordings/${spaceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log("Statut de réponse Lessonspace:", response.status)
    const text = await response.text()
    console.log("Réponse brute Lessonspace :", text)

    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      return res.status(500).json({ error: "Réponse non JSON", text })
    }

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
