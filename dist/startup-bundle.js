/* Generado por tools/build.cjs; editar los módulos fuente, no este archivo. */

/* cloud/foundation.js */
/* V12: UI -> application -> repositories -> local cache / Supabase.
   Sin credenciales públicas, el runtime permanece local. */
(() => {
  'use strict';
  const config = window.NEXO_PUBLIC_CONFIG || {};
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.supabaseUrl || '')
    && /^(sb_publishable_|eyJ)/.test(config.supabaseAnonKey || '');
  const clone = value => JSON.parse(JSON.stringify(value));
  const storage = {
    read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  };
  const safeError = error => {
    if (/schema_newer_than_client/i.test(error?.message || '')) return 'Esta versión de Nexo necesita actualizarse antes de sincronizar.';
    if (/schema_older_than_client/i.test(error?.message || '')) return 'La base de datos necesita actualizarse antes de sincronizar.';
    if (!navigator.onLine || /fetch|network|timeout/i.test(error?.message || '')) return 'No pudimos sincronizar ahora. Tus cambios siguen en este dispositivo.';
    if (/invalid login credentials/i.test(error?.message || '')) return 'Correo o contraseña incorrectos.';
    if (/email not confirmed/i.test(error?.message || '')) return 'Confirma tu correo antes de iniciar sesión.';
    if (/already registered|already been registered/i.test(error?.message || '')) return 'Ese correo ya tiene una cuenta.';
    if (/password/i.test(error?.message || '')) return 'Revisa la contraseña; debe tener al menos 8 caracteres.';
    if (/sync_conflict/i.test(error?.message || '')) return 'Hay cambios de dos dispositivos pendientes de revisión.';
    if (/insufficient_balance/i.test(error?.message || '')) return 'No tienes átomos suficientes.';
    if (/item_not_owned|species_not_owned|incompatible_species/i.test(error?.message || '')) return 'Este accesorio no está disponible en tu inventario.';
    return 'No pudimos completar la operación. Inténtalo de nuevo.';
  };
  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = src; script.async = true;
    script.onload = resolve; script.onerror = () => reject(new Error('asset_unavailable'));
    document.head.append(script);
  });
  const tableSpecs = [
    ['study_sessions', 'session_id', s => s.sessions || [], item => item.id],
    ['lesson_progress', 'lesson_id', s => Object.entries(s.mastery || {}).map(([id, data]) => ({ id, ...data })), item => item.id],
    ['exercise_progress', 'exercise_id', s => Object.entries(s.practice || {}).map(([id, data]) => ({ id, ...data })), item => item.id],
    ['academic_events', 'event_id', s => s.events || [], item => item.id],
    ['grade_plans', 'subject_id', s => Object.entries(s.grades || {}).map(([id, data]) => ({ id, ...data })), item => item.id],
    ['error_records', 'error_id', s => s.errors || [], item => item.id],
    ['academic_attempts','attempt_id',s=>s.academicIntelligence?.attempts||[],item=>item.id],
    ['academic_evidence','evidence_id',s=>s.academicIntelligence?.evidence||[],item=>item.id],
    ['academic_reviews','review_id',s=>s.academicIntelligence?.reviewSchedules||[],item=>item.id],
    ['academic_errors','academic_error_id',s=>s.academicIntelligence?.structuredErrors||[],item=>item.id],
    ['academic_sources','source_id',s=>s.academicIntelligence?.userSources||[],item=>item.id]
  ];
  const documentSpecs = [
    ['guide','guides'], ['exam','exams'], ['lab','labs'],
    ['absence','absences'], ['lesson_session','lessonSession'], ['route_mode','routeMode'],
    ['boosts','boosts'], ['weekly_goal','weeklyGoal'], ['timer','timer'],
    ['completed_lessons','completedLessons'], ['claimed_challenges','claimedChallenges'],
    ['settings','settings'], ['mascot','mascot'], ['meta','meta'],
    ['organic_progress','organicProgress']
  ];
  const rowKey = (table, id, kind = '') => [table, kind, id].join(':');
  function rowsFromState(state) {
    const rows = [];
    for (const [table, , source, idOf] of tableSpecs) {
      for (const value of source(state)) if (idOf(value))
        rows.push({ table, id: String(idOf(value)), data: clone(value), key: rowKey(table, String(idOf(value))) });
    }
    for (const [kind, property] of documentSpecs) {
      const value = state[property];
      if (kind === 'absence') {
        for (const item of value || []) if (item.id)
          rows.push({ table: 'user_documents', kind, id: item.id, key: rowKey('user_documents',item.id,kind), data: { value: clone(item) } });
      } else if (['guide','exam','lab'].includes(kind)) {
        for (const [id, item] of Object.entries(value || {}))
          rows.push({ table: 'user_documents', kind, id, key: rowKey('user_documents',id,kind), data: { value: clone(item) } });
      } else rows.push({ table: 'user_documents', kind, id: 'current',
        key: rowKey('user_documents','current',kind), data: { value: clone(value ?? null) } });
    }
    for(const item of state.academicIntelligence?.activeTimeSegments||[])if(item.id)
      rows.push({table:'user_documents',kind:'active_time',id:item.id,
        key:rowKey('user_documents',item.id,'active_time'),data:{value:clone(item)}});
    return rows;
  }
  function applyRows(base, rows) {
    const out = clone(base);
    const byTable = Object.fromEntries(tableSpecs.map(([name]) => [name, []]));
    const docs = {};
    for (const row of rows) {
      if (row.data?._deleted) continue;
      if (row.table === 'user_documents') {
        (docs[row.kind] ||= []).push(row);
      } else (byTable[row.table] ||= []).push(row.data);
    }
    for (const [table] of tableSpecs) {
      const values = byTable[table] || [];
      if (table === 'study_sessions') out.sessions = values;
      if (table === 'academic_events') out.events = values;
      if (table === 'error_records') out.errors = values;
      if (table === 'lesson_progress') out.mastery = Object.fromEntries(values.map(({id,...data}) => [id,data]));
      if (table === 'exercise_progress') out.practice = Object.fromEntries(values.map(({id,...data}) => [id,data]));
      if (table === 'grade_plans' && values.length) out.grades = Object.fromEntries(values.map(({id,...data}) => [id,data]));
      const academic={academic_attempts:'attempts',academic_evidence:'evidence',
        academic_reviews:'reviewSchedules',academic_errors:'structuredErrors',academic_sources:'userSources'};
      if(academic[table]) (out.academicIntelligence||={})[academic[table]]=values;
    }
    for (const [kind, property] of documentSpecs) {
      const records = docs[kind];
      if (!records) continue;
      if (kind === 'absence') out.absences = records.map(r => r.data.value);
      else if (['guide','exam','lab'].includes(kind)) out[property] = Object.fromEntries(records.map(r => [r.id,r.data.value]));
      else out[property] = records.find(r => r.id === 'current')?.data.value ?? out[property];
    }
    if(docs.active_time)(out.academicIntelligence||={}).activeTimeSegments=docs.active_time.map(row=>row.data.value);
    return out;
  }
  function mergeAcademic(imported, current) {
    const merged=clone(current), conflicts=[];
    const indexMerge=(name) => {
      const map=new Map((current[name]||[]).map(item=>[item.id,item]));
      for (const item of imported[name]||[]) {
        if (!item?.id) continue;
        const existing=map.get(item.id);
        if (!existing) map.set(item.id,item);
        else if (JSON.stringify(existing)!==JSON.stringify(item) && name!=='sessions')
          conflicts.push({key:name+':'+item.id,local:item,remote:existing});
      }
      merged[name]=[...map.values()];
    };
    for (const name of ['sessions','events','errors','absences']) indexMerge(name);
    for (const name of ['mastery','practice']) {
      merged[name]={...(current[name]||{})};
      for (const [id,item] of Object.entries(imported[name]||{})) {
        const old=merged[name][id];
        if (!old) merged[name][id]=clone(item);
        else {
          const status=old.status==='dominado'||item.status==='dominado'?'dominado':old.status||item.status;
          merged[name][id]={...item,...old,status,
            attempts:Math.max(Number(old.attempts)||0,Number(item.attempts)||0),
            bestScore:Math.max(Number(old.bestScore)||0,Number(item.bestScore)||0)};
          if (old.draft && item.draft && old.draft!==item.draft)
            conflicts.push({key:name+':'+id,local:item,remote:old});
        }
      }
    }
    merged.completedLessons=[...new Set([...(current.completedLessons||[]),...(imported.completedLessons||[])])];
    for (const name of ['guides','exams','labs']) {
      merged[name]={...(current[name]||{})};
      for (const [id,value] of Object.entries(imported[name]||{})) {
        if (!merged[name][id]) merged[name][id]=clone(value);
        else if (JSON.stringify(merged[name][id])!==JSON.stringify(value))
          conflicts.push({key:name+':'+id,local:value,remote:merged[name][id]});
      }
    }
    // En una cuenta vacía se toma la configuración y las notas del invitado.
    const empty=(current.sessions||[]).length===0 && Object.keys(current.mastery||{}).length===0
      && Object.keys(current.practice||{}).length===0 && (current.errors||[]).length===0;
    if (empty) {
      for (const name of ['grades','settings','mascot','weeklyGoal','routeMode','boosts','claimedChallenges','xp','organicProgress'])
        merged[name]=clone(imported[name]??current[name]);
    } else {
      for (const [id,value] of Object.entries(imported.grades||{})) {
        if (current.grades?.[id] && JSON.stringify(current.grades[id])!==JSON.stringify(value))
          conflicts.push({key:'grades:'+id,local:value,remote:current.grades[id]});
      }
    }
    if(!empty) {
      merged.organicProgress={...(current.organicProgress||{})};
      for(const [id,value] of Object.entries(imported.organicProgress||{})) {
        if(!merged.organicProgress[id])merged.organicProgress[id]=clone(value);
        else if(JSON.stringify(merged.organicProgress[id])!==JSON.stringify(value))
          conflicts.push({key:'organicProgress:'+id,local:value,remote:merged.organicProgress[id]});
      }
    }
    const localAcademic=imported.academicIntelligence||{},remoteAcademic=current.academicIntelligence||{};
    merged.academicIntelligence={...remoteAcademic};
    for(const name of ['attempts','evidence','structuredErrors','userSources']) {
      const map=new Map((remoteAcademic[name]||[]).map(item=>[item.id,item]));
      for(const item of localAcademic[name]||[])if(item?.id&&!map.has(item.id))map.set(item.id,clone(item));
      merged.academicIntelligence[name]=[...map.values()];
    }
    const segments=new Map((remoteAcademic.activeTimeSegments||[]).map(item=>[item.id,item]));
    for(const item of localAcademic.activeTimeSegments||[])if(item?.id){
      const prior=segments.get(item.id);
      if(!prior||Number(item.seconds)>Number(prior.seconds))segments.set(item.id,clone(item));
    }
    merged.academicIntelligence.activeTimeSegments=[...segments.values()];
    const reviews=new Map((remoteAcademic.reviewSchedules||[]).map(item=>[item.id,item]));
    for(const item of localAcademic.reviewSchedules||[])if(item?.id){
      const prior=reviews.get(item.id);
      if(!prior||new Date(item.updatedAt)>new Date(prior.updatedAt))reviews.set(item.id,clone(item));
      else if(JSON.stringify(prior)!==JSON.stringify(item))
        conflicts.push({key:'academicReviews:'+item.id,local:item,remote:prior});
    }
    merged.academicIntelligence.reviewSchedules=[...reviews.values()];
    merged.coins=current.coins; merged.inventory=current.inventory;
    return {merged,conflicts};
  }
  class CloudFoundation {
    constructor() {
      this.client = null; this.user = null; this.status = 'guest'; this.lastSync = null;
      this.lastError = ''; this.conflicts = []; this.balance = 0; this.inventory = [];
      this.callbacks = null; this.running = false; this.retryDelay = 2000; this.retryTimer = null;
      this.analytics = null; this.flagCache = {}; this.catalog=null;
      this.reservations=[];
      this.cloudSchemaVersion = null;
      window.addEventListener('online', () => this.sync().catch(() => {}));
    }
    get enabled() { return configured; }
    get googleOAuthEnabled() { return Boolean(config.googleOAuthEnabled); }
    get authenticated() { return Boolean(this.user); }
    get cacheKey() { return this.user ? `nexo-cloud-cache-v12:${this.user.id}` : ''; }
    get outboxKey() { return this.user ? `nexo-cloud-outbox-v12:${this.user.id}` : ''; }
    get shadowKey() { return this.user ? `nexo-cloud-shadow-v12:${this.user.id}` : ''; }
    get cursorKey() { return this.user ? `nexo-cloud-cursor-v13:${this.user.id}` : ''; }
    get guestMigrated() { return this.user ? storage.read(`nexo-guest-migration-v12:${this.user.id}`,false) : false; }
    claimMatches(intent) { return Boolean(intent?.userId && intent?.email && this.user?.id===intent.userId
      && this.user.email?.trim().toLowerCase()===intent.email.trim().toLowerCase()); }
    statusInfo() { return { status:this.status, lastSync:this.lastSync, lastError:this.lastError,
      cloudSchemaVersion:this.cloudSchemaVersion,localSchemaVersion:19,clientVersion:'1.0.0',
      pending:this.user ? storage.read(this.outboxKey, []).length : 0, conflicts:this.conflicts.length }; }
    notify() { this.callbacks?.onStatus?.(this.statusInfo()); }
    async init(callbacks) {
      this.callbacks = callbacks;
      if (!configured) { this.notify(); return; }
      try {
        await loadScript('./vendor/supabase/supabase.js');
        this.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
          auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true,
            flowType:'pkce' }
        });
        this.client.auth.onAuthStateChange((_event, session) => {
          setTimeout(() => this.sessionChanged(session?.user || null).catch(error => this.failure(error)), 0);
        });
        const {data,error} = await this.client.auth.getSession();
        if (error) throw error;
        await this.sessionChanged(data.session?.user || null);
      } catch (error) { this.failure(error); }
    }
    async sessionChanged(user) {
      if (this.user?.id === user?.id) return;
      // Las reservas pertenecen a una cuenta: nunca sobreviven a un cambio de identidad.
      this.reservations=[];
      this.user = user;
      this.conflicts = user ? storage.read(`nexo-import-conflicts-v12:${user.id}`,[]) : [];
      this.lastError = '';
      if (!user) { this.status = 'guest'; this.analytics?.reset?.(); this.callbacks?.onGuest?.();
        this.analyticsConsent(Boolean(this.callbacks?.getCurrent?.()?.settings?.analytics)); this.notify(); return; }
      this.status = 'syncing'; this.notify();
      const cached = storage.read(this.cacheKey, null);
      if (cached) this.callbacks?.onState?.(cached, { cached:true });
      await this.pull();
      // La migración solo se autoriza explícitamente desde Ajustes, nunca al iniciar sesión.
      this.notify();
    }
    failure(error) {
      this.status = 'failed'; this.lastError = safeError(error); this.notify();
      if (this.user && navigator.onLine && !/schema_(newer|older)_than_client/.test(error?.message||'')) {
        clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(() => this.sync().catch(() => {}), this.retryDelay);
        this.retryDelay = Math.min(60000, this.retryDelay * 2);
      }
    }
    async call(query) { const {data,error} = await query; if (error) throw error; return data; }
    async readRows(cursor=null,watermark=null) {
      const result = [];
      for (const [table, idColumn] of [...tableSpecs, ['user_documents','document_id']]) {
        const bounded=!cursor && ['study_sessions','error_records','academic_attempts'].includes(table);
        if (bounded) {
          const batch=await this.call(this.client.from(table)
            .select(`${idColumn},data,updated_at`).lte('updated_at',watermark)
            .order('updated_at',{ascending:false}).order(idColumn,{ascending:true}).range(0,249));
          for(const item of batch) result.push({table,id:String(item[idColumn]),kind:'',
            data:item.data,updated_at:item.updated_at,key:rowKey(table,String(item[idColumn]))});
          continue;
        }
        let afterUpdated=cursor,afterId=cursor?'':null;
        for(let page=0;page<200;page++) {
          const batch=await this.call(this.client.rpc('read_sync_page',{
            p_table:table,p_watermark:watermark,p_after_updated:afterUpdated,
            p_after_id:afterId,p_limit:250
          }));
          for(const item of batch) {
            const id=table==='user_documents'?item.id.slice(item.kind.length+1):item.id;
            result.push({table,id,kind:item.kind||'',data:item.data,
              updated_at:item.updated_at,key:rowKey(table,id,item.kind||'')});
          }
          if(batch.length<250)break;
          if(page===199)throw new Error('sync_page_limit');
          afterUpdated=batch.at(-1).updated_at;afterId=batch.at(-1).id;
        }
      }
      return result;
    }
    async loadHistory(table,offset=0,limit=100) {
      const spec=tableSpecs.find(([name])=>name===table) ||
        (table==='academic_attempts'?['academic_attempts','attempt_id']:null);
      if (!this.user || !['study_sessions','error_records','academic_attempts'].includes(table) || !spec)
        throw new Error('invalid_history_request');
      return this.call(this.client.from(table).select(`${spec[1]},data,updated_at`)
        .order('updated_at',{ascending:false}).range(offset,offset+Math.min(250,limit)-1));
    }
    async studySummary() {
      if(!this.user)return null;
      return this.call(this.client.rpc('study_summary'));
    }
    async pull() {
      if (!this.user) return;
      const userId = this.user.id;
      try {
        const metadata=await this.call(this.client.from('sync_metadata')
          .select('schema_version,migration_version,cloud_migration_completed').single());
        this.cloudSchemaVersion=metadata.schema_version;
        if(Number(metadata.schema_version)>19) throw new Error('schema_newer_than_client');
        if(Number(metadata.schema_version)<19) throw new Error('schema_older_than_client');
        const cursor=storage.read(this.cursorKey,null);
        const watermark=await this.call(this.client.rpc('sync_watermark'));
        const rows=await this.readRows(cursor,watermark);
        if (this.user?.id !== userId) return;
        const pending = storage.read(this.outboxKey, []);
        // Keep the full V12 shadow on upgrade: the bounded V13 bootstrap must not
        // discard older sessions already available in that device's cache.
        const shadow=storage.read(this.shadowKey,{});
        const pristineAccount=rows.length===0 && Object.keys(shadow).length===0 && pending.length===0;
        for(const row of rows) shadow[row.key]={data:row.data,updated_at:row.updated_at};
        storage.write(this.shadowKey, shadow);
        const safeRows=Object.entries(shadow).map(([key,value])=>{
          const [table,kind,...parts]=key.split(':');
          return {table,kind,id:parts.join(':'),key,...value};
        });
        for (const item of pending) {
          const index = safeRows.findIndex(row => row.key === item.key);
          if (index >= 0) safeRows[index] = item; else safeRows.push(item);
        }
        const base = this.callbacks.getDefault();
        const next = applyRows(base,safeRows);
        // Una cuenta nueva recibe la programación inicial. Una cuenta ya usada
        // nunca se repuebla: sus eliminaciones y ediciones pertenecen al usuario.
        if (pristineAccount) next.events=clone(base.events || []);
        const [balance, inventory, catalog, reservations] = await Promise.all([
          this.call(this.client.rpc('currency_balance')),
          this.call(this.client.from('user_inventory').select('cosmetic_id')),
          this.catalog ? Promise.resolve(this.catalog) : this.call(this.client.from('cosmetics')
            .select('cosmetic_id,name,price,slot,rarity,active')),
          this.call(this.client.from('reward_reservations')
            .select('concept_id,rank,reward_tier,achieved_at,status'))
        ]);
        if (this.user?.id !== userId) return;
        this.balance = Number(balance)||0;
        this.inventory = inventory.map(item=>item.cosmetic_id);
        this.catalog=catalog;
        this.reservations=reservations||[];
        next.coins = this.balance; next.inventory = this.inventory;
        this.lastCloudSnapshot=clone(next);
        storage.write(this.cacheKey,next);
        if(watermark) storage.write(this.cursorKey,watermark);
        this.callbacks.onState(next,{cached:false});
        this.status = pending.length ? 'pending' : 'synced';
        this.lastSync = new Date().toISOString();
        this.retryDelay = 2000; this.notify();
        if (pristineAccount) this.save(next);
        this.client.from('profiles').update({
          timezone:Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago'
        }).eq('user_id',userId).then(()=>{}).catch(()=>{});
        if (pending.length) await this.sync();
      } catch(error) { this.failure(error); }
    }
    save(state) {
      if (!this.user) return;
      const userId = this.user.id;
      const snapshot = clone(state);
      snapshot.coins = this.balance; snapshot.inventory = [...this.inventory];
      storage.write(this.cacheKey,snapshot);
      const shadow = storage.read(this.shadowKey,{});
      const current = rowsFromState(snapshot);
      const currentKeys = new Set(current.map(row=>row.key));
      const pending = new Map(storage.read(this.outboxKey,[]).map(row=>[row.key,row]));
      for (const row of current) {
        if (JSON.stringify(row.data) !== JSON.stringify(shadow[row.key]?.data)) {
          pending.set(row.key,{...row, expected:pending.get(row.key)?.expected ?? shadow[row.key]?.updated_at ?? null});
        } else pending.delete(row.key);
      }
      for (const [key,prior] of Object.entries(shadow)) if (!currentKeys.has(key) && !pending.has(key)) {
        const [table,kind,...idParts] = key.split(':');
        const id=idParts.join(':');
        pending.set(key,{table,kind,id,key,data:{_deleted:true},expected:prior.updated_at});
      }
      if (this.user?.id !== userId) return;
      storage.write(this.outboxKey,[...pending.values()]);
      if (pending.size) { this.status='pending'; this.notify(); clearTimeout(this.queueTimer); this.queueTimer=setTimeout(()=>this.sync().catch(()=>{}),700); }
    }
    async sync() {
      if (this.running) return this.activeSync;
      if (!this.user || !this.client || !navigator.onLine) return;
      this.activeSync=this.performSync();
      return this.activeSync;
    }
    async performSync() {
      this.running = true; this.status='syncing'; this.notify();
      const userId = this.user.id;
      try {
        const queue = storage.read(this.outboxKey,[]);
        for (const row of queue) {
          if (this.user?.id !== userId) break;
          if (this.conflicts.some(item=>item.key===row.key)) continue;
          // La sesión premiada es propiedad del servidor; nunca se sobrescribe desde el cliente.
          if (row.table==='study_sessions' && row.data?.source==='server_timer') {
            this.removePending(row); continue;
          }
          const params = row.table === 'user_documents'
            ? {p_kind:row.kind,p_key:row.id,p_data:row.data,p_expected:row.expected}
            : {p_table:row.table,p_key:row.id,p_data:row.data,p_expected:row.expected};
          const academicRecord = ['academic_attempts','academic_evidence','academic_reviews',
            'academic_errors','academic_sources'].includes(row.table);
          const fn = row.table === 'user_documents' ? 'apply_document_change' :
            academicRecord ? 'apply_academic_change' : 'apply_sync_change';
          const {data,error} = await this.client.rpc(fn,params);
          if (error) {
            if (/sync_conflict|immutable_academic_record|duplicate key/i.test(error.message)) {
              let query=this.client.from(row.table).select('*')
                .eq(row.table==='user_documents'?'document_id':tableSpecs.find(s=>s[0]===row.table)[1],row.id);
              if (row.kind) query=query.eq('kind',row.kind);
              const remote = await this.call(query); // user_id queda protegido por RLS
              const value = remote.find(x=>!row.kind || x.kind===row.kind);
              const conflict = {key:row.key,local:row.data,remote:value?.data || null,
                remoteTimestamp:value?.updated_at || null};
              if (!this.conflicts.some(x=>x.key===row.key)) this.conflicts.push(conflict);
              storage.write(`nexo-import-conflicts-v12:${userId}`,this.conflicts);
              const record=await this.call(this.client.from('sync_conflicts').insert({
                user_id:userId,entity_type:row.table,entity_id:row.id,
                local_data:row.data,remote_data:value?.data || {}
              }).select('conflict_id').single());
              conflict.conflictId=record.conflict_id;
              storage.write(`nexo-import-conflicts-v12:${userId}`,this.conflicts);
              continue;
            }
            throw error;
          }
          const shadow = storage.read(this.shadowKey,{});
          shadow[row.key] = {data:row.data,updated_at:data};
          storage.write(this.shadowKey,shadow);
          this.removePending(row);
        }
        await this.syncVerifiedCases();
        this.status=this.conflicts.length?'conflict':storage.read(this.outboxKey,[]).length?'pending':'synced';
        this.lastSync=new Date().toISOString(); this.retryDelay=2000; this.lastError=''; this.notify();
        this.client.from('sync_metadata').update({
          client_version:'1.0.0',last_sync_at:this.lastSync
        }).eq('user_id',userId).then(({error})=>{if(error) this.lastError=safeError(error);})
          .catch(()=>{});
      } catch(error) { this.failure(error); }
      finally { this.running=false; }
    }
    removePending(row) {
      const remaining=storage.read(this.outboxKey,[]).filter(item=>item.key!==row.key ||
        JSON.stringify(item.data)!==JSON.stringify(row.data));
      storage.write(this.outboxKey,remaining);
    }
    async syncVerifiedCases() {
      if(!this.user||!this.client)return;
      const userId=this.user.id,key=`nexo-verified-case-sent-v1:${userId}`;
      const sent=new Set(storage.read(key,[]));
      const attempts=this.callbacks?.getCurrent?.()?.academicIntelligence?.attempts||[];
      let changed=false;
      for(const attempt of attempts) {
        const caseId=String(attempt.exerciseId||'').replace(/^org-01:/,'');
        if(!caseId.startsWith('sv-')||!attempt.structuredAnswers||sent.has(attempt.id))continue;
        if(this.user?.id!==userId)break;
        await this.call(this.client.rpc('submit_verified_case',{
          p_attempt_id:attempt.id,p_case_id:caseId,p_answers:attempt.structuredAnswers,
          p_independent:!attempt.assistanceUsed,p_reviewed:Boolean(attempt.reviewed)
        }));
        sent.add(attempt.id);storage.write(key,[...sent]);changed=true;
      }
      if(changed)this.reservations=await this.call(this.client.from('reward_reservations')
        .select('concept_id,rank,reward_tier,achieved_at,status'));
    }
    async startAcademicFocus(conceptId) {
      if(!this.user||!this.client||!navigator.onLine)return null;
      return this.call(this.client.rpc('start_academic_focus',{p_concept:conceptId}));
    }
    async pingAcademicFocus(id) {
      if(!this.user||!this.client||!navigator.onLine||!id)return false;
      return this.call(this.client.rpc('ping_academic_focus',{p_focus_id:id}));
    }
    async finishAcademicFocus(id) {
      if(!this.user||!this.client||!navigator.onLine||!id)return null;
      const result=await this.call(this.client.rpc('finish_academic_focus',{p_focus_id:id}));
      this.reservations=await this.call(this.client.from('reward_reservations')
        .select('concept_id,rank,reward_tier,achieved_at,status'));
      return result;
    }
    async signInWithGoogle() {
      if (!this.client || !this.googleOAuthEnabled) throw new Error('cloud_unconfigured');
      sessionStorage.setItem('nexo-google-return','profile/settings');
      try {
        await this.call(this.client.auth.signInWithOAuth({provider:'google',
          options:{redirectTo:location.origin+location.pathname}}));
      } catch (error) {
        sessionStorage.removeItem('nexo-google-return');
        throw error;
      }
    }
    async signOut() {
      if (!this.client) return;
      await this.call(this.client.auth.signOut());
      this.user=null; this.reservations=[]; this.status='guest'; this.analytics?.reset?.(); this.callbacks.onGuest();
      await this.analyticsConsent(Boolean(this.callbacks?.getCurrent?.()?.settings?.analytics)); this.notify();
    }
    async claimGuest(guest) {
      if (this.claimPromise) return this.claimPromise;
      this.claimPromise=this.performClaimGuest(guest);
      try { return await this.claimPromise; }
      finally { this.claimPromise=null; }
    }
    async performClaimGuest(guest) {
      if (!this.user) throw new Error('auth_required');
      const marker=`nexo-guest-migration-v12:${this.user.id}`;
      if (storage.read(marker,false)) return;
      const snapshot=clone(guest);
      // Nunca confiar en saldo o inventario local como permiso monetario.
      await this.call(this.client.rpc('archive_legacy_economy',{p_legacy:{
        coins:snapshot.coins,inventory:snapshot.inventory,boosts:snapshot.boosts
      }}));
      snapshot.coins=this.balance; snapshot.inventory=this.inventory;
      await this.importAcademic(snapshot);
      await this.sync();
      if (storage.read(this.outboxKey,[]).length) throw new Error('sync_conflict');
      await this.call(this.client.rpc('complete_cloud_migration'));
      storage.write(marker,true);
      this.callbacks.onState(this.callbacks.getCurrent(),{cached:false});
    }
    async importAcademic(source) {
      if (!this.user) throw new Error('auth_required');
      const current=this.callbacks.getCurrent();
      const {merged,conflicts}=mergeAcademic(source,current);
      if (conflicts.length) {
        this.conflicts.push(...conflicts.filter(x=>!this.conflicts.some(y=>y.key===x.key)));
        // Archivo local previo a cualquier envío; nunca se borra la fuente importada.
        storage.write(`nexo-import-conflicts-v12:${this.user.id}`,this.conflicts);
      }
      this.callbacks.onState(merged,{cached:true});
      this.save(merged);
      await this.sync();
    }
    async resolveConflict(key,choice) {
      if (!this.user || !['cloud','local'].includes(choice)) throw new Error('invalid_resolution');
      const conflict=this.conflicts.find(item=>item.key===key);
      if (!conflict) return;
      const alias={sessions:'study_sessions',events:'academic_events',errors:'error_records',
        mastery:'lesson_progress',practice:'exercise_progress',grades:'grade_plans',
        guides:'user_documents',exams:'user_documents',labs:'user_documents',
        organicProgress:'user_documents',academicReviews:'academic_reviews'};
      const kindAlias={guides:'guide',exams:'exam',labs:'lab',organicProgress:'organic_progress'};
      const pending=storage.read(this.outboxKey,[]);
      let row=pending.find(item=>item.key===key);
      if (!row && choice==='local') {
        const [name,...idParts]=key.split(':');const id=idParts.join(':');
        const table=alias[name],kind=kindAlias[name]||'';
        if (!table) throw new Error('unsupported_resolution');
        const recordId=name==='organicProgress'?'current':id;
        const recordKey=rowKey(table,recordId,kind);
        const value=name==='organicProgress'
          ? {...(this.callbacks.getCurrent().organicProgress||{}),[id]:conflict.local}:conflict.local;
        row={table,kind,id:recordId,key:recordKey,data:kind?{value}:value,
          expected:storage.read(this.shadowKey,{})[recordKey]?.updated_at||null};
        pending.push(row);
      }
      if (row) {
        const updated=pending.filter(item=>item.key!==row.key);
        if (choice==='local') {
          row.expected=conflict.remoteTimestamp||storage.read(this.shadowKey,{})[row.key]?.updated_at||null;
          updated.push(row);
        }
        storage.write(this.outboxKey,updated);
      }
      this.conflicts=this.conflicts.filter(item=>item.key!==key);
      try {
        await this.sync();
        if (choice==='local' && storage.read(this.outboxKey,[]).some(item=>item.key===(row?.key||key)))
          throw new Error('sync_conflict');
        if (conflict.conflictId) await this.call(this.client.rpc('resolve_sync_conflict',{
          p_conflict_id:conflict.conflictId,p_resolution:choice
        }));
      } catch (error) {
        this.conflicts.push(conflict);
        storage.write(`nexo-import-conflicts-v12:${this.user.id}`,this.conflicts);
        throw error;
      }
      const archived=storage.read(`nexo-resolved-conflicts-v12:${this.user.id}`,[]);
      archived.push({...conflict,resolution:choice,resolvedAt:new Date().toISOString()});
      storage.write(`nexo-resolved-conflicts-v12:${this.user.id}`,archived);
      storage.write(`nexo-import-conflicts-v12:${this.user.id}`,this.conflicts);
      await this.pull();
    }
    async purchase(id) {
      if (!this.user) throw new Error('auth_required');
      const balance=await this.call(this.client.rpc('purchase_cosmetic',{p_cosmetic_id:id}));
      this.balance=Number(balance); this.inventory=[...new Set([...this.inventory,id])];
      await this.pull();
      return this.balance;
    }
    async startTimer(subject) { return this.call(this.client.rpc('start_study_timer',{p_subject_id:subject})); }
    async pauseTimer(id) { return this.call(this.client.rpc('pause_study_timer',{p_timer_id:id})); }
    async resumeTimer(id) { return this.call(this.client.rpc('resume_study_timer',{p_timer_id:id})); }
    async cancelTimer(id) { return this.call(this.client.rpc('cancel_study_timer',{p_timer_id:id})); }
    async finishTimer(id) {
      const result=await this.call(this.client.rpc('finish_study_timer',{p_timer_id:id}));
      this.balance=Number(result.balance); await this.pull(); return result;
    }
    async deleteAccount() {
      const oldId=this.user?.id;
      await this.call(this.client.rpc('delete_my_account'));
      try { await this.client.auth.signOut({scope:'local'}); }
      catch (_) { /* El usuario del servidor ya fue eliminado; la sesión se invalidará al expirar. */ }
      if (oldId) for (const key of ['nexo-cloud-cache-v12','nexo-cloud-outbox-v12',
        'nexo-cloud-shadow-v12','nexo-cloud-cursor-v13','nexo-import-conflicts-v12','nexo-guest-migration-v12',
        'nexo-verified-case-sent-v1'])
        localStorage.removeItem(`${key}:${oldId}`);
      this.user=null; this.reservations=[]; this.analytics?.reset?.(); this.callbacks.onGuest();
      await this.analyticsConsent(Boolean(this.callbacks?.getCurrent?.()?.settings?.analytics)); this.notify();
    }
    async exportAccountData(state) {
      const snapshot=clone(state);
      if (!this.user || !this.client) return snapshot;
      const [profile,inventory,conflicts]=await Promise.all([
        this.call(this.client.from('profiles').select('legacy_economy,timezone').single()),
        this.call(this.client.from('user_inventory').select('cosmetic_id,acquired_at')),
        this.call(this.client.from('sync_conflicts').select('*'))
      ]);
      const transactions=[];
      for(let offset=0;;offset+=250) {
        const batch=await this.call(this.client.from('currency_transactions').select('*')
          .order('created_at',{ascending:false}).range(offset,offset+249));
        transactions.push(...batch); if(batch.length<250)break;
      }
      snapshot._cloudExport={
        schemaVersion:12,userId:this.user.id,exportedAt:new Date().toISOString(),
        legacyEconomy:profile.legacy_economy,timezone:profile.timezone,
        inventory,transactions,conflicts,
        localConflicts:clone(this.conflicts)
      };
      return snapshot;
    }
    async analyticsConsent(enabled) {
      this.analyticsAllowed=Boolean(enabled && config.posthogKey);
      if (!enabled || !config.posthogKey) { this.analytics?.opt_out_capturing?.(); return; }
      if (this.analytics) { this.analytics.opt_in_capturing?.(); if (this.user) this.analytics.identify(this.user.id); return; }
      try {
        if (!window.posthog) await loadScript('./vendor/posthog/array.js');
        this.analytics=window.posthog;
        this.analytics.init(config.posthogKey,{api_host:config.posthogHost||'https://us.i.posthog.com',
          autocapture:false,capture_pageview:false,capture_pageleave:false,disable_session_recording:true,
          persistence:'localStorage',person_profiles:'never',mask_all_text:true,
          loaded:client=>{ if(this.analyticsAllowed) {client.opt_in_capturing();client.capture('app_opened');}
            else client.opt_out_capturing(); }});
        if (this.user) this.analytics.identify(this.user.id);
      } catch (_) { /* Analytics nunca bloquea Nexo. */ }
    }
    track(name,props={}) {
      const allowed=new Set(['app_opened','lesson_started','lesson_completed','exercise_attempted','exercise_failed',
        'hint_requested','review_started','review_completed','mastery_achieved','study_session_started',
        'study_session_completed','calendar_opened','shop_opened','cosmetic_previewed','cosmetic_purchased',
        'cosmetic_equipped','app_error','concept_viewed','concept_state_changed','problem_family_attempted',
        'misconception_detected','prerequisite_suspected','prerequisite_confirmed','review_scheduled',
        'review_completed','source_opened','misconception_resolved']);
      if (!allowed.has(name) || !this.analytics || !this.analyticsAllowed) return;
      const clean={};
      for (const key of ['lesson_id','exercise_id','concept_id','family_id','misconception_id',
        'source_id','state','correct','attempt','subject_id','cosmetic_id','seconds']) {
        if (props[key]!==undefined && ['boolean','number','string'].includes(typeof props[key]))
          clean[key]=typeof props[key]==='string'?props[key].slice(0,80):props[key];
      }
      try { this.analytics.capture(name,clean); } catch (_) {}
    }
    flag(key) { return ['learning_engine_v2','new_shop','new_avatar_renderer'].includes(key)
      ? Boolean(this.analytics?.isFeatureEnabled?.(key)) : false; }
  }
  window.NexoCloud = new CloudFoundation();
  window.NexoCloudSafeError=safeError;
  if (window.NEXO_TEST_MODE) window.NexoCloudTest={rowsFromState,applyRows,mergeAcademic};
})();

;

/* core/storage.js */
/* V11: única frontera de persistencia local. Sustituible por una implementación remota. */
(() => {
  'use strict';
  const KEY = 'nexo-study-beta';
  const BACKUP = 'nexo-study-beta-backup';
  const PRE_V11 = 'nexo-study-beta-pre-v11';
  const PRE_V12 = 'nexo-study-beta-pre-v12';
  const PRE_V13 = 'nexo-study-beta-pre-v13';
  const PRE_V14 = 'nexo-study-beta-pre-v14';
  let pending = null;
  let pendingBackup = false;
  let timer = null;
  let errorHandler = null;

  function flush() {
    if (!pending) return true;
    clearTimeout(timer);
    timer = null;
    const value = pending;
    const backup = pendingBackup;
    try {
      const previous = localStorage.getItem(KEY);
      if (backup && previous) {
        JSON.parse(previous);
        localStorage.setItem(BACKUP, previous);
        value.meta.lastBackupAt = new Date().toISOString();
      }
      localStorage.setItem(KEY, JSON.stringify(value));
      pending = null;
      pendingBackup = false;
      return true;
    } catch (error) {
      errorHandler?.(error);
      return false;
    }
  }

  function schedule(value, { backup = true } = {}) {
    pending = value;
    pendingBackup ||= backup;
    if (backup) flush();
    else {
      clearTimeout(timer);
      timer = setTimeout(flush, 250);
    }
  }

  function getItem(key) { flush(); try { return localStorage.getItem(key); } catch (error) { errorHandler?.(error); return null; } }
  function setItem(key, value) { flush(); localStorage.setItem(key, value); }
  function preserveBeforeMigration(raw) {
    try { if (raw && !localStorage.getItem(PRE_V11)) localStorage.setItem(PRE_V11, raw); }
    catch (error) { errorHandler?.(error); }
  }
  function preserveBeforeV12(raw) {
    try { if (raw && !localStorage.getItem(PRE_V12)) localStorage.setItem(PRE_V12,raw); }
    catch (error) { errorHandler?.(error); }
  }
  function preserveBeforeV13(raw) {
    try { if (raw && !localStorage.getItem(PRE_V13)) localStorage.setItem(PRE_V13,raw); }
    catch (error) { errorHandler?.(error); }
  }
  function preserveBeforeV14(raw) {
    try { if (raw && !localStorage.getItem(PRE_V14)) localStorage.setItem(PRE_V14,raw); }
    catch (error) { errorHandler?.(error); }
  }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  window.NexoStorage = { KEY, BACKUP, PRE_V11, PRE_V12, PRE_V13, PRE_V14, getItem, setItem, schedule, flush,
    preserveBeforeMigration, preserveBeforeV12, preserveBeforeV13, preserveBeforeV14,
    onError(handler) { errorHandler = handler; } };
})();

;

/* core/migrations.js */
/* Las migraciones son explícitas y nunca borran el guardado fuente. */
(() => {
  'use strict';
  function migrate(input, targetVersion = 18) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
    const next = { ...input };
    if ((Number(next.version) || 0) < 16) {
      // El sistema de vidas y el duelo no participan en la economía académica.
      delete next.hearts;
      delete next.heartChallenge;
      delete next.duel;
    }
    if ((Number(next.version) || 0) < 17) {
      next.meta = { ...(next.meta || {}), migrationVersion: 12, localSchemaVersion: 17 };
    }
    if ((Number(next.version) || 0) < 18 && targetVersion >= 18) {
      next.meta = { ...(next.meta || {}), migrationVersion: 13, localSchemaVersion: 18 };
      next.settings = { ...(next.settings || {}), musicVolume: Number(next.settings?.musicVolume ?? 0),
        sfxVolume: Number(next.settings?.sfxVolume ?? next.settings?.volume ?? .4) };
    }
    if ((Number(next.version)||0)<19 && targetVersion>=19) {
      next.meta={...(next.meta||{}),migrationVersion:14,localSchemaVersion:19};
      next.academicIntelligence={attempts:[],evidence:[],reviewSchedules:[],structuredErrors:[],
        userSources:[],...(next.academicIntelligence||{})};
      // Old lesson-level mastery and review dates remain authoritative for existing lessons.
    }
    // Conserva el número fuente: normalizeState aún debe aplicar migraciones <14.
    // El normalizador fija targetVersion al finalizar todas las transformaciones.
    return next;
  }
  window.NexoMigrations = { migrate };
})();

;

/* design-system/home-scene.js */
/* UPDATE 01.3 checkpoint 1 — one profile; only the window is a slot/hotspot. */
(() => {
  'use strict';
  const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  const profiles=freeze({
    'refugio-012':{
      sceneId:'refugio-012',referenceWidth:1672,referenceHeight:941,
      backgroundAsset:'assets/home-scenes/refugio-012.png',cleanPlateAsset:null,
      layers:{background:0,ambientBack:1,modularObjects:2,mascotBack:3,mascot:4,mascotFront:5,ambientFront:6,integratedUI:7,hotspots:8},
      slots:[{id:'window',type:'window',zone:'window-area',bounds:[.045,.08,.235,.40],layer:'modularObjects',renderMode:'baked',asset:null,foregroundAsset:null,replacementReady:false}],
      hotspots:[
        {id:'window-focus',slot:'window',inset:[.04,.04,.76,.60],action:'focus-light',accessibleLabel:'Ventana: resaltar suavemente la luz de entrada'},
        // Navegación diegética: cada objeto usa el MISMO router que los botones normales (data-route).
        {id:'staff-shop',bounds:[1078/1672,292/941,62/1672,318/941],action:'route',route:'shop',accessibleLabel:'Báculo estelar: abrir la Tienda'},
        {id:'armchair-profile',bounds:[1255/1672,395/941,240/1672,280/941],action:'route',route:'profile',accessibleLabel:'Sillón: abrir tu Perfil'},
        {id:'map-logbook',bounds:[612/1672,612/941,180/1672,76/941],action:'route',route:'planner',routeSub:'grades',accessibleLabel:'Mapa enrollado: abrir la Bitácora'},
        {id:'parchment-calendar',bounds:[995/1672,278/941,105/1672,125/941],action:'route',route:'planner',routeSub:'calendar',accessibleLabel:'Pergamino de la pared: abrir el calendario'},
        {id:'bookshelf-library',bounds:[1142/1672,205/941,108/1672,370/941],action:'route',route:'learn',routeSub:'library',accessibleLabel:'Estantería: abrir la Biblioteca'},
        {id:'globe-knowledge',bounds:[705/1672,290/941,95/1672,90/941],action:'route',route:'knowledge',accessibleLabel:'Globo dorado: abrir el mapa de conocimiento'},
        {id:'desk-continue',bounds:[30/1672,430/941,205/1672,95/941],action:'continue',accessibleLabel:'Escritorio: continuar estudiando'}
      ],
      mascotAnchors:{
        desk:{zone:'desk-area',bounds:[.025,.46,.345,.18],point:[.205,.55],layer:'mascot',active:true,seat:{width:.12,foot:.89}},
        window:{zone:'window-area',bounds:[.045,.08,.235,.40],point:[.16,.44],layer:'mascotBack',active:false},
        bookshelf:{zone:'bookshelf-area',bounds:[.34,.075,.40,.49],point:[.54,.55],layer:'mascotBack',active:false},
        rest:{zone:'rest-area',bounds:[.76,.42,.225,.33],point:[.87,.70],layer:'mascotBack',active:false}
      },
      ambientLayers:[
        {id:'floor-night',className:'home-light-layer home-floor-night',bounds:[220/1672,600/941,758/1672,341/941],depth:1},
        {id:'map',className:'home-light-layer home-map',bounds:[600/1672,600/941,200/1672,105/941],depth:1},
        {id:'staff',className:'home-light-layer home-staff',bounds:[1050/1672,285/941,120/1672,340/941],depth:1},
        {id:'staff-star',className:'home-light-layer home-staff-star',bounds:[1109.61/1672,324.5/941,28/1672,40/941],depth:1},
        // UPDATE 01.4 — enredaderas que se mecen (tools/home-leaves/build_leaves.py): fondo reconstruido + hojas.
        {id:'leaf-a-plate',className:'home-light-layer home-leaf-plate home-leaf-plate-a',bounds:[858/1672,52/941,77/1672,230/941],depth:1},
        {id:'leaf-b-plate',className:'home-light-layer home-leaf-plate home-leaf-plate-b',bounds:[930/1672,56/941,56/1672,192/941],depth:1},
        {id:'leaf-c-plate',className:'home-light-layer home-leaf-plate home-leaf-plate-c',bounds:[712/1672,36/941,78/1672,132/941],depth:1},
        {id:'leaf-d-plate',className:'home-light-layer home-leaf-plate home-leaf-plate-d',bounds:[1296/1672,116/941,90/1672,84/941],depth:1},
        {id:'leaf-a',className:'home-light-layer home-leaf home-leaf-a',bounds:[858/1672,52/941,77/1672,230/941],depth:1},
        {id:'leaf-b',className:'home-light-layer home-leaf home-leaf-b',bounds:[930/1672,56/941,56/1672,192/941],depth:1},
        {id:'leaf-c',className:'home-light-layer home-leaf home-leaf-c',bounds:[712/1672,36/941,78/1672,132/941],depth:1},
        {id:'leaf-d',className:'home-light-layer home-leaf home-leaf-d',bounds:[1296/1672,116/941,90/1672,84/941],depth:1},
        {id:'view-dawn',className:'home-light-layer home-view-dawn',bounds:[120/1672,85/941,160/1672,320/941],depth:1},
        {id:'view-dusk',className:'home-light-layer home-view-dusk',bounds:[120/1672,85/941,160/1672,320/941],depth:1},
        {id:'view-night',className:'home-light-layer home-view-night',bounds:[120/1672,85/941,160/1672,320/941],depth:1},
        {id:'foliage-back',className:'refuge-foliage',bounds:[0,0,1,1],depth:1},
        {id:'tint-dawn',className:'home-light-layer home-tint-dawn',bounds:[0,0,1,1],depth:1},
        {id:'tint-dusk',className:'home-light-layer home-tint-dusk',bounds:[0,0,1,1],depth:1},
        {id:'tint-night',className:'home-light-layer home-tint-night',bounds:[0,0,1,1],depth:1},
        {id:'lamp-glow',className:'home-light-layer home-lamp-glow',bounds:[0,0,1,1],depth:2},
        {id:'staff-glow',className:'home-light-layer home-staff-glow',bounds:[1097/1672,325/941,54/1672,54/941],depth:2},
        {id:'dust',className:'home-dust',bounds:[.05,.1,.42,.62],depth:3},
        {id:'window-tone',className:'home-window-tone',slot:'window',inset:[.025531914893617,.0375,.817021276595745,.8875],depth:2},
        {id:'light-rays',className:'refuge-light',bounds:[0,0,1,1],depth:3}
      ],
      lightingProfile:{sourceSlot:'window',driver:'NexoAmbientTime',states:['dawn','day','dusk','night'],continuous:true,feedback:{duration:600,peakBrightness:1.12}}
    },
    // 5 oct 2026 — refugio en pixel art (tools/home-pixel/build_refugio.py). 418×235 px de arte ×4.
    // Coordenadas en el mismo sistema 1672×941; por ahora solo tintes de hora (las capas animadas vienen después).
    'refugio-pixel':{
      sceneId:'refugio-pixel',referenceWidth:1672,referenceHeight:941,
      backgroundAsset:'assets/home-scenes/refugio-pixel.png',cleanPlateAsset:null,pixelArt:true,
      layers:{background:0,ambientBack:1,modularObjects:2,mascotBack:3,mascot:4,mascotFront:5,ambientFront:6,integratedUI:7,hotspots:8},
      slots:[{id:'window',type:'window',zone:'window-area',bounds:[72/1672,64/941,280/1672,344/941],layer:'modularObjects',renderMode:'baked',asset:null,foregroundAsset:null,replacementReady:false}],
      hotspots:[
        {id:'window-focus',slot:'window',inset:[.08,.06,.84,.86],action:'focus-light',accessibleLabel:'Ventana: resaltar suavemente la luz de entrada'},
        {id:'staff-shop',bounds:[1160/1672,192/941,112/1672,448/941],action:'route',route:'shop',accessibleLabel:'Báculo estelar: abrir la Tienda'},
        {id:'armchair-profile',bounds:[1264/1672,368/941,264/1672,296/941],action:'route',route:'profile',accessibleLabel:'Sillón: abrir tu Perfil'},
        {id:'map-logbook',bounds:[616/1672,620/941,176/1672,60/941],action:'route',route:'planner',routeSub:'grades',accessibleLabel:'Mapa enrollado: abrir la Bitácora'},
        {id:'parchment-calendar',bounds:[852/1672,172/941,128/1672,188/941],action:'route',route:'planner',routeSub:'calendar',accessibleLabel:'Pergamino de la pared: abrir el calendario'},
        {id:'bookshelf-library',bounds:[408/1672,64/941,272/1672,536/941],action:'route',route:'learn',routeSub:'library',accessibleLabel:'Estantería: abrir la Biblioteca'},
        {id:'globe-knowledge',bounds:[744/1672,328/941,104/1672,128/941],action:'route',route:'knowledge',accessibleLabel:'Globo dorado: abrir el mapa de conocimiento'},
        {id:'desk-continue',bounds:[8/1672,416/941,392/1672,84/941],action:'continue',accessibleLabel:'Escritorio: continuar estudiando'}
      ],
      mascotAnchors:{
        desk:{zone:'desk-area',bounds:[.005,.44,.235,.10],point:[.13,.475],layer:'mascot',active:true,seat:{width:.12,foot:.89}},
        window:{zone:'window-area',bounds:[.043,.068,.168,.366],point:[.12,.41],layer:'mascotBack',active:false},
        bookshelf:{zone:'bookshelf-area',bounds:[.43,.30,.17,.20],point:[.555,.48],layer:'mascotBack',active:false},
        rest:{zone:'rest-area',bounds:[.76,.40,.21,.32],point:[.87,.70],layer:'mascotBack',active:false}
      },
      ambientLayers:[
        {id:'tint-dawn',className:'home-light-layer home-tint-dawn',bounds:[0,0,1,1],depth:1},
        {id:'tint-dusk',className:'home-light-layer home-tint-dusk',bounds:[0,0,1,1],depth:1},
        {id:'tint-night',className:'home-light-layer home-tint-night',bounds:[0,0,1,1],depth:1}
      ],
      lightingProfile:{sourceSlot:'window',driver:'NexoAmbientTime',states:['dawn','day','dusk','night'],continuous:true,feedback:{duration:600,peakBrightness:1.12}}
    }
  });
  // ?scene=refugio-012 abre el arte anterior (respaldo).
  const requestedScene=typeof location!=='undefined'?new URLSearchParams(location.search).get('scene'):null;
  const defaultSceneId=requestedScene&&profiles[requestedScene]?requestedScene:'refugio-pixel';
  function getProfile(id=defaultSceneId) {
    if(!profiles[id])throw new Error('Unknown home scene profile: '+id);
    return profiles[id];
  }
  const geometry=b=>`left:${b[0]*100}%;top:${b[1]*100}%;width:${b[2]*100}%;height:${b[3]*100}%;`;
  function ambientBounds(profile,layer) {
    if(!layer.slot)return layer.bounds;
    const slot=profile.slots.find(item=>item.id===layer.slot);
    const [x,y,w,h]=slot.bounds,[ix,iy,iw,ih]=layer.inset;
    return [x+w*ix,y+h*iy,w*iw,h*ih];
  }
  function replacementReady(profile,slot) {
    return slot.renderMode==='modular'&&slot.replacementReady===true&&Boolean(profile.cleanPlateAsset&&slot.asset);
  }
  function debugEnabled() {return new URLSearchParams(location.search).get('debugScene')==='true';}
  function render(profile=getProfile()) {
    const debug=debugEnabled();
    const ambient=profile.ambientLayers.map(layer=>`<div class="${layer.className} scene-ambient-layer" data-ambient-layer="${layer.id}" style="${geometry(ambientBounds(profile,layer))}--scene-depth:${layer.depth}" aria-hidden="true"></div>`).join('');
    const slots=profile.slots.map(slot=>{
      const ready=replacementReady(profile,slot);
      // A replacement is never painted over an object still baked in the base.
      const image=ready?`<img src="${slot.asset}" alt="" class="scene-object-image">`:'';
      const foreground=ready&&slot.foregroundAsset?`<span class="scene-slot" style="${geometry(slot.bounds)}--scene-depth:${profile.layers.mascotFront}" aria-hidden="true"><img src="${slot.foregroundAsset}" alt="" class="scene-object-foreground"></span>`:'';
      return `<span class="scene-slot" data-scene-slot="${slot.id}" data-replacement-ready="${ready}" style="${geometry(slot.bounds)}--scene-depth:${profile.layers[slot.layer]}" aria-hidden="true">${image}${debug?`<small class="scene-debug-label">slot · ${slot.id} · ${slot.renderMode}</small>`:''}</span>${foreground}`;
    }).join('');
    const hotspots=profile.hotspots.map(h=>{
      const route=h.action==='route'?` data-route="${h.route}"${h.routeSub?` data-route-sub="${h.routeSub}"`:''}`:'';
      const slotRef=h.slot?` data-scene-slot-ref="${h.slot}"`:'';
      return `<button type="button" class="scene-hotspot" data-scene-hotspot="${h.id}" data-scene-action="${h.action}"${slotRef}${route} style="${geometry(ambientBounds(profile,h))}--scene-depth:${profile.layers.hotspots}" aria-label="${h.accessibleLabel}" title="${h.accessibleLabel.split(':')[0]}">${debug?`<small class="scene-debug-label">hotspot · ${h.id}</small>`:''}</button>`;
    }).join('');
    const anchors=debug?Object.entries(profile.mascotAnchors).map(([id,a])=>`<span class="scene-debug-anchor" style="left:${a.point[0]*100}%;top:${a.point[1]*100}%" aria-hidden="true"><small>${id}</small></span>`).join(''):'';
    return {markup:ambient+slots+hotspots+anchors,debug,backgroundAsset:profile.cleanPlateAsset||profile.backgroundAsset};
  }
  function legacyContract(profile=getProfile()) {
    const desk=profile.mascotAnchors.desk;
    const anchors=Object.fromEntries(Object.entries(profile.mascotAnchors).map(([id,a])=>[id==='rest'?'rest-area':id,{...a,selector:`[data-scene-zone="${a.zone}"]`}]));
    return freeze({artSize:[profile.referenceWidth,profile.referenceHeight],layers:{...profile.layers,scene:profile.layers.modularObjects,interactive:profile.layers.hotspots},currentSeat:{zone:desk.zone,x:desk.point[0],y:desk.point[1],...desk.seat},anchors});
  }
  let pulse=null;
  function cleanup() {pulse?.cancel();pulse=null;}
  function activate(id,root,profile=getProfile()) {
    const hotspot=profile.hotspots.find(item=>item.id===id);
    if(hotspot?.action==='continue') {
      // Reutiliza el destino del botón "Abrir mapa de preparación": no se duplica la lógica.
      root.querySelector('.continue-volume .primary-btn')?.click();
      return true;
    }
    if(!hotspot||hotspot.action!=='focus-light')return false;
    cleanup();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduce-motion')||document.body.dataset.nexoAmbientMotion==='reduced')return true;
    const tone=root.querySelector('[data-ambient-layer="window-tone"]');
    if(!tone?.animate)return true;
    const feedback=profile.lightingProfile.feedback;
    pulse=tone.animate([{filter:'brightness(1)'},{filter:`brightness(${feedback.peakBrightness})`,offset:.5},{filter:'brightness(1)'}],{duration:feedback.duration,easing:'ease-in-out'});
    const active=pulse;
    active.finished.then(()=>{if(pulse===active)pulse=null;}).catch(()=>{});
    return true;
  }
  // Móvil: la sala es más ancha que la pantalla y se desliza de lado (CSS en update01.css).
  // Parte mostrando el escritorio y la mascota; el aviso "Desliza" se oculta al primer deslizamiento.
  function enhancePan(root) {
    const pan=root?.querySelector('.home-pan');
    if(!pan)return;
    const hint=root.querySelector('.home-pan-hint');
    const update=()=>{
      const max=pan.scrollWidth-pan.clientWidth;
      pan.dataset.pan=max<=2?'none':pan.scrollLeft<4?'start':pan.scrollLeft>max-4?'end':'mid';
      if(hint)hint.dataset.visible=String(max>2&&pan.dataset.pan==='start'&&!pan.dataset.touched);
    };
    pan.scrollLeft=0;
    pan.addEventListener('scroll',()=>{if(pan.scrollLeft>4)pan.dataset.touched='1';update();},{passive:true});
    update();
  }
  if(typeof matchMedia==='function')matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',cleanup);
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)cleanup();});
  window.NexoHomeScene=Object.freeze({profiles,getProfile,ambientBounds,replacementReady,render,legacyContract,activate,cleanup,enhancePan});
})();

;

/* design-system/rooms.js */
/* One registry for room identity and course accents; UI never guesses a course from a background. */
(() => {
  'use strict';
  const courses = Object.freeze({
    organica: { name: 'Química Orgánica II', accent: '#b76a49', symbol: '⌬', material: 'paper' },
    analitica: { name: 'Química Analítica', accent: '#3d8180', symbol: '◈', material: 'paper' },
    fisico: { name: 'Fisicoquímica II', accent: '#5574ad', symbol: '∿', material: 'paper' },
    fisio: { name: 'Fisiopatología', accent: '#9170a6', symbol: '✚', material: 'paper' }
  });
  const rooms = Object.freeze({
    home: { name: 'Refugio', material: 'wood', accent: '#83a987', art:window.NexoHomeScene.getProfile().backgroundAsset },
    learn: { name: 'Grimorio', material: 'paper', accent: '#d6a85d', art:'assets/rooms/learn.webp' },
    train: { name: 'Taller', material: 'ink', accent: '#d29369', art:'assets/rooms/train.webp' },
    games: { name: 'Arcade', material: 'pixel', accent: '#aa79c7', art:'assets/rooms/games.webp' },
    profile: { name: 'Habitación', material: 'wood', accent: '#b9a587', art:'assets/rooms/profile.webp' },
    shop: { name: 'Mercado', material: 'ink', accent: '#d9ac68' },
    planner: { name: 'Bitácora', material: 'paper', accent: '#76aaa9' }
  });
  const roomRoutes = Object.freeze({
    home:'home', subjects:'learn', subject:'learn', lesson:'learn', learn:'learn',
    library:'learn', knowledge:'learn', inspector:'learn',
    train:'train', practice:'train', reviews:'train', rescue:'train',
    games:'games', profile:'profile', mascot:'profile', stats:'profile',
    settings:'profile', history:'profile', shop:'shop',
    planner:'planner', hub:'planner', timer:'planner'
  });
  function resolve(route) {
    const roomId = roomRoutes[route?.[0]] || 'home';
    const courseId = route?.[0] === 'subject' ? route[1]
      : route?.[0] === 'learn' && route[1] === 'course' ? route[2]
      : null;
    return { id:roomId, ...rooms[roomId], courseId:courses[courseId] ? courseId : null,
      course:courses[courseId] || null };
  }
  function apply(route, element=document.body) {
    const room=resolve(route);
    element.dataset.nexoRoom=room.id;
    element.dataset.nexoMaterial=room.material;
    if(room.courseId)element.dataset.nexoCourse=room.courseId;
    else delete element.dataset.nexoCourse;
    element.style.setProperty('--room-accent',room.course?.accent||room.accent);
    if(room.art)element.style.setProperty('--room-art',`url("${new URL(room.art,document.baseURI).href}")`);
    else element.style.removeProperty('--room-art');
    return room;
  }
  // Compatibility view derived from the scene profile, never a second geometry registry.
  const homeScene=window.NexoHomeScene.legacyContract();
  window.NexoRooms=Object.freeze({ courses, rooms, homeScene, resolve, apply });
})();

;

/* design-system/preparation.js */
/* Read-only projection of existing PEP catalog and calendar. No academic state writes. */
(() => {
  'use strict';
  const examTypes = ['exam','Prueba','control'];
  // Deliberately strict: a Control 1 is not PEP 1, nor is a vaguely named event.
  const pepNumber = name => String(name || '').match(/^PEP\s+(\d+)(?:\s*[·:–—-].*)?$/i)?.[1] || null;
  function evaluations(subject, events = []) {
    const candidates = events.filter(event => event.subject === subject.id && examTypes.includes(event.type));
    const matched = new Set();
    const chapters = subject.peps.map((pep,index) => {
      const number = pepNumber(pep.name);
      const dates = number ? candidates.filter(event => pepNumber(event.title) === number) : [];
      dates.forEach(event => matched.add(event.id));
      return { id:`pep-${index+1}`, name:pep.name, lessons:[...pep.lessons], events:dates,
        source:'catalog', kind:number?'Evaluación':'Bloque del catálogo' };
    });
    return [...chapters, ...candidates.filter(event => !matched.has(event.id)).map(event => ({
      id:`event-${event.id}`, name:event.title, lessons:[], events:[event], source:'calendar', kind:'Evaluación del calendario'
    }))];
  }
  // Coordinates stay proportional; text uses normal CSS flow, never SVG text.
  function layout(count) {
    const positions=[22,50,78,68,38,22];
    return Array.from({length:count},(_,index)=>({x:positions[index%positions.length],y:90+index*140}));
  }
  window.NexoPreparation=Object.freeze({evaluations,layout});
})();

;

/* ambient/time.js */
/* Ambient light follows local time with a five-minute update, never a permanent RAF loop. */
(() => {
  'use strict';
  const stops=[
    [0,[24,33,49]],[5,[36,46,64]],[7,[116,108,94]],
    [10,[146,160,146]],[16,[151,155,132]],[18,[173,122,101]],
    [20,[76,67,81]],[24,[24,33,49]]
  ];
  let interval=null;
  const mix=(a,b,t)=>a.map((value,index)=>Math.round(value+(b[index]-value)*t));
  function colorAt(hour) {
    const h=((Number(hour)||0)%24+24)%24;
    for(let i=1;i<stops.length;i+=1)if(h<=stops[i][0]) {
      const [start,a]=stops[i-1], [end,b]=stops[i];
      return mix(a,b,(h-start)/(end-start));
    }
    return stops[0][1];
  }
  // Pesos de luz continuos (suman 1). La sala pasa de una luz a otra sin saltos.
  const lightKeys=[[0,'night'],[5,'night'],[6.5,'dawn'],[9,'day'],[16.5,'day'],[18.5,'dusk'],[20.5,'night'],[24,'night']];
  function weightsAt(hour) {
    const h=((Number(hour)||0)%24+24)%24, w={dawn:0,day:0,dusk:0,night:0};
    for(let i=1;i<lightKeys.length;i+=1)if(h<=lightKeys[i][0]) {
      const [start,a]=lightKeys[i-1], [end,b]=lightKeys[i], t=(h-start)/(end-start);
      w[a]+=1-t; w[b]+=t; return w;
    }
    w.night=1; return w;
  }
  function applyHour(hour) {
    const [r,g,b]=colorAt(hour), w=weightsAt(hour), style=document.body.style;
    style.setProperty('--ambient-rgb',`${r} ${g} ${b}`);
    Object.entries(w).forEach(([key,value])=>style.setProperty(`--w-${key}`,value.toFixed(3)));
    document.body.dataset.nexoTime=hour<6?'night':hour<10?'morning':hour<17?'day':hour<20?'dusk':'night';
    document.body.dataset.nexoHour=(((Number(hour)||0)%24+24)%24).toFixed(2); // la Torre del Sauce lee la hora de aquí
  }
  function update(at=new Date()) {
    if(previewing)return;
    applyHour(at.getHours()+at.getMinutes()/60);
    document.body.classList.toggle('ambient-paused',document.hidden);
  }
  // Vista previa para probar la luz sin esperar: preview(22) salta con fundido corto;
  // timelapse() recorre 24 h en ~40 s. stopPreview() vuelve a la hora real.
  let previewing=false, previewTimer=null;
  function preview(hour) {
    stopPreview(); previewing=true; document.body.classList.add('ambient-preview'); applyHour(hour);
  }
  function timelapse(seconds=40,from=new Date().getHours()) {
    stopPreview(); previewing=true; document.body.classList.add('ambient-preview','ambient-timelapse');
    const started=performance.now(), tick=()=>{
      const p=(performance.now()-started)/(seconds*1000);
      if(p>=1){stopPreview();return;}
      applyHour((from+p*24)%24); previewTimer=setTimeout(tick,250);
    };
    tick();
  }
  function stopPreview() {
    if(previewTimer)clearTimeout(previewTimer); previewTimer=null; previewing=false;
    document.body.classList.remove('ambient-preview','ambient-timelapse'); update();
  }
  function start() {
    if(interval)return;
    update();
    // Primera pintura sin fundido; desde ahí, cada cambio de luz se funde durante 5 min.
    requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.add('ambient-live')));
    interval=setInterval(()=>{if(!document.hidden)update();},300000);
    document.addEventListener('visibilitychange',()=>update());
  }
  window.NexoAmbientTime=Object.freeze({colorAt,weightsAt,update,start,preview,timelapse,stopPreview});
})();

;

/* ambient/events.js */
/* Deterministic, lightweight environmental moments. No timer per room. */
(() => {
  'use strict';
  const scenes=Object.freeze({
    home:[['leaves','watch'],['book','read'],['lamp','rest']],
    learn:[['book','read'],['ink','think']],
    train:[['shield','ready'],['rune','ready']],
    games:[['spark','play']],
    profile:[['lamp','rest'],['book','read'],['sleep','sleep']],
    shop:[['spark','preview']],
    planner:[['ink','watch'],['book','read']]
  });
  let current=null,interval=null,profile='local',room='home';
  function hash(value) {let out=2166136261;for(const char of String(value)){
    out^=char.charCodeAt(0);out=Math.imul(out,16777619);
  }return out>>>0;}
  function localDay(at) {return `${at.getFullYear()}-${String(at.getMonth()+1).padStart(2,'0')}-${String(at.getDate()).padStart(2,'0')}`;}
  function select({at=new Date(),room:requested='home',profileId='local'}={}) {
    const variants=scenes[requested]||scenes.home;
    const block=Math.floor(at.getHours()/3);
    const [prop,intent]=variants[hash(`${localDay(at)}|${requested}|${profileId}|${block}`)%variants.length];
    const night=at.getHours()<6||at.getHours()>=22;
    if(night&&['home','profile'].includes(requested))return {room:requested,prop:'sleep',intent:'sleep',block};
    return {room:requested,prop,intent,block};
  }
  function apply(nextRoom=room,profileId=profile,at=new Date()) {
    room=nextRoom;profile=profileId;
    current=select({at,room,profileId});
    document.body.dataset.nexoAmbientEvent=current.prop;
    document.body.dataset.nexoMascotActivity=current.intent;
    return current;
  }
  function refresh() {if(!document.hidden)apply(room,profile);}
  function start() {
    if(interval)return;
    interval=setInterval(refresh,300000);
    document.addEventListener('visibilitychange',refresh);
  }
  function dispose() {
    if(interval)clearInterval(interval);interval=null;
    document.removeEventListener('visibilitychange',refresh);
    current=null;
  }
  window.NexoAmbientEvents=Object.freeze({scenes,select,apply,start,dispose,get current(){return current;}});
})();

;

/* planner/priority.js */
/* Bitácora 1.0: orden explicable, sin inferir dominio desde minutos estudiados. */
(() => {
  'use strict';

  const DAY = 86400000;
  const validDay = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) &&
    !Number.isNaN(new Date(`${value}T12:00:00`).getTime()) &&
    new Date(`${value}T12:00:00`).toISOString().slice(0, 10) === value;
  const daysUntil = (now, date) => Math.round((new Date(`${date}T12:00:00`) - new Date(`${now}T12:00:00`)) / DAY);
  const number = (value, max) => Math.min(max, Math.max(0, Number(value) || 0));
  function target(event, now) {
    if (event.type !== 'lab') return { date: event.date, stage: '' };
    const prelab = event.lab?.prelab;
    const report = event.lab?.after;
    if (!prelab?.done && validDay(prelab?.dueDate) && prelab.dueDate <= event.date)
      return { date: prelab.dueDate, stage: 'Pre-lab' };
    if (now >= event.date && !report?.reportDone && validDay(report?.reportDueDate))
      return { date: report.reportDueDate, stage: 'Informe' };
    return { date: event.date, stage: '' };
  }

  function rank(events, context = {}) {
    const current = new Date();
    const localToday = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
    const now = validDay(context.today) ? context.today : localToday;
    const weaknesses = context.weaknesses || {};
    const prerequisites = context.prerequisites || {};
    const loadByDay = new Map();
    for (const event of events || []) {
      if (validDay(event?.date) && event.status !== 'done') {
        const date = target(event, now).date;
        loadByDay.set(date, (loadByDay.get(date) || 0) + 1);
      }
    }
    return (events || []).filter(event => validDay(event?.date) && event.status !== 'done')
      .filter(event => daysUntil(now, target(event, now).date) >= 0 || !['exam', 'Prueba', 'control'].includes(event.type))
      .map(event => {
        const focus = target(event, now);
        const days = daysUntil(now, focus.date);
        const isLab = event.type === 'lab';
        const weight = number(event.priority ?? (['exam', 'Prueba', 'control'].includes(event.type) ? 3 : 2), 3) || 1;
        const prep = number(event.prepMinutes, 2000);
        const gaps = number(weaknesses[event.subject], 20);
        const prereq = number(prerequisites[event.id], 20);
        const load = loadByDay.get(focus.date) || 1;
        const overdue = days < 0;
        const proximity = overdue ? 34 : days <= 1 ? 32 : days <= 3 ? 25 : days <= 7 ? 18 : days <= 14 ? 10 : 3;
        const score = proximity + weight * 7 + Math.min(16, Math.ceil(prep / 30) * 2) +
          Math.min(14, gaps * 3) + Math.min(9, prereq * 3) + (isLab && prep ? 8 : 0) +
          (load > 1 ? Math.min(8, (load - 1) * 4) : 0);
        const reasons = [];
        if (overdue) reasons.push(`Atrasado ${Math.abs(days)} día${days === -1 ? '' : 's'}`);
        else if (days === 0) reasons.push('Hoy');
        else if (days === 1) reasons.push('Mañana');
        else reasons.push(`En ${days} días`);
        if (focus.stage) reasons.push(focus.stage);
        if (weight === 3) reasons.push('Importancia muy alta');
        else if (weight === 2) reasons.push('Importancia alta');
        if (prep) reasons.push(`${prep} min de preparación pendiente`);
        if (gaps) reasons.push(`${gaps} ${gaps === 1 ? 'error abierto' : 'errores abiertos'} en el ramo`);
        if (prereq) reasons.push(`${prereq} ${prereq === 1 ? 'base pendiente' : 'bases pendientes'}`);
        if (load > 1) reasons.push(`${load} compromisos ese día`);
        return { event, score, reasons, days, targetDate: focus.date, stage: focus.stage };
      })
      .sort((a, b) => b.score - a.score || a.days - b.days || String(a.event.id).localeCompare(String(b.event.id)));
  }

  window.NexoPriority = Object.freeze({ rank, daysUntil });
})();

;

/* planner/labs.js */
(function (root) {
  'use strict';
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) &&
    !Number.isNaN(new Date(`${value}T12:00:00`).getTime()) &&
    new Date(`${value}T12:00:00`).toISOString().slice(0, 10) === value;
  const cleanDate = value => validDate(value) ? value : '';
  const cleanText = (value, max) => String(value || '').trim().slice(0, max);
  function normalize(input) {
    const plan = input && typeof input === 'object' ? input : {};
    return {
      manual: cleanText(plan.manual, 300),
      prelab: { dueDate: cleanDate(plan.prelab?.dueDate), done: plan.prelab?.done === true },
      during: { checklist: Array.isArray(plan.during?.checklist) ? plan.during.checklist.map(item => cleanText(item, 120)).filter(Boolean).slice(0, 8) : [] },
      after: { reportDueDate: cleanDate(plan.after?.reportDueDate), reportDone: plan.after?.reportDone === true }
    };
  }
  function fromForm(formData, previous) {
    const old = normalize(previous);
    const checklist = cleanText(formData.get('labChecklist'), 1000).split(/\r?\n/).map(item => item.trim()).filter(Boolean).slice(0, 8);
    return normalize({
      manual: formData.get('labManual'),
      prelab: { dueDate: formData.get('labPrelabDate'), done: old.prelab.done },
      during: { checklist },
      after: { reportDueDate: formData.get('labReportDate'), reportDone: old.after.reportDone }
    });
  }
  root.NexoLabPlan = Object.freeze({ normalize, fromForm, validDate });
})(typeof window !== 'undefined' ? window : globalThis);

;

/* planner/grades.js */
/* Grade arithmetic. Percentages belong to each academic component, not to the whole course. */
(() => {
  'use strict';
  const decimal=value=>Number(String(value??'').trim().replace(',','.'));
  function calculate(config={},activeGroup='theory') {
    const invalidWeights=[],invalidGrades=[],components=[];
    for(const item of config.components||[]) {
      const rawWeight=String(item.weight??'').trim();
      const weightN=decimal(rawWeight);
      if(rawWeight&&(!Number.isFinite(weightN)||weightN<0||weightN>100)){
        invalidWeights.push(item.name||item.id);continue;
      }
      if(!rawWeight||weightN<=0)continue;
      const raw=String(item.grade??'').trim();
      const number=decimal(raw);
      const gradeN=raw&&Number.isFinite(number)&&number>=1&&number<=7?number:null;
      if(raw&&gradeN===null)invalidGrades.push(item.name||item.id);
      components.push({...item,weightN,gradeN});
    }
    const target=Math.max(4,Math.min(7,decimal(config.target)||4));
    const groupResults=Object.entries(config.groups||{}).map(([id,group])=>{
      const rows=components.filter(item=>item.group===id);
      const totalWeight=rows.reduce((sum,item)=>sum+item.weightN,0);
      const known=rows.filter(item=>item.gradeN!==null);
      const knownWeight=known.reduce((sum,item)=>sum+item.weightN,0);
      const knownPoints=known.reduce((sum,item)=>sum+item.weightN*item.gradeN,0);
      const pendingWeight=totalWeight-knownWeight;
      const minimum=decimal(group.minimum);
      const rawCourseWeight=String(group.courseWeight??'').trim();
      const courseWeight=rawCourseWeight?decimal(rawCourseWeight):null;
      return {id,name:group.name||id,totalWeight,knownWeight,pendingWeight,
        current:knownWeight?knownPoints/knownWeight:null,
        grade:Math.abs(totalWeight-100)<.01&&pendingWeight===0?knownPoints/100:null,
        required:Math.abs(totalWeight-100)<.01&&pendingWeight>0?(target*100-knownPoints)/pendingWeight:null,
        minimum:Number.isFinite(minimum)&&minimum>0?minimum:null,
        courseWeight:courseWeight!==null&&Number.isFinite(courseWeight)&&courseWeight>=0&&courseWeight<=100?courseWeight:null,
        invalidCourseWeight:!!rawCourseWeight&&(!Number.isFinite(courseWeight)||courseWeight<0||courseWeight>100)};
    });
    const active=groupResults.find(group=>group.id===activeGroup)||groupResults[0]||{
      totalWeight:0,knownWeight:0,pendingWeight:0,current:null,grade:null,required:null};
    const configured=groupResults.filter(group=>group.courseWeight!==null);
    const courseWeightTotal=configured.reduce((sum,group)=>sum+group.courseWeight,0);
    const courseGrade=configured.length===groupResults.length&&Math.abs(courseWeightTotal-100)<.01&&
      groupResults.every(group=>group.grade!==null)?
      groupResults.reduce((sum,group)=>sum+group.grade*group.courseWeight,0)/100:null;
    return {components,totalWeight:active.totalWeight,current:active.current,
      projected:active.grade,pendingWeight:active.pendingWeight,required:active.required,
      groupResults,courseWeightTotal,courseGrade,invalidWeights,invalidGrades};
  }
  window.NexoGrades=Object.freeze({calculate});
})();

;

/* study/economy.js */
/* Reglas únicas de recompensas por tiempo; sin estado ni dependencia del DOM. */
(() => {
  'use strict';
  function sessionReward(seconds) {
    const minutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);
    return minutes >= 120 ? 250 : minutes >= 60 ? 100 : minutes >= 30 ? 25 : minutes >= 15 ? 15 : minutes >= 5 ? 3 : 0;
  }
  function sessionXp(seconds) { return Math.min(60, Math.floor(Math.max(0, Number(seconds) || 0) / 300) * 5); }
  window.NexoEconomy = { sessionReward, sessionXp };
})();

;

/* academic/amine-mastery.js */
/* Regla de dominio verificable para la clase de aminas. La autoevaluación no equivale a corrección por IA. */
(() => {
  'use strict';
  const DAY = /^\d{4}-\d{2}-\d{2}$/;
  function eligible(progress, day) {
    return progress?.status === 'inestable'
      && DAY.test(progress.firstAttemptAt || '')
      && DAY.test(day || '')
      && day > progress.firstAttemptAt;
  }
  function canComplete(progress, day) {
    if (!eligible(progress, day)) return false;
    const review = progress.review || {};
    return ['variant', 'transfer'].every(id =>
      (review.answers?.[id] || '').trim().length >= 40
      && review.revealed?.[id] === true
      && review.hinted?.[id] !== true
      && Array.isArray(review.verified?.[id])
      && review.verified[id].length === 3
      && review.verified[id].every(value => value === true)
    );
  }
  window.NexoAmineMastery = { eligible, canComplete };
})();

;

/* academic/active-time.js */
/* Counts visible, non-idle academic activity by concept; never counts Home or the timer UI. */
(() => {
  'use strict';
  const IDLE_AFTER_MS=5*60*1000;
  const TICK_MS=10000;
  let context=null,session=null,interval=null,lastInput=Date.now(),lastTick=Date.now(),tickCount=0,configured=false,scrollHandler=null,focusPromise=null;
  const day=at=>{const d=new Date(at);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  function openFocus() {
    if(!session||document.hidden||focusPromise||!context?.startCloudFocus)return;
    focusPromise=Promise.resolve(context.startCloudFocus(session.conceptId)).catch(()=>null);
  }
  function closeFocus() {
    const prior=focusPromise;focusPromise=null;
    if(prior&&context?.finishCloudFocus)prior.then(id=>id&&context.finishCloudFocus(id)).catch(()=>{});
  }
  const interact=()=>{lastInput=Date.now();if(session&&!document.hidden)openFocus();};
  function configure(api) {
    context=api;
    if(configured)return;
    configured=true;
    for(const event of ['pointerdown','keydown','scroll'])document.addEventListener(event,interact,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){persist();closeFocus();}
      else {lastTick=Date.now();lastInput=Date.now();openFocus();}});
  }
  function tick(at=Date.now()) {
    if(!session)return 0;
    const elapsed=Math.max(0,Math.min(TICK_MS,at-lastTick));
    lastTick=at;
    if(document.hidden||at-lastInput>IDLE_AFTER_MS||!session.conceptId){closeFocus();return 0;}
    session.seconds+=elapsed/1000;
    session.updatedAt=new Date(at).toISOString();
    return elapsed/1000;
  }
  function persist() {
    if(!session||!context||session.seconds<1)return;
    const state=context.getState();
    const academic=state.academicIntelligence;
    academic.activeTimeSegments ||= [];
    const existing=academic.activeTimeSegments.findIndex(item=>item.id===session.id);
    const record={...session,seconds:Math.round(session.seconds)};
    if(existing<0)academic.activeTimeSegments.push(record);
    else academic.activeTimeSegments[existing]=record;
    context.saveState({backup:false});
  }
  function stop() {
    if(interval)clearInterval(interval);
    interval=null;
    if(scrollHandler)window.removeEventListener('scroll',scrollHandler);
    scrollHandler=null;
    tick();persist();closeFocus();session=null;
  }
  function changeConcept(conceptId) {
    if(!session||session.conceptId===conceptId)return;
    tick();persist();closeFocus();
    const now=Date.now();
    session={id:`active-${now}-${Math.random().toString(36).slice(2,9)}`,conceptId,activity:session.activity,
      day:day(now),startedAt:new Date(now).toISOString(),updatedAt:new Date(now).toISOString(),seconds:0};
    lastTick=now;tickCount=0;openFocus();
  }
  function begin(conceptId,activity) {
    if(session?.conceptId===conceptId&&session.activity===activity)return;
    stop();
    if(!conceptId||!['lesson','practice','review','rescue','assessment','material'].includes(activity))return;
    const now=Date.now();
    session={id:`active-${now}-${Math.random().toString(36).slice(2,9)}`,conceptId,activity,
      day:day(now),startedAt:new Date(now).toISOString(),updatedAt:new Date(now).toISOString(),seconds:0};
    lastInput=lastTick=now;
    tickCount=0;
    openFocus();
    interval=setInterval(()=>{const seconds=tick();if(++tickCount%3===0){persist();
      if(seconds>0&&focusPromise&&context?.pingCloudFocus)focusPromise.then(id=>id&&context.pingCloudFocus(id)).catch(()=>{});
    }},TICK_MS);
  }
  function snapshot(conceptId) {
    const segments=context?.getState()?.academicIntelligence?.activeTimeSegments||[];
    const seconds=segments.filter(item=>item.conceptId===conceptId).reduce((sum,item)=>sum+Number(item.seconds||0),0);
    return seconds+(session?.conceptId===conceptId?Math.max(0,session.seconds-(segments.find(item=>item.id===session.id)?.seconds||0)):0);
  }
  function watchHeadings(root) {
    if(scrollHandler)window.removeEventListener('scroll',scrollHandler);
    const headings=[...root.querySelectorAll('h2[data-study-concept]')];
    if(!headings.length)return;
    scrollHandler=()=>{
      const threshold=Math.min(innerHeight*.45,330);
      let selected=headings[0];
      for(const heading of headings)if(heading.getBoundingClientRect().top<=threshold)selected=heading;
      changeConcept(selected.dataset.studyConcept);
    };
    window.addEventListener('scroll',scrollHandler,{passive:true});
    scrollHandler();
  }
  window.NexoActiveStudy=Object.freeze({configure,begin,stop,changeConcept,watchHeadings,tick,snapshot,IDLE_AFTER_MS});
})();

;

/* academic/history.js */
/* V14: paged cloud history; older records stay outside startup state. */
(() => {
  'use strict';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tabs={study_sessions:'Sesiones',error_records:'Errores',academic_attempts:'Intentos'};
  let table='study_sessions',page=0,rows=[],loading=false,error='',identity='',summary=null;
  const size=30;
  let cloud,guest;
  function render(host,service,state) {
    cloud=service;guest=state;
    const id=service.user?.id||'guest';
    if(identity!==id){identity=id;table='study_sessions';page=0;rows=[];summary=null;}
    host.innerHTML=`<section class="page academic-history"><button class="back-btn" data-route="stats">← Estadísticas</button>
      <h1>Historial académico</h1><p>Consulta páginas antiguas cuando las necesites. No se descargan al abrir Nexo.</p>
      <nav class="segmented" aria-label="Tipo de historial">${Object.entries(tabs).map(([key,label])=>
        `<button data-history-tab="${key}" aria-pressed="${table===key}">${label}</button>`).join('')}</nav>
      <p data-history-summary>${summary?`${summary.sessions} sesiones · ${Math.round(summary.seconds/60)} minutos acumulados en la cuenta`:
        service.authenticated?'Resumen de cuenta disponible al cargar':'Historial de este dispositivo'}</p>
      <div data-history-results role="status"></div><div class="button-row">
        <button data-history-page="previous" ${page===0?'disabled':''}>Anterior</button>
        <span>Página ${page+1}</span><button data-history-page="next" ${rows.length<size?'disabled':''}>Siguiente</button></div></section>`;
    display();
    if(service.authenticated && !summary)service.studySummary().then(value=>{
      if(identity===id){summary=value;const node=host.querySelector('[data-history-summary]');
        if(node&&value)node.textContent=`${value.sessions} sesiones · ${Math.round(value.seconds/60)} minutos acumulados en la cuenta`;}
    }).catch(()=>{});
    load();
  }
  function display() {
    const box=document.querySelector('[data-history-results]');if(!box)return;
    if(loading){box.innerHTML='<p>Cargando esta página…</p>';return;}
    if(error){box.innerHTML=`<p>${esc(error)}</p><button data-history-retry>Reintentar</button>`;return;}
    box.innerHTML=rows.length?`<ul class="academic-history-list">${rows.map(item=>{
      const date=item.date||item.created_at||item.attemptedAt||'';
      const detail=table==='study_sessions'?`${Math.round((Number(item.seconds)||0)/60)} min · ${item.subject||'Estudio'}`:
        table==='error_records'?`${item.observable||item.exerciseId||'Error'} · ${item.status||'pendiente'}`:
          `${item.exercise_id||'Ejercicio'} · ${item.outcome||'Intento'}`;
      return `<li><time>${esc(date)}</time><span>${esc(detail)}</span></li>`;
    }).join('')}</ul>`:'<p>No hay registros en esta página.</p>';
    const next=document.querySelector('[data-history-page="next"]');if(next)next.disabled=rows.length<size;
  }
  async function load() {
    const selected=table,selectedPage=page,selectedUser=identity;
    loading=true;error='';display();
    try {
      const batch=cloud.authenticated?await cloud.loadHistory(selected,selectedPage*size,size):
        (selected==='study_sessions'?guest.sessions:selected==='error_records'?guest.errors:
          guest.academicIntelligence?.attempts||[]).slice(selectedPage*size,(selectedPage+1)*size);
      if(identity!==selectedUser||table!==selected||page!==selectedPage)return;
      rows=batch.map(item=>item.data||item);
    } catch {if(identity===selectedUser)error='No pudimos consultar el historial. Inténtalo de nuevo.';}
    finally {if(identity===selectedUser&&table===selected&&page===selectedPage){loading=false;display();}}
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-history-tab],[data-history-page],[data-history-retry]');
    if(!button||!document.querySelector('.academic-history'))return;
    if(button.dataset.historyTab){table=button.dataset.historyTab;page=0;rows=[];load();}
    else if(button.dataset.historyPage){page=Math.max(0,page+(button.dataset.historyPage==='next'?1:-1));rows=[];load();}
    else load();
    const pageNode=document.querySelector('.academic-history .button-row span');
    if(pageNode)pageNode.textContent=`Página ${page+1}`;
    document.querySelectorAll('[data-history-tab]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.historyTab===table)));
    const previous=document.querySelector('[data-history-page="previous"]');if(previous)previous.disabled=page===0;
  });
  window.NexoHistory={render};
})();

;

/* platform/loader.js */
/* Carga compartida de recursos no esenciales, sin bloquear Inicio. */
(() => {
  'use strict';
  const pending = new Map();
  function script(src) {
    if (pending.has(src)) return pending.get(src);
    const promise = new Promise((resolve, reject) => {
      const element = document.createElement('script');
      element.src = src;
      element.async = true;
      element.onload = resolve;
      element.onerror = () => { pending.delete(src); reject(new Error(`No se pudo cargar ${src}`)); };
      document.head.append(element);
    });
    pending.set(src, promise);
    return promise;
  }
  function style(href) {
    if (pending.has(href)) return pending.get(href);
    const promise = new Promise((resolve, reject) => {
      const element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = href;
      element.onload = resolve;
      element.onerror = () => { pending.delete(href); reject(new Error(`No se pudo cargar ${href}`)); };
      document.head.append(element);
    });
    pending.set(href, promise);
    return promise;
  }
  window.NexoLoader = { script, style };
})();

;

/* platform/performance.js */
/* Global graphics profile. Ambient decoration never owns a permanent frame loop. */
(() => {
  'use strict';
  const qualityValues=['auto','low','balanced','high'];
  const particleValues=['none','low','high'];
  const motionValues=['reduced','normal','rich'];
  const mascotValues=['reduced','full'];
  const points=[[13,18],[78,24],[42,12],[88,71],[9,67],[55,78],[28,44],[68,54],[33,88],[93,38]];
  const roomCaps={home:10,learn:2,train:5,games:7,profile:8,shop:5,planner:2};
  let currentSettings={};
  let active=null;
  let started=false;
  const pick=(value,values,fallback)=>values.includes(value)?value:fallback;
  function resolve(settings={},environment={}) {
    const reduced=Boolean(environment.reducedMotion);
    const cores=Number(environment.cores)||4;
    const memory=Number(environment.memory)||4;
    const width=Number(environment.width)||1024;
    const requested=pick(settings.graphicsQuality,qualityValues,'auto');
    const quality=requested==='auto'?(cores<=2||memory<=2||width<380?'low':cores>=8&&memory>=8&&width>=1000?'high':'balanced'):requested;
    const particles=pick(settings.particles,particleValues,'low');
    const ambientMotion=reduced||settings.motion===false?'reduced':pick(settings.ambientMotion,motionValues,'normal');
    const mascotMotion=reduced||settings.motion===false?'reduced':pick(settings.mascotMotion,mascotValues,'full');
    return {requested,quality,particles,ambientMotion,mascotMotion,reduced};
  }
  function environment() {
    return {cores:navigator.hardwareConcurrency,memory:navigator.deviceMemory,width:innerWidth,
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
  }
  function drawParticles() {
    const root=document.querySelector('.ambient-particles');
    if(!root||!active)return;
    const room=document.body.dataset.nexoRoom||'home';
    const wanted=active.particles==='none'?0:active.particles==='low'?4:10;
    const cap=active.quality==='low'?2:active.quality==='balanced'?6:10;
    const count=document.hidden?0:Math.min(wanted,cap,roomCaps[room]??4);
    if(root.children.length===count)return;
    root.replaceChildren();
    for(let i=0;i<count;i+=1) {
      const particle=document.createElement('i');
      particle.className='ambient-particle';
      particle.style.left=`${points[i][0]}%`;
      particle.style.top=`${points[i][1]}%`;
      particle.style.animationDelay=`-${i*0.7}s`;
      root.append(particle);
    }
  }
  function apply(settings={}) {
    currentSettings=settings;
    active=resolve(settings,environment());
    document.body.dataset.nexoQuality=active.quality;
    document.body.dataset.nexoAmbientMotion=active.ambientMotion;
    document.body.dataset.nexoMascotMotion=active.mascotMotion;
    drawParticles();
    return active;
  }
  function start() {
    if(started)return;
    started=true;
    document.addEventListener('visibilitychange',drawParticles);
    window.addEventListener('resize',()=>apply(currentSettings),{passive:true});
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',()=>apply(currentSettings));
  }
  function snapshot() {
    return {...active,particlesOnScreen:document.querySelectorAll('.ambient-particle').length,
      riveInstances:document.querySelectorAll('canvas[data-engine="rive"],canvas[data-engine="rive+layers"]').length,
      activeAnimations:document.getAnimations().filter(animation=>animation.playState==='running').length};
  }
  window.NexoPerformance=Object.freeze({resolve,apply,start,snapshot,drawParticles});
})();

;

/* platform/animation.js */
/* GSAP opcional para microinteracciones; nunca se carga con movimiento reducido. */
(() => {
  'use strict';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('reduce-motion');
  const presets={
    fadeIn:[{opacity:0},{opacity:1,duration:.2}],
    slideIn:[{opacity:0,y:14},{opacity:1,y:0,duration:.26}],
    scalePop:[{opacity:0,scale:.93},{opacity:1,scale:1,duration:.26}],
    rewardPop:[{scale:.88},{scale:1,duration:.36,ease:'back.out(1.5)'}],
    equipPulse:[{filter:'brightness(1.6)'},{filter:'brightness(1)',duration:.3}],
    modalEnter:[{opacity:0,scale:.96},{opacity:1,scale:1,duration:.2}],
    modalExit:[{opacity:1,scale:1},{opacity:0,scale:.97,duration:.16}]
  };
  async function run(target,preset='fadeIn') {
    if (!target || reduced()) return;
    try {
      await window.NexoLoader.script('./vendor/gsap/gsap.min.js');
      if(!target.isConnected)return;
      const [from,to]=presets[preset]||presets.fadeIn;
      window.gsap?.fromTo(target,from,{...to,ease:to.ease||'power1.out',clearProps:'transform,opacity,filter'});
    } catch { /* La interfaz sigue funcionando sin animación. */ }
  }
  let navigationAnimation=null, openingLeaf=null, openedInMemory=false, origin=null, previousFolio=null, previousPages=null;
  const running=new Set();
  function prepare(root) {
    const source=root.querySelector('.continue-volume');
    const rect=source?.getBoundingClientRect();
    origin=rect&&rect.bottom>0&&rect.top<innerHeight?rect:null;
    previousFolio=root.querySelector('.grimoire-folio')?.innerHTML||null;
    const spread=root.querySelector('.grimoire-spread');
    if(spread) {
      const s=spread.getBoundingClientRect(),rel=el=>{const r=el.getBoundingClientRect();return {left:r.left-s.left,top:r.top-s.top,width:r.width,height:r.height};};
      const front=spread.querySelector('.grimoire-frontispiece'),folio=spread.querySelector('.grimoire-folio');
      previousPages={course:root.querySelector('.grimoire')?.dataset.bookCourse||'index',route:root.dataset.renderedRoute||'',
        front:front?{html:front.innerHTML,rect:rel(front)}:null,folio:folio?{html:folio.innerHTML,rect:rel(folio)}:null};
    } else previousPages=null;
  }
  function animate(target,frames,options) {
    const animation=target.animate(frames,options);
    running.add(animation);
    animation.finished.finally(()=>running.delete(animation)).catch(()=>{});
    return animation;
  }
  function cancel() {
    running.forEach(animation=>animation.cancel());running.clear();
    navigationAnimation=null;if(openingLeaf?._cleanup)openingLeaf._cleanup();else openingLeaf?.remove();openingLeaf=null;
  }
  function transitionFor(previous,next,opened) {
    const from=String(previous||'').split('/'), to=String(next||'').split('/');
    const learn=parts=>['learn','subjects','subject','lesson','library','knowledge','inspector'].includes(parts[0]);
    if(previous===next) return {kind:'none',duration:0};
    if(learn(to)&&!learn(from)) return {kind:opened?'book-return':'book-first',duration:opened?420:3400};
    if(learn(from)&&to[0]==='home') return {kind:'book-close',duration:380};
    if(learn(to)&&learn(from)) return {kind:'page-turn',duration:820};
    return {kind:'none',duration:0};
  }

  /* ---------------------------------------------------------------- Intro del grimorio
     Capa fija sobre la pantalla (no depende del scroll). La portada aparece UNA vez por sesión (sessionStorage);
     después, entrar o salir del grimorio es solo un fundido suave. Guion completo más abajo (UPDATE 01.7). */
  const ASSETS=['assets/grimoire/grimoire-cover.webp','assets/grimoire/grimoire-cover-glow.webp','assets/grimoire/grimoire-cover-clasp.png','assets/grimoire/grimoire-endpaper.webp'];
  let preloaded=false;const decoded=[];
  function preload() {
    // Se descargan y DECODIFICAN antes de usarlas; si no, el navegador pinta la tapa vacía un instante.
    if(preloaded||typeof Image==='undefined')return; preloaded=true;
    ASSETS.forEach(src=>{const img=new Image();img.src=src;decoded.push(img);img.decode?.().catch(()=>{});});
  }
  if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener('load',()=>(window.requestIdleCallback||setTimeout)(preload,{timeout:4000}));
  /* UPDATE 01.7 — intro épica (una sola vez por sesión, 3,4 s):
       0–700    oscuridad; aparece un círculo mágico de runas detrás y empiezan a subir motas de luz
       250–1000 el grimorio sube flotando hasta su lugar
       700–1500 las runas de la portada se encienden en círculo; las motas giran hacia el libro
       1330     la gema destella (estrella de luz)          1500–1750 se suelta el broche
       1750–2600 la tapa se abre: sale luz de las páginas, rayos dorados y un estallido de chispas
       2050–2700 páginas que se levantan
       2650–3400 la cámara "entra" al libro con un resplandor cálido y aparece el grimorio real */
  const RUNES=[[[0,-1,0,1],[0,-.2,-.6,-.8],[0,.2,.6,-.4]],[[-.8,.7,0,-.8,.8,.7,-.8,.7],[-.45,.1,.45,.1]],[[0,1,0,-1],[-.6,-.4,0,-1,.6,-.4],[-.5,.35,.5,.35]],
    [[-.9,.2,-.45,-.4,0,.2,.45,-.4,.9,.2],[-.6,.7,.6,.7]],[[-.5,-1,-.5,1],[.5,-1,.5,1],[-.5,0,0,-.5,.5,0,0,.5,-.5,0]],[[-.7,-.7,.7,.7],[.7,-.7,-.7,.7]],
    [[0,-1,.25,-.25,1,0,.25,.25,0,1,-.25,.25,-1,0,-.25,-.25,0,-1]],[[-.7,1,-.7,-.3,0,-1,.7,-.3,.7,1],[-.7,.3,.7,.3]],[[.3,-.9,-.5,-.5,-.6,.3,-.1,.85,.4,.75]]];
  function circleSVG(kind) {
    // círculo mágico dibujado con las mismas runas inventadas de la portada
    const C=500,parts=[];
    const circ=(r,w,o=1,dash='')=>parts.push(`<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke-width="${w}" opacity="${o}"${dash?` stroke-dasharray="${dash}"`:''}/>`);
    if(kind==='outer') {
      circ(478,3);circ(462,1.4);circ(392,1.4);circ(376,3);
      for(let k=0;k<72;k++){const a=k/72*Math.PI*2,r0=466,r1=k%6?472:476;parts.push(`<line x1="${C+Math.cos(a)*r0}" y1="${C+Math.sin(a)*r0}" x2="${C+Math.cos(a)*r1}" y2="${C+Math.sin(a)*r1}" stroke-width="1.4"/>`);}
      for(let k=0;k<30;k++){
        const a=-Math.PI/2+k/30*Math.PI*2,cx=C+Math.cos(a)*427,cy=C+Math.sin(a)*427,out=[Math.cos(a),Math.sin(a)],tan=[-Math.sin(a),Math.cos(a)],sc=17;
        for(const st of RUNES[(k*4)%RUNES.length]){const pts=[];for(let i=0;i<st.length;i+=2){const gx=st[i],gy=st[i+1];pts.push(`${(cx+(gx*tan[0]-gy*out[0])*sc).toFixed(1)},${(cy+(gx*tan[1]-gy*out[1])*sc).toFixed(1)}`);}parts.push(`<polyline points="${pts.join(' ')}" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);}
      }
    } else {
      circ(330,2.2);circ(318,1,.8,'4 10');circ(150,2);circ(120,1.2,.8);
      const hex=k=>[C+300*Math.cos(Math.PI/6+k*Math.PI/3),C+300*Math.sin(Math.PI/6+k*Math.PI/3)];
      const pts=[0,1,2,3,4,5,0].map(hex).map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
      parts.push(`<polyline points="${pts}" fill="none" stroke-width="2.4"/>`);
      for(let k=0;k<6;k++){const [x,y]=hex(k);parts.push(`<circle cx="${x}" cy="${y}" r="16" fill="none" stroke-width="2"/>`,`<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke-width="1" opacity=".5"/>`);}
      for(let k=0;k<12;k++){const a=k/12*Math.PI*2,x=C+Math.cos(a)*226,y=C+Math.sin(a)*226,r=k%2?7:12;parts.push(`<path d="M${x} ${y-r}L${x+r*.3} ${y-r*.3}L${x+r} ${y}L${x+r*.3} ${y+r*.3}L${x} ${y+r}L${x-r*.3} ${y+r*.3}L${x-r} ${y}L${x-r*.3} ${y-r*.3}Z" fill="currentColor" stroke="none"/>`);}
    }
    return `<svg viewBox="0 0 1000 1000" aria-hidden="true" focusable="false" stroke="currentColor">${parts.join('')}</svg>`;
  }
  function introMarkup() {
    const sparks=Array.from({length:7},(_,i)=>`<i class="gi-spark" style="--i:${i}"></i>`).join('');
    return `<div class="gi-backdrop"></div><div class="gi-rays"></div>
      <div class="gi-circle gi-circle-outer">${circleSVG('outer')}</div><div class="gi-circle gi-circle-inner">${circleSVG('inner')}</div>
      <div class="gi-motes"></div>
      <div class="gi-stage"><div class="gi-book">
      <div class="gi-block"><div class="gi-pagelight"></div><div class="gi-page gi-page-1"></div><div class="gi-page gi-page-2"></div><div class="gi-page gi-page-3"></div></div>
      <div class="gi-cover"><div class="gi-front"><img class="gi-art" src="${ASSETS[0]}" alt="" decoding="sync"><div class="gi-glow"></div><div class="gi-gem"></div><div class="gi-flare"></div><div class="gi-sheen"></div><div class="gi-clasp"></div></div><div class="gi-back"><img class="gi-art" src="${ASSETS[3]}" alt="" decoding="sync"></div></div>
      <div class="gi-sparks">${sparks}</div></div>
      <div class="gi-bloom"><div class="gi-bloom-light"></div><div class="gi-sigil">${circleSVG('inner')}</div></div></div>
      <div class="gi-flash"></div><p class="gi-hint"><span class="gi-hint-mouse">Haz clic o presiona Esc para saltar</span><span class="gi-hint-touch">Toca para saltar</span></p>`;
  }
  function timeline(el,frames,start,dur,_total,easing='ease-in-out') {
    if(!el)return null;
    return animate(el,frames,{duration:dur,delay:start,easing,fill:'both'});
  }
  function grimoireIntro(book,spec) {
    preload();
    const T=spec.duration,low=document.body.dataset.nexoQuality==='low';
    const layer=document.createElement('div');
    layer.className='grimoire-intro';layer.dataset.kind=spec.kind;layer.setAttribute('aria-hidden','true');
    layer.innerHTML=introMarkup();
    document.body.append(layer);
    const q=sel=>layer.querySelector(sel),wide=innerWidth>760;
    const shift=wide?(q('.gi-book').offsetWidth/2)+'px':'0px';   // en pantallas anchas el libro abierto queda centrado
    const hold=animate(book,[{opacity:0},{opacity:0,offset:.86},{opacity:1}],{duration:T,easing:'ease-out'});
    q('.gi-stage').style.opacity='0';q('.gi-backdrop').style.opacity='.9';
    // motas de luz: suben, giran hacia el libro y estallan al abrirse
    const motes=q('.gi-motes'),R=Math.min(innerWidth,innerHeight);
    for(let i=0;i<(low?14:38);i++) {
      const m=document.createElement('i');m.className='gi-mote';motes.append(m);
      const a0=Math.random()*Math.PI*2,r0=R*(.32+Math.random()*.28),a1=a0+(Math.random()<.5?1:-1)*(1.2+Math.random()),r1=R*(.12+Math.random()*.1),a2=a1+.6,r2=R*(.45+Math.random()*.35);
      const P=(a,r,dy=0)=>`translate(${(Math.cos(a)*r).toFixed(1)}px,${(Math.sin(a)*r*.75+dy).toFixed(1)}px)`;
      const size=.5+Math.random()*.9;
      m.style.setProperty('--s',size.toFixed(2));
      m._spec=[[{transform:P(a0,r0,R*.25)+' scale(.3)',opacity:0},{transform:P((a0+a1)/2,(r0+r1)/2)+' scale(1)',opacity:.95,offset:.35},{transform:P(a1,r1)+' scale(.8)',opacity:.85,offset:.62},{transform:P(a2,r2,-R*.1)+' scale(.2)',opacity:0}],Math.random()*500,2500+Math.random()*500];
    }
    const arts=[...layer.querySelectorAll('img.gi-art')].map(img=>img.decode?img.decode().catch(()=>{}):Promise.resolve());
    const ready=Promise.race([Promise.all(arts),new Promise(r=>setTimeout(r,260))]);
    let started=false,main=null;
    const start=()=>{
      if(started||!layer.isConnected)return; started=true;
      q('.gi-stage').style.opacity='';q('.gi-backdrop').style.opacity='';
      try{hold.currentTime=0;}catch{}
      window.NexoAudio?.play?.('grimoire');
      const E='cubic-bezier(.2,.7,.2,1)';
      timeline(q('.gi-backdrop'),[{opacity:.9},{opacity:1}],0,500,T,'ease-out');
      // círculo mágico: aparece, gira (cada anillo hacia un lado), se intensifica y se apaga
      [['.gi-circle-outer',70],['.gi-circle-inner',-110]].forEach(([sel,deg])=>{
        timeline(q(sel),[{opacity:0,transform:`scale(.72) rotate(0deg)`},{opacity:.85,transform:`scale(1) rotate(${deg*.25}deg)`,offset:.22},{opacity:1,transform:`scale(1.02) rotate(${deg*.45}deg)`,offset:.44},{opacity:.55,transform:`scale(1.12) rotate(${deg*.75}deg)`,offset:.76},{opacity:0,transform:`scale(1.35) rotate(${deg}deg)`}],0,T,T,'ease-in-out');
      });
      [...motes.children].forEach(m=>timeline(m,m._spec[0],m._spec[1],m._spec[2],T,'cubic-bezier(.3,.1,.3,1)'));
      timeline(q('.gi-stage'),[{transform:'translateY(70px) scale(.86)',opacity:0},{transform:'translateY(-6px) scale(1.01)',opacity:1,offset:.75},{transform:'translateY(0) scale(1)',opacity:1}],250,750,T,E);
      timeline(q('.gi-book'),[{transform:'translateY(0)'},{transform:'translateY(-7px)'},{transform:'translateY(0)'}],1000,750,T,'ease-in-out');   // flota
      timeline(q('.gi-glow'),[{opacity:0,'--sweep':'0deg'},{opacity:.95,'--sweep':'200deg',offset:.55},{opacity:.9,'--sweep':'390deg'}],700,800,T);
      timeline(q('.gi-glow'),[{filter:'brightness(1)'},{filter:'brightness(1.45)'},{filter:'brightness(.6)'}],1500,1100,T);
      timeline(q('.gi-sheen'),[{backgroundPosition:'130% 0',opacity:0},{opacity:1,offset:.2},{backgroundPosition:'-30% 0',opacity:0}],750,800,T);
      timeline(q('.gi-gem'),[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.25)',offset:.5},{opacity:.8,transform:'scale(1)'}],1250,500,T);
      timeline(q('.gi-flare'),[{opacity:0,transform:'translate(-50%,-50%) rotate(0deg) scale(.2)'},{opacity:1,transform:'translate(-50%,-50%) rotate(25deg) scale(1.15)',offset:.4},{opacity:0,transform:'translate(-50%,-50%) rotate(55deg) scale(.5)'}],1330,480,T,'ease-out');
      timeline(q('.gi-clasp'),[{transform:'translateX(0) rotate(0)',opacity:1},{transform:'translateX(3%) rotate(-3deg)',opacity:1,offset:.35},{transform:'translateX(22%) rotate(8deg)',opacity:0}],1500,250,T,'cubic-bezier(.5,0,.6,1)');
      main=timeline(q('.gi-cover'),[{transform:'rotateY(0deg) translateZ(0)'},{transform:'rotateY(-18deg) translateZ(18px)',offset:.18},{transform:'rotateY(-168deg) translateZ(0)'}],1750,850,T,'cubic-bezier(.55,.06,.3,1)');
      timeline(q('.gi-book'),[{translate:'0 0'},{translate:`${shift} 0`}],1750,850,T,'cubic-bezier(.55,.06,.3,1)');
      timeline(q('.gi-pagelight'),[{opacity:0},{opacity:1,offset:.45},{opacity:.35}],1850,900,T,'ease-out');
      // de la página en blanco sale luz y se "escribe" un sello mágico
      timeline(q('.gi-bloom'),[{translate:'0 0'},{translate:`${shift} 0`}],1750,850,T,'cubic-bezier(.55,.06,.3,1)');
      timeline(q('.gi-bloom-light'),[{opacity:0,transform:'scale(.4)'},{opacity:1,transform:'scale(1)',offset:.4},{opacity:.75,transform:'scale(1.15)'}],2000,1000,T,'ease-out');
      timeline(q('.gi-sigil'),[{opacity:0,clipPath:'circle(0% at 50% 50%)',transform:'rotate(-40deg) scale(.8)'},{opacity:1,clipPath:'circle(70% at 50% 50%)',transform:'rotate(0deg) scale(1)',offset:.6},{opacity:.9,clipPath:'circle(70% at 50% 50%)',transform:'rotate(12deg) scale(1.05)'}],2150,850,T,'cubic-bezier(.3,.1,.3,1)');
      timeline(q('.gi-rays'),[{opacity:0,transform:'translate(-50%,-50%) rotate(0deg) scale(.6)'},{opacity:.85,transform:'translate(-50%,-50%) rotate(12deg) scale(1)',offset:.35},{opacity:0,transform:'translate(-50%,-50%) rotate(30deg) scale(1.3)'}],1900,1200,T,'ease-out');
      layer.querySelectorAll('.gi-page').forEach((page,i)=>timeline(page,[{transform:'rotateY(0deg)'},{transform:`rotateY(${-(150+i*8)}deg)`}],2050+i*110,520,T,'cubic-bezier(.4,.1,.3,1)'));
      layer.querySelectorAll('.gi-spark').forEach((spark,i)=>timeline(spark,[{opacity:0,transform:'translate(0,0) scale(.5)'},{opacity:.9,offset:.35},{opacity:0,transform:`translate(${(i%2?1:-1)*(8+i*3)}px,${-40-i*9}px) scale(1)`}],900+i*110,1100,T,'ease-out'));
      // estallido de chispas al abrirse
      const burst=q('.gi-motes');
      for(let i=0;i<(low?12:44);i++) {
        const s=document.createElement('i');s.className='gi-mote gi-burst';burst.append(s);
        const a=Math.random()*Math.PI*2,d=R*(.2+Math.random()*.45);s.style.setProperty('--s',(.8+Math.random()*1.1).toFixed(2));
        timeline(s,[{transform:`translate(${shift},0) scale(1.2)`,opacity:0},{opacity:1,offset:.12},{transform:`translate(calc(${shift} + ${(Math.cos(a)*d).toFixed(1)}px),${(Math.sin(a)*d*.8-R*.05).toFixed(1)}px) scale(.2)`,opacity:0}],2050+Math.random()*250,900+Math.random()*500,T,'cubic-bezier(.1,.7,.3,1)');
      }
      timeline(q('.gi-hint'),[{opacity:0},{opacity:.7,offset:.2},{opacity:.7,offset:.85},{opacity:0}],300,2300,T);
      timeline(q('.gi-stage'),[{scale:'1'},{scale:'1.24'}],2650,750,T,'cubic-bezier(.5,0,.7,.4)');   // la cámara entra
      timeline(q('.gi-flash'),[{opacity:0},{opacity:.55,offset:.45},{opacity:0}],2700,700,T,'ease-in-out');
      timeline(layer,[{opacity:1},{opacity:0}],2950,450,T,'ease-in');
      layer._main=main;
      Promise.all([...running].filter(a=>a.effect?.target&&layer.contains(a.effect.target)||a.effect?.target===layer).map(a=>a.finished)).then(done,done);
    };
    const finish=()=>{start();running.forEach(a=>{try{a.finish();}catch{}});};
    const onKey=e=>{if(['Escape','Enter',' '].includes(e.key)){e.preventDefault();finish();}};
    layer.addEventListener('pointerdown',finish);document.addEventListener('keydown',onKey,true);
    const done=()=>{document.removeEventListener('keydown',onKey,true);layer.remove();if(openingLeaf===layer)openingLeaf=null;};
    hold.finished.catch(()=>{});
    layer._cleanup=done;
    ready.then(start);
    return layer;
  }
  /* ---------------------------------------------------------------- UPDATE 01.6 — cambio de página real
     La hoja que se da vuelta se arma con 7 tiras verticales anidadas: cada tira gira un poco respecto
     de la anterior, así la hoja se CURVA como papel. El anverso muestra la página vieja y el reverso el
     papel del ramo nuevo; al aterrizar, el reverso se funde con la página nueva.
     Adelante (ramo siguiente / más profundo): gira la página derecha hacia la izquierda.
     Atrás (ramo anterior / volver al índice): gira la izquierda hacia la derecha. */
  function routeKey(route) {
    const parts=String(route||'').split('/'),ids=Object.keys(window.NexoRooms?.courses||{});
    if(parts[0]!=='learn')return [ids.length+1,0];
    if(parts[1]==='course')return [ids.indexOf(parts[2]),parts[3]==='evaluation'?(parts[5]?3:2):parts[3]?4:1];
    if(parts[1])return [ids.length,1];
    return [-1,0];
  }
  function turnDirection(previous,next) {
    const a=routeKey(previous),b=routeKey(next);
    return (b[0]<a[0]||(b[0]===a[0]&&b[1]<a[1]))?-1:1;
  }
  function decorVars(course) {
    if(!course||course==='index')return "--decor-tile:url('assets/grimoire/decor/index-tile.svg');--decor-hero:none;--decor-foot:none;";
    const u=part=>`url('assets/grimoire/decor/${course}-${part}.svg')`;
    return `--decor-tile:${u('tile')};--decor-hero:${u('hero')};--decor-foot:${u('foot')};`;
  }
  function pageCurl(book,dir,T) {
    const spread=book.querySelector('.grimoire-spread');
    const prev=previousPages,fwd=dir>0;
    if(!spread||!prev)return null;
    const turning=fwd?prev.folio:prev.front, staying=fwd?prev.front:prev.folio;
    const target=(fwd?spread.querySelector('.grimoire-frontispiece'):spread.querySelector('.grimoire-folio'));
    const sr=spread.getBoundingClientRect(),tr=target?.getBoundingClientRect();
    const landW=tr?tr.width:staying.rect.width, W=turning.rect.width, H=Math.max(turning.rect.height,staying.rect.height);
    const N=7, sw=W/N, oldAccent=window.NexoRooms?.courses?.[prev.course]?.accent, oldVars=decorVars(prev.course)+(oldAccent?`--book-accent:${oldAccent};`:'');
    const turningClass=fwd?'grimoire-folio':'grimoire-frontispiece', stayingClass=fwd?'grimoire-frontispiece':'grimoire-folio';
    const spine=fwd?turning.rect.left:turning.rect.left+W;
    const stage=document.createElement('div');
    stage.className='curl-stage';stage.setAttribute('aria-hidden','true');stage.inert=true;
    stage.style.perspectiveOrigin=`${spine}px 40%`;
    // la página que "se queda" (vieja) tapa la nueva hasta que la hoja aterriza encima
    const under=document.createElement('div');
    under.className=`curl-under ${stayingClass}`;under.style.cssText=oldVars+`left:${staying.rect.left}px;top:${staying.rect.top}px;width:${staying.rect.width}px;height:${staying.rect.height}px;`;
    under.innerHTML=staying.html;
    const shadeNew=document.createElement('div');
    shadeNew.className='curl-shade'+(fwd?'':' curl-shade-rev');
    Object.assign(shadeNew.style,{left:turning.rect.left+'px',top:turning.rect.top+'px',width:W+'px',height:H+'px'});
    const shadeOld=document.createElement('div');
    shadeOld.className='curl-shade'+(fwd?' curl-shade-rev':'');
    Object.assign(shadeOld.style,{left:'0px',top:'0px',width:'100%',height:'100%'});
    under.append(shadeOld);
    // hoja con tiras anidadas
    const leaf=document.createElement('div');
    leaf.className='curl-leaf';
    Object.assign(leaf.style,{left:turning.rect.left+'px',top:turning.rect.top+'px',width:W+'px',height:turning.rect.height+'px',transformOrigin:fwd?'left center':'right center'});
    let parent=leaf;const strips=[],fronts=[],backs=[];
    for(let i=0;i<N;i++) {
      const strip=document.createElement('div');
      strip.className='curl-strip';
      Object.assign(strip.style,{width:sw+0.6+'px',height:'100%',transformOrigin:fwd?'left center':'right center'});
      strip.style[fwd?'left':'right']=i===0?'0px':sw+'px';
      const front=document.createElement('div');front.className='curl-face';
      const page=document.createElement('div');page.className=`curl-page ${turningClass}`;page.style.cssText=oldVars+`width:${W}px;height:${turning.rect.height}px;${fwd?'left':'right'}:${-i*sw}px;`;
      page.innerHTML=turning.html;front.append(page);
      const back=document.createElement('div');back.className='curl-face curl-back';
      back.style.setProperty('--bx',`${fwd?-(N-1-i)*sw:-i*sw}px`);
      strip.append(front,back);parent.append(strip);parent=strip;
      strips.push(strip);fronts.push(front);backs.push(back);
    }
    stage.append(under,shadeNew,leaf);spread.append(stage);
    const sgn=fwd?-1:1, sx=landW/W;
    window.NexoAudio?.play?.('page');
    const ease='cubic-bezier(.42,0,.22,1)';
    const main=animate(leaf,[
      {transform:'rotateY(0deg) scaleX(1)'},
      {transform:`rotateY(${sgn*28}deg) scaleX(1)`,offset:.22},
      {transform:`rotateY(${sgn*100}deg) scaleX(${(1+sx)/2})`,offset:.58},
      {transform:`rotateY(${sgn*180}deg) scaleX(${sx})`}],{duration:T,easing:ease,fill:'forwards'});
    // curvatura: el borde libre se queda atrás al levantar y se estira al bajar
    strips.forEach((strip,i)=>{ if(i===0)return;
      const c=-sgn*(5+i*2.2);
      animate(strip,[{transform:'rotateY(0deg)'},{transform:`rotateY(${c}deg)`,offset:.3},{transform:`rotateY(${c*.55}deg)`,offset:.6},{transform:`rotateY(${-c*.18}deg)`,offset:.86},{transform:'rotateY(0deg)'}],{duration:T,easing:'ease-in-out',fill:'forwards'});
    });
    fronts.forEach((f,i)=>animate(f,[{filter:'brightness(1)'},{filter:'brightness(.9)',offset:.3},{filter:'brightness(.62)',offset:.5},{filter:'brightness(.62)'}],{duration:T,easing:'linear',fill:'forwards'}));
    backs.forEach(b=>animate(b,[{filter:'brightness(.6)',opacity:1},{filter:'brightness(.66)',opacity:1,offset:.5},{filter:'brightness(.9)',opacity:1,offset:.68},{filter:'brightness(1)',opacity:1,offset:.8},{filter:'brightness(1)',opacity:1,offset:.88},{filter:'brightness(1)',opacity:0}],{duration:T,easing:'linear',fill:'forwards'}));
    animate(shadeNew,[{opacity:0},{opacity:.95,offset:.32},{opacity:.4,offset:.62},{opacity:0,offset:.85},{opacity:0}],{duration:T,easing:'ease-in-out',fill:'forwards'});
    animate(shadeOld,[{opacity:0},{opacity:0,offset:.45},{opacity:.85,offset:.82},{opacity:.85}],{duration:T,easing:'ease-in',fill:'forwards'});
    animate(under,[{opacity:1},{opacity:1,offset:.9},{opacity:0,offset:.901},{opacity:0}],{duration:T,fill:'forwards'});
    const done=()=>{stage.remove();if(openingLeaf===stage)openingLeaf=null;};
    main.finished.then(done,done);
    stage._main=main;stage._cleanup=done;
    return stage;
  }
  function navigate(root,previous,next) {
    cancel();
    let opened=openedInMemory;
    try { opened=opened||sessionStorage.getItem('nexo-grimoire-update01')==='1'; } catch { /* tab memory fallback */ }
    const spec=transitionFor(previous,next,opened);
    if(spec.kind==='book-first') {
      openedInMemory=true;
      try { sessionStorage.setItem('nexo-grimoire-update01','1'); } catch { /* storage disabled */ }
    }
    root.dataset.worldTransition=spec.kind;
    root.dataset.transitionDuration=String(spec.duration);
    if(spec.kind==='none') return;
    const book=root.querySelector('.grimoire'),refuge=root.querySelector('.refuge');
    const target=book||refuge;
    if(!target?.animate)return;
    // Movimiento reducido: solo un fundido corto (sin giros ni desplazamientos).
    if(reduced()||document.body.dataset.nexoAmbientMotion==='reduced') {navigationAnimation=animate(target,[{opacity:0},{opacity:1}],{duration:200,easing:'ease-out'});return;}
    if(spec.kind==='book-first'&&book) {
      openingLeaf=grimoireIntro(book,spec);
      navigationAnimation=openingLeaf?._main||null;
    } else if(spec.kind==='page-turn'&&book&&previousPages?.front&&previousPages?.folio&&innerWidth>760) {
      openingLeaf=pageCurl(book,turnDirection(previous,next),spec.duration);
      navigationAnimation=openingLeaf?._main||null;
    } else if(spec.kind==='page-turn'&&book&&previousFolio) {
      // Móvil: las páginas van una sobre otra; basta una hoja que se levanta con sombra.
      const leaf=document.createElement('div');
      leaf.className='grimoire-folio page-turn-leaf';leaf.setAttribute('aria-hidden','true');leaf.inert=true;
      leaf.innerHTML=previousFolio;book.append(leaf);openingLeaf=leaf;
      window.NexoAudio?.play?.('page');
      navigationAnimation=animate(leaf,[{transform:'perspective(2600px) rotateY(0deg)',filter:'brightness(1)',opacity:1},{transform:'perspective(2600px) rotateY(-60deg)',filter:'brightness(.84)',opacity:1,offset:.55},{transform:'perspective(2600px) rotateY(-120deg)',filter:'brightness(.7)',opacity:0}],{duration:560,easing:'cubic-bezier(.45,.05,.3,1)',fill:'forwards'});
      navigationAnimation.finished.then(()=>{leaf.remove();if(openingLeaf===leaf)openingLeaf=null;}).catch(()=>leaf.remove());
    } else {
      const frames=spec.kind==='page-turn'?[{transform:'perspective(1200px) rotateY(-4deg)',opacity:.72},{transform:'perspective(1200px) rotateY(0)',opacity:1}]
        :spec.kind==='book-close'?[{transform:'scale(1.025)',opacity:.7},{transform:'scale(1)',opacity:1}]
          :[{transform:'translateY(14px) scale(.985)',opacity:0},{transform:'translateY(0) scale(1)',opacity:1}];
      navigationAnimation=animate(target,frames,{duration:spec.duration,easing:'ease-out'});
    }
  }
  // Stop an in-flight opening when motion preference changes or the tab is hidden.
  if(typeof matchMedia==='function')matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',cancel);
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
  window.NexoAnimation = { reveal:target=>run(target,'slideIn'),run,reduced,presets:Object.keys(presets),transitionFor,navigate,prepare,preload };
})();

;

/* platform/audio.js */
/* Locally generated, optional audio. No sound starts without a user gesture. */
(() => {
  'use strict';
  const sprite={click:[0,80],confirm:[100,150],purchase:[280,200],equip:[510,120],error:[650,180]};
  const tones={click:[540,690],confirm:[570,810],purchase:[390,570,790],equip:[640,880],error:[260,180]};
  const rooms={home:'home',learn:'learn',lesson:'learn',subject:'learn',subjects:'learn',library:'learn',
    knowledge:'learn',reviews:'learn',rescue:'learn',train:'train',practice:'train',
    games:'games',profile:'profile',mascot:'profile',stats:'profile',settings:'profile',
    hub:'planner',planner:'planner',timer:'planner',shop:'profile'};
  let settings={sound:false,sfxVolume:.4,music:false,musicVolume:.15,ambient:false,ambientVolume:.12};
  let room='home',gesture=false,hidden=typeof document!=='undefined'&&document.hidden;
  let sfx=null,ambient=null,music=null,loading=null,generation=0;
  /* Efectos largos en archivo (más ricos que el sprite): apertura del grimorio y cambio de página. */
  const files={grimoire:['assets/audio/grimoire-open.webm','assets/audio/grimoire-open.mp3'],page:['assets/audio/page-turn.webm','assets/audio/page-turn.mp3']};
  const fileVolume={grimoire:1,page:.55};
  const fileHowls={};
  function fileHowl(name) {
    if(!fileHowls[name]&&window.Howl)fileHowls[name]=new window.Howl({src:files[name],volume:settings.sfxVolume*fileVolume[name],preload:true});
    return fileHowls[name];
  }
  function wav(pcm,rate) {
    const bytes=new Uint8Array(44+pcm.length*2),view=new DataView(bytes.buffer);
    const label=(at,value)=>[...value].forEach((char,i)=>bytes[at+i]=char.charCodeAt(0));
    label(0,'RIFF');view.setUint32(4,bytes.length-8,true);label(8,'WAVEfmt ');
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
    view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);
    pcm.forEach((sample,i)=>view.setInt16(44+i*2,sample,true));
    let raw='';for(let i=0;i<bytes.length;i++)raw+=String.fromCharCode(bytes[i]);
    return 'data:audio/wav;base64,'+btoa(raw);
  }
  function wavSprite() {
    const rate=12000,pcm=new Int16Array(10800);
    for(const [name,[start,duration]] of Object.entries(sprite)) {
      const freqs=tones[name],samples=Math.floor(duration*rate/1000);
      for(let i=0;i<samples;i++) {
        const t=i/rate,fade=Math.sin(Math.PI*i/samples);
        const freq=freqs[Math.min(freqs.length-1,Math.floor(i/samples*freqs.length))];
        pcm[Math.floor(start*rate/1000)+i]=Math.round(Math.sin(2*Math.PI*freq*t)*fade*5600);
      }
    }
    return wav(pcm,rate);
  }
  /* Periodic waves end at zero crossings, avoiding a click at loop boundaries. */
  function wavLoop(kind,scene) {
    const rate=8000,seconds=4,samples=rate*seconds,pcm=new Int16Array(samples);
    const base={home:110,train:130,profile:98,planner:123,games:146}[scene]||110;
    for(let i=0;i<samples;i++) {
      const t=i/rate,edge=Math.sin(Math.PI*i/samples)**2;
      let sample;
      if(kind==='ambient') {
        const breath=Math.sin(2*Math.PI*.25*t);
        sample=(Math.sin(2*Math.PI*base*t)*.4+Math.sin(2*Math.PI*(base*1.5)*t)*.18)*(.55+.3*breath);
      } else {
        const chord=[1,1.25,1.5],pulse=.55+.2*Math.sin(2*Math.PI*.5*t);
        sample=chord.reduce((sum,mult,index)=>sum+Math.sin(2*Math.PI*base*mult*t)/(index+2),0)*pulse;
      }
      pcm[i]=Math.round(sample*edge*(kind==='ambient'?1700:2250));
    }
    return wav(pcm,rate);
  }
  async function init() {
    if(sfx)return sfx;
    if(!loading)loading=(async()=>{
      await window.NexoLoader.script('./vendor/howler/howler.min.js');
      if(!window.Howl)return null;
      sfx=new window.Howl({src:[wavSprite()],format:['wav'],sprite,volume:settings.sfxVolume,preload:true});
      if(settings.sound)Object.keys(files).forEach(fileHowl);   // precarga para que la apertura suene a tiempo
      return sfx;
    })().catch(()=>{loading=null;return null;});
    return loading;
  }
  function unloadLoop(loop) {if(loop){loop.stop();loop.unload();}}
  function stopLoops() {generation++;unloadLoop(ambient);unloadLoop(music);ambient=null;music=null;}
  function reconcile() {
    if(!gesture||hidden||(!settings.ambient&&!settings.music)) {stopLoops();return;}
    const wanted=++generation;
    init().then(()=>{
      if(wanted!==generation||hidden||!gesture||!window.Howl)return;
      if(room==='learn'||room==='games') {stopLoops();return;}
      if(settings.ambient) {
        if(!ambient||ambient._nexoRoom!==room) {
          unloadLoop(ambient);
          ambient=new window.Howl({src:[wavLoop('ambient',room)],format:['wav'],loop:true,
            volume:settings.ambientVolume,preload:true});ambient._nexoRoom=room;ambient.play();
        } else ambient.volume(settings.ambientVolume);
      } else {unloadLoop(ambient);ambient=null;}
      if(settings.music) {
        if(!music||music._nexoRoom!==room) {
          unloadLoop(music);
          music=new window.Howl({src:[wavLoop('music',room)],format:['wav'],loop:true,
            volume:settings.musicVolume,preload:true});music._nexoRoom=room;music.play();
        } else music.volume(settings.musicVolume);
      } else {unloadLoop(music);music=null;}
    }).catch(()=>{});
  }
  function configure(next={}) {
    const bounded=(value,fallback)=>Math.max(0,Math.min(1,Number.isFinite(Number(value))?Number(value):fallback));
    settings={sound:Boolean(next.sound),sfxVolume:bounded(next.sfxVolume??next.volume,.4),
      ambient:Boolean(next.ambient),ambientVolume:bounded(next.ambientVolume,.12),
      music:Boolean(next.music),musicVolume:bounded(next.musicVolume,.15)};
    if(sfx)sfx.volume(settings.sound?settings.sfxVolume:0);
    Object.entries(fileHowls).forEach(([name,howl])=>howl.volume(settings.sound?settings.sfxVolume*fileVolume[name]:0));
    reconcile();
  }
  function activate() {gesture=true;if(settings.sound)init();reconcile();}
  function setRoom(route) {
    const next=rooms[Array.isArray(route)?route[0]:route]||'home';
    if(next===room)return;
    room=next;stopLoops();reconcile();
  }
  function play(name='click',next) {
    if(next)configure(next);
    activate();
    if(!settings.sound||hidden||(!sprite[name]&&!files[name]))return;
    init().then(sound=>{
      if(!settings.sound||hidden)return;
      if(files[name]) {const howl=fileHowl(name);howl?.volume(settings.sfxVolume*fileVolume[name]);howl?.play();return;}
      if(sound)sound.play(name);
    }).catch(()=>{});
  }
  function playFeedback(next) {play('confirm',next);}
  function onVisibility() {hidden=document.hidden;reconcile();}
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',onVisibility);
  function dispose() {stopLoops();sfx?.unload();sfx=null;Object.keys(fileHowls).forEach(name=>{fileHowls[name].unload();delete fileHowls[name];});loading=null;gesture=false;}
  window.NexoAudio={init,configure,activate,setRoom,play,playFeedback,dispose,
    get settings(){return {...settings,room,gesture,hidden,ambientPlaying:Boolean(ambient),musicPlaying:Boolean(music)};}};
})();

;

/* game/manager.js */
/* Game registry: Phaser is downloaded exclusively through explicit loadGame(). */
(() => {
  'use strict';
  const registry = new Map();
  let current = null;
  function registerGame(id, factory) {
    if (!id || typeof factory !== 'function') throw new TypeError('Registro de juego inválido');
    registry.set(id, factory);
  }
  async function loadGame(id, host) {
    const factory = registry.get(id);
    if (!factory) throw new Error(`Juego no registrado: ${id}`);
    destroyGame();
    await window.NexoLoader.script('./vendor/phaser/phaser.min.js');
    current = factory({ Phaser: window.Phaser, host });
    return current;
  }
  function pauseGame() {current?.scene?.pause?.();current?.pause?.();}
  function resumeGame() {current?.scene?.resume?.();current?.resume?.();}
  function destroyGame() {current?.destroy?.(true);current=null;}
  if(new URLSearchParams(location.search).has('nexoDev')) {
    registerGame('dev-canvas-check',({Phaser,host})=>{
      const game=new Phaser.Game({type:Phaser.AUTO,parent:host,width:Math.max(320,host.clientWidth),
        height:240,backgroundColor:'#24223b',scene:{create() {
          this.add.text(20,24,'Nexo · prueba técnica',{fontSize:'18px',color:'#f3dfaa'});
          this.input.on('pointerdown',()=>this.cameras.main.flash(120,70,120,150));
        }}});
      const resize=()=>game.scale.resize(Math.max(320,host.clientWidth),240);
      window.addEventListener('resize',resize);
      return {scene:game.scene,destroy(){window.removeEventListener('resize',resize);game.destroy(true);}};
    });
  }
  window.NexoGame = { register:registerGame,registerGame,loadGame,
    pauseGame,resumeGame,destroyGame,unloadGame:destroyGame,registered: () => [...registry.keys()] };
})();

;

/* mascot/controller.js */
/* Context decisions only. Actual artboard animation remains Idle until the rig supports named states. */
(() => {
  'use strict';
  const intents={home:'idle',learn:'read',train:'ready',games:'play',profile:'rest',shop:'preview',planner:'watch'};
  const props={home:'window',learn:'book',train:'spellbook',games:null,profile:'cushion',shop:null,planner:'calendar'};
  let effectTimer=null;
  const roomOf=input=>typeof input==='string'?input:input?.id||'home';
  function plan({currentMascot={},currentEquipment={},currentRoom='home',currentActivity='',academicEvent=null,ambientEvent=null,
    hour=new Date().getHours()}={}) {
    const room=roomOf(currentRoom);
    const slots={...(currentMascot.slots||{}),...currentEquipment};
    const defaultIntent=intents[room]||'idle';
    const quiet=room==='home'&&hour>=0&&hour<6;
    const eventKind=academicEvent?.type||'';
    const eventIntent=eventKind==='concept_state_changed'&&academicEvent?.payload?.state==='retained'
      ?'celebrate':eventKind==='misconception_detected'?'think':null;
    const ambientIntent=ambientEvent?.room===room&&['read','watch','rest','sleep','ready','play','think'].includes(ambientEvent.intent)
      ?ambientEvent.intent:null;
    const intent=eventIntent||((currentActivity==='review'&&room==='learn')?'think':quiet?'sleep':ambientIntent||defaultIntent);
    const species=currentMascot.species||'pig';
    const equipped=['head','face','shirt','back','tail','aura','main_hand','off_hand'].some(slot=>Boolean(slots[slot]));
    const rigAnimationAvailable=species==='pig'&&!equipped;
    const availableAnimation=rigAnimationAvailable?(intent==='read'||intent==='think'?'Read':intent==='ready'?'Ready':'Idle'):'Idle';
    return Object.freeze({species,room,intent,
      desiredAnimation:intent,availableAnimation,rigAnimationAvailable,
      ambientProp:props[room]||null,slots:Object.freeze(slots),
      emote:eventIntent?'brief':null,animationPack:null});
  }
  function react(event,root=document) {
    const kind=event?.type==='misconception_detected'?'think':
      event?.type==='concept_state_changed'?'spark':null;
    if(!kind)return false;
    const figure=root.querySelector('.avatar-shell-v10:not(.mini)')
      ||document.getElementById('companionPresence')?.querySelector('.avatar-shell-v10:not(.mini)');
    if(!figure)return false;
    clearTimeout(effectTimer);
    figure.dataset.academicEmote=kind;
    effectTimer=setTimeout(()=>{delete figure.dataset.academicEmote;effectTimer=null;},1600);
    return true;
  }
  function cleanup(){clearTimeout(effectTimer);effectTimer=null;}
  window.NexoMascotController=Object.freeze({plan,intents,react,cleanup});
})();

;

/* organic-manifest.js */
/* Catálogo ligero generado desde las clases canónicas. */
window.NEXO_ORGANIC_COURSE = Object.assign(window.NEXO_ORGANIC_COURSE || {}, {
  "org-01": {
    "title": "Aminas: ¿qué nitrógeno capta H⁺ y por qué?",
    "central": "Basicidad desde el par libre, la aromaticidad y la estabilidad de la base y su ácido conjugado.",
    "duration": 85
  },
  "org-02": {
    "title": "Ácido–base: la dirección y la forma de la amina",
    "central": "¿Cuándo una amina está libre, protonada y capaz de reaccionar como nucleófilo?",
    "duration": 70
  },
  "org-03": {
    "title": "Aminas: basicidad, síntesis y heterociclos",
    "central": "¿Cómo decide el entorno del N su basicidad y qué ruta crea un enlace C–N sin sobrealquilación?",
    "duration": 95
  },
  "org-04": {
    "title": "Aromaticidad y heterociclos: cerrar el circuito",
    "central": "¿Por qué algunos anillos con dobles enlaces son aromáticos, otros antiaromáticos y otros ninguno?",
    "duration": 85
  },
  "org-05": {
    "title": "SEA: mecanismo, directores y ruta aromática",
    "central": "¿Por qué un sustituyente cambia la velocidad y la posición de la siguiente sustitución?",
    "duration": 105
  },
  "org-06": {
    "title": "Carbonilo: polarización, modelo y selectividad",
    "central": "¿Qué hace del carbono carbonílico un destino y qué decide si una adición es fácil?",
    "duration": 75
  },
  "org-07": {
    "title": "Adiciones al carbonilo: O, CN y protección",
    "central": "¿Por qué unas adiciones quedan como alcoholes y otras son equilibrios que conviene desplazar?",
    "duration": 85
  },
  "org-08": {
    "title": "Nitrógeno en carbonilos: iminas y enaminas",
    "central": "¿Por qué una amina primaria y una secundaria no dejan el mismo producto con una cetona?",
    "duration": 85
  },
  "org-09": {
    "title": "Carbonilos en síntesis: reducción, Wittig y rutas",
    "central": "¿Cómo elegir la transformación que cambia exactamente el enlace que necesito?",
    "duration": 95
  },
  "org-10": {
    "title": "Ácidos carboxílicos: estructura, acidez y síntesis",
    "central": "¿Por qué el ácido carboxílico dona H⁺ y cómo se llega a él sin perder el esqueleto?",
    "duration": 80
  },
  "org-11": {
    "title": "Derivados de ácido: sustitución acílica y selectividad",
    "central": "¿Por qué algunos carbonilos sustituyen un grupo y otros solo adicionan?",
    "duration": 85
  },
  "org-12": {
    "title": "Carbono alfa: enoles, enolatos y sustitución",
    "central": "¿Cómo puede reaccionar el carbono junto al C=O en lugar del propio carbonilo?",
    "duration": 85
  },
  "org-13": {
    "title": "Condensaciones: aldol, Michael y anulación de Robinson",
    "central": "¿Cómo construir el esqueleto de un producto nuevo, no solo reconocer el nombre de la reacción?",
    "duration": 100
  },
  "org-14": {
    "title": "Carbohidratos I: estereoquímica y cierre de anillo",
    "central": "¿Cómo puede una misma fórmula de azúcar dar estructuras y propiedades distintas?",
    "duration": 95
  },
  "org-15": {
    "title": "Carbohidratos II: reactividad y enlace glucosídico",
    "central": "¿Qué hace reductor a un azúcar y qué cambia cuando se bloquea su carbono anomérico?",
    "duration": 90
  },
  "org-16": {
    "title": "Ácidos nucleicos: base, azúcar y fosfato como sistema",
    "central": "¿Cómo una modificación química pequeña cambia la identidad y estabilidad de un nucleótido?",
    "duration": 85
  },
  "org-17": {
    "title": "Aminoácidos: carga, pI y enlace peptídico",
    "central": "¿Cómo predices la carga de un aminoácido y la dirección de su movimiento sin memorizar una tabla?",
    "duration": 90
  },
  "org-18": {
    "title": "Lípidos: estructura, saponificación y membranas",
    "central": "¿Cómo explica la estructura de un lípido su estado físico, su reactividad y su comportamiento en agua?",
    "duration": 95
  }
});

;

/* classes/catalog.js */
/* Clases que ya tienen contenido nuevo. Agregar una clase = crear su archivo de datos y sumar una línea aquí.
   Las clases que no aparecen siguen mostrando "Disponible próximamente". */
window.NexoClassCatalog = Object.freeze({
  'org-01': 'org-01.js',
  'fq-01': 'fq-01.js',
  'org-04': 'org-04.js',
  'org-05': 'org-05.js',
  'ana-01': 'ana-01.js',
  'ana-02': 'ana-02.js',
  'ana-03': 'ana-03.js',
  'fis-01': 'fis-01.js',
  'fis-02': 'fis-02.js',
  'fis-06': 'fis-06.js',
  'fis-09': 'fis-09.js'
});

;