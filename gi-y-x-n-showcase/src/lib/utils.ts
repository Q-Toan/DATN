import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "");

export function getAssetUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Prepend backend URL if it's a relative path (starts with /uploads or similar)
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
