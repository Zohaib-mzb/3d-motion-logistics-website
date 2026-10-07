import {useEffect,useRef,useState} from 'react';
const phases=['ROUTE DISPATCHED','DRIVER IN TRANSIT','EXCEPTION DETECTED','DISPATCH RESOLVED','DELIVERY COMPLETE'];
export function OperationsPulse(){
  const ref=useRef<HTMLSpanElement>(null);const [phase,setPhase]=useState(0);
  useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const node=ref.current;if(!node)return;let timer:ReturnType<typeof setInterval>|undefined;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&!timer)timer=setInterval(()=>setPhase(value=>(value+1)%phases.length),2100);else if(!entry.isIntersecting&&timer){clearInterval(timer);timer=undefined}},{rootMargin:'100px'});observer.observe(node);return()=>{observer.disconnect();if(timer)clearInterval(timer)}},[]);
  return <span ref={ref} className={`operations-pulse operations-pulse--${phase}`} aria-live="polite"><i/>{phases[phase]}</span>;
}
