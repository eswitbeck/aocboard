CREATE TABLE ScoringScheme (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT ''
);

INSERT INTO ScoringScheme (type, display_name, description)
VALUES 
  ('tier', 'Tiered', 'For each star, first place gets 5 points, second 2, third 1, and everyone else 0.'),
  ('proportional', 'Proportional', 'For each star, scores are 100 * (fastest time / your time).');

ALTER TABLE LeaderBoard ADD COLUMN scoring_scheme_id INT NOT NULL DEFAULT 1;
ALTER TABLE LeaderBoard ADD FOREIGN KEY (scoring_scheme_id) REFERENCES ScoringScheme(id);
