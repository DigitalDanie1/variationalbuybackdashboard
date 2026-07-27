(async function(){
  try{
    const res = await fetch("/app", { cache: "no-store" });
    if(!res.ok) throw new Error("Dashboard load failed");
    const html = await res.text();
    document.open();
    document.write(html);
    document.close();
  }catch(err){
    const link = document.querySelector("a[href='/app']");
    if(link) link.textContent = "Open dashboard";
  }
})();
