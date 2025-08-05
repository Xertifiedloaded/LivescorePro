import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendVerificationEmail = async (email, token, username) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Verify Your Email - Sports Betting Platform',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Welcome to Sports Betting Platform!</h2>
        <p>Hi ${username},</p>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
          Verify Email
        </a>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

export const sendPasswordResetEmail = async (email, token, username) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Reset Your Password - Sports Betting Platform',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Reset Your Password</h2>
        <p>Hi ${username},</p>
        <p>You requested to reset your password. Click the button below to create a new password.</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

// Test email connection
export const testEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email server connection verified')
    return true
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message)
    return false
  }
}

// Send test email
export const sendTestEmail = async (to) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject: 'Test Email - Sports Betting Platform',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Test Email</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you received this email, your email setup is working! 🎉</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      </div>
    `,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message)
    throw error
  }
}
