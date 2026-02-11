"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // 表单数据状态
  const [formData, setFormData] = useState({
    model: '',         // 型号
    asin: '',          // 竞品ASIN
    type: '',          // 产品类型
    features: '',      // 功能点
    scenario: '',      // 使用场景
    audience: '',      // 目标人群
    price: '',         // 目标定价
    rufusQuestions: '' // ✅ 新增：竞品rufus问题
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setStatus('正在写入飞书并唤醒 n8n...');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || '请求失败');

      setStatus('✅ 成功！数据已写入飞书，n8n 正在后台分析，请去飞书查看结果。');
    } catch (error: any) {
      console.error(error);
      setStatus(`❌ 失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div style={{maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif'}}>
      <h1 style={{textAlign: 'center', marginBottom: '30px'}}>亚马逊选品分析启动器</h1>
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        
        {/* 1. 型号 */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>型号 (Model)</label>
          <input name="model" required value={formData.model} onChange={handleChange} style={inputStyle} placeholder="例如: G7-Pro Wireless" />
        </div>

        {/* 2. ASIN */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>竞品 ASIN</label>
          <input name="asin" required value={formData.asin} onChange={handleChange} style={inputStyle} placeholder="例如: B0C5T9JM59" />
        </div>

        {/* 3. 产品类型 */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>产品类型</label>
          <input name="type" required value={formData.type} onChange={handleChange} style={inputStyle} placeholder="例如: 游戏无线头戴耳机" />
        </div>

        {/* 4. 功能点 */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>功能点</label>
          <input name="features" required value={formData.features} onChange={handleChange} style={inputStyle} placeholder="例如: 降噪, 蓝牙usb双链接" />
        </div>

        {/* 5. 使用场景 */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>使用场景</label>
          <input name="scenario" required value={formData.scenario} onChange={handleChange} style={inputStyle} placeholder="例如: 游戏" />
        </div>

        {/* 6. 目标人群 */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>目标人群</label>
          <input name="audience" required value={formData.audience} onChange={handleChange} style={inputStyle} placeholder="例如: 打游戏的人" />
        </div>

        {/* 7. 目标定价 */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>目标定价</label>
          <input name="price" required value={formData.price} onChange={handleChange} style={inputStyle} placeholder="例如: 56.99" />
        </div>

        {/* 8. 竞品rufus问题 (新增) */}
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>竞品 Rufus 问题</label>
          <textarea 
            name="rufusQuestions" 
            value={formData.rufusQuestions} 
            onChange={handleChange} 
            style={{...inputStyle, height: '80px', fontFamily: 'inherit'}} 
            placeholder="例如: Does it have noise cancellation?" 
          />
        </div>

        <button type="submit" disabled={loading} style={{
          padding: '15px', 
          fontSize: '18px', 
          background: loading ? '#ccc' : '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '10px'
        }}>
          {loading ? '🚀 处理中...' : '开始分析'}
        </button>
      </form>

      {status && <div style={{
        marginTop: '20px', 
        padding: '15px', 
        borderRadius: '8px',
        background: status.includes('✅') ? '#d4edda' : '#f8d7da',
        color: status.includes('✅') ? '#155724' : '#721c24'
      }}>
        {status}
      </div>}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '16px'
};
