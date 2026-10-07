export type CityStatus = 'active'|'planned'|'hidden';
// VERIFY ACTUAL OPERATING LOCATIONS BEFORE PRODUCTION. All locations are illustrative placeholders.
export const coverage: Array<{city:string;region:string;x:number;y:number;status:CityStatus}> = [
  {city:'Vancouver',region:'British Columbia',x:13,y:64,status:'planned'},
  {city:'Calgary',region:'Alberta',x:29,y:61,status:'planned'},
  {city:'Edmonton',region:'Alberta',x:31,y:48,status:'planned'},
  {city:'Toronto',region:'Ontario',x:70,y:70,status:'planned'},
  {city:'Mississauga',region:'Ontario',x:68,y:72,status:'planned'},
  {city:'Brampton',region:'Ontario',x:67,y:68,status:'planned'},
  {city:'Ottawa',region:'Ontario',x:76,y:58,status:'planned'},
  {city:'Montreal',region:'Quebec',x:82,y:58,status:'planned'},
  {city:'Quebec City',region:'Quebec',x:86,y:46,status:'planned'},
];
