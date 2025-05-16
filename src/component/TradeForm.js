// src/components/TradeForm.js
import React, { useState } from 'react';
import { tradeService } from '../services/tradeService';

function TradeForm({ onTradeAdded }) {
  const [trade, setTrade] = useState({
    symbol: '',
    direction: 'long',
    entryPrice: '',
    exitPrice: '',
    profit: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    emotion: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrade(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tradeService.addTrade(trade);
      setTrade({
        symbol: '',
        direction: 'long',
        entryPrice: '',
        exitPrice: '',
        profit: '',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
        emotion: ''
      });
      onTradeAdded && onTradeAdded();
    } catch (error) {
      alert("添加交易失败: " + error.message);
    }
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h2>记录新交易</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>币种</label>
            <input 
              type="text" 
              name="symbol" 
              value={trade.symbol} 
              onChange={handleChange} 
              placeholder="BTC, ETH, SOL..." 
              required
            />
          </div>
          
          <div className="form-group">
            <label>交易方向</label>
            <div className="trade-direction-selector">
              <div 
                className={`direction-option ${trade.direction === 'long' ? 'active long' : ''}`}
                onClick={() => setTrade(prev => ({ ...prev, direction: 'long' }))}
              >
                <span>📈</span> 做多
              </div>
              <div 
                className={`direction-option ${trade.direction === 'short' ? 'active short' : ''}`}
                onClick={() => setTrade(prev => ({ ...prev, direction: 'short' }))}
              >
                <span>📉</span> 做空
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>进场价</label>
              <input 
                type="number" 
                name="entryPrice" 
                value={trade.entryPrice} 
                onChange={handleChange} 
                step="0.00000001"
                required
              />
            </div>
            
            <div className="form-group">
              <label>出场价</label>
              <input 
                type="number" 
                name="exitPrice" 
                value={trade.exitPrice} 
                onChange={handleChange} 
                step="0.00000001"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>盈亏金额 (USDT)</label>
            <input 
              type="number" 
              name="profit" 
              value={trade.profit} 
              onChange={handleChange} 
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label>交易日期</label>
            <input 
              type="date" 
              name="date" 
              value={trade.date} 
              onChange={handleChange} 
              required
            />
          </div>
          
          <div className="form-group">
            <label>交易情绪</label>
            <select name="emotion" value={trade.emotion} onChange={handleChange}>
              <option value="">选择交易情绪...</option>
              <option value="calm">冷静</option>
              <option value="confident">自信</option>
              <option value="afraid">恐惧</option>
              <option value="greedy">贪婪</option>
              <option value="fomo">怕踏空</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>交易笔记</label>
            <textarea 
              name="notes" 
              value={trade.notes} 
              onChange={handleChange} 
              placeholder="记录交易想法和复盘..." 
            />
          </div>
          
          <button type="submit" className="btn btn-primary">记录交易</button>
        </form>
      </div>
    </div>
  );
}

export default TradeForm;