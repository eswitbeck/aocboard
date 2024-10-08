CREATE TABLE IF NOT EXISTS AppUser (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    salt VARCHAR(16) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    link VARCHAR(255),
    join_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS AuthToken (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expire_time TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES AppUser(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS LeaderBoard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'New Leaderboard',
    note VARCHAR(255),
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES AppUser(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS UserLeaderBoard (
    user_id INT NOT NULL,
    leaderboard_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES AppUser(id) ON DELETE CASCADE,
    FOREIGN KEY (leaderboard_id) REFERENCES LeaderBoard(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, leaderboard_id)
);

CREATE TABLE IF NOT EXISTS LeaderBoardYear (
    year SMALLINT NOT NULL,
    leaderboard_id INT NOT NULL,
    FOREIGN KEY (leaderboard_id) REFERENCES LeaderBoard(id) ON DELETE CASCADE,
    PRIMARY KEY (year, leaderboard_id)
);

CREATE TABLE IF NOT EXISTS LeaderBoardDay (
    day SMALLINT NOT NULL,
    year SMALLINT NOT NULL,
    leaderboard_id INT NOT NULL,
    FOREIGN KEY (year, leaderboard_id)
      REFERENCES LeaderBoardYear(year, leaderboard_id) ON DELETE CASCADE,
    PRIMARY KEY (day, year, leaderboard_id)
);

CREATE TABLE IF NOT EXISTS Language (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS Submission (
    user_id INT NOT NULL,
    day SMALLINT NOT NULL,
    year SMALLINT NOT NULL,
    leaderboard_id INT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    star_1_end_time TIMESTAMPTZ,
    star_2_end_time TIMESTAMPTZ,
    score INT NOT NULL DEFAULT 0,
    language_id INT,
    link VARCHAR(255),
    note VARCHAR(255),

    FOREIGN KEY (language_id) REFERENCES Language(id),
    FOREIGN KEY (user_id) REFERENCES AppUser(id) ON DELETE CASCADE,
    FOREIGN KEY (day, year, leaderboard_id)
      REFERENCES LeaderBoardDay(day, year, leaderboard_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, day, year, leaderboard_id),

    CONSTRAINT submission_time_sequence CHECK (
        start_time <= COALESCE(star_1_end_time, start_time) AND
        COALESCE(star_1_end_time, start_time) <= COALESCE(star_2_end_time, COALESCE(star_1_end_time, start_time))
    ),
    CONSTRAINT submission_star2_requires_star1 CHECK (
        star_2_end_time IS NULL OR star_1_end_time IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS SubmissionPause (
    id SERIAL PRIMARY KEY,
    day SMALLINT NOT NULL,
    year SMALLINT NOT NULL,
    leaderboard_id INT NOT NULL,
    user_id INT NOT NULL,
    type VARCHAR(6) NOT NULL,
    parent_id INT,
    time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id, day, year, leaderboard_id)
      REFERENCES Submission(user_id, day, year, leaderboard_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES SubmissionPause(id) ON DELETE CASCADE,
    CONSTRAINT submissionpause_type_check CHECK (
        type IN ('pause', 'resume')
    ),
    CONSTRAINT submissionpause_parent_check CHECK (
        (type = 'pause' AND parent_id IS NULL) OR
        (type = 'resume' AND parent_id IS NOT NULL)
    )
);
