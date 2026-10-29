"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Download,
  Link as LinkIcon,
  Loader2,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RemotionPlayer from "../play-video/_components/RemotionPlayer";
import toast from "react-hot-toast";

function VideoResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        const resp = await fetch(`/api/video/${videoId}`);
        if (resp.ok) {
          const data = await resp.json();
          setVideoData(data);
        }
      } catch (err) {
        console.error("Error fetching video:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play-video/${videoId || ""}`
      : `https://reelforge.app/play-video/${videoId || ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(videoData?.downloadUrl || shareUrl);
    setLinkCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const handleDownload = () => {
    if (videoData?.downloadUrl) {
      window.open(videoData.downloadUrl, "_blank");
    } else {
      toast("Video file is finalizing download link...");
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen w-full">
      <header className="border-b flex px-6 md:px-12 py-5 justify-between items-center bg-card">
        <Link href="/" className="font-semibold text-xl tracking-tight">
          ReelForge
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/my-videos"
            className="font-medium transition-colors text-muted-foreground text-sm hover:text-foreground"
          >
            My videos
          </Link>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push("/script-step")}
          >
            Create another
          </Button>
        </nav>
      </header>

      <main className="grid mx-auto p-6 md:p-12 gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-2 max-w-7xl">
        {/* Left Side: Remotion Video Player */}
        <section className="flex flex-col items-center justify-center">
          {videoData ? (
            <RemotionPlayer videoData={videoData} />
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="shadow-lg rounded-xl bg-foreground relative w-72 sm:w-80 aspect-[9/16] overflow-hidden flex items-center justify-center text-center p-6 text-card">
              <p>Video ready to play</p>
            </div>
          )}
        </section>

        {/* Right Side: Details & Actions */}
        <section className="flex flex-col gap-6">
          <Card className="shadow-sm rounded-xl bg-card border p-6 md:p-8">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="font-semibold text-2xl md:text-3xl tracking-tight !mb-0">
                  Your Short is ready
                </h1>
                <p className="text-muted-foreground mt-2 !mt-1">
                  {videoData?.title || "Why do some songs get stuck in your head?"}
                </p>
              </div>
              <Badge className="bg-accent text-accent-foreground">
                Ready
              </Badge>
            </div>

            <div className="flex mt-8 flex-col gap-3">
              <Button
                className="bg-primary text-primary-foreground w-full hover:bg-primary/90"
                onClick={handleDownload}
              >
                <Download className="mr-2 size-4" />
                Download MP4
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyLink}
              >
                <LinkIcon className="mr-2 size-4" />
                Copy link
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/script-step")}
              >
                Create another
              </Button>
              <button
                type="button"
                className="font-medium transition-colors text-primary text-sm inline-flex mt-2 justify-center items-center gap-2 hover:text-primary/80"
                onClick={() => router.push("/script-step")}
              >
                <Pencil className="size-4" />
                Edit and regenerate text
              </button>
            </div>
          </Card>

          <Card className="shadow-sm rounded-xl bg-card border p-6 md:p-8">
            <h2 className="font-semibold text-lg !mb-0">Video details</h2>
            <div className="flex mt-5 flex-col divide-y divide-border">
              <div className="text-sm flex py-3.5 justify-between items-center">
                <span className="text-muted-foreground">Script</span>
                <span className="font-medium max-w-[200px] truncate">
                  {videoData?.script?.substring(0, 40) || "Option A"} ·{" "}
                  {videoData?.script?.split(/\s+/).length || 86} words
                </span>
              </div>
              <div className="text-sm flex py-3.5 justify-between items-center">
                <span className="text-muted-foreground">Voice</span>
                <span className="font-medium">
                  {videoData?.voice || "Nova · Warm"}
                </span>
              </div>
              <div className="text-sm flex py-3.5 justify-between items-center">
                <span className="text-muted-foreground">Captions</span>
                <span className="font-medium">
                  {videoData?.caption?.name || "Bold word-by-word"} · Bottom
                </span>
              </div>
              <div className="text-sm flex py-3.5 justify-between items-center">
                <span className="text-muted-foreground">Theme</span>
                <span className="font-medium">
                  {videoData?.videoStyle || "Cinematic"} · Lo-fi
                </span>
              </div>
            </div>

            <div className="border-t border-border mt-6 pt-6">
              <label htmlFor="share-link" className="font-medium text-sm">
                Share link
              </label>
              <div className="flex mt-3 gap-2">
                <Input
                  id="share-link"
                  readOnly
                  value={videoData?.downloadUrl || shareUrl}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={handleCopyLink}
                >
                  Copy
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Toast Notification */}
      {linkCopied && (
        <div className="shadow-lg rounded-lg bg-popover text-popover-foreground text-sm border fixed right-8 bottom-8 px-4 py-3 flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4">
          <Check className="text-primary size-4" />
          Link copied
        </div>
      )}
    </div>
  );
}

export default function VideoResult() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <VideoResultContent />
    </Suspense>
  );
}
