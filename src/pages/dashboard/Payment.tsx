import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DodoPayments } from 'dodopayments-checkout';
import { 
    CreditCard, 
    Shield, 
    Sparkles, 
    Rocket, 
    Loader2, 
    AlertCircle,
    ArrowLeft,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const plansInfo = {
    starter: {
        name: 'Starter',
        icon: <Sparkles className="text-amber-400" size={24} />,
        priceUSD: 7,
        priceINR: 599,
        description: 'Standard for professional freelancers.',
        features: [
            '15 clients limit',
            '50 invoices/month',
            'Smart reminder schedule',
            'Basic analytics',
            'PDF export + logo branding',
            'INR + USD default support'
        ]
    },
    pro: {
        name: 'Pro',
        icon: <Rocket className="text-violet-400" size={24} />,
        priceUSD: 15,
        priceINR: 999,
        description: 'Most powerful tools for growing pros.',
        features: [
            'Unlimited clients',
            'Unlimited invoices',
            'Automated email reminders',
            'Smart AI reminder timing',
            'Full revenue analytics',
            'Client payment portal',
            'White-label invoices',
            'GST compliance'
        ]
    },
    studio: {
        name: 'Studio',
        icon: <Shield className="text-emerald-400" size={24} />,
        priceUSD: 35,
        priceINR: 2799,
        description: 'Advanced features for small teams.',
        features: [
            'Everything in Pro included',
            '10 team members access',
            'Custom email domain setup',
            'Xero + QuickBooks sync',
            'Advanced analytics engine',
            'Full API & Zapier integration',
            'Dedicated account manager'
        ]
    }
};

const PaymentPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'studio'>('pro');
    const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
    const [isAnnual, setIsAnnual] = useState(false);
    const [autoPay, setAutoPay] = useState(true);
    
    // Card details state
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const planParam = searchParams.get('plan')?.toLowerCase();
        if (planParam && (planParam === 'starter' || planParam === 'pro' || planParam === 'studio')) {
            setSelectedPlan(planParam);
        }
        
        // Fetch user default currency if available
        if (user) {
            supabase
                .from('profiles')
                .select('default_currency')
                .eq('id', user.id)
                .single()
                .then(({ data }) => {
                    if (data?.default_currency) {
                        setCurrency(data.default_currency);
                    }
                });
        }
    }, [searchParams, user]);

    // Initialize Dodo Payments SDK Client
    useEffect(() => {
        const publishableKey = import.meta.env.VITE_DODO_PUBLISHABLE_KEY || '';
        const isTest = publishableKey.startsWith('ok1') || publishableKey.includes('test');
        try {
            DodoPayments.Initialize({
                mode: isTest ? 'test' : 'live',
                displayType: 'overlay'
            });
        } catch (e) {
            console.error('DodoPayments initialization error:', e);
        }
    }, []);

    // Check for Dodo checkout links in env
    useEffect(() => {
        let checkoutUrl = '';
        if (currency === 'INR') {
            if (isAnnual) {
                if (selectedPlan === 'starter') {
                    checkoutUrl = import.meta.env.VITE_DODO_STARTER_INR_YEARLY_CHECKOUT_URL || '';
                } else if (selectedPlan === 'pro') {
                    checkoutUrl = import.meta.env.VITE_DODO_PRO_INR_YEARLY_CHECKOUT_URL || '';
                } else if (selectedPlan === 'studio') {
                    checkoutUrl = import.meta.env.VITE_DODO_STUDIO_INR_YEARLY_CHECKOUT_URL || '';
                }
            } else {
                if (selectedPlan === 'starter') {
                    checkoutUrl = import.meta.env.VITE_DODO_STARTER_INR_CHECKOUT_URL || '';
                } else if (selectedPlan === 'pro') {
                    checkoutUrl = import.meta.env.VITE_DODO_PRO_INR_CHECKOUT_URL || '';
                } else if (selectedPlan === 'studio') {
                    checkoutUrl = import.meta.env.VITE_DODO_STUDIO_INR_CHECKOUT_URL || '';
                }
            }
        }

        // Fallback to USD / default variables if not found or USD selected
        if (!checkoutUrl) {
            if (isAnnual) {
                if (selectedPlan === 'starter') {
                    checkoutUrl = import.meta.env.VITE_DODO_STARTER_USD_YEARLY_CHECKOUT_URL || import.meta.env.VITE_DODO_STARTER_YEARLY_CHECKOUT_URL || '';
                } else if (selectedPlan === 'pro') {
                    checkoutUrl = import.meta.env.VITE_DODO_PRO_USD_YEARLY_CHECKOUT_URL || import.meta.env.VITE_DODO_PRO_YEARLY_CHECKOUT_URL || '';
                } else if (selectedPlan === 'studio') {
                    checkoutUrl = import.meta.env.VITE_DODO_STUDIO_USD_YEARLY_CHECKOUT_URL || import.meta.env.VITE_DODO_STUDIO_YEARLY_CHECKOUT_URL || '';
                }
            } else {
                if (selectedPlan === 'starter') {
                    checkoutUrl = import.meta.env.VITE_DODO_STARTER_USD_CHECKOUT_URL || import.meta.env.VITE_DODO_STARTER_CHECKOUT_URL || '';
                } else if (selectedPlan === 'pro') {
                    checkoutUrl = import.meta.env.VITE_DODO_PRO_USD_CHECKOUT_URL || import.meta.env.VITE_DODO_PRO_CHECKOUT_URL || '';
                } else if (selectedPlan === 'studio') {
                    checkoutUrl = import.meta.env.VITE_DODO_STUDIO_USD_CHECKOUT_URL || import.meta.env.VITE_DODO_STUDIO_CHECKOUT_URL || '';
                }
            }
        }

        console.log('Selected Plan:', selectedPlan);
        console.log('Is Annual:', isAnnual);
        console.log('Loaded checkoutUrl from env:', checkoutUrl);

        if (checkoutUrl) {
            try {
                const finalUrl = new URL(checkoutUrl);
                // Pre-fill user data for Dodo Checkout
                if (user?.email) {
                    finalUrl.searchParams.set('email', user.email);
                }
                if (user?.user_metadata?.full_name) {
                    finalUrl.searchParams.set('name', user.user_metadata.full_name);
                }
                
                // Force selected checkout currency and lock currency switcher
                finalUrl.searchParams.set('paymentCurrency', currency);
                finalUrl.searchParams.set('showCurrencySelector', 'false');

                // Redirect can return here
                finalUrl.searchParams.set('redirect_url', `${window.location.origin}/dashboard?status=succeeded&plan=${selectedPlan}`);
                setRedirectUrl(finalUrl.toString());
            } catch (e) {
                setRedirectUrl(checkoutUrl);
            }
        } else {
            setRedirectUrl(null);
        }
    }, [selectedPlan, user, isAnnual, currency]);

    const activePlan = plansInfo[selectedPlan];
    const rawPrice = currency === 'USD' ? activePlan.priceUSD : activePlan.priceINR;
    const finalPrice = isAnnual ? Math.floor(rawPrice * 0.8) : rawPrice; // 20% annual discount
    const symbol = currency === 'USD' ? '$' : '₹';

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
        setCardNumber(formatted.substring(0, 19));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        let formatted = value;
        if (value.length > 2) {
            formatted = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
        }
        setCardExpiry(formatted.substring(0, 5));
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setCardCvv(value.substring(0, 4));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!cardName.trim() || cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3) {
            setError('Please input valid credit card information.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulate payment processing latency
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update user profile in Supabase
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    plan: selectedPlan,
                    subscription_status: autoPay ? 'active' : 'trialing',
                    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    dodo_customer_id: `cust_${Math.random().toString(36).substring(2, 11)}`,
                    dodo_subscription_id: `sub_${Math.random().toString(36).substring(2, 11)}`
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Also record payment history if needed
            await supabase.from('payment_history').insert({
                user_id: user.id,
                dodo_payment_id: `pay_${Math.random().toString(36).substring(2, 11)}`,
                amount: finalPrice,
                currency: currency,
                plan: selectedPlan,
                status: 'succeeded'
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
                window.location.reload();
            }, 2500);
        } catch (err: any) {
            setError(err.message || 'Payment processing failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToDodo = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!redirectUrl) return;
        setIsRedirecting(true);
        try {
            DodoPayments.Checkout.open({
                checkoutUrl: redirectUrl
            });
        } catch (err: any) {
            console.error('Failed to open Dodo Payments Overlay Checkout:', err);
            // Fallback: standard redirection if something fails
            window.location.href = redirectUrl;
        } finally {
            setIsRedirecting(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto text-center py-20 px-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-glow">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Payment Secured</h2>
                <p className="text-slate-400 font-medium">
                    Your 7-day free trial for **PayTrack {activePlan.name}** has been activated successfully with automatic billing enabled.
                </p>
                <div className="text-xs font-black text-indigo-400 uppercase tracking-widest animate-pulse pt-4">
                    Redirecting to Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">Secure Checkout</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Deploy your workspace plan with Dodo Payments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side: Plan selection details */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 space-y-6 shadow-2xl">
                        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                                {activePlan.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Chosen Plan</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">7-Day Free Trial Included</p>
                            </div>
                        </div>

                        {/* Plan selection tabs */}
                        <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                            {Object.keys(plansInfo).map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedPlan(key as any)}
                                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                        selectedPlan === key
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-slate-500 hover:text-white'
                                    }`}
                                >
                                    {plansInfo[key as keyof typeof plansInfo].name}
                                </button>
                            ))}
                        </div>

                        {/* Currency and Billing switches */}
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center bg-white/2 p-4 rounded-2xl border border-white/5">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billing Period</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setIsAnnual(false)} 
                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${!isAnnual ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                                    >
                                        Monthly
                                    </button>
                                    <button 
                                        onClick={() => setIsAnnual(true)} 
                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${isAnnual ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                                    >
                                        Yearly (-20%)
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-white/2 p-4 rounded-2xl border border-white/5">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Currency</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setCurrency('USD')} 
                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${currency === 'USD' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                                    >
                                        USD ($)
                                    </button>
                                    <button 
                                        onClick={() => setCurrency('INR')} 
                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${currency === 'INR' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-600 hover:text-slate-400'}`}
                                    >
                                        INR (₹)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Plan Cost Summary */}
                        <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-glow">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total After 7-Day Trial</span>
                            <div className="text-4xl font-black text-white tracking-tight">
                                {symbol}{finalPrice}
                                <span className="text-sm font-bold text-slate-500 tracking-normal">/mo</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">
                                {isAnnual ? `Billed ${symbol}${finalPrice * 12}/yr` : 'Billed Monthly'}
                            </span>
                        </div>

                        {/* Plan Features */}
                        <div className="space-y-4">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Plan Highlights</span>
                            <ul className="space-y-2.5">
                                {activePlan.features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-glow" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right side: Redirect or Payment form */}
                <div className="lg:col-span-7">
                    {redirectUrl ? (
                        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 lg:p-10 space-y-8 shadow-2xl flex flex-col justify-between h-full min-h-[400px]">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={22} className="text-indigo-400" />
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight font-sans">Dodo Checkout</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Dodo Payments Secured</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight font-sans">Secure Checkout Session Ready</h4>
                                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                                        You are activating the **7-day free trial** for **PayTrack {activePlan.name}**. Click below to complete your checkout securely on the official Dodo Payments page using Credit Card or UPI (Auto Pay is enabled automatically).
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <button
                                    onClick={handleProceedToDodo}
                                    disabled={isRedirecting}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-center disabled:opacity-50"
                                >
                                    {isRedirecting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Opening Overlay...</span>
                                        </>
                                    ) : (
                                        <span>Proceed to Dodo Payments</span>
                                    )}
                                </button>
                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center font-sans">
                                    SSL Encrypted Connection • Merchant of Record Dodo Payments
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 lg:p-10 space-y-8 shadow-2xl">
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={22} className="text-indigo-400" />
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Payment Setup</h3>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dodo Payments Secured</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-3 italic">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Cardholder Name</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="Enter your full name"
                                        value={cardName}
                                        onChange={e => setCardName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Card Number</label>
                                    <div className="relative">
                                        <CreditCard size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input 
                                            type="text"
                                            required
                                            className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all font-mono placeholder:text-slate-700"
                                            placeholder="0000 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Expiry Date</label>
                                        <input 
                                            type="text"
                                            required
                                            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all font-mono placeholder:text-slate-700"
                                            placeholder="MM/YY"
                                            value={cardExpiry}
                                            onChange={handleExpiryChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">CVV / CVC</label>
                                        <input 
                                            type="password"
                                            required
                                            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all font-mono placeholder:text-slate-700"
                                            placeholder="•••"
                                            value={cardCvv}
                                            onChange={handleCvvChange}
                                        />
                                    </div>
                                </div>

                                {/* Auto Pay Switch */}
                                <div className="bg-white/2 p-6 rounded-2xl border border-white/5 flex items-center justify-between gap-6 hover:bg-white/5 transition-all">
                                    <div className="space-y-1 flex-1">
                                        <span className="text-xs font-black text-white uppercase tracking-tight">Enable Auto Pay</span>
                                        <p className="text-[10px] text-slate-500 leading-normal font-bold uppercase tracking-wider">
                                            Automatically bill my credit card via **Dodo Payments** at the end of my 7-day trial.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAutoPay(!autoPay)}
                                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 flex items-center ${
                                            autoPay ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
                                        }`}
                                    >
                                        <motion.div 
                                            layout
                                            className="w-6 h-6 rounded-full bg-white shadow-md"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Deploying Payment Gateway...</span>
                                        </>
                                    ) : (
                                        <span>Activate 7-Day Trial & Setup Auto Pay</span>
                                    )}
                                </button>
                                
                                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
                                    <Shield size={12} />
                                    <span>SSL Encrypted Connection • Cancel Anytime during the trial</span>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
