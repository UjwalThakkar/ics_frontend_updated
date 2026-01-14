import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextRequest } from 'next/server';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = request.headers.get('x-client-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  if (realIp) return realIp;
  if (clientIp) return clientIp;
  if (cfConnectingIp) return cfConnectingIp;

  return 'unknown';
}
