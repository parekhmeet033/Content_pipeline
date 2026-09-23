import { Link } from 'react-router-dom';
import {
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ShieldCheck,
  Search,
  Bell,
  PenLine,
  Wand2,
  FolderKanban,
  Rocket,
  Eye,
  Heart,
  Share2,
  FileText,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const FEATURES = [
  { icon: Sparkles, title: 'AI content generation', description: 'Turn a topic, tone, and audience into a polished first draft in seconds.' },
  { icon: Layers, title: 'Version history', description: 'Every edit is saved so you can compare and restore past versions.' },
  { icon: Calendar, title: 'Scheduling', description: 'Plan when content goes live and track it through your pipeline.' },
  { icon: BarChart3, title: 'Performance tracking', description: 'See real views, likes, shares, and comments for every piece of content you publish.' },
  { icon: Wand2, title: 'Smart suggestions', description: 'Get AI-powered topic ideas and improvement suggestions on demand.' },
  { icon: ShieldCheck, title: 'Secure by default', description: 'JWT authentication and hashed credentials keep your account safe.' },
  { icon: FolderKanban, title: 'Categories & organization', description: 'Group content into custom categories with color-coded labels.' },
  { icon: Search, title: 'Search & filtering', description: 'Find any piece of content instantly by title, body, status, or type.' },
  { icon: Bell, title: 'Notifications', description: 'Stay in the loop when content is generated, published, or scheduled.' },
];

const STEPS = [
  { icon: PenLine, title: 'Describe what you need', description: 'Give ContentNova a topic, content type, audience, tone, keywords, and length.' },
  { icon: Sparkles, title: 'Generate with AI', description: 'Get a structured draft — title, excerpt, and body — ready to review.' },
  { icon: Layers, title: 'Edit & refine', description: 'Fine-tune the draft, request AI improvement suggestions, and every save is versioned.' },
  { icon: Rocket, title: 'Schedule & publish', description: 'Organize into categories, schedule a publish date, or publish instantly.' },
  { icon: BarChart3, title: 'Track performance', description: 'Watch real views, likes, shares, and comments roll in on your dashboard and each content\'s detail page.' },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered content marketing platform
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
          Plan, generate, and track content that actually performs
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          ContentNova is a complete content marketing workspace: generate on-brand drafts with AI, edit and
          version them, organize into categories, schedule publication, and measure real performance —
          all backed by your own PostgreSQL database, not sample data.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button as={Link} to="/register" size="lg">
            <Rocket className="h-4 w-4" /> Try now
          </Button>
          <Button as={Link} to="/login" variant="secondary" size="lg">
            Log in
          </Button>
          <Button as={Link} to="/register" variant="ghost" size="lg">
            Sign up
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">How ContentNova works</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            From a blank page to a published, measurable piece of content in five steps.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(({ icon: Icon, title, description }, idx) => (
            <Card key={title} className="relative p-5">
              <span className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Product preview — show the project */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">See ContentNova in action</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">A quick look at the dashboard you'll get once you sign up.</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {/* fake browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-xs text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              app.contentnova.io/dashboard
            </span>
          </div>

          <div className="flex">
            {/* mock sidebar */}
            <div className="hidden w-44 flex-col gap-1 border-r border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 sm:flex">
              {['Dashboard', 'Generator', 'Library', 'Profile'].map((label, i) => (
                <div
                  key={label}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    i === 0
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* mock content */}
            <div className="flex-1 p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: FileText, label: 'Content', value: '12' },
                  { icon: Eye, label: 'Views', value: '1,204' },
                  { icon: Heart, label: 'Likes', value: '318' },
                  { icon: Share2, label: 'Shares', value: '96' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <Icon className="h-4 w-4 text-brand-500" />
                    <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              <p className="mb-2 mt-5 text-xs font-semibold text-slate-600 dark:text-slate-300">Recent content</p>
              <div className="space-y-2">
                {['5 Benefits of Remote Work for Small Teams', 'How AI is Changing Content Marketing'].map((title) => (
                  <div key={title} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{title}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Published
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Everything you need, in one workspace</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Built as a real, working platform — every number and record is backed by PostgreSQL.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ready to try ContentNova?</h2>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Create a free account and generate your first piece of AI content in minutes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/register" size="lg">
              <Rocket className="h-4 w-4" /> Try now
            </Button>
            <Button as={Link} to="/login" variant="secondary" size="lg">
              Log in
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
