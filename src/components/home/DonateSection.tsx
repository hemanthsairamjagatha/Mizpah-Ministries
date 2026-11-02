import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SiteSettings } from '../../types/database.types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Heart, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export interface DonateSectionProps {
  settings: SiteSettings | null;
}

export const DonateSection: React.FC<DonateSectionProps> = ({ settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const churchName = settings?.church_name || 'Mizpah Ministries';
  const email = settings?.contact_email || '';
  const phone = settings?.contact_phone || '';

  return (
    <section
      id="donating"
      className="bg-[#0B1325] text-white py-20 px-4 sm:px-6 lg:px-8 text-center border-t border-navy-900"
    >
      <div className="w-full max-w-[1100px] mx-auto flex flex-col items-center">
        <h2
          style={{ fontFamily: "'Inter', sans-serif", margin: '0px' }}
          className="font-inter text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white m-0"
        >
          Donating
        </h2>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            color: '#FFFFFF',
          }}
          className="donate-subtext font-inter text-white font-normal text-center"
        >
          {churchName} and its ministries see lives transformed - support us here
        </p>

        <div style={{ margin: '0px', padding: '0px' }} className="m-0 p-0">
          <Link
            to="/donate"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              margin: '0px',
            }}
            className="donate-button inline-flex items-center justify-center rounded-md border border-white text-white font-medium text-[20px] hover:bg-white hover:text-[#0B1325] transition-all cursor-pointer m-0 no-underline"
          >
            Donate Online
          </Link>
        </div>
      </div>

      {/* Online Giving Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Support ${churchName}`}
        description="Your generous giving helps us share the Gospel, serve the community, and transform lives."
        maxWidth="md"
      >
        <div className="space-y-5 text-left pt-1">
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-3">
            <Heart className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-navy-900">Faithful Stewardship</h4>
              <p className="text-xs text-navy-600 mt-1 leading-relaxed">
                Thank you for your willingness to give. Every contribution directly supports Sunday worship, youth outreach, pastoral care, and community missions.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-500">
              Direct Giving Information
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-600 font-medium">Account Name:</span>
                <span className="font-semibold text-navy-900">{churchName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-600 font-medium">Purpose:</span>
                <span className="font-semibold text-navy-900">Tithes & Offerings / Donations</span>
              </div>
              {(email || phone) && (
                <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-2 text-xs text-navy-600">
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      <span>{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      <span>{phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>All contributions are securely administered by the church leadership.</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
            <a
              href="#contact"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition"
            >
              <span>Contact Church Office</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Modal>
    </section>
  );
};
