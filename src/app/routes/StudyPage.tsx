import { useState, useEffect } from "react";
import { getStudyTopics } from "@/services/firebase/repositories/studyTopicsRepository";
import type { StudyTopic } from "@/data/starterStudyContent";
import StudyTopicViewer from "@/components/study/StudyTopicViewer";
import StudyTopicCard from "@/components/study/StudyTopicCard";
import LoadingState from "@/components/common/LoadingState";
import { useRouter } from "next/navigation";

export default function StudyPage() {
    const router = useRouter();
    const [topics, setTopics] = useState<StudyTopic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStudyTopics().then((res) => {
            setTopics(res);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="h-[calc(100vh-140px)] flex items-center justify-center">
                <LoadingState message="Accessing Intel Archive..." />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
            <header className="mb-6 shrink-0">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Intel Archive</h1>
                <p className="text-gray-400 mt-1">Review documented cybersecurity vulnerabilities and defense mechanisms.</p>
            </header>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left Topics List */}
                <div className="w-80 flex flex-col gap-3 overflow-y-auto pr-2 pb-6 custom-scrollbar">
                    {topics.map(topic => (
                        <StudyTopicCard
                            key={topic.id}
                            topic={topic}
                            isSelected={selectedTopic?.id === topic.id}
                            onClick={() => setSelectedTopic(topic)}
                        />
                    ))}
                </div>

                {/* Right Viewer */}
                <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar pr-2">
                    <StudyTopicViewer
                        topic={selectedTopic}
                        onTakeQuiz={() => router.push("/quiz")}
                    />
                </div>
            </div>
        </div>
    );
}
