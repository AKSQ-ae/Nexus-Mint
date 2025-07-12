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
      chat_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          edited_at: string | null
          id: string
          message: string
          message_type: string | null
          reply_to: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message: string
          message_type?: string | null
          reply_to?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          message?: string
          message_type?: string | null
          reply_to?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_participants: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_read_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          property_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          property_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          priority: number | null
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: number | null
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: number | null
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      fee_schedules: {
        Row: {
          created_at: string
          currency: string
          effective_from: string
          effective_until: string | null
          fee_type: string
          fixed_amount: number
          id: string
          is_active: boolean
          max_fee: number | null
          min_fee: number
          percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          effective_from?: string
          effective_until?: string | null
          fee_type: string
          fixed_amount?: number
          id?: string
          is_active?: boolean
          max_fee?: number | null
          min_fee?: number
          percentage: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          effective_from?: string
          effective_until?: string | null
          fee_type?: string
          fixed_amount?: number
          id?: string
          is_active?: boolean
          max_fee?: number | null
          min_fee?: number
          percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      investment_analytics: {
        Row: {
          calculated_at: string | null
          id: string
          metric_data: Json | null
          metric_type: string
          metric_value: number | null
          period_end: string | null
          period_start: string | null
          property_id: string | null
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          metric_data?: Json | null
          metric_type: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
          property_id?: string | null
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          id?: string
          metric_data?: Json | null
          metric_type?: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
          property_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_analytics_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_transactions: {
        Row: {
          blockchain_tx_hash: string | null
          created_at: string
          fees_amount: number
          id: string
          net_amount: number
          payment_currency: string
          payment_method: string | null
          processed_at: string | null
          property_id: string
          status: string
          stripe_payment_intent_id: string | null
          token_amount: number
          token_price: number
          total_amount: number
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blockchain_tx_hash?: string | null
          created_at?: string
          fees_amount?: number
          id?: string
          net_amount: number
          payment_currency?: string
          payment_method?: string | null
          processed_at?: string | null
          property_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          token_amount: number
          token_price: number
          total_amount: number
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blockchain_tx_hash?: string | null
          created_at?: string
          fees_amount?: number
          id?: string
          net_amount?: number
          payment_currency?: string
          payment_method?: string | null
          processed_at?: string | null
          property_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          token_amount?: number
          token_price?: number
          total_amount?: number
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          actual_return: number | null
          blockchain_tx_hash: string | null
          confirmation_block: number | null
          confirmed_at: string | null
          created_at: string | null
          current_value: number | null
          estimated_annual_return: number | null
          fee_amount: number | null
          id: string
          investment_transaction_id: string | null
          net_amount: number | null
          payment_currency: string | null
          payment_method: string | null
          payment_method_id: string | null
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
          actual_return?: number | null
          blockchain_tx_hash?: string | null
          confirmation_block?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          estimated_annual_return?: number | null
          fee_amount?: number | null
          id?: string
          investment_transaction_id?: string | null
          net_amount?: number | null
          payment_currency?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
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
          actual_return?: number | null
          blockchain_tx_hash?: string | null
          confirmation_block?: number | null
          confirmed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          estimated_annual_return?: number | null
          fee_amount?: number | null
          id?: string
          investment_transaction_id?: string | null
          net_amount?: number | null
          payment_currency?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
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
            foreignKeyName: "investments_investment_transaction_id_fkey"
            columns: ["investment_transaction_id"]
            isOneToOne: false
            referencedRelation: "investment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
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
      kyc_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          details: Json
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          method_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details: Json
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          method_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          method_type?: string
          updated_at?: string | null
          user_id?: string
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
          funding_deadline: string | null
          funding_target: number | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          last_synced: string | null
          location: string
          lot_size: number | null
          min_investment: number | null
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
          tokenization_active: boolean
          tokenization_status: string | null
          tokens_issued: number | null
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
          funding_deadline?: string | null
          funding_target?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          last_synced?: string | null
          location: string
          lot_size?: number | null
          min_investment?: number | null
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
          tokenization_active?: boolean
          tokenization_status?: string | null
          tokens_issued?: number | null
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
          funding_deadline?: string | null
          funding_target?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          last_synced?: string | null
          location?: string
          lot_size?: number | null
          min_investment?: number | null
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
          tokenization_active?: boolean
          tokenization_status?: string | null
          tokens_issued?: number | null
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
      property_audits: {
        Row: {
          audit_date: string
          audit_results: Json | null
          audit_score: number
          auditor_id: string
          compliance_status: string
          created_at: string
          id: string
          next_review_date: string | null
          property_id: string
          risk_level: string
          updated_at: string
        }
        Insert: {
          audit_date?: string
          audit_results?: Json | null
          audit_score?: number
          auditor_id: string
          compliance_status?: string
          created_at?: string
          id?: string
          next_review_date?: string | null
          property_id: string
          risk_level?: string
          updated_at?: string
        }
        Update: {
          audit_date?: string
          audit_results?: Json | null
          audit_score?: number
          auditor_id?: string
          compliance_status?: string
          created_at?: string
          id?: string
          next_review_date?: string | null
          property_id?: string
          risk_level?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_audits_property_id_fkey"
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
      property_performance: {
        Row: {
          created_at: string | null
          id: string
          maintenance_costs: number | null
          market_performance: number | null
          occupancy_rate: number | null
          property_id: string
          rental_income: number | null
          report_date: string
          roi_percentage: number | null
          valuation: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          maintenance_costs?: number | null
          market_performance?: number | null
          occupancy_rate?: number | null
          property_id: string
          rental_income?: number | null
          report_date: string
          roi_percentage?: number | null
          valuation?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          maintenance_costs?: number | null
          market_performance?: number | null
          occupancy_rate?: number | null
          property_id?: string
          rental_income?: number | null
          report_date?: string
          roi_percentage?: number | null
          valuation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_performance_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_returns: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          investment_id: string | null
          property_id: string
          return_date: string
          return_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          investment_id?: string | null
          property_id: string
          return_date: string
          return_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          investment_id?: string | null
          property_id?: string
          return_date?: string
          return_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_returns_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_returns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_tokens: {
        Row: {
          audit_hash: string | null
          available_supply: number
          blockchain_network: string | null
          compiler_version: string | null
          constructor_params: string | null
          contract_address: string
          created_at: string | null
          current_price: number
          deployer_address: string | null
          deployment_block: number | null
          deployment_cost: string | null
          deployment_tx_hash: string | null
          end_date: string | null
          explorer_url: string | null
          id: string
          initial_price: number
          launch_date: string | null
          minimum_investment: number | null
          optimization_enabled: boolean | null
          property_id: string | null
          source_code: string | null
          status: string | null
          token_address: string
          token_name: string | null
          token_symbol: string | null
          total_supply: number
          updated_at: string | null
          verification_id: string | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          audit_hash?: string | null
          available_supply: number
          blockchain_network?: string | null
          compiler_version?: string | null
          constructor_params?: string | null
          contract_address: string
          created_at?: string | null
          current_price: number
          deployer_address?: string | null
          deployment_block?: number | null
          deployment_cost?: string | null
          deployment_tx_hash?: string | null
          end_date?: string | null
          explorer_url?: string | null
          id?: string
          initial_price: number
          launch_date?: string | null
          minimum_investment?: number | null
          optimization_enabled?: boolean | null
          property_id?: string | null
          source_code?: string | null
          status?: string | null
          token_address: string
          token_name?: string | null
          token_symbol?: string | null
          total_supply: number
          updated_at?: string | null
          verification_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          audit_hash?: string | null
          available_supply?: number
          blockchain_network?: string | null
          compiler_version?: string | null
          constructor_params?: string | null
          contract_address?: string
          created_at?: string | null
          current_price?: number
          deployer_address?: string | null
          deployment_block?: number | null
          deployment_cost?: string | null
          deployment_tx_hash?: string | null
          end_date?: string | null
          explorer_url?: string | null
          id?: string
          initial_price?: number
          launch_date?: string | null
          minimum_investment?: number | null
          optimization_enabled?: boolean | null
          property_id?: string | null
          source_code?: string | null
          status?: string | null
          token_address?: string
          token_name?: string | null
          token_symbol?: string | null
          total_supply?: number
          updated_at?: string | null
          verification_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
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
      smart_contract_events: {
        Row: {
          block_number: number | null
          contract_address: string
          created_at: string | null
          event_data: Json | null
          event_name: string
          id: string
          processed: boolean | null
          transaction_hash: string | null
        }
        Insert: {
          block_number?: number | null
          contract_address: string
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          processed?: boolean | null
          transaction_hash?: string | null
        }
        Update: {
          block_number?: number | null
          contract_address?: string
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          processed?: boolean | null
          transaction_hash?: string | null
        }
        Relationships: []
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
      token_supply: {
        Row: {
          available_supply: number
          created_at: string
          id: string
          last_price_update: string
          maximum_investment: number | null
          minimum_investment: number
          property_id: string
          reserved_supply: number
          token_price: number
          total_supply: number
          updated_at: string
        }
        Insert: {
          available_supply: number
          created_at?: string
          id?: string
          last_price_update?: string
          maximum_investment?: number | null
          minimum_investment?: number
          property_id: string
          reserved_supply?: number
          token_price: number
          total_supply: number
          updated_at?: string
        }
        Update: {
          available_supply?: number
          created_at?: string
          id?: string
          last_price_update?: string
          maximum_investment?: number | null
          minimum_investment?: number
          property_id?: string
          reserved_supply?: number
          token_price?: number
          total_supply?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_supply_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tokenization_processes: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: string
          error_logs: Json | null
          estimated_completion: string | null
          id: string
          process_type: string
          progress_percentage: number | null
          property_id: string
          started_at: string
          status: string
          step_details: Json | null
          steps_completed: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: string
          error_logs?: Json | null
          estimated_completion?: string | null
          id?: string
          process_type?: string
          progress_percentage?: number | null
          property_id: string
          started_at?: string
          status?: string
          step_details?: Json | null
          steps_completed?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: string
          error_logs?: Json | null
          estimated_completion?: string | null
          id?: string
          process_type?: string
          progress_percentage?: number | null
          property_id?: string
          started_at?: string
          status?: string
          step_details?: Json | null
          steps_completed?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokenization_processes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tokenization_reports: {
        Row: {
          compliance_data: Json | null
          created_at: string
          generated_at: string
          generated_by: string | null
          id: string
          metrics: Json | null
          performance_data: Json | null
          process_id: string
          property_id: string
          report_data: Json
          report_type: string
          status: string | null
        }
        Insert: {
          compliance_data?: Json | null
          created_at?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          metrics?: Json | null
          performance_data?: Json | null
          process_id: string
          property_id: string
          report_data?: Json
          report_type?: string
          status?: string | null
        }
        Update: {
          compliance_data?: Json | null
          created_at?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          metrics?: Json | null
          performance_data?: Json | null
          process_id?: string
          property_id?: string
          report_data?: Json
          report_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokenization_reports_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "tokenization_processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokenization_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tokenization_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          error_details: Json | null
          id: string
          process_id: string
          started_at: string | null
          status: string
          step_data: Json | null
          step_name: string
          step_order: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_details?: Json | null
          id?: string
          process_id: string
          started_at?: string | null
          status?: string
          step_data?: Json | null
          step_name: string
          step_order: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_details?: Json | null
          id?: string
          process_id?: string
          started_at?: string | null
          status?: string
          step_data?: Json | null
          step_name?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "tokenization_steps_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "tokenization_processes"
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
          accredited_investor: boolean | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          investment_experience: string | null
          is_active: boolean | null
          kyc_level: number | null
          kyc_status: string | null
          last_login: string | null
          phone: string | null
          preferred_investment_size: number | null
          properties_owned: number | null
          risk_tolerance: string | null
          total_invested: number | null
          total_returns: number | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          accredited_investor?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          investment_experience?: string | null
          is_active?: boolean | null
          kyc_level?: number | null
          kyc_status?: string | null
          last_login?: string | null
          phone?: string | null
          preferred_investment_size?: number | null
          properties_owned?: number | null
          risk_tolerance?: string | null
          total_invested?: number | null
          total_returns?: number | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          accredited_investor?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          investment_experience?: string | null
          is_active?: boolean | null
          kyc_level?: number | null
          kyc_status?: string | null
          last_login?: string | null
          phone?: string | null
          preferred_investment_size?: number | null
          properties_owned?: number | null
          risk_tolerance?: string | null
          total_invested?: number | null
          total_returns?: number | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_role_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_seen: string | null
          page_url: string | null
          session_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_seen?: string | null
          page_url?: string | null
          session_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_seen?: string | null
          page_url?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string
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
      calculate_investment_fees: {
        Args: { investment_amount: number; fee_type?: string }
        Returns: number
      }
      can_access_property: {
        Args: { user_id: string; property_id: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args:
          | { _user_id: string; _role: string }
          | {
              user_id: string
              required_role: Database["public"]["Enums"]["user_role"]
            }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      investment_status:
        | "pending"
        | "processing"
        | "confirmed"
        | "completed"
        | "failed"
        | "refunded"
      notification_type:
        | "investment"
        | "return"
        | "property_update"
        | "kyc"
        | "system"
        | "chat"
      user_role:
        | "admin"
        | "investor"
        | "property_manager"
        | "compliance_officer"
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
      investment_status: [
        "pending",
        "processing",
        "confirmed",
        "completed",
        "failed",
        "refunded",
      ],
      notification_type: [
        "investment",
        "return",
        "property_update",
        "kyc",
        "system",
        "chat",
      ],
      user_role: [
        "admin",
        "investor",
        "property_manager",
        "compliance_officer",
      ],
    },
  },
} as const
