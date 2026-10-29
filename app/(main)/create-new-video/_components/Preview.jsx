import Image from "next/image";
import React from "react";
import { options } from "./VideoStyle";
import { Disc3 } from "lucide-react";

function Preview({ formData }) {
  const selectVideoStyle = options.find(
    (item) => item?.name === formData?.videoStyle
  );

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div className="rounded-2xl bg-foreground border border-border flex relative justify-center items-center w-full max-w-[320px] aspect-[9/16] overflow-hidden">
        {selectVideoStyle?.image ? (
          <>
            <Image
              src={selectVideoStyle.image}
              alt={selectVideoStyle.name || "Video style preview"}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </>
        ) : (
          <div className="bg-foreground flex absolute inset-0 flex-col justify-center items-center gap-6">
            <Disc3 className="text-muted-foreground size-28" />
            <div className="text-center rounded-md bg-card/50 text-card-foreground text-sm px-4 py-2">
              {formData?.title || "Your video preview"}
              <br />
              {formData?.topic ? `Topic: ${formData.topic.substring(0, 30)}...` : "Select options to preview"}
            </div>
          </div>
        )}

        {/* LIVE badge */}
        {selectVideoStyle && (
          <span className="font-bold rounded-full bg-accent text-accent-foreground text-xs absolute top-4 right-4 px-3 py-1">
            LIVE
          </span>
        )}

        {/* Caption preview at bottom */}
        {formData?.caption && (
          <div className="absolute inset-x-4 bottom-10">
            <h2
              className={`${formData.caption.style} text-center w-full !mb-0 !text-xl drop-shadow-lg`}
            >
              {formData.caption.name}
            </h2>
          </div>
        )}

        {/* Progress bar */}
        <div className="rounded-full bg-card/30 absolute inset-x-4 bottom-4 h-1">
          <div className="rounded-full bg-primary w-3/5 h-1" />
        </div>
      </div>
    </div>
  );
}

export default Preview;
