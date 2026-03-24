export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          cart_total: number
          created_at: string | null
          discount_code: string | null
          first_reminder_sent_at: string | null
          guest_email: string | null
          id: string
          items: Json
          recovered_at: string | null
          recovered_order_id: string | null
          second_reminder_sent_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cart_total?: number
          created_at?: string | null
          discount_code?: string | null
          first_reminder_sent_at?: string | null
          guest_email?: string | null
          id?: string
          items?: Json
          recovered_at?: string | null
          recovered_order_id?: string | null
          second_reminder_sent_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cart_total?: number
          created_at?: string | null
          discount_code?: string | null
          first_reminder_sent_at?: string | null
          guest_email?: string | null
          id?: string
          items?: Json
          recovered_at?: string | null
          recovered_order_id?: string | null
          second_reminder_sent_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_recovered_order_id_fkey"
            columns: ["recovered_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string | null
          district: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string | null
          phone: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string | null
          district: string
          full_name: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string | null
          district?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      edge_cache: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          key: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          key: string
          value: Json
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      email_sequences: {
        Row: {
          created_at: string | null
          email_type: string
          id: string
          order_id: string
          scheduled_for: string
          sent_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_type: string
          id?: string
          order_id: string
          scheduled_for: string
          sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_type?: string
          id?: string
          order_id?: string
          scheduled_for?: string
          sent_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequences_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          display_size: string
          id: string
          image_url: string
          is_active: boolean | null
          product_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          display_size?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          product_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          display_size?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          product_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      international_shipping_zones: {
        Row: {
          countries: string[]
          created_at: string | null
          estimated_days: string | null
          flat_rate: number
          id: string
          is_active: boolean | null
          per_kg_rate: number
          updated_at: string | null
          zone_name: string
        }
        Insert: {
          countries?: string[]
          created_at?: string | null
          estimated_days?: string | null
          flat_rate?: number
          id?: string
          is_active?: boolean | null
          per_kg_rate?: number
          updated_at?: string | null
          zone_name: string
        }
        Update: {
          countries?: string[]
          created_at?: string | null
          estimated_days?: string | null
          flat_rate?: number
          id?: string
          is_active?: boolean | null
          per_kg_rate?: number
          updated_at?: string | null
          zone_name?: string
        }
        Relationships: []
      }
      invoice_sequences: {
        Row: {
          id: string
          next_number: number
          store_code: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          next_number?: number
          store_code: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          next_number?: number
          store_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          generated_at: string | null
          generated_by: string | null
          id: string
          invoice_number: string
          order_id: string
          pdf_url: string | null
          sequence_number: number
          store_code: string
        }
        Insert: {
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          invoice_number: string
          order_id: string
          pdf_url?: string | null
          sequence_number: number
          store_code?: string
        }
        Update: {
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          invoice_number?: string
          order_id?: string
          pdf_url?: string | null
          sequence_number?: number
          store_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          bonus_points: number | null
          created_at: string | null
          free_kits_earned: number | null
          free_kits_redeemed: number | null
          id: string
          total_jerseys_purchased: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bonus_points?: number | null
          created_at?: string | null
          free_kits_earned?: number | null
          free_kits_redeemed?: number | null
          id?: string
          total_jerseys_purchased?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bonus_points?: number | null
          created_at?: string | null
          free_kits_earned?: number | null
          free_kits_redeemed?: number | null
          id?: string
          total_jerseys_purchased?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketing_emails_log: {
        Row: {
          clicked_at: string | null
          email_type: string
          id: string
          opened_at: string | null
          recipient_email: string
          reference_id: string | null
          resend_id: string | null
          sent_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          email_type: string
          id?: string
          opened_at?: string | null
          recipient_email: string
          reference_id?: string | null
          resend_id?: string | null
          sent_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          email_type?: string
          id?: string
          opened_at?: string | null
          recipient_email?: string
          reference_id?: string | null
          resend_id?: string | null
          sent_at?: string | null
        }
        Relationships: []
      }
      ncm_branches: {
        Row: {
          branch_id: number
          branch_name: string
          covered_areas: string[] | null
          created_at: string | null
          estimated_days: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          office_pickup_rate: number | null
          per_kg_rate: number | null
          shipping_rate: number | null
        }
        Insert: {
          branch_id: number
          branch_name: string
          covered_areas?: string[] | null
          created_at?: string | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          office_pickup_rate?: number | null
          per_kg_rate?: number | null
          shipping_rate?: number | null
        }
        Update: {
          branch_id?: number
          branch_name?: string
          covered_areas?: string[] | null
          created_at?: string | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          office_pickup_rate?: number | null
          per_kg_rate?: number | null
          shipping_rate?: number | null
        }
        Relationships: []
      }
      ncm_comments: {
        Row: {
          author: string | null
          comment: string
          created_at: string | null
          id: string
          is_vendor: boolean | null
          ncm_order_id: number | null
          order_id: string
        }
        Insert: {
          author?: string | null
          comment: string
          created_at?: string | null
          id?: string
          is_vendor?: boolean | null
          ncm_order_id?: number | null
          order_id: string
        }
        Update: {
          author?: string | null
          comment?: string
          created_at?: string | null
          id?: string
          is_vendor?: boolean | null
          ncm_order_id?: number | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ncm_comments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ncm_rate_zones: {
        Row: {
          base_rate: number | null
          branches: string[] | null
          cod_fee: number | null
          created_at: string | null
          estimated_days: string | null
          id: string
          is_default: boolean | null
          per_kg_rate: number | null
          updated_at: string | null
          zone_name: string
        }
        Insert: {
          base_rate?: number | null
          branches?: string[] | null
          cod_fee?: number | null
          created_at?: string | null
          estimated_days?: string | null
          id?: string
          is_default?: boolean | null
          per_kg_rate?: number | null
          updated_at?: string | null
          zone_name: string
        }
        Update: {
          base_rate?: number | null
          branches?: string[] | null
          cod_fee?: number | null
          created_at?: string | null
          estimated_days?: string | null
          id?: string
          is_default?: boolean | null
          per_kg_rate?: number | null
          updated_at?: string | null
          zone_name?: string
        }
        Relationships: []
      }
      ncm_tickets: {
        Row: {
          closed_at: string | null
          created_at: string | null
          id: string
          message: string
          ncm_ticket_id: number | null
          order_id: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          id?: string
          message: string
          ncm_ticket_id?: number | null
          order_id?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          id?: string
          message?: string
          ncm_ticket_id?: number | null
          order_id?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ncm_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          unsubscribe_token: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          unsubscribe_token?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          unsubscribe_token?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          size: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          size: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          alternate_phone: string | null
          created_at: string | null
          delivery_instruction: string | null
          destination_branch: string | null
          discount_amount: number | null
          discount_code: string | null
          gift_message: string | null
          gift_wrap: boolean | null
          gift_wrap_cost: number | null
          guest_email: string | null
          guest_phone: string | null
          id: string
          ncm_cod_confirmed: boolean | null
          ncm_created_at: string | null
          ncm_delivery_type: string | null
          ncm_last_sync: string | null
          ncm_order_id: number | null
          ncm_package_weight: number | null
          ncm_status: string | null
          ncm_tracking_id: string | null
          ncm_vendor_ref: string | null
          notes: string | null
          order_number: string
          order_source: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_screenshot_url: string | null
          shipping_address: Json
          shipping_cost: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          alternate_phone?: string | null
          created_at?: string | null
          delivery_instruction?: string | null
          destination_branch?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          gift_message?: string | null
          gift_wrap?: boolean | null
          gift_wrap_cost?: number | null
          guest_email?: string | null
          guest_phone?: string | null
          id?: string
          ncm_cod_confirmed?: boolean | null
          ncm_created_at?: string | null
          ncm_delivery_type?: string | null
          ncm_last_sync?: string | null
          ncm_order_id?: number | null
          ncm_package_weight?: number | null
          ncm_status?: string | null
          ncm_tracking_id?: string | null
          ncm_vendor_ref?: string | null
          notes?: string | null
          order_number: string
          order_source?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_screenshot_url?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          alternate_phone?: string | null
          created_at?: string | null
          delivery_instruction?: string | null
          destination_branch?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          gift_message?: string | null
          gift_wrap?: boolean | null
          gift_wrap_cost?: number | null
          guest_email?: string | null
          guest_phone?: string | null
          id?: string
          ncm_cod_confirmed?: boolean | null
          ncm_created_at?: string | null
          ncm_delivery_type?: string | null
          ncm_last_sync?: string | null
          ncm_order_id?: number | null
          ncm_package_weight?: number | null
          ncm_status?: string | null
          ncm_tracking_id?: string | null
          ncm_vendor_ref?: string | null
          notes?: string | null
          order_number?: string
          order_source?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_screenshot_url?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_sizes: {
        Row: {
          id: string
          product_id: string
          size: string
          stock: number | null
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          stock?: number | null
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_hex: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_index: number | null
          price_modifier: number | null
          product_id: string
          stock: number | null
          variant_key: string
          variant_label: string | null
          variant_value: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_index?: number | null
          price_modifier?: number | null
          product_id: string
          stock?: number | null
          variant_key: string
          variant_label?: string | null
          variant_value: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_index?: number | null
          price_modifier?: number | null
          product_id?: string
          stock?: number | null
          variant_key?: string
          variant_label?: string | null
          variant_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          club: string | null
          created_at: string | null
          description: string | null
          era: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_clearance: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          kit_type: string | null
          league: string | null
          name: string
          original_price: number | null
          price: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          club?: string | null
          created_at?: string | null
          description?: string | null
          era?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_clearance?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          kit_type?: string | null
          league?: string | null
          name: string
          original_price?: number | null
          price: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          club?: string | null
          created_at?: string | null
          description?: string | null
          era?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_clearance?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          kit_type?: string | null
          league?: string | null
          name?: string
          original_price?: number | null
          price?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempts: number
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
          window_start: string
        }
        Insert: {
          action_type: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
          window_start?: string
        }
        Update: {
          action_type?: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
          window_start?: string
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          product_id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_value: number | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          reward_type: string | null
          used_at: string | null
          used_in_order_id: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          reward_type?: string | null
          used_at?: string | null
          used_in_order_id?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          reward_type?: string | null
          used_at?: string | null
          used_in_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_codes_used_in_order_id_fkey"
            columns: ["used_in_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_banners: {
        Row: {
          background_style: string | null
          button_link: string | null
          button_text: string | null
          created_at: string | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          start_date: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_style?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_style?: string | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      store_registry: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean
          monthly_revenue: number | null
          owner_id: string
          plan: string
          store_name: string
          store_url: string
          supabase_anon_key: string | null
          supabase_url: string | null
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          monthly_revenue?: number | null
          owner_id: string
          plan?: string
          store_name: string
          store_url: string
          supabase_anon_key?: string | null
          supabase_url?: string | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean
          monthly_revenue?: number | null
          owner_id?: string
          plan?: string
          store_name?: string
          store_url?: string
          supabase_anon_key?: string | null
          supabase_url?: string | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: { p_store_code: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_discount_usage: { Args: { p_code: string }; Returns: boolean }
      newsletter_unsubscribe: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      use_reward_code: {
        Args: { p_code: string; p_order_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "super_admin"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_method: "cod" | "bank_transfer" | "esewa" | "khalti"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer", "super_admin"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cod", "bank_transfer", "esewa", "khalti"],
    },
  },
} as const
