"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import toast from "react-hot-toast";
import { addProduct, setActiveProductId } from "../../store/productSlice";
import { Button, FloatButton, Input, List, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export const ProductsList = () => {
    const [productName, setProductName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const products = useSelector((state: RootState) => state.product.products);

    const handleCreateProduct = () => {
        if (!productName) {
            toast.error('Please enter a product name.');
            return;
        }
        const newProductId = `${productName}-${Date.now()}`;
        dispatch(addProduct({
            name: productName,
            imageUrls: [],
            id: newProductId,
            productBarcode: ''
        }));
        dispatch(setActiveProductId(newProductId));
        setProductName('');
        setIsModalVisible(false); // Close the modal
        router.push(`/camera`);
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
            height: '90vh',
            margin: 0,
            padding: 0,
            backgroundColor: '#000',
            color: '#fff'
        }}>
            <h2 style={{ textAlign: 'center', color: "#fff" }}>Products List</h2>
            <List>
                {products.map((product, index) => (
                    <List.Item key={index} onClick={() => {
                        dispatch(setActiveProductId(product.name))
                        router.push(`/camera`)
                    }}>
                        <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                        <div>Images: {product.imageUrls.length}</div>
                        {product.productBarcode && <div>Barcode: {product.productBarcode}</div>}
                    </List.Item>
                ))}
            </List>
            <FloatButton icon={<PlusOutlined />} onClick={handleOpenModal} />
            <Modal
                visible={isModalVisible}
                title="Enter Product Name"
                footer={[
                    <Button key="cancel" onClick={handleCloseModal}>Cancel</Button>,
                    <Button key="submit" onClick={handleCreateProduct}>Add Product</Button>
                ]}
            >
                <Input
                    value={productName}
                    onChange={(e: any) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    style={{ marginBottom: '10px' }}
                />
            </Modal>
        </div>
    );
}


export default ProductsList;