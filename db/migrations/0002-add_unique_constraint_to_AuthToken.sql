ALTER TABLE AuthToken
ADD CONSTRAINT AuthToken_unique UNIQUE (user_id);
