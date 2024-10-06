CREATE TABLE IF NOT EXISTS AppUser (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    salt VARCHAR(16) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    link VARCHAR(255),
    join_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS AuthToken (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expire_time TIMESTAMP NOT NULL,
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
    id SERIAL PRIMARY KEY,
    year SMALLINT NOT NULL,
    leaderboard_id INT NOT NULL,
    FOREIGN KEY (leaderboard_id) REFERENCES LeaderBoard(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS LeaderBoardDay (
    id SERIAL PRIMARY KEY,
    day SMALLINT NOT NULL,
    year_id INT NOT NULL,
    FOREIGN KEY (year_id) REFERENCES LeaderBoardYear(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Submission (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    day_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    star_1_end_time TIMESTAMP,
    star_2_end_time TIMESTAMP,
    score INT NOT NULL DEFAULT 0,
    language_id INT,
    FOREIGN_KEY (language_id) REFERENCES Language(id),
    link VARCHAR(255),
    note VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES AppUser(id) ON DELETE CASCADE,
    FOREIGN KEY (day_id) REFERENCES LeaderBoardDay(id) ON DELETE CASCADE,
    CONSTRAINT submission_time_sequence CHECK (
        start_time <= COALESCE(star_1_end_time, start_time) AND
        COALESCE(star_1_end_time, start_time) <= COALESCE(star_2_end_time, COALESCE(star_1_end_time, start_time))
    ),
    CONSTRAINT submission_star2_requires_star1 CHECK (
        star_2_end_time IS NULL OR star_1_end_time IS NOT NULL
    ),
    UNIQUE (user_id, day_id)
);

CREATE TABLE IF NOT EXISTS Language (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS SubmissionPause (
    id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL,
    type VARCHAR(6) NOT NULL,
    parent_id INT,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES Submission(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES SubmissionPause(id) ON DELETE CASCADE,
    CONSTRAINT submissionpause_type_check CHECK (
        type IN ('pause', 'resume')
    ),
    CONSTRAINT submissionpause_parent_check CHECK (
        (type = 'pause' AND parent_id IS NULL) OR
        (type = 'resume' AND parent_id IS NOT NULL)
    )
);
