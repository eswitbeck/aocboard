ALTER TABLE Submission
  ADD COLUMN star_1_score INT NOT NULL DEFAULT 0,
  ADD COLUMN star_2_score INT NOT NULL DEFAULT 0,
  ADD COLUMN star_1_index INT,
  ADD COLUMN star_2_index INT,
  DROP COLUMN score;
