// use client
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, List, Input } from 'antd-mobile';
import toast from 'react-hot-toast';
import { FloatButton, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import './AddProduct.module.css';
import { addProduct, setActiveProductId } from '../../store/productSlice';
import { CameraComponent } from '../CameraComponent';

export const AddProduct: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const dispatch = useDispatch();
    const products = useSelector((state: RootState) => state.product.products);
    const [cameraActive, setCameraActive] = useState(false);

    const handleCreateProduct = () => {
        if (!productName) {
            toast.error('Please enter a product name.');
            return;
        }
        const newProductId = `${productName}-${Date.now()}`;
        dispatch(addProduct({ name: productName, imageUrls: [] }));
        dispatch(setActiveProductId(newProductId));
        setProductName('');
        setCameraActive(true);
        setIsModalVisible(false); // Close the modal
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setProductName(''); // Clear the input when modal is closed
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            color: '#fff'
        }}>
            <h2 style={{ textAlign: 'center', color: "#fff" }}>Products List</h2>
            {cameraActive ? <CameraComponent productName={productName} /> : (
                <>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#000',
                        color: '#fff'
                    }}>
                        <FloatButton icon={<PlusOutlined />} onClick={handleOpenModal} />
                        {/* <Modal
                            visible={isModalVisible}
                            title="Enter Product Name"
                            // onClose={handleCloseModal}
                            footer={[
                                <Button key="cancel" onClick={handleCloseModal}>Cancel</Button>,
                                <Button key="submit" onClick={handleCreateProduct}>Add Product</Button>
                            ]}
                        >
                            <Input
                                clearable
                                value={productName}
                                onChange={setProductName}
                                placeholder="Enter product name"
                                style={{ marginBottom: '10px' }}
                            />
                        </Modal>
                        <List style={{ marginTop: '20px' }}>
                            {products.map((product, index) => (
                                <List.Item key={index} onClick={() => { dispatch(setActiveProductId(product.name)); setCameraActive(true); }}>
                                    <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                    <div>Images: {product.imageUrls.length}</div>
                                    {product.productBarcode && <div>Barcode: {product.productBarcode}</div>}
                                </List.Item>
                            ))}
                        </List> */}
                    </div>
                </>
            )}
        </div>
    );
};

export default AddProduct;