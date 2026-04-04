import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ error: 'token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase service credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: recipient, error: recipientError } = await admin
      .from('session_recipients')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (recipientError) throw recipientError;

    if (!recipient) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: session, error: sessionError } = await admin
      .from('signing_sessions')
      .select('*')
      .eq('id', recipient.session_id)
      .single();
    if (sessionError) throw sessionError;

    const { data: fields, error: fieldsError } = await admin
      .from('session_fields')
      .select('*')
      .eq('session_id', recipient.session_id);
    if (fieldsError) throw fieldsError;

    const { data: documents, error: documentsError } = await admin
      .from('session_documents')
      .select('*')
      .eq('session_id', recipient.session_id)
      .order('sort_order');
    if (documentsError) throw documentsError;

    return new Response(
      JSON.stringify({
        session,
        recipient,
        fields: fields || [],
        documents: documents || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('get-signing-session error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
