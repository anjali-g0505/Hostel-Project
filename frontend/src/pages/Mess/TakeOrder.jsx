import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleSuccess, handleError } from '../utils'; 
import PendingOrderCard from '../Mess/Components/PendingOrderCard'; 
import './TakeOrder.css'; 

function TakeOrder() {
    const [isLoading, setIsLoading] = useState(true);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [activeCategory, setActiveCategory] = useState('breakfast');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPendingOrders(activeCategory);
    }, [activeCategory]); 

    const fetchPendingOrders = async (category) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false); 
                handleError("Token expired, please login in again.");
                return navigate('/login');
            }
            
            const url = `http://localhost:8080/api/${category}/get-pending-orders`; 
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
                setPendingOrders(result.orders);
            } else {
                handleError(result.message || "An error occurred.");
                setPendingOrders([]); // Clear on error
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
                
                setPendingOrders(prevOrders => 
                    prevOrders.filter(order => order._id !== id)
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
        return <div className="take-order-page"><h2 className="loading-text">ऑर्डर लोड करत आहे...</h2></div>
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="take-order-page">
                {/* --- Category Tabs --- */}
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

                <h1 className="take-order-title">कृपया काही ऑर्डर स्वीकारा</h1>
                
                {pendingOrders.length > 0 ? (
                    <div className="order-list-container">
                        {pendingOrders.map(order => (
                            <PendingOrderCard
                                key={order._id}
                                id={order._id}
                                name={order.studentID?.name}
                                mobile={order.studentID?.mobile} 
                                role={order.studentID?.role} 
                                date={order.createdAt}
                                items={order.items}
                                totalAmount={order.totalAmount}
                                instructions={order.specialInstructions}
                                onStatusToggle={handleStatusToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="no-orders-msg">
                        आराम करा, कोणतेही ऑर्डर नाहीत. {activeCategory}.
                    </p>
                )}
            </div>
        </>
    );
}

export default TakeOrder;
