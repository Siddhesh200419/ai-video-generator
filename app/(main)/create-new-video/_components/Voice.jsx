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
      <h2 className="text-xl font-bold mb-2">Preview AI voice samples</h2>
      <p className="text-sm text-gray-400 mb-4">Select voice for your video</p>

      {loading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Loader2 className="animate-spin text-blue-500" />
        </div>
      ) : (
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voices.map((voice, index) => (
              <div
                key={index}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 bg-white dark:bg-slate-900 ${
                  voice.id === selectedVoice
                    ? "border-blue-500 shadow-md"
                    : "border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700"
                }`}
                onClick={() => {
                  setSelectedVoice(voice.id);
                  onHandleInputChange("voice", voice.id);
                }}
              >
                <button
                  type="button"
                  onClick={(e) => handlePreview(e, voice)}
                  className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors shrink-0"
                >
                  {previewingVoice === voice.id ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                    {voice.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {voice.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default Voice;
