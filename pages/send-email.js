import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { to, subject, text } = req.body

  if (!to || !subject || !text) {
    return res.status(400).json({ message: 'Champs manquants' })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'samysediri65@gmail.com',
        pass: 'sr17rj36'
      }
    })

    const info = await transporter.sendMail({
      from: 'Horizon Scolaire <samysediri65@gmail.com>',
      to,
      subject,
      text
    })

    console.log('Message envoyé : %s', info.messageId)
    res.status(200).json({ message: 'Courriel envoyé avec succès' })
  } catch (error) {
    console.error('Erreur lors de l’envoi du courriel:', error)
    res.status(500).json({ message: 'Erreur lors de l’envoi' })
  }
}
