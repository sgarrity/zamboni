import jingo
from twitter import search
import config
from addons.models import Persona

# Create your views here.
def index(request):

    tweets = search(config.tags['all'], lang=request.LANG)

    if (len(tweets) < 15):
        extra = search(config.tags['all'], 'all')
        tweets.extend(extra)
        
    # we only want 15 tweets
    tweets = tweets[:15]
    
    teams = config.teams
    for t in teams:
        p = Persona.objects.get(persona_id=t['persona_id'])
        t.update({'persona': p})
    
    return jingo.render(request, 'firefoxcup/index.html', {
        'tweets': tweets, 
        'teams': teams
    })

