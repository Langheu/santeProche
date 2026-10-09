const {execFileSync}=require('node:child_process');
const output=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',stdio:['pipe','pipe','pipe']});
const credentials=Object.fromEntries(output.trim().split('\n').map(line=>{const i=line.indexOf('=');return[line.slice(0,i),line.slice(i+1)];}));
const root='https://api.github.com/repos/Langheu/santeProche';
async function api(path,method='GET',body){const response=await fetch(root+path,{method,headers:{Authorization:'Bearer '+credentials.password,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'SanteProche-publisher'},...(body?{body:JSON.stringify(body)}:{})});const data=await response.json().catch(()=>null);return{status:response.status,data};}
(async()=>{
  const mode=process.argv[2]||'inspect';
  if(mode==='inspect'){
    const repo=await api(''),pages=await api('/pages');
    console.log(JSON.stringify({repository:{status:repo.status,private:repo.data?.private,default_branch:repo.data?.default_branch,permissions:repo.data?.permissions},pages:{status:pages.status,url:pages.data?.html_url,build_type:pages.data?.build_type,source:pages.data?.source,message:pages.data?.message}}));
  }else if(mode==='enable'){
    const old=await api('/pages');const result=await api('/pages',old.status===404?'POST':'PUT',{build_type:'legacy',source:{branch:'gh-pages',path:'/'}});
    console.log(JSON.stringify({status:result.status,url:result.data?.html_url,message:result.data?.message}));if(result.status>=400)process.exitCode=1;
  }else if(mode==='build'){
    const result=await api('/pages/builds','POST');
    console.log(JSON.stringify({status:result.status,build:result.data?.status,message:result.data?.message}));if(result.status>=400)process.exitCode=1;
  }else if(mode==='status'){
    const page=await api('/pages'),latest=await api('/pages/builds/latest');
    console.log(JSON.stringify({pages_status:page.status,url:page.data?.html_url,status:page.data?.status,build:latest.data?.status,error:latest.data?.error?.message,commit:latest.data?.commit}));
  }
})().catch(()=>{console.error('Impossible de communiquer avec GitHub.');process.exitCode=1;});
