import React from "react";
import { Check, ShieldCheck, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      desc: "Perfect for quick, one-off file conversions.",
      features: [
        "500 MB Secure Cloud Storage",
        "25 MB Maximum Upload Size",
        "5 Conversions / Day",
        "Standard Conversion Speed",
        "Clean, Expiring Guest Mode",
      ],
      cta: "Get Started",
      href: "/register",
      popular: false,
      color: "border-border bg-card",
    },
    {
      name: "Pro Plan",
      price: "$9",
      period: "/ month",
      desc: "For professionals who need larger file limits and batch processing.",
      features: [
        "5 GB Secure Cloud Storage",
        "250 MB Maximum Upload Size",
        "Unlimited Conversions",
        "Priority Conversion Processing",
        "Batch File Processing",
        "PDF Password Security Tools",
        "Premium Email Support",
      ],
      cta: "Upgrade to Pro",
      href: "/register?plan=pro",
      popular: true,
      color: "border-primary/50 ring-2 ring-primary/20 bg-card shadow-lg shadow-primary/5",
    },
    {
      name: "Business Plan",
      price: "$29",
      period: "/ month",
      desc: "Best for teams and heavy users with large datasets.",
      features: [
        "50 GB Secure Cloud Storage",
        "500 MB Maximum Upload Size",
        "Unlimited Bulk Conversions",
        "Dedicated Conversion Pipelines",
        "Team Workspace Sharing",
        "Detailed Analytics Dashboard",
        "24/7 Priority Support",
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
      color: "border-border bg-card",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Honest Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Choose the Right Plan for You
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Start converting for free today. Upgrade anytime to unlock larger uploads, batch processing, and dedicated cloud storage.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`border rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative transition-all ${p.color}`}
          >
            {p.popular && (
              <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase rounded-full shadow-md">
                Most Popular
              </span>
            )}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{p.desc}</p>
              </div>
              <div className="flex items-baseline text-foreground">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{p.price}</span>
                {p.period && <span className="text-sm font-semibold text-muted-foreground ml-1">{p.period}</span>}
              </div>
              <div className="border-t border-border/40 my-6" />
              <ul className="space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start text-xs text-foreground font-medium">
                    <Check className="w-4 h-4 text-primary shrink-0 mr-2" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-4">
              <Link
                href={p.href}
                className={`block w-full py-3 px-4 rounded-xl text-center text-sm font-bold transition-all ${
                  p.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-md"
                    : "bg-muted/10 hover:bg-muted/15 text-foreground border border-border"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Guarantee Panel */}
      <div className="max-w-3xl mx-auto p-6 bg-gradient-to-tr from-blue-500/5 to-violet-500/5 border border-border/50 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <ShieldCheck className="w-10 h-10 text-primary shrink-0" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">100% Security Guarantee</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All files are stored in MongoDB GridFS inside our protected Atlas cluster. Guest files automatically expire within 1 hour. We never sell your data or read your files.
          </p>
        </div>
      </div>
    </div>
  );
}
