"use client"
// src/components/CameraComponent.tsx
import React, { useState, useRef } from 'react';
import { Camera } from "react-camera-pro";
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'antd-mobile';
import S3 from 'react-s3';
import toast from 'react-hot-toast'; // Ensure this is imported
import { getBarcode } from '../../utils/openai';
import { addProduct, setProductBarcode, updateProduct } from '../../store/productSlice';
import { RootState } from '../../store';

// S3 Configuration
const config = {
    bucketName: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
    dirName: process.env.NEXT_PUBLIC_S3_DIR_NAME,
    region: process.env.NEXT_PUBLIC_AWS_REGION_NAME,
    accessKeyId: process.env.NEXT_PUBLIC_AWS_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET,
};


export const CameraComponent: React.FC = () => {
    const [images, setImages] = useState<{ [key: string]: string }>({});
    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
    const [currentView, setCurrentView] = useState(0);
    const views = ['front', 'back', 'barcode', 'top'];
    const cameraRef = useRef<any>(null);
    const dispatch = useDispatch();

    const activeProductId = useSelector((state: RootState) => state.product.activeProductId);
    const activeProduct = useSelector((state: RootState) => state.product.products.find(product => product.id === activeProductId));
    const productName = activeProduct?.name || '';

    const handleCapture = async () => {
        if (cameraRef.current) {
            const view = views[currentView];
            const imageData: any = cameraRef.current.takePhoto();
            if (imageData instanceof Blob) {
                const imageUrl = URL.createObjectURL(imageData);
                processImageCapture(imageData as any, imageUrl);
            } else if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
                const blob = dataURItoBlob(imageData);
                const imageUrl = URL.createObjectURL(blob);
                processImageCapture(blob as any, imageUrl);
            } else {
                console.error('Unsupported data type returned from takePhoto:', typeof imageData);
            }
        }
    };

    const dataURItoBlob = (dataURI: string) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const processImageCapture = (blob: string, imageUrl: string) => {
        const view = views[currentView];
        setImagePreviews(prev => ({ ...prev, [view]: imageUrl }));
        setImages(prev => ({ ...prev, [view]: blob }));
        setCurrentView(currentView < views.length - 1 ? currentView + 1 : 0);
    };

    const uploadFileToS3 = async (blob: Blob, filename: string) => {
        const file = new File([blob], activeProductId + filename, { type: 'image/jpeg' });
        return S3.uploadFile(file, config);
    };

    const uploadFiles = async () => {
        const uploadPromises = Object.entries(images).map(async ([key, blob]) => {
            const data = await uploadFileToS3(blob as any, `${productName}_${key}.jpeg`);
            return data.location;
        });

        try {
            const imageUrls = await Promise.all(uploadPromises);
            dispatch(updateProduct({ productId: activeProductId, imageUrls }));
        } catch (error: any) {
            console.error('Error while uploading files:', error.message);
            toast.error('Failed to upload images');
        }
    };

    const handleRemoveImage = (view: string) => {
        const updatedImages = { ...images };
        const updatedPreviews = { ...imagePreviews };
        delete updatedImages[view];
        delete updatedPreviews[view];
        setImages(updatedImages);
        setImagePreviews(updatedPreviews);
        setCurrentView(views.indexOf(view)); // Set current view to retake photo
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className='camera-container' style={{ position: 'relative', width: '300px', height: '400px', marginBottom: '20px' }}>
                <Camera errorMessages={{
                    noCameraAccessible: 'No camera device accessible. Please connect a camera or use a different device.',
                    permissionDenied: 'Camera permission denied. Please grant permission to use the camera.'
                }} ref={cameraRef} />
                <div className='camera-view-container' style={{
                    position: 'absolute', top: '10px', left: '10px', color: '#fff', backgroundColor: 'transparent', padding: '5px', borderRadius: '5px', justifyContent: 'center', alignItems: 'center',
                    width: '260px', display: 'flex',
                    height: '340px',
                    border: '2px dashed #fff'
                }}>

                    <span
                    >{views[currentView].toUpperCase()}</span>
                    {activeProduct?.productBarcode && <div>Barcode: {activeProduct.productBarcode}</div>}
                </div>
            </div>
            <Button onClick={handleCapture} disabled={Object.keys(images).length >= views.length} style={{ marginBottom: '20px', width: '150px' }}>Capture</Button>
            <Button onClick={uploadFiles} disabled={Object.keys(images).length < views.length} style={{ marginBottom: '20px', width: '150px' }}>Done</Button>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
                {Object.entries(imagePreviews).map(([key, src]) => (
                    <div key={key} style={{ margin: 10, position: 'relative' }}>
                        <img src={src} alt={`${key} view`} style={{ width: 100, height: 100 }} />
                        <Button
                            style={{
                                padding: '5px 10px',
                                backgroundColor: 'red',
                                color: 'white',
                                border: 'none',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                cursor: 'pointer',
                                zIndex: 5,
                            }}
                            onClick={() => handleRemoveImage(key)}
                        >X</Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CameraComponent;
