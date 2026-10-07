// lucide-react 0.468 expects ReactSVG, which React 19 no longer exports.
// Restore the SVG element-name map for this dependency's declaration file.
import 'react';

declare module 'react' {
  interface ReactSVG {
    svg: React.SVGProps<SVGSVGElement>;
    circle: React.SVGProps<SVGCircleElement>;
    line: React.SVGProps<SVGLineElement>;
    path: React.SVGProps<SVGPathElement>;
    polyline: React.SVGProps<SVGPolylineElement>;
    polygon: React.SVGProps<SVGPolygonElement>;
    rect: React.SVGProps<SVGRectElement>;
    ellipse: React.SVGProps<SVGEllipseElement>;
    g: React.SVGProps<SVGGElement>;
    defs: React.SVGProps<SVGDefsElement>;
    use: React.SVGProps<SVGUseElement>;
  }
}
