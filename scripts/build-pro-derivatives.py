"""Build 50 selected futures benchmarks from reviewed CME and Eurex observations.
September 2026 ADV and month-end OI are converted to USD principal/face or
reference-price equivalents. This is not a global top-50 or actual dollar ADV.
"""
import re,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]

def parse(path):
 out={};group=''
 for line in Path(path).read_text().splitlines():
  if line.endswith(' Futures') and not re.search(r'\d',line):group=line
  if line.endswith(' Options') or line.startswith('TOTAL '):group=''
  m=re.match(r'^(.*?)\s+(\d[\d,]*(?:\.\d+)?)\s+\d[\d,.]*\s+(?:-?\d[^ ]*%|-)\s+',line)
  if m and 'Futures' in group:out.setdefault(m[1],int(float(m[2].replace(',',''))))
 return out
observations=json.loads((root/'scripts/pro-derivatives-observations.json').read_text())['observations']
adv={k:v['adv'] for k,v in observations.items()};oi={k:v['oi'] for k,v in observations.items()}
# report name | displayed name | symbol | asset class | unit count | USD reference per unit | reference expiry
raw='''SOFR|3-Month SOFR|SR3|Rates|1000000|1|Principal
FED FUND|30-Day Federal Funds|ZQ|Rates|5000000|1|Principal
10-YR NOTE|10-Year Treasury Note|ZN|Rates|100000|1|Face value
2-YR NOTE|2-Year Treasury Note|ZT|Rates|200000|1|Face value
5-YR NOTE|5-Year Treasury Note|ZF|Rates|100000|1|Face value
30-YR BOND|Treasury Bond|ZB|Rates|100000|1|Face value
Ultra 10-Year Note|Ultra 10-Year Treasury Note|TN|Rates|100000|1|Face value
ULTRA T-BOND|Ultra Treasury Bond|UB|Rates|100000|1|Face value
10-YR Eris SOFR|10-Year Eris SOFR Swap|YIY|Rates|100000|1|Principal
5-YR Eris SOFR|5-Year Eris SOFR Swap|YIW|Rates|100000|1|Principal
EURO FX|EUR/USD|6E|FX|125000|1.12485|Dec 2026
JAPANESE YEN|JPY/USD|6J|FX|12500000|0.0063445|Dec 2026
BRITISH POUND|GBP/USD|6B|FX|62500|1.3386|Dec 2026
AUSTRALIAN DOLLAR|AUD/USD|6A|FX|100000|0.7017|Dec 2026
CANADIAN DOLLAR|CAD/USD|6C|FX|100000|0.7135|Dec 2026
MEXICAN PESO|MXN/USD|6M|FX|500000|0.05321|Dec 2026
SWISS FRANC|CHF/USD|6S|FX|125000|1.2192|Dec 2026
NEW ZEALND DOLLAR|NZD/USD|6N|FX|100000|0.57025|Dec 2026
BRAZIL REAL|BRL/USD|6L|FX|100000|0.19725|Dec 2026
E-MINI S&P500|E-mini S&P 500|ES|Equity index|50|7800.25|Dec 2026
E-MINI NASDAQ 100|E-mini Nasdaq-100|NQ|Equity index|20|30007|Dec 2026
MICRO E-MINI NASDAQ 100|Micro E-mini Nasdaq-100|MNQ|Equity index|2|30007|Dec 2026
MICRO E-MINI S&P500|Micro E-mini S&P 500|MES|Equity index|5|7800.25|Dec 2026
E-MINI RUSSELL 2000|E-mini Russell 2000|RTY|Equity index|50|2794.2|Dec 2026
MICRO E-MINI RUSSELL 2000|Micro E-mini Russell 2000|M2K|Equity index|5|2794.2|Dec 2026
E-mini ($5) Dow|E-mini Dow|YM|Equity index|5|53059|Dec 2026
MICRO MINI $5 DOW|Micro E-mini Dow|MYM|Equity index|0.5|53059|Dec 2026
COMEX GOLD|Gold|GC|Metals|100|4150|Dec 2026
MICRO GOLD|Micro Gold|MGC|Metals|10|4150|Dec 2026
COMEX E-Mini GOLD|E-mini Gold|QO|Metals|50|4150|Dec 2026
COMEX SILVER|Silver|SI|Metals|5000|57.71|Dec 2026
SILVER|Micro Silver|SIL|Metals|1000|57.71|Dec 2026
COMEX COPPER|Copper|HG|Metals|25000|6.5795|Dec 2026
COPPER|Micro Copper|MHG|Metals|2500|6.5795|Dec 2026
NYMEX PLATINUM|Platinum|PL|Metals|50|1635.9|Jan 2027
CRUDE OIL PHY|WTI Crude Oil|CL|Energy|1000|97.15|Dec 2026
NATURAL GAS PHY|Henry Hub Natural Gas|NG|Energy|10000|3.182|Dec 2026
HEATING OIL PHY|NY Harbor ULSD|HO|Energy|42000|4.7633|Nov 2026
RBOB PHY|RBOB Gasoline|RB|Energy|42000|3.039|Dec 2026
CORN|Corn|ZC|Agriculture|5000|4.6325|Dec 2026
SOYBEAN|Soybeans|ZS|Agriculture|5000|12.4525|Nov 2026
SOYBEAN MEAL|Soybean Meal|ZM|Agriculture|100|348.3|Dec 2026
SOYBEAN OIL|Soybean Oil|ZL|Agriculture|60000|0.6597|Dec 2026
CHI WHEAT|Chicago SRW Wheat|ZW|Agriculture|5000|6.2825|Dec 2026
OATS|Oats|ZO|Agriculture|5000|3.8075|Dec 2026
CATTLE|Live Cattle|LE|Agriculture|40000|2.3112|Dec 2026
FEEDER CATTLE|Feeder Cattle|GF|Agriculture|50000|3.4882|Nov 2026
HOGS|Lean Hogs|HE|Agriculture|40000|0.6572|Dec 2026
MINI CORN|Mini Corn|XC|Agriculture|1000|4.6325|Dec 2026
MINI SOYBEAN|Mini Soybeans|XK|Agriculture|1000|12.4525|Nov 2026'''
rows=[]
excluded={'M2K','6L','QO','MHG','XK','ZO','XC','YIW'}
for line in raw.splitlines():
 report,name,symbol,asset,mult,price,expiry=line.split('|')
 if symbol in excluded:continue
 assert report in adv,(report,'missing ADV')
 assert report in oi,(report,'missing OI')
 unit=float(mult)*float(price)
 rows.append(dict(name=name,symbol=symbol,asset=asset,venue='CME Group',advContracts=adv[report],oiContracts=oi[report],referenceUnitUSD=unit,multiplier=float(mult),referencePriceUSD=float(price),referenceExpiry=expiry,advB=adv[report]*unit/1e9,oiB=oi[report]*unit/1e9,reportLabel=report,conversion='principal / face value' if asset=='Rates' else 'quantity × reference settlement'))
eurex=json.loads((root/'scripts/eurex-derivatives-observations.json').read_text())
assert eurex['period']=='September 2026' and eurex['oiDate']=='2026-09-30'
assert eurex['tradingDays']==22 and len(eurex['observations'])==8
for symbol,o in eurex['observations'].items():
 assert abs(o['advContracts']-o['monthlyContracts']/eurex['tradingDays'])<0.001
 # FEU3/FST3: EUR 2,500 per index point implies EUR 25 per bp,
 # equivalent to 3 months of interest on EUR 1m principal.
 unit=o['principalEUR']*eurex['eurUsd']
 rows.append(dict(name=o['name'],symbol=symbol,asset='Rates',venue='Eurex',advContracts=o['advContracts'],oiContracts=o['oiContracts'],referenceUnitUSD=unit,multiplier=o['principalEUR'],referencePriceUSD=eurex['eurUsd'],referenceExpiry='Principal / face value',advB=o['monthlyContracts']/eurex['tradingDays']*unit/1e9,oiB=o['oiContracts']*unit/1e9,reportLabel=symbol,conversion='EUR principal / face value × 30 Sep 2026 EUR/USD'))
assert len(rows)==50 and len(set(r['symbol'] for r in rows))==50
rows.sort(key=lambda x:-x['advB'])
for i,r in enumerate(rows,1):r['rank']=i
meta={'period':'September 2026','oiDate':'2026-09-30','referencePriceDate':'2026-10-21','retrieved':'2026-10-23','scope':'50 selected CME Group and Eurex futures, including eight euro rates contracts. Ranked within this covered universe, not a global top-50. Excludes OTC, options and ICE.','method':'USD B reference notional = contract ADV or month-end OI × reference unit USD / 1e9. CME non-rates use 21 Oct 2026 reference settlements; CME rates and Eurex rates use contract principal or face value. Eurex FEU3/FST3 use EUR 1m equivalent principal, derived from the EUR 2,500-per-index-point specification (EUR 25 per bp for a three-month period). Eurex ADV = September monthly traded contracts / 22 Eurex trading days; 1 Oct daily file previous-day OI gives 30 Sep OI. EUR amounts use the 30 Sep 2026 ECB reference rate of 1 EUR = 1.1355 USD. These are reference-price/principal equivalents, not observed time-weighted dollar ADV, market value, DV01 or delta-adjusted exposure.','sources':{'adv':'https://www.cmegroup.com/daily_bulletin/monthly_volume/Web_ADV_Report_CMEG.pdf','oi':'https://www.cmegroup.com/daily_bulletin/monthly_volume/Web_OI_Report_CMEG.pdf','settlements':'https://www.cmegroup.com/market-data/daily-bulletin.html','specifications':'https://www.cmegroup.com/markets/products.html','eurexAdv':eurex['sources']['adv'],'eurexOi':eurex['sources']['oi'],'eurexSpecs':eurex['sources']['specifications'],'eurexStirSpecs':eurex['sources']['stirSpecifications'],'eurUsd':eurex['sources']['eurUsd']},'rows':rows}
(root/'pro-derivatives-data.js').write_text('/* Reviewed exchange observations and explicit reference-notional conversions. */\nwindow.PRO_DERIVATIVES = '+json.dumps(meta,indent=2)+';\n')
(root/'pro-derivatives-data.json').write_text(json.dumps(meta,indent=2)+'\n')
print('Built',len(rows),'unique futures; matched ADV and OI. Top five:')
for r in rows[:5]:print(r['symbol'],r['advContracts'],r['oiContracts'],round(r['advB'],3),round(r['oiB'],3))
