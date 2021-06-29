from lxml import html
import requests
import sqlite3
import random
from functools import reduce
import numpy as np
from tqdm import tqdm

# I want to use this file as a script or part of a package, depending on the context
if __name__=='__main__':
    from ORM import Link, Choice, Game
else:
    from .ORM import Link, Choice, Game
    # for use in testing
    random.seed(1)

RANDOM_URL = "https://en.wikipedia.org/wiki/Special:Random"

def get_random_wikipedia_page():
    # note: takes ~0.2 seconds
    response = requests.head(RANDOM_URL)
    url = response.headers.get('location')
    assert url, "The random wikipedia link did not return a redirect url."
    return url

def split_and_append_by(char):
    def f(s):
        splits = s.split(char)
        appended = [a+char for a in splits[:-1]] + [splits[-1]]
        return [a.strip() for a in appended if a.strip()]
    return f

TERMINALS = '.!?'
SPACES = ' \t'
SENTENCE_START = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

def switch(var):
    return lambda x: var==x

def split_paragraph_reducer(a,v):
    """
    Reducer on a paragraph (string of characters).

    Processes a list of characters and groups them into sentences. 

    It's not great, but it's fine.

    Returns a list of sentences, using the state (in English): 
            ("the last character I saw was a terminal character", "")
    """
    if not a:
        return v in TERMINALS, False, [v]

    last_was_terminal, ready_for_next, previous = a

    x = v in TERMINALS

    if last_was_terminal:
        z = previous[:-1]+[previous[-1]+v]
        y = not (v in SENTENCE_START)
    else:
        if ready_for_next:
            if v in SENTENCE_START:
                y = False
                z = previous+[v]
            else:
                y = v in SPACES
                z = previous[:-1]+[previous[-1]+v]
        else:
            y = False
            z = previous[:-1]+[previous[-1]+v]

    return x, y, z

COMMON_PREFIX_ABBREVIATIONS = ['Mr.','Mrs.','Ms.','Dr.','Prof.','Rev.','St.']

def ends_with_a_common_prefix_abbreviation(s):
    for abbrev in COMMON_PREFIX_ABBREVIATIONS:
        if s.endswith(abbrev):
            return True
    return False

def sentence_split(string):
    """Split text into its sentences"""
    if not string:
        return []
    _, _, out = reduce(split_paragraph_reducer, string, [])
    sentences = [s.strip() for s in out if s.strip()]

    # if a sentences ends in a common prefixed abbreviation, elide it to the right when possible
    #    e.g. "... Mr.", "Bob ..." -> "... Mr. Bob ..."
    left_elision_reducer = lambda condition: lambda a,v: a[:-1]+[v+' '+a[-1]] if (condition(v) and a) else a+[v]
    sentences = reduce(left_elision_reducer(ends_with_a_common_prefix_abbreviation), sentences[::-1], [])[::-1]

    return sentences

def newline_split(string):
    return [a.strip() for a in string.split('\n') if a.strip()]

def flatMap(fn):
    def f(seq):
        outs = [fn(x) for x in seq]
        return reduce(lambda a,v: a+v, outs, [])
    return f

def pipe_splitters(*functions):
    def f(x, functions=functions):
        if not functions:
            return x
        else:
            first = functions[0]
            return f(flatMap(first)(x), functions[1:])
    return f

def get_sentence(url):
    """
    Gets a sentence from the wikipedia url
    """
    # note: takes ~0.6 seconds
    page = requests.get(url)
    return get_sentence_from_html(page.content)

def prune_if(condition):
    def p(tree):
        to_remove = []
        for i in range(len(tree)):
            if condition(tree[i]):
                to_remove.append(i)
        for i in to_remove[::-1]:
            del tree[i]
        for child in tree:
            p(child)
    return p

NONTEXT_TAGS = ['style','script','sup']

def prune_nontext(tree):
    """
    Recursively finds nodes that do not contain human-readable text and prunes them from the tree. This changes the tree in-place.
    """
    node_does_not_contain_human_readable_text = lambda elem: elem.tag in NONTEXT_TAGS
    prune_if(node_does_not_contain_human_readable_text)(tree)

def prune_coordinates(tree):
    node_is_coordinates = lambda node: node.tag=='span' and node.get('id')=='coordinates'
    prune_if(node_is_coordinates)(tree)

def wordlen(sentence):
    return len([s for s in sentence.split(' ') if s.strip()])

def get_sentence_from_html(text):
    """Return a random sentence from the given wikipedia page, with some common-sense filtering.

    Method:
        - If there's only a few sentences total, return the longest one (measured in number of words).
        - Otherwise, return a random one sampled from the 5-100% percentile range by length (i.e. exclude outliers).
    """
    tree = html.fromstring(text)
    nodes = tree.xpath('//div[@class="mw-parser-output"]/p | //div[@class="mw-parser-output"]/ul | //div[@class="mw-parser-output"]/ol')
    # nodes = tree.xpath('//div[@class="mw-parser-output"]/p')
    prune_nontext(nodes)
    prune_coordinates(nodes)
    strings = list(map(lambda n: html.tostring(n, method='text', encoding=str), nodes))
    sentences = pipe_splitters(sentence_split, newline_split)(strings)

    if len(sentences)<10:
        sentence = max(sentences, key=wordlen)
    else:
        sentence_lens = [wordlen(s) for s in sentences]
        word_sentence_lens = flatMap(lambda ls: [ls]*ls)(sentence_lens)
        thresh = np.quantile(word_sentence_lens, 0.2)
        indices = [i for i in range(len(sentences)) if sentence_lens[i]>=thresh]
        assert indices
        choice = random.choice(indices)
        sentence = sentences[choice]

    return sentence

NUM_LEVELS = 200

def main():

    # generate links and sentences for a full game
    links = {}
    choices = []
    for i in tqdm(range(1,NUM_LEVELS+1)):
        # add three incorrect answers
        incorrect_urls = []
        for _ in range(3):
            url = get_random_wikipedia_page()
            incorrect_urls.append(url)
            links.setdefault(url, None)
        # add the answer url
        answer_url = get_random_wikipedia_page()
        if links.get(answer_url):
            continue
        sentence = get_sentence(answer_url)
        links[answer_url] = sentence
        # create the choice objects
        new_choices = []
        for url in incorrect_urls:
            choice = {
                'level': i,
                'link': url,
                'is_answer': False
            }
            new_choices.append(choice)
        new_choices.append({
            'level': i,
            'link': answer_url,
            'is_answer': True
        })
        choices.extend(new_choices)

    # populate the game data into the database
    with sqlite3.connect('db.sqlite') as con:
        cur = con.cursor()

        # add the new links
        link_ids = {}
        for url in links:
            sentence = links[url]
            # try to add a row
            res = cur.execute('INSERT OR IGNORE INTO link(url) VALUES (?)', (url,))
            if sentence:
                # check if it already had a sentence
                existing_sentence, = cur.execute('SELECT sentence FROM link WHERE url=?', (url,)).fetchone()
                if not existing_sentence:
                    cur.execute('INSERT OR REPLACE INTO link(url, sentence) VALUES (?,?)', (url, sentence))

        # make a row in the game table
        rowid = cur.execute('INSERT INTO game DEFAULT VALUES;').lastrowid
        game_id, seed, date_created, num_visits = cur.execute('SELECT * FROM game WHERE id=?', (rowid,)).fetchone()

        # create choices
        for choice in choices:
            link_id, = cur.execute('SELECT id FROM link WHERE url=?', (choice['link'],)).fetchone()
            cur.execute('INSERT INTO choice(game_id, level, link_id, is_answer) VALUES (?,?,?,?)', (game_id, choice['level'], link_id, choice['is_answer']))

def loop():
    """A helper function for just checking out how the parser performs"""
    while True:
        url = get_random_wikipedia_page()
        sentence = get_sentence(url)
        string = f'{url}:\t{repr(sentence)}'
        print(string[:160])

if __name__=='__main__':
    main()
