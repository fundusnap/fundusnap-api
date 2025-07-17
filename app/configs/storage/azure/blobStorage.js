const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const path = require("path");

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const predictContainerClient = blobServiceClient.getContainerClient("predict");

const uploadPredictImageBuffer = async (buffer, id, mimetype) => {
    const blobName = id;
    
    const blockBlobClient = predictContainerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
            blobContentType: mimetype
        }
    });

    return blobName;
};

const getPredictBlobUrl = async (blobName) => {
    const blockBlobClient = predictContainerClient.getBlockBlobClient(blobName);
    
    // Generate SAS token that expires in 1 hour
    const sasToken = generateBlobSASQueryParameters(
        {
            containerName: "predict",
            blobName: blobName,
            permissions: BlobSASPermissions.parse("r"), // Read only
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
        },
        blobServiceClient.credential
    ).toString();

    return `${blockBlobClient.url}?${sasToken}`;
};

const detectContainerClient = blobServiceClient.getContainerClient("detect");

const uploadDetectImageBuffer = async (buffer, id, mimetype) => {
    const blobName = id;
    
    const blockBlobClient = detectContainerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
            blobContentType: mimetype
        }
    });

    return blobName;
};

const getDetectBlobUrl = async (blobName) => {
    const blockBlobClient = detectContainerClient.getBlockBlobClient(blobName);
    
    // Generate SAS token that expires in 1 hour
    const sasToken = generateBlobSASQueryParameters(
        {
            containerName: "detect",
            blobName: blobName,
            permissions: BlobSASPermissions.parse("r"), // Read only
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
        },
        blobServiceClient.credential
    ).toString();

    return `${blockBlobClient.url}?${sasToken}`;
};

module.exports = {
    uploadPredictImageBuffer,
    getPredictBlobUrl,
    uploadDetectImageBuffer,
    getDetectBlobUrl
};