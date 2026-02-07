"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import axios from "axios";
import { useAuthContext } from "@/app/provider";
import toast from "react-hot-toast";

const suggestions = [
  "Historic Story",
  "Kids Story",
  "Movie Stories",
  "AI Innovations",
  "Space Mysteries",
  "Horror Stories",
  "Mythological Tales",
  "Tech Breakthroughs",
  "True Crime Stories",
  "Fantasy Adventures",
  "Science Experiments",
  "Motivational Stories",
];

function Topic({ onHandleInputChange }) {
  const [selectTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const GenerateScript = async () => {
    if (user?.credits <= 0) {
      toast("Please Add More Credits");
      return;
    }
    const finalTopic = selectTopic || customTopic;
    if (!finalTopic) return alert("Please select or enter a topic!");

    setLoading(true);
    setSelectedScriptIndex(null);

    try {
      const result = await axios.post("/api/generate-script", {
        topic: finalTopic,
      });
      console.log(result.data);
      setScripts(result.data?.scripts || []);
    } catch (e) {
      console.error("Error generating script:", e);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="mt-1">Project Title</h2>
      <Input
        placeholder="Enter Project Title"
        onChange={(event) => onHandleInputChange("title", event?.target.value)}
      />
      <div className="mt-5">
        <h2>Video Topic</h2>
        <p className="text-sm text-gray-600">Select topic for your video</p>
        <Tabs defaultValue="suggestion" className="w-full mt-2">
          <TabsList>
            <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
            <TabsTrigger value="your_topic">Your Topic</TabsTrigger>
          </TabsList>
          <TabsContent value="suggestion">
            <div>
              {suggestions.map((suggestion, index) => (
                <Button
                  variant="outline"
                  key={index}
                  className={`m-1 ${
                    suggestion === selectTopic && "bg-secondary"
                  }`}
                  onClick={() => {
                    setSelectedTopic(suggestion);
                    setCustomTopic("");
                    onHandleInputChange("topic", suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="your_topic">
            <div>
              <h2>Enter your own topic</h2>
              <Textarea
                placeholder="Enter your topic"
                onChange={(event) => {
                  setCustomTopic(event.target.value);
                  setSelectedTopic("");
                  onHandleInputChange("topic", event.target.value);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        {scripts.length > 0 && (
          <div className="mt-5">
            <h2>Select the Script</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
              {scripts.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    selectedScriptIndex === index
                      ? "border-white bg-secondary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    setSelectedScriptIndex(index);
                    onHandleInputChange("script", item?.content);
                  }}
                >
                  <p className="line-clamp-6 text-sm text-gray-300 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        className="mt-5"
        size="sm"
        disabled={loading}
        onClick={GenerateScript}
      >
        {loading ? (
          <Loader2Icon className="animate-spin mr-2" />
        ) : (
          <SparklesIcon className="mr-2" />
        )}
        {loading ? "Generating..." : "Generate Script"}
      </Button>
    </div>
  );
}

export default Topic;
