"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false); // 是否正在轮询结果
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<any>(null); // 存储分析结果

  // 表单数据
  const [formData, setFormData] = useState({
    model: '', asin: '', type: '', features: '', 
    scenario: '', audience: '', price: '', rufusQuestions: ''
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResult(null); // 清空旧结果
    setStatus('🚀 正在提交任务...');

    try {
      // 1. 提交任务
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');

      // 2. 开始轮询结果
      setStatus('⏳ 任务已提交，AI 正在疯狂分析中 (预计 30-60秒)...');
      setAnalyzing(true);
      startPolling(data.recordId, formData.model);

    } catch (error: any) {
      console.error(error);
      setStatus(`❌ 错误: ${error.message}`);
      setLoading(false);
    }
  };

  // 轮询逻辑
  const startPolling = (recordId: string, model: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/result?recordId=${recordId}&model=${encodeURIComponent(model)}`);
        const data = await res.json();

        if (data.status === 'done') {
          clearInterval(interval); // 停止轮询
          setResult(data.data);    // 显示结果
          setAnalyzing(false);
          setLoading(false);
          setStatus('✅ 分析完成！');
        } else {
          // 还在跑，更新一下状态文字
          // setStatus(`⏳ AI 分析中... [状态: ${data.currentStatus || '处理中'}]`);
        }
      } catch (e) {
        console.error("查询出错，继续重试...");
      }
    }, 3000); // 每 3 秒查一次
  };

  const handleChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="container">
      <h1 style={{textAlign: 'center', marginBottom: '30px', color: '#333'}}>🚀 亚马逊选品分析器 Pro</h1>
      
      {/* 输入表单区域 */}
      <div className="card" style={{display: result ? 'none' : 'block'}}> {/* 有结果时隐藏表单，保持清爽 */}
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <div className="grid-2">
            <div><label>型号</label><input name="model" required value={formData.model} onChange={handleChange} placeholder="G7-Pro" /></div>
            <div><label>ASIN</label><input name="asin" required value={formData.asin} onChange={handleChange} placeholder="B0C5..." /></div>
          </div>
          <div className="grid-2">
            <div><label>产品类型</label><input name="type" required value={formData.type} onChange={handleChange} /></div>
            <div><label>目标定价</label><input name="price" required value={formData.price} onChange={handleChange} /></div>
          </div>
          <div><label>功能点</label><input name="features" required value={formData.features} onChange={handleChange} /></div>
          <div><label>使用场景</label><input name="scenario" required value={formData.scenario} onChange={handleChange} /></div>
          <div><label>目标人群</label><input name="audience" required value={formData.audience} onChange={handleChange} /></div>
          <div><label>Rufus 问题</label><textarea name="rufusQuestions" value={formData.rufusQuestions} onChange={handleChange} style={{height:'60px'}} /></div>

          <button type="submit" disabled={loading} className={`btn ${loading ? 'disabled' : ''}`}>
            {analyzing ? '⏳ AI 正在思考中...' : '开始分析'}
          </button>
        </form>
      </div>

      {/* 状态提示 */}
      {status && <div style={{textAlign:'center', margin:'20px', padding:'10px', background:'#f0f9ff', borderRadius:'8px', color:'#0052cc'}}>
        {status}
      </div>}

      {/* 结果展示区域 */}
      {result && (
        <div className="result-container">
          <div style={{textAlign:'center', marginBottom:'20px'}}>
             <button onClick={() => {setResult(null); setLoading(false);}} className="btn secondary">分析下一个</button>
          </div>

          <ResultSection title="📢 Listing 标题" content={result["标题"]} reason={result["标题理由"]} />
          <ResultSection title="✨ 五点描述" content={result["五点描述"]} reason={result["五点描述理由"]} />
          <ResultSection title="📝 商品描述" content={result["商品描述"]} reason={result["商品描述理由"]} />
          <ResultSection title="🖼️ 主图设计方向" content={result["主图设计方向"]} reason={result["主图设计方向理由"]} />
          <ResultSection title="🎨 A+ 设计方向" content={result["A+设计方向"]} reason={result["A+设计方向理由"]} />
        </div>
      )}

      {/* 简单的 CSS 样式 */}
      <style jsx>{`
        .container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
        .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px; color: #555; }
        input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
        .btn { width: 100%; padding: 15px; background: #0070f3; color: white; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; transition: 0.2s; }
        .btn.disabled { background: #ccc; cursor: not-allowed; }
        .btn.secondary { background: #666; width: auto; padding: 10px 30px; }
        
        .result-box { background: white; border: 1px solid #eee; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .result-header { background: #f8f9fa; padding: 12px 20px; font-weight: bold; border-bottom: 1px solid #eee; color: #333; }
        .result-body { padding: 20px; white-space: pre-wrap; line-height: 1.6; }
        .result-reason { background: #fffbe6; padding: 15px 20px; border-top: 1px dashed #ffe58f; font-size: 14px; color: #856404; }
      `}</style>
    </div>
  );
}

// 结果展示小组件
function ResultSection({ title, content, reason }: any) {
  if (!content) return null;
  return (
    <div className="result-box">
      <div className="result-header">{title}</div>
      <div className="result-body">{content}</div>
      {reason && <div className="result-reason">💡 <strong>AI 策略理由：</strong><br/>{reason}</div>}
    </div>
  );
}
