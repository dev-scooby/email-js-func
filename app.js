// const express = require('express');
// const nodemailer = require('nodemailer');
// const multer = require('multer');
// const path = require('path');
// const dotenv = require('dotenv');

// // Initialize dotenv to load environment variables
// dotenv.config();

// const app = express();
// const port = 3000;

// // Setup multer for handling file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Save uploaded files in the 'uploads' folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename based on timestamp
//   },
// });

// const upload = multer({ storage: storage });

// // Middleware to parse JSON body
// app.use(express.json());

// // Send email endpoint
// app.post('/send-email', async (req, res) => {
//   try {
//     // Validate the required fields
//     const { to, cc, subject, body } = req.body;
//     console.log(req.body, "Req Body");
//     if (!to || !subject || !body) {
//       return res.status(400).send('Missing required fields: to, subject, or body.');
//     }

//     // Create a transporter using SMTP (Configure this with your email provider's SMTP settings)
//     const transporter = nodemailer.createTransport({
//       service: 'gmail', // Use your email provider (e.g., 'gmail', 'smtp.mailtrap.io')
//       auth: {
//         user: process.env.EMAIL_USER, // Your email (configured in .env)
//         pass: process.env.EMAIL_PASS, // Your email password (configured in .env)
//       },
//     });

//     // Prepare the email message
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to, // recipient email
//       cc, // CC recipient emails
//       subject, // email subject
//       text: body, // email body text
//       attachments: [],
//     };

//     // If a file was uploaded, add it as an attachment
//     if (req.file) {
//       mailOptions.attachments.push({
//         filename: req.file.originalname,
//         path: req.file.path, // Path to the file on the server
//       });
//     }

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);

//     // Send response
//     res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).send('Error sending email');
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());  // Allow cross-origin requests

// Multer setup to handle multipart form-data
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

app.post("/send-email", upload.single('file'), (req, res) => {
    const { to, childName, email, mobile, dob, gender, prevSchool, classForAdmission, parentName, occupation, howDidYouHear, address, formRandomID } = req.body;
    console.log(req.body);
    const file = req.file;  // Get the uploaded file (PDF)

    if (!file) {
        return res.status(400).send("No file uploaded.");
    }

    // Logging the form data to check
    console.log("Form Data:", req.body);
    console.log("Uploaded file:", file);

    // Now send the email with nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        cc: "sankarngt@gmail.com",
        // cc: "cu4430179@gmail.com",
        subject: `Admission Enquiry: ${childName} (${formRandomID})`,
        text: `You have received a new admission enquiry form from ${childName} for ${classForAdmission}.\n\nDetails:\nEmail: ${email}\nMobile: ${mobile}\nDate of Birth: ${dob}\nGender: ${gender}\nPrevious School: ${prevSchool}\nAddress: ${address}\nHow Did You Hear: ${howDidYouHear}\nParent: ${parentName}\nOccupation: ${occupation}`,
        attachments: [
            {
                filename: `Admission Enquiry Form - ${formRandomID}.pdf`,
                content: file.buffer,  // Attach the file content (buffer)
            },
        ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
            res.status(500).send("Error sending email.");
        } else {
            console.log("Email sent:", info.response);
            res.status(200).send("Email sent successfully.");
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
