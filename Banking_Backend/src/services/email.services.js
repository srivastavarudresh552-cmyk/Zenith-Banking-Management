require('dotenv').config();
const dns = require('dns');
const nodemailer = require('nodemailer');

// Force Node's DNS resolution to prefer IPv4. Render's network (on many plans)
// has no outbound IPv6 route, so without this, nodemailer can pick the AAAA
// record for smtp.gmail.com and the TCP connect simply hangs/fails with ENETUNREACH.
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,        // true for port 465, false for 587
  family: 4,            // force IPv4 - this is the actual fix
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
    console.log(process.env.EMAIL_USER);
    console.log(process.env.EMAIL_APP_PASSWORD ? "APP PASSWORD OK" : "APP PASSWORD MISSING");
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  console.log("Attempting email send...");

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
    console.error("EMAIL ERROR FULL:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Zenith Banking Management System!';
  const text = `Hi ${name},\n\nThank you for registering with Zenith Banking! We're excited to have you on board.\n\nBest regards,\nThe Zenith Banking Management System Team`;
  const html = `<p>Hi ${name},</p><p>Thank you for registering with Zenith Banking System! We're excited to have you on board.</p><p>Best regards,<br>The Zenith Banking Management System Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = 'Transaction Successful!'
  const text = `Hello ${name} , \n\n Your transaction of ${amount} to account ${toAccount} was successful\n\nBest Regards,\nThe Zenith Banking Management System Team`;
  const html = `<p>Hello ${name},</p><p>Your transaction of ${amount} to account ${toAccount} was successful.</p><p>Best Regards,<br>The Zenith Banking Management System Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = 'Transaction Failed!'
  const text = `Hello ${name} , \n\n Your transaction of ${amount} to account ${toAccount} failed\n\nBest Regards,\nThe Zenith Banking Management System Team`;
  const html = `<p>Hello ${name},</p><p>Your transaction of ${amount} to account ${toAccount} failed.</p><p>Best Regards,<br>The Zenith Banking Management System Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail
}