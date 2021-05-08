
var haritalar = {};

function getMaxObjectByProperty(array, field) {
    return array.reduce((prev, current) => (prev[field] > current[field]) ? prev : current);
}

function getMinObjectByProperty(array, field) {
    return array.reduce((prev, current) => (prev[field] < current[field]) ? prev : current);
}



Array.prototype.pushArray = function (arr) {
    this.push.apply(this, arr);
};

Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .reduce((res, key) => (res[key] = obj[key], res), {});

Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this;
}

Date.prototype.addHours = function (hours) {
    this.setHours(this.getHours() + hours);
    return this;
}
Date.prototype.addYears = function (years) {
    this.setFullYear(this.getFullYear() + years);
    return this;
}

Number.prototype.ToFixed = function (fixNumber) {
    return parseFloat((this).toFixed(fixNumber)).toLocaleString();
}

Date.prototype.addMinutes = function (minutes) {
    this.setMinutes(this.getMinutes() + minutes);
    return this;
}

Date.prototype.addSeconds = function (seconds) {
    this.setSeconds(this.getSeconds() + seconds);
    return this;
}

Date.prototype.getHourly = function () {
    this.setSeconds(0);
    this.setMinutes(0);
    this.getMilliseconds(0);
    return this;
}

Date.prototype.getDaily = function () {
    this.setHours(0);
    this.setSeconds(0);
    this.setMinutes(0);
    this.getMilliseconds(0);
    return this;
}

Date.prototype.getYearly = function () {
    return new Date(this.getFullYear(), 0, 1, 0, 0, 0, 0);
}

Date.prototype.FromJson = function (item) {
    //  /Date(32503669200000)/
    this.setTime(new Date(parseInt(item.replace('/Date(', '').replace(')/', ''))).getTime());
    return this;
}

Date.prototype.getMontly = function () {
    this.addDays(-1 * (this.getDate() - 1));
    this.setHours(0);
    this.setSeconds(0);
    this.setMinutes(0);
    this.getMilliseconds(0);
    return this;
}

Number.prototype.ToPrefixString = function (prefix) {
    var d = this.toString();
    if (d.length == 1) {
        d = prefix + d;
    }
    return d;
}

String.format = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
};

String.prototype.isJSON = function () {
    try {
        JSON.parse(this);
    } catch (e) {
        return false;
    }
    return true;
}

String.prototype.isNullOrEmpty = function () {
    try {
        if (this == '' || this == null) {
            return true;
        }
    } catch (e) {
        return true;
    }
    return false;
}

String.prototype.toCapitalize = function () {
    return this.charAt(0).toLocaleUpperCase() + this.slice(1).toLocaleLowerCase();
}



function feedback(feedback) {

    if (feedback == "" || feedback == null || feedback == "null") return false;

    if (feedback == 'SERVER') {
        feedback = { action: '', status: 'error', timeout: 20, message: 'Sunucu ile bağlantı kurulamıyor. Lütfen tekrar deneyin.', title: 'Sunucu Bağlantı Problemi !' };
    }

    var feedbackObj = feedback;

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": feedbackObj.timeout * 1000,
        "extendedTimeOut": 0,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "tapToDismiss": false
    }

    if (typeof feedbackObj.action != "undefined" && feedbackObj.action != null && feedbackObj.action != "") {
        toastr.options.onHidden = function (a) { location.href = feedbackObj.action; }
    } else {
        //bura grid refresh metodu ile güncelleneccek sayfaya refresh atılmıcak
        toastr.options.onHidden = function (a) {
            //location.reload(true);
        }
    }

    if (feedbackObj.message != "" && feedbackObj.status != "") {
        toastr[feedbackObj.status](feedbackObj.message, feedbackObj.title);
    }

}
function MesajSuccess(mesaj, title) {
    if (typeof title === "undefined" && title === null) {
        title = "İşlem Başarılı";
    }
    feedback(JSON.parse(('{"action":"","title":"' + title + '","message":"' + mesaj + '","status":"success","timeout":8}').replace(/\n/g, '<br />')));
}
function MesajError(mesaj) {
    feedback(JSON.parse(('{"action":"","title":"Sistem Uyarısı","message":"' + mesaj + '","status":"error","timeout":8}').replace(/\n/g, '<br />')));
}
function MesajWarning(mesaj, title) {
    if (typeof title === "undefined") {
        title = "İşlem Eksik Gerçekleşti";
    }
    feedback(JSON.parse(('{"action":"","title":"' + title + '","message":"' + mesaj + '","status":"warning","timeout":8}').replace(/\n/g, '<br />')));
}
function MesajInfo(mesaj, title) {
    if (typeof title === "undefined") {
        title = "İşlem Eksik Gerçekleşti";
    }
    feedback(JSON.parse(('{"action":"","title":"' + title + '","message":"' + mesaj + '","status":"info","timeout":8}').replace(/\n/g, '<br />')));
}
function TimeToDayHourMinute(t) {
    var cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        d = Math.floor(t / cd),
        h = Math.floor((t - d * cd) / ch),
        m = Math.round((t - d * cd - h * ch) / 60000);
    if (m === 60) {
        h++;
        m = 0;
    }
    if (h === 24) {
        d++;
        h = 0;
    }
    return [d, h, m]
}
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}
function getDateOfWeek(w, y) {
    var d = (1 + (w - 1) * 7);
    return new Date(y, 0, d);
}
function addWeekdays(date, weekdays) {
    var newDate = new Date(date.getTime());
    var i = 0;
    while (i < weekdays) {
        newDate.setDate(newDate.getDate() + 1);
        var day = newDate.getDay();
        if (day > 1 && day < 7) {
            i++;
        }
    }
    return newDate;
}

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff)).setHours(0);
}

function JsonUTCDate(d) {
    var JsonDate = function (_d) { return new Date(parseInt(_d.replace('/Date(', '').replace(')/', ''), 10)); }
    var dt = JsonDate(d);
    dt = new Date(dt.getTime() + new Date().getTimezoneOffset() * 60000);
    return Date.UTC(dt.getFullYear(), (dt.getMonth() - 1), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
}

function ImageError(element, image) {
    window.setTimeout(function () {
        debugger;
        $(element).attr("onerror", "");
        $(element).attr("src", image);
    }, 500);
}

function GetJsonDataFromUrl(url, _data, returnF, loadingText, loadingColor, elem) {

    var text = loadingText ? loadingText : "Veriler yükleniyor lütfen bekleyiniz.";
    var color = loadingColor ? loadingColor : "black";
    var elem = elem ? elem : $('body');



    $.ajax({
        dataType: 'JSON',
        type: 'POST',
        async: true,
        timeout: 6000000,
        url: url,
        data: (typeof (_data) != 'undefined' ? _data : null),
        beforeSend: function () {
            elem.loadingModal({ text: text, animation: 'rotatingPlane', backgroundColor: color });
        },
        success: function (res) {
            returnF(res);
        },
        complete: function () {
            elem.loadingModal('destroy');
        },
        error: function () {
            returnF(null);
        }
    });

}

function GetDataFromUrl(url, _data, returnF, beforeF, compF) {

    $.ajax({
        dataType: 'JSON',
        type: 'POST',
        async: true,
        timeout: 600000,
        url: url,
        data: (typeof (_data) != 'undefined' ? _data : null),
        beforeSend: function () {
            if (typeof (beforeF) == 'function') { beforeF(); }
        },
        success: function (res) {
            if (typeof (res) == 'undefined' || res == null || res == '') {
                feedback("SERVER");
                returnF(null);
            } else {

                if (res.hasOwnProperty("FeedBack")) {
                    feedback(res.FeedBack);
                };

                if (res.hasOwnProperty("Result")) {
                    returnF(res.Object);
                };

                if (res.result) {
                    returnF(res.objects);
                } else {
                    feedback(res.objects);
                }
            }
        },
        complete: function () {
            if (typeof (compF) == 'function') { compF(); }
        },
        error: function () {
            returnF(null);
        }
    });
}

function GetLocation(returnF) {

    if (typeof (navigator) == 'undefined' || typeof (navigator.geolocation) == 'undefined') {
        return;
    }

    navigator.geolocation.getCurrentPosition(function (position) {

        //  success

        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        returnF('POINT (' + longitude + ' ' + latitude + ')');

    }, function () {
        returnF(null);
    });

}




function fn_ControlKendoDatePicker(c) {

    try {

        if (c) {

            if (!c.element.attr("disabled")) {
                c.element.click(function (e) {
                    $('[aria-controls="' + c.element.attr("id") + '_dateview"]').click();
                });
            }

            var value = c.value() ? c.value().getTime() : new Date($(this).val()).getTime()

            $('<input type="hidden" name="' + $(this).attr("name") + '_TimeStamp" />')
                .val(value)
                .appendTo($(this).parent());

            c.bind("close", function (e) {
                e.sender.element.siblings('[type="hidden"]').val(e.sender.value() ? e.sender.value().getTime() : '');
            });
        }

    } catch (e) {

    }

}

function Kendo_GetRequest(_url, _data, _button, _modalType) {

    var $message = $('<div class="clearfix"></div>');
    var $isJSON = false;
    var _title = "";
    $.ajax({
        url: _url,
        type: _button.attr('data-method'),
        data: _data,
        beforeSend: function () {
            $('body').loadingModal({ text: 'Lütfen Bekleyin...', animation: 'rotatingPlane', backgroundColor: 'black' });
            _button.attr("disabled", "disabled");
        },
        success: function (response) {
            if (response && response.objects) {
                feedback(response.objects);
                $isJSON = true;
                if (response.result) {
                    $(document).trigger("success:json", response);
                }
                return;
            }

            //  AJAX Result Control
            if (typeof (response.FeedBack) != 'undefined' && typeof (response.Result) != 'undefined' && typeof (response.Object) != 'undefined') {
                feedback(response.FeedBack);
                $isJSON = true;
                $(document).trigger("success:json", response);
                return;
            }

            var tHtml = $(response).filter(function (i, e) { return $(e).attr("data-selector") == "modalContainer" });
            tHtml = tHtml.length > 0 ? tHtml : $(response).find('[data-selector="modalContainer"]');

            $message.append($(response).find('[data-selector="modalContainer"]'));
            var tHtml = $(response).each(function (i, e) {
                if ($(e).attr("data-selector") == "modalContainer") { $message.append($(e)); }
                if ($(this)[0].nodeName == "TITLE") { _title = $(this).text().split(" | ")[0]; }
            });

            if (tHtml.children() == 0) { $message.html("Seçici Bulunamadı"); }

        },
        error: function (response) {
            $message.html('<div class="text-center">İç sunucu hatası ' + response.statusText + '</div>');
        },
        complete: function () {

            _button.removeAttr("disabled");
            $('body').loadingModal('destroy');
            if (!$isJSON) {

                BootstrapDialog.show({
                    size: 'size-wide',
                    type: _modalType ? _modalType : 'type-info',
                    title: (_title == '' || typeof (_title) == 'undefined') ? "Kayıt Detayı" : _title,
                    message: function (dialog) { return $('<div class="clearfix" data-selector="content"></div>'); },
                    closable: true,
                    closeByBackdrop: false,
                    closeByKeyboard: false,
                    onshown: function (dialogRef) {
                        $(dialogRef.$modalBody).find('[data-selector="content"]').html($message.html());
                        $.each(haritalar, function (i, item) { item.map.updateSize(); });
                        $(document).trigger("shown:modal");
                    },
                });

            } else {
                $(".k-pager-refresh.k-link").each(function (i, e) { $(this).trigger('click'); });
            }

        }
    })

}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function Kendo_ExcelExport(e) {

    e.preventDefault();

    var columns = e.sender.columns.filter(a => a.field != "id" && a.field != 'searchField' && a.field != 'fullName');
    var data = e.data;

    if (e.sender.dataSource.group().length > 0) {
        data = $.Enumerable.From(data).SelectMany(a => a.items).ToArray();
    }

    var rows = [{
        cells: columns.map(function (c) {
            return {
                background: "#7a7a7a",
                colSpan: 1,
                color: "#fff",
                rowSpan: 1,
                value: c.title,
            }
        }),
        type: "header"
    }];

    data.forEach(function (d) {
        rows.push({
            cells: columns.map(function (c) { return { value: d[c.field] } }),
            type: "data"
        });
    });

    var workbook = {
        sheets: [{
            columns: columns.map(function (c) { return { autoWidth: true }; }),
            filter: null,
            freezePane: { rowSplit: 1, colSplit: 0 },
            rows: rows,
        }]
    };


    var c = new kendo.ooxml.Workbook(workbook);
    var blob = dataURLtoBlob(c.toDataURL());
    saveAs(blob, e.sender.options.excel.fileName + ".xlsx");

    $('body').loadingModal('destroy');
}


function Kendo_CustomExport(e) {
    e.preventDefault();
    var c = new kendo.ooxml.Workbook(e.workbook);
    var blob = dataURLtoBlob(c.toDataURL());
    saveAs(blob, e.sender.options.excel.fileName + ".xlsx");
    $('body').loadingModal('destroy');
}

function removeDuplicateElementsFromArrayByProp(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}

function Kendo_GridChange(e) {

    var _this = this;
    var _name = _this.wrapper.attr('id');
    var _buttons = _this.wrapper.find('.k-grid-toolbar .k-button:not(.k-grid-pdf,[data-task="pdf"], .k-grid-excel,[data-task="excel"])');
    var _selectedObjects = _this.select().map(function (i, elem) { return _this.dataItem(elem) }).toArray();

    _this.wrapper.find('[data-event="GridSelector"]').prop("checked", false);
    $.each(_this.select(), function () { $(this).find('[data-event="GridSelector"]').prop("checked", true); });

    _buttons.addClass('hide');

    _selectedObjects = removeDuplicateElementsFromArrayByProp(_selectedObjects, "id");

    if (_selectedObjects.length == 0) {

        _buttons.map(function (i, item) { if ($(item).attr('data-show') == 'always') { return item; } }).removeClass('hide');

    } else if (_selectedObjects.length == 1) {

        _buttons.removeClass('hide');

    } else {

        _buttons.map(function (i, item) { if ($(item).attr('data-show') == 'always' || $(item).attr('data-show') == 'default') { return item; } }).removeClass('hide');

    }

    $("#" + _name).trigger("selected:grid", _selectedObjects);

}

function Kendo_GridLoad(e) {

    //  butonlar için
    //      data-default            --> Çift tıklanında işletilecek buton
    //      data-show               --> Ne şekilde görünecek. 1 seçim olunca, çoklu seçim olunca, her halde çalışacak
    //      data-selection  [GRID]  --> post edilecek kolon ( seçilmezse id )       
    //      data-method             --> POST / GET ( default : POST )

    var _this = this;
    var _name = _this.wrapper.attr('id');
    var _datasource = _this.dataSource.data();
    var _buttons = _this.wrapper.find('.k-grid-toolbar .k-button:not(.k-grid-pdf,[data-task="pdf"], .k-grid-excel,[data-task="excel"])');
    _this.wrapper.attr('data-selection', typeof (_this.wrapper.attr('data-selection')) != 'undefined' ? _this.wrapper.attr('data-selection') : 'id');


    $.each(_buttons, function (i, item) {

        $(item).addClass('hide');
        if ($(item).attr('data-show') == 'always') { $(item).removeClass('hide'); }
        $(item).attr('data-href', (typeof ($(item).attr('href')) == 'undefined' ? $(item).attr('data-href') : $(item).attr('href')));
        $(item).attr('data-show', (typeof ($(item).attr('data-show')) != 'undefined' ? $(item).attr('data-show') : 'default'));
        $(item).attr('data-method', (typeof ($(item).attr('data-method')) != 'undefined' ? $(item).attr('data-method') : 'POST'));

        $(item).removeAttr('href');

    });

    _this.wrapper.removeAttr("tabIndex");
    _this.wrapper.off("dblclick");
    _this.wrapper.on('dblclick', 'tbody [role="row"]', function (evnt) {

        if ($(evnt.target).parents('tr[role="row"][data-uid]').eq(0).length == 1) {
            var defaultButton = _buttons.map(function (i, item) { if (typeof ($(item).attr('data-default')) != 'undefined') return item; }).eq(0);
            if (defaultButton.length == 1) {
                defaultButton.trigger('click');
            }
        }

    })
    _this.wrapper.off("change");
    _this.wrapper.on("change", '[data-event="GridSelector"]', function (event) {
        var gridSelectedRows = _this.select();
        var gridSelectedRow = $(this).parents("tr");
        var gridSelectedNotElem = gridSelectedRows.filter(function (i, elem) {
            return $(elem).attr("data-uid") != gridSelectedRow.attr("data-uid");
        });

        if (this.checked) {
            _this.select([$(this).parents("tr")]);
        } else {
            _this.clearSelection();
            _this.select(gridSelectedNotElem);
        }
    });

    $("#" + _name).trigger("load:grid", _datasource);

}

function newGuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


function OpenButtonClick() {
    if ($('.material-href').hasClass('fadeOutLeftBig')) {
        $('.material-href').removeClass('hide');
        $('.material-href').removeClass('animated fadeOutLeftBig');
        $('.material-href').addClass('animated slideInRight tada');
    } else {
        $('.material-href').addClass('hide');
        $('.material-href').removeClass('animated slideInRight tada')
        $('.material-href').addClass('animated fadeOutLeftBig');
    }
}

function TemplateAddNewDropDown(dataItem, name) {
    if (dataItem.newItem == true) {
        return '<span class="label label-xs label-info">Yeni Ekle</span> ' + name;
    }
    return name;
}



function SysFileGet(DataTable, FileGroup, DataId) {
    var file = $.ajax({
        type: "GET",
        url: '/General/GetSysFilesByDataTableAndFileGroupAndDataId',
        data: { DataTable: DataTable, FileGroup: FileGroup, DataId: DataId },
        success: function (response) {
        },
        async: false
    }).responseJSON;

    return file;
}

function TcKimlikControl(tc) {
    if (tc == null) { return "-"; }
    return tc.slice(0, 5) + "******"
}

function PlanFunction(data) {
    if (data == null) {
        return "-";
    }
    var datasplit = $.Enumerable.From(data.split(',')).Where(x => x == "Olumlu" || x == "Olumsuz" || x == "Daha Sonra Karar Ver");
    var total = datasplit.Count();
    var data = datasplit
        .GroupBy(function (a) { return a; })
        .Select(function (a) {
            var source = $.Enumerable.From(a.source);
            return {
                name: a.Key(),
                data: source.Count()
            }
        }).OrderBy(x => x.name).ToArray();

    var text = "Toplam " + total + " mülakat yapıldı.";
    text += $.Enumerable.From(data).Select(x => x.data + " " + x.name).ToArray().join(",");
    return text;
}

function First50Char(item) {

    if (item == null) { return ''; }
    return item.substr(0, 50) + (item.length > 50 ? '...' : '');
}

function hasLocation(data) {
    if (data && data != null && data != "") {
        return '<i style="color:green;" class="fa fa-location-arrow"></i>';
    }
    else {
        return "";
    }
}

function SplitDataReturnBadge(data) {
    if (data == "") {
        return "-"
    }
    return $.Enumerable.From(data.split(',')).Select(x => { return '<span style="background-color: #ffffff; color: #9a9797; border: 1px solid;" class="badge badge-warning">' + x + '</span>' }).ToArray().join(' ');
}

if (typeof (kendo) == 'undefined') {
    kendo = {};
}


kendo.GuidNull = '99999999-1234-5678-0000-999999999999';

kendo.filterParser = function (filter) {

    if (filter == "") {
        return {};
    }


    if (filter.indexOf("(") == -1) {
        filter = "(" + filter + ")";
    }


    var pattern = /(\()([^\(\)]+)(\))/g;
    //var pattern = /(.*)/g;
    var filterSub = { logic: null, filters: [] };
    var filterObject = {};


    function parser() {
        var matchParam = filter.match(pattern);
        if (matchParam != null) {

            matchParam.forEach(function (e) {

                var item = e.split('(').join('').split(')').join('');
                var logic = item.indexOf("~or~") > -1 ? "or" : "and";
                var items = item.indexOf("~or~") > -1 ? item.split('~or~') : item.split('~and~');
                filterSub = { logic: null, filters: [] };
                items.forEach(function (c, i) {
                    var obj = filterObject[c];
                    if (obj == null) {
                        var cArr = c.split("~");

                        var value = (cArr[2] || "");

                        if (value.indexOf("datetime") == 0) {
                            value = kendo.parseDate(value.replace('datetime', '').split("'").join(""))
                        } else {
                            value = value.split("'").join("");
                        }


                        obj = {
                            field: cArr[0],
                            operator: cArr[1],
                            value: value
                        };
                    }

                    if (items.length == 1) {
                        filterSub = obj;
                    } else if (items.length >= 2) {
                        if (filterSub.filters.length == 2) {
                            filterSub = {
                                logic: logic,
                                filters: [obj, filterSub]
                            }
                        } else {
                            filterSub.logic = logic;
                            filterSub.filters.push(obj);
                        }
                    }
                });

                var length = Object.keys(filterObject).length;
                var name = "####" + length;
                filterObject[name] = filterSub;
                filter = filter.replace(e, name);
            });

            if (matchParam.length > 0) {
                parser();
            }
        }
    };


    parser();

    return filterSub;
}

kendo.filterAdd = function (baseFilter, field, values, operator, logic) {

    //gt Büyüktür
    //gte Büyük Eşittir
    //lt Küçüktür
    //lte Küçük Eşittir
    //eq Eşittirr
    //neq Eşit Değildir
    //contains içerir
    //startswith ile başlar
    //endswith ile biter

    var operators = ["gt", "gte", "lt", "lte", "eq", "neq", "contains", "startswith", "endswith"];
    operator = operators.indexOf(operator) > -1 ? operator : "eq";
    try {
        baseFilter = JSON.parse(JSON.stringify(baseFilter));
    } catch (e) {
        baseFilter = [];
    }

    values = Array.isArray(values) ? values : [values];

    if (!Array.isArray(baseFilter)) {
        console.warn("lütfen options.dataSource.filter kısmındaki filtreyi veriniz.");
        return baseFilter;
    }

    if (values == null || field == null) {
        console.warn("lütfen values,field alanları zorunludur.");
        return baseFilter;
    }


    values.forEach(function (value, i) {

        var logic = i == 0 && baseFilter.length != 0 ? "and" : (logic ? logic : "or");

        if (!value) {
            return;
        }

        var filtre = {
            field: field,
            operator: operator,
            value: value
        };

        if (baseFilter.length == 0) {
            baseFilter.push(filtre);
        } else if (baseFilter.length == 1) {
            if (baseFilter.filters) {
                baseFilter = [{ filters: [baseFilter, filtre], logic: logic }];
            } else {
                baseFilter = [{ filters: [baseFilter[0], filtre], logic: logic }];
            }
        }
    });

    return baseFilter;
}


kendo.TextSeachFilter = function (e) {
    //e.element.css({ "width": "100%", "padding:": "4px 10px !important" });
    e.element.attr("style", "width: 100%;padding:4px 10px");
    e.element.attr("placeholder", "Arama yapmak için aramak istediğiniz kelimenin ilk 3 harfini giriniz.");
    //e.element.removeAttr("data-bind");
    //function getFilter(value) {
    //    var stringFields = e.dataSource.options.fields.filter(function (c) {
    //        return e.dataSource.options.schema.model.fields[c.field]["type"] == "string";
    //    }).map(a => "(" + a["field"] + "~contains~'" + value + "')");
    //    var query = "(" + stringFields.join("~or~") + ")";
    //    return query;
    //}
    var timeOut;
    e.element.keyup(function (event) {
        event.stopImmediatePropagation();
        $(this).siblings("button").remove();
        var val = $(this).val();
        if (val.length >= 3 || val == "") {

            clearTimeout(timeOut);

            var $this = $(this);

            timeOut = setTimeout(function () {
                $this.trigger("blur");
                $this.trigger("focus");
            }, 500);


            //var val = $(this).val();
            //var filterkeyword = getFilter(val);
            //var grid = $(this).parents('[data-role="grid"]').data("kendoGrid");
            //var gridFilter = grid.dataSource._righFilter || grid.dataSource.transport.parameterMap({ filter: { logic: "and", filters: grid.options.dataSource.filter } }).filter;
            //if (gridFilter && gridFilter != "") {
            //    filterkeyword += "~and~(" + gridFilter + ")";
            //}
            //grid.dataSource.filter(kendo.filterParser(filterkeyword));
        }
    });

    window.setTimeout(function () {
        e.element.siblings("span").remove();
        e.element.val("");
    }, 10);

}

function TemplateEngine(templateId, data) {
    var templateContent = $("#" + templateId).html();
    if ($("#" + templateId).length == 0) {
        return '<div>Template Bulunamadı.</div>'
    }

    try {
        var template = kendo.template(templateContent);
        return template(data);
    } catch (e) {
        console.warn(e);
        return '<div>Template Bulunamadı.</div>'
    }
}

function replaceString(value) {
    return value.replace("*", "");
}

function kendoExportTemplate(chartId) {
    var template = '<div class="form-group pull-right wrapper-export">' +
        '<div class="dropdown">' +
        '<button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-bars"></i></button>' +
        ' <ul class="dropdown-menu pull-right">' +
        '<li><a href="#" class="export-pdf" data-chart-export="{0}">PDF Olarak Kaydet</a></li>' +
        '<li><a href="#" class="export-img" data-chart-export="{0}">PNG Kaydet</a></li>' +
        '<li><a href="#" class="export-svg" data-chart-export="{0}">SVG Olarak Kaydet</li>' +
        '</ul>' +
        '</div>' +
        '</div>';
    return String.format(template, chartId.replace("#", "").replace('[data-type="', "").replace('"]', ''));
}

function TagTemplate(item, key) {
    if (!item.values) {
        return eval(String.format("item.{0}", key));
    }
    if (item.values.length >= 2) {
        return item.values.length + " adet seçim yapıldı.";
    }
    return eval(String.format("item.dataItems[0].{0}", key));
}

function DropDownSetValue(dropdown, value) {

    if (!dropdown) {
        return;
    }

    var data = [{ "field": "id:" + value.replace(new RegExp('-', 'g'), '_') + "", "dir": "asc" }];
    var baseData = $.Enumerable.From(dropdown.dataSource.sort()).Where(function (a) { return a.field.indexOf('id:') != 0 }).ToArray();

    $.each(baseData, function (i, item) {
        data.push(item);
    });

    if (dropdown.dataSource.sort() != null) {
        dropdown.dataSource.sort().splice(0, dropdown.dataSource.sort().length);
    }


    $.each(data, function (i, item) {
        dropdown.dataSource.sort().push(item);
    });

    dropdown.dataSource.read();

    if (dropdown.hasOwnProperty("dataSource") == false) return;

    dropdown.one("dataBound", function () {
        dropdown.value(value);
        dropdown.trigger("change");
    });
}


$(document)
    .on('ready', function () {
        feather.replace();
        $("button:contains(Export to PDF)").html('<span class="k-icon k-i-pdf"></span>').removeClass("hide");
        $("button:contains(Export to Excel)").html('<span class="k-icon k-i-excel"></span>').removeClass("hide");
        $(".k-list-container .k-list-optionlabel").livequery(".k-list-container .k-list-optionlabel", function () {
            $(this).append('<span class="clearDropdown">Temizle</span>');
        });

        $('#fieldsetFvr').hide();

        $.each($('[data-navigator="true"]'), function (i, item) {
            GetLocation(function (res) {
                $(item).val(res);
            })
        });

        $(document).livequery("form", function (e) {

            var _this = $(this);

            _this.validator().submit(function (e) {

                var formResult = true;

                if (e.isDefaultPrevented()) {

                    formResult = false;

                }
                else {



                    var inputs = [];
                    var $form = $(this);

                    var inputTypes = ['input', 'textarea'];
                    $.each(inputTypes, function (_i, _item) {

                        var elems = $($form).find(_item + '[data-validateurl]');

                        $.each(elems, function (i, item) {
                            inputs.push($(item)[0]);
                        });
                    });

                    $.each(inputs, function (i, item) {

                        var vUrl = $(item).attr('data-validateurl');
                        var vData = $(item).attr('name') + '=' + $(item).val();

                        //  URL Oluştu
                        if (typeof ($(item).attr('data-validatefields')) != 'undefined') {

                            var newData = [];

                            $.each($(item).attr('data-validatefields').split(','), function (i2, item2) {

                                newData.push(item2.trim() + '=' + $($form).find('#' + item2.trim()).val());

                            });

                            vData = newData.join('&');
                        }

                        var JsonResult = $.ajax({
                            dataType: 'JSON',
                            type: 'POST',
                            async: false,
                            url: vUrl,
                            data: vData,
                        }).responseJSON;

                        if (!JsonResult) {
                            return;
                        }
                        if (JsonResult.result == false) {

                            if ($(item).parents('.form-group').find('.help-block').length < 1) {
                                $(item).parents('div').eq(0).append('<span class="help-block with-errors"></span>');
                            }

                            $(item).parents('.form-group').find('.help-block').html('<ul class="list-unstyled with-errors"><li>' + JsonResult.message + '</li></ul>');

                            $(item).parents('.form-group').addClass('has-error');

                            formResult = false;

                        }
                        else {

                            var elem = $(item).parents('.form-group');
                            elem.find('.help-block').html(null);
                            elem.removeClass('has-error');

                        }

                    });

                    _this.find('.k-grid[data-required="true"]').each(function (e) {

                        if ($(this).data('kendoGrid').dataSource.total() == 0) {
                            $(this).css("border", "1px red solid");
                            $(this).before('<div class="card-panel red" style="color:red">Lütfen Verileri Eksiksiz Giriniz</div>');
                            formResult = false;
                        }
                    });

                }

                if (formResult) {

                    if (typeof ($(this).attr('data-before')) != 'undefined') {

                        var func = $(this).attr('data-before');

                        if (typeof (window[func]) === 'function') {
                            formResult = window[func]();
                        }

                    }

                }

                if (_this.attr('data-formType') == "Ajax") {
                    if (formResult) {
                        _this.trigger("validate:submit");
                    }
                    return false;
                } else {
                    return formResult;
                }

            });

        });

        $(document).livequery('[data-toggle="tooltip"]', function (e) {
            $(this).tooltip();
        });

        $(document).livequery('[data-original-title]', function (e) {
            $(this).tooltip();
        });

        $(document).livequery('[data-role="tagify"]', function (evt) {
            $(this).tagify();
        });

        $(document).livequery('[data-role="taggedInput"]', function (evt) {
            var _this = $(this);
            var multiselect = _this.data("kendoMultiSelect");
            var valueField = multiselect.options.dataValueField;
            $(multiselect.input).bind("keyup", function (event) {
                event.stopImmediatePropagation();
                var value = $(multiselect.input).val();

                if (event.keyCode === 13) {

                    var newValues = [];
                    $.each(multiselect.value(), function (i, item) {
                        var obj = {};
                        obj[valueField] = item;
                        newValues.push(obj);
                    })

                    multiselect.dataSource.data(newValues)

                    var control = multiselect.dataSource.data().filter(a => a[valueField] == value).length;

                    if (control == 0 && value != "") {
                        var obj = {};
                        obj[valueField] = value;
                        multiselect.dataSource.add(obj);
                        multiselect.list.find('li:not(.k-state-selected)').each(function () {
                            $(this).trigger("click");
                        });
                    }
                }

                return false;
            })
        })

        $(document).livequery('[data-insertUrl]', function (e) {

            var _this = $(this);
            var handler = _this.data("handler");

            if (!handler) return;

            if (handler.hasOwnProperty("dataSource") == false) return;

            var dataTextField = handler.options.dataTextField;
            var dataValueField = handler.options.dataValueField;
            var field = handler.element.attr("data-insertField");
            var cascadeForm = handler.options.cascadeFrom || handler.element.data("cascadeFrom");
            var cascadeFromField = handler.options.cascadeFromField || handler.element.data("cascadeFromField");

            var refreshId = handler.element.attr("data-refresh");

            handler.dataSource.bind("requestEnd", function (args) {
                var value = handler._prev;
                if (value != "") {
                    if (args.response.filter(a => a[dataTextField].toLowerCase() == value.toLowerCase()).length == 0) {
                        var obj = {};
                        obj[dataValueField] = newGuid();
                        obj[dataTextField] = value;
                        obj[field] = value;
                        obj["newData"] = true;
                        if (cascadeForm && cascadeFromField && $("#" + cascadeForm).length > 0) {
                            obj[cascadeFromField] = $("#" + cascadeForm).val();
                        }
                        args.response.push(obj);
                        window.setTimeout(function () {
                            handler.listView.element.find("li:last-child").empty().prepend('<span class="badge badge-primary m-r-sm">Yeni Ekle</span> ' + value);
                        }, 10);
                    };
                } else {

                }
            });


            handler.bind("select", function (c) {

                if (event.keyCode == 38 || event.keyCode == 40) {
                    return;
                }
                var item = c.sender.dataItem(c.item);
                var url = c.sender.element.attr("data-inserturl");
                var modal = c.sender.element.attr("data-modal");
                var dataValueField = c.sender.options.dataValueField;
                var dataTextField = handler.options.dataTextField;

                if (item.newData) {
                    var insertUrl = new URL(location.origin + url);
                    var data = {};
                    for (var prop in item) {
                        if ((typeof (item[prop]) == "string" || typeof (item[prop]) == "number") && prop != "uid") {
                            insertUrl.searchParams.append(prop, item[prop]);
                            data[prop] = item[prop];
                        }
                    }

                    if (modal == "true") {
                        $('<a class="btn btn-block btn-primary hide" data-task="Insert" data-method="GET" data-href="' + insertUrl.href + '"/>')
                            .appendTo($("body"))
                            .trigger("click")
                            .remove();

                        $(document).one("success", '[action="' + insertUrl.pathname + '"]', function (e, res) {

                            if (res.Result) {
                                if (handler.ns == ".kendoMultiSelect") {
                                    setTimeout(function () {
                                        c.sender.trigger("change");
                                    })
                                } else {
                                    DropDownSetValue(c.sender, data[dataValueField]);
                                }

                                var refreshDropDown = $('#' + refreshId).data("kendoDropDownList");

                                if (refreshDropDown) {
                                    refreshDropDown.dataSource.read();
                                }

                                setTimeout(function () {
                                    c.sender.trigger("change");
                                });

                            }
                        });

                    } else {

                        data["__RequestVerificationToken"] = $('[name="__RequestVerificationToken"]').val();
                        $.ajax({
                            type: "POST",
                            url: insertUrl.href,
                            data: data,
                            success: function (response) {
                                if (response.Result) {

                                    window.setTimeout(function () {
                                        if (handler.ns == ".kendoMultiSelect") {
                                        } else {
                                            DropDownSetValue(c.sender, data[dataValueField]);
                                        }
                                        setTimeout(function () {
                                            c.sender.trigger("change");

                                            var refreshDropDown = $('#' + refreshId).data("kendoDropDownList");

                                            if (refreshDropDown) {
                                                refreshDropDown.dataSource.read();
                                            }
                                        })
                                    }, 50);
                                }
                            }
                        });
                    }
                }
            });
        });

        $(document).livequery('[data-cascade]', function (e) {

            var $this = $(this);
            var cascadeElem = $($this.attr('data-cascade'));
            var values = ($this.attr('data-show') || "").split(",");

            if (cascadeElem.length == 0) {
                return;
            }

            $this.find('input[required], textarea[required], select[required]').attr('data-required', 'required');
            $this.find('input[disabled], textarea[disabled], select[disabled]').attr('data-disabled', 'disabled');


            function toggle(elem) {
                var value = elem.attr('type') != 'radio' ? elem.val() : $('[name="' + elem.attr('name') + '"]:checked').val();
                if (values.indexOf(value) > -1) {
                    $this.show();
                    $this.find('input[data-required], textarea[data-required], select[data-required]').attr('required', 'required');
                    $this.find('input:not([data-disabled]), textarea:not([data-disabled]), select:not([data-disabled])').removeAttr('disabled');
                }
                else {
                    $this.hide();
                    $this.find('input[data-required], textarea[data-required]').removeAttr('required');
                    $this.find('input:not([data-disabled]), textarea:not([data-disabled]), select:not([data-disabled])').attr('disabled', 'disabled');
                }
            }


            cascadeElem
                .on('change', function (e) {
                    toggle($(this));
                });

            toggle(cascadeElem);

        })


        $(document).livequery('input', function (e) {
            var picker = $(this).data("kendoDatePicker") || $(this).data("kendoDateTimePicker");
            fn_ControlKendoDatePicker(picker);


            if (picker) {
                var func = function () {
                    var elemValue = picker.element.val();
                    var newValue = picker.options.parseFormats.map(e => kendo.parseDate(elemValue, e)).filter(a => a != null)[0] || new Date().getDaily();
                    if (newValue) {
                        newValue = newValue < picker.options.min ? picker.options.min : newValue;
                        newValue = newValue > picker.options.max ? picker.options.max : newValue;
                        picker.value(newValue);
                    } else {
                        picker.value(newValue);
                    }
                }
                picker.element.on("blur", func);
                picker.element.on("focusOut", func);
            }

        });

        $(document).livequery('[data-role="multiselect"]:not([data-custom])', function (e) {
            var kendoMultiSelect = $(this).data("kendoMultiSelect");

            $('<span unselectable="on" data-event="clear" class="k-icon k-clear-value k-i-close" title="Temizle" role="button" tabindex="-1"></span>')
                .on("click", function (e) {
                    kendoMultiSelect.dataSource.pageSize(20);
                    kendoMultiSelect.value([]);
                })
                .appendTo($(this).siblings('.k-multiselect-wrap'));

            $('<span unselectable="on" class="k-i-all" title="Tümünü Seç" role="button" tabindex="-1"><i class="fa fa-check-square-o"></i></span>')
                .on("click", function (e) {

                    e.preventDefault();
                    kendoMultiSelect.dataSource.pageSize(100000);

                    //kendoMultiSelect.setDataSource(dataSource);
                    kendoMultiSelect.one("dataBound", function (e) {
                        var $dataValueField = e.sender.listView.options.dataValueField;
                        var values = $.map(e.sender.dataSource.data(), function (dataItem) {
                            return dataItem[$dataValueField];
                        });
                        e.sender.close();
                        e.sender.value(values);
                    });
                    kendoMultiSelect.dataSource.read();
                })
                .appendTo($(this).siblings('.k-multiselect-wrap'));
        });

        $(document).livequery('[data-cascadefrom]:not([data-custom])', function (e) {


            var element = $(this);
            var role = element.attr("data-role");
            var from = element.attr("data-cascadefrom");


            switch (role) {
                case "datepicker":
                case "datetimepicker":

                    var elementData = element.data("kendoDateTimePicker") || element.data("kendoDatePicker");

                    if (!elementData) {
                        return;
                    }

                    var cascadeElement = $("#" + from);
                    var cascadeElementData = cascadeElement.data("kendoDateTimePicker") || cascadeElement.data("kendoDatePicker");

                    if (!cascadeElementData) {
                        return;
                    }

                    var changeFunction = function (e) {
                        var type = elementData.element.attr("data-cascadetype");
                        if (e.sender.value()) {
                            elementData[type](new Date(e.sender.value()));

                            switch (type) {
                                case "max":
                                    if (elementData.value() > new Date(e.sender.value())) {
                                        elementData.value(new Date(e.sender.value()));
                                    }
                                    break;
                                case "min":
                                    if (elementData.value() < new Date(e.sender.value())) {
                                        elementData.value(new Date(e.sender.value()));
                                    }
                                    break;
                            }

                        }
                    }


                    if (!cascadeElementData._events.change) { cascadeElementData._events.change = []; }
                    cascadeElementData._events.change.push(changeFunction);


                    changeFunction({ sender: cascadeElementData });

                    break;
                case "multiselect":

                    var elementData = element.data("kendoMultiSelect");

                    var field = element.attr('data-cascadefromfield');

                    if (!elementData) {
                        return;
                    }

                    var cascadeElement = $("#" + from).data("kendoMultiSelect") || $("#" + from).data("kendoDropDownList");

                    if (cascadeElement) {

                        var cascadeFunction = function () {
                            if ((this.options.name = "MultiSelect" && this.value().length == 0) || this.options.name == "DropDownList" && !this.value()) {
                                elementData.enable(false);
                            } else {
                                var basefilter = elementData.options.dataSource.filter;
                                elementData.dataSource.filter(kendo.filterAdd(basefilter, field, this.value(), "eq"));
                                elementData.enable(true);
                            }
                        };

                        if (!cascadeElement._events.dataBound) { cascadeElement._events.dataBound = []; }
                        if (!cascadeElement._events.close) { cascadeElement._events.close = []; }
                        //if (!cascadeElement._events.close) { cascadeElement._events.close = []; }

                        cascadeElement._events.dataBound.push(cascadeFunction);
                        cascadeElement._events.close.push(cascadeFunction);
                    }


                    break;
                case "numerictextbox":

                    var elementData = element.data("kendoNumericTextBox");

                    if (!elementData) {
                        return;
                    }

                    var cascadeElement = $("#" + from);
                    var cascadeElementData = cascadeElement.data("kendoNumericTextBox");


                    if (!cascadeElementData) {
                        return;
                    }

                    var changeFunction = function (e) {
                        var type = elementData.element.attr("data-cascadetype");
                        if (e.sender.value()) {
                            elementData[type](e.sender.value());

                            switch (type) {
                                case "max":
                                    if (elementData.value() > e.sender.value()) {
                                        elementData.value(e.sender.value());
                                    }
                                    break;
                                case "min":
                                    if (elementData.value() < e.sender.value()) {
                                        elementData.value(e.sender.value());
                                    }
                                    break;
                            }

                        }
                    }

                    if (!cascadeElementData._events.change) { cascadeElementData._events.change = []; }
                    cascadeElementData._events.change.push(changeFunction);

                    changeFunction({ sender: cascadeElementData });

                default:

            }

        });

        $(document).livequery('[data-imageGrid]', function (e) {
            var item = $(this);
            var attr = item.attr('data-imageGrid');
            var split = attr.split('/');
            var file = SysFileGet(split[0], split[1], split[2]);
            if (file != null) {
                item.attr('src', file.FilePath)
            }
        });

        $(document).livequery('[data-counturl]', function (e) {
            var _this = $(this);

            var hasTab = _this.parents(".tab-pane").length > 0;
            var hasActiveTab = _this.parents(".tab-pane.active").length > 0;

            if (!hasTab || hasActiveTab) {
                var loaded = _this.hasClass("loaded");
                if (!loaded) {
                    var url = _this.data("counturl");
                    if (url) {
                        $.ajax({
                            url: url,
                            success: function (res) {
                                if (typeof (res)) {
                                    _this.text(kendo.toString(parseInt(res), "N0") + (_this.attr("data-piece") != undefined ? " Adet" : ""));
                                    _this.trigger("success", res);

                                    _this.addClass("loaded");
                                }
                            }
                        });
                    }
                }
            }
        });

        $(document).livequery(".k-grid", function (e) {
            var grid = $(this);
            //debugger;
            //var hasTab = $(this).parents(".tab-pane").length > 0;
            //var hasActiveTab = $(this).parents(".tab-pane.active").length > 0;
            //if (!hasTab || hasActiveTab) {
            //    var loaded = $(this).hasClass("loaded");
            //    if (!loaded) {
            //        windo.setTimeout(function () {
            //            grid.data("kendoGrid").dataSource.read();
            //        },5000);                            
            //        $(this).addClass("loaded");
            //    }
            //}
        });

        if (window.location.hash != "") {
            $('[href="' + window.location.hash + '"]').trigger('click');
        }

    })
    .on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {

        var target = $(e.target).attr("href");
        $(target).find(".k-grid").each(function () {
            var loaded = $(this).hasClass("loaded");
            if (!loaded) {
                $(this).data("kendoGrid").dataSource.read();
                $(this).addClass("loaded");
            }
        });

        $(target).find("[data-counturl]").each(function () {
            var _this = $(this);
            var loaded = _this.hasClass("loaded");
            if (!loaded) {

                var url = _this.data("counturl");
                if (url) {
                    $.ajax({
                        url: url,
                        success: function (res) {
                            if (typeof (res)) {
                                _this.text(kendo.toString(parseInt(res), "N0") + (_this.attr("data-piece") != undefined ? " Adet" : ""));
                                _this.trigger("success", res);

                                _this.addClass("loaded");
                            }
                        }
                    });
                }
                _this.addClass("loaded");
            }

        });
    })
    .on("click", '[data-grid][data-query]', function (c) {
        var gridName = $(this).data("grid");
        var grid = $("#" + gridName).data("kendoGrid");
        var gridFilter = grid.dataSource.transport.parameterMap({ filter: { logic: "and", filters: grid.options.dataSource.filter } }).filter;


        if ($(this).data("switch") == "radio") {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
            } else {
                var category = $(this).data("category");
                $(this).parents("ul").find('[data-category="' + category + '"]').removeClass("active");
                $(this).addClass("active");
            }
        } else {
            $(this).toggleClass("active");
        }

        var filters = $.map($('[data-grid="' + gridName + '"][data-query].active'), function (e) { return $(e).data(); })

        if (filters.filter(a => a["switch"] == "radio").length > 0) {
            gridFilter = "";
        }


        $.Enumerable.From(filters).GroupBy(a => a.category).ForEach(function (c) {
            var query = c.source.filter(a => a.query != "").map(function (e) { return e.query; }).join("~or~");
            if (query != "" && query != "()") {
                if (gridFilter == "") {
                    gridFilter = "(" + query + ")";
                } else {
                    gridFilter = "(" + gridFilter + "~and~(" + query + "))"
                }
            }
        });

        grid.dataSource["_righFilter"] = gridFilter;
        var newFilter = kendo.filterParser(gridFilter);
        grid.dataSource.filter(newFilter);
    })
    .on('focus click tap', 'input, textarea', function () {
        $(this).attr("autocomplete", 'off');
    })
    .on('keydown', 'form:not([data-submit="allow"])', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    })
    .on('keydown', '.bootstrap-tagsinput input[type=text]', function (e) {
        if (event.which == 13) {
            $(this).blur();
            $(this).focus();
            return false;
        }
    })
    .on("focusin", "label.radio-label", function () {
        $(this).addClass("focus");
    })
    .on("focusout", "label.radio-label", function () {
        $(this).removeClass("focus");
    })
    .on("keyup", function (e) {
        if (e.which === 27) {
            $(".bootstrap-dialog").eq($(".bootstrap-dialog").length - 1).find(".bootstrap-dialog-close-button").trigger('click');
        }
    })
    .on("keyup", ".k-filter-menu", function (e) {
        if (e.which === 13) {
            $(this).find('[type="submit"]').trigger("click");
            $(this).trigger("submit");
        }
    })
    .on("keydown", 'label.focus', function (e) {

        if (e.keyCode == 37 || e.keyCode == 39) {
            e.preventDefault();
            if ($(this).parents(".akilliRadioGrup").length == 0) return;
            var index = $(this).index();
            var current = $(this).parent().find("*").eq(index + 2);

            if (current.length == 0) {
                current = $(this).parent().find("*").eq(1);
            }
            current.trigger("click")
            current.trigger("focus");
        }

    })
    .on("keydown", '.k-widget.k-dropdown', function (e) {

        var dropdown = $(this).find('[data-role="dropdownlist"]').data("kendoDropDownList");
        var dataopened = dropdown.element.attr('data-opened');

        if (e.keyCode == 9 && dataopened != 'true') {
            e.preventDefault();
            if (dropdown._open == false) {
                dropdown.open();
                dropdown.element.attr("data-opened", "true");
            } else {
                dropdown.close();
                dropdown.element.removeAttr("data-opened");
            }
        }
    })
    .on("keydown", '.k-widget.k-datepicker', function (e) {
        var datepicker = $(this).find('[data-role="datepicker"]').data("kendoDatePicker");
        var dataopened = datepicker.element.attr('data-opened');
        var id = datepicker.element.attr('id');

        if (e.keyCode == 9 && dataopened != 'true') {
            e.preventDefault();
            var control = $("#" + id + "_dateview").css("display");

            if (control == 'none') {
                datepicker.open();
                datepicker.element.attr("data-opened", "true");
            } else {
                datepicker.close();
                datepicker.element.removeAttr("data-opened");
            }
        }

    })
    .on("keydown", '.k-widget.k-datetimepicker', function (e) {

        var datetimepicker = $(this).find('input').data("kendoDateTimePicker");
        var dataopened = datetimepicker.element.attr('data-opened');
        var id = datetimepicker.element.attr('id');

        if (e.keyCode == 9 && dataopened != 'true') {
            e.preventDefault();
            var control = $("#" + id + "_dateview").css("display");

            if (control == 'none') {
                datetimepicker.open();
                datetimepicker.element.attr("data-opened", "true");
            } else {
                datetimepicker.close();
                datetimepicker.element.removeAttr("data-opened");
            }
        }


    })
    .on("keydown", '.k-widget.k-multiselect:not([data-custom])', function (e) {

        var multi = $(this).find('[data-role="multiselect"]').data("kendoMultiSelect");
        if (multi) {
            var dataopened = multi.element.attr('data-opened');

            if (e.keyCode == 9 && dataopened != 'true') {
                e.preventDefault();
                if (multi.popup.visible() == false) {
                    multi.toggle(true);
                    multi.element.attr("data-opened", "true");
                } else {
                    multi.toggle(false);
                    multi.element.removeAttr("data-opened");
                }
            }
        }
    })
    .on("click", '[data-print="qrcode"]', function (e) {

        var qrId = $(this).attr("data-target");
        var qrCode = $('#' + qrId);
        var newWin = window.open("", "");
        newWin.document.open();
        $(qrCode).find('[data-id="qrCodeName"]').removeClass("hide");
        newWin.document.write("<html><body onload=\"window.print()\">" + qrCode.html() + "</body></html>");
        $(qrCode).find('[data-id="qrCodeName"]').addClass("hide");
        newWin.document.close();
        setTimeout(function () { newWin.close(); }, 10);
    })
    .on("click", '[data-export="qr-code-png"]', function (e) {

        var qrId = $(this).attr("data-target");

        var qrcode = $("#" + qrId).data("kendoQRCode");
        var imageDataUrl = qrcode ? qrcode.imageDataURL() : $("#" + qrId).find('img').attr('src');

        if (navigator.msSaveBlob) {
            var blob = toBlob(imageDataUrl, "image/png");
            navigator.msSaveBlob(blob, this.getAttribute("download"));
        } else {
            this.href = imageDataUrl;
        }
    })
    .on("click", '[data-toggle="cloneTable"] [data-task="add"]', function (e) {
        e.preventDefault();
        var tbody = $(this).parents("tbody");
        var clone = $(this).parents("tr").clone(true, true);
        var count = tbody.find("tr").length;
        var control = [];
        clone.find('[data-task="add"]').addClass("hide");
        clone.find('[data-task="remove"]').removeClass("hide");


        $(this).parents("tr").find("input,select,textarea").each(function () {
            control.push($(this).attr("data-required") == "true" && $(this).val() == "")
        });

        if (control.indexOf(true) > -1) {
            feedback({ status: 'warning', timeout: 20, message: 'Zorunlu alanları lütfen doldurunuz.', title: 'Boş Bırakılamaz !' });
            return false;
        }

        clone.find('input,select,textarea').each(function () {

            var _this = $(this);

            var name = _this.attr("data-name");


            if (_this.context.nodeName == "SELECT") {

                var value = _this.val();
                var text = _this.find('option[value="' + value + '"]').text();

                _this.after('<input class="form-control" type="text" readonly value="' + text + '"/>');
                _this.after('<input type="hidden" data-name="' + name + '" name="' + name.replace("[]", "[" + (count - 1) + "]") + '" value="' + value + '"/>');
                _this.remove();

            } else {

                if (_this.attr("type") == "checkbox") {
                    var durum = _this.is(":checked");
                    _this.attr("type", "hidden")
                        .attr("name", name.replace("[]", "[" + (count - 1) + "]"))
                        .removeAttr("id")
                        .val(durum);
                    _this.after('<input class="form-control" type="text" readonly value="' + (durum ? "Evet" : "Hayır") + '"/>');
                } else {
                    _this
                        .attr("name", name.replace("[]", "[" + (count - 1) + "]"))
                        .attr("readonly", "readonly")
                        .removeAttr("id");
                }

            }


        });

        tbody.append(clone)

        $(this).parents("tr").find("input,select,textarea").each(function () {
            $(this).val("");
            $(this).trigger("change");
        });

    })
    .on("click", '[data-toggle="cloneTable"] [data-task="remove"]', function (e) {
        e.preventDefault();
        var tbody = $(this).parents("tbody");
        var tr = $(this).parents("tr").remove();

        tbody.find("tr").not(":first-child").each(function (im, em) {
            $(this).find("input,select,textarea").each(function () {
                var name = $(this).attr("data-name");
                if (name) {
                    $(this).attr("name", name.replace("[]", "[" + (im) + "]"));
                }
            });
        });

    })
    .on("click", '[type="submit"]', function (e) {

        if ($(this).attr("name") != "" && $(this).attr("value") != "") {
            $(this).parents("form").find('[type="submit"]').removeClass("active");
            $(this).addClass("active");
        }

    })
    .on('click', '.clearDropdown', function (e) {

        var id = $(this).parents('.k-list-container').find('[aria-owns]').attr('aria-owns').replace("_listbox", "");

        var kendoDrop = $('#' + id).data("kendoDropDownList");

        if (kendoDrop.dataSource.options.type != "aspnetmvc-ajax") {
            eval(String.format("{0}Filtre = [];", id));

            kendoDrop.dataSource.filter({});

            kendoDrop.dataSource.read();
        }

    })
    .on('click', '[data-toggle="tab"]', function () {

        $.each(haritalar, function (i, item) { item.map.updateSize(); });

    })
    .on("load:grid", ".k-grid", function (e, resp) {
        var grid = $(this).data("kendoGrid");
        var adet = grid.dataSource.total();
        var gridId = grid.element.attr("id");
        $('[data-gridid="' + gridId + '"]').text(adet + " Adet");
        $('[data-grididTab="' + gridId + '"]').text(adet);
        $('[data-id="' + gridId + '"]').text(adet + " Adet");
    })

    .on('validate:submit', '[data-formType="Ajax"]', function (e) {

        $(this).trigger("before:submit");

        e.preventDefault();

        var _this = $(this);
        var button = _this.find('.active[type="submit"]');
        var action = button.attr("formaction") || _this.attr("action");
        var method = button.attr("formmethod") || _this.attr("method");
        var target = button.attr("formtarget") || _this.attr("target");
        var title = _this.attr("data-loadingtitle") ? _this.attr("data-loadingtitle") : "Lütfen Bekleyiniz...";
        var formData = new FormData();
        var stringData = _this.find('input:not([type="file"]),select,textarea').serializeArray();
        var indexFile = 0;

        if (target == "_blank") {
            _this.removeAttr('data-formType');
            _this.attr("action", action);
            _this.attr("target", "_blank");
            _this.trigger("submit");
            _this.attr("data-formType", "Ajax");
            _this.removeAttr("target");
            return;
        }


        _this.find('.active[type="submit"]').each(function (c) {
            if ($(this).attr("value") != "" && $(this).attr("name") != "") {
                stringData.push({ name: $(this).attr("name"), value: $(this).attr("value") });
            }
        });

        $.each(stringData, function (key, input) {
            formData.append(input.name, input.value);
        });


        _this.find(".fileupload-container").each(function (e) {
            var table = $(this).data("table");
            var id = $(this).data("id");
            var group = $(this).data("group");
            $(this).find('li.file-item').each(function (c) {
                var file = $(this).data("file");
                if (file) {
                    formData.append(table + '|' + group + '|' + id, file, file.name);
                    indexFile++;
                }
            });
        });



        var settings = {
            url: action,
            type: method,
            data: stringData,
            beforeSend: function () {
                $('body').loadingModal({ text: title, animation: 'rotatingPlane', backgroundColor: 'black' });
            },
            success: function (response) {
                feedback(response.FeedBack);
                if (response.Result) {
                    var modal = _this.parents(".modal");
                    if (modal.length > 0 && typeof _this.attr('data-modal-close') == "undefined") {
                        modal.modal("hide");
                    }
                    $(".k-pager-refresh.k-link").each(function (i, e) {
                        $(this).trigger("click");
                    });
                }
                _this.trigger("success", response);
            },
            error: function () {
                feedback("SERVER");
            },
            complete: function (response) {
                $('body').loadingModal('destroy');
                _this.trigger("complete", response.responseJSON, response.responseText);
            }
        };

        if (indexFile > 0) {
            settings["contentType"] = false;
            settings["processData"] = false;
            settings["data"] = formData;
        }

        $.ajax(settings);

    })
    .on('click', '[data-task="modalClose"]', function (e) {

        e.preventDefault();
        var modal = $(this).parents('.modal')

        if (modal.length > 0) {
            modal.modal("hide");
        } else {
            history.back();
        }

        $(this).parents("form").trigger("back");
        return false;

    })
    .on('focus', '.k-widget.k-dropdown', function () {
        $(document).off('focusin.modal');
    })

    .on('click', '.k-grid .k-grid-toolbar .k-button:not(.k-grid-pdf,[data-task="pdf"] .k-grid-excel,[data-task="excel"]),[data-task="Insert"]', function (e) {
        //  data-href = URL

        //  data-show = select, single, always
        //      select > seçilince ( tek veya çoklu seçim )     //  default
        //      single > yalnızca tekil seçimlerde görünsün
        //      always > her türlü görünsün

        //  data-modal = true, false
        //      true  > modalda açılır                          //  default
        //      false > yönlendirme şeklinde sayfaya gider

        //  data-ask = İşlem gerçekleşmeden önce sweetalert ile evet/hayır şeklinde onay sorusu gerçekleştirir

        //  data-modalType = info, warning, success, default
        //      modal açılma şekilleri                          //  default = info

        //  data-blank = Açılacak ekran yeni sekmede mi açılsın ayarı
        //      eğer bu method varsa ve method yeni sekmede açılsın modal degil ise yeni sekmede acılır

        e.preventDefault();
        var _this = $(this);
        if (_this.attr("disabled") == "disabled") { return false; }
        if (_this.attr('data-href') === undefined) { return false; }

        var _blank = _this.attr("data-blank") != undefined;
        var _data = {};
        var _grid = _this.parents('.k-grid').eq(0).data('kendoGrid');
        var _multiple = _grid && _grid.options.selectable.indexOf('Multiple') > -1;
        var _postArray = _multiple == false ? false : (_this.attr('data-show') == 'single' ? false : true);
        var _modal = _this.attr("data-modal") != 'false';
        var idColumnKey = _this.attr("data-idColumnKey") || "id";

        if (_this.attr("data-show") != 'always') {
            var postData = _grid ? $.Enumerable.From(_grid.select().map(function (i, elem) {
                var selectColumn = _this.attr("data-idColumn") || _grid.wrapper.attr('data-selection') || "id";
                return _grid.dataItem(elem)[selectColumn];
            }).toArray()).GroupBy(a => a).Select(a => a.Key()).ToArray() : (_this.attr('data-id') ? [_this.attr('data-id')] : '');

            if (postData && postData != "") {
                _data[idColumnKey] = _postArray == false ? postData[0] : postData;
            }
        }

        var _modalType = typeof (_this.attr('data-modalType')) != 'undefined' ? ('type-' + _this.attr('data-modalType')) : ('type-info');
        var _isask = typeof (_this.attr('data-ask')) != 'undefined';
        var _ask = _this.attr('data-ask') || "İşlemi gerçekleştirmek için onay vermeniz gereklidir. Devam etmek istediğinize emin misiniz !";



        if (_isask) {


            Swal.fire({
                title: "Devam Et ?",
                text: _ask,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Evet",
                cancelButtonText: "Hayır",
                confirmButtonColor: 'green',
                cancelButtonColor: 'red',
            }).then((result) => {
                if (result.isConfirmed) {

                    if (_modal) {
                        Kendo_GetRequest(_this.attr('data-href'), _data, _this, _modalType);
                        _this.trigger("success:swal");
                    } else {
                        var __data = '';
                        $.each(_data, function (i, item) { if (item != '' && item != null) { __data += '&' + i + '=' + item; } });

                        var tUrl = window.encodeURI(_this.attr('data-href') + (__data.length > 0 ? (_this.attr('data-href').indexOf('?') > -1 ? '&' : '?') + __data.substring(1) : ''));
                        if (_blank) {
                            window.open(tUrl, '_blank');
                        } else {
                            window.location.href = tUrl;
                        }
                    }
                }
                swal.close();
            });

        } else {

            if (_modal) {
                Kendo_GetRequest(_this.attr('data-href'), _data, _this, _modalType);
            } else {
                var __data = '';
                $.each(_data, function (i, item) { if (item != '' && item != null) { __data += '&' + i + '=' + item; } });
                var tUrl = window.encodeURI(_this.attr('data-href') + (__data.length > 0 ? (_this.attr('data-href').indexOf('?') > -1 ? '&' : '?') + __data.substring(1) : ''));
                if (_blank) {
                    window.open(tUrl, '_blank');
                } else {
                    window.location.href = tUrl;
                }
            }

        }

        return false;

    })
    .on('click', '[data-chart-export]', function (e) {

        var chart = $('#' + $(this).attr('data-chart-export')).getKendoChart();
        chart = chart == null ? $('[data-type="' + $(this).attr('data-chart-export') + '"]').getKendoChart() : chart;

        var css = $(this).attr('class');
        if (css.indexOf("export-pdf") == 0) {

            chart.exportPDF({ paperSize: "auto", margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" } }).done(function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: "chart.pdf",
                    proxyURL: "https://demos.telerik.com/kendo-ui/service/export"
                });
            });

        } else if (css.indexOf("export-img") == 0) {
            chart.exportImage().done(function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: "chart.png",
                    proxyURL: "https://demos.telerik.com/kendo-ui/service/export"
                });
            });
        } else if (css.indexOf("export-svg") == 0) {
            chart.exportSVG().done(function (data) {
                kendo.saveAs({
                    dataURI: data,
                    fileName: "chart.svg",
                    proxyURL: "https://demos.telerik.com/kendo-ui/service/export"
                });
            });
        }
    })

    .on('click', '[data-import="Excel"]', function (e) {
        var $this = $(this);
        var properties = $this.data("properties");
        var postUrl = $this.data("post");

        var gridId = $this.attr("data-gridRefresh");

        $('<input type="file"  accept="*.xlsx,*.csv,*.xls"/>')
            .on("change", function (e) {
                var $html = $("<div id='excelimport' class='clearfix'></div>");

                var dosya = this.files[0];
                var reader = new FileReader();

                var _modalOpened = false;

                var gridFieldProps = {
                    String: { fieldKey: 'string', type: 'string', kendoType: 'string' },
                    Object: { fieldKey: 'string', type: 'string', kendoType: 'string' },
                    Int16: { fieldKey: 'integer', type: 'integer', kendoType: 'number' },
                    Int32: { fieldKey: 'integer', type: 'integer', kendoType: 'number' },
                    Int64: { fieldKey: 'integer', type: 'integer', kendoType: 'number' },
                    Double: { fieldKey: 'double', type: 'double', kendoType: 'number' },
                    Boolean: { fieldKey: 'boolean', type: 'boolean', input: 'radio', kendoType: 'boolean' },
                    DateTime: { fieldKey: 'dateTime', type: 'datetime', kendoType: 'date' }
                };

                var sheetData = [];
                var headers = [];
                reader.onload = function (e) {

                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary',
                        cellDates: true,
                        cellText: false,
                        cellNF: false,
                    });

                    var sheet = workbook.Sheets[workbook.SheetNames[0]];
                    sheetData = XLSX.utils.sheet_to_row_object_array(sheet);

                    var range = XLSX.utils.decode_range(sheet['!ref']);
                    var C, R = range.s.r;

                    for (C = range.s.c; C <= range.e.c; ++C) {
                        var cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]

                        var hdr = "UNKNOWN " + C;
                        if (cell && cell.t) {
                            hdr = XLSX.utils.format_cell(cell);

                            if (hdr && hdr != null && hdr != "") {
                                headers.push(hdr);
                            }
                        }
                    }

                    var uniqueColumn = $.Enumerable.From(properties).Where(a => a.Unique).FirstOrDefault();

                    if (uniqueColumn && uniqueColumn != null) {
                        $html.append(`<div class="alert alert-danger alert-dismissable"> <i class="fa fa-warning"></i> '${uniqueColumn.Alias}' alanı benzersiz olmalıdır. Bu alana girilen değer daha önce kullanılmışsa yeni kayıt atılmayacak, var olan kayıt güncellenecektir.</div>`);
                    }

                    var table = "<table class='table table-bordered'><thead><tr><th width ='%35'>Kolonlar </th><th width ='%35'> Excel Başlıkları </th><th width ='%35'>Varsayılan Değer <i data-original-title='Excelden gelen verinin boş olması durumunda atanacak varsayılan değer.' class='fa fa-info-circle'></i></th></tr></thead><tbody></tbody></table>";
                    $html.append(table);
                    $.each(properties, function (i, prop) {
                        var row = $('<tr>');
                        var desc = prop.Description ? prop.Description : "";
                        var required = prop.Required ? "<span class='text-danger'>(*)</span>" : "";
                        var unique = prop.Unique ? '  <i class="fa fa-info-circle" data-original-title="Bu alan benzersiz olmalıdır. Bu alana girilen değer daha önce kullanılmışsa yeni kayıt atılmayacak, var olan kayıt güncellenecektir."></i>' : "";
                        var info = prop.Info ? '<i class="fa fa-info-circle" data-original-title="' + prop.Info + '"></i>' : "";
                        row.append('<td>' + prop.Alias + " " + required + unique + info + ' <span style="color: #bcbcbc">' + desc + '</span>' + '</td>');

                        var select = $('<select>').attr("id", newGuid())
                            .attr("data-column", prop.Name)
                            .addClass("form-control")
                            .append('<option value="">Seçim Yapınız</option>')

                        $.each(headers, function (j, elem) {
                            var selected = elem.toLocaleLowerCase() == prop.Alias.toLocaleLowerCase() ? "selected" : "";
                            select.append('<option ' + selected + ' value="' + elem + '">' + elem + '</option>');
                        })

                        $('<td>').append(select).appendTo(row);

                        switch (prop.Type) {
                            case "String":
                            case "Object":
                                $('<td>').append('<input type="text" class="form-control" data-default="' + prop.Name + '"/>').appendTo(row);
                                break;
                            case "Int16":
                            case "Int32":
                            case "Int64":
                                $('<td>').append('<input type="number" class="form-control" data-default="' + prop.Name + '"/>').appendTo(row);
                                break;
                            case "Double":
                                $('<td>').append('<input type="number" class="form-control" step="0.1" data-default="' + prop.Name + '"/>').appendTo(row);
                                break;
                            case "Boolean":
                                $('<td>').append('<input type="checkbox" class="form-control" data-default="' + prop.Name + '"/>').appendTo(row);
                                break;
                            case "DateTime":
                                $('<td>').append('<input type="date" style="margin-top: 10px;width: 100%;" data-default="' + prop.Name + '"/>').appendTo(row);
                                break;
                            default:
                                break;
                        }

                        $html.find('tbody').append(row);
                    })
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(dosya);

                BootstrapDialog.show({
                    size: 'size-wide',
                    type: 'type-info',
                    title: "Excel'den Yükle",
                    message: $html,
                    onshow: function (dialog) {
                        var $footerButton = dialog.getButton('btn-post');
                        $($footerButton).attr("style", "margin-right:20px");
                    },
                    buttons: [{
                        label: 'Verileri İçeri Aktar',
                        cssClass: 'btn-success pull-right',
                        action: function (dialog) {
                            $("body").loadingModal({ text: "Veriler içeri aktarılırken lütfen bekleyiniz.", animation: 'rotatingPlane', backgroundColor: "#000" });
                            var resultObj = [];
                            var requiredWarnings = [];
                            var fieldWarnings = [];

                            $.each(sheetData, function (j, data) {
                                var obj = {};

                                $.each(properties, function (index, prop) {

                                    var excelColumn = $('[data-column="' + prop.Name + '"]').val();
                                    var defaultElem = $('[data-default="' + prop.Name + '"]');

                                    if (data[excelColumn] && data[excelColumn] != null && data[excelColumn] != "") {
                                        if (prop.Type == "Boolean") {
                                            obj[prop.Name] = data[excelColumn] == "1" || data[excelColumn].toLowerCase() == "true" || data[excelColumn].toLowerCase() == "evet" || data[excelColumn].toLowerCase() == "doğru" ? true : false;
                                        }
                                        else if (prop.Type == "DateTime") {
                                            obj[prop.Name] = new Date(data[excelColumn]).addHours(3);
                                        }
                                        else {
                                            obj[prop.Name] = data[excelColumn];
                                        }
                                    }

                                    else {
                                        if (prop.Type == "Boolean") {
                                            obj[prop.Name] = $(defaultElem).is(":checked");
                                        }
                                        else if (prop.Type == "DateTime") {
                                            if ($(defaultElem).val() && $(defaultElem).val() != null && $(defaultElem).val() != "") {
                                                obj[prop.Name] = new Date().addHours(3);
                                            }
                                            else {
                                                obj[prop.Name] = null;
                                            }
                                        }
                                        else {
                                            obj[prop.Name] = $(defaultElem).val();
                                        }
                                    }

                                    if (obj[prop.Name] && !fieldWarnings.includes(prop.Alias)) {

                                        switch (prop.Type) {
                                            case "Int16":
                                            case "Int32":
                                            case "Int64":
                                                var intValue = parseInt(obj[prop.Name]);
                                                if (isNaN(intValue) || !Number.isInteger(intValue)) {
                                                    fieldWarnings.push({ Alias: prop.Alias, Row: parseInt(data.__rowNum__) + 1 });
                                                }
                                                break;
                                            case "Double":
                                                if (isNaN(obj[prop.Name])) {
                                                    fieldWarnings.push({ Alias: prop.Alias, Row: parseInt(data.__rowNum__) + 1 });
                                                }
                                                break;
                                            case "String":
                                            case "Object":
                                                if (typeof (obj[prop.Name]) != "string") {
                                                    fieldWarnings.push({ Alias: prop.Alias, Row: parseInt(data.__rowNum__) + 1 });
                                                }
                                                break;
                                            case "Boolean":
                                                if (obj[prop.Name] != true && obj[prop.Name] != false) {
                                                    fieldWarnings.push({ Alias: prop.Alias, Row: parseInt(data.__rowNum__) + 1 });
                                                }
                                                break;
                                            case "DateTime":
                                                if (obj[prop.Name] == "Invalid Date") {
                                                    fieldWarnings.push({ Alias: prop.Alias, Row: data.__rowNum__ });
                                                }
                                                break;
                                            default:
                                        }
                                    }

                                    if (prop.Required && !obj[prop.Name] && !requiredWarnings.includes(prop.Alias)) {
                                        requiredWarnings.push({ Alias: prop.Alias, Row: parseInt(data.__rowNum__) + 1 });
                                    }
                                })

                                resultObj.push(obj);
                            })

                            if (fieldWarnings.length > 0 || requiredWarnings.length > 0) {
                                $.each(fieldWarnings, function (i, warn) {
                                    MesajWarning(warn.Alias + " alanının tipi uyuşmamaktadır, lütfen kontrol ediniz. Satır Numarası : " + warn.Row);
                                })

                                $("body").loadingModal("destroy");
                                return;
                            }

                            GetJsonDataFromUrl(postUrl, { model: JSON.stringify(resultObj) }, function (resp) {
                                if (resp) {
                                    dialog.close();
                                    var errorRows = $.Enumerable.From(resp.Object).Where(a => a.status == false).ToArray();
                                    if (resp.Result) {
                                        MesajSuccess(resp.FeedBack.message, "İşlem başarılı");
                                    }

                                    if (errorRows.length > 0) {

                                        MesajWarning(resp.FeedBack.message, errorRows.length + " satır kaydedilemedi.");

                                        var errorData = [];
                                        var allData = $.Enumerable.From(sheetData);
                                        $.each(errorRows, function (i, item) {
                                            var data = allData.Where(a => a.__rowNum__ == item.rowNumber).FirstOrDefault();
                                            if (data != null) {
                                                headers.map(function (h) { return data[h] = data[h] ? data[h] : "" });
                                                data["Hata"] = item.message;
                                                errorData.push(data);
                                            }
                                        })

                                        ExcelExport(errorData);
                                    }

                                    var grid = $('#' + gridId).data("kendoGrid");
                                    if (resp.Result == true && grid && grid != undefined) {
                                        grid.dataSource.read();
                                    }
                                }

                                $("body").loadingModal("destroy");
                            })
                        }
                    }, {
                        id: 'btn-post',
                        label: "Verileri Göster",
                        cssClass: 'btn-primary pull-right',
                        action: function (e) {

                            if (_modalOpened == false) {
                                var gridData = [];
                                $.each(sheetData, function (j, data) {

                                    var objData = {};
                                    $.each(properties, function (index, prop) {

                                        var excelCol = $('[data-column="' + prop.Name + '"]').val();
                                        var defaultElem = $('[data-default="' + prop.Name + '"]');

                                        objData[prop.Name.split(' ').join('')] = "-";

                                        if (data[excelCol] && data[excelCol] != null && data[excelCol] != "") {
                                            if (prop.Type == "Boolean") {
                                                objData[prop.Name.split(' ').join('')] = data[excelCol] == "1" || data[excelCol].toLowerCase() == "true" || data[excelCol].toLowerCase() == "evet" || data[excelCol].toLowerCase() == "doğru" ? true : false;
                                            }
                                            else if (prop.Type == "DateTime") {
                                                objData[prop.Name.split(' ').join('')] = new Date(data[excelCol]).toLocaleDateString();
                                            }
                                            else {
                                                objData[prop.Name.split(' ').join('')] = data[excelCol];
                                            }
                                        }

                                        else {
                                            if (prop.Type == "Boolean") {
                                                objData[prop.Name.split(' ').join('')] = $(defaultElem).is(":checked");
                                            }
                                            else if (prop.Type == "DateTime") {
                                                objData[prop.Name.split(' ').join('')] = new Date($(defaultElem).val()).toLocaleDateString();
                                            }
                                            else {
                                                objData[prop.Name.split(' ').join('')] = $(defaultElem).val();
                                            }
                                        }
                                    })

                                    gridData.push(objData);
                                });

                                var _columns = [];
                                var _fields = {};
                                $.each(properties, function (i, item) {
                                    _fields[item.Name.split(' ').join('')] = { type: gridFieldProps[item.Type].kendoType };

                                    if (item.Type == "Boolean") {
                                        _columns.push({
                                            field: item.Name.split(' ').join(''), title: item.Alias, width: "130px", template: function (dataItem) {

                                                var value = dataItem[item.Name];

                                                if (typeof (value) == "string") {
                                                    value = value.split(' ').join('');
                                                }

                                                if (value && value == true) {
                                                    return "Evet";
                                                } else {
                                                    return "Hayır";
                                                }
                                            }
                                        });
                                    }
                                    else if (item.Type == "DateTime") {
                                        _columns.push({
                                            field: item.Name.split(' ').join(''), title: item.Alias, width: "130px", template: function (dataItem) {
                                                if (dataItem[item.Name]) {
                                                    return kendo.toString(kendo.parseDate(dataItem[item.Name.split(' ').join('')]), "dd.MM.yyyy");
                                                }
                                                else {
                                                    return "";
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        _columns.push({
                                            field: item.Name.split(' ').join(''), title: item.Alias, width: "130px"
                                        });
                                    }
                                })

                                BootstrapDialog.show({
                                    size: 'size-wide',
                                    type: 'type-info',
                                    id: 'showDataOnGrid',
                                    title: "Veri Önizleme",
                                    onshow: function (dialog) {

                                        _modalOpened = true;

                                        $(dialog.$modalDialog).css("width", "86%");
                                        $(dialog.$modalBody).attr("style", "padding:15px !important;");
                                        $(dialog.$modalBody).find(".k-grid td").attr("style", "padding: 5px 10px !important;");
                                        $(dialog.$modalBody).find(".k-grid-toolbar").attr("style", "display:none;");
                                        window.setTimeout(function () {
                                            $(dialog.$modalContent).resizable({
                                                stop: function (e, ui) {
                                                    $('#GridDataTable').height($('#GridDataTable').height() + (ui.size.height - ui.originalSize.height));
                                                    $('#GridDataTable').data("kendoGrid").resize();
                                                }
                                            });
                                            $('#GridDataTable').data("kendoGrid").refresh();
                                        }, 500);
                                    },
                                    onhidden: function (dialog) {
                                        _modalOpened = false;
                                    },
                                    message: $('<div id="GridDataTable">').kendoGrid({
                                        dataSource: {
                                            data: gridData,
                                            schema: {
                                                model: {
                                                    fields: _fields
                                                }
                                            },
                                            pageSize: 20
                                        },
                                        height: 400,
                                        scrollable: true,
                                        sortable: true,
                                        filterable: true,
                                        pageable: {
                                            input: true,
                                            numeric: false
                                        },
                                        columns: _columns
                                    }),
                                });
                            }
                        }
                    }, {
                        label: "Kapat",
                        cssClass: 'btn-danger pull-left',
                        action: function (dialog) {
                            dialog.close();
                        }
                    }]
                });
            })
            .trigger("click");
    })

    .on('click', '[data-selector="share"]', function (e) {
        var url = window.location.origin + $(this).attr("data-formUrl");
        var formEmails = $(this).attr("data-formEmail");
        var formSubject = $(this).attr("data-formSubject");
        var formMessage = $(this).attr("data-formMessage");
        var formReturnUrl = $(this).attr("data-formReturnUrl");
        var formHasTemplate = $(this).attr("data-formHastemplate");
        var formAttach = $(this).attr("data-formAttach");

        $message = $('<div class="clearfix">');

        var emails = formEmails || "";
        var subject = formSubject || "";
        var message = formMessage || "";
        var returnUrl = formReturnUrl || null;
        var hasTemplate = formHasTemplate || false;
        var attach = formAttach || false;

        $('<div class="form-group">')
            .append('<label class="control-label req">Mail Adres(ler)i</label>')
            .append('<input type="text" id="sendingMail" data-item="emails" data-role="tagify" data-value="' + emails + '" placeholder="Lütfen email adresi girip Enter tuşuna basınız.">')
            .appendTo($message);

        $('<div class="form-group">')
            .append('<label class="control-label req">Konu</label>')
            .append('<input type="text" id="sendingSubject" class="form-control input-md" value="' + subject + '"/>')
            .appendTo($message);

        $('<div class="form-group">')
            .append('<label class="control-label req">Mesajınız</label>')
            .append('<textarea type="text" id="sendingMessage" class="form-control input-md">' + message + '</textarea>')
            .appendTo($message);

        BootstrapDialog.show({
            size: 'size-wide',
            type: 'type-info',
            title: "Dosya Paylaşımı",
            message: function (dialog) { return $message; },
            onshow: function (dialog) {
                var tagifyElem = dialog.$modalContent.find('[data-item="emails"]');

                var whitelist = $.ajax({
                    url: '/General/DataSourceEmailsCompanyAndUsers',
                    data: null,
                    async: false
                }).responseJSON || [];

                tagifyElem.tagify({
                    whitelist: whitelist,
                    enforceWhitelist: false,
                    maxTags: 999,
                    dropdown: {
                        maxItems: 999,
                        enabled: 0,
                        closeOnSelect: false
                    }
                })
                    .off("add removetag invalid")
                    .on("invalid", function () {
                        MesajWarning("Geçersiz email girişi yaptınız..", "Bilgilendirme");
                    });

            },
            buttons: [{
                label: 'Vazgeç',
                cssClass: 'btn-danger',
                action: function (dialog) {
                    dialog.close();
                }
            }, {
                label: 'Gönder',
                cssClass: 'btn-info',
                action: function (dialog) {

                    var formData = new FormData();

                    var emailData = $('#sendingMail').data("tagify");

                    if (emailData && emailData.value) {
                        email = emailData.value.map(a => a.value).join(";");
                    } else {
                        MesajWarning("Lütfen geçerli mail adresi giriniz.", "Hatalı mail");
                        return;
                    }

                    var subject = $('#sendingSubject').val();
                    if (subject == "") {
                        MesajWarning("Lütfen geçerli bir konu giriniz.", "Hatalı konu");
                        return;
                    }

                    var message = $('#sendingMessage').val();

                    formData.append('url', url);
                    formData.append('email', email);
                    formData.append('subject', subject);
                    formData.append('message', message);
                    formData.append('returnUrl', returnUrl);
                    formData.append('hasTemplate', hasTemplate);
                    formData.append('attach', attach)

                    $.ajax({
                        url: '/Files/Send',
                        type: 'POST',
                        dataType: 'json',
                        contentType: false,
                        processData: false,
                        data: formData,
                        beforeSend: function () {
                            $('body').loadingModal({ text: 'Mail gönderiliyor, lütfen bekleyiniz.', animation: 'rotatingPlane', backgroundColor: 'black' });
                        },
                        success: function (resp) {
                            if (resp && resp.Result) {
                                MesajSuccess("Dosya paylaşım işlemi başarılı.", "İşlem başarılı");
                                dialog.close();
                            }
                            else {
                                MesajWarning("Dosya paylaşım işlemi başarısız.", "İşlem başarısız");
                            }
                        },
                        complete: function (response) {
                            $('body').loadingModal('destroy');
                        }
                    });
                }
            }]
        });

    })
    ;

function ExcelExport(data) {
    var columns = Object.keys(data[0]);
    var rows = [{
        cells: columns.map(function (c) {
            return {
                background: "#7a7a7a",
                colSpan: 1,
                color: "#fff",
                rowSpan: 1,
                value: c,
            }
        }),
        type: "header"
    }];

    data.forEach(function (d) {
        rows.push({
            cells: columns.map(function (c) { return { value: d[c] } }),
            type: "data"
        });
    });

    var workbook = {
        sheets: [{
            columns: columns.map(function (c) { return { autoWidth: true }; }),
            filter: null,
            freezePane: { rowSplit: 1, colSplit: 0 },
            rows: rows,
        }]
    };


    var c = new kendo.ooxml.Workbook(workbook);
    var blob = dataURLtoBlob(c.toDataURL());
    saveAs(blob, "Hatalı_Veriler.xlsx");
}


window.addEventListener('resize', function () {

    $('[data-role="chart"]').each(function (i, item) {
        var id = $(item).attr("id");
        var kendoChart = $('#' + id).data("kendoChart");

        if (kendoChart && kendoChart != null && kendoChart != "" && kendoChart != undefined) {
            kendoChart.resize();
        }
    })

})
