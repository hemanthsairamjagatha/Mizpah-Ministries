import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Building2,
  Save,
  RotateCcw,
  ExternalLink,
  Eye,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ImageUpload } from '../../components/common/ImageUpload';
import { donationService } from '../../services/donationService';
import { siteSettingsService } from '../../services/siteSettingsService';
import type { DonationDetails, SiteSettings } from '../../types/database.types';
import { toast } from 'sonner';

export const DonationManagerPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [details, setDetails] = useState<DonationDetails>(donationService.getDefaultDonationDetails());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [settingsData, donationData] = await Promise.all([
          siteSettingsService.getSiteSettings(),
          donationService.getDonationDetails(),
        ]);
        setSettings(settingsData);
        if (donationData) {
          setDetails(donationData);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field: keyof DonationDetails, value: string) => {
    setDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      await donationService.updateDonationDetails(details, settings);
      toast.success('Donation & Bank details updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save donation details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all bank and UPI details?')) {
      return;
    }

    setIsResetting(true);
    try {
      const cleared = await donationService.clearDonationDetails(settings);
      setDetails(cleared);
      toast.success('All donation details cleared');
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear details');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-inter text-2xl font-bold text-navy-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-sky-500" />
            Donation & Bank Details Manager
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Configure UPI QR code, UPI IDs, Account Beneficiary Name, Account Number, IFSC, and Bank Branch shown on the public Donate page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition border border-sky-100"
          >
            <Eye className="w-4 h-4" />
            <span>View Donate Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: UPI & QR Code Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-navy-900">
            <QrCode className="w-4 h-4 text-sky-500" />
            <span>Instant UPI & QR Code Configuration</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* QR Code Upload & Preview */}
            <div className="lg:col-span-5 space-y-4">
              <ImageUpload
                bucket="site-assets"
                folder="donations"
                label="UPI QR Code Image (JPG, PNG, WEBP)"
                currentImageUrl={details.qr_code_url || null}
                onImageUploaded={(url) => handleChange('qr_code_url', url)}
              />

              <div className="pt-2">
                <Input
                  label="QR Code Image Path / URL"
                  value={details.qr_code_url}
                  onChange={(e) => handleChange('qr_code_url', e.target.value)}
                  placeholder="Upload QR image above or paste image URL"
                  helperText="Upload a QR image file or enter URL directly"
                />
              </div>

              {details.qr_code_url && (
                <button
                  type="button"
                  onClick={() => handleChange('qr_code_url', '')}
                  className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 underline font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove QR image</span>
                </button>
              )}
            </div>

            {/* UPI IDs Inputs */}
            <div className="lg:col-span-7 space-y-5">
              <Input
                label="Primary UPI ID"
                placeholder="e.g. churchname@okhdfcbank"
                value={details.upi_id_primary}
                onChange={(e) => handleChange('upi_id_primary', e.target.value)}
                helperText="Displayed as the primary payment handle for donors"
              />

              <Input
                label="Secondary UPI ID"
                placeholder="e.g. churchname@upi"
                value={details.upi_id_secondary}
                onChange={(e) => handleChange('upi_id_secondary', e.target.value)}
                helperText="Optional backup UPI handle"
              />

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-navy-600 leading-relaxed">
                <span className="font-semibold text-navy-800">Note: </span>
                Enter your church's actual UPI IDs and QR code. Empty fields will simply display as empty on the public Donate page.
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Direct Bank Account Details */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-navy-900">
            <Building2 className="w-4 h-4 text-sky-500" />
            <span>Bank Account Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Account Beneficiary Name"
              placeholder="e.g. Mizpah Ministries Trust"
              value={details.account_name}
              onChange={(e) => handleChange('account_name', e.target.value)}
              helperText="Official registered account title"
            />

            <Input
              label="Account Number"
              placeholder="e.g. 50200012345678"
              value={details.account_number}
              onChange={(e) => handleChange('account_number', e.target.value)}
            />

            <Input
              label="Bank Name"
              placeholder="e.g. HDFC Bank, State Bank of India"
              value={details.bank_name}
              onChange={(e) => handleChange('bank_name', e.target.value)}
            />

            <Input
              label="Account Type"
              placeholder="e.g. Current Account, Savings Account"
              value={details.account_type}
              onChange={(e) => handleChange('account_type', e.target.value)}
            />

            <Input
              label="IFSC Code"
              placeholder="e.g. HDFC0001234"
              value={details.ifsc_code}
              onChange={(e) => handleChange('ifsc_code', e.target.value.toUpperCase())}
              helperText="11-character IFSC code"
            />

            <Input
              label="Branch Name"
              placeholder="e.g. Main City Branch"
              value={details.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
            />
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Live Public Donate Page Preview</span>
            </div>
            <span className="text-xs text-navy-500 font-medium">Updates in real time as you edit</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Preview Card 1: UPI & QR */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <h4 className="font-inter font-bold text-base text-navy-900">
                    Instant UPI QR Pay
                  </h4>
                  <p className="text-[11px] text-navy-500 mt-0.5">Scan using any UPI app</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200/70 mb-4 min-h-[180px]">
                  {details.qr_code_url ? (
                    <>
                      <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200">
                        <img
                          src={details.qr_code_url}
                          alt="UPI QR Code Preview"
                          width={160}
                          height={160}
                          className="w-[160px] h-[160px] object-contain rounded-md"
                        />
                      </div>
                      <p className="text-[11px] text-navy-600 mt-2 font-medium text-center">
                        Point camera or scan with GPay, PhonePe, Paytm
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <QrCode className="w-10 h-10 mx-auto mb-1 text-slate-300" />
                      <p className="text-xs font-medium text-slate-500">No QR Code uploaded</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] font-semibold text-navy-500 uppercase tracking-wider block mb-0.5">
                      Primary UPI ID
                    </span>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <span className="font-mono font-semibold text-navy-900 truncate">
                        {details.upi_id_primary || '—'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-navy-500 uppercase tracking-wider block mb-0.5">
                      Secondary UPI ID
                    </span>
                    <div className="flex items-center justify-between p-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs">
                      <span className="font-mono text-navy-700 truncate">
                        {details.upi_id_secondary || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card 2: Bank Account */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <h4 className="font-inter font-bold text-base text-navy-900">
                    Direct Bank Account Details
                  </h4>
                  <p className="text-[11px] text-navy-500 mt-0.5">For NEFT, RTGS, IMPS & Wire Transfers</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-medium text-slate-500 block">Account Beneficiary Name</span>
                    <span className="text-sm font-bold text-navy-900 block mt-0.5">
                      {details.account_name || '—'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
                    <span className="text-[10px] font-medium text-slate-500 block">Account Number</span>
                    <span className="font-mono text-base font-bold text-navy-900 block mt-0.5 tracking-wider">
                      {details.account_number || '—'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Bank Name</span>
                      <span className="font-semibold text-navy-900">{details.bank_name || '—'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Account Type</span>
                      <span className="font-semibold text-navy-900">{details.account_type || '—'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">IFSC Code</span>
                      <span className="font-mono font-bold text-navy-900">{details.ifsc_code || '—'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Branch</span>
                      <span className="font-semibold text-navy-900">{details.branch || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit & Reset Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClearAll}
            isLoading={isResetting}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="text-slate-600 hover:text-rose-600"
          >
            Clear All Details
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              leftIcon={<Save className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-md"
            >
              Save Donation Details
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
