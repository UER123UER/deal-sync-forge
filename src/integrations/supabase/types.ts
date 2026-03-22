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
      checklist_items: {
        Row: {
          completed: boolean | null
          created_at: string | null
          deal_id: string
          has_digital_form: boolean | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          deal_id: string
          has_digital_form?: boolean | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          deal_id?: string
          has_digital_form?: boolean | null
          id?: string
          name?: string
          sort_order?: number | null
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
        }
        Relationships: []
      }
      deal_contacts: {
        Row: {
          contact_id: string
          deal_id: string
          id: string
          role: string | null
        }
        Insert: {
          contact_id: string
          deal_id: string
          id?: string
          role?: string | null
        }
        Update: {
          contact_id?: string
          deal_id?: string
          id?: string
          role?: string | null
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
        }
        Insert: {
          content: string
          created_at?: string | null
          deal_id: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          deal_id?: string
          id?: string
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
          visible_to_office?: boolean
          zip?: string
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
        }
        Insert: {
          amount: string
          buyer_name: string
          created_at?: string | null
          deal_id: string
          id?: string
          notes?: string | null
          status?: string
        }
        Update: {
          amount?: string
          buyer_name?: string
          created_at?: string | null
          deal_id?: string
          id?: string
          notes?: string | null
          status?: string
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
      open_houses: {
        Row: {
          created_at: string | null
          deal_id: string
          end_time: string
          id: string
          notes: string | null
          scheduled_date: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          end_time?: string
          id?: string
          notes?: string | null
          scheduled_date: string
          start_time?: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          start_time?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
