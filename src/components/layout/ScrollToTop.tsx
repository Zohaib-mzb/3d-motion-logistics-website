import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

export function ScrollToTop(){
  const {pathname,hash}=useLocation();
  useEffect(()=>{
    if(!hash){window.scrollTo({top:0,behavior:'instant'});return}
    const id=decodeURIComponent(hash.slice(1));
    const scroll=()=>{const target=document.getElementById(id);if(target)target.scrollIntoView({behavior:'instant'});return Boolean(target)};
    if(scroll())return;
    const observer=new MutationObserver(()=>{if(scroll())observer.disconnect()});
    observer.observe(document.getElementById('main')??document.body,{childList:true,subtree:true});
    const timeout=window.setTimeout(()=>observer.disconnect(),3000);
    return()=>{observer.disconnect();window.clearTimeout(timeout)};
  },[pathname,hash]);
  return null;
}
