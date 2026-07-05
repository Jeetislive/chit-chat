"use client";

import { useEffect, useRef, useReducer } from "react";
import { useSocket } from "@/context/SocketContext";

type BannerState = "hidden" | "offline" | "restored";

function bannerReducer(_state: BannerState, action: BannerState): BannerState {
  return action;
}

export default function ConnectionBanner() {
  const { isConnected } = useSocket();
  const [state, dispatch] = useReducer(bannerReducer, "hidden");
  const prevConnected = useRef(true);

  useEffect(() => {
    if (prevConnected.current === isConnected) return;
    prevConnected.current = isConnected;

    if (!isConnected) {
      dispatch("offline");
    } else {
      dispatch("restored");
      const timer = setTimeout(() => dispatch("hidden"), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (state === "hidden") return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] px-4 py-2 text-center text-sm font-medium animate-slideDown ${
        state === "restored"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {state === "restored" ? "Connection restored" : "No internet connection"}
    </div>
  );
}
