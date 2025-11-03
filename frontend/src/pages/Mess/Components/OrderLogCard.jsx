import React from 'react';
import './OrderLogCard.css'; 

function OrderLogCard(props) {

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',   // 3
            month: 'long',    // November
            year: 'numeric'   // 2025
        });
    };

    const getStatusClass = (status) => {// to get the correct classname 
        if (status === 'Accepted') return 'status-accepted';
        if (status === 'Ready') return 'status-ready';
        return '';
    };
    const getStatusInMarathi = (status)=>{//to convert to marathi
      if(status === 'Accepted') return 'स्वीकारलेले ऑर्डर';
      if(status === 'Ready') return 'तयार असलेल्या ऑर्डर';  
      return '';
    }

    return (
        <div className="order-log-card">
            
            <div className="order-card-header">
                <div>
                    <h4 className="student-name">{props.name || 'Student Not Found'}</h4>
                    <span className="student-mobile">{props.mobile || 'No Mobile'}</span>
                </div>
                <span className={`order-status-badge ${getStatusClass(props.status)}`}>
                    {getStatusInMarathi(props.status)}
                </span>
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
                        <strong>सूचना:</strong> {props.instructions}
                    </div>
                )}
            </div>
            
            <div className="order-card-footer">
                <span className="order-time">येथे ठेवले: {formatDate(props.date)}</span>
                <span className="order-total">
                    रक्कम: <strong>₹{props.totalAmount}</strong>
                </span>
            </div>
        </div>
    );
}

export default OrderLogCard;
