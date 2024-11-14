const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

// Initialize dotenv to load environment variables
dotenv.config();

const app = express();
const port = 3000;

// Setup multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save uploaded files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename based on timestamp
  },
});

const upload = multer({ storage: storage });

// Middleware to parse JSON body
app.use(express.json());

// Send email endpoint
app.post('/send-email', upload.single('file'), async (req, res) => {
  try {
    // Validate the required fields
    const { to, cc, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).send('Missing required fields: to, subject, or body.');
    }

    // Create a transporter using SMTP (Configure this with your email provider's SMTP settings)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email provider (e.g., 'gmail', 'smtp.mailtrap.io')
      auth: {
        user: process.env.EMAIL_USER, // Your email (configured in .env)
        pass: process.env.EMAIL_PASS, // Your email password (configured in .env)
      },
    });

    // Prepare the email message
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to, // recipient email
      cc, // CC recipient emails
      subject, // email subject
      text: body, // email body text
      attachments: [],
    };

    // If a file was uploaded, add it as an attachment
    if (req.file) {
      mailOptions.attachments.push({
        filename: req.file.originalname,
        path: req.file.path, // Path to the file on the server
      });
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    // Send response
    res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
