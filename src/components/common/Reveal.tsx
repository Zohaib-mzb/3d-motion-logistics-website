import {useRef,useEffect} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
export function Reveal({children,className=''}:{children:React.ReactNode;className?:string}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(!ref.current||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const ctx=gsap.context(()=>{gsap.fromTo(ref.current,{y:12,opacity:.85},{y:0,opacity:1,duration:.6,ease:'power2.out',scrollTrigger:{trigger:ref.current,start:'top bottom+=240',once:true}})},ref);return()=>ctx.revert()},[]);return <div ref={ref} className={className}>{children}</div>}
