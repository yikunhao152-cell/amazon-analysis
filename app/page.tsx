"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  // 你的表1字段
  const [formData, setFormData] = useState({
    model: '', // 型号
    competitorType: '', // 竞品类型
    forWhom: '', // 为谁设计
    usageScenario: '', // 使用场景
    targetAudience: '', // 目标人群
    price: '', // 自定价格
    asin: '' // 竞品ASIN
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setStatus('正在提交到飞书并触发 n8n...');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '请求失败');
      setStatus('✅ 提交成功！飞书已记录，n8n 已开始分析。请稍后在输出表中查看结果。');
    } catch (error: any) {
      setStatus('❌ 发生错误: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div style={{maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif', padding: '20px'}}>
      <h1 style={{textAlign: 'center'}}>亚马逊产品分析启动器</h1>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        
        <input name="model" placeholder="型号 (Model)" required value={formData.model} onChange={handleChange} style={inputStyle} />
        <input name="asin" placeholder="竞品 ASIN" required value={formData.asin} onChange={handleChange} style={inputStyle} />
        <input name="competitorType" placeholder="竞品类型" value={formData.competitorType} onChange={handleChange} style={inputStyle} />
        <input name="forWhom" placeholder="为谁设计" value={formData.forWhom} onChange={handleChange} style={inputStyle} />
        <input name="usageScenario" placeholder="使用场景" value={formData.usageScenario} onChange={handleChange} style={inputStyle} />
        <input name="targetAudience" placeholder="目标人群" value={formData.targetAudience} onChange={handleChange} style={inputStyle} />
        <input name="price" type="number" placeholder="自定价格" value={formData.price} onChange={handleChange} style={inputStyle} />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? '处理中...' : '🚀 开始分析'}
        </button>
      </form>
      {status && <div style={{marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px'}}>{status}</div>}
    </div>
  );
}

const inputStyle = { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' };
const buttonStyle = { padding: '15px', fontSize: '18px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
