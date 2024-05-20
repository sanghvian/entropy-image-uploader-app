"use client"
import React, { useState, useRef } from 'react';
import { Camera } from "react-camera-pro";
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'antd-mobile';
import S3 from 'react-s3';
import toast from 'react-hot-toast'; // Ensure this is imported
import { getBarcode } from '../../utils/openai';
import { addProduct, setProductBarcode, updateProduct } from '../../store/productSlice';
import { RootState } from '../../store';
import './CameraComponent.css'
import { setImagePreviews, setImages, setImagesState } from '../../store/imagesSlice';
import { useRouter } from 'next/navigation';

// S3 Configuration
const config = {
    bucketName: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
    dirName: process.env.NEXT_PUBLIC_S3_DIR_NAME,
    region: process.env.NEXT_PUBLIC_AWS_REGION_NAME,
    accessKeyId: process.env.NEXT_PUBLIC_AWS_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET,
};


export const CameraComponent: React.FC = () => {
    const images = useSelector((state: RootState) => state.images.images);
    const imagePreviews = useSelector((state: RootState) => state.images.imagePreviews);
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
        dispatch(setImagePreviews(
            {
                ...imagePreviews,
                [view]: imageUrl
            }
        ));
        dispatch(setImages(
            {
                ...images,
                [view]: blob
            }
        ));
        setCurrentView(currentView < views.length - 1 ? currentView + 1 : 0);
    };
    const router = useRouter();

    const uploadFileToS3 = async (blob: Blob, filename: string) => {
        const file = new File([blob], activeProductId + filename, { type: 'image/jpeg' });

        return S3.uploadFile(file, config);
    };

    // const uploadFiles = async () => {
    //     dispatch(setImagesState({
    //         imagePreviews,
    //         images
    //     }))
    //     const uploadPromises = Object.entries(images).map(async ([key, blob]) => {
    //         const data = await uploadFileToS3(blob as any, `${productName}_${key}.jpeg`);
    //         return data.location;
    //     });

    //     try {
    //         const imageUrls = await Promise.all(uploadPromises);
    //         dispatch(updateProduct({ productId: activeProductId, imageUrls }));
    //     } catch (error: any) {
    //         console.error('Error while uploading files:', error.message);
    //         toast.error('Failed to upload images');
    //     } finally {
    //         dispatch(setImagesState({
    //             imagePreviews: {},
    //             images: {}
    //         }))
    //         // router.push(`/products`);
    //     }
    // };

    const uploadFiles = async () => {
        const toastId = toast.loading('Uploading images...');
        const formData = new FormData();
        Object.entries(images).forEach(([key, blob]) => {
            const filename = `${activeProductId}_${productName}_${key}.jpeg`; // Creating a unique filename
            formData.append('file', new Blob([(blob as any)], { type: 'image/jpeg' }), filename);
        });

        try {
            // add a sleep for 5 seconds to simulate the upload process
            // await new Promise(resolve => setTimeout(resolve, 5000));

            const response = await fetch('/api/upload2', { // Adjust the API endpoint as necessary
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            dispatch(updateProduct({ productId: activeProductId, imageUrls: data.urls }));
            toast.success('Images uploaded successfully', { id: toastId });
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
        } finally {
            dispatch(setImagesState({
                imagePreviews: {},
                images: {}
            }));
            router.push(`/products`);
        }
    };

    const imagePreviewsLength = Object.keys(imagePreviews).length;
    const lastImagePreviewKey = Object.keys(imagePreviews)[imagePreviewsLength - 1];
    const lastImagePreviewSrc = Object.values(imagePreviews)[imagePreviewsLength - 1];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            alignItems: 'center',
            height: '90vh',
            justifyContent: 'stretch'
        }}>
            <div style={{
                position: 'relative',
                top: '50px',
                width: '96vw',
                height: '600px',
                objectFit: 'cover',
                marginBottom: '20px'
            }}>
                <Camera errorMessages={{
                    noCameraAccessible: 'No camera device accessible. Please connect a camera or use a different device.',
                    permissionDenied: 'Camera permission denied. Please grant permission to use the camera.'
                }} ref={cameraRef} />
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    color: '#fff',
                    backgroundColor: 'transparent',
                    // padding: '5px',
                    borderRadius: '5px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '90vw',
                    display: 'flex',
                    height: '550px',
                    border: '2px dashed #fff'
                }}>

                    <span
                    >{views[currentView].toUpperCase()}</span>
                    {activeProduct?.productBarcode && <div>Barcode: {activeProduct.productBarcode}</div>}
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    marginTop: '80px',
                    alignItems: 'center',
                }}
            >
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: 20,
                    width: '300px'
                }}>

                    {lastImagePreviewKey && <div key={lastImagePreviewKey}
                        onClick={() => router.push(`/gallery`)}
                        style={{ margin: 10, position: 'relative' }}>
                        <img src={lastImagePreviewSrc as any} alt={`${lastImagePreviewKey} view`} style={{ width: 100, height: 100 }} />
                    </div>}
                </div>
                <div style={{
                    width: '200px'
                }}>
                    <button
                        className="camera-button"
                        onClick={handleCapture}
                        disabled={Object.keys(images).length >= views.length}
                    >
                        <span style={{ visibility: 'hidden' }}>Capture</span>
                    </button>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Button
                        onClick={uploadFiles}
                        disabled={Object.keys(images).length < views.length}
                        style={{
                            width: '110px',
                            margin: '1rem'
                        }}>
                        Upload
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default CameraComponent;
