export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      investments: {
        Row: {
          confirmation_block: number | null
          confirmed_at: string | null
          created_at: string | null
          current_value: number | null
          id: string
          payment_currency: string | null
          payment_method: string | null
          payment_tx_hash: string | null
          price_per_token: number
          property_id: string | null
          property_token_id: string | null
          roi_percentage: number | null
          status: string | null
          token_amount: number
          total_amount: number
          user_id: string | null
        }
        Insert: {
          confirmation_block?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          payment_currency?: string | null
          payment_method?: string | null
          payment_tx_hash?: string | null
          price_per_token: number
          property_id?: string | null
          property_token_id?: string | null
          roi_percentage?: number | null
          status?: string | null
          token_amount: number
          total_amount: number
          user_id?: string | null
        }
        Update: {
          confirmation_block?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          payment_currency?: string | null
          payment_method?: string | null
          payment_tx_hash?: string | null
          price_per_token?: number
          property_id?: string | null
          property_token_id?: string | null
          roi_percentage?: number | null
          status?: string | null
          token_amount?: number
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_property_token_id_fkey"
            columns: ["property_token_id"]
            isOneToOne: false
            referencedRelation: "property_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          average_price_per_sqft: number | null
          created_at: string | null
          data_source: string | null
          days_on_market: number | null
          id: string
          inventory_count: number | null
          location: string
          median_sale_price: number | null
          price_change_1y: number | null
          price_change_30d: number | null
          price_change_90d: number | null
          property_type: string
          report_date: string
        }
        Insert: {
          average_price_per_sqft?: number | null
          created_at?: string | null
          data_source?: string | null
          days_on_market?: number | null
          id?: string
          inventory_count?: number | null
          location: string
          median_sale_price?: number | null
          price_change_1y?: number | null
          price_change_30d?: number | null
          price_change_90d?: number | null
          property_type: string
          report_date: string
        }
        Update: {
          average_price_per_sqft?: number | null
          created_at?: string | null
          data_source?: string | null
          days_on_market?: number | null
          id?: string
          inventory_count?: number | null
          location?: string
          median_sale_price?: number | null
          price_change_1y?: number | null
          price_change_30d?: number | null
          price_change_90d?: number | null
          property_type?: string
          report_date?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: Json | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          coordinates: Json | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          external_id: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          last_synced: string | null
          location: string
          lot_size: number | null
          postal_code: string | null
          price: number
          price_per_token: number | null
          property_type: string | null
          source: string | null
          source_url: string | null
          sqft: number | null
          state_province: string | null
          title: string
          token_address: string | null
          tokenization_status: string | null
          total_tokens: number | null
          updated_at: string | null
          virtual_tour_url: string | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          last_synced?: string | null
          location: string
          lot_size?: number | null
          postal_code?: string | null
          price: number
          price_per_token?: number | null
          property_type?: string | null
          source?: string | null
          source_url?: string | null
          sqft?: number | null
          state_province?: string | null
          title: string
          token_address?: string | null
          tokenization_status?: string | null
          total_tokens?: number | null
          updated_at?: string | null
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          last_synced?: string | null
          location?: string
          lot_size?: number | null
          postal_code?: string | null
          price?: number
          price_per_token?: number | null
          property_type?: string | null
          source?: string | null
          source_url?: string | null
          sqft?: number | null
          state_province?: string | null
          title?: string
          token_address?: string | null
          tokenization_status?: string | null
          total_tokens?: number | null
          updated_at?: string | null
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      property_analytics: {
        Row: {
          appreciation_rate: number | null
          average_investment_size: number | null
          cap_rate: number | null
          created_at: string | null
          funding_percentage: number | null
          id: string
          market_value: number | null
          number_of_investors: number | null
          property_id: string | null
          rental_yield: number | null
          report_date: string
          total_invested: number | null
        }
        Insert: {
          appreciation_rate?: number | null
          average_investment_size?: number | null
          cap_rate?: number | null
          created_at?: string | null
          funding_percentage?: number | null
          id?: string
          market_value?: number | null
          number_of_investors?: number | null
          property_id?: string | null
          rental_yield?: number | null
          report_date: string
          total_invested?: number | null
        }
        Update: {
          appreciation_rate?: number | null
          average_investment_size?: number | null
          cap_rate?: number | null
          created_at?: string | null
          funding_percentage?: number | null
          id?: string
          market_value?: number | null
          number_of_investors?: number | null
          property_id?: string | null
          rental_yield?: number | null
          report_date?: string
          total_invested?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_analytics_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          expires_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean | null
          property_id: string | null
          requires_kyc: boolean | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          expires_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean | null
          property_id?: string | null
          requires_kyc?: boolean | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          expires_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          property_id?: string | null
          requires_kyc?: boolean | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_tokens: {
        Row: {
          available_supply: number
          blockchain_network: string | null
          contract_address: string
          created_at: string | null
          current_price: number
          deployment_block: number | null
          deployment_tx_hash: string | null
          end_date: string | null
          id: string
          initial_price: number
          launch_date: string | null
          minimum_investment: number | null
          property_id: string | null
          status: string | null
          token_address: string
          token_name: string | null
          token_symbol: string | null
          total_supply: number
          updated_at: string | null
        }
        Insert: {
          available_supply: number
          blockchain_network?: string | null
          contract_address: string
          created_at?: string | null
          current_price: number
          deployment_block?: number | null
          deployment_tx_hash?: string | null
          end_date?: string | null
          id?: string
          initial_price: number
          launch_date?: string | null
          minimum_investment?: number | null
          property_id?: string | null
          status?: string | null
          token_address: string
          token_name?: string | null
          token_symbol?: string | null
          total_supply: number
          updated_at?: string | null
        }
        Update: {
          available_supply?: number
          blockchain_network?: string | null
          contract_address?: string
          created_at?: string | null
          current_price?: number
          deployment_block?: number | null
          deployment_tx_hash?: string | null
          end_date?: string | null
          id?: string
          initial_price?: number
          launch_date?: string | null
          minimum_investment?: number | null
          property_id?: string | null
          status?: string | null
          token_address?: string
          token_name?: string | null
          token_symbol?: string | null
          total_supply?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_tokens_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      token_holders: {
        Row: {
          id: string
          property_id: string | null
          purchase_date: string | null
          purchase_price: number
          status: string | null
          token_amount: number
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          purchase_date?: string | null
          purchase_price: number
          status?: string | null
          token_amount: number
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          id?: string
          property_id?: string | null
          purchase_date?: string | null
          purchase_price?: number
          status?: string | null
          token_amount?: number
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_holders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          from_address: string | null
          id: string
          price_per_token: number
          property_id: string | null
          status: string | null
          to_address: string
          token_amount: number
          total_amount: number
          transaction_hash: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string | null
          from_address?: string | null
          id?: string
          price_per_token: number
          property_id?: string | null
          status?: string | null
          to_address: string
          token_amount: number
          total_amount: number
          transaction_hash?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string | null
          from_address?: string | null
          id?: string
          price_per_token?: number
          property_id?: string | null
          status?: string | null
          to_address?: string
          token_amount?: number
          total_amount?: number
          transaction_hash?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          kyc_status: string | null
          phone: string | null
          properties_owned: number | null
          total_invested: number | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          kyc_status?: string | null
          phone?: string | null
          properties_owned?: number | null
          total_invested?: number | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_status?: string | null
          phone?: string | null
          properties_owned?: number | null
          total_invested?: number | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          accredited_investor: boolean | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          investment_experience: string | null
          is_active: boolean | null
          kyc_documents: Json | null
          kyc_status: string | null
          last_login: string | null
          last_name: string | null
          nationality: string | null
          phone: string | null
          preferred_investment_size: number | null
          risk_tolerance: string | null
          wallet_address: string | null
        }
        Insert: {
          accredited_investor?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          investment_experience?: string | null
          is_active?: boolean | null
          kyc_documents?: Json | null
          kyc_status?: string | null
          last_login?: string | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          preferred_investment_size?: number | null
          risk_tolerance?: string | null
          wallet_address?: string | null
        }
        Update: {
          accredited_investor?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          investment_experience?: string | null
          is_active?: boolean | null
          kyc_documents?: Json | null
          kyc_status?: string | null
          last_login?: string | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          preferred_investment_size?: number | null
          risk_tolerance?: string | null
          wallet_address?: string | null
        }
        Relationships: []
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
