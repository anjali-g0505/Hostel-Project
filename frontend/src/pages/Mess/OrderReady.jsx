import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleSuccess, handleError } from '../utils';
import AcceptedOrderCard from '../Mess/Components/AcceptedOrderCard';
import { socket } from '../../socket';
import './OrderReady.css';

function OrderReady() {
    const [isLoading, setIsLoading] = useState(true);
    const [acceptedOrders, setAcceptedOrders] = useState([]);
    const [activeCategory, setActiveCategory] = useState('breakfast');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAcceptedOrders(activeCategory);
    }, [activeCategory]);

    // Live updates from mess-room: orders that just got paid appear instantly, and orders
    // marked Ready (from this device or another) update in place - they stay visible here
    // so the mess can still verify them when the order is collected.
    useEffect(() => {
        const handleOrderPaid = (order) => {
            if (order.category !== activeCategory) return;
            setAcceptedOrders(prev => prev.some(o => o._id === order._id) ? prev : [...prev, order]);
        };

        const handleOrderReady = (order) => {
            if (order.category !== activeCategory) return;
            setAcceptedOrders(prev => {
                const exists = prev.some(o => o._id === order._id);
                if (exists) return prev.map(o => o._id === order._id ? order : o);
                return [...prev, order];
            });
        };

        // Missed events aren't replayed, so resync with a fresh fetch after a reconnect.
        const handleReconnect = () => fetchAcceptedOrders(activeCategory);

        socket.on('order:paid', handleOrderPaid);
        socket.on('order:ready', handleOrderReady);
        socket.on('connect', handleReconnect);
        return () => {
            socket.off('order:paid', handleOrderPaid);
            socket.off('order:ready', handleOrderReady);
            socket.off('connect', handleReconnect);
        };
    }, [activeCategory]);

    const fetchAcceptedOrders = async (category) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false); 
                handleError("Token expired, please login in again.");
                return navigate('/login');
            }
            
            const url = `http://localhost:8080/api/${category}/get-paid-orders`;
            const response = await fetch(url, { 
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                handleError("Session expired. Please log in again.");
                localStorage.clear();
                return navigate('/login');
            }
            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }
            
            const result = await response.json(); 
            if (result.success) {
                setAcceptedOrders(result.orders);
            } else {
                handleError(result.message || "An error occurred.");
                setAcceptedOrders([]); // Clear on error
            }
        } catch (error) {
            const errorMsg = error.message || "An unknown error occurred";
            console.error("Orders could not be fetched:", errorMsg);
            toast.error("Orders could not be fetched. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusToggle = async (id, newStatus) => {
        const token = localStorage.getItem('token');
        if (!token) {
            handleError("Token expired, please login in again.");
            return navigate('/login');
        }

        const API_URL = `http://localhost:8080/api/${id}/change-order-status`; 

        try {
            const response = await fetch(API_URL, {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.status === 401 || response.status === 403) {
                handleError("Session expired. Please log in again.");
                localStorage.clear();
                return navigate('/login');
            }
            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                handleSuccess(result.message || `Order marked as ${newStatus}`);

                // Keep it in the list, marked as Ready, so it stays visible for pickup verification.
                setAcceptedOrders(prevOrders =>
                    prevOrders.map(order => order._id === id ? { ...order, status: newStatus } : order)
                );
            } else {
                handleError(result.message || "Could not update status.");
            }
        } catch (error) {
            console.error("Status toggle error:", error);
            handleError("A network error occurred. Please try again.");
        }
    };

    // ..................................................
    if (isLoading) {
        return <div className="take-order-page"><h2 className="loading-text">तुम्ही स्वीकारलेले ऑर्डर लोड करत आहे</h2></div>
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="take-order-page">
                {/* Category Tabs */}
                <div className="category-tabs">
                    {['breakfast', 'lunch', 'snacks', 'dinner'].map(cat => (
                        <button
                            key={cat} 
                            className={activeCategory === cat ? 'active' : ''}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <h1 className="take-order-title">ऑर्डर पूर्ण झाल्यावर "तयार" असे चिन्हांकित करा.</h1>
                
                {acceptedOrders.length > 0 ? (
                    <div className="order-list-container">
                        {acceptedOrders.map(order => (
                            <AcceptedOrderCard
                                key={order._id}
                                id={order._id}
                                name={order.studentID?.name}
                                mobile={order.studentID?.mobile} 
                                role={order.studentID?.role} 
                                date={order.createdAt}
                                items={order.items}
                                totalAmount={order.totalAmount}
                                instructions={order.specialInstructions}
                                status={order.status}
                                onStatusToggle={handleStatusToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="no-orders-msg">
                        कृपया आधी काही ऑर्डर स्वीकारा..
                    </p>
                )}
            </div>
        </>
    );
}

export default OrderReady;
