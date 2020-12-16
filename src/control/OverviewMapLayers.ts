import * as azmaps from "azure-maps-control";

/** Layers used in an overview map to render the parent maps viewport area as a polygon. */
export interface OverviewMapLayers {
    /** Layer that renders the outline of the parent maps viewport. */
    lineLayer?: azmaps.layer.LineLayer;

    /** Layer that renders the area of the parent maps viewport. */
    polygonLayer?: azmaps.layer.PolygonLayer;
}