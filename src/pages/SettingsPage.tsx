import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { Settings, Cpu, Database, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'local'>('gemini');
  const [apiKey, setApiKey] = useState('●●●●●●●●●●●●●●●●●●●●●●●●');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            System Configuration & Model Settings
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement G • Provider abstraction, LLM settings, and collection thresholds
          </p>
        </div>

        <button onClick={handleSave} className="clay-button text-xs px-4 py-2 flex items-center gap-2">
          {saved ? <Check className="w-4 h-4 text-[#4C8768]" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Settings Saved' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* LLM Provider Selection */}
      <ClayCard className="p-6 bg-[#FDF9F0]">
        <div className="flex items-center gap-2 mb-4 border-b border-[#D8D3C8] pb-3">
          <Cpu className="w-5 h-5 text-[#3157D5]" />
          <h2 className="font-heading font-bold text-base text-[#171717]">
            LLM Provider Abstraction Config
          </h2>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div>
            <label className="font-mono font-semibold uppercase text-[#6E6A62] block mb-2">
              Select Reasoning & Explanation Provider
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'gemini', name: 'Google Gemini 3.6', desc: 'Default recommended for SIH' },
                { id: 'openai', name: 'OpenAI GPT-4o', desc: 'Alternative cloud provider' },
                { id: 'local', name: 'Local Ollama / Llama 3', desc: 'Self-hosted local engine' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setProvider(item.id as any)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    provider === item.id
                      ? 'bg-[#EAE6DD] border-[#3157D5] ring-2 ring-[#3157D5]/20 font-semibold'
                      : 'bg-[#FDF9F0] border-[#D8D3C8]'
                  }`}
                >
                  <span className="font-heading text-sm text-[#171717] block">{item.name}</span>
                  <span className="text-[11px] text-[#6E6A62] block mt-1">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono font-semibold uppercase text-[#6E6A62] block mb-1">
              API Authorization Key / Endpoint
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#EAE6DD] text-xs font-mono p-2.5 rounded border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
            />
          </div>
        </div>
      </ClayCard>
    </div>
  );
};
