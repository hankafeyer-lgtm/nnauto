ALTER TABLE dealer_invoices
  ADD COLUMN IF NOT EXISTS html_content text,
  ADD COLUMN IF NOT EXISTS pdf_base64 text;
