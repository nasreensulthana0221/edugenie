import { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Sparkles, Brain, Award, Info, AlertCircle, Loader2 } from "lucide-react";
import { ConceptResponse } from "../types";

export default function ConceptExplainer() {
  const [concept, setConcept] = useState("");
  const [level, setLevel] = useState<'elementary' | 'high_school' | 'college' | 'educator'>('high_school');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ConceptResponse | null>({
    concept: "Pythagoras Theorem",
    level: "high_school",
    explanation: "The Pythagoras Theorem is one of the foundational rules in geometry. It is a mathematical relationship between the three sides of any right-angled triangle. Specifically, it states that if you take the lengths of the two shorter sides (which meet at a right angle) and square them, their sum is exactly equal to the square of the longest side (the hypotenuse). This allows you to find any missing side length if you know the other two sides.",
    analogies: [
      "Think of a slide on a playground: the ladder going up is side 'a', the ground from the ladder to the bottom of the slide is side 'b', and the slide itself is the hypotenuse 'c'. If you know how high the ladder is and how far it is from the ladder to the slide end, you can calculate the exact length of the slide!",
      "Imagine walking around a rectangular corner. Instead of walking along side 'a' and side 'b', taking the shortcut diagonally across the grass is the hypotenuse 'c'. The squared distance of your shortcut is equal to the squared distances of the two streets."
    ],
    keyTerms: [
      { term: "Hypotenuse", definition: "The longest side of a right-angled triangle, always located opposite the 90-degree right angle." },
      { term: "Right-Angled Triangle", definition: "A triangle in which one of the interior angles is exactly 90 degrees." },
      { term: "Theorem", definition: "A mathematical statement or rule that has been proven to be true based on established facts." }
    ],
    summary: "In a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: a² + b² = c²."
  });

  const levelOptions = [
    { value: 'elementary', label: '🎒 Elementary', desc: 'Explains like you are 8 with fun stories and basic words.' },
    { value: 'high_school', label: '🏫 High School', desc: 'Adds formulas, real-world examples, and balanced details.' },
    { value: 'college', label: '🎓 College', desc: 'Utilizes rigorous scientific phrasing and deep analysis.' },
    { value: 'educator', label: '🍎 Educator', desc: 'Provides teaching frameworks, common mistakes, and study suggestions.' }
  ];

  const presets = [
    "Pythagoras Theorem",
    "Mitochondria",
    "Quantum Physics",
    "Supply and Demand",
    "Artificial Intelligence"
  ];

  const handleExplain = async (customConcept?: string) => {
    const activeConcept = customConcept || concept;
    if (!activeConcept.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: activeConcept, level }),
      });

      if (!response.ok) {
        let errMessage = "Failed to generate explanation from EduGenie.";
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
      setExplanation(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="explainer-container">
      {/* Settings Panel (Left) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800">Concept Explainer</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Enter a complex topic or concept, choose an academic tier, and get a tailored explanation that makes sense.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                What concept do you want to learn?
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. Pythagoras Theorem, Black Holes..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 placeholder-slate-400 text-sm transition-all"
                id="explainer-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Select Learning Level
              </label>
              <div className="grid grid-cols-1 gap-2">
                {levelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLevel(opt.value as any)}
                    className={`p-3 text-left rounded-xl border transition-all flex flex-col cursor-pointer ${
                      level === opt.value
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100/50'
                    }`}
                  >
                    <span className="font-semibold text-sm">{opt.label}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={() => handleExplain()}
              disabled={loading || (!concept.trim() && !explanation)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-xs"
              id="explainer-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Explanation...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Simplify Concept
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggestion Presets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" /> Suggested Concepts
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, index) => (
              <button
                key={index}
                onClick={() => {
                  setConcept(p);
                  handleExplain(p);
                }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-full border border-slate-100 transition-all text-xs text-slate-600 font-medium cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Explanation Feed (Right) */}
      <div className="lg:col-span-7 space-y-6">
        {explanation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Core Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {explanation.level.replace('_', ' ')}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-2">
                    {explanation.concept}
                  </h2>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-xl text-indigo-600">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              {/* Core Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Explanation
                </h4>
                <p className="text-slate-700 text-sm md:text-base leading-relaxed bg-slate-50/40 p-4 rounded-xl border border-slate-100/50">
                  {explanation.explanation}
                </p>
              </div>

              {/* Formula or key summary box */}
              <div className="p-4 bg-indigo-900 text-indigo-50 rounded-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Brain className="w-32 h-32 transform translate-x-10 translate-y-10" />
                </div>
                <h5 className="text-[10px] uppercase tracking-wider font-bold text-indigo-300">Quick Essence</h5>
                <p className="text-sm font-semibold mt-1 leading-snug">{explanation.summary}</p>
              </div>
            </div>

            {/* Analogies Section */}
            {explanation.analogies && explanation.analogies.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Intuitive Analogies
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {explanation.analogies.map((analogy, i) => (
                    <div key={i} className="p-4 bg-amber-50/30 rounded-xl border border-amber-100/40 space-y-2">
                      <span className="text-lg">💡</span>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed italic">
                        "{analogy}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Terms Section */}
            {explanation.keyTerms && explanation.keyTerms.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-500" /> Academic Glossary
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {explanation.keyTerms.map((term, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100/50 flex flex-col md:flex-row md:items-start gap-2 md:gap-4 transition-all"
                    >
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-md whitespace-nowrap self-start md:mt-0.5">
                        {term.term}
                      </span>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
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
            <Brain className="w-16 h-16 mx-auto mb-3 stroke-1 text-slate-300 animate-pulse" />
            <h4 className="font-medium text-slate-600 mb-1">Concept Hub is Empty</h4>
            <p className="text-xs max-w-md mx-auto">Type in your topic or pick one of the suggestions on the left to start exploring interactive conceptual models!</p>
          </div>
        )}
      </div>
    </div>
  );
}
