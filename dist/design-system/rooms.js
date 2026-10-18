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
