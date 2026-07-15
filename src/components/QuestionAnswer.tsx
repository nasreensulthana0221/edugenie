import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Search, HelpCircle, BookOpen, Sparkles, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { QAPair } from "../types";

export default function QuestionAnswer() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qaHistory, setQaHistory] = useState<QAPair[]>([
    {
      question: "Which is the largest ocean?",
      answer: `### The Pacific Ocean

The **Pacific Ocean** is the largest and deepest of Earth's oceanic divisions. It extends from the Arctic Ocean in the north to the Southern Ocean in the south and is bounded by the continents of Asia and Australia in the west and the Americas in the east.

#### Key Characteristics:
* **Size:** It covers about **63 million square miles** (165 million square kilometers), which is more than one-third of the Earth's surface. It is larger than all of Earth's land area combined!
* **Depth:** It contains the **Mariana Trench**, which is the deepest point on Earth, reaching a depth of nearly 36,000 feet (11,000 meters) at the Challenger Deep.
* **The Ring of Fire:** The Pacific basin is surrounded by a massive horseshoe-shaped ring of volcanoes and active seismic fault lines, responsible for over 75% of the world's active volcanoes.

#### Fun Fact 🐳
Did you know that the Pacific Ocean was named by Portuguese explorer Ferdinand Magellan in 1520? He called it *"Mar Pacífico"*, which means "peaceful sea", because the waters were incredibly calm when he sailed into them!`,
      timestamp: new Date().toISOString()
    }
  ]);

  const presets = [
    { label: "Largest Ocean?", text: "Which is the largest ocean?" },
    { label: "Why is the sky blue?", text: "Why is the sky blue? Explain the scientific process." },
    { label: "How do plants make food?", text: "How do plants make food? Tell me about Photosynthesis." },
    { label: "What is the speed of light?", text: "What is the speed of light and why can nothing travel faster?" }
  ];

  const handleSubmit = async (e?: FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const query = customQuestion || question;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    if (!customQuestion) {
      setQuestion(""); // clear input
    }

    try {
      const response = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) {
        let errMessage = "Failed to fetch response from EduGenie.";
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch {
          errMessage = `Server error (${response.status}): EduGenie is currently initializing or busy. Please try again in a few seconds!`;
        }
        throw new Error(errMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("EduGenie returned an invalid response. Please try again.");
      }
      setQaHistory((prev) => [
        {
          question: query,
          answer: data.answer,
          timestamp: data.timestamp
        },
        ...prev,
      ]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="qa-container">
      {/* Search Input and Presets (Left Column) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800">Ask EduGenie</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Enter any academic question, homework problem, or curiosity, and receive a rich, interactive educational answer.
          </p>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here (e.g. How does photosynthesis work?)..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 text-sm transition-all"
                id="qa-textarea"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-xs"
              id="qa-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Formulating Answer...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Ask Assistant
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Presets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="font-semibold text-sm text-slate-700">Explore Quick Questions</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(undefined, preset.text)}
                disabled={loading}
                className="p-3 text-left bg-slate-50 hover:bg-blue-50/50 hover:text-blue-700 rounded-xl border border-slate-100 transition-all text-xs text-slate-600 font-medium cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answers Display (Right Column) */}
      <div className="lg:col-span-7 space-y-6">
        <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Learning Feed
        </h3>

        {qaHistory.length === 0 ? (
          <div className="bg-white py-12 px-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 stroke-1" />
            <p className="text-sm">No questions asked yet. Explore the options on the left to start learning!</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {qaHistory.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4"
              >
                {/* Question bubble */}
                <div className="flex items-start gap-3 border-b border-slate-50 pb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    Q
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm md:text-base leading-snug">
                      {item.question}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Answer block */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                    EG
                  </div>
                  <div className="flex-1 text-slate-700 text-sm leading-relaxed whitespace-pre-line prose max-w-none">
                    {/* Format simple markdown chunks safely without full complex markdown library parsed */}
                    {item.answer.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={lIdx} className="text-lg font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('#### ')) {
                        return <h4 key={lIdx} className="text-sm font-semibold text-slate-700 mt-3 mb-1 uppercase tracking-wider">{line.replace('#### ', '')}</h4>;
                      }
                      if (line.startsWith('* **')) {
                        const match = line.match(/^\*\s\*\*(.*?)\*\*(.*)/);
                        if (match) {
                          return (
                            <div key={lIdx} className="pl-4 py-1 flex gap-2">
                              <span className="text-blue-500">•</span>
                              <p><strong className="text-slate-800">{match[1]}</strong>{match[2]}</p>
                            </div>
                          );
                        }
                      }
                      if (line.startsWith('* ')) {
                        return (
                          <div key={lIdx} className="pl-4 py-1 flex gap-2">
                            <span className="text-blue-500">•</span>
                            <p>{line.replace('* ', '')}</p>
                          </div>
                        );
                      }
                      return <p key={lIdx} className="mb-2">{line}</p>;
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
