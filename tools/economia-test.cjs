const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const window={};
vm.runInNewContext(fs.readFileSync('dist/economy/tienda.js','utf8'),{window});
const T=window.NexoTienda;

// Comprar cofre: descuenta y no deja sin fondos.
let st={coins:T.CHEST_PRICE-1};
assert.equal(T.buyChest(st).ok,false);
assert.match(T.buyChest(st).reason,/Te faltan 1 ⚛/);
assert.equal(st.coins,T.CHEST_PRICE-1);
st.coins=T.CHEST_PRICE+5;
assert.equal(T.buyChest(st).ok,true);
assert.equal(st.coins,5);
assert.equal(T.shopOf(st).chests,1);

// Cofre diario: una vez por día.
st={coins:0};
assert.equal(T.claimDaily(st,'2026-10-17').ok,true);
assert.equal(T.claimDaily(st,'2026-10-17').ok,false);
assert.equal(T.claimDaily(st,'2026-10-18').ok,true);
assert.equal(T.shopOf(st).chests,2);

// Hitos: 1 cofre por logro nuevo y no se repite.
st={coins:0};
assert.deepEqual([...T.claimMilestones(st,{bosses:['amina'],guides:['g1'],streak:8})],['jefe:amina','guia:g1','racha:7']);
assert.equal(T.shopOf(st).chests,3);
assert.deepEqual([...T.claimMilestones(st,{bosses:['amina'],guides:['g1'],streak:8})],[]);
assert.deepEqual([...T.claimMilestones(st,{bosses:['amina','ciclo'],streak:14})],['jefe:ciclo','racha:14']);
assert.equal(T.shopOf(st).chests,5);

// Abrir sin cofres falla.
assert.equal(T.openChest({coins:0}).ok,false);

// Garantía: con rng que siempre da "común", al décimo cofre sale raro o legendario.
st={coins:0};
T.grantChest(st,T.PITY);
let last;
for(let i=0;i<T.PITY;i++) last=T.openChest(st,()=>0);
assert.ok(['raro','legendario'].includes(last.rarity),'el cofre '+T.PITY+' debe ser raro+');
assert.equal(T.shopOf(st).sinceRare,0);

// Repetido: no duplica el accesorio y da polvo.
st={coins:0};
T.grantChest(st,2);
const a=T.openChest(st,()=>0), b=T.openChest(st,()=>0);
assert.equal(a.dupe,false);
assert.equal(b.dupe,true);
assert.equal(st.shop.owned.length,1);
assert.equal(st.shop.dust,T.DUST[b.rarity]);

// Polvo: compra directa solo con polvo suficiente y no repite.
st={coins:0,shop:{owned:[],dust:T.DUST_PRICE.comun}};
assert.equal(T.buyWithDust(st,'varita').ok,false);
assert.equal(T.buyWithDust(st,'flor').ok,true);
assert.equal(st.shop.dust,0);
assert.equal(T.buyWithDust(st,'flor').ok,false);
st={coins:0,shop:{owned:[],dust:20}};
assert.match(T.buyWithDust(st,'flor').reason,/Te faltan 10 polvo/);

// Accesorio directo con ⚛: descuenta lo exacto, dice cuánto falta, no repite y nunca deja saldo negativo.
assert.deepEqual([...T.RARITIES.map(r=>T.ACC_PRICE[r])],[90,150,300,600]);
st={coins:T.ACC_PRICE.comun-1,shop:{owned:[],dust:0}};
let buy=T.buyAccessory(st,'flor');
assert.equal(buy.ok,false);
assert.match(buy.reason,/Te faltan 1 ⚛/);
assert.equal(st.coins,T.ACC_PRICE.comun-1);
assert.equal(T.shopOf(st).owned.length,0);
st.coins=T.ACC_PRICE.legendario+7;
buy=T.buyAccessory(st,'corona');
assert.equal(buy.ok,true);
assert.equal(buy.price,T.ACC_PRICE.legendario);
assert.equal(st.coins,7);
assert.ok(T.shopOf(st).owned.includes('corona'));
assert.equal(T.buyAccessory(st,'corona').ok,false,'ya lo tienes');
assert.equal(T.buyAccessory(st,'nada').ok,false,'no existe');
assert.equal(st.coins,7);

// Probabilidades suman 100 y los 14 accesorios tienen rareza.
assert.equal(Object.values(T.ODDS).reduce((x,y)=>x+y,0),100);
assert.equal(Object.keys(T.RARITY_OF).length,14);

// Cofres por categoría: cuestan más, solo dan accesorios de esa categoría (aunque falte esa rareza).
st={coins:T.SLOT_CHEST_PRICE-1};
assert.equal(T.buyChest(st,'cuello').ok,false);
st.coins=T.SLOT_CHEST_PRICE;
assert.equal(T.buyChest(st,'cuello').ok,true);
assert.equal(st.coins,0);
assert.equal(T.shopOf(st).slotChests.cuello,1);
for(const slot of T.SLOTS)for(const r of [0,0.7,0.95,0.999]){
  const s2={coins:0};T.shopOf(s2).slotChests[slot]=1;
  const o=T.openChest(s2,()=>r,slot);
  assert.equal(T.SLOT_OF[o.id],slot,slot+' con rng '+r);
}
assert.equal(T.openChest({coins:0},()=>0,'mano').ok,false);

// Ganar átomos: por evidencia, con bonus del primer día y tope diario.
st={coins:0};
assert.equal(T.earn(st,'sinAyuda','2026-10-17'),T.EARN.sinAyuda+T.DAILY_BONUS);
assert.equal(T.earn(st,'recuerdo','2026-10-17'),T.EARN.recuerdo);
for(let i=0;i<40;i++)T.earn(st,'transferencia','2026-10-17');
assert.equal(st.coins,T.DAILY_CAP);
assert.ok(T.shopOf(st).earned.total<=T.DAILY_CAP+T.DAILY_BONUS);
assert.equal(T.earn(st,'sinAyuda','2026-10-17'),0);
assert.ok(T.earn(st,'sinAyuda','2026-10-18')>0,'el tope se reinicia cada día');
console.log('economia-test OK');
