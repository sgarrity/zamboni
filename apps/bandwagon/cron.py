import logging

from django.db import connection
from django.db.models import Count

from celery.decorators import task
from celery.messaging import establish_connection

import cronjobs
import amo
from amo.utils import chunked
from addons.models import Addon
from bandwagon.models import Collection


task_log = logging.getLogger('z.task')


@cronjobs.register
def addon_collection_counts():
    """Update (addon, application, count(collections)) cache."""
    ids = Addon.objects.values_list('id', flat=True)
    with establish_connection() as conn:
        for chunk in chunked(ids, 30):
            _addon_collection_counts.apply_async(
                args=[chunk], connection=conn)


# XXX: collection types
@task(rate_limit='20/m')
def _addon_collection_counts(ids):
    cursor = connection.cursor()
    cursor.execute("""
        REPLACE INTO addons_collections_counts
            (addon_id, application_id, count)
        (SELECT addon_id, application_id, count(1)
         FROM collections INNER JOIN addons_collections
           ON (collections.id = addons_collections.collection_id)
         WHERE addon_id IN (%s)
           AND collections.listed = 1
           AND collections.type != %s
           AND application_id IS NOT NULL
         GROUP BY addon_id, application_id)""" %
        (amo.COLLECTION_RECOMMENDED, ','.join(map(str, ids))))
