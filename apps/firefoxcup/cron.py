import logging
import urllib
import urllib2
import cronjobs
from django.core.cache import cache

log = logging.getLogger('z.cron')

@cronjobs.register
def fetch_twitter_feed():
    """Fetch statuses from Twitter Search API for Firefox Cup page sidebar."""

    baseurl = "http://search.twitter.com/search?"
    hashtags = ' '.join(['#worldcup', '#football', '#soccer', '#south africa2010', '#mundial'])
    url = baseurl + urllib.urlencode({'ors': hashtags})

    try:
        urllib2.urlopen(url)
    except urllib2.URLError, e:
        log.error("Couldn't open (%s): %s" % (url, e))
        return

