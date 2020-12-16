import * as azmaps from "azure-maps-control";

/** Options for the OverviewMapOptions. */
export interface OverviewMapOptions {

    /**
    * The style of the control. Can be; light, dark, auto, or any CSS3 color. When set to auto, the style will change based on the map style. Default `light`
    */
    style?: azmaps.ControlStyle | string;

    /**
     * The name of the style to use when rendering the map. 
     * Available styles can be found in the [supported styles](https://docs.microsoft.com/en-us/azure/azure-maps/supported-map-styles) article.
     * Default: `road`
     */
    mapStyle?: string;

    /** The number of zoom levels to offset from the parent map zoom level when synchronizing zoom level changes. Default: `-5` */
    zoomOffset?: number;

    /** Zoom level to set on overview map when not synchronizing zoom level changes. Default: `1` */
    zoom?: number;

    /** The width of the overview map in pixels. Default: `150` */
    width?: number;

    /** The height of the overview map in pixels. Default: `150` */
    height?: number;

    /** Specifies if bearing and pitch changes should be synchronized. Default: `true` */
    syncBearingPitch?: boolean;

    /** Specifies if zoom level changes should be synchronized. Default: `true` */
    syncZoom?: boolean;

    /** Specifies if the overview map is interactive. Default: `true` */
    interactive?: boolean;

    /** Specifies if the overview map is minimized or not. Default: `false` */
    minimized?: boolean;

    /** Specifies if a toggle button for mininizing the overview map should be displayed or not. Default: `true` */
    showToggle?: boolean;

    /** 
     * Specifies the type of information to overlay on top of the map.
     * - area: shows a polygon area of the parent map view port.
     * - marker: shows a marker for the center of the parent map.
     * - none: does not display any overlay on top of the overview map.
     * Default: `area`
     */
    overlay?: 'area' | 'marker' | 'none';

    /**
     * Options for customizing the marker overlay. 
     * If the draggable option of the marker it enabled, the map will center over the marker location after it has been dragged to a new location.
     */
    markerOptions?: azmaps.HtmlMarkerOptions;

    /** Specifies if the overview map control is visible or not. Default: `true` */
    visible?: boolean;
}
