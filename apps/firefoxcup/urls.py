from django.conf.urls.defaults import patterns, url

from jingo.views import direct_to_template

urlpatterns = patterns('',
    url('^$', direct_to_template, {'template': 'firefoxcup.html'},
        name='firefoxcup.index'),
)
