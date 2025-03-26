// /pages/api/enregistrement.js

export default async function handler(req, res) {
  const { spaceId } = req.query

  if (!spaceId) {
    return res.status(400).json({ error: 'spaceId manquant' })
  }

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/recordings/${spaceId}`, {
      headers: {
        Authorization: `Bearer cdee0709-2ffe-4758-a0b9-25f92f91c0a7`
      }
    })

    const data = await response.json()

    console.log("DEBUG - Données reçues de Lessonspace:", data)

    if (!response.ok) {
      return res.status(response.status).json({ error: data })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error("Erreur API Lessonspace:", error)
    return res.status(500).json({ error: 'Erreur serveur : ' + error.message })
  }
}
