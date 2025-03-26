import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  const { to, subject, text } = req.body

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    })

    res.status(200).json({ message: 'Courriel envoyé avec succès' })
  } catch (error) {
    console.error('Erreur courriel:', error)
    res.status(500).json({ message: 'Erreur lors de l’envoi du courriel', error })
  }
}
