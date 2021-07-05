CREATE TABLE _game(
	id integer primary key autoincrement,
	seed integer unique default (ABS(RANDOM() % 1000000)), 
	date_created text default CURRENT_TIMESTAMP, 
	num_visits integer default 0
);

INSERT INTO _game
	SELECT * FROM game;

DROP TABLE game;
ALTER TABLE _game RENAME TO game;

PRAGMA user_version = 1;