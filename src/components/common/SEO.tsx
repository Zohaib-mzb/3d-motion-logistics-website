import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {siteConfig} from '../../config/siteConfig';
import {services} from '../../data/services';

interface Props {title:string;description:string;path?:string;noIndex?:boolean}
const base=siteConfig.siteUrl.replace(/\/$/,'');
const pageNames:Record<string,string>={
  '/':'Home','/services':'Services','/fleet':'Fleet','/coverage':'Coverage','/about':'About',
  '/carriers':'Business Delivery','/drivers':'Drivers','/careers':'Careers','/contact':'Contact','/quote':'Get a Quote'
};
function meta(name:string,content:string,property=false){
  const attribute=property?'property':'name';
  let element=document.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if(!element){element=document.createElement('meta');element.setAttribute(attribute,name);document.head.appendChild(element)}
  element.content=content;
}
function link(rel:string,href:string){
  let element=document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if(!element){element=document.createElement('link');element.rel=rel;document.head.appendChild(element)}
  element.href=href;
}
export function SEO({title,description,path,noIndex=false}:Props){
  const location=useLocation();
  useEffect(()=>{
    const cleanPath=(path??location.pathname).replace(/\/$/,'')||'/';
    const url=`${base}${cleanPath==='/'?'':cleanPath}`;
    const image=`${base}/brand/velcotiy-og.png`;
    document.title=title;
    meta('description',description);
    meta('robots',noIndex?'noindex,follow':'index,follow');
    link('canonical',url);
    meta('og:site_name',siteConfig.companyName,true);
    meta('og:title',title,true);
    meta('og:description',description,true);
    meta('og:type','website',true);
    meta('og:url',url,true);
    meta('og:image',image,true);
    meta('og:image:width','1200',true);
    meta('og:image:height','630',true);
    meta('og:image:alt','Velcotiy Techniques Inc — final-mile delivery in Canada',true);
    meta('twitter:card','summary_large_image');
    meta('twitter:title',title);
    meta('twitter:description',description);
    meta('twitter:image',image);
    const organization={'@type':'Organization', '@id':`${base}/#organization`,name:siteConfig.companyName,url:base,email:siteConfig.businessEmail,telephone:siteConfig.businessPhone,logo:`${base}/brand/velcotiy-logo-horizontal-navy.png`,description:'Canadian final-mile delivery and delivery operations business.'};
    const graph:Record<string,unknown>[]=noIndex?[]:[organization,{'@type':'WebSite','@id':`${base}/#website`,url:base,name:siteConfig.companyName,publisher:{'@id':`${base}/#organization`}}];
    if(!noIndex&&cleanPath!=='/'){
      graph.push({'@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'Home',item:base+'/'},
        {'@type':'ListItem',position:2,name:pageNames[cleanPath]||title,item:url}
      ]});
    }
    if(cleanPath==='/services')services.forEach(service=>graph.push({
      '@type':'Service',name:service.title,description:service.description,serviceType:service.title,
      provider:{'@id':`${base}/#organization`},url:`${url}#${service.id}`
    }));
    if(cleanPath==='/carriers')graph.push({'@type':'Service',name:'Warehouse-to-Doorstep Delivery',description:'Warehouse pickup, fleet, driver coordination, dispatch and final-mile delivery for businesses.',provider:{'@id':`${base}/#organization`},url});
    let script=document.getElementById('site-schema') as HTMLScriptElement|null;
    if(!script){script=document.createElement('script');script.id='site-schema';script.type='application/ld+json';document.head.appendChild(script)}
    script.textContent=JSON.stringify({'@context':'https://schema.org','@graph':graph});
  },[title,description,path,noIndex,location.pathname]);
  return null;
}
