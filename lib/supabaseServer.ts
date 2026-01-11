import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
        '환경변수가 설정되지 않았습니다. .env.local 파일에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.'
    );
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
});
