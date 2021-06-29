class SQLiteTable:

    def insert(self, **params):
        if not params:
            return 'INSERT INTO ? DEFAULT VALUES;', (self.name,)
        else:
            keys = list(params.keys())
            lokeys = ','.join(keys)
            qmarks = ','.join(['?']*len(params.keys()))
            return f'INSERT INTO ?({lokeys}) VALUES ({qmarks})', [self.name] + [params[key] for key in keys]

class SQLiteColumn:

    def __init__(self, name, has_default=False, unique=False):
        self.name = name
        self.has_default = has_default
        self.unique = unique

    def __repr__(self):
        return f"Column {self.name}"

class Link(SQLiteTable):
    name = 'link'
    columns = [
        SQLiteColumn('id', has_default=True, unique=True),
        SQLiteColumn('url'),
        SQLiteColumn('sentence'),
    ]

class Choice:
    name = 'choice'

class Game:
    name = 'game'