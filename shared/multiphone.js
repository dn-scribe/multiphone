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
  const CODE_CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ'; // letters only (no I/O, easy to confuse)
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

    // Two failure modes besides a real PeerJS 'error' event: the PeerJS
    // script itself can fail to load (a flaky connection, an ad-blocker,
    // a CDN hiccup), in which case `new Peer(...)` throws synchronously -
    // "ReferenceError: Peer is not defined" - before any error handler
    // even exists to catch it; or the signaling connection can simply
    // hang with neither 'open' nor 'error' ever firing. Both used to mean
    // onError() never ran, leaving the UI's "Continue" button disabled
    // forever with no feedback - the exact "it just does nothing" dead
    // end this guards against now.
    function open(tries){
      tries=tries||0;
      const timeout=setTimeout(()=>{ opts.onError&&opts.onError(new Error('Timed out connecting.')); },12000);
      try{
        peer=new Peer(peerIdFor(appId,code));
      }catch(e){
        clearTimeout(timeout); opts.onError&&opts.onError(e); return;
      }
      peer.on('open',id=>{
        clearTimeout(timeout);
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
        if(String(e.type)==='unavailable-id' && tries<5){ clearTimeout(timeout); peer.destroy(); code=opts.code||genCode(); open(tries+1); return; }
        clearTimeout(timeout);
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
    let myId=null, conn=null, attemptsLeft=3;
    function attempt(){
      const timeout=setTimeout(()=>{ opts.onError&&opts.onError(new Error('Timed out connecting.')); },12000);
      let peer;
      try{
        peer=new Peer();
      }catch(e){
        clearTimeout(timeout); opts.onError&&opts.onError(e);
        return;
      }
      peer.on('open',id=>{
        myId=id;
        conn=peer.connect(peerIdFor(opts.appId,opts.code),{reliable:true});
        conn.on('open',()=>{
          clearTimeout(timeout);
          conn.send(opts.joinData||{});
          conn.on('data',d=>opts.onMessage&&opts.onMessage(d));
          conn.on('close',()=>opts.onClose&&opts.onClose());
          opts.onOpen&&opts.onOpen(myId);
        });
      });
      peer.on('error',e=>{
        // 'peer-unavailable' is PeerJS's "that room code doesn't exist" -
        // but with several phones joining the same host in close
        // succession, the signaling server can report it transiently even
        // though the host is right there (reported directly: a 3rd phone
        // got "room doesn't exist" when the host plainly existed, since
        // two others had just joined it). Worth a couple of quick retries
        // before trusting it, same caution the host side already applies
        // to its own room-code collisions below.
        if(String(e.type)==='peer-unavailable' && attemptsLeft>1){
          attemptsLeft--; clearTimeout(timeout); peer.destroy();
          setTimeout(attempt,500);
          return;
        }
        clearTimeout(timeout); opts.onError&&opts.onError(e);
      });
    }
    attempt();
    return {
      get myId(){return myId},
      send(msg){ if(conn&&conn.open) conn.send(msg); },
    };
  }

  global.Multiphone={genCode,host,join};
})(window);
