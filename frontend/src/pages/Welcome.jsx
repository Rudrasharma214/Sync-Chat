import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Layers3,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Navbar from "../components/Navbar";

const highlights = [
  {
    title: "For every conversation",
    description: "Stay in touch with friends, family, and teammates from one clean space.",
    icon: Rocket,
  },
  {
    title: "Private by design",
    description: "Built with authenticated sessions and a security-first flow.",
    icon: ShieldCheck,
  },
  {
    title: "Made for groups",
    description: "Move from one-to-one chats to family groups, communities, and team rooms.",
    icon: Users,
  },
];

const stats = [
  { value: "24/7", label: "messages that stay in sync" },
  { value: "3", label: "ways to connect" },
  { value: "1", label: "space for life and work" },
];

const Welcome = () => {
  return (
    <>
      <Navbar />

      <main className="theme-bg relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <section className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-14 pt-12 sm:px-8 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-20 lg:pt-20">
          <div className="flex flex-col justify-center">
            <div className="theme-border theme-surface theme-muted inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-500" />
              A chat app for work, friends, and family
            </div>

            <h1 className="theme-text mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              A polished chat experience that feels warm, fast, and natural for everyday life.
            </h1>

            <p className="theme-muted mt-5 max-w-2xl text-base leading-7 sm:text-lg">
              Sync-Chat keeps your conversations organized across direct messages and groups, with
              a calm interface that works just as well for quick personal check-ins as it does for
              focused collaboration.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="theme-border theme-surface theme-text inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 text-sm font-semibold shadow-sm backdrop-blur transition hover:border-amber-500/60 hover:text-amber-500"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="theme-border theme-surface rounded-2xl border p-4 shadow-sm backdrop-blur">
                  <div className="theme-text text-2xl font-semibold">{item.value}</div>
                  <div className="theme-muted mt-1 text-sm">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm theme-muted">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Private and secure
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-sky-600">
                <Globe2 className="h-4 w-4" />
                Works across devices
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-amber-600">
                <Star className="h-4 w-4" />
                Friendly, modern design
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="theme-border theme-surface relative w-full max-w-xl rounded-[2rem] border p-4 shadow-2xl shadow-slate-950/10 backdrop-blur">
              <div className="theme-border flex items-center justify-between border-b pb-4">
                <div>
                  <p className="theme-text text-sm font-semibold tracking-wide">Your chats</p>
                  <p className="theme-muted text-xs">Live preview across personal and work spaces</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  18 online now
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="theme-surface-soft rounded-[1.5rem] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text text-sm font-semibold">Recent chats</p>
                      <p className="theme-muted text-xs">People and groups you talk to most</p>
                    </div>
                    <Layers3 className="h-4 w-4 theme-muted" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { name: "Maya", count: "2m ago", tone: "bg-amber-500/15 text-amber-600" },
                      { name: "Family Group", count: "8 unread", tone: "bg-sky-500/15 text-sky-600" },
                      { name: "Design Team", count: "Live now", tone: "bg-emerald-500/15 text-emerald-600" },
                    ].map((channel) => (
                      <div
                        key={channel.name}
                        className="theme-border flex items-center justify-between rounded-2xl border bg-white/40 px-3 py-3 shadow-sm backdrop-blur"
                      >
                        <div>
                          <p className="theme-text text-sm font-medium">{channel.name}</p>
                          <p className="theme-muted text-xs">Tap to continue chatting</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${channel.tone}`}>
                          {channel.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950 p-4 text-slate-100 shadow-xl shadow-slate-950/20">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <p className="text-sm font-semibold">Maya</p>
                      <p className="text-xs text-slate-400">Family plan for tonight</p>
                    </div>
                    <MessageSquareText className="h-5 w-5 text-amber-400" />
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/8 px-3.5 py-2.5 text-slate-100">
                        Are we still on for dinner tonight? I can pick up dessert on the way.
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-amber-400 px-3.5 py-2.5 text-slate-950">
                        Yes. I’ll send the address to everyone and add your name to the list.
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/8 px-3.5 py-2.5 text-slate-100">
                        Perfect. This feels easy enough for family and work alike.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-100">Personal chats and team updates</p>
                      <p className="text-xs text-slate-400">Everything stays organized in one place.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-12 lg:pb-24">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="theme-border theme-surface rounded-[1.5rem] border p-6 shadow-sm backdrop-blur">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h2 className="theme-text mt-4 text-lg font-semibold">{item.title}</h2>
                  <p className="theme-muted mt-2 text-sm leading-6">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
};

export default Welcome;
