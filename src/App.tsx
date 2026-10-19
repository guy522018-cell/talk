/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Smartphone,
  PieChart,
  FlaskConical,
  Sliders,
  PenSquare,
  Flame,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  RotateCw,
  ListChecks,
  Users,
  Search,
  Handshake,
  PhoneOff,
  Mic,
  MicOff,
  Bookmark,
  BookOpen,
  Star,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  Gem,
  ShieldCheck,
  Target,
  BarChart3,
  Share2,
  Receipt,
  Coins,
  ChevronRight,
  X,
  Volume2,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';

interface TopicItem {
  category: string;
  question: string;
  korean: string;
  keywords?: string[];
}

interface ScenarioItem {
  prompt: string;
  tip: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'app-demo' | 'lean-canvas' | 'jtbd-validation'>('app-demo');

  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: '김취준',
    targetLang: '영어 (TOEIC / OPIc)',
    level: '중급 (기본 소통 가능)',
    targetJob: 'IT/소프트웨어 개발',
    mode: '1:1 실전 면접 (20분)'
  });

  // User Statistics
  const [userStats, setUserStats] = useState({
    weeklySessions: 4,
    totalMinutes: 140,
    savedPhrases: 18,
    confidenceScore: 78
  });

  // Saved Vault Expressions
  const [vaultPhrases, setVaultPhrases] = useState([
    {
      phrase: 'Demonstrate leadership under pressure',
      korean: '압박 상황에서 리더십을 발휘하다',
      tag: '면접용',
      tagColor: 'bg-blue-100 text-blue-700'
    },
    {
      phrase: 'Cross-functional collaboration',
      korean: '부서 간 협업 / 타 부서와의 프로젝트 진행',
      tag: '직무용',
      tagColor: 'bg-purple-100 text-purple-700'
    },
    {
      phrase: 'Synthesize complex user feedback',
      korean: '복잡한 사용자 피드백을 종합 분석하다',
      tag: 'IT/기획',
      tagColor: 'bg-emerald-100 text-emerald-700'
    }
  ]);

  // Session State
  const [sessionState, setSessionState] = useState<'idle' | 'searching' | 'active' | 'review'>('idle');
  const [sessionTimer, setSessionTimer] = useState<number>(900); // 15 mins (900 seconds)
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [newPhraseInput, setNewPhraseInput] = useState<string>('');
  const [sessionPhrases, setSessionPhrases] = useState<string[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active Partner Data
  const activePartner = {
    name: '이글로벌',
    avatar: '이',
    targetLang: '영어 (OPIc IH 목표)',
    school: 'S대 4학년',
    targetJob: '해외영업 / PM'
  };

  const partnerSpeechPrompt = '"My strength is structured problem-solving when handling tight deadlines..."';

  // Topic & Scenario Data
  const [activeTopic, setActiveTopic] = useState<TopicItem>({
    category: '직무 역량 면접',
    question: 'Tell me about a time you solved a difficult technical problem in a team project.',
    korean: '팀 프로젝트 중 기술적 어려움을 극복한 경험을 STAR 기법으로 설명해보세요.',
    keywords: ['STAR기법', '문제해결', '협업']
  });

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const scenarios: ScenarioItem[] = [
    {
      prompt: 'Q1: "How do you handle disagreement with a team member during a project?"',
      tip: '상대방의 의견 수용 -> 내 논리적 근거 제시 -> 데이터 기반 합의점 도출 순서로 설명하세요.'
    },
    {
      prompt: 'Q2: "What is your biggest strength when working under a tight deadline?"',
      tip: '우선순위 설정(Prioritization)과 팀 커뮤니케이션 능력을 예시와 함께 말하세요.'
    },
    {
      prompt: 'Q3: "Why do you want to work at our company specifically?"',
      tip: '기업의 최근 비전/제품과 나의 커리어 목표 연결점을 명확히 말하세요.'
    }
  ];

  const currentScenario = scenarios[currentScenarioIndex];

  // Full Topic Library
  const topicList: TopicItem[] = [
    { category: '직무 역량', question: 'Describe a project you are most proud of.', korean: '가장 자랑스러운 프로젝트에 대해 설명해 주세요.' },
    { category: '자기소개', question: 'Walk me through your resume in 1 minute.', korean: '1분 동안 이력서를 바탕으로 자기소개를 해보세요.' },
    { category: '위기 극복', question: 'How did you deal with a major mistake you made at work/school?', korean: '치명적인 실수를 했을 때 어떻게 대처했나요?' },
    { category: '비즈니스 회화', question: 'How would you draft an email to a client requesting a deadline extension?', korean: '마감 연장을 요청하는 비즈니스 이메일을 작성한다면?' },
    { category: '기술 질문', question: 'How do you optimize app performance and manage technical debt?', korean: '앱 성능 최적화와 기술 부채 관리를 어떻게 진행하나요?' },
    { category: '조직 문화', question: 'What kind of leadership style motivates you to perform best?', korean: '어떤 리더십 스타일 아래에서 가장 큰 동기부여를 받나요?' },
    { category: '일본어 면접', question: '志望動機と、入社後に挑戦したいことについて教えてください。', korean: '지원 동기와 입사 후 도전하고 싶은 일을 말해주세요.' },
    { category: '중국어 면접', question: '请简单介绍一下您在团队合作中的优势。', korean: '팀 협력에서 본인의 강점에 대해 설명해 주세요.' }
  ];

  // Modals & Toast State
  const [modals, setModals] = useState({
    topicList: false,
    editProfile: false
  });

  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: ''
  });

  // JTBD Checkboxes
  const [interviewChecks, setInterviewChecks] = useState([true, true, true]);
  const [protoChecks, setProtoChecks] = useState([false, false, false]);

  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  // Timer Lifecycle
  useEffect(() => {
    if (sessionState === 'active') {
      timerIntervalRef.current = setInterval(() => {
        setSessionTimer(prev => {
          if (prev <= 1) {
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startMatching = () => {
    setSessionState('searching');
    setTimeout(() => {
      setSessionState('active');
      setSessionTimer(900);
      showToast('취업 회화 파트너와 성공적으로 연결되었습니다!');
    }, 2000);
  };

  const endSession = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setSessionState('review');
    setUserStats(prev => ({
      ...prev,
      weeklySessions: Math.min(5, prev.weeklySessions + 1),
      totalMinutes: prev.totalMinutes + 15
    }));
    showToast('20분 실전 세션이 종료되었습니다. 복습 기록을 확인하세요.');
  };

  const resetSession = () => {
    setSessionState('idle');
  };

  const toggleMic = () => {
    setIsMuted(prev => !prev);
    showToast(!isMuted ? '마이크가 음소거되었습니다.' : '마이크가 켜졌습니다.');
  };

  const addPhrase = () => {
    if (!newPhraseInput.trim()) return;
    const text = newPhraseInput.trim();
    setSessionPhrases(prev => [...prev, text]);
    setUserStats(prev => ({ ...prev, savedPhrases: prev.savedPhrases + 1 }));
    setVaultPhrases(prev => [
      {
        phrase: text,
        korean: '실전 세션 중 기록된 표현',
        tag: '세션 메모',
        tagColor: 'bg-amber-100 text-amber-800'
      },
      ...prev
    ]);
    setNewPhraseInput('');
    showToast('복습 노트에 표현이 저장되었습니다!');
  };

  const nextScenarioCard = () => {
    setCurrentScenarioIndex(prev => (prev + 1) % scenarios.length);
    showToast('다음 대화 미션 카드로 변경되었습니다.');
  };

  const refreshTopic = () => {
    const randomIndex = Math.floor(Math.random() * topicList.length);
    setActiveTopic({
      ...topicList[randomIndex],
      keywords: ['면접실전', '핵심표현', '취준특화']
    });
    showToast('새로운 추천 회화 주제가 적용되었습니다.');
  };

  const selectTopic = (topic: TopicItem) => {
    setActiveTopic({
      ...topic,
      keywords: ['선택주제', '실전연습']
    });
    setModals(prev => ({ ...prev, topicList: false }));
    showToast('선택한 주제가 메인 화면에 설정되었습니다.');
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      showToast('원어민 음성을 재생합니다.');
    } else {
      showToast('사용 중인 브라우저가 음성 합성을 지원하지 않습니다.');
    }
  };

  const exportLeanCanvasSummary = () => {
    const text = `[언어교류를 통한 취업 준비형 실전 회화 - 린 캔버스 요약]

1. 문제 (Problem):
- 어학 시험 점수(TOEIC/OPIc)와 실제 회화 연습의 분리
- 취업 면접/업무 상황에서 말할 기회 부족 및 울렁증
- 회화 학원/과외는 비용 부담, 일반 언어교환은 취업 목적 불일치

2. 고객군 (Customer Segments):
- 취업을 준비하는 20대 대학생 및 취업준비생
- 얼리어답터: 글로벌 기업/해외취업 준비생, 어학 점수는 있으나 회화가 부족한 취준생

3. 고유 가치 제안 (Unique Value Proposition):
- "취업 준비를 하면서, 점수 공부와 실제 말하기를 한 번에."
- 단순 친목이 아닌 취업·직무 중심 1:1 파트너 매칭과 정해진 면접 카드 제공

4. 솔루션 (Solution):
- 언어·수준·목표 직무 기반 맞춤 1:1 회화 매칭
- 면접/자기소개/직무 극복 시나리오 대화 카드 제공
- 세션 후 막힌 표현 기록 및 자동 복습 노트 파우치

5. 채널 (Channels):
- 대학 취업지원센터 및 대학생 커뮤니티(에브리타임) 제휴
- 취업·어학 인스타그램/릴스 쇼츠 콘텐츠
- 대학 취업/어학 동아리 공식 서포터즈 및 추천인 혜택

6. 수익원 (Revenue Streams):
- B2C 프리미엄 구독 (정교한 직무 매칭, 무제한 면접집, AI 피드백)
- B2B/B2G 대학 취업지원처 및 지자체 청년센터 단체 라이선스

7. 비용 구조 (Cost Structure):
- 웹/앱 서비스 인프라 및 WebRTC/서버 호스팅비
- 직무별 실전 회화 콘텐츠 및 문항 라이브러리 제작비
- 안전한 매칭 및 신고/클린 센터 운영비, 초기 마케팅비

8. 핵심 지표 (Key Metrics):
- 주간 회화 완료 횟수 (주 5회 목표 달성률)
- 매칭 후 15분 대화 완주 전환율
- 4주 재방문율 (Cohort Retention)
- 프리미엄 구독 전환율

9. 경쟁 우위 (Unfair Advantage):
- 대학 취업지원 조직 및 취업 동아리 공식 파트너십 네트워크
- 실제 기업 기출 직무·면접 회화 데이터베이스 및 매칭 이력 자산`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('린 캔버스 요약본이 클립보드에 복사되었습니다!');
    }).catch(() => {
      showToast('클립보드 복사 권한을 확인해주세요.');
    });
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Logo & Pitch Tag */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setCurrentTab('app-demo')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-200">
                    CareerTalk
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium border border-blue-400/30">
                    취준 회화 링커
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  "어학 점수 공부와 실제 취업 말하기를 한 번에"
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setCurrentTab('app-demo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                  currentTab === 'app-demo'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>서비스 MVP 체험</span>
              </button>
              <button
                onClick={() => setCurrentTab('lean-canvas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                  currentTab === 'lean-canvas'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>린 캔버스 뷰</span>
              </button>
              <button
                onClick={() => setCurrentTab('jtbd-validation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                  currentTab === 'jtbd-validation'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>JTBD / 가설 검증</span>
              </button>
            </div>

            {/* User Profile Quick Info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-200">{userProfile.name}</div>
                <div className="text-[11px] text-blue-400 font-mono">
                  {userProfile.targetLang.split(' ')[0]} · {userProfile.targetJob}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white border border-blue-400/40 shadow">
                김
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ========================================== */}
        {/* TAB 1: SERVICE MVP DEMO (App Simulation)   */}
        {/* ========================================== */}
        {currentTab === 'app-demo' && (
          <div className="space-y-6">
            {/* Pitch Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
                <Award className="w-64 h-64 text-white" />
              </div>
              <div className="max-w-2xl relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-blue-500/25 text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  20대 취준생 특화 언어 교류 매칭 플랫폼
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  취업용 외국어, 혼자 책으로만 외우지 마세요!
                </h1>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                  실제 글로벌 기업 면접 질문과 직무 상황 극복 대화를 같은 목표를 가진 또래 파트너와 1:1로 매일 20분씩 연습하세요.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    목표 언어 & 직무 매칭
                  </span>
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    실전 면접 질문 카드 제공
                  </span>
                  <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    세션 후 복습 노트 기록 & 발음 청취
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Top Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile & Match Setup Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      내 회화 매칭 조건
                    </h3>
                    <button
                      onClick={() => setModals(prev => ({ ...prev, editProfile: true }))}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg transition"
                    >
                      <PenSquare className="w-3.5 h-3.5" />
                      수정
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-xs">목표 어학</span>
                      <span className="font-bold text-slate-800 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs">
                        {userProfile.targetLang}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-xs">현재 회화 수준</span>
                      <span className="font-medium text-slate-800 text-xs">{userProfile.level}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-xs">희망 직무/목표</span>
                      <span className="font-bold text-slate-800 text-xs">{userProfile.targetJob}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500 text-xs">오늘의 연습 모드</span>
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
                        {userProfile.mode}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startMatching}
                  disabled={sessionState === 'searching' || sessionState === 'active'}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>지금 실공부 매칭 시작하기</span>
                </button>
              </div>

              {/* Stats & Weekly Streak Tracker */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      이번 주 회화 행동 지표
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      4주차 재방문 유지 중
                    </span>
                  </div>

                  {/* Mini KPI Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">주간 세션 완료</div>
                      <div className="text-xl font-extrabold text-blue-600">
                        {userStats.weeklySessions} <span className="text-sm font-normal text-slate-500">/ 5회</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">누적 대화 시간</div>
                      <div className="text-xl font-extrabold text-indigo-600">{userStats.totalMinutes}분</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">저장한 복습 표현</div>
                      <div className="text-xl font-extrabold text-emerald-600">{userStats.savedPhrases}개</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">자신감 지수</div>
                      <div className="text-xl font-extrabold text-amber-500">{userStats.confidenceScore}%</div>
                    </div>
                  </div>

                  {/* Weekly Streak Days */}
                  <div className="text-xs font-semibold text-slate-500 mb-2">이번 주 연속 말하기 잔디</div>
                  <div className="flex justify-between items-center gap-1.5">
                    {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
                      <div key={idx} className="flex-1 text-center">
                        <div
                          className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs mb-1 transition-all ${
                            idx < userStats.weeklySessions
                              ? 'bg-blue-600 text-white font-bold shadow-sm'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {idx < userStats.weeklySessions && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[11px] text-slate-400">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <span>핵심 지표: 주간 회화 완료율 달성 중</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    상위 15%
                  </span>
                </div>
              </div>

              {/* Recommended Topic Prompts */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      오늘의 추천 취업 회화 주제
                    </h3>
                    <button
                      onClick={refreshTopic}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      새 주제
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    시험 점수 공부에서 끝내지 않고 바로 입으로 뱉어보는 실전 질문입니다.
                  </p>

                  {/* Active Topic Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-xl mb-3 shadow relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold uppercase">
                        {activeTopic.category}
                      </span>
                      <button
                        onClick={() => playTTS(activeTopic.question)}
                        title="원어민 발음 듣기"
                        className="text-slate-300 hover:text-white bg-slate-800/80 p-1.5 rounded-md hover:bg-slate-700 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-300" />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm mt-2 text-slate-100 leading-snug">
                      "{activeTopic.question}"
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 italic leading-relaxed">
                      해설: {activeTopic.korean}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-blue-300 flex flex-wrap gap-1.5">
                      {activeTopic.keywords?.map((keyword, kIdx) => (
                        <span key={kIdx} className="bg-slate-800/90 px-2 py-0.5 rounded text-[10px]">
                          # {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setModals(prev => ({ ...prev, topicList: true }))}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>상황별 회화 주제 전체보기 ({topicList.length}개)</span>
                </button>
              </div>
            </div>

            {/* Interactive Section: Active Partner Match Simulator & Practice Room */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="font-bold text-sm tracking-wide">
                    1:1 취업 회화 매칭 & 실전 대화 시뮬레이터
                  </h3>
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  학원 비용 부담 없는 20대 목적형 네트워크
                </span>
              </div>

              <div className="p-6">
                {/* State A: Idle State */}
                {sessionState === 'idle' && (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                      동일한 취업 목표를 가진 언어 파트너 찾기
                    </h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                      단순 친목이 아닙니다. 해외취업/글로벌 대기업을 목표로 영어·일본어·중국어를 실전 연습할 취준생과 즉시 연결됩니다.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={startMatching}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 text-sm transition flex items-center space-x-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>파트너 탐색 및 1:1 세션 입장</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* State B: Searching State */}
                {sessionState === 'searching' && (
                  <div className="text-center py-12">
                    <div className="inline-block relative mb-4">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <Handshake className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">매칭 알고리즘 가동 중...</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      조건: {userProfile.targetLang} | 직무: {userProfile.targetJob} | 수준: {userProfile.level}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold mt-3 animate-pulse">
                      취업 회화 데이터베이스에서 최적의 파트너를 찾고 있습니다.
                    </p>
                  </div>
                )}

                {/* State C: Live Practice Room Simulation */}
                {sessionState === 'active' && (
                  <div className="space-y-6">
                    {/* Match Partner Bar */}
                    <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow">
                          <span>{activePartner.avatar}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-900">{activePartner.name}</h4>
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {activePartner.targetLang}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            목표: {activePartner.school} · {activePartner.targetJob} 지원 예정
                          </p>
                        </div>
                      </div>

                      {/* Live Session Timer & Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-center shadow-sm">
                          <span className="text-[10px] text-slate-400 block font-semibold flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" /> 남은 대화 시간
                          </span>
                          <span className="font-mono font-bold text-indigo-600 text-sm">
                            {formatTime(sessionTimer)}
                          </span>
                        </div>
                        <button
                          onClick={endSession}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center space-x-1"
                        >
                          <PhoneOff className="w-3.5 h-3.5" />
                          <span>세션 종료 & 기록하기</span>
                        </button>
                      </div>
                    </div>

                    {/* Video Call / Speech Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Simulated Partner Screen */}
                      <div className="bg-slate-900 rounded-xl aspect-video relative flex flex-col justify-between p-4 overflow-hidden border border-slate-800 shadow">
                        <div className="flex justify-between items-center text-xs text-white/80 z-10">
                          <span className="bg-black/50 backdrop-blur px-2.5 py-1 rounded-md">
                            {activePartner.name} (상대방)
                          </span>
                          <span className="text-emerald-400 flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            음성 연결됨
                          </span>
                        </div>

                        <div className="text-center z-10 my-auto">
                          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-3xl text-white mb-2 shadow-inner">
                            <Users className="w-10 h-10 text-indigo-300" />
                          </div>
                          <p className="text-xs text-slate-200 italic max-w-sm mx-auto bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                            {partnerSpeechPrompt}
                          </p>
                          <button
                            onClick={() => playTTS(partnerSpeechPrompt)}
                            className="mt-2 text-[11px] text-indigo-300 hover:text-white bg-indigo-900/40 px-2 py-0.5 rounded inline-flex items-center gap-1 transition"
                          >
                            <Volume2 className="w-3 h-3" /> 파트너 답변 음성 듣기
                          </button>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-400 z-10">
                          <span>상황: 영어 직무 면접 연습</span>
                          <span className="text-blue-300">발화 비율: 52%</span>
                        </div>
                      </div>

                      {/* My Video Screen & Scratchpad */}
                      <div className="bg-slate-800 rounded-xl aspect-video relative flex flex-col justify-between p-4 border border-slate-700 shadow">
                        <div className="flex justify-between items-center text-xs text-white/80 z-10">
                          <span className="bg-black/50 backdrop-blur px-2.5 py-1 rounded-md">
                            나 ({userProfile.name})
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={toggleMic}
                              className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs transition ${
                                isMuted ? 'bg-red-500' : 'bg-slate-700 hover:bg-slate-600'
                              }`}
                              title={isMuted ? '마이크 켜기' : '마이크 끄기'}
                            >
                              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* In-Session Expression Logger */}
                        <div className="bg-slate-900/90 rounded-xl p-3 text-xs z-10 my-auto border border-slate-700 max-w-md w-full mx-auto">
                          <div className="flex justify-between items-center mb-1.5 text-slate-300 font-semibold">
                            <span className="flex items-center gap-1">
                              <PenSquare className="w-3.5 h-3.5 text-amber-400" />
                              대화 중 막힌 표현 메모
                            </span>
                            <span className="text-[10px] text-slate-400">세션 후 자동 저장</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newPhraseInput}
                              onChange={e => setNewPhraseInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && addPhrase()}
                              placeholder="예: ~와 협상하다 -> negotiate with"
                              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={addPhrase}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-500 text-xs transition"
                            >
                              추가
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-400 z-10">
                          <span>
                            메모된 표현: <strong className="text-amber-300">{sessionPhrases.length}</strong>개
                          </span>
                          <span className="text-slate-400">음성 녹음 분석 중</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Interview Scenario Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          현재 주어진 대화 미션
                        </span>
                        <button
                          onClick={nextScenarioCard}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                        >
                          <span>다음 카드 받기</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{currentScenario.prompt}</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            <span className="font-semibold text-slate-700">추천 답변 구조: </span>
                            {currentScenario.tip}
                          </p>
                        </div>
                        <button
                          onClick={() => playTTS(currentScenario.prompt)}
                          title="질문 발음 듣기"
                          className="p-1.5 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 rounded-lg hover:border-blue-300"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* State D: Session Review & Note Summary */}
                {sessionState === 'review' && (
                  <div className="space-y-5">
                    <div className="text-center bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                      <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl shadow">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">20분 취업 회화 세션 완료!</h3>
                      <p className="text-xs text-slate-600 mt-1">
                        오늘의 대화 행동 데이터가 기록되었습니다. 어려웠던 표현을 복습해 보세요.
                      </p>
                    </div>

                    {/* Recorded Expressions */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-blue-600" />
                          오늘 세션 복습 기록
                        </span>
                        <span className="text-xs text-slate-400 font-normal">자동 저장 완료</span>
                      </h4>
                      <div className="space-y-2">
                        {sessionPhrases.map((phrase, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs"
                          >
                            <span className="font-medium text-slate-800">{phrase}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => playTTS(phrase)}
                                className="text-slate-400 hover:text-blue-600 p-1"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                                복습 필요
                              </span>
                            </div>
                          </div>
                        ))}
                        {sessionPhrases.length === 0 && (
                          <div className="text-center py-4 text-xs text-slate-400">
                            세션 중 메모한 표현이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={resetSession}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition"
                      >
                        메인 화면으로 돌아가기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: Vocabulary Vault & Partner Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* My Vocab Vault */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      취업 회화 복습 파우치
                    </h3>
                    <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {vaultPhrases.length}개 단어/문장
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {vaultPhrases.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-slate-800">{item.phrase}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => playTTS(item.phrase)}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                              title="발음 듣기"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${item.tagColor}`}>
                              {item.tag}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{item.korean}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 text-right">
                  <span className="text-[11px] text-slate-400">말했던 문장을 잊지 않도록 AI 주간 복습 리마인더 발송</span>
                </div>
              </div>

              {/* Peer Review & Testimonials */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      최근 함께 연습한 파트너 피드백
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">매칭 만족도 98.2%</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                          박
                        </div>
                        <span className="text-xs font-bold text-slate-800">박마케팅 (외국계 준비생)</span>
                        <span className="text-[10px] text-amber-500 ml-auto flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 5.0
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        "실제 마케팅 직무 용어를 서로 써보면서 연습하니까 학원에서 단순 수다 떠는 것보다 훨씬 도움 되었습니다!"
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                          최
                        </div>
                        <span className="text-xs font-bold text-slate-800">최일본어 (IT개발 취준생)</span>
                        <span className="text-[10px] text-amber-500 ml-auto flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 5.0
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        "일본 기업 기술 면접 질문지로 연습했는데 면접 긴장감이 많이 사라졌어요."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-right">
                  <span className="text-[11px] text-slate-400">
                    20대 주요 대학 취업지원센터 및 동아리 제휴 확산 중
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: LEAN CANVAS (Founder Board View)    */}
        {/* ========================================== */}
        {currentTab === 'lean-canvas' && (
          <div className="space-y-6">
            {/* Lean Canvas Header Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-indigo-500/25 text-indigo-300 border border-indigo-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    린 캔버스 9개 블록 분석
                  </span>
                  <span className="text-xs text-slate-400">버전 1.0 (초안 기준)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  언어 교류를 통한 취업 준비형 실전 회화
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  "취업을 위해 어학을 준비하는 20대가 점수 공부에만 머무르지 않고, 원하는 언어를 실제로 말해보도록 연결하는 서비스"
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={exportLeanCanvasSummary}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>텍스트 요약 복사</span>
                </button>
              </div>
            </div>

            {/* 9 Block Lean Canvas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* BLOCK 1: Problem */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-red-300 hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center text-xs font-black">
                        1
                      </span>
                      문제 (Problem)
                    </h3>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <span>
                        <strong className="text-slate-800">점수와 회화의 분리:</strong> 어학 시험 점수 준비와 실제 회화 연습이 단절되어 있음.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <span>
                        <strong className="text-slate-800">실전 경험 부족:</strong> 말할 기회가 적어 면접 및 업무 상황에서 극심한 긴장.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <span>
                        <strong className="text-slate-800">비용/목적 불일치:</strong> 학원·과외는 비용 부담, 일반 언어교환은 잡담 위주라 취업 목적과 어긋남.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">기존 대안</span>
                  <span className="text-[11px] text-slate-600">회화학원, 전화영어, 일반 언어교환 앱, 혼자 독학</span>
                </div>
              </div>

              {/* BLOCK 4: Solution */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">
                        4
                      </span>
                      솔루션 (Solution)
                    </h3>
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">맞춤 매칭:</strong> 언어·수준·취업 목표 기반 1:1 또는 소그룹 회화 매칭.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">취업 특화 주제:</strong> 면접/자기소개/업무 상황별 정해진 대화 카드 제공.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">피드백 & 복습:</strong> 대화 후 어려웠던 표현 기록 및 복습 노트 기능.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-blue-600">핵심 행동: 반복해서 입으로 말하기</span>
                </div>
              </div>

              {/* BLOCK 3: Unique Value Proposition (Spans 2 rows) */}
              <div className="bg-gradient-to-b from-indigo-50/80 to-white rounded-xl p-4 border border-indigo-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition md:row-span-2">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-100 mb-3">
                    <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                        3
                      </span>
                      고유 가치 제안 (UVP)
                    </h3>
                    <Gem className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div className="bg-indigo-900 text-white p-3.5 rounded-xl mb-3 shadow-inner">
                    <p className="font-extrabold text-xs leading-snug">
                      "취업 준비를 하면서, 점수 공부와 실제 말하기를 한 번에."
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    단순 친목 언어교환이 아니라 <strong className="text-slate-900">취업 상황 중심</strong>으로 말하게 하고,{' '}
                    <strong className="text-slate-900">같은 목표를 가진 또래와 반복 연습</strong>하게 하는 것이 핵심 차별화 가치입니다.
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">
                    상위 개념 (High-Level Concept)
                  </span>
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-xs font-semibold text-indigo-900 text-center shadow-xs">
                    "취준생을 위한 리얼월드 비즈니스 회화 스터디 링커"
                  </div>
                </div>
              </div>

              {/* BLOCK 9: Unfair Advantage */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">
                        9
                      </span>
                      경쟁 우위 (Unfair Advantage)
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">제휴 네트워크:</strong> 대학 취업지원 조직 및 취업 동아리 공식 제휴.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800">데이터 자산:</strong> 직무·상황별 회화 주제 데이터베이스 및 매칭 이력 축적.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    후발 주자가 단기간에 복제하기 어려운 네트워크 자산
                  </span>
                </div>
              </div>

              {/* BLOCK 2: Customer Segments (Spans 2 rows) */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition md:row-span-2">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                        2
                      </span>
                      고객군 (Customer Segments)
                    </h3>
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                      핵심 타깃
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-1">취업을 준비하는 20대</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      초기 얼리어답터 (Early Adopters)
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside">
                      <li>글로벌 기업 / 해외 취업 관심자</li>
                      <li>어학 점수는 있으나 회화가 부족한 대학생 및 졸업예정자</li>
                      <li>면접·업무 실전 회화가 당장 필요한 취준생</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500">
                    대상 언어: 영어 · 일본어 · 중국어 등
                  </span>
                </div>
              </div>

              {/* BLOCK 8: Key Metrics */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">
                        8
                      </span>
                      핵심 지표 (Key Metrics)
                    </h3>
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex justify-between items-center">
                      <span>1. 주간 회화 완료 횟수</span>
                      <span className="font-bold text-purple-600">주 5회 목표</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>2. 매칭 후 대화 전환율</span>
                      <span className="font-semibold text-slate-700">&gt; 80%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>3. 4주 재방문율 (Retention)</span>
                      <span className="font-semibold text-slate-700">&gt; 45%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>4. 유료 구독 전환율</span>
                      <span className="font-semibold text-slate-700">목표 5%</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] text-purple-700 font-bold">
                    "실제로 말한 행동 지표 중심 측정"
                  </span>
                </div>
              </div>

              {/* BLOCK 5: Channels */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-black">
                        5
                      </span>
                      채널 (Channels)
                    </h3>
                    <Share2 className="w-4 h-4 text-teal-600" />
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li>• 대학 취업지원센터 및 대학생 커뮤니티</li>
                    <li>• 취업·어학 관련 SNS 콘텐츠 (인스타, 블로그)</li>
                    <li>• 대학 스터디 / 취업 동아리 제휴</li>
                    <li>• 사용자 지인 초대 및 추천 프로그램</li>
                  </ul>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">초기 직접 채널 -&gt; 구전 바이럴 확산</span>
                </div>
              </div>

              {/* BLOCK 7: Cost Structure */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-400 hover:shadow-md transition md:col-span-2">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-xs font-black">
                        7
                      </span>
                      비용 구조 (Cost Structure)
                    </h3>
                    <Receipt className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>• 서비스 개발 및 서버 운영비</div>
                    <div>• 매칭 및 사용자 운영 인력비</div>
                    <div>• 실전 회화 콘텐츠 제작비</div>
                    <div>• 본인 인증 및 신고/클린 대응</div>
                    <div>• 초기 사용자 확보 마케팅비</div>
                    <div>• 음성/통신 WebRTC 인프라비</div>
                  </div>
                </div>
              </div>

              {/* BLOCK 6: Revenue Streams */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition md:col-span-3">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                        6
                      </span>
                      수익원 (Revenue Streams)
                    </h3>
                    <Coins className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong className="text-blue-700 block mb-1">
                        B2C 프리미엄 구독 (Freemium)
                      </strong>
                      기본 매칭은 무료 제공. 정교한 직무 매칭, 프리미엄 면접 질문집, AI 복습 노트 기능을 월 정액 구독으로 전환.
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong className="text-indigo-700 block mb-1">
                        B2B / B2G 단체 이용권
                      </strong>
                      대학 취업지원처, 지자체 청년 센터 대상 취업 어학 지원 단체 라이선스 판매.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: JTBD & HYPOTHESIS TESTING PLAN      */}
        {/* ========================================== */}
        {currentTab === 'jtbd-validation' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
              <span className="bg-amber-500/25 text-amber-300 border border-amber-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                PPT Page 4 - 문제 검증을 위한 보완 틀
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-2">
                JTBD & 가설 검증 실행 계획
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                서비스 개발 전 가설 검증 실패에 따른 리스크를 최소화하기 위한 단계별 테스트 프레임워크
              </p>
            </div>

            {/* JTBD & Risky Hypothesis Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* JTBD Definition */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-indigo-600 mb-3">
                  <Target className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 text-base">
                    JTBD (고객이 실제로 해내고 싶은 일)
                  </h3>
                </div>
                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl">
                  <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed italic">
                    "취업을 준비하면서 어학 시험 점수만 확보하는 데서 끝나는 것이 아니라, 실제 면접이나 업무 상황에서도 외국어로 자연스럽게 말할 수 있는 상태가 되고 싶다."
                  </p>
                </div>
              </div>

              {/* Most Risky Hypothesis */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 text-red-600 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 text-base">
                    가장 위험한 가설 (Most Risky Hypothesis)
                  </h3>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                  <p className="text-xs sm:text-sm text-red-950 font-medium leading-relaxed">
                    "취업 준비 20대가 시험 점수만 준비하는 것이 아니라, 낯선 사람과의 언어교류 방식으로도 꾸준히 회화를 연습하고 싶어 한다."
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  ※ 이 가설이 틀리면 매칭 기능을 고도화해도 반복 사용(리텐션)이 일어나지 않습니다.
                </p>
              </div>
            </div>

            {/* Competitor Matrix */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                기존 대안 비교 (경쟁 지형 분석)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-2 text-blue-700">직접 경쟁 대안</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li>
                      • <strong className="text-slate-800">언어교환 앱:</strong> HelloTalk, Tandem (친목/연애 목적 과다, 취업 목표 불일치)
                    </li>
                    <li>
                      • <strong className="text-slate-800">회화 학원 / 과외:</strong> 강남/신촌 오프라인 어학원 (월 20~40만 원의 높은 비용 부담)
                    </li>
                    <li>
                      • <strong className="text-slate-800">온라인 튜터링:</strong> Ringle, Camly (전문적이나 매일 쓰기엔 1회당 단가가 비쌈)
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-2 text-indigo-700">간접 경쟁 대안</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li>
                      • <strong className="text-slate-800">어학 스터디:</strong> 에브리타임/네이버 카페 스터디 (체계 및 자료 부족, 잠수 문제)
                    </li>
                    <li>
                      • <strong className="text-slate-800">혼자 시험 교재 공부:</strong> 수동적 암기 위주로 실제 말문이 막힘
                    </li>
                    <li>
                      • <strong className="text-slate-800">아예 회화 연습을 포기함:</strong> 서류/필기 점수에만 집중하여 면접 탈락 위험
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2-Stage Hypothesis Validation Roadmap */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-600" />
                가설 검증 실행 단계 (2-Stage Plan)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stage 1 */}
                <div className="border border-slate-200 rounded-xl p-4 relative overflow-hidden bg-slate-50/50">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    1단계
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">취준생 15명 심층 인터뷰</h4>
                  <p className="text-xs text-slate-500 mb-3">고객의 실제 문제와 기존 대안에 대한 정성적 검증</p>

                  <div className="space-y-2 text-xs">
                    {[
                      '최근 어학 준비 방식 및 월평균 투자 비용 파악',
                      '실제 면접/업무에서 외국어로 말할 때 막혔던 경험 조사',
                      '현재 사용 중인 대안(학원, 앱)의 불만족 요인 도출'
                    ].map((text, idx) => (
                      <label key={idx} className="flex items-center space-x-2 text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={interviewChecks[idx]}
                          onChange={() => {
                            const newArr = [...interviewChecks];
                            newArr[idx] = !newArr[idx];
                            setInterviewChecks(newArr);
                          }}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                        />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="border border-slate-200 rounded-xl p-4 relative overflow-hidden bg-slate-50/50">
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    2단계
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">2주 소규모 프로토타입 매칭 테스트</h4>
                  <p className="text-xs text-slate-500 mb-3">실제 회화 행동 발생 및 리텐션 검증</p>

                  <div className="space-y-2 text-xs">
                    {[
                      '실제 대화 참여율 측정 (목표 80% 이상)',
                      '2회 이상 재참여율 (Retention) 확인',
                      '유료 구독 기능 (정교한 직무 매칭) 사용 의향 평가'
                    ].map((text, idx) => (
                      <label key={idx} className="flex items-center space-x-2 text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={protoChecks[idx]}
                          onChange={() => {
                            const newArr = [...protoChecks];
                            newArr[idx] = !newArr[idx];
                            setProtoChecks(newArr);
                          }}
                          className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                        />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Topic Library */}
      {modals.topicList && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-600" />
                취업 상황별 회화 주제 라이브러리
              </h3>
              <button
                onClick={() => setModals(prev => ({ ...prev, topicList: false }))}
                className="text-slate-400 hover:text-slate-700 text-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 custom-scrollbar flex-1 pr-1">
              {topicList.map((topic, idx) => (
                <div
                  key={idx}
                  onClick={() => selectTopic(topic)}
                  className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition flex justify-between items-start group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                      {topic.category}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 mt-1">{topic.question}</h4>
                    <p className="text-[11px] text-slate-500">{topic.korean}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setModals(prev => ({ ...prev, topicList: false }))}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Modal: Edit Match Settings */}
      {modals.editProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                매칭 조건 설정
              </h3>
              <button
                onClick={() => setModals(prev => ({ ...prev, editProfile: false }))}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">목표 언어</label>
                <select
                  value={userProfile.targetLang}
                  onChange={e => setUserProfile(prev => ({ ...prev, targetLang: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="영어 (TOEIC / OPIc)">영어 (TOEIC / OPIc / Speaking)</option>
                  <option value="일본어 (JLPT / SJPT)">일본어 (JLPT / SJPT)</option>
                  <option value="중국어 (HSK / TSC)">중국어 (HSK / TSC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">희망 지원 직무</label>
                <select
                  value={userProfile.targetJob}
                  onChange={e => setUserProfile(prev => ({ ...prev, targetJob: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="IT/소프트웨어 개발">IT/소프트웨어 개발</option>
                  <option value="마케팅/해외영업">마케팅/해외영업</option>
                  <option value="경영기획/인사">경영기획/인사</option>
                  <option value="글로벌 물류/무역">글로벌 물류/무역</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">현재 말하기 회화 수준</label>
                <select
                  value={userProfile.level}
                  onChange={e => setUserProfile(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="초급 (단어 위주 답변)">초급 (단어 위주 답변)</option>
                  <option value="중급 (기본 소통 가능)">중급 (기본 소통 가능)</option>
                  <option value="상급 (자연스러운 의사표현)">상급 (자연스러운 의사표현)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">연습 모드</label>
                <select
                  value={userProfile.mode}
                  onChange={e => setUserProfile(prev => ({ ...prev, mode: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="1:1 실전 면접 (20분)">1:1 실전 면접 (20분)</option>
                  <option value="직무 돌발 질문 토론 (15분)">직무 돌발 질문 토론 (15분)</option>
                  <option value="1분 자기소개 & 피드백 (10분)">1분 자기소개 & 피드백 (10분)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setModals(prev => ({ ...prev, editProfile: false }));
                showToast('매칭 조건이 성공적으로 저장되었습니다!');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              저장 및 적용
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
