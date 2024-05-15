"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import toast from "react-hot-toast";
import { addProduct, setActiveProductId } from "../../store/productSlice";
import { Button, Card, FloatButton, Input, List, Modal } from "antd";
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
            <div
                style={{
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    rowGap: '20px',
                    columnGap: '20px',

                }}
            >
                {products.map((product, index) => (
                    <Card
                        style={{
                            width: '100%',
                        }}
                        key={index}
                        onClick={() => {
                            dispatch(setActiveProductId(product.name))
                            router.push(`/camera`)
                        }}
                    >
                        <Card.Meta
                            title={product.name}
                            description={`Images: ${product.imageUrls.length}`}
                        />
                        {product.imageUrls.length > 0 && (
                            <img
                                src={product.imageUrls[0]}
                                alt={product.name}
                                style={{ width: '70%', height: 'auto' }}
                            />
                        )}
                        {product.productBarcode && (
                            <div>Barcode: {product.productBarcode}</div>
                        )}
                    </Card>
                ))}
            </div>
            <FloatButton icon={<PlusOutlined />} onClick={handleOpenModal} />
            <Modal
                visible={isModalVisible}
                closable={true}
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
        </div >
    );
}


export default ProductsList;