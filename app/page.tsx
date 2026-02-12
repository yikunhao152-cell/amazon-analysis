"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    model: '', asin: '', type: '', features: '', 
    scenario: '', audience: '', price: '', rufusQuestions: ''
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setStatus('🚀 任务已提交，AI 正在分析...');

    try {
      // 1. 提交
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. 轮询
      setAnalyzing(true);
      const interval = setInterval(async () => {
        try {
          const check = await fetch(`/api/result?recordId=${data.recordId}&model=${encodeURIComponent(formData.model)}`);
          const checkData = await check.json();
          
          if (checkData.status === 'done') {
            clearInterval(interval);
            setResult(checkData.data); // 拿到数据！
            setAnalyzing(false);
            setLoading(false);
            setStatus('✅ 分析完成！');
          }
        } catch (e) { console.error(e); }
      }, 3000); // 每3秒查一次

    } catch (error: any) {
      setStatus(`❌ 出错: ${error.message}`);
      setLoading(false);
    }
  };

  const handleChange = (e: any) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div className="container">
      <h1 className="title">🚀 亚马逊选品分析器 Pro</h1>
      
      {/* 结果出来后隐藏表单，显示清爽的结果 */}
      {!result ? (
        <div className="card">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="row"><label>型号</label><input name="model" required value={formData.model} onChange={handleChange} /></div>
            <div className="row"><label>ASIN</label><input name="asin" required value={formData.asin} onChange={handleChange} /></div>
            <div className="row"><label>产品类型</label><input name="type" required value={formData.type} onChange={handleChange} /></div>
            <div className="row"><label>目标定价</label><input name="price" required value={formData.price} onChange={handleChange} /></div>
            <div className="full"><label>功能点</label><input name="features" required value={formData.features} onChange={handleChange} /></div>
            <div className="full"><label>使用场景</label><input name="scenario" required value={formData.scenario} onChange={handleChange} /></div>
            <div className="full"><label>目标人群</label><input name="audience" required value={formData.audience} onChange={handleChange} /></div>
            <div className="full"><label>Rufus 问题</label><textarea name="rufusQuestions" value={formData.rufusQuestions} onChange={handleChange} /></div>
            
            <button type="submit" disabled={loading} className="btn-primary">
              {analyzing ? '⏳ AI 正在思考 (约40秒)...' : '开始分析'}
            </button>
          </form>
          {status && <p className="status">{status}</p>}
        </div>
      ) : (
        <div className="result-container">
          <button onClick={() => {setResult(null); setLoading(false);}} className="btn-secondary">← 分析下一个</button>
          
          {/* ✅ 这里的字段名已严格对应你的表3截图 */}
          <ResultSection title="📢 标题 (Title)" content={result["标题"]} reason={result["标题理由"]} />
          <ResultSection title="✨ 五点描述 (Bullets)" content={result["五点描述"]} reason={result["五点描述理由"]} />
          <ResultSection title="📝 商品描述 (Description)" content={result["商品描述"]} reason={result["商品描述理由"]} />
          <ResultSection title="🖼️ 主图设计 (Main Image)" content={result["主图设计方向"]} reason={result["主图设计方向理由"]} />
          <ResultSection title="🎨 A+ 页面设计" content={result["A+设计方向"]} reason={result["A+设计方向理由"]} />
        </div>
      )}
      
      <style jsx>{`
        .container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif; }
        .title { text-align: center; color: #333; margin-bottom: 30px; }
        .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .row { display: flex; flex-direction: column; }
        .full { grid-column: span 2; }
        input, textarea { padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-top: 5px; font-size: 16px; }
        textarea { height: 80px; resize: vertical; }
        .btn-primary { grid-column: span 2; padding: 15px; background: #0070f3; color: white; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; margin-top: 10px; }
        .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        .status { text-align: center; margin-top: 15px; color: #666; }
        
        .result-container { animation: fadeIn 0.5s; }
        .btn-secondary { margin-bottom: 20px; padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; }
        .result-box { background: white; border: 1px solid #e1e4e8; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .res-header { background: #f6f8fa; padding: 12px 20px; font-weight: bold; border-bottom: 1px solid #e1e4e8; color: #24292e; }
        .res-body { padding: 20px; white-space: pre-wrap; line-height: 1.6; color: #24292e; }
        .res-reason { background: #fffbe6; padding: 15px 20px; border-top: 1px dashed #ffe58f; font-size: 14px; color: #856404; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function ResultSection({ title, content, reason }: any) {
  if (!content) return null;
  return (
    <div className="result-box">
      <div className="res-header">{title}</div>
      <div className="res-body">{content}</div>
      {reason && <div className="res-reason">💡 <strong>AI 策略理由：</strong><br/>{reason}</div>}
    </div>
  );
}
