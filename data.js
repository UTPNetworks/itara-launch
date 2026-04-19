// Shared marketplace data for the Itara homepage prototype
window.ITARA_DATA = (() => {
  const GPUS = [
    { model: 'H100 SXM5', vram: '80GB', price: 2.49, region: 'US-East', provider: 'NovaCompute', availability: 'NOW' },
    { model: 'H100 PCIe', vram: '80GB', price: 2.19, region: 'EU-West', provider: 'Helios Labs', availability: 'NOW' },
    { model: 'A100', vram: '40GB', price: 1.29, region: 'US-West', provider: 'TensorYard', availability: 'NOW' },
    { model: 'A100 SXM', vram: '80GB', price: 1.79, region: 'SG', provider: 'BorealisAI', availability: 'NOW' },
    { model: 'RTX 4090', vram: '24GB', price: 0.39, region: 'US-East', provider: 'GPUshare', availability: 'NOW' },
    { model: 'RTX 4090', vram: '24GB', price: 0.42, region: 'EU-North', provider: 'Fjord', availability: 'NOW' },
    { model: 'RTX 6000 Ada', vram: '48GB', price: 0.89, region: 'US-Central', provider: 'Monolith', availability: 'NOW' },
    { model: 'L40S', vram: '48GB', price: 1.05, region: 'JP', provider: 'KiraGPU', availability: 'NOW' },
    { model: 'MI300X', vram: '192GB', price: 3.19, region: 'US-West', provider: 'ReefCompute', availability: 'Q' },
    { model: 'H200', vram: '141GB', price: 4.49, region: 'US-East', provider: 'NovaCompute', availability: 'Q' },
    { model: 'B200', vram: '180GB', price: 5.79, region: 'US-East', provider: 'Helios Labs', availability: 'Q' },
    { model: 'RTX 3090', vram: '24GB', price: 0.24, region: 'EU-West', provider: 'GPUshare', availability: 'NOW' },
  ];

  const MODELS = [
    { name: 'Orion-70B-Instruct', kind: 'LLM', seller: 'deepcore', price: 149, sales: 2142, tag: 'FINE-TUNED' },
    { name: 'StableLaw-v3', kind: 'LLM', seller: 'juris.ai', price: 299, sales: 814, tag: 'DOMAIN' },
    { name: 'Midas-VL', kind: 'Vision', seller: 'obscura', price: 89, sales: 5412, tag: 'MULTI-MODAL' },
    { name: 'KaliCode-34B', kind: 'Code', seller: 'sigma labs', price: 199, sales: 3280, tag: 'CODE' },
    { name: 'VoxSuno-Fine', kind: 'Audio', seller: 'wavelab', price: 59, sales: 9102, tag: 'AUDIO' },
    { name: 'Phoenix-Agent', kind: 'Agent', seller: 'agentworks', price: 349, sales: 612, tag: 'AGENT' },
  ];

  const TASKS = [
    { title: 'Fine-tune Llama-3 on 12GB legal corpus', budget: 4200, skills: ['PyTorch', 'LoRA', 'DPO'], eta: '7d', bids: 14 },
    { title: 'Build autonomous research agent (LangGraph)', budget: 8500, skills: ['LangGraph', 'RAG'], eta: '14d', bids: 22 },
    { title: 'Ship voice cloning API + demo', budget: 3100, skills: ['TTS', 'FastAPI'], eta: '10d', bids: 9 },
    { title: 'Compute vision pipeline for drone footage', budget: 6400, skills: ['YOLO', 'OpenCV'], eta: '21d', bids: 31 },
    { title: 'Migrate inference from AWS to on-prem H100', budget: 9800, skills: ['vLLM', 'Triton'], eta: '30d', bids: 7 },
  ];

  const FIRST = ['Maya','Aditya','Lin','Yusuf','Sofia','Kai','Jonas','Priya','Tariq','Eve','Noa','Idris','Sana','Ravi','Zoe','Mika'];
  const LAST = ['Chen','Patel','Okafor','Singh','Romero','Park','Novak','Rahman','Torres','Kim','Almeida','Sato','Diallo','Petrov'];
  const randName = () => `${FIRST[Math.floor(Math.random()*FIRST.length)]} ${LAST[Math.floor(Math.random()*LAST.length)][0]}.`;

  const ACTIVITY_TEMPLATES = [
    () => ({ kind:'rent', text:`rented ${pick(GPUS).model} × ${1+Math.floor(Math.random()*4)}`, by: randName() }),
    () => ({ kind:'sale', text:`sold ${pick(MODELS).name}`, by: randName(), amt: 49+Math.floor(Math.random()*350) }),
    () => ({ kind:'bid', text:`bid on ${pick(TASKS).title.slice(0,34)}…`, by: randName() }),
    () => ({ kind:'list', text:`listed ${pick(GPUS).model} cluster`, by: randName() }),
    () => ({ kind:'escrow', text:`escrow released — task complete`, by: randName(), amt: 420+Math.floor(Math.random()*8000) }),
    () => ({ kind:'hire', text:`hired AI specialist`, by: randName(), amt: 1200+Math.floor(Math.random()*6000) }),
  ];
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function genActivity(){ return ACTIVITY_TEMPLATES[Math.floor(Math.random()*ACTIVITY_TEMPLATES.length)](); }

  return { GPUS, MODELS, TASKS, genActivity, pick };
})();
