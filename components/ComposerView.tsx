import React, { useState, useCallback, useEffect } from 'react';
import { composeActionPlan } from '../services/geminiService';
import { 
    UserDrivenResponse, 
    Problem, 
    ComposedActionPlan,
    LiveData,
    Priority,
    ActionTask,
    ActionStatus
} from '../types';
import { Loader } from './Loader';
import { ZapIcon } from './icons/ZapIcon';

interface ComposerViewProps {
  analysis: UserDrivenResponse | null;
  opportunities: Problem[];
}

const ActionTaskCard: React.FC<{ 
    task: ActionTask; 
    onMarkComplete: () => void;
}> = ({ task, onMarkComplete }) => {
    const getStatusPill = (status: ActionTask['status']) => {
        const styles = {
            pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
            in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
            done: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>{status.replace('_', ' ')}</span>;
    };

    return (
        <div className={`bg-gray-100 dark:bg-[#1a1a1a]/50 border border-gray-200 dark:border-white/10 p-4 rounded-lg transition-all duration-300 ${task.status === 'done' ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h4 className={`font-semibold text-black dark:text-gray-100 ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                </div>
                <div className="ml-2">
                    {getStatusPill(task.status)}
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 flex justify-between items-center">
                <span>Owner: <span className="font-medium text-gray-700 dark:text-gray-300">{task.owner}</span></span>
                <span>Due: <span className="font-medium text-gray-700 dark:text-gray-300">{task.due_in_hours} hours</span></span>
            </div>
            {task.executable && (
                <div className="mt-2 text-xs font-mono bg-gray-200 dark:bg-black/30 p-2 rounded-md text-gray-700 dark:text-gray-400">
                    <span className="text-gray-500 dark:text-gray-400">$ &gt; </span>{task.command}
                </div>
            )}
            {task.status !== 'done' && (
                <button
                    onClick={onMarkComplete}
                    className="mt-3 w-full bg-black dark:bg-white text-white dark:text-black font-medium py-2 px-4 rounded-md hover:opacity-80 transition-all duration-300 text-sm"
                >
                    ✓ Mark as Completed
                </button>
            )}
        </div>
    );
};


const ComposerView: React.FC<ComposerViewProps> = ({ analysis, opportunities }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<ComposedActionPlan | null>(null);
    const [heartbeat, setHeartbeat] = useState(0);
    
    const handleMarkComplete = useCallback((taskId: number) => {
        if (!plan) return;
        
        const taskToComplete = plan.action_plan.find(t => t.id === taskId);
        if (!taskToComplete || taskToComplete.status === 'done') return;
        
        const now = new Date().toLocaleTimeString();
        const logEntry = `[${now}] Task #${taskId} completed: ${taskToComplete.title}`;
        
        setPlan(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                action_plan: prev.action_plan.map(task => 
                    task.id === taskId ? { ...task, status: 'done' as ActionStatus } : task
                ),
                execution_log: [...prev.execution_log, logEntry]
            };
        });
    }, [plan]);

    useEffect(() => {
        if (plan && plan.next_heartbeat_in_seconds > 0) {
            setHeartbeat(plan.next_heartbeat_in_seconds);
            const timer = setInterval(() => {
                setHeartbeat(h => {
                    if (h <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return h - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [plan]);

    const handleSubmit = useCallback(async () => {
        if (!analysis) return;

        setIsLoading(true);
        setError(null);
        setPlan(null);

        const liveDataItems: LiveData[] = [];
        const priority: Priority = 'high';
        
        try {
            const result = await composeActionPlan(analysis, opportunities, liveDataItems, analysis.founder_profile, priority);
            setPlan(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [analysis, opportunities]);

    if (!analysis) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-black dark:text-gray-300">Composer is Ready</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-500">Please run an analysis first. <br/>The Composer uses analysis results to generate an executable action plan. <br/><span className="text-sm text-gray-500 dark:text-gray-600 mt-2 block">Optionally, run a discovery scan for enhanced insights.</span></p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-black dark:text-white">Composer Engine (MVP)</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                Fuse analysis {opportunities.length > 0 ? 'and opportunities' : ''} into an executable action plan with one click.
                {opportunities.length === 0 && <span className="block text-sm text-gray-500 dark:text-gray-500 mt-1">(Discovery data not available - using analysis only)</span>}
            </p>
            
            <div className="mt-10 max-w-4xl mx-auto space-y-6">
                {!plan && (
                    <div className="text-center p-8 bg-gray-50 dark:bg-[#1a1a1a]/80 border border-gray-200 dark:border-white/10 rounded-xl">
                        <h3 className="text-xl font-bold text-black dark:text-gray-200">Ready to Synthesize</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Your analysis is ready. {opportunities.length > 0 ? 'Discovery insights are also available.' : 'No discovery data available - will use analysis only.'} 
                            <br/>Click the button below to generate a composed action plan.
                        </p>
                        <button
                            onClick={handleSubmit}
                            className="mt-6 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center text-lg gemini-glow-button mx-auto"
                            disabled={isLoading}
                        >
                            {isLoading ? <><Loader /><span className="ml-2">Thinking...</span></> : <><ZapIcon className="w-5 h-5 mr-2"/>Compose Action Plan</>}
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="mt-8 text-center text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-800/50 p-4 rounded-lg max-w-3xl mx-auto border border-gray-400 dark:border-gray-600">{error}</div>}

            {plan && (
                <div className="mt-12 max-w-5xl mx-auto animate-slide-up space-y-8">
                    <div className="bg-gray-50 dark:bg-[#1a1a1a]/80 border border-gray-200 dark:border-white/10 p-6 rounded-xl">
                        <div className="flex justify-between items-center">
                             <h3 className="text-xl font-semibold text-black dark:text-white">Composed Action Plan</h3>
                             <div className="text-right">
                                <p className="text-sm text-gray-500">Re Trend </p>
                                <p className="text-2xl font-mono font-bold text-black dark:text-gray-200">{String(Math.floor(heartbeat / 60)).padStart(2, '0')}:{String(heartbeat % 60).padStart(2, '0')}</p>
                             </div>
                        </div>
                        <p className="mt-2 text-gray-800 dark:text-gray-300">{plan.fusion_summary}</p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-black dark:text-gray-200">Fused Insights</h4>
                        <div className="space-y-3">
                            {plan.fused_insights.map((insight, index) => (
                                <div key={index} className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-lg">
                                    <p className="text-gray-800 dark:text-gray-300">{insight.insight}</p>
                                    <div className="text-xs text-gray-500 mt-2">
                                        Sources: {insight.from_sources.join(', ')} | Confidence: <span className="font-bold text-gray-600 dark:text-gray-400">{(insight.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold mb-3 text-black dark:text-gray-200">Action Plan</h4>
                            <div className="space-y-3">
                                {plan.action_plan.map(task => (
                                    <ActionTaskCard 
                                        key={task.id} 
                                        task={task}
                                        onMarkComplete={() => handleMarkComplete(task.id)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-3 text-black dark:text-gray-200">Execution Log</h4>
                            <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/10 p-4 rounded-lg h-full font-mono text-sm text-gray-700 dark:text-gray-400 space-y-2 overflow-y-auto max-h-96">
                                {plan.execution_log.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-500 italic">No tasks completed yet...</p>
                                ) : (
                                    plan.execution_log.map((log, index) => (
                                        <p key={index} className="animate-slide-in-left">
                                            <span className="text-green-600 dark:text-green-400">&gt; </span>
                                            {log}
                                        </p>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComposerView;