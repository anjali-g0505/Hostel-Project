import React from 'react';

const DisplayMenuItemCard = ({ item, quantity, onAdd, onRemove }) => {
    return (
        <div className="menu-item-row">
            <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-price">₹{item.price}</span>
            </div>
            
            <div className="quantity-controls">
                <button 
                    type="button" 
                    onClick={() => onRemove(item._id)}
                    disabled={!quantity || quantity === 0}
                >
                    −
                </button>
                <span className="quantity-display">{quantity || 0}</span>
                <button 
                    type="button" 
                    onClick={() => onAdd(item._id)}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default DisplayMenuItemCard;