import {media} from '../config/media';
export type FleetCategory = 'Electric'|'Passenger'|'Cargo';
export const fleet = [
  {name:'EV',category:'Electric',power:'Electric',use:'Urban efficiency',description:'Efficient urban final-mile routes designed for lighter parcel volumes.',image:media.fleet.evSedan,imageSmall:media.fleet.evSedan.replace('.webp','-768.webp')},
  {name:'Sedan',category:'Passenger',power:'Conventional / hybrid',use:'Same-day agility',description:'Fast, agile movement for smaller parcel loads.',image:media.fleet.sedan,imageSmall:media.fleet.sedan.replace('.webp','-768.webp')},
  {name:'SUV / Crossover',category:'Passenger',power:'Mixed powertrain',use:'Flexible routes',description:'Adaptable space for varied route requirements.',image:media.fleet.suv,imageSmall:media.fleet.suv.replace('.webp','-768.webp')},
  {name:'Compact Cargo',category:'Cargo',power:'Mixed powertrain',use:'Dense city routes',description:'A compact cargo format for efficient neighborhood delivery.',image:media.fleet.compactCargo,imageSmall:media.fleet.compactCargo.replace('.webp','-768.webp')},
  {name:'Cargo Van',category:'Cargo',power:'Mixed powertrain',use:'Parcel volume',description:'Higher-volume parcel delivery across business routes.',image:media.fleet.cargoVan,imageSmall:media.fleet.cargoVan.replace('.webp','-768.webp')},
  {name:'Large Cargo Van',category:'Cargo',power:'Mixed powertrain',use:'Distribution demand',description:'Scalable route capacity for busy distribution operations.',image:media.fleet.largeCargo,imageSmall:media.fleet.largeCargo.replace('.webp','-768.webp')},
] as const;
