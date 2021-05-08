Array.prototype.reverseAll = function () {
    var _this = this; function reverseMake(arr) {
        return arr instanceof Array ? arr.reverse().map(function (e) {
            return reverseMake(e);
        }) : arr;
    };
    return reverseMake(_this);
};

turf.slice = function (poly, line) {
    var pieces = [];
    try {
        var _axe = turf.buffer(line, 0.0000000005, 'meters');
        var _body = turf.difference(poly, _axe);

        if (_body.geometry.type == 'Polygon') {
            pieces.push(turf.polygon(_body.geometry.coordinates));
            pieces.forEach(function (a) { a.properties = poly.properties });
        } else {
            _body.geometry.coordinates.forEach(function (a) {
                pieces.push(turf.buffer(turf.polygon(a), 0.0000000005, 'meters'));
            });
        }
    } catch (e) {

    }
    return turf.featureCollection(pieces);
}

/*SWIPE*/
ol.control.Swipe = function (opt_options) {
    var options = opt_options || {};
    var self = this;

    var button = document.createElement('button');

    var element = document.createElement('div');
    element.className = (options.className || "ol-swipe") + " ol-unselectable ol-control";
    element.appendChild(button);

    $(element).on("mousedown touchstart", this, this.move);

    ol.control.Control.call(this,
	{
	    element: element
	});

    this.layers = [];
    if (options.layers) this.addLayer(options.layers, false);
    if (options.rightLayers) this.addLayer(options.rightLayers, true);

    this.on('propertychange', function () {
        if (this.getMap()) this.getMap().renderSync();
        if (this.get('orientation') === "horizontal") {
            $(this.element).css("top", this.get('position') * 100 + "%")
            $(this.element).css("left", "");
        }
        else {
            if (this.get('orientation') !== "vertical") this.set('orientation', "vertical");
            $(this.element).css("left", this.get('position') * 100 + "%")
            $(this.element).css("top", "");
        }
        $(this.element).removeClass("horizontal vertical")
        $(this.element).addClass(this.get('orientation'))
    }, this);

    this.set('position', options.position || 0.5);
    this.set('orientation', options.position || 'vertical');
};
ol.inherits(ol.control.Swipe, ol.control.Control);
ol.control.Swipe.prototype.setMap = function (map) {
    if (this.getMap()) {
        for (var i = 0; i < this.layers.length; i++) {
            var l = this.layers[i];
            if (l.right) l.layer.un('precompose', this.precomposeRight, this);
            else l.layer.un('precompose', this.precomposeLeft, this);
            l.layer.un('postcompose', this.postcompose, this);
        }
        this.getMap().renderSync();
    }

    ol.control.Control.prototype.setMap.call(this, map);

    if (map) {
        for (var i = 0; i < this.layers.length; i++) {
            var l = this.layers[i];
            if (l.right) l.layer.on('precompose', this.precomposeRight, this);
            else l.layer.on('precompose', this.precomposeLeft, this);
            l.layer.on('postcompose', this.postcompose, this);
        }
        map.renderSync();
    }
};
ol.control.Swipe.prototype.isLayer_ = function (layer) {
    for (k = 0; k < this.layers.length; k++) {
        if (this.layers[k].layer === layer) return k;
    }
    return -1;
}
ol.control.Swipe.prototype.addLayer = function (layers, right) {
    if (!(layers instanceof Array)) layers = [layers];
    for (var i = 0; i < layers.length; i++) {
        l = layers[i];
        if (this.isLayer_(l) < 0) {
            this.layers.push({ layer: l, right: right });
            if (this.getMap()) {
                if (right) l.on('precompose', this.precomposeRight, this);
                else l.on('precompose', this.precomposeLeft, this);
                l.on('postcompose', this.postcompose, this);
                this.getMap().renderSync();
            }
        }
    }
}
ol.control.Swipe.prototype.removeLayer = function (layers) {
    if (!(layers instanceof Array)) layers = [layers];
    for (var i = 0; i < layers.length; i++) {
        var k = this.isLayer_(layers[i]);
        if (k >= 0 && this.getMap()) {
            if (this.layers[k].right) layers[i].un('precompose', this.precomposeRight, this);
            else layers[i].un('precompose', this.precomposeLeft, this);
            layers[i].un('postcompose', this.postcompose, this);
            this.layers.splice(k, 1);
            this.getMap().renderSync();
        }
    }
}
ol.control.Swipe.prototype.move = function (e) {
    var self = e.data;
    switch (e.type) {
        case 'touchcancel':
        case 'touchend':
        case 'mouseup':
            {
                self.isMoving = false;
                $(document).off("mouseup mousemove touchend touchcancel touchmove", self.move);
                break;
            }
        case 'mousedown':
        case 'touchstart':
            {
                self.isMoving = true;
                $(document).on("mouseup mousemove touchend touchcancel touchmove", self, self.move);
            }
        default:
            {
                if (self.isMoving) {
                    if (self.get('orientation') === "vertical") {
                        var pageX = e.pageX
                         || (e.originalEvent.touches && e.originalEvent.touches.length && e.originalEvent.touches[0].pageX)
                         || (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length && e.originalEvent.changedTouches[0].pageX);
                        if (!pageX) break;
                        pageX -= $(self.getMap().getTargetElement()).offset().left;

                        var l = self.getMap().getSize()[0];
                        l = Math.min(Math.max(0, 1 - (l - pageX) / l), 1);
                        self.set('position', l);
                    }
                    else {
                        var pageY = e.pageY
                        || (e.originalEvent.touches && e.originalEvent.touches.length && e.originalEvent.touches[0].pageY)
                        || (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length && e.originalEvent.changedTouches[0].pageY);
                        if (!pageY) break;
                        pageY -= $(self.getMap().getTargetElement()).offset().top;

                        var l = self.getMap().getSize()[1];
                        l = Math.min(Math.max(0, 1 - (l - pageY) / l), 1);
                        self.set('position', l);
                    }
                }
                break;
            }
    }
}
ol.control.Swipe.prototype.precomposeLeft = function (e) {
    var ctx = e.context;
    var canvas = ctx.canvas;
    ctx.save();
    ctx.beginPath();
    if (this.get('orientation') === "vertical") ctx.rect(0, 0, canvas.width * this.get('position'), canvas.height);
    else ctx.rect(0, 0, canvas.width, canvas.height * this.get('position'));
    ctx.clip();
}
ol.control.Swipe.prototype.precomposeRight = function (e) {
    var ctx = e.context;
    var canvas = ctx.canvas;
    ctx.save();
    ctx.beginPath();
    if (this.get('orientation') === "vertical") ctx.rect(canvas.width * this.get('position'), 0, canvas.width, canvas.height);
    else ctx.rect(0, canvas.height * this.get('position'), canvas.width, canvas.height);
    ctx.clip();
}
ol.control.Swipe.prototype.postcompose = function (e) {
    ctx = e.context.restore();
}
/*SWIPE*/

/*TRANSFORM Interaction*/
/** Interaction rotate
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {olx.interaction.TransformOptions} 
 *  - layers {Array<ol.Layer>} array of layers to transform, 
 *  - features {ol.Collection<ol.Feature>} collection of feature to transform, 
 *	- translateFeature {bool} Translate when click on feature
 *	- translate {bool} Can translate the feature
 *	- stretch {bool} can stretch the feature
 *	- scale {bool} can scale the feature
 *	- rotate {bool} can rotate the feature
 *	- style {} list of ol.style for handles
 *
 */
ol.interaction.Transform = function (options) {
    if (!options) options = {};
    var self = this;

    ol.interaction.Pointer.call(self,
	{
	    handleDownEvent: self.handleDownEvent_,
	    handleDragEvent: self.handleDragEvent_,
	    handleMoveEvent: self.handleMoveEvent_,
	    handleUpEvent: self.handleUpEvent_
	});

    /** Collection of feature to transform */
    self.features_ = options.features;
    /** List of layers to transform */
    self.layers_ = options.layers ? (options.layers instanceof Array) ? options.layers : [options.layers] : null;

    /** Translate when click on feature */
    self.set('translateFeature', (options.translateFeature !== false));
    /** Can translate the feature */
    self.set('translate', (options.translate !== false));
    /** Can stretch the feature */
    self.set('stretch', (options.stretch !== false));
    /** Can scale the feature */
    self.set('scale', (options.scale !== false));
    /** Can rotate the feature */
    self.set('rotate', (options.rotate !== false));

    // Force redraw when changed
    self.on('propertychange', function () {
        self.drawSketch_();
    });

    // Create a new overlay layer for the sketch
    self.handles_ = new ol.Collection();
    self.overlayLayer_ = new ol.layer.Vector(
		{
		    source: new ol.source.Vector({
		        features: self.handles_,
		        useSpatialIndex: false
		    }),
		    name: 'Transform overlay',
		    displayInLayerSwitcher: false,
		    // Return the style according to the handle type
		    style: function (feature) {
		        return (self.style[(feature.get('handle') || 'default') + (feature.get('constraint') || '') + (feature.get('option') || '')]);
		    }
		});


    self.setDefaultStyle();


    if (options.feature) {
        self.feature_ = options.feature;
        self.ispt_ = self.feature_ ? (self.feature_.getGeometry().getType() == "Point") : false;
        self.drawSketch_();
    }
};
ol.inherits(ol.interaction.Transform, ol.interaction.Pointer);
ol.interaction.Transform.prototype.Cursors = {
    'default': 'auto',
    'select': 'pointer',
    'translate': 'move',
    'rotate': 'move',
    'scale': 'ne-resize',
    'scale1': 'nw-resize',
    'scale2': 'ne-resize',
    'scale3': 'nw-resize',
    'scalev': 'e-resize',
    'scaleh1': 'n-resize',
    'scalev2': 'e-resize',
    'scaleh3': 'n-resize'
};
ol.interaction.Transform.prototype.setMap = function (map) {
    var self = this;
    if (map == null) return;
    if (self.getMap()) self.getMap().removeLayer(self.overlayLayer_);
    ol.interaction.Pointer.prototype.setMap.call(self, map);
    self.overlayLayer_.setMap(map);
    if (map != null) {
        this.isTouch = /touch/.test(map.getViewport().className);
    }
    self.setDefaultStyle();
};
ol.interaction.Transform.prototype.setActive = function (b) {
    ol.interaction.Pointer.prototype.setActive.call(this, b);
    if (!b) this.select(null);
};
ol.interaction.Transform.prototype.setDefaultStyle = function () {	// Style
    var self = this;
    var stroke = new ol.style.Stroke({ color: [255, 0, 0, 1], width: 1 });
    var strokedash = new ol.style.Stroke({ color: [255, 0, 0, 1], width: 1, lineDash: [4, 4] });
    var fill0 = new ol.style.Fill({ color: [255, 0, 0, 0.01] });
    var fill = new ol.style.Fill({ color: [255, 255, 255, 0.8] });
    var circle = new ol.style.RegularShape({
        fill: fill,
        stroke: stroke,
        radius: self.isTouch ? 12 : 6,
        points: 15
    });
    circle.getAnchor()[0] = self.isTouch ? -10 : -5;
    var bigpt = new ol.style.RegularShape({
        fill: fill,
        stroke: stroke,
        radius: self.isTouch ? 16 : 8,
        points: 4,
        angle: Math.PI / 4
    });
    var smallpt = new ol.style.RegularShape({
        fill: fill,
        stroke: stroke,
        radius: self.isTouch ? 12 : 6,
        points: 4,
        angle: Math.PI / 4
    });
    function createStyle(img, stroke, fill) {
        return [new ol.style.Style({ image: img, stroke: stroke, fill: fill })];
    }
    /** Style for handles */
    self.style =
	{
	    'default': createStyle(bigpt, strokedash, fill0),
	    'translate': createStyle(bigpt, stroke, fill),
	    'rotate': createStyle(circle, stroke, fill),
	    'rotate0': createStyle(bigpt, stroke, fill),
	    'scale': createStyle(bigpt, stroke, fill),
	    'scale1': createStyle(bigpt, stroke, fill),
	    'scale2': createStyle(bigpt, stroke, fill),
	    'scale3': createStyle(bigpt, stroke, fill),
	    'scalev': createStyle(smallpt, stroke, fill),
	    'scaleh1': createStyle(smallpt, stroke, fill),
	    'scalev2': createStyle(smallpt, stroke, fill),
	    'scaleh3': createStyle(smallpt, stroke, fill),
	};
    self.drawSketch_();
}
ol.interaction.Transform.prototype.setStyle = function (style, olstyle) {
    var self = this;
    if (!olstyle) return;
    if (olstyle instanceof Array) self.style[style] = olstyle;
    else self.style[style] = [olstyle];
    for (var i = 0; i < this.style[style].length; i++) {
        var im = self.style[style][i].getImage();
        if (im) {
            if (style == 'rotate') im.getAnchor()[0] = -5;
            if (self.isTouch) im.setScale(1.8);
        }
        var tx = self.style[style][i].getText();
        if (tx) {
            if (style == 'rotate') tx.setOffsetX(this.isTouch ? 14 : 7);
            if (self.isTouch) tx.setScale(1.8);
        }
    }
    self.drawSketch_();
};
ol.interaction.Transform.prototype.getFeatureAtPixel_ = function (pixel) {
    var self = this;
    return self.getMap().forEachFeatureAtPixel(pixel, function (feature, layer) {
        var found = false;
        // Overlay ?
        if (!layer) {
            if (feature === self.bbox_) return false;
            self.handles_.forEach(function (f) { if (f === feature) found = true; });
            if (found) return { feature: feature, handle: feature.get('handle'), constraint: feature.get('constraint'), option: feature.get('option') };
        }
        // feature belong to a layer
        if (self.layers_) {
            for (var i = 0; i < self.layers_.length; i++) {
                if (self.layers_[i] === layer) return { feature: feature };
            }
            return null;
        }

        else if (self.features_) {
            self.features_.forEach(function (f) { if (f === feature) found = true; });
            if (found) return { feature: feature };
            else return null;
        }
            // Others
        else return { feature: feature };
    }, self) || {};
}
ol.interaction.Transform.prototype.drawSketch_ = function (center) {
    var self = this;
    self.overlayLayer_.getSource().clear();
    if (!self.feature_) return;
    if (center === true) {
        if (!this.ispt_) {
            self.overlayLayer_.getSource().addFeature(new ol.Feature({ geometry: new ol.geom.Point(self.center_), handle: 'rotate0' }));
            var ext = self.feature_.getGeometry().getExtent();
            var geom = ol.geom.Polygon.fromExtent(ext);
            var f = this.bbox_ = new ol.Feature(geom);
            this.overlayLayer_.getSource().addFeature(f);
        }
    }
    else {
        var ext = self.feature_.getGeometry().getExtent();
        if (this.ispt_) {
            var p = self.getMap().getPixelFromCoordinate([ext[0], ext[1]]);
            ext = ol.extent.boundingExtent(
				[self.getMap().getCoordinateFromPixel([p[0] - 10, p[1] - 10]),
					self.getMap().getCoordinateFromPixel([p[0] + 10, p[1] + 10])
				]);
        }
        var geom = ol.geom.Polygon.fromExtent(ext);
        var f = self.bbox_ = new ol.Feature(geom);
        var features = [];
        var g = geom.getCoordinates()[0];
        if (!self.ispt_) {
            features.push(f);
            // Middle
            if (self.get('stretch') && self.get('scale')) for (var i = 0; i < g.length - 1; i++) {
                f = new ol.Feature({ geometry: new ol.geom.Point([(g[i][0] + g[i + 1][0]) / 2, (g[i][1] + g[i + 1][1]) / 2]), handle: 'scale', constraint: i % 2 ? "h" : "v", option: i });
                features.push(f);
            }
            // Handles
            if (self.get('scale')) for (var i = 0; i < g.length - 1; i++) {
                f = new ol.Feature({ geometry: new ol.geom.Point(g[i]), handle: 'scale', option: i });
                features.push(f);
            }
            // Center
            if (self.get('translate') && !self.get('translateFeature')) {
                f = new ol.Feature({ geometry: new ol.geom.Point([(g[0][0] + g[2][0]) / 2, (g[0][1] + g[2][1]) / 2]), handle: 'translate' });
                features.push(f);
            }
        }
        // Rotate
        if (self.get('rotate')) {
            f = new ol.Feature({ geometry: new ol.geom.Point(g[3]), handle: 'rotate' });
            features.push(f);
        }
        // Add sketch
        self.overlayLayer_.getSource().addFeatures(features);
    }
};
ol.interaction.Transform.prototype.select = function (feature) {
    var self = this;
    self.feature_ = feature;
    self.ispt_ = self.feature_ ? (self.feature_.getGeometry().getType() == "Point") : false;
    self.drawSketch_();
    self.dispatchEvent({ type: 'select', feature: self.feature_ });
}
ol.interaction.Transform.prototype.handleDownEvent_ = function (evt) {
    var self = this;
    var sel = self.getFeatureAtPixel_(evt.pixel);
    var feature = sel.feature;
    if (self.feature_ && self.feature_ == feature && ((self.ispt_ && self.get('translate')) || self.get('translateFeature'))) {
        sel.handle = 'translate';
    }
    if (sel.handle) {
        self.mode_ = sel.handle;
        self.opt_ = sel.option;
        self.constraint_ = sel.constraint;
        // Save info
        self.coordinate_ = evt.coordinate;
        self.pixel_ = evt.pixel;
        self.geom_ = self.feature_.getGeometry().clone();
        self.extent_ = (ol.geom.Polygon.fromExtent(self.geom_.getExtent())).getCoordinates()[0];
        self.center_ = ol.extent.getCenter(self.geom_.getExtent());
        self.angle_ = Math.atan2(self.center_[1] - evt.coordinate[1], self.center_[0] - evt.coordinate[0]);
        self.dispatchEvent({ type: self.mode_ + 'start', feature: self.feature_, pixel: evt.pixel, coordinate: evt.coordinate });
        return true;
    }
    else {
        self.feature_ = feature;
        self.ispt_ = self.feature_ ? (self.feature_.getGeometry().getType() == "Point") : false;
        self.drawSketch_();
        self.dispatchEvent({ type: 'select', feature: self.feature_, pixel: evt.pixel, coordinate: evt.coordinate });
        return false;
    }

};
ol.interaction.Transform.prototype.handleDragEvent_ = function (evt) {
    switch (this.mode_) {
        case 'rotate':
            {
                var a = Math.atan2(this.center_[1] - evt.coordinate[1], this.center_[0] - evt.coordinate[0]);
                if (!this.ispt) {
                    var geometry = this.geom_.clone();
                    geometry.rotate(a - this.angle_, this.center_);

                    this.feature_.setGeometry(geometry);
                }
                this.drawSketch_(true);
                this.dispatchEvent({ type: 'rotating', feature: this.feature_, angle: a - this.angle_, pixel: evt.pixel, coordinate: evt.coordinate });
                break;
            }
        case 'translate':
            {
                var deltaX = evt.coordinate[0] - this.coordinate_[0];
                var deltaY = evt.coordinate[1] - this.coordinate_[1];

                this.feature_.getGeometry().translate(deltaX, deltaY);
                this.handles_.forEach(function (f) {
                    f.getGeometry().translate(deltaX, deltaY);
                });

                this.coordinate_ = evt.coordinate;
                this.dispatchEvent({ type: 'translating', feature: this.feature_, delta: [deltaX, deltaY], pixel: evt.pixel, coordinate: evt.coordinate });
                break;
            }
        case 'scale':
            {
                var center = this.center_;
                if (evt.originalEvent.metaKey || evt.originalEvent.ctrlKey) {
                    center = this.extent_[(Number(this.opt_) + 2) % 4];
                }

                var scx = (evt.coordinate[0] - center[0]) / (this.coordinate_[0] - center[0]);
                var scy = (evt.coordinate[1] - center[1]) / (this.coordinate_[1] - center[1]);

                if (this.constraint_) {
                    if (this.constraint_ == "h") scx = 1;
                    else scy = 1;
                }
                else {
                    if (evt.originalEvent.shiftKey) {
                        scx = scy = Math.min(scx, scy);
                    }
                }

                var geometry = this.geom_.clone();
                geometry.applyTransform(function (g1, g2, dim) {
                    if (dim < 2) return g2;

                    for (i = 0; i < g1.length; i += dim) {
                        if (scx != 1) g2[i] = center[0] + (g1[i] - center[0]) * scx;
                        if (scy != 1) g2[i + 1] = center[1] + (g1[i + 1] - center[1]) * scy;
                    }
                    return g2;
                });
                this.feature_.setGeometry(geometry);
                this.drawSketch_();
                this.dispatchEvent({ type: 'scaling', feature: this.feature_, scale: [scx, scy], pixel: evt.pixel, coordinate: evt.coordinate });
            }
        default: break;
    }
};
ol.interaction.Transform.prototype.handleMoveEvent_ = function (evt) {
    // console.log("handleMoveEvent");
    if (!this.mode_) {
        var map = evt.map;
        var sel = this.getFeatureAtPixel_(evt.pixel);
        var element = evt.map.getTargetElement();
        if (sel.feature) {
            var c = sel.handle ? this.Cursors[(sel.handle || 'default') + (sel.constraint || '') + (sel.option || '')] : this.Cursors.select;

            if (this.previousCursor_ === undefined) {
                this.previousCursor_ = element.style.cursor;
            }
            element.style.cursor = c;
        }
        else {
            if (this.previousCursor_ !== undefined) element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
};
ol.interaction.Transform.prototype.handleUpEvent_ = function (evt) {	//dispatchEvent 
    this.dispatchEvent({ type: this.mode_ + 'end', feature: this.feature_, oldgeom: this.geom_ });

    this.drawSketch_();
    this.mode_ = null;
    return false;
};
/*TRANSFORM Interaction*/

/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @requires 
 */
/**
 * @classdesc
 * Fill style with named pattern
 *
 * @constructor
 * @param {olx.style.FillPatternOption=}  Options
 *	- image {ol.style.Image|undefined} an image pattern, image must be preloaded to draw on first call
 *	- fill {ol.style.Fill} fill color (background)
 * @extends {ol.style.Fill}
 * @implements {ol.structs.IHasChecksum}
 * @api
 */

ol.style.FillPattern = function (options) {
    var self = this;
    self.options = (!options) ? {
        image: null,
        color: "RGBA(255,255,255,1)"
    } : options;

    var pattern = self.options.color;

    if (self.options.image) {
        var canvas = document.createElement('canvas');
        var imageObj = new Image();
        imageObj.src = self.options.image;
        imageObj.onload = function () {
            var cnv = document.createElement('canvas');
            cnv.width = imageObj.width;
            cnv.height = imageObj.height;
            var ctx = cnv.getContext('2d');
            ctx.rect(0, 0, cnv.width, cnv.height);
            ctx.fillStyle = self.options.color;
            ctx.fill();
            var pattern = ctx.createPattern(imageObj, 'no-repeat');
            ctx.rect(0, 0, cnv.width, cnv.height);
            ctx.fillStyle = pattern;
            ctx.fill();

            var cnv2 = document.createElement('canvas');
            cnv2.width = imageObj.width;
            cnv2.height = imageObj.height;
            var ctx2 = cnv2.getContext('2d');
            var pattern2 = ctx2.createPattern(cnv, 'repeat');
            self.setColor(pattern2);
        }
    }

    ol.style.Fill.call(this, { color: pattern });
};
ol.inherits(ol.style.FillPattern, ol.style.Fill);
ol.style.FillPattern.prototype.setFillColor = function (color) {

    var self = this;
    var pattern = self.options.color = color;

    if (self.options.image) {
        var canvas = document.createElement('canvas');
        var imageObj = new Image();
        imageObj.src = self.options.image;
        imageObj.onload = function () {
            var cnv = document.createElement('canvas');
            cnv.width = imageObj.width;
            cnv.height = imageObj.height;
            var ctx = cnv.getContext('2d');
            ctx.rect(0, 0, cnv.width, cnv.height);
            ctx.fillStyle = self.options.color;
            ctx.fill();
            var pattern = ctx.createPattern(imageObj, 'no-repeat');
            ctx.rect(0, 0, cnv.width, cnv.height);
            ctx.fillStyle = pattern;
            ctx.fill();

            var cnv2 = document.createElement('canvas');
            cnv2.width = imageObj.width;
            cnv2.height = imageObj.height;
            var ctx2 = cnv2.getContext('2d');
            var pattern2 = ctx2.createPattern(cnv, 'repeat');
            self.setColor(pattern2);
        }
    }
    //self.setColor(pattern);
}
ol.style.FillPattern.prototype.setFillImage = function (image) {
    var self = this;
    var pattern = self.options.image = image;

    if (self.options.image) {
        var canvas = document.createElement('canvas');
        var imageObj = new Image();
        imageObj.src = self.options.image;
        imageObj.onload = function () {
            var cnv = document.createElement('canvas');
            cnv.width = imageObj.width;
            cnv.height = imageObj.height;
            var ctx = cnv.getContext('2d');
            ctx.rect(0, 0, cnv.width, cnv.height);
            ctx.fillStyle = self.options.color;
            ctx.fill();
            var pattern = ctx.createPattern(imageObj, 'no-repeat');
            ctx.rect(0, 0, cnv.width, cnv.height);
            ctx.fillStyle = pattern;
            ctx.fill();

            var cnv2 = document.createElement('canvas');
            cnv2.width = imageObj.width;
            cnv2.height = imageObj.height;
            var ctx2 = cnv2.getContext('2d');
            var pattern2 = ctx2.createPattern(cnv, 'repeat');
            self.setColor(pattern2);
        }
    }

    // self.setColor(pattern);
}
ol.style.FillPattern.prototype.getColor = function () {
    return this.options.color;
}
ol.style.FillPattern.prototype.getImage = function () {
    return this.options.image;
}
ol.style.Style.prototype.set = function (prop, value) {
    this["properties"] = this["properties"] ? this["properties"] : {};
    this["properties"][prop] = value;
};
ol.style.Style.prototype.get = function (prop) {
    return this["properties"][prop];
};


/*Scale calculate*/
ol.View.prototype.getScale = function () {

    var view = this;
    var resolution = view.getResolution();
    var units = view.getProjection().getUnits();
    var dpi = 96;
    var mpu = ol.proj.METERS_PER_UNIT[units];
    var scale = resolution * mpu * 39.37 * dpi;

    if (scale >= 950 && scale <= 9500) {
        scale = Math.round(scale / 1000) * 1000;
    } else if (scale >= 9500 && scale <= 950000) {
        scale = Math.round(scale / 1000) * 1000; //"k";
    } else if (scale >= 950000) {
        scale = Math.round(scale / 1000000) * 1000000; //"m";
    } else {
        scale = Math.round(scale);//"m";
    }

    return scale;
}
ol.View.prototype.setScale = function (scale) {
    var scale = parseInt(typeof (scale) == "string" ? scale.replace(".", "") : scale);
    if (typeof (scale) != "number") return;
    scale = scale > 592000000 ? 592000000 : scale;
    scale = scale < 141 ? 141 : scale

    var view = this;
    var units = view.getProjection().getUnits();
    var dpi = 96;
    var mpu = ol.proj.METERS_PER_UNIT[units];
    var resolution = scale / (mpu * 39.37 * dpi);
    view.setResolution(resolution);
}
/*Scale calculate*/

/**/
ol.Feature.prototype.tranformCordinate = function () {
    this.getGeometry().setCoordinates(this.getGeometry().getCoordinates().reverseAll());
}

ol.Feature.prototype.getSQL = function (proj, transform) {
    var reader = new ol.format.WKT();
    var clone = this.clone();
    if (transform) {
        var clone = clone.setGeometry(this.getGeometry().getCoordinates().reverseAll());
    }
    try {
        return reader.writeFeature(clone, {
            dataProjection: "EPSG:4326",
            featureProjection: globalDefine.projection
        });

    } catch (e) {
        return null;
    }
}

ol.Feature.prototype.getGeoJSON = function (proj,transform) {
    var reader = new ol.format.GeoJSON();
    var clone = this.clone();
    if (transform) {
        var clone = clone.setGeometry(this.getGeometry().getCoordinates().reverseAll());
    }
    try {
        return JSON.parse(reader.writeFeature(clone, {
            dataProjection: "EPSG:4326",
            featureProjection: globalDefine.projection
        }));
    } catch (e) {
        return null;
    }
}

ol.Collection.prototype.getGeoJSON = function (proj) {
    var reader = new ol.format.GeoJSON();
    var collection = this.clone();

    collection.forEach(function (item) {
        item.unset("hidden");
        item.unset("hover");
        item.unset("style");
        item.unset("label");
        item.unset("select");
        item.unset("vertex");
        item.unset("layer");
        item.set("_t_", "");//netTopologysuitein propertileri yaratmasý için tek properti gitmesi gerekiyor ondan ötürü bunu koyduk.
    });

    try {
        return JSON.parse(reader.writeFeatures(collection.getArray(), {
            dataProjection: "EPSG:4326",
            featureProjection: globalDefine.projection
        }));
    } catch (e) {
        return null;
    }
}

ol.Collection.prototype.clone = function () {
    var collection = new ol.Collection();
    try {
        this.forEach(function (item, i) {
            if (item instanceof ol.Feature) {

                var feature = item.clone();
                feature.setId(item.getId());
                for (var key in item.getProperties()) {
                    feature.set(key, item.get(key));
                }
                feature.setGeometry(item.getGeometry().clone());
                collection.insertAt(i, feature);

            } else {
                collection.insertAt(i, item);
            }
        });
    } catch (e) {

    }
    return collection;
}
/**/
