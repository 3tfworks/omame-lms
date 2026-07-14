"use client";

import { useEffect } from "react";

export function MarkRead({ announcementId }: { announcementId: string }) {
  useEffect(() => {
    fetch(`/api/announcements/${announcementId}/read`, { method: "POST" })
      .then((response) => {
        if (!response.ok) throw new Error("既読状態を保存できませんでした");
        window.dispatchEvent(new Event("omame-announcements-updated"));
      })
      .catch((error) => console.error("Failed to mark announcement as read:", error));
  }, [announcementId]);
  return null;
}
