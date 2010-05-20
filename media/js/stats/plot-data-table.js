/**
 * Provides table pagination and auto-data loading from a timeplot
 * datasource into a table.
 */
function PlotDataTable(config) {
    this.init(config);
}
PlotDataTable.prototype = {
    init: function(config) {
        this.config = {};
        $.extend(this.config, this.defaultConfig, config);
        this.repaginate();
    },

    defaultConfig: {
        tableId: '',
        paginationId: '',
        downloadLinkId: '',
        loadingId: '',
        ignoreToday: '', // ignore the first row if it matches this date ('YYYY-MM-DD' format)
        rowsPerPage: 6,
        maxRows: 0,  // maximum number of rows to process regardless of pagination (0 == no max)
        headerTranslations: {},
        valueFormatters: [],
        defaultValueFormatter: (typeof number_format == 'function' ? number_format : null)
    },
    config: {},
    currentPage: 0,

    // hide our table
    hide: function() {
        $('#' + this.config.tableId).hide();
    },

    // hide loading indicator
    hideLoading: function() {
        if (this.config.loadingId) {
            $('#' + this.config.loadingId).hide();
        }
    },

    // show our table
    show: function() {
        $('#' + this.config.tableId).show();
    },

    // show loading indicator
    showLoading: function() {
        if (this.config.loadingId) {
            $('#' + this.config.loadingId).show();
        }
    },

    // Clear and hide the configured table
    clearTable: function() {
        var stats_table = $('#' + this.config.tableId);
        $(stats_table).hide();
        $('tbody tr', stats_table).remove();
        if (this.config.paginationId) {
            $('#' + this.config.paginationId).hide().empty();
        }
    },

    // Rebuild table headers from array of fields
    setHeaders: function(fields) {
        var row = $('<tr class="header"></tr>'),
            col = $('<th></th>');

        var that = this;
        $.each(fields, function(i, val) {
            if (val in that.config.headerTranslations) {
                val = that.config.headerTranslations[val];
            }
            col.clone().html(val).appendTo(row);
        });

        // mark first/last columns.
        row.find('th:first').addClass('first').end()
            .find('th:last').addClass('last');

        $('#' + this.config.tableId + ' thead').empty().append(row);
    },

    // Attaches table to a timeplot datasource for automatic loading
    listenTo: function(eventSource) {
        var that = this;
        eventSource.addListener({
            onAddMany: function() {
                return that.onAddMany(eventSource);
            }
        });
    },

    // Timeplot listener hook
    onAddMany: function(source) {
        this.currentPage = 0;

        // Convert all the events into an array of arrays.
        var data_rows = [],
            evt, i_evt = source.getAllEventIterator();
        while (evt = i_evt.next()) {
            data_rows.push(
                [ evt.getTime() ].concat( evt.getValues() )
            );
        }

        // Sort the rows in reverse-chronological order
        data_rows.sort(function(b,a) {
            var a=a[0], b=b[0];
            return (a==b) ? 0 : ( (a<b) ? -1 : 1 );
        });

        // Optionally ignore data for today
        if (data_rows.length && this.config.ignoreToday == data_rows[0][0].strftime('%Y-%m-%d')) {
            data_rows = data_rows.slice(1);
        }

        if (this.config.maxRows > 0) {
            data_rows = data_rows.slice(0, this.config.maxRows);
        }

        // Clear existing data row
        var stats_table = $('#' + this.config.tableId);
        $('tbody tr', stats_table).remove();
        $(stats_table).show();
        this.showLoading();

        // Get localized date format and un-escape it.
        var date_fmt = localized.date.replace(/&#37;/g,'%');

        // Wrap the table population in a self-calling timeout function 
        // in order to keep the browser from completely freezing during 
        // the process.  Also provides cheap loading animation as rows 
        // flow in.
        var tmpl_row = $('<tr><td class="col"></td></tr>');
        var valueRe = /^[0-9]*[.]?[0-9]+$/;
        var is_even_row = false;
        var row_count = 0;
        var rowsPerPage = this.config.rowsPerPage;
        var that = this;
        (function() {

            // Try getting a data row, bail out if none left.
            var values = data_rows.shift();
            if (!values)  {
                // Tag the first and last rows.
                stats_table
                    .find('tr:first').addClass('first').end()
                    .find('tr:last').addClass('last').end();
                that.repaginate();
                that.hideLoading();
                return;
            }

            row_count++;

            // Format the date using the localized format
            values[0] = values[0].strftime(date_fmt);

            // Clone a new row and populate it with the values.
            var row = tmpl_row.clone(),
                col = row.find('td.col').remove();
            for (var j=0,value; j < values.length; j++) {
                value = values[j];
                // format values
                if (valueRe.test(value)) {
                    // custom value formatter
                    if (j in that.config.valueFormatters && typeof that.config.valueFormatters[j] == 'function') {
                        value = that.config.valueFormatters[j](value);

                    // default value formatter
                    } else if (typeof that.config.defaultValueFormatter == 'function') {
                        value = that.config.defaultValueFormatter(value);
                    }
                    col.clone().text(value).addClass('value').appendTo(row);

                // format json encoded addon into a link
                } else if (typeof addonLinkFormat == 'function' && j in that.config.valueFormatters && that.config.valueFormatters[j] == addonLinkFormat) {
                    // attempt to parse addon from JSON
                    var addon = {};
                    try {
                        addon = JSON.parse(value);
                    } catch(e) {
                        // ignore errors - default will format value into a span
                    }

                    if (typeof addon == 'object' && 'id' in addon && 'name' in addon) {
                        value = addonLinkFormat(addon.id, addon.name);
                    } else {
                        value = $('<span></span>').text(value);
                    }

                    col.clone().html(value).appendTo(row);

                // format text
                } else {
                    col.clone().text(value).appendTo(row);
                }
            }

            // Set the even/odd row class and mark first/last columns.
            row.addClass( is_even_row ? 'even' : 'odd' )
                .find('td:first').addClass('first').end()
                .find('td:last').addClass('last');
            is_even_row = !is_even_row;


            // Finally, add the row to the table and schedule a call for
            // the next row...
            stats_table.append(row);

            // ... hiding rows not on the first page
            if (that.config.paginationId && row_count > rowsPerPage) {
                row.hide();
            }

            setTimeout(arguments.callee, 0);

        })();

    },

    // recognized options - boolean properties: 'skip', 'selected', 'prev', and 'next' 
    paginationItemFactory: function(pageNum, text, options) {
        if (typeof options == 'undefined') {
            options = {};
        }

        var item = $('<li></li>');
        if ('skip' in options && options['skip']) {
            item.addClass('skip').html('&#8230;');
        } else {
            var link = $('<a href="#"></a>')
                .text((typeof text == 'undefined' ? pageNum+1 : text))
                .bind('click', { obj: this, fn:'gotoPage', page: pageNum }, function(e) {
                    e.data.obj[e.data.fn](e.data.page);
                    return false;
                });

            if ('prev' in options && options['prev']) {
                link.attr('rel', 'prev');
            } else if ('next' in options && options['next']) {
                link.attr('rel', 'next');
            }
            if ('selected' in options && options['selected']) {
                item.addClass('selected');
            }
            item.append(link);
        }
        return item;
    },

    setDownloadLink: function(url) {
        if (! this.config.downloadLinkId) {
            return;
        }
        $('#' + this.config.downloadLinkId).attr('href', url);
    },

    // Regenerate pagination navigation
    updatePageNav: function() {
        if (! this.config.paginationId) {
            return;
        }
        var container = $('#' + this.config.paginationId).hide().empty();

        // maybe show previous link
        if (this.currentPage > 0) {
            container.append(this.paginationItemFactory(this.currentPage-1, 'Prev', {prev: true}));
        }
        // always show first link
        container.append(this.paginationItemFactory(0, 1, {selected:(this.currentPage == 0)}));

        var totalPages = this.pageCount();
        var pageNum = 1;
        var rangeEnd = totalPages-1;

        // maybe show skip after first page link
        if (totalPages > 11 && this.currentPage > 4) {
            if (this.currentPage == 5) {
                container.append(this.paginationItemFactory(pageNum, pageNum+1));
            } else {
                container.append(this.paginationItemFactory(0, '', {skip:true}));
            }

            // advance page counter
            pageNum = Math.max(pageNum + 1, Math.min(totalPages - 9, this.currentPage - 3));

            // determine range
            rangeEnd = Math.min(totalPages - 1, pageNum + 6);

        } else {
            rangeEnd = Math.min(totalPages - 1, pageNum + 7);
        }

        // show page links through rangeEnd
        for (; pageNum <= rangeEnd; pageNum++) {
            container.append(this.paginationItemFactory(pageNum, pageNum+1,{selected:(pageNum == this.currentPage)}));
        }

        // maybe show skip or 2nd to last page link
        if (pageNum + 2 < totalPages) {
            container.append(this.paginationItemFactory(0, '', {skip:true}));
        } else if (pageNum + 2 == totalPages) {
            container.append(this.paginationItemFactory(pageNum, pageNum+1,{selected:(pageNum == this.currentPage)}));
            pageNum++;
        }

        // always show last page link (if not already shown)
        if (pageNum < totalPages) {
            container.append(this.paginationItemFactory(totalPages-1, totalPages, {selected:(this.currentPage == totalPages-1)}));
        }

        // maybe show next link
        if (this.currentPage < totalPages-1) {
            container.append(this.paginationItemFactory(this.currentPage+1, 'Next', {next: true}));
        }

        // show off all our hard work
        container.show();
    },

    // Repaginate the table based on current page and rows per page
    repaginate: function() {
        if (! this.config.paginationId || ! this.config.tableId) { return; }

        $('#'+this.config.tableId).find('tbody tr').show()
            .filter(':lt('+(this.currentPage * this.config.rowsPerPage)+')')
                .hide()
                .end()
            .filter(':gt('+((this.currentPage + 1) * this.config.rowsPerPage - 1)+')')
                .hide()
                .end();

        this.updatePageNav();
    },

    // Calculate number of pages in the paginated table
    pageCount: function() {
        var rowCount = 0;
        if (this.config.tableId) {
            rowCount = $('#'+this.config.tableId).find('tbody tr').length;
        }
        return Math.max(0, Math.ceil(rowCount / this.config.rowsPerPage));
    },

    // Page navigation...
    firstPage:    function() { this.gotoPage(0); },
    previousPage: function() { this.gotoPage(this.currentPage - 1); },
    nextPage:     function() { this.gotoPage(this.currentPage + 1); },
    lastPage:     function() { this.gotoPage(this.pageCount() - 1); },

    gotoPage: function(pageIndex) {
        this.currentPage = Math.max(0, Math.min(this.pageCount() - 1 ,pageIndex));
        this.repaginate();
    }
};
