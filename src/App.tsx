import {lazy,Suspense,useEffect} from 'react';
import {Route,Routes,useLocation} from 'react-router-dom';
import {Navbar} from './components/layout/Navbar';
import {BrandLogo} from './components/common/BrandLogo';
import {scheduleBackgroundPrefetch} from './lib/prefetch';
import {Footer} from './components/layout/Footer';
import {ScrollToTop} from './components/layout/ScrollToTop';
const HomePage=lazy(()=>import('./pages/HomePage'));
const Pages=lazy(()=>import('./pages/ContentPages').then(m=>({default:function ContentRoutes(){const location=useLocation();switch(location.pathname){case '/services':return <m.ServicesPage/>;case '/fleet':return <m.FleetPage/>;case '/coverage':return <m.CoveragePage/>;case '/about':return <m.AboutPage/>;case '/carriers':return <m.CarriersPage/>;case '/drivers':return <m.DriversPage/>;case '/careers':return <m.CareersPage/>;case '/contact':return <m.ContactPage/>;case '/quote':return <m.QuotePage/>;default:return <m.NotFoundPage/>}}})));
export default function App(){const location=useLocation();useEffect(()=>scheduleBackgroundPrefetch(location.pathname),[location.pathname]);return <><ScrollToTop/><Navbar/><main id="main" className="route-main" key={location.pathname}><Suspense fallback={<div className="route-loader" aria-label="Loading page"><BrandLogo/></div>}><Routes><Route path="/" element={<HomePage/>}/><Route path="*" element={<Pages/>}/></Routes></Suspense></main><Footer/></>}
