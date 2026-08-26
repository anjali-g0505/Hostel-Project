import React, { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import { useNavigate } from 'react-router-dom';
import PendingApplicationCard from './components/PendingApplicationCard';
import './ViewPendingApplications.css';
import { API_BASE_URL } from '../../config';

function ViewPendingApplications() {

    const [isLoading, setIsLoading]=useState(true);
    const [ApplicationData, setApplicationData]=useState([]);
    const navigate=useNavigate();
    useEffect(() => {
            const fetchPendingApplications = async () => {
                setIsLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setIsLoading(false); 
                        handleError("Token expired, please login in again.");
                        return navigate('/login');
                    }
                    
                    const url = `${API_BASE_URL}/api/warden/view-applications`;
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
                    const {success, message, Applications}=result;
                    if(success){
                        setApplicationData(Applications);
                        // console.log('Applications received by frontend:', Applications.length);
                    } else if (!success) {
                        handleError(message || "An error occurred.");
                    }                        
                }catch (error) {    
                    const errorMsg = error.message || "An unknown error occurred";
                    console.error("Applications could not be fetched:", errorMsg);
                    handleError("Applications could not be fetched. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPendingApplications();
        }, [navigate]); 
    const changeStatusAddRemark = async (id, newStatus, wardenRemark)=>{
        setIsLoading(true);
        const token=localStorage.getItem('token');
        const API_URL=`${API_BASE_URL}/api/warden/leave-approval/${id}/status`;
        if(!token){
            setIsLoading(false);
            handleError("Token not found, please login again.");
            return navigate('/login');
        }
        try{
            const response=await fetch(API_URL,{
                method:"PATCH",
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body:JSON.stringify({
                    status:newStatus,
                    wardenRemark:wardenRemark
                })
            });
            const result=await response.json();
            if(result.success){
                handleSuccess(result.message || `Status changed to ${newStatus}. Warden remark added.`);
            
                setApplicationData(prevApplication => 
                    prevApplication.filter(app => 
                        app._id !== id));
            }
            else{
                handleError(result.message);
            }       
        }
        catch(err){
            handleError("A network error occurred. Please try again");
            console.error("Network Error:", err);
        }
        finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <div className="view-ann-container"><h2 className="loading-text">Loading Applications...</h2></div>
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="view-apps-container">
                <h1 className="view-apps-title">View Pending Applications</h1>
                
                {ApplicationData.length > 0 ? (
                    <div className="apps-list-view">
                        {ApplicationData.map(app => (
                            <PendingApplicationCard
                                key={app._id}
                                id={app._id} 
                                name={app.studentID.name}
                                mobile={app.studentID.mobile}
                                fromDate={app.fromDate}
                                toDate={app.toDate} 
                                address={app.address}
                                status={app.status}
                                parentName={app.parentName}
                                parentMobile={app.parentMobile}
                                mis={app.mis}
                                room={app.room}
                                changeStatusAndRemark={changeStatusAddRemark} // Pass the function
                            />
                        ))}
                    </div>
                ) : (
                    <p className="no-apps-view">
                        No applications left to review.
                    </p>
                )}
            </div>
        </>
    );
}

export default ViewPendingApplications
