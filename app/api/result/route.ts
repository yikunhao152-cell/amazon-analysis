import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get('recordId'); // 表1的记录ID
  const model = searchParams.get('model');       // 型号 (用来在表3找数据)

  if (!recordId || !model) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  try {
    // 1. 获取 Token
    const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.FEISHU_APP_ID,
        app_secret: process.env.FEISHU_APP_SECRET,
      }),
    });
    const accessToken = (await tokenRes.json()).tenant_access_token;

    // 2. 检查表 1 的状态
    // 我们看这一行的"状态"字段是不是变成了 "✅ 已生成"
    const checkRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records/${recordId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const checkData = await checkRes.json();
    const status = checkData.data?.record?.fields?.["状态"];

    // 如果还没好，告诉前端继续等
    if (status !== '✅ 已生成') {
      return NextResponse.json({ status: 'processing', currentStatus: status || '等待中' });
    }

    // 3. 如果好了，去表 3 抓取结果
    // 我们用"型号"来过滤，找到最新生成的分析结果
    // filter 公式：CurrentValue.[型号] = "modelName"
    const filter = `CurrentValue.[型号]="${model}"`;
    const searchRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_3_ID}/records?filter=${encodeURIComponent(filter)}&sort=["本次创建时间","DESC"]`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();

    if (!searchData.data?.items || searchData.data.items.length === 0) {
      return NextResponse.json({ status: 'processing', msg: '表1已完成，正在读取表3...' });
    }

    // 拿到最新的那条结果
    const resultRecord = searchData.data.items[0].fields;

    return NextResponse.json({ status: 'done', data: resultRecord });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
