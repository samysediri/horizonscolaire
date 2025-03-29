import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'TON_EMAIL@gmail.com',
      pass: 'TON_APP_PASSWORD', // généré via https://myaccount.google.com/apppasswords
    },
  });

  try {
    await transporter.sendMail({
      from: 'Horizon Scolaire <TON_EMAIL@gmail.com>',
      to,
      subject,
      text,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur d’envoi :', error);
    return res.status(500).json({ error: 'Échec de l’envoi de l’email' });
  }
}
