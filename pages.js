const currentPage=document.body.dataset.page;
const activeClientId=new URLSearchParams(location.search).get('clientId');
const clientQuery=activeClientId?`?clientId=${encodeURIComponent(activeClientId)}`:'';
document.querySelectorAll('.topbar nav a').forEach(link=>{
  const target=link.getAttribute('href').split('#')[0].replace('.html','');
  if(target===(currentPage==='overview'?'index':currentPage))link.setAttribute('aria-current','page');
  if(activeClientId&&target!=='agency')link.href=`${target}.html${clientQuery}${link.hash}`;
});

function openCampaigns(anchor='campaign-planner'){
  if(currentPage==='campaigns')document.getElementById(anchor)?.scrollIntoView({behavior:'smooth',block:'start'});
  else location.href=`campaigns.html${clientQuery}#${anchor}`;
}
document.querySelectorAll('.opportunity-build,.rec-build').forEach(button=>button.addEventListener('click',event=>{
  if(currentPage!=='campaigns'){event.preventDefault();openCampaigns('campaign-planner')}
}));
document.querySelectorAll('.alert-action').forEach(button=>button.addEventListener('click',event=>{
  const destinations=[`intelligence.html${clientQuery}#signal-engine`,`opportunities.html${clientQuery}#opportunity-engine`,`performance.html${clientQuery}#performance-learning`];
  event.preventDefault();location.href=destinations[Number(button.dataset.alert)]||destinations[0];
}));
if(currentPage!=='overview'&&location.hash){
  const targetId=decodeURIComponent(location.hash.slice(1));
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(targetId)?.scrollIntoView({block:'start'})));
}
