import React from 'react'; // Removed useState
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './Signup.css'; 
import { useForm } from 'react-hook-form';

import hostelImage1 from '../assets/hostel-1.jpg'; 
import hostelImage2 from '../assets/hostel-2.jpeg';
import hostelImage3 from '../assets/hostel-3.jpeg';
import { handleError, handleSuccess, passwordValidationRules } from './utils';
import { API_BASE_URL } from '../config';

function SignupPage() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            role: 'student' 
        }
    });
    const navigate = useNavigate();

    // Handlers
    const handleSignup = async (data) => {
        console.log("Form data to be sent:", data);
        
        try {
            const url=`${API_BASE_URL}/api/auth/signup`;
            const response=await fetch(url, {
                method:"POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data) // Use 'data' from react-hook-form
            });

            const result=await response.json();
            // console.log(result);
            const {success, message, error}=result;
            if(success){
                handleSuccess(message);
                setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(data.email)}`), 2000); //encodeURIComponent to ensure email is URL-safe (the @ and other special characters are properly encoded and not misparsed by the browser or server). This prevents potential issues with URL parsing 
                // ensures that the email is correctly passed to the next page.
            }
            else if(error){
                const details=error?.details[0].message;
                handleError(details);
            }
            else if(!success){
                handleError(message);
            }
            // console.log(result);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error("Signup failed:", errorMsg);
            toast.error("Signup failed. Please try again.");
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className='signup-container'>
                
                <div className='signup-carousel-half'>
                    <div id="hostelCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="2000">
                        
                        <div className="carousel-indicators">
                            <button type="button" data-bs-target="#hostelCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#hostelCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#hostelCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
                        </div>
                        
                        <div className="carousel-inner">
                            <div className="carousel-item active">
                                <img src={hostelImage1} className="d-block w-100" alt="Hostel Room" />
                                <div className="text-car carousel-caption d-none d-md-block">
                                        <h4>Comfortable Living</h4>
                                        <p>" It feels like a home away from home, the staff is very sweet."</p>
                                </div>
                            </div>
                            <div className="carousel-item">
                                <img src={hostelImage2} className="d-block w-100" alt="Hostel Mess Hall" />
                                <div className="text-car carousel-caption d-none d-md-block">
                                    <h4>Hygienic Mess</h4>
                                    <p>"The meals are truly nutritious and delicious. No complaints "</p>
                                </div>
                            </div>
                            <div className="carousel-item">
                                <img src={hostelImage3} className="d-block w-100" alt="Hostel Common Area" />
                                <div className="text-car carousel-caption d-none d-md-block">
                                    <h4>Vibrant Community</h4>
                                    <p>"The place where my best memories were made"</p>
                                </div>
                            </div>
                        </div>
                        
                        <button className="carousel-control-prev" type="button" data-bs-target="#hostelCarousel" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#hostelCarousel" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>

                {/* FORM HALF*/}
                <div className='signup-form-half'>
                    <form className='signup-form' onSubmit={handleSubmit(handleSignup)}>
                        <Link to="/home" className="home-icon-btn" aria-label="Home" title="Home">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <path d="M9 22V12h6v10" />
                            </svg>
                        </Link>
                        <h1>Please sign up to continue</h1>
                        
                        <div className='form-group'>
                            <label htmlFor="role">Sign up as...</label>
                            <select 
                                id="role" 
                                className='form-control'
                                {...register("role", { 
                                    required: "Please select a role" 
                                })}
                            >
                                <option value="student">Student</option>
                                <option value="warden">Warden</option>
                                <option value="mess">Mess</option>
                            </select>
                            {errors.role && <p className="error-message" style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.role.message} </p>}
                        </div>

                        <div className='form-group'>
                            <label htmlFor="name">Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                className='form-control'
                                placeholder='Enter Your Name'
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: {
                                        value: 2,
                                        message: "Name must be at least 2 characters"
                                    }
                                })}
                            />
                            {errors.name && <p className="error-message" style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.name.message}</p>}
                        </div>

                        <div className='form-group'>
                            <label htmlFor="username">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                className='form-control'
                                placeholder='Enter Your Username'
                                {...register("username", {
                                    required: "Username is required",
                                    minLength: {
                                        value: 3,
                                        message: "Username must be at least 3 characters"
                                    }
                                })}
                            />
                            {errors.username && <p className="error-message" style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.username.message}</p>}
                        </div>

                        <div className='form-group'>
                            <label htmlFor="email">Email ID</label>
                            <input 
                                type="email" 
                                id="email" 
                                className='form-control'
                                placeholder='Enter Email Address'
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Please enter a valid email"
                                    }
                                })}
                            />
                            {errors.email && <p className="error-message" style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.email.message}</p>}
                        </div>

                        <div className='form-group'>
                            <label htmlFor="mobile">Mobile Number</label>
                            <input 
                                type="tel" 
                                id="mobile" 
                                className='form-control'
                                placeholder='Enter Mobile No.'
                                {...register("mobile", {
                                    required: "Mobile number is required",
                                    pattern: {
                                        value: /^[6-9]\d{9}$/,
                                        message: "Please enter a valid 10-digit mobile number"
                                    }
                                })}
                            />
                            {errors.mobile && <p className="error-message" style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.mobile.message}</p>}
                        </div>

                        <div className='form-group'>
                            <label htmlFor="password">Password</label>
                            <input 
                                type="password"
                                id="password" 
                                className='form-control'
                                placeholder='Enter Password'
                                {...register("password", passwordValidationRules)}
                            />
                            {errors.password && <p className="error-message" style={{ color: 'red', fontSize: '1rem', margin: '5px 0 0' }}>{errors.password.message}</p>}
                        </div>
                        
                        <button type="submit" className='btn btn-primary w-100'>Sign Up</button>
                        
                        <span className='login-link'>
                            Already have an account? <Link to="/login">Login</Link>
                        </span>
                    </form>
                </div>

            </div>
        </>
    );
}

export default SignupPage;