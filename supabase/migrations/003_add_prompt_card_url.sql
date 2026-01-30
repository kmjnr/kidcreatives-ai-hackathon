-- Add prompt_card_url column to creations table
ALTER TABLE creations 
ADD COLUMN prompt_card_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN creations.prompt_card_url IS 'URL to PNG screenshot of Prompt Master Card (HoloCard)';

-- Rollback (if needed):
-- ALTER TABLE creations DROP COLUMN prompt_card_url;
