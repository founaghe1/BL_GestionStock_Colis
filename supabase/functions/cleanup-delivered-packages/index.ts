import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find packages that are delivered and older than 30 days
    const { data: packagesToDelete, error: fetchError } = await supabaseClient
      .from('packages')
      .select('id, recipient_name, updated_at')
      .eq('status', 'recu')
      .lt('updated_at', thirtyDaysAgo.toISOString())

    if (fetchError) {
      throw fetchError
    }

    if (!packagesToDelete || packagesToDelete.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No packages to delete',
          deleted_count: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Delete the packages
    const { error: deleteError } = await supabaseClient
      .from('packages')
      .delete()
      .eq('status', 'recu')
      .lt('updated_at', thirtyDaysAgo.toISOString())

    if (deleteError) {
      throw deleteError
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully deleted ${packagesToDelete.length} delivered packages older than 30 days`,
        deleted_count: packagesToDelete.length,
        deleted_packages: packagesToDelete.map(pkg => ({
          id: pkg.id,
          recipient_name: pkg.recipient_name,
          delivered_date: pkg.updated_at
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Failed to cleanup delivered packages'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})