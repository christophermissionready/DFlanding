"use client";

import Image from "next/image";
import dfimage from "./DFAlpha 2.png"; // Ensure the path is correct
import { useState } from "react";

// Define TypeScript types
interface ChatMessage {
  text: string;
  isAI: boolean;
}

export default function Home() {
  const [count, setCount] = useState<number>(1); // Current Fibonacci number
  const [prevCount, setPrevCount] = useState<number>(1); // Previous Fibonacci number
  const [jobTitle, setJobTitle] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:5998";

  const startInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory([
          { text: `I am exploring the ${jobTitle} industry.`, isAI: false },
          { text: data.question, isAI: true },
        ]);
      } else {
        alert(data.error || "Failed to start interview");
      }
    } catch (error) {
      alert("Error starting interview: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setChatHistory([...chatHistory, { text: response, isAI: false }]);
    setResponse("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/interview/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, response, history: chatHistory }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory([
          ...chatHistory,
          { text: response, isAI: false },
          { text: data.question, isAI: true },
        ]);
      } else {
        alert(data.error || "Failed to get response");
      }
    } catch (error) {
      alert("Error sending response: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeInterview = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/interview/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, history: chatHistory }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);
      } else {
        alert(data.error || "Failed to analyze interview");
      }
    } catch (error) {
      alert("Error analyzing interview: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src={dfimage} alt="DF Alpha 2" width={300} height={300} />
          </div>
          <p className="text-lg mb-4">
            This demo is powered by{" "}
            <a href="https://nextjs.org/" className="underline text-blue-600">
              Next.js
            </a>
          </p>
          <p className="text-lg mb-4">
            Read the{" "}
            <a href="/about" className="underline text-blue-600">
              Documentation
            </a>
          </p>
        </div>

        <div className="border-t-2 border-gray-300 pt-6">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
            Demand Forge Strategist
          </h2>
          {!chatHistory.length ? (
            <form onSubmit={startInterview} className="space-y-4">
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Which industry are you interested in?"
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <button
                type="submit"
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {loading ? "Starting..." : "Start Conversation with Business Strategist"}
              </button>
            </form>
          ) : (
            <div className="mt-4 space-y-4">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.isAI ? "bg-blue-100" : "bg-blue-500 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <form onSubmit={sendResponse} className="space-y-4">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                <button
                  type="submit"
                  className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {loading ? "Sending..." : "Send Response"}
                </button>
              </form>
              <button
                onClick={analyzeInterview}
                className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {loading ? "Analyzing..." : "Analyze Session"}
              </button>
              {analysis && (
                <div className="p-3 bg-gray-100 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-blue-600">
                    Interview Analysis
                  </h3>
                  <p>{analysis}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fibonacci Counter */}
        <div className="text-center mt-6">
          <p className="text-lg">
            Click{" "}
            <button
              type="button"
              onClick={() => {
                const nextNumber = count + prevCount;
                setPrevCount(count);
                setCount(nextNumber);
              }}
              className="underline text-blue-600"
            >
              HERE
            </button>{" "}
            to see the next Fibonacci number:
          </p>
          <p className="text-2xl font-semibold mt-2">{count}</p>
        </div>
      </div>
    </div>
  );
}
