import fs from 'node:fs';
import path from 'node:path';

fs.mkdirSync('.reference',{recursive:true});
const parameters=new URLSearchParams({reviews_selection:'product_reviews',carousel_type:'cards',star_rating:'all',custom_tags:'',tag_filter:'',max_reviews:'200',url:'https://www.sajiero.com',shop_domain:'zynero.myshopify.com',platform:'shopify',primary_language:'en',display_order:'media_first'});
const cache='.reference/customer-reviews-cdn.json';
let reviews;
if(fs.existsSync(cache)&&!process.argv.includes('--refresh'))reviews=JSON.parse(fs.readFileSync(cache,'utf8'));
else {
 const response=await fetch('https://cdn.judge.me/reviews/reviews_for_carousel?'+parameters,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Public reviews returned '+response.status);
 reviews=await response.json();fs.writeFileSync(cache,JSON.stringify(reviews));
}
if(!Array.isArray(reviews.reviews))throw new Error('The public review feed did not return reviews');
const referenceOrder=['f320155a-db45-414e-9d86-d8977c688782','e9c2e318-7645-4f59-bb53-ccd3f10a8dcb','82380a64-5c81-4420-90ea-b27ad4cca5e3','987c4d28-6a8a-464d-9623-9e2c6344b6be'];
const photoReviews=reviews.reviews.filter(review=>review.card_type==='photo'&&review.picture?.urls);
photoReviews.sort((a,b)=>{const ai=referenceOrder.indexOf(a.uuid),bi=referenceOrder.indexOf(b.uuid);return (ai<0?999:ai)-(bi<0?999:bi);});
const products=JSON.parse(fs.readFileSync('data/products.json','utf8'));
const knownHandles=new Set(products.map(p=>p.handle));
fs.mkdirSync('public/images/reviews',{recursive:true});fs.mkdirSync('data',{recursive:true});
const normalized=[];
for(const review of photoReviews){
 if(!/^[a-f0-9-]{36}$/i.test(review.uuid))throw new Error('Unexpected review identifier');
 const raw=review.picture.urls.mobile||review.picture.urls.huge||review.picture.urls.original;
 const url=new URL(raw);if(url.protocol!=='https:')throw new Error('Review image must use HTTPS');
 const extension=path.extname(url.pathname)||'.jpg';
 const image=`/images/reviews/${review.uuid}${extension}`;
 if(!fs.existsSync('public'+image)){
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('Review image returned '+response.status);
  fs.writeFileSync('public'+image,Buffer.from(await response.arrayBuffer()));
 }
 const pathname=review.product_url?new URL(review.product_url,'https://www.sajiero.com').pathname:null;
 normalized.push({id:review.uuid,author:review.public_reviewer_name||review.reviewer_name||'Anonymous',body:review.body||'',rating:Number(review.rating),verified:Boolean(review.verified_buyer),image,productTitle:review.product_title||'',productHref:pathname&&knownHandles.has(pathname.split('/').pop())?pathname:null});
}
fs.writeFileSync('data/reviews.json',JSON.stringify(normalized,null,2)+'\n');
console.log('Saved',normalized.length,'original photo reviews and local customer images.');
