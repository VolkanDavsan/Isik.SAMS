/*	
    Copyright (c) 2017 Infoline 
	Bağımlılıklar
    Jquery,JqueryUi,Bootstrap,BootstrapDialog,LiveQuery,Linq,OL
    Bağımlılıkların tamamını sayfanıza cagırınız
*/
var globalDefine = {
    projection: null,
    domains: {},
};

var AkilliHarita = function (elementId, options) {

    var $this = this;
    $this.map = null;
    $this.mapElement = $("#" + elementId);
    $this.defaultOptions = {
        altlik: "Default1",
        debugMode: true,
        projection: "EPSG:3857",
        center: [3911129.863295899, 4754994.655564245],
        //projection: "EPSG:4326",
        //center: [35, 39],
        zoom: 6,
        minZoom: 0,
        maxZoom: 22,
        uiAltlik: false,
        uiDefault: false,
        uiExportDocument: false,
        uiSearch: false,
        uiMinimap: false,
        uiScaleLine: false,
        uiMousePosition: false,
        uiMesurement: false,
        uiInfo: false,
        uiInfoContent: "T.C Çevre Bakanlığı SIS Projesi",
        ImportDragAndDrop: false,
    }

    $this.options = $.extend($this.defaultOptions, options);

    globalDefine.projection = $this.options.projection;

    if ($this.mapElement.length == 0) {
        console.warn('( #' + elementId + ' ) Geçerli bir element belirtilmedi'); return;
    }

    $this.style = {
        properties: {
            list: {
                Default: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.5)',
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ff0000',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ff0000',
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#ff0000',
                            width: 2
                        })
                    }),
                    zIndex: 0
                }),
                Hover: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.5)',
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#c6324a',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#c6324a',
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#c6324a',
                            width: 2
                        })
                    }),
                    zIndex: 2
                }),
                Selected: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.5)',
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#c6324a',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#c6324a',
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#c6324a',
                            width: 2
                        })
                    }),
                    zIndex: 1
                }),
                PermisionGeometryStyle: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ff0000',
                        width: 2,
                        // lineDash: [.5, 5]
                    })
                }),
                Vertex: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        fill: new ol.style.Fill({
                            color: '#ff0000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#ffffff',
                            width: 2
                        })
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffffff',
                        width: 2
                    }),
                    geometry: function (tFeature) {

                        var temps = [];

                        function setCoordinateTemps(items) {
                            if ($.isArray(items) == true) {
                                $.each(items, function (i, item) {
                                    if ($.isNumeric(item[0]) == true) {
                                        temps.push(item);
                                    } else {
                                        setCoordinateTemps(item);
                                    }
                                });
                            }
                        }

                        if (tFeature.getGeometry()["getCoordinates"]) {
                            setCoordinateTemps(tFeature.getGeometry().getCoordinates());
                        }


                        return new ol.geom.MultiPoint(temps);
                    },
                    zIndex: 100,
                }),
                Hidden: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: [255, 255, 255, 0],
                            width: 5,
                        })
                    }),
                    fill: new ol.style.Fill({
                        color: [255, 255, 255, 0]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [255, 255, 255, 0],
                        width: 0
                    })
                }),
                Measurement: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: [255, 255, 255, 0.2]
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#c6324a',
                        lineDash: [10, 10],
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: '#c6324a'
                        }),
                        fill: new ol.style.Fill({
                            color: [255, 255, 255, 0.2]
                        })
                    })
                }),
                DrawingInteraction: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: [255, 255, 255, 0.4]
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#0055ff',
                        width: 1
                    }),
                    image: new ol.style.Icon({
                        src: '/content/harita/img/crosshairsg.png',
                        opacity: 1,
                        anchor: [24, 24],
                        anchorXUnits: 'pixels',
                        anchorYUnits: 'pixels'
                    })
                })
            }
        },
        add: function (styleName, fillColor, strokeColor, strokeWidth, markerSrc, fillSrc, opacity, zIndex) {

            var _this = this;

            if (typeof (_this.properties.list[styleName]) != 'undefined') {
                return _this.properties.list[styleName];
            }

            var opacity = (!isNaN(parseFloat(opacity)) ? parseFloat(opacity) : 1);
            var strokeWidth = (!isNaN(parseFloat(strokeWidth)) ? parseFloat(strokeWidth) : 1);
            var strokeColor = $this.helper.ColorToObject(strokeColor ? strokeColor : $this.helper.RandomColor(0.5));
            var fillColor = $this.helper.ColorToObject(fillColor ? fillColor : $this.helper.RandomColor(1));

            var styleObject = {
                image: new ol.style.Circle({
                    radius: 7,
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: strokeWidth
                    }),
                    fill: new ol.style.Fill({
                        color: fillColor
                    })
                }),
                fill: new ol.style.FillPattern({
                    image: fillSrc,
                    color: "RGBA(" + fillColor.join(",") + ")"
                }),
                stroke: new ol.style.Stroke({
                    color: strokeColor,
                    width: strokeWidth
                }),
                zIndex: zIndex
            };

            _this.properties.list[styleName] = new ol.style.Style(styleObject);

            if (markerSrc && (markerSrc.indexOf(".png") > -1 || markerSrc.indexOf(".jpeg") > -1 || markerSrc.indexOf(".bmp") > -1 || markerSrc.indexOf(".jpg") > -1)) {

                var image = new Image();
                image.src = markerSrc;
                styleObject.image = new ol.style.Icon(({
                    src: image.src,
                    opacity: opacity,
                    anchor: [16, 16],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels'
                }));

                _this.properties.list[styleName] = new ol.style.Style(styleObject);

                image.onload = function () {
                    _this.properties.list[styleName].getImage().getAnchor().pop()
                    _this.properties.list[styleName].getImage().getAnchor().pop()
                    _this.properties.list[styleName].getImage().getAnchor().push(image.width / 2, image.height);
                }

                image.onerror = function () {
                    $this.helper.Message(markerSrc + " isimli resim bulunamadı.");
                }
            }

            return _this.properties.list[styleName];

        },
        addCustom: function (styleName, style) {

            var _this = this;


            if (!(style instanceof ol.style.Style)) {
                $this.helper.Message("Stil objesi hatalı.");
                return;
            }


            if (_this.properties.list[styleName]) {
                return _this.properties.list[styleName];
            }


            _this.properties.list[styleName] = style;

            return _this.properties.list[styleName];

        },
        remove: function (styleNames) {
            var _list = this.properties.list;
            var styleNames = $this.helper.GetValuesFromList(_list, styleNames);
            $.each(styleNames, function (i, item) {

                if (!$this.helper.GetValueFromList(_list, item)) {
                    $this.helper.Message('( ' + item + ' ) Belirtilen stil bulunamadı.'); return;
                }

                if (typeof (_list[item]) != 'undefined') {
                    delete _list[item];
                }

            });
        },
        get: function (styleNames) {
            var _this = this;
            var _list = _this.properties.list;
            var res = new Object();
            styleNames = $this.helper.GetValuesFromList(_list, styleNames);
            $.each($this.helper.GetValuesFromList(_list, styleNames), function (i, item) {
                if ($this.helper.GetValueFromList(_list, item)) {
                    res[item] = _list[item];
                }
            });
            return res;
        },
    };

    $this.layer = {
        properties: {
            defaults: {
                Default1: new ol.layer.Tile({ source: new ol.source.OSM({ url: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png" }), visible: false, name: "Default1", label: "Varsayılan Altlık", type: "XYZ" }),
                Default2: new ol.layer.Tile({ source: new ol.source.OSM({ url: "http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" }), visible: false, name: "Default2", label: "Uydu Altlık", type: "XYZ" }),
                //Default3: new ol.layer.Tile({ source: new ol.source.OSM({ url: "http://a.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png" }), visible: false, name: "Default3", label: "Açık Hava Altlık", type: "XYZ" }),
                //  Default4: new ol.layer.Tile({ source: new ol.source.BingMaps({ imagerySet: 'Road', key: 'Ar9Rr0ePw2B4fWVlawPODCPlMZe4SfyIsS4uAHFZz6TLgAOW6dopQ-pDtxNgBJcH' }), visible: false, name: "Default4", label: "Bing Yollar", preload: Infinity, type: "BingMaps" }),
                //  Default5: new ol.layer.Tile({ source: new ol.source.BingMaps({ imagerySet: 'Aerial', key: 'Ar9Rr0ePw2B4fWVlawPODCPlMZe4SfyIsS4uAHFZz6TLgAOW6dopQ-pDtxNgBJcH' }), visible: false, name: "Default5", label: "Bing Hava", preload: Infinity, type: "BingMaps" }),
                //  Default6: new ol.layer.Tile({ source: new ol.source.BingMaps({ imagerySet: 'AerialWithLabels', key: 'Ar9Rr0ePw2B4fWVlawPODCPlMZe4SfyIsS4uAHFZz6TLgAOW6dopQ-pDtxNgBJcH' }), visible: false, name: "Default6", label: "Bing Hava 2", preload: Infinity, type: "BingMaps" }),
            },
            list: {
            }
        },
        addVector: function (layerLabel, layerName, defaultStyleName, selectedStyleName, hoverStyleName, sourceParams) {

            var _this = this;
            var _list = _this.properties.list;

            if (typeof (layerName) != 'string' && layerName != "") {
                $this.helper.Message('(' + layerName + ') geçersiz layer isimlendirmesi.');
                return;
            }

            if (typeof (layerLabel) != 'string' && layerLabel != "") {
                $this.helper.Message('(' + layerLabel + ') geçersiz layer isimlendirmesi.');
                return;
            }

            if (_list.hasOwnProperty(layerName)) {
                return _list[layerName];
            }

            if (!$this.style.properties.list.hasOwnProperty(defaultStyleName)) {
                $this.helper.Message("default stil'i bulunmadı. (Default) stil'i katmananınıza atandı.");
                defaultStyleName = "Default";
            }

            if (!$this.style.properties.list.hasOwnProperty(selectedStyleName)) {
                $this.helper.Message("selected stil'i bulunmadı. (Selected) stil'i katmananınıza atandı.");
                selectedStyleName = "Selected";
            }

            if (!$this.style.properties.list.hasOwnProperty(hoverStyleName)) {
                $this.helper.Message("hover stil'i bulunmadı. (Hover) stil'i katmananınıza atandı.");
                hoverStyleName = "Hover";
            }

            _list[layerName] = new ol.layer.Vector({
                style: $this.style.properties.list[defaultStyleName],
                styleSelected: $this.style.properties.list[selectedStyleName],
                styleHover: $this.style.properties.list[hoverStyleName],
                type: "Vector",
                zIndex: 30,
                visible: true,
                label: layerLabel,
                name: layerName,
            });

            _list[layerName].on("propertychange", function (e) {

                if (e.key == "sourceParams") {

                    var params = $.extend({ url: null, data: {}, polygon: null, zoom: null }, e.target.get("sourceParams"));

                    var loadingstrategy = ol.loadingstrategy.all;

                    if (params.url && params.zoom && params.zoom.split(",").length == 2) {
                        loadingstrategy = function (e) {
                            var zooms = params.zoom.split(",");
                            var mapZoom = $this.map.getView().getZoom();
                            if (mapZoom >= parseFloat(zooms[0]) && mapZoom <= parseFloat(zooms[1])) {
                                return [e];
                            } else {
                                return [[null, null, null, null]];
                            }
                        }
                    }

                    var getData = function (source, params, projection) {

                        var infoElem = $('.info-control.ol-control .info-content');

                        var sender = $.ajax({
                            url: params.url,
                            data: params.data,
                            type: "POST",
                            beforeSend: function () {

                                infoElem.empty()
                                    .append('<div class="pull-left"><strong>' + layerLabel + '</strong> katmanı verisi yükleniyor.Lütfen bekleyiniz..</div>')
                                    .append('<progress style="margin: 12px 10px 10px 10px"  class="pull-left" value="0" max="100" />')
                                    .append('<em class="pull-left"></em>');

                            },
                            xhr: function () {

                                var xhr = new window.XMLHttpRequest();

                                xhr.addEventListener("progress", function (evt) {
                                    if (evt.lengthComputable) {
                                        var percentComplete = evt.loaded / evt.total;
                                        infoElem.find('progress').attr("value", Math.round(percentComplete * 100));
                                        infoElem.find('em').text(Math.round(percentComplete * 100) + " % ");
                                    }
                                }, false);

                                return xhr;

                            },
                            success: function (data) {

                                try {
                                    var features = new ol.format.GeoJSON().readFeatures(data, {
                                        featureProjection: projection
                                    });

                                    if (features) {
                                        source.addFeatures(features);

                                        if (features.length != 0 && features.length <= params.data.take) {
                                            params.data.skip = params.data.skip + params.data.take;
                                            getData(source, params, projection);
                                        }

                                    }
                                } catch (e) {

                                }
                            },
                            error: function () {
                                //getData(skip, take);
                            },
                            complete: function () {
                                infoElem.html('<div><strong>' + layerLabel + '</strong> ' + source.getFeatures().length + ' Çizim Mevcut </div>');
                            }
                        });
                    }

                    var source = new ol.source.Vector({
                        strategy: loadingstrategy,
                        loader: function (extent, resolution, projection) {

                            if (typeof (_this.properties.list[layerName].get("active")) === 'boolean' && !_this.properties.list[layerName].get("active")) {
                                return;
                            }


                            if (params.url == null || extent[0] == null) { return; }

                            if (params.polygon) {

                                var extentGeoJSON = $this.helper.ExtentToFeature(extent).getGeoJSON();

                                try {
                                    var loadPolygonFeature = $this.helper.SQLtoFeature(params.polygon).getGeoJSON();
                                    var extentGeoJSON = turf.intersect(loadPolygonFeature, extentGeoJSON);
                                    if (extentGeoJSON == null) return;
                                } catch (e) {
                                    return;
                                }

                                var tempGeoJSON = source.get("tempGeoJSON");
                                if (tempGeoJSON) {
                                    try {
                                        var extentGeoJSON = turf.difference(extentGeoJSON, tempGeoJSON);
                                        var tempGeoJSON = turf.union(tempGeoJSON, extentGeoJSON)
                                        if (extentGeoJSON == null) return;
                                        source.set("tempGeoJSON", tempGeoJSON);
                                    } catch (e) {
                                        return;
                                    }
                                } else {
                                    source.set("tempGeoJSON", extentGeoJSON);
                                }

                                var extentFeature = $this.helper.GeoJSONtoFeature(extentGeoJSON);
                                if (extentFeature == null) return;

                                params.data["extent"] = extentFeature.getSQL();

                            }

                            params.data.skip = 0;
                            params.data.take = 500;

                            getData(this, params, projection);
                        }

                    });

                    source.on("addfeature", function (e) {

                        var item = e.feature;

                        if (!item) return;

                        if (!item.getId()) {
                            item.setId($this.helper.NewGuid());
                        }

                        if (!$this.feature.properties.hasOwnProperty(item.getId())) {
                            $this.feature.properties.list[item.getId()] = item;
                        }

                        item.set("layer", layerName);
                        item.set('hidden', false);
                        item.set('vertex', false);
                        item.set('select', false);
                        item.set('hover', false);

                        item.on("propertychange", function (e) {

                            var styles = [];
                            var feature = e.target;
                            var layer = $this.layer.get(layerName)[layerName];

                            var styleHidden = $this.style.get('Hidden')['Hidden'];
                            var styleVertex = $this.style.get('Vertex')['Vertex'];


                            var styleSelected = feature.get("styleSelected") ? (feature.get("styleSelected") instanceof ol.style.Style ? feature.get("styleSelected") : ($this.style.get(feature.get("styleSelected"))[feature.get("styleSelected")] ? $this.style.get(feature.get("styleSelected"))[feature.get("styleSelected")] : $this.style.properties.list[selectedStyleName])) : $this.style.properties.list[selectedStyleName];


                            var styleHover = feature.get("styleHover") ? (feature.get("styleHover") instanceof ol.style.Style ? feature.get("styleHover") : ($this.style.get(feature.get("styleHover"))[feature.get("styleHover")] ? $this.style.get(feature.get("styleHover"))[feature.get("styleHover")] : $this.style.properties.list[hoverStyleName])) : $this.style.properties.list[hoverStyleName];

                            var style = feature.get("style") ? (feature.get("style") instanceof ol.style.Style ? feature.get("style") : ($this.style.get(feature.get("style"))[feature.get("style")] ? $this.style.get(feature.get("style"))[feature.get("style")] : $this.style.properties.list[defaultStyleName])) : $this.style.properties.list[defaultStyleName];

                            if (e.key == "select" || e.key == "hover" || e.key == 'vertex' || e.key == 'style' || e.key == 'styleHover' || e.key == 'styleSelected' || e.key == 'hidden' || e.key == "label") {

                                if (feature.get('hidden')) {

                                    styles.push(styleHidden);

                                } else {

                                    if ((feature.get("hover") || feature.get("select"))) {
                                        styles.push(feature.get("hover") ? styleHover : styleSelected);
                                    } else {
                                        styles.push(style);
                                    }

                                    if (feature.get('vertex')) {
                                        styles.push(styleVertex);
                                    }

                                    if (feature.get("label")) {
                                        var fillColor = styles[0].getFill().getColor();
                                        var strokeColor = styles[0].getStroke().getColor();
                                        styles.push(new ol.style.Style({
                                            text: new ol.style.Text({
                                                text: feature.get("label"),
                                                scale: 1.0,
                                                fill: strokeColor,
                                                stroke: fillColor
                                            }),
                                            zIndex: 2
                                        }))
                                    }
                                }

                                feature.setStyle(styles);
                            }
                        });

                    });

                    source.on("removefeature", function (e) {
                        var item = e.feature;
                        delete $this.feature.properties.list[item.getId()];
                    });


                    e.target.setSource(source);

                }

            });
            _list[layerName].set("sourceParams", sourceParams);
            _list[layerName].dispatchEvent({ type: "propertychange", key: "sourceParams" });

            $this.map.addLayer(_list[layerName]);

            return _list[layerName];

        },
        addTile: function (layerLabel, layerName, layerSourceUrl) {
            var _this = this;
            var _list = _this.properties.list;

            layerName = layerName.trim();

            layerSourceUrl = layerSourceUrl.trim();

            if (_list.hasOwnProperty(layerName)) {
                $this.helper.Message('(' + layerName + ') isminde bir layer zaten mevcut.');
                return;
            }

            if (typeof (layerName) != 'string' || layerName == '') {
                $this.helper.Message('(' + layerName + ') geçersiz layer isimlendirmesi.');
                return;
            }

            if (typeof (layerSourceUrl) != 'string' || layerSourceUrl == '') {
                $this.helper.Message('(' + layerName + ') geçerli bir kaynak urli Giriniz..');
                return;
            }


            _list[layerName] = new ol.layer.Tile({
                source: new ol.source.OSM({
                    url: layerSourceUrl,
                    crossOrigin: "*"
                }),
                type: "Tile",
                zIndex: 10,
                visible: false,
                label: layerLabel,
                name: layerName
            });


            $this.map.addLayer(_list[layerName]);

            return _list[layerName];

        },
        addCustom: function (layerLabel, layerName, layerObject) {

            var _this = this;
            var _list = _this.properties.list;

            layerName = typeof (layerName) == "string" ? layerName.trim() : layerName;

            if (typeof (layerName) != 'string' || layerName == '') {
                $this.helper.Message('(' + layerName + ') geçersiz layer isimlendirmesi.'); return;
            }

            if (typeof (layerLabel) != 'string' || layerLabel == '') {
                $this.helper.Message('(' + layerLabel + ') geçersiz layer isimlendirmesi.'); return;
            }

            if (_list.hasOwnProperty(layerName)) {
                $this.helper.Message('(' + layerName + ') isminde bir layer zaten mevcut.'); return;
            }

            if (typeof (layerObject) != 'object') {
                $this.helper.Message('Geçersiz layer objesi'); return;
            }

            layerObject.set("label", layerLabel);
            layerObject.set("name", layerName);


            _list[layerName] = layerObject;
            $this.map.addLayer(_list[layerName]);

            return _list[layerName];

        },
        addTileCustom: function (layerLabel, layerName, layerType, layerUrl, layerParams, layerAuth) {

            if (layerParams) {

                var layers = [];
                var layersData = JSON.parse(layerParams);

                $.each(layersData, function (i, data) {

                    if (layerType == "WFS") {

                        var vectorSource = new ol.source.Vector({
                            loader: function (extent, resolution, projection) {
                                data.params["bbox"] = extent.join(',') + "," + globalDefine.projection;
                                data.params["srsname"] = "EPSG:4326";
                                var sender = $.ajax({
                                    url: layerUrl,
                                    data: data.params,
                                    beforeSend: function (request) {
                                        if (layerAuth && layerAuth != "") {
                                            request.setRequestHeader("Authority", "Basic " + layerAuth);
                                        }
                                    },
                                    success: function (resp) {

                                        try {

                                            var reader = new ol.format.WFS();

                                            if (data.params["outputFormat"] == "kml") {
                                                reader = new ol.format.KML();
                                            } else if (data.params["outputFormat"] == "json" || data.params["outputFormat"] == "geojson" || data.params["outputFormat"] == "application/json") {
                                                reader = new ol.format.GeoJSON();
                                            }

                                            var features = reader.readFeatures(resp, {
                                                dataProjection: "EPSG:4326",
                                                featureProjection: projection
                                            });

                                            if (features && features.length > 0) {
                                                vectorSource.addFeatures(features);
                                            }

                                        } catch (e) {

                                        }

                                    }
                                });
                            },
                            strategy: ol.loadingstrategy.bbox
                        });

                        layers.push(new ol.layer.Vector({
                            source: vectorSource,
                            type: layerType,
                            zIndex: 20,
                            visible: false,
                            name: data.title,
                            style: $this.style.add(layerName + Math.random())
                        }));

                    } else {

                        data["url"] = layerUrl;
                        data["crossOrigin"] = "*";
                        var layerParentType = "Tile";
                        if (layerType.indexOf("Image") > -1) {
                            layerParentType = "Image";
                        }



                        layers.push(new ol.layer[layerParentType]({
                            source: new ol.source[layerType](data),
                            type: layerType,
                            zIndex: 20,
                            visible: false,
                            name: data.title
                        }));

                    }

                });


                if (layerAuth && layerAuth != "") {

                    try {
                        var urlArr = layerUrl.split("://");
                        var url = urlArr.length == 1 ? (atob(layerAuth) + '@' + urlArr[0]) : (urlArr[0] + "://" + atob(layerAuth) + '@' + urlArr[1]);
                        var url = url + (url.indexOf("?") == -1 ? "?" : "&") + "service=WMS&request=GetCapabilities"

                        $("<iframe />")
                            .hide()
                            .attr("src", url)
                            .on("load", function () {
                                $(this).remove();
                            })
                            .on("error", function () {
                                //  console.clear();
                            })
                            .appendTo($this.mapElement);


                    } catch (e) {

                    }
                }

                $this.layer.addCustom(layerLabel, layerName, new ol.layer.Group({
                    layers: layers,
                    type: "Group",
                    zIndex: 20,
                    visible: false
                }));


            } else {

                $this.layer.addCustom(layerLabel, layerName, new ol.layer.Tile({
                    source: new ol.source[layerType]({
                        url: layerUrl
                    }),
                    type: layerType,
                    zIndex: 10,
                    visible: false
                }));

            }

            return $this.layer.get(layerName)[layerName];

        },
        setVisible: function (layerNames, durum) {

            var _this = this;
            var _list = _this.properties.list;
            var layerNames = $this.helper.GetValuesFromList(_list, layerNames);

            if (typeof (durum) != 'boolean') {
                $this.helper.Message("Lütfen geçerli bir durum parametresi giriniz.."); return;
            }

            layerNames.forEach(function (e, i) {
                if (!_list.hasOwnProperty(e)) {
                    $this.helper.Message('(' + e + ') isminde bir layer bulunamadı.');
                    return;
                }
                if (_list[e].get("type") == "XYZ" || _list[e].get("type") == "BingMaps") {
                    $this.map.removeLayer(_list[e]);
                    if (durum) {
                        $this.map.addLayer(_list[e]);
                    }
                } else if (_list[e].get("type") == "Group") {
                    _list[e].getLayers().forEach(function (layer) {
                        layer.setVisible(true);
                    });
                }
                _list[e].setVisible(durum);
            });

        },
        setZindex: function (layerNames, index) {

            var _this = this;
            var _list = _this.properties.list;
            var layerNames = $this.helper.GetValuesFromList(_list, layerNames);
            if (typeof (index) != 'number') {
                $this.helper.Message("Lütfen geçerli bir index parametresi Giriniz..");
                return;
            }

            layerNames.forEach(function (e, i) {

                if (!_list.hasOwnProperty(e)) {
                    $this.helper.Message('(' + e + ') isminde bir layer bulunamadı.'); return;
                }
                _list[e].setZIndex(index);
            });

        },
        panTo: function (layerName) {

            var _this = this;
            var layer = _this.get(layerName)[layerName];

            if (!layer) return;

            if (layer instanceof ol.layer.Vector) {

                if (layer.getSource().getFeatures().length > 0) {
                    $this.helper.PanTo(layer.getSource().getExtent());
                } else {
                    if (layer.get("permissionGeometry")) {
                        var feature = $this.helper.SQLtoFeature(layer.get("permissionGeometry"));
                        $this.helper.PanTo(feature.getGeometry().getExtent());
                    }
                }
                return;
            }

            if (layer.get("boundingbox") && layer.get("boundingbox").length == 4) {
                $this.helper.PanTo(layer.get("boundingbox"));
            }
        },
        remove: function (layerNames) {

            var $list = this.properties.list;

            var layerNames = $this.helper.GetValuesFromList($list, layerNames);

            layerNames.forEach(function (e, i) {
                if (!$list.hasOwnProperty(e)) {
                    $this.helper.Message('(' + e + ') isminde bir layer bulunamadı.');
                    return;
                }

                if ($list[e] && $list[e]["getSource"] && $list[e]["getSource"]["clear"]) {
                    $list[e].getSource().clear();
                };
                $this.map.removeLayer($list[e])
                delete $list[e];
            });

        },
        get: function (layerNames) {
            var res = new Object();
            var $list = this.properties.list;
            var layerNames = $this.helper.GetValuesFromList($list, layerNames);
            layerNames.forEach(function (e, i) {
                if (!$list.hasOwnProperty(e)) {
                    //$this.helper.Message('(' + e + ') isminde bir layer bulunamadı.');
                    return;
                }
                res[e] = $list[e];
            });
            return res;
        },
        createControl: function (id, label, IconClass, layerNames) {
            var IconClass = (IconClass ? IconClass : "fa fa-th");
            var label = (label ? label : "Katmanlar");
            var panel = $this.panel.add(id, label, IconClass);

            /*Arama*/
            if (panel.content.children('input[name="search"]').length == 0) {
                var input = $('<input type="text" name="search" class="form-control input-md input-search"  placeholder="Arama için katman ismi girin." />')
                       .on("keyup", function (e) {
                           var _this = $(this);
                           window.setTimeout(function () {
                               var value = _this.val();
                               _this.siblings("ul").find("li").each(function () {
                                   if ($(this).find("div").find("span").text().split("İ").join("I").toLocaleUpperCase().indexOf(value.split("İ").join("I").toLocaleUpperCase()) > -1) {
                                       $(this).removeClass("hide");
                                   } else {
                                       $(this).addClass("hide");
                                   }
                               });
                           }, 200);
                       });

                panel.content.find('ul').before(input);

            }
            /*Arama*/

            if (!panel) {
                $this.helper.Message("Layer paneli oluşturmak için geçerli bir id giriniz.");
                return;
            }
            var $list = this.properties.list;
            layerNames.forEach(function (e, i) {

                if (!$list.hasOwnProperty(e)) {
                    return false;
                }

                var layerId = e;
                var layer = $list[layerId];

                if (!layer) {
                    return;
                }

                var layerType = layer.get("type");
                var layerLabel = layer.get("label");
                var layerIcon = layer.get("icon");
                var layerEditable = layer.get("editable");


                var $nav = $('<div class="layerNav clearfix"/>');
                var $content = $('<div id="settings-' + layerId + '" class="layerContent clearfix" style="display:none;"/>');
                var $container = $('<li class="layerContainer" data-layerid="' + layerId + '"/>');

                $('<img/>')
                    .attr('src', layerIcon)
                    .addClass('pull-left')
                    .css({ display: (layerIcon ? "block" : "none") })
                    .appendTo($nav);

                $('<span/>')
                    .addClass('pull-left')
                    .text(layerLabel)
                    .attr("title", layerLabel)
                    .attr("data-placement", "top")
                    .on("click", function (elem) {

                        var _this = $(this);
                        var layerEditable = layer.get("editable");
                        _this.siblings(layerType == "Vector" && layerEditable ? '[data-task="load"]' : '[data-task="show"]').trigger("click");

                    })
                    .appendTo($nav);


                $('<a/>')
                    .attr('data-task', 'load')
                    .attr("title", "Katman Yükle/Aktif Yap")
                    .attr("data-placement", "top")
                    .addClass('pull-right')
                    .append('<i style="margin-top: 4px;" class="fa fa-square-o"></i>')
                    .css({ display: (layerType == "Vector" && layerEditable ? "block" : "none") })
                    .on("click", function (elem) {
                        var _this = $(this);

                        _this.parents('li').siblings().removeClass("active");
                        _this.parents('li').addClass("active");
                        _this.parents('ul').find('[data-task="load"] i').attr("class", "fa fa-square-o");
                        _this.find('i').attr("class", "fa fa-check-square-o");
                        _this.parents("li").siblings().find(".layerContent").slideUp()
                        _this.parents("li").find(".layerContent").slideDown();
                        _this.siblings('[data-task="snap"],[data-task="vertex"],[data-task="show"],[data-task="pan"],[data-task="setting"]').show();
                        if (!layer.getVisible()) {
                            _this.siblings('[data-task="show"]').trigger("click");
                        }
                        $this.mapElement.trigger("change:layer", layer);
                        $this.map.getLayers().forEach(function (ly) {
                            ly.set("active", ly.get("name") == layer.get("name"));
                        });

                    })
                    .appendTo($nav);

                $('<a/>')
                    .attr("data-task", "show")
                    .addClass("pull-right")
                    .attr("title", "Katman Gizle/Göster")
                    .attr("data-placement", "top")
                    .append('<i class="' + (layer.getVisible() ? "fa fa-eye" : "fa fa-eye-slash") + '"></i>')
                    .css({ display: ((layerType == "Group") || (layerType == "Vector" && layerEditable) ? "none" : "block") })
                    .on("click", function (elem) {
                        var _this = $(this);
                        var visible = layer.getVisible();
                        layer.setVisible(!visible);
                        $(_this.siblings('[data-task="show"]').find("i").context).find("i").attr("class", !visible ? "fa fa-eye" : "fa fa-eye-slash");
                        return false;
                    })
                    .appendTo($nav);

                $('<a/>')
                    .attr("data-task", "snap")
                    .addClass("pull-right")
                    .attr("title", "Katman Snap Aktif/Pasif")
                    .attr("data-placement", "top")
                    .append('<i class="fa fa-plug"></i>')
                    .hide()
                    .on("click", function (elem) {
                        var _this = $(this);

                        _this.toggleClass("active");
                        layer.set("snap", _this.hasClass("active"));
                        $this.drawing.properties.snapingFeatures.clear();
                        $this.map.getLayers().getArray().forEach(function (item) {
                            if (item.get("type") == "Vector" && item.get("snap")) {
                                $this.drawing.properties.snapingFeatures.extend(item.getSource().getFeatures());
                            }
                        });
                        return false;

                    })
                    .appendTo($nav);


                $('<a/>')
                    .attr("data-task", "vertex")
                    .addClass("pull-right")
                    .attr("title", "Katman Vertex Aktif/Pasif")
                    .attr("data-placement", "top")
                    .append('<i class="flaticon-multimedia-1"></i>')
                    .hide()
                    .on("click", function (elem) {
                        var _this = $(this);
                        _this.toggleClass("active");
                        var value = _this.hasClass("active");
                        layer.set("vertex", value);
                        layer.getSource().forEachFeature(function (feature) {
                            feature.set('vertex', value);
                        });
                        return false;
                    })
                    .appendTo($nav);


                $('<a/>')
                    .attr("data-task", "pan")
                    .addClass("pull-right")
                    .attr("title", "Katman odaklan")
                    .attr("data-placement", "top")
                    .append('<i class="fa fa-paper-plane"></i>')
                    .hide()
                    .on("click", function (elem) {
                        $this.layer.panTo(layer.get("name"));
                        layer.changed();
                        return false;
                    })
                    .appendTo($nav);

                $('<a/>')
                    .append('<i class="fa fa-cogs"></i>')
                    .attr("data-task", "setting")
                    .attr('data-toggle', 'slide')
                    .attr("title", "Katman Ayarları")
                    .attr("data-placement", "top")
                    .attr('data-target', '#settings-' + layerId)
                    .addClass('pull-right')
                    .css({ display: (layerType == "Vector" && layerEditable ? "none" : "block") })
                    .on("click", function (e) {
                        e.preventDefault();
                        $('#settings-' + layerId).slideToggle();
                    })
                    .appendTo($nav);

                $('<div class="form-group clearfix"/>')
                    .append('<label class="control-label" style="width:100%;"><strong>KATMAN AYARLARI</strong></label>')
                    .appendTo($content);

                var $input = $("<input/>")
                        .attr("type", "range")
                        .attr("min", "0")
                        .attr("max", "1")
                        .attr("step", "0.1")
                        .attr("value", layer.getOpacity())
                        .on("change", function (e) {
                            layer.setOpacity($(this).val());
                        });

                $('<div class="form-group clearfix"/>')
                    .append('<label class="control-label">Saydamlık </label>')
                    .append($('<div class="control-input"/>').append($input))
                    .appendTo($content);



                if (layerType == "Group") {

                    var groupContent = $('<div class="form-group clearfix" style="padding: 10px 5px 5px 5px;"/>')
                             .append('<label class="control-label pull-left" style="width:100%;"><strong>TÜM KATMANLAR</strong></label></a>')


                    $('<a/>')
                        .addClass("pull-right")
                        .attr("title", "Tüm Katmanları Göster/Gizle")
                        .attr("data-placement", "top")
                        .attr("data-id", layer.get("name"))
                        .append('<i style="font-size: 13px;" class="' + (layer.getVisible() ? "fa fa-eye" : "fa fa-eye-slash") + '"></i>')
                        .on("click", function (e) {
                            e.preventDefault();
                            var _this = $(this);
                            var visible = layer.getVisible();
                            layer.setVisible(!visible);
                            _this.find('i').attr("class", !visible ? "fa fa-eye" : "fa fa-eye-slash");
                            $.each(layer.getLayers().getArray(), function (i, elem) {
                                elem.setVisible(!visible);
                                $('[data-id="' + elem.get("name") + '"]').find("i").attr("class", !visible ? "fa fa-eye" : "fa fa-eye-slash");
                            });

                        })
                        .appendTo(groupContent.find("label"));

                    groupContent.appendTo($content);


                    $.each(layer.getLayers().getArray(), function (i, elem) {
                        var $showButton = $('<a/>')
                            .addClass("pull-right")
                            .attr("title", "Alt Katman Göster")
                            .attr("data-placement", "top")
                            .attr("data-id", elem.get("name"))
                            .append('<i class="' + (elem.getVisible() ? "fa fa-eye" : "fa fa-eye-slash") + '"></i>')
                            .on("click", function (e) {
                                e.preventDefault();
                                var _this = $(this);
                                var visible = elem.getVisible();
                                elem.setVisible(!visible);
                                _this.find('i').attr("class", !visible ? "fa fa-eye" : "fa fa-eye-slash");

                                var layerStatus = (layer.getLayers().getArray().map(function (elem) { return elem.getVisible(); }).indexOf(true) > -1);

                                layer.setVisible(layerStatus);
                                $('[data-id="' + layer.get("name") + '"]').find("i").attr("class", layerStatus ? "fa fa-eye" : "fa fa-eye-slash");

                            });


                        $('<div class="form-group clearfix"/>')
                            .append('<label class="control-label" style="width:85%;">' + elem.get("name") + '</label>')
                            .append($('<div class="control-input"  style="width:15%;"/>').append($showButton))
                            .appendTo($content);
                    });

                }


                if (layerType == "Vector" && layerEditable) {

                    var $input = $("<input/>")
                     .attr("type", "color")
                     .attr("value", $this.helper.ObjectToHex($this.helper.ColorToObject(layer.getStyle().getFill().getColor())))
                     .on("change", function (e) {

                         if (layer.getStyle().getFill()["setFillColor"]) {
                             layer.getStyle().getFill().setFillColor("RGBA(" + $this.helper.ColorToObject($(this).val(), 0.4).join(",") + ")");
                         } else {
                             layer.getStyle().getFill().setColor("RGBA(" + $this.helper.ColorToObject($(this).val(), 0.4).join(",") + ")");
                         }

                         window.setTimeout(function () {
                             layer.changed();
                         }, 200);
                     });

                    $('<div class="form-group clearfix"/>')
                        .append('<label class="control-label">Katman Rengi </label>')
                        .append($('<div class="control-input"/>').append($input))
                        .appendTo($content);

                    var $input = $("<input/>")
                          .attr("type", "color")
                          .attr("value", $this.helper.ObjectToHex(layer.getStyle().getStroke().getColor()))
                          .on("change", function (e) {
                              layer.getStyle().getStroke().setColor($this.helper.ColorToObject($(this).val(), 0.9));
                              layer.changed();
                          });

                    $('<div class="form-group clearfix"/>')
                        .append('<label class="control-label">Kenarlık Rengi </label>')
                        .append($('<div class="control-input"/>').append($input))
                        .appendTo($content);

                    var $input = $("<input/>")
                       .attr("type", "range")
                       .attr("min", "0.5")
                       .attr("max", "10")
                       .attr("step", "0.5")
                       .attr("value", layer.getStyle().getStroke().getWidth())
                       .on("change", function (e) {
                           layer.getStyle().getStroke().setWidth($(this).val());
                           layer.changed();
                       })

                    $('<div class="form-group clearfix"/>')
                        .append('<label class="control-label">Kenarlık Kalınlığı </label>')
                        .append($('<div class="control-input"/>').append($input))
                        .appendTo($content);

                    /*Style*/


                    /*Yeni İşlemler*/

                    var extras = $('<div data-selector="extras" class="form-group clearfix"/>')


                    $('<button/>')
                        .addClass("btn btn-sm btn-default")
                        .append('<i class="fa fa-cloud-download"></i>')
                        .attr("data-task", "export")
                        .attr('title', 'Dışarıya Çıkart')
                        .attr('data-placement', 'top')
                        .on("click", function () {

                            var body = $('<form class="form-horizantal clearfix"/>');

                            var selectbox = $('<select class="form-control" name="type"/>')
                                 .append('<option value="">Lütfen çıktı formatı seçiniz</option>')
                                 .append('<option value="GeoJSON">GEOJSON</option>')
                                 .append('<option value="KML">KML</option>')


                            $('<div class="form-group"/>')
                               .append('<label class="control-label">Çıktı Formatı</label>')
                               .append(selectbox)
                               .appendTo(body);



                            var selectbox = $('<select name="proj" class="form-control input-md"/>').on("change", function (e) {
                                $(this).parents("form").find('[name="srs"]').val(projlist[$(this).val()].wkt);
                            });

                            selectbox.append('<option value="">Kayıtlı Projeksiyonlar</option>');
                            projlist.forEach(function (e, i) {
                                var selected = e.code == "4326" ? "selected" : "unselected";
                                selectbox.append('<option ' + selected + ' value="' + i + '">EPSG:' + e.code + '</option>');
                            });

                            $('<div class="form-group"/>')
                               .append('<label class="control-label">Çıktı Projeksiyonu</label>')
                               .append(selectbox)
                               .appendTo(body);

                            $('<div class="form-group"/>')
                                .append('<textarea style="height: 160px;" placeholder="Kaynak projeksiyonu seçiniz." name="srs" class="form-control input-md"></textarea>')
                                .appendTo(body);


                            BootstrapDialog.show({
                                size: BootstrapDialog.SIZE_WIDE,
                                draggable: true,
                                resizable: true,
                                title: layer.get("label") + ' Katmanı Dışarı Aktarım Ayarları',
                                message: body,
                                onshow: function (dialog) {
                                    dialog.$modalBody.find('[name="proj"]').trigger("change");
                                },
                                buttons: [{
                                    label: 'İptal Et',
                                    cssClass: 'btn-danger pull-left',
                                    action: function (dialog) {
                                        dialog.close();
                                    }
                                }, {
                                    label: 'Devam Et',
                                    cssClass: 'btn-primary  pull-right save',
                                    action: function (dialog) {

                                        var srs = dialog.$modalBody.find('[name="srs"]').val();
                                        var type = dialog.$modalBody.find('[name="type"]').val();

                                        if (type == "") {
                                            $this.helper.Message("Çıktı formatı seçmeden işleme devam edemessiniz.", "warning", true);
                                            return false;
                                        }

                                        if (srs == "") {
                                            $this.helper.Message("Çıktı projeksiyonu seçmeden işleme devam edemessiniz.", "warning", true);
                                            return false;
                                        }


                                        var featureArr = [];
                                        layer.getSource().forEachFeature(function (feature) {
                                            if (!feature.get("hidden")) {
                                                var clone = feature.clone();
                                                clone.unset("hidden", false);
                                                clone.unset("hover", false);
                                                clone.unset("style", false);
                                                clone.unset("label", false);
                                                clone.unset("select", false);
                                                clone.unset("vertex", false);
                                                clone.unset("layer", false);
                                                clone.setId(feature.getId());
                                                clone.setStyle(null);
                                                featureArr.push(clone);
                                            }
                                        });


                                        if (featureArr.length == 0) {
                                            $this.helper.Message("Çıktı edilecek çizim bulunamadı.", "warning", true);
                                            return false;
                                        }


                                        var fileName = 'CSB-' + new Date().toLocaleString().split(" ").join("-").split(":").join("-").split(".").join("-");

                                        var blob = new Blob([new ol.format[type]().writeFeatures(featureArr, {
                                            featureProjection: $this.map.getView().getProjection().getCode()
                                        })], { type: "text/plain" });

                                        saveAs(blob, fileName + "." + type.toLowerCase());


                                    }
                                }]

                            });

                        })
                        .appendTo(extras);



                    extras.appendTo($content);
                }

                $container
                    .append($nav)
                    .append($content)
                    .appendTo(panel.content.find("ul"));

            });

            return panel;

        }
    };

    $this.overlay = {
        properties: {
            list: {}
        },
        add: function (overlayName, content, cssClass, positioning, position, offset) {
            var _this = this;
            var _list = _this.properties.list;

            overlayName = overlayName.trim();
            content = typeof (content) == 'undefined' || content == null ? '' : content;
            cssClass = typeof (cssClass) == 'undefined' || cssClass == null ? '' : cssClass;

            if (typeof (overlayName) != 'string' || overlayName == '') {
                $this.helper.Message('(' + overlayName + ') Geçersiz overlay isimlendirmesi. Örnek : BenimOverlay'); return;
            }

            if (_list.hasOwnProperty(overlayName)) {
                return _list[overlayName];
            }

            var element = document.createElement('div');

            element.setAttribute("id", overlayName);
            element.innerHTML = content;
            element.className = cssClass
            _list[overlayName] = new ol.Overlay({
                element: element,
                positioning: positioning,
                position: position,
                offset: offset,
                stopEvent: false
            });

            $this.map.addOverlay(_list[overlayName]);

            return _list[overlayName];

        },
        setPosition: function (overlayName, position) {
            var _this = this;
            var _list = _this.properties.list;

            if (!_list.hasOwnProperty(overlayName)) {
                //  $this.helper.Message('(' + overlayName + ') geçersiz overlay.');
                return;
            }

            _list[overlayName].setPosition(position);

        },
        setContent: function (overlayName, content) {
            var _this = this;
            var _list = _this.properties.list;

            if (!_list.hasOwnProperty(overlayName)) {
                //  $this.helper.Message('(' + overlayName + ') geçersiz overlay.');
                return;
            }

            _list[overlayName].get("element").innerHTML = content;

        },
        setVisible: function (overlayName, visibility) {
            var _this = this;
            var _list = _this.properties.list;

            if (!_list.hasOwnProperty(overlayName)) {
                //  $this.helper.Message('(' + overlayName + ') geçersiz overlay.');
                return;
            }

            $this.mapElement.find("#" + overlayName).css({ opacity: visibility ? 1 : 0 });

        },
        remove: function (overlayNames) {

            var $list = this.properties.list;

            var overlayNames = $this.helper.GetValuesFromList($list, overlayNames);

            overlayNames.forEach(function (e, i) {

                if (!$list.hasOwnProperty(e)) {
                    //  $this.helper.Message('(' + e + ') isminde bir overlay bulunamadı.'); return;
                }

                $this.map.removeOverlay($list[e])

                delete $list[e];

            });
        },
        get: function (overlayNames) {

            var res = new Object();
            var $list = this.properties.list;

            var overlayNames = $this.helper.GetValuesFromList($list, overlayNames);

            overlayNames.forEach(function (e, i) {
                if (!$list.hasOwnProperty(e)) {
                    $this.helper.Message('(' + e + ') isminde bir overlay bulunamadı.');
                    return;
                }
                res[e] = $list[e];
            });

            return res;

        }
    };

    $this.feature = {
        properties: {
            list: {},
            interactionSelect: null,
            interactionHover: null,
        },
        add: function (layerName, featureName, sqlStringOrGeoJSONorFeature) {

            var _this = this;
            var _list = _this.properties.list;
            var _layerlist = $this.layer.get();

            if (_list.hasOwnProperty(featureName)) {
                return _list[featureName];
            }

            if (typeof (layerName) != 'string' || layerName == '') {
                $this.helper.Message('Geçersiz katman isim girişi...'); return;
            }

            if (!$this.helper.GetValueFromList(_layerlist, layerName)) {
                $this.helper.Message('( ' + layerName + ' ) Katman bulunamadı'); return;
            }

            if ($this.helper.GetValueFromList(_list, featureName)) {
                $this.helper.Message('( ' + featureName + ' ) Bu isim ile daha önceden feature yaratılmış.'); return;
            }



            if (sqlStringOrGeoJSONorFeature instanceof ol.Feature) {
                var feature = sqlStringOrGeoJSONorFeature;
            } else {
                var feature = $this.helper.SQLtoFeature(sqlStringOrGeoJSONorFeature);
                if (feature == null) {
                    feature = $this.helper.GeoJSONtoFeature(sqlStringOrGeoJSONorFeature);
                }
            }


            if (!feature) {
                $this.helper.Message('Doğru bir feature kaynağı girilmedi.'); return;
            }


            var source = _layerlist[layerName].getSource();

            _list[featureName] = feature;
            feature.setId(featureName);
            source.addFeature(feature);
            return _list[featureName];

        },
        setStyle: function (featureName, styleName) {

            var _featureList = $this.feature.properties.list;
            var _styleList = $this.style.properties.list;

            if (typeof (featureName) != 'string' || typeof (styleName) != 'string' || featureName == '' || styleName == '') {
                $this.helper.Message('Feature veya Stil ismi string ifade ile girilmedi.'); return;
            }

            if (!$this.helper.GetValueFromList(_featureList, featureName)) {
                $this.helper.Message('( ' + featureName + ' ) Belirtilen Feature bulunamadı.'); return;
            }

            if (!$this.helper.GetValueFromList(_styleList, styleName)) {
                $this.helper.Message('( ' + styleName + ' ) Belirtilen Style bulunamadı.'); return;
            }

            _featureList[featureName].set("style", _styleList[styleName]);

        },
        centerTo: function (featureName) {
            var _this = this;

            if (typeof (featureName) != 'string' || featureName == '') {
                $this.helper.Message('Feature belirtilmedi.'); return;
            }

            if (!$this.helper.GetValueFromList(this.properties.list, featureName)) {
                $this.helper.Message('( ' + featureName + ' ) Belirtilen Feature bulunamadı.'); return;
            }

            try {

                var featureExtend = $this.feature.properties.list[featureName].getGeometry().getExtent();
                $this.map.getView().setCenter(featureExtend);
                $this.map.getView().setZoom($this.map.getView().getZoom() - 2);


            } catch (e) {
                $this.helper.Message('Bir sorun oluştu...');
            }

        },
        panTo: function (featureName, zoom) {

            //  Yalnızca Polygonda çalışıyor.... Yarın marker ve linestring de yapmalıyız...

            if (featureName === '') {
                $this.helper.Message('Feature belirtilmedi.'); return;
            }

            if (!$this.helper.GetValueFromList(this.properties.list, featureName)) {
                $this.helper.Message('( ' + featureName + ' ) Belirtilen Feature bulunamadı.'); return;
            }

            try {

                var featureExtend = $this.feature.properties.list[featureName].getGeometry().getExtent();
                $this.map.getView().fit(featureExtend, $this.map.getSize());
                var type = $this.feature.properties.list[featureName].getGeometry().getType();

                var eksiindex = (type == "Polygon" || type == "LineString" ? 1 : 10);

                $this.map.getView().setZoom(zoom ? zoom : $this.map.getView().getZoom() - eksiindex);

            } catch (e) {
                $this.helper.Message('Bir sorun oluştu...');
            }

        },
        remove: function (layerName, featureName) {
            var _this = this;
            var _featureList = _this.properties.list;
            var _layerlist = $this.layer.properties.list;
            var layerName = $this.helper.GetValuesFromList(_layerlist, layerName);

            if (typeof (_featureList[featureName]) == 'undefined'
             || typeof (_featureList[featureName].getId()) == 'undefined') {
                $this.helper.Message('( ' + featureName + ' ) Belirtilen feature bulunamadı.'); return;
            }

            var featureID = _featureList[featureName].getId();

            $.each(layerName, function (i, item) {

                if (!$this.helper.GetValueFromList(_layerlist, item)) {
                    $this.helper.Message('( ' + item + ' ) Belirtilen Layer bulunamadı.'); return;
                }

                if (_layerlist[item].getProperties().type != 'Vector' || typeof (_layerlist[item].getSource().getFeatures) != 'function') {
                    return;
                }

                if (typeof (_featureList[featureID]) != 'undefined') {

                    if (_layerlist[item].getSource().getFeatureById(_featureList[featureID].getId()) == null) {
                        return;
                    }
                    if (_layerlist[item].getSource()) {
                        _layerlist[item].getSource().removeFeature(_featureList[featureID]);
                    }
                    delete _featureList[featureID];

                }

            });

        },
        get: function (featureName, layerName) {

            var res = new Object();
            var _this = this;
            _featureList = _this.properties.list;
            _layerlist = $this.layer.properties.list;

            var selectedFeatures = $this.helper.GetValuesFromList(_featureList, featureName);
            var selectedLayers = $this.helper.GetValuesFromList(_layerlist, layerName);

            $.each(selectedLayers, function (i1, item1) {

                if (!$this.helper.GetValueFromList(_layerlist, item1)) {
                    $this.helper.Message('( ' + item1 + ' ) Belirtilen katman bulunamadı... '); return;
                }

                if ($this.layer.properties.list[item1].getProperties().type != 'Vector' ||
                    typeof ($this.layer.properties.list[item1].getSource().getFeatures) != 'function') {
                    return;
                }

                var layerFeatures = $this.layer.properties.list[item1].getSource().getFeatures();

                $.each(layerFeatures, function (i2, item2) {

                    $.each(selectedFeatures, function (i3, item3) {

                        if (item2.getId() == item3) {
                            res[$(item2)[0].getId()] = $(item2)[0];
                        }

                    });

                });

            });

            return res;
        },
        events: function (hoverfilter, selectfilter, returnFunction) {
            var _this = this;
            _this.properties.interactionHover = $this.interaction.add("hoverAll", new ol.interaction.Select({
                features: new ol.Collection(),
                condition: ol.events.condition.pointerMove,
                toggleCondition: ol.events.condition.never,
                filter: function (feature, layer) {
                    return (!feature.get("hidden") || !feature.get("select")) && hoverfilter(feature, layer);
                }
            }));

            _this.properties.interactionHover.getFeatures().on(['add', 'remove'], function (e) {
                e.element.set("hover", e.type == "add");
                $this.mapElement.css("cursor", (e.type == "add" ? "pointer" : "default"));
                //if (e.type == "add") {
                $this.mapElement.trigger("hover:feature", e);
                returnFunction("hover", e);
                //}
            }, this);

            _this.properties.interactionSelect = $this.interaction.add("selectAll", new ol.interaction.Select({
                features: new ol.Collection(),
                condition: ol.events.condition.click,
                toggleCondition: ol.events.condition.shiftKeyOnly,
                filter: function (feature, layer) {
                    return (!feature.get("hidden")) && selectfilter(feature, layer);
                }
            }));

            _this.properties.interactionSelect.getFeatures().on(['add', 'remove'], function (e) {
                e.element.set("select", e.type == "add");
                $this.mapElement.trigger("select:feature", e);
                returnFunction("select", e);
            }, this);

        }
    };

    $this.drawing = {
        properties: {
            tools: {
                LineString: {
                    type: "LineString",
                    label: "Linestring Çizim Aracı",
                    icon: "flaticon-interface-1"
                },
                LineStringFreeHand: {
                    type: 'LineString',
                    label: 'Eller Serbest LineString Çizim Aracı',
                    icon: "flaticon-write",
                    freehand: true,
                    freehandCondition: ol.events.condition.always
                },
                Polygon: {
                    type: "Polygon",
                    label: "Poligon Çizim Aracı (Çift click ile kırıklık noktalarından keser)",
                    icon: "flaticon-distort"
                },
                PolygonFreeHand: {
                    type: "Polygon",
                    label: "Eller Serbest Poligon Çizim Aracı (Çift click ile kırıklık noktalarından keser)",
                    icon: "flaticon-write",
                    freehand: true,
                    freehandCondition: ol.events.condition.always
                },
                Point: {
                    type: "Point",
                    label: "Point Çizim Aracı (Çift click ile kırıklık noktalarından keser)",
                    icon: "fa fa-map-marker"
                },
                Square: {
                    type: 'Circle',
                    label: 'Kare Çizimi Aracı (Çift click ile kırıklık noktalarından keser)',
                    icon: "flaticon-square-1",
                    geometryFunction: ol.interaction.Draw.createRegularPolygon(4)
                },
                Box: {
                    type: 'LineString',
                    label: "Box Çizimi Aracı (Çift click ile kırıklık noktalarından keser)",
                    icon: "flaticon-big-tablet",
                    maxPoints: 2,
                    geometryFunction: function (coordinates, geometry) {
                        if (!geometry) {
                            geometry = new ol.geom.Polygon(null);
                        }
                        var start = coordinates[0];
                        var end = coordinates[1];
                        geometry.setCoordinates([
                          [start, [start[0], end[1]], end, [end[0], start[1]], start]
                        ]);
                        return geometry;
                    }
                }
            },
            layer: null,
            eventList: {},
            selectedFeatures: new ol.Collection(),
            hoverFeatures: new ol.Collection(),
            modifyFeatures: new ol.Collection(),
            removedFeatures: new ol.Collection(),
            snapingFeatures: new ol.Collection(),
            undoFunction: function (e) { return e; }
        },
        create: function (drawTools, layer, advenced, allowMultiGeometry, returnFunction) {

            var _this = this;

            if (typeof (returnFunction) != 'function') {
                $this.helper.Message("return functionını yazınız");
                return;
            }

            _this.properties.layer = layer ? layer : $this.layer.addVector("Çizim Layerı", "DrawLayer");

            /*Html containerlar oluşturluyor*/
            {
                //Toollar Oluşturuluyor
                if ($this.mapElement.find('.drawing.draw').length == 0) {
                    $this.mapElement.children().children('.ol-overlaycontainer-stopevent').find(".tool-container").append('<div class="ol-control drawing draw clearfix" />');
                }

                //Yardımcı Tool'lar Oluşturuluyor
                if ($this.mapElement.find('.drawing.help').length == 0) {
                    $this.mapElement.children().children('.ol-overlaycontainer-stopevent').find(".tool-container").append('<div class="ol-control drawing help clearfix" />');
                }

                //Yardımcı Tool'lar Oluşturuluyor
                if ($this.mapElement.find('.drawing.bufferbox').length == 0) {
                    $this.mapElement.children().children('.ol-overlaycontainer-stopevent').find(".tool-container").append('<div class="ol-control drawing bufferbox hide clearfix" />');
                    var select = $('<select class="form-control" id="buffer-unit"></select>')
                        .append('<option value="meters">Metre</option>')
                        .append('<option value="kilometers">Kilometre</option>')
                        .append('<option value="degrees">Degrees</option>')
                       .append('<option value="miles">Mile</option>')
                       .appendTo(".drawing.bufferbox");

                    $('<input type="number" class="form-control" id="buffer-value" min="0" max="150000" step="10" value="0">').appendTo(".drawing.bufferbox");

                    $('<div class="content"/>').appendTo(".drawing.bufferbox");
                }

                $this.mapElement.find('.drawing.draw').empty();
                $this.mapElement.find('.drawing.help').empty();
            }
            /*Html containerlar oluşturluyor*/


            //Interections Create// 
            {
                _this.properties.selectedFeatures.clear();
                _this.properties.removedFeatures.clear();
                _this.properties.snapingFeatures.clear();

                $this.map.getLayers().getArray().forEach(function (item) {
                    if (item.get("type") == "Vector" && item.get("snap")) {
                        _this.properties.snapingFeatures.extend(item.getSource().getFeatures());
                    }
                });

                var interactionList = ["LineString", "LineStringFreeHand", "Polygon", "PolygonFreeHand", "Point", "Square", "Box", "Select", "Hover", "DragSelect", "Modify", "HelpPolygon", "HelpLineString", "Transform", "MeasurementDraw", "DragAndDrop"];

                $this.helper.GetValuesFromList(_this.properties.tools, drawTools).forEach(function (tool, i) {
                    if (_this.properties.tools.hasOwnProperty(tool)) {
                        $this.interaction.add(tool, new ol.interaction.Draw({
                            type: _this.properties.tools[tool].type,
                            label: _this.properties.tools[tool].label,
                            geometryFunction: _this.properties.tools[tool].geometryFunction,
                            maxPoints: _this.properties.tools[tool].maxPoints,
                            freehand: _this.properties.tools[tool].freehand,
                            freehandCondition: _this.properties.tools[tool].freehandCondition
                        }));
                    }
                });

                $this.interaction.add("Hover", new ol.interaction.Select({
                    features: _this.properties.hoverFeatures,
                    condition: ol.events.condition.pointerMove,
                    toggleCondition: ol.events.condition.never,
                    layers: function (ly) {
                        return ly.get("name") == _this.properties.layer.get("name");
                    },
                    filter: function (feature, layer) {
                        return (!feature.get("hidden") || !feature.get("select"));
                    }
                }));

                $this.interaction.add("Select", new ol.interaction.Select({
                    features: _this.properties.selectedFeatures,
                    condition: ol.events.condition.click,
                    toggleCondition: ol.events.condition.shiftKeyOnly,
                    layers: function (ly) {
                        return ly.get("name") == _this.properties.layer.get("name");
                    },
                    filter: function (feature, layer) {
                        return (!feature.get("hidden"));
                    }
                }));

                $this.interaction.add("DragSelect", new ol.interaction.DragBox({
                    condition: ol.events.condition.shiftKeyOnly,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: [0, 0, 255, 1]
                        })
                    })
                }));

                $this.interaction.add("Modify", new ol.interaction.Modify({
                    features: _this.properties.modifyFeatures,
                }));

                $this.interaction.add("HelpPolygon", new ol.interaction.Draw({
                    type: "Polygon"
                }));

                $this.interaction.add("HelpLineString", new ol.interaction.Draw({
                    type: "LineString"
                }));

                $this.interaction.add("Snap", new ol.interaction.Snap({
                    features: _this.properties.snapingFeatures,
                    pixelTolerance: 15,
                    vertex: true,
                    edge: true
                }));

                $this.interaction.setActive(interactionList, false);

                _this.properties.selectedFeatures.on(['add', 'remove'], function (e) {
                    e.element.set("select", e.type == "add");
                }, this);

                _this.properties.hoverFeatures.on(['add', 'remove'], function (e) {
                    e.element.set("hover", e.type == "add");
                    $this.mapElement.attr("style", "cursor:" + (e.type == "add" ? "pointer" : "default"));
                }, this)

            }
            //Interections Create// 

            returnFunction({
                event: "CreateDrawing",
                layer: _this.properties.layer,
                features: _this.properties.selectedFeatures,
                featuresRemove: _this.properties.removedFeatures
            });


            /*Draw Button*/
            $this.helper.GetValuesFromList(_this.properties.tools, drawTools).forEach(function (tool, i) {
                if (_this.properties.tools.hasOwnProperty(tool)) {
                    $('<button/>')
                        .attr("type", "button")
                        .append('<i class="' + _this.properties.tools[tool].icon + '" />')
                        .attr('title', _this.properties.tools[tool].label)
                        .attr("data-placement", "right")
                        .attr("data-tool", "Draw")
                        .click(function (e) {
                            e.preventDefault();

                            if ($(this).hasClass("disabled")) return false;
                            $this.interaction.setActive(interactionList, false);
                            $this.mapElement.find(".bufferbox").addClass("hide");
                            $this.mapElement.find(".drawing").find("button").removeClass("active");
                            $(this).addClass("active");

                            _this.properties.selectedFeatures.clear();
                            var interaction = $this.interaction.get(tool)[tool];
                            ol.Observable.unByKey(_this.properties.eventList[tool]);
                            _this.properties.eventList[tool] = interaction.on('drawend', function (e) {


                                if (!advenced) {
                                    _this.properties.selectedFeatures.clear();
                                    _this.properties.layer.getSource().clear();
                                    $this.mapElement.find(".drawing.draw button:first-child").trigger("click");
                                }


                                _this.properties.selectedFeatures.insertAt(0, $this.feature.add(_this.properties.layer.get("name"), $this.helper.NewGuid(), e.feature));

                                returnFunction({
                                    event: "Draw",
                                    layer: _this.properties.layer,
                                    features: _this.properties.selectedFeatures,
                                    featuresRemove: _this.properties.removedFeatures
                                });

                            }, this);


                            _this.properties.undoFunction = function (e) {
                                try {
                                    interaction.removeLastPoint();
                                } catch (e) {
                                    var lastfeature = _this.properties.selectedFeatures.item(0);
                                    if (lastfeature) {
                                        _this.properties.layer.getSource().removeFeature(lastfeature);
                                        _this.properties.selectedFeatures.remove(lastfeature);
                                    }

                                    if (_this.properties.selectedFeatures.getLength() > 0) {
                                        returnFunction({
                                            event: "Draw",
                                            layer: _this.properties.layer,
                                            features: _this.properties.selectedFeatures,
                                            featuresRemove: _this.properties.removedFeatures
                                        });
                                    } else {
                                        $('[data-tool="Select"]').trigger("click");
                                    }
                                }
                            };

                            $this.interaction.setActive([tool], true);

                        })
                        .dblclick(function () {

                            if ($(this).hasClass("disabled")) return false;
                            $this.interaction.setActive(interactionList, false);
                            $this.mapElement.find(".bufferbox").addClass("hide");
                            $this.mapElement.find(".drawing").find("button").removeClass("active");
                            $(this).addClass("active");

                            if (tool != "Polygon" && tool != "PolygonFreeHand" && tool != "Box" && tool != "Square") {
                                $(this).trigger("click");
                                return false;
                            }

                            _this.properties.selectedFeatures.clear();
                            var interaction = $this.interaction.get(tool)[tool];
                            ol.Observable.unByKey(_this.properties.eventList[tool]);
                            _this.properties.eventList[tool] = interaction.on('drawend', function (e) {

                                var featureDraw = e.feature;

                                _this.properties.layer.getSource().forEachFeatureInExtent(featureDraw.getGeometry().getExtent(), function (item) {
                                    var clipJSON = turf.difference(featureDraw.getGeoJSON(), item.getGeoJSON());
                                    if (clipJSON) {
                                        var clipGeometry = $this.helper.GeoJSONtoGeometry(clipJSON.geometry);
                                        if (clipGeometry) {
                                            featureDraw.setGeometry(clipGeometry);
                                        }
                                    }
                                });


                                if (featureDraw && (allowMultiGeometry || (featureDraw.getGeometry().getType().indexOf("Multi") == -1 && !allowMultiGeometry))) {
                                    var tfeature = $this.feature.add(_this.properties.layer.get("name"), $this.helper.NewGuid(), featureDraw);
                                    _this.properties.selectedFeatures.insertAt(0, tfeature);
                                    returnFunction({
                                        event: "Draw",
                                        layer: _this.properties.layer,
                                        features: _this.properties.selectedFeatures,
                                        featuresRemove: _this.properties.removedFeatures
                                    });
                                } else {
                                    $this.helper.Message("Polygon ekleme işlemlerinde sonuç sadece polygon cıkabilir.", "warning", true);
                                    return;
                                }



                            }, this);


                            _this.properties.undoFunction = function (e) {
                                try {
                                    interaction.removeLastPoint();
                                } catch (e) {
                                    var lastfeature = _this.properties.selectedFeatures.item(0);
                                    if (lastfeature) {
                                        _this.properties.layer.getSource().removeFeature(lastfeature);
                                        _this.properties.selectedFeatures.remove(lastfeature);
                                    }

                                    if (_this.properties.selectedFeatures.getLength() > 0) {
                                        returnFunction({
                                            event: "Draw",
                                            layer: _this.properties.layer,
                                            features: _this.properties.selectedFeatures,
                                            featuresRemove: _this.properties.removedFeatures
                                        });
                                    } else {
                                        $('[data-tool="Select"]').trigger("click");
                                    }
                                }
                            };


                            $this.interaction.setActive([tool], true);

                        })
                        .appendTo($this.mapElement.find(".drawing.draw"));
                }
            });
            /*Draw Button*/



            /*Select Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-interface-3" />')
                .attr('data-tool', 'Select')
                .attr('title', "Seçim Aracı (Selection)")
                .attr("data-placement", "right")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");


                    ol.Observable.unByKey(_this.properties.eventList["Select"]);
                    _this.properties.eventList["Select"] = $this.interaction.get("Select")["Select"].on("select", function (e) {

                        var feature = _this.properties.selectedFeatures.item(0);
                        var featuresLength = _this.properties.selectedFeatures.getLength();

                        $this.mapElement.find('.drawing.help button:not([data-tool="Select"])').addClass("hide");


                        if (featuresLength == 1) {

                            $this.mapElement.find('[data-tool="Delete"],[data-tool="Modify"]').removeClass("hide");

                            if (feature.getGeometry().getType().indexOf("Polygon") > -1) {
                                $this.mapElement.find('[data-tool="Buffer"],[data-tool="Transform"],[data-tool="AddPolygon"],[data-tool="CutIn"],[data-tool="CutOut"],[data-tool="Split"],[data-tool="Clip"]').removeClass("hide");
                            } else if (feature.getGeometry().getType().indexOf("LineString") > -1) {
                                $this.mapElement.find('[data-tool="Transform"],[data-tool="CutIn"],[data-tool="CutOut"],[data-tool="Split"]').removeClass("hide");
                            }

                        } else if (featuresLength > 1) {

                            $this.mapElement.find('[data-tool="Delete"]').removeClass("hide");

                            if (feature.getGeometry().getType().indexOf("Polygon") > -1) {
                                $this.mapElement.find('[data-tool="Union"],[data-tool="Merge"],[data-tool="Intersect"],[data-tool="Disolve"]').removeClass("hide");
                            } else if (feature.getGeometry().getType().indexOf("LineString") > -1) {
                                $this.mapElement.find('[data-tool="Union"],[data-tool="Merge"]').removeClass("hide");
                            }

                        } else if (featuresLength == 0) {

                            //$('[data-tool="Select"]').trigger("click");
                        }

                        returnFunction({
                            event: featuresLength == 0 ? "UnSelect" : (featuresLength == 1 ? "Select" : "MultipleSelect"),
                            layer: _this.properties.layer,
                            features: _this.properties.selectedFeatures,
                            featuresRemove: _this.properties.removedFeatures
                        });
                    });

                    ol.Observable.unByKey(_this.properties.eventList["DragSelect"]);
                    _this.properties.eventList["DragSelect"] = $this.interaction.get("DragSelect")["DragSelect"].on('boxend', function (e) {
                        _this.properties.selectedFeatures.clear();
                        _this.properties.layer.getSource().forEachFeatureIntersectingExtent(e.target.getGeometry().getExtent(), function (feature) {
                            if (!feature.get("hidden")) {
                                _this.properties.selectedFeatures.push(feature);
                            }
                        });
                        $this.interaction.get("Select")["Select"].dispatchEvent({ type: 'select' });
                    }, this);


                    if (_this.properties.removedFeatures.getLength() == 0) {

                        _this.properties.undoFunction = function (e) {
                            if (_this.properties.selectedFeatures.item(0)) {
                                _this.properties.selectedFeatures.pop();
                            }
                            $this.interaction.get("Select")["Select"].dispatchEvent({ type: 'select' });
                        };

                        $this.interaction.get("Select")["Select"].dispatchEvent({ type: 'select' });

                    }

                    $this.interaction.setActive(["Select", "Hover", "DragSelect"], true);

                })
                .trigger("click")
                .appendTo($this.mapElement.find(".drawing.help"));
            /*Select Button*/

            /*Delete Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-delete" />')
                .attr('data-tool', 'Delete')
                .attr('title', "Silme aracı (Delete)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();

                    _this.properties.selectedFeatures.forEach(function (item, i) {
                        _this.properties.removedFeatures.insertAt(i, item);
                        _this.properties.layer.getSource().removeFeature(item);
                    });

                    _this.properties.selectedFeatures.clear();

                    returnFunction({
                        event: "Delete",
                        layer: _this.properties.layer,
                        features: _this.properties.selectedFeatures,
                        featuresRemove: _this.properties.removedFeatures
                    });


                    _this.properties.undoFunction = function (e) {
                        _this.properties.removedFeatures.forEach(function (item, i) {
                            var feature = $this.feature.add(item.get("layer"), item.getId(), item);
                            if (feature) {
                                _this.properties.selectedFeatures.insertAt(i, feature);
                            }
                        });
                        _this.properties.removedFeatures.clear();
                        $('[data-tool="Select"]').trigger("click");
                    };
                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*Delete Button*/

            /*Modify Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-interface-1" />')
                .attr('data-tool', 'Modify')
                .attr('title', "Düzenleme aracı (Modify)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();

                    var geometryTemp = new ol.Collection([_this.properties.selectedFeatures.item(0).clone().getGeometry()]);
                    var interaction = $this.interaction.get("Modify")["Modify"];
                    ol.Observable.unByKey(_this.properties.eventList["ModifyChangeActive"]);
                    _this.properties.eventList["ModifyChangeActive"] = interaction.on('change:active', function (e) {

                        if (e.oldValue == false) {
                            _this.properties.modifyFeatures.push(_this.properties.selectedFeatures.item(0));
                        } else {
                            _this.properties.modifyFeatures.clear();
                        }

                        _this.properties.selectedFeatures.forEach(function (item) {
                            if (item.getGeometry().getType() != "Point" && item.getGeometry().getType() != "MultipPoint") {
                                item.set("vertex", e.oldValue ? false : true);
                            }
                        });

                        if (_this.properties.selectedFeatures.getLength() == 0 && !_this.properties.layer.get("vertex")) {
                            _this.properties.layer.getSource().forEachFeature(function (item) {
                                item.set("vertex", false);
                            });
                        }

                    }, this);


                    ol.Observable.unByKey(_this.properties.eventList["ModifyEnd"]);
                    _this.properties.eventList["ModifyEnd"] = interaction.on('modifyend', function (e) {
                        geometryTemp.insertAt(0, e.features.item(0).clone().getGeometry());
                        returnFunction({
                            event: "Modify",
                            layer: _this.properties.layer,
                            features: _this.properties.selectedFeatures,
                            featuresRemove: _this.properties.removedFeatures
                        });
                    }, this);


                    _this.properties.undoFunction = function (e) {

                        if (geometryTemp.getLength() > 1) {
                            geometryTemp.removeAt(0);
                            _this.properties.selectedFeatures.item(0).setGeometry(geometryTemp.item(0).clone());
                            returnFunction({
                                event: "Modify",
                                layer: _this.properties.layer,
                                features: _this.properties.selectedFeatures,
                                featuresRemove: _this.properties.removedFeatures
                            });
                        }

                    };

                    $this.interaction.setActive(["Modify"], true);
                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*Modify Button*/

            /*Çizim Translate Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-technology" />')
                .attr('data-tool', 'Transform')
                .attr('title', "Çizim Taşıma,Döndürme Aracı (Transform)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();

                    var geometryTemp = new ol.Collection([_this.properties.selectedFeatures.item(0).clone().getGeometry()]);
                    var interaction = new ol.interaction.Transform({
                        translateFeature: true,
                        scale: true,
                        rotate: true,
                        translate: true,
                        stretch: true,
                        feature: _this.properties.selectedFeatures.item(0),
                        features: _this.properties.selectedFeatures
                    });

                    var timeout = null;
                    interaction.on(["rotating", "translating", "scaling"], function (e) {
                        window.clearTimeout(timeout);
                        timeout = window.setTimeout(function () {
                            geometryTemp.insertAt(0, e.feature.clone().getGeometry());
                            returnFunction({
                                event: "Modify",
                                layer: _this.properties.layer,
                                features: _this.properties.selectedFeatures,
                                featuresRemove: _this.properties.removedFeatures
                            });
                        }, 100);
                    });

                    _this.properties.undoFunction = function (e) {
                        if (geometryTemp.getLength() > 1) {
                            geometryTemp.removeAt(0);
                            _this.properties.selectedFeatures.item(0).setGeometry(geometryTemp.item(0).clone());
                            interaction.setDefaultStyle();
                            returnFunction({
                                event: "Modify",
                                layer: _this.properties.layer,
                                features: _this.properties.selectedFeatures,
                                featuresRemove: _this.properties.removedFeatures
                            });
                        }
                    };

                    $this.interaction.remove("Transform");
                    $this.interaction.add("Transform", interaction);
                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*Çizim Translate Button*/

            /*Çizim Ekle Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-squares-3" />')
                .attr('data-tool', 'AddPolygon')
                .attr('title', "Çizim Ekleme Aracı (ReShape)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();

                    var geometryTemp = new ol.Collection([_this.properties.selectedFeatures.item(0).clone().getGeometry()]);
                    var interaction = $this.interaction.get("HelpPolygon")["HelpPolygon"];
                    ol.Observable.unByKey(_this.properties.eventList["HelpPolygon"]);
                    _this.properties.eventList["HelpPolygon"] = interaction.on('drawend', function (e) {
                        var featureDraw = e.feature;
                        _this.properties.selectedFeatures.forEach(function (item) {
                            var unionGeoJSON = turf.union(item.getGeoJSON(), featureDraw.getGeoJSON());
                            if (unionGeoJSON && unionGeoJSON.geometry) {
                                var unionGeometry = $this.helper.GeoJSONtoGeometry(unionGeoJSON.geometry);
                                if (unionGeometry && (item.getGeometry().getType().indexOf("Multi") > -1 || allowMultiGeometry || (unionGeometry.getType().indexOf("Multi") == -1 && !allowMultiGeometry))) {

                                    geometryTemp.insertAt(0, unionGeometry);
                                    item.setGeometry(unionGeometry);

                                } else {
                                    $this.helper.Message("Polygon reshape işlemlerinde sonuç sadece polygon cıkabilir.", "warning", true);
                                    return;
                                }
                            }
                        });
                        returnFunction({
                            event: "Modify",
                            layer: _this.properties.layer,
                            features: _this.properties.selectedFeatures,
                            featuresRemove: _this.properties.removedFeatures
                        });
                    }, this);


                    _this.properties.undoFunction = function (e) {
                        if (geometryTemp.getLength() > 1) {
                            geometryTemp.removeAt(0);
                            _this.properties.selectedFeatures.item(0).setGeometry(geometryTemp.item(0).clone());
                            returnFunction({
                                event: "Modify",
                                layer: _this.properties.layer,
                                features: _this.properties.selectedFeatures,
                                featuresRemove: _this.properties.removedFeatures
                            });
                        }
                    };

                    $this.interaction.setActive("HelpPolygon", true);
                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*Çizim Ekle Button*/

            /*Çizim Kes İçten Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-squares-2" />')
                .attr('data-tool', 'CutIn')
                .attr('title', "Çizim Kes Aracı İçten (ReShape CutIn)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {
                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();


                    var geometryTemp = new ol.Collection([_this.properties.selectedFeatures.item(0).clone().getGeometry()]);
                    var interaction = $this.interaction.get("HelpPolygon")["HelpPolygon"];
                    ol.Observable.unByKey(_this.properties.eventList["HelpPolygon"]);
                    _this.properties.eventList["HelpPolygon"] = interaction.on('drawend', function (e) {
                        var featureDraw = e.feature;
                        _this.properties.selectedFeatures.forEach(function (item) {
                            var clipJSON = turf.difference(item.getGeoJSON(), featureDraw.getGeoJSON());
                            if (clipJSON && clipJSON.geometry) {
                                var clipGeometry = $this.helper.GeoJSONtoGeometry(clipJSON.geometry);

                                if (clipGeometry && (item.getGeometry().getType().indexOf("Multi") > -1 || allowMultiGeometry || (clipGeometry.getType().indexOf("Multi") == -1 && !allowMultiGeometry) || _this.properties.selectedFeatures.item(0).getGeometry().getType().indexOf("LineString") > -1)) {

                                    geometryTemp.insertAt(0, clipGeometry);
                                    item.setGeometry(clipGeometry);

                                } else {
                                    $this.helper.Message("Polygon reshape işlemlerinde sonuç sadece polygon cıkabilir.", "warning", true);
                                    return;
                                }
                            }
                        });

                        returnFunction({
                            event: "Modify",
                            layer: _this.properties.layer,
                            features: _this.properties.selectedFeatures,
                            featuresRemove: _this.properties.removedFeatures
                        });

                    }, this);



                    _this.properties.undoFunction = function (e) {
                        if (geometryTemp.getLength() > 1) {
                            geometryTemp.removeAt(0);
                            _this.properties.selectedFeatures.item(0).setGeometry(geometryTemp.item(0).clone());
                            returnFunction({
                                event: "Modify",
                                layer: _this.properties.layer,
                                features: _this.properties.selectedFeatures,
                                featuresRemove: _this.properties.removedFeatures
                            });
                        }
                    };

                    $this.interaction.setActive("HelpPolygon", true);
                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*Çizim Kes İçten Button*/

            /*Çizim Kes Dıştan Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-squares" />')
                .attr('data-tool', 'CutOut')
                .attr('title', "Çizim Kes Aracı Dıştan (ReShape CutOut)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {
                    e.preventDefault();
                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();

                    var geometryTemp = new ol.Collection([_this.properties.selectedFeatures.item(0).clone().getGeometry()]);
                    var interaction = $this.interaction.get("HelpPolygon")["HelpPolygon"];
                    ol.Observable.unByKey(_this.properties.eventList["HelpPolygon"]);
                    _this.properties.eventList["HelpPolygon"] = interaction.on('drawend', function (e) {
                        var featureDraw = e.feature;
                        _this.properties.selectedFeatures.forEach(function (item) {
                            var clipJSON = turf.intersect(item.getGeoJSON(), featureDraw.getGeoJSON());
                            if (clipJSON && clipJSON.geometry) {
                                var clipGeometry = $this.helper.GeoJSONtoGeometry(clipJSON.geometry);
                                if (clipGeometry && (item.getGeometry().getType().indexOf("Multi") > -1 || allowMultiGeometry || (clipGeometry.getType().indexOf("Multi") == -1 && !allowMultiGeometry) || _this.properties.selectedFeatures.item(0).getGeometry().getType().indexOf("LineString") > -1)) {
                                    geometryTemp.insertAt(0, clipGeometry);
                                    item.setGeometry(clipGeometry);
                                } else {
                                    $this.helper.Message("Polygon reshape işlemlerinde sonuç sadece polygon cıkabilir.", "warning", true);
                                    return;
                                }
                            }
                        });

                        returnFunction({
                            event: "Modify",
                            layer: _this.properties.layer,
                            features: _this.properties.selectedFeatures,
                            featuresRemove: _this.properties.removedFeatures
                        });
                    }, this);

                    _this.properties.undoFunction = function (e) {
                        if (geometryTemp.getLength() > 1) {
                            geometryTemp.removeAt(0);
                            _this.properties.selectedFeatures.item(0).setGeometry(geometryTemp.item(0).clone());
                            returnFunction({
                                event: "Modify",
                                layer: _this.properties.layer,
                                features: _this.properties.selectedFeatures,
                                featuresRemove: _this.properties.removedFeatures
                            });
                        }
                    };

                    $this.interaction.setActive("HelpPolygon", true);
                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*Çizim Kes Dıştan Button*/

            /*Buffer Copy&Modify Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-arrows" />')
                .attr('data-tool', 'Buffer')
                .attr('title', "Yayma Aracı (Buffer Copy & Buffer Modify)")
                .addClass("hide")
                .attr("data-placement", "right")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();

                    $this.mapElement.find('.drawing.bufferbox').addClass("hide");
                    $this.mapElement.find('.drawing.bufferbox .content').empty();

                    var geometryTemp = new ol.Collection([_this.properties.selectedFeatures.item(0).clone().getGeometry()]);

                    $('<a class="btn btn-block text-center btn-primary" style="padding:5px;">')
                        .append('<span>Uygula</span>')
                        .on("click", function () {

                            var unit = $this.mapElement.find("#buffer-unit").val();
                            var value = $this.mapElement.find("#buffer-value").val();

                            _this.properties.selectedFeatures.forEach(function (item, i) {
                                var bufferJson = turf.buffer(item.getGeoJSON(), parseFloat(value == "" ? 0 : value), unit);
                                if (bufferJson && bufferJson.geometry) {
                                    var bufferGeometry = $this.helper.GeoJSONtoGeometry(bufferJson.geometry);
                                    if (bufferGeometry) {
                                        geometryTemp.insertAt(0, bufferGeometry);
                                        item.setGeometry(bufferGeometry);
                                    }
                                }
                            });

                            returnFunction({
                                event: "Modify",
                                layer: _this.properties.layer,
                                features: _this.properties.selectedFeatures,
                                featuresRemove: _this.properties.removedFeatures
                            });

                            _this.properties.undoFunction = function (e) {
                                if (geometryTemp.getLength() > 1) {
                                    geometryTemp.removeAt(0);
                                    _this.properties.selectedFeatures.item(0).setGeometry(geometryTemp.item(0).clone());
                                    returnFunction({
                                        event: "Modify",
                                        layer: _this.properties.layer,
                                        features: _this.properties.selectedFeatures,
                                        featuresRemove: _this.properties.removedFeatures
                                    });
                                }
                            };
                        })
                        .appendTo($this.mapElement.find('.drawing.bufferbox .content'));

                    $('<a class="btn btn-block text-center btn-primary" style="padding:5px;">')
                       .append('<span>Kopyala</span>')
                       .on("click", function () {

                           _this.properties.removedFeatures.clear();
                           var featuresTemp = _this.properties.selectedFeatures.clone();

                           var unit = $this.mapElement.find("#buffer-unit").val();
                           var value = $this.mapElement.find("#buffer-value").val();
                           var collection = new ol.Collection();

                           featuresTemp.forEach(function (item, i) {
                               var featureGeoJSON = turf.buffer(item.getGeoJSON(), parseFloat(value == "" ? 0 : value), unit);
                               var feature = $this.feature.add(_this.properties.layer.get("name"), $this.helper.NewGuid(), featureGeoJSON);

                               if (feature) {
                                   item.getKeys().forEach(function (prop, i) {
                                       if (prop != "geometry") {
                                           feature.set(prop, item.get(prop));
                                       }
                                   });
                                   _this.properties.selectedFeatures.removeAt(i)
                                   _this.properties.selectedFeatures.insertAt(i, feature);
                               }

                           });

                           returnFunction({
                               event: "Draw",
                               layer: _this.properties.layer,
                               features: _this.properties.selectedFeatures,
                               featuresRemove: _this.properties.removedFeatures
                           });

                           _this.properties.undoFunction = function (e) {
                               featuresTemp.forEach(function (feature, i) {
                                   _this.properties.layer.getSource().removeFeature(_this.properties.selectedFeatures.item(i));
                                   _this.properties.selectedFeatures.removeAt(i);
                                   _this.properties.selectedFeatures.insertAt(i, feature);
                               });
                           };
                       })
                       .appendTo($this.mapElement.find('.drawing.bufferbox .content'));

                    $this.mapElement.find('.drawing.bufferbox').removeClass("hide");
                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*Buffer Copy&Modify Button*/

            /*HGK Split Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-cut" />')
                .attr('data-tool', 'Split')
                .attr('title', "Çizim Parçalama (Split)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();


                    var interaction = $this.interaction.get("HelpLineString")["HelpLineString"];
                    ol.Observable.unByKey(_this.properties.eventList["HelpLineString"]);
                    _this.properties.eventList["HelpLineString"] = interaction.on('drawend', function (e) {


                        $.ajax({
                            url: "/Tools/Cut",
                            data: { SqlString: _this.properties.selectedFeatures.item(0).getSQL(), CutSqlString: e.feature.getSQL() },
                            type: "POST",
                            success: function (resp) {

                                if (resp.SqlString && resp.SqlString.length > 0) {
                                    var getProperties = _this.properties.selectedFeatures.item(0).getProperties();
                                    _this.properties.selectedFeatures.forEach(function (item, i) {
                                        _this.properties.removedFeatures.insertAt(i, item);
                                        _this.properties.layer.getSource().removeFeature(item);
                                    });
                                    _this.properties.selectedFeatures.clear();

                                    resp.SqlString.forEach(function (e, i) {
                                        var item = $this.feature.add(_this.properties.layer.get("name"), $this.helper.NewGuid(), e);

                                        $.each(getProperties, function (prop, value) {
                                            if (prop == "geometry") return;
                                            item.set(prop, value);
                                        });

                                        _this.properties.selectedFeatures.push(item);
                                    });

                                    $this.interaction.setActive("HelpLineString", false);

                                    returnFunction({
                                        event: "Split",
                                        layer: _this.properties.layer,
                                        features: _this.properties.selectedFeatures,
                                        featuresRemove: _this.properties.removedFeatures
                                    });

                                } else {
                                    $this.helper.Message("Kesme işlemi sonucu herhangi bir öğe oluşmadığından işlem yapılamadı", "warning", true);
                                    $('[data-tool="Select"]').trigger("click");
                                    return;
                                }
                            }
                        });

                    }, this);


                    _this.properties.undoFunction = function (e) {

                        if (_this.properties.selectedFeatures.getLength() == 1) {

                            try {
                                interaction.removeLastPoint();
                            } catch (e) { }

                        } else {

                            _this.properties.selectedFeatures.forEach(function (item, i) {
                                _this.properties.layer.getSource().removeFeature(item);
                            });
                            _this.properties.selectedFeatures.clear();

                            _this.properties.removedFeatures.forEach(function (item, i) {
                                var feature = $this.feature.add(_this.properties.layer.get("name"), item.getId(), item);
                                _this.properties.selectedFeatures.insertAt(0, feature);
                            });
                            _this.properties.removedFeatures.clear();

                            $('[data-tool="Select"]').trigger("click");
                        }

                    };

                    $this.interaction.setActive("HelpLineString", true);

                })
            .appendTo($this.mapElement.find(".drawing.help"));
            /*HGK Split Button*/

            /*HGK Clip Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-crop" />')
                .attr('data-tool', 'Clip')
                .attr('title', "Değenleri Kes  (Clip & Diffrence)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");

                    $this.mapElement.find('.drawing.bufferbox .content').empty();

                    var clipTypes = [{ name: "Difrence", value: "difference" }, { name: "Clip", value: "intersect" }];

                    clipTypes.forEach(function (type, i) {

                        $('<a class="btn btn-block text-center btn-primary" style="padding:5px;">')
                            .append('<span style="font-size:12px;">' + type.name + '</span>')
                            .on("click", function () {

                                if (_this.properties.selectedFeatures.getLength() > 1) {
                                    $this.helper.Message("Birden fazla çizim seçili iken diffrence işlemi yapılamaz", "warning", true);
                                    return;
                                }

                                _this.properties.removedFeatures.clear();
                                var unit = $this.mapElement.find("#buffer-unit").val();
                                var value = $this.mapElement.find("#buffer-value").val();
                                var cliptype = type.value;
                                var feature = _this.properties.selectedFeatures.item(0);
                                var featureGeoJSON = turf.buffer(feature.getGeoJSON(), parseFloat(value == "" ? 0 : value), unit);

                                _this.properties.layer.getSource().forEachFeatureInExtent($this.map.getView().calculateExtent($this.map.getSize()), function (item) {
                                    if (item.getId() == feature.getId()) return;
                                    var itemGeoJSON = item.getGeoJSON();
                                    var intersectGeoJSON = turf.intersect(itemGeoJSON, featureGeoJSON);
                                    if (intersectGeoJSON && (intersectGeoJSON.geometry.type.indexOf("Polygon") > -1 || intersectGeoJSON.geometry.type.indexOf("LineString") > -1)) {
                                        _this.properties.selectedFeatures.insertAt(_this.properties.selectedFeatures.getLength(), item);
                                    }
                                }, this);

                                featuresTemp = _this.properties.selectedFeatures.clone();

                                _this.properties.selectedFeatures.forEach(function (item, i) {
                                    if (item.getId() == feature.getId()) return;
                                    var itemGeoJSON = item.getGeoJSON();
                                    var clipGeoJSON = turf[cliptype](itemGeoJSON, featureGeoJSON)
                                    if (allowMultiGeometry || (clipGeoJSON && clipGeoJSON.geometry && clipGeoJSON.geometry.type.indexOf("Multi") == -1 && !allowMultiGeometry) || !clipGeoJSON || itemGeoJSON.geometry.type.indexOf("Multi") > -1) {
                                        item.setGeometry(clipGeoJSON ? $this.helper.GeoJSONtoGeometry(clipGeoJSON.geometry) : null);
                                    } else {
                                        _this.properties.selectedFeatures.removeAt(i);
                                    }
                                });

                                if (_this.properties.selectedFeatures.getLength() == 1) {
                                    $this.helper.Message("Seçili öğeyle kesişen herhangi bir öğe olmadığından clip işlem yapılamadı", "warning", true);
                                    return;
                                }

                                returnFunction({
                                    event: "Clip",
                                    layer: _this.properties.layer,
                                    features: _this.properties.selectedFeatures,
                                    featuresRemove: _this.properties.removedFeatures
                                });


                                _this.properties.undoFunction = function (e) {
                                    featuresTemp.forEach(function (item, i) {
                                        var tFeature = $this.feature.get(item.getId(), item.get("layer"))[item.getId()];
                                        tFeature.setGeometry(item.getGeometry());
                                        if (i > 0) {
                                            _this.properties.selectedFeatures.remove(tFeature);
                                        }
                                    });
                                    // $('[data-tool="Select"]').trigger("click");
                                }

                            })
                            .appendTo($this.mapElement.find('.drawing.bufferbox .content'))
                            .parents('.drawing.bufferbox').removeClass("hide");

                    });

                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*HGK Clip Button*/

            /*HGK Merge Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-crop" />')
                .attr('data-tool', 'Merge')
                .attr('title', "Seçilileri ilk seçilene birleştir (Merge)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();


                    var featuresTemp = _this.properties.selectedFeatures.clone();
                    var features = _this.properties.selectedFeatures.item(0);
                    var featureGeoJSON = features.getGeoJSON();
                    var mergeGeoJSON = features.getGeoJSON();

                    _this.properties.selectedFeatures.forEach(function (item) {
                        var itemGeoJSON = item.getGeoJSON();
                        var tempGeoJSON = turf.union(mergeGeoJSON, itemGeoJSON);
                        if (tempGeoJSON && tempGeoJSON.geometry.type.indexOf("Polygon") > -1 && (allowMultiGeometry || (tempGeoJSON && tempGeoJSON.geometry && tempGeoJSON.geometry.type.indexOf("Multi") == -1 && !allowMultiGeometry) || featureGeoJSON.geometry.type.indexOf("Multi") > -1)) {
                            mergeGeoJSON = tempGeoJSON;
                            _this.properties.removedFeatures.insertAt(_this.properties.removedFeatures.getLength(), item);
                        }
                    });


                    if (mergeGeoJSON && mergeGeoJSON.geometry && _this.properties.removedFeatures.getLength() > 1) {

                        _this.properties.removedFeatures.forEach(function (item, i) {
                            var feature = _this.properties.layer.getSource().getFeatureById(item.getId());
                            if (feature) {
                                _this.properties.layer.getSource().removeFeature(feature);
                            }
                        });

                        mergeGeoJSON.properties = featureGeoJSON.properties;

                        var mfeature = $this.feature.add(_this.properties.layer.get("name"), $this.helper.NewGuid(), mergeGeoJSON);
                        if (mfeature) {
                            _this.properties.selectedFeatures.clear();
                            _this.properties.selectedFeatures.insertAt(0, mfeature);
                        };

                    } else {
                        $this.helper.Message("Seçili öğelerden ilk öğeyle kesişen herhangi bir öğe olmadığından işlem yapılamadı", "warning", true)
                        $('[data-tool="Select"]').trigger("click");
                        return;
                    }


                    returnFunction({
                        event: "Merge",
                        layer: _this.properties.layer,
                        features: _this.properties.selectedFeatures,
                        featuresRemove: _this.properties.removedFeatures
                    });


                    _this.properties.undoFunction = function (e) {

                        _this.properties.selectedFeatures.forEach(function (item, i) {
                            _this.properties.layer.getSource().removeFeature(item);
                        });
                        _this.properties.selectedFeatures.clear();

                        _this.properties.removedFeatures.forEach(function (item, i) {
                            var feature = $this.feature.add(_this.properties.layer.get("name"), item.getId(), item);
                        });
                        _this.properties.removedFeatures.clear();

                        featuresTemp.forEach(function (item, i) {
                            var feature = $this.feature.get(item.getId(), item.get("layer"))[item.getId()];
                            if (feature) {
                                _this.properties.selectedFeatures.insertAt(i, item);
                            }
                        });


                        $('[data-tool="Select"]').trigger("click");

                    };

                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*HGK Merge Button*/

            /*HGK Union Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-layers-1" />')
                .attr('data-tool', 'Union')
                .attr('title', "Seçilileri ilk seçilenle merge işleminden kopya yarat (Union)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();

                    var featuresTemp = _this.properties.selectedFeatures.clone();
                    var feature = _this.properties.selectedFeatures.item(0);
                    var featureGeoJSON = feature.getGeoJSON();
                    var unionGeoJSON = feature.getGeoJSON();

                    var i = 0;
                    _this.properties.selectedFeatures.forEach(function (item) {
                        if (_this.properties.selectedFeatures.item(0).getId() == item.getId()) return;
                        var itemGeoJSON = item.getGeoJSON();
                        var tempGeoJSON = turf.union(unionGeoJSON, itemGeoJSON);
                        if (tempGeoJSON && tempGeoJSON.geometry.type.indexOf("Polygon") > -1 && (allowMultiGeometry || (tempGeoJSON && tempGeoJSON.geometry && tempGeoJSON.geometry.type.indexOf("Multi") == -1 && !allowMultiGeometry) || featureGeoJSON.geometry.type.indexOf("Multi") > -1)) {
                            i++;
                            unionGeoJSON = tempGeoJSON;
                        }
                    });

                    if (unionGeoJSON && unionGeoJSON.geometry && i > 1) {
                        unionGeoJSON.properties = featureGeoJSON.properties;
                        var ufeature = $this.feature.add(_this.properties.layer.get("name"), $this.helper.NewGuid(), unionGeoJSON);
                        if (ufeature) {
                            _this.properties.selectedFeatures.clear();
                            _this.properties.selectedFeatures.insertAt(0, ufeature);
                        } else {
                            $this.helper.Message("Seçili öğelerden ilk öğeyle kesişen herhangi bir öğe olmadığından işlem yapılamadı", "warning", true)
                            $('[data-tool="Select"]').trigger("click");
                            return;
                        }
                    } else {
                        $this.helper.Message("Seçili öğelerden ilk öğeyle kesişen herhangi bir öğe olmadığından işlem yapılamadı", "warning", true)
                        $('[data-tool="Select"]').trigger("click");
                        return;
                    }

                    returnFunction({
                        event: "Union",
                        layer: _this.properties.layer,
                        features: _this.properties.selectedFeatures,
                        featuresRemove: _this.properties.removedFeatures
                    });

                    _this.properties.undoFunction = function (e) {
                        _this.properties.layer.getSource().removeFeature(_this.properties.selectedFeatures.item(0));
                        _this.properties.selectedFeatures.clear();
                        featuresTemp.forEach(function (item, i) {
                            _this.properties.selectedFeatures.insertAt(i, item);
                        });
                        $('[data-tool="Select"]').trigger("click");
                    };

                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*HGK Union Button*/

            /*HGK Intersect Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-squares-1" />')
                .attr('data-tool', 'Intersect')
                .attr('title', "Seçilenleri kesişim noktalarından kopya öğe yarat (Intersect)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();

                    var featureCollection = new ol.Collection();
                    var featuresTemp = _this.properties.selectedFeatures.clone();
                    var featureGeoJSON = _this.properties.selectedFeatures.item(0).getGeoJSON();


                    _this.properties.selectedFeatures.forEach(function (item) {
                        if (item.getId() == _this.properties.selectedFeatures.item(0).getId()) return;
                        var itemGeoJSON = item.getGeoJSON();
                        var intersectGeoJSON = turf.intersect(itemGeoJSON, featureGeoJSON);
                        if (intersectGeoJSON && intersectGeoJSON.geometry.type.indexOf("Polygon") > -1 && (allowMultiGeometry || (intersectGeoJSON && intersectGeoJSON.geometry && intersectGeoJSON.geometry.type.indexOf("Multi") == -1 && !allowMultiGeometry))) {
                            var intersectFeature = $this.feature.add(_this.properties.layer.get("name"), $this.helper.NewGuid(), intersectGeoJSON);
                            if (intersectFeature) {
                                featureCollection.push(intersectFeature);
                            }
                        }
                    });

                    if (featureCollection.getLength() > 0) {
                        _this.properties.selectedFeatures.clear();
                        featureCollection.forEach(function (item) {
                            _this.properties.selectedFeatures.push(item);
                        });
                    } else {
                        $this.helper.Message("Seçili öğelerden ilk öğeyle kesişen herhangi bir öğe olmadığından işlem yapılamadı", "warning", true);
                        $('[data-tool="Select"]').trigger("click");
                        return;
                    }

                    returnFunction({
                        event: "Intersect",
                        layer: _this.properties.layer,
                        features: _this.properties.selectedFeatures,
                        featuresRemove: _this.properties.removedFeatures
                    });


                    _this.properties.undoFunction = function (e) {
                        _this.properties.selectedFeatures.clear();
                        featureCollection.forEach(function (item, i) {
                            _this.properties.layer.getSource().removeFeature(item);
                        });
                        featuresTemp.forEach(function (item, i) {
                            var tFeature = $this.feature.get(item.getId(), item.get("layer"))[item.getId()];
                            if (tFeature) {
                                _this.properties.selectedFeatures.insertAt(_this.properties.selectedFeatures.getLength(), tFeature);
                            }
                        });
                        $('[data-tool="Select"]').trigger("click");
                    };

                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*HGK Intersect Button*/

            /*HGK Disolve Button*/
            $('<button/>')
                .attr("type", "button")
                .append('<i class="flaticon-three" />')
                .attr('data-tool', 'Disolve')
                .attr('title', "Seçili kayıtları bir özelliğe göre grupla (Disolve)")
                .attr("data-placement", "right")
                .addClass("hide")
                .click(function (e) {

                    if ($(this).hasClass("disabled")) return false;
                    $this.interaction.setActive(interactionList, false);
                    $this.mapElement.find(".bufferbox").addClass("hide");
                    $this.mapElement.find(".drawing").find("button").removeClass("active");
                    $(this).addClass("active");
                    _this.properties.removedFeatures.clear();


                    var _columns = _this.properties.layer.get("columns");
                    var content = $('<div id="content" class="clearfix"><div class="text-center alert alert-warning">Disolve işlemi için bir öznitelik seçiniz ve uygula butonuna tıklayınız.</div><div class="row"></div></div>');
                    _columns.forEach(function (item, i) {
                        var div = $('<div class="radio col-md-4" style="margin-top:0px !important;"/>')
                        $('<label/>')
                            .append('<input type="radio" name="columns" value="' + item.ColumnName + '"/>')
                            .append('<span>' + item.ColumnLabel + '</span>')
                            .appendTo(div);
                        content.find("div.row").append(div);
                    });



                    BootstrapDialog.show({
                        size: BootstrapDialog.SIZE_MEDIUM,
                        draggable: true,
                        title: 'Disolve Öznitelik Seçim Aracı',
                        message: content,
                        onshow: function (dialog) {
                            $(dialog.$modalBody).attr("style", "padding:15px !important;");
                            $(dialog.$modalHeader).attr("style", "background-color:#c6324a !important;");
                        },
                        buttons: [{
                            label: 'Vazgeç',
                            cssClass: 'pull-left btn-danger',
                            action: function (dialog) {
                                dialog.close();
                            }
                        }, {
                            label: 'Uygula',
                            cssClass: 'pull-right btn-primary',
                            action: function (dialog) {

                                var features = _this.properties.selectedFeatures;
                                var groupProp = $('.modal-body').find("input:checked").val();

                                $('body').loadingModal({ text: "Seçili öğelere disolve işlemi uygulanıyor.Lütfen bekleyiniz...", animation: 'rotatingPlane', backgroundColor: 'black' });


                                var disolveGeoJSON = turf.dissolve(features.getGeoJSON(), groupProp);

                                if (disolveGeoJSON && disolveGeoJSON.features && disolveGeoJSON.features.length > 0 && disolveGeoJSON.features.length != features.getArray().length) {


                                    var allowid = disolveGeoJSON.features.filter(function (e) { return e.id }).map(function (e) { return e.id });

                                    features.forEach(function (item) {
                                        if (allowid.indexOf(item.getId()) > -1) return;
                                        _this.properties.removedFeatures.insertAt(_this.properties.removedFeatures.getLength(), item);
                                        _this.properties.layer.getSource().removeFeature(item);
                                    });

                                    features.clear();

                                    disolveGeoJSON.features.forEach(function (item) {
                                        if (item.hasOwnProperty("id")) return;
                                        var feature = $this.feature.add(_this.properties.layer.get("name"), $this.helper.NewGuid(), item);
                                        if (feature) {
                                            _this.properties.selectedFeatures.insertAt(_this.properties.selectedFeatures.getLength(), feature);
                                        }
                                    });



                                    returnFunction({
                                        event: "Disolve",
                                        layer: _this.properties.layer,
                                        features: _this.properties.selectedFeatures,
                                        featuresRemove: _this.properties.removedFeatures
                                    });


                                    _this.properties.undoFunction = function (e) {
                                        _this.properties.selectedFeatures.forEach(function (item, i) {
                                            _this.properties.layer.getSource().removeFeature(item);
                                        });
                                        _this.properties.selectedFeatures.clear();

                                        _this.properties.removedFeatures.forEach(function (item, i) {
                                            var feature = $this.feature.add(_this.properties.layer.get("name"), item.getId(), item);
                                            _this.properties.selectedFeatures.insertAt(0, feature);
                                        });
                                        _this.properties.removedFeatures.clear();

                                        $('[data-tool="Select"]').trigger("click");
                                    };


                                } else {
                                    $this.helper.Message("Disolve işlemi sonucu herhangi bir birleştirme mevcut değil", "warning", true);
                                    $('[data-tool="Select"]').trigger("click");
                                    return;
                                }


                                $('body').loadingModal("destroy");

                                dialog.close();
                            }
                        }]
                    });

                })
                .appendTo($this.mapElement.find(".drawing.help"));
            /*HGK Disolve Button*/


            $(document).off("keydown").on("keydown", function (e) {

                //ctrl+z
                if (e.keyCode === 90 && e.ctrlKey && advenced) {
                    _this.properties.undoFunction(e);
                }

                //delete
                if (e.keyCode == 46 && !$('[data-tool="Delete"]').hasClass("hide") && !$('[data-tool="Delete"]').hasClass("active")) {
                    $('[data-tool="Delete"]').trigger("click");
                }

                //esc
                if (e.keyCode == 27 && !$('[data-tool="Select"]').hasClass("active")) {
                    $('[data-tool="Select"]').trigger("click");
                }

            });

            if (!advenced) {

                $this.mapElement.find(".drawing.help").addClass("hide");
                $this.mapElement.find(".drawing.draw").addClass("hide");

                $this.mapElement.find(".drawing.draw button:first-child").trigger("click");


                //$('[data-tool="Buffer"],[data-tool="Intersect"],[data-tool="Merge"],[data-tool="Union"],[data-tool="Clip"],[data-tool="Split"]').remove();
            }

        },
    };

    $this.interaction = {
        properties: {
            list: {}
        },
        load: function () {
            $this.map.getInteractions().forEach(function (interaction) {
                if (interaction instanceof ol.interaction.DoubleClickZoom) {
                    interaction.set('name', 'DoubleClickZoom');
                }
                if (interaction instanceof ol.interaction.DragAndDrop) {
                    interaction.set('name', 'DragAndDrop');
                }
                if (interaction instanceof ol.interaction.DragBox) {
                    interaction.set('name', 'DragBox');
                }
                if (interaction instanceof ol.interaction.DragPan) {
                    interaction.set('name', 'DragPan');
                }
                if (interaction instanceof ol.interaction.DragRotate) {
                    interaction.set('name', 'DragRotateDefault');
                }
                if (interaction instanceof ol.interaction.DragRotateAndZoom) {
                    interaction.set('name', 'DragRotateAndZoom');
                }
                if (interaction instanceof ol.interaction.DragZoom) {
                    interaction.set('name', 'DragZoomDefault');
                }
                if (interaction instanceof ol.interaction.Draw) {
                    interaction.set('name', 'Draw');
                }
                if (interaction instanceof ol.interaction.KeyboardPan) {
                    interaction.set('name', 'KeyboardPan');
                }
                if (interaction instanceof ol.interaction.KeyboardZoom) {
                    interaction.set('name', 'KeyboardZoom');
                }
                if (interaction instanceof ol.interaction.Modify) {
                    interaction.set('name', 'Modify');
                }
                if (interaction instanceof ol.interaction.MouseWheelZoom) {
                    interaction.set('name', 'MouseWheelZoom');
                }
                if (interaction instanceof ol.interaction.PinchRotate) {
                    interaction.set('name', 'PinchRotate');
                }
                if (interaction instanceof ol.interaction.PinchZoom) {
                    interaction.set('name', 'PinchZoom');
                }
                if (interaction instanceof ol.interaction.Select) {
                    interaction.set('name', 'select');
                }
                if (interaction instanceof ol.interaction.Snap) {
                    interaction.set('name', 'Snap');
                }
                if (interaction instanceof ol.interaction.Translate) {
                    interaction.set('name', 'Translate');
                }
                $this.interaction.properties.list[interaction.get('name')] = interaction;
            }, this);


            $this.interaction.remove(["DragZoomDefault", "DragRotateDefault"]);

            this.add("DragZoomDefault", new ol.interaction.DragZoom({
                condition: function (mapBrowserEvent) {
                    var originalEvent = mapBrowserEvent.originalEvent;
                    return (
                      originalEvent.ctrlKey &&
                      !(originalEvent.metaKey || originalEvent.altKey) &&
                      !originalEvent.shiftKey);
                },
                active: true
            }));


            this.add("DragZoom", new ol.interaction.DragZoom({
                condition: ol.events.condition.always,
                active: false,
            }));

            this.add("DragRotate", new ol.interaction.DragRotate({
                condition: ol.events.condition.always,
                active: false
            }));

            $this.interaction.setActive(["DragZoom", "DragRotate"], false);

        },
        add: function (interactionName, interaction) {

            var _this = this;
            var _list = _this.properties.list;

            interactionName = interactionName.trim()

            if (typeof (interactionName) != 'string' || interactionName == '') {
                $this.helper.Message('(' + interactionName + ') Geçersiz overlay isimlendirmesi. Örnek : BenimOverlay'); return;
            }

            if (_list.hasOwnProperty(interactionName)) {
                return _list[interactionName];
            }


            interaction.set("name", interactionName);

            $this.map.addInteraction(interaction);

            _list[interactionName] = interaction;

            return _list[interactionName];

        },
        get: function (interectionNames) {

            var res = new Object();
            var $list = this.properties.list;

            var interectionNames = $this.helper.GetValuesFromList($list, interectionNames);

            interectionNames.forEach(function (e, i) {
                if (!$list.hasOwnProperty(e)) {
                    $this.helper.Message('(' + e + ') isminde bir interaction bulunamadı.');
                    return;
                }
                res[e] = $list[e];
            });
            return res;
        },
        remove: function (interectionNames) {

            var _list = this.properties.list;
            interectionNames = $this.helper.GetValuesFromList(_list, interectionNames);

            $.each(interectionNames, function (i, item) {
                if (typeof (_list[item]) != 'undefined') {
                    $this.map.removeInteraction(_list[item]);
                    delete _list[item];
                }
            });

        },
        setActive: function (interectionNames, status) {

            if (typeof (status) != "boolean") {
                $this.helper.Message('Geçerli bir status giriniz.'); return;
                return false;
            }

            var _list = this.properties.list;

            interectionNames = $this.helper.GetValuesFromList(_list, interectionNames);

            $.each(interectionNames, function (i, item) {
                if (!$this.helper.GetValueFromList(_list, item)) {
                    //$this.helper.Message('( ' + item + ' ) Belirtilen interacton bulunamadı.'); return;
                }
                if (typeof (_list[item]) != 'undefined') {
                    _list[item].setActive(status)
                }
            });
        }
    };

    $this.panel = {
        properties: {
            list: {}
        },
        add: function (id, label, iconClass) {

            var _this = this;
            var pattern = new RegExp("[0-9a-zA-Z]+");

            if (!id || !pattern.test(id)) {
                $this.helper.Message("Lütfen geçerli bir name giriniz. Geçerli karakterler '[0-9a-zA-Z]+'");
                return;
            }

            if (_this.properties.list.hasOwnProperty(id)) {
                return _this.properties.list[id];
            }

            var iconClass = (iconClass ? iconClass : "fa fa-th");
            var label = (label ? label : "Panel Kontrol");

            $('<div/>')
                .addClass('panel-control')
                .attr("id", id)
                .hide()
                .append('<div class="panel-head"><i class="' + iconClass + '"></i> ' + label + '</div>')
                .append('<div class="panel-content" style="height:' + ($this.mapElement.height() - 120) + 'px;overflow:auto;"><ul></ul></div>')
                .appendTo($this.mapElement.find('.panel-container'));

            $(window).on("resize", function () {
                $this.mapElement.find('.panel-container').find("#" + id).find(".panel-content").css("height", ($this.mapElement.height() - 120));
            });

            $('<button/>')
                //.attr('title', label)
                //.attr('data-placement', "left")
                .attr("type", "button")
                .attr("data-target", "#" + id)
                .append('<i class="' + iconClass + '"></i>')
                .on("click", function (e) {

                    e.preventDefault();
                    var _this = $(this);
                    var target = _this.attr('data-target');
                    var container = _this.parents(".panel-container");


                    if (_this.hasClass("active")) {
                        _this.removeClass("active");
                        container.animate({ "right": "-360px" });
                        return;
                    }

                    if (container.find(".panel-nav button.active").length > 0) {
                        container.animate({ "right": "-360px" });
                    }

                    container.animate({ "right": "0px" });
                    container.find(".panel-control").hide();
                    container.find("#" + id).show();
                    _this.siblings().removeClass("active");
                    _this.addClass("active");

                })
                .appendTo($this.mapElement.find('.panel-container .panel-nav'));

            _this.properties.list[id] = {
                id: id,
                label: label,
                icon: iconClass,
                content: $("#" + id).find(".panel-content"),
                button: $('[data-target="#' + id + '"]')
            }

            return _this.properties.list[id];

        },
        get: function (panelIds) {

            var res = new Object();
            var $list = this.properties.list;
            var panelIds = $this.helper.GetValuesFromList($list, panelIds);

            panelIds.forEach(function (e, i) {
                if (!$list.hasOwnProperty(e)) {
                    $this.helper.Message('(' + e + ') isminde bir panel bulunamadı.');
                    return;
                }
                res[e] = $list[e];
            });
            return res;
        },
        remove: function (panelIds) {

            var _list = this.properties.list;
            panelIds = $this.helper.GetValuesFromList(_list, panelIds);

            $.each(panelIds, function (i, item) {
                if (typeof (_list[item]) != 'undefined') {
                    $("#" + item).remove();
                    $('[data-target="#' + item + '"]').remove();
                    delete _list[item];
                }
            });

        }
    };

    $this.helper = {
        ExtentToFeature: function (extent) {
            try {
                return new ol.Feature({
                    geometry: ol.geom.Polygon.fromExtent(extent),
                    type: "Polygon"
                });
            } catch (e) {
                return null;
            }
        },
        SQLtoFeature: function (sqlGeometry) {
            var format = new ol.format.WKT();
            try {
                return format.readFeature(sqlGeometry, {
                    dataProjection: "EPSG:4326",
                    featureProjection: $this.map.getView().getProjection().getCode()
                });
            } catch (e) {
                return null;
            }
        },
        SQLtoGeometry: function (sqlGeometry) {
            var format = new ol.format.WKT();
            try {
                return format.readGeometry(sqlGeometry, {
                    dataProjection: "EPSG:4326",
                    featureProjection: $this.map.getView().getProjection().getCode()
                });
            } catch (e) {
                return null;
            }
        },
        GeoJSONtoFeature: function (featurGeoJSON) {
            var format = new ol.format.GeoJSON();
            try {
                return format.readFeature(featurGeoJSON, {
                    dataProjection: "EPSG:4326",
                    featureProjection: $this.map.getView().getProjection().getCode()
                });
            } catch (e) {
                return null;
            }
        },
        GeoJSONtoFeatures: function (featuresGeoJSON) {
            var format = new ol.format.GeoJSON();
            try {
                return format.readFeatures(featuresGeoJSON, {
                    dataProjection: "EPSG:4326",
                    featureProjection: $this.map.getView().getProjection().getCode()
                });
            } catch (e) {
                return null;
            }
        },
        GeoJSONtoGeometry: function (geometryGeoJSON) {
            var format = new ol.format.GeoJSON()
            try {
                return format.readGeometry(geometryGeoJSON, {
                    dataProjection: "EPSG:4326",
                    featureProjection: $this.map.getView().getProjection().getCode()
                });
            } catch (e) {
                return null;
            }
        },
        GetValueFromList: function (list, value) {

            var res = false;
            $.each(list, function (i, item) {
                if (i == value) {
                    res = true;
                }
            });
            return res;

        },
        GetValuesFromList: function (list, value) {

            var res = new Array();

            if (typeof (value) == 'string') {
                res = [value];
            }

            if (value == null || typeof (value) == 'undefined') {
                $.each(list, function (i, item) {
                    res.push(i);
                });
            }

            if ($.isArray(value)) {
                res = value;
            }
            return res;
        },
        Message: function (message, type, status) {

            if ($this.options.debugMode) {
                console.info(message);
            }

            if (status) {
                $this.mapElement.trigger("message", {
                    message: message,
                    type: type
                });
            }

        },
        NewGuid: function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
              s4() + '-' + s4() + s4() + s4();
        },
        PanTo: function (extent) {
            $this.map.getView().fit(extent, $this.map.getSize());
        },
        RandomColor: function (opacity) {
            var res = new Array();
            res.push(Math.floor(Math.random() * 256));
            res.push(Math.floor(Math.random() * 256));
            res.push(Math.floor(Math.random() * 256));
            res.push(!isNaN(parseFloat(opacity)) ? opacity : (Math.floor(Math.random() * 6) / 10 + 0.5));
            return res;
        },
        ColorToObject: function (color, opacity) {

            var opacity = typeof (opacity) == "number" ? opacity : 1;

            var resultObject = [255, 255, 255, opacity];

            if (typeof (color) == "object") {

                if (color.length == 3) {
                    resultObject = color.push(opacity);
                }

                resultObject = color;

            } else {

                color = color.toUpperCase().trim();

                if (color.indexOf("#") == 0) {
                    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                    color = color.replace(shorthandRegex, function (m, r, g, b) {
                        return r + r + g + g + b + b;
                    });
                    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);

                    if (result) {
                        resultObject = [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), opacity];
                    }
                }

                if (color.indexOf("RGBA(") == 0) {
                    resultObject = color.replace("RGBA(", "").replace(")", "").split(" ").join("").split(",");
                }

                if (color.indexOf("RGB(") == 0) {
                    var result = color.replace("RGB(", "").replace(")", "").split(" ").join("").split(",");
                    result.push(opacity);
                    resultObject = result;
                }
            }
            return resultObject.map(function (e) { return parseFloat(e) });
        },
        ObjectToHex: function (colorObject) {
            return (colorObject && colorObject.length === 4) ? "#" +
                ("0" + parseInt(colorObject[0], 10).toString(16)).slice(-2) +
                ("0" + parseInt(colorObject[1], 10).toString(16)).slice(-2) +
                ("0" + parseInt(colorObject[2], 10).toString(16)).slice(-2) : '#FFFFFF';
        },
        SqlToText: function (str) {
            var str = str.split("AND").join("ve");
            str = str.split("and").join("ve");
            str = str.split("OR").join("veya");
            str = str.split("or").join("veya");
            str = str.split("BETWEEN").join("Arasında");
            str = str.split("NOT BETWEEN").join("Arasında değil");
            str = str.split(">=").join("büyük eşitse");
            str = str.split("=<").join("küçük eşitse");
            str = str.split("!=").join("eşit değilse");
            str = str.split("=").join("eşitse");
            str = str.split(">").join("büyükse");
            str = str.split("<").join("küçükse");
            str = str.split("NOT LIKE").join("içermiyorsa");
            str = str.split("LIKE").join("içeriyorsa");
            str = str.split("IN").join("içinde varsa");
            str = str.split("NOT IN").join("içinde yoksa");
            return str;
        }
    }

    function init() {

        $this.map = new ol.Map({
            target: $this.mapElement.attr("id"),
            view: new ol.View({
                projection: $this.options.projection,
                center: $this.options.center,
                zoom: $this.options.zoom,
                minZoom: $this.options.minZoom,
                maxZoom: $this.options.maxZoom
            })
        });

        $($this.mapElement).attr('data-role', 'Harita');

        $this.interaction.load();

        $.each($this.layer.properties.defaults, function (i, e) {
            if (i == $this.options.altlik) {
                e.setVisible(true);
            }
            $this.layer.addCustom(e.get("label"), i, e);
        })

        /*Tool'lar buraya gelecek*/
        $this.mapElement.children(".ol-viewport").children(".ol-overlaycontainer-stopevent").append('<div class="tool-container"/>');
        $this.mapElement.children(".ol-viewport").children(".ol-overlaycontainer-stopevent").append('<div class="panel-container"><div class="panel-nav ol-control"></div></div>');
        /*Tool'lar buraya gelecek*/


        if ($this.options.uiMinimap) {
            $this.map.getControls().push(new ol.control.OverviewMap({
                className: 'ol-overviewmap ol-custom-overviewmap',
                layers: [
                  new ol.layer.Tile({
                      source: new ol.source.XYZ({
                          'url': 'http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                      })
                  })
                ],
                collapseLabel: '\u00BB',
                label: '\u00AB',
                collapsed: false,
                view: new ol.View({
                    projection: $this.map.getView().getProjection().getCode()
                })
            }));
        }

        if ($this.options.uiInfo) {
            $this.mapElement.children(".ol-viewport").children(".ol-overlaycontainer-stopevent").append('<div class="info-control ol-control"><button type="button" data-placement="right" title="Bilgilendirme" data-tool="Slide" data-target=".info-content">i</button><div class="info-content"><strong>' + $this.defaultOptions.uiInfoContent + '</strong></div></div>');
        }

        if ($this.options.uiMousePosition) {

            var ul = $('<ul class="ol-mouse-position-nav">');

            $this.controlMousePosition = new ol.control.MousePosition({
                projection: $this.options.projection,
                coordinateFormat: function (coordinate) {
                    if (globalDefine.projection == "EPSG:4326") {
                        return '<div class="mousePosition ol-unselectable">Koordinat :  ' + ol.coordinate.toStringHDMS(coordinate) + '</div>';
                    } else {
                        return ol.coordinate.format(coordinate, '<div class="mousePosition ol-unselectable">Koordinat : {y} , {x}</div>', 5);
                    }
                },
                undefinedHTML: '<div class="mousePosition ol-unselectable">Koordinat :  Bilinmeyen konum</div>'
            });

            var elem = $('<div class="ol-mouse-position-element"><i class="fa fa-cogs"></i></div>').on("click", function (e) {
                e.preventDefault();
                ul.slideToggle();
            });

            $this.map.getControls().push($this.controlMousePosition);
            $($this.controlMousePosition.element).before(ul);
            $($this.controlMousePosition.element).before(elem);


            var projLikeList = {
                "UTM WGS84": ol.proj.get('EPSG:3857'),
                "CRS WGS84": ol.proj.get('EPSG:4326'),
            };

            for (var i = 1; i < 61; i++) {
                var code = "EPSG:326" + ((i > 0 && i < 10) ? "0" + i : i.toString());
                proj4.defs(code, '+proj=utm +zone=' + i + ' +ellps=WGS84 +datum=WGS84 +units=m +no_defss');
                var proj = ol.proj.get(code);
                proj.setExtent([166021.4431, 0.0000, 833978.5569, 9329005.1825]);
            }





            $.each(projLikeList, function (name, proj) {

                var code = proj.getCode();
                $('<li data-code="' + code + '">' + name + '<span></span></li>')
                    .on("click", function (e) {
                        if ($(this).hasClass("active")) {
                            return false;
                        }

                        $(this).addClass("active").siblings("li").removeClass("active");
                        var targetProjection = code;
                        var availableProjection = $this.map.getView().getProjection().getCode();
                        var zoom = $this.map.getView().getZoom();
                        var center = ol.proj.transform($this.map.getView().getCenter(), availableProjection, targetProjection);
                        globalDefine.projection = targetProjection;


                        if (targetProjection == "EPSG:3857") {
                            var mycenter = ol.proj.transform($this.map.getView().getCenter(), $this.map.getView().getProjection().getCode(), "EPSG:4326")[0];
                            var mycenter = Math.abs(Math.floor(mycenter / 360) * 360 - mycenter);
                            var dilim = (parseInt((mycenter + 180) / 6) + 1) % 60;
                            var proj = "EPSG:326" + (dilim.toString().length == 1 ? "0" + dilim : dilim.toString());
                            $this.controlMousePosition.setProjection(ol.proj.get(proj));
                            $('li[data-code="EPSG:3857"] span').text(" (" + dilim + ". dilim)");
                        } else {
                            $this.controlMousePosition.setProjection(ol.proj.get(targetProjection));
                        }



                        //View Projection değiştiriliyor
                        $this.map.setView(new ol.View({
                            projection: ol.proj.get(targetProjection),
                            center: center,
                            zoom: zoom,
                            minZoom: $this.options.minZoom,
                            maxZoom: $this.options.maxZoom,
                        }));




                        $this.map.getView().on("change:center", function (e) {
                            if (e.target.getProjection().getCode() == "EPSG:3857") {
                                $this.map.getView().on("change:center", function (e) {
                                    if (e.target.getProjection().getCode() == "EPSG:3857") {
                                        var mycenter = ol.proj.transform(e.target.getCenter(), e.target.getProjection().getCode(), "EPSG:4326")[0];
                                        var mycenter = Math.abs(Math.floor(mycenter / 360) * 360 - mycenter);
                                        var dilim = (parseInt((mycenter + 180) / 6) + 1) % 60;
                                        var proj = "EPSG:326" + (dilim.toString().length == 1 ? "0" + dilim : dilim.toString());
                                        $this.controlMousePosition.setProjection(ol.proj.get(proj));
                                        $('li[data-code="EPSG:3857"] span').text(" (" + dilim + ". dilim)");
                                    }
                                });
                            }
                        });

                        //Minimap Projection değiştiriliyor
                        $this.map.getControls().forEach(function (control) {
                            if (control instanceof ol.control.OverviewMap) {
                                control.getOverviewMap().setView(new ol.View({
                                    projection: ol.proj.get(targetProjection),
                                    center: center,
                                    zoom: zoom
                                }));
                            }
                        });

                        //Vector Layer Projection değiştiriliyor
                        var transform = ol.proj.getTransform(availableProjection, ol.proj.get(targetProjection));
                        $this.map.getLayers().forEach(function (layer) {
                            if (layer instanceof ol.layer.Vector && layer.getVisible()) {
                                var formatter = new ol.format.GeoJSON();
                                layer.getSource().forEachFeature(function (feature) {
                                    feature.getGeometry().applyTransform(transform);
                                });
                            }
                        });
                        ul.slideToggle();
                    })
                    .trigger(code == $this.map.getView().getProjection().getCode() ? "click" : "change")
                    .appendTo(ul);
            });
        }

        if ($this.options.uiScaleLine) {


            var input = $('<input type="text"/>')
                .val($this.map.getView().getScale().toLocaleString("TR-tr"))
                .on("keydown", function (e) {
                    if (e.keyCode == 13) {
                        $this.map.getView().setScale($(this).val())
                    }
                });

            var span = $('<span> (' + $this.map.getView().getZoom().toFixed(0) + ') </span>');

            var scale = $('<div class="ol-scale-bar"/>')
                .append('<strong>1 : </strong>')
                .append(input)
                .append(span)


            var scaleBar = $('<div id="scaleBar" class="ol-scale-control"/>')
                .append(scale)
                .on("click", function (e) {
                    var unit = $this.controlScaleLine.getUnits();
                    $(this).find("li").removeClass("active");
                    $(this).find('li[data-value="' + unit + '"]').addClass("active")
                    $(this).find("ul").slideToggle();
                })
                .appendTo($this.mapElement.children(".ol-viewport").children(".ol-overlaycontainer-stopevent"));

            $this.controlScaleLine = new ol.control.ScaleLine({
                target: "scaleBar"
            });

            $this.map.getView().on("change:resolution", function (e) {
                var zoom = $this.map.getView().getZoom() ? $this.map.getView().getZoom().toFixed(0) : 0;
                input.val($this.map.getView().getScale().toLocaleString("TR-tr"))
                span.text(' (' + zoom + ') ');
            });

            $this.map.on("change:view", function (e) {
                e.target.getView().on("change:resolution", function (e) {
                    var zoom = $this.map.getView().getZoom() ? $this.map.getView().getZoom().toFixed(0) : 0;
                    input.val($this.map.getView().getScale().toLocaleString("TR-tr"))
                    span.text(' (' + zoom + ') ');
                });
            });

            $this.map.getControls().push($this.controlScaleLine);
        }




        if ($this.options.uiSearch) {

            $this.mapElement.children(".ol-viewport").children(".ol-overlaycontainer-stopevent")
                .append('<div class="search-control ol-control"><button  title="Konum Arama" data-placement="top" data-tool="Slide" data-target=".search-content"><i class="fa fa-search"></i></button><div class="search-content" style="display:none;"><input type="text" placeholder="Konum giriniz" name="search-input"></div></div>');

            $('[data-target=".search-content"]').click(function () {
                function focusFunction() {
                    $('[name="search-input"]').focus();
                }
                setTimeout(focusFunction, 100);
            });

            //Kendo Autocomplate yazılacak
            //$('[name="search-input"]').autocomplete({
            //    position: {
            //        my: "left bottom",
            //        at: "left top"
            //    },
            //    source: function (req, resp) {

            //        var acService = new google.maps.places.AutocompleteService();

            //        req.term = req.term.split(", ").join(",");
            //        req.term = req.term.split(" ").join(",");
            //        var keyArray = req.term.split(",");

            //        if (keyArray.length == 2 && keyArray[0] != null && keyArray[0] != "" && isNaN(keyArray[0]) == false && keyArray[1] != null && keyArray[1] != "" && isNaN(keyArray[1]) == false) {

            //            var locateObj = [];
            //            locateObj.push({ lat: keyArray[0], lon: keyArray[1], display_name: "Konuma Git" });



            //            resp($.map(locateObj, function (item) {
            //                return {
            //                    label: item.display_name,
            //                    value: item.display_name,
            //                    coordinate: [parseFloat(item.lon), parseFloat(item.lat)]
            //                }
            //            }));
            //        }
            //        else {
            //            acService.getPlacePredictions({
            //                input: req.term,

            //            }, function (places, status) {
            //                if (status === google.maps.places.PlacesServiceStatus.OK) {
            //                    var _places = [];
            //                    for (var i = 0; i < places.length; ++i) {
            //                        _places.push({
            //                            id: places[i].place_id,
            //                            value: places[i].description,
            //                            label: places[i].description
            //                        });
            //                    }
            //                    resp(_places);
            //                    console.log(resp);
            //                }
            //                else {
            //                    resp(_places);
            //                }
            //            });
            //        }
            //    },
            //    minLength: 4,
            //    select: function (e, o) {


            //        $this.mapElement.trigger("selected:location", o);


            //        if (o.item.coordinate && o.item.coordinate != null && o.item.coordinate.length >= 2) {
            //            if ($this.layer.properties.list["DrawLayer"]) {
            //                featurePoint(o.item.coordinate[0], o.item.coordinate[1])
            //            }

            //            $this.map.getView().animate({
            //                center: ol.proj.transform(o.item.coordinate, ol.proj.get("EPSG:4326"), $this.map.getView().getProjection()),
            //                zoom: 18
            //            });

            //        }

            //        else {

            //            var placesService = new google.maps.places.PlacesService(document.createElement('div'));

            //            placesService.getDetails({
            //                placeId: o.item.id
            //            }, function (place, status) {
            //                if (status === google.maps.places.PlacesServiceStatus.OK) {

            //                    if ($this.layer.properties.list["DrawLayer"]) {
            //                        featurePoint(place.geometry.location.lng(), place.geometry.location.lat())
            //                    }

            //                    $this.map.getView().animate({
            //                        center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], ol.proj.get("EPSG:4326"), $this.map.getView().getProjection()),
            //                        zoom: 18

            //                    });
            //                }
            //            });
            //        }
            //    }
            //});

            function featurePoint(lng, lat) {

                var feature = $this.feature.add("DrawLayer", $this.helper.NewGuid(), "POINT (" + lng + " " + lat + ")");
                $this.drawing.properties.selectedFeatures.insertAt(0, feature);

                $('#' + $this.mapElement.attr('id').replace('MapToggle', "")).val(feature ? feature.getSQL() : '').trigger('change');
                //window.setTimeout(function () {
                //    $('#' + $this.mapElement.attr('id')).slideUp()
                //},2000)

            }
        }

        if ($this.options.uiDefault) {
            new ol.control.FullScreen().setMap($this.map);
        }

        if ($this.options.uiDefault) {
            $('<div class="ol-control default-control clearfix" />')
                .append('<button type="button" data-tool="Home" style="width:66px;" title="İlk konum" data-placement="right"><i class="flaticon-web"></i></button>')
                .append('<button type="button" data-tool="ZoomIn" title="Zoom artır" data-placement="right"><i class="flaticon-multimedia"></i></button>')
                .append('<button type="button" data-tool="ZoomOut" title="Zoom azalt" data-placement="right"><i class="flaticon-interface"></i></button>')
                .append('<button type="button" data-tool="DragZoom" title="Zoom" data-placement="right"><i class="flaticon-zoom-in"></i></button>')
                .append('<button type="button" data-tool="DragRotate" title="Döndürme aracı" data-placement="right"><i class="flaticon-screen"></i></button>')
                .append('<button type="button" data-tool="DragPan" title="Taşıma aracı" data-placement="right"><i class="flaticon-stop"></i></button>')
                .append('<button type="button" data-tool="Swipe" title="Katman Perdesi" data-placement="right"><i class="flaticon-arrows-1"></i></button>')
                .append('<button type="button" data-tool="FullScreen" title="Tam Ekran" data-placement="right"><i class="fa">⤢</i></button></div>')
                .append('<button type="button" data-tool="Spy" title="Katman Görüntüleyici" data-placement="right" class="hide"><i class="flaticon-search"></i></button></div>')
                .appendTo($this.mapElement.find(".tool-container"));
        }

        if ($this.options.uiExportDocument) {
            $('<div class="ol-control export-control clearfix" />')
                .append('<button type="button" data-tool="Export" data-target="JPEG" title="Ekranı .jpeg olarak kaydet" data-placement="right"><i class="fa fa-picture-o"></i></button>')
                .append('<button type="button" data-tool="Export" data-target="PDF" title="Ekranı .pdf olarak kaydet" data-placement="right"><i class="fa fa-file-pdf-o"></i></button>')
                .append('<button type="button" data-tool="Export" data-target="PRINT" title="Ekranı çıktı al" data-placement="right"><i class="fa fa-print"></i></button>')
                .appendTo($this.mapElement.find(".tool-container"));
        }

        if ($this.options.uiMesurement) {
            $('<div class="ol-control mesurement-control clearfix" />')
                .append('<button type="button" data-tool="Mesurement" data-target="LineString" title="Uzunluk hesaplama" data-placement="right"><i class="flaticon-tools"></i></button>')
                .append('<button type="button" data-tool="Mesurement" data-target="Polygon" title="Alan hesaplama" data-placement="right"><i class="flaticon-tools-1"></i></button>')
                .appendTo($this.mapElement.find(".tool-container"));
        }

        if ($this.options.uiAltlik) {
            $this.layer.createControl("altliklar", "ALTLIKLAR", "flaticon-layers-1", ["Default1", "Default2", "Default3", "Default4", "Default5", "Default6", "Default7", "Default8"]);
        }

        //if ($this.options.uiAltlikMini) {

        //    var classes = ['fa fa-send', 'fa fa-send-o', 'fa fa-flag', 'fa fa-star'];

        //    $('<div class="ol-control export-control clearfix" data-target="AltlikMini" />')
        //        .appendTo($this.mapElement.find(".tool-container"));

        //    $.each($this.layer.properties.list, function (i, item) {

        //        var btn = $('<button type="button" title="' + i + '" data-placement="right"><i class="' + classes[i] + '"></i></button>');

        //        $('[data-target="AltlikMini"]')
        //            .append(btn);

        //    });

        //}

        if ($this.options.ImportDragAndDrop) {

            var interaction = new ol.interaction.DragAndDrop();

            interaction.on('addfeatures', function (event) {

                if (!$this.options.ImportDragAndDrop) return;

                var file = event.file;
                var fileName = file.name;
                var uzanti = fileName.split(".")[fileName.split(".").length - 1].toLowerCase();
                var infoElem = $('.info-control.ol-control .info-content');
                var allowExtension = ["geojson", "kml", "kmz"];

                if (file.size > 200000000) {
                    $this.helper.Message(fileName + " dosyası çok büyük işlem yapılamıyor. En fazla 200mblık dosya gösterimi yapabilirsiniz.", "error", true);
                    return;
                }

                if (allowExtension.indexOf(uzanti) == -1) {
                    $this.helper.Message(fileName + 'dosyası izin verilen formatlarda değil.Yükleyeceğiniz dosyalar (' + allowExtension.join(",") + ') uzantılı olmalıdır.', "error", true);
                    return;
                }

                $this.mapElement.trigger("import:data", event);

            });
            $this.interaction.add("DragAndDrop", interaction);
        }

        var swipe = null;

        $this.mapElement.find(".default-control,.mesurement-control,.export-control").find('[data-tool]')
            .on('click', function (e) {

                e.preventDefault();

                var button = $(this);
                var tool = button.attr('data-tool');
                var target = button.attr('data-target');

                switch (tool) {
                    case "FullScreen":

                        $this.mapElement.find('.ol-full-screen').children("button").trigger("click");

                        break;
                    case "Home":

                        $this.map.getView().setCenter($this.options.center);
                        $this.map.getView().setZoom($this.options.zoom);
                        $this.map.getView().setRotation(0);

                        break;
                    case "DragPan":

                        button.siblings('[data-tool^="Drag"]').removeClass("active");
                        button.addClass("active");
                        $this.interaction.setActive(["DragPan", "DragZoom", "DragRotate", "DragSelect"], false);
                        $this.interaction.setActive(["DragPan"], true);

                        break;
                    case "DragRotate":

                        button.siblings('[data-tool^="Drag"]').removeClass("active");
                        button.addClass("active");
                        $this.interaction.setActive(["DragPan", "DragZoom", "DragRotate", "DragSelect"], false);

                        $this.interaction.setActive(["DragRotate"], true);


                        break;
                    case "DragZoom":

                        button.siblings('[data-tool^="Drag"]').removeClass("active");
                        button.addClass("active");
                        $this.interaction.setActive(["DragPan", "DragZoom", "DragRotate", "DragSelect"], false);
                        $this.interaction.setActive(["DragZoom"], true);


                        break;
                    case "ZoomIn":

                        $('.ol-zoom .ol-zoom-in').trigger('click');

                        break;
                    case "ZoomOut":

                        $('.ol-zoom .ol-zoom-out').trigger('click');

                        break;
                    case "Swipe":

                        if (!button.hasClass("active")) {
                            button.addClass("active");
                            var sonlayer = $.Enumerable.From($this.map.getLayers().getArray()).Where(function (e, i) { return (e.get("type") == "XYZ" || e.get("type") == "BingMaps") && e.getVisible() == true && e.get("name") != $this.options.altlik; }).LastOrDefault();
                            var leftLayer = $this.layer.get($this.options.altlik)[$this.options.altlik];
                            var rightLayer = sonlayer ? sonlayer : $this.layer.get("Default2")["Default2"];
                            $this.layer.setVisible(leftLayer.get("name"), true);
                            $this.layer.setZindex(leftLayer.get("name"), 11);
                            $this.layer.setVisible(rightLayer.get("name"), true);
                            swipe = new ol.control.Swipe();
                            swipe.set("orientation", "vertical"); //horizontal
                            swipe.addLayer(leftLayer);
                            swipe.addLayer(rightLayer, true);
                            $this.map.addControl(swipe);
                        } else {
                            button.removeClass("active");
                            $this.layer.setZindex($this.options.altlik, 10);
                            $this.layer.setVisible($this.options.altlik, true);
                            $this.map.removeControl(swipe);
                        }

                        break;

                    case "Export":

                        var uzanti = $(this).attr("data-target");
                        var fileName = 'CSB-' + new Date().toLocaleString().split(" ").join("-").split(":").join("-").split(".").join("-");

                        switch (uzanti) {
                            case "PRINT":

                                window.setTimeout(function () {
                                    $this.map.once('postcompose', function (event) {
                                        var image = new Image();
                                        image.src = event.context.canvas.toDataURL('image/jpeg', 0.01);
                                        image.onload = function () {
                                            $(image).print();
                                        }
                                    });
                                    $this.map.renderSync();
                                }, 1000);

                                break;

                            case "JPEG":


                                $this.map.once('postcompose', function (event) {
                                    event.context.canvas.toBlob(function (blob) {
                                        saveAs(blob, fileName + ".JPEG");
                                    }, "image/jpeg", 0.9);
                                });
                                $this.map.renderSync();


                                break;
                            case "PDF":


                                var loading = 0;
                                var loaded = 0;
                                var format = "A4";
                                var resolution = 72;
                                var dim = [297, 210];
                                var width = Math.round(dim[0] * resolution / 25.4);
                                var height = Math.round(dim[1] * resolution / 25.4);
                                var size = ($this.map.getSize());
                                var extent = $this.map.getView().calculateExtent(size);
                                var source = $.Enumerable.From($this.map.getLayers().getArray()).Where(function (e, i) {
                                    return (e.get("type") == "OSM" || e.get("type") == "XYZ" || e.get("type") == "BingMaps") && e.getVisible() == true
                                }).FirstOrDefault().getSource();

                                var tileLoadStart = function () {
                                    ++loading;
                                };

                                var tileLoadEnd = function () {
                                    ++loaded;
                                    if (loading === loaded) {
                                        var canvas = this;
                                        window.setTimeout(function () {
                                            loading = 0;
                                            loaded = 0;
                                            var data = canvas.toDataURL('image/png');
                                            var pdf = new jsPDF('landscape', undefined, format);
                                            pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
                                            pdf.setFontSize(12);
                                            pdf.text(15, 200, "Harita Genel Komutanligi - TOPOVT " + new Date().toLocaleString());
                                            pdf.save(fileName + '.PDF');
                                            source.un('tileloadstart', tileLoadStart);
                                            source.un('tileloadend', tileLoadEnd, canvas);
                                            source.un('tileloaderror', tileLoadEnd, canvas);
                                            $this.map.setSize(size);
                                            $this.map.getView().fit(extent, size);
                                            $this.map.renderSync();
                                        }, 100);
                                    }
                                };

                                $this.map.once('postcompose', function (event) {
                                    source.on('tileloadstart', tileLoadStart);
                                    source.on('tileloadend', tileLoadEnd, event.context.canvas);
                                    source.on('tileloaderror', tileLoadEnd, event.context.canvas);
                                });

                                $this.map.setSize([width, height]);
                                $this.map.getView().fit(extent, ($this.map.getSize()));
                                $this.map.renderSync();

                                break;
                        }

                        break;
                    case "Mesurement":


                        var UnitConvert = function (val, type) {

                            var birim = $('[data-event="MeasurementUnitPicker"]').val();

                            if (type == 'distance') {

                                if (birim == 'M') {
                                    res = val * 1000;
                                } else if (birim == 'MIL') {
                                    res = val * 0.621371192;
                                } else if (birim == 'DMIL') {
                                    res = val * 0.539956803;
                                } else {
                                    res = val;
                                }

                            }
                            else {

                                if (birim == 'M') {
                                    res = val * 1000000;
                                } else if (birim == 'MIL') {
                                    res = val * 0.3861022;
                                } else if (birim == 'DMIL') {
                                    res = val * 0.291181;
                                } else {
                                    res = val;
                                }

                            }
                            return res;
                        }

                        $this.layer.remove("MeasurementLayer");
                        $this.interaction.remove("MeasurementDraw");
                        $this.panel.remove("Mesurement");

                        if (button.hasClass("active")) {
                            button.removeClass("active");
                            $('.panel-container').find(".panel-nav button:first-child").trigger("click");
                            return;
                        }

                        button.siblings().removeClass("active");
                        button.addClass("active");


                        var MeasurementLayer = $this.layer.addVector("Ölçüm Layerı", "MeasurementLayer", "Measurement");
                        var tPanel = $this.panel.add('Mesurement', 'Ölçüm Hesaplamaları', 'fa fa-arrows-alt');

                        $(document)
                            .off('mouseenter', '[data-event="MeasurementDetail"]')
                            .on('mouseenter', '[data-event="MeasurementDetail"]', function () {
                                $(this).siblings().removeClass("active");
                                $(this).addClass("active");
                                $this.feature.remove('MeasurementLayer', 'MeasurementDetail');
                                $this.feature.add('MeasurementLayer', 'MeasurementDetail', JSON.parse($(this).attr('data-geom').replace(/'/g, '"'))).setStyle($this.style.get('Selected')['Selected']);
                            })
                            .off('change', '[data-event="MeasurementUnitPicker"]')
                            .on('change', '[data-event="MeasurementUnitPicker"]', function () {

                                var birim = $(this).val();

                                $.each($('[data-event="MeasurementDetail"]'), function (i, item) {

                                    var val = parseFloat($(item).attr('data-value'));

                                    res = UnitConvert(val, $(this).attr('data-unit'));

                                    $(item).find('[data-event="MeasurementUnit"]').html(birim + ($(this).attr('data-unit') == 'area' ? '<sup>2</sup>' : ''));
                                    $(item).find('[data-event="MeasurementValue"]').html(res.toLocaleString());

                                });

                            })
                        ;


                        tPanel.content.html(
                            '<select class="form-control" data-event="MeasurementUnitPicker" style="margin-bottom: 15px;font-weight:bold;">' +
                            '   <option value="M">' + 'Metre' + '</option>' +
                            '   <option value="KM" selected>' + 'Kilo Metre' + '</option>' +
                            '   <option value="MIL">' + 'Mil' + '</option>' +
                            '   <option value="DMIL">' + 'Deniz Mili' + '</option>' +
                            '</select>' +
                            '<ul></ul>');


                        $this.interaction.setActive(["Select", "Draw", "Hover", "Modify", "Translate", "AddPolygon", "Split", "CutIn", "CutIn", "DragSelect"], false);


                        var MeasurementDraw = new ol.interaction.Draw({
                            type: target,
                            source: MeasurementLayer.getSource(),
                            style: $this.style.get("Measurement")["Measurement"]
                        });

                        MeasurementDraw.on('drawstart', function (e) {

                            $this.layer.get('MeasurementLayer')['MeasurementLayer'].getSource().forEachFeature(function (feature) {
                                $this.layer.get('MeasurementLayer')['MeasurementLayer'].getSource().removeFeature(feature);
                            });

                            e.feature.getGeometry().on('change', function (evt) {
                                var geom = evt.target;

                                var birim = $('[data-event="MeasurementUnitPicker"]').val();

                                if (geom instanceof ol.geom.Polygon) {

                                    tPanel.content.find('ul').html(null);

                                    var _coords = e.feature.getGeoJSON().geometry.coordinates[0].slice(0, e.feature.getGeoJSON().geometry.coordinates[0].length - 1);

                                    if (_coords < 3) {
                                        return;
                                    }

                                    for (var i = 3; i <= _coords.length; i++) {

                                        var coord = _coords.slice(0, i);
                                        coord.push(coord[0]);

                                        var tempGeo = { "type": "Feature", "properties": null, "geometry": { "type": "Polygon", "coordinates": [coord] } };

                                        var value = turf.area(tempGeo) / 1000000;

                                        $('<li style="font-size: 14px;text-align: right;"/>')
                                            .attr("data-unit", "area")
                                            .attr("data-value", value)
                                            .attr("data-event", "MeasurementDetail")
                                            .attr("data-geom", JSON.stringify(tempGeo).replace(/"/g, '\''))
                                            .append('<span data-event="MeasurementValue">' + UnitConvert(value, 'area').toLocaleString() + '</span>')
                                            .append('<small style="min-width: 40px;display: inline-block;font-weight:bold" data-event="MeasurementUnit">' + birim + '<sup>2</sup></small>')
                                            .appendTo(tPanel.content.find('ul'));

                                    }

                                } else if (geom instanceof ol.geom.LineString) {

                                    tPanel.content.find('ul').html(null);

                                    var _coords = e.feature.getGeoJSON().geometry.coordinates;

                                    for (var i = 0; i < _coords.length - 1; i++) {

                                        var coord = [_coords[i], _coords[i + 1]];

                                        var tempGeo = { "type": "Feature", "properties": null, "geometry": { "type": "LineString", "coordinates": coord } };

                                        var value = turf.lineDistance(tempGeo, 'kilometers');

                                        $('<li style="font-size: 14px;text-align: right;"/>')
                                           .attr("data-unit", "distance")
                                           .attr("data-value", value)
                                           .attr("data-event", "MeasurementDetail")
                                           .attr("data-geom", JSON.stringify(tempGeo).replace(/"/g, '\''))
                                           .append('<span data-event="MeasurementValue">' +
                                           UnitConvert(value, 'distance').toLocaleString()
                                           + '</span>')
                                           .append('<small style="min-width: 40px;display: inline-block;font-weight:bold" data-event="MeasurementUnit">' + birim + '</small>')
                                           .appendTo(tPanel.content.find('ul'));

                                    }

                                }
                            });

                        }, this);

                        MeasurementDraw.on('drawend', function (e) {

                            var geom = e.feature.getGeometry();
                            var birim = $('[data-event="MeasurementUnitPicker"]').val();

                            if (geom instanceof ol.geom.LineString) {

                                var tempGeo = e.feature.getGeoJSON();
                                var value = turf.lineDistance(tempGeo, 'kilometers');

                                $('<li style="font-size: 14px;text-align: right;"/>')
                                   .attr("data-unit", "distance")
                                   .attr("data-value", value)
                                   .attr("data-event", "MeasurementDetail")
                                   .attr("data-geom", JSON.stringify(tempGeo).replace(/"/g, '\''))
                                   .append('<span data-event="MeasurementValue">' +
                                   UnitConvert(value, 'distance').toLocaleString()
                                   + '</span>')
                                   .append('<small style="min-width: 40px;display: inline-block;font-weight:bold" data-event="MeasurementUnit">' + birim + '</small>')
                                   .appendTo(tPanel.content.find('ul'));


                            }

                        }, this);

                        $this.interaction.add("MeasurementDraw", MeasurementDraw);


                        if (!tPanel.button.hasClass('active')) {
                            tPanel.button.trigger('click');
                        }

                        break;
                }

            });

        $this.mapElement.find('[data-tool="DragPan"]').trigger("click");

        $this.mapElement.data("AkilliHarita", $this);

    }

    init();

    $this.mapElement.find('[data-tool="Slide"]').on('click', function (e) {
        e.preventDefault();
        $($(this).attr("data-target")).slideToggle({ duration: 0 });
    });

    $(document).livequery($this.mapElement.find('[title]'),function () {
        var placement = $(this).attr("data-placement");
        $(this).tooltip({
            trigger: "hover",
            placement: placement ? placement : "top"
        });
    });

}