import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Rotas públicas (não requerem autenticação)
  const publicPaths = ["/login", "/cadastro"];
  const isPublicPath = publicPaths.some((path) => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Se não está autenticado e tenta acessar rota privada
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se está autenticado e tenta acessar rota pública
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (NextAuth)
     * 2. /api/cam/* (ESP32/HLS proxy)
     * 3. /_next/* (Next.js internals)
     * 4. /fonts/* (static files)
     * 5. /favicon.ico, /site.webmanifest (static files)
     */
    "/((?!api/auth|api/cam|_next|fonts|favicon.ico|site.webmanifest).*)",
  ],
};
