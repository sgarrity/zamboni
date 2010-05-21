import json
from twitter import _prepare_tag, _process_tweet, search, _search_query, _prepare_lang
from pyquery import PyQuery as pq
from nose.tools import eq_
from StringIO import StringIO
from django.test.client import Client

def test_view():
    c = Client()
    res = c.get('/en-US/firefox/firefoxcup/')
    eq_(res.status_code, 200)
    
def test_prepare_tag():
    """foo should be prefixed with #
       #bar should not be changed"""
    a = map(_prepare_tag, ['foo', '#bar'])
    eq_(a, ['#foo', '#bar'])

def test_prepare_lang():
    """always use short lang code
       e.g. en-US -> en"""
    eq_(_prepare_lang('en-US'), 'en')

def test_process_tweet():
    """urls and tags are linkified"""
    a = map(_process_tweet, ['http://www.mozilla.com', '#hash', '@person'])
    for v in a:
        # use PyQuery to check for <a> tag
        assert pq(v).is_('a')


def test_search_query_encoded():
    """search query string is url encoded"""
    a = _search_query(['foo', '#bar'], 'en')
    eq_(a, 'q=foo+OR+%23bar&lang=en')

class SearchMock(object):
    text = ''
    tags = []
    lang = ''

    def open(self, url):
        json_str = json.dumps({'results': [{'text': self.text}]})
        return StringIO(json_str)

    def query_builder(self, tags, lang):
        self.tags = tags
        self.lang = lang
        return 'irrelevant';

def test_search_data_decoded():
    mock = SearchMock()
    mock.text = 'text'
    a = search(['irrelevant'], 'en', open=mock.open)
    eq_(a, ['text'])

def test_search_tags_and_lang_prepared():
    """test that search() prepares the tags and langs"""
    mock = SearchMock()
    
    search(['test'], 'en-US', open=mock.open, query_builder=mock.query_builder)
    """short lang codes should always be used"""
    eq_(mock.lang, 'en')
    """tags should be prefixed with #"""
    eq_(mock.tags, ['#test'])

def test_search_bad_lang_fallback():
    mock = SearchMock()
    search(['test'], 'bad-lang-code', open=mock.open, query_builder=mock.query_builder)
    """bad lang codes should fall back to 'all'""" 
    eq_(mock.lang, 'all')
