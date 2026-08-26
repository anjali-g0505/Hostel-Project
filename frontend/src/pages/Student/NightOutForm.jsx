import React from 'react'; 
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './NightOutForm.css'; 
import { handleError, handleSuccess } from '../utils'; 
import { useForm } from 'react-hook-form';
import { API_BASE_URL } from '../../config';

function NightOutForm() {
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting }, 
        reset,
        getValues // To compare 'toDate' with 'fromDate'
    } = useForm({
        defaultValues: {
            mis: "",
            parentName: "",
            parentMobile: "",
            fromDate: "",
            toDate: "",
            room: "",
            address: ""
        }
    });

    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];

    const onSubmit = async (data) => {
    
        console.log("Submitting:", data);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleError("Authentication error. Please log in again.");
                return navigate('/login');
            }
    
            const url = `${API_BASE_URL}/api/student/night-out`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Send the 'data' object from react-hook-form
                body: JSON.stringify(data)
            });
    
            const result = await response.json();
            const { success, message, error } = result;
    
            if (success) {
                handleSuccess(message || "Application submitted successfully!");
                reset(); // Reset the form to default values
                setTimeout(() => navigate('/student/nightout-form'), 2000); 
            } else if (error) {
                const details = error?.details[0]?.message; //Joi validation error
                handleError(details || "An error occurred.");
            } else if (!success) {
                handleError(message || "An error occurred."); //Invalid/Expired Token Error
                // success is false but the error object is missing or null so 
            }
            // console.log("Server Response:", result);
    
        } catch (error) { //Network Errors
            const errorMsg = error.message || "An unknown error occurred";
            console.error("Application could not be created:", errorMsg);
            toast.error("Application could not be created. Please try again.");
        } 
    };

    return (
        <> 
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="form-container-wrapper">
                <form className="announcement-form" onSubmit={handleSubmit(onSubmit)}>
                    <h2>Submit a New Application</h2>
                    <p className="form-subtitle">Fill the following details to submit an application for Leave Approval.</p>
                    
                    <div className="form-group">
                        <label htmlFor="mis">Mis</label>
                        <input
                            type="text"
                            id="mis"
                            placeholder="Enter your MIS number..."
                            {...register("mis", {
                                required: "MIS number is required",
                                pattern: {
                                    value: /^\d{9}$/,
                                    message: "Please enter a valid 9-digit MIS number"
                                }
                            })}
                        />
                        {errors.mis && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.mis.message}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="fromDate">From</label>
                        <input
                            type="date"
                            id="fromDate"
                            min={today} // Set min date
                            {...register("fromDate", {
                                required: "From date is required",
                                validate: value => new Date(value) >= new Date(today) || 'Start date must be today or a future date'
                            })}
                        />
                        {errors.fromDate && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.fromDate.message}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="toDate">To</label>
                        <input
                            type="date"
                            id="toDate"
                            min={today} 
                            {...register("toDate", {
                                required: "To date is required",
                                validate: value => {
                                    const fromDate = getValues("fromDate");
                                    return !fromDate || new Date(value) > new Date(fromDate) || "'To' date must be after 'From' date";
                                }
                            })}
                        />
                        {errors.toDate && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.toDate.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="parentName">Parent's Name</label>
                        <input
                            type="text"
                            id="parentName"
                            placeholder="Enter your parent's name..."
                            {...register("parentName", {
                                required: "Parent's name is required",
                                minLength: {
                                    value: 2,
                                    message: "Parent's name must be at least 2 characters"
                                }
                            })}
                        />
                        {errors.parentName && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.parentName.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="parentMobile">Parent's Mobile No.</label>
                        <input
                            type="tel"
                            id="parentMobile"
                            placeholder="Enter your parent's mobile number..."
                            {...register("parentMobile", {
                                required: "Parent's mobile number is required",
                                pattern: {
                                    value: /^[6-9]\d{9}$/,
                                    message: "Please enter a valid 10-digit mobile number"
                                }
                            })}
                        />
                        {errors.parentMobile && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.parentMobile.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="room">Room No.</label>
                        <input
                            type="text"
                            id="room"
                            placeholder="Enter your Room no..."
                            {...register("room", {
                                required: "Room number is required",
                                minLength: {
                                    value: 3, 
                                    message: "Please enter a valid room number"
                                }
                            })}
                        />
                        {errors.room && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.room.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            rows="3"
                            placeholder="Enter the complete address that you are travelling to..."
                            {...register("address", {
                                required: "Address is required",
                                minLength: {
                                    value: 10,
                                    message: "Address must be at least 10 characters long"
                                }
                            })}
                        />
                        {errors.address && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.address.message}</p>}
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                </form>
            </div>
        </>
    );
}
export default NightOutForm;