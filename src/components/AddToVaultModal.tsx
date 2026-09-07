import React, { useState, useRef } from 'react';
import { VaultItem, VaultItemType, ReminderStep } from '../types';

interface AddToVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: VaultItem) => void;
  onStartScan: () => void;
}

export const AddToVaultModal: React.FC<AddToVaultModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  onStartScan,
}) => {
  const [selectedType, setSelectedType] = useState<VaultItemType | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNumber, setFullNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('$');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [notes, setNotes] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSelectType = (type: VaultItemType) => {
    setSelectedType(type);
    if (type === 'document') {
      setCategory('Document • ID');
      setSubtitle('Identity Card');
    } else if (type === 'subscription') {
      setCategory('Subscription • Service');
      setSubtitle('Digital Plan');
      setBillingCycle('Monthly');
    } else if (type === 'warranty') {
      setCategory('Hardware Warranty');
      setSubtitle('Product Protection');
    } else if (type === 'bill') {
      setCategory('Bill • Utility');
      setSubtitle('Recurring Invoice');
    } else if (type === 'reminder') {
      setCategory('Custom Reminder');
      setSubtitle('Important Deadline');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedType) return;

    let iconName = 'description';
    if (selectedType === 'subscription') iconName = 'subscriptions';
    else if (selectedType === 'warranty') iconName = 'verified_user';
    else if (selectedType === 'bill') iconName = 'receipt_long';
    else if (selectedType === 'reminder') iconName = 'notifications_active';

    // Calculate urgency days if expiryDate given
    let urgencyDays: number | undefined = undefined;
    if (expiryDate) {
      const exp = new Date(expiryDate);
      if (!isNaN(exp.getTime())) {
        urgencyDays = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      } else {
        urgencyDays = 90;
      }
    }

    const defaultReminders: ReminderStep[] = [
      {
        id: `rem-90-${Date.now()}`,
        daysBefore: 90,
        dateStr: '90 days prior',
        label: '90 days before expiry',
        status: 'upcoming',
      },
      {
        id: `rem-30-${Date.now()}`,
        daysBefore: 30,
        dateStr: '30 days prior',
        label: '30 days before expiry',
        status: 'upcoming',
      },
      {
        id: `rem-7-${Date.now()}`,
        daysBefore: 7,
        dateStr: '7 days prior',
        label: '7 days before expiry',
        status: 'upcoming',
      },
    ];

    const newItem: VaultItem = {
      id: `item-${Date.now()}`,
      type: selectedType,
      title: title.trim(),
      subtitle: subtitle.trim() || `${selectedType.toUpperCase()} Record`,
      category: category || 'General Vault',
      fullName: fullName.trim() || undefined,
      fullNumber: (fullNumber || serialNumber).trim() || undefined,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      maskedNumber: fullNumber || serialNumber ? `•••••${(fullNumber || serialNumber).trim().slice(-4)}` : undefined,
      status: urgencyDays !== undefined && urgencyDays <= 30 ? 'attention' : 'active',
      urgencyDays: urgencyDays,
      urgencyText: expiryDate ? `Expires: ${expiryDate}` : undefined,
      issueDate: issueDate.trim() || undefined,
      expiryDate: expiryDate.trim() || undefined,
      cost: cost ? parseFloat(cost) : undefined,
      currency: currency || '$',
      billingCycle: selectedType === 'subscription' ? billingCycle : undefined,
      notes: notes.trim() || 'Saved to encrypted LifeVault storage.',
      scanImageUrl: attachedImage || undefined,
      iconName,
      createdAt: new Date().toISOString(),
      tags: ['VAULTED', selectedType.toUpperCase()],
      reminders: defaultReminders,
    };

    onAddItem(newItem);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType(null);
    setTitle('');
    setSubtitle('');
    setCategory('');
    setFullName('');
    setFullNumber('');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setIssueDate('');
    setExpiryDate('');
    setCost('');
    setCurrency('$');
    setBillingCycle('Monthly');
    setNotes('');
    setAttachedImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Hidden file attachment input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Backdrop */}
      <div
        id="modal-backdrop"
        onClick={handleClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fadeIn cursor-pointer"
      />

      {/* Bottom Sheet Modal */}
      <div
        id="bottom-sheet"
        className="relative w-full max-w-lg bg-[#1a1a1a] rounded-t-[2rem] sm:rounded-[2rem] z-10 shadow-2xl overflow-hidden animate-slideUp border border-white/10 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="pt-3 pb-2 px-6 flex flex-col items-center border-b border-white/5 bg-[#141414]">
          <div className="w-12 h-1.5 bg-white/20 rounded-full mb-2" />
          <div className="w-full flex justify-between items-center">
            <h2 className="text-base md:text-lg font-bold text-white">
              {selectedType ? `Add New ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}` : 'What do you want to add?'}
            </h2>
            {selectedType ? (
              <button
                type="button"
                onClick={() => setSelectedType(null)}
                className="text-xs font-bold text-indigo-400 hover:text-white"
              >
                Change Type
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-bold text-white/40 hover:text-white"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto">
          {!selectedType ? (
            <div className="space-y-4">
              {/* Scan Shortcut */}
              <div
                onClick={() => {
                  handleClose();
                  onStartScan();
                }}
                className="p-4 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-indigo-600/25 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40">
                    <span className="material-symbols-outlined text-[24px]">document_scanner</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      Smart AI Document Scanner
                      <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">
                        GEMINI AI
                      </span>
                    </div>
                    <div className="text-xs text-white/50">
                      Scan camera, photo, or PDF with auto-extraction
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-indigo-400 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>

              {/* 5 Distinct Categories */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Document */}
                <button
                  id="add-document-btn"
                  onClick={() => handleSelectType('document')}
                  className="bg-[#141414] hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer active:scale-98 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">description</span>
                  </div>
                  <span className="text-xs font-bold text-white">Document</span>
                  <span className="text-[10px] text-white/40">Passport, ID, License</span>
                </button>

                {/* 2. Subscription */}
                <button
                  id="add-subscription-btn"
                  onClick={() => handleSelectType('subscription')}
                  className="bg-[#141414] hover:bg-white/5 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer active:scale-98 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">subscriptions</span>
                  </div>
                  <span className="text-xs font-bold text-white">Subscription</span>
                  <span className="text-[10px] text-white/40">Adobe, Netflix, Cloud</span>
                </button>

                {/* 3. Warranty */}
                <button
                  id="add-warranty-btn"
                  onClick={() => handleSelectType('warranty')}
                  className="bg-[#141414] hover:bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer active:scale-98 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <span className="text-xs font-bold text-white">Warranty</span>
                  <span className="text-[10px] text-white/40">Hardware, Gadgets, Car</span>
                </button>

                {/* 4. Bill / Receipt */}
                <button
                  id="add-bill-btn"
                  onClick={() => handleSelectType('bill')}
                  className="bg-[#141414] hover:bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer active:scale-98 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                  </div>
                  <span className="text-xs font-bold text-white">Bill / Receipt</span>
                  <span className="text-[10px] text-white/40">Invoices, Utilities, Tax</span>
                </button>

                {/* 5. Custom Reminder */}
                <button
                  id="add-reminder-btn"
                  onClick={() => handleSelectType('reminder')}
                  className="col-span-2 bg-[#141414] hover:bg-white/5 border border-dashed border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex items-center justify-between transition-colors cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">notifications_active</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Custom Reminder</div>
                      <div className="text-[10px] text-white/40">Set custom alerts for renewals & checkups</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-white/40">chevron_right</span>
                </button>
              </div>
            </div>
          ) : (
            /* Detailed Custom Form for Selected Type */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Scan Shortcut inside form */}
              <div
                onClick={() => {
                  handleClose();
                  onStartScan();
                }}
                className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-between cursor-pointer hover:bg-indigo-600/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-[18px]">document_scanner</span>
                  <span className="text-xs text-indigo-300 font-semibold">
                    Auto-fill with AI Scanner instead?
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full">
                  SCAN
                </span>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                  Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedType === 'document'
                      ? 'e.g. United States Passport'
                      : selectedType === 'subscription'
                      ? 'e.g. Adobe Creative Cloud'
                      : selectedType === 'warranty'
                      ? 'e.g. MacBook Pro 16" Warranty'
                      : selectedType === 'bill'
                      ? 'e.g. Electric Utility Bill'
                      : 'e.g. Annual Health Checkup'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subtitle & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Primary Identity"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Document specific fields */}
              {selectedType === 'document' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                      Full Name (Holder)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                      Document Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A12345678"
                      value={fullNumber}
                      onChange={(e) => setFullNumber(e.target.value)}
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Warranty specific fields */}
              {selectedType === 'warranty' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                        Brand / Manufacturer
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apple, Sony, Dyson"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                        Model / Spec
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. M3 Max 36GB"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. C02G789HKLM"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {/* Dates & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                    {selectedType === 'subscription' || selectedType === 'bill'
                      ? 'Renewal / Due Date'
                      : 'Expiry / Valid Till'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 24, 2026"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {(selectedType === 'subscription' || selectedType === 'bill' || selectedType === 'warranty') && (
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                      {selectedType === 'warranty' ? 'Purchase Price' : 'Price / Fee'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-[#141414] border border-white/10 rounded-xl px-2 py-2 text-xs text-white"
                      >
                        <option value="$">$</option>
                        <option value="EUR">€</option>
                        <option value="GBP">£</option>
                        <option value="BDT">৳</option>
                        <option value="INR">₹</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="59.99"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="flex-1 bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Subscription billing cycle */}
              {selectedType === 'subscription' && (
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                    Billing Cycle
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Monthly', 'Yearly', 'Weekly', 'Quarterly'].map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setBillingCycle(cycle)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          billingCycle === cycle
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : 'bg-[#141414] text-white/50 border-white/5'
                        }`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Terms, policy number, store details, or reminder triggers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* File / Receipt Attachment */}
              <div className="bg-[#141414] border border-dashed border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/40 text-[20px]">attach_file</span>
                  <span className="text-xs text-white/60">
                    {attachedImage ? 'Receipt / Document Attached' : 'Attach Scan / Receipt'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold text-indigo-400 cursor-pointer"
                >
                  {attachedImage ? 'Replace' : 'Upload'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
