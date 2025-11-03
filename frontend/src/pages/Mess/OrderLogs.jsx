import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleSuccess, handleError } from '../utils'; 
import OrderLogCard from '../Mess/Components/OrderLogCard'; 
import './OrderLogs.css'; 

function OrderLogs() {
    const [isLoading, setIsLoading] = useState(true);
    const [orderLogs, setOrderLogs] = useState([]);
    const [activeCategory, setActiveCategory] = useState('breakfast');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrderLog(activeCategory);
    }, [activeCategory]); 

    const fetchOrderLog = async (category) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false); 
                handleError("Token expired, please login in again.");
                return navigate('/login');
            }
            
            const url = `http://localhost:8080/api/${category}/order-log`; 
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
                setOrderLogs(result.orders);
            } else {
                handleError(result.message || "An error occurred.");
                setOrderLogs([]); // Clear on error
            }
        } catch (error) {
            const errorMsg = error.message || "An unknown error occurred";
            console.error("Orders could not be fetched:", errorMsg);
            toast.error("Orders could not be fetched. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // ..................................................
    if (isLoading) {
        return <div className="order-log-page"><h2 className="loading-text">तुमच्या दिवसाच्या पूर्ण झालेल्या ऑर्डर लोड करत आहे...</h2></div>
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="order-log-page">
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

                <h1 className="order-log-title">ऑर्डर दिल्यानंतर २४ तासांनी, हे ऑर्डर गायब होतील.</h1>
                
                {orderLogs.length > 0 ? (
                    <div className="order-list-container">
                        {orderLogs.map(order => (
                            <OrderLogCard
                                key={order._id}
                                id={order._id}
                                name={order.studentID?.name}
                                mobile={order.studentID?.mobile} 
                                date={order.createdAt}
                                items={order.items}
                                totalAmount={order.totalAmount}
                                instructions={order.specialInstructions}
                                status={order.status} 
                            />
                        ))}
                    </div>
                ) : (
                    <p className="no-orders-msg">
                        आज कोणतेही ऑर्डर दिले गेले नाहीत...
                    </p>
                )}
            </div>
        </>
    );
}

export default OrderLogs;
