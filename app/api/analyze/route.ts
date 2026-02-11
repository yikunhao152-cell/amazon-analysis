import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. 获取飞书 Token
    const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.FEISHU_APP_ID,
        app_secret: process.env.FEISHU_APP_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.tenant_access_token) throw new Error('飞书认证失败');
    const accessToken = tokenData.tenant_access_token;

    // 2. 写入飞书表格 (注意：fields 中的 key 必须和你飞书表头完全一致)
    const addRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          "型号": body.model,
          "竞品ASIN": body.asin,
          "产品类型": body.competitorType,
          "使用场景": body.usageScenario,
          "目标人群": body.targetAudience,
          "目标定价": Number(body.price)
        }
      }),
    });
    const addData = await addRes.json();
    if (addData.code !== 0) throw new Error('写入飞书失败: ' + addData.msg);
    
    // 获取新生成的记录 ID
    const recordId = addData.data.record.record_id;

    // 3. 触发 n8n Webhook
    // 将 record_id 传给 n8n，告诉它去分析哪一行
    await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        record_id: recordId,
        input_data: body
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
