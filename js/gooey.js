/* ══════════════════════════════════════════════════════════════
   gooey.js — Reusable liquid-blob physics engine
   Usage: const inst = createGooeyInstance(cfg); inst.toggle();
   ══════════════════════════════════════════════════════════════ */

function createGooeyInstance(cfg) {
  /* cfg: {
       triggerEl, contentEl, itemListEl, blobPathEl, blurFilterEl,
       position: 'dropdown-right'|'dropdown-left'|'tooltip',
       onOpen: fn, onClose: fn
     } */
  const eF = 48;
  const eS = {
    circleCount: 48, minDelay: 0.02, maxDelay: 0.06,
    smoothKFactor: 0.2, outlineInsetFactor: 0.4, outlineSmoothFactor: 0.5,
    outlineSmoothPasses: 2, diskRadiusFactor: 0.8,
    compressionStrength: 0.2, compressionPeakAt: 0.33,
    spring: { stiffness: 280, damping: 25, mass: 1 },
    positionSpring: { stiffness: 400, damping: 28, mass: 1 },
    shapeSpring: { stiffness: 400, damping: 42, mass: 1 }
  };

  const d = new Float32Array(1056), f = new Float32Array(1056);
  const h = new Float32Array(1056), p = new Float32Array(1056);
  const m = new Float32Array(1056);
  const g = new Float32Array(4), y = new Float32Array(4);
  const w = new Float32Array(4), x = new Uint8Array(4);
  const b = new Int8Array(1056);
  const v = [-1, 1, 1, -1], R = [-1, -1, 1, 1];
  let e9 = new Float32Array(2*eF), e7 = new Float32Array(2*eF);
  let te = new Float32Array(3*eF), tt = new Float32Array(3*eF);
  let tr = new Float32Array(3*eF);
  let to = new Uint8Array(eF), ts = new Float32Array(eF);
  let tl = false, ta = false;
  let tu = new Float32Array(2*eF), tc = new Float32Array(2*eF);
  let td = {hw:0,hh:0,cornerR:0}, tf2 = {hw:0,hh:0,cornerR:0};
  let th = new Float32Array(6336);
  let tx2 = new Float32Array(2*eF), tb2 = new Float32Array(2*eF);
  let tv2 = new Float32Array(eF);
  let tR = null, tM = null;
  let eP = 0, eP_v = 0;
  let isOpen = false;

  const eD = { rect:{left:0,top:0,width:0,height:0}, width:0, height:0, borderRadius:20 };
  const eI = { rect:{left:0,top:0,width:0,height:0}, width:0, height:0, borderRadius:24 };

  function W(e,t,r,n,i,o,s){
    let l=Math.abs(e-r)-i+s,a=Math.abs(t-n)-o+s,u=Math.max(l,0),c=Math.max(a,0);
    return Math.sqrt(u*u+c*c)+Math.min(Math.max(l,a),0)-s;
  }
  function U(e,t,r,n,i,o,s){
    let l=W(e,t,r[0],r[1],n[0],n[1],n[2])+s,a=Math.min(4,i);
    for(let i=1;i<a;i++){let o=W(e,t,r[2*i],r[2*i+1],n[3*i],n[3*i+1],n[3*i+2])+s;o<l&&(l=o);}
    if(i<=4)return l;
    let u=W(e,t,r[8],r[9],n[12],n[13],n[14])+s;
    for(let l2=5;l2<i;l2++){
      let i2=r[2*l2],a2=r[2*l2+1],c=n[3*l2],dd=n[3*l2+1],ff=n[3*l2+2],hh=e-i2,pp=t-a2,mm=hh*hh+pp*pp,gg=u+o+Math.sqrt(c*c+dd*dd);
      gg>0&&mm>gg*gg||(u=function(e,t,r){if(r<=0)return Math.min(e,t);let n=Math.max(r-Math.abs(e-t),0)/r;return Math.min(e,t)-n*n*n*r/6;}(u,W(e,t,i2,a2,c,dd,ff)+s,o));
    }
    return l<u?l:u;
  }
  function Gd(e,t,r,n,i,o,s){return U(e+0.5,t,r,n,i,o,s)-U(e-0.5,t,r,n,i,o,s);}
  function Xd(e,t,r,n,i,o,s){return U(e,t+0.5,r,n,i,o,s)-U(e,t-0.5,r,n,i,o,s);}

  function V(e,t,r,n,i,o,s,l,a,u){
    let c=i/40,dd=U(e,t,o,s,l,a,u),ff=0,hh=-1,pp=0;
    for(let i2=1;i2<=40;i2++){let mm=i2*c,gg=U(e+mm*r,t+mm*n,o,s,l,a,u);dd<0&&gg>=0&&(ff=pp,hh=mm),pp=mm,dd=gg;}
    if(hh<0)return{x:e,y:t,found:false};
    let mm2=ff,gg2=hh;
    for(let i2=0;i2<14;i2++){let i3=(mm2+gg2)*0.5;0>U(e+i3*r,t+i3*n,o,s,l,a,u)?mm2=i3:gg2=i3;}
    let yy=(mm2+gg2)*0.5;return{x:e+yy*r,y:t+yy*n,found:true};
  }

  function Y2(e,t,r,n,i,o,s,l,a){
    d[l]=e;f[l]=t;h[l]=0;
    let u=e,c=t,pp=1,mm=0;
    for(let gg=1;gg<a;gg++){
      let a2=Gd(u,c,r,n,i,o,s),g2=Xd(u,c,r,n,i,o,s),y2=Math.sqrt(a2*a2+g2*g2);
      if(y2<1e-9)break;
      let w2=u+-g2/y2*4,x2=c+a2/y2*4;
      let b2=(function(e,t,r,n,i,o,s){
        let l=e,a=t;
        for(let e2=0;e2<2;e2++){
          let e3=U(l,a,r,n,i,o,s);if(0.05>Math.abs(e3))break;
          let t2=Gd(l,a,r,n,i,o,s),u2=Xd(l,a,r,n,i,o,s),c2=t2*t2+u2*u2;
          if(c2<1e-9)break;l-=e3*t2/c2;a-=e3*u2/c2;
        }
        return{x:l,y:a};
      })(w2,x2,r,n,i,o,s);
      w2=b2.x;x2=b2.y;
      let v2=w2-u,R2=x2-c,M2=Math.sqrt(v2*v2+R2*R2);
      if(M2>16)break;
      u=w2;c=x2;mm+=M2;d[l+pp]=u;f[l+pp]=c;h[l+pp]=mm;
      let _2=u-e,C2=c-t;
      if(++pp>16&&4.8>Math.sqrt(_2*_2+C2*C2))break;
    }
    return{count:pp,perimeter:mm};
  }

  function J2(e,t,r,n){
    if(r<=0||n<=0||t<4)return;
    let i=1-r,o=d,s=f,l=p,a=m;
    for(let u=0;u<n;u++){
      for(let n2=0;n2<t;n2++){
        let u2=(n2-1+t)%t,c=(n2+1)%t,dd=(o[e+u2]+2*o[e+n2]+o[e+c])*0.25,ff=(s[e+u2]+2*s[e+n2]+s[e+c])*0.25;
        l[e+n2]=o[e+n2]*i+dd*r;a[e+n2]=s[e+n2]*i+ff*r;
      }
      let n2=o;o=l;l=n2;let u2=s;s=a;a=u2;
    }
    if(o!==d)for(let r2=0;r2<t;r2++){d[e+r2]=o[e+r2];f[e+r2]=s[e+r2];}
  }

  function Z2(e,t,r,n){
    for(let i=0;i<r;i++){
      let o=(i-1+r)%r,s=(i+1)%r,l=d[t+i],a=f[t+i],u=d[t+o],c=f[t+o],hh=d[t+s],pp=f[t+s],mm=l-u,gg=a-c,yy=hh-l,ww=pp-a,xx=(n+i)*6;
      e[xx]=l;e[xx+1]=a;e[xx+2]=l+yy/3;e[xx+3]=a+ww/3;e[xx+4]=l-mm/3;e[xx+5]=a-gg/3;
    }
  }

  function Q2(e,t){
    let{inset:r,r:n,topLength:i,rightLength:o,bottomLength:s,leftLength:l,cornerArc:a,width:u,height:c}=t,dd=e;
    if(dd<i)return{x:r+n+dd,y:r};
    if((dd-=i)<a){let e2=dd/a*(Math.PI/2);return{x:u-r-n+Math.sin(e2)*n,y:r+n-Math.cos(e2)*n};}
    if((dd-=a)<o)return{x:u-r,y:r+n+dd};
    if((dd-=o)<a){let e2=dd/a*(Math.PI/2);return{x:u-r-n+Math.cos(e2)*n,y:c-r-n+Math.sin(e2)*n};}
    if((dd-=a)<s)return{x:u-r-n-dd,y:c-r};
    if((dd-=s)<a){let e2=dd/a*(Math.PI/2);return{x:r+n-Math.sin(e2)*n,y:c-r-n+Math.cos(e2)*n};}
    if((dd-=a)<l)return{x:r,y:c-r-n-dd};
    let ff=(dd-=l)/a*(Math.PI/2);return{x:r+n-Math.cos(ff)*n,y:r+n-Math.sin(ff)*n};
  }

  function ee2(e,t,r,n,i,o){
    let s=e-2*n,l=t-2*n;
    if(s<=0||l<=0){for(let r2=0;r2<i;r2++)o[2*r2]=e/2,o[2*r2+1]=t/2;return;}
    let a=Math.max(0,r-n),u=s-2*a,c=l-2*a,dd=Math.PI*a/2,ff=u+c+u+c+4*dd;
    let hh={inset:n,r:a,topLength:u,rightLength:c,bottomLength:u,leftLength:c,cornerArc:dd,width:e,height:t};
    let pp=[u+dd,c+dd,u+dd,c+dd],mm=ff-dd/2,gg=0;
    for(let e2=0;e2<4;e2++){let t2=Q2((gg+mm)%ff,hh);o[2*e2]=t2.x;o[2*e2+1]=t2.y;gg+=pp[e2];}
    let yy=i-4,ww=[0,0,0,0],xx=pp.map(e2=>yy*e2/ff);
    for(let e2=0;e2<4;e2++)ww[e2]=Math.floor(xx[e2]);
    let bb=yy-ww.reduce((e2,t2)=>e2+t2,0),vv=xx.map((e2,t2)=>({i:t2,frac:e2-Math.floor(e2)})).sort((e2,t2)=>t2.frac-e2.frac);
    for(let e2=0;e2<bb;e2++)ww[vv[e2].i]++;
    let RR=4;gg=0;
    for(let e2=0;e2<4;e2++){
      let t2=ww[e2],r2=pp[e2];
      for(let e3=1;e3<=t2;e3++){let n2=Q2((gg+e3*r2/(t2+1)+mm)%ff,hh);o[2*RR]=n2.x;o[2*RR+1]=n2.y;RR++;}
      gg+=r2;
    }
  }

  function et2(e,t,r,n,i,o,s){
    let l=1/0,a=-1/0;
    for(let i2=0;i2<t;i2++){let t2=e[2*i2]-r,o2=e[2*i2+1]-n,u=Math.sqrt(t2*t2+o2*o2);s[i2]=u;u<l&&(l=u);u>a&&(a=u);}
    let u=a-l;
    if(u<1e-6){for(let e2=0;e2<t;e2++)s[e2]=i;return;}
    for(let e2=0;e2<t;e2++)s[e2]=(s[e2]-l)/u*(o-i)+i;
  }

  function measureElements() {
    const tRect = cfg.triggerEl.getBoundingClientRect();
    eD.rect = { left:tRect.left, top:tRect.top, width:tRect.width, height:tRect.height };
    eD.width = tRect.width; eD.height = tRect.height;
    if (!ta) return;
    const pos = cfg.position || 'dropdown-right';
    const el = cfg.contentEl;
    if (pos === 'tooltip-top' || pos === 'tooltip-bottom' || pos === 'tooltip') {
      el.style.position  = 'fixed';
      el.style.transform = 'translateX(-50%)';
      el.style.left      = `${tRect.left + tRect.width / 2}px`;
      el.style.right     = '';
      if (pos === 'tooltip-bottom') {
        el.style.top    = `${tRect.bottom + 10}px`;
        el.style.bottom = '';
      } else {
        /* tooltip-top: opens above trigger — exact match to original */
        el.style.bottom = `${window.innerHeight - tRect.top + 16}px`;
        el.style.top    = '';
      }
    } else {
      /* absolute relative to trigger-outer — no fixed, no jump */
      el.style.position  = 'absolute';
      el.style.top       = 'calc(100% + 8px)';
      el.style.bottom    = '';
      el.style.transform = '';
      if (pos === 'dropdown-left') {
        el.style.left  = '0';
        el.style.right = '';
      } else {
        el.style.right = '0';
        el.style.left  = '';
      }
    }
    const dRect = el.getBoundingClientRect();
    eI.rect = { left:dRect.left, top:dRect.top, width:dRect.width, height:dRect.height };
    eI.width = dRect.width; eI.height = dRect.height;
    const msvg = cfg.maskSvgEl;
    if (msvg) msvg.setAttribute('viewBox', `${dRect.left} ${dRect.top} ${dRect.width} ${dRect.height}`);
  }

  const tS2 = () => {
    let e=eD,t=eI;
    if(!e||!t||e.width===0)return false;
    let r=Math.min(e.width,e.height)/2,n=Math.min(t.width,t.height)/2,i=eS.diskRadiusFactor,o=r*i,s=n*i;
    let l=Math.min(e.borderRadius,o),a=Math.min(t.borderRadius,s);
    td.hw=o;td.hh=o;td.cornerR=l; tf2.hw=s;tf2.hh=s;tf2.cornerR=a;
    ee2(e.width,e.height,e.borderRadius,o,eF,tx2);
    ee2(t.width,t.height,t.borderRadius,s,eF,tb2);
    for(let r2=0;r2<eF;r2++){
      tu[2*r2]=tx2[2*r2]+e.rect.left; tu[2*r2+1]=tx2[2*r2+1]+e.rect.top;
      tc[2*r2]=tb2[2*r2]+t.rect.left; tc[2*r2+1]=tb2[2*r2+1]+t.rect.top;
    }
    return true;
  };

  const tA2 = () => {
    if(tl||!tS2())return;
    for(let s=0;s<eF;s++){
      e9[2*s]=tu[2*s];e9[2*s+1]=tu[2*s+1];e7[2*s]=0;e7[2*s+1]=0;
      te[3*s]=td.hw;te[3*s+1]=td.hh;te[3*s+2]=td.cornerR;
      tt[3*s]=0;tt[3*s+1]=0;tt[3*s+2]=0;
    }
    tl=true;
  };

  const tE2 = opening => {
    if(!tS2())return;
    let e=eD,t=eI,n=t.rect.left+t.width/2,i=t.rect.top+t.height/2,o=e.rect.left+e.width/2,s=e.rect.top+e.height/2;
    const pos = cfg.position || 'dropdown-right';
    const isTooltip = pos === 'tooltip-top' || pos === 'tooltip-bottom' || pos === 'tooltip';
    if (isTooltip && !opening) {
      /* Y-axis wave stagger on close — top edge collapses toward trigger */
      let minY=Infinity, maxY=-Infinity;
      for(let idx=0;idx<eF;idx++){const yv=tc[2*idx+1];if(yv<minY)minY=yv;if(yv>maxY)maxY=yv;}
      const dy=maxY-minY;
      for(let idx=0;idx<eF;idx++){
        const yv=tc[2*idx+1];
        tv2[idx]=dy<1?eS.minDelay:eS.minDelay+((maxY-yv)/dy)*(eS.maxDelay-eS.minDelay);
      }
    } else {
      opening ? et2(tu,eF,n,i,eS.minDelay,eS.maxDelay,tv2) : et2(tc,eF,o,s,eS.minDelay,eS.maxDelay,tv2);
    }
    let a=performance.now();
    for(let t2=0;t2<eF;t2++){to[t2]=+!opening;ts[t2]=a+1000*tv2[t2];}
  };

  const tj2 = t2 => {
    tR = null;
    if (!eD || eI.width === 0) return;
    if (!tl) { if (!tS2()) return; tA2(); }
    let em=0,eg=0;
    for(let e=0;e<eF;e++){em+=e9[2*e];eg+=e9[2*e+1];}
    em/=eF; eg/=eF;
    let dt=null===tM?1/60:Math.min((t2-tM)/1000,1/30); tM=t2;
    let target_eP=ta?1:0;
    let fSp=-eS.spring.stiffness*(eP-target_eP),fDp=-eS.spring.damping*eP_v;
    eP_v+=(fSp+fDp)/eS.spring.mass*dt; eP+=eP_v*dt;
    if(Math.abs(eP-target_eP)<1e-4&&Math.abs(eP_v)<1e-4){eP=target_eP;eP_v=0;}
    for(let r=0;r<eF;r++){if(t2>=ts[r])to[r]=+!!ta;}
    let n=eS.positionSpring.stiffness,i=eS.positionSpring.damping,o=1/Math.max(eS.positionSpring.mass,0.05);
    let s=!ta,l=s?eS.positionSpring.stiffness:eS.shapeSpring.stiffness;
    let a_d=s?eS.positionSpring.damping:eS.shapeSpring.damping;
    let u_m=1/Math.max(s?eS.positionSpring.mass:eS.shapeSpring.mass,0.05);
    let sc=Math.max(1,Math.ceil(dt/(1/120))),sdt=dt/sc;
    for(let step=0;step<sc;step++){
      for(let e=0;e<eF;e++){
        let act=to[e],tx3=act?tc[2*e]:tu[2*e],ty3=act?tc[2*e+1]:tu[2*e+1];
        let whw=act?tf2.hw:td.hw,whh=act?tf2.hh:td.hh,wr=act?tf2.cornerR:td.cornerR;
        let fx2=((tx3-e9[2*e])*n-e7[2*e]*i)*o,fy2=((ty3-e9[2*e+1])*n-e7[2*e+1]*i)*o;
        e7[2*e]+=fx2*sdt; e7[2*e+1]+=fy2*sdt; e9[2*e]+=e7[2*e]*sdt; e9[2*e+1]+=e7[2*e+1]*sdt;
        let gi=3*e,fhw=((whw-te[gi])*l-tt[gi]*a_d)*u_m,fhh=((whh-te[gi+1])*l-tt[gi+1]*a_d)*u_m,fr=((wr-te[gi+2])*l-tt[gi+2]*a_d)*u_m;
        tt[gi]+=fhw*sdt; tt[gi+1]+=fhh*sdt; tt[gi+2]+=fr*sdt;
        te[gi]+=tt[gi]*sdt; te[gi+1]+=tt[gi+1]*sdt; te[gi+2]+=tt[gi+2]*sdt;
      }
    }
    let eb=Math.max(0,Math.min(1,eP)),ev=eS.compressionStrength;
    let eRc=Math.min(0.95,Math.max(0.05,eS.compressionPeakAt)),eMc=3*eRc,ec=3*(1-eRc);
    let eCc=Math.pow(eRc,eMc)*Math.pow(1-eRc,ec);
    let eSc=eb<=0||eb>=1?0:Math.pow(eb,eMc)*Math.pow(1-eb,ec)/eCc,eAc=1-ev*eSc;
    let eNs=0,eOs=tr;
    for(let e=0;e<eF;e++){
      let t3=3*e,rhw=te[t3],nhw=rhw*eAc,ihh=te[t3+1]*eAc;
      eNs+=rhw; eOs[t3]=nhw; eOs[t3+1]=ihh; eOs[t3+2]=Math.min(te[t3+2],Math.min(nhw,ihh));
    }
    let e1a=(eNs/eF)/Math.max(eS.diskRadiusFactor,0.01),e6s=eS.smoothKFactor*e1a;
    let txb=4*eb*(1-eb),tbs=e6s*txb,tvi=eS.outlineInsetFactor*tbs,tEs=eS.outlineSmoothFactor*txb;
    let tPr=(function(e,t,r,n,i,o,s){
      let l=Math.max(s.smoothK,0),a=s.outlineInset??0,u=0;
      for(let o2=0;o2<r;o2++){let r2=e[2*o2]-n,s2=e[2*o2+1]-i,l2=t[3*o2],a2=t[3*o2+1],c=Math.sqrt(r2*r2+s2*s2)+Math.sqrt(l2*l2+a2*a2);c>u&&(u=c);}
      let cv=u+2*l+8,hp=V(n,i,1,0,cv,e,t,r,l,a);
      if(!hp.found){let o2=Infinity,s2=n,u2=i;for(let n2=0;n2<r;n2++){let i2=e[2*n2],c=e[2*n2+1],dd=U(i2,c,e,t,r,l,a);dd<o2&&(o2=dd,s2=i2,u2=c);}hp=V(s2,u2,1,0,cv,e,t,r,l,a);}
      if(!hp.found)return{outCount:1};
      let pc=Y2(hp.x,hp.y,e,t,r,l,a,0,800).count;
      if(pc<2)return{outCount:1};
      J2(0,pc,s.outlineSmooth??0,eS.outlineSmoothPasses);
      for(let n2=0;n2<4&&n2<r;n2++){let r2=e[2*n2],i2=e[2*n2+1],o2=t[3*n2],s2=t[3*n2+1],l2=t[3*n2+2];g[n2]=r2+v[n2]*(o2-l2);y[n2]=i2+R[n2]*(s2-l2);w[n2]=l2;x[n2]=+(o2-l2>=1&&s2-l2>=1);}
      for(let e2=0;e2<pc;e2++){
        let t2=d[e2],n2=f[e2],i2=-1;
        for(let o2=0;o2<4&&o2<r;o2++){if(!x[o2])continue;let r2=t2-g[o2],s2=n2-y[o2];if(r2*v[o2]<0||s2*R[o2]<0)continue;let l2=Math.sqrt(r2*r2+s2*s2),a2=Math.max(1.5,0.05*w[o2]);if(Math.abs(l2-w[o2])<a2){if(i2=o2,l2>1e-6){let t3=w[o2];d[e2]=g[o2]+r2/l2*t3;f[e2]=y[o2]+s2/l2*t3;}break;}}
        b[e2]=i2;
      }
      Z2(o,0,pc,0);
      for(let e2=0;e2<pc;e2++){
        let t2=(e2+1)%pc,r2=b[e2];if(-1===r2||r2!==b[t2])continue;
        let n2=g[r2],i2=y[r2],s2=w[r2],l2=d[e2],a2=f[e2],u2=d[t2],c2=f[t2],h2=Math.atan2(a2-i2,l2-n2),mm2=Math.atan2(c2-i2,u2-n2),xx2=mm2-h2;
        xx2>Math.PI&&(xx2-=2*Math.PI);xx2<-Math.PI&&(xx2+=2*Math.PI);
        let vv2=4/3*Math.tan(xx2/4)*s2,Rd=-Math.sin(h2),Md=Math.cos(h2),_d=-Math.sin(mm2),Cd=Math.cos(mm2);
        o[6*e2+2]=l2+vv2*Rd;o[6*e2+3]=a2+vv2*Md;o[6*t2+4]=u2-vv2*_d;o[6*t2+5]=c2-vv2*Cd;
      }
      for(let e2=0;e2<pc;e2++){
        let t2=b[e2];if(-1===t2)continue;
        let r2=(e2-1+pc)%pc,n2=(e2+1)%pc,i2=g[t2],s2=y[t2],l2=Math.atan2(f[e2]-s2,d[e2]-i2),a2=-Math.sin(l2),u2=Math.cos(l2);
        if(b[r2]!==t2){let t3=d[e2]-d[r2],n3=f[e2]-f[r2],i3=Math.sqrt(t3*t3+n3*n3)/3;o[6*e2+4]=d[e2]-i3*a2;o[6*e2+5]=f[e2]-i3*u2;}
        if(b[n2]!==t2){let t3=d[n2]-d[e2],r3=f[n2]-f[e2],i3=Math.sqrt(t3*t3+r3*r3)/3;o[6*e2+2]=d[e2]+i3*a2;o[6*e2+3]=f[e2]+i3*u2;}
      }
      return{outCount:pc};
    })(e9,eOs,eF,em,eg,th,{smoothK:tbs,outlineInset:tvi,outlineSmooth:tEs});
    let tL=tPr.outCount,tW2=[`M${th[0]} ${th[1]}`];
    for(let e=0;e<tL;e++){let t3=(e+1)%tL,r2=6*e,n2=6*t3;tW2.push(`C${th[r2+2]} ${th[r2+3]} ${th[n2+4]} ${th[n2+5]} ${th[n2]} ${th[n2+1]}`);}
    tW2.push('Z');
    const fp=tW2.join(' ');
    cfg.blobPathEl.setAttribute('d',fp);
    if(cfg.maskPathEl)cfg.maskPathEl.setAttribute('d',fp);
    cfg.blurFilterEl.setAttribute('stdDeviation',String(Math.max(0,5)*txb));
    const settled=!ta&&eP<0.01;
    if(cfg.blobSvgEl)cfg.blobSvgEl.style.visibility=settled?'hidden':'visible';
    if(!settled||Math.abs(eP-target_eP)>1e-4||eP_v!==0)tR=requestAnimationFrame(tj2);
  };

  const tk2=()=>{if(tR===null)tR=requestAnimationFrame(tj2);};

  function open() {
    if (isOpen) return;
    isOpen = true; ta = true;
    cfg.triggerEl.setAttribute('aria-expanded','true');
    cfg.contentEl.style.display = 'block';
    cfg.itemListEl.classList.remove('lq-exit');
    void cfg.itemListEl.offsetWidth;
    cfg.itemListEl.classList.add('lq-enter');
    measureElements(); tE2(true); tk2();
    if (cfg.onOpen) cfg.onOpen();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false; ta = false;
    cfg.triggerEl.setAttribute('aria-expanded','false');
    cfg.itemListEl.classList.remove('lq-enter');
    cfg.itemListEl.classList.add('lq-exit');
    /* immediately hide blob so no fixed footprint remains during animation */
    if (cfg.blobSvgEl) cfg.blobSvgEl.style.visibility = 'hidden';
    tE2(false); tk2();
    cfg.itemListEl.addEventListener('animationend', function onEnd() {
      cfg.itemListEl.removeEventListener('animationend', onEnd);
      if (!isOpen) {
        cfg.contentEl.style.display = 'none';
        cfg.itemListEl.classList.remove('lq-exit');
        if (cfg.arrowEl) cfg.arrowEl.classList.remove('lq-arrow-visible');
      }
    }, { once: true });
    /* fallback: force hide content after animation duration if animationend doesn't fire */
    setTimeout(() => {
      if (!isOpen) {
        cfg.contentEl.style.display = 'none';
        cfg.itemListEl.classList.remove('lq-exit');
      }
    }, 200);
    if (cfg.onClose) cfg.onClose();
  }

  function toggle() { isOpen ? close() : open(); }
  function getOpen() { return isOpen; }
  function setPosition(pos) { cfg.position = pos; }

  window.addEventListener('resize', measureElements);
  /* On scroll: close tooltip/dropdown instead of repositioning — prevents sticky footprint */
  window.addEventListener('scroll', () => { if (isOpen) close(); }, { capture: true, passive: true });

  return { open, close, toggle, getOpen, setPosition, measureElements };
}
