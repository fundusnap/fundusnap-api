const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
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

    return blobName;
};

const getBlobUrl = async (blobName) => {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Generate SAS token that expires in 1 hour
    const sasToken = generateBlobSASQueryParameters(
        {
            containerName: process.env.AZURE_CONTAINER_NAME,
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
    uploadImageBuffer,
    getBlobUrl
};