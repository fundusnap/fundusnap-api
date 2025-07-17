const Service = require('../services.model').Service;
const { uploadPredictImageBuffer, getPredictBlobUrl, uploadDetectImageBuffer, getDetectBlobUrl } = require('../../../configs/storage/azure/blobStorage');
const fileType = require('file-type');
const axios = require('axios');
const FormData = require('form-data');

const create = async (req, res) => {
    try {
        if (!Buffer.isBuffer(req.body)) {
            return res.status(400).json({
                status: 'error',
                message: `Body must be image buffer`,
                data: {}
            });
        }

        const type = await fileType.fileTypeFromBuffer(req.body);
        
        if (!type || !type.mime.startsWith('image/')) {
            return res.status(400).json({
                status: 'error',
                message: `Uploaded file is not a valid image`,
                data: {}
            });
        }

        const getService = await Service.findOne({ email: req.user.email });
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User not found or not registered yet",
                data: {}
            });
        }

        const response = await fetch(process.env.AZURE_VISION_ENDPOINT, {
            method: 'POST',
            headers: {
                'Prediction-Key': process.env.AZURE_PREDICTION_KEY,
                'Content-Type': 'application/octet-stream'
            },
            body: req.body
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData);
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? errorData.message : "Failed to process request",
                data: errorData
            });
        }

        let data = await response.json();
        data["name"] = `New Snap (${getService.predictions.length + 1})`;
        data["description"] = `New Snap (${getService.predictions.length + 1})`;

        const inspectFormData = new FormData();
        inspectFormData.append('file', req.body, {
            filename: `image.${type.ext}`,
            contentType: type.mime
        });

        const visualizeFormData = new FormData();
        visualizeFormData.append('file', req.body, {
            filename: `image.${type.ext}`,
            contentType: type.mime
        });

        // Call both endpoints in parallel
        const [inspectResponse, visualizeResponse] = await Promise.all([
            axios.post(process.env.FUNDUSNAP_AI_HOST + '/inspect/fundus-artifacts/', inspectFormData, {
                headers: {
                    ...inspectFormData.getHeaders()
                }
            }),
            axios.post(process.env.FUNDUSNAP_AI_HOST + '/visualize/fundus-artifacts/', visualizeFormData, {
                headers: {
                    ...visualizeFormData.getHeaders()
                },
                responseType: 'arraybuffer' // Important for receiving image data
            })
        ]);
        data["detectionArtifacts"] = inspectResponse.data["detections"];

        getService.predictions.push(data);
        const newPrediction = await getService.save();

        const id = newPrediction.predictions.slice(-1)[0].id;

        await uploadPredictImageBuffer(req.body, id, type.mime);
        data["imageURL"] = await getPredictBlobUrl(id);

        const visualizationImageBuffer = Buffer.from(visualizeResponse.data);
        await uploadDetectImageBuffer(visualizationImageBuffer, id, 'image/jpeg '); // Assuming visualization returns PNG
        data["detectionURL"] = await getDetectBlobUrl(id);

        res.status(200).json({
            status: "success",
            message: "Successfully create diabetic retinopathy prediction of an image",
            data: data
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

        const predictions = await Promise.all(getService.predictions.map(async (prediction) => ({
            id: prediction.id,
            name: prediction.name,
            description: prediction.description,
            created: prediction.created,
            imageURL: await getPredictBlobUrl(prediction.id)
        })));

        res.status(200).json({
            status: "success",
            message: "Successfuly list created diabetic retinopathy prediction",
            data: predictions
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
        const { id  } = req.params;

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
            { email: req.user.email, "predictions.id": id },
            { "predictions.$": 1 }
        );
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User not found or Invalid chat id",
                data: {}
            });
        }

        let data = getService.predictions[0].toObject();
        delete data._id;
        data.predictions = data.predictions.map(({_id, ...keys}) => keys);
        data.imageURL = await getPredictBlobUrl(data.id);

        res.status(200).json({
            status: "success",
            message: "Successfuly read prediction data",
            data: data
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

const update = async (req, res) => {
    try {
        const { id, name, description } = req.body;

        if (!name && !description) {
            return res.status(400).json({
                status: 'error',
                message: `One of parameter "name" or "description" must be included`,
                data: {}
            });
        }

        const getService = await Service.findOne(
            { email: req.user.email, "predictions.id": id },
            { "predictions.$": 1 }
        );
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User not found or Invalid chat id",
                data: {}
            });
        }

        const updatedService = await Service.findOneAndUpdate(
            { email: req.user.email, "predictions.id": id },
            { $set: { "predictions.$.name": name || getService.predictions[0].name, "predictions.$.description": description || getService.predictions[0].description } },
            { new: true }
        );

        let data = updatedService.predictions.filter((predict)=>{return predict.id == id})[0].toObject();
        delete data._id;
        data.predictions = data.predictions.map(({_id, ...keys}) => keys);
        data.imageURL = await getPredictBlobUrl(data.id);

        res.status(200).json({
            status: "success",
            message: "Successfuly update prediction data",
            data: data
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
    update
}