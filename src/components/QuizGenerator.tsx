import { useState } from "react";
import { motion } from "motion/react";
import { Award, Brain, RefreshCw, Sparkles, CheckCircle2, XCircle, AlertCircle, Loader2, Play, ChevronRight, HelpCircle } from "lucide-react";
import { QuizResponse, QuizQuestion } from "../types";

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active quiz state
  const [quiz, setQuiz] = useState<QuizResponse | null>({
    topic: "Pythagoras Theorem",
    questions: [
      {
        id: "q1",
        question: "In a right-angled triangle, if the two shorter sides are of length 3 cm and 4 cm, what is the length of the hypotenuse?",
        options: ["5 cm", "6 cm", "7 cm", "25 cm"],
        correctIndex: 0,
        explanation: "Using the Pythagoras Theorem (a² + b² = c²): 3² + 4² = 9 + 16 = 25. Therefore, c = √25 = 5 cm."
      },
      {
        id: "q2",
        question: "Which of the following describes the 'hypotenuse' of a right-angled triangle?",
        options: [
          "The side adjacent to the right angle.",
          "The shortest side of the triangle.",
          "The side opposite to the right angle.",
          "Any side that is vertical."
        ],
        correctIndex: 2,
        explanation: "The hypotenuse is defined as the longest side of a right-angled triangle and is always opposite the right angle (90 degrees)."
      },
      {
        id: "q3",
        question: "If a right triangle has a hypotenuse of length 13 cm and one side of length 5 cm, what is the length of the third side?",
        options: ["8 cm", "10 cm", "12 cm", "14 cm"],
        correctIndex: 2,
        explanation: "By Pythagoras Theorem: 5² + b² = 13² => 25 + b² = 169 => b² = 144 => b = √144 = 12 cm."
      }
    ]
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const presets = ["Pythagoras Theorem", "Solar System", "World War II", "Cell Biology", "SQL Basics"];

  const generateQuiz = async (customTopic?: string) => {
    const activeTopic = customTopic || topic;
    if (!activeTopic.trim()) return;

    setLoading(true);
    setError(null);
    setQuiz(null);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsAnswered(false);
    setQuizFinished(false);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeTopic, difficulty, count }),
      });

      if (!response.ok) {
        let errMessage = "Failed to generate quiz from EduGenie.";
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
      setQuiz(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    if (isAnswered) return; // cannot change answer once submitted
    const currentQuestion = quiz!.questions[currentIdx];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optIdx
    }));
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx < quiz!.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setIsAnswered(selectedAnswers[quiz!.questions[currentIdx + 1].id] !== undefined);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsAnswered(false);
    setQuizFinished(false);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const currentQuestion = quiz?.questions[currentIdx];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="quiz-container">
      {/* Quiz Creator Side (Left) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800">Quiz Generator</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Test your knowledge! Input a topic, set a difficulty, and generate an interactive self-assessment quiz.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Quiz Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Oceans and Rivers, Pythagoras Theorem..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700 placeholder-slate-400 text-sm transition-all"
                id="quiz-topic-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-xs bg-white text-slate-600"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Questions
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-xs bg-white text-slate-600"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
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
              onClick={() => generateQuiz()}
              disabled={loading || (!topic.trim() && !quiz)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-xs cursor-pointer"
              id="quiz-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Quiz
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Suggested Quiz Topics</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setTopic(p);
                  generateQuiz(p);
                }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-full border border-slate-100 transition-all text-xs text-slate-600 font-medium cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Quiz Area (Right) */}
      <div className="lg:col-span-8">
        {quiz ? (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Interactive Quiz</span>
                <h4 className="text-lg font-bold text-slate-800">{quiz.topic}</h4>
              </div>
              <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-semibold">
                {!quizFinished ? `Question ${currentIdx + 1} of ${quiz.questions.length}` : "Finished!"}
              </div>
            </div>

            {!quizFinished && currentQuestion ? (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-350"
                    style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
                  />
                </div>

                {/* Question */}
                <h3 className="text-base md:text-lg font-semibold text-slate-800">
                  {currentQuestion.question}
                </h3>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === idx;
                    const isCorrect = currentQuestion.correctIndex === idx;

                    let btnClass = "border-slate-200 hover:bg-slate-50/50 hover:border-slate-300 text-slate-700";
                    let icon = null;

                    if (isAnswered) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
                        icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
                      } else if (isSelected) {
                        btnClass = "border-red-500 bg-red-50 text-red-900 font-medium";
                        icon = <XCircle className="w-5 h-5 text-red-600" />;
                      } else {
                        btnClass = "border-slate-100 bg-slate-50/40 text-slate-400 opacity-60";
                      }
                    } else {
                      if (isSelected) {
                        btnClass = "border-amber-500 bg-amber-50 text-amber-900";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full p-4 text-left rounded-xl border flex items-center justify-between transition-all text-sm cursor-pointer ${btnClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Rationale Box */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 mt-4"
                  >
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Rationale Feedback
                    </span>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-end pt-4 border-t border-slate-50">
                  <button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-xl text-xs md:text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {currentIdx < quiz.questions.length - 1 ? (
                      <>
                        Next Question
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Finish Quiz
                        <Award className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Finished State */
              <div className="text-center py-10 space-y-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
                    <Award className="w-12 h-12 stroke-1.5" />
                  </div>
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white">
                    ✓
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">Quiz Completed!</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    You scored <span className="font-bold text-slate-800">{calculateScore()} out of {quiz.questions.length}</span> correct answers. Excellent work!
                  </p>
                </div>

                {/* Score Summary Indicator */}
                <div className="max-w-xs mx-auto p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-around">
                  <div className="text-center">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Score Percentage</span>
                    <span className="text-lg font-bold text-slate-800">
                      {Math.round((calculateScore() / quiz.questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Accuracy</span>
                    <span className="text-lg font-bold text-slate-800">
                      {calculateScore()} / {quiz.questions.length}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Quiz
                  </button>
                  <button
                    onClick={() => {
                      setTopic("");
                      setQuiz(null);
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4" /> Create New Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white py-20 px-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
            <Award className="w-16 h-16 mx-auto mb-3 stroke-1 text-slate-300" />
            <h4 className="font-medium text-slate-600 mb-1">No Active Quiz</h4>
            <p className="text-xs max-w-md mx-auto">Create a topic-specific quiz using the options on the left to evaluate your academic knowledge!</p>
          </div>
        )}
      </div>
    </div>
  );
}
