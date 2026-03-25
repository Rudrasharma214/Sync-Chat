import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Sparkles, Shield, Zap } from "lucide-react";
import Navbar from "../components/Navbar";

const Welcome = () => {
    return (
        <>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)] bg-slate-100">
                <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-16 text-center sm:px-10 lg:px-14 lg:py-24">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                        <Sparkles className="h-4 w-4 text-sky-600" />
                        Real-time Messaging Platform
                    </div>

                    <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Welcome to Sync-Chat
                    </h1>
                    <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
                        A clean and fast chat experience to stay connected with your people.
                        Sign up to get started or log in to continue your conversations.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-600"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Create Account
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/60 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                            Login
                        </Link>
                    </div>

                    <div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                            <Zap className="mb-3 h-5 w-5 text-sky-600" />
                            <h3 className="text-sm font-semibold text-slate-900">Realtime</h3>
                            <p className="mt-1 text-sm text-slate-600">Instant message delivery with smooth interactions.</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                            <Shield className="mb-3 h-5 w-5 text-sky-600" />
                            <h3 className="text-sm font-semibold text-slate-900">Secure</h3>
                            <p className="mt-1 text-sm text-slate-600">Cookie-based authentication with safe session handling.</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                            <MessageSquare className="mb-3 h-5 w-5 text-sky-600" />
                            <h3 className="text-sm font-semibold text-slate-900">Simple</h3>
                            <p className="mt-1 text-sm text-slate-600">Focused interface that keeps conversation first.</p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Welcome;
