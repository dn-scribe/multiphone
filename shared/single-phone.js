// Single Phone Mode: lets one person use every role an app defines (e.g.
// "Keyboard" and "Controls") on one device, with no network at all — not a
// debug trick, a real way to use a multiphone app alone. Pair with
// shared/single-phone.css.
//
// An app that wants this writes each of its roles as a "panel":
// {id, label, mount(contentEl)} where mount() builds that role's UI into
// contentEl exactly like it would for a real phone, using some `room`
// object for messaging. Reuse the SAME mount()/room shape your app already
// uses for real cross-phone play (see shared/multiphone.js) — that's what
// makes this generic: a future app with 3+ roles (e.g. a sequencer) gets
// Single Phone Mode for free by listing more panels, no new plumbing.
//
// SinglePhone.createRoom() -> { addPeer(): peer }
//   peer: { myId, send(msg), onMessage(cb) }
//   Every peer from the same room receives every send() from every peer
//   (including its own), synchronously, in call order — there is no
//   host/client distinction locally, unlike shared/multiphone.js, since
//   there's no real network to economize on.
//
// SinglePhone.mountPanels(container, panels)
//   panels: [{id, label, mount(contentEl)}, ...], each already bound to
//   whatever that panel needs (typically one peer from one createRoom()).
//   Renders one panel per entry into `container`: side by side and all
//   live at once on a wide viewport, or switchable one at a time (via a
//   switcher bar) on a narrow one — every panel stays mounted (just
//   hidden) when switching, so none of them lose state.
(function(global){
  function createRoom(){
    const peers=[];
    function addPeer(){
      const id='local-'+Math.random().toString(36).slice(2,10);
      const handlers=[];
      const peer={
        myId:id,
        send(msg){ peers.forEach(p=>p._handlers.forEach(h=>h(msg))); },
        onMessage(cb){ handlers.push(cb); },
        _handlers:handlers,
      };
      peers.push(peer);
      return peer;
    }
    return {addPeer};
  }

  function mountPanels(container,panels){
    container.innerHTML='';
    container.className=(container.className?container.className+' ':'')+'sp-panels';
    const switcher=document.createElement('div'); switcher.className='sp-switcher';
    const stage=document.createElement('div'); stage.className='sp-stage';
    container.appendChild(switcher); container.appendChild(stage);
    function select(i){
      panels.forEach((p,j)=>{ p._el.classList.toggle('sp-active',j===i); p._btn.classList.toggle('sel',j===i); });
    }
    panels.forEach((p,i)=>{
      const btn=document.createElement('button'); btn.type='button'; btn.textContent=p.label;
      btn.onclick=()=>select(i);
      switcher.appendChild(btn);
      const panelEl=document.createElement('div'); panelEl.className='sp-panel';
      const labelEl=document.createElement('div'); labelEl.className='sp-panel-label'; labelEl.textContent=p.label;
      const content=document.createElement('div'); content.className='sp-panel-content';
      panelEl.appendChild(labelEl); panelEl.appendChild(content);
      stage.appendChild(panelEl);
      p._el=panelEl; p._btn=btn;
      p.mount(content);
    });
    select(0);
  }

  global.SinglePhone={createRoom,mountPanels};
})(window);
