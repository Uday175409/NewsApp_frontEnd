import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const EmailVerification = () => {
  // Get user from localStorage
  const getUser = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) return JSON.parse(userData);
      return null;
    } catch {
      return null;
    }
  };
  const user = getUser();
  const [email, setEmail] = useState(user?.email || "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("request");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPendingCode, setHasPendingCode] = useState(false);

  // Check if user has a pending code (simulate DB check)
  useEffect(() => {
    if (user && !user.isVerified && user.verificationCode) {
      setHasPendingCode(true);
      setStep("verify");
    } else {
      setHasPendingCode(false);
      setStep("request");
    }
  }, [user]);

  // Hide component if user is verified
  if (user?.isVerified) return null;

  // Persist step and email in localStorage
  useEffect(() => {
    const savedStep = localStorage.getItem("emailVerificationStep");
    const savedEmail = localStorage.getItem("emailVerificationEmail");
    if (savedStep) setStep(savedStep);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  useEffect(() => {
    localStorage.setItem("emailVerificationStep", step);
    localStorage.setItem("emailVerificationEmail", email);
  }, [step, email]);

  const handleSendCode = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE_URL}/user/generate-code`, { email });
      setMessage(res.data.message);
      setStep("verify");
      setHasPendingCode(true);
      // Optionally update local user data with code
      if (user) {
        user.verificationCode = true;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending code");
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE_URL}/user/verify-code`, { email, code });
      setMessage(res.data.message);
      
      // Update the user in localStorage to reflect verified status
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          user.isVerified = true;
          localStorage.setItem("user", JSON.stringify(user));
          // Force a page reload to reflect verification status
          window.location.reload();
        }
      } catch (err) {
        console.error("Error updating local user data:", err);
      }
      
      setStep("done");
      localStorage.removeItem("emailVerificationStep");
      localStorage.removeItem("emailVerificationEmail");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error verifying code");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, margin: '24px auto', maxWidth: 400, border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h4 style={{ marginBottom: 10, color: '#2196f3', fontWeight: 600, fontSize: 20, letterSpacing: 0.5 }}>Email Verification</h4>
      <p style={{ marginBottom: 18, fontSize: 15, color: '#444', textAlign: 'center' }}>Verify your email to unlock all features.</p>
      {step === "request" && !hasPendingCode && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            style={{ marginBottom: 14, width: '100%', padding: 10, fontSize: 15, borderRadius: 8, border: '1px solid #d0d0d0', background: '#f7f7f7' }}
          />
          <button onClick={handleSendCode} disabled={loading || !email} style={{ width: '100%', padding: 12, fontSize: 16, background: '#2196f3', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, cursor: loading || !email ? 'not-allowed' : 'pointer', opacity: loading || !email ? 0.7 : 1 }}>
            Send Verification Code
          </button>
        </>
      )}
      {(step === "verify" || hasPendingCode) && (
        <>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={loading}
            style={{ marginBottom: 14, width: '100%', padding: 10, fontSize: 15, borderRadius: 8, border: '1px solid #d0d0d0', background: '#f7f7f7' }}
            maxLength={6}
          />
          <button
            onClick={handleVerifyCode}
            disabled={code.length !== 6 || loading}
            style={{ width: '100%', padding: 12, fontSize: 16, background: code.length === 6 ? '#2196f3' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, marginBottom: 8, cursor: code.length === 6 && !loading ? 'pointer' : 'not-allowed', opacity: code.length === 6 ? 1 : 0.7 }}
          >
            Verify
          </button>
        </>
      )}
      {message && <p style={{ color: '#d32f2f', marginTop: 8, fontSize: 14 }}>{message}</p>}
    </div>
  );
}

export default EmailVerification;
