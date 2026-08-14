import React from 'react';
import './AcceptedOrderCard.css';

function AcceptedOrderCard(props) {

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="pending-order-card">
            
            <div className="order-card-header">
                <div>
                    <h4 className="student-name">{props.name || 'Student Not Found'}</h4>
                    <span className="student-mobile">{props.mobile || 'No Mobile'}</span>
                    <span className="student-role" style={{color:'#000000', fontSize: '1.2rem'}}>{props.role || 'Student'}</span>
                </div>
                <span className="order-time">ऑर्डर दिली: {formatDate(props.date)}</span>
            </div>
            
            <div className="order-card-body">
                <ul className="order-item-list">
                    {props.items.map(item => (
                        <li key={item.menuItemID} className="order-item">
                            <span className="item-quantity">{item.quantity}x</span>
                            <span className="item-name">{item.name}</span>
                            <span className="item-price">₹{item.price}</span>
                        </li>
                    ))}
                </ul>
                
                {props.instructions && (
                    <div className="order-instructions">
                        <strong>Instructions:</strong> {props.instructions}
                    </div>
                )}
            </div>
            
            <div className="order-card-footer">
                <span className="order-total">
                    Total: <strong>₹{props.totalAmount}</strong>
                </span>
                <div className="order-actions">
                    {props.status === 'Ready' ? (
                        <span className="btn-ready-order ready-marked">✓ तयार झाले</span>
                    ) : (
                        <button className="btn-ready-order" onClick={() => props.onStatusToggle(props.id, 'Ready')}>ऑर्डर तयार</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AcceptedOrderCard;
