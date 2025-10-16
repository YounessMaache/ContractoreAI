import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function createClient() {
  return createClientComponentClient()
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          company_name: string | null
          company_logo: string | null
          address: string | null
          phone: string | null
          business_email: string | null
          license_number: string | null
          tax_id: string | null
          default_tax_rate: number | null
          default_payment_terms: string | null
          invoice_prefix: string | null
          invoice_next_number: number | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_plan: string | null
          subscription_ends_at: string | null
          documents_used_this_month: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          company_name?: string | null
          company_logo?: string | null
          address?: string | null
          phone?: string | null
          business_email?: string | null
          license_number?: string | null
          tax_id?: string | null
          default_tax_rate?: number | null
          default_payment_terms?: string | null
          invoice_prefix?: string | null
          invoice_next_number?: number | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_plan?: string | null
          subscription_ends_at?: string | null
          documents_used_this_month?: number | null
        }
        Update: {
          company_name?: string | null
          company_logo?: string | null
          address?: string | null
          phone?: string | null
          business_email?: string | null
          license_number?: string | null
          tax_id?: string | null
          default_tax_rate?: number | null
          default_payment_terms?: string | null
          invoice_prefix?: string | null
          invoice_next_number?: number | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_plan?: string | null
          subscription_ends_at?: string | null
          documents_used_this_month?: number | null
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          document_type: string
          document_number: string
          status: string
          client_name: string | null
          client_email: string | null
          client_phone: string | null
          client_address: string | null
          job_location: string | null
          job_title: string | null
          data: any
          photos: any
          notes: string | null
          total_amount: number | null
          pdf_url: string | null
          created_at: string
          updated_at: string
          due_date: string | null
          paid_date: string | null
          sent_date: string | null
        }
        Insert: {
          user_id: string
          document_type: string
          document_number: string
          status?: string
          client_name?: string | null
          client_email?: string | null
          client_phone?: string | null
          client_address?: string | null
          job_location?: string | null
          job_title?: string | null
          data: any
          photos?: any
          notes?: string | null
          total_amount?: number | null
          pdf_url?: string | null
          due_date?: string | null
          paid_date?: string | null
          sent_date?: string | null
        }
        Update: {
          document_type?: string
          document_number?: string
          status?: string
          client_name?: string | null
          client_email?: string | null
          client_phone?: string | null
          client_address?: string | null
          job_location?: string | null
          job_title?: string | null
          data?: any
          photos?: any
          notes?: string | null
          total_amount?: number | null
          pdf_url?: string | null
          due_date?: string | null
          paid_date?: string | null
          sent_date?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
        }
      }
    }
  }
}
