import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath=process.env.CHROME_PATH || (existsSync(chrome)?chrome:undefined);
const files=['assets/decision-workspace.html','assets/before-after.html','assets/state-explorer.html','assets/final-review.html','examples/layout-comparison.html','examples/review-flow.html','assets/handoff-flow.html','assets/system-map.html','assets/decision-graph.html','examples/architecture-before-after.html','examples/failure-recovery.html'];
test('workspaces display information without answer or action controls, standalone and offline',async()=>{
 const browser=await chromium.launch({executablePath});
 const directory=mkdtempSync(join(tmpdir(),'visual-display-'));
 try {
  for(const file of files){
   const target=join(directory,file.replaceAll('/','-')); copyFileSync(resolve('skills/brainstorm',file),target);
   for(const colorScheme of ['light','dark']) for(const width of [320,1280]){
    const page=await browser.newPage({viewport:{width,height:900},colorScheme,offline:true});
    const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
    await page.goto(pathToFileURL(target).href);
    assert.equal(await page.locator('input,textarea,button,select,[role=button],form,script,details,summary').count(),0,file);
    assert.doesNotMatch(await page.locator('body').innerText(),/Reply in chat|Copy answers|Choose |Mark the decisions|No selections yet/i);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,file);
    assert.ok(await page.locator('h1').innerText());
    const invalidReferences=await page.evaluate(()=>{
     const missing=[];
     for(const el of document.querySelectorAll('[aria-labelledby],[aria-describedby]')) {
      for(const attr of ['aria-labelledby','aria-describedby']) for(const id of (el.getAttribute(attr)||'').split(/\s+/).filter(Boolean)) {
       if(!document.getElementById(id)) missing.push(id);
      }
     }
     for(const el of document.querySelectorAll('[marker-end]')) {
      const id=el.getAttribute('marker-end').match(/url\(#([^)]+)\)/)?.[1];
      if(id&&!document.getElementById(id)) missing.push(id);
     }
     return missing;
    });
    assert.deepEqual(invalidReferences,[],`${file}: diagram references must resolve`);
    for(const svg of await page.locator('svg[role="img"]').all()) {
     assert.ok(await svg.getAttribute('aria-labelledby'),file);
     assert.ok((await svg.locator('title').textContent()).trim(),file);
    }
    assert.deepEqual(errors,[]);assert.deepEqual(requests.filter(u=>!u.startsWith('file:')),[]);
    if(file==='assets/final-review.html') {
     assert.match(await page.locator('body').innerText(),/Review is required before publishing/);assert.match(await page.locator('body').innerText(),/author sends the draft for review again/);
     assert.match(await page.locator('body').innerText(),/Waiting for a reviewer/i);
     await page.screenshot({path:join(tmpdir(),`display-review-${width}-${colorScheme}.png`),fullPage:true});
    }
    await page.close();
   }
  }
 }finally{await browser.close();rmSync(directory,{recursive:true,force:true});}
});
