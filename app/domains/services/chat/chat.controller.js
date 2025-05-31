const Service = require('../services.model').Service;

const create = async (req, res) => {
    try {
        const { predictionID, query } = req.body;

        if (!predictionID || !query) {
            let invalidItems = [];
            if (!predictionID) invalidItems.push('"predictionID"');
            if (!query) invalidItems.push('"query"');
            return res.status(400).json({
                status: 'error',
                message: `Parameter ${invalidItems.join(", ")} required`,
                data: {}
            });
        }

        const getService = await Service.findOne({ email: req.user.email });
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User is not registered yet",
                data: {}
            });
        }

        const predictionData = await Service.findOne(
            { email: req.user.email, "predictions.id": predictionID },
            { "predictions.$": 1 }
        );
        if (!predictionData) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid predictionID: predictionID not found',
                data: {}
            });
        }

        let data = predictionData.predictions[0].toObject();

        const messages = [
            { 
                role: 'system', 
                content: JSON.stringify(data.predictions.map(({_id, tagId, ...keys}) => keys)) + "\n\nData above is probability of diabetic retinopathy stage acquired using Microsoft Azure custom vision api image classification of a patient's image.",
                time: new Date()
            },
            { 
                role: 'user', 
                content: query,
                time: new Date()
            }
        ];

        const requestBody = {
            model: process.env.OPENROUTER_API_MODEL,
            messages: messages.map(({time, ...keys}) => keys),
        };

        const response = await fetch(process.env.OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://api.fundusnap.com',
                'X-Title': 'Fundusnap Diabetic Retinopathy Detection Mobile App',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData);
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? errorData.error.message : "Failed to process request",
                data: errorData.error
            });
        }

        const responseData = await response.json();
        const chatCompletetion = responseData.choices[0].message.content;
        messages.push({ 
            role: 'assistant', 
            content: chatCompletetion,
            time: new Date()
        });

        getService.chatSession.push({
            predictionID: predictionID,
            chatData: messages
        });

        const savedData = await getService.save();

        await Service.findOneAndUpdate(
            { email: req.user.email, "predictions.id": predictionID },
            { $set: { "predictions.$.chatID": savedData.chatSession.slice(-1)[0]._id } },
            { new: true }
        );

        res.status(200).json({
            status: "success",
            message: "Successfuly create new chat",
            data: {
                id: savedData.chatSession.slice(-1)[0]._id,
                response: chatCompletetion
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {}
        });
    }
};

const list = async (req, res) => {
    try {
        const getService = await Service.findOne({ email: req.user.email });
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User not found or not registered yet",
                data: {}
            });
        }

        res.status(200).json({
            status: "success",
            message: "Successfuly list chat data",
            data: getService.chatSession.map((chatSession) => ({
                    id: chatSession._id,
                    predictionID: chatSession.predictionID,
                    highlight: chatSession.chatData.slice(-1)[0]?.content.slice(0,100) + " . . .",
                    lastUpdated: chatSession.chatData.slice(-1)[0]?.time
            }))
        });
    } catch(err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {}
        });
    }
};

const read = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            let invalidItems = [];
            if (!id) invalidItems.push('"id"');
            return res.status(400).json({
                status: 'error',
                message: `Parameter ${invalidItems.join(", ")} required`,
                data: {}
            });
        }

        const getService = await Service.findOne(
            { email: req.user.email, "chatSession._id": id },
            { "chatSession.$": 1 }
        );
        
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User not found or Invalid chat id",
                data: {}
            });
        }
        
        const data = getService.chatSession[0].toObject();

        res.status(200).json({
            status: "success",
            message: "Successfuly read chat data",
            data: {
                predictionID: data.predictionID,
                chats: data.chatData.slice(1).map(({_id, ...keys}) => keys)
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {}
        });
    }
};

const reply = async (req, res) => {
    try {
        const { id, query } = req.body;

        if (!id || !query) {
            let invalidItems = [];
            if (!id) invalidItems.push('"id"');
            if (!query) invalidItems.push('"query"');
            return res.status(400).json({
                status: 'error',
                message: `Parameter ${invalidItems.join(", ")} required`,
                data: {}
            });
        }

        const getService = await Service.findOne(
            { email: req.user.email, "chatSession._id": id },
            { "chatSession.$": 1 }
        );
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User not found or Invalid chat id",
                data: {}
            });
        }

        const data = getService.chatSession[0].toObject();

        let messages = data.chatData.map(({_id, ...keys}) => keys);
        messages.push({ 
            role: 'user', 
            content: query,
            time: new Date()
        });

        const requestBody = {
            model: process.env.OPENROUTER_API_MODEL,
            messages: messages.map(({time, ...keys}) => keys),
        };

        const response = await fetch(process.env.OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://api.fundusnap.com',
                'X-Title': 'Fundusnap Diabetic Retinopathy Detection Mobile App',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData);
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? errorData.error.message : "Failed to process request",
                data: errorData.error
            });
        }

        const responseData = await response.json();
        const chatCompletetion = responseData.choices[0].message.content;
        messages.push({ 
            role: 'assistant', 
            content: chatCompletetion,
            time: new Date()
        });
        
        await Service.findOneAndUpdate(
            { 
                email: req.user.email, 
                "chatSession._id": id 
            },
            {
                $push: { 
                    "chatSession.$.chatData": { $each: messages.slice(-2) }
                }
            }
        );

        res.status(200).json({
            status: "success",
            message: "Successfuly add new chat reply",
            data: {
                id: id,
                response: chatCompletetion
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {}
        });
    }
};

module.exports = {
    create,
    list,
    read,
    reply
};