const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(err));

const jobCardSchema = new mongoose.Schema({
    jobCardNumber: { type: String, unique: true },
    customerName: String,
    address: String,
    mobileNo: String,
    carModel: String,
    chassisNo: String,
    serviceType: String,
    mileage: Number,
    activities: [{ activity: String, cost: Number, completed: Boolean }]
});

const JobCard = mongoose.model('JobCard', jobCardSchema);

app.post('/api/jobcard', async (req, res) => {
    const jobCardData = req.body;

    try {
        const existingJobCard = await JobCard.findOne({ jobCardNumber: jobCardData.jobCardNumber });
        
        if (existingJobCard) {
            return res.status(400).send('Job card number already exists');
        }

        const jobCard = new JobCard(jobCardData);
        await jobCard.save();
        res.status(201).send('Job card created successfully');
    } catch (err) {
        console.error('Error creating job card:', err);
        res.status(500).send('Error creating job card');
    }
});

app.get('/api/jobcard/:jobCardNumber', (req, res) => {
    const jobCardNumber = req.params.jobCardNumber;
    JobCard.findOne({ jobCardNumber })
        .then(jobCard => {
            if (!jobCard) {
                return res.status(404).send('Job card not found');
            }
            res.json(jobCard);
        })
        .catch(err => res.status(500).send('Error fetching job card'));
});

app.put('/api/jobcard/:jobCardNumber', (req, res) => {
    const jobCardNumber = req.params.jobCardNumber;
    const updatedActivities = req.body.activities;

    JobCard.findOneAndUpdate(
        { jobCardNumber },
        { activities: updatedActivities },
        { new: true }
    )
    .then(jobCard => {
        if (!jobCard) {
            return res.status(404).send('Job card not found');
        }
        res.json(jobCard);
    })
    .catch(err => res.status(500).send('Error updating job card'));
});

app.delete('/api/jobcard/:jobCardNumber', (req, res) => {
    const jobCardNumber = req.params.jobCardNumber;
    JobCard.findOneAndDelete({ jobCardNumber })
        .then(() => res.send('Job card deleted after creating invoice'))
        .catch(err => res.status(500).send('Error deleting job card'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
