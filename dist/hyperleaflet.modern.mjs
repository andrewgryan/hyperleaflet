import e from"leaflet";import{defineExtension as t}from"htmx.org";function o(){return o=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var n in o)Object.prototype.hasOwnProperty.call(o,n)&&(e[n]=o[n])}return e},o.apply(this,arguments)}const n={OpenStreetMap:e.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),EsriWorldImagery:e.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"})},r=function(){if(void 0===e)return void console.error("Hyperleaf can not access Leaflet");const r=document.querySelector("#map"),a=r.querySelectorAll("[data-tile]"),l={center:[0,0],zoom:1,tile:n.OpenStreetMap},{dataset:c}=r,s=(null==c?void 0:c.center.split(","))||l.center.center,i=(null==c?void 0:c.zoom)||l.zoom;let{tile:d}=l;const m={};a.forEach(e=>{const{dataset:t}=e,o=t.tile;if(o in n){const e=n[o];e.options.minZoom=t.minZoom,e.options.maxZoom=t.maxZoom,m[o]=e,"default"in t&&(d=e)}else console.warn(`${o} is not in: \n${Object.keys(n).join("\n")}`)});const p=e.map(r).setView(s,i);!function(e){e.on("click",e=>{const t=document.getElementById("map"),o=new CustomEvent("mapclick",{detail:{latlng:e.latlng}});t.dispatchEvent(o)}),e.on("zoomend",()=>{const t=document.getElementById("map"),o=new CustomEvent("mapzoom",{detail:{zoom:e.getZoom()}});t.dispatchEvent(o)}),e.on("move",()=>{const t=document.getElementById("map"),o=new CustomEvent("mapmove",{detail:{bbox:e.getBounds(),center:e.getCenter()}});t.dispatchEvent(o)})}(p),Object.keys(m).length&&e.control.layers(m).addTo(p),d.addTo(p);const u={},y=new Proxy(u,{set(t,o,n){const r=e.marker(n.split(",")).addTo(p);return function(e,t){e.on("click",e=>{const o=document.getElementById("map"),n=new CustomEvent("pointclick",{detail:{latlng:e.latlng,rowId:t}});o.dispatchEvent(n)})}(r,o),t[o]=r,!0},deleteProperty:(e,t)=>(e[t].remove(),delete e[t],!0)});return t("leaflet",{onEvent:e=>{["htmx:afterProcessNode","htmx:afterOnLoad"].includes(e)&&(e=>{const t=document.querySelector("[hx-ext=leaflet]").querySelectorAll("[data-id]"),n=Array.from(t).reduce((e,t)=>o({},e,{[t.dataset.id]:t.dataset.latlng}),{}),r=((e,t)=>{const o=Object.keys(e),n=Object.keys(t);return{adds:n.filter(e=>!o.includes(e)),deletes:o.filter(e=>!n.includes(e))}})(u,n);r.adds.forEach(e=>{y[e]=n[e]}),r.deletes.forEach(e=>{delete y[e]})})()}}),{map:p}}();export{r as default};
//# sourceMappingURL=hyperleaflet.modern.mjs.map