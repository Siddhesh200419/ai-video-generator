import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

function Voice({ onHandleInputChange }) {
  const [selectedVoice, setSelectedVoice] = useState();
  const [voices, setVoices] = useState([]);
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await axios.get("/api/voices");
      setVoices(response.data.voices);
    } catch (error) {
      console.error("Error fetching voices:", error);
    } finally {
      setLoading(false);
    }
  };

  // Static sample files only — never call Gemini TTS for previews (10 req/day quota).
  const handlePreview = (e, voice) => {
    e.stopPropagation();

    if (previewingVoice === voice.id) {
      if (audio) audio.pause();
      setPreviewingVoice(null);
      return;
    }

    if (audio) audio.pause();

    if (!voice.sampleUrl) {
      toast("Voice selected — live previews disabled to save Gemini TTS quota");
      setSelectedVoice(voice.id);
      onHandleInputChange("voice", voice.id);
      return;
    }

    setPreviewingVoice(voice.id);
    const newAudio = new Audio(voice.sampleUrl);
    setAudio(newAudio);
    newAudio.play();
    newAudio.onended = () => setPreviewingVoice(null);
  };

  return (
    <div className="mt-5">
      <h2 className="font-semibold text-2xl tracking-tight !mb-0">
        Find the right read.
      </h2>
      <p className="text-sm text-muted-foreground mb-4 !mt-2">
        Select a voice for your video narration
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voices.map((voice, index) => (
              <button
                key={index}
                type="button"
                className={`text-left rounded-xl border-2 p-4 transition-all flex items-center gap-4 bg-card ${
                  voice.id === selectedVoice
                    ? "border-primary shadow-md ring-1 ring-primary"
                    : "border-border/50 hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedVoice(voice.id);
                  onHandleInputChange("voice", voice.id);
                }}
              >
                <button
                  type="button"
                  onClick={(e) => handlePreview(e, voice)}
                  className="rounded-full bg-secondary text-secondary-foreground flex justify-center items-center size-10 hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                >
                  {previewingVoice === voice.id ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <div className="flex flex-col overflow-hidden flex-1">
                  <span className="font-semibold text-foreground truncate">
                    {voice.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {voice.description}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-primary w-1 h-2" />
                  <span className="rounded-full bg-primary w-1 h-3" />
                  <span className="rounded-full bg-primary w-1 h-5" />
                  <span className="rounded-full bg-primary w-1 h-3" />
                  <span className="rounded-full bg-primary w-1 h-4" />
                  <span className="rounded-full bg-primary w-1 h-2" />
                  <span className="rounded-full bg-primary w-1 h-5" />
                  <span className="rounded-full bg-primary w-1 h-3" />
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default Voice;
