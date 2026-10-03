const data=window.SYNTARA_DATA;
const themes=data.themes;
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

const header=$('.topbar');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>25),{passive:true});
const menu=$('.menu-button');
menu.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});
$$('.topbar nav a').forEach(link=>link.addEventListener('click',()=>{header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}));

// Reveal story sections as they enter the viewport. Content stays visible without JS.
const revealTargets=$$('.story-section,.pattern-section,.whitespace-section,.autopilot-section,.loop-section,.manifesto,.closing');
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});revealTargets.forEach(el=>{el.classList.add('reveal');observer.observe(el)})}

const signalCopy=$('#signal-copy');
$$('.node').forEach(node=>node.addEventListener('click',()=>{$$('.node').forEach(item=>item.classList.remove('selected'));node.classList.add('selected');signalCopy.textContent=`${node.dataset.topic} is shifting`}));
const toast=$('.toast');let toastTimer;
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}

$$('.theme-tab').forEach(button=>button.addEventListener('click',()=>{
  const name=button.dataset.theme,theme=themes[name];if(!theme)return;
  $$('.theme-tab').forEach(tab=>tab.classList.toggle('active',tab===button));
  $('#viz-theme').textContent=name.toUpperCase();$('#market-num').textContent=`${theme.market}%`;$('#brand-num').textContent=`${theme.brand}%`;
  $('#market-bar').style.width=`${theme.market}%`;$('#brand-bar').style.width=`${theme.brand}%`;
  $('.compare-group:first-child>small').textContent=`${theme.marketCount} brands publishing on this theme`;
  $('.compare-group:last-child>small').textContent=`${theme.brandCount} of 16 recent posts on this theme`;
  $('#opp-copy').textContent=theme.opportunity;$('#campaign-title').innerHTML=theme.campaign;$('#campaign-desc').textContent=theme.description;
}));

$$('.build-trigger').forEach(button=>button.addEventListener('click',()=>{
  const clientId=new URLSearchParams(location.search).get('clientId');
  if(document.body.dataset.page!=='campaigns'){
    location.href=`campaigns.html${clientId?`?clientId=${encodeURIComponent(clientId)}`:''}#campaign-planner`;
    return;
  }
  const planner=$('#campaign-planner');
  planner.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  notify('Campaign planner ready.');
}));
$('.approve-button').addEventListener('click',()=>notify('Draft ready for your team to review. Nothing has been published.'));
$('.icon-button').addEventListener('click',()=>$('#whitespace').scrollIntoView({behavior:'smooth',block:'start'}));
$$('a[href="#demo"]').forEach(link=>link.addEventListener('click',()=>setTimeout(()=>$('.campaign-workspace').classList.add('campaign-flash'),350)));

// Small, deterministic calendar demo: drag one content idea onto a different day.
const calendar=$('.calendar-strip');
if(calendar){
  const weekdays=['mon','tue','wed','thu','fri','sat','sun'];
  const strip=document.createElement('div');strip.className='calendar-items';strip.setAttribute('aria-label','Draggable sample campaign content');
  strip.innerHTML='<button class="calendar-item" draggable="true" data-calendar-id="cal-reel-01" data-day="mon">Reel · Teach the shortcut</button><button class="calendar-item" draggable="true" data-calendar-id="cal-carousel-01" data-day="wed">Carousel · Show your working</button><button class="calendar-item" draggable="true" data-calendar-id="cal-reel-02" data-day="fri">Reel · What we believe</button>';
  $('.cal-days',calendar).after(strip);strip.style.display='grid';strip.style.gridTemplateColumns='repeat(7,minmax(0,1fr))';
  const cards=$$('.calendar-item',strip),slots=$$('.cal-days>span',calendar);
  cards.forEach(card=>{card.style.gridColumn=String(weekdays.indexOf(card.dataset.day)+1);card.addEventListener('dragstart',()=>card.classList.add('dragging'));card.addEventListener('dragend',()=>card.classList.remove('dragging'))});
  slots.forEach((slot,index)=>{
    slot.dataset.day=weekdays[index];slot.setAttribute('aria-label',`${slot.querySelector('small').textContent} ${slot.querySelector('b').textContent}, drop content here`);
    slot.addEventListener('dragover',event=>{event.preventDefault();slot.classList.add('drop-target')});
    slot.addEventListener('dragleave',()=>slot.classList.remove('drop-target'));
    slot.addEventListener('drop',event=>{event.preventDefault();slot.classList.remove('drop-target');const card=cards.find(item=>item.classList.contains('dragging'));if(!card)return;card.dataset.day=weekdays[index];card.style.gridColumn=String(index+1);notify(`Moved content to ${slot.querySelector('small').textContent}.`)});
  });
}
