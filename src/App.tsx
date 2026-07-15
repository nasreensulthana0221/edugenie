import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, MessageSquare, Brain, Award, FileText, Map, Sparkles, BookOpen } from "lucide-react";
import QuestionAnswer from "./components/QuestionAnswer";
import ConceptExplainer from "./components/ConceptExplainer";
import QuizGenerator from "./components/QuizGenerator";
import TextSummarizer from "./components/TextSummarizer";
import LearningPath from "./components/LearningPath";

type TabId = 'qa' | 'explain' | 'quiz' | 'summarize' | 'path';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('qa');

  const tabs = [
    { id: 'qa', label: 'Q&A Chatbot', icon: MessageSquare, desc: 'Direct Question Answering' },
    { id: 'explain', label: 'Concept Explainer', icon: Brain, desc: 'Multi-Level Simplifications' },
    { id: 'quiz', label: 'Quiz Generator', icon: Award, desc: 'Interactive Self-Assessment' },
    { id: 'summarize', label: 'Text Summarizer', icon: FileText, desc: 'Key Bullet Distillations' },
    { id: 'path', label: 'Learning Paths', icon: Map, desc: 'Personalized Study Syllabi' },
  ] as const;

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'qa':
        return <QuestionAnswer />;
      case 'explain':
        return <ConceptExplainer />;
      case 'quiz':
        return <QuizGenerator />;
      case 'summarize':
        return <TextSummarizer />;
      case 'path':
        return <LearningPath />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#f8fafc]">
      {/* Upper Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-xs backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  EduGenie <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">AI</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">YOUR PERSONAL ACADEMIC ASSISTANT</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200/40'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Announcement */}
        <div className="mb-8 p-6 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl relative overflow-hidden shadow-xs">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center">
            <GraduationCap className="w-64 h-64 transform translate-x-12 translate-y-6" />
          </div>
          <div className="max-w-xl space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" /> Powered by Gemini AI
            </div>
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
              Ignite your learning.
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              Simplify complex homework, quiz yourself on core subjects, summarize lengthy PDF papers, and structure progressive custom learning paths inside one consolidated cockpit.
            </p>
          </div>
        </div>

        {/* Mobile Navigation Tabs List */}
        <div className="md:hidden mb-6 flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Header Sub-bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {(() => {
                const tab = tabs.find(t => t.id === activeTab);
                if (tab) {
                  const Icon = tab.icon;
                  return (
                    <>
                      <Icon className="w-5 h-5 text-blue-600" />
                      {tab.label}
                    </>
                  );
                }
              })()}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {tabs.find(t => t.id === activeTab)?.desc}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100/60 px-3 py-1.5 rounded-md">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Offline local state preserved
          </div>
        </div>

        {/* Active Component with animation */}
        <div className="min-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {renderActiveComponent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-150 py-6 mt-12 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 EduGenie. Crafted for students, teachers, and curious minds worldwide.</p>
      </footer>
    </div>
  );
}
