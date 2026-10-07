import {useRef} from 'react';
import {SEO} from '../components/common/SEO';
import {HomeScrollMotion} from '../components/common/HomeScrollMotion';
import {Hero,Journey,TorontoFinalMile,FleetPreview,Stats,Operations,ServicesPreview,Sustainability,CoveragePreview,AboutPreview} from '../sections/home/HomeSections';
export default function HomePage(){const root=useRef<HTMLDivElement>(null);return <div ref={root}><SEO title="Velcotiy Techniques Inc | Final-Mile Delivery Canada" description="Velcotiy Techniques Inc provides scalable final-mile, same-day and EV-focused delivery solutions supported by flexible fleet capacity and active operations management." path="/"/><HomeScrollMotion root={root}/><Hero/><Journey/><TorontoFinalMile/><FleetPreview/><Stats/><Operations/><ServicesPreview/><Sustainability/><CoveragePreview/><AboutPreview/></div>}
