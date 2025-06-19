// controllers/confirmationEmail-controller.js

const { Resend } = require('resend');

// Initialize Resend client with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const express = require('express');
const router = express.Router();

router.post('/send-confirmation-email', async (req, res) => {
  const { email, bookingId, date, time, service, branchName } = req.body;

  if (!email || !bookingId || !date || !time || !service || !branchName) {
    return res.status(400).json({ message: 'Missing required fields in request body.' });
  }

  try {
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = time.slice(0,5);

    const { id: messageId } = await resend.emails.send({
      from: `Your Garage <no-reply@${process.env.EMAIL_DOMAIN}>`,
      to: [email],
      subject: 'Your Booking Confirmation',
      html: `
        <p>Hi there,</p>
        <p>Thanks for booking your <strong>${service}</strong> at <strong>${branchName}</strong>!</p>
        <p><strong>Date:</strong> ${formattedDate}<br />
           <strong>Time:</strong> ${formattedTime}</p>
        <p>Your booking reference is <strong>${bookingId}</strong>.</p>
        <p>We look forward to seeing you.</p>
      `
    });

    console.log(`Email sent; Resend message ID: ${messageId}`);
    return res.json({ message: 'Confirmation email sent', messageId });
  } catch (err) {
    console.error('Email send failed:', err);
    return res
      .status(500)
      .json({ message: 'Server error sending confirmation email.' });
  }
});

module.exports = router;