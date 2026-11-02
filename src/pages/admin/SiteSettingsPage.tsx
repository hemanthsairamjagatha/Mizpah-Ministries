import React, { useEffect, useState } from 'react';
import { siteSettingsService } from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { ImageUpload } from '../../components/common/ImageUpload';
import { toast } from 'sonner';
import { Settings, Save, Church, Mail, Phone, MapPin, Share2, CreditCard, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_SANCTUARY_ADDRESS = `MIZPAH MINISTRIES 
NO:1 KR COLONY,
PODILI ROAD, KANIGIRI,
MARKAPURAM (D)
ANDHRA PRADESH
INDIA. PIN-523230`;

export const SiteSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [churchName, setChurchName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState(DEFAULT_SANCTUARY_ADDRESS);
  const [footerDescription, setFooterDescription] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [twitter, setTwitter] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await siteSettingsService.getSiteSettings();
      if (data) {
        setSettings(data);
        setChurchName(data.church_name || '');
        setLogoPath(data.logo_path || '');
        setShortDescription(data.short_description || '');
        setContactEmail(data.contact_email || '');
        setContactPhone(data.contact_phone || '');
        setAddress(data.address || DEFAULT_SANCTUARY_ADDRESS);
        setFooterDescription(data.footer_description || '');

        const socials = data.social_links || {};
        setFacebook(socials.facebook || '');
        setInstagram(socials.instagram || '');
        setYoutube(socials.youtube || '');
        setTwitter(socials.twitter || '');
        setMapUrl(socials.map_url || '');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchName.trim()) {
      toast.error('Church name is required');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await siteSettingsService.saveSiteSettings(settings?.id, {
        church_name: churchName,
        logo_path: logoPath || '/images/logo.png',
        short_description: shortDescription || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        address: address || null,
        footer_description: footerDescription || null,
        social_links: {
          ...((settings?.social_links as any) || {}),
          facebook,
          instagram,
          youtube,
          twitter,
          map_url: mapUrl.trim() || undefined,
        },
      });

      setSettings(updated);
      toast.success('Site settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="font-inter text-2xl font-bold text-navy-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-sky-500" />
          Site Settings & Church Identity
        </h1>
        <p className="text-sm text-navy-500 mt-1">
          Configure branding, church name, contact details, sanctuary address, and social links
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand & Identity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-navy-900">
            <Church className="w-4 h-4 text-sky-500" />
            <span>Church Name & Branding</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Church Official Name"
                placeholder="e.g. Mizpah Ministries"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                required
              />
              <Textarea
                label="Header / Hero Short Description"
                rows={3}
                placeholder="A Christ-centered sanctuary dedicated to faith, community, worship, and service."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div>
              <ImageUpload
                bucket="site-assets"
                folder="logos"
                label="Church Logo (PNG, SVG, or WEBP)"
                currentImageUrl={logoPath}
                onImageUploaded={(url) => setLogoPath(url)}
              />
            </div>
          </div>
        </div>

        {/* Contact Info & Physical Address */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-navy-900">
            <MapPin className="w-4 h-4 text-sky-500" />
            <span>Contact Information & Sanctuary Address</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Email Address"
              type="email"
              placeholder="hello@mizpahministries.org"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              label="Contact Phone / Prayer Line"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <Textarea
            label="Sanctuary Street Address"
            rows={4}
            placeholder="Enter sanctuary address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Google Maps Location URL"
            placeholder="e.g. https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            helperText="When visitors click on the church address or location on the website, they will be redirected to this Google Maps link."
          />

          <Textarea
            label="Footer Description"
            rows={2}
            placeholder="Welcome to Mizpah Ministries. We are a warm, welcoming community of believers seeking to know Christ..."
            value={footerDescription}
            onChange={(e) => setFooterDescription(e.target.value)}
          />
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-navy-900">
            <Share2 className="w-4 h-4 text-sky-500" />
            <span>Social Media Channels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Facebook Page URL"
              placeholder="https://facebook.com/..."
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />
            <Input
              label="Instagram Profile URL"
              placeholder="https://instagram.com/..."
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
            <Input
              label="YouTube Channel URL"
              placeholder="https://youtube.com/@..."
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
            />
            <Input
              label="Twitter / X Profile URL"
              placeholder="https://twitter.com/..."
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
            />
          </div>
        </div>

        
        {/* Campus Information Shortcut */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span>Campus Locations & Contact Information</span>
            </div>
            <Link
              to="/admin/campuses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <span>Manage Campuses</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-navy-500 leading-relaxed">
            Configure church campus locations, office addresses, phone numbers, contact emails, and campus links displayed on the Contact page.
          </p>
          <div className="pt-1">
            <Link to="/admin/campuses">
              <Button type="button" variant="outline" size="sm">
                Open Campuses Manager →
              </Button>
            </Link>
          </div>
        </div>

        {/* Donation & Bank Details Shortcut */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <CreditCard className="w-4 h-4 text-sky-500" />
              <span>Online Giving & Bank Account Details</span>
            </div>
            <Link
              to="/admin/donate"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <span>Manage Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-navy-500 leading-relaxed">
            Configure the UPI QR Code, Primary & Secondary UPI IDs, Bank Beneficiary Name, Account Number, IFSC, and Branch shown on the public Donate page.
          </p>
          <div className="pt-1">
            <Link to="/admin/donate">
              <Button type="button" variant="outline" size="sm">
                Open Donation Details Manager →
              </Button>
            </Link>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-5 h-5" />}
            className="shadow-md"
          >
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
