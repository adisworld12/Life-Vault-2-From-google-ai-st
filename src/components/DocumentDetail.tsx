import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { VaultItem } from '../types';
import { downloadCalendarEvent, getGoogleCalendarUrl } from '../utils/calendar';

interface DocumentDetailProps {
  item: VaultItem;
  onBack: () => void;
  onUpdateItem: (updatedItem: VaultItem) => void;
  onDeleteItem: (id: string) => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  item,
  onBack,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newAlertDays, setNewAlertDays] = useState('30');
  const [newAlertLabel, setNewAlertLabel] = useState('');
  const [renewalSuccess, setRenewalSuccess] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    title: item.title || '',
    subtitle: item.subtitle || '',
    category: item.category || '',
    fullName: item.fullName || '',
    fullNumber: item.fullNumber || '',
    brand: item.brand || '',
    model: item.model || '',
    serialNumber: item.serialNumber || '',
    issueDate: item.issueDate || '',
    expiryDate: item.expiryDate || '',
    notes: item.notes || '',
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRenewNow = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10B981', '#ffffff'],
    });

    const updatedReminders = (item.reminders || []).map((r) => ({
      ...r,
      status: 'completed' as const,
    }));

    const updatedItem: VaultItem = {
      ...item,
      status: 'active',
      urgencyDays: 3650,
      urgencyText: 'Renewed for 10 Years',
      expiryDate: '14 March 2038',
      reminders: [
        ...updatedReminders,
        {
          id: `rem-${Date.now()}`,
          daysBefore: 90,
          dateStr: '90 days before new expiry',
          label: '90 days before new expiry',
          status: 'upcoming',
        },
      ],
    };

    onUpdateItem(updatedItem);
    setRenewalSuccess(true);
    setTimeout(() => setRenewalSuccess(false), 5000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: VaultItem = {
      ...item,
      title: formData.title,
      subtitle: formData.subtitle,
      category: formData.category,
      fullName: formData.fullName,
      fullNumber: formData.fullNumber,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      maskedNumber: formData.fullNumber ? `•••••${formData.fullNumber.slice(-4)}` : item.maskedNumber,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate,
      notes: formData.notes,
    };
    onUpdateItem(updated);
    setIsEditing(false);
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(newAlertDays, 10) || 30;
    const newStep = {
      id: `rem-custom-${Date.now()}`,
      daysBefore: days,
      dateStr: `${days} days before expiry`,
      label: newAlertLabel || `${days} days before expiry`,
      status: 'upcoming' as const,
    };

    const updatedReminders = [...(item.reminders || []), newStep].sort(
      (a, b) => b.daysBefore - a.daysBefore
    );

    onUpdateItem({
      ...item,
      reminders: updatedReminders,
    });

    setShowAddAlertModal(false);
    setNewAlertLabel('');
  };

  const handleAddToCalendar = () => {
    downloadCalendarEvent(item);
  };

  const handleGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(item), '_blank');
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LifeVault - ${item.title} Official Record</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; background: #fff; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #6366f1; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .card { background: #f8f9ff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 4px; }
            .val { font-size: 16px; font-weight: 600; }
            .scan-img { max-width: 100%; border-radius: 8px; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">LifeVault Official Record</div>
              <div>${item.title} — ${item.subtitle}</div>
            </div>
            <div style="font-size: 12px; color: #666;">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="grid">
            <div class="card"><div class="label">Document Type</div><div class="val">${item.type.toUpperCase()}</div></div>
            <div class="card"><div class="label">Category</div><div class="val">${item.category}</div></div>
            <div class="card"><div class="label">Full Name</div><div class="val">${item.fullName || 'N/A'}</div></div>
            <div class="card"><div class="label">ID / Number</div><div class="val">${item.fullNumber || item.maskedNumber || 'N/A'}</div></div>
            <div class="card"><div class="label">Issue Date</div><div class="val">${item.issueDate || 'N/A'}</div></div>
            <div class="card"><div class="label">Expiry Date</div><div class="val">${item.expiryDate || 'N/A'}</div></div>
          </div>
          <div class="card"><div class="label">Notes</div><div class="val">${item.notes || 'None'}</div></div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isUrgent = item.status === 'attention' || (item.urgencyDays !== undefined && item.urgencyDays <= 30);

  return (
    <main className="px-4 md:px-6 pt-4 pb-28 max-w-4xl mx-auto space-y-6">
      {/* Renewal Celebration Toast */}
      {renewalSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-[#1a1a1a] border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-[22px] text-emerald-400">verified</span>
          <div>
            <div className="font-bold">Record Successfully Renewed!</div>
            <div className="text-white/50">Next lifecycle alert scheduled.</div>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <section className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-lg">
            <span className="material-symbols-outlined text-[36px]">
              {item.iconName || 'description'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-white/5 rounded-md text-[11px] font-semibold text-white/60">
                {item.category}
              </span>
              {isUrgent && (
                <span className="px-2 py-0.5 bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-full">
                  Action Needed
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{item.title}</h1>
            <p className="text-xs text-white/50">{item.subtitle}</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            {isEditing ? 'Cancel Edit' : 'Edit Details'}
          </button>

          <button
            onClick={handleRenewNow}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">autorenew</span>
            Renew Document
          </button>
        </div>
      </section>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column (2 cols): Details & Attachments */}
        <div className="md:col-span-2 space-y-5">
          {/* Edit Form or Read-only Display */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="bg-[#1a1a1a] rounded-[2rem] border border-white/10 p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white mb-2">Edit Document Fields</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Document Number / ID</label>
                  <input
                    type="text"
                    value={formData.fullNumber}
                    onChange={(e) => setFormData({ ...formData, fullNumber: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-red-400 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white mb-2">Verified Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    Cardholder / Holder
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {item.fullName || 'Registered User'}
                  </div>
                </div>

                {/* ID / Serial with Mask Toggle */}
                <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                      Document / ID Number
                    </div>
                    <div className="text-sm font-mono font-bold text-indigo-400">
                      {isRevealed
                        ? item.fullNumber || item.maskedNumber || 'A12345678'
                        : item.maskedNumber || (item.fullNumber ? `•••••${item.fullNumber.slice(-4)}` : '••••••••')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsRevealed(!isRevealed)}
                      className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                      title={isRevealed ? 'Hide number' : 'Reveal number'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isRevealed ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.fullNumber || '', 'ID')}
                      className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                      title="Copy to clipboard"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copiedField === 'ID' ? 'done' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Issue Date */}
                <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    Issue / Registration Date
                  </div>
                  <div className="text-sm text-white/80">{item.issueDate || 'N/A'}</div>
                </div>

                {/* Expiry Date */}
                <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    Expiration Date
                  </div>
                  <div className="text-sm font-bold text-red-400">{item.expiryDate || 'N/A'}</div>
                </div>

                {/* Brand / Model if available */}
                {item.brand && (
                  <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                      Brand / Manufacturer
                    </div>
                    <div className="text-sm text-white font-semibold">{item.brand}</div>
                  </div>
                )}
                {item.model && (
                  <div className="bg-[#141414] p-3.5 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                      Model / Specification
                    </div>
                    <div className="text-sm text-white font-semibold">{item.model}</div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="bg-[#141414] p-4 rounded-2xl border border-white/5 mt-3">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    Notes & Coverage Details
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{item.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Attached Document Scan / Photo Preview */}
          {item.scanImageUrl && (
            <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 p-6 shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-white">Original Document Attachment</h2>
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                  Full Screen
                </button>
              </div>

              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer group max-h-64 bg-black flex items-center justify-center"
              >
                <img
                  src={item.scanImageUrl}
                  alt={item.title}
                  className="w-full h-auto object-contain max-h-64 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black/70 px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">zoom_in</span> Click to Enlarge
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Calendar, Lifecycle Reminders & Tools */}
        <div className="space-y-5">
          {/* Expiry Status & Calendar Sync Card */}
          <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Lifecycle Status</h3>

            <div className="bg-[#141414] p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="text-xs text-white/50">Time Remaining</div>
              <div className="text-2xl font-bold text-red-400">
                {item.urgencyDays !== undefined ? `${item.urgencyDays} Days` : 'Active'}
              </div>
              <p className="text-[11px] text-white/40">
                Target Expiration: <span className="text-white/70 font-semibold">{item.expiryDate}</span>
              </p>
            </div>

            {/* Calendar Integration Action */}
            <div className="space-y-2 pt-1">
              <button
                id="add-to-calendar-btn"
                onClick={handleAddToCalendar}
                className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Add to Device Calendar (.ics)
              </button>
              <button
                onClick={handleGoogleCalendar}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">event</span>
                Open in Google Calendar
              </button>
            </div>
          </div>

          {/* Scheduled Reminders List */}
          <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 p-5 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Reminder Schedule</h3>
              <button
                onClick={() => setShowAddAlertModal(true)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
              >
                + Add Alert
              </button>
            </div>

            <div className="space-y-2">
              {(item.reminders || []).map((rem) => (
                <div
                  key={rem.id}
                  className="bg-[#141414] p-3 rounded-xl border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        rem.status === 'completed'
                          ? 'text-emerald-400'
                          : rem.status === 'active'
                          ? 'text-indigo-400'
                          : 'text-white/40'
                      }`}
                    >
                      {rem.status === 'completed' ? 'check_circle' : 'notifications'}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">{rem.label}</div>
                      <div className="text-[10px] text-white/40">{rem.dateStr}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rem.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    {rem.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Print / Export Record */}
          <div className="space-y-2">
            <button
              onClick={handleDownloadPDF}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print / Save Verified PDF
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 bg-transparent hover:bg-red-500/10 text-red-400/70 hover:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete Record from Vault
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Alert Modal */}
      {showAddAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/10 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Expiry Alert</h3>

            <form onSubmit={handleAddAlert} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                  Days Before Expiration
                </label>
                <select
                  value={newAlertDays}
                  onChange={(e) => setNewAlertDays(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="180">180 Days Before (6 Months)</option>
                  <option value="90">90 Days Before (3 Months)</option>
                  <option value="60">60 Days Before (2 Months)</option>
                  <option value="30">30 Days Before (1 Month)</option>
                  <option value="14">14 Days Before (2 Weeks)</option>
                  <option value="7">7 Days Before (1 Week)</option>
                  <option value="1">1 Day Before</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                  Alert Label / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule passport appointment"
                  value={newAlertLabel}
                  onChange={(e) => setNewAlertLabel(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAlertModal(false)}
                  className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-md"
                >
                  Set Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-[2rem] border border-red-500/30 p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="text-base font-bold text-white">Delete Document?</h3>
            <p className="text-xs text-white/50">
              Are you sure you want to permanently remove <span className="text-white font-semibold">{item.title}</span> from your vault?
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteItem(item.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold shadow-md shadow-red-600/30"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Attachment */}
      {isLightboxOpen && item.scanImageUrl && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={item.scanImageUrl}
            alt={item.title}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
      )}
    </main>
  );
};
