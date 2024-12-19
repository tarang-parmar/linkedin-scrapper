import nodemailer from 'nodemailer'

export const sendEmail = async ({to, subject, html}) => {
  console.log(`⚡ > sendEmail > to--->`, to)
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'tarangparmar456@gmail.com',
        pass: 'ypqt kzme vgea rrny',
      },
    })

    const info = await transporter.sendMail({
      from: '"Linkedin Automation ⚙️🤖🦾" <tarangparmar456@gmail.com>',
      to,
      subject,
      // text: text,
      html,
    })

    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Email could not be sent')
  }
}
