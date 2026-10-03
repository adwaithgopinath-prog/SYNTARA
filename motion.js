// A short, scroll-controlled product film: activity resolves into a market signal.
const heroScene=document.querySelector('.hero');
if(heroScene){
  const openingRun=document.createElement('div');openingRun.className='opening-run';heroScene.before(openingRun);openingRun.append(heroScene);
  const map=document.querySelector('.map-area');
  const story=document.createElement('div');story.className='film-story';story.setAttribute('aria-live','polite');
  story.innerHTML='<span class="film-state-label">01 / MARKET</span><b>Everything is moving.</b><div class="film-sequence" aria-label="Market, Signal, Pattern, Opportunity"><button data-film-step="0" aria-current="step">01 Market</button><button data-film-step="1">02 Signal</button><button data-film-step="2">03 Pattern</button><button data-film-step="3">04 Opportunity</button></div><span class="film-scroll-cue">SCROLL TO TRACE THE SIGNAL <i>↓</i></span>';
  map.append(story);
  const frames=[
    {stage:'market',label:'01 / MARKET',title:'Everything is moving.',signal:'Education is accelerating',chip:'SIGNAL DETECTED'},
    {stage:'signal',label:'02 / SIGNAL',title:'One change starts to stand out.',signal:'Education activity is up 32%',chip:'SIGNAL ISOLATED'},
    {stage:'pattern',label:'03 / PATTERN',title:'The same angle keeps appearing.',signal:'Problem-first education is repeating',chip:'PATTERN FORMED'},
    {stage:'opportunity',label:'04 / OPPORTUNITY',title:'Now there’s somewhere to go.',signal:'Education × community is still open',chip:'OPPORTUNITY DETECTED'}
  ];
  let current=-1,raf=0,active=false;
  function setFrame(index){if(index===current)return;current=index;const frame=frames[index];heroScene.dataset.stage=frame.stage;story.querySelector('.film-state-label').textContent=frame.label;story.querySelector('.film-state-label').nextElementSibling.textContent=frame.title;const chipLabel=document.querySelector('.signal-chip small'),signalText=document.querySelector('#signal-copy');if(chipLabel)chipLabel.textContent=frame.chip;if(signalText)signalText.textContent=frame.signal;story.querySelectorAll('[data-film-step]').forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')})}
  function updateFrame(){raf=0;if(!active)return;const rect=openingRun.getBoundingClientRect(),range=Math.max(1,openingRun.offsetHeight-innerHeight),progress=Math.max(0,Math.min(1,-rect.top/range));setFrame(Math.min(3,Math.floor(progress*4)))}
  function requestUpdate(){if(!raf)raf=requestAnimationFrame(updateFrame)}
  const observer=new IntersectionObserver(entries=>{active=entries.some(entry=>entry.isIntersecting);if(active)requestUpdate()},{rootMargin:'100px 0px'});observer.observe(openingRun);
  addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate,{passive:true});
  story.querySelectorAll('[data-film-step]').forEach(button=>button.addEventListener('click',()=>{const fraction=Number(button.dataset.filmStep)/3;scrollTo({top:openingRun.offsetTop+fraction*Math.max(0,openingRun.offsetHeight-innerHeight),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}));
  setFrame(0);requestUpdate();
}
// Keep the page progress line and the film's four-part progress in sync with scroll.
const progressHeader=document.querySelector('.topbar');
function updateScrollProgress(){
  const range=document.documentElement.scrollHeight-innerHeight;
  const progress=range>0?Math.min(1,Math.max(0,scrollY/range)):0;
  progressHeader?.style.setProperty('--scroll-progress',`${progress*100}%`);
  const film=document.querySelector('.film-story'),scene=document.querySelector('.opening-run');
  if(film&&scene){const rect=scene.getBoundingClientRect(),sceneRange=Math.max(1,scene.offsetHeight-innerHeight);film.style.setProperty('--film-progress',`${Math.min(1,Math.max(0,-rect.top/sceneRange))*100}%`)}
}
addEventListener('scroll',updateScrollProgress,{passive:true});
addEventListener('resize',updateScrollProgress,{passive:true});
updateScrollProgress();
