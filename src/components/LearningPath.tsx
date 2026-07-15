import { useState } from "react";
import { motion } from "motion/react";
import { Map, Sparkles, Award, Clock, ArrowRight, CheckCircle, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { LearningPathResponse } from "../types";

export default function LearningPath() {
  const [topic, setTopic] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("5 hours/week");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState<LearningPathResponse | null>({
    topic: "SQL",
    overview: "SQL (Structured Query Language) is the global standard language for relational database management. Mastering SQL will enable you to retrieve, manipulate, and analyze data efficiently across any relational database system, powering your journey into data analytics, backend development, or data science.",
    stages: {
      beginner: {
        title: "Foundation of Querying",
        description: "Learn how to communicate with relational databases, retrieve data, and filter results according to specific criteria.",
        duration: "Week 1",
        topics: [
          "Understanding Tables, Rows, and Columns",
          "Selecting data with SELECT and FROM",
          "Filtering results with WHERE, AND, OR, NOT",
          "Sorting and limiting output with ORDER BY and LIMIT"
        ],
        tips: [
          "Install DB Browser for SQLite or use an online platform like DB-Fiddle to practice without server setup.",
          "Pay close attention to column types (Strings vs Integers) to avoid query syntax errors."
        ],
        recommendedResources: [
          "W3Schools SQL Tutorial (Free)",
          "Interactive exercises on SQLBolt (Recommended)"
        ]
      },
      intermediate: {
        title: "Relational Joining & Aggregations",
        description: "Connect multiple tables using relations, group data, and compute metrics like averages, sums, and counts.",
        duration: "Weeks 2-3",
        topics: [
          "Relational Joins (INNER, LEFT, RIGHT, FULL OUTER)",
          "Aggregations (COUNT, SUM, AVG, MIN, MAX)",
          "Grouping records with GROUP BY and HAVING",
          "Alias naming (AS) and handling NULL values"
        ],
        tips: [
          "Draw simple Venn Diagrams to visualize how LEFT JOIN and INNER JOIN select data differently.",
          "Remember that HAVING filters aggregated rows, whereas WHERE filters individual records before aggregation."
        ],
        recommendedResources: [
          "Kaggle SQL Courses (Interactive)",
          "LeetCode Database Easy Problems"
        ]
      },
      advanced: {
        title: "Subqueries, Window Functions & Optimization",
        description: "Write complex nested queries, perform analytical computations across row sets, and design indexes for performance.",
        duration: "Weeks 4+",
        topics: [
          "Nested Subqueries and Common Table Expressions (CTEs)",
          "Analytical Window Functions (ROW_NUMBER, RANK, PARTITION BY)",
          "Database Schema design, Constraints, and Indexing",
          "Query Execution Plans and Basic Query Optimization"
        ],
        tips: [
          "Use CTEs (WITH clause) instead of complex nested subqueries to keep your SQL clean and readable.",
          "Practice writing indexes on frequently queried columns to see how retrieval speeds up."
        ],
        recommendedResources: [
          "Advanced SQL on SelectStarSQL (Free)",
          "PostgreSQL documentation on Window Functions"
        ]
      }
    }
  });

  const presets = ["SQL", "Data Structures & Algorithms", "Linear Algebra", "React & Web Dev", "Chemistry Basics"];

  const handleGeneratePath = async (customTopic?: string) => {
    const activeTopic = customTopic || topic;
    if (!activeTopic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeTopic, timeCommitment }),
      });

      if (!response.ok) {
        let errMessage = "Failed to generate learning path from EduGenie.";
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
      setPath(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="path-container">
      {/* Configuration Form (Left) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800">Path Recommendations</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Get a tailored, chronological study syllabus to master any subject, split into clear academic stages.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                What do you want to learn?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. SQL, Data Science, Calculus..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700 placeholder-slate-400 text-sm transition-all"
                id="path-topic-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Time Commitment
              </label>
              <select
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 text-xs bg-white text-slate-600"
              >
                <option value="2 hours/week">Light (2 hours/week)</option>
                <option value="5 hours/week">Steady (5 hours/week)</option>
                <option value="10+ hours/week">Intense (10+ hours/week)</option>
                <option value="Flexible study rate">At my own pace</option>
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={() => handleGeneratePath()}
              disabled={loading || (!topic.trim() && !path)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-xs cursor-pointer"
              id="path-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mapping Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Roadmap
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggested presets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Suggested Curriculum Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setTopic(p);
                  handleGeneratePath(p);
                }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-full border border-slate-100 transition-all text-xs text-slate-600 font-medium cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Learning Path Timeline (Right) */}
      <div className="lg:col-span-8 space-y-6">
        {path ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Curriculum Summary Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Personalized Syllabus
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Roadmap to Master: {path.topic}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {path.overview}
              </p>
            </div>

            {/* Stages Timeline */}
            <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
              {/* Beginner Stage */}
              <div className="relative pl-12">
                <div className="absolute left-3 top-1.5 w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 shadow-xs z-10">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3">
                    <div>
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Stage 1: Beginner</span>
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">{path.stages.beginner.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 py-1 px-2.5 rounded-full font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {path.stages.beginner.duration}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{path.stages.beginner.description}</p>
                  
                  {/* Topics Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Concepts to Master</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {path.stages.beginner.topics.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-lg text-xs text-slate-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips and Resources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-50 text-[11px] md:text-xs">
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Study Tips</span>
                      <ul className="space-y-1 text-slate-500 italic pl-1">
                        {path.stages.beginner.tips.map((tip, idx) => (
                          <li key={idx} className="list-disc pl-2 ml-1 leading-relaxed">"{tip}"</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Suggested Resources</span>
                      <ul className="space-y-1 text-blue-600 font-medium pl-1">
                        {path.stages.beginner.recommendedResources.map((res, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intermediate Stage */}
              <div className="relative pl-12">
                <div className="absolute left-3 top-1.5 w-6 h-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-purple-600 shadow-xs z-10">
                  <Award className="w-4 h-4" />
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3">
                    <div>
                      <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider block">Stage 2: Intermediate</span>
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">{path.stages.intermediate.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 py-1 px-2.5 rounded-full font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {path.stages.intermediate.duration}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{path.stages.intermediate.description}</p>

                  {/* Topics Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Concepts to Master</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {path.stages.intermediate.topics.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-lg text-xs text-slate-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips and Resources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-50 text-[11px] md:text-xs">
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Study Tips</span>
                      <ul className="space-y-1 text-slate-500 italic pl-1">
                        {path.stages.intermediate.tips.map((tip, idx) => (
                          <li key={idx} className="list-disc pl-2 ml-1 leading-relaxed">"{tip}"</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Suggested Resources</span>
                      <ul className="space-y-1 text-purple-650 font-medium pl-1">
                        {path.stages.intermediate.recommendedResources.map((res, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Stage */}
              <div className="relative pl-12">
                <div className="absolute left-3 top-1.5 w-6 h-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-amber-600 shadow-xs z-10">
                  <Award className="w-4 h-4" />
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3">
                    <div>
                      <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">Stage 3: Advanced</span>
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">{path.stages.advanced.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 py-1 px-2.5 rounded-full font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {path.stages.advanced.duration}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{path.stages.advanced.description}</p>

                  {/* Topics Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Concepts to Master</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {path.stages.advanced.topics.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-lg text-xs text-slate-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips and Resources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-50 text-[11px] md:text-xs">
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Study Tips</span>
                      <ul className="space-y-1 text-slate-500 italic pl-1">
                        {path.stages.advanced.tips.map((tip, idx) => (
                          <li key={idx} className="list-disc pl-2 ml-1 leading-relaxed">"{tip}"</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Suggested Resources</span>
                      <ul className="space-y-1 text-amber-650 font-medium pl-1">
                        {path.stages.advanced.recommendedResources.map((res, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white py-16 px-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
            <Map className="w-16 h-16 mx-auto mb-3 stroke-1 text-slate-300" />
            <h4 className="font-medium text-slate-600 mb-1">Roadmap is Empty</h4>
            <p className="text-xs max-w-sm mx-auto">Input a skill name (e.g., Data Science, Music Theory) on the left to map out an active study path with resources.</p>
          </div>
        )}
      </div>
    </div>
  );
}
