import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authentication check — only authenticated users with a valid token can seed
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    console.log(`Seed called by user: ${claimsData.claims.sub}`)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const password = 'urgenceos2026'

    // Create 5 test users
    const users = [
      { email: 'martin@urgenceos.fr', full_name: 'Dr. Martin Dupont', role: 'medecin' },
      { email: 'sophie@urgenceos.fr', full_name: 'Sophie Lefèvre', role: 'ioa' },
      { email: 'julie@urgenceos.fr', full_name: 'Julie Bernard', role: 'ide' },
      { email: 'marc@urgenceos.fr', full_name: 'Marc Petit', role: 'as' },
      { email: 'nathalie@urgenceos.fr', full_name: 'Nathalie Moreau', role: 'secretaire' },
    ]

    const userIds: Record<string, string> = {}

    for (const u of users) {
      // Check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existing = existingUsers?.users?.find(eu => eu.email === u.email)
      
      if (existing) {
        userIds[u.role] = existing.id
        console.log(`User ${u.email} already exists: ${existing.id}`)
      } else {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: u.email,
          password,
          email_confirm: true,
          user_metadata: { full_name: u.full_name },
        })
        if (error) {
          console.error(`Error creating user ${u.email}:`, error.message)
          continue
        }
        userIds[u.role] = data.user.id
        console.log(`Created user ${u.email}: ${data.user.id}`)
      }

      // Ensure role exists
      const { error: roleErr } = await supabaseAdmin.from('user_roles').upsert(
        { user_id: userIds[u.role], role: u.role },
        { onConflict: 'user_id,role' }
      )
      if (roleErr) console.error(`Role error for ${u.role}:`, roleErr.message)
    }

    const medecinId = userIds['medecin']
    const ideId = userIds['ide']

    // Create patients
    const patientsData = [
      { nom: 'MARTIN', prenom: 'Pierre', date_naissance: '1955-03-15', sexe: 'M', allergies: ['Pénicilline'], antecedents: ['HTA', 'Diabète type 2'], medecin_traitant: 'Dr. Leroy' },
      { nom: 'DUBOIS', prenom: 'Marie', date_naissance: '1948-07-22', sexe: 'F', allergies: [], antecedents: ['BPCO', 'FA'], medecin_traitant: 'Dr. Roux' },
      { nom: 'BERNARD', prenom: 'Lucas', date_naissance: '1992-11-08', sexe: 'M', allergies: ['Aspirine'], antecedents: [], medecin_traitant: 'Dr. Simon' },
      { nom: 'PETIT', prenom: 'Sophie', date_naissance: '1980-01-30', sexe: 'F', allergies: [], antecedents: ['Asthme'], medecin_traitant: 'Dr. Laurent' },
      { nom: 'ROBERT', prenom: 'Jean', date_naissance: '1940-05-12', sexe: 'M', allergies: ['Iode'], antecedents: ['Insuffisance rénale', 'HTA'], medecin_traitant: 'Dr. Garcia' },
      { nom: 'MOREAU', prenom: 'Camille', date_naissance: '1975-09-18', sexe: 'F', allergies: [], antecedents: ['Migraine chronique'], medecin_traitant: 'Dr. Martin' },
      { nom: 'SIMON', prenom: 'Thomas', date_naissance: '1998-12-25', sexe: 'M', allergies: [], antecedents: [], medecin_traitant: null },
      { nom: 'LAURENT', prenom: 'Émilie', date_naissance: '1965-06-03', sexe: 'F', allergies: ['Pénicilline', 'Sulfamides'], antecedents: ['HTA', 'Hypothyroïdie'], medecin_traitant: 'Dr. Blanc' },
      { nom: 'LEROY', prenom: 'Antoine', date_naissance: '1937-02-14', sexe: 'M', allergies: [], antecedents: ['AVC', 'FA', 'HTA'], medecin_traitant: 'Dr. Dupont' },
      { nom: 'ROUX', prenom: 'Chloé', date_naissance: '2001-08-07', sexe: 'F', allergies: [], antecedents: [], medecin_traitant: null },
      { nom: 'GARCIA', prenom: 'Michel', date_naissance: '1960-04-20', sexe: 'M', allergies: ['Morphine'], antecedents: ['Diabète type 2', 'Obésité'], medecin_traitant: 'Dr. Martinez' },
      { nom: 'MARTINEZ', prenom: 'Julie', date_naissance: '1988-10-11', sexe: 'F', allergies: [], antecedents: ['Endométriose'], medecin_traitant: 'Dr. Lefèvre' },
      { nom: 'BLANC', prenom: 'Henri', date_naissance: '1945-12-01', sexe: 'M', allergies: [], antecedents: ['BPCO', 'Insuffisance cardiaque'], medecin_traitant: 'Dr. Petit' },
      { nom: 'FOURNIER', prenom: 'Léa', date_naissance: '1995-03-28', sexe: 'F', allergies: ['Latex'], antecedents: [], medecin_traitant: null },
      { nom: 'GIRARD', prenom: 'Paul', date_naissance: '1970-07-16', sexe: 'M', allergies: [], antecedents: ['Lombalgie chronique'], medecin_traitant: 'Dr. Durand' },
    ]

    const { data: patients, error: patErr } = await supabaseAdmin.from('patients').insert(patientsData).select()
    if (patErr) {
      console.error('Patients insert error:', patErr.message)
      return new Response(JSON.stringify({ error: patErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    console.log(`Inserted ${patients.length} patients`)

    // Create encounters
    const motifs = ['Douleur thoracique', 'Chute', 'Dyspnée', 'Douleur abdominale', 'Traumatisme membre', 'Céphalée intense', 'Malaise', 'Intoxication médicamenteuse', 'AEG', 'Plaie profonde', 'Brûlure', 'Lombalgie aiguë', 'Douleur thoracique atypique', 'Fracture suspectée', 'Détresse respiratoire']
    const zones: ('sau' | 'uhcd' | 'dechocage')[] = ['sau', 'sau', 'sau', 'sau', 'sau', 'sau', 'sau', 'uhcd', 'uhcd', 'uhcd', 'uhcd', 'sau', 'dechocage', 'sau', 'dechocage']
    const ccmus = [3, 3, 4, 2, 2, 3, 1, 4, 3, 2, 3, 2, 3, 2, 5]
    const statuses: string[] = ['in-progress', 'in-progress', 'in-progress', 'triaged', 'in-progress', 'triaged', 'in-progress', 'in-progress', 'in-progress', 'triaged', 'in-progress', 'arrived', 'in-progress', 'triaged', 'in-progress']

    const encountersData = patients.map((p: any, i: number) => ({
      patient_id: p.id,
      status: statuses[i],
      zone: zones[i],
      box_number: i < 8 ? i + 1 : null,
      ccmu: ccmus[i],
      cimu: ccmus[i],
      motif_sfmu: motifs[i],
      medecin_id: medecinId || null,
      ide_id: ideId || null,
      arrival_time: new Date(Date.now() - (Math.random() * 6 * 60 * 60 * 1000)).toISOString(),
      triage_time: statuses[i] !== 'arrived' ? new Date(Date.now() - (Math.random() * 5 * 60 * 60 * 1000)).toISOString() : null,
    }))

    const { data: encounters, error: encErr } = await supabaseAdmin.from('encounters').insert(encountersData).select()
    if (encErr) {
      console.error('Encounters insert error:', encErr.message)
      return new Response(JSON.stringify({ error: encErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    console.log(`Inserted ${encounters.length} encounters`)

    // Create vitals for each encounter (2-4 series)
    const vitalsInserts: any[] = []
    for (const enc of encounters) {
      const numSeries = 2 + Math.floor(Math.random() * 3)
      for (let s = 0; s < numSeries; s++) {
        vitalsInserts.push({
          encounter_id: enc.id,
          patient_id: enc.patient_id,
          recorded_by: ideId || null,
          fc: 60 + Math.floor(Math.random() * 60),
          pa_systolique: 90 + Math.floor(Math.random() * 80),
          pa_diastolique: 50 + Math.floor(Math.random() * 50),
          spo2: 88 + Math.floor(Math.random() * 12),
          temperature: parseFloat((36 + Math.random() * 3).toFixed(1)),
          frequence_respiratoire: 10 + Math.floor(Math.random() * 20),
          gcs: 12 + Math.floor(Math.random() * 4),
          eva_douleur: Math.floor(Math.random() * 10),
          recorded_at: new Date(Date.now() - (numSeries - s) * 45 * 60 * 1000).toISOString(),
        })
      }
    }
    await supabaseAdmin.from('vitals').insert(vitalsInserts)
    console.log(`Inserted ${vitalsInserts.length} vitals`)

    // Prescriptions — enriched with more meds and priorities
    const meds = [
      { name: 'Paracétamol', dosage: '1g', route: 'PO', freq: 'Toutes les 6h', priority: 'routine' },
      { name: 'Morphine', dosage: '5mg', route: 'IV', freq: 'Si EVA > 6', priority: 'urgent' },
      { name: 'NaCl 0.9%', dosage: '500ml', route: 'IV', freq: 'En 2h', priority: 'routine' },
      { name: 'Ceftriaxone', dosage: '2g', route: 'IV', freq: '1x/jour', priority: 'urgent' },
      { name: 'Kétoprofène', dosage: '100mg', route: 'IV', freq: 'Toutes les 8h', priority: 'routine' },
      { name: 'Oméprazole', dosage: '40mg', route: 'IV', freq: '1x/jour', priority: 'routine' },
      { name: 'Métoclopramide', dosage: '10mg', route: 'IV', freq: 'Si nausées', priority: 'routine' },
      { name: 'Amoxicilline', dosage: '1g', route: 'PO', freq: 'Toutes les 8h', priority: 'routine' },
      { name: 'Enoxaparine', dosage: '4000UI', route: 'SC', freq: '1x/jour', priority: 'routine' },
      { name: 'Salbutamol', dosage: '5mg', route: 'INH', freq: 'Toutes les 4h', priority: 'urgent' },
      { name: 'Morphine', dosage: '10mg', route: 'IV', freq: 'Titration', priority: 'stat' },
      { name: 'Adrénaline', dosage: '1mg', route: 'IV', freq: 'Si ACR', priority: 'stat' },
    ]

    const rxInserts: any[] = []
    for (let i = 0; i < encounters.length; i++) {
      const numRx = 2 + Math.floor(Math.random() * 3)
      for (let r = 0; r < numRx; r++) {
        const med = meds[Math.floor(Math.random() * meds.length)]
        rxInserts.push({
          encounter_id: encounters[i].id,
          patient_id: encounters[i].patient_id,
          prescriber_id: medecinId,
          medication_name: med.name,
          dosage: med.dosage,
          route: med.route,
          frequency: med.freq,
          status: Math.random() > 0.7 ? 'completed' : 'active',
          priority: med.priority,
        })
      }
    }
    let insertedRx: any[] = []
    if (medecinId) {
      const { data: rxData } = await supabaseAdmin.from('prescriptions').insert(rxInserts).select()
      insertedRx = rxData || []
      console.log(`Inserted ${insertedRx.length} prescriptions`)
    }

    // Administrations — mark some prescriptions as administered
    const adminInserts: any[] = []
    if (ideId && insertedRx.length > 0) {
      const completedRx = insertedRx.filter((rx: any) => rx.status === 'completed')
      const activeRx = insertedRx.filter((rx: any) => rx.status === 'active')
      // All completed + some active
      for (const rx of completedRx) {
        adminInserts.push({
          prescription_id: rx.id, encounter_id: rx.encounter_id, patient_id: rx.patient_id,
          administered_by: ideId, dose_given: rx.dosage, route: rx.route,
          administered_at: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000).toISOString(),
        })
      }
      for (let i = 0; i < Math.min(5, activeRx.length); i++) {
        adminInserts.push({
          prescription_id: activeRx[i].id, encounter_id: activeRx[i].encounter_id, patient_id: activeRx[i].patient_id,
          administered_by: ideId, dose_given: activeRx[i].dosage, route: activeRx[i].route,
          administered_at: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
        })
      }
      await supabaseAdmin.from('administrations').insert(adminInserts)
      console.log(`Inserted ${adminInserts.length} administrations`)
    }

    // Procedures
    const procTypes: ('vvp' | 'prelevement' | 'ecg' | 'pansement' | 'sondage')[] = ['vvp', 'prelevement', 'ecg', 'pansement', 'vvp', 'prelevement', 'ecg', 'prelevement', 'vvp', 'ecg']
    const procInserts: any[] = []
    if (ideId) {
      for (let i = 0; i < Math.min(10, encounters.length); i++) {
        procInserts.push({
          encounter_id: encounters[i].id, patient_id: encounters[i].patient_id,
          performed_by: ideId, procedure_type: procTypes[i],
          notes: procTypes[i] === 'vvp' ? 'VVP 18G bras gauche' : procTypes[i] === 'ecg' ? 'ECG 12 dérivations, rythme sinusal' : null,
          performed_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
        })
      }
      await supabaseAdmin.from('procedures').insert(procInserts)
      console.log(`Inserted ${procInserts.length} procedures`)
    }

    // Results — bio + imagerie
    const resultInserts: any[] = []
    for (let i = 0; i < Math.min(encounters.length, 10); i++) {
      resultInserts.push({
        encounter_id: encounters[i].id, patient_id: encounters[i].patient_id,
        category: 'bio', title: 'NFS + Ionogramme',
        content: { hemoglobine: (10 + Math.random() * 6).toFixed(1), leucocytes: (4 + Math.random() * 12).toFixed(1), creatinine: (60 + Math.random() * 80).toFixed(0), potassium: (3.2 + Math.random() * 2).toFixed(1) },
        is_critical: Math.random() > 0.7, is_read: Math.random() > 0.5,
      })
    }
    // Troponin for chest pain
    resultInserts.push({ encounter_id: encounters[0].id, patient_id: encounters[0].patient_id, category: 'bio', title: 'Troponine', content: { troponine_us: '45', seuil: '14', unite: 'ng/L' }, is_critical: true, is_read: false })
    // CRP/Lactates
    resultInserts.push({ encounter_id: encounters[3].id, patient_id: encounters[3].patient_id, category: 'bio', title: 'CRP + Lactates', content: { CRP: '85 mg/L', lactates: '1.2 mmol/L', procalcitonine: '0.8 ng/mL' }, is_critical: false, is_read: false })
    resultInserts.push({ encounter_id: encounters[7].id, patient_id: encounters[7].patient_id, category: 'bio', title: 'BNP', content: { BNP: '1200 pg/mL', seuil: '100', interpretation: 'Très élevé — insuffisance cardiaque probable' }, is_critical: true, is_read: false })
    // Imagerie
    resultInserts.push({ encounter_id: encounters[2].id, patient_id: encounters[2].patient_id, category: 'imagerie', title: 'Radio thorax', content: { conclusion: 'Syndrome interstitiel bilatéral. Cardiomégalie modérée.', technique: 'Face debout' }, is_critical: true, is_read: false })
    resultInserts.push({ encounter_id: encounters[5].id, patient_id: encounters[5].patient_id, category: 'imagerie', title: 'Scanner cérébral', content: { conclusion: 'Pas de lésion hémorragique. Pas d\'effet de masse.', injection: 'Sans injection' }, is_critical: false, is_read: false })
    resultInserts.push({ encounter_id: encounters[9].id, patient_id: encounters[9].patient_id, category: 'imagerie', title: 'Radio poignet G', content: { conclusion: 'Fracture distale du radius sans déplacement.', technique: 'Face + profil' }, is_critical: false, is_read: true })
    resultInserts.push({ encounter_id: encounters[13].id, patient_id: encounters[13].patient_id, category: 'imagerie', title: 'Radio cheville D', content: { conclusion: 'Fracture malléole externe. Pas de luxation.', technique: 'Face + profil + mortaise' }, is_critical: false, is_read: false })
    // ECG
    resultInserts.push({ encounter_id: encounters[1].id, patient_id: encounters[1].patient_id, category: 'ecg', title: 'ECG 12 dérivations', content: { rythme: 'FA rapide à 130/min', axe: 'Normal', ST: 'Pas de sus-décalage', conclusion: 'Fibrillation auriculaire rapide' }, is_critical: true, is_read: false })

    await supabaseAdmin.from('results').insert(resultInserts)
    console.log(`Inserted ${resultInserts.length} results`)

    // Timeline items — enriched
    const timelineInserts: any[] = []
    for (const p of patients) {
      if (p.antecedents && p.antecedents.length > 0) {
        for (const ant of p.antecedents) {
          timelineInserts.push({ patient_id: p.id, item_type: 'antecedent', content: ant, source_document: 'DMP', source_date: '2025-01-15', source_author: 'Dr. Référent' })
        }
      }
      if (p.allergies && p.allergies.length > 0) {
        for (const al of p.allergies) {
          timelineInserts.push({ patient_id: p.id, item_type: 'allergie', content: `Allergie : ${al}`, source_document: 'DMP', source_date: '2024-06-01', source_author: 'Pharmacie' })
        }
      }
      const age = new Date().getFullYear() - new Date(p.date_naissance).getFullYear()
      if (age > 60) {
        timelineInserts.push({ patient_id: p.id, item_type: 'crh', content: 'Hospitalisation pour décompensation cardiaque. Traitement adapté. Sortie à J5.', source_document: 'CRH CHU', source_date: '2025-09-20', source_author: 'Dr. Cardiologue' })
      }
      // Add traitement items for patients with medecin_traitant
      if (p.medecin_traitant) {
        timelineInserts.push({ patient_id: p.id, item_type: 'traitement', content: 'Traitement habituel en cours — voir ordonnance', source_document: 'Ordonnance', source_date: '2025-11-01', source_author: p.medecin_traitant })
      }
      // Add diagnostic for some patients
      if (age > 50 && p.antecedents?.length > 0) {
        timelineInserts.push({ patient_id: p.id, item_type: 'diagnostic', content: `Suivi ${p.antecedents[0]} — dernier bilan stable`, source_document: 'Compte-rendu consultation', source_date: '2025-12-15', source_author: 'Spécialiste' })
      }
    }
    await supabaseAdmin.from('timeline_items').insert(timelineInserts)
    console.log(`Inserted ${timelineInserts.length} timeline items`)

    return new Response(JSON.stringify({
      success: true,
      users: Object.keys(userIds).length,
      patients: patients.length,
      encounters: encounters.length,
      vitals: vitalsInserts.length,
      prescriptions: insertedRx.length,
      administrations: adminInserts.length,
      procedures: procInserts.length,
      results: resultInserts.length,
      timeline: timelineInserts.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('Seed error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
