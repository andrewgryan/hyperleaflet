import { tileLayer, control, TileLayer, map, GeoJSON, marker, icon, polyline, polygon } from 'leaflet';

var tileLayers = {
  OpenStreetMap: tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }),
  EsriWorldImagery: tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  })
};
function addTileLayer(newTileLayer) {
  if (tileLayers[newTileLayer.name]) {
    console.warn("Tile layer " + newTileLayer.name + " already exists. Skipping.");
    return;
  }
  tileLayers[newTileLayer.name] = newTileLayer.tile;
}

function createGenericMapEvent(map, eventName) {
  var bounds = map.getBounds();
  var min = bounds.getSouthWest();
  var max = bounds.getNorthEast();
  var bboxString = bounds.toBBoxString();
  var event = new CustomEvent(eventName, {
    detail: {
      zoom: map.getZoom(),
      center: map.getCenter(),
      bbox: {
        min: min,
        max: max
      },
      bboxString: bboxString
    }
  });
  return event;
}
function setMapEvents(map) {
  map.on('click', function (e) {
    var event = new CustomEvent('map:click', {
      detail: {
        point: e.latlng
      }
    });
    window.dispatchEvent(event);
  });
  map.whenReady(function () {
    var event = createGenericMapEvent(map, 'map:load');
    window.dispatchEvent(event);
  });
  map.on('zoomend', function () {
    var event = createGenericMapEvent(map, 'map:zoom');
    window.dispatchEvent(event);
  });
  map.on('move', function () {
    var event = createGenericMapEvent(map, 'map:move');
    window.dispatchEvent(event);
  });
  map.on('moveend', function () {
    var event = createGenericMapEvent(map, 'map:moveend');
    window.dispatchEvent(event);
  });
  map.on('movestart', function () {
    var event = createGenericMapEvent(map, 'map:movestart');
    window.dispatchEvent(event);
  });
  return map;
}
function sendHyperleafletReady(map) {
  var event = createGenericMapEvent(map, 'hyperleaflet:ready');
  window.dispatchEvent(event);
}

function createCustomTileLayer(url, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
    minZoom = _ref.minZoom,
    maxZoom = _ref.maxZoom,
    tms = _ref.tms;
  return new TileLayer(url, {
    minZoom: minZoom || 0,
    maxZoom: maxZoom || 18,
    tms: !!tms
  });
}
function createTileController(tiles) {
  return tiles.length ? control.layers(Object.fromEntries(tiles.map(function (_ref2) {
    var name = _ref2.name,
      tile = _ref2.tile;
    return [name, tile];
  }))) : null;
}
function parseTileLayerElement(tileLayerElement) {
  var _tileLayerElement$dat = tileLayerElement.dataset,
    tile = _tileLayerElement$dat.tile,
    tileUrl = _tileLayerElement$dat.tileUrl,
    tms = _tileLayerElement$dat.tms,
    minZoom = _tileLayerElement$dat.minZoom,
    maxZoom = _tileLayerElement$dat.maxZoom;
  if (tileUrl) {
    var newTile = createCustomTileLayer(tileUrl, {
      minZoom: minZoom,
      maxZoom: maxZoom,
      tms: tms === 'true'
    });
    addTileLayer({
      name: tile,
      tile: newTile
    });
  }
  var currentTile = tileLayers[tile];
  if (!currentTile) {
    // eslint-disable-next-line no-console
    console.warn(tile + " is not in: \n" + Object.keys(tileLayers).join('\n'));
    return null;
  }
  currentTile.options.minZoom = minZoom;
  currentTile.options.maxZoom = maxZoom;
  return {
    tile: currentTile,
    name: tile
  };
}
function reverseCoordinates(point) {
  return point.reverse();
}
function safeParsePoint(pointJson, reverse) {
  if (reverse === void 0) {
    reverse = false;
  }
  try {
    var point = JSON.parse(pointJson);
    return reverse ? reverseCoordinates(point) : point;
  } catch (_) {
    return [0, 0];
  }
}

var hyperleafletConfig = {
  reverseOrderAll: false
};

function getDefaultHyperleafletTile(tileLayerElementList) {
  var defaultTileLayerElement = tileLayerElementList.find(function (t) {
    return 'defaultTile' in t.dataset;
  });
  if (defaultTileLayerElement && defaultTileLayerElement.dataset.tile in tileLayers) {
    return tileLayers[defaultTileLayerElement.dataset.tile];
  }
  if (tileLayerElementList.length && tileLayerElementList[0].dataset.tile in tileLayers) {
    return tileLayers[tileLayerElementList[0].dataset.tile];
  }
  return tileLayers.OpenStreetMap;
}
function createHyperleafletTiles(tileLayerElementNodeList) {
  var tileLayerElementList = Array.from(tileLayerElementNodeList);
  var hyperleafletTiles = tileLayerElementList.map(parseTileLayerElement).filter(Boolean);
  var defaultHyperleafletTile = getDefaultHyperleafletTile(tileLayerElementList);
  var tileController = createTileController(hyperleafletTiles);
  return {
    defaultHyperleafletTile: defaultHyperleafletTile,
    tileController: tileController
  };
}
function createHyperleafletMap(mapElement) {
  var _mapElement$dataset = mapElement.dataset,
    center = _mapElement$dataset.center,
    zoom = _mapElement$dataset.zoom,
    minZoom = _mapElement$dataset.minZoom,
    maxZoom = _mapElement$dataset.maxZoom;
  var reverseOrderAll = hyperleafletConfig.reverseOrderAll;
  var mapView = {
    center: safeParsePoint(center, reverseOrderAll),
    zoom: zoom || 1
  };
  var leafletMap = map(mapElement, {
    center: mapView.center,
    zoom: mapView.zoom,
    minZoom: minZoom || 0,
    maxZoom: maxZoom || 18
  });
  return setMapEvents(leafletMap);
}

function geometryObjectHandler() {
  var geometryObjectElement = document.createElement('script');
  geometryObjectElement.type = 'application/json';
  geometryObjectElement.setAttribute('data-testid', 'json');
  geometryObjectElement.innerText = '{}';
  document.body.appendChild(geometryObjectElement);
  var geometryObject = JSON.parse(geometryObjectElement.text);
  var addToGeometryObject = function addToGeometryObject(node) {
    var _node$dataset = node.dataset,
      id = _node$dataset.id,
      geometry = _node$dataset.geometry,
      geometryType = _node$dataset.geometryType;
    node.removeAttribute('data-geometry');
    geometryObject[id] = {
      type: geometryType,
      coordinates: JSON.parse(geometry)
    };
    geometryObjectElement.text = JSON.stringify(geometryObject, null, 2);
  };
  var removeFromGeometryObject = function removeFromGeometryObject(node) {
    var id = node.dataset.id;
    delete geometryObject[id];
    geometryObjectElement.text = JSON.stringify(geometryObject, null, 2);
  };
  return {
    addToGeometryObject: addToGeometryObject,
    removeFromGeometryObject: removeFromGeometryObject
  };
}

function utils(node) {
  node.removeAttribute('data-geometry');
}

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

function setPointEvents(leafletObject, id) {
  leafletObject.on('click', function (e) {
    var event = new CustomEvent('geometry:click', {
      detail: {
        clickedPoint: e.latlng,
        geometry: leafletObject.getLatLng(),
        rowId: id
      }
    });
    window.dispatchEvent(event);
  });
}
function setPolyGeometryEvents(leafletObject, id) {
  leafletObject.on('click', function (e) {
    var event = new CustomEvent('geometry:click', {
      detail: {
        clickedPoint: e.latlng,
        geometry: leafletObject.getLatLngs(),
        rowId: id
      }
    });
    window.dispatchEvent(event);
  });
}

var createPointGeometry = function createPointGeometry(parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? [].concat(parsedGeometry).reverse() : parsedGeometry;
  var leafletGeometry;
  if (options.icon) {
    leafletGeometry = marker(geometry, {
      icon: icon(JSON.parse(options.icon))
    });
  } else {
    leafletGeometry = marker(geometry);
  }
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPointEvents(leafletGeometry, options.id);
  return leafletGeometry;
};
function changePointGeometry(leafletObject, parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? [].concat(parsedGeometry).reverse() : parsedGeometry;
  leafletObject.setLatLng(geometry);
  return leafletObject;
}
var createLineGeometry = function createLineGeometry(parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder,
    polylineOptions = options.options;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 0) : parsedGeometry;
  var leafletGeometry = polyline(geometry, polylineOptions);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(leafletGeometry, options.id);
  return leafletGeometry;
};
function changeLineGeometry(leafletObject, parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 0) : parsedGeometry;
  leafletObject.setLatLngs(geometry);
  return leafletObject;
}
var createPolygonGeometry = function createPolygonGeometry(parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder,
    polylineOptions = options.options;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 1) : parsedGeometry;
  var leafletGeometry = polygon(geometry, polylineOptions);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(leafletGeometry, options.id);
  return leafletGeometry;
};
function changePolygonGeometry(leafletObject, parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 1) : parsedGeometry;
  leafletObject.setLatLngs(geometry);
  return leafletObject;
}
var createGeometry = function createGeometry(geometryType) {
  return function (parsedGeometry, options) {
    switch (geometryType) {
      case 'Point':
        return createPointGeometry(parsedGeometry, options);
      case 'LineString':
        return createLineGeometry(parsedGeometry, options);
      case 'Polygon':
        return createPolygonGeometry(parsedGeometry, options);
      default:
        // eslint-disable-next-line no-console
        console.warn(geometryType + " is not supported");
        return null;
    }
  };
};
function changeGeometry(leafletObject, change) {
  var geometryType = change.dataset.geometryType;
  var parsedGeometry = JSON.parse(change.to);
  var reverseOrderAll = hyperleafletConfig.reverseOrderAll;
  switch (geometryType) {
    case 'Point':
      return changePointGeometry(leafletObject, parsedGeometry, _extends({}, change.dataset, {
        reverseOrderAll: reverseOrderAll
      }));
    case 'LineString':
      return changeLineGeometry(leafletObject, parsedGeometry, _extends({}, change.dataset, {
        reverseOrderAll: reverseOrderAll
      }));
    case 'Polygon':
      return changePolygonGeometry(leafletObject, parsedGeometry, _extends({}, change.dataset, {
        reverseOrderAll: reverseOrderAll
      }));
    default:
      // eslint-disable-next-line no-console
      console.warn(geometryType + " is not supported");
      return null;
  }
}
function changeOptions(leafletObject, change) {
  var options = change.to;
  return leafletObject.setStyle(JSON.parse(options));
}
function createLeafletObject(dataset) {
  // Image overlay
  if ('l' in dataset) {
    return createL(dataset);
  }

  // Geometry based L objects
  var geometry = dataset.geometry,
    popup = dataset.popup,
    tooltip = dataset.tooltip,
    geometryType = dataset.geometryType,
    id = dataset.id,
    reverseOrder = dataset.reverseOrder,
    _dataset$options = dataset.options,
    options = _dataset$options === void 0 ? '{}' : _dataset$options,
    icon = dataset.icon;
  var parsedGeometry = JSON.parse(geometry);
  var parsedOptions = JSON.parse(options);
  var reverseOrderAll = hyperleafletConfig.reverseOrderAll;
  var createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, {
    popup: popup,
    tooltip: tooltip,
    id: id,
    reverseOrderAll: reverseOrderAll,
    reverseOrder: reverseOrder,
    options: parsedOptions,
    icon: icon
  });
}

/**
 * Create a L.* leaflet object from HTML data-* attributes
 */
function createL(dataset) {
  if (dataset.l.toLowerCase() === 'imageoverlay') {
    [['imageUrl', 'data-image-url'], ['imageBounds', 'data-image-bounds']].forEach(function (_ref) {
      var attr = _ref[0],
        htmlAttr = _ref[1];
      if (typeof dataset[attr] === 'undefined') {
        throw new Error("Required attribute " + htmlAttr + " for image overlay not specified in dataset.");
      }
    });
    var options = undefined;
    if (typeof dataset.imageOpacity !== 'undefined') {
      options = {
        opacity: Number(dataset.imageOpacity)
      };
    }
    return L.imageOverlay(dataset.imageUrl, JSON.parse(dataset.imageBounds), options);
  } else {
    throw new Error("data-l " + dataset.l + " not supported");
  }
}

/**
 * Change L.* leaflet object attributes
 */
function changeL(leafletObject, change) {
  switch (change.attribute.toLowerCase()) {
    case 'data-image-bounds':
      return leafletObject.setBounds(JSON.parse(change.to));
    case 'data-image-url':
      return leafletObject.setUrl(change.to);
    case 'data-image-opacity':
      return leafletObject.setOpacity(Number(change.to));
    default:
      throw new Error("change to " + change.attribute + " not supported");
  }
}
function changeLeafletObject(leafletObject, change) {
  switch (change.attribute.toLowerCase()) {
    case 'data-geometry':
      {
        return changeGeometry(leafletObject, change);
      }
    case 'data-options':
      {
        return changeOptions(leafletObject, change);
      }
    case 'data-l':
    case 'data-image-url':
    case 'data-image-bounds':
    case 'data-image-opacity':
      return changeL(leafletObject, change);
    default:
      {
        throw new Error("Unsupported attribute " + change.attribute + " in dataset for changing Leaflet object.");
      }
  }
}

var _excluded = ["dataset"];
function addNodeToHyperleaflet(node, map) {
  var dataset = node.dataset;
  var rowId = dataset.id;
  // eslint-disable-next-line no-underscore-dangle
  var leafletLayers = Object.values(map._layers);
  if (leafletLayers.find(function (layer) {
    return layer.hlID === rowId;
  })) {
    // eslint-disable-next-line no-console
    console.error("%c" + rowId, 'color:red', 'already exists', node);
    return;
  }
  var leafletObject = createLeafletObject(_extends({}, dataset));
  leafletObject.hlID = rowId;
  leafletObject.addTo(map);
}
function deleteNodeFromHyperleaflet(node, map) {
  var rowId = node.dataset.id;

  // eslint-disable-next-line no-underscore-dangle
  var leafletLayers = Object.values(map._layers);
  var leafletObject = leafletLayers.find(function (layer) {
    return layer.hlID === rowId;
  });
  leafletObject == null ? void 0 : leafletObject.remove();
}
function changeNodeInHyperleaflet(change, map) {
  var rowId = change['data-id'];
  // eslint-disable-next-line no-underscore-dangle
  var leafletLayers = Object.values(map._layers);
  var leafletObject = leafletLayers.find(function (layer) {
    return layer.hlID === rowId;
  });
  changeLeafletObject(leafletObject, change);
}
function hyperleafletGeometryHandler(map, _ref) {
  var _ref$addCallback = _ref.addCallback,
    addCallback = _ref$addCallback === void 0 ? function () {} : _ref$addCallback,
    _ref$removeCallback = _ref.removeCallback,
    removeCallback = _ref$removeCallback === void 0 ? function () {} : _ref$removeCallback;
  var addNoteListToHyperleaflet = function addNoteListToHyperleaflet(nodes) {
    nodes.forEach(function (node) {
      addNodeToHyperleaflet(node, map);
      addCallback(node);
    });
  };
  function removeNodeListFromHyperleaflet(nodes) {
    nodes.forEach(function (node) {
      deleteNodeFromHyperleaflet(node, map);
      removeCallback(node);
    });
  }
  function changeNodesInHyperleaflet(changes) {
    // changes is an array of changes and a dataset
    changes.forEach(function (change) {
      // NOTE: Some changes have shape { node, changes }, but these seem to be related to add/remove
      //       lifecycle events.
      var dataset = change.dataset,
        partialChanges = _objectWithoutPropertiesLoose(change, _excluded);
      if (typeof dataset !== 'undefined') {
        // Handle { dataset, { i: change } } format
        Object.values(partialChanges).forEach(function (partialChange) {
          changeNodeInHyperleaflet(_extends({}, partialChange, {
            dataset: dataset
          }), map);
        });
      }
    });
  }
  return {
    addNoteListToHyperleaflet: addNoteListToHyperleaflet,
    removeNodeListFromHyperleaflet: removeNodeListFromHyperleaflet,
    changeNodesInHyperleaflet: changeNodesInHyperleaflet
  };
}

/* eslint-disable object-shorthand */
var hyperChangeDetection = {
  events: {},
  /**
   * @param {string} targetSelector
   * @param {string} uniqueAttribute
   * @param {string[]} attributeFilter
   */
  observe: function observe(_ref) {
    var targetSelector = _ref.targetSelector,
      uniqueAttribute = _ref.uniqueAttribute,
      attributeFilter = _ref.attributeFilter;
    if (this.events[targetSelector]) {
      throw new Error("Can't observer twice");
    }
    observeChangesInTarget(targetSelector, uniqueAttribute, attributeFilter);
    this.events[targetSelector] = {};
  },
  /**
   * @param {string} targetSelector
   * @param {'node_adds' | 'node_removes', 'node_changes'} evName
   * @param {(nodes: Node[] | *)=>void} secondFunction
   */
  subscribe: function subscribe(targetSelector, evName, secondFunction) {
    this.events[targetSelector][evName] = this.events[targetSelector][evName] || [];
    this.events[targetSelector][evName].push(secondFunction);
  },
  /**
   * @param {string} targetSelector
   * @param {'node_adds' | 'node_removes', 'node_changes'} evName
   * @param {*} fn
   * */
  unsubscribe: function unsubscribe(targetSelector, evName, fn) {
    if (this.events[targetSelector][evName]) {
      this.events[targetSelector][evName] = this.events[targetSelector][evName].filter(function (f) {
        return f !== fn;
      });
    }
  },
  /**
   * @param {string} targetSelector
   * @param {'node_adds' | 'node_removes', 'node_changes'} evName
   * @param {*} data
   */
  publish: function publish(targetSelector, evName, data) {
    if (this.events[targetSelector][evName]) {
      this.events[targetSelector][evName].forEach(function (f) {
        f(data);
      });
    }
  }
};
window.pubsub = hyperChangeDetection;

/**
 * @param {string} targetSelector
 * @param {string} uniqueAttribute
 * @param {string[]} attributeFilter
 */
function observeChangesInTarget(targetSelector, uniqueAttribute, attributeFilter) {
  var observer = new MutationObserver(function (mutationsList) {
    var _removedNodes$filter, _addedNodes$filter;
    var t0 = performance.now();
    var removedNodes = [];
    var addedNodes = [];
    // Iterate through the mutations
    mutationsList.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        // Child nodes added or removed
        removedNodes.push.apply(removedNodes, findNodesWithAttribute(mutation.removedNodes));
        addedNodes.push.apply(addedNodes, findNodesWithAttribute(mutation.addedNodes));
      } else if (mutation.type === 'attributes') {
        var _attributeChange;
        var attribute = mutation.attributeName;
        var attributeChange = (_attributeChange = {
          attribute: attribute,
          from: mutation.oldValue,
          to: mutation.target.getAttribute(attribute)
        }, _attributeChange[uniqueAttribute] = mutation.target.getAttribute(uniqueAttribute), _attributeChange);
        var changedNode = [{
          node: mutation.target,
          changes: attributeChange
        }];
        if (changedNode.length) {
          hyperChangeDetection.publish(targetSelector, 'node_changes', changedNode);
        }
      }
    });
    var changedNodes = [];
    var removedNodeMap = new Map(removedNodes.map(function (node) {
      return [node.getAttribute(uniqueAttribute), node];
    }));
    var jointNodeSet = new Set();
    addedNodes.forEach(function (addNode) {
      var addNodeId = addNode.getAttribute(uniqueAttribute);
      var oldNode = removedNodeMap.get(addNodeId);
      if (oldNode) {
        jointNodeSet.add(addNodeId);
      }
      if (oldNode && !isEqualNode(oldNode, addNode, attributeFilter)) {
        var attributeChanges = attributeFilter.reduce(function (changes, attribute) {
          var from = oldNode.getAttribute(attribute);
          var to = addNode.getAttribute(attribute);
          if (from !== to) {
            var _changes$push;
            changes.push((_changes$push = {
              attribute: attribute,
              from: from,
              to: to
            }, _changes$push[uniqueAttribute] = addNodeId, _changes$push));
          }
          return changes;
        }, []);
        changedNodes.push(_extends({}, attributeChanges, {
          dataset: addNode.dataset
        }));
      }
    });
    var reallyRemovedNodes = (_removedNodes$filter = removedNodes.filter(function (node) {
      return !jointNodeSet.has(node.getAttribute(uniqueAttribute));
    })) != null ? _removedNodes$filter : [];
    var reallyAddedNodes = (_addedNodes$filter = addedNodes.filter(function (node) {
      return !jointNodeSet.has(node.getAttribute(uniqueAttribute));
    })) != null ? _addedNodes$filter : [];
    if (reallyAddedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_adds', reallyAddedNodes);
    }
    if (changedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_changes', changedNodes);
    }
    if (reallyRemovedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_removes', reallyRemovedNodes);
    }
    var t1 = performance.now();
    console.log(" " + (t1 - t0) + " milliseconds.");
  });
  var isEqualNode = function isEqualNode(oldNode, newNode, attributes) {
    return attributes.every(function (attribute) {
      return oldNode.getAttribute(attribute) === newNode.getAttribute(attribute);
    });
  };
  function findNodesWithAttribute(nodes) {
    var result = [];
    nodes.forEach(function (node) {
      if (node.nodeType === 1) {
        if (node.hasAttribute(uniqueAttribute)) {
          result.push(node);
        }
        result.push.apply(result, findNodesWithAttribute(node == null ? void 0 : node.childNodes));
      }
    });
    return result;
  }

  // Configuration options for the observer
  var config = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: attributeFilter,
    attributeOldValue: true
  };
  var targetNode = document.querySelector(targetSelector);
  observer.observe(targetNode, config);
}

var HYPERLEAFLET_DATA_SOURCE = '[data-hyperleaflet-source]';
function hyperleafletDataToMap(map) {
  var hyperleafletDataSource = document.querySelector(HYPERLEAFLET_DATA_SOURCE);
  if (!hyperleafletDataSource) return;
  var geometryDisplay = hyperleafletDataSource.dataset.geometryDisplay || 'none';
  var callbackFunctions = {};
  if (geometryDisplay === 'json') {
    var _geometryObjectHandle = geometryObjectHandler(),
      addToGeometryObject = _geometryObjectHandle.addToGeometryObject,
      removeFromGeometryObject = _geometryObjectHandle.removeFromGeometryObject;
    callbackFunctions = {
      addCallback: addToGeometryObject,
      removeCallback: removeFromGeometryObject
    };
  } else if (geometryDisplay === 'remove') {
    callbackFunctions = {
      addCallback: utils,
      removeCallback: function removeCallback() {}
    };
  }
  var _hyperleafletGeometry = hyperleafletGeometryHandler(map, callbackFunctions),
    addNoteListToHyperleaflet = _hyperleafletGeometry.addNoteListToHyperleaflet,
    removeNodeListFromHyperleaflet = _hyperleafletGeometry.removeNodeListFromHyperleaflet,
    changeNodesInHyperleaflet = _hyperleafletGeometry.changeNodesInHyperleaflet;
  map.whenReady(function () {
    var nodes = hyperleafletDataSource.querySelectorAll('[data-id]');
    addNoteListToHyperleaflet(nodes);
  });
  hyperChangeDetection.observe({
    targetSelector: HYPERLEAFLET_DATA_SOURCE,
    uniqueAttribute: 'data-id',
    attributeFilter: ['data-geometry', 'data-options', 'data-l', 'data-image-url', 'data-image-bounds', 'data-image-opacity']
  });
  hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_adds', function (data) {
    addNoteListToHyperleaflet(data);
  });
  hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_removes', function (data) {
    removeNodeListFromHyperleaflet(data);
  });
  hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_changes', function (data) {
    changeNodesInHyperleaflet(data);
  });
}

function createMap() {
  var initialized = false;
  function initMap() {
    var mapContainer = document.querySelector('#map');
    if (mapContainer && !initialized) {
      initialized = true;
      var reverseOrderAll = mapContainer.dataset.reverseOrderAll;
      if (reverseOrderAll !== undefined) {
        hyperleafletConfig.reverseOrderAll = true;
      }
      var map = createHyperleafletMap(mapContainer);
      var tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
      var _createHyperleafletTi = createHyperleafletTiles(tileLayerElementList),
        defaultHyperleafletTile = _createHyperleafletTi.defaultHyperleafletTile,
        tileController = _createHyperleafletTi.tileController;
      if (tileController) {
        tileController.addTo(map);
      }
      defaultHyperleafletTile.addTo(map);
      hyperleafletDataToMap(map);
      window.hyperleaflet = {
        map: map
      };
      sendHyperleafletReady(map);
    }
  }
  function observeMap() {
    var observer = new MutationObserver(function () {
      var mapElement = document.querySelector('#map');
      if (mapElement) {
        initMap();
      } else if (initialized) {
        initialized = false;
        delete window.hyperleaflet;
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  return {
    initMap: initMap,
    observeMap: observeMap
  };
}

var hyperleaflet = function hyperleaflet() {
  var _createMap = createMap(),
    initMap = _createMap.initMap,
    observeMap = _createMap.observeMap;
  document.addEventListener('DOMContentLoaded', function () {
    initMap();
    observeMap();
  });
}();

export { hyperleaflet as default };
//# sourceMappingURL=hyperleaflet.esm.js.map
