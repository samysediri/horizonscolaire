export default async function handler(req, res) {
  const { spaceId } = req.query

  if (!spaceId) {
    return res.status(400).json({ error: 'Missing spaceId' })
  }

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/recordings/${spaceId}`, {
      headers: {
        Authorization: `Bearer cdee0709-2ffe-4758-a0b9-25f92f91c0a7`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ error: errorText })
    }

    const data = await response.json()
    return res.status(200).json({ recording_url: data.recording_url || null })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
