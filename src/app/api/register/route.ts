import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      age,
      gender,
      phone,
      whatsapp,
      residentialArea,
      emergencyContact,
      healthMedical,
      stay,
      idVerification,
      passportPhoto,
      rulesAccepted,
    } = body;

    // Validation
    if (!fullName || !phone || !gender || !emergencyContact?.name || !emergencyContact?.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required registration fields' },
        { status: 400 }
      );
    }

    if (!rulesAccepted) {
      return NextResponse.json(
        { success: false, error: 'Dawabit and rules must be accepted' },
        { status: 400 }
      );
    }

    // Generate clean tracking code if not provided
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refCode = body.refCode || `ITK-2026-${randomSuffix}`;

    const newParticipantRecord = {
      id: body.id || `itk-${Date.now()}`,
      ref_code: refCode,
      full_name: fullName,
      age: Number(age) || 25,
      gender,
      phone,
      whatsapp: whatsapp || phone,
      residential_area: residentialArea || '',
      passport_photo: passportPhoto || null,
      dar_id: body.darId || null,
      emergency_contact: emergencyContact,
      health_medical: healthMedical || { hasChronicCondition: false, conditions: [] },
      stay: stay || { stayType: 'full_10_days' },
      id_verification: idVerification || { verified: false },
      rules_accepted: true,
      rules_accepted_at: new Date().toISOString(),
      status: 'pending',
      status_notes: 'Online registration received. Queued for screening and Dār assignment.',
      allocated_space: null,
      attendance: { checkedIn: false, lanyardTagIssued: false, checkedOut: false },
      created_at: new Date().toISOString(),
    };

    // Supabase integration if environment variables are present
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/participants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(newParticipantRecord),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn('Supabase insert note:', errText);
        }
      } catch (sbErr) {
        console.warn('Supabase connection note:', sbErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        refCode,
        message: 'I’tikāf registration successfully received.',
        participant: newParticipantRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
