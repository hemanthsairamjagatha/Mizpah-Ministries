// test-supabase-integration.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulxlpwipdvejzdzhmhwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseGxwd2lwZHZlanpkemhtaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDI1NTQsImV4cCI6MjEwODUxODU1NH0.rKWX5kFwxom9mxCR7NQlP2M6MJRtQveEb8UQMmZ86L0';

console.log('=== STARTING SUPABASE INTEGRATION & RLS SECURITY AUDIT ===\n');

// 1. ANONYMOUS CLIENT
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runAudit() {
  const results = {
    passed: [],
    failed: []
  };

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      results.passed.push(testName);
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      results.failed.push({ testName, details });
    }
  }

  // TEST 1: Anonymous Public Data Fetching
  console.log('\n--- 1. Testing Anonymous Public Reads ---');
  
  const { data: settings, error: settingsErr } = await anonClient.from('site_settings').select('*').limit(1);
  assert(!settingsErr && settings && settings.length > 0, 'Public read site_settings', settingsErr?.message);

  const { data: heroes, error: heroErr } = await anonClient.from('hero_sections').select('*').eq('is_published', true);
  assert(!heroErr && heroes && heroes.length > 0, 'Public read published hero_sections', heroErr?.message);

  const { data: aboutGod, error: aboutErr } = await anonClient.from('about_god_cards').select('*').eq('is_published', true);
  assert(!aboutErr && aboutGod && aboutGod.length > 0, 'Public read published about_god_cards', aboutErr?.message);

  const { data: founders, error: founderErr } = await anonClient.from('founders').select('*').eq('is_published', true);
  assert(!founderErr && founders && founders.length > 0, 'Public read published founders', founderErr?.message);

  const { data: sermons, error: sermonErr } = await anonClient.from('sermons').select('*').eq('is_published', true);
  assert(!sermonErr && sermons && sermons.length > 0, 'Public read published sermons', sermonErr?.message);

  const { data: categories, error: catErr } = await anonClient.from('gallery_categories').select('*');
  assert(!catErr && categories && categories.length >= 6, 'Public read gallery_categories (>= 6 categories)', catErr?.message);

  const { data: collections, error: colErr } = await anonClient.from('gallery_collections').select('*').eq('is_published', true);
  assert(!colErr && collections && collections.length > 0, 'Public read published gallery_collections', colErr?.message);

  // TEST 2: Anonymous Public Contact Form Submission
  console.log('\n--- 2. Testing Public Contact Form Submission ---');
  const testMsgEmail = `visitor_${Date.now()}@example.com`;
  const { error: contactInsertErr } = await anonClient.from('contact_messages').insert({
    name: 'Audit Visitor Test',
    email: testMsgEmail,
    phone: '555-0199',
    subject: 'Automated Audit Verification',
    message: 'This is a test message to verify the public contact flow directly in Supabase.',
    status: 'unread'
  });
  assert(!contactInsertErr, 'Anonymous visitor can insert contact message', contactInsertErr?.message);

  // TEST 3: RLS Security Enforcement on Anonymous Client (MUST FAIL)
  console.log('\n--- 3. Testing RLS Security Enforcement on Anonymous Requests ---');

  // Anon trying to read contact_messages
  const { data: anonReadMessages } = await anonClient.from('contact_messages').select('*');
  assert(!anonReadMessages || anonReadMessages.length === 0, 'Anonymous users CANNOT read contact_messages (RLS blocked)', `Returned ${anonReadMessages?.length} rows`);

  // Anon trying to insert into hero_sections
  const { error: anonHeroInsertErr } = await anonClient.from('hero_sections').insert({
    title: 'Hacked Hero',
    description: 'Should be blocked by RLS',
    image_path: 'https://example.com/hacked.jpg',
    is_published: true
  });
  assert(!!anonHeroInsertErr, 'Anonymous users CANNOT insert into hero_sections (RLS blocked)', anonHeroInsertErr ? 'Blocked successfully' : 'Security Breach: Anon inserted!');

  // Anon trying to delete a sermon
  if (sermons && sermons.length > 0) {
    const targetSermonId = sermons[0].id;
    await anonClient.from('sermons').delete().eq('id', targetSermonId);
    const { data: checkSermon } = await anonClient.from('sermons').select('id').eq('id', targetSermonId);
    assert(checkSermon && checkSermon.length === 1, 'Anonymous users CANNOT delete sermons (RLS blocked)');
  }

  // Anon trying to update site_settings
  await anonClient.from('site_settings').update({ church_name: 'Hacked Church' }).eq('id', settings[0].id);
  const { data: verifySettings } = await anonClient.from('site_settings').select('church_name').eq('id', settings[0].id).single();
  assert(verifySettings && verifySettings.church_name === settings[0].church_name, 'Anonymous users CANNOT update site_settings (RLS blocked)', `Church name changed to ${verifySettings?.church_name}`);

  // TEST 4: Admin Authentication
  console.log('\n--- 4. Testing Admin Authentication ---');
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authErr } = await adminClient.auth.signInWithPassword({
    email: 'admin@mizpahministries.org',
    password: 'admin123456'
  });
  assert(!authErr && authData.session && authData.user, 'Admin authentication with GoTrue', authErr?.message);

  if (authData.user) {
    const { data: profile, error: profErr } = await adminClient.from('admin_profiles').select('*').eq('id', authData.user.id).single();
    assert(!profErr && profile && profile.role === 'superadmin', `Admin profile verified (role: ${profile?.role})`, profErr?.message);
  }

  // TEST 5: Authenticated Admin CRUD Operations
  console.log('\n--- 5. Testing Authenticated Admin CRUD Operations ---');

  // A. Hero Slide CRUD
  const { data: newHero, error: newHeroErr } = await adminClient.from('hero_sections').insert({
    title: 'Audit Hero Slide',
    description: 'Testing admin slide creation',
    image_path: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3',
    button_text: 'Test CTA',
    button_url: '#contact',
    is_published: false,
    sort_order: 99
  }).select().single();
  assert(!newHeroErr && newHero && newHero.id, 'Admin CREATE hero_section', newHeroErr?.message);

  if (newHero) {
    const { data: updatedHero, error: updateHeroErr } = await adminClient.from('hero_sections').update({
      title: 'Updated Audit Hero Slide'
    }).eq('id', newHero.id).select().single();
    assert(!updateHeroErr && updatedHero && updatedHero.title === 'Updated Audit Hero Slide', 'Admin UPDATE hero_section', updateHeroErr?.message);

    const { error: delHeroErr } = await adminClient.from('hero_sections').delete().eq('id', newHero.id);
    assert(!delHeroErr, 'Admin DELETE hero_section', delHeroErr?.message);
  }

  // B. About God Card CRUD
  const { data: newCard, error: newCardErr } = await adminClient.from('about_god_cards').insert({
    title: 'Audit Faith Card',
    short_description: 'Audit Short',
    full_description: 'Audit Full description of theological truth tested here.',
    image_path: 'https://images.unsplash.com/photo-1507692049790-de58290a4334',
    is_published: false,
    sort_order: 99
  }).select().single();
  assert(!newCardErr && newCard && newCard.id, 'Admin CREATE about_god_card', newCardErr?.message);

  if (newCard) {
    const { error: delCardErr } = await adminClient.from('about_god_cards').delete().eq('id', newCard.id);
    assert(!delCardErr, 'Admin DELETE about_god_card', delCardErr?.message);
  }

  // C. Sermon CRUD
  const { data: newSermon, error: newSermonErr } = await adminClient.from('sermons').insert({
    title: 'Audit Sermon Message',
    description: 'Audit sermon description',
    pastor_name: 'Pastor Ezekiel.G',
    sermon_date: '2026-10-28',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    is_published: false
  }).select().single();
  assert(!newSermonErr && newSermon && newSermon.id, 'Admin CREATE sermon', newSermonErr?.message);

  if (newSermon) {
    const { error: delSermonErr } = await adminClient.from('sermons').delete().eq('id', newSermon.id);
    assert(!delSermonErr, 'Admin DELETE sermon', delSermonErr?.message);
  }

  // D. Contact Messages Management (Read, Update Status, Notes, Delete)
  const { data: adminMessages, error: adminMsgErr } = await adminClient.from('contact_messages').select('*').order('created_at', { ascending: false });
  assert(!adminMsgErr && adminMessages && adminMessages.length > 0, `Admin READ contact_messages (${adminMessages?.length} inquiries retrieved)`, adminMsgErr?.message);

  const insertedMsg = adminMessages?.find(m => m.email === testMsgEmail);
  if (insertedMsg) {
    // Update status to replied and add internal notes
    const { data: updatedMsg, error: updateMsgErr } = await adminClient.from('contact_messages').update({
      status: 'replied',
      internal_notes: 'Audited and verified by automated test runner'
    }).eq('id', insertedMsg.id).select().single();
    assert(!updateMsgErr && updatedMsg && updatedMsg.status === 'replied' && updatedMsg.internal_notes, 'Admin UPDATE contact_message status & internal_notes', updateMsgErr?.message);

    // Clean up test message
    const { error: delMsgErr } = await adminClient.from('contact_messages').delete().eq('id', insertedMsg.id);
    assert(!delMsgErr, 'Admin DELETE contact_message', delMsgErr?.message);
  }

  // TEST 6: Supabase Storage Buckets
  console.log('\n--- 6. Testing Supabase Storage Buckets ---');
  const buckets = ['site-assets', 'about-images', 'founder-images', 'sermon-thumbnails', 'gallery-images'];
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const pngBuffer = Buffer.from(pngBase64, 'base64');

  for (const b of buckets) {
    const testFileName = `audit_test_${Date.now()}.png`;
    
    // Upload valid image file
    const { data: uploadData, error: uploadErr } = await adminClient.storage.from(b).upload(`tests/${testFileName}`, pngBuffer, {
      contentType: 'image/png',
      upsert: true
    });
    
    if (uploadErr) {
      assert(false, `Admin upload to storage bucket [${b}]`, uploadErr.message);
    } else {
      // Get public URL
      const { data: urlData } = adminClient.storage.from(b).getPublicUrl(`tests/${testFileName}`);
      assert(!!urlData.publicUrl, `Admin upload & retrieve public URL [${b}]`);
      
      // Delete test file
      await adminClient.storage.from(b).remove([`tests/${testFileName}`]);
    }
  }

  console.log('\n========================================');
  console.log(`TOTAL TESTS: ${results.passed.length + results.failed.length}`);
  console.log(`PASSED: ${results.passed.length}`);
  console.log(`FAILED: ${results.failed.length}`);
  console.log('========================================\n');

  if (results.failed.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch(err => {
  console.error('Audit script exception:', err);
  process.exit(1);
});
