import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const voiceOptions = [
  { value: "af_sarah", name: "🇺🇸 Sarah (Female)" },
  { value: "af_sky", name: "🇺🇸 Sky (Female)" },
  { value: "am_adam", name: "🇺🇸 Adam (Male)" },
  { value: "hf_alpha", name: "🇮🇳 Alpha (Female)" },
  { value: "hf_beta", name: "🇮🇳 Beta (Female)" },

  { value: "bf_lily", name: "🇬🇧 Lily (Female)" },
  { value: "bm_daniel", name: "🇬🇧 Daniel (Male)" },
  { value: "bm_fable", name: "🇬🇧 Fable (Male)" },
  { value: "bm_george", name: "🇬🇧 George (Male)" },
  { value: "bm_lewis", name: "🇬🇧 Lewis (Male)" },
  { value: "ff_siwis", name: "🇫🇷 Siwis (Female)" },
  { value: "hm_omega", name: "🇮🇳 Omega (Male)" },
  { value: "hm_psi", name: "🇮🇳 Psi (Male)" },
  { value: "aura-asteria-en", name: "🇺🇸 Asteria (Female)" },
  { value: "am_echo", name: "🇺🇸 Echo (Male)" },
  { value: "am_eric", name: "🇺🇸 Eric (Male)" },
  { value: "am_fenrir", name: "🇺🇸 Fenrir (Male)" },
  { value: "am_liam", name: "🇺🇸 Liam (Male)" },
  { value: "am_michael", name: "🇺🇸 Michael (Male)" },
  { value: "am_onyx", name: "🇺🇸 Onyx (Male)" },
  { value: "am_puck", name: "🇺🇸 Puck (Male)" },
  { value: "bf_alice", name: "🇬🇧 Alice (Female)" },
  { value: "bf_emma", name: "🇬🇧 Emma (Female)" },
  { value: "bf_isabella", name: "🇬🇧 Isabella (Female)" },
  { value: "af_alloy", name: "🇺🇸 Alloy (Female)" },
  { value: "af_aoede", name: "🇺🇸 Aoede (Female)" },
  { value: "af_bella", name: "🇺🇸 Bella (Female)" },
  { value: "af_jessica", name: "🇺🇸 Jessica (Female)" },
  { value: "af_kore", name: "🇺🇸 Kore (Female)" },
  { value: "af_nicole", name: "🇺🇸 Nicole (Female)" },
  { value: "af_nova", name: "🇺🇸 Nova (Female)" },
  { value: "af_river", name: "🇺🇸 River (Female)" },
];

function Voice({ onHandleInputChange }) {
  const [selectedVoice, setSelectedVoice] = useState();
  return (
    <div className="mt-5">
      <h2>Video Voice</h2>
      <p className="text-sm text-gray-400">Select voice for your video </p>
      <ScrollArea className='h-[200px] w-full'>
        <div className="grid grid-cols-2 gap-3 ">
          {voiceOptions.map((voice, index) => (
            <h2
              className={`cursor-pointer p-3 dark:bg-slate-900 dark:border-white rounded-lg hover:border ${voice.name === selectedVoice && "border"}`}
              onClick={() => {setSelectedVoice(voice.name);
                onHandleInputChange("voice",voice.value)
              }}
              key={index}
            >
              {voice.name}
            </h2>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default Voice;
