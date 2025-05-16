// 初始化Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBV_mrY9q6o95yAoMin4QymGMqMxWTKTUA",
    authDomain: "trading-journal-b6ac4.firebaseapp.com",
    projectId: "trading-journal-b6ac4",
    storageBucket: "trading-journal-b6ac4.firebasestorage.app",
    messagingSenderId: "697087405642",
    appId: "1:697087405642:web:f61cdaf810424a35e700b3",
    measurementId: "G-09TNMP4K42"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM元素
const tradeModal = document.getElementById('trade-modal');
const addTradeBtn = document.getElementById('add-trade');
const saveTradeBtn = document.getElementById('save-trade');
const cancelTradeBtn = document.getElementById('cancel-trade');
const closeModalBtn = document.getElementById('close-modal');
const longBtn = document.getElementById('direction-long');
const shortBtn = document.getElementById('direction-short');
const modalLongBtn = document.getElementById('modal-long');
const modalShortBtn = document.getElementById('modal-short');
const emotionItems = document.querySelectorAll('.emotion-item');
const modalEmotionItems = document.querySelectorAll('.modal .emotion-item');
const tabs = document.querySelectorAll('.tab');
const moodSlider = document.getElementById('mood-range');
const tags = document.querySelectorAll('.tag');
const savePlanBtn = document.getElementById('save-plan');
const exportLogBtn = document.getElementById('export-log');
const logoutBtn = document.getElementById('logout');
const saveEmotionCardBtn = document.getElementById('save-emotion-card');
const saveEmotionReviewBtn = document.getElementById('save-emotion-review');
const challengeForm = document.getElementById('challenge-form');

// 用户状态检查
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('用户已登录:', user.email);
        document.getElementById('username').textContent = user.email;
        loadTradeData();
    } else {
        console.log('用户未登录，重定向到登录页');
        window.location.href = 'login.html';
    }
});

// 挑战设置表单提交
challengeForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const currentBalance = parseFloat(document.getElementById('current-balance').value);
        const startBalance = parseFloat(document.getElementById('start-balance').value);
        const targetBalance = parseFloat(document.getElementById('target-balance').value);
        const daysCount = parseInt(document.getElementById('days-count').value);
        const phaseCount = parseInt(document.getElementById('phase-count').value);
        const totalPhases = parseInt(document.getElementById('total-phases').value);
        
        // 验证数据
        if (isNaN(currentBalance) || isNaN(startBalance) || isNaN(targetBalance) || 
            isNaN(daysCount) || isNaN(phaseCount) || isNaN(totalPhases)) {
            alert('请输入有效的数字');
            return;
        }
        
        // 更新进度条
        const progressPercentage = (currentBalance - startBalance) / (targetBalance - startBalance) * 100;
        document.querySelector('.progress-fill').style.width = `${Math.max(0, Math.min(100, progressPercentage))}%`;
        
        // 更新下一目标
        const nextGoal = Math.min(currentBalance * 1.5, targetBalance);
        const remainingAmount = nextGoal - currentBalance;
        document.querySelector('.goal-title').textContent = `下一目标: ${nextGoal.toFixed(0)} USDT`;
        document.querySelector('.goal-progress').textContent = `再赚${remainingAmount.toFixed(0)} USDT即可达成，加油！`;
        
        // 保存到Firebase（如果用户已登录）
        if (auth.currentUser) {
            await db.collection('userConfig').doc(auth.currentUser.uid).update({
                currentBalance,
                startBalance,
                targetBalance,
                dayCount: daysCount,
                currentPhase: phaseCount,
                totalPhases
            });
            
            alert('挑战设置已保存');
        }
    } catch (error) {
        console.error('保存挑战设置失败:', error);
        alert('保存设置失败: ' + error.message);
    }
});

// 加载交易数据
async function loadTradeData() {
    try {
        // 加载用户配置
        if (auth.currentUser) {
            const configDoc = await db.collection('userConfig').doc(auth.currentUser.uid).get();
            
            if (configDoc.exists) {
                const config = configDoc.data();
                document.getElementById('current-balance').value = config.currentBalance || 0;
                document.getElementById('start-balance').value = config.startBalance || 0;
                document.getElementById('target-balance').value = config.targetBalance || 0;
                document.getElementById('days-count').value = config.dayCount || 0;
                document.getElementById('phase-count').value = config.currentPhase || 1;
                document.getElementById('total-phases').value = config.totalPhases || 5;
                
                // 设置进度条
                const progressPercentage = (config.currentBalance - config.startBalance) / (config.targetBalance - config.startBalance) * 100;
                document.querySelector('.progress-fill').style.width = `${Math.max(0, Math.min(100, progressPercentage))}%`;
                
                // 设置下一目标
                const nextGoal = Math.min(config.currentBalance * 1.5, config.targetBalance);
                const remainingAmount = nextGoal - config.currentBalance;
                document.querySelector('.goal-title').textContent = `下一目标: ${nextGoal.toFixed(0)} USDT`;
                document.querySelector('.goal-progress').textContent = `再赚${remainingAmount.toFixed(0)} USDT即可达成，加油！`;
            }
        }
        
        // 加载交易记录
        const tradesSnapshot = await db.collection('trades')
            .where('userId', '==', auth.currentUser.uid)
            .orderBy('date', 'desc')
            .limit(20)
            .get();
        
        const tradesTableBody = document.querySelector('.trades-table tbody');
        tradesTableBody.innerHTML = '';
        
        let totalProfit = 0;
        let winCount = 0;
        let totalTrades = tradesSnapshot.docs.length;
        
        tradesSnapshot.docs.forEach(doc => {
            const trade = doc.data();
            totalProfit += Number(trade.pnl || 0);
            if (Number(trade.pnl || 0) > 0) winCount++;
            
            const tr = document.createElement('tr');
            tr.className = Number(trade.pnl || 0) > 0 ? 'profit-row' : 'loss-row';
            
            // 格式化日期
            const date = trade.date ? new Date(trade.date.toDate()) : new Date();
            const formattedDate = `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${trade.symbol}</td>
                <td class="direction ${trade.direction}">
                    ${trade.direction === 'long' ? '多' : '空'} 
                    <i class="fas fa-arrow-${trade.direction === 'long' ? 'up' : 'down'}"></i>
                </td>
                <td class="${Number(trade.pnl || 0) > 0 ? 'profit' : 'loss'}">
                    ${Number(trade.pnl || 0) > 0 ? '+' : ''}${trade.pnl} USDT
                </td>
                <td class="emotion">${getEmotionEmoji(trade.emotion)}</td>
                <td class="actions">
                    <button class="icon-btn" data-id="${doc.id}"><i class="fas fa-eye"></i></button>
                </td>
            `;
            
            tradesTableBody.appendChild(tr);
        });
        
        // 更新统计数据
        if (totalTrades > 0) {
            document.querySelector('.stat-box:nth-child(1) .stat-value').innerHTML = `${Math.round((winCount / totalTrades) * 100)}% <i class="fas fa-bullseye"></i>`;
            document.querySelector('.stat-box:nth-child(3) .stat-value').innerHTML = `${totalProfit > 0 ? '+' : ''}${totalProfit} <i class="fas fa-chart-line"></i>`;
            document.querySelector('.stat-box:nth-child(4) .stat-value').innerHTML = `${totalTrades} <i class="fas fa-exchange-alt"></i>`;
        }
        
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败，请刷新页面重试');
    }
}

// 获取情绪对应的Emoji
function getEmotionEmoji(emotion) {
    const emotionMap = {
        'excited': '😊',
        'neutral': '😐',
        'low': '😔',
        'anxious': '😠',
        'stressed': '😵'
    };
    return emotionMap[emotion] || '😐';
}

// 交易方向切换
longBtn.addEventListener('click', () => {
    longBtn.classList.add('active');
    shortBtn.classList.remove('active');
});

shortBtn.addEventListener('click', () => {
    shortBtn.classList.add('active');
    longBtn.classList.remove('active');
});

modalLongBtn.addEventListener('click', () => {
    modalLongBtn.classList.add('active');
    modalShortBtn.classList.remove('active');
});

modalShortBtn.addEventListener('click', () => {
    modalShortBtn.classList.add('active');
    modalLongBtn.classList.remove('active');
});

// 情绪选择
emotionItems.forEach(item => {
    item.addEventListener('click', () => {
        // 找到父元素下的所有情绪选项
        const parent = item.closest('.tab-content');
        if (parent) {
            parent.querySelectorAll('.emotion-item').forEach(i => i.classList.remove('active'));
        } else {
            document.querySelectorAll('.emotion-item').forEach(i => i.classList.remove('active'));
        }
        item.classList.add('active');
    });
});

modalEmotionItems.forEach(item => {
    item.addEventListener('click', () => {
        modalEmotionItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// 标签切换
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('active');
    });
});

// 标签页切换
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabTarget = tab.getAttribute('data-tab');
        
        // 激活标签
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 显示对应内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabTarget}-content`).classList.remove('hidden');
    });
});

// 初始化晚间复盘选项卡的事件监听器
document.querySelectorAll('#emotion-review-content .emotion-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('#emotion-review-content .emotion-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

document.querySelectorAll('#emotion-review-content .tag').forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('active');
    });
});

// 保存早间打卡
saveEmotionCardBtn.addEventListener('click', async () => {
    try {
        // 获取选中的情绪
        let emotion = 'neutral';
        document.querySelectorAll('#emotion-card-content .emotion-item').forEach(item => {
            if (item.classList.contains('active')) {
                emotion = item.getAttribute('data-emotion');
            }
        });
        
        // 获取情绪质量
        const moodQuality = document.getElementById('mood-range').value;
        
        // 获取情绪标签
        const emotionTags = [];
        document.querySelectorAll('#emotion-card-content .tag.active').forEach(tag => {
            emotionTags.push(tag.textContent.trim());
        });
        
        // 获取情绪描述
        const notes = document.querySelector('#emotion-card-content .emotion-notes').value;
        
        // 保存到Firebase
        if (auth.currentUser) {
            await db.collection('emotions').add({
                userId: auth.currentUser.uid,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                emotion,
                moodQuality: Number(moodQuality),
                emotionTags,
                notes,
                type: 'morning'
            });
            
            alert('早间打卡已保存');
        } else {
            alert('请先登录');
        }
    } catch (error) {
        console.error('保存早间打卡失败:', error);
        alert('保存早间打卡失败: ' + error.message);
    }
});

// 晚间复盘提交
saveEmotionReviewBtn.addEventListener('click', async function() {
    try {
        // 获取选中的情绪
        let emotion = 'neutral';
        document.querySelectorAll('#emotion-review-content .emotion-item').forEach(item => {
            if (item.classList.contains('active')) {
                emotion = item.getAttribute('data-emotion');
            }
        });
        
        // 获取情绪质量
        const moodQuality = document.getElementById('evening-mood-range').value;
        
        // 获取情绪标签
        const emotionTags = [];
        document.querySelectorAll('#emotion-review-content .tag.active').forEach(tag => {
            emotionTags.push(tag.textContent.trim());
        });
        
        // 获取复盘内容
        const reviewNotes = document.querySelectorAll('#emotion-review-content textarea')[0].value;
        const lessonNotes = document.querySelectorAll('#emotion-review-content textarea')[1].value;
        
        // 保存到Firebase
        if (auth.currentUser) {
            await db.collection('emotions').add({
                userId: auth.currentUser.uid,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                emotion,
                moodQuality: Number(moodQuality),
                emotionTags,
                reviewNotes,
                lessonNotes,
                type: 'evening'
            });
            
            alert('晚间复盘已保存');
        } else {
            alert('请先登录');
        }
    } catch (error) {
        console.error('保存晚间复盘失败:', error);
        alert('保存晚间复盘失败: ' + error.message);
    }
});

// 保存交易计划
savePlanBtn.addEventListener('click', async () => {
    try {
        const symbol = document.getElementById('symbol').value;
        const direction = document.getElementById('direction-long').classList.contains('active') ? 'long' : 'short';
        const entryPrice = document.getElementById('entry-price').value;
        const stopLoss = document.getElementById('stop-loss').value;
        const takeProfit = document.getElementById('take-profit').value;
        const maxLoss = document.getElementById('max-loss').value;
        const reason = document.getElementById('trade-reason').value;
        
        if (!symbol || !entryPrice || !stopLoss || !takeProfit) {
            alert('请填写完整的交易计划信息');
            return;
        }
        
        const plan = {
            userId: auth.currentUser.uid,
            symbol,
            direction,
            entryPrice: Number(entryPrice),
            stopLoss: Number(stopLoss),
            takeProfit: Number(takeProfit),
            maxLoss: Number(maxLoss),
            reason,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };
        
        await db.collection('tradingPlans').add(plan);
        alert('交易计划已保存');
    } catch (error) {
        console.error('保存交易计划失败:', error);
        alert('保存交易计划失败，请重试');
    }
});

// 显示新交易模态框
addTradeBtn.addEventListener('click', () => {
    // 设置当前日期时间
    const now = new Date();
    const localDatetime = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('modal-date').value = localDatetime;
    
    // 清空其他字段
    document.getElementById('modal-symbol').value = '';
    document.getElementById('modal-entry').value = '';
    document.getElementById('modal-exit').value = '';
    document.getElementById('modal-sl').value = '';
    document.getElementById('modal-tp').value = '';
    document.getElementById('modal-pnl').value = '';
    document.getElementById('modal-notes').value = '';
    
    // 重置选项
    modalLongBtn.classList.add('active');
    modalShortBtn.classList.remove('active');
    modalEmotionItems.forEach(i => i.classList.remove('active'));
    
    // 显示模态框
    tradeModal.classList.add('active');
});

// 关闭模态框
function closeModal() {
    tradeModal.classList.remove('active');
}

closeModalBtn.addEventListener('click', closeModal);
cancelTradeBtn.addEventListener('click', closeModal);

// 保存交易记录
saveTradeBtn.addEventListener('click', async () => {
    try {
        const symbol = document.getElementById('modal-symbol').value;
        const dateTime = document.getElementById('modal-date').value;
        const direction = modalLongBtn.classList.contains('active') ? 'long' : 'short';
        const entryPrice = document.getElementById('modal-entry').value;
        const exitPrice = document.getElementById('modal-exit').value;
        const stopLoss = document.getElementById('modal-sl').value;
        const takeProfit = document.getElementById('modal-tp').value;
        const pnl = document.getElementById('modal-pnl').value;
        const notes = document.getElementById('modal-notes').value;
        
        // 获取选中的情绪
        let emotion = 'neutral';
        modalEmotionItems.forEach(item => {
            if (item.classList.contains('active')) {
                emotion = item.getAttribute('data-emotion');
            }
        });
        
        if (!symbol || !dateTime || !entryPrice || !exitPrice || !pnl) {
            alert('请填写完整的交易信息');
            return;
        }
        
        const trade = {
            userId: auth.currentUser.uid,
            symbol,
            date: firebase.firestore.Timestamp.fromDate(new Date(dateTime)),
            direction,
            entryPrice: Number(entryPrice),
            exitPrice: Number(exitPrice),
            stopLoss: stopLoss ? Number(stopLoss) : null,
            takeProfit: takeProfit ? Number(takeProfit) : null,
            pnl: Number(pnl),
            emotion,
            notes,
            created: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // 添加交易记录
        await db.collection('trades').add(trade);
        
        // 更新用户资金
        const userConfigRef = db.collection('userConfig').doc(auth.currentUser.uid);
        const userDoc = await userConfigRef.get();
        
        if (userDoc.exists) {
            await userConfigRef.update({
                currentBalance: firebase.firestore.FieldValue.increment(Number(pnl))
            });
        }
        
        alert('交易记录已保存');
        closeModal();
        loadTradeData(); // 重新加载数据
    } catch (error) {
        console.error('保存交易记录失败:', error);
        alert('保存交易记录失败，请重试');
    }
});

// 导出日志
exportLogBtn.addEventListener('click', async () => {
    try {
        const tradesSnapshot = await db.collection('trades')
            .where('userId', '==', auth.currentUser.uid)
            .orderBy('date', 'desc')
            .get();
        
        let csvContent = "数据, 时间, 币种, 方向, 进场价, 出场价, 盈亏, 情绪, 笔记\n";
        
        tradesSnapshot.docs.forEach(doc => {
            const trade = doc.data();
            const date = trade.date ? new Date(trade.date.toDate()) : new Date();
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().split(' ')[0];
            
            csvContent += `${dateStr},${timeStr},${trade.symbol},${trade.direction === 'long' ? '多' : '空'},${trade.entryPrice},${trade.exitPrice},${trade.pnl},"${getEmotionEmoji(trade.emotion)}","${trade.notes || ''}"\n`;
        });
        
        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `交易日志_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('导出日志失败:', error);
        alert('导出日志失败，请重试');
    }
});

// 退出登录
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('退出登录失败:', error);
        alert('退出登录失败，请重试');
    }
});

// 设置模态框点击事件
window.addEventListener('click', (e) => {
    if (e.target === tradeModal) {
        closeModal();
    }
});