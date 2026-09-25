import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PricingPlan } from '../../types';
import { formatBytes } from '../../utils/imageCompression';
import {
  X,
  CreditCard,
  Building,
  User,
  Copy,
  Check,
  UploadCloud,
  FileImage,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan | null;
  billingCycle: 'monthly' | 'annual';
  discountPercent?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  billingCycle,
  discountPercent = 0,
}) => {
  const { systemSettings, currentUser, submitPaymentRequest, addToast } = useApp();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  // Voucher screenshot file & preview
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    email: string;
    planName: string;
    amount: number;
    transactionId?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail(currentUser?.email || '');
      setFullName(currentUser?.full_name || '');
      setTransactionId('');
      setNotes('');
      setVoucherFile(null);
      setVoucherPreview(null);
      setIsSubmitted(false);
      setSubmittedData(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !plan) return null;

  // Calculate final amount
  const basePrice = billingCycle === 'annual' ? plan.annual_price : plan.monthly_price;
  const billedCycles = billingCycle === 'annual' ? 12 : 1;
  const rawTotal = basePrice * billedCycles;
  const finalAmount =
    discountPercent > 0
      ? Number((rawTotal * (1 - discountPercent / 100)).toFixed(2))
      : rawTotal;

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addToast('Copied to Clipboard', `${fieldName} copied!`, 'info');
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Voucher file upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Invalid File Format', 'Please upload an image screenshot of your payment voucher (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast('File Too Large', 'Voucher screenshot size must be less than 15 MB.', 'error');
      return;
    }

    setVoucherFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setVoucherPreview(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setVoucherFile(null);
    setVoucherPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      addToast('Valid Email Required', 'Please provide a valid contact email address.', 'error');
      return;
    }

    if (!voucherPreview || !voucherFile) {
      addToast('Voucher Screenshot Required', 'Please upload a screenshot or photo of your payment voucher/receipt.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await submitPaymentRequest({
        plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle: billingCycle,
        amount: finalAmount,
        currency: 'USD',
        customer_email: cleanEmail,
        customer_name: fullName.trim() || undefined,
        transaction_id: transactionId.trim() || undefined,
        voucher_url: voucherPreview,
        voucher_file_name: voucherFile.name,
        voucher_file_size: voucherFile.size,
        notes: notes.trim() || undefined,
      });

      setSubmittedData({
        id: created.id,
        email: created.customer_email,
        planName: created.plan_name,
        amount: created.amount,
        transactionId: created.transaction_id,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      addToast('Submission Failed', err.message || 'Unable to submit payment request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bank Info from system settings or fallback defaults
  const bankName = systemSettings.bank_name || 'Meezan Bank Ltd / Standard Chartered';
  const accountTitle = systemSettings.account_title || 'ImgSphere Cloud Media Global';
  const accountNumber = systemSettings.account_number || '0102-0103492810';
  const accountIban = systemSettings.account_iban || 'PK36MEZN0001020103492810';
  const instructions =
    systemSettings.payment_instructions ||
    'Transfer the plan subscription amount to the official bank account listed above. Once payment is made, upload the voucher screenshot and submit your email below.';
  const rawContactNote = systemSettings.payment_contact_note;
  const contactNote =
    !rawContactNote || rawContactNote.includes('Hamari team')
      ? 'Our team will contact you within 24 hours to verify payment and activate your premium plan.'
      : rawContactNote;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                Upgrade to {plan.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Bank Transfer & Payment Voucher Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* If successfully submitted */}
          {isSubmitted && submittedData ? (
            <div className="text-center py-6 px-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Voucher Successfully Received</span>
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Payment Request Submitted!
                </h2>

                {/* 24-Hour Contact Guarantee Banner */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 max-w-lg mx-auto text-sm font-semibold leading-relaxed shadow-xs">
                  <div className="flex items-center justify-center gap-2 mb-1 text-amber-700 dark:text-amber-400 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>24-Hour Contact Guarantee</span>
                  </div>
                  <p className="text-base text-amber-950 dark:text-amber-100 font-bold">
                    &ldquo;Our team will contact you within 24 hours to activate your plan.&rdquo;
                  </p>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 font-normal">
                    Our billing team is verifying your payment voucher slip. Once approved, your account storage and premium features will be activated immediately.
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-left max-w-md mx-auto text-xs space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Selected Plan:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submittedData.planName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Billed Amount:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">${submittedData.amount} USD</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Account Email:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submittedData.email}</span>
                </div>
                {submittedData.transactionId && (
                  <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Transaction Ref:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{submittedData.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Request ID:</span>
                  <span className="font-mono text-slate-500">{submittedData.id}</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plan Pricing Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-blue-600/10 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                      {plan.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {billingCycle === 'annual' ? 'Annual Plan (12 Mo)' : 'Monthly Plan'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Includes {plan.storage_gb} GB Cloud Storage • Max {plan.max_file_mb} MB/file • Ultra CDN Bandwidth
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ${finalAmount} <span className="text-xs font-normal text-slate-500">USD</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{discountPercent}% Discount Applied</span>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 1: Official Bank Account Details */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Step 1: Transfer Payment to Our Official Account
                    </h4>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg">
                    Verified Account
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {instructions}
                </p>

                {/* Account Details Table */}
                <div className="space-y-2 text-xs">
                  {/* Bank Name */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Building className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Bank / Institution</div>
                        <div className="font-bold text-slate-900 dark:text-white">{bankName}</div>
                      </div>
                    </div>
                  </div>

                  {/* Account Title */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Account Title</div>
                        <div className="font-bold text-slate-900 dark:text-white">{accountTitle}</div>
                      </div>
                    </div>
                  </div>

                  {/* Account Number with Copy */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Account Number</div>
                        <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 tracking-wider">
                          {accountNumber}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(accountNumber, 'Account Number')}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center gap-1 text-[11px] transition-colors"
                    >
                      {copiedField === 'Account Number' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* IBAN with Copy */}
                  {accountIban && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">International IBAN</div>
                          <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 tracking-wider">
                            {accountIban}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(accountIban, 'IBAN')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 text-[11px] transition-colors"
                      >
                        {copiedField === 'IBAN' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2: Submit Voucher & Account Email */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Step 2: Enter Email & Upload Paid Voucher Screenshot
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Your upgrade confirmation & invoice will be sent to this email.
                    </p>
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Transaction Reference ID / Slip No.
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. TXN-892401928"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Found on your banking receipt or SMS confirmation.
                    </p>
                  </div>
                </div>

                {/* Voucher Screenshot File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Paid Voucher Screenshot / Receipt Image <span className="text-rose-500">*</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="voucher-upload-input"
                  />

                  {voucherPreview && voucherFile ? (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={voucherPreview}
                          alt="Voucher Screenshot Preview"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {voucherFile.name}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Ready to submit • {formatBytes(voucherFile.size)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Remove screenshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-white/60 dark:bg-slate-900/60 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all"
                    >
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to upload Paid Voucher Screenshot
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Supports PNG, JPG, JPEG, or WebP screenshot files up to 15 MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Additional Instructions / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Paid from Easypaisa/Meezan app under the name John Doe."
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Guarantee Note Banner */}
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{contactNote}</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Voucher slips are audited by our administration team. Once verified, your account is immediately upgraded.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !voucherPreview || !email.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting Voucher...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Payment Voucher (${finalAmount})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
