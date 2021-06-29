import unittest
import json
import sys
import requests
from pathlib import Path
__dir = Path(__file__).parent

from ..generate_game import *

# open up all the hard-coded test data
with open(__dir / 'config.json', 'r') as f:
    config = json.load(f)

def load_cached_html(url):
    # pass-through while I set up caching...
    page = requests.get(url)
    return page.content

class TestSentenceFinder(unittest.TestCase):
    longMessage = False

    def test_get_random_url(self):
        """Should not raise an error"""
        url = get_random_wikipedia_page()

    def test_sentences_are_not_wrong(self):
        """Makes sure some previously-found bugs are not repeated"""

        subs = config['wrong_sentence_substrings']
        for url in subs:
            with self.subTest(url=url):
                text = load_cached_html(url)
                sentence = get_sentence_from_html(text)
                self.assertNotIn(subs[url], sentence, msg=f"'{subs[url]}' unexpectedly found in '{sentence}'")

        beginnings = config['wrong_sentence_beginnings']
        for url in beginnings:
            with self.subTest(url=url):
                text = load_cached_html(url)
                sentence = get_sentence_from_html(text)
                print(f"{url}: {sentence}")
                self.assertFalse(sentence.startswith(beginnings[url]), msg=f"Sentence '{sentence[:20]+'...'}' starts with '{beginnings[url]}'")

        smalls = config['small_sentence_lengths']
        for url in smalls:
            with self.subTest(url=url):
                text = load_cached_html(url)
                sentence = get_sentence_from_html(text)
                self.assertGreater(len(sentence), smalls[url], msg=f"Sentence '{sentence}' is too small")


class TestUtils(unittest.TestCase):

    def test_flat_map(self):
        x = ['hi friend', 'bye friend']
        fn = lambda s: s.split(' ')
        expected = ['hi','friend','bye','friend']
        self.assertEqual(flatMap(fn)(x), expected)

    def test_sentence_split(self):
        string = 'Hi, there. My name is Bob.'
        expected = ['Hi, there.', 'My name is Bob.']
        self.assertEqual(sentence_split(string), expected)

        string = 'Guess what? I have a Ph.D in gaming from the U.S. military.'
        expected = ['Guess what?', 'I have a Ph.D in gaming from the U.S. military.']
        self.assertEqual(sentence_split(string), expected)

        string = 'Mr. Gay Canada is a television show. I like Mr. Gay Canada.'
        expected = ['Mr. Gay Canada is a television show.', 'I like Mr. Gay Canada.']
        self.assertEqual(sentence_split(string), expected)

        string = 'Mr. John Johnson Jr. was born in the U.S.A but earned his Ph.D. in Israel before joining Nike Inc. as an engineer. He also worked at craigslist.org as a business analyst.'
        expected = ['Mr. John Johnson Jr. was born in the U.S.A but earned his Ph.D. in Israel before joining Nike Inc. as an engineer.', 'He also worked at craigslist.org as a business analyst.']
        self.assertEqual(sentence_split(string), expected)

        string = "This is a sentence.  Another one."
        expected = ["This is a sentence.","Another one."]
        self.assertEqual(sentence_split(string), expected)

if __name__=='__main__':
    unittest.main()