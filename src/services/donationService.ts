import { siteSettingsService } from './siteSettingsService';
import type { DonationDetails, SiteSettings } from '../types/database.types';

export const DEFAULT_DONATION_DETAILS: DonationDetails = {
  qr_code_url: '',
  upi_id_primary: '',
  upi_id_secondary: '',
  account_name: '',
  account_number: '',
  bank_name: '',
  account_type: '',
  ifsc_code: '',
  branch: '',
  swift_code: '',
};

const STORAGE_KEY = 'mizpah_donation_details_v3';

export const donationService = {
  getDefaultDonationDetails(): DonationDetails {
    return { ...DEFAULT_DONATION_DETAILS };
  },

  async getDonationDetails(): Promise<DonationDetails> {
    // Clear legacy cached data from prior versions
    try {
      ['mizpah_donation_details', 'mizpah_donation_details_v2'].forEach((k) => {
        localStorage.removeItem(k);
      });
    } catch (_) {}

    try {
      const settings = await siteSettingsService.getSiteSettings();
      const savedDonation = (settings?.social_links as any)?.donation_details;
      if (savedDonation && typeof savedDonation === 'object') {
        // Discard legacy sample account number if previously written
        if (savedDonation.account_number === '50200084729184') {
          return { ...DEFAULT_DONATION_DETAILS };
        }

        const merged: DonationDetails = {
          ...DEFAULT_DONATION_DETAILS,
          ...savedDonation,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (_) {}
        return merged;
      }
    } catch (err) {
      console.warn('Could not fetch donation details from server:', err);
    }

    // Try reading from local storage cache
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.account_number !== '50200084729184') {
          return {
            ...DEFAULT_DONATION_DETAILS,
            ...parsed,
          };
        }
      }
    } catch (_) {}

    return { ...DEFAULT_DONATION_DETAILS };
  },

  async updateDonationDetails(
    details: DonationDetails,
    existingSettings?: SiteSettings | null
  ): Promise<DonationDetails> {
    const settings = existingSettings ?? (await siteSettingsService.getSiteSettings());
    const currentSocials = (settings?.social_links as any) || {};

    const updatedSocials = {
      ...currentSocials,
      donation_details: details,
    };

    // Save to database via site settings
    await siteSettingsService.saveSiteSettings(settings?.id, {
      social_links: updatedSocials,
      church_name: settings?.church_name || 'Mizpah Ministries',
    });

    // Also persist in local storage cache
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch (_) {}

    return details;
  },

  async clearDonationDetails(existingSettings?: SiteSettings | null): Promise<DonationDetails> {
    return this.updateDonationDetails({ ...DEFAULT_DONATION_DETAILS }, existingSettings);
  },
};
