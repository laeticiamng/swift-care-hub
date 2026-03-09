
-- Remove duplicate cron job (keep job 3, remove job 2)
SELECT cron.unschedule(2);
