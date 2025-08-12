import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function normalizeLang(lang: string) {
  const map: Record<string, string> = {
    typescriptreact: "tsx",
    javascriptreact: "jsx",
  };
  return map[lang.toLowerCase()] || lang;
}
