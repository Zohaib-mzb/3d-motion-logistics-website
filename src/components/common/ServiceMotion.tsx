const paths:Record<string,string>={
  'final-mile':'M5 25 H34 Q43 25 43 16 H67 Q76 16 76 7 H105',
  'same-day':'M5 23 C28 23 25 5 49 5 S74 28 105 12',
  'distribution':'M5 16 H49 Q59 16 66 6 H105 M49 16 Q59 16 66 27 H105',
  'dedicated-fleet':'M5 9 H105 M5 16 H105 M5 23 H105',
  'ev-delivery':'M5 17 H37 L46 5 L57 28 L67 12 H105',
  'business-logistics':'M5 24 Q34 24 43 16 T75 16 H105',
};
export function ServiceMotion({id}:{id:string}){return <svg className="service-motion" viewBox="0 0 110 34" aria-hidden="true"><path className="service-motion-line" d={paths[id]||paths['final-mile']} pathLength="1"/><circle cx="5" cy="25" r="2.5"/><circle className="service-motion-dot" r="3" cy="16" cx="62"/></svg>}
