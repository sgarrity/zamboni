/**
 * InstallButton class for managing the install button
 * states and configuration.
 *
 * It expects a configuration object with the following properties:
 *
 * versionId              - the add-on version + rand() number.
 *                          Used for the id of the element wrapping
 *                          all the install buttons for this
 *                          particular add-on
 * addonId                - the add-on id from the db
 * contributionLevel      - contribution level for this add-on
 *                          (passive, after, roadblock)
 * messages               - array of install and download messages
 * addonName              - the add-on name
 * showInstructions       - show the Thunderbird/Sunbird
 * fixPlatformButtons     - hide install buttons for other platforms
 * showCompatibilityHints - show messaging for older/newer versions of Firefox
 * showFirefoxInvitation  - show a message inviting non-Fx users to install Firefox
 * loggedIn               - is the user logged in
 * fromVersion            - lowest version the add-on is compatible with
 * toVersion              - highest version the add-on is compatible with
 */

function InstallButton(config) {
    jQuery.extend(this, config);
    this.root = $("#install-" + this.versionId);

    /**
     * Abort if the button has been instantiated before.
     * This happens when jQuery moves nodes around.
     * JavaScript is re-evaluated when this occurs.
    **/
    if(this.root.hasClass("done")) {
        return;
    }

    if(this.isBucketTestPage) {
        if(Math.random() <= 0.1) {
            //change url to roadblock if contribution level is roadblock
            if(this.contributionLevel == CONTRIBUTIONS_ROADBLOCK) {
                var url = BASEDIR+LANG+"/firefox/addon/"+this.addonId+
                          "/developers/roadblock?contribsrc="+this.contributionsSrc;

                if(this.src && this.src != '') {
                    url += '&src='+this.src;
                }

                this.root.find("p.install-button a")
                    .attr("href",
                    url);
            }
        } else {
            this.contributionLevel = 0;
        }
    }

    this.root.addClass("done");
    this.init();
};

/**
 * Initialize the button
 */
InstallButton.prototype.init = function () {
    this.fixInstallMessage();

    if(this.showInstructions) {
        this.bindInstructions();
    }

    this.initExpConfirm();

    if(this.contributionLevel != CONTRIBUTIONS_ROADBLOCK) {
        this.bindInstall();
    }

    if(this.fixPlatformButtons) {
       this.fixPlatformLinks();
    }

    if(this.showCompatibilityHints) {
        this.addCompatibilityHints();
    }

    if (this.showFirefoxInvitation) {
        this.prepareFirefoxMessage();
    }
};

/**
 * Listen for the click event on the button.
 * If it's 'frozen' (unconfirmed experimental),
 * don't install
 *
 * If not frozen, install based on the installMethod
 * on the button
 *
 * If the contribution level is CONTRIBUTION_AFTER, redirect
 * after install
 */
InstallButton.prototype.bindInstall = function() {
    var that = this;
    this.root.find("p.install-button a").click(function(e) {
        var installMethod = $(this).attr("jsInstallMethod");
        if($(this).attr("frozen") == 'true') return false;

        if (installMethod == 'browser_app_addon_install') {
            if (that.showFirefoxInvitation && !gIsFirefox) { // Fx install message
                e.preventDefault();
                that.root.find('.nonfirefox').jqmShow();
                return false;
            }
            var ret = that.install(e);
        } else if (installMethod == 'search_engine_install') {
            var ret= that.addEngine(e);
        }

        if(that.contributionLevel == CONTRIBUTIONS_AFTER) {
            var url = BASEDIR+LANG+'/'+APP_SHORTNAME+'/addon/'+
                      that.addonId+'/developers/post_install?confirmed=true';

            if(that.contributionsSrc != '') {
                url += '&contribsrc='+that.contributionsSrc;
            }

            if(that.src && that.src != '') {
                url += '&src='+that.src;
            }
            window.location = url;
        }
        return ret;
    });
};

/**
 * Prepare "install Firefox" popup for non-Fx users
 */
InstallButton.prototype.prepareFirefoxMessage = function() {
    var box = this.root.find('.nonfirefox').jqm({
        ajax: BASEDIR+LANG+'/'+APP_SHORTNAME+'/addons/nonfirefox/'+this.addonId,
        'trigger': false,
        toTop: true,
        onShow: function(hash) {
            if ($.browser.opera) this.inputs = $(':input:visible').css('visibility', 'hidden');
            hash.w.fadeIn();
        },
        onHide: function(hash) {
            if ($.browser.opera) this.inputs.css('visibility', 'visible');
            hash.w.fadeOut();
            hash.o.remove();
        }
        });
}

/**
 * Find the install URL, searching up the DOM for a href
 */
InstallButton.prototype.installURL = function (target) {
    while (target && !target.href)
      target = target.parentNode;

    return target && target.href;
};

InstallButton.prototype.userAgentMatchesAppId = function () {
    return (gIsFirefox && APP_ID == APP_FIREFOX
        || gIsSeaMonkey && APP_ID == APP_SEAMONKEY
        || gIsMobile && APP_ID == APP_MOBILE)
}

/**
 * Install an add-on into the current browser-type application
 * Firefox, Seamonkey, Fennec
 */
InstallButton.prototype.install = function (event)  {
    if (event.altKey || !window.InstallTrigger || !this.userAgentMatchesAppId())
        return true;

    var url = this.installURL(event.target);
    if (url) {
        // The click could occur on the link or any of its children.
        var link = $(event.target).closest('a');

        var params = new Array();
        params[this.addonName] = {
            URL: url,
            IconURL: $(link).attr('addonicon'),
            toString: function () { return this.URL; }
        };

        // Only add the Hash param if it exists.
        //
        // We optionally add this to params[] because installTrigger
        // will still try to compare a null hash as long as the var is set.
        if ($(link).attr('addonHash')) {
            params[this.addonName].Hash = $(link).attr('addonHash');
        }
        InstallTrigger.install(params);

        return false;
    }
    return false;
};

/**
 * Add a search engine
 */
InstallButton.prototype.addEngine = function (event) {
    var engineURL = this.installURL(event.target);
    if (window.external && ("AddSearchProvider" in window.external)) {
        window.external.AddSearchProvider(engineURL);
        return false;
    } else {
        alert(error_opensearch_unsupported);
        return false;
    }
};

/**
 * Hide buttons that aren't for the user's OS
 */
InstallButton.prototype.fixPlatformLinks = function () {
    if (gPlatform == PLATFORM_OTHER) return; // only hide something if we were able to detect platforms
    var platform = getPlatformName();
    var installs = this.root.find("p.install-button");

    // hide incompatible installs
    var others = installs.not(".platform-ALL, .platform-"+platform);
    others.hide();
    others.each(function() {
        var expParents = $(this).parents('.exp-loggedout, .exp-confirmed');
        if ($(expParents).length) {
            $(expParents).hide();
        } else {
            $(this).hide();
        }
    });

    //If the the amount of install buttons == the amount of incompatible install buttons
    //nothing is available, so show unavailable message
    if (installs.length == others.length) {
        this.root.find(".exp-loggedout").hide();
        this.root.addClass('unavailable').
            prepend('<strong class="compatmsg">'+sprintf(addOnNotAvailableForPlatform, this.addonName, platform)+'</strong>');
    }

};

/**
 * Change the button text from 'Download' to 'Add to X'
 */
InstallButton.prototype.fixInstallMessage = function () {
    var useInstallMessage = this.userAgentMatchesAppId();

    for(var i=0; i < this.messages.length; i++) {
        var button = this.messages[i];
        var message = useInstallMessage ?
            button['installMessage'] : button['downloadMessage'];
        $("#" + button['installTriggerName'] + " strong").text(message)
            .attr("title", message);
        $("#" + button['installTriggerName'] + " .install-button-text")
            .text(message)
            .attr("title", message);
    }
};

/**
 * Show the install instructions for Thunderbird/Sunbird
 */
InstallButton.prototype.bindInstructions = function () {
    var that = this;

    this.root.find(".install-button a").click(function() {
        if($(this).attr('frozen') == 'true') {
            return;
        }

        var instructions = $("#app_install-popup-container .app_install-popup").hide();
        var offset = that.root.offset();
        var top = offset.top + that.root.height() + 10;
        var left = offset.left - (instructions.width() - that.root.width())/2;

        instructions.css({ "position": 'absolute', "left": left, "top": top});
        instructions.slideDown("slow");

        $(document).click(function(e) {
           if($(e.target).parents("#app_install-popup-container").length == 0) {
                instructions.hide();
           }
        });
    });
};

/**
 * Add compatibility hints (add-on compatible with older/newer
 * versions of Firefox)
 */
InstallButton.prototype.addCompatibilityHints = function () {
    var that = this;

    if (!gIsFirefox) return;

    var vc = new VersionCompare();
    if (vc.compareVersions(gBrowserVersion, this.fromVersion)<0)
        var needUpgrade = true; //Firefox is too old
    else if(vc.compareVersions(gBrowserVersion, this.toVersion)>0)
        var needUpgrade = false; //Firefox is too new
    else {
        return; //Firefox is just right
    }

    var links = this.root.find("p:visible a"); // find visible install boxes
    if (links.length == 0) return; // nothing to do

    var url = links.attr('href');

    //Wrapper for hints
    var message =  $('<span class="message"></span>');
    this.root.prepend(message);
    this.root.addClass("unavailable");

    // determine "all versions" page url
    if (url.indexOf('downloads') > 0)
        url = url.substring(0, url.indexOf('downloads'));
    else if (url.indexOf('addons') > 0)
        url = url.substring(0, url.indexOf('addons'));
    url = url+'addons/versions/'+this.addonId;

    var l_parent = links.parent();
    links.hide();

    if (needUpgrade && this.loggedIn) { //Old firefox and logged in
        this.upgradeLoggedInMessage(message, url);
    } else if (!needUpgrade && this.loggedIn) { //Newer version of Firefox logged in
        this.olderFirefoxOnlyLoggedInMessage(message, url);
    } else if (!needUpgrade) { //Newer version of Firefox anonymous
        this.olderFirefoxOnlyAnonMessage(message, url);
    } else { //Old Firefox anonymous
        this.tryOldVersionMessage(message, url);
    }

    if (needUpgrade) {
        if (vc.compareVersions(this.fromVersion, LATEST_FIREFOX_DEVEL_VERSION)>=0) {
            message.prepend(sprintf('<strong class="compatmsg">' + app_compat_unreleased_version
                + "</strong>", 'http://www.mozilla.com/' + LANG + '/firefox/all-beta.html#'
                + LANG, LATEST_FIREFOX_DEVEL_VERSION));
        } else if (vc.compareVersions(this.fromVersion, LATEST_FIREFOX_VERSION)<0) {
            message.prepend(sprintf('<strong class="compatmsg">' + app_compat_update_firefox
                + "</strong>", 'http://www.mozilla.com/' + LANG + '/firefox/all.html#'
                + LANG, LATEST_FIREFOX_VERSION));
        }
    }
};

InstallButton.prototype.tryOldVersionMessage = function (messageContainer, url) {
    messageContainer.html(
        '<strong class="compatmsg">'+
        sprintf(app_compat_try_old_version, url)+
        '</strong>'
    );
    this.root.find(".exp-loggedout").hide();
};

InstallButton.prototype.olderFirefoxOnlyAnonMessage = function (messageContainer, url) {
    messageContainer.html(
        '<strong class="compatmsg">'+
        app_compat_older_firefox_only+
        '</strong>'
    );
    this.root.find(".exp-loggedout").hide();
};

InstallButton.prototype.olderFirefoxOnlyLoggedInMessage = function (messageContainer, url) {
    var that = this;
    messageContainer
        .html('<strong class="compatmsg">'+app_compat_older_firefox_only+'</strong>'
               +'<strong class="compatmsg">'
               +'<a href="#" class="ignore-check">' +app_compat_ignore_check+ '</a>'
               +'</strong>');

    messageContainer.find("a.ignore-check").click(function () {
        that.removeCompatibilityHint();
        return false;
    });
};

InstallButton.prototype.upgradeLoggedInMessage = function (messageContainer, url) {
    var that = this;
    messageContainer.html(
        '<strong class="compatmsg">'+
        sprintf(app_compat_older_version_or_ignore_check, url, "")+
        '</strong>'
    );
    messageContainer.find("a.ignore-check").click(function () {
        that.removeCompatibilityHint();
        return false;
    });
};

InstallButton.prototype.removeCompatibilityHint = function () {
    this.root.removeClass("unavailable");
    this.root.find(".message").remove();
    this.root.find("p.install-button a").show().removeAttr("frozen");
};

/**
 * Initialize experimental confirmation interactions
 */
InstallButton.prototype.initExpConfirm = function () {
    var that = this;

    /**
     * Using this to deal with 'confirmed' in url
     * jQuery click/change event fires when clicked/changed programmatically
     * BUT you get the state of the checkbox *before* it was clicked/changed,
     * therefore it appears the opposite occurred
    **/
    var confirmed = false;

    this.root.find('.exp-confirm-install').removeClass("hide");
    this.root.find('.exp-loggedout .install-button').show();

    this.root.find('.exp-confirm-install :checkbox').click(function (e) {
        if (this.checked || confirmed) {
            confirmed = false;
            that.confirmExpInstall(e);
        } else {
            that.unconfirmExpInstall(e);
        }
    });

    //Check for confirmed in url, if so click the confirm button
    if(window.location.toString().indexOf('confirmed') != -1) {
        confirmed = true;
        this.root.find('.exp-confirm-install :checkbox').click();
    }
};

/**
 * Un-freeze experimental install button, making it clickable
 */
InstallButton.prototype.confirmExpInstall = function (e) {
    var div = $(e.target).parents(".exp-loggedout");

    $(div).removeClass('exp-loggedout')
        .addClass('exp-confirmed');;
    var bt = $(div).find('.install-button a');

    var href = $(bt).attr('href');
    if (href && href.match(/(policy|\.xml|\.xpi|\.jar)/)) {
          if (href.match(/(collection_id|\?)/)) {
              href += '&confirmed';
          } else {
              href += '?confirmed';
          }
        $(bt).attr('href', href);
    }

    var tmp = $(bt).attr('engineURL');
    if (tmp && tmp.match(/\.xml$/)) {
          if (tmp.match(/(collection_id|\?)/)) {
              tmp += "&confirmed";
          } else {
              tmp += "?confirmed";
          }
        $(bt).attr('engineURL', tmp);
    }

    $(bt).removeAttr('frozen');
    return true;
};

/**
 * Freeze experimental install button
 */
InstallButton.prototype.unconfirmExpInstall = function (e) {
    var div = $(e.target).parents(".exp-confirmed");

    $(div).removeClass('exp-confirmed');
    $(div).addClass('exp-loggedout');
    var bt = $(div).find('.install-button a');

    var href = $(bt).attr('href');
    if (href) {
        href = href.replace(/\?confirmed/, '').replace(/&confirmed/,'');
        $(bt).attr('href', href);
    }
    var tmp = $(bt).attr('engineURL');
    if (tmp) {
        tmp = tmp.replace(/\?confirmed/, '').replace(/&confirmed/,'');
        $(bt).attr('engineURL', tmp);
    }

    $(bt).attr('frozen', 'true');
    return true;
};
