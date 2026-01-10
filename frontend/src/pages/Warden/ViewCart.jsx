import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils'; 
import OrderCard from './components/OrderCard.jsx' // Corrected component name


function ViewCart() { 
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders(); 
    }, []); 

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
            <h1 style={{ textAlign: 'center' }}>Your Cart</h1>
            
            {orders.length > 0 ? (
                <div className="order-list-container">
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