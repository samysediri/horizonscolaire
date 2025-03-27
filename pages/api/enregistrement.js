// pages/api/enregistrement.js

export default async function handler(req, res) {
  const { spaceId } = req.query;
  const apiKey = process.env.LESSONSPACE_API_KEY;

  if (!spaceId) {
    return res.status(400).json({ error: 'Missing spaceId parameter' });
  }

  try {
    const response = await fetch("https://api.thelessonspace.com/v2/recordings", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(500).json({ error: errorData });
    }

    const data = await response.json();
    const allRecordings = data.results || [];
    
console.log("Résultat complet des enregistrements:", data);

    const matchingRecording = allRecordings.find(recording =>
      recording.space_url.includes(spaceId)
    );

    if (!matchingRecording) {
      return res.status(200).json({ message: "Aucun enregistrement trouvé pour cet espace." });
    }

    return res.status(200).json({ recording_url: matchingRecording.playback_url });
  } catch (error) {
    console.error("Erreur lors de la récupération des enregistrements:", error);
    return res.status(500).json({ error: error.message });
  }
}
