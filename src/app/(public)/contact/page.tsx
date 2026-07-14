"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, ShieldCheck, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
      {/* Contact Info */}
      <div className="md:col-span-1 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-foreground">Contact Us</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Have questions about subscriptions, API limits, or our storage practices? Reach out and we'll reply within 24 hours.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm text-foreground">
            <Mail className="w-5 h-5 text-primary shrink-0" />
            <span>support@convertflow.com</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-foreground">
            <MessageSquare className="w-5 h-5 text-primary shrink-0" />
            <span>Live Chat available for Pro users</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="md:col-span-2 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Message Sent!</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Thank you for contacting us. Our team will review your inquiry and reach out shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-primary hover:underline mt-4 cursor-pointer"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2 mt-2 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3.5 py-2 mt-2 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3.5 py-2 mt-2 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md hover:bg-primary/95 transition-all cursor-pointer"
            >
              <span>Send Message</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
