import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils.js';
import DisplayMenuItemCard from './Components/DisplayMenuItemCard.jsx';
import { socket } from '../../socket';
import './Menu.css';

import breakfastImg from '../../assets/breakfast.png';
import lunchImg from '../../assets/lunch.png';
import snacksImg from '../../assets/snack.png';
import dinnerImg from '../../assets/dinner.png';
import { API_BASE_URL } from '../../config';

const CATEGORY_IMAGES = {
    breakfast: breakfastImg,
    lunch: lunchImg,
    snacks: snacksImg,
    dinner: dinnerImg
};

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

    // Live menu updates. We stay subscribed regardless of which category is displayed
    // (menu-subscribers is one shared room) and filter/merge by category client-side.
    useEffect(() => {
        const handleMenuUpdated = ({ category, item, action }) => {
            if (category !== activeCategory) return; //if user is browsing breakfast then an update on dinner wont cause the ui to change, but if the user is browsing breakfast and an update on breakfast happens then the ui should change
            setAvailableItems(prev => {
                if (action === 'deleted' || item.status === 'Unavailable') {
                    return prev.filter(i => i._id !== item._id);
                }
                const exists = prev.some(i => i._id === item._id);
                if (exists) {
                    return prev.map(i => i._id === item._id ? item : i);
                }
                return [...prev, item];
            });
        };

        // Missed events aren't replayed, so resync with a fresh fetch after a reconnect.
        const handleReconnect = () => fetchMenuItems(activeCategory); //everytime a connection is established, fetch the menu items again to get the latest menu items, this can be a simple reconnect after the client was disconnected or a new connection after the user logged in and the socket was connected for the first time

        socket.on('menu:updated', handleMenuUpdated); //on the already-open socket connection, listen for menu updates like an eventListener and if the event is menu:updated then call function handleMenuUpdated
        socket.on('connect', handleReconnect);
        return () => { //cleanup function to remove the event listeners when the component unmounts or when the activeCategory changes
            socket.off('menu:updated', handleMenuUpdated); //very important since if the current category is dinner and the handleMenuUpdated function for breakfast is still active since it wasnt removed, then the first condition would register breakfast as teh active category and wont make updates to the ui fro the dinner  
             //every tab switch adds a new listener without removing the old one.
            socket.off('connect', handleReconnect);
        };
    }, [activeCategory]);

    const fetchMenuItems = async (category) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            const API_URL = `${API_BASE_URL}/api/${category}/get-available-items`;
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                handleError("Session expired. Please log in again.");
                localStorage.clear();
                return navigate('/login');
            }

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
            const response = await fetch(`${API_BASE_URL}/api/request-order`, {
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

            if (response.status === 401 || response.status === 403) {
                handleError("Session expired. Please log in again.");
                localStorage.clear();
                return navigate('/login');
            }

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
                        <img src={CATEGORY_IMAGES[cat]} alt="" className="tab-icon" />
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="category-banner">
                <img src={CATEGORY_IMAGES[activeCategory]} alt={activeCategory} />
                <div className="category-banner-overlay">
                    <h2>{activeCategory}</h2>
                </div>
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