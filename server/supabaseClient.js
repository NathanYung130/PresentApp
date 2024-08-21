const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yfwpnyixwmpaorygujhw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmd3BueWl4d21wYW9yeWd1amh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNDQzODMsImV4cCI6MjAzOTcyMDM4M30.FyQBmQ0oppZrpMJ3RCneulxM_rdr41bZU3L0rPSyz3k';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;