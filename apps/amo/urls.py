from django.conf.urls.defaults import patterns, url, include
from django.views.decorators.cache import never_cache

from . import views

services_patterns = patterns('',
    url('^monitor$', never_cache(views.monitor), name='amo.monitor'),
    url('^paypal$', never_cache(views.paypal), name='amo.paypal'),
    url('^loaded$', never_cache(views.loaded), name='amo.loaded'),
)

urlpatterns = patterns('',
    ('^services/', include(services_patterns)),

    url('^opensearch.xml$', 'api.views.render_xml',
                            {'template': 'amo/opensearch.xml'},
                            name='amo.opensearch'),

)
