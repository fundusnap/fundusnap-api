const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    email: { type: String, required: true },
    predictions: [{
        id: { type: String, required: true },
        name: { type: String, required: false },
        description: { type: String, required: false },
        project: { type: String, required: true },
        iteration: { type: String, required: true },
        created: { type: Date, required: true },
        predictions: [{
            probability: { type: Number, required: true },
            tagId: { type: String, required: true },
            tagName: { type: String, required: true }
        }]
    }],
    chatSession: [{
        lastUpdated: { type: Date, required: true },
        chatData: [{
            content: { type: String, required: true },
            role: { type: String, required: true }
        }]
    }]
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = {
    Service
};