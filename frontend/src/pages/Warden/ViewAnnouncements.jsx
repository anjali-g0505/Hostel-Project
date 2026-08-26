import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleSuccess, handleError } from '../utils'; 
import Card from './components/Card'; 
import './ViewAnnouncements.css';
import { API_BASE_URL } from '../../config';

function ViewAnnouncements() {
    const [isLoading, setIsLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const viewAnn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    handleError("Authentication error. Please log in again.");
                    return navigate('/login');
                }

                const url = `${API_BASE_URL}/api/view-announcements`;
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

                // Handle Other Server Errors 
                if (!response.ok) {
                    // This catches errors where the server crashed and sent non-JSON
                    throw new Error(`Server error: ${response.statusText}`);
                }
                const result = await response.json(); 
                const { message, success, announcements } = result;

                if (success) {
                    console.log(announcements);                    
                    setAnnouncements(announcements);
                } else if (!success) {
                    handleError(message || "An error occurred.");
                }

            } catch (error) {

                const errorMsg = error.message || "An unknown error occurred";
                console.error("Announcement could not be fetched:", errorMsg);
                toast.error("Announcement could not be fetched. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        viewAnn();
    }, [navigate]); 

    if (isLoading) {
        return <div className="view-ann-container"><h2 className="loading-text">Loading Announcements...</h2></div>
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="view-ann-container">
                <h1 className="view-ann-title">Hostel Announcements</h1>
                
                {announcements.length > 0 ? (
                    <div className="announcement-list-view">
                        {announcements.map(ann => (
                            <Card
                                key={ann._id}
                                title={ann.title}
                                content={ann.content}
                                author={ann.author.name} 
                                date={ann.createdAt}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="no-announcements-view">
                        There are no active announcements at the moment.
                    </p>
                )}
            </div>
        </>
    );
}

export default ViewAnnouncements;

