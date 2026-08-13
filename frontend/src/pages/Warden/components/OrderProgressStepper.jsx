import React from 'react';
import './OrderProgressStepper.css';

const STEPS = ['Pending', 'Accepted', 'Paid', 'Waiting for Pickup'];

// Rejected orders never progress past Pending, so they're pinned to step 0.
const STATUS_TO_STEP = { Pending: 0, Rejected: 0, Accepted: 1, Paid: 2, Ready: 3 };

function OrderProgressStepper({ status }) {
    const currentStep = STATUS_TO_STEP[status] ?? 0;

    return (
        <div className="order-progress-stepper">
            <div className="stepper-track">
                {STEPS.map((label, index) => (
                    <React.Fragment key={label}>
                        <div className={`stepper-dot ${index <= currentStep ? 'filled' : ''}`} />
                        {index < STEPS.length - 1 && (
                            <div className={`stepper-line ${index < currentStep ? 'filled' : ''}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="stepper-labels">
                {STEPS.map((label, index) => (
                    <span key={label} className={`stepper-label ${index <= currentStep ? 'active' : ''}`}>
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default OrderProgressStepper;
