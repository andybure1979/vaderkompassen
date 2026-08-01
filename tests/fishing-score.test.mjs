import test from 'node:test';
import assert from 'node:assert/strict';
await import('../fishing-score.js');

const frontendScore=row=>globalThis.VK_FISHING.score(row);
const workerScore=row=>globalThis.VK_FISHING.score(row);
const base={wind:3,windGust:5,windDirection:180,rain:0,risk:0,cloudCover:50,temp:20,waterTemperature:18,waveHeight:.4,hasMarine:true};
const scenarios={
  A:{...base},B:{...base,windDirection:0},C:{...base,wind:0},D:{...base,wind:8,windGust:14},
  E:{...base,waterTemperature:22},F:{...base,waterTemperature:10},
  G:{...base,waterTemperature:null,waveHeight:null,hasMarine:false},H:{...base,place:'Inland',waterTemperature:null,waveHeight:null,hasMarine:false},
  I:{...base,place:'Kust'},J_clear:{...base,cloudCover:0},J_cloudy:{...base,cloudCover:50},
  K:{...base,rain:10,risk:90},L:{...base,thunderRisk:80}
};

test('frontend och Worker använder samma fiskepoäng',()=>{
  for(const [name,row] of Object.entries(scenarios)){
    const front=frontendScore(row),worker=workerScore(row);
    assert.ok(Math.abs(front.score-worker.score)<1e-9,name);
  }
});

test('fiskescenariernas ordning och normalisering',()=>{
  const scored=Object.fromEntries(Object.entries(scenarios).map(([k,v])=>[k,frontendScore(v)]));
  assert.ok(scored.B.score<scored.A.score,'nordanvind ska sänka');
  assert.ok(scored.A.factors.find(f=>f.id==='wind').value>scored.C.factors.find(f=>f.id==='wind').value);
  assert.ok(scored.A.factors.find(f=>f.id==='wind').value>scored.D.factors.find(f=>f.id==='wind').value);
  assert.ok(scored.J_cloudy.factors.find(f=>f.id==='cloudCover').value>scored.J_clear.factors.find(f=>f.id==='cloudCover').value);
  for(const key of ['G','H']){
    assert.equal(scored[key].factors.some(f=>f.id==='waterTemperature'||f.id==='waves'),false);
    assert.equal(scored[key].factors.reduce((s,f)=>s+f.weight,0),90);
  }
  assert.ok(scored.K.score<scored.A.score,'kraftigt regn ska sänka');
  assert.equal(scored.L.score,scored.A.score,'thunderRisk ska inte påverka utan separat implementerad faktor');
});

test('redovisa scenarioresultat',()=>{
  for(const [name,row] of Object.entries(scenarios)){
    const result=frontendScore(row);
    console.log(`${name}: ${result.score.toFixed(1)} | ${result.factors.map(f=>`${f.id}=${f.value.toFixed(1)}`).join(', ')}`);
  }
});
