import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils.js'; 
import DisplayMenuItemCard from './Components/DisplayMenuItemCard.jsx';
import './Menu.css'; 

function Menu() {
    const [activeCategory, setActiveCategory] = useState('breakfast');
    const [specInstruction, setSpecInstruction] = useState("");
    const [availableItems, setAvailableItems] = useState([]);
    const [orderArr, setOrderArr] = useState({}); // { itemId: quantity }
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMenuItems(activeCategory);
        setOrderArr({}); // Reset cart when switching categories
    }, [activeCategory]);

    const fetchMenuItems = async (category) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            const API_URL = `http://localhost:8080/api/${category}/get-available-items`;
            const response = await fetch(API_URL, { 
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json(); 
            if (result.success) {
                setAvailableItems(result.items);
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError("Network error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateQuantity = (id, delta) => {
        setOrderArr(prev => {
            const currentQty = prev[id] || 0;
            const newQty = Math.max(0, currentQty + delta);
            return { ...prev, [id]: newQty };
        });
    };

    const reqOrder = async () => {
        // Transform internal state { id: qty } into API format
        const itemsToSubmit = Object.keys(orderArr)
            .filter(id => orderArr[id] > 0)
            .map(id => {
                const item = availableItems.find(i => i._id === id);
                return {
                    menuItemID: id,
                    name: item.name,
                    price: item.price,
                    quantity: orderArr[id]
                };
            });

        if (itemsToSubmit.length === 0) {
            return handleError("Please add at least one item.");
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/request-order`, { 
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: itemsToSubmit,
                    specialInstructions: specInstruction,
                    category: activeCategory 
                })
            });

            const result = await response.json();
            if (result.success) {
                handleSuccess("Order Requested successfully! Please pay from View Cart to proceed the order");
                setOrderArr({});
                setSpecInstruction("");
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError("Failed to submit order.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="manage-menu-container">
            <ToastContainer />
            <h1>Mess Menu</h1>

            <div className="category-tabs">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map(cat => (
                    <button
                        key={cat}
                        className={activeCategory === cat ? 'active' : ''}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="instructions-section">
                <input 
                    type="text" 
                    placeholder="Special instructions (e.g., less spicy)..." 
                    value={specInstruction}
                    onChange={(e) => setSpecInstruction(e.target.value)}
                />
            </div>

            <div className="menu-list">
                {isLoading ? <p>Loading...</p> : 
                    availableItems.map(item => (
                        <DisplayMenuItemCard 
                            key={item._id}
                            item={item}
                            quantity={orderArr[item._id]}
                            onAdd={(id) => handleUpdateQuantity(id, 1)}
                            onRemove={(id) => handleUpdateQuantity(id, -1)}
                        />
                    ))
                }
            </div>

            <div className="footer-actions">
                <button 
                    className="order-btn" 
                    onClick={reqOrder} 
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Request Order"}
                </button>
            </div>
        </div>
    );
}

export default Menu;