import React, { useState } from 'react';

export type InfoModalType = 'privacy' | 'terms' | 'support' | 'about' | null;

interface InfoModalsProps {
  modalType: InfoModalType;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({ modalType, onClose }) => {
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  if (!modalType) return null;

  const faqs = [
    {
      q: 'How does LifeVault encrypt my sensitive documents?',
      a: 'All items are encrypted client-side using standard AES-256 GCM encryption. Your master password and hardware biometric keys never leave your secure enclave.',
    },
    {
      q: 'Can anyone at LifeVault view my passports or IDs?',
      a: 'No. LifeVault is built with a zero-knowledge architecture. Neither server administrators nor third parties can decrypt your data without your master passphrase.',
    },
    {
      q: 'How do automated expiration and renewal alerts work?',
      a: 'When you scan or register a document, LifeVault schedules local reminder stages (e.g. 180, 90, 30 days before expiry) and notifies you before critical renewal deadlines.',
    },
    {
      q: 'Can I export an offline backup of my records?',
      a: 'Yes! Navigate to the Data & Backup section and tap "Export Data" to generate a portable encrypted JSON file of your entire vault.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn cursor-pointer"
      />

      <div className="relative w-full max-w-xl bg-[#1a1a1a] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden z-10 animate-slideUp max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 px-6 border-b border-white/5 flex justify-between items-center bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">
                {modalType === 'privacy' && 'security'}
                {modalType === 'terms' && 'description'}
                {modalType === 'support' && 'support_agent'}
                {modalType === 'about' && 'info'}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {modalType === 'privacy' && 'Privacy Policy'}
                {modalType === 'terms' && 'Terms of Service'}
                {modalType === 'support' && 'Help & Support'}
                {modalType === 'about' && 'About LifeVault'}
              </h2>
              <p className="text-xs text-white/50">
                {modalType === 'privacy' && 'Zero-knowledge encryption & client security'}
                {modalType === 'terms' && 'Vault rules & acceptable use policy'}
                {modalType === 'support' && 'Frequently asked questions & direct assistance'}
                {modalType === 'about' && 'System architecture & cryptographic specifications'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-4 text-xs text-white/70 leading-relaxed">
          {modalType === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified_user</span>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Zero-Knowledge Guarantee</h4>
                  <p className="text-white/60">
                    LifeVault operates on a zero-knowledge security standard. Your documents, IDs, and financial records are encrypted with keys derived strictly on your device.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">1. Information Collection</h4>
                <p>
                  We do not sell, rent, or monetize your personally identifiable documents or metadata. All file parsing occurs on-device or within sandboxed hardware enclaves.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">2. Biometric Data</h4>
                <p>
                  Face ID, Touch ID, and Fingerprint authentications are handled directly by your device operating system security subsystem. LifeVault never stores or transmits raw biometric credentials.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">3. Local & Cloud Storage</h4>
                <p>
                  If Cloud Sync is enabled, all payloads are encrypted before transmission. Only ciphertext is stored in the cloud.
                </p>
              </div>
            </div>
          )}

          {modalType === 'terms' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">1. Agreement to Terms</h4>
                <p>
                  By accessing or utilizing LifeVault, you agree to comply with all applicable digital recordkeeping standards and personal data protection regulations.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">2. Security Responsibility</h4>
                <p>
                  You are solely responsible for retaining your master PIN, recovery passphrase, and secure device access. Because of our zero-knowledge encryption, lost keys cannot be recovered by customer support.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1.5">3. Acceptable Use</h4>
                <p>
                  LifeVault is designed for storing personal identification documents, warranties, subscriptions, and receipts. Storing unauthorized or unlawful materials is strictly prohibited.
                </p>
              </div>
            </div>
          )}

          {modalType === 'support' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-white text-sm mb-3">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setFaqOpenIndex(faqOpenIndex === index ? null : index)}
                        className="w-full p-3.5 px-4 text-left flex justify-between items-center text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className="material-symbols-outlined text-[18px] text-white/40">
                          {faqOpenIndex === index ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {faqOpenIndex === index && (
                        <div className="p-3.5 px-4 pt-0 text-white/50 text-xs border-t border-white/5">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <h4 className="font-bold text-white text-sm mb-2">Contact Vault Concierge</h4>
                {supportSubmitted ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center text-emerald-400 font-bold">
                    Message received! A security specialist will reply within 2 hours.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (supportMessage.trim()) {
                        setSupportSubmitted(true);
                      }
                    }}
                    className="space-y-3"
                  >
                    <textarea
                      required
                      placeholder="Describe any issue, renewal bug, or question..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-[#141414] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {modalType === 'about' && (
            <div className="space-y-4">
              <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 text-center space-y-2">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-xl shadow-indigo-600/30 border border-indigo-400/30">
                  L
                </div>
                <h3 className="text-base font-bold text-white">LifeVault • Bento Edition</h3>
                <p className="text-xs text-indigo-400 font-mono">Version 2.4.0 (Build 9042)</p>
                <p className="text-xs text-white/50 max-w-sm mx-auto">
                  The ultimate intelligent digital vault for IDs, passports, warranties, subscriptions, and expiration notices.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                  <span className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">
                    Encryption
                  </span>
                  <span className="text-xs font-bold text-white">AES-256-GCM</span>
                </div>
                <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                  <span className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">
                    Key Derivation
                  </span>
                  <span className="text-xs font-bold text-white">PBKDF2-SHA512</span>
                </div>
                <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                  <span className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">
                    Storage Mode
                  </span>
                  <span className="text-xs font-bold text-emerald-400">Zero-Knowledge</span>
                </div>
                <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                  <span className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">
                    Enclave Status
                  </span>
                  <span className="text-xs font-bold text-emerald-400">Hardware Locked</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/5 bg-[#141414] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
