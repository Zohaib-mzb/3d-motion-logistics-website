import {useEffect} from 'react';
import type {RefObject} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function HomeScrollMotion({root}:{root:RefObject<HTMLDivElement|null>}){
  useEffect(()=>{
    if(!root.current||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const ctx=gsap.context(()=>{
      const groups=[
        {selector:'.journey-steps > div',trigger:'.journey-steps',stagger:.12},
        {selector:'.stat',trigger:'.stats-grid',stagger:.15},
        {selector:'.service-card',trigger:'.service-grid',stagger:.09},
      ];
      groups.forEach(({selector,trigger,stagger})=>{
        const nodes=gsap.utils.toArray<HTMLElement>(selector,root.current);
        if(nodes.length)gsap.fromTo(nodes,{opacity:.85,y:16},{opacity:1,y:0,duration:.75,stagger,ease:'power2.out',scrollTrigger:{trigger,start:'top bottom+=250',once:true}});
      });
      ['.dashboard','.ev-visual','.near-network'].forEach(selector=>{
        gsap.utils.toArray<HTMLElement>(selector,root.current).forEach(node=>gsap.fromTo(node,{opacity:.85,y:16},{opacity:1,y:0,duration:.9,ease:'power2.out',scrollTrigger:{trigger:node,start:'top bottom+=250',once:true}}));
      });
    },root);
    return()=>ctx.revert();
  },[root]);
  return null;
}
