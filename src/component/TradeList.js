// src/components/TradeList.js
import React, { useState, useEffect } from 'react';
import { tradeService } from '../services/tradeService';

function TradeList() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const loadTrades = async () => {
    setLoading(true);
    const data = await tradeService.getTrades();
    setTrades(data);
    setLoading(false);
  };
  
  useEffect(() => {
    loadTrades();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条交易记录吗？')) {
      await tradeService.deleteTrade(id);
      loadTrades();
    }
  };
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div className="card">
      <div className="card-header">
        <h2>交易记录</h2>
      </div>
      <div className="card-body">
        {trades.length === 0 ? (
          <p>暂无交易记录</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>币种</th>
                  <th>方向</th>
                  <th>进/出场价</th>
                  <th>盈亏</th>
                  <th>情绪</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(trade => (
                  <tr key={trade.id}>
                    <td>{trade.date}</td>
                    <td>{trade.symbol}</td>
                    <td className={trade.direction === 'long' ? 'text-success' : 'text-danger'}>
                      {trade.direction === 'long' ? '多' : '空'}
                    </td>
                    <td>
                      {trade.entryPrice} ➝ {trade.exitPrice}
                    </td>
                    <td className={parseFloat(trade.profit) >= 0 ? 'text-success' : 'text-danger'}>
                      {parseFloat(trade.profit) >= 0 ? '+' : ''}{trade.profit}
                    </td>
                    <td>{trade.emotion || '-'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline danger"
                        onClick={() => handleDelete(trade.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradeList;