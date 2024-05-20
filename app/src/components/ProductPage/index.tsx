
import { RootState } from '@/app/src/store';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';


const ProductPage: React.FC = () => {
    const router = useRouter();
    const activeProductId = useSelector((state: RootState) => state.product.activeProductId);
    const product = useSelector((state: RootState) => state.product.products.find(product => product.id === activeProductId));

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                background: '#000',
                padding: '2rem'
            }}
        >
            {product !== undefined &&
                <>
                    <h1
                        style={{ textAlign: 'center' }}
                    >{product.name}</h1>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            rowGap: '20px',
                            columnGap: '20px',
                        }}
                    >
                        {product.imageUrls.map((imageUrl, index) => (
                            <div key={imageUrl}>
                                <img
                                    height="200"
                                    src={imageUrl}
                                    alt={`Product Image ${index + 1}`}
                                />
                                <p style={{ textAlign: 'center' }}>
                                    {getImageLabel(index)}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            }
        </div>
    );

    function getImageLabel(index: number): string {
        switch (index) {
            case 0:
                return 'front';
            case 1:
                return 'back';
            case 2:
                return 'top';
            case 3:
                return 'barcode';
            default:
                return '';
        }
    }
};

export default ProductPage;

