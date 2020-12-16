---
page_type: sample
description: An Azure Maps Web SDK module that provides a control that displays an overview map of the area the main map is focused on.
languages:
- javascript
- typescript
products:
- azure
- azure-maps
---

# Azure Maps Overview Map module

An Azure Maps Web SDK module that provides a control that displays an overview map of the area the main map is focused on. This is also often known as a mini-map.

**Samples**

[Mini Overview Map](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Mini%20overview%20Map)
<br/>[<img src="https://github.com/Azure-Samples/AzureMapsCodeSamples/raw/master/AzureMapsCodeSamples/SiteResources/screenshots/Mini-overview-Map.jpg" height="200px">](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Mini%20overview%20Map)

[Mini overview map options](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Mini%20overview%20map%20options)
<br/>[<img src="https://github.com/Azure-Samples/AzureMapsCodeSamples/raw/master/AzureMapsCodeSamples/SiteResources/screenshots/Mini-overview-map-options.jpg" height="200px">](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Mini%20overview%20map%20options)

## Getting started

Download the project and copy the `azure-maps-overview-map` JavaScript file from the `dist` folder into your project. 

**Usage**

```JavaScript
//Add the overview map control to the map.
map.controls.add(new atlas.control.OverviewMap(), {
    position: 'top-left'
});
```

## API Reference

### OverviewMap class

Implements: `atlas.Control`

Namespace: `atlas.control`

A control that displays an overview map of the area the main map is focused on.

**Contstructor**

> `OverviewMap(options?: OverviewMapOptions)`

**Methods**

| Name | Return type | Description |
|------|------|-------------|
| `dispose()` | | Dispose the overview map control and clean up its resources. |
| `getOverviewMap()` | `atlas.Map` | Get the overview map instance. Use this to get the map and customize its settings. |
| `getLayers()` | `OverviewMapLayers` | Get the underlying layers used to render the overview area on the map. |
| `getOptions()` | `OverviewMapOptions` | Get the options for the overview map control. |
| `setOptions(options: OverviewMapOptions)` | | Set the options for the overview map control. |

### OverviewMapOptions interface

Options for the `OverviewMap` control.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `height` | `number` | The height of the overview map in pixels. Default: `150` |
| `interactive` | `boolean` | Specifies if the overview map is interactive. Default: `true` |
| `mapStyle` | `string` | The name of the style to use when rendering the map. Available styles can be found in the [supported styles][https://docs.microsoft.com/azure/azure-maps/supported-map-styles) article. Default: `road` |
| `markerOptions` | `atlas.HtmlMarkerOptions` | Options for customizing the marker overlay. If the draggable option of the marker it enabled, the map will center over the marker location after it has been dragged to a new location. |
| `minimized` | `boolean` | Specifies if the overview map is minimized or not. Default: `false` |
| `overlay` | `'area'` \| `'marker'` \| `'none'` | Specifies the type of information to overlay on top of the map.<br/><br/> - area: shows a polygon area of the parent map view port.<br/> - marker: shows a marker for the center of the parent map.<br/> - none: does not display any overlay on top of the overview map.<br/><br/>Default: `'area'` |
| `showToggle` | `boolean` | Specifies if a toggle button for mininizing the overview map should be displayed or not. Default: `true` |
| `style` | `atlas.ControlStyle` \| `string` | The style of the control. Can be; light, dark, auto, or any CSS3 color. When set to auto, the style will change based on the map style. Default `light` |
| `syncBearingPitch` | `boolean` | Specifies if bearing and pitch changes should be synchronized. Default: `true` |
| `syncZoom` | `boolean` | Specifies if zoom level changes should be synchronized. Default: `true` |
| `visible` | `boolean` | Specifies if the overview map control is visible or not. Default: `true` |
| `width` | `number` | The width of the overview map in pixels. Default: `150` |
| `zoom` | `number` | Zoom level to set on overview map when not synchronizing zoom level changes. Default: `1` |
| `zoomOffset` | `number` | The number of zoom levels to offset from the parent map zoom level when synchronizing zoom level changes. Default: `-5` |

### OverviewMapLayers interface

Layers used in an overview map to render the parent maps viewport area as a polygon. 

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `lineLayer` | `atlas.layer.LineLayer` | Layer that renders the outline of the parent maps viewport. |
| `polygonLayer` | `atlas.layer.PolygonLayer` | Layer that renders the area of the parent maps viewport. |

## Related Projects

* [Azure Maps Web SDK Open modules](https://github.com/microsoft/Maps/blob/master/AzureMaps.md#open-web-sdk-modules) - A collection of open source modules that extend the Azure Maps Web SDK.
* [Azure Maps Web SDK Samples](https://github.com/Azure-Samples/AzureMapsCodeSamples)
* [Azure Maps Gov Cloud Web SDK Samples](https://github.com/Azure-Samples/AzureMapsGovCloudCodeSamples)
* [Azure Maps & Azure Active Directory Samples](https://github.com/Azure-Samples/Azure-Maps-AzureAD-Samples)
* [List of open-source Azure Maps projects](https://github.com/microsoft/Maps/blob/master/AzureMaps.md)

## Additional Resources

* [Azure Maps (main site)](https://azure.com/maps)
* [Azure Maps Documentation](https://docs.microsoft.com/azure/azure-maps/index)
* [Azure Maps Blog](https://azure.microsoft.com/blog/topics/azure-maps/)
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

## Contributing

We welcome contributions. Feel free to submit code samples, file issues and pull requests on the repo and we'll address them as we can. 
Learn more about how you can help on our [Contribution Rules & Guidelines](https://github.com/Azure-Samples/azure-maps-overview-map/blob/main/CONTRIBUTING.md). 

You can reach out to us anytime with questions and suggestions using our communities below:
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). 
For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or 
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

MIT
 
See [License](https://github.com/Azure-Samples/azure-maps-overview-map/blob/main/LICENSE.md) for full license text.