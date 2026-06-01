import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface Step {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    link: string;
}

interface OnboardingChecklistProps {
    steps: Step[];
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ steps }) => {
    const allCompleted = steps.every(s => s.completed);
    if (allCompleted) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden mb-12 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            
            <div className="relative z-10">
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Getting Started</h2>
                <p className="text-indigo-100 text-sm mb-10 font-medium opacity-80 uppercase tracking-widest">Complete these steps to unlock full potential</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div 
                            key={step.id}
                            className={`p-6 rounded-2xl border transition-all ${
                                step.completed 
                                ? 'bg-white/10 border-white/20 opacity-60' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                {step.completed ? (
                                    <CheckCircle2 className="text-emerald-400" size={24} />
                                ) : (
                                    <Circle className="text-white/30" size={24} />
                                )}
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Step 0{index + 1}</span>
                            </div>
                            <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{step.title}</h3>
                            <p className="text-xs text-indigo-100/60 font-medium mb-6 leading-relaxed">{step.description}</p>
                            
                            {!step.completed && (
                                <a 
                                    href={step.link}
                                    className="inline-flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:gap-3 transition-all"
                                >
                                    Complete Now <ArrowRight size={12} />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OnboardingChecklist;
