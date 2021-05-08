function fileLoad(element, files) {

    var $this = element;
    var autoSend = $this.attr("data-autosend");
    var user = $this.attr("data-user");
    var fileCount = parseInt($this.attr("data-count"));
    var extension = $this.attr("data-extension");
    var fileCountKontrol = false;

    if (($this.find(".file-item").length + files.length) > fileCount) {
        MesajWarning("Dosya yükleme limitiniz (" + fileCount + ") adettir.Yükleme limitini aşmaktasınız.", "Limit Hatası");
        return;
    }
    var rejectFiles = [];
    $.each(files, function (i, item) {
        var ext = item.name.split('.').pop().toLowerCase();
        if (extension.split(",").map(a => a.trim()).indexOf("." + ext) == -1) {
            rejectFiles.push(item.name);
        };
    });

    if (rejectFiles.length > 0) {
        MesajWarning("Yüklemek istediğiniz (" + rejectFiles.join(",") + ") dosya(ları)nın tipi uygun değildir. \n Yüklemek istediğiniz kategoriye uygun tipler :" + extension, "Dosya Tipi Hatası");
        return;
    }



    var loaditemCount = 0;
    $.each(files, function (index, file) {
        $this.find(".fileupload-content").find(".file-info").hide();

        var ext = file.name.split('.').pop().toLowerCase();

        if (autoSend == "True") {


            var formData = new FormData();
            var stringData = $this.serializeArray();
            $.each(stringData, function (key, input) {
                formData.append(input.name, input.value);
            });
            formData.append("DataId", $this.data("id"));
            formData.append("DataTable", $this.data("table"));
            formData.append("FileGroup", $this.data("group"));
            formData.append("file", file, file.name);


            $.ajax({
                url: "/Files/FileImport",
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function () {
                    if (loaditemCount == 0) {
                        $this.loadingModal({ text: "Dosya yükleme işlemi devam ediyor, lütfen bekleyiniz", animation: 'rotatingPlane', backgroundColor: 'black' });
                    }
                },
                success: function (response) {
                    feedback(response.FeedBack);
                    if (response.Result) {

                        var content = '<li class="file-item col-md-12" data-url="' + response.Object.url + '" data-id="' + response.Object.id + '">' +
                            '<div class="clearfix file-container">' +
                            '<div class="file-image"><img src="/Content/SYS_Files/img/new_icons/' + ext + '.png"></div>' +
                            '<div class="file-desc">' +
                            '<div class="col-md-9" title="' + response.Object.name + '">' + response.Object.name + '</div>' +
                            '<div class="col-md-3">' +
                            '<div class="file-created">' + new Date().toLocaleString("tr-TR") + '</div>' +
                            '<div class="file-owner">' + user + '</div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="file-button">' +
                            '<button type="button" title="Dosya sil" data-task="remove" class="btn btn-xs btn-danger"><i class="fa fa-remove"></i></button>' +
                            '<button type="button" title="Dosya linkini kopyala" data-task="copy" class="btn btn-xs btn-info"><i class="fa fa-copy"></i></button>' +
                            '<button type="button" title="Dosya önizleme" data-task="download" class="btn btn-xs btn-success"><i class="icon-zoom-in"></i></button>' +
                            '<button type="button" title="Dosya paylaşım" data-task="mail" class="btn btn-xs btn-warning"><i class="icon-mail-3"></i></button>' +
                            '</div>' +
                            '</div>' +
                            '</li>';

                        $(content).appendTo($this.find(".fileupload-content"));

                    }
                },
                error: function () {
                    feedback("SERVER");
                },
                complete: function (response) {
                    loaditemCount++;
                    if (loaditemCount == files.length) {
                        $this.loadingModal('destroy');
                    }
                }
            });

        } else {

            var content = '<li class="file-item col-md-12">' +
                '<div class="clearfix file-container">' +
                '<div class="file-image"><img src="/Content/SYS_Files/img/new_icons/' + ext + '.png"></div>' +
                '<div class="file-desc">' +
                '<div class="col-md-9" title="' + file.name + '">' + file.name + '</div>' +
                '<div class="col-md-3">' +
                '<div class="file-created">' + new Date().toLocaleString("tr-TR") + '</div>' +
                '<div class="file-owner">' + user + '</div>' +
                '</div>' +
                '</div>' +
                '<div class="file-button">' +
                '<button type="button" title="Dosya sil" data-task="remove" class="btn btn-xs btn-danger"><i class="fa fa-remove"></i></button>' +
                '<button type="button" title="Dosya linkini kopyala" data-task="copy" class="btn btn-xs btn-info"><i class="fa fa-copy"></i></button>' +
                '<button type="button" title="Dosya önizleme" data-task="download" class="btn btn-xs btn-success"><i class="icon-zoom-in"></i></button>' +
                //'<button type="button" title="Dosya paylaşım" data-task="mail" class="btn btn-sm btn-warning"><i class="icon-mail-3"></i></button>' +
                '</div>' +
                '</div>' +
                '</li>';

            $(content).appendTo($this.find(".fileupload-content"))
                .data("file", file);
        }

    });


    $this.find('.form-control').val($this.find('li.file-item').length > 0 ? "dosya var" : null);
    $this.find('.form-control').trigger("blur");
}

$(document)
    .on("click", '.fileupload-container[data-insert="True"] [data-task="upload"]', function (e) {
        var $this = $(this).parents(".fileupload-container");
        var extension = $this.attr("data-extension");
        $('<input type="file" multiple accept="' + extension + '"/>')
            .on("change", function () {
                var files = this.files;
                fileLoad($this, files);
            })
            .trigger("click");
    })
    .on("dragover", '.fileupload-container[data-insert="True"]', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var fileGroup = $(this).find('[type="file"]').attr("name");
        $(this).find(".drop-container").show();
    })
    .on("drop", '.fileupload-container', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var element = $(this);
        var files = evt.originalEvent.dataTransfer.files;
        fileLoad(element, files);
        $(this).find('.drop-container').hide();
    })
    .on("dragleave", '.drop-container', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $(this).hide();
    })
    .on("click", '.fileupload-container [data-task="copy"]', function (e) {
        var $ul = $(this).parents("ul");
        var $li = $(this).parents("li");
        var file = $li.data("file");

        if (file) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                var url = reader.result;

                navigator.clipboard.writeText(url)
                    .then(() => {
                        MesajSuccess("Dosya indirme linki kopyalama işlemi başarılı", "Mesaj");
                    })
                    .catch(err => {
                        MesajWarning("Kopyalama işlemi için lütfen izin veriniz.", "Mesaj");
                    });


            };
            reader.onerror = function () {
                MesajWarning("Dosya indirme linki kopyalanırken sorun oluştu.", "Mesaj");
            }

        } else {
            var url = window.location.host + $(this).parents(".file-item").data("url");

            navigator.clipboard.writeText(url)
                .then(() => {
                    MesajSuccess("Dosya indirme linki kopyalama işlemi başarılı", "Mesaj");
                })
                .catch(err => {
                    MesajWarning("Kopyalama işlemi için lütfen izin veriniz.", "Mesaj");
                });


        }


    })
    .on("click", '.fileupload-container [data-task="download"]', function (e) {

        var $ul = $(this).parents("ul");
        var $li = $(this).parents("li");
        var file = $li.data("file");

        if (file) {
            saveAs(file, file.name);
        } else {
            window.open($(this).parents(".file-item").data("url"), "_blank", "", true);
            MesajSuccess("Dosya indirme işlemi başarılı", "Mesaj");
        }

    })
    .on("click", '.fileupload-container [data-task="mail"]', function (e) {
        var url = window.location.origin + $(this).parents(".file-item").data("url");

        $message = $('<div class="clearfix">');

        $('<div class="form-group">')
            .append('<label class="control-label req">Mail Adres(ler)i</label>')
            .append('<input type="test" id="mail" data-item="emails" placeholder="email@hotmail.com;email@gmail.com"/>')
            .appendTo($message);

        $('<div class="form-group">')
            .append('<label class="control-label req">Konu</label>')
            .append('<input type="text" id="subject" class="form-control input-md" value="Dosya paylaşımı"/>')
            .appendTo($message);

        $('<div class="form-group">')
            .append('<label class="control-label req">Mesaj</label>')
            .append('<textarea id="message" class="form-control">Dosya paylaşımı</textarea>')
            .appendTo($message);

        BootstrapDialog.show({
            size: 'size-wide',
            type: 'type-info',
            title: "Dosya Paylaşımı",
            message: function (dialog) { return $message; },
            onshown: function (dialogRef) {

                var tagifyElem = dialogRef.$modalContent.find('[data-item="emails"]');

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
                    var email = "";
                    var emailData = $('#mail').data("tagify");
                    if (emailData && emailData.value) {
                        email = emailData.value.map(a => a.value).join(";");
                    } else {
                        MesajWarning("Lütfen geçerli mail adresi giriniz.", "Hatalı mail");
                        return;
                    }

                    var subject = $('#subject').val();
                    if (subject == "") {
                        MesajWarning("Lütfen geçerli bir konu giriniz.", "Hatalı konu");
                        return;
                    }

                    var message = $('#message').val();
                    if (message == "") {
                        MesajWarning("Lütfen geçerli bir mesaj giriniz.", "Hatalı mesaj");
                        return;
                    }

                    GetJsonDataFromUrl("/Files/Send", { url: url, email: email, subject: subject, message: message, attach: true, hasTemplate: true }, function (resp) {
                        feedback(resp.FeedBack);
                        if (resp.Result) {
                            dialog.close();
                        }
                    });
                }
            }]
        });

    })
    .on("click", '.fileupload-container [data-task="remove"]', function (e) {
        var input = $(this).parents(".fileupload-container").find(".form-control");
        var $ul = $(this).parents("ul");
        var $li = $(this).parents("li");
        var file = $li.data("file");

        if (file) {
            $li.remove();
            if ($ul.find(".file-item").length == 0) {
                $ul.find(".file-info").show();
            }
            input.val($ul.find('li.file-item').length > 0 ? "dosya var" : null);
            input.trigger("blur");
        } else {
            var id = $li.data("id");
            var table = $li.parents(".fileupload-container").data("table");
            GetDataFromUrl("/Files/Delete", { id: id, DataTable: table }, function (resp) {
                if (resp) {
                    $li.remove();
                    if ($ul.find(".file-item").length == 0) {
                        $ul.find(".file-info").show();
                    }
                    input.val($ul.find('li.file-item').length > 0 ? "dosya var" : null);
                    input.trigger("blur");
                }
            });
        }

    });
