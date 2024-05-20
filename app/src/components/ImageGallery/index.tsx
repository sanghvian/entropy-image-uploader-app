import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';
import './ImageGallery.css';
import { RootState } from '../../store';
import { removeImage, setImagesState } from '../../store/imagesSlice';
import { useRouter } from 'next/router';
import { BackwardOutlined, CameraOutlined, UploadOutlined } from '@ant-design/icons';
import S3 from 'react-s3';
import { updateProduct } from '../../store/productSlice';
import toast from 'react-hot-toast';

// S3 Configuration
const config = {
    bucketName: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
    dirName: process.env.NEXT_PUBLIC_S3_DIR_NAME,
    region: process.env.NEXT_PUBLIC_AWS_REGION_NAME,
    accessKeyId: process.env.NEXT_PUBLIC_AWS_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET,
};


export const ImageGallery = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const activeProductId = useSelector((state: RootState) => state.product.activeProductId);
    const { images, imagePreviews } = useSelector((state: RootState) => state.images);
    const activeProduct = useSelector((state: RootState) => state.product.products.find(product => product.id === activeProductId));
    const productName = activeProduct?.name || '';
    const imagePreviewsLength = Object.keys(imagePreviews).length;

    const uploadFileToS3 = async (blob: Blob, filename: string) => {
        const file = new File([blob], activeProductId + filename, { type: 'image/jpeg' });

        return S3.uploadFile(file, config);
    };

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
            console.log(data);
            dispatch(updateProduct({ productId: activeProductId, imageUrls: data.urls }));
            toast.success('Images uploaded successfully', { id: toastId });
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images', { id: toastId });
        } finally {
            dispatch(setImagesState({
                imagePreviews: {},
                images: {}
            }));
            router.push(`/products`);
        }
    };


    const handleRemoveImage = (key: any) => {
        dispatch(removeImage(key));
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                height: '90vh'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '90vh',
                    backgroundColor: '#000',
                }}
            >
                {imagePreviewsLength > 0 ? <div className="gallery-container">
                    {Object.entries(imagePreviews).map(([key, src]) => (
                        <div key={key} className="image-wrapper">
                            <img src={src as any} alt={`${key} view`} className="image-preview" />
                            <Button className="remove-button" onClick={() => handleRemoveImage(key)}>
                                x
                            </Button>
                        </div>
                    ))}
                </div> : <p>No images clicked yet! Please click images to preview here</p>}
            </div>
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '7rem',
                    gap: '1rem'

                }}
            >
                <Button
                    onClick={() => { router.push(`/camera`) }}
                    icon={<CameraOutlined />}
                >
                    Back to camera
                </Button>
                <Button
                    type="primary"
                    onClick={uploadFiles}
                    icon={<UploadOutlined />}
                >
                    Upload
                </Button>
                <Button
                    onClick={() => { router.push(`/products`) }}

                    icon={<BackwardOutlined />}
                >
                    Back to Products
                </Button>
            </div>
        </div>

    );
};

export default ImageGallery;
