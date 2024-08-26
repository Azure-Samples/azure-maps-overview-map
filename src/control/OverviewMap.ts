import atlas, * as azmaps from "azure-maps-control";
import { OverviewMapOptions } from './OverviewMapOptions';
import { OverviewMapLayers } from './OverviewMapLayers';

/** A control that displays an overview map of the area the main map is focused on. */
export class OverviewMap implements azmaps.Control {
    /****************************
    * Private Properties
    ***************************/

    private _container: HTMLElement;
    private _mapContainer: HTMLElement;
    private _mapDiv: HTMLElement;
    private _btn: HTMLButtonElement;
    private _darkColor = '#011c2c';
    private _hclStyle: azmaps.ControlStyle = null;
    private _position: azmaps.ControlPosition = <azmaps.ControlPosition>'non-fixed';

    //Parent map.
    private _parentMap: azmaps.Map;
    private _overviewMap: azmaps.Map;

    private _syncEvents: any[] = [];

    private _area: azmaps.Shape;
    private _marker: azmaps.HtmlMarker;

    private _options: OverviewMapOptions = {
        style: 'light',
        zoomOffset: -5,
        mapStyle: 'road',
        width: 150,
        height: 150,
        syncZoom: true,
        syncBearingPitch: true,
        overlay: 'area',
        interactive: true,
        zoom: 1,
        minimized: false,
        showToggle: true,
        visible: true,
        markerOptions: {},
        shape: 'square'
    };

    private _source = new azmaps.source.DataSource();
    private _layers: OverviewMapLayers = {
        lineLayer: new azmaps.layer.LineLayer(this._source, null, {
            filter: ['get', 'visible']
        }),

        polygonLayer: new azmaps.layer.PolygonLayer(this._source, null, {
            filter: ['get', 'visible']
        })
    };

    private _icon = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24'%3E%3Cpath fill='{color}' d='M24 20.5V6.7c0-1.8-1.4-3.256-3.1-3.256-1.708 0-3.098 1.457-3.098 3.256v6.754L5.29.94A3.092 3.092 0 0 0 .908.939a3.097 3.097 0 0 0 0 4.382l12.447 12.446H6.63c-1.825 0-3.303 1.387-3.303 3.1s1.478 3.098 3.303 3.098l14.058-.002c1.826.002 3.305-1.387 3.306-3.096-.001-.045-.014-.083-.016-.128.003-.06.018-.12.018-.18z'/%3E%3C/svg%3E\")";
    private _btnCss = ".azmaps-overviewMap{z-index:200;padding:5px;box-shadow:0px 0px 4px rgba(0,0,0,0.5);border:none;border-collapse:collapse;border-radius:5px;transition:width 0.5s ease-in-out 0s, height 0.5s ease-in-out 0s;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32px' height='32px' viewBox='0 0 500 500'%3E%3Cpath stroke='Gray' fill='none' stroke-width='20' d='M249,55a195,195 0 1,0 2,0zm1,0v390m195-195H55 M99,130a260,260 0 0,0 302,0 m0,240 a260,260 0 0,0-302,0 M235,60a250,250 0 0,0 0,382 m30,0 a250,250 0 0,0 0-382'/%3E%3C/svg%3E\") no-repeat center center}" +
        '.azmaps-overviewMapDiv{position:relative;height:100%;width:100%;transition:opacity 0.5s ease-in-out 0s}' +
        '.azmaps-overviewMapBtn{position:absolute;margin:0;padding:0;border:none;border-collapse:collapse;width:22px;height:22px;text-align:center;cursor:pointer;line-height:32px;border-radius:5px;z-index:200;background:no-repeat center center;background-image:{icon};background-size:12px;transition:transform 0.5s ease-in-out 0s}' +
        '.azmaps-overviewMapBtn:hover{background-image:{iconHover}}' + 
        '.azmaps-overviewMap-round{border-radius:50%}.azmaps-overviewMap-round canvas{border-radius:50%}';

    private _btnRotation = 0;

    private _resx: string[];

    /****************************
     * Constructor
     ***************************/

    /**
     * A control that displays an overview map of the area the main map is focused on
     * @param options Options for defining how the control is rendered and functions.
     */
    constructor(options?: OverviewMapOptions) {
        Object.assign(this._options, options || {});
    }

    /****************************
     * Public Methods
     ***************************/

    /** Dispose the overview map control and clean up its resources. */
    public dispose(): void {
        const self = this;
        self.onRemove();
        Object.keys(self).forEach(k => self[k] = undefined);
    }

    /**
     * Get the overview map instance. Use this to get the map and customize its settings.
     */
    public getOverviewMap(): azmaps.Map {
        return this._overviewMap;
    }

    /**
     * Get the underlying layers used to render the overview area on the map.
     */
    public getLayers(): OverviewMapLayers {
        return this._layers;
    }

    /**
     * Get the options for the overview map control.
     */
    public getOptions(): OverviewMapOptions {
        return { ...this._options };
    }

    /**
     * Set the options for the overview map control.
     * @param options The options to set.
     */
    public setOptions(options: OverviewMapOptions): void {
        const self = this;
        const opt = self._options;
        const map = self._parentMap;
        const overviewMap = self._overviewMap;

        let updateUx = false;
        let camChanged = false;
        let btnState = false;

        if (typeof options.syncBearingPitch === 'boolean') {
            opt.syncBearingPitch = options.syncBearingPitch;
            updateUx = true;
            camChanged = true;
        }

        if (typeof options.syncZoom === 'boolean') {
            opt.syncZoom = options.syncZoom;
            updateUx = true;
            camChanged = true;
        }

        if (typeof options.interactive === 'boolean') {
            opt.interactive = options.interactive;
            updateUx = true;
        }

        if (updateUx) {
            self._updateMapUX();
        }

        if (typeof options.zoom === 'number') {
            opt.zoom = options.zoom;
            camChanged = true;
        }

        if (typeof options.zoomOffset === 'number') {
            opt.zoomOffset = options.zoomOffset;
            camChanged = true;
        }

        if (camChanged && map && overviewMap) {
            const cam = map.getCamera();
            const newCam: any = {
                center: cam.center,
                zoom: opt.syncZoom ? Math.min(Math.max(cam.zoom + opt.zoomOffset, 0), 24) : opt.zoom,
                bearing: 0,
                pitch: 0
            };

            if (opt.syncBearingPitch) {
                newCam.bearing = cam.bearing;
                newCam.pitch = cam.pitch;
            }

            overviewMap.setCamera(newCam);
        }

        if (options.mapStyle) {
            opt.mapStyle = options.mapStyle;

            if (overviewMap) {
                overviewMap.setStyle({ style: opt.mapStyle });
            }
        }

        if (typeof options.showToggle === 'boolean') {
            opt.showToggle = options.showToggle;

            if (self._btn) {
                self._btn.style.display = opt.showToggle ? '' : 'none';
            }
        }

        if (typeof options.minimized === 'boolean') {
            opt.minimized = options.minimized;
            btnState = true;
        }

        if (typeof options.width === 'number') {
            opt.width = options.width;
            btnState = true;
        }

        if (typeof options.height === 'number') {
            opt.height = options.height;
            btnState = true;
        }

        if (options.markerOptions) {
            Object.assign(opt.markerOptions, options.markerOptions);

            if (self._marker) {
                self._marker.setOptions(opt.markerOptions);
            }
        }

        if (options.overlay) {
            opt.overlay = options.overlay;

            if (self._area) {
                self._area.setProperties({ visible: (opt.overlay === 'area') })
            }

            if (self._marker) {
                self._marker.setOptions({
                    visible: (opt.overlay === 'marker')
                });
            }

            self._updateOverlay();
        }

        if (options.style) {
            if (opt.style.indexOf('auto') === 0 && map) {
                map.events.remove('styledata', self._mapStyleChanged);
            }
            opt.style = options.style;
            if (self._mapContainer) {
                const c = self._styleColor();
                self._mapContainer.style.backgroundColor = c;
                self._btn.style.backgroundColor = c;
            }
        }

        if(options.shape){
            opt.shape = options.shape;
            const mcCl = self._mapContainer.classList;

            if(opt.shape === 'round'){
                mcCl.add('azmaps-overviewMap-round');  
            } else if(mcCl.contains('azmaps-overviewMap-round')) {
                mcCl.remove('azmaps-overviewMap-round');
            }
            btnState = true;
        }

        if (typeof options.visible === 'boolean') {
            opt.visible = options.visible;
            if (self._container) {
                self._container.style.display = (opt.visible) ? '' : 'none';
                self._overviewMap.resize();
            }
        }
        
        if (btnState) {
            self._setBtnState();
        }
    }

    /**
     * Action to perform when the control is added to the map.
     * @param map The map the control was added to.
     * @param options The control options used when adding the control to the map.
     * @returns The HTML Element that represents the control.
     */
    public onAdd(map: azmaps.Map, options?: azmaps.ControlOptions): HTMLElement {
        const self = this;
        const opt = self._options;
        self._parentMap = map;

        //Add the CSS classes to the page.
        const grayIcon = self._icon.replace('{color}', 'Gray');
        const blueIcon = self._icon.replace('{color}', 'DeepSkyBlue');
        const style = document.createElement('style');
        style.innerHTML = self._btnCss.replace(/{icon}/g, grayIcon).replace(/{iconHover}/g, blueIcon);
        document.body.appendChild(style);

        const color = self._styleColor();

        const resx = OverviewMap._getAriaLabel(self._parentMap);
        self._resx = resx;

        //Create a container.
        const c = document.createElement('div');
        c.classList.add('azure-maps-control-container');
        c.setAttribute('aria-label', resx[0]);
        c.style.flexDirection = 'column';
        c.style.display = (opt.visible) ? '' : 'none';
        self._container = c;

        const mapContainer = document.createElement('div');
        mapContainer.classList.add('azmaps-overviewMap');

        if(opt.style === 'round'){
            mapContainer.classList.add('azmaps-overviewMap-round');           
        }

        Object.assign(mapContainer.style, {
            height: opt.height + 'px',
            width: opt.width + 'px',
            backgroundColor: color
        });
        c.appendChild(mapContainer);
        self._mapContainer = mapContainer;

        //Create a div for the map.
        const mapDiv = document.createElement('div');
        mapDiv.classList.add('azmaps-overviewMapDiv');
        mapContainer.appendChild(mapDiv);
        self._mapDiv = mapDiv;

        //Create expansion button.
        const btnStyle: any = {
            display: opt.showToggle ? '' : 'none',
            backgroundColor: color
        };
        
        let position: azmaps.ControlPosition;
        if (options) {
            position = options.position;
        }

        if (!position || position === 'non-fixed') {
            position = <azmaps.ControlPosition>'top-left';
        }

        self._position = position;

        const btn = document.createElement("button");
        btn.setAttribute('type', 'button');
        btn.classList.add('azmaps-overviewMapBtn');
        Object.assign(btn.style, btnStyle);
        btn.addEventListener('click', self._toggle);
        mapContainer.appendChild(btn);
        self._btn = btn;

        self._setBtnState();

        let mapOptions: any = {
            //Hide the logo on the mini map since it is small.
            showLogo: false,

            //Hide the feedback link on the mini map. 
            showFeedbackLink: false,

            //Set the default map style.
            style: opt.mapStyle,

            //Disable accessibility otherwise two maps will report its position to the screen reader.
            enableAccessibility: false
        };

        if (self._parentMap) {
            const style = self._parentMap.getStyle();
            mapOptions = Object.assign({}, self._parentMap.getServiceOptions(), {
                //Grab the language and view from the parent map.
                language: style.language,
                view: style.view,
            }, mapOptions);
        } else {
            mapOptions = {
                //Grab the language and view from the atlas namespace.
                language: atlas.getLanguage(),
                view: atlas.getView()
            }
        }

        const overviewMap = new azmaps.Map(mapDiv, mapOptions);
        self._overviewMap = overviewMap;

        overviewMap.events.add('ready', () => {
            //Since the overview map is really small, hide the copyright control.
            try {
                overviewMap.controls.getControls().forEach(ctr => {
                    const ct = ctr['container']
                    if (ct && ct.className.indexOf('map-copyright') > -1) {
                        ct.style.display = 'none';
                    }
                });
            } catch{ }

            //Call resize since the map div is now rendered in the DOM.
            overviewMap.resize();

            //Set the map options for UX; rotate/pitch
            self._updateMapUX();

            //Create a data source and add it to the map.
            overviewMap.sources.add(self._source);

            //Create a layer to render the polygon data.
            overviewMap.layers.add(self._layers.polygonLayer);
            overviewMap.layers.add(self._layers.lineLayer);

            //Create a polygon from the main maps view bounds.
            const p = new azmaps.Shape(new azmaps.data.Polygon([]), null, { visible: (opt.overlay === 'area') });
            self._source.add(p);
            self._area = p;

            const m = new azmaps.HtmlMarker(Object.assign({
                visible: (opt.overlay === 'marker')
            }, opt.markerOptions || {}));
            overviewMap.markers.add(m);
            overviewMap.events.add('dragend', m, self._markerdDragged);
            self._marker = m;

            //Bind sync events.
            self._syncEvents[0] = self._syncMaps.bind(self, self._parentMap);
            self._syncEvents[1] = self._syncMaps.bind(self, self._overviewMap);

            //Sync all map views with the first map.
            self._syncEvents[0]();

            //Attach the map move handler.
            self._attachEvents();
        });

        return c;
    }

    /**
     * Action to perform when control is removed from the map.
     */
    public onRemove(): void {
        const self = this;
        if (self._container) {
            self._container.remove();
            self._container = null;
            self._mapContainer = null;
            self._mapDiv = null;
            self._btn = null;
        }

        if (self._marker && self._overviewMap) {
            self._overviewMap.events.add('dragend', self._marker, self._markerdDragged);
        }

        if (self._parentMap) {
            if (self._options.style.indexOf('auto') === 0) {
                self._parentMap.events.remove('styledata', self._mapStyleChanged);
            }

            self._detachEvents();
            self._parentMap = null;
            self._overviewMap = null;
        }
    }

    /****************************
     * Private Methods
     ***************************/

    /**
     * Event handler for when the marker is dragged to a new position.
     */
    private _markerdDragged = () => {
        const pos = this._marker.getOptions().position;
        this._overviewMap.setCamera({ center: pos });
    };

    /**
     * An event handler for when the map style changes. Used when control style is set to auto.
     */
    private _mapStyleChanged = () => {
        const self = this;
        if (self._mapContainer && self._btn && !self._hclStyle) {
            const c = self._getColorFromMapStyle();
            self._mapContainer.style.backgroundColor = c;
            self._btn.style.backgroundColor = c;
        }
    }

    /** Gets the controls background color for the specified style.  */
    private _styleColor(): string {
        const self = this;
        let color = 'light';

        if (self._parentMap) {
            const mcl = self._parentMap.getMapContainer().classList;
            if (mcl.contains("high-contrast-dark")) {
                self._hclStyle = <azmaps.ControlStyle>'dark';
            } else if (mcl.contains("high-contrast-light")) {
                self._hclStyle = <azmaps.ControlStyle>'light';
            }
        }

        if (self._hclStyle) {
            if (self._hclStyle === 'dark') {
                color = self._darkColor;
            }
        } else {
            color = self._options.style;
        }

        if (color === 'light') {
            color = 'white';
        } else if (color === 'dark') {
            color = self._darkColor;
        } else if (color.indexOf('auto') === 0) {
            if (self._parentMap) {
                //Color will change between light and dark depending on map style.
                self._parentMap.events.add('styledata', self._mapStyleChanged);
                color = self._getColorFromMapStyle();
            }
        }

        return color;
    }

    /**
     * Retrieves the background color for the button based on the map style. This is used when style is set to auto.
     */
    private _getColorFromMapStyle(): string {
        let isDark = false;

        //When the style is dark (i.e. satellite, night), show the dark colored theme.
        if (['satellite', 'satellite_road_labels', 'grayscale_dark', 'night'].indexOf(this._parentMap.getStyle().style) > -1) {
            isDark = true;
        }

        if(this._options.style === 'auto-reverse'){
            //Reverse the color.
            return (isDark)? 'white' : this._darkColor;
        }

        
        return (isDark)? this._darkColor : 'white';
    }

    /**
     * Toggle event handler for expand/collapse button.
     */
    private _toggle = () => {
        const self = this;
        const opt = self._options;
        opt.minimized = !opt.minimized;
        self._setBtnState();
    }

    /**
     * Sets the minimized state of the expansion button.
     */
    private _setBtnState(): void {
        const self = this;
        const opt = self._options;
        const btn = self._btn;
        let w = '26px';
        let h = '26px';
        let opacity = '0';
        let r = 0;
        let resx = self._resx[2];
        const isLeft = self._position.indexOf('left') > -1;
        const isTop = self._position.indexOf('top') > -1;

        if (isTop) {
            btn.style.bottom = '0';
            r = isLeft ? 180 : 270;
        } else {
            btn.style.top = '0';
            r = isLeft ? 90 : 0;
        }

        if (isLeft) {
            btn.style.right = '0';
        } else {
            btn.style.left = '0';
        }

        if (opt.minimized) {
            r = (r + 180) % 360;
            resx = self._resx[1];
        } else {
            opacity = '1';
            h = opt.height + 'px';
            w = opt.width + 'px';

            if (opt.shape === 'round') {
                var x = opt.width / 2;
                var y = opt.height / 2;
                var angle = Math.cos(45 * Math.PI / 180);
                let radiusXOffset = x - x * angle - 10;                
                let radiusYOffset = y - y * angle - 10;

                if (isTop) {
                    btn.style.bottom = radiusYOffset + 'px';
                } else {
                    btn.style.top = radiusYOffset + 'px';
                }
        
                if (isLeft) {
                    btn.style.right = radiusXOffset + 'px';
                } else {
                    btn.style.left = radiusXOffset + 'px';
                }
            }
        }

        if (self._mapContainer) {
            self._mapDiv.style.opacity = opacity;

            Object.assign(self._mapContainer.style, {
                height: h,
                width: w
            });

            if (self._overviewMap) {
                self._resizeStart = performance.now();
                //self._animateResize();
                if(self._interval){
                    clearInterval(self._interval);
                }
                self._interval = setInterval(self._resize, 33);
            }

            btn.style.transform = `rotate(${r}deg)`;
        }

        btn.setAttribute('title', resx);
        btn.setAttribute('alt', resx);
    }

    private _interval;
    private _resizeStart;

    /** Function that animates the resizing of the overview map when the width/height animates a change. */
    private _resize = () => {
        const self = this;

        self._overviewMap.resize();

        if(performance.now() - self._resizeStart > 550){
            //Stop animation.
            clearInterval(self._interval);
            self._interval = null
        } 
    }

    /**
     * Sets the user interaction options of the map based on the user settings.
     */
    private _updateMapUX(): void {
        const self = this;
        const map = self._overviewMap;
        if (map) {
            const opt = self._options;
            const z = opt.syncZoom;
            map.setUserInteraction({
                dragRotateInteraction: opt.syncBearingPitch,
                scrollZoomInteraction: z,
                dblClickZoomInteraction: z,
                boxZoomInteraction: z,
                interactive: opt.interactive
            });
        }
    }

    /** Attach map move handlers to the maps to synchronize them. */
    private _attachEvents() {
        const self = this;
        if (self._parentMap && self._syncEvents.length >= 2) {
            self._parentMap.events.add('move', self._syncEvents[0]);
            self._overviewMap.events.add('move', self._syncEvents[1]);
        }
    }

    /** Detach map move handlers to the maps. */
    private _detachEvents() {
        const self = this;
        if (self._parentMap && self._syncEvents.length >= 2) {
            self._parentMap.events.remove('move', self._syncEvents[0]);
            self._overviewMap.events.remove('move', self._syncEvents[1]);
        }
    }

    /**
     * Synchronize all maps with a base map.
     * @param baseMap The base map to synchronize with. 
     */
    private _syncMaps(baseMap: azmaps.Map) {
        if (baseMap) {
            const self = this;
            const opt = self._options;
            const parentMap = self._parentMap;
            const overviewMap = self._overviewMap;

            self._detachEvents();

            const cam = baseMap.getCamera();
            const newCam: azmaps.CameraOptions = {
                center: cam.center,
                type: 'jump'
            };

            if (opt.syncBearingPitch) {
                newCam.bearing = cam.bearing;
                newCam.pitch = cam.pitch;
            }

            if (baseMap !== parentMap) {
                newCam.zoom = opt.syncZoom ? Math.min(Math.max(cam.zoom - opt.zoomOffset, 0), 24) : opt.zoom;

                parentMap.setCamera(newCam);
            }

            if (baseMap !== overviewMap) {
                newCam.zoom = opt.syncZoom ? Math.min(Math.max(cam.zoom + opt.zoomOffset, 0), 24) : opt.zoom;

                if(!opt.syncBearingPitch){
                    newCam.bearing = 0;
                    newCam.pitch = 0;
                }

                overviewMap.setCamera(newCam);
            }

            self._updateOverlay();
            self._attachEvents();
        }
    }

    /** Updates the position of the overlay. */
    private _updateOverlay(): void {
        const self = this;
        const opt = self._options;

        //Calculate the area.
        if (opt.overlay === 'area') {
            //Simply using the bounding box of the map will not generate a polygon that represents the map area when it is rotated and pitched. 
            //Instead we need to calculate the coordinates of the corners of the map. 
            const mapRect = self._parentMap.getCanvasContainer().getBoundingClientRect();
            const width = mapRect.width;
            const height = mapRect.height;

            //Calculate coordinates from the pixel corners of the map.
            const coordinates = self._parentMap.pixelsToPositions([
                //Top Left corner
                [0, 0],

                //Top right corner.
                [width, 0],

                //Bottom Right corner.
                [width, height],

                //Bottom left corner.
                [0, height],

                //Top Left corner again to close the polygon.
                [0, 0]
            ]);
            self._area.setCoordinates(coordinates);
        } else if (opt.overlay === 'marker') {
            self._marker.setOptions({ position: self._overviewMap.getCamera().center });
        }
    }

    /**
     * Translations: ['Overview map control', 'Expand overview map', 'Collapse overview map']
     */
    private static _resx = {
        af: ['Oorsig kaart beheer', 'Uit te brei oorsig kaart', 'Val oorsig kaart'],
        ar: ['نظرة عامة تحكم خريطة', 'توسيع الخريطة نظرة عامة', 'طي خريطة نظرة عامة'],
        eu: ['Orokorra mapa kontrol', 'Zabaldu ikuspegi mapa', 'Tolestu ikuspegi mapa'],
        bg: ['Преглед контрол карта', 'Разширете обзорна карта', 'Свиване на обзорната карта'],
        zh: ['总览图控制', '展开地图概述', '关闭总览图'],
        hr: ['Kontrola karta Pregled', 'Proširite preglednu kartu', 'Sažmi preglednu kartu'],
        cs: ['Přehled ovládání mapa', 'Expandovat mapku', 'Sbalit mapku'],
        da: ['Oversigtskort kontrol', 'Udvid oversigtskort', 'Skjul oversigtskort'],
        nl: ['Overzichtskaart controle', 'Expand overzichtskaart', 'Collapse overzichtskaart'],
        et: ['Ülevaade Kaart kontrolli', 'Laienda Ülevaatekaardi', 'Ahenda Ülevaatekaardi'],
        fi: ['Yleiskuvakartta ohjaus', 'Laajenna yleiskuvakartta', 'Romahtaa yleiskuvakartta'],
        fr: ['contrôle Présentation carte', 'Agrandir la carte Vue d\'ensemble', 'Réduire carte générale'],
        gl: ['control mapa xeral', 'Expandir mapa xeral', 'Recoller mapa xeral'],
        de: ['Übersichtskarte Kontrolle', 'Erweitern Übersichtskarte', 'Collapse Übersichtskarte'],
        el: ['Επισκόπηση έλεγχο χάρτη', 'Διεύρυνση χάρτη επισκόπησης', 'Σύμπτυξη επισκόπηση του χάρτη'],
        hi: ['सिंहावलोकन मानचित्र नियंत्रण', 'ओवरव्यू मानचित्र को विस्तृत', 'ओवरव्यू मानचित्र को संकुचित करें'],
        hu: ['Áttekintő térkép ellenőrzés', 'Nagyítás áttekintő térkép', 'Összecsukása áttekintő térkép'],
        id: ['peta kendali ikhtisar', 'Memperluas peta ikhtisar', 'Perkecil peta ikhtisar'],
        it: ['Panoramica controllo della mappa', 'Ingrandisci la mappa panoramica', 'Collapse mappa panoramica'],
        ja: ['概要マップコントロール', '概観マップを展開', '概観マップを折りたたみます'],
        kk: ['Шолу картасы бақылау', 'Картаны шолу Expand', 'Картаны шолу Collapse'],
        ko: ['전체지도 제어', '전체지도를 확장', '개요지도 축소'],
        es: ['Descripción general del mando mapa', 'Ampliar el mapa general', 'Contraer mapa general'],
        lv: ['Pārskata karte kontrole', 'Izvērst pārskata karti', 'Sakļaut pārskata karti'],
        lt: ['Apžvalga Žemėlapis kontrolė', 'Išplėsti apžvalga žemėlapį', 'Sutraukti apžvalga žemėlapį'],
        ms: ['Gambaran keseluruhan kawalan peta', 'Buka peta gambaran', 'Runtuh peta gambaran'],
        nb: ['Oversiktskart kontroll', 'Utvid oversiktskart', 'Skjul oversiktskart'],
        pl: ['Przegląd kontrola mapa', 'Rozwinąć mapę ogólną', 'Zwinąć mapę ogólną'],
        pt: ['controle mapa geral', 'Expandir mapa geral', 'Recolher mapa geral'],
        ro: ['Controlul harta generală', 'Extindeți harta prezentare generală', 'Restrângere hartă generală'],
        ru: ['Обзор управления картой', 'Развернуть обзорную карту', 'Свернуть обзорную карту'],
        sr: ['Преглед мапа контрола', 'Проширити преглед карту', 'Скупи преглед карту'],
        sk: ['Prehľad ovládania mapa', 'expandovať mapku', 'zbaliť mapku'],
        sl: ['Pregled nadzor zemljevid', 'Razširi pregledni zemljevid', 'Collapse pregledni zemljevid'],
        sv: ['Översiktskarta kontroll', 'Expandera översiktskarta', 'Dölj översiktskarta'],
        th: ['การควบคุมแผนที่ภาพรวม', 'ขยายแผนที่ภาพรวม', 'ยุบแผนที่ภาพรวม'],
        tr: ['Genel harita kontrolü', 'Genel bakış haritasını genişlet', 'Genel bakış haritasını aç'],
        uk: ['Огляд управління картою', 'Розгорнути оглядову карту', 'Згорнути оглядову карту'],
        vi: ['kiểm soát Bản đồ toàn cảnh', 'Mở rộng bản đồ tổng thể', 'Thu bản đồ tổng thể'],
        en: ['Overview map control', 'Expand overview map', 'Collapse overview map']
    };

    /**
     * Returns the set of translation text resources needed for the center and zoom control for a given language.
     * @param map The map to try and get the language from.
     * @returns The translated text for the aria label for the center and zoom control.
     */
    private static _getAriaLabel(map?: azmaps.Map): string[] {
        let lang;

        if (map) {
            lang = map.getStyle().language;
        } else {
            lang = atlas.getLanguage();
        }

        let val = OverviewMap._resx[lang.toLowerCase()];

        if (!val) {
            val = OverviewMap._resx.en;
        }

        return val;
    }
}
