const imageSignatures = [
    { mime: 'image/jpeg', ext: 'jpg', magic: [0xFF, 0xD8, 0xFF] },
    { mime: 'image/png', ext: 'png', magic: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
    { mime: 'image/gif', ext: 'gif', magic: [0x47, 0x49, 0x46, 0x38] },
    { mime: 'image/webp', ext: 'webp', magic: [0x52, 0x49, 0x46, 0x46], offset: 8, additionalMagic: [0x57, 0x45, 0x42, 0x50] },
    { mime: 'image/bmp', ext: 'bmp', magic: [0x42, 0x4D] },
    { mime: 'image/tiff', ext: 'tiff', magic: [0x49, 0x49, 0x2A, 0x00] },
    { mime: 'image/tiff', ext: 'tiff', magic: [0x4D, 0x4D, 0x00, 0x2A] },
    { mime: 'image/heic', ext: 'heic', magic: [0x00, 0x00, 0x00], offset: 4, additionalMagic: [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63] },
    { mime: 'image/heif', ext: 'heif', magic: [0x00, 0x00, 0x00], offset: 4, additionalMagic: [0x66, 0x74, 0x79, 0x70, 0x6D, 0x69, 0x66, 0x31] },
];

const fileTypeFromBuffer = (buffer) => {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
        return null;
    }

    for (const sig of imageSignatures) {
        let matches = true;

        for (let i = 0; i < sig.magic.length; i++) {
            if (buffer[i] !== sig.magic[i]) {
                matches = false;
                break;
            }
        }

        if (matches && sig.additionalMagic && sig.offset) {
            for (let i = 0; i < sig.additionalMagic.length; i++) {
                if (buffer[sig.offset + i] !== sig.additionalMagic[i]) {
                    matches = false;
                    break;
                }
            }
        }

        if (matches) {
            return { mime: sig.mime, ext: sig.ext };
        }
    }

    return null;
};

module.exports = { fileTypeFromBuffer };
