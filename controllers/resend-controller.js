// controllers/confirmationEmail-controller.js

const { Resend } = require('resend');

// Initialize Resend client with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const express = require('express');
const router = express.Router();

router.post('/send-confirmation-email', async (req, res) => {
  const { email, bookingId, date, time, service, branchName, vehicle, chain, name } = req.body;
  const mapSearch = `${chain} ${branchName}`;

  if (!email || !bookingId || !date || !time || !service || !branchName || !vehicle || !chain || !name) {
    return res.status(400).json({ message: 'Missing required fields in request body.' });
  }

  try {
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = time.slice(0,5);

    const result = await resend.emails.send({
      from: `${chain} ${branchName} <no-reply@${process.env.EMAIL_DOMAIN}>`,
      to: [email],
      subject: `Booking Confirmation`,
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
                    <h1 style="margin: 20px 0 0; font-size:24px; color:#333333;">See you soon, ${name}!</h1>
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
                              <td style="text-align:right; border-bottom:1px solid #eeeeee;">${name}</td>
                            </tr>
                            <tr>
                              <td style="font-weight:bold;">Vehicle</td>
                              <td style="text-align:right;">${vehicle}</td>
                            </tr>
                          </table>
                        </td>
                        <!-- Map Column -->
                        <td valign="top" width="50%" style="padding-left:10px;">
                          <img
                            src="https://cdn.jsdelivr.net/gh/Matthew7058/garage_images@main/1.png"
                            width="100%"
                            alt="Photo of {{branchName}}"
                            style="border-radius:4px;"
                          />
                          <p style="text-align:center; margin:8px 0 0; font-size:12px; color:#777777;">
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearch)}" target="_blank" style="color:#0c2e6e;text-decoration:none;">
                              View on Google Maps
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
                    &copy;  ${chain}. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
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

/**
 * POST /send-invoice
 * Body: {
 *   email:        String   – recipient address (required)
 *   pdfBase64:    String   – base‑64 encoded PDF data (required)
 *   subject:      String   – optional email subject (defaults "Your Invoice")
 *   bookingId:    String|Number – optional ID used to name the attachment
 *   chain:        String   – business/chain name (defaults "Bakestone Motors")
 * }
 *
 * Sends a single PDF attachment via Resend.
 */
router.post('/send-invoice', async (req, res) => {
  const { email, pdfBase64, subject, bookingId, chain } = req.body;

  if (!email || !pdfBase64) {
    return res
      .status(400)
      .json({ message: 'Missing required fields: email and pdfBase64' });
  }

  try {
    const business = chain || 'Bakestone Motors';

    // Prepare attachment object for Resend
    const attachment = {
      filename: `invoice-${bookingId || Date.now()}.pdf`,
      content: pdfBase64,
      type: 'application/pdf'
    };

    const result = await resend.emails.send({
      from: `${business} <no-reply@${process.env.EMAIL_DOMAIN}>`,
      to: [email],
      subject: subject || 'Your Invoice',
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
                    <h1 style="margin: 20px 0 0; font-size:24px; color:#333333;">Thank you for choosing Bakestone Motors</h1>
                    <p style="margin:8px 0 0; font-size:16px; color:#555555;">Please find your invoice attached.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      `,
      attachments: [attachment]
    });

    if (result.error) {
      console.error('Invoice email failed:', result.error);
      return res
        .status(500)
        .json({ message: 'Server error sending invoice email.' });
    }

    console.log(`Invoice email sent; Resend message ID: ${result.data?.id}`);
    return res.json({ message: 'Invoice email sent', messageId: result.data?.id });
  } catch (err) {
    console.error('Invoice email failed:', err);
    return res
      .status(500)
      .json({ message: 'Server error sending invoice email.' });
  }
});

module.exports = router;