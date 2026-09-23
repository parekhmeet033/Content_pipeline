import { useEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

const DEFAULT_STAGES = [
  'Reading your brief...',
  'Contacting the AI model...',
  'Drafting your content...',
  'Structuring sections & headings...',
  'Polishing tone and wording...',
  'Finalizing your draft...',
];

const STAGE_INTERVAL_MS = 3200;

export default function GenerationProgress({
  label = 'Generating your content',
  hint = 'This usually takes 10-40 seconds depending on length.',
  stages = DEFAULT_STAGES,
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    setStageIndex(0);
    setElapsed(0);

    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, stages.length - 1));
    }, STAGE_INTERVAL_MS);

    const clockTimer = setInterval(() => {
      setElapsed(Math.round((Date.now() - startRef.current) / 1000));
    }, 1000);

    return () => {
      clearInterval(stageTimer);
      clearInterval(clockTimer);
    };
  }, []);

  // Progress bar eases toward ~92% and never claims completion until the real result arrives.
  const progressPct = Math.min(92, 8 + stageIndex * 16 + Math.min(elapsed, 20));

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-14 text-center" role="status" aria-live="polite">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <Loader2 className="h-14 w-14 animate-spin text-brand-500" aria-hidden="true" />
        <div className="absolute h-2 w-2 rounded-full bg-brand-600" />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {hint} Elapsed: {elapsed}s
        </p>
      </div>

      <div className="w-full max-w-xs">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ul className="flex w-full max-w-xs flex-col gap-1.5 text-left">
        {stages.map((stage, idx) => {
          const done = idx < stageIndex;
          const active = idx === stageIndex;
          return (
            <li
              key={stage}
              className={`flex items-center gap-2 text-xs transition-opacity ${
                idx > stageIndex ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" aria-hidden="true" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-brand-500" aria-hidden="true" />
              ) : (
                <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
              <span
                className={
                  active
                    ? 'font-medium text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
                }
              >
                {stage}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
