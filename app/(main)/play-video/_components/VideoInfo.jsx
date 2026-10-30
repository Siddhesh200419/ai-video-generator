import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Check,
  Download,
  Link as LinkIcon,
  Loader2Icon,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";

function VideoInfo({ videoData }) {
  const isReady = !!videoData?.downloadUrl;
  const [copied, setCopied] = useState(false);

  const onDownload = () => {
    if (!isReady) return;
    window.open(videoData.downloadUrl, "_blank");
  };

  const onCopyLink = () => {
    if (videoData?.downloadUrl) {
      navigator.clipboard.writeText(videoData.downloadUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Action Card */}
      <Card className="shadow-sm rounded-xl bg-card border p-8">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight !mb-0">
              {isReady ? "Your Short is ready" : "Rendering..."}
            </h1>
            <p className="text-muted-foreground mt-2 !mt-2">
              {videoData?.title}
            </p>
          </div>
          <Badge
            className={
              isReady
                ? "bg-accent text-accent-foreground"
                : "bg-accent text-accent-foreground"
            }
          >
            {isReady ? "Ready" : "Rendering"}
          </Badge>
        </div>
        <div className="flex mt-8 flex-col gap-3">
          <Button
            className="bg-primary text-primary-foreground w-full hover:bg-primary/90 gap-2"
            disabled={!isReady}
            onClick={onDownload}
          >
            {!isReady ? (
              <Loader2Icon className="animate-spin size-4" />
            ) : (
              <Download className="size-4" />
            )}
            {isReady ? "Download MP4" : "Rendering..."}
          </Button>
          {isReady && (
            <>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={onCopyLink}
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <LinkIcon className="size-4" />
                )}
                {copied ? "Copied!" : "Copy link"}
              </Button>
              <Link href="/create-new-video" className="w-full">
                <Button variant="ghost" className="w-full">
                  Create another
                </Button>
              </Link>
              <Link
                href="/create-new-video"
                className="font-medium text-primary text-sm inline-flex mt-2 justify-center items-center gap-2 hover:text-primary/80 transition-colors"
              >
                <Pencil className="size-4" />
                Edit and regenerate
              </Link>
            </>
          )}
        </div>
      </Card>

      {/* Video Details Card */}
      <Card className="shadow-sm rounded-xl bg-card border p-8">
        <h2 className="font-semibold text-lg !mb-0">Video details</h2>
        <div className="flex mt-5 flex-col">
          <div className="text-sm border-b flex py-4 justify-between items-center">
            <span className="text-muted-foreground">Title</span>
            <span className="font-medium">{videoData?.title}</span>
          </div>
          <div className="text-sm border-b flex py-4 justify-between items-center">
            <span className="text-muted-foreground">Script</span>
            <span className="font-medium max-w-[200px] truncate">
              {videoData?.script?.substring(0, 50)}...
            </span>
          </div>
          <div className="text-sm border-b flex py-4 justify-between items-center">
            <span className="text-muted-foreground">Style</span>
            <span className="font-medium">{videoData?.videoStyle}</span>
          </div>
          <div className="text-sm flex py-4 justify-between items-center">
            <span className="text-muted-foreground">Voice</span>
            <span className="font-medium">{videoData?.voice || "Default"}</span>
          </div>
        </div>
        {isReady && videoData?.downloadUrl && (
          <div className="border-t mt-6 pt-6">
            <label htmlFor="share-link" className="font-medium text-sm">
              Share link
            </label>
            <div className="flex mt-3 gap-2">
              <Input
                id="share-link"
                readOnly
                value={videoData.downloadUrl}
                className="font-mono text-xs"
              />
              <Button variant="outline" className="shrink-0" onClick={onCopyLink}>
                Copy
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to My Videos
      </Link>
    </div>
  );
}

export default VideoInfo;
