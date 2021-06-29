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
        paragraphs = config['sentence_split_examples']
        for paragraph in paragraphs:
            with self.subTest(paragraph=paragraph):
                expected = paragraphs[paragraph]
                self.assertEqual(sentence_split(paragraph), expected)

if __name__=='__main__':
    unittest.main()