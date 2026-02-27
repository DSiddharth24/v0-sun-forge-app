import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://joslkpmonajwudbovirq.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2xrcG1vbmFqd3VkYm92aXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMDIyMTIsImV4cCI6MjA4MzY3ODIxMn0.UGPp-28jXkx5mnru8YheRlNAq_ElRoLgr-i-ALIL9hs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
