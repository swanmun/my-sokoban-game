import { supabase } from '../lib/supabase.js';

// item 테이블의 id=1 행 하나에 누적 사과 개수를 저장한다.
const ROW_ID = 1;

export async function loadApples() {
  const { data, error } = await supabase.from('item').select('apple').eq('id', ROW_ID).single();
  if (error) throw error;
  return data.apple ?? 0;
}

export async function saveApples(apple) {
  const { error } = await supabase.from('item').update({ apple }).eq('id', ROW_ID);
  if (error) throw error;
}
