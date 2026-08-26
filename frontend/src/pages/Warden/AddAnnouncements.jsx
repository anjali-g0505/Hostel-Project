import React from 'react'; 
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddAnnouncements.css';
import { handleError, handleSuccess } from '../utils';
import { API_BASE_URL } from '../../config';
import { useForm } from 'react-hook-form'; 

function AddAnnouncement() {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            title: '',
            content: '',
            expiryDate: ''
        }
    });

    const navigate = useNavigate();

    // To get today's date in YYYY-MM-DD format for the min date
    const today = new Date().toISOString().split('T')[0];

    const onSubmit = async (data) => {
        console.log("Submitting:", data);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                handleError("Authentication error. Please log in again.");
                return navigate('/login');
            }

            const url = `${API_BASE_URL}/api/add-announcements`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: data.title,
                    content: data.content,
                    expiryDate: data.expiryDate || null 
                })
            });

            const result = await response.json();
            const { success, message, error } = result;

            if (success) {
                handleSuccess(message || "Announcement posted successfully!");
                reset(); 
                setTimeout(() => navigate('/warden/dashboard'), 2000);
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
            console.error("Announcement could not be created:", errorMsg);
            toast.error("Announcement could not be created. Please try again.");
        } 
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="form-container-wrapper">
                <form className="announcement-form" onSubmit={handleSubmit(onSubmit)}>
                    <h2>Post a New Announcement</h2>
                    <p className="form-subtitle">This announcement will be visible to all students.</p>
                    
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            placeholder="Enter title..."
                            {...register("title", {
                                required: "Title is required",
                                minLength: {
                                    value: 3,
                                    message: 'Title must be at least 3 characters long'
                                },
                                maxLength: {
                                    value: 150,
                                    message: 'Title must be less than 150 characters'
                                }
                            })}
                        />
                        {errors.title && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.title.message}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea
                            id="content"
                            rows="6"
                            placeholder="Write the full details of the announcement here..."
                            {...register("content", {
                                required: "Content is required",
                                minLength: {
                                    value: 10,
                                    message: 'Content must be at least 10 characters long'
                                }
                            })}
                        />
                        {errors.content && <p style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.content.message}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="expiryDate">Active Until (Optional)</label>
                        <input
                            type="date"
                            id="expiryDate"
                            min={today} 
                            {...register("expiryDate")}
                        />
                        <small>The announcement will be hidden after this date. Leave blank to keep it active indefinitely.</small>
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Posting..." : "Post Announcement"}
                    </button>
                </form>
            </div>
        </>
    );
}

export default AddAnnouncement;