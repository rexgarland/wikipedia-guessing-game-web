CREATE TABLE link(
	id integer primary key autoincrement, 
	url text unique, 
	sentence text
);

CREATE TABLE game(
	id integer primary key autoincrement,
	seed integer unique default (random()),
	date_created text default CURRENT_TIMESTAMP,
	num_visits integer default 0
);

CREATE TABLE choice(
	id integer primary key autoincrement,
	game_id integer, 
	level integer, 
	link_id integer, 
	is_answer integer, 
	foreign key(game_id) references game(id), 
	foreign key(link_id) references link(id), 
	unique(game_id, link_id)
);