import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormValues } from '../../lib/validation';
import { contactService } from '../../services/contactService';
import { campusService } from '../../services/campusService';
import type { SiteSettings, Campus } from '../../types/database.types';
import { toast } from 'sonner';
import { CheckCircle2, ChevronDown, Loader2, MapPin, ExternalLink } from 'lucide-react';

export interface ContactSectionProps {
  settings: SiteSettings | null;
}

const DEFAULT_SANCTUARY_ADDRESS = `MIZPAH MINISTRIES 
NO:1 KR COLONY,
PODILI ROAD, KANIGIRI,
MARKAPURAM (D)
ANDHRA PRADESH
INDIA. PIN-523230`;

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampusIndex, setSelectedCampusIndex] = useState(0);
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(true);

  const churchName = settings?.church_name || 'Mizpah Ministries';

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const data = await campusService.getPublishedCampuses();
        setCampuses(data);
        const primaryIdx = data.findIndex((c) => c.is_primary);
        if (primaryIdx >= 0) {
          setSelectedCampusIndex(primaryIdx);
        }
      } catch (err) {
        console.warn('Could not load campuses on contact section:', err);
      } finally {
        setIsLoadingCampuses(false);
      }
    };

    fetchCampuses();
  }, []);

  // Determine active campus or fallback to site settings
  const activeCampus: Campus | null = campuses.length > 0 ? (campuses[selectedCampusIndex] || campuses[0]) : null;

  const rawAddress = activeCampus?.address || settings?.address || DEFAULT_SANCTUARY_ADDRESS;
  const phone = activeCampus?.phone || settings?.contact_phone || '';
  const email = activeCampus?.email || settings?.contact_email || '';

  // Google Maps URL priority: active campus map_url -> site settings social_links.map_url -> Google Maps query fallback
  const customMapUrl = activeCampus?.map_url || (settings?.social_links as any)?.map_url;
  const fallbackMapUrl = rawAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawAddress.replace(/\n/g, ', '))}`
    : '#';
  const mapUrl = customMapUrl && customMapUrl.trim() ? customMapUrl.trim() : fallbackMapUrl;

  // Parse address lines cleanly
  const addressLines = rawAddress
    ? rawAddress.includes('\n')
      ? rawAddress.split('\n').map((s) => s.trim()).filter(Boolean)
      : rawAddress.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'Yes',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await contactService.submitContactMessage(data);
      toast.success('Your message has been sent to our church office. God bless you!');
      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <section
      id="contact"
      style={{ backgroundColor: '#F3F3F2' }}
      className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative border-t border-slate-200/60"
    >
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Left Card: Form (How can we help you?) */}
          <div
            className="lg:col-span-8 bg-white rounded-[20px] p-[48px_16px] sm:p-[32px] shadow-xs border border-slate-200/70 flex flex-col justify-between"
          >
            <div>
              <h2
                style={{ fontFamily: "'Inter', sans-serif", color: '#000000', margin: '0px 0px 48px' }}
                className="font-inter text-[24px] sm:text-[26px] font-bold text-black m-0 mb-[48px]"
              >
                How can we help you?
              </h2>

              {isSubmitted ? (
                <div className="py-8 flex flex-col items-center text-center space-y-3 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="font-inter text-xl font-bold text-navy-900"
                  >
                    Thank You for Connecting!
                  </h4>
                  <p className="text-xs sm:text-sm text-navy-600 max-w-md leading-relaxed">
                    Your inquiry has been safely received by our pastoral and campus team. We are praying for you and will get in touch shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="mt-3 inline-flex items-center justify-center px-6 py-2 rounded-full text-xs font-semibold text-white bg-[#1980CC] hover:bg-[#1670B3] transition-all cursor-pointer shadow-xs"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
                  {/* 1. What can we help you with?* (Textarea) */}
                  <div>
                    <label
                      htmlFor="message"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', margin: '32px 0px 0px', color: '#000000' }}
                      className="block text-[14px] font-normal text-black"
                    >
                      What can we help you with?<span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder=""
                      {...register('message')}
                      style={{ fontFamily: "'Inter', sans-serif", padding: '16px' }}
                      className={`w-full h-[128px] rounded-2xl border ${errors.message ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        } p-[16px] text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-1.5 focus:ring-[#1980CC] focus:border-transparent transition-all resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-[11px] text-rose-500">{errors.message.message}</p>
                    )}
                  </div>

                  {/* 2. Your Name* */}
                  <div>
                    <label
                      htmlFor="name"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', margin: '32px 0px 0px', color: '#000000' }}
                      className="block text-[14px] font-normal text-black"
                    >
                      Your Name<span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder=""
                      {...register('name')}
                      style={{ fontFamily: "'Inter', sans-serif", height: '47.6px', padding: '11px 16px' }}
                      className={`w-full h-[47.6px] rounded-full border ${errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        } px-[16px] py-[11px] text-sm text-navy-900 focus:outline-none focus:ring-1.5 focus:ring-[#1980CC] focus:border-transparent transition-all`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] text-rose-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* 3. Your email address* */}
                  <div>
                    <label
                      htmlFor="email"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', margin: '32px 0px 0px', color: '#000000' }}
                      className="block text-[14px] font-normal text-black"
                    >
                      Your email address<span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder=""
                      {...register('email')}
                      style={{ fontFamily: "'Inter', sans-serif", height: '47.6px', padding: '11px 16px' }}
                      className={`w-full h-[47.6px] rounded-full border ${errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                        } px-[16px] py-[11px] text-sm text-navy-900 focus:outline-none focus:ring-1.5 focus:ring-[#1980CC] focus:border-transparent transition-all`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-rose-500">{errors.email.message}</p>
                    )}
                  </div>

                  {/* 4. Your phone number */}
                  <div>
                    <label
                      htmlFor="phone"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', margin: '32px 0px 0px', color: '#000000' }}
                      className="block text-[14px] font-normal text-black"
                    >
                      Your phone number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder=""
                      {...register('phone')}
                      style={{ fontFamily: "'Inter', sans-serif", height: '47.6px', padding: '11px 16px' }}
                      className="w-full h-[47.6px] rounded-full border border-slate-300 px-[16px] py-[11px] text-sm text-navy-900 focus:outline-none focus:ring-1.5 focus:ring-[#1980CC] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* 5. Do you attend [Church Name]? */}
                  <div>
                    <label
                      htmlFor="subject"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', margin: '32px 0px 0px', color: '#000000' }}
                      className="block text-[14px] font-normal text-black"
                    >
                      Do you attend {churchName}?
                    </label>
                    <div className="relative">
                      <select
                        id="subject"
                        {...register('subject')}
                        style={{ fontFamily: "'Inter', sans-serif", height: '47.6px', padding: '11px 16px' }}
                        className="w-full h-[47.6px] rounded-full border border-slate-300 px-[16px] py-[11px] text-sm text-navy-900 bg-white focus:outline-none focus:ring-1.5 focus:ring-[#1980CC] focus:border-transparent transition-all appearance-none pr-10 cursor-pointer"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div style={{ margin: '32px 0px 0px' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="w-[136px] h-[34px] rounded-full inline-flex items-center justify-center text-xs sm:text-sm font-semibold text-white bg-[#1980CC] hover:bg-[#1670B3] shadow-xs transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </span>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Card: Campus Information */}
          <div
            className="lg:col-span-4 bg-white rounded-[20px] p-[48px_16px] sm:p-[32px] shadow-xs border border-slate-200/70 flex flex-col justify-start"
          >
            <h3
              style={{ fontFamily: "'Inter', sans-serif", margin: '0px 0px 48px' }}
              className="font-inter text-[24px] sm:text-[26px] font-bold text-slate-900 mb-[48px]"
            >
              Campus Information
            </h3>

            {/* Campus Selector if multiple campuses exist */}
            {campuses.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mb-6 pb-4 border-b border-slate-100">
                {campuses.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCampusIndex(idx)}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedCampusIndex === idx
                        ? 'bg-[#1980CC] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Has Campus Information */}
            {(rawAddress || phone || email) ? (
              <div className="space-y-4 sm:space-y-4.5">
                {/* Office Address */}
                {rawAddress && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        style={{ color: '#4CA7E3', fontFamily: "'Inter', sans-serif" }}
                        className="text-[11px] font-bold uppercase tracking-wider block"
                      >
                        OFFICE ADDRESS
                      </span>
                      {mapUrl && mapUrl !== '#' && (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1980CC] hover:underline"
                        >
                          <span>Open in Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="block text-xs sm:text-sm text-navy-900 leading-snug space-y-0.5 hover:underline cursor-pointer"
                    >
                      <p className="font-semibold text-slate-900">
                        {activeCampus ? activeCampus.name : churchName}
                      </p>
                      {addressLines.length > 0 && (
                        <div className="space-y-0.5">
                          {addressLines.map((line, idx) => (
                            <p key={idx} className="text-slate-700">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </a>
                  </div>
                )}

                {/* Phone */}
                {phone && (
                  <div>
                    <span
                      style={{ color: '#4CA7E3', fontFamily: "'Inter', sans-serif" }}
                      className="text-[11px] font-bold uppercase tracking-wider block mb-1.5"
                    >
                      PHONE
                    </span>
                    <a
                      href={`tel:${phone.replace(/\D/g, '')}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="block text-[#1980CC] hover:underline text-xs sm:text-sm font-normal"
                    >
                      {phone}
                    </a>
                  </div>
                )}

                {/* Email */}
                {email && (
                  <div>
                    <span
                      style={{ color: '#4CA7E3', fontFamily: "'Inter', sans-serif" }}
                      className="text-[11px] font-bold uppercase tracking-wider block mb-1.5"
                    >
                      EMAIL
                    </span>
                    <a
                      href={`mailto:${email}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="block text-[#1980CC] hover:underline text-xs sm:text-sm font-normal break-all"
                    >
                      {email}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* No Campus Configured Yet - Clean Placeholder */
              <div className="py-8 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6">
                <MapPin className="w-7 h-7 mx-auto text-sky-400 stroke-1.5" />
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-xs sm:text-sm font-semibold text-slate-800"
                >
                  {churchName}
                </p>
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed"
                >
                  Campus address and contact details will appear here once configured in the admin dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
