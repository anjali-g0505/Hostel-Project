import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleError, handleSuccess } from '../utils.js'; 
import MenuItemCard from '../Mess/Components/MenuItemCard.jsx'; 
import './ManageMenu.css'; 
import { useForm } from 'react-hook-form'; 

function ManageMenu() {
    const [activeCategory, setActiveCategory] = useState('breakfast');
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            newItemName: "",
            price: "" 
        }
    });
    
    const [categories, setCategories] = useState({
        breakfast: true, // Default to the active category
        lunch: false,
        snacks: false,
        dinner: false,
    });
    
    const [availableItems, setAvailableItems] = useState([]);
    const [unavailableItems, setUnavailableItems] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // For the 'Add Item' form

    useEffect(() => {
        // When category changes, reset the 'add item' checkboxes
        setCategories({
            breakfast: activeCategory === 'breakfast',
            lunch: activeCategory === 'lunch',
            snacks: activeCategory === 'snacks',
            dinner: activeCategory === 'dinner',
        });
        fetchMenuItems(activeCategory); 
    }, [activeCategory]);
    // This logic runs both GET requests (available and unavailable) for the active category
    const fetchMenuItems = async (category) => {
        setIsLoading(true);
        console.log(`Fetching items for ${category}`);
        try {
            // Fetch both lists at the same time
            await Promise.all([
                fetchAvailableItems(category),
                fetchUnavailableItems(category)
            ]); //doesn't proceed till both the available items and unavailable items are fetched.
        } catch (error) {
            handleError("Failed to fetch menu items.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableItems = async (category) => {
        console.log(`Getting available items for ${category}`);
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false); 
            handleError("Token expired, please login in again.");
            return navigate('/login');
        }
        const API_URL = `http://localhost:8080/api/${category}/get-available-items`;
        
        try {
            const response = await fetch(API_URL, { 
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
                setAvailableItems(result.items);
            } else {
                handleError(result.message || "An error occurred.");
                setAvailableItems([]);
            }
        }
        catch(err){
            console.error("Error:", err);
            handleError("Network error occured.");

        }
    };

    const fetchUnavailableItems = async (category) => {
        const token = localStorage.getItem('token');
        const url = `http://localhost:8080/api/${category}/get-unavailable-items`;
        
        try {
            const response = await fetch(url, {
                method:'GET',
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
                setUnavailableItems(result.items);
            } else {
                handleError(result.message);
                setUnavailableItems([]); 
            }
        } catch (err) {
            console.error("Error:", err);
            handleError("Network error occured");
        }
    };

    //In the add item form
    const handleCategoryCheckbox = (e) => {
        const { name, checked } = e.target;
        setCategories(prev => ({ ...prev, [name]: checked }));
    };

    const handleAddNewItem = async (data) => {
        
        setIsSubmitting(true);
        const { newItemName, price } = data; // Get data from the form

        const selectedCategories = Object.keys(categories).filter(cat => categories[cat]);
        if (selectedCategories.length === 0) {
            handleError("Please select at least one category.");
            setIsSubmitting(false);
            return;
        }

        console.log(`Adding '${newItemName}' (₹${price}) to: ${selectedCategories.join(', ')}`);
        const token = localStorage.getItem('token');
        
        const apiCalls = selectedCategories.map(category => {
            return fetch('http://localhost:8080/api/add-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    name: newItemName, 
                    category: category, 
                    price: price 
                })
            });
        });

        try {
            const responses = await Promise.all(apiCalls);
            let hadError = false;
            
            for (const res of responses) {
                if (res.status === 401 || res.status === 403) {
                    handleError("Session expired. Please log in again.");
                    localStorage.clear();
                    return navigate('/login');
                }
                if (!res.ok) {
                    const result = await res.json();
                    handleError(result.message);
                    hadError = true;
                }
            }

            if (!hadError) {
                handleSuccess(`'${newItemName}' added!`);
                reset(); 
                setCategories({ breakfast: false, lunch: false, snacks: false, dinner: false });
                fetchMenuItems(activeCategory); 
            }
        } catch (err) {
            handleError("A network error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };


    //change status API call
    const handleChangeStatus = async (id, newStatus) => {
        console.log(`Changing item ${id} to ${newStatus}`);
        const token = localStorage.getItem('token');
        const url = `http://localhost:8080/api/${id}/change-status`;
        
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    status: newStatus 
                })
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
                handleSuccess(`Item status changed to ${newStatus}`);
                fetchMenuItems(activeCategory); // Refresh both lists
            } else {
                handleError(result.message);
            }
        } catch (err) {
            console.error("Change Status Error:", err);
            handleError("A network error occurred.");
        }};

    //delete item permanently API call
    const handleDeleteItem = async (id, name) => {
        console.log(`deleting item ${id}.`);
        const token = localStorage.getItem('token');
        const url = `http://localhost:8080/api/delete-item/${id}`;
        
        try {
            const response = await fetch(url, {
                method: 'DELETE',
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
                handleSuccess(`Item deleted successfully!`);
                fetchMenuItems(activeCategory); // Refresh both lists
            } else {
                handleError(result.message);
            }
        } catch (err) {
            console.error("Change Status Error:", err);
            handleError("A network error occurred.");
        }
    };
    //.....................................
    return (
        <div className="manage-menu-page">
            <ToastContainer position="top-right" autoClose={2000} />
            <h1 className="manage-menu-title">मेनू बदला</h1>

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

            <form className="add-item-form-multi" onSubmit={handleSubmit(handleAddNewItem)}>
                <h3 style={{color:'#000000', fontSize: '2rem'}}>नवीन आयटम जोडा</h3>
                <div className="form-content">
                    <h4 style={{color:'#001540', fontSize: '1.3rem'}}>नाव</h4>
                    <div className="form-input-group">
                        <input 
                            type="text"
                            placeholder="e.g. Rice, Poha, etc"
                            {...register("newItemName", {
                                required: "Item name is required",
                                minLength: { value: 3, message: "Must be at least 3 characters" }
                            })}
                        />
                        {errors.newItemName && <span className="error-message" style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.newItemName.message}</span>}
                    </div>
                    <h4 style={{color:'#001540', fontSize: '1.3rem'}}>किंमत</h4>
                    <div className="form-input-group">
                        <input
                            type="number"
                            placeholder="(e.g. 30)"
                            {...register("price", {
                                required: "Price is required",
                                valueAsNumber: true, // Converts input to a number
                                min: { value: 0, message: "Price must be 0 or more" }
                            })}
                        />
                        {errors.price && <span className="error-message" style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.price.message} </span>}
                    </div>

                    <div className="checkbox-group">
                        {['breakfast', 'lunch', 'snacks', 'dinner'].map(cat => (
                            <label key={cat}>
                                <input 
                                    type="checkbox" 
                                    name={cat}
                                    checked={categories[cat]}
                                    onChange={handleCategoryCheckbox}
                                />
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </label>
                        ))}
                    </div>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'जोडत आहे...' : 'आयटम जोडा'}
                    </button>
                </div>
            </form>

            <div className="editor-content">
                {/* Unavailable Column */}
                <div className="editor-column">
                    <h2 className="column-title unavailable-title">अनुपलब्ध</h2>
                    <p className="column-subtitle">हे आयटम ग्राहकांना दिसत नाहीत.</p>
                    <div className="list-container">
                        {isLoading ? <p className="empty-list-msg">लोड करत आहे...</p> : 
                            unavailableItems.length === 0 ? 
                            <p className="empty-list-msg">अशा वस्तू नाहीत</p> :
                            unavailableItems.map(item => (
                                <MenuItemCard 
                                    key={item._id}
                                    item={item} // Pass the whole item
                                    isAvailable={false}
                                    onToggleStatus={() => handleChangeStatus(item._id, 'Available')}
                                    onDelete={() => handleDeleteItem(item._id, item.name)}
                                />
                            ))
                        }
                    </div>
                </div>

                {/* Available Column */}
                <div className="editor-column">
                    <h2 className="column-title available-title">उपलब्ध</h2>
                    <p className="column-subtitle">विद्यार्थ्यांना दृश्यमान आयटम</p>
                    <div className="list-container">
                        {isLoading ? <p className="empty-list-msg">लोड करत आहे...</p> :
                            availableItems.length === 0 ?
                            <p className="empty-list-msg">कोणत्याही वस्तू उपलब्ध नाहीत</p> :
                            availableItems.map(item => (
                                <MenuItemCard 
                                    key={item._id}
                                    item={item} // Pass the whole item
                                    isAvailable={true}
                                    onToggleStatus={() => handleChangeStatus(item._id, 'Unavailable')}
                                    onDelete={() => handleDeleteItem(item._id, item.name)}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageMenu;

