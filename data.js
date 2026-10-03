/**
 * Deterministic, explicitly illustrative demo data.
 * Replace this module with the connected-account services when APIs are available.
 * Competitor observations use public post volume and engagement only; no private
 * conversion or revenue metrics are implied.
 *
 * @typedef {{id:string,name:string,handle:string,source:'public',observedPosts:number}} Competitor
 * @typedef {{id:string,competitorId:string,format:string,theme:string,hook:string,publishedAt:string,publicEngagement:number}} ContentItem
 * @typedef {{id:string,theme:string,change:string,confidence:number,competitorCount:number}} MarketSignal
 * @typedef {{id:string,theme:string,marketShare:number,brandShare:number,summary:string}} Opportunity
 * @typedef {{id:string,name:string,objective:string,status:'draft'|'approved',pillars:string[],windowWeeks:number}} Campaign
 * @typedef {{hook:string,message:string,format:string,angle:string,emotion:string,cta:string,audience:string}} CreativeAnalysis
 * @typedef {{id:string,name:string,baseline:number,current:number,hook:string,format:string,angle:string,cta:string}} ContentPerformance
 * @typedef {{id:string,type:string,title:string,evidence:string,action:string}} Alert
 * @typedef {{competitorId:string,velocityChange:string,topics:string[],message:string,formats:string[],campaign:string,recentChange:string}} CompetitorProfile
 * @typedef {{id:string,theme:string,competitorIds:string[],message:string,formats:string[]}} MarketPattern
 * @typedef {{hook:string,message:string,format:string,angle:string,emotion:string,cta:string,audience:string}} CreativeAnalysis
 * @typedef {{id:string,objective:string,audience:string,durationWeeks:number,channels:string[],hooks:string[],status:'draft'|'approved'}} CampaignContent
 * @typedef {{id:string,name:string,reason:string,evidenceIds:string[],suggestedAction:string}} MarketingRecommendation
 * @typedef {{positioning:string,audience:string,tone:string[],preferred:string[],avoid:string[],pillars:string[]}} BrandProfile
 */
window.SYNTARA_DATA=Object.freeze({
  themes:Object.freeze({
    Education:{market:68,brand:19,marketCount:12,brandCount:3,opportunity:'Education is underrepresented in your mix.',campaign:'Make the<br>thinking visible.',description:'An educational series that turns your team’s hard-won expertise into the most useful content in the category.'},
    'Founder POV':{market:53,brand:44,marketCount:9,brandCount:7,opportunity:'Founder perspective is close to category pace.',campaign:'Put a point<br>of view to work.',description:'A founder-led series that gives your sharpest opinions a regular place in the conversation.'},
    Community:{market:41,brand:12,marketCount:7,brandCount:2,opportunity:'Community stories are a wide-open space.',campaign:'Make the people<br>the story.',description:'A community spotlight series showing the people, rituals, and small wins behind your product.'},
    'Product demos':{market:76,brand:31,marketCount:14,brandCount:5,opportunity:'Product demos are crowded. Find a fresher angle.',campaign:'Show the result,<br>not the tour.',description:'A proof-led series that starts with the customer outcome, then shows the product detail that made it possible.'}
  }),
  competitors:[
    {id:'northstar',name:'Northstar Studio',handle:'@northstar',source:'public',observedPosts:28},
    {id:'orbit',name:'Orbit Works',handle:'@orbitworks',source:'public',observedPosts:34},
    {id:'monday',name:'Monday Practice',handle:'@mondaypractice',source:'public',observedPosts:19},
    {id:'signal-house',name:'Signal House',handle:'@signalhouse',source:'public',observedPosts:22}
  ],
  competitorProfiles:[
    {competitorId:'northstar',velocityChange:'+31% posts this month',topics:['Education','Creative process'],message:'Show the work behind the outcome',formats:['Reels','Carousels'],campaign:'The Better Brief series',recentChange:'Started a weekly practical-teaching series.'},
    {competitorId:'orbit',velocityChange:'2× short-form cadence',topics:['Education','Product'],message:'Test, learn, then make it clearer',formats:['Short video','Founder posts'],campaign:'100 Tests / 100 Lessons',recentChange:'Shifted its publishing mix toward short video.'},
    {competitorId:'monday',velocityChange:'Steady · 4 posts / week',topics:['Founder POV','Education'],message:'Better questions make better creative',formats:['Carousels','Text posts'],campaign:'Questions Worth Asking',recentChange:'Repeated a problem-first brief angle in three posts.'},
    {competitorId:'signal-house',velocityChange:'+18% posts this month',topics:['Community','Product'],message:'Made with the people who use it',formats:['Stories','Customer features'],campaign:'Made Together',recentChange:'Added community stories to product updates.'}
  ],
  contentItems:[
    {id:'post-01',competitorId:'northstar',format:'Reel',theme:'Education',hook:'3 ways to rethink your launch',publishedAt:'2026-09-26',publicEngagement:128},
    {id:'post-02',competitorId:'orbit',format:'Carousel',theme:'Education',hook:'What we learned from 100 tests',publishedAt:'2026-09-23',publicEngagement:94},
    {id:'post-03',competitorId:'monday',format:'Reel',theme:'Education',hook:'A better way to brief creative',publishedAt:'2026-09-19',publicEngagement:143},
    {id:'post-04',competitorId:'signal-house',format:'Story',theme:'Founder POV',hook:'Behind the scenes: our process',publishedAt:'2026-09-16',publicEngagement:57}
  ],
  signals:[{id:'signal-education-01',theme:'Education',change:'+32% public content activity',confidence:.86,competitorCount:12}],
  marketPatterns:[{id:'pattern-education-01',theme:'Education',competitorIds:['northstar','orbit','monday'],message:'Problem-first teaching is appearing across multiple brands.',formats:['Reels','Carousels']}],
  opportunities:[{id:'opp-education-01',theme:'Education',marketShare:68,brandShare:19,summary:'Educational content is underrepresented in your category mix.'}],
  campaign:{id:'campaign-education-01',name:'Make the thinking visible',objective:'Increase saves on educational content',status:'draft',pillars:['What we believe','Show your working','Teach the shortcut'],windowWeeks:3},
  timeline:[
    {date:'SEP 12',competitor:'Northstar Studio',change:'Launched a practical education series',kind:'CAMPAIGN'},
    {date:'SEP 18',competitor:'Orbit Works',change:'Short-form cadence doubled week over week',kind:'FORMAT'},
    {date:'SEP 23',competitor:'Monday Practice',change:'Shifted headline language toward “show your working”',kind:'MESSAGING'},
    {date:'OCT 01',competitor:'3 competitors',change:'The same problem-first education angle appears across the market',kind:'PATTERN'}
  ],
  creativeAnalysis:{hook:'You’re probably briefing creative backwards.',message:'Problem → Useful insight → Practical next step',format:'Short-form video · 34 seconds',angle:'Educational · Point of view',emotion:'Recognition → confidence',cta:'Save this for your next brief',audience:'In-house marketing leads'},
  performance:[
    {id:'content-education-01',name:'The 3-second brief test',baseline:1.8,current:3.2,hook:'Problem introduced in first 2 seconds',format:'Short-form video',angle:'Educational',cta:'Save / share'},
    {id:'content-education-02',name:'A better launch checklist',baseline:2.1,current:2.7,hook:'Specific promise up front',format:'Carousel',angle:'Practical guide',cta:'Save for later'}
  ],
  alerts:[
    {id:'alert-market-01',type:'MARKET SIGNAL',title:'A shared education angle is spreading',evidence:'3 competitors used problem-first educational hooks this week.',action:'Inspect the pattern'},
    {id:'alert-gap-01',type:'OPPORTUNITY',title:'Education × community remains underused',evidence:'2 of 18 observed brands pair practical education with community stories.',action:'Build from this gap'},
    {id:'alert-performance-01',type:'PERFORMANCE',title:'Problem-led hooks beat your recent baseline',evidence:'Sample connected-account saves: 3.2% versus a 1.8% baseline.',action:'See why it worked'}
  ],
  brandProfile:{positioning:'Make complicated marketing decisions easier to act on.',audience:'Lean in-house marketing teams',products:['Syntara Intelligence','Syntara Campaign Studio'],tone:['Clear','Curious','Direct'],preferred:['specific','useful','show your working'],avoid:['game-changing','revolutionary','growth hack'],pillars:['Teach the thinking','Show the process','Make the work human'],competitors:['northstar','orbit','monday','signal-house'],visualIdentity:'Editorial grotesk · ink · champagne brass · field olive',rules:['Evidence before recommendation','Draft before publish','Name sample data clearly'],campaignHistory:['The Better Brief — sample campaign']}
});
