import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleSuccess, handleError } from '../utils.js'; 
import Card from '../Student/components/Card.jsx'; 
import './ViewApplications.css';
import { API_BASE_URL } from '../../config';

function ViewApplications() {
    const [isLoading, setIsLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    handleError("Authentication error. Please log in again.");
                    return navigate('/login');
                }
    
                const url = `${API_BASE_URL}/api/student/view-applications`;
                const response = await fetch(url, {
                    method: 'GET',
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
                
                const { message, success, application } = result; 
    
                if (success) {
                    // console.log(application);
                    setApplications(application); 
                } else if (!success) {
                    handleError(message || "An error occurred.");
                }
    
            } catch (error) {    
                const errorMsg = error.message || "An unknown error occurred";
                console.error("Applications could not be fetched:", errorMsg);
                toast.error("Applications could not be fetched. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchApplications(); 
    }, [navigate]); 

    if (isLoading) {
        return <div className="view-apps-container"><h2 className="loading-text">Loading Your Applications...</h2></div>
    }

    return (
        <>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="view-apps-container">
            <h1 className="view-apps-title">Your Applications</h1>
            
            {applications.length > 0 ? (
                <div className="apps-list-view">
                    {applications.map(app => (
                        <Card
                            key={app._id} 
                            createdAt={app.createdAt}
                            status={app.status}
                            wardenRemark={app.wardenRemark}
                            fromDate={app.fromDate} 
                            toDate={app.toDate}
                        />
                    ))}
                </div>
            ) : (
                <p className="no-apps-view">
                    You have not submitted any applications yet.
                </p>
            )}
            </div>
        </>
    )
}

export default ViewApplications;
