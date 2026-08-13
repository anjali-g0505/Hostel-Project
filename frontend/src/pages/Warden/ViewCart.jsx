import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import OrderCard from './components/OrderCard.jsx' // Corrected component name
import './ViewCart.css';


function ViewCart() {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const paymentStatus = searchParams.get('payment');

    useEffect(() => {
        fetchOrders();
    }, []);

    const dismissPaymentBanner = () => {
        setSearchParams(params => {
            params.delete('payment');
            return params;
        }, { replace: true });
    };

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleError("Please login again.");
                return navigate('/login');
            }
            
            const url = `http://localhost:8080/api/view-my-orders`; 
            const response = await fetch(url, { 
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json(); 
            if (result.success) {
                setOrders(result.orders);
            } else {
                handleError(result.message);
            }
        } catch (error) {
            handleError("Orders could not be fetched.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="take-order-page"><h2 className="loading-text">Loading Your Orders...</h2></div>;
    }

    return (
        <div className="take-order-page">
            <ToastContainer />

            {paymentStatus === 'success' && (
                <div className="payment-banner success">
                    <div className="payment-banner-content">
                        <span className="payment-banner-icon">✓</span>
                        <div className="payment-banner-text">
                            <strong>Payment successful!</strong>
                            <span>Please wait while your order is being prepared.</span>
                        </div>
                    </div>
                    <button className="payment-banner-close" onClick={dismissPaymentBanner} aria-label="Dismiss">×</button>
                </div>
            )}

            {paymentStatus === 'failed' && (
                <div className="payment-banner failed">
                    <div className="payment-banner-content">
                        <span className="payment-banner-icon">×</span>
                        <div className="payment-banner-text">
                            <strong>Payment was not successful.</strong>
                            <span>Please try again.</span>
                        </div>
                    </div>
                    <button className="payment-banner-close" onClick={dismissPaymentBanner} aria-label="Dismiss">×</button>
                </div>
            )}

            <h1 style={{ textAlign: 'center' }}>Your Cart</h1>

            {orders.length > 0 ? (
                <div className="order-list-container view-cart-list">
                    {orders.map(order => (
                        <OrderCard
                            key={order._id}
                            id={order._id}
                            // name={order.studentID?.name}
                            items={order.items} 
                            totalAmount={order.totalAmount} 
                            date={order.createdAt}
                            instructions={order.specialInstructions}
                            status={order.status}
                            category={order.category}
                        />
                    ))}
                </div>
            ) : (
                <p className="no-orders-msg">Please request an order first</p>
            )}
        </div>
    );
}

export default ViewCart;