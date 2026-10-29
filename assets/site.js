/* Stitch — shared site script: data helpers, header, footer, bag, wishlist, search */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const CDN='https://cdn.shopify.com/s/files/1/0605/1476/2930/',SF='https://stitcheg.com/cdn/shop/files/';
const IMG=(p,w=700)=>CDN+p+'?width='+w;
const LIFE={
 hero:SF+'day_1_4.jpg?v=1746379297',men:SF+'Men_s_Collection.jpg?v=1697985299',women:SF+'Women_s_Collection.jpg?v=1698058724',kids:SF+'Young_Kids_and_Babies_Collection.jpg?v=1697985433',
 fabric:SF+'1P0A2184-Edit-2.jpg?v=1698260346',
 light:SF+'Find_Your_Sock_Classic-Light_Weight_824d5d15-1f72-4813-8cf0-80854d3ced8c.jpg?v=1698065563',
 half:SF+'Find_Your_Sock_Half-Cushioned.jpg?v=1698259509',
 full:SF+'Find_Your_Sock_Full-Cushioned_option_2_e09af3be-20ff-4fee-a151-bb3234053b1a.jpg?v=1698065946'};
const L=(k,w)=>LIFE[k]+(LIFE[k].includes('?')?'&':'?')+'width='+w;
const GN={men:'Men',women:'Women',kids:'Kids',babies:'Babies',trendy:'Trendy'};
const P=window.STITCH_PRODUCTS||[];
const byId=new Map(P.map(p=>[p.id,p])),byH=new Map(P.map(p=>[p.h,p]));
const cur=n=>n.toLocaleString('en-US')+' EGP';
const sizeLabel=s=>{const m={'42-45':'EU 42–45','38-41':'EU 38–41','26-29':'3–5 yrs','30-33':'6–9 yrs','34-37':'10–13 yrs'};return m[s]||s.replace(/-/g,'–')};
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let cart=store.get('st_cart',[]),wish=store.get('st_wish',[]);
const HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z"/></svg>';
const sizesOf=p=>p.sz&&p.sz.length?p.sz:(p.g==='men'?['42-45']:p.g==='women'?['38-41']:['Free Size']);
const href=p=>'product.html?h='+p.h;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2000)};

/* product card */
function card(p,eager){
 const sale=p.cmp>p.pr;
 const tag=!p.av?'Sold out':sale?'Sale':(Date.now()-p.ca<1000*60*60*24*120?'New':'');
 const sz=sizesOf(p);
 return `<article class="p" data-id="${p.id}"><div class="imw"><a href="${href(p)}" class="im">${tag?`<span class="tg up">${tag}</span>`:''}<img ${eager?'':'loading="lazy" '}decoding="async" src="${IMG(p.im[0],560)}" alt="${p.n}"></a>
 <button class="hrt ${wish.includes(p.id)?'on':''}" data-w="${p.id}" aria-label="Save to wishlist">${HEART}</button>
 ${p.av?`<div class="qa"><span>Quick add</span>${sz.map(s=>`<button data-qa="${p.id}" data-sz="${s}">${sizeLabel(s)}</button>`).join('')}</div>`:''}</div>
 <a href="${href(p)}" class="meta"><div><h4>${p.n}</h4><small>${p.col||GN[p.g]+"'s socks"}</small></div><div class="pr">${sale?`${cur(p.pr)}<s>${cur(p.cmp)}</s>`:cur(p.pr)}</div></a></article>`}

/* cart */
const save=()=>{store.set('st_cart',cart);renderCart()};
function addToCart(id,sz,q=1){const l=cart.find(x=>x.id===id&&x.sz===sz);l?l.q+=q:cart.push({id,sz,q});save()}
function renderCart(){let t=0,n=0;const el=$('#items');
 el.innerHTML=cart.length?cart.map((l,i)=>{const p=byId.get(l.id);if(!p)return'';t+=p.pr*l.q;n+=l.q;return `<div class="it"><a href="${href(p)}"><img src="${IMG(p.im[0],200)}" alt=""></a><div><b>${p.n}</b><small>${p.col||''}</small><small>${sizeLabel(l.sz)}</small><div class="qty"><button data-i="${i}" data-d="-1">−</button><span>${l.q}</span><button data-i="${i}" data-d="1">+</button></div></div><span>${p.pr*l.q}</span></div>`}).join(''):'<p class="empty">Your bag is empty.<br>Comfort begins with your feet.</p>';
 $('#cnt').textContent=n;$('#tot').textContent=cur(t);const left=800-t;
 $('#frT').textContent=t===0?'Free shipping on orders over 800 EGP':left>0?`${left} EGP away from free shipping`:'You\'ve unlocked free shipping';$('#frB').style.width=Math.min(100,t/8)+'%'}
const openBag=o=>{$('#dr').classList.toggle('on',o);$('#ov').classList.toggle('on',o)};
function closeAll(){['#dr','#ov'].forEach(s=>$(s)&&$(s).classList.remove('on'));closePanel();document.dispatchEvent(new Event('stitch:close'))}

/* wishlist */
function toggleWish(id){wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];store.set('st_wish',wish);$('#wc').textContent=wish.length;$$(`[data-w="${id}"]`).forEach(b=>b.classList.toggle('on',wish.includes(id)));toast(wish.includes(id)?'Saved to wishlist':'Removed from wishlist');document.dispatchEvent(new CustomEvent('stitch:wish',{detail:id}))}

/* search + wishlist panel */
let panelMode='search';
function openPanel(mode){panelMode=mode;$('#seT').textContent=mode==='search'?'Search':'Wishlist';$('#se').classList.add('on');document.body.classList.add('lock');
 $('#si').style.display=mode==='search'?'':'none';$('#pop').style.display=mode==='search'?'':'none';renderPanel();if(mode==='search')setTimeout(()=>$('#si').focus(),500)}
function closePanel(){$('#se').classList.remove('on');if(!$('#mm').classList.contains('on'))document.body.classList.remove('lock')}
function renderPanel(){let r;
 if(panelMode==='wish')r=wish.map(id=>byId.get(id)).filter(Boolean);
 else{const q=$('#si').value.toLowerCase().trim();const w=q.split(/\s+/).filter(Boolean);
  r=P.filter(p=>!w.length||w.every(t=>(p.n+' '+p.col+' '+GN[p.g]+' '+p.cut+' '+p.cu).toLowerCase().includes(t)));
  const seen=new Set();r=r.filter(p=>{const k=p.n+p.col;if(seen.has(k))return false;seen.add(k);return true});if(!w.length)r=r.slice().sort((a,b)=>b.ca-a.ca)}
 $('#sr').innerHTML=r.length?r.slice(0,20).map(p=>card(p,true)).join(''):`<p class="empty">${panelMode==='wish'?'Nothing saved yet. Tap the heart on any pair.':'No results.'}</p>`}

/* mount shared chrome */
const NAV={men:['All men','Invisible','No Show','Low-Cut','Medium-Cut','Long-Cut'],women:['All women','Invisible','No Show','Low-Cut','Medium-Cut','Long-Cut'],kids:['All kids','Low-Cut','Medium-Cut','Long-Cut'],babies:['All babies','Low-Cut','Long-Cut']};
const q=(o)=>'collection.html?'+Object.entries(o).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&');
function mount(opts={}){
 const solid=opts.solid;if(solid)document.body.classList.add('solid');
 const col=(g,t)=>`<div><h5 class="up">${t}</h5><ul>${NAV[g].map((n,i)=>`<li><a href="${i?q({g,cut:n}):q({g})}">${n}</a></li>`).join('')}</ul></div>`;
 document.body.insertAdjacentHTML('afterbegin',`
 <div class="bar up" id="bar"><span class="on">Free shipping on orders over 800 EGP</span><span>Cushioned from heel to toe</span><span>Comfort in every step</span></div>
 <header class="hd" id="hd"><div class="hi">
  <nav class="nav up"><button id="shopBtn">Shop</button><a href="${q({g:'new'})}">New in</a><a href="${q({g:'trendy'})}">Trendy</a><a href="${q({g:'sale'})}">Sale</a></nav>
  <button class="bg" id="bgBtn" aria-label="Menu"></button>
  <a href="index.html" class="logo">Stitch</a>
  <div class="rt up"><button id="seBtn">Search</button><button class="hide" id="wlBtn">Wishlist<sup id="wc">0</sup></button><button id="bagBtn">Bag<sup id="cnt">0</sup></button></div></div>
  <div class="mega" id="mega">${col('men','Men')}${col('women','Women')}${col('kids','Kids')}
   <div><h5 class="up">Cushioning</h5><ul><li><a href="${q({g:'all',cu:'Light Weight'})}">Light weight</a></li><li><a href="${q({g:'all',cu:'Half Cushioned'})}">Half cushioned</a></li><li><a href="${q({g:'all',cu:'Full Cushioned'})}">Full cushioned</a></li><li><a href="${q({g:'all',cu:'Classic'})}">Classic</a></li></ul></div>
   <div><h5 class="up">Babies</h5><ul><li><a href="${q({g:'babies'})}">All babies</a></li><li><a href="${q({g:'trendy'})}">Trendy</a></li><li><a href="${q({g:'sale'})}">Sale</a></li></ul></div>
   <div><a class="mi" href="${q({g:'new'})}"><img src="${L('half',600)}" alt=""></a><small class="up">New in — half cushioned</small></div></div></header>
 <div class="mm" id="mm"><a href="${q({g:'men'})}">Men</a><a href="${q({g:'women'})}">Women</a><a href="${q({g:'kids'})}">Kids</a><a href="${q({g:'babies'})}">Babies</a><a href="${q({g:'trendy'})}">Trendy</a><a href="${q({g:'sale'})}">Sale</a><small class="up">Account</small><a href="#" id="mmW" style="font-size:24px">Wishlist</a></div>`);
 document.body.insertAdjacentHTML('beforeend',`
 <footer class="ft"><div class="fg"><div><h3>Join the list.</h3><form class="nf" id="nf"><input type="email" required placeholder="Email address" aria-label="Email"><button class="up">Join →</button></form></div>
  <ul><li>Shop</li><li><a href="${q({g:'men'})}">Men</a></li><li><a href="${q({g:'women'})}">Women</a></li><li><a href="${q({g:'kids'})}">Kids</a></li><li><a href="${q({g:'babies'})}">Babies</a></li><li><a href="${q({g:'trendy'})}">Trendy</a></li></ul>
  <ul><li>Stitch</li><li><a href="index.html#story">Our story</a></li><li><a href="${q({g:'new'})}">New in</a></li><li><a href="${q({g:'sale'})}">Sale</a></li></ul>
  <ul><li>Follow</li><li>Instagram</li><li>Facebook</li><li>TikTok</li></ul></div>
  <div class="big">Stitch</div><div class="cpr up"><span>© 2026 Stitch Trade EG</span><span>Comfort in every step</span></div></footer>
 <div class="ov" id="ov"></div>
 <aside class="dr" id="dr"><div class="dh up"><span>Bag</span><button class="up" id="cl">Close</button></div><div class="items" id="items"></div><div class="free" id="freeW"><span id="frT"></span><div><i id="frB"></i></div></div><div class="tot"><span>Total</span><span id="tot">0 EGP</span></div><a class="pill fill up" href="#" onclick="return false">Checkout</a></aside>
 <div class="se" id="se"><div class="top up"><span id="seT">Search</span><button class="up" id="sx">Close ✕</button></div><input id="si" placeholder="Search socks" autocomplete="off"><div class="pop up" id="pop"><span>Popular</span><a href="${q({g:'all',cu:'Half Cushioned'})}">Half cushioned</a><a href="${q({g:'all',cut:'Long-Cut'})}">Long-cut</a><a href="${q({g:'women'})}">Women</a><a href="${q({g:'trendy'})}">Two striped</a></div><div class="sr" id="sr"></div></div>
 <div class="toast up" id="toast">Added</div>`);
 /* behaviour */
 let bi=0;setInterval(()=>{const s=$$('#bar span');s[bi].classList.remove('on');bi=(bi+1)%s.length;s[bi].classList.add('on')},3800);
 const hd=$('#hd');const sc=()=>hd.classList.toggle('s',scrollY>40);addEventListener('scroll',sc,{passive:true});sc();
 let mt;const openM=o=>{clearTimeout(mt);hd.classList.toggle('m',o);$('#shopBtn').classList.toggle('on',o)};
 $('#shopBtn').onmouseenter=()=>openM(true);$('#shopBtn').onclick=()=>openM(!hd.classList.contains('m'));
 hd.onmouseleave=()=>{mt=setTimeout(()=>openM(false),180)};hd.onmouseenter=()=>clearTimeout(mt);
 $$('.nav a').forEach(a=>a.addEventListener('mouseenter',()=>openM(false)));
 $('#bgBtn').onclick=()=>{const o=!$('#mm').classList.contains('on');$('#mm').classList.toggle('on',o);$('#bgBtn').classList.toggle('x',o);document.body.classList.toggle('lock',o)};
 $('#mmW').onclick=e=>{e.preventDefault();$('#mm').classList.remove('on');$('#bgBtn').classList.remove('x');openPanel('wish')};
 $('#bagBtn').onclick=()=>openBag(true);$('#cl').onclick=$('#ov').onclick=closeAll;
 $('#seBtn').onclick=()=>openPanel('search');$('#wlBtn').onclick=()=>openPanel('wish');$('#sx').onclick=closePanel;$('#si').oninput=renderPanel;
 $('#items').onclick=e=>{const b=e.target.closest('button');if(!b)return;const l=cart[+b.dataset.i];l.q+=+b.dataset.d;if(l.q<=0)cart.splice(+b.dataset.i,1);save()};
 $('#nf').onsubmit=e=>{e.preventDefault();e.target.innerHTML='<span style="padding:14px 0;display:block">Thank you — welcome to Stitch.</span>'};
 addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();openPanel('search')}});
 document.addEventListener('click',e=>{
  const h=e.target.closest('.hrt');if(h){e.preventDefault();toggleWish(+h.dataset.w);if(panelMode==='wish'&&$('#se').classList.contains('on'))renderPanel();return}
  const a=e.target.closest('[data-qa]');if(a){addToCart(+a.dataset.qa,a.dataset.sz);openBag(true)}});
 $('#wc').textContent=wish.length;renderCart();
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
 window.reveal=(root=document)=>$$('.rv:not(.in)',root).forEach(el=>io.observe(el));reveal();
}
window.ST={$,$$,IMG,L,LIFE,P,byId,byH,GN,cur,sizeLabel,sizesOf,href,card,addToCart,openBag,toast,mount,q,store,toggleWish,get wish(){return wish}};
})();
