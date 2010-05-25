from nose.tools import eq_
import test_utils

import amo
import amo.tests
from addons import cron
from addons.models import Addon, AppSupport
from files.models import File


class CurrentVersionTestCase(test_utils.TestCase):
    fixtures = ['base/fixtures']

    def test_addons(self):
        eq_(Addon.objects.filter(_current_version=None, pk=3615).count(), 1)
        cron._update_addons_current_version(((3615,),))
        eq_(Addon.objects.filter(_current_version=None, pk=3615).count(), 0)


class TestLastUpdated(test_utils.TestCase):
    fixtures = ['base/fixtures']

    def test_personas(self):
        Addon.objects.update(type=amo.ADDON_PERSONA)

        cron.addon_last_updated()
        for addon in Addon.objects.all():
            eq_(addon.last_updated, addon.created)

        # Make sure it's stable.
        cron.addon_last_updated()
        for addon in Addon.objects.all():
            eq_(addon.last_updated, addon.created)

    def test_catchall(self):
        """Make sure the catch-all last_updated is stable and accurate."""
        # Nullify all datestatuschanged so the public add-ons hit the
        # catch-all.
        (File.objects.filter(status=amo.STATUS_PUBLIC)
         .update(datestatuschanged=None))
        Addon.objects.update(last_updated=None)

        cron.addon_last_updated()
        for addon in Addon.objects.filter(status=amo.STATUS_PUBLIC,
                                          type=amo.ADDON_EXTENSION):
            eq_(addon.last_updated, addon.created)

        # Make sure it's stable.
        cron.addon_last_updated()
        for addon in Addon.objects.filter(status=amo.STATUS_PUBLIC):
            eq_(addon.last_updated, addon.created)

    def test_appsupport(self):
        ids = Addon.objects.values_list('id', flat=True)
        cron._update_appsupport(ids)

        eq_(AppSupport.objects.count(), 11)

        # Run it again to test deletes.
        cron._update_appsupport(ids)
        eq_(AppSupport.objects.count(), 11)
