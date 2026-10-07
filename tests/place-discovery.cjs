const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Element {
    constructor(tag) { this.tagName=tag;this.children=[];this.dataset={};this.classList={toggle(){}}; }
    append(...items){this.children.push(...items);} appendChild(item){this.append(item);return item;}
    prepend(item){this.children.unshift(item);} replaceChildren(...items){this.children=items;}
    setAttribute(key,value){this[key]=value;} addEventListener(type,handler){(this.listeners??={})[type]=handler;}
}
const host=new Element('section'),resumeHost=new Element('div'),strip=new Element('div'),storage=new Map();
const records=[{areaId:'way/1',name:'A',lng:135,lat:34,attributes:['shade'],linkedFeatures:[],activities:[]},
 {areaId:'way/2',name:'B',lng:135.002,lat:34,attributes:[],activities:[{picture_url1:'File:Example.jpg'}],linkedFeatures:[{feature:{properties:{amenity:'bench'}}}]}];
let network=0,jumps=0,center={lng:135,lat:34},loadedImages=[];
const context={Date,console,Conf:{etc:{localSave:'sample'},discovery:{use:true,presetIds:['relax'],featureFacts:[{key:'amenity',value:'bench',labelKey:'seating'}]}},
 localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
 document:{querySelector:()=>null,getElementById:id=>id==='placeDiscovery'?host:id==='placeResume'?resumeHost:strip,createElement:tag=>new Element(tag),querySelectorAll:()=>loadedImages},
 glot:{lang:'en',get:key=>key},cMapMaker:{status:'normal'},
 mapLibre:{getZoom:()=>15,getUserLocation:()=>null,map:{getCenter:()=>center,jumpTo:options=>{jumps++;center={lng:options.center[0],lat:options.center[1]};}}},
 poiStatusCont:{getRecord:()=>({})},areaFeatureLinker:{records,resolveAreaId:id=>id,getAreaRecord:id=>records.find(record=>record.areaId===id)},
 areaSearchController:{attributes:['shade'],presetDefinitions:{relax:{}},visibleRecords:()=>records,attributeLabel:code=>code,presetLabel:code=>code},
 fetch:()=>{network++;throw new Error('Unexpected API');}}
vm.createContext(context);vm.runInContext(fs.readFileSync('lib/discoverycontroller.js','utf8')+'\nthis.Controller=PlaceDiscoveryController',context);
const controller=new context.Controller();
context.areaSearchController.applyLocalPreset=name=>{context.areaSearchController.activeCriteria={preset:name};controller.render();};
context.areaSearchController.clear=()=>{context.areaSearchController.activeCriteria=null;controller.render();};
controller.render();assert.equal(host.children.length,2);assert.equal(host.children[1].tagName,'select');
assert.equal(host.children[1].children.length,2);assert.equal(resumeHost.hidden,true); // No duplicate candidate list or action buttons.
controller.choose('relax');assert.equal(host.children[1].value,'relax');assert.equal(network,0);
assert.deepEqual(Array.from(controller.facts(records[1])),['seating']);assert.equal(controller.photo(records[1]),'');
loadedImages=[{complete:true,naturalWidth:100,dataset:{lazySrc:'File:Example.jpg'},src:'blob:loaded',getAttribute:key=>({osmid:'way/2',src:'blob:loaded',src_thumb:'https://example.test/photo.jpg'})[key]}];
assert.equal(controller.photo(records[1]),'blob:loaded');loadedImages=[];
const returning=new context.Controller();context.areaSearchController.activeCriteria=null;
context.areaSearchController.applyLocalPreset=name=>{context.areaSearchController.activeCriteria={preset:name};returning.render();};
context.areaSearchController.clear=()=>{context.areaSearchController.activeCriteria=null;returning.render();};
returning.render();assert.equal(resumeHost.hidden,false);assert.equal(JSON.parse(storage.get(controller.storageKey)).purpose,'relax');
center={lng:136,lat:35};returning.resume();assert.equal(jumps,1);assert.equal(host.children[1].value,'relax');assert.equal(resumeHost.hidden,true);
returning.resume();assert.equal(jumps,1);assert.equal(network,0);
context.localStorage.getItem=()=>{throw new Error('Denied');};context.localStorage.setItem=()=>{throw new Error('Denied');};
assert.doesNotThrow(()=>new context.Controller().render());
context.Conf.areaSearch={previewCounts:false};context.Conf.activity={authMode:'basic'};context.Conf.poiView={poiZoom:{}};
context.mapLibre.getZoom=()=>11;context.clearTimeout=()=>{};
context.setTimeout=()=>{throw new Error('Unexpected API timer');};
vm.runInContext(fs.readFileSync('lib/areasearchcontroller.js','utf8')+'\nthis.Search=AreaSearchController',context);
const search=new context.Search({rebuildIndex:()=>[],records:[]});search.getAreaZoom=()=>12;search.label=key=>key;
search.remoteSearch=true;assert.equal(search.usesSearchApi(),true);search.localOnly=true;assert.equal(search.usesSearchApi(),false);
search.renderDisplayStatus=()=>{};search.updateListTitle=()=>{};
strip.hidden=false;search.renderSummary();assert.equal(strip.hidden,true); // Local purpose does not duplicate controls over the map.
search.localOnly=false;search.readForm=()=>({});
(async()=>{
 await search.updatePreviewCount();assert.equal(network,0);
 search.setForm=()=>{};search.rebuildRecords=()=>{};search.updateRatingActionLabel=()=>{};
 search.refreshVisibleResults=()=>{};search.close=()=>{};search.renderSummary=()=>{};
 context.listTable={setViewBinding(){},setAreaFilter(){}};context.cMapMaker.changeMode=()=>{};
 await search.applyLocalPreset('relax');assert.equal(search.localOnly,true);assert.equal(search.activeCriteria.preset,'relax');assert.equal(network,0);
 let explicitRequests=0;search.fetchSearch=async()=>{explicitRequests++;return{items:[]};};
 context.AbortController=AbortController;context.setTimeout=()=>0;
 await search.apply({scoreMin:3,attributes:[]},{remoteSearch:true});assert.equal(search.localOnly,false);assert.equal(explicitRequests,1);
 await search.syncSearch();assert.equal(explicitRequests,1);
 search.searchBbox=()=>"changed";await search.syncSearch();assert.equal(explicitRequests,1);assert.equal(search.localOnly,true);
 context.document.querySelector=()=>({value:'unvisited'});
 search.draftVisitState='off';search.activeCriteria={preset:'relax',scoreMin:4,attributes:['shade'],matchMode:'and'};
 search.readForm=()=>({scoreMin:4,attributes:['shade'],matchMode:'and'});
 assert.equal(search.draftCriteria().custom,true); // Changing personal conditions breaks the preset identity.
 context.document.querySelector=()=>({value:'off'});
 assert.equal(search.draftCriteria().preset,'relax');
 search.readForm=()=>({scoreMin:3,attributes:['shade'],matchMode:'and'});
 assert.equal(search.draftCriteria().custom,true);
 context.cMapMaker.favoriteFilter=true;
 await search.applyFromForm();assert.equal(search.localOnly,true);assert.equal(explicitRequests,1);
 assert.equal(context.cMapMaker.favoriteFilter,false);assert.equal(context.cMapMaker.visitedFilterStatus,'off');
 search.searchBbox=()=>null;await search.searchFromForm();assert.equal(explicitRequests,1);
 search.searchBbox=()=>"135,34,136,35";context.mapLibre.getZoom=()=>16;
 await search.searchFromForm();assert.equal(explicitRequests,2);assert.equal(search.usesSearchApi(),true);
 console.log('PASS: one purpose selector, local list filtering, explicit API search, continuation, cached photos and disabled storage');
})().catch(error=>{console.error(error);process.exitCode=1;});
