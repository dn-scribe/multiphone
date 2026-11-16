// Multiphone networking helper: lets several phones join one session and
// exchange messages peer-to-peer. One phone hosts (authoritative), the rest
// join with a short room code. Requires PeerJS (load it before this file):
//   <script src="https://cdn.jsdelivr.net/npm/peerjs@1.5.2/dist/peerjs.min.js"></script>
//   <script src="../../shared/multiphone.js"></script>
//
// Multiphone.host({appId, onReady(code,myId), onPeerJoin(id,joinData), onPeerLeave(id),
//                   onMessage(msg,fromId), onError(err)})
//   -> {code, myId, broadcast(msg), sendTo(id,msg), peerIds()}
//   broadcast() sends to every joined phone AND calls onMessage(msg, myId) locally,
//   so the host can reuse the same message handler as its own UI state updates.
//
// Multiphone.join({appId, code, joinData, onOpen(myId), onMessage(msg), onClose(), onError(err)})
//   -> {myId, send(msg)}
//
// The first message a joining phone sends is treated as its join handshake
// (delivered to the host's onPeerJoin), not as a regular onMessage.
(function(global){
  const CODE_CHARS='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  function genCode(){
    let s=''; for(let i=0;i<4;i++) s+=CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)];
    return s;
  }
  function peerIdFor(appId,code){ return 'multiphone-'+appId+'-'+code; }

  function host(opts){
    opts=opts||{};
    const appId=opts.appId;
    const conns=new Map();
    let code=opts.code||genCode();
    let myId=null, peer=null;

    function open(tries){
      tries=tries||0;
      peer=new Peer(peerIdFor(appId,code));
      peer.on('open',id=>{
        myId=id;
        peer.on('connection',conn=>{
          let joined=false;
          conn.on('data',d=>{
            if(!joined){ joined=true; conns.set(conn.peer,conn); opts.onPeerJoin&&opts.onPeerJoin(conn.peer,d); return; }
            opts.onMessage&&opts.onMessage(d,conn.peer);
          });
          conn.on('close',()=>{ conns.delete(conn.peer); opts.onPeerLeave&&opts.onPeerLeave(conn.peer); });
        });
        opts.onReady&&opts.onReady(code,myId);
      });
      peer.on('error',e=>{
        if(String(e.type)==='unavailable-id' && tries<5){ peer.destroy(); code=opts.code||genCode(); open(tries+1); return; }
        opts.onError&&opts.onError(e);
      });
    }
    open(0);

    return {
      get code(){return code},
      get myId(){return myId},
      broadcast(msg){ conns.forEach(c=>{if(c.open)c.send(msg)}); opts.onMessage&&opts.onMessage(msg,myId); },
      sendTo(id,msg){ const c=conns.get(id); if(c&&c.open) c.send(msg); },
      peerIds(){ return Array.from(conns.keys()); },
    };
  }

  function join(opts){
    opts=opts||{};
    const peer=new Peer();
    let myId=null, conn=null;
    peer.on('open',id=>{
      myId=id;
      conn=peer.connect(peerIdFor(opts.appId,opts.code),{reliable:true});
      conn.on('open',()=>{
        conn.send(opts.joinData||{});
        conn.on('data',d=>opts.onMessage&&opts.onMessage(d));
        conn.on('close',()=>opts.onClose&&opts.onClose());
        opts.onOpen&&opts.onOpen(myId);
      });
    });
    peer.on('error',e=>{ opts.onError&&opts.onError(e); });
    return {
      get myId(){return myId},
      send(msg){ if(conn&&conn.open) conn.send(msg); },
    };
  }

  global.Multiphone={genCode,host,join};
})(window);
