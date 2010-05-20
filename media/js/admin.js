
/*************************************************
*               /admin/features/category         *
*************************************************/

/*
    Creates new autocomplete object for whichever input that just recieved focus.
    Most likely done on focus to reduce # of objects instantiated on page load
*/
function prepAutocomplete(tagid) {
    $('#new-addon-id-' + tagid).autocomplete(autocompleteurl,
        {
            minChars:4,
            formatItem: function(row) { return '<b>' + row[0] + '</b><br><i>' + row[1] + '</i>'; },
            formatResult: function(row) { return row[2]; }
        });
    $('#new-addon-id-' + tagid).focus();
}

/*
    Parses input for addon id and name, then sends to server
*/
function addFeatureSubmit(tagid) {

    var addonid = document.getElementById('new-addon-id-' + tagid).value;

    addonname = addonid.substring(0, addonid.lastIndexOf('['));
    addonid = addonid.substring(addonid.lastIndexOf('[')+1, addonid.lastIndexOf(']'));

    if (addonid.length == 0) {
        editFeatureMessage(tagid, featureaddfailure, false);
        return false;
    }

    $.ajax({
        type: 'POST',
        url: featuredurl + '/add/ajax',
        data: $('#feature-add-form-'+tagid).serialize(),
        success : function() {
            $('#new-addon-id-' + tagid).attr('value', '');
            addNewFeatureRowBeforeElement($('#feature-add-tr-form-' + tagid), tagid, addonid, addonname);
        },
        error : function() {
            editFeatureMessage(tagid, featureaddfailure, false);
        }
    });

    return false;
}

/*
    After an addon is added to a featured list, it is added above the search box
*/
function addNewFeatureRowBeforeElement(sibling, tagid, addonid, addonname) {
    // Sure would be nice if we had a newer Prototype library :(

    var addonrow = document.createElement('tr');
    addonrow.setAttribute('id', 'feature-' + tagid + '-' + addonid);

    // First <td>
        var deletelink = document.createElement('a');
        deletelink.setAttribute('href', featuredurl + '/remove/' + tagid + '/' + addonid);
        deletelink.setAttribute('id', 'delete-' + tagid + '-' + addonid);
        deletelink.setAttribute('onclick', 'removeFeature(' + tagid + ',' + addonid + '); return false;');

        var deleteimage = document.createElement('img');
        deleteimage.setAttribute('src', imageurl + '/developers/delete.png');
        deleteimage.setAttribute('class', 'featureremove');
        deletelink.appendChild(deleteimage);

        var addonlink = document.createElement('a');
        addonlink.setAttribute('href', addonurl + '/' + addonid);
        addonlink.appendChild(document.createTextNode(addonname));

        var addontd1 = document.createElement('td');
        addontd1.appendChild(deletelink);
        addontd1.appendChild(addonlink);

    // Second <td>
        var addonform = document.createElement('form');
        addonform.setAttribute('id', 'feature-edit-form-' + tagid + '-' + addonid);
        addonform.setAttribute('onsubmit', 'editFeatureSubmit(' + tagid + ',' + addonid + '); return false;');
        addonform.setAttribute('action', featuredurl + '/edit');
        addonform.setAttribute('method', 'post');

        var addonforminputlocale = document.createElement('input');
        addonforminputlocale.setAttribute('name', 'data[AddonCategory][feature_locales]');
        addonforminputlocale.setAttribute('id', 'edit-addon-locales-' + tagid + '-' + addonid);
        addonforminputlocale.setAttribute('size', '40');
        addonforminputlocale.setAttribute('type', 'text');
        addonform.appendChild(addonforminputlocale);

        var addonforminputsubmit = document.createElement('input');
        addonforminputsubmit.setAttribute('id', 'edit-feature-submit-' + tagid + '-' + addonid);
        addonforminputsubmit.setAttribute('value', featureeditsubmit);
        addonforminputsubmit.setAttribute('type', 'submit');
        addonforminputsubmit.setAttribute('value', featureeditsubmit);
        addonform.appendChild(addonforminputsubmit);

        var addonformfeaturemessage = document.createElement('span');
        addonformfeaturemessage.setAttribute('id', 'edit-feature-message-' + tagid + '-' + addonid);
        addonform.appendChild(addonformfeaturemessage);


        var addontd2 = document.createElement('td');
        addontd2.appendChild(addonform);

        addonrow.appendChild(addontd1);
        addonrow.appendChild(addontd2);

    sibling.before(addonrow);
    return true;
}


function editFeatureSubmit(tagid, addonid) {
    var locales = document.getElementById('edit-addon-locales-' + tagid + '-' + addonid).value;

    if (locales.match(/[^A-Za-z,-]/)) {
        editFeatureMessage(tagid, addedinvalidlocale, false);
        return false;
    }

    $.ajax({
        type: 'POST',
        url: featuredurl + '/edit/ajax',
        data: $('#feature-edit-form-'+tagid+'-'+addonid).serialize(),
        success : function(){
            editFeatureMessage(tagid, featureeditsuccess, true);
        },
        error : function(){
            editFeatureMessage(tagid, featureeditfailure, false);
        }
    });

    return false;
}

/*
    Shows a message when editing a featured addon, then hides after 5 seconds
*/
function editFeatureMessage(tagid, message, success) {
    var target = $('#edit-feature-message-' + tagid);
    if (success) {
        target.attr('class', 'success');
    } else {
        target.attr('class', 'failure');
    }
    target.html(message);

    var toclear = $('#edit-feature-message-' + tagid);

    setTimeout( function() {toclear.html('');} , 5000);
}


function removeFeature(tagid, addonid) {
    $.ajax({
        url: featuredurl + '/remove/ajax',
        type: 'POST',
        data: $('#feature-remove-form-'+tagid+'-'+addonid).serialize(),
        success: function(){
            $('#feature-' + tagid + '-' + addonid).fadeOut();
        },
        error : function(){
            editFeatureMessage(tagid, featureremovefailure, false);
        }
    });
    return false;
}

