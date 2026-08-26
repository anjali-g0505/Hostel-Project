import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleSuccess, handleError } from '../utils'; 
import CardLog from './components/CardLog'; 
import './AnnouncementLog.css';
import { API_BASE_URL } from '../../config';

function AnnouncementLogs() {
    const [isLoading, setIsLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const navigate = useNavigate();

    // State for Delete Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState({ id: null, title: '' });

    useEffect(() => {
        const fetchAnnLogs = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false); 
                    handleError("Token expired, please login in again.");
                    return navigate('/login');
                }
                
                const url = `${API_BASE_URL}/api/announcement-logs`;
                const response = await fetch(url, { 
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
                    setAnnouncements(result.announcements);
                } else {
                    handleError(result.message || "An error occurred.");
                }
            } catch (error) {
                const errorMsg = error.message || "An unknown error occurred";
                console.error("Announcement could not be fetched:", errorMsg);
                toast.error("Announcement could not be fetched. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnnLogs();
    }, [navigate]); 

    
    const handleStatusToggle = async (id, newStatus) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false); 
            handleError("Token expired, please login in again.");
            return navigate('/login');
        }

        const API_URL = `${API_BASE_URL}/api/change-status/${id}/status`; 

        try {
            const response = await fetch(API_URL, {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();

            if (result.success) {
                handleSuccess(result.message || `Status changed to ${newStatus}`);
                // Update the state locally to see the change instantly
                setAnnouncements(prevAnnouncements => 
                    prevAnnouncements.map(ann => 
                        ann._id === id ? { ...ann, status: newStatus } : ann
                    )
                );
            } else {
                handleError(result.message || "Could not update status.");
            }
        } catch (error) {
            console.error("Status toggle error:", error);
            handleError("A network error occurred. Please try again.");
        }
    };
//modal functions
    const handleOpenModal = (id, title) => {
        setItemToDelete({ id, title });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToDelete({ id: null, title: '' });
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete.id) return;
        
        const token = localStorage.getItem('token');

        const API_URL = `${API_BASE_URL}/api/announcements/${itemToDelete.id}`;

        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (result.success) {
                handleSuccess(result.message);
   
                setAnnouncements(prev => prev.filter(ann => ann._id !== itemToDelete.id));
            } else {
                handleError(result.message);
            }
        } catch (error) {
            handleError("A network error occurred.");
        } finally {
            handleCloseModal();
        }
    };

    // ..................................................
    if (isLoading) {
        return <div className="view-ann-container"><h2 className="loading-text">Loading Announcements...</h2></div>
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="view-ann-container">
                <h1 className="view-ann-title">Announcement Logs</h1>
                
                {announcements.length > 0 ? (
                    <div className="announcement-list-view">
                        {announcements.map(ann => (
                            <CardLog
                                key={ann._id}
                                id={ann._id}
                                title={ann.title}
                                content={ann.content}
                                author={ann.author?.name} 
                                date={ann.createdAt}
                                status={ann.status}
                                onStatusToggle={handleStatusToggle} // statelifting since we are allowing the child to modify the data and send the new data to the parent
                                onDelete={handleOpenModal}         // Passing the function
                            />
                        ))}
                    </div>
                ) : (
                    <p className="no-announcements-view">
                        You have not posted any announcements yet.
                    </p>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this announcement?</p>
                        <p className="modal-item-title"><strong>{itemToDelete.title}</strong></p>
                        <div className="modal-actions">
                            <button onClick={handleCloseModal} className="modal-btn cancel">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} className="modal-btn delete">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AnnouncementLogs;
