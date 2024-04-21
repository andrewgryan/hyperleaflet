import { GeoJSON, icon, marker, polygon, polyline } from 'leaflet';
import { setPointEvents, setPolyGeometryEvents } from './events';
import hyperleafletConfig from '../config';

const createPointGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder, icon: iconSettings } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? [...parsedGeometry].reverse() : parsedGeometry;
  let leafletGeometry;
  if (options.icon) {
    leafletGeometry = marker(geometry, { icon: icon(JSON.parse(options.icon)) });
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
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? [...parsedGeometry].reverse() : parsedGeometry;
  leafletObject.setLatLng(geometry);
  return leafletObject;
}

const createLineGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder, options: polylineOptions } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 0) : parsedGeometry;
  const leafletGeometry = polyline(geometry, polylineOptions);
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
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 0) : parsedGeometry;
  leafletObject.setLatLngs(geometry);
  return leafletObject;
}

const createPolygonGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder, options: polylineOptions } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 1) : parsedGeometry;
  const leafletGeometry = polygon(geometry, polylineOptions);
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
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 1) : parsedGeometry;
  leafletObject.setLatLngs(geometry);
  return leafletObject;
}

const createGeometry = (geometryType) => (parsedGeometry, options) => {
  switch (geometryType) {
    case 'Point':
      return createPointGeometry(parsedGeometry, options);
    case 'LineString':
      return createLineGeometry(parsedGeometry, options);
    case 'Polygon':
      return createPolygonGeometry(parsedGeometry, options);
    default:
      // eslint-disable-next-line no-console
      console.warn(`${geometryType} is not supported`);
      return null;
  }
};

function changeGeometry(leafletObject, change) {
  const { geometryType } = change.dataset;
  const parsedGeometry = JSON.parse(change.to);
  const { reverseOrderAll } = hyperleafletConfig;

  switch (geometryType) {
    case 'Point':
      return changePointGeometry(leafletObject, parsedGeometry, {
        ...change.dataset,
        reverseOrderAll,
      });
    case 'LineString':
      return changeLineGeometry(leafletObject, parsedGeometry, {
        ...change.dataset,
        reverseOrderAll,
      });
    case 'Polygon':
      return changePolygonGeometry(leafletObject, parsedGeometry, {
        ...change.dataset,
        reverseOrderAll,
      });
    default:
      // eslint-disable-next-line no-console
      console.warn(`${geometryType} is not supported`);
      return null;
  }
}

function changeOptions(leafletObject, change) {
  const { to: options } = change;
  return leafletObject.setStyle(JSON.parse(options));
}

export function createLeafletObject(dataset) {
  // Image overlay
  if ('l' in dataset) {
    return createL(dataset);
  }

  // Geometry based L objects
  const { geometry, popup, tooltip, geometryType, id, reverseOrder, options = '{}', icon } = dataset;
  const parsedGeometry = JSON.parse(geometry);
  const parsedOptions = JSON.parse(options);
  const { reverseOrderAll } = hyperleafletConfig;
  const createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, {
    popup,
    tooltip,
    id,
    reverseOrderAll,
    reverseOrder,
    options: parsedOptions,
    icon,
  });
}

/**
 * Create a L.* leaflet object from HTML data-* attributes
 */
function createL(dataset) {
  if (dataset.l.toLowerCase() === 'imageoverlay') {
    [
      ['imageUrl', 'data-image-url'],
      ['imageBounds', 'data-image-bounds'],
    ].forEach(([attr, htmlAttr]) => {
      if (typeof dataset[attr] === 'undefined') {
        throw new Error(`Required attribute ${htmlAttr} for image overlay not specified in dataset.`);
      }
    });
    let options = undefined;
    if (typeof dataset.imageOpacity !== 'undefined') {
      options = {
        opacity: Number(dataset.imageOpacity),
      };
    }
    return L.imageOverlay(dataset.imageUrl, JSON.parse(dataset.imageBounds), options);
  } else {
    throw new Error(`data-l ${dataset.l} not supported`);
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
      throw new Error(`change to ${change.attribute} not supported`);
  }
}

export function changeLeafletObject(leafletObject, change) {
  switch (change.attribute.toLowerCase()) {
    case 'data-geometry': {
      return changeGeometry(leafletObject, change);
    }
    case 'data-options': {
      return changeOptions(leafletObject, change);
    }
    case 'data-l':
    case 'data-image-url':
    case 'data-image-bounds':
    case 'data-image-opacity':
      return changeL(leafletObject, change);
    default: {
      throw new Error(`Unsupported attribute ${change.attribute} in dataset for changing Leaflet object.`);
    }
  }
}
