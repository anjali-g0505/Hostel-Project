import React from 'react';
import './OrderCard.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import OrderProgressStepper from './OrderProgressStepper';
import { API_BASE_URL } from '../../../config';

function OrderCard(props) {
    const [isLoading, setIsLoading]= useState(false);
    const navigate = useNavigate();
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-IN') + ' ' + 
               new Date(dateString).toLocaleTimeString('en-IN', {
                   hour: '2-digit', minute: '2-digit'
               });
    };

const handlePayment = async () => {
    console.log("Payment initiated for order:", props.id);
    setIsLoading(true);

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            handleError("Please login again.");
            return navigate('/login');
        }
        console.log("TOken receieved");
        const keyResponse = await fetch(`${API_BASE_URL}/api/getKey`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (keyResponse.status === 401 || keyResponse.status === 403) {
            handleError("Session expired. Please log in again.");
            localStorage.clear();
            return navigate('/login');
        }

        const keyResult = await keyResponse.json();
        const key = keyResult.key;
        console.log("Key receieved");

        // Creating the Razorpay Order
        const paymentResponse = await fetch(`${API_BASE_URL}/api/payment/process`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                orderId: props.id,
                amount: props.totalAmount
            })
        });

        if (paymentResponse.status === 401 || paymentResponse.status === 403) {
            handleError("Session expired. Please log in again.");
            localStorage.clear();
            return navigate('/login');
        }

        const paymentResult = await paymentResponse.json();
        console.log("response receieved");
        if (!paymentResult.success) {
            handleError(paymentResult.message);
            return;
        }

        // Configuring Razorpay Options
        const options = {
            key, // Variable now accessible here
            amount: paymentResult.order.amount,
            currency: 'INR',
            name: 'Mess Management',
            description: `Payment for ${props.category}`,
            order_id: paymentResult.order.id,
            callback_url: `${window.location.origin}/api/paymentVerification`,
            prefill: {
                name: props.name,
            },
            theme: {
                color: '#F37254'
            },
        };
        console.log("Window opening");
        const rzp = new window.Razorpay(options); //code from the razorpay documentation to open the razorpay window
        rzp.open();
        console.log("Window opened.");

    } catch (error) {
        console.error("Payment Error:", error);
        handleError("Payment gateway could not be initialized.");
    } finally {
        setIsLoading(false);
    }
};

    const renderActionButton = (status) => {
        switch (status) {
            case 'Pending':
                return <button className='btn-status pending' disabled>Waiting...</button>;
            case 'Accepted':
                return (
                    <button 
                        className='btn-status accepted' 
                        onClick={handlePayment} 
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Pay Now"}
                    </button>)
            case 'Paid':
                return <button className='btn-status paid' disabled>Preparing...</button>;
            case 'Rejected':
                return <button className='btn-status rejected' disabled>Rejected</button>;
            case 'Ready':
                return <button className='btn-status ready' disabled>Ready for Pickup</button>;
            default:
                return null;
        }
    };

    return (
        <div className="order-card">
            <OrderProgressStepper status={props.status} />

            <div className="order-card-header">
                <div>
                    <span className="order-cat-tag">{props.category}</span>
                </div>
                <span className="order-time">{formatDate(props.date)}</span>
            </div>
            
            <div className="order-card-body">
                <ul className="order-item-list">
                    {props.items.map((item, index) => (
                        <li key={index} className="order-item">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="item-price">₹{item.price * item.quantity}</span>
                        </li>
                    ))}
                </ul>
                
                {props.instructions && (
                    <div className="order-instructions">
                        <strong>Note:</strong> {props.instructions}
                    </div>
                )}
            </div>
            
            <div className="order-card-footer">
                <span className="order-total">
                    Total: <strong>₹{props.totalAmount}</strong>
                </span>
                {renderActionButton(props.status)}
            </div>
        </div>
    );
}

export default OrderCard;