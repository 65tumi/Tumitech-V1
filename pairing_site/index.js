
// server.js - minimal backend for WhatsApp bot pairing
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory store (replace with database in production)
let pairings = [];

// POST /pair - create new pairing
app.post('/pair', (req,res)=>{
  const { phone, code } = req.body;
  if(!phone || !code){
    return res.status(400).json({error:"phone and code required"});
  }
  pairings.push({ phone, code, paired:false, created:Date.now() });
  res.json({ success:true });
});

// POST /mark - mark a pairing as completed
app.post('/mark', (req,res)=>{
  const { code } = req.body;
  const found = pairings.find(p=>p.code === code);
  if(found){
    found.paired = true;
    found.pairedAt = Date.now();
    return res.json({ success:true });
  }
  res.status(404).json({error:"code not found"});
});

// GET /verify/:code - check if code is valid and status
app.get('/verify/:code', (req,res)=>{
  const code = req.params.code;
  const found = pairings.find(p=>p.code === code);
  if(!found){
    return res.status(404).json({ valid:false });
  }
  res.json({ valid:true, phone:found.phone, paired:found.paired });
});

// List all (for debugging)
app.get('/all', (req,res)=>{
  res.json(pairings);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log('TUMITECH V1 Pairing server running on port', PORT);
});
