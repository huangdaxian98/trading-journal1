// src/components/Auth.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' 或 'register'
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("认证错误:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{mode === 'login' ? '登录' : '注册'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>
        
        <div className="auth-switch">
          {mode === 'login' ? (
            <p>还没有账号？ <button onClick={() => setMode('register')}>注册</button></p>
          ) : (
            <p>已有账号？ <button onClick={() => setMode('login')}>登录</button></p>
          )}
        </div>
      </div>
    </div>
  );
}