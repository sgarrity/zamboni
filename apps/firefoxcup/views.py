import jingo
from bleach import Bleach
import urllib2
import json
import re
import ttp

bleach = Bleach()

# Create your views here.
def index(request):

    tweets_json = urllib2.urlopen('http://search.twitter.com/search.json?q=%23io2010')
    tweets = json.load(tweets_json)
    
    clean_tweets = []
    for tweet in tweets['results']:
        text = tweet['text']

        p = ttp.Parser()
        text = p.parse(text)
        cleaned = bleach.clean(text.html, tags=['a'],
                             attributes={'a': ['href', 'rel']})
        clean_tweets.append(cleaned)

    return jingo.render(request, 'firefoxcup.html', {
        'tweets': clean_tweets})
