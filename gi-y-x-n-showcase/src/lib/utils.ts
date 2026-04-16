import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hardcoded for production stability
const BACKEND_URL = "https://my-sneaker-n89g08zkm-quoc-toans-projects.vercel.app";

export function getAssetUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Prepend backend URL if it's a relative path (starts with /uploads or similar)
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
