import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Link,NavLink,useLocation} from 'react-router-dom';
import {Menu,X,ArrowUpRight} from 'lucide-react';
import {navigation,mobileNavigation} from '../../data/navigation';
import {BrandLogo} from '../common/BrandLogo';
import {prefetchRoute} from '../../lib/prefetch';

export function Navbar(){
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const location=useLocation();
  const routeRef=useRef(location.pathname);
  const menuRef=useRef<HTMLDivElement>(null);
  const toggleRef=useRef<HTMLButtonElement>(null);
  routeRef.current=location.pathname;

  useEffect(()=>{setOpen(false)},[location.pathname]);
  useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>24);onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll)},[]);
  useEffect(()=>{
    if(!open)return;
    const openedAt=routeRef.current;
    const scrollY=window.scrollY;
    const body=document.body;
    const toggle=toggleRef.current;
    const old={position:body.style.position,top:body.style.top,left:body.style.left,right:body.style.right,width:body.style.width,overflow:body.style.overflow,paddingRight:body.style.paddingRight};
    const scrollbar=window.innerWidth-document.documentElement.clientWidth;
    body.style.position='fixed';body.style.top=`-${scrollY}px`;body.style.left='0';body.style.right='0';body.style.width='100%';body.style.overflow='hidden';
    if(scrollbar>0)body.style.paddingRight=`${scrollbar}px`;
    menuRef.current?.querySelector<HTMLButtonElement>('.mobile-menu-close')?.focus();
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setOpen(false);return}
      if(event.key!=='Tab'||!menuRef.current)return;
      const items=Array.from(menuRef.current.querySelectorAll<HTMLElement>('button,a[href]'));
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    };
    document.addEventListener('keydown',onKeyDown);
    return()=>{
      document.removeEventListener('keydown',onKeyDown);
      Object.assign(body.style,old);
      if(routeRef.current===openedAt){window.scrollTo({top:scrollY,behavior:'instant'});toggle?.focus()}
    };
  },[open]);

  return <>
    <header className={`site-header ${scrolled?'is-scrolled':''}`}>
      <div className="nav-shell">
        <Link to="/" className="brand" aria-label="Velcotiy Techniques Inc home"><BrandLogo/></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">{navigation.map(item=><NavLink to={item.to} key={item.to} onMouseEnter={()=>void prefetchRoute(item.to)} onFocus={()=>void prefetchRoute(item.to)} className={({isActive})=>isActive?'active':''}>{item.label}</NavLink>)}</nav>
        <div className="nav-actions"><Link className="contact-link" to="/contact" onMouseEnter={()=>void prefetchRoute('/contact')} onFocus={()=>void prefetchRoute('/contact')}>Contact</Link><Link className="nav-quote" to="/quote" onMouseEnter={()=>void prefetchRoute('/quote')} onFocus={()=>void prefetchRoute('/quote')}>GET A QUOTE <ArrowUpRight size={15}/></Link></div>
        <button ref={toggleRef} className="menu-toggle" type="button" aria-label="Open menu" aria-controls="mobile-navigation" aria-expanded={open} onClick={()=>setOpen(true)}><Menu/></button>
      </div>
    </header>
    {open&&createPortal(<div className="mobile-panel is-open" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site navigation" ref={menuRef}>
      <div className="mobile-menu-top"><BrandLogo/><button className="mobile-menu-close" type="button" aria-label="Close menu" onClick={()=>setOpen(false)}><X/></button></div>
      <nav aria-label="Mobile navigation">{mobileNavigation.map((item,i)=><NavLink to={item.to} key={item.to} style={{transitionDelay:`${i*35}ms`}} className={item.to==='/quote'?'mobile-quote':''} onClick={()=>setOpen(false)}>{item.label}<ArrowUpRight size={20}/></NavLink>)}</nav>
      <p>FINAL-MILE DELIVERY · CANADA</p>
    </div>,document.body)}
  </>;
}
