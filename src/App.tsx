import React, { useState, useEffect, useRef } from 'react';
import { 
  Ticket, 
  CheckCircle, 
  Mail, 
  Sparkles, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Music, 
  Trophy, 
  Compass, 
  Flame, 
  Copy, 
  Check, 
  Zap, 
  Lock, 
  Smartphone,
  ChevronRight,
  Info 
} from 'lucide-react';

const NAMES = [
  "Violet G.", "James T.", "Emily R.", "Michael B.", "Sarah K.",
  "Chris L.", "Ashley M.", "Daniel W.", "Jessica H.", "Ryan P.",
  "Amanda C.", "Tyler N.", "Brittany S.", "Joshua F.", "Megan D.",
  "Brandon E.", "Lauren A.", "Kevin O.", "Stephanie J.", "Nathan V."
];

const AMOUNTS = [600, 750, 800, 850, 900, 950, 1000];

const EVENT_CATEGORIES = [
  { id: 'concerts', name: 'Concerts & Gigs', icon: Music, color: 'from-pink-500 to-rose-500', text: '🎸' },
  { id: 'sports', name: 'Sports Matches', icon: Trophy, color: 'from-emerald-500 to-teal-500', text: '⚽' },
  { id: 'theater', name: 'Theater & Comedy', icon: Flame, color: 'from-amber-500 to-orange-500', text: '🎭' },
  { id: 'festivals', name: 'Festivals & Arts', icon: Compass, color: 'from-purple-500 to-indigo-500', text: '⛺' }
];

const TRIVIA_QUESTIONS = [
  {
    question: "Which legendary artist is known as the 'King of Pop'?",
    options: ["Prince", "Michael Jackson", "Elvis Presley", "Stevie Wonder"],
    correctIndex: 1
  },
  {
    question: "Which iconic band sang 'Bohemian Rhapsody'?",
    options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"],
    correctIndex: 2
  },
  {
    question: "What is the primary color used in the official Ticketmaster brand logo?",
    options: ["Emerald Green", "Royal Purple", "Electric Blue", "Ruby Red"],
    correctIndex: 2
  }
];

export default function App() {
  // --- STATE ---
  const [currentStep, setCurrentStep] = useState<'landing' | 'preferences' | 'challenges' | 'generating' | 'completed'>('landing');
  const [activeChallengeStep, setActiveChallengeStep] = useState<number>(1); // 1: Trivia, 2: Reward Wheel, 3: Slide Verify
  
  // Custom states
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('concerts');
  
  // Notification States
  const [notifName, setNotifName] = useState('Violet G.');
  const [notifAmount, setNotifAmount] = useState(850);
  const [notifVisible, setNotifVisible] = useState(true);

  // Trivia Quiz States
  const [triviaIdx, setTriviaIdx] = useState(0);
  const [selectedTriviaAns, setSelectedTriviaAns] = useState<number | null>(null);
  const [triviaCompleted, setTriviaCompleted] = useState(false);

  // Reward Wheel States
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [wheelCompleted, setWheelCompleted] = useState(false);

  // Drag Slider Human Verification States
  const [sliderVal, setSliderVal] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Generator Loading States
  const [generatorLogs, setGeneratorLogs] = useState<string[]>([]);
  const [generatorProgress, setGeneratorProgress] = useState(0);

  // Coupon Result States
  const [finalAmount, setFinalAmount] = useState(850);
  const [claimCode, setClaimCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; size: number; color: string; delay: number }[]>([]);

  // Timer simulation for count
  const [usersClaimedToday, setUsersClaimedToday] = useState(634);

  // Notification interval
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifVisible(false);
      setTimeout(() => {
        // Change text
        const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
        const randomAmount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
        setNotifName(randomName);
        setNotifAmount(randomAmount);
        setNotifVisible(true);
        // Slightly increase the claim count simulated globally
        setUsersClaimedToday(prev => prev + Math.floor(Math.random() * 3) + 1);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Set up random variables upon complete
  const generateCouponCode = (category: string, amount: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = `TM-${category.substring(0, 3).toUpperCase()}-${amount}-`;
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Triggering local confetti simulation in canvas/layout
  const startConfetti = () => {
    const colors = ['#00a2e8', '#26d07c', '#ff5858', '#ffc107', '#a058ff', '#ff58d2'];
    const tempConfetti = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * -60 - 10, // above screen
      size: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3
    }));
    setConfetti(tempConfetti);
  };

  // Slide slider check
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderVal(val);
    if (val >= 95 && !verificationSuccess) {
      setSliderVal(100);
      setVerificationSuccess(true);
      // Automatically proceed to finish button or auto unlock after 800ms
      setTimeout(() => {
        setGeneratorLogs(["Initializing direct coupon channel...", "Connecting to verification gateways..."]);
        // Trigger coupon generation sequence
        setCurrentStep('generating');
        runGeneratorSequence();
      }, 8000);
    }
  };

  // Run generation logs and progress
  const runGeneratorSequence = () => {
    let progress = 0;
    const logs = [
      "Securing sandbox tunnel link...",
      "Validating attendee email integrity...",
      `Routing tailored package: ${selectedCategory.toUpperCase()} Voucher...`,
      `Applying Spin Bonus offset value (+$${bonusAmount})...`,
      "Synthesizing customized virtual barcode standard...",
      "Assigning exclusive database signature index...",
      "Injecting VIP priority event credits...",
      "Finalizing dynamic security key token...",
      "Voucher fully compiled & ready for delivery!"
    ];

    setGeneratorProgress(0);
    setGeneratorLogs([logs[0]]);

    const logTimer = setInterval(() => {
      const idx = Math.min(Math.floor(progress / 11), logs.length - 1);
      setGeneratorLogs(prev => {
        if (!prev.includes(logs[idx])) {
          return [...prev, logs[idx]];
        }
        return prev;
      });
    }, 450);

    const progressTimer = setInterval(() => {
      progress += 2;
      setGeneratorProgress(progress);
      if (progress >= 100) {
        clearInterval(progressTimer);
        clearInterval(logTimer);
        
        // Final values
        const randomBase = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
        const total = Math.min(1000, randomBase + bonusAmount);
        setFinalAmount(total);
        setClaimCode(generateCouponCode(selectedCategory, total));
        setCurrentStep('completed');
        startConfetti();
      }
    }, 90);
  };

  // Submit email
  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMail = email.trim();
    if (!cleanMail) {
      setEmailError('Please enter your email to proceed.');
      return;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(cleanMail)) {
      setEmailError('Please provide a valid format (e.g. name@example.com)');
      return;
    }
    setEmailError('');
    // Random trivia select
    setTriviaIdx(Math.floor(Math.random() * TRIVIA_QUESTIONS.length));
    setSelectedTriviaAns(null);
    setCurrentStep('challenges');
  };

  // Handling trivia quiz click
  const handleTriviaOptionClick = (idx: number) => {
    if (selectedTriviaAns !== null) return; // ignore multiple taps
    setSelectedTriviaAns(idx);
    const correct = idx === TRIVIA_QUESTIONS[triviaIdx].correctIndex;
    setTimeout(() => {
      setTriviaCompleted(true);
      // Auto move to wheel step
      setTimeout(() => {
        setActiveChallengeStep(2);
      }, 1200);
    }, 1000);
  };

  // Spin Wheel function
  const handleSpinWheel = () => {
    if (wheelSpinning || wheelCompleted) return;
    setWheelSpinning(true);
    
    // Choose output: $50, $100, $150, $200 extra coupon upgrades
    const options = [50, 100, 150, 200];
    const chosenIndex = Math.floor(Math.random() * options.length);
    const chosenBonus = options[chosenIndex];
    setBonusAmount(chosenBonus);

    // Dynamic rotation angle degrees: 4 full turns (1440 deg) + angle offset
    const angleOffset = 360 - (chosenIndex * (360 / options.length)) - 45; 
    const finalRot = 1440 + angleOffset;
    setWheelRotation(finalRot);

    setTimeout(() => {
      setWheelSpinning(false);
      setWheelCompleted(true);
      setTimeout(() => {
        setActiveChallengeStep(3);
      }, 2000);
    }, 4500);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(claimCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Full reset play tool
  const resetAll = () => {
    setCurrentStep('landing');
    setActiveChallengeStep(1);
    setEmail('');
    setEmailError('');
    setSelectedTriviaAns(null);
    setTriviaCompleted(false);
    setWheelCompleted(false);
    setWheelRotation(0);
    setBonusAmount(0);
    setSliderVal(0);
    setVerificationSuccess(false);
    setGeneratorLogs([]);
    setGeneratorProgress(0);
    setCopied(false);
    setConfetti([]);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden antialiased py-6 px-4 md:py-10">
      
      {/* Background ambient accents */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[50%] rounded-full bg-[#00a2e8]/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] rounded-full bg-blue-400/8 blur-[110px] pointer-events-none" />

      {/* Confetti simulation when earned */}
      {currentStep === 'completed' && confetti.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="absolute rounded-sm animate-fall"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.size}px`,
                height: `${c.size * 0.4}px`,
                backgroundColor: c.color,
                opacity: 0.9,
                animation: `fall 4.5s linear infinite`,
                animationDelay: `${c.delay}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full z-10">
        
        {/* Dynamic Notification Pill */}
        <div className="mb-6 h-[44px]">
          <div 
            id="notif"
            className={`flex items-center gap-2 bg-white border border-blue-100 rounded-full px-5 py-2.5 shadow-sm text-sm font-semibold text-slate-800 transition-all duration-500 transform ${
              notifVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}
          >
            <span className="flex items-center justify-center bg-amber-400 text-[10px] font-black text-slate-900 rounded px-1.5 py-0.5 tracking-tight">TM</span>
            <span>{notifName} just claimed a <span className="text-[#00a2e8] font-black">${notifAmount}</span> coupon</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>
        </div>

        {/* Branding Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black italic tracking-tighter text-[#00a2e8] select-none">
            ticketmaster<span className="text-sm font-bold align-super italic select-none">®</span>
          </h1>
        </div>

        {/* Main interactive workflow Card Container */}
        <div className="w-full bg-[#dff0fa] rounded-[32px] p-6 md:p-8 shadow-xl border border-blue-100/60 transition-all duration-300">
          
          {/* STEP: LANDING VIEW */}
          {currentStep === 'landing' && (
            <div className="flex flex-col items-center gap-7">
              {/* Pulse Active User Badge */}
              <div className="flex items-center gap-2 bg-white rounded-full py-1.5 px-5 text-xs md:text-sm font-extrabold text-slate-800 shadow-sm border border-emerald-50">
                <span className="w-2.5 h-2.5 rounded-full bg-[#26d07c] animate-pulse-glow" />
                <span className="tracking-tight text-[#0d2d4a]">{usersClaimedToday}+ Users Claimed Today</span>
              </div>

              {/* Catchy Main Header */}
              <div className="text-center">
                <span className="block text-slate-700 text-lg md:text-xl font-bold tracking-tight">Get up to a</span>
                <span className="block text-3xl md:text-4xl font-extrabold text-[#0d2d4a] leading-none mt-1">
                  <span className="text-[#00a2e8] italic">$1,000</span> Promo Code
                </span>
              </div>

              {/* Linear Graphic Stepper */}
              <div className="w-full space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#00a2e8] flex items-center justify-center font-black text-sm border border-blue-200">
                    01
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Tap "Start promotion" below</h3>
                    <p className="text-xs text-slate-600">Takes less than 1 minute to begin your experience.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#00a2e8] flex items-center justify-center font-black text-sm border border-blue-200">
                    02
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Select Preference & Confirm Email</h3>
                    <p className="text-xs text-slate-600">Align your voucher code to your favorite events.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#00a2e8] flex items-center justify-center font-black text-sm border border-blue-200">
                    03
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Complete 3-4 deals</h3>
                    <p className="text-xs text-slate-600">Complete 3-4 deals to claim your ticket coupon.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#00a2e8] flex items-center justify-center font-black text-sm border border-blue-200">
                    04
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Get Your Unique Code</h3>
                    <p className="text-xs text-slate-600">Instant unlock with a visual claim voucher barcode.</p>
                  </div>
                </div>
              </div>

              {/* High Polished Interactive Button */}
              <a 
                href="https://linkthem.net/?offer_id=1326&aff_id=144361"
                onClick={(e) => {
                  try {
                    if (window.top && window.top !== window) {
                      window.top.location.href = "https://linkthem.net/?offer_id=1326&aff_id=144361";
                      return;
                    }
                  } catch {
                    // cross-origin fallback
                  }
                  window.location.href = "https://linkthem.net/?offer_id=1326&aff_id=144361";
                }}
                className="w-full bg-gradient-to-r from-[#00b8f5] to-[#0091d5] hover:from-[#00c5ff] hover:to-[#009ee8] text-white py-4 px-6 rounded-full font-extrabold text-lg transition-all duration-200 shadow-[0_6px_20px_rgba(0,162,232,0.3)] hover:shadow-[0_8px_24px_rgba(0,162,232,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer no-underline text-center select-none"
              >
                Start promotion
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          )}


          {/* STEP 1: PREFERENCES & VALIDATION */}
          {currentStep === 'preferences' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center bg-white/60 rounded-full px-4 py-2 border border-blue-100/30">
                <span className="text-xs font-black tracking-widest text-[#00a2e8] uppercase">Step 1 of 3</span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#00a2e8]" /> Secure Verification
                </span>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-black text-[#0d2d4a]">Voucher Customizer</h2>
                <p className="text-sm text-slate-600 mt-1">Let's fine-tune the promotion for your exact event taste!</p>
              </div>

              {/* Event genre selection boxes */}
              <div>
                <label className="block text-sm font-extrabold text-[#0d2d4a] mb-2">
                  Select Your Main Preference:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {EVENT_CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex flex-col items-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-white border-[#00a2e8] ring-2 ring-[#00a2e8]/20 shadow-md transform -translate-y-0.5' 
                            : 'bg-white/50 border-blue-100 text-slate-700 hover:bg-white/80'
                        }`}
                      >
                        <span className="text-xl mb-1 text-slate-800">{cat.text}</span>
                        <span className="text-xs font-extrabold tracking-tight block">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email verify section with input validation */}
              <form onSubmit={handleEmailNext} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="emailInput" className="text-sm font-extrabold text-[#0d2d4a] flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#00a2e8]" /> Enter Your Email Address:
                    </label>
                    <span className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded-full border border-blue-50">Confidential</span>
                  </div>
                  <input
                    id="emailInput"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    className={`w-full bg-white rounded-2xl px-4 py-3.5 border text-slate-900 focus:outline-none focus:ring-2 font-semibold text-base transition-all ${
                      emailError 
                        ? 'border-red-400 focus:ring-red-400/20' 
                        : 'border-blue-100 focus:ring-[#00a2e8]/20 focus:border-[#00a2e8]'
                    }`}
                  />
                  {emailError ? (
                    <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs mt-1.5 animate-pulse">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-[#00a2e8] flex-shrink-0" />
                      We send the ready coupon credentials to this register code.
                    </p>
                  )}
                </div>

                {/* Continue button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#00b8f5] to-[#0091d5] hover:from-[#00c5ff] hover:to-[#009ee8] text-white py-4 px-6 rounded-full font-extrabold text-base transition-all duration-200 mt-2 shadow-[0_4px_12px_rgba(0,162,232,0.2)] hover:shadow-[0_6px_18px_rgba(0,162,232,0.3)] cursor-pointer"
                >
                  Verify Details & Complete Unlock
                </button>
              </form>
            </div>
          )}


          {/* STEP 2: GAMIFIED SPONSORED CHALLENGES (WITHOUT REDIRECT LINKS ON DEMAND) */}
          {currentStep === 'challenges' && (
            <div className="flex flex-col gap-6">
              
              {/* Stepper Header indicator */}
              <div className="flex justify-between items-center bg-white/60 rounded-full px-4 py-2 border border-blue-100/30">
                <span className="text-xs font-black tracking-widest text-[#00a2e8] uppercase">Step 2 of 3</span>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Unlock Status: Verified Account
                </span>
              </div>

              {/* Progression of the sub challenges */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((stepNum) => {
                  const isActive = activeChallengeStep === stepNum;
                  const isFinished = activeChallengeStep > stepNum;
                  return (
                    <div key={stepNum} className="flex flex-col gap-1">
                      <div className={`h-2.5 rounded-full transition-all duration-500 ${
                        isFinished ? 'bg-emerald-500' : isActive ? 'bg-[#00a2e8] animate-pulse-glow' : 'bg-slate-200'
                      }`} />
                      <span className={`text-[9px] font-black uppercase text-center tracking-tight ${
                        isActive ? 'text-[#00a2e8]' : isFinished ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {stepNum === 1 ? 'Trivia' : stepNum === 2 ? 'Bonus Wheel' : 'Gate Slide'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Challenge State 1: Special Music Trivia */}
              {activeChallengeStep === 1 && (
                <div className="bg-white rounded-2xl p-4 border border-blue-50 shadow-sm flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-100 text-[#00a2e8] p-1.5 flex items-center justify-center">
                      <Music className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-[#0d2d4a] text-sm">Gate Challenge #1</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ticket trivia match</p>
                    </div>
                  </div>

                  <p className="font-extrabold text-[#0d2d4a] text-base leading-tight">
                    {TRIVIA_QUESTIONS[triviaIdx].question}
                  </p>

                  <div className="flex flex-col gap-2">
                    {TRIVIA_QUESTIONS[triviaIdx].options.map((option, idx) => {
                      const isSelected = selectedTriviaAns === idx;
                      const isCorrect = idx === TRIVIA_QUESTIONS[triviaIdx].correctIndex;
                      
                      let btnStyle = 'border-slate-100 hover:bg-slate-50 text-slate-800';
                      let iconToShow = null;

                      if (selectedTriviaAns !== null) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-extrabold ring-1 ring-emerald-300';
                          iconToShow = <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
                        } else if (isSelected) {
                          btnStyle = 'border-red-300 bg-red-50 text-red-800 font-extrabold ring-1 ring-red-300';
                          iconToShow = <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />;
                        } else {
                          btnStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={selectedTriviaAns !== null}
                          onClick={() => handleTriviaOptionClick(idx)}
                          className={`w-full text-left p-3 rounded-xl border font-bold text-sm transition-all flex justify-between items-center cursor-pointer ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {iconToShow}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTriviaAns !== null && (
                    <p className="text-center text-xs font-bold text-[#00a2e8] animate-pulse">
                      {selectedTriviaAns === TRIVIA_QUESTIONS[triviaIdx].correctIndex 
                        ? "Perfect match! Loading Bonus tier..." 
                        : "Processed selection. Proceeding anyway..."}
                    </p>
                  )}
                </div>
              )}

              {/* Challenge State 2: Spin the Coupon multiplier! */}
              {activeChallengeStep === 2 && (
                <div className="bg-white rounded-2xl p-4 border border-blue-50 shadow-sm flex flex-col items-center gap-4 animate-fade-in">
                  <div className="w-full flex items-center gap-2">
                    <span className="rounded-lg bg-amber-100 text-amber-500 p-1.5 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </span>
                    <div className="text-left">
                      <h3 className="font-extrabold text-[#0d2d4a] text-sm">Upgrade Claim #2</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Spin Coupon Upgrade Wheel</p>
                    </div>
                  </div>

                  <p className="text-center text-xs font-bold text-slate-600">
                    Spin this active wheel to add a dynamic bonus of up to <span className="text-amber-500 font-black">+$200</span> on top of your voucher!
                  </p>

                  {/* Built styled visual spin wheel */}
                  <div className="relative w-44 h-44 my-2 flex items-center justify-center select-none bg-slate-100 rounded-full border-4 border-slate-200 shadow-inner">
                    <div 
                      className="absolute inset-[4px] rounded-full overflow-hidden transition-transform ease-out"
                      style={{ 
                        transform: `rotate(${wheelRotation}deg)`,
                        transitionDuration: wheelSpinning ? '4.5s' : '0s',
                      }}
                    >
                      {/* Grid segments */}
                      <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-[#fff]/40" />

                      {/* Top left Segment: +$50 */}
                      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-[#00a2e8]/90 text-white flex items-center justify-center font-black text-sm origin-bottom-right" style={{ transform: 'rotate(0deg)' }}>
                        <span className="transform -rotate-45 translate-x-2 -translate-y-2 font-black">+$50</span>
                      </div>
                      
                      {/* Top right Segment: +$100 */}
                      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#5bc43a] text-white flex items-center justify-center font-black text-sm origin-bottom-left" style={{ transform: 'rotate(0deg)' }}>
                        <span className="transform rotate-45 -translate-x-2 -translate-y-2 font-black">+$100</span>
                      </div>

                      {/* Bottom Right Segment: +$150 */}
                      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[#f5a623] text-white flex items-center justify-center font-black text-sm origin-top-left" style={{ transform: 'rotate(0deg)' }}>
                        <span className="transform -rotate-45 -translate-x-2 translate-y-2 font-black">+$150</span>
                      </div>

                      {/* Bottom Left Segment: +$200 */}
                      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#e03a9f] text-white flex items-center justify-center font-black text-sm origin-top-right" style={{ transform: 'rotate(0deg)' }}>
                        <span className="transform rotate-45 translate-x-2 translate-y-2 font-black">+$200</span>
                      </div>
                    </div>

                    {/* Wheel Center Pin */}
                    <div className="absolute w-12 h-12 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-lg z-20">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00b8f5] to-blue-600 shadow-inner" />
                    </div>

                    {/* Wheel pointer finger indicator */}
                    <div className="absolute top-[-8px] left-[50%] -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-red-500 z-30 filter drop-shadow-md" />
                  </div>

                  {/* Control actions */}
                  <button
                    type="button"
                    onClick={handleSpinWheel}
                    disabled={wheelSpinning || wheelCompleted}
                    className={`px-6 py-2.5 rounded-full font-black text-xs md:text-sm tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                      wheelSpinning 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                        : wheelCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 hover:-translate-y-0.5 text-slate-900 ring-2 ring-amber-300/30'
                    }`}
                  >
                    {wheelSpinning ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" /> Spinning Upgrade...
                      </>
                    ) : wheelCompleted ? (
                      <>
                        <Check className="w-4 h-4" /> Added +${bonusAmount}!
                      </>
                    ) : (
                      'Spin the Wheel'
                    )}
                  </button>

                  {wheelCompleted && (
                    <div className="p-2 border border-emerald-100 bg-emerald-50/50 rounded-xl w-full text-center animate-pulse">
                      <span className="text-xs font-bold text-emerald-800">
                        Congrats! You guaranteed <span className="font-extrabold text-emerald-600 underline">${bonusAmount} extra credit bonus</span>.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Challenge State 3: Touch-Gate / Slide Verify */}
              {activeChallengeStep === 3 && (
                <div className="bg-white rounded-2xl p-4 border border-blue-50 shadow-sm flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-pink-100 text-pink-500 p-1.5 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-[#0d2d4a] text-sm">Gate Challenge #3</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Slide to bypass bot gate</p>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-600 leading-normal">
                    This simulated deal validation mimics physical entry. To prevent bots from mass claiming codes, drag the Ticket slider completely to the right edge.
                  </p>

                  <div className="relative mt-4">
                    {/* Track */}
                    <div className="w-full h-14 bg-slate-100 rounded-full border border-slate-200/80 flex items-center px-2 select-none">
                      <span className="absolute inset-x-0 text-center font-extrabold text-xs text-slate-400 tracking-wider pointer-events-none uppercase">
                        {verificationSuccess ? '✅ verified human! loading...' : '👉 Slide Coupon to Verify'}
                      </span>
                      
                      {/* Complete background fill indicator */}
                      <div 
                        className="h-10 rounded-full bg-gradient-to-r from-emerald-400/20 to-[#00a2e8]/20 transition-all duration-300 pointer-events-none"
                        style={{ width: `${Math.max(12, sliderVal)}%` }}
                      />
                    </div>

                    {/* Virtual Slide Input Range */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderVal}
                      disabled={verificationSuccess}
                      onChange={handleSliderChange}
                      className="absolute inset-y-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {/* Custom Visual Slider thumb (imitates standard slide key) */}
                    <div 
                      className={`absolute top-2 w-10 h-10 rounded-full shadow-md flex items-center justify-center border transition-all duration-150 pointer-events-none ${
                        verificationSuccess 
                          ? 'bg-emerald-500 border-emerald-400 text-white' 
                          : 'bg-white border-blue-100 text-[#00a2e8]'
                      }`}
                      style={{ 
                        left: `calc(${sliderVal}% - (${sliderVal} * 0.4px))`, 
                        marginLeft: sliderVal > 90 ? '-42px' : '4px' 
                      }}
                    >
                      {verificationSuccess ? <CheckCircle className="w-5 h-5 animate-scale-glow" /> : <Ticket className="w-5 h-5" />}
                    </div>
                  </div>

                  {verificationSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 mt-2 animate-bounce">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                      <p className="text-xs font-extrabold text-emerald-800 leading-tight">
                        Perfect! Handshake code synthesized. Launching secure coupon compilation...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Secure note */}
              <div className="flex items-center gap-2 justify-center text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Simulated Sandbox bypass. No surveys, no malware, no redirects.</span>
              </div>
            </div>
          )}


          {/* STEP 3: LOGGING GENERATOR PROGRESS SCREEN */}
          {currentStep === 'generating' && (
            <div className="flex flex-col gap-6 py-4">
              <div className="text-center">
                <div className="inline-flex relative mb-4">
                  {/* Rotating Ring */}
                  <span className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-[#00a2e8] animate-spin" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#00a2e8] animate-pulse" />
                  </span>
                </div>
                <h2 className="text-xl font-black text-[#0d2d4a]">Synthesizing Coupon</h2>
                <p className="text-xs text-slate-600 mt-1">Generating high-fidelity Ticketmaster registry codes...</p>
              </div>

              {/* Visual dynamic progress bar */}
              <div className="w-full">
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-700 mb-2">
                  <span>Compilation Status</span>
                  <span>{generatorProgress}%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-blue-100 p-0.5 shadow-inner">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#00a2e8] to-[#0d2d4a] transition-all duration-100"
                    style={{ width: `${generatorProgress}%` }}
                  />
                </div>
              </div>

              {/* Status Command Log Monitor */}
              <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 border border-slate-800 shadow-lg min-h-[120px] max-h-[140px] overflow-y-auto w-full select-none">
                <span className="text-slate-500 block mb-1">SYSTEM INSTANCE SECURE PROMPT LOG:</span>
                {generatorLogs.map((log, index) => (
                  <div key={index} className="flex gap-1 items-start text-emerald-400">
                    <span className="text-slate-500 font-bold select-none">&gt;&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
                {generatorLogs.length > 0 && <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-1" />}
              </div>
            </div>
          )}


          {/* STEP 4: CELEBRATION COMPLETE VIRTUAL TICKET COUPON */}
          {currentStep === 'completed' && (
            <div className="flex flex-col gap-6 animate-fade-in relative z-20">
              
              <div className="text-center">
                <div className="inline-flex bg-emerald-100 text-emerald-600 rounded-full p-2 mb-2 animate-bounce">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-2xl font-black text-[#0d2d4a]">Claim Earned Successfully!</h2>
                <p className="text-xs text-slate-600 mt-1">Custom barcode fully linked to your verification profile.</p>
              </div>

              {/* The high-fidelity ticket component */}
              <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-slate-100 shadow-md">
                
                {/* Simulated punch hole edges on left & right sides */}
                <span className="absolute left-[-10px] top-[54%] -translate-y-1/2 w-5 h-5 rounded-full bg-[#dff0fa] z-10 border-r border-slate-100" />
                <span className="absolute right-[-10px] top-[54%] -translate-y-1/2 w-5 h-5 rounded-full bg-[#dff0fa] z-10 border-l border-slate-100" />

                {/* Ticket Top - Premium Blue Header */}
                <div className="bg-gradient-to-r from-[#0d2d4a] to-[#00a2e8] text-white p-4 text-center select-none">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm mb-1.5">
                    Exclusive Promo Ticket
                  </span>
                  <h3 className="font-extrabold text-2xl tracking-tighter italic">ticketmaster</h3>
                </div>

                {/* Ticket Body */}
                <div className="p-5 flex flex-col items-center gap-4">
                  {/* Voucher Total */}
                  <div className="text-center">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">Coupon Face Value</span>
                    <span className="text-4xl md:text-5xl font-black tracking-tighter text-[#00a2e8] italic block my-1">
                      ${finalAmount} USD
                    </span>
                    <span className="text-xs text-emerald-600 font-extrabold flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Activated & Verified
                    </span>
                  </div>

                  {/* Config settings line */}
                  <div className="w-full grid grid-cols-2 gap-4 border-t border-b border-dashed border-slate-200 py-3 text-left">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Preference Category</span>
                      <span className="text-xs font-black text-slate-800 capitalize">
                        {selectedCategory}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Claimed Registered Email</span>
                      <span className="text-xs font-black text-slate-800 truncate block max-w-[130px]" title={email}>
                        {email || "unknown@domain.com"}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Coupon Code Display */}
                  <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col gap-1.5 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROMO COMPILATION CODE:</span>
                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100">
                      <span className="font-mono text-xs md:text-sm font-bold text-slate-800 tracking-wide select-all">
                        {claimCode || "TM-VOUCHER-ERROR"}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-2 rounded-lg bg-[#00a2e8] hover:bg-[#0091d5] text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-[10px] text-emerald-600 font-black animate-pulse text-center">
                        ✔ Code successfully copied to clipboard!
                      </p>
                    )}
                  </div>

                  {/* Pseudo Barcode Graphics */}
                  <div className="w-full flex flex-col items-center gap-1.5 select-none opacity-80">
                    <div className="h-12 w-full max-w-[180px] bg-slate-100 rounded p-1.5 flex justify-between items-stretch">
                      {Array.from({ length: 44 }).map((_, idx) => {
                        const randomWidth = [1, 2, 3, 4][(idx * 7) % 4] + 'px';
                        const isEmpty = idx % 5 === 0 || idx % 9 === 0;
                        return (
                          <span 
                            key={idx} 
                            className="bg-slate-900 shrink-0" 
                            style={{ 
                              width: randomWidth, 
                              opacity: isEmpty ? 0 : 1 
                            }} 
                          />
                        );
                      })}
                    </div>
                    <span className="font-mono text-[9px] text-slate-400 font-extrabold tracking-widest">
                      * 2026 PROMO GATE REGISTRY *
                    </span>
                  </div>

                </div>

                {/* Expiry Reminder footer inside the ticket */}
                <div className="bg-amber-50 border-t border-amber-100/50 p-2 text-center text-amber-800 text-[11px] font-bold flex items-center justify-center gap-1 select-none">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  Promo terms: Must be loaded within 48 Hours. No physical transfer.
                </div>
              </div>

              {/* Start Over Button to test promo demo values */}
              <button
                type="button"
                onClick={resetAll}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 py-3.5 px-6 rounded-full font-bold text-sm tracking-tight transition-all duration-200 border border-slate-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#00a2e8]" /> Reset Experience & Earn Again
              </button>
            </div>
          )}

        </div>

        {/* Disclaimer notes underneath matching the styling */}
        <p className="mt-5 text-center text-[12px] font-bold text-slate-500 leading-normal max-w-xs select-none">
          Complete the required deals as instructed to receive and redeem your promotional coupon.
        </p>

      </main>


    </div>
  );
}
