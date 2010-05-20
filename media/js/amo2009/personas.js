var PERSONAS_URLS = {
   'win_bundle'     : 'http://releases.mozilla.com/personas/win32/en-US/Firefox%20Setup%203.5.1.exe',
   'mac_bundle'     : 'http://releases.mozilla.com/personas/mac/en-US/Firefox%203.5.1.dmg',
   'linux_bundle'   : 'http://releases.mozilla.com/personas/linux-i686/en-US/firefox-3.5.1.tar.bz2',
   'addon'          : 'https://addons.mozilla.org/services/install.php?addon_id=personas'
};

/**
    Bubbles up persona event to tell Firefox to load a persona
**/
function dispatchPersonaEvent(aType, aNode)
{
    var aliases = {'PreviewPersona': 'PreviewBrowserTheme',
                   'ResetPersona': 'ResetBrowserThemePreview',
                   'SelectPersona': 'InstallBrowserTheme'};
    try {
        if (!aNode.hasAttribute("persona"))
			return;

    $(aNode).attr("data-browsertheme", $(aNode).attr("persona"));

    var aliasEvent = aliases[aType];
    var events = [aType, aliasEvent];

    for(var i=0; i<events.length; i++) {
      var event = events[i];
      var eventObject = document.createEvent("Events");
      eventObject.initEvent(event, true, false);
      aNode.dispatchEvent(eventObject);
    }
    } catch(e) {}
}


/**
    Binds click and hover events to the element.
    Click - bubbles up ResetPersona event
    Mouseenter - bubbles up PreviewPersona
    Mouseleave - bubbles up ResetPersona
**/
$.fn.previewPersona = function(resetOnClick) {

    if(resetOnClick) {
        jQuery(this).click(function(event) {
            dispatchPersonaEvent('ResetPersona', event.originalTarget);
        });
    }

    jQuery(this).hover(
        function(event) {
            dispatchPersonaEvent('PreviewPersona', event.originalTarget);
        },
        function(event) {
            dispatchPersonaEvent('ResetPersona', event.originalTarget);
        }
    );
};


/* Should be called on an anchor. */
$.fn.personasButton = function(options) {
    var setCookie = false,
        /* The place where we set the persona button's text. */
        textNode = $(this).find(options['textNode']);
    if(jQuery.browser.mozilla) {
        if(jQuery.hasPersonas()) {
            jQuery(textNode).html(options['hasPersonas']);
            jQuery(this).hover(
                function(event) {
                    dispatchPersonaEvent('PreviewPersona', event.currentTarget);
                },
                function(event) {
                    dispatchPersonaEvent('ResetPersona', event.currentTarget);
                }
            );
            jQuery(this).click(function(event) {
                dispatchPersonaEvent('SelectPersona', event.currentTarget);
                return false;
            });
        } else {
            jQuery(textNode).html(options['hasFirefox']);
            jQuery(this).attr("href", PERSONAS_URLS['addon']);
            jQuery(this).click(function() {
                window.location = "https://addons.mozilla.org/services/install.php?addon_id=personas";
            });
            setCookie = true;
        }
    } else {
        jQuery(textNode).html(options['noFirefox']);
        var downloadUrl = jQuery.os.mac ? PERSONAS_URLS['mac_bundle'] : jQuery.os.win ? PERSONAS_URLS['win_bundle'] : PERSONAS_URLS['linux_bundle'];
        jQuery(this).attr("href", downloadUrl);
        setCookie = true;
    }

    if(setCookie) {
        var personaJson = jQuery(this).attr('persona');
        $.cookie('initial_persona', personaJson, { expires: 1, path: '/'});
    }
};


$.hasPersonas = function() {
    var versionCompare = new VersionCompare();

    //FF 3.6 has lightweight themes (aka personas)
    if(versionCompare.compareVersions($.browser.version,
                                      '1.9.2') > -1) {
      return true;
    }

    var body = document.getElementsByTagName("body")[0];
    var status = document.getElementById("status");

    try {
        var event = document.createEvent("Events");
        event.initEvent("CheckPersonas", true, false);
        body.dispatchEvent(event);
    } catch(e) {}

    return body.getAttribute("personas") == "true";
};


function VersionCompare() {
    /**
     * Mozilla-style version numbers comparison in Javascript
     * (JS-translated version of PHP versioncompare component)
     * @return -1: a<b, 0: a==b, 1: a>b
     */
    this.compareVersions = function(a,b) {
        var al = a.split('.');
        var bl = b.split('.');

        for (var i=0; i<al.length || i<bl.length; i++) {
            var ap = (i<al.length ? al[i] : null);
            var bp = (i<bl.length ? bl[i] : null);

            var r = this.compareVersionParts(ap,bp);
            if (r != 0)
                return r;
        }

        return 0;
    }

    /**
     * helper function: compare a single version part
     */
    this.compareVersionParts = function(ap,bp) {
        var avp = this.parseVersionPart(ap);
        var bvp = this.parseVersionPart(bp);

        var r = this.cmp(avp['numA'],bvp['numA']);
        if (r) return r;

        r = this.strcmp(avp['strB'],bvp['strB']);
        if (r) return r;

        r = this.cmp(avp['numC'],bvp['numC']);
        if (r) return r;

        return this.strcmp(avp['extraD'],bvp['extraD']);
    }

    /**
     * helper function: parse a version part
     */
    this.parseVersionPart = function(p) {
        if (p == '*') {
            return {
                'numA'   : Number.MAX_VALUE,
                'strB'   : '',
                'numC'   : 0,
                'extraD' : ''
                };
        }

        var pattern = /^([-\d]*)([^-\d]*)([-\d]*)(.*)$/;
        var m = pattern.exec(p);

        var r = {
            'numA'  : parseInt(m[1]),
            'strB'   : m[2],
            'numC'   : parseInt(m[3]),
            'extraD' : m[4]
            };

        if (r['strB'] == '+') {
            r['numA']++;
            r['strB'] = 'pre';
        }

        return r;
    }

    /**
     * helper function: compare numeric version parts
     */
    this.cmp = function(an,bn) {
        if (isNaN(an)) an = 0;
        if (isNaN(bn)) bn = 0;

        if (an < bn)
            return -1;

        if (an > bn)
            return 1;

        return 0;
    }

    /**
     * helper function: compare string version parts
     */
    this.strcmp = function(as,bs) {
        if (as == bs)
            return 0;

        // any string comes *before* the empty string
        if (as == '')
            return 1;

        if (bs == '')
            return -1;

        // normal string comparison for non-empty strings (like strcmp)
        if (as < bs)
            return -1;
        else if(as > bs)
            return 1;
        else
            return 0;
    }
}

var userAgent = navigator.userAgent.toLowerCase();
$.os = {
    mac: /mac/.test(userAgent),
    win: /win/.test(userAgent),
    linux: /linux/.test(userAgent)
}
