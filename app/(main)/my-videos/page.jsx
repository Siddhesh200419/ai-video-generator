import React from "react";
import VideoList from "../dashboard/_components/VideoList";

export default function MyVideos() {
  return (
    <div>
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-semibold text-3xl tracking-tight !mb-0">My videos</h2>
        <p className="text-muted-foreground text-base !mt-0">
          Your ideas, rendered.
        </p>
      </div>
      <VideoList />
    </div>
  );
}

