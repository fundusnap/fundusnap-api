const { R2 } = require('node-cloudflare-r2');

const r2 = new R2({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
});

const bucket = r2.bucket(process.env.R2_BUCKET);

bucket.provideBucketPublicUrl(process.env.R2_PUBLIC_URL);

const uploadPredictImageBuffer = async (buffer, id, mimetype) => {
    const key = `predict/${id}`;
    const upload = await bucket.upload(buffer, key, undefined, mimetype);
    return id;
};

const getPredictBlobUrl = async (blobName) => {
    return `${process.env.R2_PUBLIC_URL}predict/${blobName}`;
};

const uploadDetectImageBuffer = async (buffer, id, mimetype) => {
    const key = `detect/${id}`;
    const upload = await bucket.upload(buffer, key, undefined, mimetype);
    return id;
};

const getDetectBlobUrl = async (blobName) => {
    return `${process.env.R2_PUBLIC_URL}detect/${blobName}`;
};

module.exports = {
    uploadPredictImageBuffer,
    getPredictBlobUrl,
    uploadDetectImageBuffer,
    getDetectBlobUrl
};
