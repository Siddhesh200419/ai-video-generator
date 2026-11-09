"use client";
import { useAuthContext } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Download,
  Trash2,
  Loader2,
  RefreshCw,
  Film,
  SquarePen,
  Plus,
} from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { triggerConfetti } from "@/lib/confetti";
import { useCreationContext } from "@/_context/CreationContext";

function VideoList() {
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [justCompletedId, setJustCompletedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuthContext();
  const { resetFormData } = useCreationContext();
  const pollingIntervals = useRef(new Map());

  const getVideoTitle = (v) => {
    const t = v?.title?.trim();
    return v?.topic?.trim() || "Untitled Short";
  };

  useEffect(() => {
    if (user?.id) GetUserVideoList(true);
  }, [user]);

  // Clean up all polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.current.forEach((intervalId) => clearInterval(intervalId));
      pollingIntervals.current.clear();
    };
  }, []);

  // Check URL query parameters or session storage for celebration triggers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("completed") === "true" || params.get("celebrate") === "true") {
        triggerConfetti();
        toast.success("🎉 Video generation completed!", { duration: 5000 });
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const GetUserVideoList = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const resp = await fetch(`/api/videos?uid=${user?.id}`);
      const data = await resp.json();
      setVideoList(data ?? []);

      // Poll any pending or generating videos
      const inProgressVideos = data?.filter(
        (v) => v.status === "pending" || v.status === "generating"
      );
      inProgressVideos?.forEach((v) => {
        startPollingVideo(v.id);
      });
    } catch (err) {
      console.error("Error fetching video list:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const startPollingVideo = (videoId) => {
    if (pollingIntervals.current.has(videoId)) return;

    const intervalId = setInterval(async () => {
      try {
        const resp = await fetch(`/api/video/${videoId}`);
        if (!resp.ok) return;
        const video = await resp.json();

        if (video?.status === "completed" || video?.status === "failed") {
          clearInterval(intervalId);
          pollingIntervals.current.delete(videoId);

          if (video?.status === "completed") {
            // 🎉 Trigger celebratory confetti animation!
            triggerConfetti();
            resetFormData();
            const title = getVideoTitle(video);
            toast.success(`🎉 "${title}" is ready!`, { duration: 5000 });
            setJustCompletedId(videoId);
            setTimeout(() => setJustCompletedId(null), 8000);
          } else if (video?.status === "failed") {
            toast.error("Video rendering failed");
          }

          // Silently refresh list to update status and playable buttons
          GetUserVideoList(false);
        }
      } catch (err) {
        console.error("Polling error for video", videoId, err);
      }
    }, 4000);

    pollingIntervals.current.set(videoId, intervalId);
  };

  const handleDelete = async (videoId) => {
    if (!user?.id) return;
    setDeletingId(videoId);
    try {
      const resp = await fetch(`/api/video/${videoId}?uid=${user.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete video");
      }

      // Stop polling this video, if a job was still running.
      const intervalId = pollingIntervals.current.get(videoId);
      if (intervalId) {
        clearInterval(intervalId);
        pollingIntervals.current.delete(videoId);
      }

      setVideoList((prev) => prev.filter((v) => v.id !== videoId));
      toast.success("Video deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete video");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filteredVideos = videoList.filter((v) => {
    if (filter === "all") return true;
    if (filter === "ready") return v.status === "completed";
    if (filter === "rendering")
      return v.status === "pending" || v.status === "generating";
    if (filter === "failed") return v.status === "failed";
    return true;
  });

  const getStatusBadge = (status, isJustCompleted) => {
    if (isJustCompleted) {
      return (
        <Badge className="bg-primary text-primary-foreground animate-pulse font-semibold">
          🎉 Just Ready!
        </Badge>
      );
    }
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-accent text-accent-foreground">Ready</Badge>
        );
      case "generating":
      case "pending":
        return (
          <Badge className="bg-accent text-accent-foreground">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Rendering
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return (
          <Badge className="bg-accent text-accent-foreground">Pending</Badge>
        );
    }
  };

  const getBgColor = (index) => {
    const colors = [
      "bg-primary/10",
      "bg-accent",
      "bg-secondary",
      "bg-chart-4/10",
      "bg-chart-2/10",
      "bg-chart-3/10",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Tabs defaultValue="all">
            <TabsList className="rounded-lg bg-muted p-1 h-11">
              <TabsTrigger value="all" className="rounded-md px-5">All</TabsTrigger>
              <TabsTrigger value="ready" className="rounded-md px-5">Ready</TabsTrigger>
              <TabsTrigger value="rendering" className="rounded-md px-5">Rendering</TabsTrigger>
              <TabsTrigger value="failed" className="rounded-md px-5">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="shadow-sm rounded-xl bg-card border overflow-hidden animate-pulse"
            >
              <div className="bg-muted h-80" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6">
        <Tabs defaultValue="all" onValueChange={setFilter}>
          <TabsList className="rounded-lg bg-muted p-1 h-11">
            <TabsTrigger value="all" className="rounded-md px-5">All</TabsTrigger>
            <TabsTrigger value="ready" className="rounded-md px-5">Ready</TabsTrigger>
            <TabsTrigger value="rendering" className="rounded-md px-5">Rendering</TabsTrigger>
            <TabsTrigger value="failed" className="rounded-md px-5">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredVideos?.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-5 p-10 border border-dashed border-border rounded-xl bg-card/50">
          <Film className="size-16 text-muted-foreground opacity-50" />
          <h2 className="text-muted-foreground text-lg font-medium !mb-0">
            {filter === "all"
              ? "You haven't created any videos yet."
              : `No ${filter} videos found.`}
          </h2>
          <Link href="/script-step">
            <Button size="lg" className="shadow-md gap-2" onClick={() => resetFormData()}>
              <Plus className="size-4" />
              Create New Video
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos?.map((video, index) => {
            const videoTitle = getVideoTitle(video);
            const isJustCompleted = justCompletedId === video.id;
            return (
              <Card
                key={index}
                className={`shadow-sm rounded-xl bg-card border overflow-hidden group transition-all duration-500 ${
                  isJustCompleted ? "ring-2 ring-primary shadow-xl scale-[1.01]" : ""
                }`}
              >
                {/* Thumbnail Area */}
                <div
                  className={`${getBgColor(index)} flex relative p-6 justify-center items-center h-80 overflow-hidden`}
                >
                  {video?.images?.[0] ? (
                    <img
                      src={video.images[0]}
                      alt={videoTitle}
                      className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center rounded-lg bg-primary/20 text-primary flex flex-col justify-center items-center gap-4 w-40 h-full">
                      <Film className="size-12" />
                      <span className="font-semibold text-lg">
                        {videoTitle.split(" ").slice(0, 2).join(" ")}
                      </span>
                    </div>
                  )}

                  {/* Overlay gradient */}
                  {video?.images?.[0] && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  )}

                  {/* Delete control (top-right, revealed on hover) */}
                  <div className="absolute top-3 right-3 z-10 transition-opacity opacity-0 group-hover:opacity-100">
                    {confirmDeleteId === video.id ? (
                      <div className="rounded-lg bg-card/95 shadow-sm flex p-1 items-center gap-1">
                        <span className="px-2 text-xs font-medium whitespace-nowrap">
                          Delete?
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7"
                          disabled={deletingId === video.id}
                          onClick={() => handleDelete(video.id)}
                        >
                          {deletingId === video.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                          Yes
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7"
                          disabled={deletingId === video.id}
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-9"
                        title="Delete video"
                        aria-label="Delete video"
                        onClick={() => setConfirmDeleteId(video.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="shadow-sm rounded-lg bg-card/90 flex absolute inset-x-4 bottom-4 p-2 justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {video.status === "completed" && (
                      <>
                        <Link href={`/play-video/${video.id}`}>
                          <Button variant="secondary" size="sm" className="gap-1">
                            <Play className="size-3" />
                            Play
                          </Button>
                        </Link>
                        {video?.downloadUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(video.downloadUrl, "_blank");
                            }}
                          >
                            <Download className="size-3" />
                            Download
                          </Button>
                        )}
                      </>
                    )}
                    {video.status === "failed" && (
                      <Button variant="secondary" size="sm" className="gap-1">
                        <RefreshCw className="size-3" />
                        Retry
                      </Button>
                    )}
                    {(video.status === "pending" ||
                      video.status === "generating") && (
                      <div className="w-full px-2 py-1">
                        <div className="font-medium text-xs flex mb-2 justify-between items-center">
                          <span>Rendering</span>
                          <Loader2 className="size-3 animate-spin" />
                        </div>
                        <div className="rounded-full bg-muted h-2 overflow-hidden">
                          <div className="rounded-full bg-accent-foreground animate-pulse w-[60%] h-full" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Info */}
                <Link href={video?.id ? `/play-video/${video.id}` : "#"}>
                  <div className="flex p-5 flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <h2 className="font-semibold !mb-0 !text-base line-clamp-1">
                        {videoTitle}
                      </h2>
                      {getStatusBadge(video.status, isJustCompleted)}
                    </div>
                    <div className="text-muted-foreground text-sm flex justify-between items-center">
                      <span>{moment(video?.createdAt).format("MMM D, YYYY")}</span>
                      <span className="font-mono">
                        {video.status === "completed" ? "00:30" : "—"}
                      </span>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      {/* <Card className="shadow-sm rounded-xl bg-card border flex mt-10 p-8 items-center gap-8">
        <div className="rounded-lg bg-accent text-accent-foreground flex justify-center items-center shrink-0 size-32">
          <Film className="size-16" />
        </div>
        <div className="flex flex-col flex-1 gap-2">
          <h2 className="font-semibold text-xl !mb-0">
            Your next Short is waiting.
          </h2>
          <p className="text-muted-foreground !mt-0">
            Turn your next idea into something worth watching.
          </p>
        </div>
        <Link href="/script-step">
          <Button className="gap-2" onClick={() => resetFormData()}>
            <SquarePen className="size-4" />
            Start creating
          </Button>
        </Link>
      </Card> */}
    </div>
  );
}

export default VideoList;
