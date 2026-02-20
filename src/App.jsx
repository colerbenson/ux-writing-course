import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, ArrowRight, ArrowLeft, Download, Zap, BookMarked } from 'lucide-react';

// Utility functions for localStorage
const STORAGE_KEY = 'uxWritingCourseProgress';

const getProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      track: null,
      completedModules: [],
      moduleScores: {},
      currentModule: 0,
      practiceAnswers: {}
    };
  } catch {
    return {
      track: null,
      completedModules: [],
      moduleScores: {},
      currentModule: 0,
      practiceAnswers: {}
    };
  }
};

const saveProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
};

// Text analysis utilities
const analyzeText = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      charCount: 0,
      wordCount: 0,
      hasPassiveVoice: false,
      hasJargon: false,
      readingLevel: 0,
      clarityScore: 0,
      tone: 'neutral'
    };
  }

  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  const charCount = text.length;

  // Passive voice detection (simplified)
  const passiveIndicators = /\b(was|were|been|being|is|are|am)\s+\w+ed\b/i;
  const hasPassiveVoice = passiveIndicators.test(text);

  // Jargon detection
  const jargonWords = ['utilize', 'leverage', 'synergy', 'paradigm', 'utilize', 'facilitate', 'optimize', 'streamline', 'authenticate', 'initialize'];
  const hasJargon = jargonWords.some(word => text.toLowerCase().includes(word));

  // Simple reading level (based on avg word length)
  const avgWordLength = wordCount > 0 ? text.replace(/\s/g, '').length / wordCount : 0;
  const readingLevel = avgWordLength < 5 ? 95 : avgWordLength < 7 ? 75 : 50;

  // Clarity score
  let clarityScore = 100;
  if (hasPassiveVoice) clarityScore -= 20;
  if (hasJargon) clarityScore -= 15;
  if (wordCount > 15) clarityScore -= 10;
  if (charCount > 100) clarityScore -= 10;

  // Tone detection (simplified)
  const positiveWords = ['great', 'awesome', 'thanks', 'perfect', 'excellent'];
  const urgentWords = ['now', 'immediately', 'urgent', 'critical', 'error'];
  const helpfulWords = ['try', 'help', 'guide', 'support'];
  
  let tone = 'neutral';
  if (urgentWords.some(w => text.toLowerCase().includes(w))) tone = 'urgent';
  else if (positiveWords.some(w => text.toLowerCase().includes(w))) tone = 'encouraging';
  else if (helpfulWords.some(w => text.toLowerCase().includes(w))) tone = 'helpful';

  return {
    charCount,
    wordCount,
    hasPassiveVoice,
    hasJargon,
    readingLevel: Math.max(0, Math.min(100, readingLevel)),
    clarityScore: Math.max(0, Math.min(100, clarityScore)),
    tone
  };
};

// Live Copy Editor Component
const LiveCopyEditor = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const analysis = analyzeText(text);

  const getFeedbackColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
        <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">
          Write UI microcopy
        </label>
        <p className="text-sm text-gray-600 mb-4">Try a button label, error message, or empty state. We'll analyze it in real-time.</p>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setShowFeedback(true);
          }}
          placeholder="e.g., 'Click here to submit your application form'"
          className="w-full p-4 border-2 border-indigo-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 min-h-[100px] text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none resize-none"
        />
      </div>

      {showFeedback && text.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Real-time Analysis</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-medium text-gray-500 mb-1">Characters</div>
              <div className={`text-xl font-semibold ${analysis.charCount > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {analysis.charCount}
                <span className="text-xs text-gray-500 font-normal ml-1">{analysis.charCount > 50 && '/ aim for <50'}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-medium text-gray-500 mb-1">Words</div>
              <div className={`text-xl font-semibold ${analysis.wordCount > 8 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {analysis.wordCount}
                <span className="text-xs text-gray-500 font-normal ml-1">{analysis.wordCount > 8 && '/ aim for <8'}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-medium text-gray-500 mb-1">Clarity</div>
              <div className={`text-xl font-semibold ${getFeedbackColor(analysis.clarityScore)}`}>
                {Math.round(analysis.clarityScore)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-medium text-gray-500 mb-1">Tone</div>
              <div className="text-xl font-semibold text-indigo-500 capitalize">
                {analysis.tone}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {analysis.hasPassiveVoice && (
              <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">!</span>
                <span>Passive voice detected. Try active voice for directness.</span>
              </div>
            )}
            {analysis.hasJargon && (
              <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">!</span>
                <span>Jargon detected. Use plain language that everyone understands.</span>
              </div>
            )}
            {analysis.clarityScore >= 80 && (
              <div className="flex items-start gap-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Great clarity. This is concise and easy to understand.</span>
              </div>
            )}
          </div>

          {analysis.clarityScore >= 70 && (
            <button
              onClick={onComplete}
              className="group w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Continue to next section
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Microcopy Fix Exercise
const MicrocopyExercise = ({ onComplete }) => {
  const exercises = [
    {
      id: 1,
      bad: "Click here",
      context: "Button for downloading a sales report",
      good: "Download report",
      explanation: "Specific action verb + object. Users know exactly what happens."
    },
    {
      id: 2,
      bad: "An error has occurred",
      context: "Error message when email is already registered",
      good: "This email is already registered. Try signing in instead.",
      explanation: "Specific problem + actionable solution. Empathetic tone."
    },
    {
      id: 3,
      bad: "Are you sure?",
      context: "Confirmation dialog before deleting a file",
      good: "Delete this file permanently?",
      explanation: "Specific about what's being confirmed. Clear consequences."
    }
  ];

  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState([]);

  const exercise = exercises[currentExercise];

  const handleSubmit = () => {
    setShowAnswer(true);
    if (!completed.includes(currentExercise)) {
      setCompleted([...completed, currentExercise]);
    }
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setUserAnswer('');
      setShowAnswer(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Exercise {currentExercise + 1} of {exercises.length}</p>
          <p className="text-sm text-gray-500 mt-1">{exercise.context}</p>
        </div>
        <div className="flex gap-2">
          {exercises.map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                completed.includes(idx) ? 'bg-emerald-400 scale-110' :
                idx === currentExercise ? 'bg-indigo-500 scale-110' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
        <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Improve this</span>
        <p className="text-lg text-gray-900 font-mono mt-3 leading-relaxed">"{exercise.bad}"</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your improved version
        </label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Rewrite this to be clear, concise, and helpful..."
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 min-h-[100px] text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none resize-none"
        />
      </div>

      {!showAnswer ? (
        <button
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
          className="group w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
        >
          Check Answer
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Better version</span>
            <p className="text-lg text-gray-900 font-mono mt-3 mb-4 leading-relaxed">"{exercise.good}"</p>
            <div className="border-t border-emerald-200/50 pt-4">
              <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Why it works:</span> {exercise.explanation}</p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="group w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {currentExercise < exercises.length - 1 ? 'Next Exercise' : 'Complete Module'}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  );
};

// Main App Component
const UXWritingCourse = () => {
  const [progress, setProgress] = useState(getProgress());
  const [currentView, setCurrentView] = useState(progress.track ? 'modules' : 'welcome');
  const [currentModule, setCurrentModule] = useState(progress.currentModule || 0);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const modules = [
    {
      id: 0,
      title: "What is UX Writing?",
      expressTime: "8 min",
      deepTime: "60 min",
      description: "The full scope: beyond microcopy to strategic content design",
      icon: "📚"
    },
    {
      id: 1,
      title: "Core Principles",
      expressTime: "10 min",
      deepTime: "60 min",
      description: "The 4 C's applied to all content: microcopy to long-form",
      icon: "⭐"
    },
    {
      id: 2,
      title: "Understanding Your Users",
      expressTime: "12 min",
      deepTime: "60 min",
      description: "Research methods that inform UX writing decisions",
      icon: "🔍"
    },
    {
      id: 3,
      title: "Content Strategy & IA",
      expressTime: "10 min",
      deepTime: "60 min",
      description: "Information architecture and narrative planning",
      icon: "🗺️"
    },
    {
      id: 4,
      title: "The Writing Toolkit",
      expressTime: "12 min",
      deepTime: "60 min",
      description: "Microcopy patterns, long-form content, and voice & tone",
      icon: "🛠️"
    },
    {
      id: 5,
      title: "Collaboration & Process",
      expressTime: "8 min",
      deepTime: "60 min",
      description: "Working with designers, PMs, and advocating for content",
      icon: "🤝"
    },
    {
      id: 6,
      title: "Real-World Application",
      expressTime: "10 min",
      deepTime: "60 min",
      description: "Case studies, capstone projects, and portfolio building",
      icon: "🚀"
    }
  ];

  const selectTrack = (track) => {
    const newProgress = { ...progress, track };
    setProgress(newProgress);
    setCurrentView('modules');
  };

  const completeModule = (moduleId) => {
    const newProgress = {
      ...progress,
      completedModules: [...new Set([...progress.completedModules, moduleId])]
    };
    setProgress(newProgress);
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setProgress(getProgress());
      setCurrentView('welcome');
      setCurrentModule(0);
    }
  };

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen">
        {/* Hero — dark section */}
        <div className="bg-stripe-navy">
          <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">
            <p className="text-sm font-semibold text-indigo-400 tracking-wide uppercase mb-5">UX Writing Course</p>
            <h1 className="text-display text-white mb-6">
              From strategy<br />to execution
            </h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Evidence-based training in UX writing. Research, content strategy, microcopy,
              voice & tone — everything you need, nothing you don't.
            </p>
          </div>
        </div>

        {/* Track Selection — offset cards on light bg */}
        <div className="bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-6">Choose your track</p>
            <div className="grid md:grid-cols-2 gap-5">
              <div
                onClick={() => selectTrack('express')}
                className="group bg-white rounded-2xl p-8 cursor-pointer shadow-card hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-1">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Express</p>
                </div>
                <h2 className="text-heading text-gray-900 mb-2">1 hour</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-8">
                  All 7 modules in a focused hour. Core concepts, key frameworks, and quick practice.
                </p>
                <div className="space-y-3 mb-8">
                  {['Core concepts from each module', 'Key frameworks and patterns', 'Quick practice exercises'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold text-center text-sm group-hover:bg-indigo-700 transition-colors">
                  Start Express
                </div>
              </div>

              <div
                onClick={() => selectTrack('deep')}
                className="group bg-white rounded-2xl p-8 cursor-pointer shadow-card hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-1">
                  <BookMarked className="w-5 h-5 text-indigo-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deep Dive</p>
                </div>
                <h2 className="text-heading text-gray-900 mb-2">7 hours</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-8">
                  Comprehensive skill building over a week. Detailed lessons, hands-on practice, real case studies.
                </p>
                <div className="space-y-3 mb-8">
                  {['In-depth exploration of principles', 'Interactive exercises with feedback', 'Downloadable reference sheets'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold text-center text-sm group-hover:bg-indigo-700 transition-colors">
                  Start Deep Dive
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Learn — white section */}
        <div className="bg-white">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <p className="text-base font-bold text-gray-900 mb-2">Strategy</p>
                <p className="text-sm text-gray-500 leading-relaxed">Research, content strategy, and information architecture that informs great writing.</p>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 mb-2">Execution</p>
                <p className="text-sm text-gray-500 leading-relaxed">Microcopy, long-form content, voice & tone, and accessibility patterns.</p>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 mb-2">Collaboration</p>
                <p className="text-sm text-gray-500 leading-relaxed">Working with designers and PMs, real case studies, portfolio building.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-gray-500">
            <p>Based on research from Nielsen Norman Group and industry leaders</p>
            <p>Progress saves automatically</p>
          </div>
        </div>
      </div>
    );
  }

  // Module List View
  if (currentView === 'modules') {
    const completionRate = Math.round((progress.completedModules.length / modules.length) * 100);

    return (
      <div className="min-h-screen">
        {/* Dark header */}
        <div className="bg-stripe-navy">
          <div className="max-w-3xl mx-auto px-6 pt-12 pb-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2 capitalize">{progress.track} Track</p>
                <h1 className="text-heading text-white">Your modules</h1>
              </div>
              <button
                onClick={resetProgress}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-medium tabular-nums">{progress.completedModules.length}/{modules.length}</span>
            </div>

            {completionRate === 100 && (
              <div className="mt-6 bg-slate-800/50 rounded-2xl p-6 flex items-start gap-4 border border-slate-700">
                <Award className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">All modules complete</p>
                  <p className="text-sm text-slate-400 mt-1">Great work. You've completed every module in this track.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Module List — white section */}
        <div className="bg-white">
          <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="space-y-2">
            {modules.map((module) => {
              const isCompleted = progress.completedModules.includes(module.id);
              const isLocked = module.id > 0 && !progress.completedModules.includes(module.id - 1);

              return (
                <div
                  key={module.id}
                  className={`group rounded-2xl p-5 transition-all duration-200 ${
                    isLocked
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:bg-gray-50'
                  } ${isCompleted ? 'bg-gray-50' : ''}`}
                  onClick={() => {
                    if (!isLocked) {
                      setCurrentModule(module.id);
                      setCurrentView('module');
                    }
                  }}
                >
                  <div className="flex items-center gap-5">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isCompleted ? 'bg-emerald-50' :
                      isLocked ? 'bg-gray-50' :
                      'bg-gray-100 group-hover:bg-indigo-50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className={`text-sm font-semibold transition-colors duration-200 ${
                          isLocked ? 'text-gray-300' : 'text-gray-500 group-hover:text-indigo-500'
                        }`}>{module.id + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{module.title}</h3>
                      <p className={`text-sm mt-0.5 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>{module.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 text-xs font-medium ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {progress.track === 'express' ? module.expressTime : module.deepTime}
                      </span>
                      {!isLocked && !isCompleted && (
                        <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" />
                      )}
                    </div>
                  </div>
                  {isLocked && (
                    <p className="text-xs text-gray-500 mt-2 ml-15 pl-[60px]">Complete the previous module first</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resources */}
          <div className="mt-12 border-t border-gray-100 pt-10">
            <div className="flex items-center gap-2 mb-6">
              <Download className="w-4 h-4 text-gray-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resources</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <button className="bg-gray-50 rounded-xl p-4 text-left hover:bg-gray-100 transition-colors">
                <p className="text-sm font-medium text-gray-900">The 4 C's Cheat Sheet</p>
                <p className="text-xs text-gray-500 mt-1">Quick reference guide (PDF)</p>
              </button>
              <button className="bg-gray-50 rounded-xl p-4 text-left hover:bg-gray-100 transition-colors">
                <p className="text-sm font-medium text-gray-900">Microcopy Pattern Library</p>
                <p className="text-xs text-gray-500 mt-1">Common UI patterns (PDF)</p>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Available after completing relevant modules</p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Individual Module View
  if (currentView === 'module') {
    const module = modules[currentModule];
    const isExpress = progress.track === 'express';

    return (
      <ModuleContent 
        module={module}
        isExpress={isExpress}
        onComplete={() => {
          completeModule(currentModule);
          setCurrentView('modules');
        }}
        onBack={() => setCurrentView('modules')}
      />
    );
  }

  return null;
};

// Module Content Component
const ModuleContent = ({ module, isExpress, onComplete, onBack }) => {
  const [section, setSection] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [section]);

  const getModuleContent = (moduleId, isExpress) => {
    // Module 1: What is UX Writing? (The Full Picture)
    if (moduleId === 0) {
      return {
        sections: [
          {
            title: "Beyond Microcopy",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Most people think UX writing means button labels and error messages. That's microcopy —
                  one component of a much broader, research-driven discipline.
                </p>

                <div className="border-l-2 border-indigo-500 pl-6 py-1">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">The real definition</span>
                  <p className="text-base text-gray-900 mt-3 leading-relaxed">
                    UX writing is the practice of designing the entire conversational experience between
                    a user and a product — from research and strategy to the final words on screen.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <span className="text-xs font-medium text-red-400 uppercase tracking-wide">Narrow view</span>
                    <p className="text-sm font-medium text-gray-900 mt-3 mb-3">Microcopy only</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>Button labels</p>
                      <p>Error messages</p>
                      <p>Tooltips</p>
                      <p>Form fields</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <span className="text-xs font-medium text-emerald-500 uppercase tracking-wide">Full picture</span>
                    <p className="text-sm font-medium text-gray-900 mt-3 mb-3">Strategic UX writing</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>Research & data analysis</p>
                      <p>Content strategy & IA</p>
                      <p>Voice & tone guidelines</p>
                      <p>Long-form content</p>
                      <p>Cross-functional collaboration</p>
                      <p>Plus microcopy execution</p>
                    </div>
                  </div>
                </div>

                {!isExpress && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-4">The UX Writing Process</p>
                    <div className="space-y-3">
                      {[
                        { num: '01', label: 'Research', desc: 'Understand users, test language, analyze data' },
                        { num: '02', label: 'Strategy', desc: 'Map content, plan IA, define voice' },
                        { num: '03', label: 'Execution', desc: 'Write microcopy, long-form, establish patterns' },
                        { num: '04', label: 'Testing', desc: 'Measure impact, iterate, refine' },
                      ].map(step => (
                        <div key={step.num} className="flex items-start gap-4">
                          <span className="text-xs font-semibold text-indigo-400 mt-0.5">{step.num}</span>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{step.label}</span>
                            <span className="text-sm text-gray-500 ml-2">{step.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          },
          {
            title: "What UX Writers Do",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  UX writers are involved in many areas beyond writing short text snippets.
                </p>

                <div className="space-y-0">
                  {[
                    { label: 'Research & Data', desc: 'User interviews, content testing, analyzing how users talk about your product.', example: 'Testing whether users understand "Archive" vs "Save for later"' },
                    { label: 'Content Strategy', desc: 'Planning narrative arcs and information hierarchy across an entire product.', example: 'Mapping a checkout flow to identify where users need reassurance vs speed' },
                    { label: 'Voice & Tone', desc: 'Defining how a brand sounds across all digital touchpoints.', example: 'Creating guidelines that work for both marketing and in-product copy' },
                    { label: 'Long-form Content', desc: 'Onboarding flows, FAQs, help docs, and empty states.', example: 'A 3-email welcome series that guides new users from signup to first action' },
                    { label: 'Collaboration', desc: 'Working with designers and engineers to make text and UI seamless.', example: 'Advocating for content-first design in feature planning' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-5 py-5 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                        <p className="text-xs text-gray-500 mt-2 italic">{item.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            title: "Related Roles",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  How UX writing relates to other content and design roles.
                </p>

                <div className="space-y-3">
                  {[
                    { role: 'UX Writer', focus: 'In-product content experience', activities: 'Research, strategy, microcopy, long-form, testing' },
                    { role: 'Content Designer', focus: 'Holistic content systems', activities: 'Strategy, IA, governance, design collaboration' },
                    { role: 'Copywriter', focus: 'Marketing & persuasion', activities: 'Ads, landing pages, emails, campaigns' },
                    { role: 'Technical Writer', focus: 'Documentation & education', activities: 'Help articles, API docs, tutorials' },
                  ].map((item, idx) => (
                    <div key={idx} className={`rounded-2xl p-5 ${idx === 0 ? 'bg-white shadow-card border border-gray-100' : 'bg-gray-50'}`}>
                      <p className="text-sm font-semibold text-gray-900">{item.role}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.focus}</p>
                      <p className="text-xs text-gray-500 mt-2">{item.activities}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Many organizations combine these roles. The titles matter less than understanding
                    the full skill set — from research to strategy to execution.
                  </p>
                </div>

                {!isExpress && (
                  <div className="border-l-2 border-indigo-500 pl-6 py-1">
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Business Impact</span>
                    <div className="space-y-4 mt-4">
                      {[
                        { company: 'Booking.com', metric: '5% conversion increase', detail: 'from simplified copy' },
                        { company: 'Slack', metric: '18% more team creation', detail: 'from strategic empty state content' },
                        { company: 'NNGroup', metric: '124% usability improvement', detail: 'with research-informed, scannable text' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-baseline justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{item.company}</span>
                            <span className="text-sm text-gray-500 ml-2">{item.detail}</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{item.metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          },
          {
            title: "Knowledge Check",
            content: (
              <div className="space-y-8">
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Question</p>
                  <p className="text-lg font-medium text-gray-900 leading-relaxed">
                    Which statement best describes UX writing?
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      text: 'Writing short, clever button labels and error messages',
                      correct: false,
                      explanation: 'This is microcopy — just one part of UX writing.'
                    },
                    {
                      text: 'Designing conversational experiences through research, strategy, and execution',
                      correct: true,
                      explanation: 'UX writing is a research-driven discipline that goes far beyond microcopy.'
                    },
                    {
                      text: 'Creating marketing content that converts visitors',
                      correct: false,
                      explanation: 'That\'s copywriting — a different focus than in-product UX writing.'
                    }
                  ].map((option, idx) => {
                    const isSelected = quizAnswer === idx;
                    const isAnswered = quizAnswer !== null;
                    const isCorrectOption = option.correct;

                    let optionClasses = 'w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 text-sm group';
                    if (!isAnswered) {
                      optionClasses += ' border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm cursor-pointer';
                    } else if (isSelected && isCorrectOption) {
                      optionClasses += ' border-emerald-300 bg-emerald-50';
                    } else if (isSelected && !isCorrectOption) {
                      optionClasses += ' border-red-300 bg-red-50';
                    } else if (!isSelected && isCorrectOption) {
                      optionClasses += ' border-emerald-200 bg-emerald-50/50';
                    } else {
                      optionClasses += ' border-gray-100 opacity-50';
                    }

                    return (
                      <button
                        key={idx}
                        className={optionClasses}
                        onClick={() => !isAnswered && setQuizAnswer(idx)}
                        disabled={isAnswered}
                      >
                        <div className={`flex gap-4 ${isAnswered && (isSelected || isCorrectOption) ? 'items-start' : 'items-center'}`}>
                          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                            !isAnswered ? 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600' :
                            isSelected && isCorrectOption ? 'bg-emerald-500 text-white' :
                            isSelected && !isCorrectOption ? 'bg-red-500 text-white' :
                            isCorrectOption ? 'bg-emerald-100 text-emerald-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {!isAnswered ? String.fromCharCode(65 + idx) :
                             isSelected && isCorrectOption ? '✓' :
                             isSelected && !isCorrectOption ? '✗' :
                             isCorrectOption ? '✓' : String.fromCharCode(65 + idx)}
                          </span>
                          <div className="flex-1">
                            <span className={`${isAnswered && !isCorrectOption && !isSelected ? 'text-gray-500' : 'text-gray-700'}`}>
                              {option.text}
                            </span>
                            {isAnswered && (isSelected || isCorrectOption) && (
                              <p className={`text-xs mt-2 ${isCorrectOption ? 'text-emerald-600' : 'text-red-500'}`}>
                                {option.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {quizAnswer !== null && (
                  <div className="pt-2">
                    <button
                      onClick={onComplete}
                      className="w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      Complete Module <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          }
        ]
      };
    }

    // Module 2: Core Principles
    if (moduleId === 1) {
      return {
        sections: [
          {
            title: "The 4 C's of UX Writing",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Four principles that apply to everything you write — from a 2-word button label
                  to a 500-word onboarding narrative.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Clarity',
                      desc: 'Users understand immediately without re-reading',
                      bad: '"Authenticate credentials"',
                      good: '"Sign in"'
                    },
                    {
                      name: 'Conciseness',
                      desc: 'Use only the words you need',
                      bad: '"Click here to download"',
                      good: '"Download"'
                    },
                    {
                      name: 'Consistency',
                      desc: 'Same terms throughout the product',
                      bad: '"Sign in" / "Log in" / "Enter"',
                      good: 'Pick one. Stick with it.'
                    },
                    {
                      name: 'Conversational',
                      desc: 'Natural, human tone',
                      bad: '"An error has occurred"',
                      good: '"Something went wrong"'
                    }
                  ].map((principle, idx) => {
                    return (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-5 overflow-hidden relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                      <p className="text-sm font-semibold text-gray-900 mb-1">{principle.name}</p>
                      <p className="text-xs text-gray-500 mb-4">{principle.desc}</p>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                          <p className="text-red-500">{principle.bad}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <p className="text-emerald-600">{principle.good}</p>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {!isExpress && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">The Inverted Pyramid</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Put the most important information first. Users scan — they don't read every word.
                    </p>
                    <div className="space-y-1.5 text-sm font-mono">
                      <p className="text-red-400">"To see the dashboard, first you need to complete setup"</p>
                      <p className="text-emerald-500">"Complete setup to see your dashboard"</p>
                    </div>
                  </div>
                )}
              </div>
            )
          },
          {
            title: "Practice: Live Copy Editor",
            content: (
              <div className="space-y-6">
                <p className="text-gray-500 leading-relaxed">
                  Write your own microcopy and get real-time feedback on clarity,
                  conciseness, and tone. Aim for a clarity score of 70% or higher.
                </p>
                <LiveCopyEditor onComplete={() => setSection(section + 1)} />
              </div>
            )
          },
          {
            title: "Complete & Continue",
            content: (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Module Complete</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You've learned the core principles of UX writing. Apply the 4 C's to every piece you write.
                  </p>
                </div>

                <button
                  onClick={onComplete}
                  className="group w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Complete Module <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            )
          }
        ]
      };
    }

    // Module 3: Understanding Your Users
    if (moduleId === 2) {
      return {
        sections: [
          {
            title: "Research That Informs Writing",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Great UX writing starts with understanding your users — how they think, what language
                  they use, and where they get confused.
                </p>

                <div className="border-l-2 border-indigo-500 pl-6 py-1">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Focus</span>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    This module covers research <em>for UX writing</em> specifically — methods that inform
                    your content decisions with real user insights.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Content Testing', desc: 'Test whether users understand your words before shipping them.', example: 'A/B test "Archive" vs "Save for later" to see which term users understand best.' },
                    { label: 'User Language Analysis', desc: 'Listen to how users actually describe actions and features.', example: 'Review support tickets and interviews to find the words users naturally use.' },
                    { label: 'Comprehension Testing', desc: 'Ask users to explain back what they think will happen.', example: 'Show a button label and ask: "What happens when you click this?"' },
                    { label: 'Usability Testing', desc: 'Watch where users get stuck because of unclear content.', example: 'Long pauses, re-reading, confused expressions — all signals of bad copy.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-5 py-5 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                        <p className="text-xs text-gray-500 mt-2 italic">{item.example}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {!isExpress && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Data Sources for UX Writers</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>Support ticket analysis — what confuses users?</p>
                      <p>Internal search queries — what are they looking for?</p>
                      <p>Heatmaps and analytics — where do they hesitate?</p>
                      <p>User interview transcripts — what words do they use?</p>
                      <p>A/B test results — which version performed better?</p>
                    </div>
                  </div>
                )}
              </div>
            )
          },
          {
            title: "The Power of User Language",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  One of the most powerful techniques is simply listening to how users talk
                  and using their language instead of yours.
                </p>

                <div className="space-y-3">
                  {[
                    { company: '"Optimize workflow efficiency"', user: '"Get things done faster"' },
                    { company: '"Authentication credentials"', user: '"Enter your password"' },
                    { company: '"Leverage synergies"', user: '"Work together"' },
                  ].map((pair, idx) => (
                    <div key={idx} className="grid md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Company says</span>
                        <p className="text-sm text-gray-500 font-mono mt-2">{pair.company}</p>
                      </div>
                      <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
                        <span className="text-xs text-emerald-500 uppercase tracking-wide">Users say</span>
                        <p className="text-sm text-gray-900 font-mono mt-2">{pair.user}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl overflow-hidden">
                  <div className="p-8" style={{ background: 'linear-gradient(135deg, #0061ff 0%, #0a2540 100%)' }}>
                    <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Case Study</span>
                    <h4 className="text-xl font-bold text-white mt-2">Dropbox</h4>
                    <p className="text-sm text-blue-100 mt-3 leading-relaxed">
                      User research revealed people didn't understand "sync." They changed their messaging
                      to "Your files, anywhere" and saw significant improvement in comprehension and adoption.
                    </p>
                  </div>
                </div>

                {!isExpress && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Self-check</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>1. Is this how users actually talk about this feature?</p>
                      <p>2. Have I checked support tickets to see what terms users use?</p>
                      <p>3. Can I test this language with 3-5 users before shipping?</p>
                    </div>
                  </div>
                )}
              </div>
            )
          },
          {
            title: "Research You Can Do Today",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  You don't need a research team. Here are quick methods you can start with today.
                </p>

                <div className="space-y-3">
                  {[
                    { label: 'Support Ticket Analysis', time: '15 min', desc: 'Read the last 20 support tickets. What questions keep coming up? What words do users use when confused?', outcome: 'Identify confusing terminology and content gaps' },
                    { label: 'Internal Search Analysis', time: '10 min', desc: 'Review your product\'s search queries. What are users looking for? Are you using their terms?', outcome: 'Match your labels to user expectations' },
                    { label: '5-Second Test', time: '5 min', desc: 'Show someone a button label or heading for 5 seconds. Ask: "What does that mean?"', outcome: 'Validate comprehension before shipping' },
                    { label: 'A/B Test Copy', time: 'Ongoing', desc: 'Test two versions of critical copy. Measure click-through, completion, or comprehension.', outcome: 'Data-driven content decisions' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-5 py-5 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">{item.time}</span>
                        </div>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                        <p className="text-xs text-emerald-600 mt-2 font-medium">Outcome: {item.outcome}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Module Complete</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    The best UX writers are also good listeners. Use research to inform every writing decision.
                  </p>
                </div>

                <button
                  onClick={onComplete}
                  className="group w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Complete Module <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            )
          }
        ]
      };
    }
    // Module 5: The Writing Toolkit (Microcopy + Long-form)
    if (moduleId === 4) {
      return {
        sections: [
          {
            title: "Your Writing Toolkit",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  With the strategic foundation in place, let's dive into the tactical
                  patterns you'll use daily — both microcopy and long-form.
                </p>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Microcopy Patterns</p>
                    <p className="text-xs text-gray-500 mb-3">Small, functional text</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>Buttons & CTAs</p>
                      <p>Error messages</p>
                      <p>Form labels</p>
                      <p>Tooltips</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Long-form Content</p>
                    <p className="text-xs text-gray-500 mb-3">Narrative experiences</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>Onboarding flows</p>
                      <p>Empty states</p>
                      <p>Help docs</p>
                      <p>Settings copy</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: "The 3 I's Framework",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  All UX content serves three purposes. Every word you write should inform,
                  influence, or help a user interact.
                </p>

                <div className="space-y-3">
                  {[
                    { name: 'Inform', desc: 'Educate users and help them make informed decisions', context: 'System message', example: '"Your password must be at least 8 characters"' },
                    { name: 'Influence', desc: 'Encourage action or build trust', context: 'CTA button', example: '"Start free trial" (not "Submit")' },
                    { name: 'Interact', desc: 'Support user interaction with the interface', context: 'Form label', example: '"Email address" (clear field purpose)' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-5 py-5 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                          <span className="text-xs text-gray-500">{item.context}</span>
                          <p className="text-sm text-gray-700 font-mono mt-1">{item.example}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isExpress && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-4">Button Pattern: Verb + Object</p>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-xs text-red-400 uppercase tracking-wide">Vague</span>
                        <div className="space-y-1.5 mt-2 text-gray-500 font-mono">
                          <p>Submit</p>
                          <p>OK</p>
                          <p>Continue</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-emerald-500 uppercase tracking-wide">Specific</span>
                        <div className="space-y-1.5 mt-2 text-gray-700 font-mono">
                          <p>Send message</p>
                          <p>Save changes</p>
                          <p>Go to dashboard</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          },
          {
            title: "Error Messages That Help",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Error messages are your biggest UX writing opportunity. They transform
                  frustration into progress.
                </p>

                <div>
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Framework</span>
                  <p className="text-lg font-semibold text-gray-900 mt-2 mb-6">Every error needs three parts</p>
                  <div className="space-y-0">
                    {[
                      { step: 'What happened', desc: 'Be specific about the problem', example: '"Email address already registered"' },
                      { step: 'Why it happened', desc: 'Context, if helpful', example: '"You created an account in 2023"' },
                      { step: 'What to do', desc: 'Clear next step', example: '"Try signing in instead"' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-5 py-5 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{item.step}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                          <p className="text-sm text-indigo-600 font-mono mt-2 bg-indigo-50 inline-block px-3 py-1 rounded-lg">{item.example}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <span className="text-xs font-medium text-red-400 uppercase tracking-wide">Poor</span>
                    <p className="text-sm text-gray-700 font-mono mt-3">"Invalid input"</p>
                    <p className="text-xs text-gray-500 mt-2">Vague, no solution, technical</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <span className="text-xs font-medium text-emerald-500 uppercase tracking-wide">Better</span>
                    <p className="text-sm text-gray-900 font-mono mt-3">"Password must be at least 8 characters. Try again."</p>
                    <p className="text-xs text-gray-500 mt-2">Specific, actionable, friendly</p>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: "Practice: Fix the Microcopy",
            content: (
              <div className="space-y-6">
                <p className="text-gray-500 leading-relaxed">
                  Apply what you've learned. Improve these real-world examples of poor microcopy.
                </p>
                <MicrocopyExercise onComplete={() => setSection(section + 1)} />
              </div>
            )
          },
          {
            title: "Complete & Continue",
            content: (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Module Complete</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You now understand the 3 I's and how to write effective buttons, errors, and labels.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-6 text-left max-w-sm mx-auto">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3">Key Takeaways</p>
                    <ul className="space-y-2 text-sm text-gray-500">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Use Verb + Object for buttons
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Errors need: What + Why + What to do
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Every word must inform, influence, or interact
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={onComplete}
                  className="group w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Complete Module <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            )
          }
        ]
      };
    }

    // Module 3: Content Strategy & IA
    if (moduleId === 3) {
      return {
        sections: [
          {
            title: "What is Content Strategy?",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Content strategy is the planning, creation, and governance of content across your
                  product. For UX writers, it means thinking beyond individual screens to design
                  a coherent experience across the entire user journey.
                </p>

                <div className="border-l-2 border-indigo-500 pl-6 py-1">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Key Concept</span>
                  <h4 className="text-lg font-semibold text-gray-900 mt-2 mb-3">Information Architecture for Writers</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    IA is how you organize and label content so users can find what they need. As a UX writer,
                    you shape IA through navigation labels, category names, page titles, and the hierarchy
                    of information on every screen.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-gray-900">Content Strategy Covers Three Layers</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Structure</div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        How content is organized across screens, flows, and navigation. What goes where, and why.
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Substance</div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        What you say and how you say it. Voice, tone, messaging frameworks, and content standards.
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Workflow</div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        How content gets created, reviewed, and maintained. Who owns what, and when it's updated.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Content Mapping: The User Journey</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    A content map traces every piece of content a user encounters from first touch to power user.
                    It reveals gaps, redundancies, and tone mismatches.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-gray-700 font-medium">Awareness</div>
                    <span className="text-gray-400">&rarr;</span>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-gray-700 font-medium">Onboarding</div>
                    <span className="text-gray-400">&rarr;</span>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-gray-700 font-medium">First Use</div>
                    <span className="text-gray-400">&rarr;</span>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-gray-700 font-medium">Habit</div>
                    <span className="text-gray-400">&rarr;</span>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-gray-700 font-medium">Advocacy</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    At each stage, ask: What does the user need to know? What tone fits their emotional state?
                    What action should they take next?
                  </p>
                </div>
              </div>
            )
          },
          {
            title: "Progressive Disclosure & Content Hierarchy",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Users don't need all information at once. Progressive disclosure means revealing
                  the right content at the right moment, reducing cognitive load and guiding users forward.
                </p>

                <div className="border-l-2 border-indigo-500 pl-6 py-1">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Principle</span>
                  <h4 className="text-lg font-semibold text-gray-900 mt-2 mb-3">Show only what's needed, when it's needed</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Lead with the essential action or information. Tuck details behind "Learn more" links,
                    tooltips, or expandable sections. Let users pull complexity toward them rather than
                    pushing it all upfront.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Before & After: Onboarding Welcome</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <span className="text-xs font-medium text-red-500 uppercase tracking-wide">Before</span>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <p className="font-medium">Welcome to ProjectHub!</p>
                        <p className="text-gray-500 text-xs leading-relaxed">
                          ProjectHub is a project management tool that lets you create projects,
                          invite team members, set up workflows, customize notifications, integrate
                          with Slack and GitHub, configure permissions, set up billing, create
                          templates, and manage sprints. Let's get started by setting up your
                          workspace, inviting your team, and configuring your first project.
                        </p>
                      </div>
                      <p className="text-xs text-red-500 mt-3">Too much, too soon. Users feel overwhelmed.</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                      <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">After</span>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        <p className="font-medium">Welcome to ProjectHub</p>
                        <p className="text-gray-500 text-xs leading-relaxed">
                          Let's set up your first project. It takes about 2 minutes.
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-indigo-600 font-medium mt-2">
                          Create your first project &rarr;
                        </div>
                      </div>
                      <p className="text-xs text-emerald-600 mt-3">One clear action. Details come later.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-gray-900">Content Hierarchy Patterns</h4>
                  <div className="space-y-0">
                    {[
                      { num: '01', title: 'Primary action first', desc: 'The main thing the user should do is the most prominent element. Everything else supports it.' },
                      { num: '02', title: 'Supporting context second', desc: 'Brief explanations or reassurances sit below the primary action, visible but not dominant.' },
                      { num: '03', title: 'Details on demand', desc: 'Edge cases, fine print, and advanced options are accessible but tucked away behind interaction.' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-5 py-5 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{item.num}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                          <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            title: "Complete & Continue",
            content: (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Module Complete</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You now understand how content strategy and information architecture
                    shape the user experience beyond individual screens.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-6 text-left max-w-sm mx-auto">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3">Key Takeaways</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Content strategy spans structure, substance, and workflow
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Map content to user journey stages
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Progressive disclosure reduces cognitive load
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={onComplete}
                  className="group w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Complete Module <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            )
          }
        ]
      };
    }

    // Module 5: Collaboration & Process
    if (moduleId === 5) {
      return {
        sections: [
          {
            title: "Working with Design Teams",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  UX writing doesn't happen in isolation. Your best work comes from embedding
                  yourself into the design process early and collaborating closely with designers,
                  PMs, and engineers.
                </p>

                <div className="border-l-2 border-indigo-500 pl-6 py-1">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Core Idea</span>
                  <h4 className="text-lg font-semibold text-gray-900 mt-2 mb-3">Content-First Design</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Instead of designing layouts and filling in copy later, content-first design
                    means the words and the interface evolve together. Real content reveals problems
                    that lorem ipsum hides: text that doesn't fit, flows that don't make sense,
                    and labels that confuse.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Your Role at Each Stage</h4>
                  <div className="space-y-0">
                    {[
                      { phase: 'Discovery', desc: 'Join user research sessions. Listen for the language users use. Flag content gaps in user stories and requirements.' },
                      { phase: 'Design', desc: 'Write real content for wireframes, not placeholder text. Pair with designers to iterate on copy and layout simultaneously.' },
                      { phase: 'Build', desc: 'Review implementations for copy accuracy. Work with engineers on edge cases: error states, empty states, loading states, truncation.' },
                      { phase: 'Ship', desc: 'QA all user-facing strings. Track content metrics post-launch. Feed learnings back into the next cycle.' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-5 py-5 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-lg px-3 py-1.5">
                          <span className="text-xs font-bold text-white">{item.phase}</span>
                        </div>
                        <p className="text-sm text-gray-600 flex-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Advocating for Content</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    When teams treat copy as an afterthought, use these approaches:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-900 mb-1">Show, don't tell</p>
                      <p className="text-xs text-gray-500">
                        Put real copy in mockups early. The difference speaks for itself.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-900 mb-1">Use data</p>
                      <p className="text-xs text-gray-500">
                        Share support tickets caused by unclear copy. Numbers change minds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: "Voice & Tone Guidelines",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Voice is your product's personality. Tone is how that personality adapts
                  to different situations. Your voice stays consistent; your tone shifts with context.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <span className="text-xs font-medium text-indigo-500 uppercase tracking-wide">Voice</span>
                    <p className="text-sm text-gray-900 font-semibold mt-2 mb-2">Always the same</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Your product's consistent character traits. If your voice is "confident
                      and helpful," that applies everywhere from onboarding to error messages.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 mt-4 text-xs text-gray-600">
                      Example voice attributes: Clear, Warm, Professional, Direct
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <span className="text-xs font-medium text-indigo-500 uppercase tracking-wide">Tone</span>
                    <p className="text-sm text-gray-900 font-semibold mt-2 mb-2">Adapts to context</p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      How your voice sounds in a specific moment. Celebratory when a user completes
                      a goal. Calm and reassuring during an error. Encouraging during onboarding.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 mt-4 text-xs text-gray-600">
                      Example tones: Celebratory, Reassuring, Neutral, Urgent
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Tone in Action: Same Voice, Different Tone</h4>
                  <div className="space-y-0">
                    {[
                      { context: 'Success', copy: '"You\'re all set. Your project is live."', tone: 'Celebratory', color: 'text-emerald-600 bg-emerald-50' },
                      { context: 'Error', copy: '"We couldn\'t save your changes. Try again in a moment."', tone: 'Reassuring', color: 'text-amber-600 bg-amber-50' },
                      { context: 'Onboarding', copy: '"Next, invite your team. Everything\'s better together."', tone: 'Encouraging', color: 'text-indigo-600 bg-indigo-50' },
                      { context: 'Destructive action', copy: '"This will permanently delete your account and all data."', tone: 'Serious', color: 'text-red-600 bg-red-50' },
                    ].map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4 py-5 border-b border-gray-100 last:border-0">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{item.context}</span>
                        <p className="text-sm text-gray-900 mt-1 font-mono">{item.copy}</p>
                      </div>
                      <span className={`text-xs font-medium ${item.color} px-2 py-1 rounded flex-shrink-0`}>{item.tone}</span>
                    </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Building Guidelines That Stick</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    The best voice and tone docs are short, full of examples, and easy to reference.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-500 font-semibold mt-0.5">1.</span>
                      <p>Define 3-4 voice attributes with "this, not that" examples</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-500 font-semibold mt-0.5">2.</span>
                      <p>Create a tone spectrum for common scenarios (success, error, empty state, etc.)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-500 font-semibold mt-0.5">3.</span>
                      <p>Include real product examples, not abstract principles</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-indigo-500 font-semibold mt-0.5">4.</span>
                      <p>Keep it to one page. If nobody reads it, it doesn't work.</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: "Complete & Continue",
            content: (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Module Complete</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You now understand how to collaborate effectively with design teams
                    and create voice and tone guidelines that keep content consistent.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-6 text-left max-w-sm mx-auto">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3">Key Takeaways</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Content-first design prevents costly rewrites
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Voice is constant; tone adapts to context
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#10003;</span>
                        Use data and examples to advocate for content
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={onComplete}
                  className="group w-full bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Complete Module <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            )
          }
        ]
      };
    }

    // Module 6: Real-World Application
    if (moduleId === 6) {
      return {
        sections: [
          {
            title: "Case Studies: UX Writing in Action",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  The best way to sharpen your UX writing is to study how leading products
                  approach it. Let's look at what makes their content work.
                </p>

                <div className="space-y-6">
                  {/* Slack */}
                  <div className="rounded-2xl overflow-hidden">
                    <div className="p-8 pb-6" style={{ background: 'linear-gradient(135deg, #611f69 0%, #4a154b 100%)' }}>
                      <span className="text-xs font-semibold text-purple-200 uppercase tracking-wide">Case Study</span>
                      <h4 className="text-2xl font-bold text-white mt-2">Slack</h4>
                      <p className="text-sm text-purple-100 leading-relaxed mt-2 max-w-lg">
                        Friendly without being unprofessional. Humor in low-stakes moments, direct in high-stakes ones.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loading state</span>
                          <p className="text-sm text-gray-900 font-mono mt-2">"Herding cats..."</p>
                          <p className="text-xs text-gray-500 mt-1">Low stakes, playful tone builds personality</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Connection error</span>
                          <p className="text-sm text-gray-900 font-mono mt-2">"Trouble connecting. We'll keep trying."</p>
                          <p className="text-xs text-gray-500 mt-1">High stakes, reassuring and clear</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stripe */}
                  <div className="rounded-2xl overflow-hidden">
                    <div className="p-8 pb-6" style={{ background: 'linear-gradient(135deg, #635bff 0%, #0a2540 100%)' }}>
                      <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">Case Study</span>
                      <h4 className="text-2xl font-bold text-white mt-2">Stripe</h4>
                      <p className="text-sm text-indigo-100 leading-relaxed mt-2 max-w-lg">
                        Complex financial concepts broken into plain language. Documentation that makes technical content accessible.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Before</span>
                          <p className="text-sm text-gray-900 font-mono mt-2">"Configure webhook endpoint authentication"</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-l-2 border-indigo-500">
                          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Their approach</span>
                          <p className="text-sm text-gray-900 font-mono mt-2">"Verify that events come from Stripe"</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">Same concept, framed around the user's goal instead of the system's architecture.</p>
                    </div>
                  </div>

                  {/* Airbnb */}
                  <div className="rounded-2xl overflow-hidden">
                    <div className="p-8 pb-6" style={{ background: 'linear-gradient(135deg, #ff5a5f 0%, #e31c5f 100%)' }}>
                      <span className="text-xs font-semibold text-red-100 uppercase tracking-wide">Case Study</span>
                      <h4 className="text-2xl font-bold text-white mt-2">Airbnb</h4>
                      <p className="text-sm text-red-100 leading-relaxed mt-2 max-w-lg">
                        Content design centered on trust. Every piece of copy calibrated to make both hosts and guests feel safe.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Host listing</span>
                          <p className="text-sm text-gray-900 font-mono mt-2">"Guests love arriving at a clean, welcoming space"</p>
                          <p className="text-xs text-gray-500 mt-1">Positive framing instead of rules and requirements</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cancellation</span>
                          <p className="text-sm text-gray-900 font-mono mt-2">"Free cancellation before Jan 15"</p>
                          <p className="text-xs text-gray-500 mt-1">Leads with the benefit, not the policy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: "Your UX Writing Checklist",
            content: (
              <div className="space-y-8">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Here's everything you've learned across this course, distilled into
                  a practical checklist you can use on every project.
                </p>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">From Module 0</span>
                    <h4 className="text-sm font-semibold text-gray-900 mt-2 mb-3">Scope & Role</h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Am I thinking beyond microcopy to the full content experience?
                      </label>
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Have I considered research, strategy, and collaboration, not just execution?
                      </label>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">From Module 1</span>
                    <h4 className="text-sm font-semibold text-gray-900 mt-2 mb-3">The 4 C's</h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Is it clear? Will users understand without re-reading?
                      </label>
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Is it concise? Can any words be removed without losing meaning?
                      </label>
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Is it consistent with the rest of the product?
                      </label>
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Does it sound human and conversational?
                      </label>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">From Module 2</span>
                    <h4 className="text-sm font-semibold text-gray-900 mt-2 mb-3">User Research</h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Am I using the language my users actually use?
                      </label>
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Have I tested this copy with real people or reviewed support data?
                      </label>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">From Modules 3-5</span>
                    <h4 className="text-sm font-semibold text-gray-900 mt-2 mb-3">Strategy & Process</h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Does this content fit within the larger user journey?
                      </label>
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Am I using progressive disclosure appropriately?
                      </label>
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Does the tone match the user's emotional state in this moment?
                      </label>
                      <label className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="text-indigo-400 mt-0.5">&#9634;</span>
                        Have I collaborated with design and engineering early enough?
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            title: "Complete & Continue",
            content: (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
                  <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
                    Course Complete
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    You've completed the Express Track. You now have a solid foundation in
                    UX writing, from core principles to real-world application.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-6 text-left max-w-sm mx-auto">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3">What's Next</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">&rarr;</span>
                        Apply the checklist to your next project
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">&rarr;</span>
                        Start a voice and tone doc for your product
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">&rarr;</span>
                        Try the Deep Dive track for expanded content and exercises
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={onComplete}
                  className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  Complete Course <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          }
        ]
      };
    }

    // Fallback for any unhandled modules
    return {
      sections: [
        {
          title: `${module.title}`,
          content: (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
                <div className="text-4xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-500">{module.description}</p>
                <p className="text-sm text-gray-500 mt-3">
                  This module is coming soon.
                </p>
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Mark as Complete (Preview)
              </button>
            </div>
          )
        }
      ]
    };
  };

  const content = getModuleContent(module.id, isExpress);
  const currentSection = content.sections[section];

  return (
    <div className="min-h-screen">
      {/* Dark module header */}
      <div className="bg-stripe-navy">
        <div className="max-w-3xl mx-auto px-6 pt-8 pb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All modules
          </button>

          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">
            Module {module.id + 1} &middot; {isExpress ? module.expressTime : module.deepTime}
          </p>
          <h1 className="text-heading text-white mb-3">{module.title}</h1>
          <p className="text-sm text-slate-400">{module.description}</p>

          {/* Section Progress */}
          <div className="mt-8 flex items-center gap-2">
            {content.sections.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                  idx <= section ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              />
            ))}
            <span className="text-xs text-slate-400 font-medium tabular-nums ml-2">{section + 1}/{content.sections.length}</span>
          </div>
        </div>
      </div>

      {/* Content — white section */}
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        {/* Section Content */}
        <div className="mb-12">
          <h2 className="text-subheading text-gray-900 mb-8">
            {currentSection.title}
          </h2>

          {currentSection.content}
        </div>

        {/* Navigation */}
        {section < content.sections.length - 1 && !currentSection.title.includes('Practice') && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-8">
            {section > 0 ? (
              <button
                onClick={() => setSection(section - 1)}
                className="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-all duration-200"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                Previous
              </button>
            ) : <div />}
            <button
              onClick={() => setSection(section + 1)}
              className="group flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all duration-200"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default UXWritingCourse;
