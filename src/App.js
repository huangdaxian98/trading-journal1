// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from 'firebase/auth';

// 导入组件
import { Login } from './components/Auth';
import TradeForm from './components/TradeForm';
import TradeList from './components/TradeList';

// 导航栏组件
function Navbar({ user }) {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <span>🚀</span> 交易复盘系统
        </div>
        
        {user && (
          <div className="navbar-menu">
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="btn btn-outline">退出</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// 受保护的路由
function ProtectedRoute({ children, user, isLoading }) {
  if (isLoading) {
    return <div className="loading-container">加载中...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// 主应用组件
function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 监听认证状态
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // 交易添加完成后的回调
  const handleTradeAdded = () => {
    // 可以添加成功提示或其他操作
  };
  
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="app">
        <Navbar user={user} />
        
        <div className="container main-content">
          <Routes>
            {/* 登录路由 */}
            <Route path="/login" element={
              isLoading ? (
                <div className="loading-container">加载中...</div>
              ) : (
                user ? <Navigate to="/" /> : <Login />
              )
            } />
            
            {/* 主页/交易记录 */}
            <Route path="/" element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <div className="trades-container">
                  <div className="form-column">
                    <TradeForm onTradeAdded={handleTradeAdded} />
                  </div>
                  <div className="list-column">
                    <TradeList />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* 404页面 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        
        <footer className="footer">
          <div className="container">
            <p>交易复盘系统 &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;