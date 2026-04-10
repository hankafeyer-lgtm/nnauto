CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(240) NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author TEXT,
  tags TEXT[],
  related_brands TEXT[],
  related_models TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_unique ON articles (slug);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles (published_at);
CREATE INDEX IF NOT EXISTS articles_is_published_idx ON articles (is_published);
