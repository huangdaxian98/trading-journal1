// src/services/tradeService.js
import { db, auth } from "../firebase";
import { 
  collection, addDoc, updateDoc, doc, deleteDoc, 
  getDocs, query, where, orderBy 
} from "firebase/firestore";

export const tradeService = {
  // 获取交易记录
  async getTrades() {
    try {
      const user = auth.currentUser;
      if (!user) return [];
      
      const q = query(
        collection(db, "trades"),
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("获取交易记录失败:", error);
      return [];
    }
  },
  
  // 添加交易记录
  async addTrade(trade) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("请先登录");
      
      return await addDoc(collection(db, "trades"), {
        ...trade,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("添加交易记录失败:", error);
      throw error;
    }
  },
  
  // 更新交易记录
  async updateTrade(id, trade) {
    try {
      await updateDoc(doc(db, "trades", id), trade);
    } catch (error) {
      console.error("更新交易记录失败:", error);
      throw error;
    }
  },
  
  // 删除交易记录
  async deleteTrade(id) {
    try {
      await deleteDoc(doc(db, "trades", id));
    } catch (error) {
      console.error("删除交易记录失败:", error);
      throw error;
    }
  }
};