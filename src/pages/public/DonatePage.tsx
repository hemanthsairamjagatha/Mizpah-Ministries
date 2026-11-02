import React, { useEffect, useState } from 'react';
import { Copy, Check, Download, QrCode } from 'lucide-react';
import Seo from '../../components/Seo';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { GivingInitiativesSection } from '../../components/donate/GivingInitiativesSection';
import { siteSettingsService } from '../../services/siteSettingsService';
import { donationService } from '../../services/donationService';
import type { SiteSettings, DonationDetails } from '../../types/database.types';
import { toast } from 'sonner';

export const DonatePage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [donationDetails, setDonationDetails] = useState<DonationDetails>(donationService.getDefaultDonationDetails());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dynamic Bank & UPI Details (no hardcoded defaults)
  const bankDetails = {
    accountName: donationDetails.account_name || '',
    accountNumber: donationDetails.account_number || '',
    bankName: donationDetails.bank_name || '',
    accountType: donationDetails.account_type || '',
    ifscCode: donationDetails.ifsc_code || '',
    branch: donationDetails.branch || '',
    upiIdPrimary: donationDetails.upi_id_primary || '',
    upiIdSecondary: donationDetails.upi_id_secondary || '',
    qrCodeUrl: donationDetails.qr_code_url || '',
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const fetchData = async () => {
      try {
        const [settingsData, detailsData] = await Promise.all([
          siteSettingsService.getSiteSettings(),
          donationService.getDonationDetails(),
        ]);
        setSettings(settingsData);
        if (detailsData) {
          setDonationDetails(detailsData);
        }
      } catch (err) {
        console.error('Failed to load settings on donate page:', err);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Seo path="/donate" />
      <Navbar settings={settings} />

      <main className="flex-grow pt-[100px]">
        {/* Giving Hero Section */}
        <section className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Dark Dim Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/donate-hero.jpg"
              alt="Giving"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'brightness(0.9)',
              }}
            />
            {/* Dark overlay for optimal text contrast and matching reference */}
            <div className="absolute inset-0 bg-black/50 sm:bg-black/45" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-20 sm:py-24 space-y-5 animate-in fade-in duration-500">
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.18em',
              }}
              className="font-inter text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-md uppercase leading-tight"
            >
              GIVING
            </h1>

            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="font-inter text-base sm:text-lg text-white/95 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-xs"
            >
              Thank you for taking a moment to consider giving with us. Every gift fuels what God is doing in our communities and around the world, sharing His Good News by serving others in His name.
            </p>

            <div className="pt-1">
              <a
                href="#ways-to-give"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('ways-to-give')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="font-inter text-base sm:text-lg text-white underline underline-offset-4 hover:text-sky-200 transition-colors cursor-pointer"
              >
                Explore ways to give.
              </a>
            </div>
          </div>
        </section>

        {/* Core Giving Details Section */}
        <section
          id="ways-to-give"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 border-b border-slate-100 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="font-inter text-2xl sm:text-3xl font-bold text-navy-900"
              >
                Choose Your Preferred Giving Method
              </h2>
              <p className="text-sm text-navy-600 mt-2">
                All donations directly advance Sunday worship, youth fellowship, and community benevolent outreach.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Card 1: UPI & QR Code (Instant Scan & Pay) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="pb-4 border-b border-slate-100 mb-6">
                    <h3 className="font-inter font-bold text-lg text-navy-900">
                      Instant UPI QR Pay
                    </h3>
                    <p className="text-xs text-navy-500 mt-0.5">Scan using any UPI app</p>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/70 mb-6">
                    {bankDetails.qrCodeUrl ? (
                      <>
                        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200">
                          <img
                            src={bankDetails.qrCodeUrl}
                            alt="UPI QR Code"
                            width={220}
                            height={220}
                            className="w-[220px] h-[220px] object-contain rounded-lg"
                          />
                        </div>
                        <p className="text-xs text-navy-600 mt-3 font-medium text-center">
                          Point camera or scan with Google Pay, PhonePe, Paytm, or BHIM
                        </p>
                        <a
                          href={bankDetails.qrCodeUrl}
                          download="church-donation-qr.png"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download QR Code Image</span>
                        </a>
                      </>
                    ) : (
                      <div className="py-8 text-center text-slate-400">
                        <QrCode className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-medium text-slate-600">QR Code will be updated soon</p>
                      </div>
                    )}
                  </div>

                  {/* Primary UPI ID Box */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider block mb-1">
                        Primary UPI ID
                      </span>
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="font-mono text-sm font-semibold text-navy-900 break-all select-all">
                          {bankDetails.upiIdPrimary || '—'}
                        </span>
                        {bankDetails.upiIdPrimary && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bankDetails.upiIdPrimary, 'Primary UPI ID')}
                            className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition shrink-0"
                            title="Copy UPI ID"
                          >
                            {copiedField === 'Primary UPI ID' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Secondary UPI ID */}
                    {bankDetails.upiIdSecondary && (
                      <div>
                        <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider block mb-1">
                          Secondary UPI ID
                        </span>
                        <div className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                          <span className="font-mono text-xs font-medium text-navy-700 break-all select-all">
                            {bankDetails.upiIdSecondary}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bankDetails.upiIdSecondary, 'Secondary UPI ID')}
                            className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-sky-600 bg-white border border-slate-200 hover:bg-slate-50 transition shrink-0"
                          >
                            {copiedField === 'Secondary UPI ID' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Bank Account Details (NEFT / RTGS / IMPS) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="pb-4 border-b border-slate-100 mb-6">
                    <h3 className="font-inter font-bold text-lg text-navy-900">
                      Direct Bank Account Details
                    </h3>
                    <p className="text-xs text-navy-500 mt-0.5">For NEFT, RTGS, IMPS & Wire Transfers</p>
                  </div>

                  {/* Account Details List */}
                  <div className="space-y-4">
                    {/* Account Name */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-medium text-slate-500 block">Account Beneficiary Name</span>
                        <span className="text-sm sm:text-base font-bold text-navy-900 block mt-0.5 select-all">
                          {bankDetails.accountName || '—'}
                        </span>
                      </div>
                      {bankDetails.accountName && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bankDetails.accountName, 'Account Name')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:text-sky-600 hover:border-sky-300 transition shrink-0"
                        >
                          {copiedField === 'Account Name' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Account Number */}
                    <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-medium text-slate-500 block">Account Number</span>
                        <span className="font-mono text-base sm:text-lg font-bold text-navy-900 block mt-0.5 tracking-wider select-all">
                          {bankDetails.accountNumber || '—'}
                        </span>
                      </div>
                      {bankDetails.accountNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account Number')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-700 bg-white border border-sky-200 hover:bg-sky-50 transition shrink-0"
                        >
                          {copiedField === 'Account Number' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Grid of Bank Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Bank Name */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-medium text-slate-500 block">Bank Name</span>
                        <span className="text-sm font-semibold text-navy-900 block mt-0.5">
                          {bankDetails.bankName || '—'}
                        </span>
                      </div>

                      {/* Account Type */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-medium text-slate-500 block">Account Type</span>
                        <span className="text-sm font-semibold text-navy-900 block mt-0.5">
                          {bankDetails.accountType || '—'}
                        </span>
                      </div>

                      {/* IFSC Code */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-500 block">IFSC Code</span>
                          <span className="font-mono text-sm font-bold text-navy-900 block mt-0.5 select-all">
                            {bankDetails.ifscCode || '—'}
                          </span>
                        </div>
                        {bankDetails.ifscCode && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(bankDetails.ifscCode, 'IFSC Code')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 bg-white border border-slate-200 transition"
                            title="Copy IFSC Code"
                          >
                            {copiedField === 'IFSC Code' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Branch Name */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-medium text-slate-500 block">Branch</span>
                        <span className="text-sm font-semibold text-navy-900 block mt-0.5">
                          {bankDetails.branch || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Giving Initiatives & Impact Section (Alternating cards matching Founder's page) */}
        <GivingInitiativesSection />
      </main>

      <Footer settings={settings} />
    </div>
  );
};
