import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, RefreshCw, AlertCircle, KeyRound, Globe } from 'lucide-react';
import { supabaseService } from '../lib/supabase';
import { SupabaseConfig } from '../types';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: SupabaseConfig;
  onConfigUpdated: () => void;
  onResetDemoData: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  config: propConfig,
  onConfigUpdated,
  onResetDemoData,
}) => {
  const config = propConfig || supabaseService.getConfig();
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'sql'>('connect');

  if (!isOpen) return null;

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setStatusMessage({ type: 'error', text: 'Both Supabase URL and Anon Key are required.' });
      setSaving(false);
      return;
    }

    try {
      await supabaseService.updateConfig(cleanUrl, cleanKey);
      setStatusMessage({ type: 'success', text: 'Supabase credentials verified & connected successfully!' });
      onConfigUpdated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not connect to Supabase. Check your URL and Key permissions.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleClear = async () => {
    setUrl('');
    setAnonKey('');
    await supabaseService.updateConfig('', '');
    onConfigUpdated();
    setStatusMessage({ type: 'success', text: 'Reset to local demo sandbox mode.' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-xs flex items-center justify-center px-2 py-3 sm:px-4">
      <div
        className="relative bg-white w-full max-w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Supabase Database & Realtime Setup</span>
                {config.isConnected && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Live Connected
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Connect your Supabase project with clients & invoices tables for live sync.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'connect'
                ? 'border-orange-500 text-orange-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            API Credentials & Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-orange-500 text-orange-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            SQL Table Migration Schema
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white">
          {statusMessage && (
            <div
              className={`p-3 text-xs rounded-xl mb-4 flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'connect' ? (
            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 font-semibold">How dueFox.co connects:</strong> The app uses{' '}
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">
                  @supabase/supabase-js
                </code>{' '}
                to execute SQL queries on <code className="font-mono text-orange-600 font-semibold">public.clients</code> and{' '}
                <code className="font-mono text-orange-600 font-semibold">public.invoices</code>, with live subscriptions via{' '}
                <code className="font-mono text-slate-800">supabase.channel()</code>. When no external credentials are provided,
                it uses a zero-latency local database with the exact same structure!
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://xyzproject.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon Public API Key
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onResetDemoData}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Starter Demo Data</span>
                  </button>
                  {config.isCustom && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3 py-1.5 text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>Save & Test Connection</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  SQL Schema for <code className="font-mono text-orange-600">clients</code> and{' '}
                  <code className="font-mono text-orange-600">invoices</code>:
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-xl overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                  {sqlScript}
                </pre>
              </div>

              <p className="text-[11px] text-slate-500">
                Tip: Paste this script into your Supabase Dashboard &gt; SQL Editor and click "Run". It creates tables, adds foreign keys, sets permissive RLS policies for testing, and enables realtime replication.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const sqlScript = `-- 1. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_link TEXT,
  chase_count INTEGER DEFAULT 0,
  last_chased_at TIMESTAMPTZ,
  chase_schedule TEXT DEFAULT 'standard',
  resumed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS resumed_at TIMESTAMPTZ;
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('pending', 'escalated', 'paid', 'paused'));

CREATE OR REPLACE FUNCTION public.set_invoice_resumed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'paused' AND NEW.status = 'pending' THEN
    NEW.resumed_at := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_set_resumed_at ON public.invoices;
CREATE TRIGGER invoices_set_resumed_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invoice_resumed_at();

-- 3. Create Profiles Table (for Company & Payment Settings)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  representative_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  phone TEXT,
  currency TEXT DEFAULT 'USD',
  business_address TEXT,
  tax_id TEXT,
  payment_link TEXT,
  upi_id TEXT,
  bank_account_holder TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_swift_code TEXT,
  bank_routing_code TEXT,
  plan TEXT DEFAULT 'free',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- 4. Enable Row Level Security (RLS) with open prototype policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
`;
