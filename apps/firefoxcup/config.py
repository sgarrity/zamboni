# coding=utf8
from tower import ugettext as _
from settings import MEDIA_URL

email_enabled = False

tags = {
    'all': [
        '#worldcup', 
        '#football', 
        '#soccer', 
        '#south africa2010', 
        '#wcup2010'],
    'af': '#Wêreldbeker',
    'ar': ['كأس العالم','مونديال','المونديال','كأس العالم لكرة القدم' ],
    'da': ['#vm', 'Fodbold VM'],
    'de': '#wm',
    'es': '#mundial',
    'fr': ['#mondial', '#coupedumonde'],
    'it': '#IlMondiale',
    'ja': '#W杯',
    'ko': '#월드컵',
    'nl': ['#wk', '#wereldbeker', '#oranje'],
    'ru': 'ЧМ',
    'sr': 'Светско првенство',
    'sk': 'Svetový pohár',
    'sl': 'Svetovni pokal',
}

teams = [
    {
        'id': 'algeria',
        'name': _('Algeria'),
        'persona_id': 813,
    }, 
    {
        'id': 'argentina',
        'name': _('Argentina'),
        'persona_id': 813,
    },
    {
        'id': 'australia',
        'name': _('Australia'),
        'persona_id': 813,
    },
    {
        'id': 'brazil',
        'name': _('Brazil'),
        'persona_id': 813,
    },
    {
        'id': 'cameroon',
        'name': _('Cameroon'),
        'persona_id': 813,
    },
    {
        'id': 'chile',
        'name': _('Chile'),
        'persona_id': 813,
    },
    {
        'id': 'cote',
        'name': _("Cote d'Ivoire"),
        'persona_id': 813,
    },
    {
        'id': 'denmark',
        'name': _('Denmark'),
        'persona_id': 813,
    },
    {
        'id': 'england',
        'name': _('England'),
        'persona_id': 813,
    },
    {
        'id': 'france',
        'name': _('France'),
        'persona_id': 813,
    },
    {
        'id': 'germany',
        'name': _('Germany'),
        'persona_id': 813,
    },
    {
        'id': 'ghana',
        'name': _('Ghana'),
        'persona_id': 813,
    },
    {
        'id': 'greece',
        'name': _('Greece'),
        'persona_id': 813,
    },
    {
        'id': 'honduras',
        'name': _('Honduras'),
        'persona_id': 813,
    },
    {
        'id': 'italy',
        'name': _('Italy'),
        'persona_id': 813,
    },
    {
        'id': 'japan',
        'name': _('Japan'),
        'persona_id': 813,
    },
    {
        'id': 'mexico',
        'name': _('Mexico'),
        'persona_id': 813,
    },
    {
        'id': 'netherlands',
        'name': _('Netherlands'),
        'persona_id': 813,
    },
    {
        'id': 'korea-dpr',
        'name': _('North Korea'),
        'persona_id': 813,
    },
    {
        'id': 'new-zealand',
        'name': _('New Zealand'),
        'persona_id': 813,
    },
    {
        'id': 'nigeria',
        'name': _('Nigeria'),
        'persona_id': 813,
    },
    {
        'id': 'paraguay',
        'name': _('Paraguay'),
        'persona_id': 813,
    },
    {
        'id': 'portugal',
        'name': _('Portugal'),
        'persona_id': 813,
    },
    {
        'id': 'serbia',
        'name': _('Serbia'),
        'persona_id': 813,
    },
    {
        'id': 'slovakia',
        'name': _('Slovakia'),
        'persona_id': 813,
    },
    {
        'id': 'slovenia',
        'name': _('Slovenia'),
        'persona_id': 813,
    },
    {
        'id': 'south-africa',
        'name': _('South Africa'),
        'persona_id': 813,
    },
    {
        'id': 'korea-republic',
        'name': _('South Korea'),
        'persona_id': 813,
    },
    {
        'id': 'spain',
        'name': _('Spain'),
        'persona_id': 813,
    },
    {
        'id': 'switzerland',
        'name': _('Switzerland'),
        'persona_id': 813,
    },
    {
        'id': 'usa',
        'name': _('United States'),
        'persona_id': 813,
    },
    {
        'id': 'uruguay',
        'name': _('Uruguay'),
        'persona_id': 813,
    }
]
for team in teams:
    team['flag'] = '%simg/firefoxcup/flags/%s.png' % (MEDIA_URL, team['id'])

twitter_languages = (
    'ar','da','de','en','es','fa','fi','fr','hu',
    'is','it','ja','nl','no','pl','pt','ru','sv','th',
)

