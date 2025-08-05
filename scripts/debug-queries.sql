
SELECT id, username, email, balance, is_active 
FROM users 
WHERE id = 3;

SELECT * 
FROM predictions 
WHERE user_id = 3 AND match_id = 1;

SELECT id, home_team, away_team, match_date, status, odds_home, odds_draw, odds_away
FROM matches 
WHERE id = 1;

\d predictions;

SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'predictions'::regclass;

SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'predictions'::regclass;
