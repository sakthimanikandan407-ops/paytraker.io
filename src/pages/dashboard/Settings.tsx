import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
    User, 
    Building2, 
    ShieldCheck, 
    Save, 
    Loader2,
    CheckCircle2,
    Lock,
    Hash,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import type { Profile } from '../../types/database';
import { motion } from 'framer-motion';

const SettingsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [profile, setProfile] = useState<Partial<Profile>>({
        full_name: '',
        company_name: '',
        default_currency: 'USD',
        gst_number: '',
        logo_url: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();

        if (!error && data) {
            setProfile(data);
        }
        setLoading(false);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file || !user) return;

            // Basic validation
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('File too large (Max 2MB)');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            // 1. Check if bucket exists/accessible (optional but helpful)
            // We'll just try the upload and catch specific errors
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                if (uploadError.message.includes('bucket not found')) {
                    throw new Error('Storage bucket "avatars" not found. Please create it in Supabase dashboard.');
                }
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update state and DB
            setProfile(prev => ({ ...prev, logo_url: publicUrl }));
            
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ logo_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;
            
            setMessage({ type: 'success', text: 'Logo deployed to your brand identity.' });
        } catch (error: any) {
            console.error('Logo upload protocol failed:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Identity update failed. Check storage permissions.' 
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setSaving(true);
        setMessage(null);

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: profile.full_name,
                company_name: profile.company_name,
                default_currency: profile.default_currency,
                gst_number: profile.gst_number,
                logo_url: profile.logo_url
            });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Elite profile updated successfully.' });
            setTimeout(() => setMessage(null), 5000);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Workspace Settings</h1>
                    <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Configure your professional identity and defaults.</p>
                </div>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`px-6 py-3 rounded-2xl flex items-center gap-3 border font-bold text-sm ${
                            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                        {message.text}
                    </motion.div>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Brand Identity Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden p-10">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400 border border-violet-500/20">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">Brand Identity</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Logo and visual assets for your invoices.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group/logo">
                            <div className="min-w-[160px] max-w-[320px] h-40 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover/logo:border-indigo-500/50">
                                {profile.logo_url ? (
                                    <img src={profile.logo_url} alt="Logo" className="max-w-full max-h-full w-auto h-auto object-contain p-4" />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-600 px-4">
                                        <ImageIcon size={40} className="mb-2 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">No Logo</span>
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-indigo-600/0 group-hover/logo:bg-indigo-600/80 transition-all rounded-3xl opacity-0 group-hover/logo:opacity-100">
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                <div className="flex flex-col items-center text-white scale-90 group-hover/logo:scale-100 transition-transform">
                                    {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                    <span className="text-[10px] font-black uppercase tracking-widest mt-2 whitespace-nowrap">Upload</span>
                                </div>
                            </label>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">Logo Specifications</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Upload a high-resolution PNG or SVG logo. This will appear on all digital and PDF invoices sent to your clients. Recommended size: 512x512px.
                                </p>
                            </div>
                            {profile.logo_url && (
                                <button 
                                    type="button"
                                    onClick={() => setProfile({...profile, logo_url: ''})}
                                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
                                >
                                    Remove Logo
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden p-10">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">Identity</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">How you appear to your clients.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Full Name</label>
                            <input 
                                type="text"
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                                value={profile.full_name || ''}
                                onChange={e => setProfile({...profile, full_name: e.target.value})}
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Company Name</label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="text"
                                    className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                                    value={profile.company_name || ''}
                                    onChange={e => setProfile({...profile, company_name: e.target.value})}
                                    placeholder="Agency or Freelance Studio"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Details Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden p-10">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Hash size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">Tax & Localization</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Financial compliance and billing defaults.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Default Currency</label>
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setProfile({...profile, default_currency: 'USD'})}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-xs ${
                                        profile.default_currency === 'USD' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                    }`}
                                >
                                    🇺🇸 USD ($)
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setProfile({...profile, default_currency: 'INR'})}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-xs ${
                                        profile.default_currency === 'INR' ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                    }`}
                                >
                                    🇮🇳 INR (₹)
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">GST Number (Optional)</label>
                            <input 
                                type="text"
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all uppercase placeholder:normal-case font-mono"
                                value={profile.gst_number || ''}
                                onChange={e => setProfile({...profile, gst_number: e.target.value.toUpperCase()})}
                                placeholder="27XXXXX0000X1Z5"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Section (Placeholder) */}
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden p-10 opacity-60">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-500/10 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-500/20">
                            <Lock size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">Security</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Advanced encryption keys and access logs.</p>
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coming Soon</div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-600/40 transition-all hover:scale-[1.05] active:scale-[0.98] disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Protocol
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
