import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css'; 
import { useForm } from 'react-hook-form'; // Import useForm

import loginBgImage from '../assets/hostel-2.jpeg';
import { handleError } from './utils';
import { connectSocket } from '../socket';

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    // Handlers
    const handleLogin = async (data) => {
        console.log("Login data to be sent:", data);
        
        try { 
            const url="http://localhost:8080/auth/login"; 
            const response=await fetch(url, {
                method:"POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data) // Use data from react-hook-form
            });
            const result=await response.json();
            console.log(result);
            const {success, message, jwtToken, name, role, error}=result;
            if(success){
                toast.success("Login successful! Redirecting...");
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('role', role);
                connectSocket();
                if(role=='student'){
                    setTimeout(() => navigate('/student/dashboard'), 2000); // Navigate to dashboard
                }
                else if(role=='warden'){
                    setTimeout(() => navigate('/warden/dashboard'), 2000); 
                }
                else if(role=='mess'){
                    setTimeout(() => navigate('/mess/dashboard'), 2000); 
                }
                
            }
           else {
            let errorMessage = "An unknown error occurred.";

            // Check if it's a Joi validation error
            if (error && error.details && error.details.length > 0) {
                errorMessage = error.details[0].message;
            
            // Check if it's a standard logical error
            } else if (message) {
                errorMessage = message;
            }
            // Show the error
            handleError(errorMessage); 

            // If the user doesn't exist, redirect
            if (errorMessage === "User doesn't exist, please signup.") {
                setTimeout(() => navigate('/signup'), 2000);
            }
        }
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
        }
    };
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div 
                className='login-container' 
                style={{ backgroundImage: `url(${loginBgImage})` }}
            >
                {/* handleSubmit receives the event, calls preventDefault() on it, runs all validations, and only if validation passes, it calls the handleLogin function. */}
                <form className='login-form-box' onSubmit={handleSubmit(handleLogin)}> 
                    <h1>Welcome Back</h1>
                    <h4 textAlign="center">Please log in to your account.</h4>

                    <div className='form-group'>
                        <label htmlFor="username">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            className='form-control'
                            placeholder='Enter your username'
                            {...register("username", { 
                                required: "Username is required" 
                            })}
                        />
                        {errors.username && <p style={{ color: 'red', fontSize: '0.9em', margin: '5px 0 0' }}>{errors.username.message}</p>}
                    </div>

                    <div className='form-group'>
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            className='form-control'
                            placeholder='Enter your password'
                            {...register("password", { 
                                required: "Password is required" 
                            })}
                        />
                        {errors.password && <p style={{ color: 'red', fontSize: '0.9em', margin: '5px 0 0' }}>{errors.password.message}</p>}
                    </div>

                    <button type="submit" className='btn btn-primary w-100'>Login</button>

                    <Link to="/forgot-password" className="verify-resend-btn">Forgot Password?</Link>
                    
                    <span className='signup-link'>
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </span>
                </form>
            </div>
        </>
    );
}

export default LoginPage;