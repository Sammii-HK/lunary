-- Year Analysis Cache Table
-- Stores computed year-over-year analysis results for performance

CREATE TABLE IF NOT EXISTS year_analysis (
  user_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, year)
);

CREATE INDEX IF NOT EXISTS idx_year_analysis_user_id ON year_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_year_analysis_year ON year_analysis(year);
CREATE INDEX IF NOT EXISTS idx_year_analysis_updated_at ON year_analysis(updated_at);

