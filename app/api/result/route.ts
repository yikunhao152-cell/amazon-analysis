import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get('recordId');
  const model = searchParams.get('model');

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

    // 2. 检查表1状态
    const checkRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records/${recordId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const status = (await checkRes.json()).data?.record?.fields?.["状态"];

    if (status !== '✅ 已生成') {
      return NextResponse.json({ status: 'processing', currentStatus: status || 'AI思考中' });
    }

    // 3. 查表3 (直接使用你的表3 ID: tblmSxFjwz615lPX)
    const TABLE_3_ID = "tblmSxFjwz615lPX"; 
    // 精准匹配型号
    const filter = `CurrentValue.[型号]="${model}"`;
    
    const searchRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${TABLE_3_ID}/records?filter=${encodeURIComponent(filter)}&sort=["本次创建时间","DESC"]`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();

    if (!searchData.data?.items || searchData.data.items.length === 0) {
      return NextResponse.json({ status: 'processing', msg: '等待数据同步...' });
    }

    // 返回最新的一条数据
    return NextResponse.json({ status: 'done', data: searchData.data.items[0].fields });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
