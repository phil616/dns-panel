import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_KEY = 'cf_dns_auth';

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleRequest(request, params.path);
}

export async function POST(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleRequest(request, params.path);
}

export async function PUT(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleRequest(request, params.path);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleRequest(request, params.path);
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  return handleRequest(request, params.path);
}

async function handleRequest(request: NextRequest, pathSegments: string[]) {
  // 1. Get Auth from Cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_KEY);
  
  if (!authCookie) {
    return NextResponse.json({ success: false, errors: [{ message: '未授权: 请先登录' }] }, { status: 401 });
  }

  let authData;
  try {
    authData = JSON.parse(authCookie.value);
  } catch (e) {
    return NextResponse.json({ success: false, errors: [{ message: '授权信息无效' }] }, { status: 401 });
  }

  const { apiToken, email } = authData;

  // 2. Construct Cloudflare API URL
  // pathSegments matches [...path], e.g. ['zones'] or ['zones', '123', 'dns_records']
  const apiPath = pathSegments.join('/');
  const url = `https://api.cloudflare.com/client/v4/${apiPath}${request.nextUrl.search}`;

  // 3. Prepare Headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiToken) {
    const isGlobalKey = apiToken.length === 37 && /^[a-f0-9]+$/i.test(apiToken);
    if (email && isGlobalKey) {
        headers['X-Auth-Email'] = email;
        headers['X-Auth-Key'] = apiToken;
    } else {
        headers['Authorization'] = `Bearer ${apiToken}`;
    }
  }

  // 4. Forward Request
  try {
    const body = request.body ? await request.text() : undefined;
    
    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return NextResponse.json(
      { success: false, errors: [{ message: error.message || 'Internal Proxy Error' }] },
      { status: 500 }
    );
  }
}
