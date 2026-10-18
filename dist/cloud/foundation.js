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
