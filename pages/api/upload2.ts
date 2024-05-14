import { NextApiRequest, NextApiResponse } from 'next';
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import Busboy from 'busboy';
import { Worker } from 'worker_threads'

const AZURE_CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_CONNECTION_STRING!
const AZURE_SAS_TOKEN = process.env.NEXT_PUBLIC_AZURE_SAS_TOKEN!
const AZURE_CONTAINER_NAME = process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const uploadPromises: Promise<any>[] = [];
    const busboy = Busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });

    busboy.on('file', function (fieldname: any, file: any, fname: any) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

        const fileName = `${Date.now()}-${fname.filename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        const streamUploadPromise = new Promise((resolve, reject) => {
            blockBlobClient.uploadStream(file, undefined, undefined, { blobHTTPHeaders: { blobContentType: fname.mimeType } })
                .then(response => {
                    // Create a URL to the uploaded blob
                    const url = blockBlobClient.url;
                    console.log(`Upload of '${fileName}' complete`);
                    resolve(url);
                })
                .catch(error => {
                    console.error(`Upload of '${fileName}' failed`, error);
                    reject(error);
                });
        });

        uploadPromises.push(streamUploadPromise);
        //     // In this case "fieldname" is "file"
        //     // Sample "fname" object looks like this - {"filename":"IMG_0235.HEIC","encoding":"7bit","mimeType":"image/heic"}
        //     const fileData: Buffer[] = [];
        //     const fileName = fname.filename;
        //     console.log(`Upload of '${fname.filename}' started`)
        //     file.on('data', (data: any) => {
        //         fileData.push(data);
        //     });
        // file.on('error', (error: any) => {
        //     console.error('Error with file stream:', error);
        // });
        // file.on('end', async function () {
        //     const worker = new Worker('./worker-upload.cjs');
        //     const workerPromise = new Promise((resolve, reject) => {
        //         worker.on('message', (data: any) => {
        //             if (data.status === 'success') {
        //                 console.log(`Upload of '${fileName}' complete`, { data })
        //                 resolve(data);
        //             } else {
        //                 console.log(`Upload of '${fileName}' failed`, { error: data.error })
        //                 reject(data.error);
        //             }
        //         });
        //         worker.on('error', (err) => {
        //             console.log(`Upload of '${fileName}' failed`, { err })
        //             reject(err);
        //         });
        //     });
        //     uploadPromises.push(workerPromise); // Push each worker promise into the array
        //     worker.postMessage({
        //         fileData: fileData,
        //         fileName: fileName,
        //         AZURE_CONNECTION_STRING: AZURE_CONNECTION_STRING,
        //         AZURE_SAS_TOKEN: AZURE_SAS_TOKEN,
        //         AZURE_CONTAINER_NAME: AZURE_CONTAINER_NAME,
        //     });

        //     // worker.on('message', (data: any, error: any) => {
        //     //     if (data.status === 'success') {
        //     //         console.log(`Upload of '${fileName}' complete`, { data })
        //     //         // res.status(201).json({ data })
        //     //     } else {
        //     //         // Handle error
        //     //         console.log(`Upload of '${fileName}' failed`, { error })
        //     //         res.status(400).json({ error })

        //     //     }
        //     // });

        //     // worker.on('error', (err) => {
        //     //     console.log(`Upload of '${fileName}' failed`, { err })
        //     // });

        //     // worker.on('exit', (code) => {
        //     //     if (code !== 0) {
        //     //         console.error(`Worker stopped with exit code ${code}`);
        //     //     }
        //     // });
        // });
    });

    busboy.on('finish', async function () {
        try {
            const results = await Promise.all(uploadPromises); // Wait for all worker promises to resolve
            console.log('Uploaded files', results);
            return res.status(200).json({ urls: results });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to upload all files' });
        }
    });
    busboy.on('error', function (error) {
        console.error('Error parsing form:', error);
        res.status(500).send("Failed to parse form");
    });



    if (req.method === 'POST') {
        req.pipe(busboy).on('finish', busboy.end);
    }
}
export const config = {
    api: {
        bodyParser: false,
    },
};