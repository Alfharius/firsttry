import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Клиент Supabase для данных и API (создаётся при наличии URL и anon key). */
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

/** Есть ли подключение к Supabase для работы с БД. */
export const hasSupabaseClient = Boolean(supabase)

/**
 * Локальная имитация auth без запросов к Supabase Auth.
 * Данные (events, profiles) при этом могут идти из Supabase, если заданы URL и ключ.
 */
export const useMockAuth = import.meta.env.VITE_USE_MOCK === 'true'
