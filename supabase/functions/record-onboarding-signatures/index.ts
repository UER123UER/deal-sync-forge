import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type SignaturePayload = {
  documentKey: string;
  documentTitle: string;
  documentVersion: string;
  documentBody: string;
  signedName: string;
  signerEmail?: string | null;
  signatureType?: string;
  signatureValue?: string;
  consentText: string;
  agreedToTerms: boolean;
  agreedToEsign: boolean;
  evidence?: Record<string, unknown>;
};

function getIpAddress(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');

  if (forwardedFor) {
    const first = forwardedFor
      .split(',')
      .map((part) => part.trim())
      .find(Boolean);

    if (first) return first;
  }

  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = req.headers.get('Authorization');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase function credentials are not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unable to verify signer.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { signatures } = await req.json();

    if (!Array.isArray(signatures) || signatures.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one signature payload is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ipAddress = getIpAddress(req) ?? null;
    const userAgent = req.headers.get('user-agent');
    const originUrl = req.headers.get('origin') ?? req.headers.get('referer');
    const requestHeaders = {
      'user-agent': userAgent,
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer'),
      'x-forwarded-for': req.headers.get('x-forwarded-for'),
      'cf-connecting-ip': req.headers.get('cf-connecting-ip'),
      'x-real-ip': req.headers.get('x-real-ip'),
    };

    const rows = (signatures as SignaturePayload[]).map((signature) => {
      const documentKey = signature.documentKey?.trim();
      const documentTitle = signature.documentTitle?.trim();
      const documentVersion = signature.documentVersion?.trim();
      const documentBody = signature.documentBody?.trim();
      const signedName = signature.signedName?.trim();
      const consentText = signature.consentText?.trim();

      if (!documentKey || !documentTitle || !documentVersion || !documentBody || !signedName || !consentText) {
        throw new Error('Each signature payload must include document metadata, document text, signer name, and consent text.');
      }

      if (signature.agreedToTerms !== true || signature.agreedToEsign !== true) {
        throw new Error(`Document ${documentKey} is missing required legal consent.`);
      }

      return {
        user_id: user.id,
        document_key: documentKey,
        document_title: documentTitle,
        document_version: documentVersion,
        document_body: documentBody,
        signer_name: signedName,
        signer_email: signature.signerEmail?.trim() || user.email || null,
        signature_type: signature.signatureType?.trim() || 'typed_name',
        signature_value: signature.signatureValue?.trim() || signedName,
        consent_text: consentText,
        agreed_to_terms: true,
        agreed_to_esign: true,
        ip_address: ipAddress,
        user_agent: userAgent,
        origin_url: originUrl,
        request_headers: requestHeaders,
        evidence: signature.evidence && typeof signature.evidence === 'object' ? signature.evidence : {},
      };
    });

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await admin
      .from('onboarding_signature_events')
      .insert(rows)
      .select('id, document_key, document_version, document_hash, signed_at');

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, records: data ?? [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('record-onboarding-signatures error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
