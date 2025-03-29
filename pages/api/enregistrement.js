export default async function handler(req, res) {
  const { spaceId } = req.query;
  const apiKey = process.env.LESSONSPACE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API Lessonspace manquante" });
  }

  if (!spaceId) {
    return res.status(400).json({ error: "Paramètre spaceId manquant" });
  }

  try {
    const response = await fetch(`https://api.thelessonspace.com/v2/spaces/${spaceId}/recordings`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      return res.status(response.status).json({ error: `Erreur API Lessonspace: ${message}` });
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: "Aucun enregistrement trouvé" });
    }

    // On prend le plus récent
    const lastRecording = data[data.length - 1];
    res.status(200).json({ recording_url: lastRecording.url });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
}
