import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, FileText, Clipboard, ListChecks, HelpCircle, AlertCircle, Loader2, BookOpen } from "lucide-react";
import { SummarizeResponse } from "../types";

export default function TextSummarizer() {
  const [text, setText] = useState("");
  const [length, setLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [format, setFormat] = useState<'bullets' | 'structured' | 'mindmap'>('structured');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummarizeResponse | null>({
    summary: "This educational text details the global water cycle, showcasing how water moves dynamically across oceans, rivers, and the atmosphere. Driven by solar heat, water evaporates from the oceans, condenses into clouds, and falls as precipitation. Rivers act as the primary terrestrial drainage system, returning freshwater back into the massive ocean basins, maintaining global life support systems.",
    keyTakeaways: [
      "The global water cycle is a continuous, closed-loop process driven primarily by solar energy.",
      "Oceans hold over 97% of the planet's water supply and contribute the vast majority of evaporated moisture.",
      "Condensation occurs when water vapor cools down high in the atmosphere, creating clouds.",
      "Precipitation (rain, snow) is the main mechanism for transferring freshwater back to Earth's surface.",
      "Rivers are crucial surface runoff channels that carry water from high altitudes back to sea level, completing the cycle."
    ],
    keyTerms: [
      { term: "Evaporation", definition: "The phase-change process where liquid water turns into gaseous water vapor due to heat." },
      { term: "Condensation", definition: "The atmospheric process where water vapor cools and transforms back into liquid water droplets." },
      { term: "Precipitation", definition: "Any form of water (rain, snow, sleet, or hail) that falls from clouds to the Earth's surface." },
      { term: "Surface Runoff", definition: "Water from rain or snowmelt that flows over the land surface into streams, rivers, and oceans." }
    ]
  });

  const sampleTexts = [
    {
      title: "Oceans & Water Cycle",
      text: "The Earth's water cycle describes how water evaporates from the surface of the earth, rises into the atmosphere, cools and condenses into rain or snow in clouds, and falls again to the surface as precipitation. The water falling on land collects in rivers and lakes, soil, and porous layers of rock, and much of it flows back into the oceans, where it will once more evaporate. Oceans contain about 97% of the Earth's water, making them the primary source and sink in this continuous global system."
    },
    {
      title: "Mitochondria Powerhouse",
      text: "Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP). Mitochondria contain their own small genome, which is distinct from the cell's nuclear DNA, indicating an evolutionary origin where they once existed as independent symbiotic bacteria."
    }
  ];

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, length, format }),
      });

      if (!response.ok) {
        let errMessage = "Failed to generate summary from EduGenie.";
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
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sampleText: string) => {
    setText(sampleText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="summarizer-container">
      {/* Editor Panel (Left) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800">Summarize Material</h3>
          </div>
          <p className="text-sm text-slate-500">
            Paste textbook sections, articles, or notes below to instantly extract key concepts, high-yield summaries, and study glossaries.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Educational Text
                </label>
                <div className="flex gap-2">
                  {sampleTexts.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadSample(sample.text)}
                      className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-semibold px-2 py-1 rounded-sm text-slate-600 transition-all cursor-pointer"
                    >
                      Sample {idx + 1}: {sample.title}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your study materials here (up to 10,000 words)..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 text-sm transition-all"
                id="summarizer-textarea"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Summary Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-xs bg-white text-slate-600"
                >
                  <option value="short">Short Essence</option>
                  <option value="medium">Medium Length</option>
                  <option value="detailed">In-Depth Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Formatting Style
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-xs bg-white text-slate-600"
                >
                  <option value="structured">Structured Outline</option>
                  <option value="bullets">Key Bullet List</option>
                  <option value="mindmap">Concept Matrix</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSummarize}
              disabled={loading || !text.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-xs cursor-pointer"
              id="summarizer-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Distilling Text...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Distill Text
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Viewer Panel (Right) */}
      <div className="lg:col-span-7 space-y-6">
        {summary ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Essence Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 border-b border-slate-50 pb-3">
                <Clipboard className="w-4 h-4" />
                <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Concept Summary</h4>
              </div>
              <p className="text-slate-700 text-sm md:text-base leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 italic">
                "{summary.summary}"
              </p>
            </div>

            {/* Takeaways List */}
            {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 border-b border-slate-50 pb-3">
                  <ListChecks className="w-4 h-4" />
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider">High-Yield Takeaways</h4>
                </div>
                <ul className="space-y-2.5">
                  {summary.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extracted Key Vocab */}
            {summary.keyTerms && summary.keyTerms.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 border-b border-slate-50 pb-3">
                  <BookOpen className="w-4 h-4" />
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Academic Term Glossary</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.keyTerms.map((term, i) => (
                    <div
                      key={i}
                      className="p-3 bg-emerald-50/10 hover:bg-emerald-50/25 rounded-xl border border-emerald-100/30 space-y-1 transition-all"
                    >
                      <span className="text-xs font-bold text-emerald-700">
                        {term.term}
                      </span>
                      <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed">
                        {term.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white py-16 px-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
            <FileText className="w-16 h-16 mx-auto mb-3 stroke-1 text-slate-300" />
            <h4 className="font-medium text-slate-600 mb-1">Summarizer is Empty</h4>
            <p className="text-xs max-w-sm mx-auto">Paste study material, essay paragraphs, or choose a pre-loaded sample textbook on the left to review summary guidelines.</p>
          </div>
        )}
      </div>
    </div>
  );
}
