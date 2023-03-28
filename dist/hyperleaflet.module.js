import{tileLayer as t,map as e,control as o,marker as n,GeoJSON as r,polyline as a,polygon as i,geoJSON as l}from"leaflet";var d={OpenStreetMap:t("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),EsriWorldImagery:t("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"})};function p(t){var o,n=t.dataset,r=n.center,a=n.zoom,i={center:null!=(o=null==r?void 0:r.split(","))?o:[0,0],zoom:a||1};return function(t){return t.on("click",function(t){var e=new CustomEvent("mapclick",{detail:{point:t.latlng}});window.dispatchEvent(e)}),t.on("zoomend",function(){var e=new CustomEvent("mapzoom",{detail:{zoom:t.getZoom(),center:t.getCenter(),bbox:t.getBounds()}});window.dispatchEvent(e)}),t.on("move",function(){var e=new CustomEvent("mapmove",{detail:{zoom:t.getZoom(),center:t.getCenter(),bbox:t.getBounds()}});window.dispatchEvent(e)}),t}(e(t).setView(i.center,i.zoom))}var u=document.createElement("script");u.type="application/json",u.setAttribute("data-testid","debug"),u.innerText="{}",document.body.appendChild(u);var c=JSON.parse(u.text);function s(t){var e=t.dataset,o=e.id,n=e.geometry,r=e.geometryType;t.removeAttribute("data-geometry"),c[o]={type:r,coordinates:JSON.parse(n)},u.text=JSON.stringify(c,null,2)}function m(t){delete c[t.dataset.id],u.text=JSON.stringify(c,null,2)}function f(t){t.removeAttribute("data-geometry")}function v(){return v=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var o=arguments[e];for(var n in o)Object.prototype.hasOwnProperty.call(o,n)&&(t[n]=o[n])}return t},v.apply(this,arguments)}function y(t,e){t.on("click",function(){var o=new CustomEvent("pointclick",{detail:{point:t.getLatLng(),rowId:e}});window.dispatchEvent(o)})}var g=new Map,b=function(){var t=function(){var t=document.querySelector("#map"),e=p(t),n=function(t){var e=Array.from(t),n=e.map(function(t){var e=t.dataset,o=e.tile,n=e.maxZoom,r=d[o];return r?(r.options.minZoom=e.minZoom,r.options.maxZoom=n,r.name=o,{tile:r}):(console.warn(o+" is not in: \n"+Object.keys(d).join("\n")),null)}).filter(Boolean),r=function(t){var e=t.find(function(t){return"defaultTile"in t.dataset});return e?d[e.dataset.tile]:t.length?d[t[0].dataset.tile]:d.OpenStreetMap}(e);return{defaultHyperleafletTile:r,tileController:n.length?o.layers(Object.fromEntries(n.map(function(t){return[t.tile.name,t.tile]}))):null}}(t.querySelectorAll("[data-tile]")),r=n.defaultHyperleafletTile,a=n.tileController;return a&&a.addTo(e),r.addTo(e),e}();return function(t){var e=document.querySelector("[hyperleaflet]");if(e){var o=e.dataset.geometryDisplay||"object",l={};"object"===o?l={addCallback:s,removeCallback:m}:"remove"===o&&(l={addCallback:f,removeCallback:function(){}});var d=function(t,e){var o=e.addCallback,l=void 0===o?function(){}:o,d=e.removeCallback,p=void 0===d?function(){}:d;return{addNoteListToHyperleaflet:function(e){e.forEach(function(e){1===e.nodeType&&e.matches("[data-id]")&&(function(t){var e=t.dataset,o=e.id;if(o in g)return console.error("%c"+o,"color:red","already exists",t),[];var l,d,p,u,c,s,m=(d=(l=v({},e)).popup,p=l.tooltip,u=l.geometryType,c=l.id,s=JSON.parse(l.geometry),function(t){return function(e,o){switch(t){case"Point":return function(t,e){var o=n(t);return e.popup&&o.bindPopup(e.popup),e.tooltip&&o.bindTooltip(e.tooltip),y(o,e.id),o}(e,o);case"LineString":return function(t,e){var o=r.coordsToLatLngs(t,1),n=a(o);return e.popup&&n.bindPopup(e.popup),e.tooltip&&n.bindTooltip(e.tooltip),y(n,e.id),n}(e,o);case"Polygon":return function(t,e){var o=r.coordsToLatLngs(t,1),n=i(o);return e.popup&&n.bindPopup(e.popup),e.tooltip&&n.bindTooltip(e.tooltip),y(n,e.id),n}(e,o);default:return console.warn(t+" is not supported"),null}}}(u)(s,{popup:d,tooltip:p,id:c}));return g.set(o,m),[m]}(e)[0].addTo(t),l(e))})},removeNodeListToHyperleaflet:function(t){t.forEach(function(t){if(1===t.nodeType&&t.matches("[data-id]")){var e=function(t){var e=t.dataset.id,o=g.get(e);return g.delete(e),[o]}(t);e[0].remove(),p(t)}})}}}(t,l),p=d.addNoteListToHyperleaflet,u=d.removeNodeListToHyperleaflet;t.whenReady(function(){var t=e.querySelectorAll("[data-id]");p(t)}),new MutationObserver(function(t){t.forEach(function(t){"childList"===t.type&&(p(t.addedNodes),u(t.removedNodes))})}).observe(e,{childList:!0,subtree:!0,attributeFilter:["data-id"]})}}(t),{map:t,addGeoJsonToMap:function(e){l(e).addTo(t)}}}();export{b as default};
//# sourceMappingURL=hyperleaflet.module.js.map
