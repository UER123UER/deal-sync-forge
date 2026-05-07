import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FieldUpdate {
  id: string;
  value: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, signatureData, fields } = await req.json() as {
      token?: string;
      signatureData?: string;
      fields?: FieldUpdate[];
    };

    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ error: 'token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Service credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Resolve recipient by token (only path that legitimizes the anonymous write).
    const { data: recipient, error: recipientError } = await admin
      .from('session_recipients')
      .select('id, session_id')
      .eq('token', token)
      .maybeSingle();
    if (recipientError) throw recipientError;
    if (!recipient) {
      return new Response(JSON.stringify({ error: 'invalid token' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: updateError } = await admin
      .from('session_recipients')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_data: typeof signatureData === 'string' ? signatureData : '',
      })
      .eq('id', recipient.id);
    if (updateError) throw updateError;

    if (Array.isArray(fields)) {
      // Only allow updating fields that belong to this session.
      const ids = fields.map((f) => f.id).filter((id) => typeof id === 'string');
      if (ids.length > 0) {
        const { data: ownedFields, error: ownedErr } = await admin
          .from('session_fields')
          .select('id')
          .eq('session_id', recipient.session_id)
          .in('id', ids);
        if (ownedErr) throw ownedErr;
        const ownedSet = new Set((ownedFields || []).map((r: any) => r.id));
        for (const f of fields) {
          if (!ownedSet.has(f.id)) continue;
          await admin
            .from('session_fields')
            .update({ value: typeof f.value === 'string' ? f.value : '' })
            .eq('id', f.id);
        }
      }
    }

    // If all recipients signed, mark session completed.
    const { data: allRecipients } = await admin
      .from('session_recipients')
      .select('status')
      .eq('session_id', recipient.session_id);
    if (allRecipients && allRecipients.every((r: any) => r.status === 'signed')) {
      await admin
        .from('signing_sessions')
        .update({ status: 'completed' })
        .eq('id', recipient.session_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('submit-signing-session error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
