import React, { useState } from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: 'Free',
            price: { usd: 0, inr: 0 },
            description: 'Perfect for starting out.',
            features: ['3 Clients', '10 Invoices/month', 'Email Reminders', 'Standard Support'],
            cta: 'Start Free',
            highlight: false,
        },
        {
            name: 'Pro',
            price: { usd: 19, inr: 1599 },
            description: 'For growing freelancers.',
            features: ['Unlimited Clients', 'Unlimited Invoices', 'Priority Support', 'Advanced Analytics'],
            cta: 'Get Pro',
            highlight: true,
        },
        {
            name: 'Studio',
            price: { usd: 49, inr: 3999 },
            description: 'For small agencies.',
            features: ['Team Collaboration', 'White-label Invoices', 'Dedicated Account Manager', 'API Access'],
            cta: 'Contact Sales',
            highlight: false,
        },
    ];

    return (
        <section id="pricing" className="py-24 bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-slate-600 mb-8">Choose the plan that fits your business needs.</p>

                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm ${!isAnnual ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="w-12 h-6 bg-slate-200 rounded-full relative p-1 transition-colors hover:bg-slate-300"
                        >
                            <div className={`w-4 h-4 bg-indigo-600 rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm ${isAnnual ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Annual <span className="text-emerald-600 ml-1">(Save 20%)</span></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`p-8 rounded-3xl border ${plan.highlight ? 'border-indigo-600 bg-white shadow-2xl scale-105' : 'border-slate-200 bg-white/50'} relative`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                            <p className="text-slate-500 text-sm mb-6">{plan.description}</p>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900">
                                    ${isAnnual ? Math.floor(plan.price.usd * 0.8) : plan.price.usd}
                                </span>
                                <span className="text-slate-500">/mo</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-600">
                                        <Check className="text-emerald-500" size={16} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
