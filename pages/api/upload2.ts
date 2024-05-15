import { NextApiRequest, NextApiResponse } from 'next';
import { BlobServiceClient } from "@azure/storage-blob";
import { IncomingForm, File } from 'formidable';
import { v4 as uuidv4 } from 'uuid';

const AZURE_CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_CONNECTION_STRING!;
const AZURE_CONTAINER_NAME = process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME!;
console.log(AZURE_CONNECTION_STRING, AZURE_CONTAINER_NAME);

export const config = {
    api: {
        bodyParser: false, // Required for formidable when handling "multipart/form-data"
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing the form:', err);
            res.status(500).send("Failed to parse form");
            return;
        }

        const fileEntries = Object.entries(files);
        if (fileEntries.length === 0) {
            res.status(400).send('No files were uploaded.');
            return;
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

        const uploadPromises = fileEntries.map(async ([key, file]: any) => {
            try {
                const blobName = `${uuidv4()}-${file.originalFilename}`;
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                console.log(`Uploading file: ${file.filepath} as ${blobName}`);

                await blockBlobClient.uploadFile(file.filepath);

                console.log(`Upload successful: ${blockBlobClient.url}`);
                return blockBlobClient.url; // Return the URL of the uploaded file
            } catch (error: any) {
                console.error(`Upload of file '${file.originalFilename}' failed:`, error.message);
                throw new Error('Failed to upload file');
            }
        });

        try {
            const urls = await Promise.all(uploadPromises);
            res.status(200).json({ urls });
        } catch (error) {
            console.error('Error uploading files:', error);
            res.status(500).json({ error: 'Failed to upload all files' });
        }
    });
}
