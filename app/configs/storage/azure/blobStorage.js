const { BlobServiceClient } = require('@azure/storage-blob');
const path = require("path");

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

const uploadImageBuffer = async (buffer, id, mimetype) => {
    const blobName = id;
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
            blobContentType: mimetype
        }
    });

    return blockBlobClient.url;
};

module.exports = uploadImageBuffer;