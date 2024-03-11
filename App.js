require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();

// Load environment variables from .env file
const PORT = process.env.PORT || 4000;
const DB_URL = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to database'))
  .catch(error => console.error('Database connection error:', error));

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Use cors middleware to handle CORS headers
app.use(cors());

// Define multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../src/images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Define Mongoose schema and model
const ImageDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  whatsapp: {
    type: Number,
    required: true
  },
  batch: String,
  gender: String,
  paymentMethod: String,
  image: String
});

const ImageDetails = mongoose.model('ImageDetails', ImageDetailsSchema);

// Route to handle image upload
app.post('/upload-image', upload.single('image'), async (req, res) => {
  const { name, fatherName, email, whatsapp, batch, gender, paymentMethod } = req.body;
  const imageName = req.file.filename;

  try {
    await ImageDetails.create({
      name,
      fatherName,
      email,
      whatsapp,
      batch,
      gender,
      paymentMethod,
      image: imageName
    });

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Route to get all images
app.get('/get-images', async (req, res) => {
  try {
    const images = await ImageDetails.find({});
    res.json({ status: 'ok', data: images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Success!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
