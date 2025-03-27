// pages/api/enregistrement.js

export default async function handler(req, res) {
  const { spaceId } = req.query;

  if (!spaceId) {
    return res.status(400).json({ error: 'Missing spaceId parameter' });
  }

  try {
    const response = await fetch('https://api.thelessonspace.com/v2/recordings/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer cdee0709-2ffe-4758-a0b9-25f92f91c0a7`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur API Lessonspace:', data);
      return res.status(500).json({ error: data });
    }

    const found = data.results.find(r => r.space_id === spaceId);

    if (!found) {
      return res.status(404).json({ error: 'Aucun enregistrement trouvé pour ce spaceId' });
    }

    return res.status(200).json({ recording_url: found.url });
  } catch (error) {
    console.error('Erreur fetch API:', error);
    return res.status(500).json({ error: error.message });
  }
}
