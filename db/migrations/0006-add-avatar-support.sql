CREATE TABLE AvatarColor (
    id SERIAL PRIMARY KEY,
    color VARCHAR(255) NOT NULL
);

INSERT INTO AvatarColor (color) VALUES
('red'),
('amber'),
('green'),
('orange'),
('yellow'),
('emerald'),
('lime'),
('teal'),
('cyan'),
('blue'),
('indigo'),
('purple'),
('fuchsia'),
('pink'),
('slate');

ALTER TABLE AppUser ADD COLUMN avatar_color_id INTEGER
  REFERENCES AvatarColor(id);

UPDATE AppUser
SET avatar_color_id = (
  SELECT id FROM AvatarColor
  ORDER BY RANDOM()
  LIMIT 1
)
WHERE avatar_color_id IS NULL;

CREATE OR REPLACE FUNCTION set_random_avatar_color() RETURNS TRIGGER AS $$
BEGIN
  NEW.avatar_color_id := (
    SELECT id FROM AvatarColor
    ORDER BY RANDOM()
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_avatar_color_id
BEFORE INSERT ON AppUser
FOR EACH ROW
WHEN (NEW.avatar_color_id IS NULL)
EXECUTE FUNCTION set_random_avatar_color();
