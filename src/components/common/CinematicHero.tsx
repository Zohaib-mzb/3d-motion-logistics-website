import {useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {MotionPathPlugin} from 'gsap/MotionPathPlugin';
import {media} from '../../config/media';
gsap.registerPlugin(MotionPathPlugin);

const shots = [
  {desktop:media.hero.desktopPoster,mobile:media.hero.mobilePoster,label:'01 / WAREHOUSE READY',position:'center 58%'},
  {desktop:media.hero.sortingDesktop,mobile:media.hero.sortingDesktop,label:'02 / PARCELS IN MOTION',position:'center'},
  {desktop:media.hero.loadingDesktop,mobile:media.hero.loadingMobile,label:'03 / VEHICLES LOADED',position:'center'},
  {desktop:media.hero.departureDesktop,mobile:media.hero.departureMobile,label:'04 / FLEET DISPATCHED',position:'center'},
  {desktop:media.hero.torontoDesktop,mobile:media.hero.torontoMobile,label:'05 / TORONTO DELIVERY',position:'center'},
];
function loadImage(src:string){return new Promise<void>(resolve=>{const image=new Image();image.onload=()=>resolve();image.onerror=()=>resolve();image.src=src;void image.decode?.().then(()=>resolve()).catch(()=>{})})}
export function CinematicHero(){
  const root=useRef<HTMLDivElement>(null);
  const timelineRef=useRef<gsap.core.Timeline|null>(null);
  const pausedRef=useRef(false);
  const visibleRef=useRef(false);
  const [paused,setPaused]=useState(false);
  const [sequenceReady,setSequenceReady]=useState(false);
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let cancelled=false;
    let idleId:number|undefined;
    let timer:number|undefined;
    const prepare=async()=>{
      const first=root.current?.querySelector('img');
      if(first)await first.decode().catch(()=>{});
      if(cancelled)return;
      const mobile=window.matchMedia('(max-width: 640px)').matches;
      for(const shot of shots.slice(1)){
        await loadImage(mobile?shot.mobile:shot.desktop);
        if(cancelled)return;
      }
      setSequenceReady(true);
    };
    if(typeof window.requestIdleCallback==='function')idleId=window.requestIdleCallback(()=>void prepare(),{timeout:2200});
    else timer=window.setTimeout(()=>void prepare(),500);
    return()=>{cancelled=true;if(idleId!==undefined)window.cancelIdleCallback(idleId);if(timer!==undefined)window.clearTimeout(timer)};
  },[]);
  useEffect(()=>{
    const node=root.current;
    if(!node||!sequenceReady||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const layers=gsap.utils.toArray<HTMLElement>('.cinematic-shot',node);
    const route=node.querySelector<SVGPathElement>('.cinematic-route-path');
    const marker=node.querySelector<SVGCircleElement>('.cinematic-route-marker');
    const timeline=gsap.timeline({paused:true,repeat:-1});
    timelineRef.current=timeline;
    const camera=[
      {from:{xPercent:-3,yPercent:1,scale:1.14},to:{xPercent:1,yPercent:-1,scale:1.06}},
      {from:{xPercent:3,yPercent:0,scale:1.16},to:{xPercent:-2,yPercent:0,scale:1.07}},
      {from:{xPercent:-2,yPercent:1,scale:1.13},to:{xPercent:2,yPercent:-1,scale:1.05}},
      {from:{xPercent:4,yPercent:0,scale:1.14},to:{xPercent:-3,yPercent:0,scale:1.04}},
      {from:{xPercent:0,yPercent:0,scale:1.15},to:{xPercent:0,yPercent:0,scale:1.02}},
    ];
    layers.forEach((layer,index)=>{
      timeline.set(layer,{opacity:index===0?1:0,...camera[index].from},0);
      if(index>0)timeline.to(layer,{opacity:1,duration:1.15,ease:'sine.inOut'},index*4.2);
      timeline.to(layer,{...camera[index].to,duration:4.9,ease:'sine.inOut'},index*4.2);
      if(index<layers.length-1)timeline.to(layer,{opacity:0,duration:1.15,ease:'sine.inOut'},index*4.2+3.25);
    });
    if(route&&marker){timeline.to(route,{strokeDashoffset:0,duration:4.2,ease:'power1.inOut'},16.8);
      timeline.to(marker,{motionPath:{path:route,align:route,alignOrigin:[.5,.5]},opacity:1,duration:4.2,ease:'power1.inOut'},16.8);
      timeline.to([route,marker],{opacity:0,duration:1},20.3)}
    timeline.to(layers[0],{opacity:1,...camera[0].from,duration:1.1,ease:'sine.inOut'},20.3);
    timeline.to(layers[layers.length-1],{opacity:0,duration:1.1,ease:'sine.inOut'},20.3);
    const observer=new IntersectionObserver(([entry])=>{visibleRef.current=entry.isIntersecting;if(entry.isIntersecting&&!document.hidden&&!pausedRef.current)timeline.play();else timeline.pause()},{threshold:.08});
    observer.observe(node);
    const onVisibility=()=>{if(document.hidden||!visibleRef.current||pausedRef.current)timeline.pause();else timeline.play()};
    document.addEventListener('visibilitychange',onVisibility);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);timeline.kill();timelineRef.current=null};
  },[sequenceReady]);
  const togglePlayback=()=>setPaused(value=>{pausedRef.current=!value;if(pausedRef.current)timelineRef.current?.pause();else if(visibleRef.current&&!document.hidden)timelineRef.current?.play();return !value});
  return <><div className="cinematic-hero" ref={root} aria-hidden="true">
    {shots.slice(0,sequenceReady?shots.length:1).map((shot,index)=><div className="cinematic-shot" key={shot.label} style={{opacity:index===0?1:0}}><picture><source media="(max-width: 640px)" srcSet={shot.mobile}/><img src={shot.desktop} alt="" fetchPriority={index===0?'high':'auto'} loading={index===0?'eager':'lazy'} decoding="async" style={{objectPosition:shot.position}}/></picture></div>)}
    <div className="cinematic-vignette"/>
    <svg className="cinematic-route" viewBox="0 0 1000 500" preserveAspectRatio="none"><path className="cinematic-route-path" d="M-80 405 C170 310 220 450 390 300 S700 220 810 120 S980 70 1070 -40"/><circle className="cinematic-route-marker" r="5" cx="0" cy="0"/></svg>
  </div><button className="cinematic-toggle" type="button" onClick={togglePlayback} aria-label={paused?'Play hero motion':'Pause hero motion'}>{paused?'PLAY MOTION':'PAUSE MOTION'}</button></>;
}
