import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const base = 'https://www.sajiero.com';
fs.mkdirSync('.reference', { recursive: true });
fs.mkdirSync('public/images', { recursive: true });
fs.mkdirSync('public/fonts', { recursive: true });
fs.mkdirSync('data', { recursive: true });
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
const clean = s => decode(s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
async function request(url, json = false) {
  for(let n=0;n<4;n++) { try { const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(`${r.status}: ${url}`);return json ? await r.json() : await r.text(); } catch(e) { if(n===3)throw e;await new Promise(resolve=>setTimeout(resolve,1500*(n+1))); } }
}
const html=fs.existsSync('.reference/home.html')?fs.readFileSync('.reference/home.html','utf8'):await request(base);
fs.writeFileSync('.reference/home.html',html);
const markers=[...html.matchAll(/<[^>\s]+ id="shopify-section-([^\"]+)"/g)];
const sections=Object.fromEntries(markers.map((m,i)=>[m[1].split('__').pop(),html.slice(m.index,markers[i+1]?.index)]));
const imageMap={}; const jobs=new Map();
function asset(raw,width=900) {
  let url=decode(raw);if(url.startsWith('//'))url='https:'+url;
  const u=new URL(url);if(!u.pathname.includes('/fonts/'))u.searchParams.set('width',String(width));
  const key=u.origin+u.pathname;const filename=crypto.createHash('sha1').update(key).digest('hex').slice(0,12)+path.extname(u.pathname);
  const local='/images/'+filename;jobs.set(local,u.toString());imageMap[key]=local;return local;
}
const imgs=s=>[...s.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1]);
const links=s=>[...s.matchAll(/<a[^>]+href="([^"]+)"/g)].map(m=>decode(m[1]));
const tiles=name=>[...sections[name].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].filter(m=>imgs(m[2]).length).map(m=>({href:m[1],image:asset(imgs(m[2])[0])}));
const sliders=[...sections.hero_slider.matchAll(/<picture[\s\S]*?<\/picture>/g)].map((m,i)=>({image:asset(imgs(m[0])[0],2560),mobile:asset(m[0].match(/srcset="([^"\s]+)/)[1],1040),href:links(sections.hero_slider)[i]}));
const nav=[];const seen=new Set();
for(const m of sections.header_section.matchAll(/<a[^>]+href="(\/collections\/[^"?#]+)"[^>]*>([\s\S]*?)<\/a>/g)){
 const title=clean(m[2]);if(title&&!seen.has(m[1])){nav.push({href:m[1],title});seen.add(m[1]);}
}
const tabs={};
for(const name of ['bestselling','new_arrivals']) {
 const s=sections[name];const starts=[...s.matchAll(/<div\b[^>]*\brole="tabpanel"[^>]*>/g)];
 const labels=[...s.matchAll(/<button\b[^>]*\brole="tab"[^>]*>([\s\S]*?)<\/button>/g)].map(m=>clean(m[1]));
 tabs[name]=starts.map((m,i)=>{
  const panel=s.slice(m.index,starts[i+1]?.index);
  const cards=[...panel.matchAll(/<product-card\b[\s\S]*?<\/product-card>/g)].slice(0,5).map(match=>({handle:links(match[0]).find(x=>x.startsWith('/products/')).split('/').pop(),image:asset(imgs(match[0])[0]),isNew:/sj-badge--neutral[^>]*>New</.test(match[0])}));
  const explore=panel.match(/<a\b[^>]*class="[^"]*sj-explore-card[^"]*"[\s\S]*?<\/a>/)?.[0];
  return {title:labels[i],handles:cards.map(card=>card.handle),cards,exploreImage:explore?asset(imgs(explore)[0],600):cards[0]?.image,href:links(panel).find(x=>x.startsWith('/collections/'))};
 });
}
const homeHandles=new Set(Object.values(tabs).flat().flatMap(x=>x.handles));
for(const name of ['bestselling','new_arrivals']) for(const raw of imgs(sections[name]))asset(raw,900);
const logo=asset(html.match(/src="([^\"]+Sajiero_Logo[^\"]+)"/)[1],300);
const questions=[...sections.faq.matchAll(/<span class="sj-faq__question-text">([\s\S]*?)<\/span>/g)];
const answers=[...sections.faq.matchAll(/<div class="sj-faq__answer">([\s\S]*?)<\/div>/g)];
const faq=questions.map((m,i)=>({question:clean(m[1]),answer:clean(answers[i]?.[1]||'')}));
const home={logo,sliders,tabs,categories:tiles('category_circles'),featured:tiles('featured_categories'),partners:imgs(sections.partners).map(x=>asset(x,240)),promises:imgs(sections.promises).map(x=>asset(x,1200)),awards:imgs(sections.awards).map(x=>asset(x,600)),faqImage:asset(imgs(sections.faq)[0],1200),faq,nav};
fs.writeFileSync('data/home.json',JSON.stringify(home,null,2));
console.log('Home extracted:',home.sliders.length,'slides;',Object.values(tabs).flat().length,'tabs;',nav.length,'collections');
const products=[];
for(let page=1;page<=30;page++){
 const cache=`.reference/products-${page}.json`;
 const data=fs.existsSync(cache)?JSON.parse(fs.readFileSync(cache,'utf8')):await request(`${base}/products.json?limit=250&page=${page}`,true);
 fs.writeFileSync(cache,JSON.stringify(data));products.push(...data.products);console.log('Catalog page',page,data.products.length);if(data.products.length<250)break;
}
const missing=[...homeHandles].filter(h=>!products.some(p=>p.handle===h));
for(const handle of missing) {try{const p=await request(`${base}/products/${handle}.json`,true);products.push(p.product);}catch(e){console.log('Missing product',handle,e.message);}}
const collectionEntries=[];
let nextCollection=0;
await Promise.all(Array.from({length:2},async()=>{
 while(nextCollection<nav.length){const item=nav[nextCollection++];const handle=item.href.split('/').pop();try{
  const cache=`.reference/collection-${handle}.json`;
  const data=fs.existsSync(cache)?JSON.parse(fs.readFileSync(cache,'utf8')):await request(`${base}${item.href}/products.json?limit=250`,true);
  fs.writeFileSync(cache,JSON.stringify(data));const handles=data.products.map(p=>p.handle);
  if(data.products.length===250){for(let page=2;page<=10;page++){const extraCache=`.reference/collection-${handle}-${page}.json`;const extra=fs.existsSync(extraCache)?JSON.parse(fs.readFileSync(extraCache,'utf8')):await request(`${base}${item.href}/products.json?limit=250&page=${page}`,true);fs.writeFileSync(extraCache,JSON.stringify(extra));handles.push(...extra.products.map(p=>p.handle));if(extra.products.length<250)break;await new Promise(resolve=>setTimeout(resolve,350));}}
  collectionEntries.push({handle,title:item.title,handles});await new Promise(resolve=>setTimeout(resolve,350));
 }catch(e){console.log('Collection unavailable:',handle,e.message);}}
}));
fs.writeFileSync('data/collections.json',JSON.stringify(collectionEntries));
function sanitize(content) {
  return content.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<(script|style|svg|form|noscript)[\s\S]*?<\/\1>/gi,'').replace(/<!--[\s\S]*?-->/g,'').replace(/<\/?([a-z][a-z0-9-]*)\b([^>]*)>/gi,(full,tag,attrs)=>{
    const closing=full.startsWith('</');tag=tag.toLowerCase();
    if(!['p','h1','h2','h3','h4','strong','em','b','i','ul','ol','li','br','a','table','thead','tbody','tr','th','td','blockquote'].includes(tag))return '';
    if(tag==='h1')tag='h2';
    if(closing)return `</${tag}>`;
    if(tag==='a'){const m=attrs.match(/href=["']([^"']+)["']/);let href=decode(m?.[1]||'#').replace(/^https:\/\/(www\.)?sajiero\.com/,'');if(!/^(\/|https:\/\/|mailto:|tel:|#)/.test(href))href='#';return `<a href="${href.replace(/"/g,'&quot;')}">`;}
    return `<${tag}>`;
  }).replace(/\s+/g,' ').trim();
}
const pages=[];
for(const route of ['/pages/about-us','/pages/privacy-policy','/pages/sajiero-affiliates','/policies/refund-policy','/policies/terms-of-service','/policies/shipping-policy']){
 try{const cache='.reference/cms-'+route.split('/').pop()+'.html';const source=fs.existsSync(cache)?fs.readFileSync(cache,'utf8'):await request(base+route);fs.writeFileSync(cache,source);const main=source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';const title=clean(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||route.split('/').pop().replace(/-/g,' '));pages.push({route,title,html:sanitize(main.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i,''))});}catch(e){console.log('CMS unavailable',route,e.message);}
}
fs.writeFileSync('data/pages.json',JSON.stringify(pages));
try{const cache='.reference/blogs.atom';const feed=fs.existsSync(cache)?fs.readFileSync(cache,'utf8'):await request(base+'/blogs/news.atom');fs.writeFileSync(cache,feed);const posts=[...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m=>{const s=m[1];const title=clean(s.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]||'');const url=s.match(/<link[^>]*href=["']([^"']+)["']/)?.[1]||'';const raw=(s.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]||s.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]||'').replace(/^<!\[CDATA\[|\]\]>$/g,'');const content=raw.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"');const image=content.match(/<img[^>]+src=["']([^"']+)["']/)?.[1];return {title,slug:url.split('/').pop(),html:sanitize(content),excerpt:clean(content).slice(0,170),image:image?.startsWith('http')?asset(image,1000):home.categories[2].image};});fs.writeFileSync('data/blogs.json',JSON.stringify(posts));console.log('Blog articles saved:',posts.length);}catch(e){console.log('Blog unavailable',e.message);fs.writeFileSync('data/blogs.json','[]');}
const normalized=products.map(p=>({id:p.id,handle:p.handle,title:p.title,description:clean(p.body_html||''),type:p.product_type,tags:Array.isArray(p.tags)?p.tags:String(p.tags||'').split(', '),images:p.images.map(im=>homeHandles.has(p.handle)?asset(im.src,1100):im.src+(im.src.includes('?')?'&':'?')+'width=1100').slice(0,6),options:p.options.map(o=>({name:o.name,values:o.values})),variants:p.variants.map(v=>({id:v.id,title:v.title,price:Number(v.price),compareAt:Number(v.compare_at_price||0),available:v.available??true,options:[v.option1,v.option2,v.option3].filter(Boolean)}))}));
fs.writeFileSync('data/products.json',JSON.stringify(normalized));
for(const raw of [...new Set([...html.matchAll(/\/\/[^"'\s<>]+inter_n[4567]\.[^"'\s<>]+\.woff2/g)].map(m=>m[0]))]){
 const weight=raw.match(/inter_n(\d)/)[1]+'00';jobs.set('/fonts/inter-'+weight+'.woff2','https:'+raw);
}
console.log('Catalog saved:',normalized.length,'products;',collectionEntries.length,'collections. Downloading',jobs.size,'assets');
const entries=[...jobs];let cursor=0;let failures=0;
await Promise.all(Array.from({length:8},async()=>{while(cursor<entries.length){const [local,url]=entries[cursor++];const target='public'+local;if(fs.existsSync(target))continue;try{const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);fs.writeFileSync(target,Buffer.from(await r.arrayBuffer()));}catch(e){failures++;console.log('Asset unavailable',local,e.message);}}}));
fs.writeFileSync('data/asset-map.json',JSON.stringify(imageMap));
console.log('Done. Assets:',jobs.size,'failed:',failures);
