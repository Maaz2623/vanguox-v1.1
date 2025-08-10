"use client";

import { useEffect } from "react";
import nProgress from "nprogress";
import "nprogress/nprogress.css"; // Required styles

export default function Loading() {
  useEffect(() => {
    nProgress.start();
    return () => {
      nProgress.done(); // ✅ fixed: return nothing
    };
  }, []);

  return null;
}
