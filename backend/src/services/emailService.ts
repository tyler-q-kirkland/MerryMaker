import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendChristmasCardEmail(
  recipientEmail: string,
  recipientName: string,
  cardToken: string
): Promise<void> {
  const cardUrl = `${process.env.FRONTEND_URL}/card/${cardToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipientEmail,
    subject: '🎄 You have received a Christmas Card!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 10px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #c41e3a;
              text-align: center;
            }
            p {
              color: #333;
              line-height: 1.6;
            }
            .button {
              display: block;
              width: 200px;
              margin: 30px auto;
              padding: 15px;
              background-color: #165b33;
              color: white;
              text-align: center;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎄 Merry Christmas, ${recipientName}! 🎄</h1>
            <p>You've received a special Christmas card!</p>
            <p>Click the button below to view your personalized holiday greeting:</p>
            <a href="${cardUrl}" class="button">View Your Card</a>
            <div class="footer">
              <p>Sent with love from MerryMaker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Christmas card email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
