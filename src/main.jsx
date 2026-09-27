import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './style.css';

const C = { electric:'#f8c663', gas:'#6db8fc', suction:'#b8a0ff', water:'#5fd4c2', waste:'#eb857e', bluetooth:'#4be0c4', frame:'#d9a276' };
const tabs = [
  ['before','Before'], ['overview','Overview'], ['folding','Expandable wires & pipes'], ['bluetooth','Bluetooth monitoring'], ['ceiling','Ceiling service'], ['floor','Floor service']
];
function Block({position=[0,0,0],size=[1,1,1],color='#446977',transparent=false,opacity=1}) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} transparent={transparent} opacity={opacity} roughness={.58}/></mesh>;
}
function Label({children,position,size=.18,color='#e9f7f8',rotation=[0,0,0]}) {
  return <Text font="/fonts/DejaVuSans.ttf" position={position} rotation={rotation} fontSize={size} maxWidth={2.8} textAlign="center" color={color} anchorX="center" anchorY="middle" outlineWidth={.004} outlineColor="#081824">{children}</Text>;
}
function Tube({points,color,radius=.035,dashed=false}) {
  const curve=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal'),[JSON.stringify(points)]);
  if(dashed) return <group>{Array.from({length:12},(_,i)=>{const pts=[curve.getPoint(i/12),curve.getPoint(Math.min(1,i/12+.045))];return <mesh key={i}><tubeGeometry args={[new THREE.LineCurve3(...pts),4,.025,6,false]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.28}/></mesh>})}</group>;
  return <mesh><tubeGeometry args={[curve,64,radius,10,false]}/><meshStandardMaterial color={color} roughness={.38} metalness={.12}/></mesh>;
}
function Joint({position,color=C.frame,r=.085}) { return <mesh position={position}><sphereGeometry args={[r,16,12]}/><meshStandardMaterial color={color} metalness={.45} roughness={.35}/></mesh>; }
function Ring({position,color=C.frame,scale=1}) {return <mesh position={position} rotation={[Math.PI/2,0,0]} scale={scale}><torusGeometry args={[.075,.015,8,20]}/><meshStandardMaterial color={color}/></mesh>}
function Room({floorOpen}) {
  return <group><Block position={[0,-.12,0]} size={[9.5,.22,6]} color="#1c3645"/><gridHelper args={[9.5,10,'#385767','#294757']} position={[0,.003,0]}/>
  <Block position={[0,1.5,-3.02]} size={[9.5,3,.07]} color="#274555" transparent opacity={.38}/>
  <Block position={[-4.77,1.5,0]} size={[.07,3,6]} color="#274555" transparent opacity={.26}/>
  {floorOpen && <Block position={[0,-.02,1.95]} size={[6.8,.04,.72]} color="#0a2631"/>}
  </group>;
}
function Person({position=[0,0,0],lying=false,color='#4da6a0'}) {
  if(lying) return <group position={position}>
    <mesh position={[0,0,-.87]}><sphereGeometry args={[.18,20,16]}/><meshStandardMaterial color="#c99678"/></mesh>
    <Block position={[0,-.015,-.22]} size={[.55,.17,.95]} color="#98c5c8"/>
    <Block position={[-.16,-.04,.53]} size={[.19,.14,.65]} color="#98c5c8"/><Block position={[.16,-.04,.53]} size={[.19,.14,.65]} color="#98c5c8"/>
    <Block position={[-.42,-.04,-.26]} size={[.27,.12,.65]} color="#c99678"/><Block position={[.42,-.04,-.26]} size={[.27,.12,.65]} color="#c99678"/>
    </group>;
  return <group position={position}>
    <mesh position={[0,1.57,0]}><sphereGeometry args={[.17,18,12]}/><meshStandardMaterial color="#c99678"/></mesh>
    <mesh position={[0,1.22,0]}><cylinderGeometry args={[.24,.18,.56,16]}/><meshStandardMaterial color={color}/></mesh>
    <Block position={[-.12,.56,0]} size={[.13,.76,.16]} color={color}/><Block position={[.12,.56,0]} size={[.13,.76,.16]} color={color}/>
    <Block position={[-.3,1.22,0]} size={[.13,.56,.14]} color={color}/><Block position={[.3,1.22,0]} size={[.13,.56,.14]} color={color}/>
    <Block position={[0,1.6,.15]} size={[.27,.11,.04]} color="#e8f2f3"/>
  </group>;
}
function Table({before=false}){return <group>
  <Block position={[0,.72,0]} size={[1.75,.22,2.35]} color="#8baab0"/>
  <Block position={[0,.43,0]} size={[.48,.52,.55]} color="#668794"/>
  <Block position={[0,.84,-.76]} size={[1.5,.08,.55]} color="#a7bfc4"/>
  <Person position={[0,1.05,0]} lying/>
  <Label position={[0,1.42,.4]} size={.13}>PATIENT</Label>
  <Label position={[0,.43,-1.42]} size={.15}>OT TABLE</Label>
  {/* The table-side socket belongs only to the proposed layout. */}
  {!before&&<>
    <Block position={[.95,.68,.35]} size={[.14,.32,.58]} color="#e3c36b"/>
    <Block position={[1.028,.68,.35]} size={[.025,.23,.46]} color="#172d38"/>
    <Joint position={[1.055,.68,.22]} color={C.electric} r={.045}/>
    <Joint position={[1.055,.68,.48]} color={C.electric} r={.045}/>
    <Label position={[1.65,.99,.35]} size={.12}>OT TABLE POWER SOCKET</Label>
  </>}
  </group>}
function Machines({before=false}){return <group>
  <Block position={[-3.55,.71,-1.4]} size={[.8,1.42,.75]} color="#446d7b"/><Label position={[-3.55,1,-1]} size={.14}>ANAESTHESIA</Label>
  {/* The monitor is mounted on the same anaesthesia workstation in every view. */}
  <Block position={[-3.55,1.72,-1.4]} size={[.1,.65,.1]} color="#6d8c98"/>
  <Block position={[-3.55,1.91,-1.35]} size={[.75,.52,.16]} color="#446d7b"/>
  <Block position={[-3.55,1.91,-1.257]} size={[.61,.39,.035]} color="#162c39"/>
  <Label position={[-3.55,2.045,-1.227]} size={.075} color="#8ee8d2">ANAESTHESIA</Label>
  <Label position={[-3.55,1.95,-1.227]} size={.075} color="#8ee8d2">ECG</Label>
  <Label position={[-3.55,1.855,-1.227]} size={.075} color="#8ee8d2">SpO₂</Label>
  <Label position={[-3.55,1.76,-1.227]} size={.075} color="#8ee8d2">BP</Label>
  <Label position={[-3.55,2.3,-1.35]} size={.14}>MONITOR</Label>
  <Block position={[3.4,.49,.75]} size={[.7,.98,.7]} color="#446d7b"/><Label position={[3.4,1.15,.75]} size={.14}>POWER CART</Label>
  {/* A compact instrument table puts the cautery unit within Doctor 2's reach. */}
  <Block position={[1.52,.82,-.5]} size={[.74,.12,.65]} color="#b5cbd0"/>
  <Block position={[1.52,.41,-.5]} size={[.09,.76,.09]} color="#6d8c98"/>
  <group position={[1.52,.96,-.5]} rotation={[0,Math.PI/4,0]}>
    <Block size={[.52,.22,.41]} color="#446d7b"/>
    {/* The controls face the doctor on the positive X side of the table. */}
    <Block position={[0,.07,.218]} size={[.34,.11,.02]} color="#203b49"/>
    <Joint position={[-.19,-.03,.22]} color="#f8c663" r={.025}/>
  </group>
  {/* The guided lead exists only in the proposed layout. */}
  {!before&&<Tube points={[[1.36,.94,-.66],[1.12,.82,-.63],[1.12,.7,-.27],[1.1,.7,.2],[1.055,.68,.48]]} color={C.electric} radius={.018}/>}
  <Label position={[1.52,1.27,-.5]} size={.13}>CAUTERY UNIT</Label>
  <Block position={[-3.5,.47,.8]} size={[.7,.94,.7]} color="#446d7b"/><Label position={[-3.5,1.12,.8]} size={.14}>SUCTION</Label>
  <Tube points={[[.42,1.12,-.45],[.52,1.24,-.28]]} color={C.bluetooth} radius={.016}/>
  <Tube points={[[.58,1.08,-.38],[.74,1.08,-.32]]} color={C.bluetooth} radius={.016}/>
  <Tube points={[[-3.35,1.2,-1.3],[-3.35,.22,-1.3],[-3.35,-.14,-1.3]]} color={C.gas} radius={.055}/>
  <Tube points={[[-3.35,-.14,-1.3],[-2.25,-.14,-1.3],[-1.15,-.14,-1.3],[-1.15,-.14,-.95]]} color={C.gas} radius={.055}/>
  <Tube points={[[-1.15,-.14,-.95],[-1.15,.12,-.95],[-1.15,.82,-.95],[-.83,1.26,-.95],[-.25,1.22,-.87]]} color={C.gas} radius={.055}/>
  <Joint position={[-1.15,.12,-.95]} color={C.gas} r={.1}/>
  <Label position={[-1.34,.48,-1.3]} size={.12}>VENTILATION OUTLET BY TABLE</Label>
  <Person position={[-2.1,0,.2]} color="#39a8a0"/><Person position={[2.1,0,.08]} color="#48aeb0"/>
  <Label position={[-2.1,1.91,.2]} size={.12}>DOCTOR 1</Label><Label position={[2.1,1.91,.08]} size={.12}>DOCTOR 2</Label>
  </group>}
function Bluetooth(){return <group>
  <Tube dashed points={[[.6,1.18,-.48],[-.75,2.05,-.95],[-2.15,2.32,-1.15],[-3.55,1.91,-1.25]]} color={C.bluetooth}/>
  <Joint position={[.6,1.18,-.48]} color={C.bluetooth}/><Joint position={[-3.55,1.91,-1.25]} color={C.bluetooth}/>
  <Label position={[.1,2.75,-1.8]} color={C.bluetooth}>BLUETOOTH DATA</Label>
  <Tube points={[[.8,1,-.55],[.45,.92,-.5]]} color={C.bluetooth} radius={.017}/>
  <Label position={[.15,1.35,-1.05]} size={.13}>Sensor contact / short leads remain</Label>
  </group>}
function Ceiling(){return <group>
  <Tube points={[[-4.4,2.85,-2.6],[0,2.85,-2.6],[0,2.85,-.3],[0,2.38,-.3]]} color={C.electric}/>
  <Tube points={[[-4.4,2.85,-2.3],[-.28,2.85,-2.3],[-.28,2.4,-.3]]} color={C.gas}/>
  <Tube points={[[4.4,2.85,-2.3],[.28,2.85,-2.3],[.28,2.4,-.3]]} color={C.suction}/>
  <Block position={[0,2.25,-.3]} size={[.9,.28,.55]} color="#6494a1"/>
  {[-.27,0,.27].map((x,i)=><Joint key={x} position={[x,2.12,-.01]} color={[C.gas,C.electric,C.suction][i]} r={.07}/>)}
  <Label position={[0,3.1,-.3]} size={.16}>CEILING PENDANT</Label>
  <Label position={[.95,2.28,-.08]} size={.13}>connection points above table</Label>
  </group>}
function Floor({open}){let y=open?.55:.07;return <group>
  <Block position={[0,-.015,1.95]} size={[6.8,.05,.72]} color="#0c2834"/>
  {Object.entries(C).filter(([k])=>['electric','gas','suction','water','waste'].includes(k)).map(([key,col],i)=><Tube key={key} points={[[-3.15,.035,1.69+i*.13],[3.15,.035,1.69+i*.13]]} color={col} radius={.025}/>)}
  {[-2.7,-1,1,2.7].map((x,i)=><group key={x}><Block position={[x,.07,1.95]} size={[.34,.12,.65]} color="#397584"/><Label position={[x,.18,1.95]} size={.11}>J{i+1}</Label></group>)}
  <Block position={[0,y,1.95]} size={[6.8,.08,.75]} color="#668b99" transparent opacity={open?.7:1}/>
  <Label position={[0,y+.09,1.95]} size={.13}>{open?'LIFTED SERVICE PANEL':'SEALED ACCESS PANEL'}</Label>
  {/* Equipment connections drop vertically; the long runs stay beneath the sealed floor. */}
  <Tube points={[[3.4,.45,.75],[3.4,.12,.75],[3.4,-.14,.75]]} color={C.electric}/>
  <Tube points={[[3.4,-.14,.75],[3.4,-.14,1.95]]} color={C.electric}/>
  <Tube points={[[-3.5,.45,.8],[-3.5,.12,.8],[-3.5,-.14,.8]]} color={C.suction}/>
  <Tube points={[[-3.5,-.14,.8],[-3.5,-.14,1.95]]} color={C.suction}/>
  <Block position={[-1.72,.08,.92]} size={[.38,.14,.34]} color="#518391"/><Joint position={[-1.72,.17,.92]} color={C.suction} r={.055}/><Label position={[-1.72,.34,.92]} size={.11}>SUCTION OUTLET</Label>
  <Block position={[1.72,.08,.92]} size={[.38,.14,.34]} color="#518391"/><Joint position={[1.72,.17,.92]} color={C.electric} r={.055}/><Label position={[1.72,.34,.92]} size={.11}>POWER SOCKET</Label>
  <Tube points={[[-1.72,.17,.92],[-1.72,-.14,.92]]} color={C.suction} radius={.023}/>
  <Tube points={[[-1.72,-.14,.92],[-1.72,-.14,1.75]]} color={C.suction} radius={.023}/>
  <Tube points={[[1.72,.17,.92],[1.72,-.14,.92]]} color={C.electric} radius={.023}/>
  <Tube points={[[1.72,-.14,.92],[1.72,-.14,1.68]]} color={C.electric} radius={.023}/>
  {/* No wire crosses the walking surface: power rises straight up at the table side. */}
  <Tube points={[[1.72,-.14,.92],[1.72,-.14,.48],[1.055,-.14,.48]]} color={C.electric} radius={.022}/>
  <Tube points={[[1.055,-.14,.48],[1.055,.06,.48],[1.055,.68,.48]]} color={C.electric} radius={.022}/>
  <Label position={[1.65,.6,1.55]} size={.14}>service joints near table</Label>
  </group>}
function Folding({extend,bend}) {
  const t=extend/100, b=bend/100;
  // Each arm has a hinged elbow and sliding section, like a compact umbrella/telescoping handle.
  let rightStart=[3.08,1.25,.8], rightElbow=[2.48,1.3+b*.52,.8], rightTip=[2.26-t*1.22,1.08+b*.25,.8];
  let leftStart=[-3.15,1.1,.8],leftElbow=[-2.48,1.25+b*.5,.8],leftTip=[-2.27+t*1.22,1+b*.24,.8];
  const coil=Array.from({length:36},(_,i)=>{let a=i/35*Math.PI*6;return [3.06+.11*Math.cos(a),1.06+.11*Math.sin(a),1.15+i/35*.32]});
  return <group>
    <Block position={[3.06,1.06,1.3]} size={[.43,.43,.53]} color="#294b5a" transparent opacity={.6}/>
    <Tube points={coil} color={C.electric} radius={.018}/>
    <Label position={[3.1,1.67,1.36]} size={.12}>RETRACTING WIRE REEL</Label>
    <Tube points={[rightStart,rightElbow,rightTip]} color={C.frame} radius={.078}/>
    <Tube points={[leftStart,leftElbow,leftTip]} color={C.frame} radius={.078}/>
    {[rightElbow,leftElbow].map((p,i)=><Joint key={i} position={p} r={.12}/>)}
    {[rightTip,leftTip].map((p,i)=><Joint key={'end'+i} position={p} color="#ffddaa" r={.06}/>)}
    <Tube points={[[3.06,1.06,1.13],[3.13,1.24,.8],rightElbow,rightTip]} color={C.electric} radius={.028}/>
    <Tube points={[[-3.5,.7,.8],[-3.16,1.1,.8],leftElbow,leftTip]} color={C.suction} radius={.03}/>
    <Ring position={rightElbow}/><Ring position={leftElbow}/>
    <Label position={[2.35,2.2,1]} size={.14}>hinged + telescoping arm</Label>
    <Label position={[-2.3,2.14,1]} size={.14}>guided flexible pipe</Label>
    <Label position={[1.1,1.7,1.23]} size={.13}>{extend<35?'WIRE RETRACTED':extend>75?'WIRE EXTENDED':'WIRE STRETCHING'}</Label>
    </group>
}
function Before(){return <group>
  {/* The cautery stays on its table, fed by a tangled lead rising from the floor. */}
  <Tube points={[[3.4,.1,.75],[2.92,.075,1.02],[2.48,.075,.69],[2.76,.075,.32],[3.02,.075,.7],[2.51,.075,1.03],[2.02,.075,.65],[1.9,.075,-.15],[1.62,.18,-.48],[1.36,.94,-.66]]} color={C.electric} radius={.025}/>
  <Label position={[2.52,.34,1.15]} size={.13} color="#ffd693">TANGLED CAUTERY WIRE</Label>
  {[
  [[-3.5,.8,-1.4],[-2,.07,1.4],[-.6,1.12,-.85]],
  [[-3.55,1.91,-1.25],[-2.75,.05,-2.2],[-1.2,.05,1.6],[.7,1.1,-.5]],
  [[3.4,.5,.75],[2,.06,1.8],[.7,1.1,.3]],
  [[-3.5,.45,.8],[-2.4,.05,2],[-.8,1.12,.3]]
].map((p,i)=><Tube key={i} points={p} color={i===3?C.suction:'#ec9b82'} radius={.027}/>)}<Label position={[0,.19,2.6]} color="#ffad98" size={.18}>LOOSE WIRES / PIPES</Label></group>}
function Scene({tab,extend,bend,open}){
  let all=tab==='overview';
  return <><color attach="background" args={['#0e2532']}/><ambientLight intensity={1.1}/><directionalLight position={[3,7,5]} intensity={2.2} castShadow shadow-mapSize={[1024,1024]}/>
    <Room floorOpen={open}/><Table before={tab==='before'}/><Machines before={tab==='before'}/>
    {tab==='before'&&<Before/>}{(all||tab==='bluetooth')&&<Bluetooth/>}{(all||tab==='ceiling')&&<Ceiling/>}{(all||tab==='floor')&&<Floor open={open}/>}{(all||tab==='folding')&&<Folding extend={extend} bend={bend}/>}
    <OrbitControls makeDefault minDistance={5.5} maxDistance={18} maxPolarAngle={Math.PI/2.05} target={[0,1,0]}/>
  </>;
}
function App(){const [tab,setTab]=useState('overview'),[extend,setExtend]=useState(55),[bend,setBend]=useState(45),[open,setOpen]=useState(false),[animating,setAnimating]=useState(false);
 useEffect(()=>{if(!animating)return;let direction=1;const timer=setInterval(()=>setExtend(v=>{let next=v+direction*2.5;if(next>=100){direction=-1;next=100}if(next<=0){direction=1;next=0}return next}),35);return()=>clearInterval(timer)},[animating]);
 const copy={before:'Original loose cables and pipes, with all referenced OT instruments and staff visible.',overview:'All four proposed systems around a patient and two doctors. Select a system to inspect it alone.',folding:'Play the motion or move the sliders to show the cable leaving the reel, stretching, bending at the hinge and returning.',bluetooth:'ECG, SpO₂ and BP readings appear on the monitor attached to the anaesthesia workstation. Patient sensors still need contact; the breathing pipe remains physical.',ceiling:'The pendant positions dedicated outlets above the table for easy local connection.',floor:'Open the access panel to reveal separate service runs and junction points. Sockets near the table connect devices locally.'};
 return <><header><strong><span>OT</span> / 3D systems</strong><span className="badge">Interactive concept model</span></header><main><div className="top"><h1>Operating theatre service design</h1><p>Rotate the room and inspect each system separately.</p></div><nav aria-label="Systems">{tabs.map(([id,title])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}>{title}</button>)}</nav><div className="layout"><section className="model"><Canvas shadows camera={{position:[7,6,8],fov:42}}><Scene tab={tab} extend={extend} bend={bend} open={open}/></Canvas><div className="viewport-hint">Drag to rotate · scroll to zoom</div></section><aside><h2>{tabs.find(([id])=>id===tab)[1]}</h2><p>{copy[tab]}</p>{(tab==='folding'||tab==='overview')&&<><button className="action" onClick={()=>setAnimating(v=>!v)}>{animating?'Pause wire motion':'Play extend / retract'}</button><label>Extend support <output>{extend}%</output><input aria-label="Extend support" type="range" min="0" max="100" value={extend} onChange={e=>{setAnimating(false);setExtend(+e.target.value)}}/></label><label>Bend at hinge <output>{bend}%</output><input aria-label="Bend at hinge" type="range" min="0" max="100" value={bend} onChange={e=>setBend(+e.target.value)}/></label></>}{(tab==='floor'||tab==='overview')&&<button className="action" onClick={()=>setOpen(v=>!v)}>{open?'Close floor panel':'Open floor panel'}</button>}<div className="legend">{Object.entries(C).filter(([k])=>k!=='frame').map(([name,col])=><div key={name}><i style={{background:col}}/>{name}</div>)}</div></aside></div><footer><strong>Concept for discussion.</strong> Clinical engineering must approve alarm reliability, Bluetooth interoperability, electrical separation, medical gas and suction routing, infection control, clean water and tissue/fluid waste pathways, access panel sealing, and service schedules. The suggested 5–10 operations review interval is unvalidated. This model is not a CAD installation drawing.</footer></main></>;
}

createRoot(document.getElementById('root')).render(<App/>);
