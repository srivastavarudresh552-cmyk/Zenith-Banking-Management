require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// -------------------- OAuth2 Client --------------------

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

// Verify refresh token on startup
(async () => {
  try {
    const token = await oauth2Client.getAccessToken();
    console.log("ACCESS TOKEN OK");
  } catch (err) {
    console.error("TOKEN FAILED:", err);
  }
})();

// -------------------- Nodemailer Transporter --------------------

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  // Timeouts (must be top-level, NOT inside auth)
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection
transporter.verify((error) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Log token refresh events
transporter.on("token", (token) => {
  console.log("New access token generated");
  console.log("Expires:", new Date(token.expires));
});

// -------------------- Send Email Helper --------------------

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// -------------------- Registration Email --------------------

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Zenith Banking Management System!";

  const text = `Hi ${name},

Thank you for registering with Zenith Banking! We're excited to have you on board.

Best regards,
The Zenith Banking Management System Team`;

  const html = `
    <p>Hi ${name},</p>
    <p>Thank you for registering with Zenith Banking System! We're excited to have you on board.</p>
    <p>Best regards,<br>The Zenith Banking Management System Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

// -------------------- Success Email --------------------

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful!";

  const text = `Hello ${name},

Your transaction of ₹${amount} to account ${toAccount} was successful.

Best Regards,
The Zenith Banking Management System Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>Your transaction of ₹${amount} to account ${toAccount} was successful.</p>
    <p>Best Regards,<br>The Zenith Banking Management System Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

// -------------------- Failure Email --------------------

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed!";

  const text = `Hello ${name},

Your transaction of ₹${amount} to account ${toAccount} failed.

Best Regards,
The Zenith Banking Management System Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>Your transaction of ₹${amount} to account ${toAccount} failed.</p>
    <p>Best Regards,<br>The Zenith Banking Management System Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};