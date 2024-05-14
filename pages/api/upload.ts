import { NextApiRequest, NextApiResponse } from 'next';
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import Busboy from 'busboy';

const AZURE_CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_CONNECTION_STRING
const AZURE_SAS_TOKEN = process.env.NEXT_PUBLIC_AZURE_SAS_TOKEN
const AZURE_CONTAINER_NAME = process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME

function uploadToAzure(fileData: Buffer[], fileName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING as string);
        const sasToken = AZURE_SAS_TOKEN as string;
        const containerName = AZURE_CONTAINER_NAME as string;
        const containerUrl = blobServiceClient.getContainerClient(containerName).url + sasToken;
        const containerClient = new ContainerClient(containerUrl);
        const blobClient = containerClient.getBlobClient(fileName);
        const blockBlobClient = blobClient.getBlockBlobClient();
        const finalFileBuffer = Buffer.concat(fileData);

        try {
            const response = await blockBlobClient.upload(finalFileBuffer, finalFileBuffer.length);
            resolve(response);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }



    const uploadPromises: Promise<any>[] = [];
    const busboy = Busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });

    busboy.on('file', function (fieldname: any, file: any, fname: any) {
        // In this case "fieldname" is "file"
        // Sample "fname" object looks like this - {"filename":"IMG_0235.HEIC","encoding":"7bit","mimeType":"image/heic"}
        const fileData: Buffer[] = [];
        const fileName = fname.filename;
        console.log(`Upload of '${fname.filename}' started`)
        file.on('data', (data: any) => {
            fileData.push(data);
        });
        file.on('error', (error: any) => {
            console.error('Error with file stream:', error);
        });
        file.on('end', async function () {
            const uploadPromise = new Promise(async (resolve, reject) => {
                try {
                    const response = await uploadToAzure(fileData, fileName as string);
                    resolve(response);
                } catch (error) {
                    res.status(500).send("Failed to upload file");
                    reject(error);
                    throw error;
                }
            });

            uploadPromises.push(uploadPromise);
        });
    });

    busboy.on('finish', async function () {
        try {
            const results = await Promise.all(uploadPromises);
            return res.status(200).json({ results });
        } catch (error) {
            console.log(error);
            return res.status(403).send(error);
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


// ! BELOW IS THE CODE FOR uploadStream
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         return res.status(405).end();
//     }



//     const uploadPromises: Promise<any>[] = [];
//     const busboy = Busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });

//     busboy.on('file', function (fieldname: any, file: any, fname: any) {
//         // In this case "fieldname" is "file"
//         // Sample "fname" object looks like this - {"filename":"IMG_0235.HEIC","encoding":"7bit","mimeType":"image/heic"}
//         const fileData: Buffer[] = [];
//         const fileName = fname.filename;
//         console.log(`Upload of '${fname.filename}' started`)
//         file.on('data', (data: any) => {
//             fileData.push(data);
//         });
//         file.on('error', (error: any) => {
//             console.error('Error with file stream:', error);
//         });
//         file.on('end', async function () {
//             const uploadPromise = new Promise(async (resolve, reject) => {
//                 try {
//                     const response = await uploadToAzure(fileData, fileName as string);
//                     resolve(response);
//                 } catch (error) {
//                     res.status(500).send("Failed to upload file");
//                     reject(error);
//                     throw error;
//                 }
//             });

//             uploadPromises.push(uploadPromise);
//         });
//     });

//     busboy.on('finish', async function () {
//         try {
//             const results = await Promise.all(uploadPromises);
//             return res.status(200).json({ results });
//         } catch (error) {
//             console.log(error);
//             return res.status(403).send(error);
//         }
//     });
//     busboy.on('error', function (error) {
//         console.error('Error parsing form:', error);
//         res.status(500).send("Failed to parse form");
//     });



//     if (req.method === 'POST') {
//         req.pipe(busboy).on('finish', busboy.end);
//     }
// }
// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };


// import { NextApiRequest, NextApiResponse } from 'next';
// import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
// import Busboy from 'busboy';

// const AZURE_CONNECTION_STRING = process.env.NEXT_PUBLIC_AZURE_CONNECTION_STRING
// const AZURE_SAS_TOKEN = process.env.NEXT_PUBLIC_AZURE_SAS_TOKEN
// const AZURE_CONTAINER_NAME = process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME

// function uploadToAzure(fileData: any, fileName: string): Promise<any> {
//     console.log(`Uploading '${fileName}' to Azure`)
//     return new Promise(async (resolve, reject) => {
//         const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING as string);
//         const sasToken = AZURE_SAS_TOKEN as string;
//         const containerName = AZURE_CONTAINER_NAME as string;
//         const containerUrl = blobServiceClient.getContainerClient(containerName).url + sasToken;
//         const containerClient = new ContainerClient(containerUrl);
//         const blobClient = containerClient.getBlobClient(fileName);
//         const blockBlobClient = blobClient.getBlockBlobClient();

//         try {
//             const response = await blockBlobClient.uploadStream(fileData)
//             console.log(`Upload of '${fileName}' complete`)
//             resolve(response);
//         } catch (error) {
//             console.log(error);
//             reject(error);
//         }
//     });
// }


// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         return res.status(405).end();
//     }



//     const uploadPromises: Promise<any>[] = [];
//     const busboy = Busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });

//     busboy.on('file', function (fieldname: any, file: any, fname: any) {
//         // In this case "fieldname" is "file"
//         // Sample "fname" object looks like this - {"filename":"IMG_0235.HEIC","encoding":"7bit","mimeType":"image/heic"}
//         // const fileData: Buffer[] = [];
//         const fileName = fname.filename;
//         console.log(`Upload of '${fname.filename}' started`)
//         // file.on('data', (data: any) => {
//         //     fileData.push(data);
//         // });
//         file.on('error', (error: any) => {
//             console.error('Error with file stream:', error);
//         });
//         file.on('end', async function () {
//             const uploadPromise = new Promise(async (resolve, reject) => {
//                 try {
//                     const response = await uploadToAzure(file, fileName as string);
//                     resolve(response);
//                 } catch (error) {
//                     res.status(500).send("Failed to upload file");
//                     reject(error);
//                     throw error;
//                 }
//             });

//             uploadPromises.push(uploadPromise);
//         });
//     });

//     busboy.on('finish', async function () {
//         try {
//             const results = await Promise.all(uploadPromises);
//             return res.status(200).json({ results });
//         } catch (error) {
//             console.log(error);
//             return res.status(403).send(error);
//         }
//     });
//     busboy.on('error', function (error) {
//         console.error('Error parsing form:', error);
//         res.status(500).send("Failed to parse form");
//     });



//     if (req.method === 'POST') {
//         req.pipe(busboy).on('finish', busboy.end);
//     }
// }
// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };