import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Sparkles, Shield, Zap } from "lucide-react";
import Navbar from "../components/Navbar";

const Welcome = () => {
    return (
        <>
            <Navbar />

            <main className="min-h-[calc(100vh-4rem)] bg-slate-100">

                {/* HERO SECTION */}
                <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:px-14 lg:py-24">

                    {/* LEFT */}
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                            <Sparkles className="h-4 w-4 text-sky-600" />
                            Real-time Messaging Platform
                        </div>

                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                            Welcome to Sync-Chat
                        </h1>

                        <p className="mt-4 max-w-md text-slate-600 sm:text-lg">
                            A clean and fast chat experience to stay connected with your people.
                        </p>

                        <div className="mt-8 flex gap-3">
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-600"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Create Account
                            </Link>

                            <Link
                                to="/login"
                                className="rounded-xl border border-amber-500/60 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                            >
                                Login
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT → CHAT PREVIEW */}
                    <div className="relative">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">

                            {/* Header */}
                            <div className="flex items-center justify-between border-b pb-3">
                                <p className="font-semibold text-slate-800">Chat</p>
                                <span className="text-xs text-green-500">Online</span>
                            </div>

                            {/* Messages */}
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-start">
                                    <div className="rounded-lg bg-slate-200 px-3 py-2">
                                        Hey, are you free?
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <div className="rounded-lg bg-amber-400 px-3 py-2 text-slate-900">
                                        Yes, what's up?
                                    </div>
                                </div>

                                <div className="flex justify-start">
                                    <div className="rounded-lg bg-slate-200 px-3 py-2">
                                        Let's build something cool 🚀
                                    </div>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="mt-4 flex gap-2 border-t pt-3">
                                <input
                                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                                    placeholder="Type a message..."
                                />
                                <button className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-10 lg:px-14">
                    <div className="grid gap-6 sm:grid-cols-3">

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <Zap className="mb-3 h-5 w-5 text-sky-600" />
                            <h3 className="font-semibold text-slate-900">Realtime</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Instant message delivery with WebSockets.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <Shield className="mb-3 h-5 w-5 text-sky-600" />
                            <h3 className="font-semibold text-slate-900">Secure</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Cookie-based authentication with safe sessions.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <MessageSquare className="mb-3 h-5 w-5 text-sky-600" />
                            <h3 className="font-semibold text-slate-900">Simple</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Minimal UI focused on conversations.
                            </p>
                        </div>

                    </div>
                </section>

                {/* HOW IT WORKS */}
                {/* <section className="mx-auto max-w-6xl px-6 pb-24">
                    <h2 className="text-center text-2xl font-bold text-slate-900">
                        How it works
                    </h2>

                    <div className="mt-10 grid gap-6 sm:grid-cols-3">
                        {[
                            {
                                step: "1",
                                title: "Create Account",
                                desc: "Sign up in seconds",
                            },
                            {
                                step: "2",
                                title: "Start Chat",
                                desc: "Connect instantly",
                            },
                            {
                                step: "3",
                                title: "Stay Connected",
                                desc: "Real-time sync",
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
                            >
                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-slate-900">
                                    {item.step}
                                </div>

                                <h3 className="font-semibold text-slate-900">
                                    {item.title}
                                </h3>

                                <p className="mt-1 text-sm text-slate-600">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section> */}

                {/* FINAL CTA */}
                {/* <section className="mx-auto max-w-4xl px-6 pb-20">
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                        <h3 className="text-xl font-semibold text-slate-900">
                            Ready to start chatting?
                        </h3>

                        <p className="mt-2 text-sm text-slate-600">
                            Join Sync-Chat and start real-time conversations instantly.
                        </p>

                        <Link
                            to="/signup"
                            className="mt-6 inline-block rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-600"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </section> */}

            </main>
        </>
    );
};

export default Welcome;