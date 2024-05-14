#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const TEST_ITERATIONS = 5; // Number of times to repeat the test for each batch size
const FILE_DIRECTORY = 'assets'; // Replace with the path to your image directory


const localEndpoint = 'http://localhost:3000/api/upload2';
const remoteEndpoint = 'http://128.2.24.80:3000/api/upload2';


const UPLOAD_ENDPOINT = remoteEndpoint; // Replace with your actual endpoint

async function uploadFiles(files: string[]): Promise<number> {
    const form = new FormData();
    files.forEach((file, index) => {
        form.append('file', fs.createReadStream(file), {
            filename: path.basename(file)
        });
    });
    const startTime = Date.now();
    await axios.post(UPLOAD_ENDPOINT, form, {
        headers: form.getHeaders()
    });
    const endTime = Date.now();
    return endTime - startTime;
}

async function performTest() {
    const allFiles = fs.readdirSync(FILE_DIRECTORY).filter(file => {
        const filePath = path.join(FILE_DIRECTORY, file);
        return fs.statSync(filePath).isFile() // Adjust file extension as needed
    }).map(file => path.join(FILE_DIRECTORY, file));
    const batchSizes = [1, 2, 5, 10];
    for (const batchSize of batchSizes) {
        let totalDuration = 0;
        for (let i = 0; i < TEST_ITERATIONS; i++) {
            const selectedFiles = allFiles.slice(0, batchSize);
            const duration = await uploadFiles(selectedFiles);
            totalDuration += duration;
            console.log(`Uploaded ${batchSize} file(s) in ${duration} ms (Iteration ${i + 1})`);
        }
        const averageDuration = totalDuration / TEST_ITERATIONS;
        console.log(`Average duration for uploading ${batchSize} file(s): ${averageDuration} ms`);
    }
}

performTest().catch(console.error);
