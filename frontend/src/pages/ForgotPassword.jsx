import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import './VerifyEmail.css';
import { handleError, handleSuccess } from './utils';
import authBgImage from '../assets/college_hostel.png';
import { API_BASE_URL } from '../config';

const FORGOT_PASSWORD_URL = `${API_BASE_URL}/api/auth/forgot-password`;
const VERIFY_RESET_OTP_URL = `${API_BASE_URL}/api/auth/verify-reset-otp`;

// Purely a UI estimate matching the backend's reset OTP TTL - the forgot-password
// response never reveals whether an OTP was actually issued, since doing so would
// leak whether the email is registered.
const OTP_VALIDITY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [email, setEmail] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [otpExpiresAt, setOtpExpiresAt] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    useEffect(() => {
        if (cooldownSeconds <= 0) return;
        const interval = setInterval(() => setCooldownSeconds((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(interval);
    }, [cooldownSeconds]);

    useEffect(() => {
        if (!otpExpiresAt) return;
        const tick = () => setRemainingSeconds(Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000)));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [otpExpiresAt]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            setErrorMessage('Please enter your email address.');
            return;
        }
        setIsSending(true);
        setErrorMessage('');
        try {
            const response = await fetch(FORGOT_PASSWORD_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail })
            });
            const result = await response.json();

            if (response.status === 429) {
                handleError(result.message || 'Please wait before requesting another code.');
                return;
            }

            // Same generic outcome whether or not the email is registered - by design.
            handleSuccess(result.message || 'If this email is registered, a verification code has been sent.');
            setStep('otp');
            setOtpInput('');
            setOtpExpiresAt(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);
            setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            handleError('Network error occurred while sending the code.');
        } finally {
            setIsSending(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        setErrorMessage('');
        try {
            const response = await fetch(VERIFY_RESET_OTP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpInput })
            });
            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem('resetToken', result.resetToken);
                handleSuccess('Code verified. Please set a new password.');
                navigate('/reset-password');
                return;
            }

            // Too many wrong attempts or an expired code both require a fresh OTP.
            if (response.status === 429 || response.status === 410) {
                setErrorMessage(result.message);
                return;
            }

            setErrorMessage(result.message || 'Could not verify code.');
            setOtpInput('');
        } catch (err) {
            setErrorMessage('Network error occurred while verifying the code.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="login-container" style={{ backgroundImage: `url(${authBgImage})` }}>
                <div className="login-form-box verify-email-box soft-shadow-box">
                    <Link to="/home" className="home-icon-btn" aria-label="Home" title="Home">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <path d="M9 22V12h6v10" />
                        </svg>
                    </Link>
                    <h1>{step === 'email' ? 'Forgot your password?' : 'Enter verification code'}</h1>
                    <p>
                        {step === 'email'
                            ? 'Enter your email and we will send you a verification code.'
                            : <>Enter the 6-digit code sent to <span className="verify-email-chip">{email}</span></>}
                    </p>

                    {step === 'email' && (
                        <form className="form-group" onSubmit={handleSendCode} noValidate>
                            <label htmlFor="email">Email address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSending}
                                autoFocus
                            />
                            {errorMessage && <p className="verify-error-message">{errorMessage}</p>}
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={isSending}
                                style={{ marginTop: '1rem' }}
                            >
                                {isSending ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <>
                            <form className="form-group" onSubmit={handleVerify} noValidate>
                                <label htmlFor="otp">Verification code</label>
                                <input
                                    type="text"
                                    id="otp"
                                    className={`form-control otp-input${otpInput.length > 0 && otpInput.length !== 6 ? ' is-invalid' : ''}`}
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter 6-digit code"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                />
                                <p className="otp-hint">
                                    {otpInput.length > 0 && otpInput.length !== 6
                                        ? `The code must be exactly 6 digits (${otpInput.length}/6 entered).`
                                        : 'Enter the 6-digit code.'}
                                </p>

                                {errorMessage && <p className="verify-error-message">{errorMessage}</p>}

                                <p className="verify-timer">
                                    {remainingSeconds > 0 ? `Code expires in ${formatTime(remainingSeconds)}` : 'Code may have expired'}
                                </p>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={isVerifying || otpInput.length !== 6}
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify'}
                                </button>
                            </form>

                            <button
                                type="button"
                                className="verify-resend-btn"
                                onClick={handleSendCode}
                                disabled={isSending || cooldownSeconds > 0}
                            >
                                <span className={`verify-resend-icon${isSending ? ' spinning' : ''}`} aria-hidden="true">&#8635;</span>
                                {isSending ? 'Sending...' : cooldownSeconds > 0 ? `Resend code (${cooldownSeconds}s)` : 'Resend code'}
                            </button>
                        </>
                    )}

                    <span className="signup-link">
                        Remembered your password? <Link to="/login">Back to Login</Link>
                    </span>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;
