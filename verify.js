const zlib = require('zlib');

// Build a fake decompressed Secure-QR payload:
// indicator '3' (email+mobile) , then 15 delimited text fields, delimiter after vtc, photo, +64 hash +256 sig
const FF = 0xFF;
const enc = s => Buffer.from(s, 'utf-8');
const fields = ['3','12349999TS','RAJESH KUMAR','01-01-1990','M','S/O RAM',
  'PUNE','NEAR PARK','H-42','KOTHRUD','411038','KOTHRUD PO',
  'MAHARASHTRA','MG ROAD','PUNE CITY','PUNE VTC'];
let parts=[];
fields.forEach((f,i)=>{ parts.push(enc(f)); parts.push(Buffer.from([FF])); });
// photo: fake JPEG (FFD8 ... FFD9)
const photo = Buffer.from([0xFF,0xD8,0x01,0x02,0x03,0xFF,0xD9]);
const emailHash = Buffer.alloc(32,7);
const mobileHash = Buffer.alloc(32,9);
const sig = Buffer.alloc(256,5);
const decompressed = Buffer.concat([...parts, photo, emailHash, mobileHash, sig]);
const gz = zlib.gzipSync(decompressed);
// to big integer decimal string
let big = BigInt('0x'+gz.toString('hex'));
const qrText = big.toString(10);

// ---- replicate app decode logic ----
function decodeSecureQr(bigIntStr){
  let n=BigInt(bigIntStr); let hex=n.toString(16); if(hex.length%2)hex='0'+hex;
  const raw=Buffer.from(hex,'hex');
  const bytes=zlib.gunzipSync(raw); // == pako.ungzip
  const delim=[-1]; for(let i=0;i<bytes.length;i++) if(bytes[i]===255) delim.push(i);
  const fl=['emailMobileIndicator','referenceId','name','dob','gender','careof','district','landmark','house','location','pincode','postoffice','state','street','subdistrict','vtc'];
  const f={}; for(let i=0;i<fl.length;i++) f[fl[i]]=bytes.slice(delim[i]+1,delim[i+1]).toString('utf-8').trim();
  const ind=f.emailMobileIndicator; let hb=0; if(ind==='1'||ind==='2')hb=32; else if(ind==='3')hb=64;
  const ps=delim[fl.length]+1, pe=bytes.length-256-hb;
  const ph=bytes.slice(ps,pe);
  return {f, photo:ph};
}
const out=decodeSecureQr(qrText);
console.log('name        =', out.f.name);
console.log('dob         =', out.f.dob);
console.log('gender      =', out.f.gender);
console.log('last4       =', out.f.referenceId.slice(0,4));
console.log('vtc         =', out.f.vtc);
console.log('state       =', out.f.state);
console.log('photo bytes =', out.photo.length, '(expected 7)');
console.log('photo isJPEG=', out.photo[0]===0xFF && out.photo[1]===0xD8);
console.log('PASS =', out.f.name==='RAJESH KUMAR' && out.f.vtc==='PUNE VTC' && out.photo.length===7 && out.f.referenceId.slice(0,4)==='1234');
