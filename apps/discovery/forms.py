from django import forms
from django.conf import settings

from .models import DiscoveryModule


class DiscoveryModuleForm(forms.ModelForm):

    class Meta:
        model = DiscoveryModule

    def clean_locales(self):
        data = self.cleaned_data['locales'].split()
        bad = [locale for locale in data
               if locale not in settings.AMO_LANGUAGES]
        if bad:
            raise forms.ValidationError('Invalid locales: %s' % ','.join(bad))
        return self.cleaned_data['locales']
