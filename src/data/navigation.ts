export const navigation = [
  {label:'Services',to:'/services'}, {label:'Fleet',to:'/fleet'}, {label:'Coverage',to:'/coverage'},
  {label:'Company',to:'/about'}, {label:'Carriers',to:'/carriers'}, {label:'Careers',to:'/careers'},
];
export const mobileNavigation = [
  ...navigation.slice(0,3),{label:'About',to:'/about'},...navigation.slice(4,5),{label:'Drivers',to:'/drivers'},
  ...navigation.slice(5),{label:'Contact',to:'/contact'}, {label:'Get a Quote',to:'/quote'},
];
