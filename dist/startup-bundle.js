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
    async signInWithGoogle({ volver = 'profile/settings' } = {}) {
      if (!this.client || !this.googleOAuthEnabled) throw new Error('cloud_unconfigured');
      sessionStorage.setItem('nexo-google-return',volver);
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

/* design-system/pixel-text.js */
/* Letras pixel art de Nexo: una fuente propia de 5×7 (mayúsculas, números y signos) dibujada como SVG de cuadritos.
   Sirve para carteles, títulos y etiquetas cortas. El texto largo sigue en la fuente normal para que se lea bien.
   NexoPixelText.render('Próximas pruebas', { shadow: true }) -> <svg class="pixel-text"> con fill: currentColor. */
(() => {
  'use strict';
  const G = {
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'], D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'], F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'], H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'], J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'], R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'], V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'], X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'], Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    0: ['01110', '11011', '10001', '10001', '10001', '11011', '01110'], 1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], 3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    4: ['10010', '10010', '10010', '11111', '00010', '00010', '00010'], 5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    6: ['01111', '10000', '10000', '11110', '10001', '10001', '01110'], 7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], 9: ['01110', '10001', '10001', '01111', '00001', '00001', '11110'],
    '.': ['0', '0', '0', '0', '0', '0', '1'], ',': ['0', '0', '0', '0', '0', '1', '1'], ':': ['0', '1', '0', '0', '1', '0', '0'],
    '!': ['1', '1', '1', '1', '1', '0', '1'], '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'], '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'], '·': ['0', '0', '0', '1', '0', '0', '0'],
    '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'], '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
    '→': ['00000', '00100', '00010', '11111', '00010', '00100', '00000'], "'": ['1', '1', '0', '0', '0', '0', '0'],
    ' ': ['000', '000', '000', '000', '000', '000', '000'],
  };
  // Letras con marca arriba (2 filas extra sobre la letra).
  const MARKS = { 'Á': ['A', ['00010', '00100']], 'É': ['E', ['00010', '00100']], 'Í': ['I', ['00010', '00100']], 'Ó': ['O', ['00010', '00100']],
    'Ú': ['U', ['00010', '00100']], 'Ñ': ['N', ['01010', '10100']], 'Ü': ['U', ['01010', '00000']] };

  // Una sola <path> por texto (tramos horizontales de píxeles) en vez de un <rect> por píxel: el Inicio pasó de ~6000 nodos a unos pocos.
  const runs = (row, x, y) => { let d = ''; for (const m of row.matchAll(/1+/g)) d += `M${x + m.index} ${y}h${m[0].length}v1h-${m[0].length}z`; return d; };

  function render(text, { shadow = true } = {}) {
    const chars = [...String(text).toUpperCase()];
    const accented = chars.some(ch => MARKS[ch]), top = accented ? 0 : 2;
    let x = 0, d = '';
    for (const ch of chars) {
      const mark = MARKS[ch], rows = mark ? G[mark[0]] : G[ch] || G['?'];
      rows.forEach((row, y) => { d += runs(row, x, y + 2); });
      if (mark) mark[1].forEach((row, y) => { d += runs(row, x, y); });
      x += rows[0].length + 1;
    }
    const w = Math.max(1, x - 1), h = 9 - top, pad = shadow ? 1 : 0;
    const body = shadow ? `<path class="pt-shadow" transform="translate(1 1)" d="${d}"/><path class="pt-ink" d="${d}"/>` : `<path class="pt-ink" d="${d}"/>`;
    return `<svg class="pixel-text" style="--u:${h + pad}" viewBox="0 ${top} ${w + pad} ${h + pad}" role="img" aria-label="${String(text).replace(/"/g, '&quot;')}" shape-rendering="crispEdges" focusable="false">${body}</svg>`;
  }
  window.NexoPixelText = Object.freeze({ render });
})();

;

/* design-system/pixel-ui.js */
/* Kit de UI pixel art (dist/design-system/pixel-ui.css): letras pixel en la barra lateral y clic físico en botones de latón. */
(() => {
  'use strict';
  const BUTTONS = '.pu-btn,.nav-btn,.hc-btn';

  // Letras pixel para la marca y los botones de las dos barras (de escritorio y de celular), que son HTML fijo.
  function upgradeNav(root = document) {
    root.querySelectorAll('.nav-btn').forEach(button => {
      if (button.dataset.pu) return;
      button.dataset.pu = '1';
      const label = button.querySelector('b');
      if (label && window.NexoPixelText) { button.setAttribute('aria-label', label.textContent); label.innerHTML = window.NexoPixelText.render(label.textContent); }
    });
    const brand = document.querySelector('.brand span:last-child');
    if (brand && window.NexoPixelText && !brand.dataset.pu) { brand.dataset.pu = '1'; brand.innerHTML = window.NexoPixelText.render('Nexo'); }
  }

  // Clic físico: un "tac" suave de la mesa de sonidos de la app (respeta el silencio de Ajustes).
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest?.(BUTTONS);
    if (button && !button.disabled && button.getAttribute('aria-disabled') !== 'true') window.NexoAudio?.play('click');
  }, { passive: true });

  // Portal entre secciones: la pantalla nueva se abre en círculo desde el último toque (o el centro si fue con teclado).
  // Usa View Transitions; sin soporte, con movimiento reducido o calidad baja la pantalla solo cambia.
  let point = null, busy = false;
  document.addEventListener('pointerdown', event => { point = { x: event.clientX, y: event.clientY, at: Date.now() }; }, { passive: true, capture: true });
  const calm = () => !document.startViewTransition || busy || matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.body.classList.contains('reduce-motion') || document.body.dataset.nexoAmbientMotion === 'reduced' || document.body.dataset.nexoQuality === 'low';
  function transition(update) {
    if (calm()) return update();
    const fresh = point && Date.now() - point.at < 1500, root = document.documentElement.style;
    root.setProperty('--vt-x', `${fresh ? point.x : innerWidth / 2}px`);
    root.setProperty('--vt-y', `${fresh ? point.y : innerHeight / 3}px`);
    busy = true;
    let done = false;
    const once = () => { if (done) return; done = true; busy = false; update(); };
    try {
      const run = document.startViewTransition(once);
      run.ready.catch(() => {}); run.updateCallbackDone.catch(() => {}); // si el navegador salta la animación, no es un error
      run.finished.catch(() => {}).finally(() => { busy = false; });
      setTimeout(once, 800); // si el navegador no alcanza a pintar el cuadro (pestaña oculta), la pantalla igual cambia
    } catch (_) { once(); }
  }

  upgradeNav();
  window.NexoPixelUI = Object.freeze({ upgradeNav, transition });
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
      lightingProfile:{sourceSlot:'window',driver:'NexoAmbientTime',states:['dawn','day','dusk','night'],continuous:true}
    },
    // 5 oct 2026 — refugio en pixel art (tools/home-pixel/build_refugio.py). 418×235 px de arte ×4.
    // Coordenadas en el mismo sistema 1672×941; por ahora solo tintes de hora (las capas animadas vienen después).
    'refugio-pixel':{
      sceneId:'refugio-pixel',referenceWidth:1672,referenceHeight:941,
      backgroundAsset:'assets/home-scenes/refugio-pixel.png',cleanPlateAsset:null,pixelArt:true,
      layers:{background:0,ambientBack:1,modularObjects:2,mascotBack:3,mascot:4,mascotFront:5,ambientFront:6,integratedUI:7,hotspots:8},
      slots:[{id:'window',type:'window',zone:'window-area',bounds:[72/1672,64/941,280/1672,344/941],layer:'modularObjects',renderMode:'baked',asset:null,foregroundAsset:null,replacementReady:false}],
      hotspots:[
        {id:'staff-shop',bounds:[1196/1672,192/941,104/1672,448/941],action:'route',route:'shop',accessibleLabel:'Báculo estelar: abrir la Tienda'},
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
        // La misma sala pintada con 4 luces (sol / nublado / tarde / noche); se funden con --w-* y --w-cloud.
        // Lo que se mueve (cielo, lluvia, rayos, llamas) lo pinta ambient/refugio-vida.js en un canvas encima.
        {id:'px-nublado',className:'home-light-layer home-px-light home-px-nublado',bounds:[0,0,1,1],depth:1},
        {id:'px-tarde',className:'home-light-layer home-px-light home-px-tarde',bounds:[0,0,1,1],depth:1},
        {id:'px-noche',className:'home-light-layer home-px-light home-px-noche',bounds:[0,0,1,1],depth:1}
      ],
      lightingProfile:{sourceSlot:'window',driver:'NexoAmbientTime',states:['dawn','day','dusk','night'],continuous:true}
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
  function activate(id,root,profile=getProfile()) {
    const hotspot=profile.hotspots.find(item=>item.id===id);
    if(hotspot?.action==='continue') {
      // Reutiliza el destino del botón "Abrir mapa de preparación": no se duplica la lógica.
      root.querySelector('.continue-volume .primary-btn')?.click();
      return true;
    }
    return false;
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
  window.NexoHomeScene=Object.freeze({profiles,getProfile,ambientBounds,replacementReady,render,legacyContract,activate,enhancePan});
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
    games: { name: 'Arcade', material: 'pixel', accent: '#aa79c7', art:'assets/rooms/games.webp' },
    profile: { name: 'Habitación', material: 'wood', accent: '#b9a587', art:'assets/rooms/profile.webp' },
    shop: { name: 'Mercado', material: 'ink', accent: '#d9ac68' },
    planner: { name: 'Bitácora', material: 'paper', accent: '#76aaa9' }
  });
  const roomRoutes = Object.freeze({
    home:'home', subjects:'learn', subject:'learn', lesson:'learn', learn:'learn',
    library:'learn', knowledge:'learn', inspector:'learn',
    practice:'learn', reviews:'learn', rescue:'learn',
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

/* ambient/weather.js */
/* Clima real de Santiago para el refugio (Open-Meteo, autorizado 3 oct 2026).
   - Ubicación fija (no se pide la del dispositivo), máx. una consulta cada 30 min y solo con la pestaña visible.
   - Sin internet o si algo falla: despejado (Nexo no inventa lluvia).
   - Escribe pesos 0..1 (--w-cloud, --w-rain, --w-storm) para fundidos graduales, igual que --w-* de la luz,
     y body[data-nexo-weather] para quien necesite el nombre (la mascota). Avisa con el evento 'nexo:weather'.
   Consola: NexoWeather.preview('rain') · preview('storm') · preview('cloudy') · stopPreview(). */
(() => {
  'use strict';
  if (typeof document === 'undefined') return;
  const KEY = 'nexo.weather.v2', MAX_AGE = 30 * 60 * 1000;
  const URL = 'https://api.open-meteo.com/v1/forecast?latitude=-33.45&longitude=-70.66&current=weather_code,cloud_cover';
  const KINDS = ['clear', 'cloudy', 'fog', 'drizzle', 'rain', 'storm'];
  let state = { kind: 'clear', cover: 0, code: 0, at: 0 }, previewing = null, timer = null, inflight = false;

  // Código WMO -> tipo de clima de Nexo.
  function kindOf(code) {
    if (code >= 95) return 'storm';
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if (code >= 51 && code <= 57) return 'drizzle';
    if (code === 45 || code === 48) return 'fog';
    if (code === 3 || (code >= 71 && code <= 77) || code === 85 || code === 86) return 'cloudy';
    return 'clear';                                   // 0, 1, 2: despejado o con algunas nubes
  }
  function weights(s) {
    const cover = Math.max(0, Math.min(100, Number(s.cover) || 0)) / 100;
    const cloud = s.kind === 'clear' ? Math.min(0.45, cover * 0.5) : s.kind === 'cloudy' ? Math.max(0.75, cover) : 1;
    const rain = s.kind === 'storm' || s.kind === 'rain' ? 1 : s.kind === 'drizzle' ? 0.5 : 0;
    return { cloud, rain, storm: s.kind === 'storm' ? 1 : 0, fog: s.kind === 'fog' ? 1 : 0 };
  }
  function current() { return previewing || state; }
  function apply() {
    const s = current(), w = weights(s), style = document.body?.style;
    if (!style) return;
    style.setProperty('--w-cloud', w.cloud.toFixed(3));
    style.setProperty('--w-rain', w.rain.toFixed(3));
    style.setProperty('--w-storm', w.storm.toFixed(3));
    document.body.dataset.nexoWeather = s.kind;
    document.dispatchEvent(new CustomEvent('nexo:weather', { detail: { ...s, ...w } }));
  }
  function readCache() {
    try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && KINDS.includes(c.kind)) return c; } catch (_) {}
    return null;
  }
  function writeCache(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {} }
  async function refresh(force = false) {
    if (inflight || document.hidden || typeof fetch !== 'function') return;
    const cached = readCache();
    if (cached) state = cached;
    if (!force && cached && Date.now() - cached.at < MAX_AGE) { apply(); return; }
    inflight = true;
    try {
      const r = await fetch(URL, { cache: 'no-store' });
      const cur = (await r.json()).current || {};
      const code = Number(cur.weather_code) || 0;
      state = { kind: kindOf(code), cover: Number(cur.cloud_cover) || 0, code, at: Date.now() };
      writeCache(state);
    } catch (_) {
      if (!cached) state = { kind: 'clear', cover: 0, code: 0, at: Date.now() };
    } finally { inflight = false; apply(); }
  }
  function preview(kind = 'rain', cover) {
    if (!KINDS.includes(kind)) throw new Error('Clima desconocido: ' + kind + ' (usa ' + KINDS.join(', ') + ')');
    previewing = { kind, cover: cover ?? (kind === 'clear' ? 10 : 90), code: -1, at: Date.now() };
    apply();
  }
  function stopPreview() { previewing = null; apply(); }
  function start() {
    if (timer) return;
    const cached = readCache(); if (cached) state = cached;
    apply(); refresh();
    timer = setInterval(() => refresh(), 10 * 60 * 1000);   // solo consulta de verdad si el dato tiene más de 30 min
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  }
  window.NexoWeather = Object.freeze({ start, refresh, preview, stopPreview, current, weights, kindOf, kinds: KINDS });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

;

/* ambient/refugio-vida.js */
/* Vida del refugio pixel (11 oct 2026): un <canvas> de 418×235 px de arte sobre el fondo, escalado ×4 sin difuminar.
   Pinta lo que se mueve: el cielo de la ventana según la hora y el clima real (nubes que avanzan, pájaros, sol, luna,
   estrellas, lluvia, gotas en el vidrio, relámpagos suaves), los rayos de sol que se desplazan dentro del haz y el
   halo de cada llama, que titila. Todo sale de tools/home-pixel/build_refugio.py (refugio-pixel-mapa.json + máscaras).
   ~10 cuadros/s (5 con calidad baja); se detiene con la pestaña oculta o ambient-paused. Con movimiento reducido:
   un cuadro fijo que igual respeta la hora y el clima. */
(() => {
  'use strict';
  if (typeof document === 'undefined') return;
  const BASE = 'assets/home-scenes/', FPS = 10;
  let assets = null, loading = null, live = null;

  const loadImage = src => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  // Una imagen en escala de grises (máscara) -> canvas cuyo canal alfa es ese gris.
  function alphaMask(img) {
    const c = canvas(img.width, img.height), x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) { d.data[i + 3] = d.data[i]; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; }
    x.putImageData(d, 0, 0);
    return { canvas: c, data: d.data };
  }

  async function loadAssets() {
    if (assets) return assets;
    if (loading) return loading;
    loading = (async () => {
      const map = await (await fetch(BASE + 'refugio-pixel-mapa.json')).json();
      const [bg, glass, haz, ...lands] = await Promise.all([
        loadImage(BASE + 'refugio-pixel.png'), loadImage(BASE + 'refugio-pixel-vidrio.png'), loadImage(BASE + 'refugio-pixel-haz.png'),
        ...['sol', 'nublado', 'tarde', 'noche'].map(m => loadImage(BASE + `refugio-pixel-paisaje-${m}.png`))]);
      const [x0, y0, x1, y1] = map.window, ww = x1 - x0, wh = y1 - y0;
      const hz = alphaMask(haz), rays = [];
      for (let y = 0; y < haz.height; y += 1) for (let x = 0; x < haz.width; x += 1) {
        const v = hz.data[(y * haz.width + x) * 4 + 3] / 255;
        if (v > 0.08) rays.push(x, y, v);
      }
      const r = rng(7);
      const stars = Array.from({ length: 34 }, () => [Math.floor(r() * ww), Math.floor(r() * wh * 0.6), r()]);
      const clouds = Array.from({ length: 9 }, (_, i) => ({
        shape: Array.from({ length: 5 + Math.floor(r() * 4) }, (_, k) => [(k - 3) * (3.5 + r() * 3), (r() - 0.5) * 3.5, 3 + r() * 4.2]),
        y: 6 + r() * (wh * 0.45), x: r() * (ww + 40), speed: 4 + r() * 6, order: i,
      }));
      const drops = Array.from({ length: 70 }, () => [r(), r(), 0.8 + r() * 0.4, 3 + Math.floor(r() * 2)]);
      const glassDrops = Array.from({ length: 9 }, () => [r() * ww, r() * wh, 2 + r() * 5, r()]);
      const motes = Array.from({ length: 40 }, () => Math.floor(r() * (rays.length / 3)) * 3);
      assets = { map, ww, wh, glass: alphaMask(glass).canvas, rays, raysW: haz.width, raysH: haz.height,
        lands: { sol: lands[0], nublado: lands[1], tarde: lands[2], noche: lands[3] }, stars, clouds, drops, glassDrops, motes,
        cloudCache: new Map(), halos: { small: halo(10), big: halo(17), fly: halo(5, [190, 255, 110]), potion: halo(9, [90, 210, 230]) },
        ...leafLayers(bg), shadow: cloudShadow(), flies: Array.from({ length: 12 }, () => [24 + r() * 370, 50 + r() * 150, r() * 6.28, r() * 6.28]) };
      return assets;
    })();
    return loading;
  }

  // Halo de pixel art: anillos de borde duro con un poco de tramado entre anillos.
  function halo(radius, rgb = [255, 180, 70]) {
    const size = radius * 2 + 1, c = canvas(size, size), x = c.getContext('2d'), d = x.createImageData(size, size);
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let j = 0; j < size; j += 1) for (let i = 0; i < size; i += 1) {
      const t = Math.max(0, 1 - Math.hypot(i - radius, j - radius) / radius);
      const step = Math.floor(t * 3 + (bayer[(j % 4) * 4 + (i % 4)] / 16) * 0.7) / 3, k = (j * size + i) * 4;
      d.data[k] = rgb[0]; d.data[k + 1] = rgb[1]; d.data[k + 2] = rgb[2]; d.data[k + 3] = Math.round(step * step * 255);
    }
    x.putImageData(d, 0, 0);
    return c;
  }

  // Nube dibujada con su paleta (luz arriba, sombra abajo), guardada para no rehacerla cada cuadro.
  function cloudSprite(A, cloud, palette, shift) {
    const key = cloud.order + palette + shift;
    if (A.cloudCache.has(key)) return A.cloudCache.get(key);
    const cols = A.map.clouds[palette].map(hex), W = 52, H = 22, c = canvas(W, H), x = c.getContext('2d'), d = x.createImageData(W, H);
    for (let j = 0; j < H; j += 1) for (let i = 0; i < W; i += 1) {
      let lv = -1;
      for (const [ox, oy, r] of cloud.shape) {
        const dy = j - (H / 2 + oy), dist = Math.hypot(i - (W / 2 + ox), dy * 1.25);
        if (dist <= r) lv = Math.max(lv, dy < -r * 0.35 ? 3 : dy > r * 0.35 ? 1 : 2);
      }
      if (lv < 0) continue;
      const [r, g, b] = cols[Math.max(0, Math.min(cols.length - 1, lv + shift))], k = (j * W + i) * 4;
      d.data[k] = r; d.data[k + 1] = g; d.data[k + 2] = b; d.data[k + 3] = 255;
    }
    x.putImageData(d, 0, 0);
    A.cloudCache.set(key, c);
    return c;
  }

  // Hojas del fondo repartidas en 6 franjas diagonales: cada franja se ilumina un rato, así una ola de luz recorre la hiedra.
  const LEAF_BANDS = 6;
  function leafLayers(bg) {
    const W = 418, H = 235, tmp = canvas(W, H), tx = tmp.getContext('2d');
    tx.imageSmoothingEnabled = false; tx.drawImage(bg, 0, 0, W, H);
    const px = tx.getImageData(0, 0, W, H).data, bands = Array.from({ length: LEAF_BANDS }, () => { const c = canvas(W, H); return { c, x: c.getContext('2d'), d: null }; });
    bands.forEach(b => { b.d = b.x.createImageData(W, H); });
    const spawn = [];
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
      const k = (y * W + x) * 4, r = px[k], g = px[k + 1], b = px[k + 2];
      if (g > r + 8 && g > b + 8 && g > 70) {
        const band = Math.floor((x * 0.65 + y * 0.35) / 9) % LEAF_BANDS, d = bands[band].d.data;
        d[k] = 205; d[k + 1] = 235; d[k + 2] = 120; d[k + 3] = 255;
        if (y < 150 && (x + y * 3) % 17 === 0) spawn.push([x, y]);
      }
    }
    bands.forEach(b => b.x.putImageData(b.d, 0, 0));
    return { leafBands: bands.map(b => b.c), leafSpawn: spawn };
  }

  // Sombra de nube sobre el piso: óvalo tramado (dos niveles) que cruza la sala despacio.
  function cloudShadow() {
    const W = 110, H = 26, c = canvas(W, H), x = c.getContext('2d'), d = x.createImageData(W, H), bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let j = 0; j < H; j += 1) for (let i = 0; i < W; i += 1) {
      const e = Math.hypot((i - W / 2) / (W / 2), (j - H / 2) / (H / 2));
      if (e >= 1) continue;
      const v = (1 - e) * 2 + bayer[(j % 4) * 4 + (i % 4)] / 16 - 0.45, k = (j * W + i) * 4;
      if (v < 0.7) continue;
      d.data[k] = 20; d.data[k + 1] = 24; d.data[k + 2] = 44; d.data[k + 3] = v > 1.5 ? 70 : 38;
    }
    x.putImageData(d, 0, 0);
    return c;
  }

  function readWeights() {
    const s = document.body.style, n = k => Number(s.getPropertyValue(k)) || 0;
    const w = { dawn: n('--w-dawn'), day: n('--w-day'), dusk: n('--w-dusk'), night: n('--w-night') };
    if (w.dawn + w.day + w.dusk + w.night < 0.01) w.day = 1;
    const wx = window.NexoWeather ? { ...window.NexoWeather.current(), ...window.NexoWeather.weights(window.NexoWeather.current()) }
      : { kind: 'clear', cover: 0, cloud: 0, rain: 0, storm: 0, fog: 0 };
    return { w, wx, hour: Number(document.body.dataset.nexoHour) || 12 };
  }

  // Mezcla varias capas con sus pesos (promedio exacto con alfa acumulado).
  function blend(ctx, items, drawItem) {
    let acc = 0;
    for (const [key, weight] of items) {
      if (weight < 0.01) continue;
      ctx.globalAlpha = acc === 0 ? 1 : weight / (acc + weight);
      drawItem(key); acc += weight;
    }
    ctx.globalAlpha = 1;
  }

  function drawWindow(L, t) {
    const A = L.A, { ww, wh } = A, x = L.wctx, { w, wx, hour } = L.env;
    x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, ww, wh);
    const horizon = Math.round(wh * 0.66), dayish = w.day + w.dawn * 0.6 + w.dusk * 0.4;
    // 1) cielo en bandas limpias, con una fila tramada entre banda y banda
    const sky = name => {
      const cols = A.map.skies[name];
      for (let y = 0; y < wh; y += 1) {
        const f = Math.min(cols.length - 1, (y / horizon) * cols.length), b = Math.floor(f);
        const edge = f - b > 0.82 && b + 1 < cols.length;
        x.fillStyle = cols[b]; x.fillRect(0, y, ww, 1);
        if (edge) { x.fillStyle = cols[b + 1]; for (let i = y % 2; i < ww; i += 2) x.fillRect(i, y, 1, 1); }
      }
    };
    const grey = wx.cloud;
    blend(x, [['day', w.day * (1 - grey)], ['cloudy', (w.day + w.dawn * 0.5) * grey], ['dawn', w.dawn * (1 - grey * 0.5)],
      ['dusk', w.dusk * (1 - grey * 0.4)], ['night', w.night]], sky);
    // 2) estrellas y luna (de noche, si no está nublado)
    const starA = w.night * (1 - grey * 0.9);
    if (starA > 0.05) {
      for (const [sx, sy, p] of A.stars) {
        const on = Math.sin(t * (1.2 + p * 2) + p * 30) > -0.4;
        x.globalAlpha = starA * (on ? (p > 0.75 ? 1 : 0.65) : 0.25);
        x.fillStyle = p > 0.85 ? '#fff6d0' : '#cfd8ff'; x.fillRect(sx, sy, 1, 1);
      }
      const mx = Math.round(ww * 0.72), my = 9;
      x.globalAlpha = starA;
      for (let j = -4; j <= 4; j += 1) for (let i = -4; i <= 4; i += 1) {
        if (Math.hypot(i, j) > 3.6 || Math.hypot(i + 1.6, j - 0.8) < 3) continue;   // media luna
        x.fillStyle = i + j < -2 ? '#fffbe8' : '#e6e2c8'; x.fillRect(mx + i, my + j, 1, 1);
      }
      x.globalAlpha = 1;
    }
    // 3) sol: recorre la ventana según la hora (sale a la izquierda, se pone a la derecha)
    const sunA = (w.day + w.dawn + w.dusk) * (1 - grey);
    if (sunA > 0.05 && hour > 6 && hour < 20.5) {
      const p = Math.max(0, Math.min(1, (hour - 6.5) / 13)), sx = Math.round(4 + p * (ww - 8));
      const sy = Math.round(horizon - Math.sin(p * Math.PI) * (horizon - 9)), low = w.dusk + w.dawn, rad = low > 0.5 ? 4 : 3;
      x.globalAlpha = sunA;
      for (let j = -rad - 2; j <= rad + 2; j += 1) for (let i = -rad - 2; i <= rad + 2; i += 1) {
        const dd = Math.hypot(i, j);
        if (dd <= rad) { x.fillStyle = low > 0.5 ? (dd < rad - 1.5 ? '#ffe890' : '#f89a30') : (dd < rad - 1 ? '#fffce8' : '#ffe890'); x.fillRect(sx + i, sy + j, 1, 1); }
        else if (dd <= rad + 2 && (i + j) % 2 === 0) { x.fillStyle = low > 0.5 ? '#ffc850' : '#fff8d4'; x.globalAlpha = sunA * 0.5; x.fillRect(sx + i, sy + j, 1, 1); x.globalAlpha = sunA; }
      }
      x.globalAlpha = 1;
    }
    // 4) nubes que avanzan (más y más grises si está nublado o llueve)
    const nClouds = wx.kind === 'clear' ? 4 + Math.round((wx.cover / 100) * 4) : 9;
    const palette = w.night > 0.5 ? 'night' : grey > 0.5 || wx.rain > 0 ? 'cloudy' : w.dusk > 0.4 ? 'dusk' : w.dawn > 0.4 ? 'dawn' : 'day';
    const shift = wx.storm ? -1 : wx.rain > 0.6 ? -1 : 0;
    const wind = 1 + wx.rain * 0.8 + wx.storm;
    for (const cl of A.clouds.slice(0, nClouds)) {
      const span = ww + 56, cx = ((cl.x + t * cl.speed * wind) % span + span) % span - 28;
      const cy = wx.kind === 'clear' ? cl.y : cl.y * 0.7;
      x.drawImage(cloudSprite(A, cl, palette, shift), Math.round(cx - 26), Math.round(cy - 11));
    }
    if (wx.rain > 0 || wx.kind === 'cloudy') { x.globalAlpha = 0.25 * Math.max(wx.rain, grey * 0.6); x.fillStyle = '#2a3244'; x.fillRect(0, 0, ww, wh); x.globalAlpha = 1; }
    // 5) paisaje con la luz de la hora (pintado en Python con las rampas)
    blend(x, [['sol', w.day * (1 - grey)], ['nublado', (w.day) * grey], ['tarde', w.dawn + w.dusk], ['noche', w.night]],
      k => x.drawImage(A.lands[k], 0, 0));
    // 6) niebla
    if (wx.fog) {
      x.fillStyle = w.night > 0.5 ? '#3a4058' : '#c8ccd4';
      for (let k = 0; k < 3; k += 1) { x.globalAlpha = 0.35; x.fillRect(0, Math.round(horizon - 12 + k * 7 + Math.sin(t * 0.3 + k) * 2), ww, 4); }
      x.globalAlpha = 1;
    }
    // 7) pájaros: una bandada cruza cada ~22 s con buen tiempo de día
    if (dayish > 0.5 && wx.rain === 0 && !wx.storm) {
      const cyc = t % 22, bx = -6 + cyc * 5;
      if (bx < ww + 10) {
        x.fillStyle = w.dusk > 0.4 ? '#2a1a26' : '#3a2f33';
        [[0, 0], [-4, 2], [-7, -1], [-10, 3]].forEach(([ox, oy], k) => {
          const px = Math.round(bx + ox), py = Math.round(24 + oy + Math.sin(t * 2 + k) * 0.8), up = Math.floor(t * 4 + k) % 2 === 0;
          x.fillRect(px, py, 1, 1); x.fillRect(px - 1, py - (up ? 1 : 0), 1, 1); x.fillRect(px + 1, py - (up ? 1 : 0), 1, 1);
          if (!up) { x.fillRect(px - 2, py + 1, 1, 1); x.fillRect(px + 2, py + 1, 1, 1); }
        });
      }
    }
    // 8) lluvia: rayitas inclinadas que caen rápido + gotas que bajan por el vidrio
    if (wx.rain > 0) {
      const n = Math.round(A.drops.length * (wx.storm ? 1 : wx.rain >= 1 ? 0.65 : 0.3));
      x.fillStyle = w.night > 0.5 ? '#7c8ab0' : '#c4d0e6';
      for (const [rx, ry, sp, len] of A.drops.slice(0, n)) {
        const y0 = ((ry * (wh + 10) + t * 75 * sp) % (wh + 10)) - 6, x0 = rx * (ww + 20) - (y0 * 0.3);
        x.globalAlpha = 0.6;
        for (let k = 0; k < len; k += 1) x.fillRect(Math.round(x0 - k * 0.3), Math.round(y0 + k), 1, 1);
      }
      x.globalAlpha = 1;
      for (const g of A.glassDrops) {
        const gy = (g[1] + t * g[2]) % (wh + 4) - 2, gx = Math.round(g[0] + Math.sin(gy * 0.3 + g[3] * 9) * 0.6);
        x.fillStyle = '#9fb0c8'; x.globalAlpha = 0.5; x.fillRect(gx, Math.round(gy) - 3, 1, 3);
        x.globalAlpha = 0.85; x.fillStyle = '#e6eef8'; x.fillRect(gx, Math.round(gy), 1, 1); x.fillStyle = '#5c6a84'; x.fillRect(gx, Math.round(gy) + 1, 1, 1);
      }
      x.globalAlpha = 1;
    }
    // 9) relámpago: destello suave y raro (nunca con reduced-motion)
    if (wx.storm && !L.still) {
      if (t > L.nextFlash) { L.flashUntil = t + 0.22; L.nextFlash = t + 7 + Math.random() * 12; }
      if (t < L.flashUntil) { x.globalAlpha = 0.65; x.fillStyle = '#eef2ff'; x.fillRect(0, 0, ww, wh); x.globalAlpha = 1; }
    }
    // sólo queda lo que cae sobre el vidrio (el marco, los parteluces, la cortina y la hiedra quedan intactos)
    x.globalCompositeOperation = 'destination-in'; x.drawImage(A.glass, 0, 0); x.globalCompositeOperation = 'source-over';
  }

  function drawRays(L, t) {
    const A = L.A, { w, wx } = L.env, d = L.rayData.data, R = A.rays;
    const S = (w.day + w.dawn * 0.6 + w.dusk * 0.5) * Math.pow(1 - wx.cloud, 1.5) * (1 - wx.rain);
    L.raysOn = S > 0.03;
    if (!L.raysOn) return;
    const warm = w.dusk + w.dawn > 0.5 ? [255, 176, 96] : [255, 240, 186];
    for (let i = 0; i < R.length; i += 3) {
      const px = R[i], py = R[i + 1], v = R[i + 2], u = px - py * 0.62;
      const band = 0.5 + 0.5 * Math.sin(u * 0.21 - t * 0.55) + 0.28 * Math.sin(u * 0.53 + t * 0.9);
      const q = band > 1.05 ? 2 : band > 0.72 ? 1 : 0, k = (py * A.raysW + px) * 4;
      d[k] = warm[0]; d[k + 1] = warm[1]; d[k + 2] = warm[2]; d[k + 3] = Math.round(v * q * 34 * S);
    }
    L.rayCtx.putImageData(L.rayData, 0, 0);
  }

  function frame() {
    const L = live; if (!L) return;
    if (!L.canvas.isConnected) { unmount(); return; }
    const t = L.still ? 0 : performance.now() / 1000, A = L.A, ctx = L.ctx, [x0, y0] = A.map.window;
    L.env = readWeights();
    const { w, wx } = L.env;
    ctx.clearRect(0, 0, L.canvas.width, L.canvas.height);
    drawWindow(L, t);
    ctx.drawImage(L.win, x0, y0);
    drawRays(L, t);
    if (L.raysOn) {
      ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(L.rayCanvas, 0, 0);
      const S = (w.day + w.dawn * 0.6 + w.dusk * 0.5) * (1 - wx.cloud) * (1 - wx.rain);
      ctx.fillStyle = '#fff3c8';
      A.motes.forEach((m, k) => {                         // polvo que flota dentro del haz
        const mx = Math.round(A.rays[m] + Math.sin(t * 0.4 + k) * 3), my = Math.round(A.rays[m + 1] - ((t * 1.5 + k * 5) % 14));
        ctx.globalAlpha = 0.55 * S; ctx.fillRect(mx, my, 1, 1);
      });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    // llamas: la forma cambia y el halo respira; de noche (o nublado) el halo pesa más
    const lamps = 0.3 + 0.7 * Math.min(1, w.night + w.dusk * 0.6 + wx.cloud * 0.3), cols = A.map.ramps.flame;
    const lv = { h: 2, f: 3, w: 5, r: 1 };
    A.map.flames.forEach(([fx, fy, kind], i) => {
      const frames = kind === 'big' ? A.map.bigFlames : A.map.smallFlames;
      const rows = frames[L.still ? 0 : Math.floor(t * 4 + i * 1.3) % frames.length];
      rows.forEach((row, j) => { for (let k = 0; k < row.length; k += 1) { const ch = row[k]; if (lv[ch] === undefined) continue; ctx.fillStyle = cols[lv[ch]]; ctx.fillRect(fx + k, fy + j, 1, 1); } });
      const h = kind === 'big' ? A.halos.big : A.halos.small, cx = fx + (kind === 'big' ? 2 : 1), cy = fy + (kind === 'big' ? 3 : 1);
      const flick = L.still ? 0.5 : 0.5 + 0.3 * Math.sin(t * 7.3 + i * 2.1) + 0.2 * Math.sin(t * 12.1 + i);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = lamps * (0.22 + 0.18 * flick);
      ctx.drawImage(h, cx - (h.width >> 1), cy - (h.height >> 1));
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    });
    const dt = Math.min(0.25, Math.max(0, t - (L.lastT ?? t))); L.lastT = t;
    if (!L.still) drawExtras(L, t, dt);
    // el relámpago también se nota un poquito en la sala
    if (wx.storm && t < L.flashUntil) { ctx.globalAlpha = 0.08; ctx.fillStyle = '#d8e0ff'; ctx.fillRect(0, 0, L.canvas.width, L.canvas.height); ctx.globalAlpha = 1; }
  }

  // Lo que se mueve en toda la sala (no solo en la ventana): sombra de nubes, brillo de la hiedra, hojas y páginas que caen,
  // burbujas y vapor de la poción, polvo de luz y luciérnagas de noche.
  function drawExtras(L, t, dt) {
    const A = L.A, ctx = L.ctx, { w, wx } = L.env, low = document.body.dataset.nexoQuality === 'low';
    const fair = (w.day + w.dawn * 0.6 + w.dusk * 0.4) * (1 - wx.cloud) * (1 - wx.rain);
    if (fair > 0.05) {                                                         // sombra de nube sobre el piso
      ctx.globalAlpha = Math.min(1, fair * 1.2);
      for (let k = 0; k < 2; k += 1) {
        const span = 418 + 160, sx = ((k * 230 + t * (5 + k * 2)) % span + span) % span - 120;
        ctx.drawImage(A.shadow, Math.round(sx), 150 + k * 38);
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'lighter';                                   // ola de luz que recorre la hiedra
    const lit = 0.25 + 0.75 * Math.min(1, w.day + w.dawn * 0.7 + w.dusk * 0.4 + 0.3);
    A.leafBands.forEach((band, i) => {
      const a = Math.max(0, Math.sin(t * 1.4 - i * 1.05)) ** 2 * 0.2 * lit;
      if (a > 0.01) { ctx.globalAlpha = a; ctx.drawImage(band, 0, 0); }
    });
    ctx.globalAlpha = 0.14 + 0.07 * Math.sin(t * 2.2); ctx.drawImage(A.halos.potion, 126, 57);   // la poción de la estantería brilla
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 5; i += 1) {                                            // burbujas que suben por el frasco
      const p = (t * 0.55 + i * 0.37) % 1, by = Math.round(70 - p * 12), bx = Math.round(135 + Math.sin(t * 2 + i * 2) * 1.6);
      ctx.globalAlpha = 1 - p * 0.7; ctx.fillStyle = i % 2 ? '#e0fcff' : '#9ce8f0'; ctx.fillRect(bx, by, 1, 1);
    }
    for (let i = 0; i < 3; i += 1) {                                            // vapor verde que sale del cuello
      const p = (t * 0.3 + i / 3) % 1, vy = Math.round(56 - p * 14), vx = Math.round(135 + Math.sin(t * 1.3 + i * 2.4) * 3 * p);
      ctx.globalAlpha = (1 - p) * 0.55; ctx.fillStyle = '#cfeedd'; ctx.fillRect(vx - 1, vy, 2, 1); ctx.fillRect(vx, vy - 1, 1, 1);
    }
    ctx.globalAlpha = 1;
    if (!low) {                                                                  // polvo de luz por toda la sala
      ctx.fillStyle = '#fff3c8';
      for (let i = 0; i < 26; i += 1) {
        const x = (i * 97 % 400) + 9 + Math.sin(t * 0.25 + i) * 6, y = 20 + (((i * 53) % 170 - t * (0.8 + (i % 5) * 0.25)) % 170 + 170) % 170;
        ctx.globalAlpha = (0.15 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.7))) * Math.max(fair, 0.25); ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    const night = (w.night + w.dusk * 0.5) * (1 - wx.rain);
    if (night > 0.1) {                                                           // luciérnagas
      ctx.globalCompositeOperation = 'lighter';
      A.flies.forEach(([bx, by, p, q]) => {
        const x = Math.round(bx + Math.sin(t * 0.32 + p) * 16 + Math.sin(t * 0.9 + q) * 4), y = Math.round(by + Math.sin(t * 0.47 + q) * 9),
          on = Math.max(0, Math.sin(t * 1.5 + p * 5)) ** 2 * night;
        if (on < 0.05) return;
        ctx.globalAlpha = on * 0.5; ctx.drawImage(A.halos.fly, x - 5, y - 5);
        ctx.globalAlpha = on; ctx.fillStyle = '#eaff9a'; ctx.fillRect(x, y, 1, 1);
      });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    // hojas que se sueltan de la hiedra y páginas que se escapan de la estantería
    L.fall = L.fall || []; L.nextFall = L.nextFall ?? t + 2;
    if (t > L.nextFall && L.fall.length < (low ? 3 : 7)) {
      const page = Math.random() < 0.18, s = A.leafSpawn[Math.floor(Math.random() * A.leafSpawn.length)] || [200, 40];
      L.fall.push(page ? { page: true, x: 104 + Math.random() * 50, y: 33, vx: 3, vy: 5.5, ph: Math.random() * 6, born: t }
        : { page: false, x: s[0], y: s[1], vx: 0, vy: 6 + Math.random() * 4, ph: Math.random() * 6, born: t, dark: Math.random() < 0.4 });
      L.nextFall = t + 2.5 + Math.random() * 3.5;
    }
    L.fall = L.fall.filter(f => f.y < 205);
    for (const f of L.fall) {
      f.y += f.vy * dt; f.x += (f.vx + Math.sin(t * 2.2 + f.ph) * 9) * dt;
      const a = Math.min(1, (t - f.born) * 2, (205 - f.y) / 20), flap = Math.floor(t * 5 + f.ph) % 2, x = Math.round(f.x), y = Math.round(f.y);
      ctx.globalAlpha = Math.max(0, a);
      if (f.page) {
        ctx.fillStyle = '#e6d6b2'; ctx.fillRect(x, y, flap ? 4 : 3, flap ? 3 : 4);
        ctx.fillStyle = '#a69070'; ctx.fillRect(x, y + (flap ? 2 : 3), flap ? 4 : 3, 1);
      } else {
        ctx.fillStyle = f.dark ? '#3f6e2d' : '#83ad42'; ctx.fillRect(x, y, flap ? 3 : 2, flap ? 1 : 2);
        ctx.fillStyle = f.dark ? '#2a5228' : '#5d8c36'; ctx.fillRect(x + 1, y + 1, 2, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  function stillMode() {
    const b = document.body;
    return matchMedia('(prefers-reduced-motion: reduce)').matches || b.classList.contains('reduce-motion')
      || b.dataset.nexoAmbientMotion === 'reduced';
  }
  function schedule() {
    const L = live; if (!L) return;
    clearTimeout(L.timer);
    const paused = document.hidden || document.body.classList.contains('ambient-paused');
    L.still = stillMode();
    if (!paused) frame();
    // animado: ~10 cuadros/s; quieto o en pausa: revisa cada 30 s por si cambió la hora o el clima
    const fps = document.body.dataset.nexoQuality === 'low' ? FPS / 2 : FPS;        // calidad baja: más lento, pero vivo
    L.timer = setTimeout(schedule, paused || L.still ? 30000 : 1000 / fps);
  }

  async function mount(plane) {
    if (!plane || live?.plane === plane) return;
    unmount();
    let A;
    try { A = await loadAssets(); } catch (_) { return; }       // si falla, queda el fondo pintado (también correcto)
    if (!plane.isConnected) return;
    const [W, H] = A.map.size, c = canvas(W, H);
    c.className = 'refugio-vida'; c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none;z-index:2';
    plane.prepend(c);
    const win = canvas(A.ww, A.wh), rayCanvas = canvas(A.raysW, A.raysH), rayCtx = rayCanvas.getContext('2d');
    live = { plane, canvas: c, ctx: c.getContext('2d'), A, win, wctx: win.getContext('2d'), rayCanvas, rayCtx,
      rayData: rayCtx.createImageData(A.raysW, A.raysH), timer: null, nextFlash: 4, flashUntil: 0, still: false };
    schedule();
  }
  function unmount() {
    if (!live) return;
    clearTimeout(live.timer); live.canvas.remove(); live = null;
  }
  function check() {
    const plane = document.querySelector('.home-art-plane[data-scene-id="refugio-pixel"]');
    if (plane) mount(plane); else unmount();
  }
  function start() {
    const app = document.getElementById('app');
    if (app) new MutationObserver(check).observe(app, { childList: true });
    document.addEventListener('nexo:weather', () => live && schedule());
    document.addEventListener('visibilitychange', () => live && schedule());
    check();
  }
  window.NexoRefugioVida = Object.freeze({ mount, unmount, check });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

;

/* ambient/events.js */
/* Deterministic, lightweight environmental moments. No timer per room. */
(() => {
  'use strict';
  const scenes=Object.freeze({
    home:[['leaves','watch'],['book','read'],['lamp','rest']],
    learn:[['book','read'],['ink','think']],
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
    const academic = (events || []).filter(e => !['class', 'work', 'personal', 'activity', 'study', 'recess'].includes(e?.type));
    for (const event of academic) {
      if (validDay(event?.date) && event.status !== 'done') {
        const date = target(event, now).date;
        loadByDay.set(date, (loadByDay.get(date) || 0) + 1);
      }
    }
    return academic.filter(event => validDay(event?.date) && event.status !== 'done')
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

/* planner/grade-rules.js */
/* Organización · Notas (UPDATE 02, Fase 2). Módulo puro (sin pantalla): se prueba con node (tools/notas-test.cjs).
   Usa NexoGrades.calculate para las cuentas y agrega: cuánto necesitas, simulador, riesgo de examen/reprobar según las reglas
   de cada ramo (docs/update-02-organizacion/DATOS-RAMOS.md), promedio general simple e inasistencias.
   Chile: la nota 3,95 se redondea a 4,0, por eso el umbral de aprobar es 3,95. Nunca declara dominio: solo hace cuentas. */
(function (root) {
  'use strict';
  const PASS = 3.95;
  const num = v => { const n = Number(String(v ?? '').trim().replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
  const known = c => { const n = num(c.grade); return c.grade !== '' && n >= 1 && n <= 7 ? n : null; };
  const fmt = (n, d = 1) => Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '—';
  const ceil1 = n => Math.ceil(n * 10 - 1e-9) / 10;                 // con ese número alcanza
  const level = n => n === null || n === undefined ? 'vacio' : n < 3.95 ? 'rojo' : n < 5 ? 'ambar' : 'verde';
  const G = () => root.NexoGrades;

  // ——— Resultado por parte (teoría / lab) con lo que hace falta ———
  function groups(config) {
    const calc = G().calculate(config, 'theory');
    const out = {};
    for (const g of calc.groupResults) {
      const comps = (config.components || []).filter(c => c.group === g.id && num(c.weight) > 0);
      const done = comps.filter(c => known(c) !== null), pend = comps.filter(c => known(c) === null);
      const full = Math.abs(g.totalWeight - 100) < .01;
      const points = done.reduce((s, c) => s + num(c.weight) * known(c), 0);
      const goal = Number(config.target) > 4 ? Number(config.target) : PASS;
      const required = full && g.pendingWeight > .0001 ? (goal * 100 - points) / g.pendingWeight : null;
      let status = 'sin-datos';
      if (!full) status = 'falta-pesos';
      else if (g.pendingWeight <= .0001) status = g.grade >= PASS ? 'aprobada' : 'reprobada';
      else if (required > 7.0001) status = 'imposible';
      else if (required <= 1) status = 'asegurada';
      else if (required > 5.5) status = 'ajustado';
      else status = done.length ? 'en-camino' : 'sin-datos';
      out[g.id] = { id: g.id, name: g.name, courseWeight: g.courseWeight, minimum: g.minimum, total: g.totalWeight, knownWeight: g.knownWeight,
        pendingWeight: g.pendingWeight, current: g.current, grade: g.grade, required, need: required === null ? null : ceil1(Math.max(1, required)),
        goal, status, comps, done, pend };
    }
    return out;
  }

  // ——— Riesgo de examen / reprobar, según el programa de cada ramo ———
  const chip = (tone, text) => ({ tone, text });
  const names = list => list.map(c => c.name).join(', ');
  const RULES = {
    organica(g, cfg) {
      const out = [], th = g.theory, lab = g.lab;
      const red = th.comps.filter(c => /^PEP/i.test(c.name) && known(c) !== null && known(c) < PASS);
      if (th.grade !== null) {
        if (th.grade < 3.4) out.push(chip('risk', 'Cátedra bajo 3,4: se reprueba sin prueba final.'));
        else if (th.grade < PASS || red.length) out.push(chip('warn', 'Cátedra en zona de prueba final (PF): reemplaza tu PEP más baja.'));
        else out.push(chip('ok', 'Cátedra aprobada.'));
      } else if (red.length) out.push(chip('warn', `${names(red)} bajo 4,0: rendirías la prueba final (PF), que reemplaza tu PEP más baja.`));
      else if (th.status === 'imposible') out.push(chip('risk', 'Con lo que queda ya no se llega a 4,0 en cátedra: habría que ir a prueba final.'));
      if (lab.grade !== null) out.push(lab.grade < PASS ? chip('risk', 'Laboratorio reprobado: la nota final del ramo sería la del laboratorio (no se promedia).') : chip('ok', 'Laboratorio aprobado.'));
      else if (lab.status === 'imposible') out.push(chip('risk', 'Con lo que queda ya no se llega a 4,0 en laboratorio.'));
      return out;
    },
    fisico(g) {
      const out = [], th = g.theory, lab = g.lab;
      if (th.grade !== null) out.push(th.grade < PASS ? chip('warn', 'Cátedra bajo 4,0: examen (vale 40 % de la nota final y entra todo).') : chip('ok', 'Cátedra aprobada, sin examen.'));
      else if (th.status === 'imposible') out.push(chip('risk', 'Con lo que queda ya no se llega a 4,0 en cátedra: irías a examen.'));
      const ciclo = lab.comps.find(c => /prueba de ciclo/i.test(c.name));
      if (ciclo && known(ciclo) !== null && known(ciclo) < PASS) out.push(chip('warn', 'Prueba de ciclo roja: rindes examen de laboratorio (40 %, 13-01-2027).'));
      else if (lab.grade !== null) out.push(lab.grade < PASS ? chip('risk', 'Laboratorio reprobado.') : chip('ok', 'Laboratorio aprobado.'));
      return out;
    },
    analitica(g) {
      const out = [], th = g.theory, lab = g.lab;
      const peps = th.comps.filter(c => /^PEP/i.test(c.name)), kn = peps.filter(c => known(c) !== null);
      const red = kn.filter(c => known(c) < PASS);
      if (red.length) out.push(chip('warn', `${names(red)} bajo 4,0: sin eximición. Con promedio entre 3,5 y 4,0 tendrías derecho a examen (40 %).`));
      else if (kn.length === peps.length && peps.length) out.push(chip('ok', 'Eximido: todas tus PEP son 4,0 o más.'));
      else if (kn.length) out.push(chip('info', 'Para eximirte necesitas 4,0 o más en cada PEP.'));
      if (th.grade !== null) {
        if (th.grade < 3.5) out.push(chip('risk', 'Promedio bajo 3,5: sin derecho a examen.'));
        else if (th.grade < PASS) out.push(chip('warn', 'Promedio entre 3,5 y 4,0: tienes derecho a examen (40 %).'));
        else out.push(chip('ok', 'Teoría aprobada.'));
      }
      if (lab.grade !== null) out.push(lab.grade < PASS ? chip('risk', 'Laboratorio reprobado: se aprueba por separado.') : chip('ok', 'Laboratorio aprobado.'));
      return out;
    },
    fisio(g, cfg) {
      const out = [], th = g.theory;
      const pts = th.done.reduce((s, c) => s + num(c.weight) * known(c), 0);
      if (th.grade !== null) out.push(th.grade >= 4.5 ? chip('ok', 'Eximido del examen (4,5 o más).') : th.grade >= PASS ? chip('info', 'Cátedra aprobada, pero bajo 4,5: rindes el examen (15-01-2027).') : chip('risk', 'PEP bajo 4,0: la cátedra debe aprobarse para aprobar el curso.'));
      else if (th.total > 99.99 && th.pendingWeight > 0) {
        const n = (450 - pts) / th.pendingWeight;
        out.push(n > 7 ? chip('info', 'Eximirte (4,5) ya no es posible: rendirías el examen.') : chip('info', `Para eximirte del examen necesitas ${fmt(ceil1(Math.max(1, n)))} en lo que queda de PEP.`));
      }
      return out;
    }
  };

  /* Estado de un ramo: grupos, avisos de riesgo, "llevas" (con lo evaluado) y nota final si ya están todas. */
  function evaluate(subjectId, config) {
    const g = groups(config);
    const chips = (RULES[subjectId] ? RULES[subjectId](g, config) : []).slice();
    const gs = Object.values(g).filter(x => x.courseWeight !== null);
    const withCur = gs.filter(x => x.current !== null);
    const w = withCur.reduce((s, x) => s + x.courseWeight, 0);
    const llevas = w ? withCur.reduce((s, x) => s + x.current * x.courseWeight, 0) / w : null;
    const final = gs.length && gs.every(x => x.grade !== null) ? gs.reduce((s, x) => s + x.grade * x.courseWeight, 0) / gs.reduce((s, x) => s + x.courseWeight, 0) : null;
    const worst = chips.some(c => c.tone === 'risk') ? 'risk' : chips.some(c => c.tone === 'warn') ? 'warn' : chips.some(c => c.tone === 'ok') ? 'ok' : 'none';
    return { groups: g, chips, llevas, final, worst };
  }

  /* ¿Y si me saco X en todo lo que falta de esta parte? (no toca tus datos: trabaja sobre una copia) */
  function simulate(subjectId, config, groupId, x) {
    const copy = JSON.parse(JSON.stringify(config));
    const val = Math.max(1, Math.min(7, num(x)));
    copy.components.forEach(c => { if (c.group === groupId && num(c.weight) > 0 && known(c) === null) c.grade = val.toFixed(2); });
    const r = evaluate(subjectId, copy);
    return { value: val, group: r.groups[groupId], chips: r.chips, llevas: r.llevas, final: r.final };
  }

  /* Promedio general del semestre: simple (todos los ramos valen igual). `ramos` = [{id, ev}] con ev = evaluate(). */
  function overall(evals) {
    const withFinal = evals.filter(e => e.final !== null), withLlevas = evals.filter(e => e.llevas !== null);
    const avg = list => list.length ? list.reduce((s, v) => s + v, 0) / list.length : null;
    return { llevas: avg(withLlevas.map(e => e.llevas)), final: withFinal.length === evals.length && evals.length ? avg(withFinal.map(e => e.final)) : null,
      ramos: withLlevas.length };
  }

  /* Inasistencias: cuántas llevas y cuántas te quedan contra el máximo que tú pones.
     strict = "100 % de asistencia" (labs de Orgánica y FQ): cada falta se recupera con justificación. */
  const STRICT = { organica: { lab: true }, fisico: { lab: true } };
  function attendance(absences, subjectId, maxes = {}) {
    const out = {};
    for (const gid of ['theory', 'lab']) {
      const count = (absences || []).filter(a => a.subject === subjectId && (a.group === 'lab' ? 'lab' : 'theory') === gid).length;
      const raw = maxes?.[subjectId]?.[gid];
      const max = raw === undefined || raw === '' || raw === null ? null : Math.max(0, Math.floor(Number(raw)));
      const strict = !!STRICT[subjectId]?.[gid];
      let state = 'sin-maximo', left = null;
      if (strict && max === null) state = count ? 'estricto-falta' : 'estricto';
      else if (max !== null) { left = max - count; state = left < 0 ? 'pasado' : left === 0 ? 'limite' : left === 1 ? 'queda-1' : 'ok'; }
      out[gid] = { group: gid, count, max, left, strict, state };
    }
    return out;
  }

  /* Calibración: ¿qué tan cerca estimas tu nota? (promedio de |estimada − real| con las que tienen ambas) */
  function calibration(configs) {
    const pairs = [];
    for (const cfg of configs) for (const c of cfg.components || []) {
      const e = num(c.estimate), r = known(c);
      if (c.estimate !== undefined && c.estimate !== '' && Number.isFinite(e) && r !== null) pairs.push({ name: c.name, estimate: e, real: r, diff: e - r });
    }
    const mean = pairs.length ? pairs.reduce((s, p) => s + p.diff, 0) / pairs.length : null;
    return { pairs, mean };
  }

  root.NexoGradeRules = Object.freeze({ PASS, num, known, fmt, ceil1, level, groups, evaluate, simulate, overall, attendance, calibration });
  if (typeof module !== 'undefined') module.exports = root.NexoGradeRules;
})(typeof window !== 'undefined' ? window : globalThis);

;

/* planner/calendar-model.js */
/* Organización · Calendario (UPDATE 02, Fase 3). Módulo puro: sin pantalla ni estado propio, se prueba con node (tools/calendario-test.cjs).
   Cuadrícula del mes y la semana, mover una fecha con historial y deshacer, borrar con deshacer, línea de tiempo del semestre,
   semanas críticas y el horario fijo de cada día. Las fechas son 'AAAA-MM-DD' (hora local de Chile, sin zonas horarias). */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const pad = n => String(n).padStart(2, '0');
  const parse = d => new Date(`${d}T12:00:00`);
  const iso = x => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  const valid = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) && iso(parse(d)) === d;
  const addDays = (d, n) => { const x = parse(d); x.setDate(x.getDate() + n); return iso(x); };
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / DAY);
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const EVAL = ['exam', 'Prueba', 'control'];
  const isEval = e => EVAL.includes(e?.type);
  // Las pruebas de ciclo del laboratorio tienen id distinto en el calendario que en las notas.
  const GRADE_EVENT = { 'grade-fq-lab-ciclo': 'official-fq-ciclo', 'grade-org-lab-ciclo1': 'official-org-ciclo1', 'grade-org-lab-ciclo2': 'official-org-ciclo2' };

  // ——— Fechas ———
  const monthKey = d => d.slice(0, 7);
  const shiftMonth = (key, n) => { const [y, m] = key.split('-').map(Number); const x = new Date(y, m - 1 + n, 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; };
  const monthLabel = key => { const [y, m] = key.split('-').map(Number); return `${MONTHS[m - 1]} de ${y}`; };
  const shortDate = d => { const x = parse(d); return `${x.getDate()} ${MON[x.getMonth()]}`; };
  const weekdayName = d => WEEKDAYS[(parse(d).getDay() + 6) % 7];
  const weekdayIndex = d => { const g = parse(d).getDay(); return g === 0 ? 7 : g; };      // lunes = 1 … domingo = 7 (como NEXO_SEMESTER.schedule)
  const mondayOf = d => addDays(d, -((parse(d).getDay() + 6) % 7));
  const weekOf = d => { const m = mondayOf(d); return Array.from({ length: 7 }, (_, i) => addDays(m, i)); };

  /* Cuadrícula del mes: semanas de 7 casillas (lunes a domingo); null = casilla fuera del mes. */
  function monthGrid(key) {
    const [y, m] = key.split('-').map(Number), days = new Date(y, m, 0).getDate();
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7, cells = [];
    for (let i = 0; i < Math.ceil((offset + days) / 7) * 7; i++) { const n = i - offset + 1; cells.push(n >= 1 && n <= days ? `${key}-${pad(n)}` : null); }
    return { key, label: monthLabel(key), cells, weeks: Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7)) };
  }

  // ——— Eventos ———
  const timeOf = e => String(e.time || '99:99');
  const eventsOn = (events, date) => (events || []).filter(e => e.date === date).sort((a, b) => timeOf(a).localeCompare(timeOf(b)) || String(a.title).localeCompare(String(b.title)));
  /* Qué ícono pixel lleva: sello de lacre (pruebas), matraz (lab), pluma (entregas y tareas), bandera (receso). */
  function kind(e) {
    if (e.type === 'lab') return 'matraz';
    if (isEval(e)) return 'sello';
    if (e.type === 'recess') return 'receso';
    return 'pluma';
  }
  /* Receso (vacaciones, paro) que cubre una fecha: event.type = 'recess', de event.date a event.until. */
  const recessOn = (events, date) => (events || []).find(e => e.type === 'recess' && e.status !== 'done' && e.date <= date && date <= (valid(e.until) ? e.until : e.date)) || null;
  const nextState = s => s === 'pendiente' ? 'progreso' : s === 'progreso' ? 'hecha' : 'pendiente';
  const taskState = e => e.status === 'done' ? 'hecha' : ['pendiente', 'progreso', 'hecha'].includes(e.taskState) ? e.taskState : 'pendiente';
  function setTaskState(e, s) { e.taskState = s; e.status = s === 'hecha' ? 'done' : 'planned'; }

  // ——— Mover una fecha: historial + deshacer ———
  function syncGradeDate(state, event, date) {
    for (const plan of Object.values(state.grades || {})) for (const row of plan.components || []) {
      if (row.id === event.sourceId || row.id === event.id || GRADE_EVENT[row.id] === event.id) row.date = date;
    }
  }
  function moveEvent(state, id, date, { today = iso(new Date()), by = 'tú', undo = false } = {}) {
    const e = (state.events || []).find(x => x.id === id);
    if (!e || !valid(date) || date === e.date) return { ok: false };
    const entry = { from: e.date, to: date, on: today, by };
    if (undo) entry.undo = true;
    const hadHistory = Array.isArray(e.dateHistory);
    e.dateHistory = hadHistory ? e.dateHistory : [];
    e.dateHistory.push(entry);
    const prev = { date: e.date, dateNote: e.dateNote, weekdayUncertain: e.weekdayUncertain, source: e.source };
    e.date = date;
    if (!undo) { delete e.weekdayUncertain; delete e.dateNote; }
    syncGradeDate(state, e, date);
    return { ok: true, entry, revert() { e.dateHistory.pop(); if (!hadHistory) delete e.dateHistory; Object.assign(e, prev); if (prev.dateNote === undefined) delete e.dateNote; if (prev.weekdayUncertain === undefined) delete e.weekdayUncertain; syncGradeDate(state, e, prev.date); } };
  }
  /* Deshacer el último cambio de fecha (queda anotado en el historial como "deshecho"). */
  function undoLastMove(state, id, opts = {}) {
    const e = (state.events || []).find(x => x.id === id);
    const last = [...(e?.dateHistory || [])].reverse().find(h => !h.undo && h.to === e.date);
    return last ? moveEvent(state, id, last.from, { ...opts, undo: true, by: 'deshacer' }) : { ok: false };
  }
  function removeEvent(state, id) {
    const i = (state.events || []).findIndex(x => x.id === id); if (i < 0) return { ok: false };
    const [e] = state.events.splice(i, 1);
    return { ok: true, event: e, revert() { state.events.splice(Math.min(i, state.events.length), 0, e); } };
  }

  // ——— Semestre: línea de tiempo ———
  /* Bandas de semanas críticas: ventanas de `span` días con `min` o más evaluaciones (las que se traslapan se unen). */
  function criticalBands(events, { span = 9, min = 3 } = {}) {
    const list = (events || []).filter(e => isEval(e) && valid(e.date) && e.status !== 'done').sort((a, b) => a.date.localeCompare(b.date));
    const wins = [];
    list.forEach((first, i) => {
      const end = addDays(first.date, span - 1), inside = list.slice(i).filter(x => x.date <= end);
      if (inside.length >= min) wins.push({ from: first.date, to: inside[inside.length - 1].date, count: inside.length });
    });
    // Ventanas que se traslapan = una sola banda: se queda la de más evaluaciones (a igualdad, la más cercana).
    const bands = []; let reach = '';
    wins.forEach(w => {
      const last = bands[bands.length - 1];
      if (last && w.from <= reach) { if (w.count > last.count) bands[bands.length - 1] = w; reach = w.to > reach ? w.to : reach; }
      else { bands.push(w); reach = w.to; }
    });
    return bands;
  }
  /* Datos de la línea de tiempo: una fila por ramo con sus pruebas, labs y entregas; bandas críticas; marca de hoy. */
  function semester(events, subjects, today) {
    const dated = (events || []).filter(e => valid(e.date) && e.type !== 'recess');
    if (!dated.length) return null;
    const dates = dated.map(e => e.date).concat(today).sort();
    const from = addDays(mondayOf(dates[0]), 0), to = addDays(mondayOf(dates[dates.length - 1]), 6), total = Math.max(1, daysBetween(from, to));
    const pct = d => Math.max(0, Math.min(100, daysBetween(from, d) / total * 100));
    const months = []; let cur = from.slice(0, 7);
    while (cur <= to.slice(0, 7)) { const first = `${cur}-01`; months.push({ key: cur, label: MONTHS[Number(cur.slice(5)) - 1].slice(0, 3), left: pct(first < from ? from : first) }); cur = shiftMonth(cur, 1); }
    return {
      from, to, months, today: pct(today),
      rows: subjects.map(s => ({ subject: s, items: dated.filter(e => e.subject === s.id).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ event: e, left: pct(e.date), kind: kind(e) })) })),
      bands: criticalBands(events).map(b => ({ ...b, left: pct(b.from), width: Math.max(1.2, pct(addDays(b.to, 1)) - pct(b.from)) }))
    };
  }

  // ——— Horario fijo ———
  /* Clases y labs de una fecha, ordenados por hora (schedule[].day: 1 = lunes … 7 = domingo). */
  const scheduleFor = (schedule, date) => (schedule || []).filter(b => Number(b.day) === weekdayIndex(date)).slice().sort((a, b) => String(a.start).localeCompare(String(b.start)));
  const validTime = t => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(t || ''));

  root.NexoCalendarModel = Object.freeze({ GRADE_EVENT, valid, addDays, daysBetween, monthKey, shiftMonth, monthLabel, shortDate, weekdayName, weekdayIndex, mondayOf, weekOf,
    monthGrid, eventsOn, kind, isEval, recessOn, taskState, nextState, setTaskState, moveEvent, undoLastMove, removeEvent, criticalBands, semester, scheduleFor, validTime, WEEKDAYS });
  if (typeof module !== 'undefined') module.exports = root.NexoCalendarModel;
})(typeof window !== 'undefined' ? window : globalThis);

;

/* planner/schedule.js */
/* Organización: intervalos locales y propuestas de estudio. No modifica compromisos ni mide dominio. */
(function (root) {
  'use strict';
  const time = s => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || '')) ? Number(s.slice(0, 2)) * 60 + Number(s.slice(3)) : null;
  const clock = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  const fixed = type => ['class', 'work', 'personal', 'activity', 'study'].includes(type);
  const personal = type => ['work', 'personal', 'activity', 'recess'].includes(type);
  const weekday = day => new Date(`${day}T12:00:00`).getDay();
  function merge(ranges) {
    const out = [];
    ranges.filter(r => r.end > r.start).sort((a, b) => a.start - b.start).forEach(r => {
      const last = out[out.length - 1];
      if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
      else out.push({ start: r.start, end: r.end });
    });
    return out;
  }
  function subtract(windows, occupied) {
    let free = merge(windows);
    merge(occupied).forEach(b => { free = free.flatMap(a => b.end <= a.start || b.start >= a.end ? [a] :
      [{ start: a.start, end: Math.min(a.end, b.start) }, { start: Math.max(a.start, b.end), end: a.end }].filter(r => r.end > r.start)); });
    return free;
  }
  function dayInfo(state, day, schedule = [], now = new Date()) {
    const wd = weekday(day), org = state.organization || {}, config = org.availability;
    const configured = !!config && Array.isArray(config[wd]);
    const windows = configured ? config[wd].map(w => ({ start: time(w.start), end: time(w.end) })).filter(w => w.start !== null && w.end !== null && w.end > w.start) : [];
    const schoolDay = wd === 0 ? 7 : wd;
    const occupied = (schedule || []).filter(c => Number(c.day) === schoolDay).map(c => ({
      start: time(c.start), end: time(c.end), title: c.name || 'Clase', subject: c.subject, kind: c.kind, id: c.id || `class-${c.start}`, source: 'schedule'
    })).filter(c => c.start !== null && c.end !== null && c.end > c.start);
    const warnings = [];
    (state.events || []).filter(e => e.date === day && e.type !== 'recess').forEach(e => {
      const start = time(e.time), explicit = time(e.endTime), duration = Number(e.durationMinutes) || 0;
      if (start === null) return;
      const end = explicit !== null ? explicit : duration > 0 ? Math.min(1440, start + duration) : null;
      if (end === null && ['task', 'deadline', 'report', 'prelab'].includes(e.type)) return;
      // El práctico puede estar también en el horario oficial; no se cuenta dos veces.
      const duplicate = e.type === 'lab' && occupied.some(c => c.source === 'schedule' && c.kind === 'lab' && c.subject === e.subject && c.start === start);
      if (duplicate) return;
      if (end === null || end <= start) { warnings.push(`Falta la hora de término de «${e.title}».`); return; }
      occupied.push({ start, end, title: e.title, id: e.id, type: e.type, source: 'event' });
    });
    const conflicts = [];
    occupied.forEach((a, i) => occupied.slice(i + 1).forEach(b => {
      if (a.start < b.end && b.start < a.end) conflicts.push({ a: a.title, b: b.title });
    }));
    const localDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const elapsed = day === localDay ? now.getHours() * 60 + now.getMinutes() : day < localDay ? 1440 : 0;
    const free = subtract(windows, [...occupied, { start: 0, end: elapsed }]);
    const reservedStudyMinutes = occupied.filter(c => c.type === 'study').reduce((n, c) => n + c.end - c.start, 0);
    return { date: day, configured, free, occupied, conflicts, warnings, reservedStudyMinutes, available: free.reduce((n, r) => n + r.end - r.start, 0) };
  }
  function allocate(blocks, info, { breakMinutes = 10, limit = 120 } = {}) {
    let slots = info.free.map(r => ({ ...r })), used = 0;
    const pause = Math.max(0, Math.min(60, Number(breakMinutes) || 0));
    return blocks.map(block => {
      const b = { ...block, start: null, end: null, remainingMinutes: 0 };
      if (b.done) return b;
      if (!info.configured) return { ...b, unplaced: 'Define tus horas disponibles para asignarle un horario.' };
      if (info.warnings.length) return { ...b, unplaced: 'Completa los horarios pendientes antes de ubicar el estudio.' };
      const room = Math.max(0, Number(limit) - used);
      const min = b.flash ? 5 : 15;
      const due = b.event?.date === info.date && b.stage !== 'Informe' ? time(b.event.time) : null;
      const until = r => due === null ? r.end : Math.min(r.end, due);
      const slot = slots.find(r => Math.min(until(r) - r.start, room) >= Math.min(min, b.minutes));
      if (!slot) return { ...b, unplaced: 'No cabe en tus espacios disponibles. Puedes moverla a otro día.' };
      const duration = Math.min(b.minutes, until(slot) - slot.start, room);
      b.start = clock(slot.start); b.end = clock(slot.start + duration);
      b.remainingMinutes = b.minutes - duration; b.minutes = duration;
      used += duration; slot.start += duration + pause;
      slots = slots.filter(r => r.end > r.start);
      return b;
    });
  }
  // Valida antes de mutar: una serie inválida nunca deja ocasiones a medio guardar.
  function validateEvent(draft) {
    const M = root.NexoCalendarModel;
    if (!String(draft.title || '').trim()) return 'Escribe el nombre de la actividad.';
    if (!M.valid(draft.date)) return 'Elige una fecha válida.';
    const start = time(draft.time), end = time(draft.endTime);
    if (draft.time && start === null || draft.endTime && end === null) return 'Revisa las horas de inicio y término.';
    if (fixed(draft.type) && (start === null || end === null)) return 'Esta actividad necesita hora de inicio y término.';
    if (end !== null && (start === null || end <= start)) return 'El término debe ser posterior al inicio, dentro del mismo día.';
    if (draft.type === 'recess' && draft.until && (!M.valid(draft.until) || draft.until < draft.date)) return 'El receso debe terminar el mismo día o después.';
    return '';
  }
  function seriesMembers(events, event, scope) {
    return !event.series || scope !== 'following' ? [event] : events.filter(e => e.series === event.series && e.date >= event.date);
  }
  function saveEvent(state, draft, { id = '', scope = 'one', count = 1, uid, today } = {}) {
    const error = validateEvent(draft); if (error) return { ok: false, error };
    const M = root.NexoCalendarModel, ev = id && state.events.find(e => e.id === id);
    if (id && !ev) return { ok: false, error: 'Esta actividad ya no está en el calendario.' };
    const clean = { ...draft, title: draft.title.trim(), durationMinutes: draft.time && draft.endTime ? time(draft.endTime) - time(draft.time) : 0 };
    if (personal(clean.type)) clean.subject = 'personal';
    const members = ev ? seriesMembers(state.events, ev, scope) : [];
    const shift = ev ? M.daysBetween(ev.date, clean.date) : 0;
    const before = JSON.parse(JSON.stringify(state.events));
    const gradeBefore = JSON.parse(JSON.stringify(state.grades || {}));
    if (ev) {
      members.forEach(e => {
        const date = M.addDays(e.date, shift);
        if (date !== e.date) M.moveEvent(state, e.id, date, { today });
        Object.assign(e, clean, { date });
      });
    } else {
      const n = Math.max(1, Math.min(52, Math.floor(Number(count)) || 1)), series = n > 1 ? uid('series') : undefined;
      for (let i = 0; i < n; i++) state.events.push({ ...clean, id: uid('event'), date: M.addDays(clean.date, 7 * i), status: 'planned', source: 'manual', dependencies: [], ...(series ? { series } : {}) });
    }
    return { ok: true, count: ev ? members.length : Math.max(1, Math.min(52, Math.floor(Number(count)) || 1)), revert() { state.events = before; state.grades = gradeBefore; } };
  }
  const api = Object.freeze({ time, clock, fixed, personal, merge, subtract, dayInfo, allocate, validateEvent, saveEvent, seriesMembers });
  root.NexoSchedule = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

;

/* planner/event-editor.js */
/* Hoja de organización: la misma para agregar y editar, con espacio propio sobre la mesa. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const types = [['exam', 'Prueba o control'], ['lab', 'Laboratorio'], ['deadline', 'Entrega'], ['task', 'Tarea o lectura'], ['class', 'Clase'], ['study', 'Sesión de estudio'], ['work', 'Trabajo'], ['personal', 'Actividad personal'], ['recess', 'Descanso o receso']];
  const sector = type => type === 'work' ? 'work' : ['personal', 'activity', 'recess'].includes(type) ? 'personal' : 'academic';
  const num = (n, title, content) => `<fieldset class="agenda-section"><legend><span>${n}</span>${title}</legend>${content}</fieldset>`;
  function shell(title, sub, body, name = 'event') {
    const pt = window.NexoPixelText ? window.NexoPixelText.render(title, { shadow: false }) : title;
    const wisps = [0, 1, 2, 3, 4].map(i => `<i class="agenda-wisp agenda-wisp-${i}"></i>`).join('');
    return `<dialog class="agenda-overlay" data-agenda-overlay aria-labelledby="agendaTitle"><section class="agenda-sheet pu-panel" data-agenda-dialog="${name}">
      <i class="pu-ivy agenda-ivy-l" aria-hidden="true"></i><i class="pu-ivy pu-ivy-b agenda-ivy-r" aria-hidden="true"></i><span class="agenda-wisps" aria-hidden="true">${wisps}</span><canvas class="agenda-pet" width="40" height="44" aria-hidden="true"></canvas>
      <header class="agenda-head"><div><p class="eyebrow">TU BITÁCORA · ORGANIZACIÓN</p><h2 id="agendaTitle" aria-label="${esc(title)}">${pt}</h2><p>${sub}</p></div><button type="button" class="agenda-close" data-cal-cancel aria-label="Cerrar sin guardar">×</button></header>${body}</section></dialog>`;
  }
  // La mascota asoma por el borde: copia el cuadro de la que vive en la barra lateral.
  function peek(root) {
    const pet = root.querySelector('.agenda-pet'), dock = document.querySelector('.dock-pet');
    if (!pet || !dock) { pet?.remove(); return; }
    const ctx = pet.getContext('2d');
    (function draw() {
      if (!pet.isConnected) return;
      ctx.clearRect(0, 0, 40, 44); ctx.drawImage(dock, 0, 0);
      requestAnimationFrame(draw);
    })();
  }
  function render(ev, date, subjects, lastSubject) {
    const e = ev || {}, type = ['Prueba', 'control'].includes(e.type) ? 'exam' : e.type || 'exam';
    const end = e.endTime || (e.time && e.durationMinutes ? window.NexoSchedule.clock(Math.min(1439, window.NexoSchedule.time(e.time) + e.durationMinutes)) : '');
    const subject = e.subject || lastSubject || subjects[0]?.id;
    const opt = (v, t, cur) => `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(t)}</option>`;
    const form = `<form class="cal-form agenda-form" data-cal-form="${esc(e.id || '')}" data-sector="${sector(type)}">
      <div class="agenda-body"><div class="agenda-sectors" role="group" aria-label="Ámbito de la actividad">${[['academic', 'exam', 'Estudio', 'Clases, pruebas y entregas'], ['work', 'work', 'Trabajo', 'Turnos y compromisos'], ['personal', 'personal', 'Mi vida', 'Actividades y descanso']].map(([s, t, name, hint]) => `<button type="button" data-agenda-type="${t}" aria-pressed="${sector(type) === s}"><b>${name}</b><small>${hint}</small></button>`).join('')}</div>
      ${num('01', 'Qué vas a organizar', `<label class="agenda-name">Nombre<input name="title" required maxlength="80" value="${esc(e.title || '')}" placeholder="Ej. turno de trabajo, PEP de Orgánica…" autocomplete="off"></label><div class="agenda-grid"><label>Tipo<select name="type">${types.map(([v, t]) => opt(v, t, type)).join('')}${types.some(([v]) => v === type) ? '' : opt(type, type, type)}</select></label><label data-academic>Ramo<select name="subject">${subjects.map(s => opt(s.id, s.name, subject)).join('')}${opt('personal', 'Sin ramo · personal / trabajo', subject)}</select></label></div>`)}
      ${num('02', 'Cuándo ocurre', `<div class="agenda-grid agenda-when"><label>Fecha<input name="date" type="date" required value="${esc(e.date || date)}"></label><label>Desde<input name="time" type="time" value="${esc(e.time || '')}"></label><label>Hasta<input name="endTime" type="time" value="${esc(end)}"></label></div><p class="agenda-hint" data-time-hint>Si agregas inicio y término, Nexo reserva ese espacio y organiza el estudio alrededor.</p><label class="agenda-until" ${type === 'recess' ? '' : 'hidden'}>Último día del receso<input name="until" type="date" value="${esc(e.until || '')}"></label>
      ${ev?.series ? '<label>Aplicar cambios a<select name="scope"><option value="one">Solo esta ocasión</option><option value="following">Esta y las siguientes de la serie</option></select></label>' : !ev ? '<div class="agenda-repeat"><label class="check"><input name="weekly" type="checkbox"> Repetir cada semana</label><label data-repeat-count hidden>Ocasiones, contando esta<input name="repeatCount" type="number" min="2" max="52" value="8"></label></div>' : ''}`)}
      <details class="mas agenda-details"${ev ? ' open' : ''}><summary>Preparación y notas <span>Opcional</span></summary><div class="cal-form-mas agenda-grid"><label data-academic>Importancia<select name="priority">${[[1, 'Normal'], [2, 'Alta'], [3, 'Muy alta']].map(([v, t]) => opt(v, t, e.priority || 2)).join('')}</select></label><label data-academic>Dificultad<select name="difficulty">${opt('', 'Sin definir', e.difficulty || '')}${[1, 2, 3, 4, 5].map(v => opt(v, `${v} / 5`, e.difficulty)).join('')}</select></label><label class="ancho">Notas<textarea name="notes" maxlength="500" rows="3" placeholder="Qué llevar, dónde es, qué necesitas preparar…">${esc(e.notes || '')}</textarea></label></div></details>
      <p class="agenda-error" role="alert" hidden></p></div>
      <footer class="agenda-footer"><i class="pu-seal pu-seal-1 agenda-seal" aria-hidden="true"></i><p>El alquimista lo anota en tu calendario.<br><small>Podrás moverlo o corregirlo cuando quieras.</small></p><div class="cal-form-acc"><button type="button" class="pu-btn" data-cal-cancel>Mejor no</button><button type="submit" class="pu-btn">${ev ? 'Corregir pergamino' : 'Sellar en mi semana'}</button></div></footer></form>`;
    return shell(ev ? 'Corrige el pergamino' : 'Que nada se escape', ev ? 'Ajusta lo que cambió; el plan se reacomoda solito con tus nuevos horarios.' : 'Estudio, trabajo y vida propia: todo cabe en el mismo pergamino.', form);
  }
  function update(form) {
    const type = form.elements.type.value, s = sector(type), fixed = window.NexoSchedule.fixed(type);
    form.dataset.sector = s;
    form.querySelectorAll('[data-academic]').forEach(el => { el.hidden = s !== 'academic'; });
    form.querySelectorAll('[data-agenda-type]').forEach(el => { el.setAttribute('aria-pressed', sector(el.dataset.agendaType) === s); });
    form.elements.time.required = fixed; form.elements.endTime.required = fixed;
    form.querySelector('.agenda-until').hidden = type !== 'recess';
    form.querySelector('[data-time-hint]').textContent = fixed ? 'Este horario queda reservado. Nexo buscará otros espacios para estudiar.' : type === 'recess' ? 'Elige el período del receso. El plan propondrá un repaso liviano.' : 'Sin hora funciona como fecha límite. Añade inicio y término si debe reservar tiempo.';
    const count = form.querySelector('[data-repeat-count]'); if (count) count.hidden = !form.elements.weekly.checked;
  }
  function availability(org, goal = 120) {
    const days = [[1, 'Lunes'], [2, 'Martes'], [3, 'Miércoles'], [4, 'Jueves'], [5, 'Viernes'], [6, 'Sábado'], [0, 'Domingo']];
    const rows = days.map(([id, name]) => {
      const saved = org.availability?.[id], ranges = saved || [{ start: id === 0 || id === 6 ? '10:00' : '17:00', end: id === 0 || id === 6 ? '18:00' : '21:00' }];
      return `<fieldset class="availability-day"><legend><label class="check"><input type="checkbox" name="enabled-${id}"${!saved || saved.length ? ' checked' : ''}>${name}</label></legend><div class="availability-windows">${[0, 1].map(i => `<div><span>${i ? 'Otra franja' : 'Disponible'}</span><input type="time" name="from-${id}-${i}" aria-label="${name}, inicio ${i + 1}" value="${esc(ranges[i]?.start || '')}"><span>–</span><input type="time" name="to-${id}-${i}" aria-label="${name}, término ${i + 1}" value="${esc(ranges[i]?.end || '')}"></div>`).join('')}</div><label class="availability-goal">Meta<input type="number" name="minutes-${id}" aria-label="Meta de estudio del ${name.toLowerCase()}" min="0" max="600" step="5" value="${Number(org.minutes?.[id] ?? goal)}"> min</label></fieldset>`;
    }).join('');
    return shell('Tus horas de estudio', 'Marca cuándo podrías estudiar; el alquimista descontará clases, trabajo y actividades.', `<form class="agenda-form" data-availability-form><div class="agenda-body"><p class="agenda-callout">${org.availability ? 'Tus franjas actuales. Apaga un día para que el caldero descanse, o pártelo en dos.' : 'Estos horarios son una sugerencia del alquimista. Ajústalos y séllalos para empezar a usarlos.'}</p>${rows}<label class="availability-break">Pausa entre sesiones<select name="breakMinutes">${[0, 5, 10, 15, 20, 30].map(n => `<option value="${n}"${Number(org.breakMinutes ?? 10) === n ? ' selected' : ''}>${n} minutos</option>`).join('')}</select></label><p class="agenda-error" role="alert" hidden></p></div><footer class="agenda-footer"><p>Descansar también cuenta.<br><small>Un día desmarcado queda sin estudio.</small></p><i class="pu-seal pu-seal-2 agenda-seal" aria-hidden="true"></i><div class="cal-form-acc"><button type="button" class="pu-btn" data-cal-cancel>Mejor no</button><button type="submit" class="pu-btn">Sellar mis horarios</button></div></footer></form>`, 'availability');
  }
  function readAvailability(form) {
    const fd = new FormData(form), availability = {}, minutes = {};
    for (let d = 0; d < 7; d++) {
      availability[d] = []; const value = Number(fd.get(`minutes-${d}`));
      if (!Number.isFinite(value) || value < 0 || value > 600) return { error: 'La meta diaria debe estar entre 0 y 600 minutos.' };
      minutes[d] = fd.has(`enabled-${d}`) ? value : 0;
      if (!fd.has(`enabled-${d}`)) continue;
      for (let i = 0; i < 2; i++) {
        const start = String(fd.get(`from-${d}-${i}`) || ''), end = String(fd.get(`to-${d}-${i}`) || '');
        if (!start && !end) continue;
        const a = window.NexoSchedule.time(start), b = window.NexoSchedule.time(end);
        if (a === null || b === null || b <= a) return { error: 'Cada franja necesita inicio y término, dentro del mismo día.' };
        availability[d].push({ start, end });
      }
      if (!availability[d].length) return { error: 'Añade una franja a los días marcados, o desmárcalos para descansar.' };
    }
    return { availability, minutes, breakMinutes: Number(fd.get('breakMinutes')) || 0 };
  }
  window.NexoEventEditor = Object.freeze({ render, update, availability, readAvailability, peek });
})();

;

/* planner/today-plan.js */
/* Organización · plan de hoy (UPDATE 02, Fase 1). Módulo puro: sin pantalla ni estado propio, se prueba con node.
   Nexo PROPONE (orden + duración + razón); Niquito acepta, salta o marca listo. Reparte TIEMPO, nunca declara dominio.
   Usa el orden de NexoPriority.rank (cercanía + importancia + errores abiertos + carga del día). */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const EVAL = ['exam', 'Prueba', 'control'];
  const pad = n => String(n).padStart(2, '0');
  const parse = d => new Date(`${d}T12:00:00`);
  const iso = x => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / DAY);
  const addDays = (d, n) => { const x = parse(d); x.setDate(x.getDate() + n); return iso(x); };
  const isEval = e => EVAL.includes(e?.type);
  const valid = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ''));
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const shortDate = d => { const x = parse(d); return `${x.getDate()} ${MONTHS[x.getMonth()]}`; };
  const range = (a, b) => {
    const x = parse(a), y = parse(b);
    return x.getMonth() === y.getMonth() ? `${x.getDate()}–${y.getDate()} ${MONTHS[y.getMonth()]}` : `${shortDate(a)} – ${shortDate(b)}`;
  };

  // Nivel de urgencia de una evaluación (tablón del Inicio y fichas). SPEC: tabla "Inicio: que te avise solo".
  function urgency(days) {
    if (days < 0) return 'despues';
    if (days === 0) return 'hoy';
    if (days <= 2) return 'sello';
    if (days <= 7) return 'brillo';
    if (days <= 14) return 'ambar';
    return 'calma';
  }

  const upcomingEvals = (events, today, horizon) => (events || [])
    .filter(e => isEval(e) && valid(e.date) && e.status !== 'done')
    .map(e => ({ event: e, days: daysBetween(today, e.date) }))
    .filter(x => x.days >= 0 && x.days <= horizon)
    .sort((a, b) => a.days - b.days || String(a.event.id).localeCompare(String(b.event.id)));

  // Semana crítica: la ventana de `span` días con más evaluaciones (mínimo `min`). Empate → la más cercana.
  function critical(events, today, { span = 9, min = 3, horizon = 35 } = {}) {
    const list = upcomingEvals(events, today, horizon);
    let best = null;
    list.forEach((first, i) => {
      const end = addDays(first.event.date, span - 1);
      const items = list.slice(i).filter(x => x.event.date <= end);
      if (items.length >= min && (!best || items.length > best.items.length)) best = { from: first.event.date, to: items[items.length - 1].event.date, items };
    });
    if (!best) return null;
    return { ...best, count: best.items.length, label: `${range(best.from, best.to)}: ${best.items.length} evaluaciones`,
      active: daysBetween(today, best.from) <= 7 };
  }

  // Relojes de arena: evaluaciones de los próximos `horizon` días. level 0 (lleno arriba) … 5 (toda la arena cayó).
  function hourglasses(events, today, horizon = 21) {
    return upcomingEvals(events, today, horizon).map(x => ({ ...x, urgency: urgency(x.days),
      level: Math.max(0, Math.min(5, Math.round((1 - x.days / horizon) * 5))) }));
  }

  // Qué hacer según cuánto falta (con su evidencia, en una línea).
  function action(item) {
    const e = item.event, d = item.days;
    if (e.type === 'lab') {
      if (item.stage === 'Pre-lab') return { text: 'Pre-lab: procedimiento, fundamentos y riesgos', why: 'Llegar con el pre-lab listo: suele ser nota (control de entrada)', cap: 40 };
      if (item.stage === 'Informe') return { text: 'Avanzar el informe mientras está fresco', why: 'Los datos se olvidan rápido: mejor escribir pronto' };
      return { text: 'Prepara el práctico: procedimiento, reactivos y riesgos', why: d === 0 ? 'El práctico es hoy' : `El práctico es ${d === 1 ? 'mañana' : `en ${d} días`}` };
    }
    if (!isEval(e)) return { text: 'Avanzar en la entrega', why: d < 0 ? 'Sigue pendiente: reserva tiempo para retomarla' : d <= 1 ? 'Vence pronto' : `Vence en ${d} días` };
    if (d === 0) return { text: 'Repaso flash: lo clave y los errores típicos, sin materia nueva', why: 'Día de prueba: repasar sin saturarte', flash: true };
    if (d === 1) return { text: 'Repaso liviano de lo clave y a dormir temprano', why: 'Dormir consolida lo estudiado (Diekelmann & Born 2010)', cap: 30 };
    if (d <= 3) return { text: 'Ensayo cronometrado: una PEP antigua o 5 ejercicios mezclados', why: 'Practicar como en la prueba (Roediger & Karpicke 2006)' };
    if (d <= 7) return { text: 'Ejercicios mezclados sin apuntes', why: 'Mezclar tipos de ejercicio entrena a elegir el método (Rohrer & Taylor 2007)' };
    if (d <= 14) return { text: 'Ejercicios sin mirar los apuntes y corregir', why: 'Recuperar rinde más que releer (Roediger & Karpicke 2006)' };
    return { text: 'Primera pasada por la materia + 3 preguntas para ti', why: 'Empezar antes reparte el estudio en más días (Cepeda et al. 2006)' };
  }

  function candidate(item) {
    const e = item.event, d = item.days;
    if (d < 0) return ['task', 'deadline', 'report', 'prelab'].includes(e.type) || e.type === 'lab' && item.stage === 'Informe';
    if (isEval(e)) return d <= 21;
    if (e.type === 'lab') return item.stage === 'Pre-lab' ? d <= 7 : d <= 2;
    return ['task', 'deadline', 'report', 'prelab'].includes(e.type) && d <= 7;
  }

  const round5 = n => Math.round(n / 5) * 5;

  /* plan({ ranked, today, minutes, sessions, marks, critical, pins, recess, weak })
     pins: ids de eventos que Niquito movió a este día (van primero) · recess: día de receso (plan liviano) · weak: errores abiertos por ramo.
     ranked: salida de NexoPriority.rank · minutes: tiempo de hoy · sessions: state.sessions · marks: { done:[], skip:[] } de hoy. */
  function plan({ ranked = [], today, minutes = 120, sessions = [], marks = {}, critical: crit = null, pins = [], recess = false, weak = {} } = {}) {
    minutes = Math.max(0, Number(minutes) || 0); if (!minutes) return [];
    const skip = new Set(marks.skip || []), doneIds = new Set(marks.done || []);
    const pool = ranked.filter(candidate).filter(x => !skip.has(x.event.id));
    const flash = pool.filter(x => isEval(x.event) && x.days === 0);
    // Las evaluaciones van antes que el lab (salvo el pre-lab de mañana): el rank les da la misma importancia a todos.
    // Dificultad: Niquito parte con 1–5 y Nexo suma si el ramo tiene 3 o más errores abiertos (entra al orden con su razón).
    const diff = x => { const d = Number(x.event.difficulty) || 0; return d ? Math.min(5, d + ((weak[x.event.subject] || 0) >= 3 ? 1 : 0)) : 0; };
    const lift = x => x.score + (isEval(x.event) ? 10 : x.event.type === 'lab' && x.days <= 1 ? 6 : 0) + (diff(x) ? (diff(x) - 3) * 2 : 0);
    const pinned = ranked.filter(candidate).filter(x => (pins || []).includes(x.event.id) && !skip.has(x.event.id) && !flash.includes(x));
    const rest = pool.filter(x => !flash.includes(x) && !pinned.includes(x)).sort((a, b) => lift(b) - lift(a));
    rest.unshift(...pinned);
    const picked = [...flash.slice(0, 1)];
    const kind = x => `${x.event.subject}:${x.event.type === 'lab' ? 'lab' : 'teoria'}`;     // un bloque por ramo (el lab cuenta aparte)
    const seen = new Set(picked.map(kind));
    for (const x of rest) if (picked.length < 3 && !seen.has(kind(x))) { picked.push(x); seen.add(kind(x)); }
    for (const x of rest) if (picked.length < 3 && !picked.includes(x)) picked.push(x);
    let budget = minutes;
    const blocks = [];
    if (picked[0] && flash.includes(picked[0])) { const m = Math.min(10, budget); blocks.push({ item: picked[0], minutes: m }); budget -= m; }
    const others = picked.filter(x => !flash.includes(x));
    const room = Math.max(0, Math.min(others.length, Math.floor(budget / 15)));
    const chosen = others.slice(0, room);
    const total = chosen.reduce((s, x) => s + x.score, 0) || 1;
    chosen.forEach(x => blocks.push({ item: x, minutes: Math.min(action(x).cap || 50, Math.max(15, round5(budget * x.score / total))) }));
    while (blocks.reduce((s, b) => s + b.minutes, 0) > Math.max(budget + (flash.length ? 10 : 0), 15) && blocks.some(b => b.minutes > 15))
      blocks.filter(b => b.minutes > 15).pop().minutes -= 5;
    // Minutos de hoy por ramo (cronómetro + registro manual): tachan los bloques en orden.
    const studied = {};
    (sessions || []).filter(s => s.date === today).forEach(s => {
      studied[s.subject] = (studied[s.subject] || 0) + (Number(s.seconds) || Number(s.minutes || 0) * 60) / 60;
    });
    if (recess) {                                                      // receso (vacaciones, paro): un repaso liviano para mantener lo aprendido
      const first = blocks.find(b => !flash.includes(b.item)) || blocks[0];
      if (!first) return [];
      blocks.length = 0; blocks.push({ item: first.item, minutes: Math.min(20, minutes), recess: true });
    }
    return blocks.map(({ item, minutes: m, recess: rc }, i) => {
      const a = rc ? { text: 'Repaso liviano de lo visto: 3 ejercicios sin apuntes', why: 'En un receso basta con mantener lo aprendido: repasar espaciado rinde más que estudiar mucho un solo día (Cepeda et al. 2006)' } : action(item), e = item.event;
      const id = `${today}:${e.id}`;
      const left = studied[e.subject] || 0;
      const auto = left >= m;
      studied[e.subject] = Math.max(0, left - m);
      const when = item.days < 0 ? `pendiente desde hace ${Math.abs(item.days)} días` : item.days === 0 ? 'hoy' : item.days === 1 ? 'mañana' : `en ${item.days} días`;
      const inCrit = crit && isEval(e) && e.date >= crit.from && e.date <= crit.to;
      const extra = item.reasons.filter(r => /error|base|compromisos/.test(r)).slice(0, 1);
      const dd = diff(item); if (dd >= 4) extra.push(`dificultad ${dd}/5`);
      if ((pins || []).includes(e.id)) extra.push('lo moviste a hoy');
      return {
        id, order: i + 1, event: e, stage: item.stage, subject: e.subject, minutes: m, text: a.text, why: a.why, flash: !!a.flash,
        recess: !!rc, reason: [`${e.title} ${when}`, ...(rc ? ['receso'] : []), ...(inCrit ? ['semana crítica'] : []), ...extra].join(' · '),
        done: doneIds.has(id) || auto, auto: auto && !doneIds.has(id)
      };
    });
  }

  /* Plan de cualquier día con todo lo que Niquito configuró: minutos de ese día de la semana, bloques movidos (pins), "hoy no" (marks),
     receso y errores abiertos. bridge = el puente de app.js (state, ranked(día)). Lo usan Hoy, la semana del calendario y el Inicio. */
  function planDay(bridge, day, crit = null) {
    const st = bridge.state, o = st.organization || {}, v = o.minutes?.[parse(day).getDay()];
    const minutes = v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : (st.settings?.dailyGoalMinutes || 120);
    if (minutes <= 0) return [];
    const weak = {}; (st.errors || []).filter(e => e.status !== 'resolved').forEach(e => { weak[e.subject] = (weak[e.subject] || 0) + 1; });
    const recess = !!root.NexoCalendarModel?.recessOn(st.events, day);
    const blocks = plan({ ranked: bridge.ranked(day), today: day, minutes, sessions: st.sessions, marks: o.marks?.[day] || {}, critical: crit,
      pins: o.pins?.[day] || [], recess, weak });
    if (!root.NexoSchedule) return blocks;
    const schedule = Array.isArray(o.schedule) ? o.schedule : (typeof NEXO_SEMESTER !== 'undefined' ? NEXO_SEMESTER.schedule : []);
    const info = root.NexoSchedule.dayInfo(st, day, schedule);
    const studied = (st.sessions || []).filter(s => s.date === day).reduce((n, s) => n + (Number(s.seconds) || Number(s.minutes || 0) * 60) / 60, 0);
    const completed = blocks.filter(b => b.done).reduce((n, b) => n + b.minutes, 0);
    return root.NexoSchedule.allocate(blocks, info, { breakMinutes: o.breakMinutes ?? 10, limit: Math.max(0, minutes - Math.max(studied, completed) - info.reservedStudyMinutes) });
  }

  const api = Object.freeze({ plan, planDay, critical, hourglasses, urgency, action, daysBetween, addDays, shortDate, range });
  root.NexoTodayPlan = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

;

/* planner/avisos.js */
/* Avisos de Organización dentro de Nexo (UPDATE 02, Fase 1). Solo locales: sin nube ni notificaciones del celular.
   - list(bridge): avisos de hoy (pruebas por urgencia, semana crítica, cambios de fecha). Los usa la campana del estudio.
   - home(app, bridge): el Inicio avisa solo: tablón que cambia según la urgencia, cinta de semana crítica,
     el calendario de la pared brilla (prueba en ≤ 7 días), plan de hoy con "Empezar" y la mascota lo dice 1 vez.
   Primer aviso 2 semanas antes (decisión de Niquito). */
(() => {
  'use strict';
  const EVAL = ['exam', 'Prueba', 'control'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = () => window.NexoTodayPlan;
  const when = d => d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`;
  const SAY = {
    hoy: e => `¡Hoy es ${e}! Repaso flash y a rendir tranquilo.`,
    sello: e => `${e} es muy pronto: repaso liviano y a dormir temprano.`,
    brillo: e => `${e} esta semana: toca ensayo sin apuntes.`,
    ambar: e => `${e} en menos de 2 semanas: hoy basta con un bloque corto.`
  };

  function org(state) {
    if (!state.organization || typeof state.organization !== 'object') state.organization = {};
    const o = state.organization;
    if (!o.seen || typeof o.seen !== 'object') o.seen = { avisos: [], dates: {} };
    if (!Array.isArray(o.seen.avisos)) o.seen.avisos = [];
    if (!o.seen.dates || typeof o.seen.dates !== 'object') o.seen.dates = {};
    return o;
  }

  function list(bridge) {
    const state = bridge.state, today = bridge.today(), o = org(state), out = [];
    const crit = T().critical(state.events, today);
    if (crit?.active) out.push({ id: `crit:${crit.from}:${crit.count}`, nivel: 'brillo', titulo: 'Semana crítica', texto: crit.label });
    for (const e of state.events || []) {
      const before = o.seen.dates[e.id];
      if (before && before !== e.date && e.date >= today && e.status !== 'done')
        out.push({ id: `fecha:${e.id}:${e.date}`, nivel: 'cambio', titulo: 'Cambio de fecha',
          texto: `${bridge.subjectFor(e.subject).short} ${e.title}: ${T().shortDate(before)} → ${T().shortDate(e.date)}` });
    }
    // Inasistencias: aviso cuando te queda 1 falta (o ya llegaste al límite).
    if (window.NexoGradeRules) for (const sub of bridge.subjects) {
      const att = window.NexoGradeRules.attendance(state.absences, sub.id, o.absenceMax);
      for (const g of ['theory', 'lab']) {
        const a = att[g], parte = g === 'lab' ? 'laboratorio' : 'teoría';
        if (a.state === 'queda-1') out.push({ id: `falta:${sub.id}:${g}:${a.count}`, nivel: 'brillo', titulo: `${sub.short} · ${parte}`, texto: 'Te queda 1 falta.' });
        else if (a.state === 'limite' || a.state === 'pasado') out.push({ id: `falta:${sub.id}:${g}:${a.count}`, nivel: 'sello', titulo: `${sub.short} · ${parte}`, texto: a.state === 'limite' ? 'Llegaste al máximo de faltas.' : 'Pasaste el máximo de faltas.' });
      }
    }
    T().hourglasses(state.events, today, 14).forEach(h => {
      const s = bridge.subjectFor(h.event.subject);
      out.push({ id: `prueba:${h.event.id}:${h.urgency}`, nivel: h.urgency, event: h.event, days: h.days,
        titulo: `${s.short} · ${h.event.title}`, texto: `${T().shortDate(h.event.date)} (${when(h.days)})` });
    });
    const seen = new Set(o.seen.avisos);
    out.forEach(a => { a.nuevo = !seen.has(a.id) && a.nivel !== 'ambar' && a.nivel !== 'calma'; });
    return out;
  }

  function markSeen(bridge) {
    const o = org(bridge.state);
    o.seen.avisos = [...new Set([...o.seen.avisos, ...list(bridge).map(a => a.id)])].slice(-80);
    (bridge.state.events || []).forEach(e => { if (e.id && e.date) o.seen.dates[e.id] = e.date; });
    bridge.save();
  }
  // La primera vez solo se toma la foto (fechas y avisos de hoy): la campana suena por lo que cambie DESPUÉS.
  function snapshot(bridge) {
    const o = org(bridge.state);
    if (o.seen.started) return;
    o.seen.started = bridge.today();
    markSeen(bridge);
  }

  // ——— Inicio ———
  let bubbleTimer = 0;
  function home(app, bridge) {
    if (!document.querySelector('link[href^="planner/estudio.css"]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'planner/estudio.css?v=1'; document.head.append(l);
    }
    snapshot(bridge);
    const state = bridge.state, today = bridge.today();
    const ranked = bridge.ranked();
    const evals = ranked.filter(x => EVAL.includes(x.event.type)).slice(0, 3);     // el mismo orden que arma app.js
    const board = app.querySelector('.evaluation-board');
    if (board) {
      board.querySelectorAll('.evaluation-note').forEach((li, i) => {
        const x = evals[i]; if (!x) return;
        const u = T().urgency(x.days);
        li.classList.add('u-' + u);
        li.insertAdjacentHTML('afterbegin', `<span class="aviso-reloj" style="--f:${Math.max(0, Math.min(5, Math.round((1 - x.days / 21) * 5)))}" aria-hidden="true"></span>
          <b class="aviso-dias">${x.days === 0 ? 'HOY' : x.days === 1 ? 'mañana' : `${x.days} días`}</b>`);
        li.querySelectorAll('[data-route="planner"]').forEach(b => { b.dataset.routeSub = 'pruebas'; b.textContent = 'Ver en el corcho de pruebas →'; });
      });
      const crit = T().critical(state.events, today);
      if (crit?.active) board.insertAdjacentHTML('afterbegin', `<div class="cinta cinta-tablon" role="note"><span>Semana crítica · ${esc(crit.label)}</span></div>`);
      board.querySelectorAll('.wood-link[data-route="planner"]').forEach(b => { b.dataset.routeSub = 'hoy'; b.textContent = 'Abrir el estudio de planos →'; });
    }
    // Calendario de la pared: brilla si hay prueba en 7 días o menos (y lleva a Hoy).
    const soon = evals.some(x => x.days >= 0 && x.days <= 7);
    const cal = app.querySelector('[data-scene-hotspot="parchment-calendar"]');
    if (cal) { cal.classList.toggle('org-brilla', soon); cal.dataset.routeSub = 'hoy'; }
    app.querySelector('[data-scene-hotspot="map-logbook"]')?.setAttribute('data-route-sub', 'hoy');
    // Plan de hoy en la hoja del día, con "Empezar".
    const paper = app.querySelector('.day-paper .day-goal');
    const blocks = window.NexoTodayPlan.planDay(bridge, today, T().critical(state.events, today));
    if (paper && blocks.length) {
      paper.insertAdjacentHTML('afterend', `<ol class="home-plan" aria-label="Plan de hoy">${blocks.map(b => {
        const s = bridge.subjectFor(b.subject);
        return `<li class="${b.done ? 'hecho' : ''}"><span class="ramo" style="--ramo:${esc(s.color)}">${esc(s.short)}</span>
          <span class="tinta">${b.minutes} min · ${esc(b.text)}</span>${b.done ? '' : `<button type="button" class="paper-link" data-org-home-start="${esc(b.subject)}">Empezar</button>`}</li>`;
      }).join('')}</ol><button type="button" class="paper-link home-plan-ver" data-route="planner" data-route-sub="hoy">Ver el plan y por qué →</button>`);
      app.querySelectorAll('[data-org-home-start]').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        state.timer.subject = btn.dataset.orgHomeStart; bridge.save(); bridge.go('hub', 'timer');
      }));
    }
    // La mascota avisa: 1 vez al entrar (por día) y cuando aparece un aviso nuevo.
    const fresh = list(bridge).filter(a => a.nuevo);
    const top = fresh.find(a => a.nivel === 'cambio') || fresh.find(a => a.nivel === 'brillo' && a.id.startsWith('crit')) || fresh.find(a => a.event);
    const o = org(state);
    const key = `${today}:${fresh.map(a => a.id).join('|')}`;
    if (o.lastSaid !== key && (top || o.lastSaidDay !== today)) {
      const first = evals[0];
      const text = top?.nivel === 'cambio' ? `Ojo: ${top.texto}.`
        : top?.id.startsWith('crit') ? `Viene semana crítica (${top.texto}). Partamos antes.`
          : top?.event ? (SAY[top.nivel]?.(`${bridge.subjectFor(top.event.subject).short} ${top.event.title}`) || '')
            : first && SAY[T().urgency(first.days)] ? SAY[T().urgency(first.days)](`${bridge.subjectFor(first.event.subject).short} ${first.event.title}`) : '';
      if (text) {
        o.lastSaid = key; o.lastSaidDay = today; bridge.save();
        speak(app, text);
      }
    }
  }

  function minutes(bridge) {
    const v = bridge.state.organization?.minutes?.[new Date().getDay()];
    return Number.isFinite(Number(v)) ? Number(v) : bridge.state.settings.dailyGoalMinutes || 120;
  }

  // Globo sobre la mascota del refugio (la posición la da home-pet.js; si aún no aparece, espera un poco).
  function speak(app, text, tries = 0) {
    const plane = app.querySelector('.home-art-plane'); if (!plane) return;
    const spot = window.NexoPet?.homeSpot?.();
    if (!spot) { if (tries < 12) setTimeout(() => speak(app, text, tries + 1), 300); return; }
    let b = plane.querySelector('.org-say');
    if (!b) { b = document.createElement('p'); b.className = 'org-say'; b.setAttribute('role', 'status'); plane.append(b); }
    b.textContent = text;
    const place = () => { const s = window.NexoPet?.homeSpot?.(); if (!s || !b.isConnected) return;
      b.style.left = `${Math.max(14, Math.min(86, s.x / 418 * 100))}%`; b.style.top = `${s.y / 235 * 100}%`; };
    place();
    spot.act?.('saludo');
    clearInterval(bubbleTimer);
    let n = 0;
    bubbleTimer = setInterval(() => { place(); if (++n > 30 || !b.isConnected) { clearInterval(bubbleTimer); b.remove(); } }, 200);
  }

  window.NexoOrgAvisos = Object.freeze({ list, markSeen, snapshot, home });
})();

;

/* planner/notas.js */
/* Organización · Notas e inasistencias (UPDATE 02, Fase 2). Balanza y libro del estudio de planos.
   Lomos de libro por ramo, repisas de Teoría y Laboratorio, un frasco por evaluación (ancho = peso, líquido = nota por escalones),
   "Necesitas X,X" tallado, simulador con palanca, riesgo de examen, promedio general e inasistencias.
   Las cuentas son de NexoGrades / NexoGradeRules; los datos son state.grades (gradeConfig) y state.absences. Se pinta desde estudio.js. */
(() => {
  'use strict';
  const R = () => window.NexoGradeRules;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const dateLabel = d => { const x = new Date(`${d}T12:00:00`); return `${x.getDate()} ${MONTHS[x.getMonth()]}`; };
  const GROUPS = ['theory', 'lab'];
  const ui = { subject: null, edit: false, sim: {}, dialog: null, autopsy: null, fresh: null, absForm: false };
  let ctx = null;

  // ——— Números en pixel (5×7), para "Necesitas 4,6" ———
  const GL = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'], '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['10010', '10010', '10010', '11111', '00010', '00010', '00010'], '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    '6': ['01111', '10000', '10000', '11110', '10001', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], '9': ['01110', '10001', '10001', '01111', '00001', '00001', '11110'],
    ',': ['00', '00', '00', '00', '01', '01', '10'], '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'], '—': ['00000', '00000', '00000', '11111', '00000', '00000', '00000']
  };
  function pixelText(text, cls = '') {
    let x = 0, rects = '';
    for (const ch of String(text)) {
      const rows = GL[ch] || GL['?'];
      rows.forEach((row, y) => [...row].forEach((b, dx) => { if (b === '1') rects += `<rect x="${x + dx}" y="${y}" width="1" height="1"/>`; }));
      x += rows[0].length + 1;
    }
    return `<svg class="pix-num ${cls}" viewBox="0 0 ${Math.max(1, x - 1)} 7" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
  }

  // ——— Datos ———
  const bridge = () => ctx.bridge;
  const org = () => { const s = bridge().state; s.organization = s.organization && typeof s.organization === 'object' ? s.organization : {}; return s.organization; };
  const maxes = () => { const o = org(); o.absenceMax = o.absenceMax && typeof o.absenceMax === 'object' ? o.absenceMax : {}; return o.absenceMax; };
  const cfg = id => bridge().gradeConfig(id);
  // Las pruebas de ciclo del laboratorio tienen id distinto en el calendario que en las notas.
  const LINK = window.NexoCalendarModel?.GRADE_EVENT || { 'grade-fq-lab-ciclo': 'official-fq-ciclo', 'grade-org-lab-ciclo1': 'official-org-ciclo1', 'grade-org-lab-ciclo2': 'official-org-ciclo2' };
  const eventFor = id => (bridge().state.events || []).find(e => e.sourceId === id || e.id === id || e.id === LINK[id]);
  const num = v => R().num(v);

  function defaultSubject() {
    const next = (bridge().ranked() || []).find(x => ['exam', 'Prueba', 'control'].includes(x.event.type));
    return next?.event.subject || bridge().subjects[0].id;
  }
  function current() {
    if (!ui.subject || !bridge().subjects.some(s => s.id === ui.subject)) ui.subject = org().notasSubject || defaultSubject();
    return bridge().subjectFor(ui.subject);
  }
  const evalAll = () => bridge().subjects.map(s => ({ s, ev: R().evaluate(s.id, cfg(s.id)) }));
  const w1 = w => String(Number(num(w).toFixed(1))).replace('.', ',');
  const gname = (c, g) => c.groups?.[g]?.name || (g === 'lab' ? 'Laboratorio' : 'Teoría');

  // ——— Piezas ———
  const STATUS_WORD = { risk: 'En riesgo', warn: 'Ojo', ok: 'Vas bien', none: '' };
  function lomos(evs) {
    return `<nav class="lomos" role="tablist" aria-label="Ramo">${evs.map(({ s, ev }) => `<button role="tab" type="button" class="lomo lomo-${ev.worst}" style="--ramo:${esc(s.color)}"
      aria-selected="${s.id === ui.subject}" data-nt-subject="${esc(s.id)}"><b>${esc(s.short)}</b><small>${ev.llevas === null ? '—' : R().fmt(ev.llevas, 1)}</small>${ev.worst === 'risk' || ev.worst === 'warn' ? `<i class="lomo-marca" aria-label="${STATUS_WORD[ev.worst]}"></i>` : ''}</button>`).join('')}</nav>`;
  }
  function frasco(c, config, today) {
    const g = R().known(c), lv = R().level(g), steps = g === null ? 0 : Math.max(1, Math.round((g - 1) / 6 * 8));
    const tier = num(c.weight) < 6 ? 1 : num(c.weight) < 15 ? 2 : num(c.weight) < 30 ? 3 : 4;
    const date = c.date || eventFor(c.id)?.date || '';
    const past = g === null && date && date < today;
    const est = c.estimate === undefined || c.estimate === '' ? NaN : num(c.estimate);
    const fresh = ui.fresh && ui.fresh.id === c.id;
    const label = g === null ? (past ? '¿cómo te fue?' : '?') : R().fmt(g, 2);
    return `<li class="frasco-wrap">
      <button type="button" class="frasco t${tier} lv-${lv}${past ? ' pasada' : ''}${fresh ? ' fresco' : ''}" style="--n:${steps}" data-nt-grade="${esc(c.id)}"
        aria-label="${esc(c.name)}, ${w1(c.weight)} %, ${g === null ? 'sin nota' : 'nota ' + R().fmt(g, 2)}. Tocar para ${g === null ? 'escribir' : 'cambiar'} la nota">
        <span class="liq"><i></i><i></i><i></i></span>
        <b class="fr-nota${g === null ? ' vacia' : ''}">${g === null ? (past ? '¿?' : '?') : R().fmt(g, 1)}</b>
        ${g === null && Number.isFinite(est) ? `<small class="fr-est">estimé ${R().fmt(est, 1)}</small>` : ''}
        ${fresh ? `<span class="chispas lv-${lv}" aria-hidden="true">${'<i></i>'.repeat(8)}</span>` : ''}
      </button>
      <span class="fr-tag"><span>${esc(c.name)}</span><small>${w1(c.weight)} %${date ? ` · ${esc(dateLabel(date))}` : ''}</small></span>
      ${fresh ? '<span class="pluma-ok" role="status">guardado</span>' : ''}
      ${c.autopsy ? '<span class="fr-auto" title="Ya contaste qué pasó">✎</span>' : ''}</li>`;
  }

  function need(group, simOut) {
    const g = group;
    if (g.status === 'falta-pesos') return `<p class="placa-texto">Faltan ponderaciones: esta parte suma ${w1(g.total)} %. Usa “Ajustar ramo”.</p>`;
    if (g.status === 'aprobada' || g.status === 'reprobada') return `<div class="placa ${g.status}"><span class="placa-eti">${g.status === 'aprobada' ? 'Quedó en' : 'Quedó en'}</span>${pixelText(R().fmt(g.grade, 1), 'grande')}</div>
      <p class="placa-texto">${g.status === 'aprobada' ? 'Parte aprobada.' : 'Parte reprobada: mira las reglas de abajo.'}</p>`;
    if (g.status === 'asegurada') return `<div class="placa aprobada"><span class="placa-eti">Ya aprobaste</span></div><p class="placa-texto">Aunque saques 1,0 en lo que queda (${w1(g.pendingWeight)} %), esta parte se aprueba.</p>`;
    if (g.status === 'imposible') {
      const best = (g.current * g.knownWeight + 7 * g.pendingWeight) / 100;
      return `<div class="placa reprobada"><span class="placa-eti">Con 7,0 llegas a</span>${pixelText(R().fmt(best, 1), 'grande')}</div>
        <p class="placa-texto">Ya no alcanza el 4,0 en esta parte, ni sacando 7,0 en lo que queda. Veamos qué reglas te quedan abajo.</p>`;
    }
    const goal = g.goal > 4 ? `para llegar a ${R().fmt(g.goal, 1)}` : 'para aprobar';
    return `<div class="placa ${g.status}"><span class="placa-eti">Necesitas</span>${pixelText(R().fmt(g.need, 1), 'grande')}</div>
      <p class="placa-texto">de promedio en lo que queda (${w1(g.pendingWeight)} % de ${esc(g.name.toLowerCase())}) ${goal}.${g.current !== null ? ` Hasta ahora llevas <b>${R().fmt(g.current, 2)}</b>.` : ''}</p>`;
  }

  function simulador(subject, config, g) {
    if (!g || g.pendingWeight <= .0001 || g.status === 'falta-pesos') return '';
    const key = `${subject.id}:${g.id}`, v = ui.sim[key] ?? Math.min(7, Math.max(1, g.need ?? 5));
    const out = simText(subject.id, config, g.id, v);
    return `<div class="simulador"><p class="sim-pregunta">¿Y si me saco…</p>
      <div class="palanca"><input type="range" min="1" max="7" step="0.1" value="${v}" data-nt-sim="${esc(g.id)}" aria-label="Nota que sacarías en lo que queda de ${esc(g.name)}">
        <output class="sim-valor" data-nt-simvalor>${R().fmt(v, 1)}</output></div>
      <p class="sim-out" data-nt-simout aria-live="polite">${out}</p></div>`;
  }
  function simText(sid, config, gid, v) {
    const r = R().simulate(sid, config, gid, v);
    const lines = [`En lo que queda sacas <b>${R().fmt(r.value, 1)}</b> → ${esc(r.group.name.toLowerCase())} queda en <b class="lv-${R().level(r.group.grade)}">${R().fmt(r.group.grade, 2)}</b>.`];
    if (r.final !== null) lines.push(`Nota final del ramo: <b>${R().fmt(r.final, 2)}</b>.`);
    r.chips.filter(c => c.tone !== 'info').slice(0, 2).forEach(c => lines.push(`<span class="chip chip-${c.tone}">${esc(c.text)}</span>`));
    return lines.join(' ');
  }

  function repisa(subject, config, ev, gid, today) {
    const g = ev.groups[gid]; if (!g) return '';
    const comps = g.comps.length ? g.comps : (config.components || []).filter(c => c.group === gid);
    return `<section class="repisa" aria-label="${esc(gname(config, gid))}">
      <header class="repisa-head"><h3>${gid === 'lab' ? '⚗' : '▤'} ${esc(gname(config, gid))}</h3>
        <small>${g.courseWeight !== null ? `${w1(g.courseWeight)} % del ramo` : ''}${g.minimum ? ` · mínimo ${R().fmt(g.minimum, 1)}` : ''}</small></header>
      <ul class="frascos">${comps.map(c => frasco(c, config, today)).join('') || '<li class="repisa-vacia">Sin evaluaciones: agrégalas en “Ajustar ramo”.</li>'}</ul>
      <div class="repisa-tabla"></div>
      <div class="repisa-info">${need(g)}</div>${simulador(subject, config, g)}</section>`;
  }

  function editor(subject, config) {
    return `<section class="ajuste" aria-label="Ajustar ramo">
      <p class="ajuste-ayuda">Cambia el porcentaje y la fecha de cada evaluación, agrega o borra. Cada parte debería sumar 100 %.</p>
      ${GROUPS.map(gid => {
        const rows = (config.components || []).filter(c => c.group === gid), total = rows.reduce((s, c) => s + (num(c.weight) || 0), 0);
        return `<fieldset class="ajuste-grupo"><legend>${esc(gname(config, gid))} <span class="${Math.abs(total - 100) < .01 ? 'ok' : 'warn'}">suma ${w1(total)} %</span></legend>
          ${rows.map(c => `<div class="ajuste-fila"><input aria-label="Nombre" maxlength="80" value="${esc(c.name)}" data-nt-edit="${esc(c.id)}" data-nt-field="name">
            <input aria-label="Porcentaje de ${esc(c.name)}" type="text" inputmode="decimal" value="${esc(c.weight === '' ? '' : Number(num(c.weight).toFixed(2)))}" data-nt-edit="${esc(c.id)}" data-nt-field="weight">
            <input aria-label="Fecha de ${esc(c.name)}" type="date" value="${esc(c.date || '')}" data-nt-edit="${esc(c.id)}" data-nt-field="date">
            <button type="button" class="pix-btn suave mini" data-nt-del="${esc(c.id)}" aria-label="Borrar ${esc(c.name)}">×</button></div>`).join('')}
          <button type="button" class="pix-btn suave" data-nt-add="${gid}">+ Agregar evaluación</button></fieldset>`;
      }).join('')}
      <button type="button" class="pix-btn" data-nt-edit-done>Terminar</button></section>`;
  }

  function dialogNota(config) {
    const d = ui.dialog; if (!d) return '';
    const c = config.components.find(x => x.id === d.id); if (!c) return '';
    const g = R().known(c), date = c.date || eventFor(c.id)?.date || '', past = date && date < bridge().today();
    return `<div class="nt-fondo" data-nt-cancel><form class="nt-dialog" role="dialog" aria-modal="true" aria-labelledby="ntTit" data-nt-nota-form>
      <h3 id="ntTit">${esc(c.name)} · ${w1(c.weight)} %</h3>
      ${past && g === null || d.mode === 'estimate' ? `<div class="nt-modo" role="tablist"><button type="button" role="tab" aria-selected="${d.mode !== 'estimate'}" data-nt-mode="real">Nota real</button>
        <button type="button" role="tab" aria-selected="${d.mode === 'estimate'}" data-nt-mode="estimate">¿Cómo te fue? (estimada)</button></div>` : ''}
      <p class="nt-ayuda">${d.mode === 'estimate' ? 'Tu estimación se guarda aparte. Cuando llegue la nota real, Nexo las compara: así aprendes a calibrarte.' : 'Escribe la nota (1,0 a 7,0). Con “55” entiendo 5,5.'}</p>
      <input class="nt-input" name="nota" type="text" inputmode="decimal" autocomplete="off" maxlength="4" value="${esc(d.value)}" aria-label="Nota" data-nt-input>
      <div class="nt-teclas" role="group" aria-label="Teclado">${['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'].map(k => `<button type="button" class="pix-btn" data-nt-key="${k}">${k}</button>`).join('')}</div>
      <p class="nt-error" role="alert" hidden></p>
      <div class="nt-acciones"><button type="submit" class="pix-btn">Guardar</button><button type="button" class="pix-btn suave" data-nt-cancel-btn>Cancelar</button>
        ${d.mode !== 'estimate' && g !== null ? '<button type="button" class="pix-btn suave" data-nt-clear>Borrar nota</button>' : ''}</div></form></div>`;
  }

  function dialogAutopsia(config) {
    const a = ui.autopsy; if (!a) return '';
    const c = config.components.find(x => x.id === a.id); if (!c) return '';
    const o = c.autopsy || {};
    const opt = (list, cur) => list.map(([v, t]) => `<option value="${v}"${cur === v ? ' selected' : ''}>${t}</option>`).join('');
    return `<div class="nt-fondo" data-nt-autopsy-cancel><form class="nt-dialog" role="dialog" aria-modal="true" aria-labelledby="ntAu" data-nt-autopsy-form>
      <h3 id="ntAu">¿Qué pasó en ${esc(c.name)}?</h3>
      <p class="nt-ayuda">Tres preguntas rápidas, sin culpa: sirven para elegir qué practicar. Puedes saltarlas.</p>
      <label>¿Qué tipo de pregunta te costó? <input name="tipo" maxlength="120" value="${esc(o.tipo || '')}" placeholder="Ej.: basicidad de aminas, gráficos…"></label>
      <label>¿Fue un error de… <select name="causa"><option value="">elige</option>${opt([['concepto', 'concepto (no lo entendía)'], ['calculo', 'cálculo o desarrollo'], ['tiempo', 'tiempo'], ['nervios', 'nervios o lectura'], ['estudio', 'no alcancé a estudiar eso']], o.causa)}</select></label>
      <label>¿Qué harías distinto la próxima vez? <input name="distinto" maxlength="160" value="${esc(o.distinto || '')}" placeholder="Ej.: ensayo cronometrado antes"></label>
      <div class="nt-acciones"><button type="submit" class="pix-btn">Guardar</button><button type="button" class="pix-btn suave" data-nt-autopsy-cancel-btn>Saltar</button></div></form></div>`;
  }

  // ——— Inasistencias ———
  function asistencia(subject) {
    const att = R().attendance(bridge().state.absences, subject.id, maxes());
    const rows = (bridge().state.absences || []).filter(a => a.subject === subject.id).sort((a, b) => b.date.localeCompare(a.date));
    const MSG = {
      'sin-maximo': a => `Faltas: ${a.count}. Pon el máximo que permite el ramo para ver cuántas te quedan.`,
      estricto: () => 'Laboratorio con 100 % de asistencia: no se puede faltar (una falta se recupera con justificación).',
      'estricto-falta': a => `Faltaste ${a.count} ${a.count === 1 ? 'vez' : 'veces'} al laboratorio: avisa al profe y recupera con justificación.`,
      ok: a => `Te quedan ${a.left} ${a.left === 1 ? 'falta' : 'faltas'}.`,
      'queda-1': () => 'Te queda 1 falta: cuídala.',
      limite: () => 'Estás en el límite: no puedes faltar más.',
      pasado: a => `Pasaste el máximo por ${-a.left}.`
    };
    const tone = { 'queda-1': 'warn', limite: 'risk', pasado: 'risk', 'estricto-falta': 'risk', ok: 'ok' };
    return `<article class="pergamino asistencia" style="--ramo:${esc(subject.color)}" aria-labelledby="asisTit">
      <header class="pergamino-head"><p class="eyebrow">LIBRO DE ASISTENCIA</p><h2 id="asisTit">Inasistencias · ${esc(subject.name)}</h2></header>
      <div class="asis-partes">${GROUPS.map(gid => {
        const a = att[gid], cells = a.max !== null ? Math.min(a.max, 24) : 0;
        return `<div class="asis-parte asis-${a.state}"><div class="asis-top"><b>${gid === 'lab' ? 'Laboratorio' : 'Teoría'}</b>
          <label class="asis-max">Máximo de faltas <input type="number" min="0" max="40" inputmode="numeric" data-nt-max="${gid}" value="${a.max === null ? '' : a.max}" placeholder="${a.strict ? '0' : '—'}"></label></div>
          ${a.max !== null ? `<div class="asis-barra" role="img" aria-label="${a.count} de ${a.max} faltas">${Array.from({ length: cells }, (_, i) => `<i class="${i < a.count ? 'cae' : ''}${a.count > a.max ? ' roja' : ''}"></i>`).join('')}</div>` : ''}
          <p class="asis-msg ${tone[a.state] ? 'chip chip-' + tone[a.state] : ''}">${MSG[a.state](a)}</p></div>`;
      }).join('')}</div>
      <form class="asis-form" data-nt-abs-form><label>Fecha <input type="date" name="date" value="${esc(bridge().today())}" required></label>
        <label>Clase <select name="group"><option value="theory">Teoría</option><option value="lab">Laboratorio</option></select></label>
        <button type="submit" class="pix-btn">+ Anotar falta</button></form>
      ${rows.length ? `<ul class="asis-lista">${rows.map(a => `<li><time datetime="${esc(a.date)}">${esc(dateLabel(a.date))}</time><span>${a.group === 'lab' ? 'Laboratorio' : 'Teoría'}</span>
        <button type="button" class="pix-btn suave mini" data-nt-abs-del="${esc(a.id)}" aria-label="Borrar la falta del ${esc(dateLabel(a.date))}">×</button></li>`).join('')}</ul>` : '<p class="pergamino-vacio">Sin faltas anotadas.</p>'}
    </article>`;
  }

  // ——— Pantalla ———
  function panel(S, b) {
    ctx = ctx ? { ...ctx, bridge: b } : { bridge: b };
    const subject = current(), config = cfg(subject.id), evs = evalAll();
    const ev = evs.find(x => x.s.id === subject.id).ev, ov = R().overall(evs.map(x => x.ev));
    const cal = R().calibration(bridge().subjects.map(s => cfg(s.id)));
    const today = bridge().today();
    return `<article class="pergamino notas" style="--ramo:${esc(subject.color)}" aria-labelledby="notasTit">
      <header class="pergamino-head"><div><p class="eyebrow">BALANZA Y LIBRO</p><h2 id="notasTit">Notas</h2></div>
        <div class="promedio" title="Promedio simple: todos los ramos valen igual"><small>Promedio general</small>
          <b>${ov.final !== null ? R().fmt(ov.final, 2) : ov.llevas !== null ? R().fmt(ov.llevas, 2) : '—'}</b><small>${ov.final !== null ? 'final del semestre' : ov.llevas !== null ? `llevas · ${ov.ramos} ${ov.ramos === 1 ? 'ramo' : 'ramos'}` : 'sin notas aún'}</small></div></header>
      ${lomos(evs)}
      <div class="ramo-cabecera"><h3>${esc(subject.name)}</h3>
        <p>${ev.final !== null ? `Nota final: <b>${R().fmt(ev.final, 2)}</b>` : ev.llevas !== null ? `Llevas <b>${R().fmt(ev.llevas, 2)}</b> con lo evaluado` : 'Aún sin notas'}</p>
        <button type="button" class="pix-btn suave" data-nt-edit-toggle aria-pressed="${ui.edit}">${ui.edit ? 'Volver a los frascos' : 'Ajustar ramo'}</button></div>
      ${ev.chips.length ? `<ul class="riesgos" aria-label="Reglas del ramo según tus notas">${ev.chips.map(c => `<li class="chip chip-${c.tone}">${esc(c.text)}</li>`).join('')}</ul>` : ''}
      ${ui.edit ? editor(subject, config) : GROUPS.map(g => repisa(subject, config, ev, g, today)).join('')}
      ${cal.pairs.length ? `<p class="calibra">Calibración: en ${cal.pairs.length} ${cal.pairs.length === 1 ? 'evaluación' : 'evaluaciones'} tu estimación fue ${Math.abs(cal.mean) < .05 ? 'justa' : `${R().fmt(Math.abs(cal.mean), 1)} ${cal.mean > 0 ? 'más alta' : 'más baja'} que la real, en promedio`}.</p>` : ''}
      ${(config.rules || []).length ? `<details class="reglas"><summary>Reglas del ramo (del programa)</summary><ul>${config.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>${config.source ? `<p class="fuente">Fuente: ${esc(config.source)}</p>` : ''}</details>` : ''}
      ${dialogNota(config)}${dialogAutopsia(config)}
    </article>${asistencia(subject)}`;
  }

  // ——— Acciones ———
  function parseTyped(raw) {
    let t = String(raw || '').trim().replace('.', ',');
    if (/^\d{2}$/.test(t)) t = `${t[0]},${t[1]}`;
    else if (/^\d{3}$/.test(t)) t = `${t[0]},${t.slice(1)}`;
    const n = Number(t.replace(',', '.'));
    return Number.isFinite(n) && n >= 1 && n <= 7 && /^\d(,\d{1,2})?$/.test(t) ? n : null;
  }
  const refresh = (focus) => { ctx.refresh(); if (focus) setTimeout(() => document.querySelector(focus)?.focus(), 30); };
  const keep = () => bridge().save();

  function saveGrade(id, n, mode) {
    const config = cfg(ui.subject), row = config.components.find(c => c.id === id); if (!row) return;
    if (mode === 'estimate') {
      const prev = row.estimate; row.estimate = n.toFixed(2); keep(); ui.dialog = null; refresh();
      bridge().toast(`Estimaste ${R().fmt(n, 1)} para ${row.name}. Cuando llegue la nota real, las comparo.`, 'Deshacer', () => { row.estimate = prev ?? ''; keep(); refresh(); });
      ctx.react('idea', 'Anotado. Cuando llegue la nota real vemos qué tan cerca estabas.');
      return;
    }
    const prev = { grade: row.grade, gradedOn: row.gradedOn }, ev = eventFor(id), prevStatus = ev?.status;
    row.grade = n.toFixed(2); row.gradedOn = bridge().today();
    if (ev) ev.status = 'done';
    keep();
    ctx.sound?.('pluma');
    const lv = R().level(n), est = row.estimate === undefined || row.estimate === '' ? NaN : num(row.estimate);
    ui.dialog = null; ui.fresh = { id, level: lv };
    if (lv === 'rojo') ui.autopsy = { id };
    refresh();
    setTimeout(() => { if (ui.fresh?.id === id) { ui.fresh = null; } }, 3500);
    const cmp = Number.isFinite(est) ? ` Estimabas ${R().fmt(est, 1)}: ${est > n + .04 ? `${R().fmt(est - n, 1)} menos de lo esperado` : est < n - .04 ? `${R().fmt(n - est, 1)} más de lo esperado` : 'justo lo que esperabas'}.` : '';
    bridge().toast(`Guardado: ${row.name} ${R().fmt(n, 1)}.${cmp}`, 'Deshacer', () => {
      row.grade = prev.grade; row.gradedOn = prev.gradedOn; if (ev) ev.status = prevStatus || 'planned'; ui.fresh = null; ui.autopsy = null; keep(); refresh();
    });
    ctx.react(lv === 'verde' ? (n >= 6 ? 'deslumbrada' : 'baile') : lv === 'ambar' ? 'saludo' : 'idea',
      lv === 'verde' ? '¡Buena nota! Mira cuánto te queda por asegurar.' : lv === 'ambar' ? 'Anotada. Veamos cuánto necesitas en lo que queda.' : 'Una nota no te define. ¿Vemos qué falló?');
  }

  /* La autopsia de una nota baja entra al cuaderno de errores del ramo: sube su prioridad en el plan de Hoy ("errores abiertos"). */
  const BLOCKER = { concepto: 'concept', calculo: 'formula', tiempo: 'attention', nervios: 'attention', estudio: 'first_step' };
  function autopsyToError(row) {
    const a = row.autopsy, list = bridge().state.errors; if (!list || !a.tipo && !a.causa) return;
    const text = a.tipo || `Nota baja en ${row.name}`;
    let err = row.autopsy.errorId && list.find(x => x.id === row.autopsy.errorId);
    const body = { subject: ui.subject, blocker: BLOCKER[a.causa] || 'concept', observable: `${row.name}: ${text}`, reasoning: a.distinto || '',
      diagnosis: a.distinto ? `Plan propio: ${a.distinto}` : 'Revisar el primer eslabón del razonamiento.', status: 'open', source: 'autopsia' };
    if (err) Object.assign(err, body);
    else { err = { id: bridge().uid('error'), date: bridge().today(), dueAt: bridge().today(), ...body }; list.unshift(err); row.autopsy.errorId = err.id; }
  }

  function click(e) {
    const t = e.target.closest('button, [data-nt-cancel], [data-nt-autopsy-cancel]'); if (!t) return;
    const d = t.dataset;
    if (d.ntSubject) { ui.subject = d.ntSubject; org().notasSubject = ui.subject; keep(); ui.edit = false; return refresh(); }
    if (d.ntEditToggle !== undefined) { ui.edit = !ui.edit; return refresh(); }
    if (d.ntEditDone !== undefined) { ui.edit = false; return refresh(); }
    if (d.ntGrade) {
      const row = cfg(ui.subject).components.find(c => c.id === d.ntGrade); if (!row) return;
      const g = R().known(row);
      ui.dialog = { id: d.ntGrade, mode: 'real', value: g === null ? '' : R().fmt(g, 2).replace(/,?0$/, '') };
      return refresh('[data-nt-input]');
    }
    if (d.ntCancel !== undefined || d.ntCancelBtn !== undefined) { if (e.target.closest('.nt-dialog') && d.ntCancelBtn === undefined) return; ui.dialog = null; return refresh(); }
    if (d.ntMode) { ui.dialog.mode = d.ntMode; const row = cfg(ui.subject).components.find(c => c.id === ui.dialog.id); ui.dialog.value = d.ntMode === 'estimate' && row?.estimate ? R().fmt(num(row.estimate), 1) : ''; return refresh('[data-nt-input]'); }
    if (d.ntKey) {
      const inp = document.querySelector('[data-nt-input]'); if (!inp) return;
      if (d.ntKey === '⌫') inp.value = inp.value.slice(0, -1); else if (inp.value.length < 4 && !(d.ntKey === ',' && inp.value.includes(','))) inp.value += d.ntKey;
      ui.dialog.value = inp.value; inp.focus(); return;
    }
    if (d.ntClear !== undefined) {
      const row = cfg(ui.subject).components.find(c => c.id === ui.dialog.id), prev = { grade: row.grade, gradedOn: row.gradedOn }, ev = eventFor(row.id), ps = ev?.status;
      row.grade = ''; row.gradedOn = ''; if (ev && ev.status === 'done') ev.status = 'planned'; keep(); ui.dialog = null; refresh();
      return bridge().toast(`Nota de ${row.name} borrada.`, 'Deshacer', () => { row.grade = prev.grade; row.gradedOn = prev.gradedOn; if (ev) ev.status = ps || 'planned'; keep(); refresh(); });
    }
    if (d.ntAutopsy) { ui.autopsy = { id: d.ntAutopsy }; return refresh(); }
    if (d.ntAutopsyCancel !== undefined || d.ntAutopsyCancelBtn !== undefined) { if (e.target.closest('.nt-dialog') && d.ntAutopsyCancelBtn === undefined) return; ui.autopsy = null; return refresh(); }
    if (d.ntAdd) {
      const c = cfg(ui.subject); c.components.push({ id: bridge().uid('grade'), name: 'Nueva evaluación', group: d.ntAdd, weight: '', grade: '', date: '' });
      keep(); return refresh();
    }
    if (d.ntDel) {
      const rows = cfg(ui.subject).components, i = rows.findIndex(c => c.id === d.ntDel); if (i < 0) return;
      const [row] = rows.splice(i, 1), linked = (bridge().state.events || []).filter(x => x.sourceId === row.id);
      bridge().state.events = bridge().state.events.filter(x => x.sourceId !== row.id); keep(); refresh();
      return bridge().toast('Evaluación eliminada.', 'Deshacer', () => { rows.splice(i, 0, row); bridge().state.events.push(...linked); keep(); refresh(); });
    }
    if (d.ntAbsDel) {
      const list = bridge().state.absences, i = list.findIndex(a => a.id === d.ntAbsDel); if (i < 0) return;
      const [a] = list.splice(i, 1); keep(); refresh();
      return bridge().toast('Falta borrada.', 'Deshacer', () => { list.splice(Math.min(i, list.length), 0, a); keep(); refresh(); });
    }
  }

  function submit(e) {
    const f = e.target; e.preventDefault();
    if (f.matches('[data-nt-nota-form]')) {
      const n = parseTyped(f.elements.nota.value), err = f.querySelector('.nt-error');
      if (n === null) { err.textContent = 'Escribe una nota entre 1,0 y 7,0 (por ejemplo 5,5).'; err.hidden = false; return; }
      return saveGrade(ui.dialog.id, n, ui.dialog.mode);
    }
    if (f.matches('[data-nt-autopsy-form]')) {
      const row = cfg(ui.subject).components.find(c => c.id === ui.autopsy.id), fd = new FormData(f);
      if (row) { row.autopsy = { tipo: String(fd.get('tipo') || '').trim(), causa: String(fd.get('causa') || ''), distinto: String(fd.get('distinto') || '').trim() }; autopsyToError(row); keep(); }
      ui.autopsy = null; ctx.sound?.('pluma'); refresh(); bridge().toast('Anotado. Con esto elegimos qué practicar.');
      return ctx.react('idea', 'Gracias por contarlo: eso me ayuda a proponerte mejores bloques.');
    }
    if (f.matches('[data-nt-abs-form]')) {
      const fd = new FormData(f), date = String(fd.get('date') || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
      bridge().state.absences.push({ id: bridge().uid('absence'), subject: ui.subject, group: fd.get('group') === 'lab' ? 'lab' : 'theory', date });
      keep(); refresh();
      const a = R().attendance(bridge().state.absences, ui.subject, maxes())[fd.get('group') === 'lab' ? 'lab' : 'theory'];
      ctx.sound?.('sello'); bridge().toast('Falta anotada.');
      if (a.state === 'queda-1') ctx.react('nerviosa', 'Ojo: te queda 1 falta en esta parte.');
      else if (a.state === 'limite' || a.state === 'pasado') ctx.react('nerviosa', 'Llegaste al límite de faltas. Hablemos con el profe si hace falta.');
    }
  }

  function input(e) {
    const t = e.target;
    if (t.dataset.ntSim) {
      const subject = current(), config = cfg(subject.id), v = Number(t.value);
      ui.sim[`${subject.id}:${t.dataset.ntSim}`] = v;
      const box = t.closest('.simulador');
      box.querySelector('[data-nt-simvalor]').textContent = R().fmt(v, 1);
      box.querySelector('[data-nt-simout]').innerHTML = simText(subject.id, config, t.dataset.ntSim, v);
    }
    if (t.dataset.ntInput !== undefined && ui.dialog) { ui.dialog.value = t.value; t.closest('form').querySelector('.nt-error').hidden = true; }
  }

  function change(e) {
    const t = e.target;
    if (t.dataset.ntEdit) {
      const config = cfg(ui.subject), row = config.components.find(c => c.id === t.dataset.ntEdit); if (!row) return;
      const f = t.dataset.ntField;
      if (f === 'name') row.name = t.value.trim() || 'Nueva evaluación';
      else if (f === 'weight') { const n = num(t.value); row.weight = t.value.trim() === '' || !Number.isFinite(n) ? '' : Math.max(0, Math.min(100, n)); }
      else if (f === 'date') row.date = /^\d{4}-\d{2}-\d{2}$/.test(t.value) ? t.value : '';
      bridge().syncGrade(row, ui.subject); keep(); refresh();
    }
    if (t.dataset.ntMax) {
      const m = maxes(); m[ui.subject] = m[ui.subject] || {};
      m[ui.subject][t.dataset.ntMax] = t.value === '' ? '' : Math.max(0, Math.min(40, Math.floor(Number(t.value) || 0)));
      keep(); refresh();
    }
  }

  function keydown(e) {
    if (e.key === 'Escape' && (ui.dialog || ui.autopsy)) { ui.dialog = null; ui.autopsy = null; refresh(); }
  }

  function wire(root, c) {
    ctx = { ...ctx, ...c };
    root.onclick = click; root.onsubmit = submit; root.oninput = input; root.onchange = change; root.onkeydown = keydown;
  }

  window.NexoNotas = Object.freeze({ panel, wire, pixelText, parseTyped });
})();

;

/* planner/calendario.js */
/* Organización · Calendario (UPDATE 02, Fase 3). Mesa de planos del estudio: 4 vistas (Mes, Semana, Semestre, Lista), hoja del día,
   agregar rápido, editar, mover fechas con historial y deshacer, tareas con estado, receso, horario fijo editable y exportar .ics.
   La lógica es de NexoCalendarModel (puro, con prueba); los planes de cada día, de NexoTodayPlan.planDay. Se pinta desde estudio.js. */
(() => {
  'use strict';
  const M = () => window.NexoCalendarModel;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const VIEWS = [['mes', 'Mes'], ['semana', 'Semana'], ['semestre', 'Semestre'], ['lista', 'Lista']];
  const KIND_NAME = { theory: 'Teoría', exercises: 'Ejercicios', lab: 'Laboratorio', seminar: 'Seminario' };
  const TASK_WORD = { pendiente: 'Pendiente', progreso: 'En progreso', hecha: 'Hecha' };
  const ui = { view: 'mes', month: null, week: null, day: null, add: false, addDate: null, edit: null, availability: false, roll: false, schSettings: false, showPast: false, drag: null };
  let ctx = null;
  const bridge = () => ctx.bridge;
  const today = () => bridge().today();
  const org = () => { const s = bridge().state; s.organization = s.organization && typeof s.organization === 'object' ? s.organization : {}; return s.organization; };
  const keep = () => bridge().save();
  const refresh = () => ctx.refresh();

  // ——— Íconos pixel (9 de ancho): el color del ramo va en las celdas "x"; luces y sombras fijas ———
  const ICONS = {
    sello: ['..ooooo..', '.oxxxxxo.', 'oxllxxxxo', 'oxlxddxxo', 'oxxxxdxxo', 'oxxddxxdo', '.oxxxxxdo', '..ooooo..'],
    matraz: ['...ooo...', '...owo...', '...ogo...', '...ogo...', '..ogggo..', '.ogxxxgo.', 'ogxlxxxgo', 'ogxxxxxgo', '.ooooooo.'],
    pluma: ['......ooo', '.....oxxo', '....oxxlo', '...oxxxo.', '..oxxxo..', '.oxxo....', 'odxo.....', 'od.......', 'o........'],
    receso: ['oooooooo.', 'oxxxxxxo.', 'oxlxxxxo.', 'oxxxxxxo.', 'oooooooo.', 'o........', 'o........', 'o........']
  };
  function icon(kind, color) {
    const rows = ICONS[kind] || ICONS.pluma;
    let r = ''; rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') r += `<rect class="px-${ch}" x="${x}" y="${y}" width="1" height="1"/>`; }));
    return `<svg class="ico-px ico-${kind}" viewBox="0 0 9 ${rows.length}" style="--ramo:${esc(color)}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${r}</svg>`;
  }

  // ——— Datos ———
  const subj = id => id === 'personal' ? { id, name: 'Mi vida', short: 'VIDA', color: '#92b9a0' } : bridge().subjectFor(id);
  const subjColor = e => e.type === 'recess' ? '#7494bc' : subj(e.subject).color;
  const tag = e => e.type === 'recess' ? '<span class="ramo" style="--ramo:#7494bc">RECESO</span>' : `<span class="ramo" style="--ramo:${esc(subj(e.subject).color)}">${esc(subj(e.subject).short)}</span>`;
  const schedule = () => { const o = org(); return Array.isArray(o.schedule) ? o.schedule : (typeof NEXO_SEMESTER !== 'undefined' ? NEXO_SEMESTER.schedule : []); };
  const critical = () => window.NexoTodayPlan.critical(bridge().state.events, today());
  const dayNum = d => Number(d.slice(8));
  const longDate = d => new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${d}T12:00:00`));
  function gradeOf(e) {
    const GR = window.NexoGradeRules; if (!GR) return null;
    for (const s of bridge().subjects) {
      const c = bridge().gradeConfig(s.id).components.find(x => x.id === e.id || x.id === e.sourceId || M().GRADE_EVENT[x.id] === e.id);
      if (c) return GR.known(c);
    }
    return null;
  }
  const inCritical = d => (critical() && d >= critical().from && d <= critical().to);

  // ——— Pantalla ———
  function panel(S, b) {
    ctx = ctx ? { ...ctx, bridge: b } : { bridge: b };
    ui.month = ui.month || M().monthKey(today());
    ui.week = ui.week || M().mondayOf(today());
    const body = ui.view === 'mes' ? vistaMes() : ui.view === 'semana' ? vistaSemana() : ui.view === 'semestre' ? vistaSemestre() : vistaLista();
    return `<div class="cal-layout${ui.day ? ' con-hoja' : ''}">
      <article class="pergamino cal" aria-labelledby="calTit">
        <header class="pergamino-head"><div><p class="eyebrow">MESA DE PLANOS</p><h2 id="calTit">Calendario</h2></div>
          <div class="cal-acciones"><button type="button" class="pix-btn" data-cal-add aria-expanded="${ui.add}">+ Agregar</button>
            <button type="button" class="pix-btn suave" data-cal-availability>Mis horarios</button>
            <button type="button" class="pix-btn suave" data-cal-ics title="Llévalo al calendario del celular">Exportar .ics</button></div></header>
        <nav class="cal-vistas" role="tablist" aria-label="Vista del calendario">${VIEWS.map(([id, t]) => `<button type="button" role="tab" aria-selected="${ui.view === id}" data-cal-view="${id}">${t}</button>`).join('')}</nav>
        ${body}
        ${leyenda()}
      </article>${ui.day ? hojaDia() : ''}${ui.availability ? window.NexoEventEditor.availability(org(), b.state.settings?.dailyGoalMinutes || 120) : ui.add || ui.edit ? formulario(ui.edit ? b.state.events.find(e => e.id === ui.edit) : null, ui.addDate || today()) : ''}</div>`;
  }
  const leyenda = () => `<p class="cal-leyenda" aria-label="Leyenda">${icon('sello', '#e2b850')} prueba o control · ${icon('matraz', '#e2b850')} laboratorio · ${icon('pluma', '#e2b850')} entrega o tarea · <span class="leyenda-banda"></span> semana crítica</p>`;

  // ——— Mes: pergamino desplegado en la mesa ———
  function celda(d, evs) {
    const rec = M().recessOn(bridge().state.events, d), icons = evs.filter(e => e.type !== 'recess');
    const names = icons.map(e => e.title).join(', ');
    return `<button type="button" class="dia${d === today() ? ' hoy' : ''}${d === ui.day ? ' sel' : ''}${inCritical(d) ? ' critica' : ''}${rec ? ' receso' : ''}${d < today() ? ' pasado' : ''}" data-cal-day="${d}"
      aria-label="${esc(longDate(d))}: ${icons.length ? icons.length + (icons.length === 1 ? ' evento' : ' eventos') + ': ' + esc(names) : 'sin eventos'}${rec ? '; receso' : ''}">
      <b>${dayNum(d)}</b><span class="dia-ico">${icons.slice(0, 3).map(e => icon(M().kind(e), subjColor(e))).join('')}${icons.length > 3 ? `<small>+${icons.length - 3}</small>` : ''}</span></button>`;
  }
  function vistaMes() {
    const g = M().monthGrid(ui.month), evs = bridge().state.events;
    const roll = ui.roll; ui.roll = false;
    return `<div class="mes"><div class="cal-nav"><button type="button" class="pix-btn mini" data-cal-mes="-1" aria-label="Mes anterior">‹</button><h3>${esc(g.label)}</h3>
      <button type="button" class="pix-btn mini" data-cal-mes="1" aria-label="Mes siguiente">›</button><button type="button" class="pix-btn suave" data-cal-hoy>Hoy</button></div>
      <div class="mes-papel${roll ? ' enrollar' : ''}"><div class="mes-sem" aria-hidden="true">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => `<b>${x}</b>`).join('')}</div>
      <div class="mes-dias">${g.cells.map(d => d ? celda(d, M().eventsOn(evs, d)) : '<span class="vacio" aria-hidden="true"></span>').join('')}</div></div></div>`;
  }

  // ——— Semana: horario fijo + eventos + bloques de estudio (arrastrables) ———
  function bloquesDe(d) {
    if (d < today()) return [];
    return window.NexoTodayPlan.planDay(bridge(), d, critical());
  }
  const blockTime = b => b.start ? `<time class="agenda-slot">${b.start}–${b.end}</time>` : b.done ? '' : '<span class="agenda-slot pending">Sin horario</span>';
  function capacity(d, blocks) {
    const info = window.NexoSchedule.dayInfo(bridge().state, d, schedule());
    const pending = blocks.filter(b => !b.done && (!b.start || b.remainingMinutes));
    return `<div class="day-capacity${pending.length ? ' tight' : ''}"><span>${info.configured ? `${info.available} min libres` : 'Disponibilidad sin definir'}</span>${pending.length ? `<b>${pending.length} sesión${pending.length === 1 ? '' : 'es'} por ubicar</b>` : ''}${info.conflicts.length ? `<small role="status">Hay horarios superpuestos: ${info.conflicts.map(c => esc(c.a + ' / ' + c.b)).join('; ')}.</small>` : ''}${info.warnings.length ? `<small>${info.warnings.map(esc).join(' ')}</small>` : ''}</div>`;
  }
  function vistaSemana() {
    const days = M().weekOf(ui.week), st = bridge().state;
    const label = `${M().shortDate(days[0])} – ${M().shortDate(days[6])}`;
    return `<div class="semana-vista"><div class="cal-nav"><button type="button" class="pix-btn mini" data-cal-sem="-1" aria-label="Semana anterior">‹</button><h3>Semana del ${esc(label)}</h3>
      <button type="button" class="pix-btn mini" data-cal-sem="1" aria-label="Semana siguiente">›</button><button type="button" class="pix-btn suave" data-cal-hoy>Esta semana</button></div>
      <div class="sem-dias">${days.map(d => {
        const evs = M().eventsOn(st.events, d), clases = M().scheduleFor(schedule(), d), bl = bloquesDe(d), rec = M().recessOn(st.events, d);
        return `<section class="sem-dia${d === today() ? ' hoy' : ''}${d < today() ? ' pasado' : ''}${inCritical(d) ? ' critica' : ''}${rec ? ' receso' : ''}" data-cal-drop="${d}" aria-label="${esc(longDate(d))}">
          <header><button type="button" data-cal-day="${d}"><b>${esc(M().weekdayName(d).slice(0, 3))}</b> ${dayNum(d)}</button>${rec ? '<small>receso</small>' : ''}</header>
          ${capacity(d, bl)}
          <ul class="tablillas">${clases.map(c => `<li class="tablilla" style="--ramo:${esc(subj(c.subject).color)}" title="${esc(c.room || '')}"><b>${esc(c.start)}–${esc(c.end)}</b> ${esc(c.name || subj(c.subject).short)} <small>${esc(KIND_NAME[c.kind] || '')}</small></li>`).join('')}</ul>
          <ul class="sem-evs">${evs.filter(e => e.type !== 'recess').map(e => `<li class="sem-ev"><button type="button" data-cal-day="${d}" style="--ramo:${esc(subjColor(e))}">${icon(M().kind(e), subjColor(e))}<span>${esc(subj(e.subject).short)} ${esc(e.title)}${e.time ? ` <small>${esc(e.time)}</small>` : ''}</span></button></li>`).join('')}</ul>
          ${bl.length ? `<ul class="sem-bloques" aria-label="Estudio propuesto">${bl.map(b => `<li class="sem-bloque${b.done ? ' hecho' : ''}" draggable="${b.done ? 'false' : 'true'}" data-cal-drag="${esc(b.event.id)}" data-from="${d}" style="--ramo:${esc(subj(b.subject).color)}">
            ${blockTime(b)}<span class="ramo" style="--ramo:${esc(subj(b.subject).color)}">${esc(subj(b.subject).short)}</span> <b>${b.minutes} min</b> <span class="tinta">${esc(b.text)}</span>
            ${b.remainingMinutes ? `<small>Quedan ${b.remainingMinutes} min por ubicar.</small>` : ''}${b.unplaced ? `<small class="block-warning">${esc(b.unplaced)}</small>` : ''}
            ${b.done ? '' : `<select class="mover" data-cal-mover="${esc(b.event.id)}" data-from="${d}" aria-label="Mover este bloque a otro día"><option value="">Mover a…</option>${days.filter(x => x !== d && x >= today()).map(x => `<option value="${x}">${esc(M().weekdayName(x))} ${dayNum(x)}</option>`).join('')}</select>`}</li>`).join('')}</ul>` : ''}
        </section>`;
      }).join('')}</div>
      <details class="horario"${ui.schSettings ? ' open' : ''}><summary data-cal-sch-toggle>Ajustar mi horario fijo</summary>${editorHorario()}</details></div>`;
  }
  function editorHorario() {
    const sch = schedule();
    const sOpt = id => bridge().subjects.map(s => `<option value="${esc(s.id)}"${s.id === id ? ' selected' : ''}>${esc(s.name)}</option>`).join('') + `<option value="ingles"${id === 'ingles' ? ' selected' : ''}>Otro (ej. Inglés)</option>`;
    return `<div class="hor-lista">${sch.map((b, i) => `<div class="hor-fila">
      <select aria-label="Día" data-cal-sch="${i}:day">${M().WEEKDAYS.map((n, k) => `<option value="${k + 1}"${Number(b.day) === k + 1 ? ' selected' : ''}>${n}</option>`).join('')}</select>
      <input type="time" aria-label="Desde" value="${esc(b.start)}" data-cal-sch="${i}:start"><input type="time" aria-label="Hasta" value="${esc(b.end)}" data-cal-sch="${i}:end">
      <select aria-label="Ramo" data-cal-sch="${i}:subject">${sOpt(b.subject)}</select>
      <select aria-label="Tipo" data-cal-sch="${i}:kind">${Object.entries(KIND_NAME).map(([k, n]) => `<option value="${k}"${b.kind === k ? ' selected' : ''}>${n}</option>`).join('')}</select>
      <button type="button" class="pix-btn suave mini" data-cal-sch-del="${i}" aria-label="Quitar este bloque">×</button></div>`).join('')}
      <button type="button" class="pix-btn suave" data-cal-sch-add>+ Agregar clase</button></div>`;
  }

  // ——— Semestre: línea de tiempo ———
  function vistaSemestre() {
    const sem = M().semester(bridge().state.events, bridge().subjects, today());
    if (!sem) return '<p class="pergamino-vacio">Aún no hay fechas para dibujar el semestre.</p>';
    return `<div class="semestre"><div class="sem-scroll"><div class="sem-ancho"><div class="sem-eje" aria-hidden="true">${sem.months.map(m => `<span style="--p:${m.left / 100}">${esc(m.label)}</span>`).join('')}</div>
      <div class="sem-pista">${sem.bands.map(b => `<i class="banda" style="--p:${b.left / 100};--w:${b.width / 100}" title="Semana crítica: ${b.count} evaluaciones"></i>`).join('')}
        <i class="linea-hoy" style="--p:${sem.today / 100}" title="Hoy"></i>
        ${sem.rows.map(r => `<div class="sem-fila" style="--ramo:${esc(r.subject.color)}"><span class="sem-nombre">${esc(r.subject.short)}</span><div class="sem-carril">${r.items.map((i, k, arr) => {
          const g = gradeOf(i.event), done = i.event.status === 'done';
          // Fechas muy cercanas se escalonan en vertical para que no se tapen.
          i.nivel = k && i.left - arr[k - 1].left < 3 ? 1 - arr[k - 1].nivel : 0;
          return `<button type="button" class="marca${done ? ' hecha' : ''}" style="left:${i.left}%;top:${i.nivel ? 72 : 34}%" data-cal-day="${i.event.date}" title="${esc(subj(i.event.subject).short + ' ' + i.event.title + ' · ' + M().shortDate(i.event.date))}"
            aria-label="${esc(i.event.title)}, ${esc(M().shortDate(i.event.date))}">${icon(i.kind, r.subject.color)}${g !== null ? `<small class="nota nota-${window.NexoGradeRules.level(g)}">${window.NexoGradeRules.fmt(g, 1)}</small>` : ''}</button>`;
        }).join('')}</div></div>`).join('')}</div></div></div>
      ${sem.bands.length ? `<p class="sem-criticas">Semanas críticas: ${sem.bands.map(b => `<b>${esc(window.NexoTodayPlan.range(b.from, b.to))}</b> (${b.count} evaluaciones)`).join(' · ')}.</p>` : ''}</div>`;
  }

  // ——— Lista: por semana ———
  function vistaLista() {
    const st = bridge().state, t = today();
    const list = (st.events || []).filter(e => M().valid(e.date) && (ui.showPast || e.date >= t || e.status !== 'done' && e.date >= M().addDays(t, -7))).sort((a, b) => a.date.localeCompare(b.date) || String(a.time || '').localeCompare(String(b.time || '')));
    const weeks = new Map();
    list.forEach(e => { const k = M().mondayOf(e.date); if (!weeks.has(k)) weeks.set(k, []); weeks.get(k).push(e); });
    return `<div class="lista"><label class="lista-pasadas"><input type="checkbox" data-cal-pasadas ${ui.showPast ? 'checked' : ''}> Ver también las ya pasadas</label>
      ${[...weeks].map(([k, evs]) => `<section class="semana"><h3>Semana del ${esc(M().shortDate(k))}${inCritical(k) ? ' <span class="chip chip-warn">semana crítica</span>' : ''}</h3><ul>${evs.map(e => `<li class="${e.status === 'done' ? 'hecho' : ''}">
        ${icon(M().kind(e), subjColor(e))}<time datetime="${esc(e.date)}">${esc(M().shortDate(e.date))}${e.time ? ' · ' + esc(e.time) : ''}</time> ${tag(e)}
        <span>${esc(e.title)}${e.topic ? ` <small>${esc(e.topic)}</small>` : ''}${e.dateHistory?.length ? ' <small class="movida">(movida)</small>' : ''}</span>
        <button type="button" class="pix-btn suave mini" data-cal-day="${e.date}" aria-label="Abrir ${esc(e.title)}">Abrir</button></li>`).join('')}</ul></section>`).join('') || '<p class="pergamino-vacio">Sin fechas por delante.</p>'}</div>`;
  }

  function formulario(ev, date) {
    return window.NexoEventEditor.render(ev, date, bridge().subjects, ui.lastSubject);
  }

  // ——— Hoja del día (al costado en PC, desde abajo en celular) ———
  function hojaDia() {
    const d = ui.day, st = bridge().state, evs = M().eventsOn(st.events, d), clases = M().scheduleFor(schedule(), d), bl = bloquesDe(d);
    const rec = M().recessOn(st.events, d);
    return `<aside class="hoja-dia" role="dialog" aria-modal="false" aria-labelledby="hojaTit">
      <header><h3 id="hojaTit">${esc(longDate(d))}</h3><button type="button" class="pix-btn suave mini" data-cal-cerrar aria-label="Cerrar la hoja del día">×</button></header>
      ${d === today() ? '<p class="hoja-hoy">Es hoy. <button type="button" class="pix-btn mini" data-route="planner" data-route-sub="hoy">Ver el plan →</button></p>' : ''}
      ${rec ? `<p class="chip chip-info">Receso: ${esc(rec.title)}. El plan de estos días es liviano.</p>` : ''}
      ${clases.length ? `<ul class="tablillas">${clases.map(c => `<li class="tablilla" style="--ramo:${esc(subj(c.subject).color)}"><b>${esc(c.start)}–${esc(c.end)}</b> ${esc(c.name || subj(c.subject).name)} <small>${esc(KIND_NAME[c.kind] || '')}${c.room ? ' · ' + esc(c.room) : ''}</small></li>`).join('')}</ul>` : ''}
      ${evs.map(e => eventoHoja(e)).join('') || '<p class="pergamino-vacio">Nada anotado este día.</p>'}
      ${bl.length ? `<div class="hoja-plan"><h4>Estudio propuesto</h4><ul>${bl.map(b => `<li class="${b.done ? 'hecho' : ''}">${b.minutes} min · <span class="tinta">${esc(b.text)}</span> <small>(${esc(subj(b.subject).short)})</small></li>`).join('')}</ul></div>` : ''}
      <button type="button" class="pix-btn" data-cal-add-aqui="${d}">+ Agregar aquí</button>
    </aside>`;
  }
  function eventoHoja(e) {
    const isTask = ['task', 'deadline'].includes(e.type), ts = M().taskState(e), g = gradeOf(e);
    const hist = e.dateHistory || [];
    return `<div class="evento${e.status === 'done' ? ' hecho' : ''}" style="--ramo:${esc(subjColor(e))}">
      <div class="evento-cab">${icon(M().kind(e), subjColor(e))}<div><b>${esc(e.title)}</b>${e.time ? ` <small>${esc(e.time)}${e.endTime ? '–' + esc(e.endTime) : ''}</small>` : ''}<br>${tag(e)} ${e.type === 'recess' && e.until ? `<small>hasta ${esc(M().shortDate(e.until))}</small>` : ''}${e.difficulty ? ` <small>dificultad ${esc(e.difficulty)}/5</small>` : ''}</div></div>
      ${e.topic ? `<p class="ev-tema">${esc(e.topic)}</p>` : ''}${e.dateNote ? `<p class="ev-nota">${esc(e.dateNote)}</p>` : ''}${e.notes ? `<p class="ev-tema">${esc(e.notes)}</p>` : ''}
      ${g !== null ? `<p class="ev-nota">Nota: <b>${window.NexoGradeRules.fmt(g, 1)}</b></p>` : ''}
      ${isTask ? `<div class="ev-estado" role="group" aria-label="Estado">${['pendiente', 'progreso', 'hecha'].map(s => `<button type="button" class="pix-btn${ts === s ? '' : ' suave'}" aria-pressed="${ts === s}" data-cal-estado="${esc(e.id)}:${s}">${TASK_WORD[s]}</button>`).join('')}</div>`
        : `<div class="ev-estado"><button type="button" class="pix-btn suave" data-cal-hecho="${esc(e.id)}" aria-pressed="${e.status === 'done'}">${e.status === 'done' ? 'Hecha ✓ (deshacer)' : 'Marcar como hecha'}</button></div>`}
      <form class="ev-mover" data-cal-mover-form="${esc(e.id)}"><label>Mover a <input type="date" name="date" value="${esc(e.date)}" required></label><button type="submit" class="pix-btn suave">Mover</button></form>
      ${e.series ? '<label class="series-scope">Borrar de la serie<select data-delete-scope><option value="one">Solo esta ocasión</option><option value="following">Esta y las siguientes</option></select></label>' : ''}
      <div class="ev-acc"><button type="button" class="pix-btn suave" data-cal-editar="${esc(e.id)}">Editar</button><button type="button" class="pix-btn suave" data-cal-borrar="${esc(e.id)}">Borrar</button></div>
      ${hist.length ? `<details class="historial"><summary>Historial de fechas (${hist.length})</summary><ol>${hist.map(h => `<li>${esc(M().shortDate(h.from))} → <b>${esc(M().shortDate(h.to))}</b> <small>${h.undo ? 'deshecho' : 'movida'} el ${esc(M().shortDate(h.on))}</small></li>`).join('')}</ol>
        <button type="button" class="pix-btn suave" data-cal-deshacer="${esc(e.id)}">Deshacer el último cambio</button></details>` : ''}
    </div>`;
  }

  // ——— Acciones ———
  function mover(id, date, from) {
    const m = M().moveEvent(bridge().state, id, date, { today: today() });
    if (!m.ok) return false;
    keep(); ctx.sound?.('sello');
    const e = bridge().state.events.find(x => x.id === id);
    ui.month = date.slice(0, 7);
    refresh();
    bridge().toast(`${e.title}: ${M().shortDate(m.entry.from)} → ${M().shortDate(date)}. Reacomodé tu plan.`, 'Deshacer', () => { m.revert(); keep(); refresh(); });
    ctx.react?.('nerviosa', `Fecha movida al ${M().shortDate(date)}. Ya reacomodé tu plan.`);
    return true;
  }
  function moverBloque(eventId, from, to) {
    if (!to || to === from) return;
    const o = org(); o.marks = o.marks || {}; o.pins = o.pins || {};
    const mk = o.marks[from] = o.marks[from] || { done: [], skip: [] };
    const hadPinFrom = (o.pins[from] || []).includes(eventId), prevSkip = [...mk.skip], prevPinsTo = [...(o.pins[to] || [])], prevPinsFrom = [...(o.pins[from] || [])];
    if (hadPinFrom) o.pins[from] = o.pins[from].filter(x => x !== eventId); else mk.skip = [...new Set([...mk.skip, eventId])];
    o.pins[to] = [...new Set([...(o.pins[to] || []), eventId])];
    keep(); refresh();
    bridge().toast(`Bloque movido al ${M().weekdayName(to)} ${dayNum(to)}.`, 'Deshacer', () => { mk.skip = prevSkip; o.pins[from] = prevPinsFrom; o.pins[to] = prevPinsTo; keep(); refresh(); });
  }

  function click(e) {
    const t = e.target.closest('button, [data-cal-cerrar]'); if (!t) return;
    const d = t.dataset;
    if (d.agendaType) { const f = t.closest('.cal-form'); f.elements.type.value = d.agendaType; return window.NexoEventEditor.update(f); }
    if (d.calAvailability !== undefined) { ui.availability = true; ui.add = false; ui.edit = null; return refresh(); }
    if (d.route) return bridge().go(d.route, d.routeSub);
    if (d.calView) { ui.view = d.calView; ui.day = null; ui.edit = null; return refresh(); }
    if (d.calMes) { ui.month = M().shiftMonth(ui.month, Number(d.calMes)); ui.roll = true; ctx.sound?.('pagina'); return refresh(); }
    if (d.calSem) { ui.week = M().addDays(ui.week, 7 * Number(d.calSem)); return refresh(); }
    if (d.calHoy !== undefined) { ui.month = M().monthKey(today()); ui.week = M().mondayOf(today()); ui.roll = ui.view === 'mes'; return refresh(); }
    if (d.calDay) { ui.day = d.calDay; ui.edit = null; ui.add = false; if (ui.view === 'mes') ui.month = d.calDay.slice(0, 7); if (ui.view === 'semestre' || ui.view === 'lista') { /* la hoja se ve igual */ } refresh(); return setTimeout(() => document.querySelector('.hoja-dia')?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }), 40); }
    if (d.calCerrar !== undefined) { ui.day = null; ui.edit = null; return refresh(); }
    if (d.calAdd !== undefined) { ui.add = true; ui.addDate = null; ui.edit = null; ui.availability = false; return refresh(); }
    if (d.calAddAqui) { ui.add = true; ui.addDate = d.calAddAqui; ui.edit = null; ui.day = null; refresh(); return setTimeout(() => document.querySelector('.cal-form input[name=title]')?.focus(), 40); }
    if (d.calCancel !== undefined) { ui.add = false; ui.edit = null; ui.availability = false; refresh(); return document.querySelector('[data-cal-add]')?.focus({ preventScroll: true }); }
    if (d.calIcs !== undefined) return bridge().exportIcs();
    if (d.calEditar) { ui.edit = d.calEditar; return refresh(); }
    if (d.calEstado) {
      const [id, s] = d.calEstado.split(':'), ev = bridge().state.events.find(x => x.id === id); if (!ev) return;
      const prev = { taskState: ev.taskState, status: ev.status }; M().setTaskState(ev, s); keep(); if (s === 'hecha') ctx.sound?.('tinta'); refresh();
      return bridge().toast(`${ev.title}: ${TASK_WORD[s].toLowerCase()}.`, 'Deshacer', () => { ev.taskState = prev.taskState; ev.status = prev.status; keep(); refresh(); });
    }
    if (d.calHecho) {
      const ev = bridge().state.events.find(x => x.id === d.calHecho); if (!ev) return;
      const prev = ev.status; ev.status = prev === 'done' ? 'planned' : 'done'; keep(); if (ev.status === 'done') ctx.sound?.('tinta'); refresh();
      return bridge().toast(ev.status === 'done' ? `${ev.title}: hecha.` : `${ev.title}: de nuevo pendiente.`, 'Deshacer', () => { ev.status = prev; keep(); refresh(); });
    }
    if (d.calBorrar) {
      const st = bridge().state, ev = st.events.find(x => x.id === d.calBorrar); if (!ev) return;
      const scope = t.closest('.evento')?.querySelector('[data-delete-scope]')?.value;
      const ids = new Set(window.NexoSchedule.seriesMembers(st.events, ev, scope).map(e => e.id));
      const before = st.events.slice(); st.events = st.events.filter(e => !ids.has(e.id));
      keep(); refresh(); return bridge().toast(`${ids.size === 1 ? 'Actividad borrada' : ids.size + ' ocasiones borradas'}.`, 'Deshacer', () => { st.events = before; keep(); refresh(); });
    }
    if (d.calDeshacer) {
      const r = M().undoLastMove(bridge().state, d.calDeshacer, { today: today() }); if (!r.ok) return bridge().toast('No hay un cambio de fecha para deshacer.');
      keep(); ctx.sound?.('sello'); refresh(); return bridge().toast('Fecha devuelta. Reacomodé tu plan.');
    }
    if (d.calSchAdd !== undefined) { const o = org(); o.schedule = schedule().map(b => ({ ...b })); o.schedule.push({ day: 1, start: '08:15', end: '09:35', subject: bridge().subjects[0].id, kind: 'theory' }); ui.schSettings = true; keep(); return refresh(); }
    if (d.calSchDel !== undefined) { const o = org(); o.schedule = schedule().map(b => ({ ...b })); o.schedule.splice(Number(d.calSchDel), 1); ui.schSettings = true; keep(); return refresh(); }
  }

  function formError(f, text) {
    const el = f.querySelector('.agenda-error'); el.textContent = text; el.hidden = false; el.scrollIntoView({ block: 'nearest' });
  }
  function guardarForm(f) {
    const fd = new FormData(f), st = bridge().state, id = f.dataset.calForm;
    const type = String(fd.get('type') || 'exam');
    const draft = { title: String(fd.get('title') || '').trim(), date: String(fd.get('date') || ''), type,
      subject: String(fd.get('subject') || ''), time: String(fd.get('time') || ''), endTime: String(fd.get('endTime') || ''),
      priority: Math.max(1, Math.min(3, Number(fd.get('priority')) || 2)), difficulty: Number(fd.get('difficulty')) || undefined,
      notes: String(fd.get('notes') || '').trim().slice(0, 500), until: type === 'recess' ? String(fd.get('until') || '') : undefined };
    const r = window.NexoSchedule.saveEvent(st, draft, { id, scope: String(fd.get('scope') || 'one'),
      count: !id && fd.has('weekly') ? Number(fd.get('repeatCount')) || 8 : 1, uid: bridge().uid, today: today() });
    if (!r.ok) return formError(f, r.error);
    if (type === 'lab' && window.NexoLabPlan) st.events.filter(e => e.type === 'lab' && !e.lab).forEach(e => { e.lab = window.NexoLabPlan.normalize({}); });
    ui.lastSubject = draft.subject; ui.edit = null; ui.add = false; ui.month = draft.date.slice(0, 7); ui.day = draft.date;
    keep(); ctx.sound?.('sello'); refresh();
    bridge().toast(r.count > 1 ? `${r.count} ocasiones guardadas. El plan se actualizó.` : 'Guardado. El plan se actualizó.', 'Deshacer', () => { r.revert(); keep(); refresh(); });
    ctx.react?.('saludo', 'Anotado. Ya cuenta para tu semana.');
  }

  function submit(e) {
    const f = e.target; e.preventDefault();
    if (f.matches('[data-availability-form]')) {
      const values = window.NexoEventEditor.readAvailability(f); if (values.error) return formError(f, values.error);
      const o = org(), before = { availability: o.availability, minutes: o.minutes, breakMinutes: o.breakMinutes };
      Object.assign(o, values); ui.availability = false; ui.view = 'semana'; keep(); refresh();
      return bridge().toast('Horarios guardados. Ya puedes revisar las horas propuestas.', 'Deshacer', () => { Object.assign(o, before); keep(); refresh(); });
    }
    if (f.matches('[data-cal-form]')) return guardarForm(f);
    if (f.matches('[data-cal-mover-form]')) { const date = String(new FormData(f).get('date')); if (!mover(f.dataset.calMoverForm, date)) bridge().toast('Esa es la misma fecha, o no es válida.'); }
  }
  function change(e) {
    const t = e.target;
    if (t.closest('.cal-form') && ['type', 'weekly'].includes(t.name)) return window.NexoEventEditor.update(t.closest('.cal-form'));
    if (t.matches('[data-cal-pasadas]')) { ui.showPast = t.checked; return refresh(); }
    if (t.dataset.calMover) return moverBloque(t.dataset.calMover, t.dataset.from, t.value);
    if (t.dataset.calSch) {
      const [i, field] = t.dataset.calSch.split(':'), o = org(); o.schedule = schedule().map(b => ({ ...b }));
      const b = o.schedule[Number(i)]; if (!b) return;
      if ((field === 'start' || field === 'end') && !M().validTime(t.value)) return refresh();
      b[field] = field === 'day' ? Number(t.value) : t.value; ui.schSettings = true; keep(); refresh();
    }
  }
  // Arrastrar un bloque de estudio a otro día (PC). En celular se usa "Mover a…".
  function dragstart(e) { const li = e.target.closest?.('[data-cal-drag]'); if (!li) return; ui.drag = { id: li.dataset.calDrag, from: li.dataset.from }; e.dataTransfer?.setData('text/plain', li.dataset.calDrag); e.dataTransfer && (e.dataTransfer.effectAllowed = 'move'); }
  function dragover(e) { const z = e.target.closest?.('[data-cal-drop]'); if (z && ui.drag && z.dataset.calDrop >= today()) { e.preventDefault(); z.classList.add('suelta'); } }
  function dragleave(e) { e.target.closest?.('[data-cal-drop]')?.classList.remove('suelta'); }
  function drop(e) {
    const z = e.target.closest?.('[data-cal-drop]'); if (!z || !ui.drag) return;
    e.preventDefault(); const dr = ui.drag; ui.drag = null; moverBloque(dr.id, dr.from, z.dataset.calDrop);
  }
  function keydown(e) {
    const dialog = e.target.closest('[data-agenda-dialog]');
    if (dialog && e.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button, input, select, textarea, summary')].filter(el => !el.disabled && el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    if (e.key === 'Escape' && (ui.day || ui.edit || ui.add || ui.availability)) {
      if (ui.add || ui.edit || ui.availability) { ui.add = false; ui.edit = null; ui.availability = false; }
      else ui.day = null;
      refresh(); document.querySelector('[data-cal-add]')?.focus({ preventScroll: true });
    }
  }

  function wire(root, c) {
    ctx = { ...ctx, ...c };
    root.onclick = click; root.onsubmit = submit; root.onchange = change; root.onkeydown = keydown;
    root.oninput = e => { const error = e.target.closest('.agenda-form')?.querySelector('.agenda-error'); if (error) error.hidden = true; };
    root.ondragstart = dragstart; root.ondragover = dragover; root.ondragleave = dragleave; root.ondrop = drop;
    const form = root.querySelector('.cal-form'); if (form) window.NexoEventEditor.update(form);
    const dialog = root.querySelector('dialog.agenda-overlay'); if (dialog && !dialog.open) { dialog.showModal(); window.NexoEventEditor.peek(dialog); }
    if (root.querySelector('[data-agenda-dialog]')) requestAnimationFrame(() => root.querySelector('.agenda-form input[name=title], .agenda-form input')?.focus({ preventScroll: true }));
  }
  window.NexoCalendario = Object.freeze({ panel, wire, icon, openAvailability() { ui.availability = true; ui.add = false; ui.edit = null; } });
})();

;

/* planner/estudio-audio.js */
/* Sonido del estudio de planos (UPDATE 02, SPEC "Sonido"): ambiente suave (fuego, lluvia real, tic-tac bajito) y sonidos al actuar
   (pluma, sello, campana). Todo se sintetiza aquí con Web Audio: sin archivos ni red.
   Respeta Ajustes: `sound` + `sfxVolume` para los efectos y `ambient` + `ambientVolume` para el ambiente. Nada suena sin un gesto de la persona. */
(() => {
  'use strict';
  let ctx = null, master = null, amb = null, noiseBuf = null;
  const Ctor = () => window.AudioContext || window.webkitAudioContext;

  function ensure() {
    const C = Ctor(); if (!C) return null;
    if (!ctx) { ctx = new C(); master = ctx.createGain(); master.connect(ctx.destination); }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function noise() {                       // 2 s de ruido blanco, repetible
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  const vol = (s, key, fallback) => { const v = Number(s?.[key]); return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback; };

  function burst(t0, { freq = 3000, q = 1, type = 'bandpass', dur = .08, gain = .2, sweep = 0 }) {
    const src = ctx.createBufferSource(); src.buffer = noise(); src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
    if (sweep) f.frequency.linearRampToValueAtTime(freq + sweep, t0 + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + .008); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    src.connect(f).connect(g).connect(master); src.start(t0, Math.random()); src.stop(t0 + dur + .02);
  }
  function tone(t0, freq, dur, gain, type = 'sine', decay = true) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + .006);
    if (decay) g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); else g.gain.setValueAtTime(gain, t0 + dur);
    o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + .03);
  }

  const SFX = {
    pluma(t) { for (let i = 0; i < 5; i++) burst(t + i * .07, { freq: 3800 + i * 260, q: 2.5, dur: .09, gain: .09, sweep: 700 }); },   // rasguño de pluma sobre papel
    sello(t) { tone(t, 120, .16, .5); tone(t, 62, .22, .45); burst(t, { freq: 700, type: 'lowpass', dur: .1, gain: .35 }); },      // golpe sordo de lacre
    campana(t) { [[880, .5], [1320, .28], [1760, .16], [2640, .08]].forEach(([f, g], i) => tone(t, f * (i ? 1.002 : 1), 1.6, g * .35)); },
    tinta(t) { for (let i = 0; i < 3; i++) burst(t + i * .06, { freq: 3200, q: 2, dur: .07, gain: .07, sweep: 500 }); },
    pagina(t) { burst(t, { freq: 1800, q: .6, dur: .22, gain: .12, sweep: -900 }); }
  };

  /* Un efecto suelto. settings = state.settings. Devuelve true si sonó. */
  function play(name, settings) {
    if (!settings?.sound || !SFX[name] || document.hidden) return false;
    if (!ensure()) return false;
    master.gain.value = vol(settings, 'sfxVolume', .4);
    SFX[name](ctx.currentTime + .01);
    return true;
  }

  /* Ambiente de la sala: fuego siempre, tic-tac bajito, y lluvia si el clima real es de lluvia. */
  function start(settings, weather) {
    stop();
    if (!settings?.ambient || document.hidden || !ensure()) return false;
    const level = vol(settings, 'ambientVolume', .12);
    const bus = ctx.createGain(); bus.gain.value = level * 2.2; bus.connect(ctx.destination);
    const nodes = [], timers = [];
    const loop = (freq, type, gain, q = .7) => {
      const src = ctx.createBufferSource(); src.buffer = noise(); src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = gain;
      src.connect(f).connect(g).connect(bus); src.start(); nodes.push(src);
    };
    loop(420, 'lowpass', .5);                                          // rumor grave de las brasas
    if (weather === 'lluvia' || weather === 'tormenta') { loop(5200, 'bandpass', .3, .5); loop(1800, 'highpass', .08); }
    if (weather === 'nieve' || weather === 'niebla') loop(300, 'lowpass', .12);
    const crackle = () => {                                            // chasquidos del fuego, a intervalos al azar
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime, n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const o = ctx.createBufferSource(); o.buffer = noise();
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500 + Math.random() * 3500; f.Q.value = 3;
        const g = ctx.createGain(); const at = t + i * .03; g.gain.setValueAtTime(.35 * Math.random() + .1, at); g.gain.exponentialRampToValueAtTime(.0001, at + .04);
        o.connect(f).connect(g).connect(bus); o.start(at, Math.random()); o.stop(at + .06);
      }
      timers.push(setTimeout(crackle, 250 + Math.random() * 1400));
    };
    let beat = 0;
    const tick = () => {                                               // tic-tac del reloj (dos tonos suaves)
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime, g = ctx.createGain(), o = ctx.createOscillator();
      o.type = 'square'; o.frequency.value = beat++ % 2 ? 1250 : 1580;
      g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .03);
      o.connect(g).connect(bus); o.start(t); o.stop(t + .04);
    };
    crackle(); timers.push(setInterval(tick, 1000));
    amb = { bus, nodes, timers };
    return true;
  }
  function stop() {
    if (!amb) return;
    amb.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    amb.nodes.forEach(n => { try { n.stop(); } catch (_) { /* ya parado */ } });
    try { amb.bus.disconnect(); } catch (_) { /* ya desconectado */ }
    amb = null;
  }
  const playing = () => !!amb;
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });

  window.NexoEstudioAudio = Object.freeze({ play, start, stop, playing, names: Object.keys(SFX) });
})();

;

/* planner/estudio.js */
/* Organización = estudio de planos de la torre (docs/update-02-organizacion/SPEC.md · Fase 1).
   Escena pixel de borde a borde (arte: tools/torre-pixel/build_estudio.py) con la mascota caminando, y debajo el pergamino sobre madera.
   Objetos: reloj = Hoy · mesa de planos = Calendario · corcho = Pruebas · balanza/libro = Notas · banco = Lab · campana = Avisos.
   La pantalla la llama app.js (#/planner/<vista>) con un "puente" al estado; los cálculos son de NexoPriority, NexoTodayPlan y NexoGrades. */
(() => {
  'use strict';
  const V = '1';
  const BASE = 'assets/torre/estudio/';
  const VIEWS = ['hoy', 'calendario', 'pruebas', 'notas', 'lab', 'avisos'];
  const LEGACY = { calendar: 'hoy', grades: 'notas' };
  const TITLES = { hoy: 'Hoy', calendario: 'Calendario', pruebas: 'Pruebas', notas: 'Notas', lab: 'Laboratorio', avisos: 'Avisos' };
  const HINT = 'Toca un objeto del estudio o el piso para caminar';
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const query = new URLSearchParams(location.search);          // para probar: ?hora=dia|tarde|noche  ?clima=lluvia|nieve|nubes|niebla|tormenta

  let data = null, loading = null, W = null, bridge = null, cssDone = false;
  const cache = {};

  // ——— Carga ———
  function img(src) {
    return new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = BASE + src + '?v=' + V; });
  }
  function css() {
    if (cssDone) return; cssDone = true;
    for (const href of ['world/torre-mundo.css?v=1', 'planner/estudio.css?v=' + V, 'planner/notas.css?v=' + V, 'planner/calendario.css?v=' + V]) {
      if (document.querySelector(`link[href^="${href.split('?')[0]}"]`)) continue;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l);
    }
  }
  function load() {
    loading = loading || Promise.all([
      fetch(BASE + 'estudio.json?v=' + V).then(r => r.json()),
      window.NexoPet?.engine ? window.NexoPet.engine() : Promise.reject(new Error('sin mascota'))
    ]).then(([meta]) => { data = meta; return data; });
    return loading;
  }
  function timeOfDay() {
    const q = query.get('hora'); if (['dia', 'tarde', 'noche'].includes(q)) return q;
    const t = document.body.dataset.nexoTime;
    return t === 'night' ? 'noche' : t === 'dusk' ? 'tarde' : 'dia';
  }
  function layers(tod) {
    cache[tod] = cache[tod] || Promise.all(['vista', 'fondo', 'frente', 'campana'].map(n => img(`${tod}-${n}.png`)))
      .then(([vista, fondo, frente, campana]) => ({ vista, fondo, frente, campana, tod }));
    return cache[tod];
  }
  // Clima real (Open-Meteo, lo pide home-pet.js con su límite de 30 min). Sin red = despejado.
  function weather() {
    const q = query.get('clima'); if (q) return q;
    try {
      const code = JSON.parse(localStorage.getItem('nexo.weather.v1') || 'null')?.code ?? 0;
      if (code >= 95) return 'tormenta';
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'nieve';
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'lluvia';
      if (code === 45 || code === 48) return 'niebla';
      if (code >= 2) return 'nubes';
    } catch (_) { /* sin clima */ }
    return 'despejado';
  }

  // ——— Situación real (la escena la refleja) ———
  function situation() {
    const s = bridge.state, today = bridge.today();
    window.NexoOrgAvisos?.snapshot(bridge);
    const T = window.NexoTodayPlan;
    const crit = T.critical(s.events, today);
    const glasses = T.hourglasses(s.events, today, 21);
    const blocks = todayPlan(crit);
    const next = blocks.find(b => !b.done);
    const avisos = window.NexoOrgAvisos?.list(bridge) || [];
    const unseen = avisos.filter(a => a.nuevo).length;
    const highlight = unseen ? 'avisos' : next ? (next.event.type === 'lab' ? 'lab' : 'pruebas') : null;
    // La balanza se inclina a verde si vas sobre 4,0 y a rojo si vas bajo; los platillos cargan tus frascos verdes y rojos.
    let tilt = 0, reds = 0, greens = 0;
    const GR = window.NexoGradeRules;
    if (GR && bridge.gradeConfig) {
      const evs = bridge.subjects.map(x => GR.evaluate(x.id, bridge.gradeConfig(x.id)));
      const ov = GR.overall(evs);
      tilt = ov.llevas === null ? 0 : Math.max(-1, Math.min(1, (ov.llevas - 4) / 2));
      bridge.subjects.forEach(x => bridge.gradeConfig(x.id).components.forEach(c => {
        const lv = GR.level(GR.known(c)); if (lv === 'rojo') reds++; else if (lv === 'verde') greens++;
      }));
    }
    // La mesa se ordena si cumples el plan de hoy; con semana crítica hay papeles revueltos (sin culpa, es solo ambiente).
    const done = blocks.filter(b => b.done).length;
    const disorder = Math.max(0, Math.min(1, (blocks.length ? 1 - done / blocks.length : 0) * .7 + (crit?.active ? .3 : 0)));
    return { today, crit, glasses, blocks, next, avisos, unseen, highlight, tilt, reds: Math.min(4, reds), greens: Math.min(4, greens), disorder };
  }
  function org() {
    const s = bridge.state;
    if (!s.organization || typeof s.organization !== 'object') s.organization = {};
    const o = s.organization;
    if (!o.minutes || typeof o.minutes !== 'object') o.minutes = {};
    if (!o.marks || typeof o.marks !== 'object') o.marks = {};
    // se guardan solo 14 días de marcas
    const keys = Object.keys(o.marks).sort();
    keys.slice(0, Math.max(0, keys.length - 14)).forEach(k => delete o.marks[k]);
    return o;
  }
  function minutesToday() {
    const o = org(), wd = new Date().getDay();
    const v = o.minutes[wd];
    return Number.isFinite(Number(v)) ? Number(v) : bridge.state.settings.dailyGoalMinutes || 120;
  }
  function marksToday() {
    const o = org(), t = bridge.today();
    o.marks[t] = o.marks[t] || { done: [], skip: [] };
    return o.marks[t];
  }
  const todayPlan = crit => window.NexoTodayPlan.planDay(bridge, bridge.today(), crit);

  // ——— Escena ———
  function createWorld() {
    const meta = data;
    const stage = document.createElement('canvas'); stage.width = meta.w; stage.height = meta.h;
    const pet = window.NexoPet.current(), reduced = window.NexoPet.reduced();
    const life = window.PixelVida.create({ canvas: stage, background: null, stations: {}, route: [], manual: true, speed: 2.2,
      start: { x: meta.home[0], y: meta.home[1] }, kind: pet.kind, reduced, depth: y => .86 + clamp((y - 122) / 22, 0, 1) * .14 });
    life.setOutfit(pet.outfit);
    const wrap = document.createElement('section');
    wrap.className = 'torre-scene estudio-scene';
    wrap.setAttribute('aria-label', 'Estudio de planos de la torre');
    wrap.innerHTML = `<canvas class="torre-view" height="${meta.h * 2}" aria-hidden="true"></canvas><div class="torre-title"></div>
      <p class="torre-tip" hidden></p><p class="torre-say" role="status" aria-live="polite" hidden></p>
      <p class="torre-hint">${HINT}</p><div class="torre-keys" role="group" aria-label="Objetos del estudio"></div>`;
    const view = wrap.querySelector('.torre-view');
    const w = { meta, stage, life, wrap, view, vctx: view.getContext('2d'), reduced, camX: 0, vw: meta.w, scale: 1, raf: 0,
      last: performance.now(), lastInput: performance.now(), nextIdle: 10000, sayTimer: 0, t: 0, L: null, tod: null, view_: null, said: '' };
    wireInput(w);
    return w;
  }

  const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const DIG = { 0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '011', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'] };
  function digits(g, x, y, n, c) {
    String(n).split('').forEach((d, i) => DIG[d]?.forEach((row, j) => [...row].forEach((b, k) => { if (b === '1') px(g, x + i * 4 + k, y + j, c); })));
  }

  function drawWeather(g, x0, t, kind) {
    const win = W.meta.window, wx0 = x0 + win.x0 - 4, wx1 = x0 + win.x1 + 4, wy0 = win.y0, wy1 = win.y1;
    if (kind === 'despejado') return;
    g.save();
    g.beginPath(); g.rect(wx0, wy0, wx1 - wx0, wy1 - wy0); g.clip();
    if (kind === 'nubes' || kind === 'lluvia' || kind === 'tormenta') {
      g.fillStyle = kind === 'nubes' ? 'rgba(150,160,180,.28)' : 'rgba(70,80,100,.42)'; g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    }
    if (kind === 'niebla') {
      for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(230,232,240,.18)'; g.fillRect(wx0, wy0 + 40 + k * 24 + Math.round(Math.sin(t * .3 + k) * 3), wx1 - wx0, 10); }
    }
    if (kind === 'lluvia' || kind === 'tormenta') {
      for (let i = 0; i < 70; i++) {
        const x = wx0 + ((i * 37 + Math.floor(t * 40)) % (wx1 - wx0)), y = wy0 + ((i * 53 + Math.floor(t * 180)) % (wy1 - wy0));
        px(g, x, y, '#dce8ff'); px(g, x - 1, y + 2, '#a8c4e8'); px(g, x - 2, y + 4, '#7894bc');
      }
      if (kind === 'tormenta' && Math.sin(t * .7) > .985) { g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0); }
    }
    if (kind === 'nieve') {
      for (let i = 0; i < 40; i++) {
        const x = wx0 + ((i * 29 + Math.sin(t + i) * 4 + 400) % (wx1 - wx0)), y = wy0 + ((i * 41 + t * 18) % (wy1 - wy0));
        px(g, x, y, '#ffffff');
      }
    }
    g.restore();
  }

  function drawClock(g, x0, t) {
    const c = W.meta.clock, now = new Date();
    const [pxv, py, len] = c.pend;
    const sw = W.reduced ? 0 : Math.sin(t * 2.6) * 4;
    for (let k = 0; k < len - 4; k++) px(g, x0 + pxv + sw * k / len, py + k, '#ba8a30');
    g.fillStyle = '#e2b850'; g.fillRect(Math.round(x0 + pxv + sw) - 3, py + len - 5, 7, 6);
    g.fillStyle = '#fff6c8'; g.fillRect(Math.round(x0 + pxv + sw) - 2, py + len - 4, 2, 2);
    const hand = (ang, l, col) => { for (let k = 0; k <= l; k++) px(g, x0 + c.cx + Math.sin(ang) * k, c.cy - Math.cos(ang) * k, col); };
    const m = now.getMinutes() + now.getSeconds() / 60, h = (now.getHours() % 12) + m / 60;
    hand(m / 60 * Math.PI * 2, 9, '#3a2416');
    hand(h / 12 * Math.PI * 2, 6, '#140c10');
    px(g, x0 + c.cx, c.cy, '#a83818');
  }

  function drawCork(g, x0, S) {
    const c = W.meta.cork, list = S.glasses.slice(0, 8);
    list.forEach((h, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = x0 + c.x0 + 8 + col * 21, y = c.y0 + 9 + row * 31 + (col % 2) * 3;
      const near = h.days <= 7, subj = bridge.subjectFor(h.event.subject);
      g.fillStyle = 'rgba(30,14,12,.45)'; g.fillRect(x + 1, y + 2, 17, 22);
      g.fillStyle = near ? '#f4d6b0' : '#efe2c0'; g.fillRect(x, y, 17, 22);
      g.fillStyle = near ? '#b44c40' : '#a69070'; g.fillRect(x, y, 17, 1); g.fillRect(x, y + 21, 17, 1); g.fillRect(x, y, 1, 22); g.fillRect(x + 16, y, 1, 22);
      if (near) { g.fillStyle = '#d87052'; g.fillRect(x + 1, y + 1, 15, 3); }
      digits(g, x + 3 + (h.days < 10 ? 2 : 0), y + 7, h.days, near ? '#8c3234' : '#47281b');
      g.fillStyle = '#7a6650'; g.fillRect(x + 3, y + 15, 11, 1); g.fillRect(x + 3, y + 18, 7, 1);
      g.fillStyle = subj.color || '#ba8a30'; g.fillRect(x + 7, y - 2, 3, 3);
      px(g, x + 7, y - 2, '#fff6c8');
    });
  }

  function drawAnim(g, x1, t, S) {
    const a = W.meta.anim;
    (a.fire || []).forEach(([fx, fy, h], i) => {
      const k = Math.floor(t * 9 + i * 1.7) % 3, top = fy - h;
      px(g, x1 + fx + [0, -1, 1][k], top - 1, '#ffc850'); px(g, x1 + fx, top - 2 - (k === 2 ? 1 : 0), '#f89a30');
      if (k === 1) px(g, x1 + fx + 1, top + 2, '#fffce8');
    });
    for (let i = 0; i < 4; i++) {                                     // chispas que suben de la chimenea
      const p = (t * .45 + i * .27) % 1;
      if (p < .7) px(g, x1 + 62 + i * 7 + Math.sin(t * 2 + i) * 3, 196 - p * 34, p < .35 ? '#ffe890' : '#f89a30');
    }
    (a.candles || []).forEach(([cx, cy], i) => {
      const k = Math.floor(t * 8 + i * 2.3) % 3;
      px(g, x1 + cx + (k === 1 ? -1 : k === 2 ? 1 : 0), cy - 1, '#ffc850'); px(g, x1 + cx, cy + 1, k ? '#fffce8' : '#ffe890');
    });
    const [lx, ly] = a.lantern, lk = Math.floor(t * 7) % 3;
    px(g, x1 + lx + (lk - 1), ly - 18, '#fffce8');
    const busy = (S.blocks.some(b => !b.done && b.event.type === 'lab') ? 2 : 1);   // más burbujas si hay pre-lab pendiente
    (a.bubbles || []).forEach(([bx, by], i) => {
      for (let r = 0; r < busy; r++) {
        const k = (t * .7 * (r ? 1.6 : 1) + i * .29 + r * .5) % 1;
        if (k < .8) px(g, x1 + bx + Math.sin(t * 4 + i + r) * 1.5, by - k * 12, '#eef09a');
      }
    });
    (a.shrooms || []).forEach(([sx, sy], i) => { if (Math.sin(t * 1.4 + i * 2.1) > .7) px(g, x1 + sx, sy - 2 - (t * 3 + i) % 4, '#a8f0dc'); });
    (W.meta.dust[W.L.tod] || []).forEach(([dx, dy], i) => {
      if (Math.sin(t * 1.1 + i) > -.2) px(g, x1 + dx + Math.sin(t * .8 + i) * 3, dy - ((t * 4 + i * 7) % 20), 'rgba(255,240,176,.85)');
    });
  }

  function drawBell(g, x1, t, S) {
    const b = W.meta.bell;
    let f = 0;
    if (S.unseen && !W.reduced) { const s = Math.sin(t * 5); if ((t % 6) < 1.6) f = s > .3 ? 1 : s < -.3 ? 2 : 0; }
    g.drawImage(W.L.campana, f * b.w, 0, b.w, b.h, x1 + b.x, b.y, b.w, b.h);
    if (S.unseen) {                                                  // marca de aviso nuevo
      const k = W.reduced ? 1 : Math.floor(t * 3) % 2;
      g.fillStyle = k ? '#ffd860' : '#e0b030'; g.fillRect(x1 + b.x + b.w - 6, b.y + 2, 4, 4);
      g.fillStyle = '#3a2a10'; g.fillRect(x1 + b.x + b.w - 5, b.y + 3, 2, 1);
    }
  }

  function drawHighlight(g, x1, t, S) {
    const o = W.meta.objects.find(k => k.view === S.highlight); if (!o) return;
    const [ax, ay, bx, by] = o.rect.map(v => v * 2);
    const pts = [[ax, ay], [bx, ay], [ax, by], [bx, by], [(ax + bx) / 2, ay - 4]];
    pts.forEach(([x, y], i) => {
      const on = W.reduced || Math.sin(t * 3 + i * 1.3) > -.2;
      if (!on) return;
      const c = i % 2 ? '#fff0a8' : '#ffd860';
      px(g, x1 + x, y, c); px(g, x1 + x - 1, y, c); px(g, x1 + x + 1, y, c); px(g, x1 + x, y - 1, c); px(g, x1 + x, y + 1, c);
    });
  }

  // Balanza de latón: el travesaño se inclina por escalones según tus notas; cada platillo carga gemas (rojas = frascos rojos, verdes = verdes).
  function drawScale(g, x1, t, S) {
    const m = W.meta.scale, target = S.tilt * 7;
    W.scaleD = W.reduced ? target : (W.scaleD ?? 0) + (target - (W.scaleD ?? 0)) * .05;
    const d = Math.round(W.scaleD + (W.reduced ? 0 : Math.sin(t * 1.3) * .6));
    const cx = x1 + m.cx, y = m.y;
    for (let xx = -22; xx <= 22; xx++) {
      const by = Math.round(y + d * xx / 22);
      g.fillStyle = '#fbe08a'; g.fillRect(cx + xx, by - 1, 1, 1);
      g.fillStyle = '#e2b850'; g.fillRect(cx + xx, by, 1, 1);
      g.fillStyle = '#8a5c20'; g.fillRect(cx + xx, by + 1, 1, 1);
    }
    g.fillStyle = '#fff6c8'; g.fillRect(cx - 1, y - 3, 3, 3); g.fillStyle = '#ba8a30'; g.fillRect(cx - 2, y - 2, 5, 3);
    [[-22, -d, S.reds, '#d87052', '#8c3234'], [22, d, S.greens, '#83ad42', '#30644a']].forEach(([ox, od, n, lite, dark]) => {
      const ex = cx + ox, ey = y + od;
      g.fillStyle = '#a8bab6'; for (let k = 0; k < 15; k++) { g.fillRect(ex - Math.round(k * .45), ey + k, 1, 1); g.fillRect(ex + Math.round(k * .45), ey + k, 1, 1); }
      const py = ey + 15;
      g.fillStyle = '#e2b850'; g.fillRect(ex - 9, py, 19, 2); g.fillStyle = '#8a5c20'; g.fillRect(ex - 7, py + 2, 15, 1);
      for (let i = 0; i < n; i++) {
        const gx = ex - 7 + (i % 3) * 5, gy = py - 4 - Math.floor(i / 3) * 4;
        g.fillStyle = dark; g.fillRect(gx, gy, 4, 4); g.fillStyle = lite; g.fillRect(gx, gy, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(gx, gy, 1, 1);
      }
    });
  }

  // Papeles sueltos sobre la mesa de planos: más si no has cumplido el plan o hay semana crítica.
  function drawTable(g, x1, S) {
    const tb = W.meta.table, n = Math.round(S.disorder * 8);
    for (let i = 0; i < n; i++) {
      const x = x1 + tb.x0 + 10 + ((i * 37 + 11) % (tb.x1 - tb.x0 - 30)), y = tb.top - 13 + (i * 5) % 5, lean = (i % 3) - 1;
      for (let r = 0; r < 7; r++) {
        const ox = Math.round(lean * r * .6);
        g.fillStyle = r === 0 ? '#fff4d8' : r === 6 ? '#a69070' : '#e6d6b2'; g.fillRect(x + ox, y + r, 11, 1);
        if (r === 2 || r === 4) { g.fillStyle = '#7a6650'; g.fillRect(x + ox + 2, y + r, 5 + (i % 3), 1); }
      }
      g.fillStyle = '#140c10'; g.fillRect(x - 1 + Math.round(lean * 3 * .6), y - 1, 1, 1);
    }
  }

  const PET_FILTER = { dia: 'none', tarde: 'brightness(.92) sepia(.18)', noche: 'brightness(.62) saturate(.8)' };
  function draw(t) {
    const g = W.vctx, m = W.meta, S = 2, L = W.L, Sx = W.sit;
    const center = (m.w - W.vw) / 2;
    const at = f => -Math.round((center + (W.camX - center) * f) * S);
    g.clearRect(0, 0, W.view.width, W.view.height);
    if (!L || !Sx) return;
    g.imageSmoothingEnabled = false;
    g.drawImage(L.vista, at(m.parallax.vista), 0);
    const x1 = at(1);
    drawWeather(g, at(m.parallax.vista), t, W.weather);
    g.drawImage(L.fondo, x1, 0);
    drawClock(g, x1, t);
    drawCork(g, x1, Sx);
    drawScale(g, x1, t, Sx);
    drawTable(g, x1, Sx);
    if (!W.reduced) drawAnim(g, x1, t, Sx);
    drawBell(g, x1, t, Sx);
    drawHighlight(g, x1, t, Sx);
    g.save(); g.filter = PET_FILTER[L.tod] || 'none';
    g.drawImage(W.stage, x1, 0, m.w * S, m.h * S);
    g.restore();
    g.drawImage(L.frente, at(m.parallax.frente), 0, m.w * S, m.h * S);
    if (Sx.crit?.active) { g.fillStyle = 'rgba(255,150,70,.07)'; g.fillRect(0, 0, W.view.width, W.view.height); }   // semana crítica: algo más cálido
  }

  function frame(now) {
    W.raf = 0;
    if (!W.wrap.isConnected) { W.life.pause(true); window.NexoEstudioAudio?.stop(); return; }
    const dt = Math.min(.05, (now - W.last) / 1000); W.last = now; W.t += dt;
    const tod = timeOfDay();
    if (tod !== W.tod) { W.tod = tod; layers(tod).then(L => { if (W.tod === L.tod) W.L = L; }); }
    const A = W.life.state, maxCam = Math.max(0, W.meta.w - W.vw);
    const target = clamp(A.x - W.vw / 2, 0, maxCam);
    W.camX = W.reduced ? target : W.camX + (target - W.camX) * (1 - Math.exp(-dt * 4));
    draw(W.t);
    placeBubble();
    idle(now);
    W.raf = requestAnimationFrame(frame);
  }

  function resize() {
    const app = document.getElementById('app'), page = W.wrap.parentElement;
    if (!app || !page) return;
    const a = app.getBoundingClientRect(), p = page.getBoundingClientRect(), width = a.width;
    W.wrap.style.width = width + 'px';
    W.wrap.style.marginLeft = (a.left - p.left) + 'px';
    W.wrap.style.marginTop = -(parseFloat(getComputedStyle(page).paddingTop) || 0) + 'px';
    const minH = innerWidth < 700 ? 300 : 340;
    const scale = Math.max(width / W.meta.w, minH / W.meta.h);
    const cssH = Math.round(W.meta.h * scale);
    W.wrap.style.height = cssH + 'px';
    W.vw = Math.min(W.meta.w, Math.ceil(width / scale));
    W.scale = scale;
    W.view.width = W.vw * 2; W.view.height = W.meta.h * 2;
    W.view.style.width = (W.vw * scale) + 'px'; W.view.style.height = cssH + 'px';
    W.camX = clamp(W.life.state.x - W.vw / 2, 0, Math.max(0, W.meta.w - W.vw));
  }

  // ——— Entrada ———
  function toArt(w, e) {
    const r = w.view.getBoundingClientRect();
    return [Math.round(w.camX) + (e.clientX - r.left) / r.width * w.vw, (e.clientY - r.top) / r.height * w.meta.h, r];
  }
  const hit = (w, x, y) => w.meta.objects.find(o => x >= o.rect[0] && x < o.rect[2] && y >= o.rect[1] && y < o.rect[3]);
  function wireInput(w) {
    w.view.addEventListener('pointerdown', e => {
      const [x, y] = toArt(w, e);
      w.lastInput = performance.now();
      const A = w.life.state;
      if (Math.abs(x - A.x) < 12 && y < A.y + 3 && y > A.y - 40) { w.life.poke(); return; }
      const o = hit(w, x, y);
      if (o) { use(o); return; }
      const [y0, y1] = w.meta.walk;
      w.life.walkTo(clamp(x, 10, w.meta.w - 10), y >= w.meta.floor ? clamp(y, y0, y1) : A.y);
    });
    w.view.addEventListener('pointermove', e => {
      const [x, y, r] = toArt(w, e), o = hit(w, x, y), tip = w.wrap.querySelector('.torre-tip');
      w.view.style.cursor = o ? 'pointer' : 'default';
      if (!o) { tip.hidden = true; return; }
      tip.textContent = o.label; tip.hidden = false;
      const cx = ((o.rect[0] + o.rect[2]) / 2 - Math.round(w.camX)) * w.scale;
      tip.style.left = clamp(cx, 70, r.width - 70) + 'px'; tip.style.top = Math.max(4, o.rect[1] * w.scale - 30) + 'px';
    });
    w.view.addEventListener('pointerleave', () => { w.wrap.querySelector('.torre-tip').hidden = true; });
    const box = w.wrap.querySelector('.torre-keys');
    box.innerHTML = w.meta.objects.filter(o => o.view).map(o => `<button type="button" data-obj="${o.id}">${esc(o.label)}</button>`).join('');
    box.onclick = e => { const o = w.meta.objects.find(k => k.id === e.target.closest('[data-obj]')?.dataset.obj); if (o) use(o); };
  }
  function say(text, ms = 3200) {
    const b = W.wrap.querySelector('.torre-say');
    b.textContent = text; b.hidden = false;
    clearTimeout(W.sayTimer); W.sayTimer = setTimeout(() => { b.hidden = true; }, ms);
  }
  function placeBubble() {
    const b = W.wrap.querySelector('.torre-say'); if (b.hidden) return;
    const A = W.life.state;
    b.style.left = clamp((A.x - Math.round(W.camX)) * W.scale, 90, W.vw * W.scale - 90) + 'px';
    b.style.top = Math.max(2, (A.y - 50) * W.scale - b.offsetHeight) + 'px';
  }
  // La mascota del estudio reacciona (notas nuevas, faltas). tone = nombre de un gesto de PixelVida.
  function react(tone, text) {
    if (!W) return;
    try { W.life.act(tone); } catch (_) { /* sin gesto */ }
    if (text) say(text, 4600);
  }
  const sound = name => window.NexoEstudioAudio?.play(name, bridge.state.settings);
  function ambient() {
    const A = window.NexoEstudioAudio; if (!A || !bridge.state.settings.ambient || A.playing()) return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;     // sin gesto, el navegador no deja sonar
    A.start(bridge.state.settings, W.weather);
  }
  async function use(o) {
    W.lastInput = performance.now();
    const arrived = await W.life.walkTo(o.stand[0], o.stand[1]);
    if (!arrived) return;
    if (!o.view) { say(o.say); W.life.act('deslumbrada'); return; }
    say(o.say, 2200);
    if (o.view === 'avisos') { sound('campana'); window.NexoOrgAvisos?.markSeen(bridge); }
    if (location.hash !== '#/planner/' + o.view) location.hash = '#/planner/' + o.view;
  }
  function idle(now) {
    const A = W.life.state;
    if (W.reduced || A.moving || W.life.busy || now - W.lastInput < W.nextIdle) return;
    W.lastInput = now; W.nextIdle = 10000 + Math.random() * 8000;
    if (Math.random() < .5) { W.life.act(['saludo', 'idea', 'baile'][Math.floor(Math.random() * 3)]); return; }
    const [y0, y1] = W.meta.walk;
    W.life.walkTo(clamp(A.x + (Math.random() * 80 - 40), 30, W.meta.w - 30), y0 + Math.random() * (y1 - y0));
  }

  // ——— Paneles (pergamino sobre madera) ———
  const shortDate = d => { const x = new Date(`${d}T12:00:00`); return `${x.getDate()} ${MONTHS[x.getMonth()]}`; };
  const longToday = () => new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const tag = s => `<span class="ramo" style="--ramo:${esc(s.color)}">${esc(s.short)}</span>`;
  const when = d => d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`;

  function hourglass(h) {
    const s = bridge.subjectFor(h.event.subject);
    return `<li class="reloj u-${h.urgency}"><span class="reloj-arena" style="--f:${h.level}" aria-hidden="true"></span>
      <span class="reloj-n"><b>${h.days}</b><small>${h.days === 1 ? 'día' : 'días'}</small></span>
      <span class="reloj-que">${tag(s)} <b>${esc(h.event.title)}</b><time datetime="${esc(h.event.date)}">${shortDate(h.event.date)}</time></span></li>`;
  }
  function ribbon(crit) {
    if (!crit || !crit.active) return '';
    return `<div class="cinta" role="note"><span>Semana crítica · ${esc(crit.label)}</span></div>`;
  }

  function panelHoy(S) {
    const mins = minutesToday(), studied = Math.round((bridge.state.sessions || []).filter(x => x.date === S.today)
      .reduce((a, x) => a + (Number(x.seconds) || Number(x.minutes || 0) * 60), 0) / 60);
    const planned = S.blocks.reduce((a, b) => a + b.minutes, 0);
    const flash = S.blocks.some(b => b.flash);
    const o = org(), schedule = Array.isArray(o.schedule) ? o.schedule : (typeof NEXO_SEMESTER !== 'undefined' ? NEXO_SEMESTER.schedule : []);
    const info = window.NexoSchedule.dayInfo(bridge.state, S.today, schedule);
    const pending = S.blocks.filter(b => !b.done && (!b.start || b.remainingMinutes));
    const commitments = info.occupied.slice().sort((a, b) => a.start - b.start);
    const blocks = S.blocks.length ? `<ol class="plan-bloques">${S.blocks.map(b => {
      const s = bridge.subjectFor(b.subject);
      return `<li class="bloque${b.done ? ' hecho' : ''}" data-bloque="${esc(b.id)}">
        <span class="bloque-n" aria-hidden="true">${b.order}</span>
        <div class="bloque-txt"><p class="bloque-ramo">${b.start ? `<time class="agenda-slot">${b.start}–${b.end}</time>` : ''}${tag(s)} <b>${b.minutes} min</b></p>
          <h3><span class="tinta">${esc(b.text)}</span></h3>
          <p class="bloque-razon">${esc(b.reason)}</p><p class="bloque-porque">${esc(b.why)}</p>${b.unplaced ? `<p class="block-warning">${esc(b.unplaced)}</p>` : ''}${b.remainingMinutes ? `<p class="block-warning">Quedan ${b.remainingMinutes} min de esta sesión por ubicar.</p>` : ''}</div>
        <div class="bloque-acciones">${b.done
          ? `<span class="bloque-ok">Hecho${b.auto ? ' (cronómetro)' : ''}</span>${b.auto ? '' : `<button type="button" class="pix-btn suave" data-org-undo="${esc(b.id)}">Deshacer</button>`}`
          : `<button type="button" class="pix-btn" data-org-start="${esc(b.id)}">Empezar</button>
             <button type="button" class="pix-btn suave" data-org-done="${esc(b.id)}">Listo</button>
             <button type="button" class="pix-btn suave" data-org-skip="${esc(b.id)}">Hoy no</button>`}</div></li>`;
    }).join('')}</ol>` : `<p class="pergamino-vacio">${mins <= 0 ? 'Hoy descansas: no hay plan. Descansar también es parte de estudiar.' : 'El caldero está tranquilo: nada urgente. Buen día para adelantar o repasar.'}</p>`;
    return `<article class="pergamino hoy" aria-labelledby="hoyTitle">
      <header class="pergamino-head"><p class="eyebrow">HOY · ${esc(longToday())}</p><h2 id="hoyTitle">Plan del día</h2>
        <div class="hoy-tiempo" role="group" aria-label="Tiempo para estudiar hoy">
          <button type="button" class="pix-btn mini" data-org-min="-15" aria-label="15 minutos menos">−</button>
          <b>${mins} min</b><button type="button" class="pix-btn mini" data-org-min="15" aria-label="15 minutos más">+</button>
          <small>los ${esc(new Intl.DateTimeFormat('es-CL', { weekday: 'long' }).format(new Date()))}</small></div></header>
      ${ribbon(S.crit)}
      <div class="today-capacity"><div><b>${info.configured ? `${info.available} min disponibles en lo que queda del día` : 'Dale un horario a tu plan'}</b><p>${info.configured ? 'Las propuestas respetan tus compromisos y las pausas.' : 'Indica cuándo puedes estudiar para que Nexo encuentre espacios reales.'}</p></div><button type="button" class="pix-btn suave" data-org-availability>Mis horarios</button></div>
      ${commitments.length ? `<details class="today-commitments" open><summary>Tus compromisos de hoy · ${commitments.length}</summary><ul>${commitments.map(c => `<li><time>${window.NexoSchedule.clock(c.start)}–${window.NexoSchedule.clock(c.end)}</time><span>${esc(c.title)}</span></li>`).join('')}</ul></details>` : ''}
      ${info.conflicts.length || info.warnings.length ? `<p class="block-warning">${info.conflicts.map(c => `Se superponen ${esc(c.a)} y ${esc(c.b)}.`).concat(info.warnings.map(esc)).join(' ')}</p>` : ''}
      ${pending.length && info.configured ? `<p class="block-warning">Hay ${pending.length} sesión${pending.length === 1 ? '' : 'es'} con tiempo pendiente de ubicar. Revisa tu semana antes de añadir más.</p>` : ''}
      ${flash ? '<p class="modo-prueba">Día de prueba: solo un repaso flash. Sin materia nueva, calma y a rendir.</p>' : ''}
      ${blocks}
      <p class="plan-total">Plan ${planned} de ${mins} min · llevas ${studied} min hoy. El alquimista propone, tú decides: si hoy no se puede, la poción se reacomoda sin culpa.</p>
    </article>
    <article class="pergamino viene" aria-labelledby="vieneTitle">
      <header class="pergamino-head"><p class="eyebrow">RELOJES DE ARENA</p><h2 id="vieneTitle">Lo que viene</h2></header>
      ${S.glasses.length ? `<ul class="relojes">${S.glasses.map(hourglass).join('')}</ul>` : '<p class="pergamino-vacio">Sin pruebas en las próximas 3 semanas.</p>'}
    </article>`;
  }

  function panelPruebas(S) {
    const T = window.NexoTodayPlan, list = T.hourglasses(bridge.state.events, S.today, 120);
    return `<article class="pergamino"><header class="pergamino-head"><p class="eyebrow">TABLERO DE CORCHO</p><h2>Pruebas</h2></header>
      ${list.length ? `<ul class="fichas">${list.map(h => {
        const s = bridge.subjectFor(h.event.subject), e = h.event;
        return `<li class="ficha u-${h.urgency}"><span class="reloj-arena" style="--f:${h.level}" aria-hidden="true"></span>
          <div><p>${tag(s)} <b>${esc(e.title)}</b> · ${shortDate(e.date)} (${when(h.days)})</p>
          ${e.topic ? `<p class="ficha-tema">${esc(e.topic)}</p>` : ''}${e.dateNote ? `<p class="ficha-nota">${esc(e.dateNote)}</p>` : ''}</div></li>`;
      }).join('')}</ul>` : '<p class="pergamino-vacio">No hay pruebas por delante.</p>'}
      <p class="pergamino-pronto">Próximamente: temario y material, preparación con evidencia y plan hacia atrás en cada ficha.</p></article>`;
  }

  const panelCalendario = S => window.NexoCalendario.panel(S, bridge);

  function panelLab(S) {
    const labs = (bridge.state.events || []).filter(e => e.type === 'lab' && e.status !== 'done' && e.date >= S.today)
      .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    return `<article class="pergamino"><header class="pergamino-head"><p class="eyebrow">BANCO DE MATRACES</p><h2>Laboratorio</h2></header>
      ${labs.length ? `<ul class="fichas">${labs.map(e => {
        const s = bridge.subjectFor(e.subject), d = window.NexoTodayPlan.daysBetween(S.today, e.date), pre = e.lab?.prelab;
        return `<li class="ficha u-${window.NexoTodayPlan.urgency(d)}"><span class="ico ico-matraz" aria-hidden="true"></span><div>
          <p>${tag(s)} <b>${shortDate(e.date)}${e.time ? ' · ' + esc(e.time) : ''}</b> (${when(d)})</p>${e.topic ? `<p class="ficha-tema">${esc(e.topic)}</p>` : ''}
          <p><button type="button" class="pix-btn ${pre?.done ? 'suave' : ''}" data-org-prelab="${esc(e.id)}" aria-pressed="${!!pre?.done}">${pre?.done ? 'Pre-lab listo ✓' : 'Marcar pre-lab listo'}</button></p></div></li>`;
      }).join('')}</ul>` : '<p class="pergamino-vacio">Sin prácticos por delante.</p>'}
      <p class="pergamino-pronto">Próximamente: informes por entregar y notas de laboratorio aparte, con su mínimo.</p></article>`;
  }

  const panelNotas = S => window.NexoNotas.panel(S, bridge);

  function panelAvisos(S) {
    return `<article class="pergamino"><header class="pergamino-head"><p class="eyebrow">LA CAMPANA</p><h2>Avisos</h2></header>
      ${S.avisos.length ? `<ul class="avisos">${S.avisos.map(a => `<li class="aviso u-${esc(a.nivel)}"><b>${esc(a.titulo)}</b><span>${esc(a.texto)}</span></li>`).join('')}</ul>`
        : '<p class="pergamino-vacio">Todo en calma: no hay avisos.</p>'}
      <p class="pergamino-pronto">Próximamente: cambios de fecha con deshacer y avisos de Classroom (si se conecta).</p></article>`;
  }

  function panel(view, S) {
    return { hoy: panelHoy, calendario: panelCalendario, pruebas: panelPruebas, lab: panelLab, notas: panelNotas, avisos: panelAvisos }[view](S);
  }

  // ——— Acciones del panel ———
  function wirePanel(root, view) {
    if (view === 'notas') { window.NexoNotas.wire(root, { bridge, refresh: () => refresh('notas'), react, sound }); return; }
    if (view === 'calendario') { window.NexoCalendario.wire(root, { bridge, refresh: () => refresh('calendario'), react, sound }); return; }
    root.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      const S = W?.sit || situation();
      const block = id => S.blocks.find(x => x.id === id);
      if (b.dataset.orgAvailability !== undefined) { window.NexoCalendario.openAvailability(); return bridge.go('planner', 'calendario'); }
      if (b.dataset.orgMin) {
        const o = org(), wd = new Date().getDay();
        o.minutes[wd] = clamp(minutesToday() + Number(b.dataset.orgMin), 0, 360);
        bridge.save(); return refresh(view);
      }
      if (b.dataset.orgStart) {
        const x = block(b.dataset.orgStart); if (!x) return;
        bridge.state.timer.subject = x.subject; bridge.save();
        bridge.toast(`${x.minutes} min · ${x.text}`);
        return bridge.go('hub', 'timer');
      }
      if (b.dataset.orgDone || b.dataset.orgUndo) {
        const m = marksToday(), id = b.dataset.orgDone || b.dataset.orgUndo;
        m.done = b.dataset.orgDone ? [...new Set([...m.done, id])] : m.done.filter(k => k !== id);
        bridge.save();
        if (b.dataset.orgDone) { sound('tinta'); W?.life.act('baile'); }
        return refresh(view);
      }
      if (b.dataset.orgSkip) {
        const x = block(b.dataset.orgSkip); if (!x) return;
        const m = marksToday(); m.skip = [...new Set([...m.skip, x.event.id])];
        bridge.save(); refresh(view);
        bridge.toast('Listo, hoy no. Nexo lo reacomoda sin culpa.', 'Deshacer', () => { m.skip = m.skip.filter(k => k !== x.event.id); bridge.save(); refresh(view); });
        return;
      }
      if (b.dataset.orgPrelab) {
        const ev = bridge.state.events.find(x => x.id === b.dataset.orgPrelab); if (!ev) return;
        ev.lab = window.NexoLabPlan ? window.NexoLabPlan.normalize(ev.lab) : (ev.lab || {});
        ev.lab.prelab = { ...(ev.lab.prelab || {}), done: !ev.lab.prelab?.done };
        bridge.save(); return refresh(view);
      }
    };
  }
  function refresh(view) {
    const host = document.querySelector('.estudio-panel'); if (!host) return;
    W && (W.sit = situation());
    host.innerHTML = panel(view, W?.sit || situation());
    wirePanel(host, view);
  }

  // ——— Pantalla ———
  function render(app, sub, b) {
    bridge = b;
    css();
    const view = VIEWS.includes(sub) ? sub : LEGACY[sub] || 'hoy';
    const S = situation();
    app.innerHTML = `<section class="page estudio-page" data-estudio-view="${view}">
      <header class="page-header estudio-header"><p class="eyebrow">LA TORRE · ESTUDIO DE PLANOS</p><h1>Organización</h1></header>
      <nav class="estudio-tabs" aria-label="Partes del estudio">${VIEWS.map(v => `<a href="#/planner/${v}" class="${v === view ? 'activa' : ''}"${v === view ? ' aria-current="page"' : ''}>${TITLES[v]}${v === 'avisos' && S.unseen ? ` <b class="punto" aria-label="${S.unseen} nuevos">${S.unseen}</b>` : ''}</a>`).join('')}</nav>
      <div class="estudio-panel madera" data-view="${view}">${panel(view, S)}</div></section>`;
    const page = app.querySelector('.estudio-page');
    wirePanel(page.querySelector('.estudio-panel'), view);
    if (view === 'avisos') window.NexoOrgAvisos?.markSeen(bridge);
    mountScene(page, view, S);
  }

  async function mountScene(page, view, S) {
    try { await load(); } catch (_) { return; }
    if (!page.isConnected) return;
    W = W || createWorld();
    W.sit = S; W.weather = weather();
    const pet = window.NexoPet.current();
    W.life.setKind(pet.kind); W.life.setOutfit(pet.outfit);
    page.classList.add('torre-on');
    page.insertBefore(W.wrap, page.firstChild);
    const title = W.wrap.querySelector('.torre-title');
    title.replaceChildren(page.querySelector('.estudio-header'));
    const bg = getComputedStyle(document.querySelector('main') || document.body).backgroundColor;
    W.wrap.style.setProperty('--torre-fade', bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#1a120e');
    const o = W.meta.objects.find(k => k.view === view);
    if (o && W.view_ !== view) {
      if (W.view_ === null) W.life.place(o.stand[0], o.stand[1], false);
      else if (Math.abs(W.life.state.x - o.stand[0]) > 4) W.life.walkTo(o.stand[0], o.stand[1]);
    }
    W.view_ = view;
    resize();
    W.life.pause(false);
    W.last = performance.now();
    if (!W.raf) W.raf = requestAnimationFrame(frame);
    // La mascota habla 1 vez al entrar (por día) y cuando hay aviso nuevo.
    const key = `${S.today}:${S.next?.id || ''}:${S.unseen}`;
    if (W.said !== key) {
      W.said = key;
      const msg = S.unseen ? 'Sonó la campana: hay un aviso nuevo' : S.next ? `Hoy parto por: ${S.next.text.split(':')[0].toLowerCase()} (${bridge.subjectFor(S.next.subject).short})`
        : 'Todo en orden por hoy';
      setTimeout(() => W.wrap.isConnected && say(msg, 4200), 700);
      if (S.unseen) setTimeout(() => sound('campana'), 500);
    }
    if (!W.ambBound) { W.ambBound = true; addEventListener('pointerdown', () => { if (W?.wrap.isConnected) ambient(); }, { passive: true }); }
    ambient();
  }
  addEventListener('resize', () => W?.wrap.isConnected && resize());
  window.NexoEstudio = Object.freeze({ render, views: VIEWS, legacy: LEGACY, react });
})();

;

/* study/economy.js */
/* Reglas únicas de recompensas por tiempo; sin estado ni dependencia del DOM. */
(() => {
  'use strict';
  function sessionReward(seconds) {
    const minutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);
    return minutes >= 120 ? 10 : minutes >= 60 ? 8 : minutes >= 30 ? 5 : 0; // el tiempo casi no paga: lo importante es la evidencia (docs/economia/SPEC.md)
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
  const roomCaps={home:10,learn:2,games:7,profile:8,shop:5,planner:2};
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
    knowledge:'learn',reviews:'learn',rescue:'learn',practice:'learn',
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
    const base={home:110,profile:98,planner:123,games:146}[scene]||110;
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
  const intents={home:'idle',learn:'read',games:'play',profile:'rest',shop:'preview',planner:'watch'};
  const props={home:'window',learn:'book',games:null,profile:'cushion',shop:null,planner:'calendar'};
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

/* economy/tienda.js */
/* Tienda y cofres (docs/economia/SPEC.md). Lógica pura: recibe el estado y lo modifica; no toca el DOM.
   state.shop = { owned: [ids], dust: polvo, chests: cofres sin abrir, sinceRare: cofres desde el último raro+, dailyAt: 'AAAA-MM-DD', hitos: [ids de logros ya premiados] } */
(() => {
  'use strict';
  const RARITIES = ['comun', 'poco', 'raro', 'legendario'];
  const LABELS = { comun: 'Común', poco: 'Poco común', raro: 'Raro', legendario: 'Legendario' };
  const ODDS = { comun: 60, poco: 28, raro: 10, legendario: 2 };            // % por cofre
  const DUST = { comun: 10, poco: 20, raro: 40, legendario: 80 };            // polvo que da un repetido
  const DUST_PRICE = { comun: 30, poco: 60, raro: 120, legendario: 240 };    // polvo para comprar directo
  const CHEST_PRICE = 70;                                                    // ⚛ por cofre sorpresa
  const SLOT_CHEST_PRICE = 90;                                               // ⚛ por cofre de una categoría (cabeza, cara, cuello, mano)
  const SLOTS = ['cabeza', 'cara', 'cuello', 'mano'];
  const SLOT_OF = {
    flor: 'cabeza', gorro: 'cabeza', birrete: 'cabeza', sombrero: 'cabeza', corona: 'cabeza',
    lentes: 'cara', monoculo: 'cara', lentesSol: 'cara',
    corbatin: 'cuello', bufanda: 'cuello', collar: 'cuello',
    taza: 'mano', lupa: 'mano', varita: 'mano'
  };
  // Átomos por evidencia (no por tiempo). Tope diario para que no se pueda farmear.
  const EARN = { sinAyuda: 3, conAyuda: 1, transferencia: 6, recuerdo: 8, sesion: 0 };
  const DAILY_CAP = 60, DAILY_BONUS = 5;
  const PITY = 10;                                                           // cada 10 cofres sin raro+, el siguiente lo es
  const RARITY_OF = {
    flor: 'comun', corbatin: 'comun', lentes: 'comun', gorro: 'comun', taza: 'comun',
    bufanda: 'poco', lupa: 'poco', monoculo: 'poco', collar: 'poco',
    birrete: 'raro', lentesSol: 'raro', varita: 'raro',
    sombrero: 'legendario', corona: 'legendario'
  };

  const idsOf = r => Object.keys(RARITY_OF).filter(id => RARITY_OF[id] === r);
  function shopOf(state) {
    const s = state.shop && typeof state.shop === 'object' ? state.shop : (state.shop = {});
    if (!Array.isArray(s.owned)) s.owned = [];
    ['dust', 'chests', 'sinceRare'].forEach(k => { s[k] = Math.max(0, Math.floor(Number(s[k]) || 0)); });
    if (typeof s.dailyAt !== 'string') s.dailyAt = '';
    if (!s.slotChests || typeof s.slotChests !== 'object') s.slotChests = {};
    SLOTS.forEach(k => { s.slotChests[k] = Math.max(0, Math.floor(Number(s.slotChests[k]) || 0)); });
    if (!s.earned || typeof s.earned !== 'object') s.earned = { day: '', total: 0 };
    s.hitos = Array.isArray(s.hitos) ? s.hitos.filter(h => typeof h === 'string').slice(-500) : [];
    return s;
  }
  const fail = reason => ({ ok: false, reason });

  // kind: 'sorpresa' o una categoría de SLOTS.
  function buyChest(state, kind = 'sorpresa') {
    const s = shopOf(state), slot = SLOTS.includes(kind) ? kind : null, price = slot ? SLOT_CHEST_PRICE : CHEST_PRICE;
    if ((Number(state.coins) || 0) < price) return fail('Te faltan átomos para un cofre.');
    state.coins -= price;
    if (slot) s.slotChests[slot] += 1; else s.chests += 1;
    return { ok: true };
  }
  // Suma átomos por evidencia respetando el tope diario. Devuelve cuántos se dieron.
  function earn(state, kind, today, amount) {
    const s = shopOf(state), e = s.earned;
    if (e.day !== today) { e.day = today; e.total = 0; }
    const want = Math.max(0, Math.floor(amount === undefined ? (EARN[kind] || 0) : amount));
    let give = Math.min(want, DAILY_CAP - e.total);
    if (give > 0 && e.total === 0) give += DAILY_BONUS;
    if (give <= 0) return 0;
    e.total += give; state.coins = (Number(state.coins) || 0) + give;
    return give;
  }
  function claimDaily(state, today) {
    const s = shopOf(state);
    if (s.dailyAt === today) return fail('El cofre de hoy ya lo abriste. Vuelve mañana.');
    s.dailyAt = today; s.chests += 1;
    return { ok: true };
  }
  function grantChest(state, n = 1) { shopOf(state).chests += Math.max(0, Math.floor(n)); }
  // Premios por hitos: 1 cofre por logro nuevo (jefe vencido, guía completada, racha de 7/14/30 días). Cada logro paga una sola vez.
  const STREAK_HITOS = [7, 14, 30];
  function claimMilestones(state, { bosses = [], guides = [], streak = 0 } = {}) {
    const s = shopOf(state), found = [...bosses.map(id => 'jefe:' + id), ...guides.map(id => 'guia:' + id), ...STREAK_HITOS.filter(n => streak >= n).map(n => 'racha:' + n)]
      .filter(h => !s.hitos.includes(h));
    s.hitos.push(...found); s.chests += found.length;
    return found;
  }

  function rollRarity(rng, forceRare) {
    if (forceRare) return rng() < ODDS.legendario / (ODDS.raro + ODDS.legendario) ? 'legendario' : 'raro';
    let x = rng() * 100;
    for (const r of RARITIES) { if (x < ODDS[r]) return r; x -= ODDS[r]; }
    return 'comun';
  }
  // Abre un cofre: da un accesorio nuevo; si ya lo tenías, lo convierte en polvo.
  function openChest(state, rng = Math.random, kind = 'sorpresa') {
    const s = shopOf(state), slot = SLOTS.includes(kind) ? kind : null;
    if ((slot ? s.slotChests[slot] : s.chests) < 1) return fail('No tienes cofres para abrir.');
    if (slot) s.slotChests[slot] -= 1; else s.chests -= 1;
    const rolled = rollRarity(rng, s.sinceRare >= PITY - 1);
    // En una categoría puede no haber esa rareza: se usa la más cercana (primero hacia arriba).
    const order = [RARITIES.indexOf(rolled), ...RARITIES.map((_, i) => i)].sort((x, y) => Math.abs(x - RARITIES.indexOf(rolled)) - Math.abs(y - RARITIES.indexOf(rolled)) || y - x);
    const pool = order.map(i => idsOf(RARITIES[i]).filter(i2 => !slot || SLOT_OF[i2] === slot)).find(p => p.length);
    const id = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))], rarity = RARITY_OF[id];
    s.sinceRare = rarity === 'raro' || rarity === 'legendario' ? 0 : s.sinceRare + 1;
    const dupe = s.owned.includes(id);
    if (dupe) s.dust += DUST[rarity]; else s.owned.push(id);
    return { ok: true, id, rarity, dupe, dust: dupe ? DUST[rarity] : 0 };
  }
  function buyWithDust(state, id) {
    const s = shopOf(state), r = RARITY_OF[id];
    if (!r) return fail('Ese accesorio no existe.');
    if (s.owned.includes(id)) return fail('Ya lo tienes.');
    if (s.dust < DUST_PRICE[r]) return fail('Te falta polvo.');
    s.dust -= DUST_PRICE[r]; s.owned.push(id);
    return { ok: true };
  }

  window.NexoTienda = Object.freeze({ RARITIES, LABELS, ODDS, DUST, DUST_PRICE, CHEST_PRICE, SLOT_CHEST_PRICE, SLOTS, SLOT_OF, EARN, DAILY_CAP, DAILY_BONUS, PITY, RARITY_OF,
    shopOf, buyChest, earn, claimDaily, grantChest, claimMilestones, openChest, buyWithDust });
})();

;

/* economy/cofre-sonidos.js */
/* Sonidos de la apertura de cofres, sintetizados con WebAudio (sin archivos). Respetan el silencio y el volumen de Ajustes.
   NexoCofreSonidos.play('tick' | 'rumble' | 'whoosh' | 'pop' | 'land' | 'reveal', rareza?) */
(() => {
  'use strict';
  let ctx = null, noiseBuf = null;
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  const ARPEGIOS = { comun: [72, 76], poco: [72, 76, 79], raro: [72, 76, 79, 84, 88], legendario: [67, 72, 76, 79, 84, 88, 91, 96] };

  function ready() {
    const s = window.NexoAudio?.settings;
    if (!s || !s.sound || s.hidden) return null;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (_) { return null; }
    return { ctx, vol: Math.max(0, Math.min(1, s.sfxVolume ?? .4)) };
  }
  function noise() {
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true; return src;
  }
  // Una nota con ataque rápido y caída; freqEnd permite barridos.
  function tone(c, { f, fEnd, type = 'sine', at = 0, dur = .2, gain = .3, attack = .005 }) {
    const t = c.ctx.currentTime + at, o = c.ctx.createOscillator(), g = c.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * c.vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.ctx.destination); o.start(t); o.stop(t + dur + .05);
  }
  function hiss(c, { at = 0, dur = .3, gain = .2, from = 400, to = 4000, q = 1.2, type = 'bandpass' }) {
    const t = c.ctx.currentTime + at, n = noise(), f = c.ctx.createBiquadFilter(), g = c.ctx.createGain();
    f.type = type; f.Q.value = q; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * c.vol, t + dur * .25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(c.ctx.destination); n.start(t); n.stop(t + dur + .05);
  }

  const SOUNDS = {
    // casilla que pasa frente al marcador: golpecito de madera
    tick: c => { tone(c, { f: 1300 + Math.random() * 120, fEnd: 700, type: 'triangle', dur: .05, gain: .22 }); hiss(c, { dur: .03, gain: .08, from: 3000, to: 2000 }); },
    // el cofre tiembla: retumbo grave que crece
    rumble: c => { tone(c, { f: 48, fEnd: 90, type: 'sawtooth', dur: 1.1, gain: .22, attack: .6 }); hiss(c, { dur: 1.1, gain: .3, from: 120, to: 700, type: 'lowpass', q: .7 }); },
    // la ruleta arranca
    whoosh: c => hiss(c, { dur: .7, gain: .35, from: 300, to: 3800, q: .8 }),
    // salta la tapa: crujido de madera, golpe y destello
    pop: c => { hiss(c, { dur: .22, gain: .5, from: 1500, to: 400, q: 2 }); tone(c, { f: 320, fEnd: 70, type: 'square', dur: .18, gain: .3 });
      tone(c, { f: NOTE(84), type: 'sine', dur: .5, gain: .18, at: .04 }); tone(c, { f: NOTE(91), type: 'sine', dur: .5, gain: .12, at: .06 }); },
    // la ruleta se asienta en el premio
    land: c => { tone(c, { f: 180, fEnd: 60, type: 'sine', dur: .25, gain: .45 }); hiss(c, { dur: .12, gain: .2, from: 2500, to: 800 }); }
  };

  // Fanfarria según rareza: cuantas más notas y más brillo, más raro el premio.
  function reveal(c, rarity) {
    const notes = ARPEGIOS[rarity] || ARPEGIOS.comun, big = rarity === 'raro' || rarity === 'legendario';
    notes.forEach((n, i) => { tone(c, { f: NOTE(n), type: 'triangle', at: i * .085, dur: .55, gain: .22 }); tone(c, { f: NOTE(n + 12), type: 'sine', at: i * .085 + .01, dur: .4, gain: .08 }); });
    if (big) { for (let i = 0; i < 7; i++) tone(c, { f: NOTE(96 + (i * 5) % 12), type: 'sine', at: .5 + i * .07, dur: .25, gain: .07 }); hiss(c, { at: .1, dur: .9, gain: .12, from: 2000, to: 9000, q: 2 }); }
    if (rarity === 'legendario') { tone(c, { f: 65, fEnd: 40, type: 'sine', dur: .9, gain: .5 }); [60, 64, 67, 72].forEach((n, i) => tone(c, { f: NOTE(n), type: 'sawtooth', at: .45, dur: 1.2, gain: .06 + i * .005 })); }
  }

  function play(name, rarity) {
    const c = ready(); if (!c) return;
    if (name === 'reveal') reveal(c, rarity); else SOUNDS[name]?.(c);
  }
  window.NexoCofreSonidos = Object.freeze({ play });
})();

;

/* economy/cofre-fx.js */
/* Apertura épica del cofre (docs/economia/SPEC.md). Solo pinta y anima; la lógica está en tienda.js.
   Guion: el cofre se carga de energía (chispas que entran) y tiembla -> explota la tapa (destello, onda, rayos, hojas) -> ruleta que gira
   rapidísimo, se acerca y frena con tensión -> golpe seco: onda de choque, cartel de rareza y fuente de chispas. Cuanto más raro, más grande.
   NexoCofre.play({ winner, ids, tile, reduced, title, note, again }) -> Promise<'again' | 'close'> */
(() => {
  'use strict';
  const ART = './assets/tienda/';
  const LOOK = {   // cols: colores de chispas; amp: sacudida; sparks: chispas al caer el premio; rings: ondas; label: cartel
    comun:      { cols: ['#fff4d8', '#e6d6b2', '#b9a98a'], amp: 3,  sparks: 30,  rings: 1, flash: 0,  label: 'COMÚN' },
    poco:       { cols: ['#e2ee8a', '#b2cf5c', '#6cc08b'], amp: 6,  sparks: 60,  rings: 2, flash: 0,  label: 'POCO COMÚN' },
    raro:       { cols: ['#e0fcff', '#9ce8f0', '#6aa7ff'], amp: 12, sparks: 120, rings: 3, flash: .5, label: '¡RARO!' },
    legendario: { cols: ['#fffce8', '#ffd860', '#f2b84b'], amp: 22, sparks: 260, rings: 5, flash: 1,  label: '¡LEGENDARIO!' }
  };
  const LEAVES = ['#5d8c36', '#83ad42', '#b2cf5c', '#3f6e2d'];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = x => 1 - Math.pow(1 - x, 4.2);

  // ——— capa de efectos: chispas, hojas, ondas y rayos en un canvas a pantalla completa ———
  function makeFx(canvas) {
    const ctx = canvas.getContext('2d'); let W = 0, H = 0, last = performance.now(); const things = [];
    const size = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
    size();
    const add = o => things.push({ age: 0, ...o });
    (function loop(now) {
      if (!canvas.isConnected) return;
      const dt = Math.min(.25, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      for (let i = things.length - 1; i >= 0; i--) {
        const p = things[i]; p.age += dt;
        if (p.age >= p.life) { things.splice(i, 1); continue; }
        const k = p.age / p.life;
        if (p.kind === 'ring') {
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - k) * .9; ctx.strokeStyle = p.color; ctx.lineWidth = p.width * (1 - k * .7);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * ease(k), 0, 6.283); ctx.stroke();
        } else if (p.kind === 'beam') {
          const g = ctx.createLinearGradient(0, p.y - p.h, 0, p.y); g.addColorStop(0, p.color + '00'); g.addColorStop(1, p.color);
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (k < .15 ? k / .15 : 1 - (k - .15) / .85) * .7; ctx.fillStyle = g;
          const w = p.w * (1 - k * .5); ctx.fillRect(p.x - w / 2, p.y - p.h, w, p.h);
        } else if (p.kind === 'charge') {            // chispa que viaja hacia el cofre
          const e = k * k; p.x = p.x0 + (p.tx - p.x0) * e; p.y = p.y0 + (p.ty - p.y0) * e;
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, k * 3) * (1 - k * .3); ctx.fillStyle = p.color;
          const s = p.s * (1 - k * .5); ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
        } else {
          p.vy += (p.g || 0) * dt; p.vx *= 1 - (p.drag || 0) * dt; p.vy *= 1 - (p.drag || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.kind === 'leaf') {
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1 - k * k; ctx.fillStyle = p.color;
            ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.rotate(p.rot + p.spin * p.age); ctx.fillRect(-p.s, -p.s / 2, p.s * 2, p.s); ctx.restore();
          } else {                                    // spark / ember
            ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - k) * (p.kind === 'ember' ? .8 : 1); ctx.fillStyle = p.color;
            const s = Math.max(2, p.s * (1 - k * .6)), x = Math.round(p.x / 2) * 2, y = Math.round(p.y / 2) * 2;
            ctx.fillRect(x, y, s, s); ctx.globalAlpha *= .25; ctx.fillRect(x - s, y - s, s * 3, s * 3);
          }
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(loop);
    })(last);
    return { add, size };
  }

  const TILES = 70, WIN_AT = 58;

  /* winner: {id, rarity}; ids: [{id, rarity}] para rellenar la ruleta; tile(id) -> <canvas> del accesorio. */
  async function play({ winner, ids, tile, reduced = false, title = '', note = '', again = false }) {
    const rarity = winner.rarity, L = LOOK[rarity] || LOOK.comun, big = rarity === 'raro' || rarity === 'legendario', legend = rarity === 'legendario';
    const snd = (n, r) => window.NexoCofreSonidos?.play(n, r);
    const el = document.createElement('div');
    el.className = 'cofre-fx'; el.dataset.rarity = rarity;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Abriendo cofre');
    el.innerHTML = `<div class="cofre-fx-rays"></div><div class="cofre-fx-vignette"></div>
      <div class="cfx-world">
        <div class="cofre-fx-stage"><div class="cofre-fx-chest"><div class="cfx-glow"></div><i class="cfx-body"></i><i class="cfx-lid"></i></div></div>
        <div class="cofre-fx-roulette pu-panel" hidden><div class="cfx-window"><div class="cfx-strip"></div><i class="cfx-marker"></i></div></div>
        <div class="cfx-banner" hidden></div>
        <div class="cofre-fx-card pu-paper" hidden><p class="cfx-title"></p><p class="cfx-note"></p><div class="cfx-actions"></div></div>
      </div><canvas class="cofre-fx-parts"></canvas><div class="cofre-fx-flash"></div>`;
    document.body.append(el);
    const $ = s => el.querySelector(s), world = $('.cfx-world'), chest = $('.cofre-fx-chest'), stage = $('.cofre-fx-stage'), roulette = $('.cofre-fx-roulette'),
      strip = $('.cfx-strip'), card = $('.cofre-fx-card'), banner = $('.cfx-banner'), marker = $('.cfx-marker'), fx = makeFx($('.cofre-fx-parts'));
    const mk = (item, win) => { const d = document.createElement('div'); d.className = 'cfx-tile'; d.dataset.r = item.rarity; if (win) d.dataset.win = '1'; d.append(tile(item.id)); return d; };
    const quake = (amp, ms = 600) => { el.style.setProperty('--amp', amp + 'px'); el.classList.remove('cfx-quake'); void el.offsetWidth; el.classList.add('cfx-quake'); setTimeout(() => el.classList.remove('cfx-quake'), ms); };
    const flash = () => { const f = $('.cofre-fx-flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); };
    let done; const result = new Promise(r => { done = r; });
    const close = v => { el.classList.add('cfx-out'); setTimeout(() => { el.remove(); done(v); }, reduced ? 0 : 260); };
    const showCard = () => {
      card.hidden = false; $('.cfx-title').textContent = title; $('.cfx-note').textContent = note;
      $('.cfx-actions').innerHTML = `${again ? '<button type="button" class="pu-btn" data-r="again">Abrir otro</button>' : ''}<button type="button" class="pu-btn" data-r="close">Listo</button>`;
      $('.cfx-actions button:last-child').focus({ preventScroll: true });
    };
    el.addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (b) close(b.dataset.r); });
    el.addEventListener('keydown', e => { if (e.key === 'Escape' && !card.hidden) close('close'); });
    addEventListener('resize', fx.size);
    const cx = () => innerWidth / 2, cy = () => innerHeight / 2;

    if (reduced) {
      stage.hidden = true; roulette.hidden = false; strip.append(mk(winner, true)); strip.style.margin = '0 auto';
      el.classList.add('cfx-won'); banner.hidden = false; banner.textContent = L.label; snd('reveal', rarity); showCard(); return result;
    }
    strip.append(...Array.from({ length: TILES }, (_, i) => i === WIN_AT ? mk(winner, true) : mk(ids[Math.floor(Math.random() * ids.length)], false)));

    // 1. CARGA: la cámara se acerca, entran chispas al cofre y tiembla cada vez más fuerte
    await wait(60); el.classList.add('cfx-charge'); chest.classList.add('cfx-shake'); snd('rumble');
    const chestBox = () => { const r = chest.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .55 }; };
    const ccx = chestBox();
    for (let i = 0; i < 70; i++) setTimeout(() => {
      const a = rnd(0, 6.283), d = rnd(220, 420), c = chestBox();
      fx.add({ kind: 'charge', x0: c.x + Math.cos(a) * d, y0: c.y + Math.sin(a) * d * .7, tx: c.x, ty: c.y, life: rnd(.5, .9), s: 4, color: L.cols[i % 3] });
    }, i * 17);
    for (let i = 0; i < 14; i++) setTimeout(() => fx.add({ kind: 'ember', x: ccx.x + rnd(-110, 110), y: ccx.y + 70, vx: rnd(-10, 10), vy: rnd(-90, -40), life: rnd(.8, 1.4), s: 4, color: L.cols[1] }), i * 80);
    await wait(1250);

    // 2. EXPLOSIÓN: salta la tapa, destello, onda, rayos de luz y hojas volando
    chest.classList.remove('cfx-shake'); chest.classList.add('cfx-opening'); el.classList.add('cfx-lit'); flash(); quake(10, 500); snd('pop');
    const c = chestBox();
    fx.add({ kind: 'ring', x: c.x, y: c.y, r0: 10, r1: 360, life: .7, color: '#ffe9a0', width: 8 });
    fx.add({ kind: 'ring', x: c.x, y: c.y, r0: 6, r1: 220, life: .5, color: L.cols[2], width: 5 });
    for (let i = -2; i <= 2; i++) fx.add({ kind: 'beam', x: c.x + i * 46, y: c.y, w: 22 + (2 - Math.abs(i)) * 14, h: 520 - Math.abs(i) * 90, life: 1.3, color: i % 2 ? L.cols[1] : '#ffe9a0' });
    for (let i = 0; i < 70; i++) fx.add({ kind: 'spark', x: c.x + rnd(-60, 60), y: c.y - 10, vx: rnd(-330, 330), vy: rnd(-620, -120), g: 760, drag: .3, life: rnd(.8, 1.6), s: rnd(3, 7) | 0, color: i % 2 ? L.cols[0] : L.cols[1] });
    for (let i = 0; i < 28; i++) fx.add({ kind: 'leaf', x: c.x + rnd(-80, 80), y: c.y, vx: rnd(-260, 260), vy: rnd(-520, -160), g: 380, drag: 1.1, life: rnd(1.4, 2.4), s: rnd(3, 5) | 0, rot: rnd(0, 6), spin: rnd(-8, 8), color: LEAVES[i % 4] });
    await wait(900);

    // 3. RULETA: baja, gira a toda velocidad, se acerca a la cámara y frena con tensión
    stage.classList.add('cfx-away'); roulette.hidden = false; roulette.classList.add('cfx-drop'); snd('whoosh');
    await wait(520);
    const tw = strip.children[1].getBoundingClientRect().left - strip.children[0].getBoundingClientRect().left, view = strip.parentElement.clientWidth;
    const end = WIN_AT * tw + tw / 2 - view / 2 + (Math.random() - .5) * tw * .6, dur = big ? 8200 : 6600, t0 = performance.now();
    const tiles = [...strip.children], overshoot = tw * .25; let last = -1;
    el.classList.add('cfx-spin');
    await new Promise(res => (function frame() {
      const k = Math.min(1, (performance.now() - t0) / dur), kk = Math.min(1, k / .88);
      const x = end * ease(kk) + (k > .88 ? overshoot * Math.sin(Math.PI * (1 - (k - .88) / .12)) * (1 - (k - .88) / .12) : 0);
      strip.style.transform = `translate3d(${-x}px,0,0)`;
      const centre = x + view / 2, speed = Math.min(1, (1 - ease(kk)) * 3);
      roulette.style.transform = `scale(${1 + .16 * Math.pow(k, 2)})`;                       // se acerca mientras frena
      world.style.setProperty('--tension', Math.max(0, (k - .55) / .45).toFixed(3));
      const lo = Math.max(0, Math.floor(centre / tw) - 5), hi = Math.min(tiles.length - 1, lo + 10);
      for (let i = lo; i <= hi; i++) {
        const d = Math.min(1.6, Math.abs((i + .5) * tw - centre) / tw), near = Math.max(0, 1 - d);
        tiles[i].style.transform = `scale(${1 + .26 * near}) translateY(${-8 * near}px)`;
        tiles[i].style.filter = `blur(${(speed * 3 * Math.min(1, d + .2)).toFixed(2)}px) brightness(${1 + .25 * near})`;
      }
      const idx = Math.floor(centre / tw);
      if (idx !== last) { last = idx; if (k < .985) snd('tick'); marker.classList.remove('cfx-tick'); void marker.offsetWidth; marker.classList.add('cfx-tick'); }
      k < 1 && el.isConnected ? requestAnimationFrame(frame) : res();
    })());
    tiles.forEach(tl => { if (!tl.dataset.win) tl.style.transform = ''; tl.style.filter = ''; });

    // 4. GOLPE: se detiene, onda de choque, cartel de rareza y fuente de chispas
    el.classList.remove('cfx-spin'); el.classList.add('cfx-won'); snd('land'); setTimeout(() => snd('reveal', rarity), 160);
    quake(L.amp, 700); if (L.flash) flash();
    const wt = strip.querySelector('[data-win]').getBoundingClientRect(), wx = wt.left + wt.width / 2, wy = wt.top + wt.height / 2;
    for (let i = 0; i < L.rings; i++) setTimeout(() => fx.add({ kind: 'ring', x: wx, y: wy, r0: 20, r1: 260 + i * 110, life: .8 + i * .1, color: L.cols[i % 3], width: 8 - i }), i * 120);
    for (let i = 0; i < L.sparks; i++) fx.add({ kind: 'spark', x: wx + rnd(-30, 30), y: wy, vx: rnd(-520, 520), vy: rnd(-760, -160), g: 900, drag: .4, life: rnd(.9, 1.9), s: rnd(3, 8) | 0, color: L.cols[i % 3] });
    if (big) for (let i = 0; i < (legend ? 50 : 24); i++) fx.add({ kind: 'leaf', x: wx + rnd(-200, 200), y: -20, vx: rnd(-60, 60), vy: rnd(60, 200), g: 120, drag: .5, life: rnd(2, 3.4), s: rnd(3, 5) | 0, rot: rnd(0, 6), spin: rnd(-6, 6), color: LEAVES[i % 4] });
    banner.hidden = false; banner.textContent = L.label; banner.classList.add('go');
    await wait(big ? 1100 : 650); showCard();
    return result;
  }

  window.NexoCofre = Object.freeze({ play });
})();

;

/* mascot/home-pet.js */
/* Mascota pixel en la app (docs/mascota/SPEC.md · Fase 6).
   Carga perezosa de pixelmascotas.js + pixel-vida.js, y la conecta con: Inicio (vive en el refugio), barra lateral,
   Perfil › Mascota y Tienda. Estado en state.mascot = { name, kind, outfit } (solo local, sin nube). */
(() => {
  'use strict';
  const KINDS = ['matraz', 'atomo', 'slime'];
  const NAMES = { matraz: 'Matraz', atomo: 'Átomo', slime: 'Slime' };
  const SLOTS = ['cabeza', 'cara', 'cuello', 'mano'];
  const STATIONS = {
    deskFloor: { x: 84, y: 166 },
    desk: { x: 88, y: 112, perch: true, from: 'deskFloor', scale: .92, action: 'read', say: 'Sube al escritorio…' },
    shelf: { x: 132, y: 162, action: 'book', say: 'Va a la estantería…' },
    rug: { x: 214, y: 196, say: 'Paseando por la alfombra…' },
    rug2: { x: 276, y: 206, say: 'Paseando por la alfombra…' },
    chairFront: { x: 336, y: 178 },
    chair: { x: 354, y: 136, perch: true, from: 'chairFront', scale: .9, action: 'nap', say: 'Se va al sillón…' }
  };
  const ROUTE = ['deskFloor', 'shelf', 'desk', 'rug', 'rug2', 'chair', 'rug', 'shelf', 'desk', 'rug2'];
  const EXPRS = ['neutral', 'feliz', 'picara', 'deslumbrada', 'amor', 'concentrada'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let api = { get: () => ({}), set: () => {}, motion: () => 'full', studying: () => false };
  let loading = null, home = null, minis = new Set(), miniRaf = 0, cheerUntil = 0, stormOn = false, nightTimer = 0;

  function loadScript(src) {
    return new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL(src, document.baseURI).href; s.onload = ok; s.onerror = fail; document.head.append(s);
    });
  }
  function engine() {
    if (window.PixelMascotas && window.PixelVida) return Promise.resolve(window.PixelMascotas);
    loading = loading || loadScript('mascot/pixelmascotas.js?v=1').then(() => loadScript('mascot/pixel-vida.js?v=1')).then(() => window.PixelMascotas);
    return loading;
  }
  const pet = () => {
    const m = api.get() || {};
    const kind = KINDS.includes(m.kind) ? m.kind : 'matraz';
    return { kind, owned: [...new Set([kind, ...(Array.isArray(m.owned) ? m.owned : [])])], name: m.name || '', outfit: m.outfit && typeof m.outfit === 'object' ? m.outfit : {} };
  };
  const petName = () => { const p = pet(); return p.name && p.name !== 'Nexo' ? p.name : NAMES[p.kind]; };
  const reduced = () => api.motion() === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——— Sprites pequeños animados (barra lateral, Perfil, Tienda) ———
  function miniTick(now) {
    miniRaf = 0;
    const P = window.PixelMascotas; if (!P) return;
    const t = now / 1000, blink = (t % 3.4) < .13, motionOff = reduced();
    minis.forEach(item => {
      const c = item.canvas;
      if (!c.isConnected) { minis.delete(item); return; }
      const p = pet(), kind = item.kind || p.kind, cheer = now < cheerUntil, tt = motionOff ? 0 : t;
      const expr = item.expr ? item.expr(t) : cheer ? 'feliz' : api.studying() ? 'concentrada' : 'neutral';
      const arm = item.expr ? item.arm?.(expr) || 'rest' : cheer ? 'wave' : 'rest';
      const st = { t: tt, sx: 1, sy: 1 + .02 * Math.sin(tt * 2), bodyTilt: 0, rootTilt: 0, hop: cheer && !motionOff ? Math.abs(Math.sin(t * 8)) * 3 : 0,
        lift: kind === 'atomo' ? 2 + Math.sin(tt * 2) * 1.5 : 0, slosh: 4 * Math.sin(tt * 2), cork: 0, tag: 8 * Math.sin(tt * 2), footL: 0, footR: 0, spin: 0, excite: 0, drip: 0,
        hat: 3 * Math.sin(tt * 3), look: [0, 0], blink: blink && !motionOff, expr, outfit: item.naked ? {} : (item.outfit || p.outfit), arms: P.armPose(arm, tt) };
      const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); P.render(ctx, kind, st);
    });
    if (minis.size) miniRaf = requestAnimationFrame(miniTick);
  }
  function addMini(item) { minis.add(item); if (!miniRaf) miniRaf = requestAnimationFrame(miniTick); }

  // ——— Barra lateral ———
  async function renderDock(dock) {
    if (!dock) return;
    try { await engine(); } catch (_) { dock.hidden = true; return; }
    if (!dock.querySelector('canvas')) {
      dock.innerHTML = `<canvas class="dock-pet" width="40" height="44" aria-hidden="true"></canvas><p class="companion-name"></p>`;
      addMini({ canvas: dock.querySelector('canvas') });
    }
    dock.querySelector('.companion-name').textContent = petName();
    dock.hidden = false;
  }

  // ——— Inicio: la mascota vive en el refugio ———
  function cleanup() { if (home) { home.life.stop(); home.canvas.remove(); clearInterval(nightTimer); home = null; } }
  async function mountHome(plane) {
    cleanup();
    if (!plane || plane.dataset.sceneId !== 'refugio-pixel') return;
    try { await engine(); } catch (_) { return; }
    if (!plane.isConnected) return;
    const canvas = document.createElement('canvas'); canvas.width = 418; canvas.height = 235; canvas.className = 'home-pet-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none;z-index:4';
    plane.append(canvas);
    const p = pet();
    const life = window.PixelVida.create({ canvas, background: null, stations: STATIONS, bookFrom: [120, 96], reduced: reduced(), kind: p.kind, route: ROUTE,
      depth: y => .86 + Math.max(0, Math.min(1, (y - 150) / 85)) * .4 });
    life.setOutfit(p.outfit);
    home = { life, canvas };
    // Tocarla: sin bloquear los objetos de la escena (solo si el toque cae sobre la mascota).
    plane.addEventListener('pointerdown', e => {
      if (!home) return;
      const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 418, y = (e.clientY - r.top) / r.height * 235, a = life.state;
      if (Math.abs(x - a.x) < 14 && y < a.y + 4 && y > a.y - 40) { life.poke(); e.stopPropagation(); e.preventDefault(); }
    }, true);
    const isNight = () => document.body.dataset.nexoTime === 'night';
    life.night(isNight()); life.storm(stormOn);
    nightTimer = setInterval(() => { if (home) { life.night(isNight()); life.pause(document.hidden); } }, 5000);
  }

  // ——— Clima (Open-Meteo, Santiago, máx. cada 30 min, sin red = despejado) ———
  async function checkWeather() {
    const KEY = 'nexo.weather.v1';
    try {
      let cache = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!cache || Date.now() - cache.at > 30 * 60 * 1000) {
        const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-33.45&longitude=-70.66&current=weather_code', { cache: 'no-store' });
        const code = (await r.json()).current?.weather_code ?? 0;
        cache = { at: Date.now(), code }; localStorage.setItem(KEY, JSON.stringify(cache));
      }
      stormOn = cache.code >= 95; home?.life.storm(stormOn);
    } catch (_) { stormOn = false; }
  }

  // ——— Reacciones ———
  function celebrate(atoms) {
    cheerUntil = performance.now() + 3500;
    if (home) home.life.celebrate(Math.max(0, Math.round(atoms) || 0));
  }

  // Retrato animado de tu mascota (Perfil › Vestuario y la carta del Perfil).
  async function paintBig(canvas) {
    await engine().catch(() => null);
    if (!canvas?.isConnected) return;
    addMini({ canvas, expr: t => EXPRS[Math.floor(t / 2.5) % EXPRS.length], arm: e => e === 'picara' ? 'sixseven' : e === 'feliz' ? 'wave' : 'rest',
      get outfit() { return pet().outfit; } });
  }

  // ——— Perfil › Vestuario ———
  async function wireProfile(root) {
    const P = await engine().catch(() => null); if (!P || !root.isConnected) return;
    const pets = root.querySelector('#petPick'), wardrobe = root.querySelector('#petWardrobe'), name = root.querySelector('#petName');
    pets.innerHTML = P.list.map(([k, l]) => `<button type="button" class="pet-pick" data-kind="${k}" aria-pressed="${k === pet().kind}"${pet().owned.includes(k) ? '' : ' disabled'} style="border:3px solid transparent;border-radius:10px;background:#e9d9b4;color:#3b2418;font-weight:bold;padding:4px;cursor:pointer${pet().owned.includes(k) ? '' : ';opacity:.5;filter:grayscale(1)'}"><canvas width="40" height="44" style="width:96px;height:106px;display:block;image-rendering:pixelated"></canvas>${l}${pet().owned.includes(k) ? '' : '<small style="display:block">🔒 En la Tienda</small>'}</button>`).join('');
    pets.querySelectorAll('.pet-pick').forEach(b => addMini({ canvas: b.querySelector('canvas'), kind: b.dataset.kind, naked: true }));
    const paintPick = () => pets.querySelectorAll('.pet-pick').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.kind === pet().kind)); b.style.borderColor = b.dataset.kind === pet().kind ? '#e8b65a' : 'transparent'; });
    const big = root.querySelector('#petBig'); let tryOn = null;
    addMini({ canvas: big, expr: t => EXPRS[Math.floor(t / 2.5) % EXPRS.length], arm: e => e === 'picara' ? 'sixseven' : e === 'feliz' ? 'wave' : 'rest',
      get outfit() { return pet().outfit; } });
    const paintWardrobe = () => { const o = pet().outfit, owned = window.NexoTienda.shopOf(api.shop.state()).owned;
      wardrobe.innerHTML = SLOTS.map(slot => `<label>${slot[0].toUpperCase() + slot.slice(1)} <select data-slot="${slot}"><option value="">—</option>` +
      Object.entries(P.ACCESORIOS).filter(([id, a]) => a.slot === slot && (owned.includes(id) || o[slot] === id)).map(([id]) => `<option value="${id}"${o[slot] === id ? ' selected' : ''}>${esc(P.NOMBRES[id])}</option>`).join('') + '</select></label>').join(''); };
    paintPick(); paintWardrobe();
    name.value = pet().name === 'Nexo' ? '' : pet().name; name.placeholder = NAMES[pet().kind];
    pets.onclick = e => { const b = e.target.closest('.pet-pick'); if (!b || b.disabled) return; api.set({ kind: b.dataset.kind }); name.placeholder = NAMES[b.dataset.kind]; paintPick(); home?.life.setKind(b.dataset.kind); };
    name.oninput = () => api.set({ name: name.value.trim().slice(0, 20) });
    wardrobe.onchange = e => { const o = { ...pet().outfit, [e.target.dataset.slot]: e.target.value }; api.set({ outfit: o }); home?.life.setOutfit(o); };
  }

  // ——— Tienda del alquimista: cofres, polvo y accesorios (lógica en economy/tienda.js, apertura en economy/cofre-fx.js, docs/economia/SPEC.md) ———
  const CHEST_KINDS = [['sorpresa', 'Sorpresa', 'Cualquier accesorio'], ['cabeza', 'De cabeza', 'Gorros y coronas'], ['cara', 'De rostro', 'Lentes y monóculos'], ['cuello', 'De cuello', 'Bufandas y collares'], ['mano', 'De mano', 'Tazas, lupas y varitas']];
  async function wireShop(root) {
    const P = await engine().catch(() => null); if (!P || !root.isConnected) return;
    const T = window.NexoTienda, S = api.shop, shop = root.querySelector('#petShop'), prev = root.querySelector('#petShopPreview'), top = root.querySelector('#shopTop'),
      wallet = root.querySelector('#shopWallet'), odds = root.querySelector('#shopOdds'), types = root.querySelector('#shopTypes'), chestImg = root.querySelector('#shopChest');
    let tryOut = { ...pet().outfit }, note = '';
    addMini({ canvas: prev, get outfit() { return tryOut; } });
    const sprite = (id, k) => { const c = P.sprite(P.ACCESORIOS[id].rows); c.style.cssText = `width:${c.width * k}px;height:${c.height * k}px;image-rendering:pixelated`; return c; };
    const count = (s, kind) => kind === 'sorpresa' ? s.chests : s.slotChests[kind];
    const btn = (attrs, label, off) => `<button type="button" class="pu-btn" ${attrs}${off ? ' disabled' : ''}>${label}</button>`;
    const render = () => {
      const st = S.state(), s = T.shopOf(st), locked = S.locked(), daily = s.dailyAt === S.today(), total = s.chests + T.SLOTS.reduce((n, k) => n + s.slotChests[k], 0);
      wallet.innerHTML = `<span class="pu-paper"><b>${Math.floor(st.coins)}</b> ⚛</span><span class="pu-paper"><b>${s.dust}</b> <small>polvo</small></span><span class="pu-paper"><b>${total}</b> <small>cofre${total === 1 ? '' : 's'}</small></span>`;
      chestImg.classList.toggle('tc-lit', total > 0);
      top.innerHTML = locked ? '<p class="tc-hint">Con cuenta en la nube la Tienda se activa más adelante; como invitado ya puedes usarla.</p>' :
        `<div class="tienda-acciones">${btn('data-act="daily"', daily ? 'Cofre diario (ya abierto)' : 'Cofre diario gratis', daily)}${btn('data-open="sorpresa"', `Abrir cofre (${s.chests})`, s.chests < 1)}</div>` +
        `<p class="tc-hint">Cada ${T.PITY} cofres sin nada raro, el siguiente lo es seguro. Los repetidos se vuelven polvo.</p>` + (note ? `<p class="tienda-nota" role="status">${esc(note)}</p>` : '');
      types.innerHTML = CHEST_KINDS.map(([kind, label, hint]) => { const price = kind === 'sorpresa' ? T.CHEST_PRICE : T.SLOT_CHEST_PRICE;
        return `<div class="pu-paper tienda-tipo"><b>${label}</b><small>${hint}</small><div class="tt-row">${btn(`data-buy="${kind}"`, `${price} ⚛`, locked || st.coins < price)}${btn(`data-open="${kind}"`, `Abrir (${count(s, kind)})`, locked || count(s, kind) < 1)}</div></div>`; }).join('');
      const RC = { comun: '#8a7a5a', poco: '#2f8a52', raro: '#3a6fd0', legendario: '#c98a10' }, NOTE = { comun: 'sale seguido', poco: 'sale a veces', raro: 'es raro', legendario: 'es muy raro' };
      const inRar = r => Object.keys(P.ACCESORIOS).filter(id => T.RARITY_OF[id] === r).length;
      odds.innerHTML = '<h3>Probabilidades de cada cofre</h3>' + T.RARITIES.map(r => `<div class="to-row" style="--c:${RC[r]}"><span class="to-name">${T.LABELS[r]}</span><span class="to-bar"><i style="width:${T.ODDS[r]}%"></i></span><span>${T.ODDS[r]} % <small>${NOTE[r]}</small></span></div>`).join('') +
        `<small>Cada ${T.PITY} cofres sin nada raro, el siguiente es raro o legendario seguro (llevas ${s.sinceRare}). Los cofres de categoría usan las mismas probabilidades dentro de esa categoría. Los repetidos se vuelven polvo.</small>`;
      shop.innerHTML = Object.entries(P.ACCESORIOS).sort((a, b) => T.RARITIES.indexOf(T.RARITY_OF[a[0]]) - T.RARITIES.indexOf(T.RARITY_OF[b[0]])).map(([id, a]) => {
        const own = s.owned.includes(id), r = T.RARITY_OF[id], price = T.DUST_PRICE[r];
        return `<div class="pu-paper tienda-item" data-r="${r}"><div class="ti-icon" data-id="${id}"></div><b>${esc(P.NOMBRES[id])}</b><small>${a.slot}</small><span class="ti-rar">${T.LABELS[r]}</span><span class="ti-pct">${(T.ODDS[r] / inRar(r)).toFixed(1)} % por cofre</span>` +
          btn(`data-try="${id}"`, tryOut[a.slot] === id ? 'Quitar' : 'Probar') +
          (own ? '<span class="ti-own">Tuyo ✓</span>' : btn(`data-dust="${id}"`, `${price} polvo`, s.dust < price)) + '</div>';
      }).join('');
      shop.querySelectorAll('.ti-icon').forEach(b => b.append(sprite(b.dataset.id, 4)));
    };
    const open = async kind => {
      const st = S.state(); note = '';
      const r = T.openChest(st, Math.random, kind);
      if (!r.ok) { note = r.reason; render(); return; }
      S.save();
      const again = count(T.shopOf(st), kind) > 0;
      const ids = Object.keys(P.ACCESORIOS).map(id => ({ id, rarity: T.RARITY_OF[id] }));
      const choice = await window.NexoCofre.play({ winner: { id: r.id, rarity: r.rarity }, ids, tile: id => sprite(id, 5), reduced: reduced(), title: P.NOMBRES[r.id],
        note: `${T.LABELS[r.rarity]} (${T.ODDS[r.rarity]} %) · ${r.dupe ? `repetido: +${r.dust} polvo` : '¡nuevo!'}`, again });
      cheerUntil = performance.now() + 2500; render();
      if (choice === 'again' && root.isConnected) open(kind);
    };
    const act = (name, kind) => {
      const st = S.state(); note = '';
      const r = name === 'buy' ? T.buyChest(st, kind) : T.claimDaily(st, S.today());
      if (!r.ok) note = r.reason; else { window.NexoAudio?.play('purchase'); note = name === 'buy' ? 'Cofre comprado. ¡A abrirlo!' : 'Tu cofre diario te espera.'; }
      S.save(); render();
    };
    root.querySelector('.tienda-page').onclick = e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.open) open(d.open);
      else if (d.buy) act('buy', d.buy);
      else if (d.act) act(d.act);
      else if (d.dust) { const r = T.buyWithDust(S.state(), d.dust); note = r.ok ? `¡Conseguiste ${P.NOMBRES[d.dust]}!` : r.reason; if (r.ok) window.NexoAudio?.play('equip'); S.save(); render(); }
      else if (d.try) { const slot = P.ACCESORIOS[d.try].slot; tryOut = { ...tryOut, [slot]: tryOut[slot] === d.try ? '' : d.try }; render(); }
    };
    render();
  }

  window.NexoPet = Object.freeze({
    bind(a) { api = { ...api, ...a }; },
    mountHome, cleanup, renderDock, celebrate, paintBig, wireProfile, wireShop, checkWeather, kinds: KINDS, names: NAMES,
    engine, current: pet, reduced   // los usa el mundo de la torre (world/torre-mundo.js)
    , homeSpot: () => home && { x: home.life.state.x, y: home.life.state.y, act: n => home.life.act(n) }   // globo de avisos del Inicio (planner/avisos.js)
  });
})();

;

/* mascot/reacciones.js */
/* Reacciones de la mascota en la habitación del Perfil (docs/perfil-alcoba/SPEC.md).
   Módulo puro: pick(ctx) elige UNA frase y un gesto que ya existe en pixel-vida.js, según lo que pasa en tu semestre.
   ctx = { days: días a la próxima prueba | null, away: días sin estudiar | null, streak: racha, grade: nota reciente (1-7) | null }.
   Prioridad: prueba muy cerca > nota > vuelves tras días > racha > prueba lejana. app.js entrega el ctx con bind(). */
(() => {
  'use strict';
  const MILESTONES = [3, 7, 14, 30, 60, 100];
  let provider = null;

  function pick(ctx = {}) {
    const { days = null, away = null, streak = 0, grade = null } = ctx;
    if (days === 0) return { say: '¡Hoy es la prueba! Respira, ya hiciste lo que podías.', act: 'nerviosa' };
    if (days !== null && days <= 3) return { say: `La prueba es en ${days === 1 ? '1 día' : days + ' días'}… ¿repasamos un poquito?`, act: 'nerviosa' };
    if (grade !== null && grade >= 5.5) return { say: `¡Un ${grade.toFixed(1)}! Eso se celebra.`, act: 'baile' };
    if (grade !== null && grade < 4) return { say: `Un ${grade.toFixed(1)} duele, pero ya sabemos qué repasar. Vamos de a poco.`, act: 'confundida' };
    if (away !== null && away >= 3) return { say: `¡Volviste! Te extrañé estos ${away} días.`, act: 'saludo' };
    if (MILESTONES.includes(streak)) return { say: `¡${streak} días seguidos estudiando! Estoy orgullosa.`, act: 'deslumbrada' };
    if (days !== null && days <= 7) return { say: 'Esta semana hay prueba: un bloque corto hoy ayuda harto.', act: 'idea' };
    return null;
  }

  window.NexoReacciones = Object.freeze({
    pick, bind(fn) { provider = fn; },
    now() { try { return provider ? pick(provider()) : null; } catch (_) { return null; } }
  });
})();

;

/* perfil/carta.js */
/* Perfil = carta de jugador (docs/perfil-alcoba/SPEC.md). Arte: tools/perfil-carta/build_carta.py → assets/perfil/carta.png.
   render(app, data): pinta la carta y los 3 botones (Vestuario, Estadísticas, Ajustes).
   wrapSection(page, tab): envuelve una sección (mascota, estadísticas, ajustes) en madera + pergamino, con "← Mi carta".
   data = { name, kind, rank: { level, name }, streak, minutes, badges: [6 booleanos] }. app.js arma el data (profileCardData). */
(() => {
  'use strict';
  const V = '1';
  const ART = { w: 120, h: 170 };
  const ZONES = {
    nombre: [14, 9, 106, 22], ventana: [12, 26, 108, 100], rango: [28, 105, 107, 121],
    racha: [12, 125, 58, 141], minutos: [62, 125, 108, 141],
    insignias: [0, 1, 2, 3, 4, 5].map(i => [13 + i * 16, 146, 26 + i * 16, 159])
  };
  const BADGES = ['Racha de 3 días', 'Racha de 7 días', '10 horas de estudio', 'Una clase dominada', 'Un desafío cobrado', 'Vestuario puesto'];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const place = ([x0, y0, x1, y1]) => `left:${x0 / ART.w * 100}%;top:${y0 / ART.h * 100}%;width:${(x1 - x0) / ART.w * 100}%;height:${(y1 - y0) / ART.h * 100}%`;
  let said = false;                       // la mascota comenta tu semestre 1 vez por sesión

  function css() {
    for (const href of ['perfil/carta.css?v=' + V, 'planner/estudio.css?v=1']) {
      if (document.querySelector(`link[href^="${href.split('?')[0]}"]`)) continue;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l);
    }
  }
  const minutesLabel = m => m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? String(m % 60).padStart(2, '0') + ' min' : ''}`.trim() : `${m} min`;

  function render(app, d) {
    css();
    const flame = window.NexoArcaneRanks?.flame?.(d.rank.level) || '';
    app.innerHTML = `<section class="page profile-page perfil-carta-page">
      <div class="carta" role="img" aria-label="Carta de ${esc(d.name)}: ${esc(d.rank.name)}, racha de ${d.streak} días">
        <p class="carta-nombre" style="${place(ZONES.nombre)}">${esc(d.name)}</p>
        <div class="carta-ventana" style="${place(ZONES.ventana)}"><canvas class="carta-mascota" width="40" height="44" aria-hidden="true"></canvas><p class="carta-say" hidden></p></div>
        <p class="carta-rango" style="${place(ZONES.rango)}"><span>${esc(d.rank.name)}</span></p>
        <span class="carta-llama level-${d.rank.level}" style="${place([9, 109, 27, 127])}">${flame}</span>
        <p class="carta-dato" style="${place(ZONES.racha)}"><b>${d.streak}</b><small>${d.streak === 1 ? 'día' : 'días'} de racha</small></p>
        <p class="carta-dato" style="${place(ZONES.minutos)}"><b>${minutesLabel(d.minutes)}</b><small>de estudio</small></p>
        ${ZONES.insignias.map((z, i) => `<i class="carta-insignia${d.badges[i] ? '' : ' apagada'}" style="${place(z)};--i:${i}" title="${BADGES[i]}${d.badges[i] ? '' : ' (aún no)'}"></i>`).join('')}
      </div>
      <nav class="carta-botones" aria-label="Perfil">
        <button data-profile-tab="mascot"><strong>Vestuario</strong><small>Tu compañero y accesorios</small></button>
        <button data-profile-tab="stats"><strong>Estadísticas</strong><small>Tu esfuerzo y tu avance</small></button>
        <button data-profile-tab="settings"><strong>Ajustes</strong><small>Cuenta, sonido y más</small></button>
      </nav></section>`;
    const canvas = app.querySelector('.carta-mascota');
    window.NexoPet?.paintBig(canvas);
    if (!said) {
      const r = window.NexoReacciones?.now();
      if (r) { said = true; const b = app.querySelector('.carta-say'); b.textContent = r.say; b.hidden = false; setTimeout(() => { b.hidden = true; }, 6500); }
    }
  }

  function wrapSection(page, tab) {
    css();
    const nodes = [...page.childNodes];
    const pergamino = document.createElement('div');
    pergamino.className = 'pergamino';
    pergamino.append(...nodes);
    const madera = document.createElement('div');
    madera.className = 'madera perfil-madera';
    madera.append(pergamino);
    page.replaceChildren(madera);
    pergamino.insertAdjacentHTML('afterbegin', '<button class="carta-volver" data-profile-close>← Mi carta</button>');
    page.classList.add('perfil-seccion', 'perfil-' + tab);
  }

  window.NexoCarta = Object.freeze({ render, wrapSection });
})();

;

/* world/torre-mundo.js */
/* Mundo de la torre (docs/mundo-torre/SPEC.md).
   Entrenar (#/train) = Laboratorio de Orgánica II, por capas con parallax (fase 2, tools/torre-pixel/build_lab_muestra.py).
   Juegos (#/games) = Arcade arcano (v1, tools/torre-pixel/build_torre.py). Tocas el piso o un objeto y la mascota camina hasta ahí; el objeto hace su acción.
   Se inserta solo cuando aparece la página (observa #app): no hay que tocar las pantallas. Arte: tools/torre-pixel/build_torre.py. */
(() => {
  'use strict';
  const V = '1';
  const BASE = 'assets/torre/';
  const ROOM_NAMES = { train: 'Laboratorio de Orgánica II', games: 'Arcade arcano' };
  const HINT = 'Toca el piso para caminar o un objeto para usarlo';
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let data = null, loading = null, cssDone = false;
  const worlds = {};          // 'mundo' | 'lab' → estado persistente (la mascota no "salta" al cambiar de pantalla)
  const layerCache = {};
  const query = new URLSearchParams(location.search);       // para probar: ?hora=dia|tarde|noche  ?estado=0|1|2

  function img(src) {
    return new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = BASE + src + '?v=' + V; });
  }
  function load() {
    if (!cssDone) {
      cssDone = true;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'world/torre-mundo.css?v=' + V; document.head.append(l);
    }
    loading = loading || Promise.all([
      fetch(BASE + 'torre.json?v=' + V).then(r => r.json()), img('mundo.png'),
      fetch(BASE + 'lab/lab.json?v=' + V).then(r => r.json()),
      window.NexoPet?.engine ? window.NexoPet.engine() : Promise.reject(new Error('sin mascota'))
    ]).then(([json, mundo, lab]) => {
      lab.objects.forEach(o => { o.room = 'lab'; });
      json.lab = lab;
      data = { json, imgs: { mundo } }; return data;
    });
    return loading;
  }

  // ——— Un mundo: fondo animado + mascota (PixelVida en modo manual) + vista con cámara ———
  function createWorld(key) {
    const meta = data.json[key], base = data.imgs[key], layered = key === 'lab';
    const bg = document.createElement('canvas'); bg.width = meta.w; bg.height = meta.h;
    const bctx = bg.getContext('2d'); bctx.imageSmoothingEnabled = false;
    const stage = document.createElement('canvas'); stage.width = meta.w; stage.height = meta.h;
    const pet = window.NexoPet.current(), reduced = window.NexoPet.reduced();
    const home = key === 'mundo' ? meta.rooms.train.home : meta.home;
    const life = window.PixelVida.create({ canvas: stage, background: layered ? null : bg, stations: {}, route: [], manual: true, speed: 2.2,
      start: { x: home[0], y: home[1] }, kind: pet.kind, reduced, depth: y => .86 + clamp((y - 122) / 22, 0, 1) * .14 });
    life.setOutfit(pet.outfit);

    const wrap = document.createElement('section');
    wrap.className = 'torre-scene'; wrap.dataset.world = key;
    wrap.innerHTML = `<canvas class="torre-view" height="${meta.h}" aria-hidden="true"></canvas><div class="torre-title"></div>
      <p class="torre-tip" hidden></p><p class="torre-say" role="status" aria-live="polite" hidden></p>
      <p class="torre-hint">${HINT}</p><div class="torre-keys" role="group" aria-label="Objetos de la sala"></div>`;
    const view = wrap.querySelector('.torre-view'), vctx = view.getContext('2d');
    const W = {
      key, meta, base, bg, bctx, stage, life, wrap, view, vctx, reduced, layered,
      room: key === 'mundo' ? 'games' : 'lab', camX: 0, vw: meta.w, scale: 1, raf: 0, last: performance.now(),
      lastInput: performance.now(), nextIdle: 9000, sayTimer: 0, tab: null, crossing: false, hover: null, t: 0
    };
    wireInput(W);
    return W;
  }

  // Cuadros animados encima del arte fijo: llamas, burbujas del caldero, pantallas, farolitos y el portal.
  const FLAME_COLORS = ['#a83818', '#dc6420', '#f89a30', '#ffc850', '#ffe890', '#fffce8'];
  function paintBackground(W, t) {
    const { bctx: g, base, meta } = W, a = meta.anim || {};
    g.drawImage(base, 0, 0);
    if (W.reduced) return;
    const px = (x, y, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
    (a.flames || []).forEach((f, i) => {
      const k = Math.floor(t * 7 + i * 1.7) % 3;
      if (f.k === 'big') {
        const tip = [[2, 0], [1, 0], [3, 0]][k];
        px(f.x + tip[0], f.y + tip[1], FLAME_COLORS[2]);
        if (k === 1) px(f.x + 1, f.y + 1, FLAME_COLORS[3]);
        px(f.x + 2, f.y + 2 + (k === 2 ? 1 : 0), FLAME_COLORS[5]);
      } else {
        px(f.x + [1, 0, 2][k], f.y, FLAME_COLORS[2]);
        px(f.x + 1, f.y + 1, FLAME_COLORS[k === 1 ? 4 : 5]);
      }
    });
    (a.bubbles || []).forEach((b, i) => {
      const p = (t * .8 + i * .37) % 1, y = b.y - p * 9, x = b.x + Math.sin(t * 3 + i) * 1.2;
      if (p < .85) { px(x, y, '#c6d862'); if (p > .5) px(x + 1, y, '#eef09a'); }
    });
    (a.screens || []).forEach((s, i) => {
      const y = s.y0 + Math.floor((t * 9 + i * 6) % (s.y1 - s.y0));
      g.fillStyle = 'rgba(156,232,240,.18)'; g.fillRect(s.x0, y, s.x1 - s.x0, 1);
      if (Math.sin(t * 1.3 + i * 2) > .96) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(s.x0, s.y0, s.x1 - s.x0, s.y1 - s.y0); }
    });
    (a.sparks || []).forEach((s, i) => { if (Math.sin(t * 2.2 + i * 1.9) > .55) { px(s.x, s.y, '#fffce8'); } });
    if (a.portal) {
      const { cx, cy, r } = a.portal;
      for (let k = 0; k < 7; k++) {
        const ang = t * (k % 2 ? 1.1 : -.8) + k * .9, rr = (r * .25) + ((t * 6 + k * 5) % (r * .75));
        px(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * .95, k % 3 ? '#dcc0ff' : '#f6ecff');
      }
    }
    if (a.pendulum) {
      const { x, y, len } = a.pendulum, sw = Math.sin(t * 2.4) * 3;
      if (!W.caseColor) { const d = g.getImageData(x + 8, y + 5, 1, 1).data; W.caseColor = `rgb(${d[0]},${d[1]},${d[2]})`; }
      g.fillStyle = W.caseColor; g.fillRect(x - 5, y + 1, 11, len + 5);              // tapa el péndulo fijo del arte
      for (let k = 0; k < len; k++) px(x + sw * k / len, y + k, '#e2b850');
      g.fillStyle = '#e2b850'; g.fillRect(Math.round(x + sw) - 2, y + len - 1, 5, 5);
      g.fillStyle = '#fff6c8'; g.fillRect(Math.round(x + sw) - 1, y + len, 2, 1);
    }
  }

  // ——— Laboratorio por capas (vista lejana · sala · mascota · primer plano), cada una con su parallax ———
  function timeOfDay() {
    const q = query.get('hora'); if (['dia', 'tarde', 'noche'].includes(q)) return q;
    const t = document.body.dataset.nexoTime;
    return t === 'night' ? 'noche' : t === 'dusk' ? 'tarde' : 'dia';
  }
  // Provisorio hasta diseñar el progreso del mundo (SPEC fase 2, paso 4): ejercicios de Aminas resueltos SIN ayuda / total.
  function labProgress() {
    const q = query.get('estado'); if (['0', '1', '2'].includes(q)) return Number(q);
    try {
      const st = JSON.parse(window.NexoStorage.getItem(window.NexoStorage.KEY) || '{}');
      const solved = new Set((st.academicIntelligence?.evidence || [])
        .filter(r => r.outcome === 'correct' && !r.assistanceUsed && String(r.exerciseId).startsWith('org-01:')).map(r => r.exerciseId));
      const total = window.NexoAcademicStructured?.cases?.length || 20;
      const f = solved.size / total;
      return f < .25 ? 0 : f < .75 ? 1 : 2;
    } catch (_) { return 0; }
  }
  function layersFor(W) {
    const tod = timeOfDay(), p = W.progress || 0, id = tod + '-' + p;
    if (W.layerId === id) return W.layers;
    const L = layerCache[id] = layerCache[id] || Promise.all([img(`lab/${tod}-vista.png`), img(`lab/${tod}-${p}-fondo.png`), img(`lab/${tod}-${p}-frente.png`)])
      .then(([vista, fondo, frente]) => ({ vista, fondo, frente, tod, p }));
    L.then(l => { if (W.layerId === id) W.layers = l; });
    W.layerId = id;
    return W.layers;
  }
  const PET_FILTER = { dia: 'none', tarde: 'brightness(.92) sepia(.18)', noche: 'brightness(.6) saturate(.8)' };
  function drawLayered(W, camX, t) {
    const g = W.vctx, m = W.meta, S = m.fine, L = layersFor(W);
    const center = (m.w - W.vw) / 2;
    const at = f => -Math.round((center + (camX - center) * f) * S);
    g.clearRect(0, 0, W.view.width, W.view.height);
    if (!L) return;
    const px = (x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
    g.drawImage(L.vista, at(m.parallax.vista), 0);
    const x1 = at(1);
    g.drawImage(L.fondo, x1, 0);
    const a = m.anim, still = W.reduced;
    if (!still) {
      a.bubbles.forEach(([bx, by], i) => { const k = (t * .7 + i * .29) % 1; if (k < .8) px(x1 + bx + Math.sin(t * 4 + i) * 1.5, by - k * 14, '#eef09a'); });
      a.drips.forEach(([dx, y0, y1]) => { const k = (t * .55) % 1; px(x1 + dx, y0 + k * (y1 - y0), '#9ce8f0'); px(x1 + dx, y0 + k * (y1 - y0) + 1, '#5cc4dc'); });
      a.lanterns.slice(0, m.lit[L.p]).concat(a.candles).forEach(([lx, ly], i) => {
        const k = Math.floor(t * 8 + i * 2.3) % 3;
        px(x1 + lx + (k === 1 ? -1 : k === 2 ? 1 : 0), ly - 1, '#ffc850');
        px(x1 + lx, ly + 1, k ? '#fffce8' : '#ffe890');
      });
      a.shrooms.forEach(([sx, sy], i) => { if (Math.sin(t * 1.4 + i * 2.1) > .7) px(x1 + sx, sy - 2 - (t * 3 + i) % 4, '#a8f0dc'); });
      (m.dust[L.tod] || []).forEach(([dx, dy], i) => {
        if (Math.sin(t * 1.1 + i) > -.2) px(x1 + dx + Math.sin(t * .8 + i) * 3, dy - ((t * 4 + i * 7) % 20), 'rgba(255,240,176,.85)');
      });
    }
    g.save(); g.filter = PET_FILTER[L.tod] || 'none';
    g.drawImage(W.stage, x1, 0, m.w * S, m.h * S);
    g.restore();
    const xf = at(m.parallax.frente);
    g.drawImage(L.frente, xf, 0, m.w * S, m.h * S);
    if (!still) {
      const [cx, cy] = a.frontCandle, k = Math.floor(t * 7) % 3;
      g.fillStyle = k ? '#fffce8' : '#ffe890'; g.fillRect(xf + cx * S + 2 + (k === 2 ? 2 : 0), cy * S - 2, 2, 2);
    }
  }

  function roomAt(W, x) {
    if (W.key !== 'mundo') return W.room;
    return x < W.meta.rooms.train.x1 ? 'train' : 'games';
  }

  function frame(W, now) {
    W.raf = 0;
    if (!W.wrap.isConnected) { W.life.pause(true); return; }
    const dt = Math.min(.05, (now - W.last) / 1000); W.last = now; W.t += dt;
    if (!W.layered) paintBackground(W, W.t);
    const A = W.life.state;
    // Cruzar el arco caminando cambia de pantalla (la escena es la misma, así que no se nota el cambio).
    if (W.key === 'mundo') {
      const r = roomAt(W, A.x);
      if (r !== W.room) { W.room = r; W.crossing = true; location.hash = '#/' + r; }
    }
    const maxCam = Math.max(0, W.meta.w - W.vw);
    const target = clamp(A.x - W.vw / 2, 0, maxCam);
    W.camX = W.reduced ? target : W.camX + (target - W.camX) * (1 - Math.exp(-dt * 4));
    const cam = Math.round(W.camX);
    W.vctx.imageSmoothingEnabled = false;
    if (W.layered) drawLayered(W, W.camX, W.t);
    else {
      W.vctx.clearRect(0, 0, W.vw, W.meta.h);
      W.vctx.drawImage(W.stage, cam, 0, W.vw, W.meta.h, 0, 0, W.vw, W.meta.h);
    }
    placeBubble(W, cam);
    idle(W, now);
    W.raf = requestAnimationFrame(t => frame(W, t));
  }

  // Como el refugio del Inicio: la escena es parte de la página, de borde a borde de la columna principal y pegada arriba.
  function resize(W) {
    const app = document.getElementById('app'), page = W.wrap.parentElement;
    if (!app || !page) return;
    const a = app.getBoundingClientRect(), p = page.getBoundingClientRect();
    const width = a.width;
    W.wrap.style.width = width + 'px';
    W.wrap.style.marginLeft = (a.left - p.left) + 'px';
    W.wrap.style.marginTop = -(parseFloat(getComputedStyle(page).paddingTop) || 0) + 'px';
    const room = W.key === 'mundo' ? W.meta.rooms.train.x1 : W.meta.w;      // una sala llena el ancho
    const minH = innerWidth < 700 ? 300 : 340, maxH = Math.max(minH, innerHeight * .72);
    let scale = Math.max(width / room, minH / W.meta.h);
    if (W.key === 'mundo') scale = Math.min(scale, maxH / W.meta.h);
    const cssH = Math.round(W.meta.h * scale);
    W.wrap.style.height = cssH + 'px';
    W.vw = Math.min(W.meta.w, Math.ceil(width / scale));
    W.scale = scale;
    const fine = W.layered ? W.meta.fine : 1;              // el laboratorio se dibuja en la grilla fina (x2)
    W.view.width = W.vw * fine; W.view.height = W.meta.h * fine;
    W.view.style.width = (W.vw * scale) + 'px'; W.view.style.height = cssH + 'px';
    const A = W.life.state;
    W.camX = clamp(A.x - W.vw / 2, 0, Math.max(0, W.meta.w - W.vw));
  }

  // ——— Entrada: tocar, pasar el mouse, teclado ———
  function toArt(W, e) {
    const r = W.view.getBoundingClientRect();
    return [Math.round(W.camX) + (e.clientX - r.left) / r.width * W.vw, (e.clientY - r.top) / r.height * W.meta.h, r];
  }
  function hit(W, x, y) {
    // Los objetos del arco existen en las dos salas: vale el de la sala donde estás. El resto, el de la sala que tocaste.
    return W.meta.objects.find(o => (o.action === 'go' ? o.room === W.room : o.room === roomAt(W, x))
      && x >= o.rect[0] && x < o.rect[2] && y >= o.rect[1] && y < o.rect[3]);
  }
  function wireInput(W) {
    const { view } = W;
    view.addEventListener('pointerdown', e => {
      const [x, y] = toArt(W, e);
      W.lastInput = performance.now();
      const A = W.life.state;
      if (Math.abs(x - A.x) < 12 && y < A.y + 3 && y > A.y - 40) { W.life.poke(); return; }
      const o = hit(W, x, y);
      if (o) { use(W, o); return; }
      const [y0, y1] = W.meta.walk;
      go(W, clamp(x, 10, W.meta.w - 10), y >= W.meta.floor ? clamp(y, y0, y1) : A.y);
    });
    view.addEventListener('pointermove', e => {
      const [x, y, r] = toArt(W, e), o = hit(W, x, y), tip = W.wrap.querySelector('.torre-tip');
      view.style.cursor = o ? 'pointer' : 'default';
      if (!o) { tip.hidden = true; return; }
      tip.textContent = o.label; tip.hidden = false;
      const cx = ((o.rect[0] + o.rect[2]) / 2 - Math.round(W.camX)) * W.scale;
      tip.style.left = clamp(cx, 60, r.width - 60) + 'px'; tip.style.top = Math.max(4, o.rect[1] * W.scale - 30) + 'px';
    });
    view.addEventListener('pointerleave', () => { W.wrap.querySelector('.torre-tip').hidden = true; });
  }
  function keys(W) {
    const box = W.wrap.querySelector('.torre-keys');
    const list = W.meta.objects.filter(o => o.room === W.room);
    const sig = list.map(o => o.id).join();
    if (box.dataset.sig === sig) return;
    box.dataset.sig = sig;
    box.innerHTML = list.map(o => `<button type="button" data-obj="${o.id}">${esc(o.label)}</button>`).join('');
    box.onclick = e => { const id = e.target.closest('[data-obj]')?.dataset.obj; const o = W.meta.objects.find(k => k.id === id && k.room === W.room); if (o) use(W, o); };
  }

  async function go(W, x, y) {
    W.lastInput = performance.now();
    return W.life.walkTo(x, y);
  }
  function say(W, text, ms = 2600) {
    const b = W.wrap.querySelector('.torre-say');
    b.textContent = text; b.hidden = false;
    clearTimeout(W.sayTimer); W.sayTimer = setTimeout(() => { b.hidden = true; }, ms);
  }
  function placeBubble(W, cam) {
    const b = W.wrap.querySelector('.torre-say'); if (b.hidden) return;
    const A = W.life.state;
    b.style.left = clamp((A.x - cam) * W.scale, 70, W.vw * W.scale - 70) + 'px';
    b.style.top = Math.max(2, (A.y - 50) * W.scale - b.offsetHeight) + 'px';
  }

  // ——— Lo que hace cada objeto ———
  async function use(W, o) {
    W.lastInput = performance.now();
    if (o.action === 'go') {                                   // cruzar el arco hasta la otra sala
      const r = W.meta.rooms[o.route];
      say(W, o.say);
      await go(W, r.home[0], r.home[1]);
      return;
    }
    const arrived = await go(W, o.stand[0], o.stand[1]);
    if (!arrived) return;
    if (o.action === 'mode') return chooseMode(W, o);
    if (o.action === 'game') return openGame(W, o);
  }
  function chooseMode(W, o) {
    const form = document.querySelector('form[data-training-setup]');
    const select = form?.querySelector('select[name="mode"]');
    if (!select) { say(W, 'Termina esta ronda primero'); return; }
    select.value = o.mode; select.dispatchEvent(new Event('change', { bubbles: true }));
    W.life.act(o.mode === 'pep' ? 'deslumbrada' : o.mode === 'errors' ? 'confundida' : 'idea');
    say(W, o.say + ' · toca Empezar', 3200);
    form.classList.remove('torre-flash'); void form.offsetWidth; form.classList.add('torre-flash');
    if (o.mode === 'topic') form.querySelector('select[name="topic"]')?.focus({ preventScroll: true });
  }
  function openGame(W, o) {
    const card = document.querySelector(`[data-game-card="${o.game}"]`);
    if (o.game === 'campaign') {
      say(W, o.say); W.life.act('deslumbrada');
      setTimeout(() => { location.href = 'games/pep1/index.html'; }, W.reduced ? 200 : 1300);
      return;
    }
    say(W, o.say); W.life.act('nerviosa');
    if (card) { card.classList.remove('torre-flash'); void card.offsetWidth; card.classList.add('torre-flash'); }
  }

  // ——— Vida propia cuando nadie la toca ———
  function idle(W, now) {
    const A = W.life.state;
    const night = document.body.dataset.nexoTime === 'night';
    if (W.night !== night) { W.night = night; if (!W.layered) W.life.night(night); }   // el laboratorio ya trae su noche
    if (W.reduced || A.moving || W.life.busy || A.mode === 'sleep' || now - W.lastInput < W.nextIdle) return;
    W.lastInput = now; W.nextIdle = 9000 + Math.random() * 8000;
    if (Math.random() < .5) { W.life.act(pick(['saludo', 'idea', 'baile', 'seisSiete', 'dab', 'deslumbrada'])); return; }
    const room = W.key === 'mundo' ? W.meta.rooms[W.room] : { x0: 0, x1: W.meta.w };
    const [y0, y1] = W.meta.walk;
    W.life.walkTo(clamp(A.x + (Math.random() * 90 - 45), room.x0 + 16, room.x1 - 24), y0 + Math.random() * (y1 - y0));
  }

  // ——— Montaje en cada pantalla ———
  function anchorFor(kind, page) {
    if (kind === 'games') return page.querySelector('.page-header');
    return page.firstElementChild;
  }
  async function mount(kind, page) {
    try { await load(); } catch (_) { return; }
    if (!page.isConnected) return;
    const key = kind === 'train' ? 'lab' : 'mundo';
    const W = worlds[key] = worlds[key] || createWorld(key);
    const pet = window.NexoPet.current();
    W.life.setKind(pet.kind); W.life.setOutfit(pet.outfit);
    const anchor = anchorFor(kind, page);
    page.classList.add('torre-on');
    page.insertBefore(W.wrap, page.firstChild);
    // El título de la pantalla va encima del arte (como "Un lugar para aprender" en el Inicio).
    const title = W.wrap.querySelector('.torre-title');
    title.replaceChildren();
    if (anchor && (anchor.matches('h1') || anchor.matches('.page-header'))) title.append(anchor);
    const bg = getComputedStyle(document.querySelector('main') || document.body).backgroundColor;
    W.wrap.style.setProperty('--torre-fade', bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : getComputedStyle(document.body).backgroundColor);
    W.wrap.setAttribute('aria-label', ROOM_NAMES[kind]);
    if (key === 'mundo') {
      // Llegó por el menú: aparece en la entrada del arcade.
      if (W.room !== kind) { const h = W.meta.rooms[kind].home; W.life.place(h[0], h[1], false); }
      W.room = kind; W.crossing = false;
    } else if (key === 'lab') {
      W.progress = labProgress();
      layersFor(W);
    }
    keys(W);
    resize(W);
    W.life.pause(false);
    W.last = performance.now();
    if (!W.raf) W.raf = requestAnimationFrame(t => frame(W, t));
  }

  function scan() {
    const app = document.getElementById('app'); if (!app) return;
    const page = app.querySelector(':scope > .page');
    if (!page) return;
    const kind = page.classList.contains('arcane-training') ? 'train' : page.classList.contains('games-room') ? 'games' : null;
    if (!kind || page.querySelector('.torre-scene')) return;
    mount(kind, page);
  }
  function start() {
    const app = document.getElementById('app'); if (!app) return;
    new MutationObserver(scan).observe(app, { childList: true });
    addEventListener('resize', () => Object.values(worlds).forEach(W => W.wrap.isConnected && resize(W)));
    scan();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.NexoTorre = Object.freeze({ scan, worlds });
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