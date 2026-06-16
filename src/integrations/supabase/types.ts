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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_documents: {
        Row: {
          annotations: Json | null
          created_at: string | null
          designated_fields: Json | null
          file_name: string
          id: string
          storage_path: string
          updated_at: string | null
        }
        Insert: {
          annotations?: Json | null
          created_at?: string | null
          designated_fields?: Json | null
          file_name: string
          id?: string
          storage_path: string
          updated_at?: string | null
        }
        Update: {
          annotations?: Json | null
          created_at?: string | null
          designated_fields?: Json | null
          file_name?: string
          id?: string
          storage_path?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_links: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_holder_name: string
          account_number_last4: string
          account_type: string
          created_at: string
          id: string
          routing_number: string
          user_id: string
        }
        Insert: {
          account_holder_name: string
          account_number_last4: string
          account_type?: string
          created_at?: string
          id?: string
          routing_number: string
          user_id: string
        }
        Update: {
          account_holder_name?: string
          account_number_last4?: string
          account_type?: string
          created_at?: string
          id?: string
          routing_number?: string
          user_id?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          completed: boolean | null
          created_at: string | null
          deal_id: string
          has_digital_form: boolean | null
          id: string
          name: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          deal_id: string
          has_digital_form?: boolean | null
          id?: string
          name: string
          sort_order?: number | null
          user_id?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          deal_id?: string
          has_digital_form?: boolean | null
          id?: string
          name?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          commission: string | null
          commission_type: string | null
          company: string | null
          created_at: string | null
          current_address: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          last_touch: string | null
          mls: string | null
          mls_id: string | null
          next_touch: string | null
          phone: string | null
          role: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          commission?: string | null
          commission_type?: string | null
          company?: string | null
          created_at?: string | null
          current_address?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          last_touch?: string | null
          mls?: string | null
          mls_id?: string | null
          next_touch?: string | null
          phone?: string | null
          role?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Update: {
          commission?: string | null
          commission_type?: string | null
          company?: string | null
          created_at?: string | null
          current_address?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          last_touch?: string | null
          mls?: string | null
          mls_id?: string | null
          next_touch?: string | null
          phone?: string | null
          role?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      deal_contacts: {
        Row: {
          contact_id: string
          deal_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          deal_id: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Update: {
          contact_id?: string
          deal_id?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_contacts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_notes: {
        Row: {
          content: string
          created_at: string | null
          deal_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          deal_id: string
          id?: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          deal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_notes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          address: string
          city: string
          created_at: string | null
          id: string
          listing_expiration: string | null
          listing_start_date: string | null
          mls_number: string | null
          price: string | null
          primary_agent: string | null
          property_type: string
          representation_side: string
          state: string
          status: string
          user_id: string
          visible_to_office: boolean
          zip: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          id?: string
          listing_expiration?: string | null
          listing_start_date?: string | null
          mls_number?: string | null
          price?: string | null
          primary_agent?: string | null
          property_type: string
          representation_side?: string
          state: string
          status?: string
          user_id?: string
          visible_to_office?: boolean
          zip: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          id?: string
          listing_expiration?: string | null
          listing_start_date?: string | null
          mls_number?: string | null
          price?: string | null
          primary_agent?: string | null
          property_type?: string
          representation_side?: string
          state?: string
          status?: string
          user_id?: string
          visible_to_office?: boolean
          zip?: string
        }
        Relationships: []
      }
      direct_deposits: {
        Row: {
          account_number_last4: string
          account_type: string
          agent_name: string
          bank_name: string | null
          created_at: string
          id: string
          owner_id: string
          routing_number: string
          updated_at: string
        }
        Insert: {
          account_number_last4: string
          account_type?: string
          agent_name: string
          bank_name?: string | null
          created_at?: string
          id?: string
          owner_id: string
          routing_number: string
          updated_at?: string
        }
        Update: {
          account_number_last4?: string
          account_type?: string
          agent_name?: string
          bank_name?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          routing_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          amount: string
          buyer_name: string
          created_at: string | null
          deal_id: string
          id: string
          notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: string
          buyer_name: string
          created_at?: string | null
          deal_id: string
          id?: string
          notes?: string | null
          status?: string
          user_id?: string
        }
        Update: {
          amount?: string
          buyer_name?: string
          created_at?: string | null
          deal_id?: string
          id?: string
          notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_signature_events: {
        Row: {
          agreed_to_esign: boolean
          agreed_to_terms: boolean
          consent_text: string
          created_at: string
          document_body: string
          document_hash: string | null
          document_key: string
          document_title: string
          document_version: string
          evidence: Json | null
          id: string
          ip_address: string | null
          origin_url: string | null
          request_headers: Json | null
          signature_type: string
          signature_value: string
          signed_at: string
          signer_email: string | null
          signer_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          agreed_to_esign?: boolean
          agreed_to_terms?: boolean
          consent_text: string
          created_at?: string
          document_body: string
          document_hash?: string | null
          document_key: string
          document_title: string
          document_version: string
          evidence?: Json | null
          id?: string
          ip_address?: string | null
          origin_url?: string | null
          request_headers?: Json | null
          signature_type?: string
          signature_value: string
          signed_at?: string
          signer_email?: string | null
          signer_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          agreed_to_esign?: boolean
          agreed_to_terms?: boolean
          consent_text?: string
          created_at?: string
          document_body?: string
          document_hash?: string | null
          document_key?: string
          document_title?: string
          document_version?: string
          evidence?: Json | null
          id?: string
          ip_address?: string | null
          origin_url?: string | null
          request_headers?: Json | null
          signature_type?: string
          signature_value?: string
          signed_at?: string
          signer_email?: string | null
          signer_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      open_houses: {
        Row: {
          created_at: string | null
          deal_id: string
          end_time: string
          id: string
          notes: string | null
          scheduled_date: string
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          end_time?: string
          id?: string
          notes?: string | null
          scheduled_date: string
          start_time?: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "open_houses_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          brokerage_name: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          license_number: string | null
          phone: string | null
          referral_code: string | null
          referred_by_code: string | null
          subscription_activated_at: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          brokerage_name?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          license_number?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by_code?: string | null
          subscription_activated_at?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          brokerage_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          license_number?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by_code?: string | null
          subscription_activated_at?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_documents: {
        Row: {
          created_at: string | null
          id: string
          name: string
          page_count: number | null
          session_id: string
          sort_order: number | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          page_count?: number | null
          session_id: string
          sort_order?: number | null
          storage_path: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          page_count?: number | null
          session_id?: string
          sort_order?: number | null
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "signing_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_fields: {
        Row: {
          created_at: string | null
          document_id: string | null
          height: number
          id: string
          page: number
          recipient_id: string | null
          session_id: string
          type: string
          user_id: string
          value: string | null
          width: number
          x: number
          y: number
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          height?: number
          id?: string
          page?: number
          recipient_id?: string | null
          session_id: string
          type?: string
          user_id?: string
          value?: string | null
          width?: number
          x?: number
          y?: number
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          height?: number
          id?: string
          page?: number
          recipient_id?: string | null
          session_id?: string
          type?: string
          user_id?: string
          value?: string | null
          width?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "session_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_fields_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "session_recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_fields_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "signing_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_recipients: {
        Row: {
          contact_id: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          session_id: string
          signature_data: string | null
          signed_at: string | null
          sort_order: number | null
          status: string
          token: string
          type: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name?: string
          session_id: string
          signature_data?: string | null
          signed_at?: string | null
          sort_order?: number | null
          status?: string
          token?: string
          type?: string
          user_id?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          session_id?: string
          signature_data?: string | null
          signed_at?: string | null
          sort_order?: number | null
          status?: string
          token?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_recipients_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "signing_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_recipients: {
        Row: {
          contact_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string | null
          signature_data: string | null
          signature_request_id: string
          signed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
          signature_data?: string | null
          signature_request_id: string
          signed_at?: string | null
          status?: string
          user_id?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
          signature_data?: string | null
          signature_request_id?: string
          signed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_recipients_signature_request_id_fkey"
            columns: ["signature_request_id"]
            isOneToOne: false
            referencedRelation: "signature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_requests: {
        Row: {
          checklist_item_id: string | null
          created_at: string | null
          deal_id: string
          document_name: string
          form_data: Json | null
          id: string
          message: string | null
          sender_name: string
          status: string
          subject: string
          token: string
          user_id: string
        }
        Insert: {
          checklist_item_id?: string | null
          created_at?: string | null
          deal_id: string
          document_name: string
          form_data?: Json | null
          id?: string
          message?: string | null
          sender_name?: string
          status?: string
          subject?: string
          token?: string
          user_id?: string
        }
        Update: {
          checklist_item_id?: string | null
          created_at?: string | null
          deal_id?: string
          document_name?: string
          form_data?: Json | null
          id?: string
          message?: string | null
          sender_name?: string
          status?: string
          subject?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_requests_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      signing_sessions: {
        Row: {
          created_at: string | null
          created_by: string | null
          date_sent: string | null
          deal_id: string
          email_message: string | null
          expiration_date: string | null
          id: string
          reminder_interval_days: number | null
          session_name: string
          signing_order_enabled: boolean | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date_sent?: string | null
          deal_id: string
          email_message?: string | null
          expiration_date?: string | null
          id?: string
          reminder_interval_days?: number | null
          session_name?: string
          signing_order_enabled?: boolean | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date_sent?: string | null
          deal_id?: string
          email_message?: string | null
          expiration_date?: string | null
          id?: string
          reminder_interval_days?: number | null
          session_name?: string
          signing_order_enabled?: boolean | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signing_sessions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          created_at: string | null
          deal_id: string | null
          description: string | null
          due_date: string | null
          end_date: string | null
          id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          title: string
          type?: string
          user_id?: string
        }
        Update: {
          assignee?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_referral_stats: {
        Args: never
        Returns: {
          active_referrals: number
          total_earnings: number
          total_referrals: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
