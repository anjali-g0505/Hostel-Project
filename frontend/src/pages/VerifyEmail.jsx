import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import './VerifyEmail.css';
import { handleError, handleSuccess } from './utils';
import authBgImage from '../assets/college_hostel.png';
import { API_BASE_URL } from '../config';

const OTP_URL = `${API_BASE_URL}/api/auth/send-otp`;
const VERIFY_URL = `${API_BASE_URL}/api/auth/verify-otp`;

// Keyed per-email so switching accounts in the same tab doesn't reuse a stale expiresAt.
const otpStorageKey = (email) => `otp_expiresAt:${email}`;

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const navigate = useNavigate();

    const [otpInput, setOtpInput] = useState('');
    const [expiresAt, setExpiresAt] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [showResend, setShowResend] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [verified, setVerified] = useState(false);

    const hasSentOtp = useRef(false);

    const callSendOtp = async () => {
        setIsSending(true);
        setErrorMessage('');
        try {
            const response = await fetch(OTP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const result = await response.json();

            if (result.success) {
                setExpiresAt(result.expiresAt);
                setShowResend(false);
                setOtpInput('');
                sessionStorage.setItem(otpStorageKey(email), result.expiresAt);
                handleSuccess('Verification code sent to your email.');
            } else {
                handleError(result.message || 'Could not send verification code.');
                if (response.status === 404) {
                    setTimeout(() => navigate('/signup'), 2000);
                }
            }
        } catch (err) {
            handleError('Network error occurred while sending the code.');
        } finally {
            setIsSending(false);
        }
    };

    // Auto-send once on mount - unless a still-valid expiresAt survived a page refresh in
    // sessionStorage, in which case we just resume that countdown instead of sending again.
    // hasSentOtp also guards against React StrictMode's dev mount->cleanup->mount double-invoke.
    useEffect(() => {
        if (!email) {
            handleError('Missing email. Please sign up again.');
            navigate('/signup');
            return;
        }
        if (hasSentOtp.current) return;
        hasSentOtp.current = true;

        const storedExpiresAt = sessionStorage.getItem(otpStorageKey(email));
        if (storedExpiresAt && new Date(storedExpiresAt).getTime() > Date.now()) {
            setExpiresAt(storedExpiresAt);
            return;
        }

        callSendOtp();
    }, []);

    // Countdown driven by the real server-issued expiresAt, not a hardcoded 3 minutes.
    useEffect(() => {
        if (!expiresAt) return;

        const tick = () => {
            const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
            setRemainingSeconds(remaining);
            if (remaining <= 0) {
                setShowResend(true);
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        setErrorMessage('');
        try {
            const response = await fetch(VERIFY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpInput })
            });
            const result = await response.json();

            if (result.success) {
                setVerified(true);
                sessionStorage.removeItem(otpStorageKey(email));
                handleSuccess(result.message || 'User has been verified, please login.');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }

            // Too many wrong attempts or an expired code both require a fresh OTP.
            if (response.status === 429 || response.status === 410) {
                setErrorMessage(result.message);
                setShowResend(true);
                return;
            }

            // Wrong code with attempts still remaining - timer keeps running as-is.
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
                    <div className={`verify-icon-badge${verified ? ' verified' : ''}`} aria-hidden="true">
                        {verified ? '✓' : '✉'}
                    </div>
                    <h1>{verified ? "You're verified!" : 'Verify your email'}</h1>
                    <p>
                        {verified
                            ? 'Your account is verified. Redirecting to login...'
                            : <>Enter the 6-digit code we sent to <span className="verify-email-chip">{email || 'your email'}</span></>}
                    </p>

                    {!verified && (
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
                                    disabled={isSending}
                                    autoFocus
                                />
                                <p className="otp-hint">
                                    {otpInput.length > 0 && otpInput.length !== 6
                                        ? `The code must be exactly 6 digits (${otpInput.length}/6 entered).`
                                        : 'Enter the 6-digit code.'}
                                </p>

                                {errorMessage && <p className="verify-error-message">{errorMessage}</p>}

                                <p className="verify-timer">
                                    {remainingSeconds > 0
                                        ? `Code expires in ${formatTime(remainingSeconds)}`
                                        : 'Code expired'}
                                </p>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={isVerifying || isSending || remainingSeconds <= 0 || otpInput.length !== 6}
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify'}
                                </button>
                            </form>

                            {showResend && (
                                <button
                                    type="button"
                                    className="verify-resend-btn"
                                    onClick={callSendOtp}
                                    disabled={isSending}
                                >
                                    <span className={`verify-resend-icon${isSending ? ' spinning' : ''}`} aria-hidden="true">&#8635;</span>
                                    {isSending ? 'Sending...' : 'Resend code'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default VerifyEmail;
