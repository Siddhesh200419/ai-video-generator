import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import React from "react";

function VideoInfo({ videoData }) {
  const isReady = !!videoData?.downloadUrl;
  const onDownload = () => {
    if (!isReady) return;
    window.open(videoData.downloadUrl, "_blank");
  };
  return (
    <div className="p-5 border rounded-xl">
      <Link href={"/dashboard"}>
        <h2 className="flex gap-2 items-center">
          <ArrowLeft />
          Back to Dashboard
        </h2>
      </Link>
      <div className="flex flex-col gap-3">
        <h2 className="mt-5">Project Name: {videoData?.title}</h2>
        <p className="text-gray-500">Script: {videoData?.script}</p>
        <h2>Video Style: {videoData?.videoStyle}</h2>

        <Button
          className="mt-4"
          disabled={!isReady}
          onClick={onDownload}
          variant="default"
        >
          {!isReady ? (
            <Loader2Icon className="mr-2 animate-spin" />
          ) : (
            <DownloadIcon className="mr-2" />
          )}
          {isReady ? "Export & Download" : "Rendering..."}
        </Button>
        {isReady && (
          <p className="text-xs text-gray-500 break-words">
            {videoData?.downloadUrl}
          </p>
        )}
      </div>
    </div>
  );
}

export default VideoInfo;
