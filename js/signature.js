/**
 * Animated SVG Signature Generator (Vanilla JavaScript / Web Component)
 * Ported from React / Opentype.js / Framer Motion
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Signature = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Render signature SVG into a container
   * @param {HTMLElement|string} container 
   * @param {Object} props 
   */
  async function renderSignature(container, props = {}) {
    const target = typeof container === 'string' ? document.querySelector(container) : container;
    if (!target) {
      console.warn("Signature: Target element not found.", container);
      return;
    }

    const {
      text = "Signature",
      color = "currentColor",
      fontSize = 32,
      strokeWidth = 1,
      duration = 1.5,
      delay = 0,
      className = "",
      inView = false,
      once = true,
      fontUrl = null
    } = props;

    // Check if opentype is available
    if (typeof opentype === 'undefined') {
      console.error("Signature error: opentype.js is required. Include <script src='https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js'></script> before loading signature.js");
      return;
    }

    // Default font fallback paths
    const fontPaths = fontUrl
      ? [fontUrl]
      : [
          "/LastoriaBoldRegular.otf",
          "./LastoriaBoldRegular.otf",
          "https://componentry.dev/LastoriaBoldRegular.otf",
          "https://www.componentry.fun/LastoriaBoldRegular.otf"
        ];

    let font = null;
    for (const path of fontPaths) {
      try {
        font = await new Promise((resolve, reject) => {
          opentype.load(path, (err, loadedFont) => {
            if (err || !loadedFont) reject(err || new Error("Failed to load font"));
            else resolve(loadedFont);
          });
        });
        if (font) break;
      } catch (e) {
        // Try next font path
      }
    }

    if (!font) {
      console.error("Signature error: Font could not be loaded from any of the provided paths:", fontPaths);
      return;
    }

    const height = fontSize * 3;
    const horizontalPadding = fontSize * 0.6;
    const topMargin = fontSize * 1.5;
    const baseline = topMargin;

    let x = horizontalPadding;
    const paths = [];

    for (const char of text) {
      const glyph = font.charToGlyph(char);
      const path = glyph.getPath(x, baseline, fontSize);
      paths.push(path.toPathData(3));

      const advanceWidth = glyph.advanceWidth ?? font.unitsPerEm;
      x += advanceWidth * (fontSize / font.unitsPerEm);
    }

    const width = x + horizontalPadding;
    const maskId = `signature-reveal-${Math.random().toString(36).substring(2, 9)}`;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("fill", "none");
    if (className) svg.setAttribute("class", className);
    svg.style.overflow = "visible";
    svg.style.display = "block";

    const defs = document.createElementNS(svgNS, "defs");
    const mask = document.createElementNS(svgNS, "mask");
    mask.setAttribute("id", maskId);
    mask.setAttribute("maskUnits", "userSpaceOnUse");

    const maskPaths = [];
    const strokePaths = [];

    paths.forEach((d) => {
      // Mask path (thick white line revealing filled text)
      const mPath = document.createElementNS(svgNS, "path");
      mPath.setAttribute("d", d);
      mPath.setAttribute("stroke", "white");
      mPath.setAttribute("stroke-width", (fontSize * 0.22).toString());
      mPath.setAttribute("fill", "none");
      mPath.setAttribute("vector-effect", "non-scaling-stroke");
      mPath.setAttribute("stroke-linecap", "round");
      mPath.setAttribute("stroke-linejoin", "round");
      mask.appendChild(mPath);
      maskPaths.push(mPath);

      // Stroke path (thin visible contour stroke line)
      const sPath = document.createElementNS(svgNS, "path");
      sPath.setAttribute("d", d);
      sPath.setAttribute("stroke", color);
      sPath.setAttribute("stroke-width", strokeWidth.toString());
      sPath.setAttribute("fill", "none");
      sPath.setAttribute("vector-effect", "non-scaling-stroke");
      sPath.setAttribute("stroke-linecap", "butt");
      sPath.setAttribute("stroke-linejoin", "round");
      svg.appendChild(sPath);
      strokePaths.push(sPath);
    });

    defs.appendChild(mask);
    svg.prepend(defs);

    // Group containing fill paths masked by reveal mask
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("mask", `url(#${maskId})`);
    paths.forEach((d) => {
      const fPath = document.createElementNS(svgNS, "path");
      fPath.setAttribute("d", d);
      fPath.setAttribute("fill", color);
      g.appendChild(fPath);
    });
    svg.appendChild(g);

    // Prepare paths for stroke dash animation
    const preparePath = (path) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len} ${len}`;
      path.style.strokeDashoffset = `${len}`;
      path.style.opacity = '0';
    };

    maskPaths.forEach(preparePath);
    strokePaths.forEach(preparePath);

    let animated = false;
    const startAnimation = () => {
      if (animated) return;
      animated = true;

      paths.forEach((_, i) => {
        const charDelay = delay + i * 0.2;
        const mP = maskPaths[i];
        const sP = strokePaths[i];

        setTimeout(() => {
          const transition = `stroke-dashoffset ${duration}s cubic-bezier(0.42, 0, 0.58, 1), opacity 0.01s linear`;
          
          mP.style.transition = transition;
          mP.style.opacity = '1';
          mP.style.strokeDashoffset = '0';

          sP.style.transition = transition;
          sP.style.opacity = '1';
          sP.style.strokeDashoffset = '0';
        }, charDelay * 1000);
      });
    };

    target.innerHTML = "";
    target.appendChild(svg);

    if (inView && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAnimation();
            if (once) observer.unobserve(target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(target);
    } else {
      startAnimation();
    }
  }

  // Custom Element Web Component
  if (typeof customElements !== 'undefined' && !customElements.get('animated-signature')) {
    class AnimatedSignature extends HTMLElement {
      connectedCallback() {
        const text = this.getAttribute("text") || "Signature";
        const color = this.getAttribute("color") || "currentColor";
        const fontSize = parseFloat(this.getAttribute("font-size")) || 32;
        const strokeWidth = parseFloat(this.getAttribute("stroke-width")) || 1;
        const duration = parseFloat(this.getAttribute("duration")) || 1.5;
        const delay = parseFloat(this.getAttribute("delay")) || 0;
        const inView = this.hasAttribute("in-view");
        const once = !this.hasAttribute("repeat");
        const fontUrl = this.getAttribute("font-url") || undefined;
        const className = this.getAttribute("class") || "";

        renderSignature(this, {
          text,
          color,
          fontSize,
          strokeWidth,
          duration,
          delay,
          inView,
          once,
          fontUrl,
          className
        });
      }
    }
    customElements.define("animated-signature", AnimatedSignature);
  }

  return {
    render: renderSignature
  };
}));
