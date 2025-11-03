-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'panel', 'guest');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role user_role DEFAULT 'guest' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Teas table (차 마스터 DB)
CREATE TABLE public.teas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  year INTEGER NOT NULL,
  category TEXT NOT NULL, -- 녹차, 청차, 홍차, 황차, 흑차, 백차, 보이 등
  origin TEXT,
  seller TEXT, -- admin만 조회 가능
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES public.users(id)
);

-- Assessments table (품평 DB)
CREATE TABLE public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tea_id UUID REFERENCES public.teas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  assessment_date DATE DEFAULT CURRENT_DATE NOT NULL,
  utensils TEXT, -- 사용물
  notes TEXT, -- 개인감상
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Assessment scores table
CREATE TABLE public.assessment_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  -- 주요 품평 요소 (0-10, 0.5 step)
  thickness NUMERIC(3,1) CHECK (thickness >= 0 AND thickness <= 10),
  density NUMERIC(3,1) CHECK (density >= 0 AND density <= 10),
  smoothness NUMERIC(3,1) CHECK (smoothness >= 0 AND smoothness <= 10),
  clarity NUMERIC(3,1) CHECK (clarity >= 0 AND clarity <= 10),
  granularity NUMERIC(3,1) CHECK (granularity >= 0 AND granularity <= 10),
  -- 부가 품평 요소 (0-5, 0.5 step)
  aroma_continuity NUMERIC(2,1) CHECK (aroma_continuity >= 0 AND aroma_continuity <= 5),
  aroma_length NUMERIC(2,1) CHECK (aroma_length >= 0 AND aroma_length <= 5),
  refinement NUMERIC(2,1) CHECK (refinement >= 0 AND refinement <= 5),
  delicacy NUMERIC(2,1) CHECK (delicacy >= 0 AND delicacy <= 5),
  aftertaste NUMERIC(2,1) CHECK (aftertaste >= 0 AND aftertaste <= 5)
);

-- Create indexes
CREATE INDEX idx_teas_year ON public.teas(year DESC);
CREATE INDEX idx_teas_category ON public.teas(category);
CREATE INDEX idx_teas_name_ko ON public.teas(name_ko);
CREATE INDEX idx_assessments_tea_id ON public.assessments(tea_id);
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessment_scores_assessment_id ON public.assessment_scores(assessment_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teas_updated_at BEFORE UPDATE ON public.teas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admin can read all users
CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update user roles
CREATE POLICY "Admin can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for teas table
-- Everyone can read basic tea info (but seller field will be filtered in application layer)
CREATE POLICY "Anyone can read teas" ON public.teas
  FOR SELECT USING (true);

-- Admin can insert teas
CREATE POLICY "Admin can insert teas" ON public.teas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update teas
CREATE POLICY "Admin can update teas" ON public.teas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can delete teas
CREATE POLICY "Admin can delete teas" ON public.teas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for assessments table
-- Panel and admin can read assessments
CREATE POLICY "Panel and admin can read assessments" ON public.assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'panel')
    )
  );

-- Panel can insert assessments
CREATE POLICY "Panel can insert assessments" ON public.assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'panel')
    )
  );

-- Users can update their own assessments, admin can update all
CREATE POLICY "Users can update own assessments" ON public.assessments
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can delete their own assessments, admin can delete all
CREATE POLICY "Users can delete own assessments" ON public.assessments
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for assessment_scores table
-- Panel and admin can read scores
CREATE POLICY "Panel and admin can read scores" ON public.assessment_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'panel')
    )
  );

-- Panel can insert scores
CREATE POLICY "Panel can insert scores" ON public.assessment_scores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'panel')
    )
  );

-- Users can update scores of their own assessments, admin can update all
CREATE POLICY "Users can update own scores" ON public.assessment_scores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_scores.assessment_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can delete scores of their own assessments, admin can delete all
CREATE POLICY "Users can delete own scores" ON public.assessment_scores
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_scores.assessment_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create view for tea with average scores (for guest users)
CREATE OR REPLACE VIEW public.tea_average_scores AS
SELECT 
  t.id,
  t.name_ko,
  t.name_en,
  t.year,
  t.category,
  t.origin,
  COUNT(DISTINCT a.id) as assessment_count,
  AVG(s.thickness) as avg_thickness,
  AVG(s.density) as avg_density,
  AVG(s.smoothness) as avg_smoothness,
  AVG(s.clarity) as avg_clarity,
  AVG(s.granularity) as avg_granularity,
  AVG(s.aroma_continuity) as avg_aroma_continuity,
  AVG(s.aroma_length) as avg_aroma_length,
  AVG(s.refinement) as avg_refinement,
  AVG(s.delicacy) as avg_delicacy,
  AVG(s.aftertaste) as avg_aftertaste
FROM public.teas t
LEFT JOIN public.assessments a ON t.id = a.tea_id
LEFT JOIN public.assessment_scores s ON a.id = s.assessment_id
GROUP BY t.id, t.name_ko, t.name_en, t.year, t.category, t.origin;

-- Grant access to the view
GRANT SELECT ON public.tea_average_scores TO authenticated;
GRANT SELECT ON public.tea_average_scores TO anon;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'guest'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
