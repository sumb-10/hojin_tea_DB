-- Sample data for testing
-- Note: This assumes you have already created users through Google OAuth
-- You'll need to replace the UUID values with actual user IDs from your auth.users table

-- Insert sample teas
INSERT INTO public.teas (name_ko, name_en, year, category, origin, seller) VALUES
('동방미인', 'Oriental Beauty', 2022, '청차', '대만', '티하우스'),
('대홍포', 'Da Hong Pao', 1998, '청차', '복건', '차예원'),
('용정', 'Longjing', 2024, '녹차', '절강', '티소사이어티'),
('백호은침', 'Silver Needle', 2023, '백차', '복건', '티하우스'),
('보이생차', 'Pu-erh Raw', 2015, '흑차', '운남', '푸얼샵');

-- Note: To insert sample assessments and scores, you'll need to:
-- 1. First create users through Google OAuth
-- 2. Update their roles using the admin panel
-- 3. Then manually insert sample assessments using the actual user IDs

-- Example (replace UUIDs with actual values):
-- INSERT INTO public.assessments (tea_id, user_id, assessment_date, notes) VALUES
-- ((SELECT id FROM public.teas WHERE name_ko = '동방미인'), 'user-uuid-here', '2024-10-15', '꿀과 과일향이 조화롭고 부드러운 바디감. 여운이 길게 남는 우아한 청차.');
