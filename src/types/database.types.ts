export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: string;
          church_name: string;
          logo_path: string | null;
          short_description: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          social_links: {
            facebook?: string;
            instagram?: string;
            youtube?: string;
            twitter?: string;
            donation_details?: DonationDetails;
            [key: string]: any;
          } | null;
          footer_description: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          church_name?: string;
          logo_path?: string | null;
          short_description?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          social_links?: any;
          footer_description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          church_name?: string;
          logo_path?: string | null;
          short_description?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          social_links?: any;
          footer_description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      hero_sections: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_path: string;
          button_text: string | null;
          button_url: string | null;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_path: string;
          button_text?: string | null;
          button_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_path?: string;
          button_text?: string | null;
          button_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      about_god_cards: {
        Row: {
          id: string;
          title: string;
          short_description: string;
          full_description: string;
          image_path: string;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          short_description: string;
          full_description: string;
          image_path: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          short_description?: string;
          full_description?: string;
          image_path?: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      founders: {
        Row: {
          id: string;
          name: string;
          vision: string;
          biography: string | null;
          image_path: string;
          is_primary: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          vision: string;
          biography?: string | null;
          image_path: string;
          is_primary?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          vision?: string;
          biography?: string | null;
          image_path?: string;
          is_primary?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      sermons: {
        Row: {
          id: string;
          title: string;
          description: string;
          pastor_name: string;
          sermon_date: string;
          youtube_url: string;
          thumbnail_path: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          pastor_name: string;
          sermon_date?: string;
          youtube_url: string;
          thumbnail_path?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          pastor_name?: string;
          sermon_date?: string;
          youtube_url?: string;
          thumbnail_path?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      gallery_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      gallery_collections: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category_id: string;
          cover_image_path: string;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          category_id: string;
          cover_image_path: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          category_id?: string;
          cover_image_path?: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_collections_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "gallery_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      gallery_images: {
        Row: {
          id: string;
          collection_id: string;
          image_path: string;
          title: string | null;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          collection_id: string;
          image_path: string;
          title?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          collection_id?: string;
          image_path?: string;
          title?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_images_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "gallery_collections";
            referencedColumns: ["id"];
          }
        ];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: 'unread' | 'read' | 'replied';
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: 'unread' | 'read' | 'replied';
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          status?: 'unread' | 'read' | 'replied';
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_profiles: {
        Row: {
          id: string;
          display_name: string;
          role: 'admin' | 'superadmin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role?: 'admin' | 'superadmin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          role?: 'admin' | 'superadmin';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience Types
export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
export type HeroSection = Database['public']['Tables']['hero_sections']['Row'];
export type AboutGodCard = Database['public']['Tables']['about_god_cards']['Row'];
export type Founder = Database['public']['Tables']['founders']['Row'];
export type Sermon = Database['public']['Tables']['sermons']['Row'];
export type GalleryCategory = Database['public']['Tables']['gallery_categories']['Row'];
export type GalleryCollection = Database['public']['Tables']['gallery_collections']['Row'];
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
export type AdminProfile = Database['public']['Tables']['admin_profiles']['Row'];

export interface GalleryCollectionWithImages extends GalleryCollection {
  images?: GalleryImage[];
  category?: GalleryCategory;
}

export interface Campus {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  campus_page_name?: string | null;
  campus_page_url?: string | null;
  map_url?: string | null;
  is_primary?: boolean;
  is_published?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DonationDetails {
  qr_code_url: string;
  upi_id_primary: string;
  upi_id_secondary: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  account_type: string;
  ifsc_code: string;
  branch: string;
  swift_code: string;
}
