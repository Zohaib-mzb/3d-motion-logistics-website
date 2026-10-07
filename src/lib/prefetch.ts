import {fleet} from '../data/fleet';
import {media} from '../config/media';

let pagesPromise:Promise<unknown>|undefined;
const warmed=new Set<string>();
const navigationRoutes=new Set(['/services','/fleet','/coverage','/about','/carriers','/drivers','/careers','/contact','/quote']);

export function prefetchRoute(path:string){
  if(navigationRoutes.has(path))pagesPromise??=import('../pages/ContentPages');
  return pagesPromise;
}
function warmFleetImage(vehicle:(typeof fleet)[number]){
  const target=window.innerWidth*window.devicePixelRatio;
  warmImage(target<850?vehicle.imageSmall:vehicle.image);
}
function warmImage(src:string){
  if(warmed.has(src))return;
  warmed.add(src);
  const image=new Image();
  image.decoding='async';
  image.src=src;
  void image.decode?.().catch(()=>{});
}
function scheduleIdle(callback:()=>void,timeout=2400){
  if(typeof window.requestIdleCallback==='function'){
    const id=window.requestIdleCallback(callback,{timeout});
    return ()=>window.cancelIdleCallback(id);
  }
  const id=globalThis.setTimeout(callback,400);
  return ()=>window.clearTimeout(id);
}
export function scheduleBackgroundPrefetch(pathname:string){
  const connection=navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}};
  if(connection.connection?.saveData||connection.connection?.effectiveType==='slow-2g')return ()=>{};
  let cancelled=false;
  let timer=0;
  const cancelIdle=scheduleIdle(()=>{
    if(cancelled)return;
    if(pathname==='/'){
      warmImage(media.film.poster);
      void prefetchRoute('/services');
      timer=window.setTimeout(()=>{
        if(cancelled)return;
        warmImage(media.city.torontoDelivery);
        warmImage(media.operations.center);
        fleet.forEach(warmFleetImage);
        warmImage(media.ev.delivery);
      },1800);
    }else{
      void prefetchRoute('/services');
      if(pathname==='/fleet')fleet.forEach(warmFleetImage);
    }
  });
  return ()=>{cancelled=true;cancelIdle();window.clearTimeout(timer)};
}
