// controllers/confirmationEmail-controller.js

const { Resend } = require('resend');

// Initialize Resend client with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const express = require('express');
const router = express.Router();

router.post('/send-confirmation-email', async (req, res) => {
  const { email, bookingId, date, time, service, branchName } = req.body;
  const mapSearch = `Bakestone Motors ${branchName}`;

  if (!email || !bookingId || !date || !time || !service || !branchName) {
    return res.status(400).json({ message: 'Missing required fields in request body.' });
  }

  try {
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = time.slice(0,5);

    const result = await resend.emails.send({
      from: `Your Garage <no-reply@${process.env.EMAIL_DOMAIN}>`,
      to: [email],
      subject: 'Your Booking Confirmation',
      html: `
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; margin:0; padding:0; background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0; padding:40px 0; background-color:#f4f4f4;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:40px 20px 20px;">
              <span style="display:inline-block; font-size:48px; color:#0c2e6e; line-height:1;">✓</span>
              <h1 style="margin: 20px 0 0; font-size:24px; color:#333333;">See you soon, ${email.split('@')[0]}!</h1>
              <p style="margin:8px 0 0; font-size:16px; color:#555555;">A confirmation email will be sent.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Details Column -->
                  <td valign="top" width="50%" style="padding-right:10px;">
                    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="font-weight:bold; border-bottom:1px solid #eeeeee;">Booking #</td>
                        <td style="text-align:right; border-bottom:1px solid #eeeeee;">${bookingId}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold; border-bottom:1px solid #eeeeee;">Date</td>
                        <td style="text-align:right; border-bottom:1px solid #eeeeee;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold; border-bottom:1px solid #eeeeee;">Time</td>
                        <td style="text-align:right; border-bottom:1px solid #eeeeee;">${formattedTime}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold; border-bottom:1px solid #eeeeee;">Service</td>
                        <td style="text-align:right; border-bottom:1px solid #eeeeee;">${service}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold; border-bottom:1px solid #eeeeee;">Location</td>
                        <td style="text-align:right; border-bottom:1px solid #eeeeee;">${branchName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold; border-bottom:1px solid #eeeeee;">Name</td>
                        <td style="text-align:right; border-bottom:1px solid #eeeeee;">${email.split('@')[0]}</td>
                      </tr>
                      <tr>
                        <td style="font-weight:bold;">Vehicle</td>
                        <td style="text-align:right;">${ 'N/A'}</td>
                      </tr>
                    </table>
                  </td>
                  <!-- Map Column -->
                  <td valign="top" width="50%" style="padding-left:10px;">
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchName)}" target="_blank">
                      <img 
                        src="https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(branchName)}&zoom=14&size=400x250&markers=color:red%7C${encodeURIComponent(branchName)}" 
                        width="100%" 
                        alt="Map to Bakestone motors ${branchName}" 
                        style="border-radius:4px;"
                      />
                    </a>
                    <p style="text-align:center; margin:8px 0 0; font-size:12px; color:#777777;">
                      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearch)}" target="_blank" style="color:#0c2e6e;text-decoration:none;">
                        View on Google maps
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px; background:#fafafa; font-size:12px; color:#999999;">
              &copy;  Bakestone Motors. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
        <p>Hi there,</p>
        <p>Thanks for booking your <strong>${service}</strong> at <strong>${branchName}</strong>!</p>
        <p><strong>Date:</strong> ${formattedDate}<br />
           <strong>Time:</strong> ${formattedTime}</p>
        <p>Your booking reference is <strong>${bookingId}</strong>.</p>
        <p>We look forward to seeing you.</p>
      `
    });
    const messageId = result.data?.id;
    if (result.error) {
      console.error('Email send failed:', result.error);
      return res.status(500).json({ message: 'Server error sending confirmation email.' });
    }

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