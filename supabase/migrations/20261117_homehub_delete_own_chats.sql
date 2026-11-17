-- Permite que o usuário autenticado exclua apenas o próprio histórico do HOME HUB.
-- Execute no SQL Editor do Supabase se as políticas de DELETE ainda não existirem.
ALTER TABLE public.homehub_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homehub_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "homehub_chats_delete_own" ON public.homehub_chats;
CREATE POLICY "homehub_chats_delete_own" ON public.homehub_chats FOR DELETE TO authenticated USING (user_id = (select auth.uid()));
DROP POLICY IF EXISTS "homehub_messages_delete_own" ON public.homehub_messages;
CREATE POLICY "homehub_messages_delete_own" ON public.homehub_messages FOR DELETE TO authenticated USING (user_id = (select auth.uid()));
