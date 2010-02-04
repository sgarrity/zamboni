from django import test

from nose.tools import eq_

import amo
from addons.models import Addon


class TestAddonManager(test.TestCase):
    fixtures = ['addons/test_manager']

    def test_featured(self):
        featured = Addon.objects.featured(amo.FIREFOX)[0]
        eq_(featured.id, 1)
        eq_(Addon.objects.featured(amo.FIREFOX).count(), 1)

        # Mess with the Feature's start and end date.
        feature = featured.feature_set.all()[0]
        prev_end = feature.end
        feature.end = feature.start
        feature.save()
        eq_(Addon.objects.featured(amo.FIREFOX).count(), 0)
        feature.end = prev_end

        feature.start = feature.end
        eq_(Addon.objects.featured(amo.FIREFOX).count(), 0)

        featured = Addon.objects.featured(amo.THUNDERBIRD)[0]
        eq_(featured.id, 2)
        eq_(Addon.objects.featured(amo.THUNDERBIRD).count(), 1)


class TestAddonModels(test.TestCase):
    # base/addons.json has an example addon
    fixtures = ['base/addons.json']

    def test_get_current_version(self):
        """
        Tests that we get the current (latest public) version of an addon.
        """
        a = Addon.objects.get(pk=3615)
        eq_(a.get_current_version().id, 24007)

    def test_icon_url(self):
        """
        Tests for various icons.
        1. Test for an icon that exists.
        2. Test for default THEME icon.
        3. Test for default non-THEM icon.
        """
        a = Addon.objects.get(pk=3615)
        a.get_icon_url().index('/en-US/firefox/images/addon_icon/3615/')
        a = Addon.objects.get(pk=7172)
        assert a.get_icon_url().endswith('/img/theme.png'), (
                "No match for %s" % a.get_icon_url())
        a = Addon.objects.get(pk=1)
        assert a.get_icon_url().endswith('/img/default_icon.png')

    def test_thumbnail_url(self):
        """
        Test for the actual thumbnail URL if it should exist, or the no-preview
        url.
        """
        a = Addon.objects.get(pk=7172)
        a.get_thumbnail_url().index('/img/uploads/previews/thumbs/2/25981.png')
        a = Addon.objects.get(pk=1)
        assert a.get_thumbnail_url().endswith('/img/no-preview.png'), (
                "No match for %s" % a.get_thumbnail_url())
