from django import test

from nose.tools import eq_

from files.models import File


class TestFile(test.TestCase):
    """
    Tests the methods of the File model.
    """

    fixtures = ['base/fixtures']

    def test_get_absolute_url(self):
        f = File.objects.get(id=11993)
        assert f.get_absolute_url(src='src').endswith(
                'downloads/file/11993/'
                'del.icio.us_bookmarks-1.0.43-fx.xpi?src=src&confirmed=1')

    def test_latest_url(self):
        # With platform.
        f = File.objects.get(id=61321)
        base = '/en-US/firefox/downloads/latest/'
        expected = base + '{0}/platform:3/addon-{0}-latest.jar'
        eq_(expected.format(f.version.addon_id), f.latest_xpi_url())

        # No platform.
        f = File.objects.get(id=11993)
        expected = base + '{0}/addon-{0}-latest.xpi'
        eq_(expected.format(f.version.addon_id), f.latest_xpi_url())

    def test_eula_url(self):
        f = File.objects.get(id=61321)
        eq_(f.eula_url(), '/en-US/firefox/addons/policy/0/6704/61321')
