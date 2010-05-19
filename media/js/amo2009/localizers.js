var localizers = {
    initialized: false,

    init: function(options) {
        if (this.initialized)
            return;
        else
            this.initialized = true;

        this.options = options;

        $('.sidebar .motd .edit_motd')
            .find('button').click(function(e) {
                var this_motd = $(this).closest('.motd');
                e.preventDefault();
                $.post(localizers.options.jsonURL, $(this).parent().serialize(),
                    function(d, s) {
                        if (!d.error) {
                            this_motd
                                .find('.edit_motd textarea').text(d.msg).end()
                                .children('.edit_motd').hide()
                                .siblings('.motd_text').children('.msg').html(d.msg_purified)
                                .parent().show();
                        } else {
                            alert(d.error_message);
                            return;
                        }
                    }, 'json');
            }).end()
            .find('a.cancel').click(function(e) {
                e.preventDefault();
                $(this).closest('.edit_motd')
                    .hide()
                    .siblings('.motd_text').show();
            });

        $('.sidebar .motd .motd_text p.edit a').click(function(e) {
            e.preventDefault();
            $(this).closest('.motd_text')
                .hide()
                .siblings('.edit_motd').show();
        });
    }
}
