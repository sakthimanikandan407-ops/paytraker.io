import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do automatic reminders work?',
    answer: 'PayTrack automatically monitors your invoices. When an invoice approaches its due date, or if it becomes overdue, PayTrack sends highly professional email reminders on a pre-configured schedule. You can set the frequency and tone of the follow-ups.',
  },
  {
    question: 'What is Dodo Payments, and is it secure?',
    answer: 'Dodo Payments is our verified global payment gateway partner. They process payment cards, UPI, and bank transfers using bank-grade AES-256 encryption. We never store your clients credit card information on our servers.',
  },
  {
    question: 'Can I import my existing client base?',
    answer: 'Yes! Inside the PayTrack dashboard, you can easily add clients manually or import them via a CSV file. Once imported, you can track their billing history and configure automated payment rules.',
  },
  {
    question: 'Are there any hidden fees or commission cuts?',
    answer: 'No. PayTrack does not take any percentage or commission cut from your invoice settlements. You pay only the flat monthly or annual fee for your chosen pricing tier, plus standard payment gateway processing fees charged by Dodo Payments.',
  },
  {
    question: 'Is there a setup time to activate international payments?',
    answer: 'None at all. Your workspace supports both USD ($) and INR (₹) by default. You can instantly toggle currencies when creating any invoice or billing plan.',
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/5 rounded-full blur-[140px] -z-10" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-2xl">
            💡 Clarifications & Questions
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Frequently Asked <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Questions</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium">
            Everything you need to know about the platform, subscriptions, and integrations.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="group rounded-[2rem] bg-white/5 border border-white/10 hover:border-indigo-500/30 overflow-hidden transition-all duration-350"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-8 py-7 flex items-center justify-between text-left gap-4"
                >
                  <div className="flex items-center gap-4">
                    <HelpCircle size={20} className="text-indigo-400 shrink-0" />
                    <span className="text-base md:text-lg font-black text-white tracking-tight">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-indigo-600 border-indigo-500 text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    <ChevronDown size={16} />
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-60 border-t border-white/5' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <div className="px-8 py-6 text-sm md:text-base text-slate-400 font-semibold leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
