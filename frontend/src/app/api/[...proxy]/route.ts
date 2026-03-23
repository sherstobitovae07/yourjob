import axios from 'axios';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, TOKEN_TYPE_COOKIE } from '@/constants/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> }
) {
  return handleProxy(request, context);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> }
) {
  return handleProxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> }
) {
  return handleProxy(request, context);
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ proxy: string[] }> }
) {
  // Ожидаем params
  const { proxy } = await context.params;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://127.0.0.1:8000';

  // Формируем путь - убираем дублирование "v1"
  const path = proxy.join('/');

  // Убедимся, что путь не начинается с дублирующего "api/v1"
  let targetPath = path;
  if (path.startsWith('api/v1/')) {
    targetPath = path.substring(7); // Убираем "api/v1/"
  } else if (path.startsWith('v1/')) {
    targetPath = path.substring(3); // Убираем "v1/"
  }

  // Сохраняем query-параметры из оригинального URL
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';

  const targetUrl = `${baseUrl}/api/v1/${targetPath}${queryString}`;

  // eslint-disable-next-line no-console
  console.log(`Proxying ${request.method} request to: ${targetUrl}`);

  try {
    const requestBody = await getRequestBody(request);
    const headers = getHeaders(request);

    const response = await axios({
      method: request.method,
      url: targetUrl,
      data: requestBody,
      headers: headers,
      timeout: 10000,
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });

    // Создаем ответ с правильными заголовками
    const responseHeaders: Record<string, string> = {};

    // Копируем все заголовки из ответа бэкенда
    Object.keys(response.headers).forEach(key => {
      responseHeaders[key] = response.headers[key];
    });

    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
        headers: responseHeaders,
      });
    }

    return new NextResponse(response.data, {
      status: response.status,
      headers: responseHeaders,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Выводим полную информацию об ошибке
    // eslint-disable-next-line no-console
    console.error('Full proxy error:', error);
    // eslint-disable-next-line no-console
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      response: error?.response?.data,
      status: error?.response?.status,
      stack: error?.stack
    });

    if (error.response) {
      // Если есть ответ от бэкенда, возвращаем его как есть
      const backendResponse = error.response;
      const errorHeaders: Record<string, string> = {};

      Object.keys(backendResponse.headers).forEach(key => {
        errorHeaders[key] = backendResponse.headers[key];
      });

      return new NextResponse(backendResponse.data, {
        status: backendResponse.status,
        headers: errorHeaders,
      });
    } else if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({ message: 'Backend service unavailable' }, { status: 503 });
    } else if (error.code === 'ETIMEDOUT') {
      return NextResponse.json({ message: 'Backend request timeout' }, { status: 504 });
    } else {
      return NextResponse.json({
        message: 'Internal server error',
        details: error.message
      }, { status: 500 });
    }
  }
}

function getHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Получаем токен из cookies
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const tokenType = request.cookies.get(TOKEN_TYPE_COOKIE)?.value || 'bearer';

  // Добавляем заголовок авторизации если есть токен
  if (token) {
    headers['Authorization'] = `${tokenType} ${token}`;
  }

  // Копируем остальные заголовки из запроса
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Пропускаем host и другие служебные заголовки
    if (lowerKey !== 'host' && lowerKey !== 'authorization') {
      headers[key] = value;
    }
  });

  return headers;
}

async function getRequestBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get('content-type');

  if (!contentType) {
    return undefined;
  }

  if (contentType.includes('multipart/form-data')) {
    return await request.formData();
  } else if (contentType.includes('application/json')) {
    return await request.json();
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const body: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }

    return body;
  } else {
    // Для бинарных данных и других типов возвращаем как ArrayBuffer
    return await request.arrayBuffer();
  }
}

