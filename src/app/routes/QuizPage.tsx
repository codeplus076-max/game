import { useState, useEffect } from "react";
import { getRandomQuestion } from "@/services/questionEngine";
import { getQuestions } from "@/services/firebase/repositories/questionsRepository";
import type { Question } from "@/types/questions";
import QuizCard from "@/components/quiz/QuizCard";
import QuizResultsCard from "@/components/quiz/QuizResultsCard";
import SectionCard from "@/components/common/SectionCard";
import LoadingState from "@/components/common/LoadingState";
import StatCard from "@/components/common/StatCard";
import FeedbackToast from "@/components/common/FeedbackToast";

// Mocking the user reward call for now since we don't have a direct hook exposed 
// in this simplified UI beyond what useGameData provides.
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

export default function QuizPage() {
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [tokensEarned, setTokensEarned] = useState(0);
    const [toastMsg, setToastMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);

    const fetchQuestion = async () => {
        setLoading(true);
        setSelectedIndex(null);
        const qs = await getQuestions();
        const q = getRandomQuestion(qs, { mode: "quiz", difficultyClass: "any" } as any); // using mostly right signature for the MVP
        setQuestion(q || null);
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestion();
    }, []);

    const handleAnswer = async (index: number) => {
        setSelectedIndex(index);
        setToastMsg(null);
        if (question && index === question.correctAnswerIndex) {
            setTokensEarned(prev => prev + 10);
            setToastMsg({ text: "Correct! +10 Quiz Tokens acquired.", type: "success" });
            try {
                const db = getFirestore();
                await updateDoc(doc(db, "users", "user-demo"), { quizTokens: increment(10) });
                window.dispatchEvent(new CustomEvent("gamedata:updated", { detail: { type: "user" } }));
            } catch (e) {
                // Fallback for non-firebase environments would be handled by a proper service
            }
        } else {
            setToastMsg({ text: "Incorrect. Training iteration failed.", type: "error" });
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto py-8 relative">
            {toastMsg && <FeedbackToast message={toastMsg.text} type={toastMsg.type} />}
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Cyber Security Training</h1>
                <p className="text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed">
                    Enhance your operational knowledge to earn Quiz Tokens. Tokens are required for initiating instant upgrades to your base defenses.
                </p>
            </header>

            <div className="mb-8 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <StatCard label="Session Earnings" value={`+${tokensEarned}`} highlightColor="accent" />
                <StatCard label="Token Value" value="10 per Correct" />
            </div>

            <div className="min-h-[400px] flex items-center justify-center">
                {loading ? (
                    <LoadingState message="Connecting to Training Mainframe..." />
                ) : !question ? (
                    <SectionCard title="System Error">
                        <div className="text-center p-8 text-red-400">Unable to retrieve training scenario.</div>
                        <button onClick={fetchQuestion} className="mx-auto block mt-4 px-4 py-2 bg-cyber-panel-light border border-cyber-border rounded hover:bg-slate-800">Retry</button>
                    </SectionCard>
                ) : selectedIndex === null ? (
                    <QuizCard
                        question={question}
                        onAnswer={handleAnswer}
                        disabled={false}
                    />
                ) : (
                    <QuizResultsCard
                        question={question}
                        selectedAnswerIndex={selectedIndex}
                        onNext={fetchQuestion}
                    />
                )}
            </div>
        </div>
    );
}
