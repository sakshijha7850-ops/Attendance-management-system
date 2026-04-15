import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [lightOn, setLightOn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const cordRef = useRef(null);
  const pullRef = useRef(null);
  const isPulling = useRef(false);

  useEffect(() => {
    const cord = cordRef.current;
    const pullDiv = pullRef.current;
    if (!cord || !pullDiv) return;

    const handlePress = () => {
      if (isPulling.current) return;
      isPulling.current = true;

      // Pull cord down
      gsap.to(cord, { y: 30, duration: 0.15, ease: 'power2.out' });
      gsap.to(pullDiv, { scale: 0.9, duration: 0.15 });
    };

    const handleRelease = () => {
      if (!isPulling.current) return;

      // Snap back with elastic bounce
      gsap.to(cord, {
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
        onComplete: () => {
          isPulling.current = false;
        }
      });
      gsap.to(pullDiv, { scale: 1, duration: 0.3 });

      setLightOn(prev => {
        const next = !prev;
        if (next) {
          // Flash effect on turn on
          gsap.fromTo(
            '.light-beam',
            { opacity: 0 },
            { opacity: 1, duration: 0.2, ease: 'power2.out' }
          );
        }
        return next;
      });
    };

    pullDiv.addEventListener('mousedown', handlePress);
    window.addEventListener('mouseup', handleRelease);
    pullDiv.addEventListener('touchstart', handlePress, { passive: true });
    window.addEventListener('touchend', handleRelease);

    return () => {
      pullDiv.removeEventListener('mousedown', handlePress);
      window.removeEventListener('mouseup', handleRelease);
      pullDiv.removeEventListener('touchstart', handlePress);
      window.removeEventListener('touchend', handleRelease);
    };
  }, []);

  // Swing animation on hover
  useEffect(() => {
    const cord = cordRef.current;
    if (!cord) return;

    const handleHoverIn = () => {
      if (isPulling.current) return;
      gsap.to(cord, { rotation: 5, duration: 0.3, ease: 'power1.inOut', yoyo: true, repeat: 1 });
    };

    cord.addEventListener('mouseenter', handleHoverIn);
    return () => cord.removeEventListener('mouseenter', handleHoverIn);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', { isLogin, email, name });
    
    if (isLogin) {
      console.log('Attempting login...');
      const res = await login(email, password);
      console.log('Login response:', res);
      if (res.success) {
        toast.success('Logged in successfully');
        // Add small delay to ensure state is updated
        setTimeout(() => {
          navigateDashboard();
        }, 100);
      } else {
        toast.error(res.message);
      }
    } else {
      console.log('Attempting registration...');
      const res = await register(name, email, password); // Role & Batch assigned by backend Allowlist
      console.log('Registration response:', res);
      if (res.success) {
        toast.success('Account created successfully');
        // Add small delay to ensure state is updated
        setTimeout(() => {
          navigateDashboard();
        }, 100);
      } else {
        toast.error(res.message);
      }
    }
  };

  const navigateDashboard = () => {
    console.log('Attempting to navigate to dashboard...');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log('User info from localStorage:', userInfo);
    
    if (!userInfo) {
      console.error('No user info found in localStorage');
      toast.error('Login failed - no user data found');
      return;
    }
    
    if (!userInfo.role) {
      console.error('No role found in user info');
      toast.error('Login failed - no role assigned');
      return;
    }
    
    console.log('User role:', userInfo.role);
    
    // Try navigation with multiple approaches
    try {
      if (userInfo.role === 'admin') {
        console.log('Navigating to admin dashboard');
        window.location.href = '/admin-dashboard';
      }
      else if (userInfo.role === 'teacher') {
        console.log('Navigating to teacher dashboard');
        window.location.href = '/teacher-dashboard';
      }
      else {
        console.log('Navigating to student dashboard');
        window.location.href = '/student-dashboard';
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback to React Router
      if (userInfo.role === 'admin') navigate('/admin-dashboard');
      else if (userInfo.role === 'teacher') navigate('/teacher-dashboard');
      else navigate('/student-dashboard');
    }
  };
   
  const handleForgotPassword = async () => {
  if (!email) {
    toast.error('Please enter your email address');
    return;
  }
  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (response.ok) {
      setResetToken(data.resetToken);
      toast.success('Reset token generated!');
    } else {
      toast.error(data.message || 'Failed to generate reset token');
    }
  } catch (error) {
    toast.error('Failed to generate reset token');
  }
};
  const handleResetPassword = async () => {
  if (!resetToken || !newPassword) {
    toast.error('Please enter reset token and new password');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/reset-password', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetToken, newPassword }), 
    });

    const data = await response.json();

    if (response.ok) {
      toast.success('Password reset successful! Please login.');
      setShowForgotPassword(false);
      setResetToken('');
      setNewPassword('');
      setEmail('');
    } else {
      toast.error(data.message || 'Reset failed');
    }
  } catch (error) {
    toast.error('Server error');
  }
};

  return (
    <div className={`lamp-container ${lightOn ? 'light-on' : ''}`}>
      {/* Lamp Elements */}
      <div className="wire"></div>
      <div className="lamp"></div>
      <div className="bulb"></div>
      <div className="light-beam"></div>

      {/* Pull Cord */}
      <div className="cord-wrapper" ref={cordRef}>
        <div className="cord">
          <div className="cord-pull" ref={pullRef}></div>
        </div>
      </div>

      {/* Login / Register Form */}
      <div className="login-form-container">
        <h2>{showForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome' : 'Create Account')}</h2>

        {!showForgotPassword && (
          <>
            {!lightOn && (
              <p className="text-center text-sm text-gray-400 mb-4 animate-pulse">
                Pull the red cord to turn on the light!
              </p>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-group">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
              )}

              <div className="input-group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username (Email)"
                />
                {!isLogin && (
                  <small style={{ 
                    color: '#64748b', 
                    fontSize: '11px', 
                    marginTop: '4px', 
                    display: 'block',
                    textAlign: 'center'
                  }}>
                  
                  </small>
                )}
              </div>

              <div className="input-group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={!lightOn}
                title={!lightOn ? 'Turn on the light first!' : ''}
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </span>

            <span className="toggle-link" onClick={() => setShowForgotPassword(true)} style={{ marginTop: '10px', color: '#3b82f6' }}>
              Forgot Password?
            </span>
          </>
        )}

        {showForgotPassword && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Enter your email to generate a reset token, then use the token to set a new password.
            </p>

            <div className="input-group" style={{ marginBottom: '15px' }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
    </div>
            
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={handleForgotPassword}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  width: '100%'
                }}
              >
                Generate Reset Token
              </button>
            </div>

            <div className="input-group">
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Enter Reset Token"
                style={{ marginBottom: '10px',
                  width: '100%',
    background: '#272a3f',
    border: '1.5px solid #2e3048',
    borderRadius: '10px',
    color: '#e8e9f0',
    padding: '14px 16px',
    fontSize: '0.85rem',
    resize: 'none',
    fontFamily: 'monospace'
              
                }}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
                style={{ marginBottom: '15px' }}
              />
            </div>
               
            <button
              onClick={handleResetPassword}
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Reset Password
            </button>

            <span className="toggle-link" onClick={() => setShowForgotPassword(false)} style={{ marginTop: '15px', display: 'block', color: '#64748b' }}>
              Back to Login
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
