"use client";

import { memo } from "react";

interface StatusIconProps {
  status?: string;
}

function StatusIcon({ status }: StatusIconProps) {
  if (!status) return null;
  const isRead = status === "read";
  const color = isRead ? "text-indigo-400" : "text-gray-500";
  return (
    <span className={`inline-flex ml-1 ${color}`}>
      {isRead ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 11" fill="currentColor" aria-label="Read">
          <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.342.13.48.48 0 0 0-.02.678l2.375 2.474c.103.107.24.163.382.163a.51.51 0 0 0 .38-.175l6.566-7.95a.48.48 0 0 0-.119-.684" />
          <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.342.13.48.48 0 0 0-.02.678l2.375 2.474c.103.107.24.163.382.163a.51.51 0 0 0 .38-.175l6.566-7.95a.48.48 0 0 0-.119-.684" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 11" fill="currentColor" aria-label={status === "delivered" ? "Delivered" : "Sent"}>
          <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.342.13.48.48 0 0 0-.02.678l2.375 2.474c.103.107.24.163.382.163a.51.51 0 0 0 .38-.175l6.566-7.95a.48.48 0 0 0-.119-.684" />
        </svg>
      )}
    </span>
  );
}

export default memo(StatusIcon);
