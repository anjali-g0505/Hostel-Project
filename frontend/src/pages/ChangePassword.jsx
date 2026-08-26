import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { useForm } from 'react-hook-form';
import { handleError, handleSuccess, passwordValidationRules } from './utils';
import authBgImage from '../assets/college_hostel.png';
import { API_BASE_URL } from '../config';

const RESET_PASSWORD_URL = `${API_BASE_URL}/api/auth/reset-password`;

function ChangePassword() {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();

    // No resetToken means the user landed here without going through the OTP step.
    useEffect(() => {
        if (!sessionStorage.getItem('resetToken')) {
            handleError('Please verify your email first.');
            navigate('/forgot-password');
        }
    }, []);

    const handleChangePassword = async (data) => {
        const resetToken = sessionStorage.getItem('resetToken');
        if (!resetToken) {
            handleError('Please verify your email first.');
            navigate('/forgot-password');
            return;
        }

        try {
            const response = await fetch(RESET_PASSWORD_URL, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword: data.newPassword })
            });
            const result = await response.json();

            // Single-use either way - clear it whether reset succeeded or the token turned
            // out to be invalid/expired, so it never lingers in sessionStorage.
            sessionStorage.removeItem('resetToken');

            if (result.success) {
                handleSuccess(result.message || 'Password updated successfully. Please log in.');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }

            if (response.status === 401) {
                handleError(result.message || 'Invalid request.');
                setTimeout(() => navigate('/forgot-password'), 1500);
                return;
            }

            handleError(result.message || 'Could not update password.');
        } catch (err) {
            handleError('Network error occurred while updating your password.');
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="login-container" style={{ backgroundImage: `url(${authBgImage})` }}>
                <div className="login-form-box soft-shadow-box">
                    <h1>Set a new password</h1>
                    <h4>Choose a new password for your account.</h4>

                    <form onSubmit={handleSubmit(handleChangePassword)} noValidate>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                className="form-control"
                                placeholder="Enter new password"
                                {...register("newPassword", passwordValidationRules)}
                            />
                            {errors.newPassword && <p style={{ color: 'red', fontSize: '0.9em', margin: '5px 0 0' }}>{errors.newPassword.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmNewPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                className="form-control"
                                placeholder="Re-enter new password"
                                {...register("confirmNewPassword", {
                                    required: "Please confirm your new password",
                                    validate: (value) => value === watch('newPassword') || "Passwords do not match"
                                })}
                            />
                            {errors.confirmNewPassword && <p style={{ color: 'red', fontSize: '0.9em', margin: '5px 0 0' }}>{errors.confirmNewPassword.message}</p>}
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ChangePassword;
