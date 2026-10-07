export function BrandLogo({tone='white',className=''}:{tone?:'white'|'navy';className?:string}){
  return <span className={`brand-logo ${className}`} role="img" aria-label="Velcotiy Techniques Inc">
    <img className="brand-logo-mark" src={`/brand/velcotiy-mark-${tone}.png`} alt="" width="286" height="453"/>
    <img className="brand-logo-wordmark" src={`/brand/velcotiy-wordmark-${tone}.png`} alt="" width="552" height="162"/>
  </span>;
}
