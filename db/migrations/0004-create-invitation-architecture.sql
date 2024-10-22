CREATE TABLE Invitation (
  leaderboard_id INT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  code VARCHAR(7) NOT NULL,

  FOREIGN KEY (leaderboard_id) REFERENCES Leaderboard(id) ON DELETE CASCADE,
  UNIQUE (code),
  UNIQUE (leaderboard_id)
);

CREATE INDEX ON Invitation (code);
