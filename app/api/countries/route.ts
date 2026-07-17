import { NextResponse } from 'next/server';

// API v3.1 (no la legacy)
const API_URL = 'https://restcountries.com/v3.1/all?fields=cca2,name,region,flags,translations';

// Fallback completo — se usa si la API no responde
const FALLBACK: Record<string, unknown>[] = [
  { cca2:'PE', region:'Americas', name:{common:'Peru'},           translations:{spa:{common:'Perú'},           por:{common:'Peru'},      fra:{common:'Pérou'},       deu:{common:'Peru'},           ita:{common:'Perù'},        jpn:{common:'ペルー'},        kor:{common:'페루'},       zho:{common:'秘鲁'}}},
  { cca2:'MX', region:'Americas', name:{common:'Mexico'},          translations:{spa:{common:'México'},         por:{common:'México'},    fra:{common:'Mexique'},     deu:{common:'Mexiko'},         ita:{common:'Messico'},     jpn:{common:'メキシコ'},      kor:{common:'멕시코'},     zho:{common:'墨西哥'}}},
  { cca2:'AR', region:'Americas', name:{common:'Argentina'},       translations:{spa:{common:'Argentina'},      por:{common:'Argentina'}, fra:{common:'Argentine'},   deu:{common:'Argentinien'},    ita:{common:'Argentina'},   jpn:{common:'アルゼンチン'}, kor:{common:'아르헨티나'}, zho:{common:'阿根廷'}}},
  { cca2:'CO', region:'Americas', name:{common:'Colombia'},        translations:{spa:{common:'Colombia'},       por:{common:'Colômbia'},  fra:{common:'Colombie'},    deu:{common:'Kolumbien'},      ita:{common:'Colombia'},    jpn:{common:'コロンビア'},   kor:{common:'콜롬비아'},   zho:{common:'哥伦比亚'}}},
  { cca2:'CL', region:'Americas', name:{common:'Chile'},           translations:{spa:{common:'Chile'},          por:{common:'Chile'},     fra:{common:'Chili'},       deu:{common:'Chile'},          ita:{common:'Cile'},        jpn:{common:'チリ'},          kor:{common:'칠레'},       zho:{common:'智利'}}},
  { cca2:'VE', region:'Americas', name:{common:'Venezuela'},       translations:{spa:{common:'Venezuela'},      por:{common:'Venezuela'}, fra:{common:'Venezuela'},   deu:{common:'Venezuela'},      ita:{common:'Venezuela'},   jpn:{common:'ベネズエラ'},   kor:{common:'베네수엘라'}, zho:{common:'委内瑞拉'}}},
  { cca2:'EC', region:'Americas', name:{common:'Ecuador'},         translations:{spa:{common:'Ecuador'},        por:{common:'Equador'},   fra:{common:'Équateur'},    deu:{common:'Ecuador'},        ita:{common:'Ecuador'},     jpn:{common:'エクアドル'},   kor:{common:'에콰도르'},   zho:{common:'厄瓜多尔'}}},
  { cca2:'CR', region:'Americas', name:{common:'Costa Rica'},      translations:{spa:{common:'Costa Rica'},     por:{common:'Costa Rica'},fra:{common:'Costa Rica'},  deu:{common:'Costa Rica'},     ita:{common:'Costa Rica'},  jpn:{common:'コスタリカ'},   kor:{common:'코스타리카'}, zho:{common:'哥斯达黎加'}}},
  { cca2:'GT', region:'Americas', name:{common:'Guatemala'},       translations:{spa:{common:'Guatemala'},      por:{common:'Guatemala'}, fra:{common:'Guatemala'},   deu:{common:'Guatemala'},      ita:{common:'Guatemala'},   jpn:{common:'グアテマラ'},   kor:{common:'과테말라'},   zho:{common:'危地马拉'}}},
  { cca2:'BO', region:'Americas', name:{common:'Bolivia'},         translations:{spa:{common:'Bolivia'},        por:{common:'Bolívia'},   fra:{common:'Bolivie'},     deu:{common:'Bolivien'},       ita:{common:'Bolivia'},     jpn:{common:'ボリビア'},      kor:{common:'볼리비아'},   zho:{common:'玻利维亚'}}},
  { cca2:'BR', region:'Americas', name:{common:'Brazil'},          translations:{spa:{common:'Brasil'},         por:{common:'Brasil'},    fra:{common:'Brésil'},      deu:{common:'Brasilien'},      ita:{common:'Brasile'},     jpn:{common:'ブラジル'},      kor:{common:'브라질'},     zho:{common:'巴西'}}},
  { cca2:'CA', region:'Americas', name:{common:'Canada'},          translations:{spa:{common:'Canadá'},         por:{common:'Canadá'},    fra:{common:'Canada'},      deu:{common:'Kanada'},         ita:{common:'Canada'},      jpn:{common:'カナダ'},        kor:{common:'캐나다'},     zho:{common:'加拿大'}}},
  { cca2:'CU', region:'Americas', name:{common:'Cuba'},            translations:{spa:{common:'Cuba'},           por:{common:'Cuba'},      fra:{common:'Cuba'},        deu:{common:'Kuba'},           ita:{common:'Cuba'},        jpn:{common:'キューバ'},      kor:{common:'쿠바'},       zho:{common:'古巴'}}},
  { cca2:'SV', region:'Americas', name:{common:'El Salvador'},     translations:{spa:{common:'El Salvador'},    por:{common:'El Salvador'},fra:{common:'Salvador'},   deu:{common:'El Salvador'},    ita:{common:'El Salvador'}, jpn:{common:'エルサルバドル'},kor:{common:'엘살바도르'}, zho:{common:'萨尔瓦多'}}},
  { cca2:'US', region:'Americas', name:{common:'United States'},   translations:{spa:{common:'Estados Unidos'}, por:{common:'Estados Unidos'},fra:{common:'États-Unis'},deu:{common:'Vereinigte Staaten'},ita:{common:'Stati Uniti'},jpn:{common:'アメリカ合衆国'},kor:{common:'미국'},     zho:{common:'美国'}}},
  { cca2:'HN', region:'Americas', name:{common:'Honduras'},        translations:{spa:{common:'Honduras'},       por:{common:'Honduras'},  fra:{common:'Honduras'},    deu:{common:'Honduras'},       ita:{common:'Honduras'},    jpn:{common:'ホンジュラス'},  kor:{common:'온두라스'},   zho:{common:'洪都拉斯'}}},
  { cca2:'NI', region:'Americas', name:{common:'Nicaragua'},       translations:{spa:{common:'Nicaragua'},      por:{common:'Nicarágua'}, fra:{common:'Nicaragua'},   deu:{common:'Nicaragua'},      ita:{common:'Nicaragua'},   jpn:{common:'ニカラグア'},   kor:{common:'니카라과'},   zho:{common:'尼加拉瓜'}}},
  { cca2:'PA', region:'Americas', name:{common:'Panama'},          translations:{spa:{common:'Panamá'},         por:{common:'Panamá'},    fra:{common:'Panama'},      deu:{common:'Panama'},         ita:{common:'Panama'},      jpn:{common:'パナマ'},        kor:{common:'파나마'},     zho:{common:'巴拿马'}}},
  { cca2:'PY', region:'Americas', name:{common:'Paraguay'},        translations:{spa:{common:'Paraguay'},       por:{common:'Paraguai'},  fra:{common:'Paraguay'},    deu:{common:'Paraguay'},       ita:{common:'Paraguay'},    jpn:{common:'パラグアイ'},   kor:{common:'파라과이'},   zho:{common:'巴拉圭'}}},
  { cca2:'DO', region:'Americas', name:{common:'Dominican Republic'},translations:{spa:{common:'República Dominicana'},por:{common:'República Dominicana'},fra:{common:'République dominicaine'},deu:{common:'Dominikanische Republik'},ita:{common:'Repubblica Dominicana'},jpn:{common:'ドミニカ共和国'},kor:{common:'도미니카 공화국'},zho:{common:'多明尼加'}}},
  { cca2:'UY', region:'Americas', name:{common:'Uruguay'},         translations:{spa:{common:'Uruguay'},        por:{common:'Uruguai'},   fra:{common:'Uruguay'},     deu:{common:'Uruguay'},        ita:{common:'Uruguay'},     jpn:{common:'ウルグアイ'},   kor:{common:'우루과이'},   zho:{common:'乌拉圭'}}},
  { cca2:'ES', region:'Europe',   name:{common:'Spain'},           translations:{spa:{common:'España'},         por:{common:'Espanha'},   fra:{common:'Espagne'},     deu:{common:'Spanien'},        ita:{common:'Spagna'},      jpn:{common:'スペイン'},      kor:{common:'스페인'},     zho:{common:'西班牙'}}},
  { cca2:'DE', region:'Europe',   name:{common:'Germany'},         translations:{spa:{common:'Alemania'},       por:{common:'Alemanha'},  fra:{common:'Allemagne'},   deu:{common:'Deutschland'},    ita:{common:'Germania'},    jpn:{common:'ドイツ'},        kor:{common:'독일'},       zho:{common:'德国'}}},
  { cca2:'FR', region:'Europe',   name:{common:'France'},          translations:{spa:{common:'Francia'},        por:{common:'France'},    fra:{common:'France'},      deu:{common:'Frankreich'},     ita:{common:'Francia'},     jpn:{common:'フランス'},      kor:{common:'프랑스'},     zho:{common:'法国'}}},
  { cca2:'IT', region:'Europe',   name:{common:'Italy'},           translations:{spa:{common:'Italia'},         por:{common:'Itália'},    fra:{common:'Italie'},      deu:{common:'Italien'},        ita:{common:'Italia'},      jpn:{common:'イタリア'},      kor:{common:'이탈리아'},   zho:{common:'意大利'}}},
  { cca2:'GB', region:'Europe',   name:{common:'United Kingdom'},  translations:{spa:{common:'Reino Unido'},    por:{common:'Reino Unido'},fra:{common:'Royaume-Uni'},deu:{common:'Vereinigtes Königreich'},ita:{common:'Regno Unito'},jpn:{common:'イギリス'},    kor:{common:'영국'},       zho:{common:'英国'}}},
  { cca2:'PT', region:'Europe',   name:{common:'Portugal'},        translations:{spa:{common:'Portugal'},       por:{common:'Portugal'},  fra:{common:'Portugal'},    deu:{common:'Portugal'},       ita:{common:'Portogallo'},  jpn:{common:'ポルトガル'},   kor:{common:'포르투갈'},   zho:{common:'葡萄牙'}}},
  { cca2:'AT', region:'Europe',   name:{common:'Austria'},         translations:{spa:{common:'Austria'},        por:{common:'Áustria'},   fra:{common:'Autriche'},    deu:{common:'Österreich'},     ita:{common:'Austria'},     jpn:{common:'オーストリア'}, kor:{common:'오스트리아'}, zho:{common:'奥地利'}}},
  { cca2:'BE', region:'Europe',   name:{common:'Belgium'},         translations:{spa:{common:'Bélgica'},        por:{common:'Bélgica'},   fra:{common:'Belgique'},    deu:{common:'Belgien'},        ita:{common:'Belgio'},      jpn:{common:'ベルギー'},      kor:{common:'벨기에'},     zho:{common:'比利时'}}},
  { cca2:'BG', region:'Europe',   name:{common:'Bulgaria'},        translations:{spa:{common:'Bulgaria'},       por:{common:'Bulgária'},  fra:{common:'Bulgarie'},    deu:{common:'Bulgarien'},      ita:{common:'Bulgaria'},    jpn:{common:'ブルガリア'},   kor:{common:'불가리아'},   zho:{common:'保加利亚'}}},
  { cca2:'HR', region:'Europe',   name:{common:'Croatia'},         translations:{spa:{common:'Croacia'},        por:{common:'Croácia'},   fra:{common:'Croatie'},     deu:{common:'Kroatien'},       ita:{common:'Croazia'},     jpn:{common:'クロアチア'},   kor:{common:'크로아티아'}, zho:{common:'克罗地亚'}}},
  { cca2:'DK', region:'Europe',   name:{common:'Denmark'},         translations:{spa:{common:'Dinamarca'},      por:{common:'Dinamarca'}, fra:{common:'Danemark'},    deu:{common:'Dänemark'},       ita:{common:'Danimarca'},   jpn:{common:'デンマーク'},   kor:{common:'덴마크'},     zho:{common:'丹麦'}}},
  { cca2:'FI', region:'Europe',   name:{common:'Finland'},         translations:{spa:{common:'Finlandia'},      por:{common:'Finlândia'}, fra:{common:'Finlande'},    deu:{common:'Finnland'},       ita:{common:'Finlandia'},   jpn:{common:'フィンランド'}, kor:{common:'핀란드'},     zho:{common:'芬兰'}}},
  { cca2:'GR', region:'Europe',   name:{common:'Greece'},          translations:{spa:{common:'Grecia'},         por:{common:'Grécia'},    fra:{common:'Grèce'},       deu:{common:'Griechenland'},   ita:{common:'Grecia'},      jpn:{common:'ギリシャ'},      kor:{common:'그리스'},     zho:{common:'希腊'}}},
  { cca2:'HU', region:'Europe',   name:{common:'Hungary'},         translations:{spa:{common:'Hungría'},        por:{common:'Hungria'},   fra:{common:'Hongrie'},     deu:{common:'Ungarn'},         ita:{common:'Ungheria'},    jpn:{common:'ハンガリー'},   kor:{common:'헝가리'},     zho:{common:'匈牙利'}}},
  { cca2:'IE', region:'Europe',   name:{common:'Ireland'},         translations:{spa:{common:'Irlanda'},        por:{common:'Irlanda'},   fra:{common:'Irlande'},     deu:{common:'Irland'},         ita:{common:'Irlanda'},     jpn:{common:'アイルランド'}, kor:{common:'아일랜드'},   zho:{common:'爱尔兰'}}},
  { cca2:'NL', region:'Europe',   name:{common:'Netherlands'},     translations:{spa:{common:'Países Bajos'},   por:{common:'Países Baixos'},fra:{common:'Pays-Bas'}, deu:{common:'Niederlande'},    ita:{common:'Paesi Bassi'}, jpn:{common:'オランダ'},      kor:{common:'네덜란드'},   zho:{common:'荷兰'}}},
  { cca2:'NO', region:'Europe',   name:{common:'Norway'},          translations:{spa:{common:'Noruega'},        por:{common:'Noruega'},   fra:{common:'Norvège'},     deu:{common:'Norwegen'},       ita:{common:'Norvegia'},    jpn:{common:'ノルウェー'},   kor:{common:'노르웨이'},   zho:{common:'挪威'}}},
  { cca2:'PL', region:'Europe',   name:{common:'Poland'},          translations:{spa:{common:'Polonia'},        por:{common:'Polônia'},   fra:{common:'Pologne'},     deu:{common:'Polen'},          ita:{common:'Polonia'},     jpn:{common:'ポーランド'},   kor:{common:'폴란드'},     zho:{common:'波兰'}}},
  { cca2:'RO', region:'Europe',   name:{common:'Romania'},         translations:{spa:{common:'Rumania'},        por:{common:'Romênia'},   fra:{common:'Roumanie'},    deu:{common:'Rumänien'},       ita:{common:'Romania'},     jpn:{common:'ルーマニア'},   kor:{common:'루마니아'},   zho:{common:'罗马尼亚'}}},
  { cca2:'RU', region:'Europe',   name:{common:'Russia'},          translations:{spa:{common:'Rusia'},          por:{common:'Rússia'},    fra:{common:'Russie'},      deu:{common:'Russland'},       ita:{common:'Russia'},      jpn:{common:'ロシア'},        kor:{common:'러시아'},     zho:{common:'俄罗斯'}}},
  { cca2:'SE', region:'Europe',   name:{common:'Sweden'},          translations:{spa:{common:'Suecia'},         por:{common:'Suécia'},    fra:{common:'Suède'},       deu:{common:'Schweden'},       ita:{common:'Svezia'},      jpn:{common:'スウェーデン'}, kor:{common:'스웨덴'},     zho:{common:'瑞典'}}},
  { cca2:'CH', region:'Europe',   name:{common:'Switzerland'},     translations:{spa:{common:'Suiza'},          por:{common:'Suíça'},     fra:{common:'Suisse'},      deu:{common:'Schweiz'},        ita:{common:'Svizzera'},    jpn:{common:'スイス'},        kor:{common:'스위스'},     zho:{common:'瑞士'}}},
  { cca2:'TR', region:'Asia',     name:{common:'Turkey'},          translations:{spa:{common:'Turquía'},        por:{common:'Turquia'},   fra:{common:'Turquie'},     deu:{common:'Türkei'},         ita:{common:'Turchia'},     jpn:{common:'トルコ'},        kor:{common:'터키'},       zho:{common:'土耳其'}}},
  { cca2:'JP', region:'Asia',     name:{common:'Japan'},           translations:{spa:{common:'Japón'},          por:{common:'Japão'},     fra:{common:'Japon'},       deu:{common:'Japan'},          ita:{common:'Giappone'},    jpn:{common:'日本'},          kor:{common:'일본'},       zho:{common:'日本'}}},
  { cca2:'CN', region:'Asia',     name:{common:'China'},           translations:{spa:{common:'China'},          por:{common:'China'},     fra:{common:'Chine'},       deu:{common:'China'},          ita:{common:'Cina'},        jpn:{common:'中国'},          kor:{common:'중국'},       zho:{common:'中国'}}},
  { cca2:'KR', region:'Asia',     name:{common:'South Korea'},     translations:{spa:{common:'Corea del Sur'},  por:{common:'Coreia do Sul'},fra:{common:'Corée du Sud'},deu:{common:'Südkorea'},    ita:{common:'Corea del Sud'},jpn:{common:'韓国'},         kor:{common:'대한민국'},   zho:{common:'韩国'}}},
  { cca2:'IN', region:'Asia',     name:{common:'India'},           translations:{spa:{common:'India'},          por:{common:'Índia'},     fra:{common:'Inde'},        deu:{common:'Indien'},         ita:{common:'India'},       jpn:{common:'インド'},        kor:{common:'인도'},       zho:{common:'印度'}}},
  { cca2:'ID', region:'Asia',     name:{common:'Indonesia'},       translations:{spa:{common:'Indonesia'},      por:{common:'Indonésia'}, fra:{common:'Indonésie'},   deu:{common:'Indonesien'},     ita:{common:'Indonesia'},   jpn:{common:'インドネシア'}, kor:{common:'인도네시아'}, zho:{common:'印度尼西亚'}}},
  { cca2:'PH', region:'Asia',     name:{common:'Philippines'},     translations:{spa:{common:'Filipinas'},      por:{common:'Filipinas'}, fra:{common:'Philippines'}, deu:{common:'Philippinen'},    ita:{common:'Filippine'},   jpn:{common:'フィリピン'},   kor:{common:'필리핀'},     zho:{common:'菲律宾'}}},
  { cca2:'VN', region:'Asia',     name:{common:'Vietnam'},         translations:{spa:{common:'Vietnam'},        por:{common:'Vietnã'},    fra:{common:'Viêt Nam'},    deu:{common:'Vietnam'},        ita:{common:'Vietnam'},     jpn:{common:'ベトナム'},      kor:{common:'베트남'},     zho:{common:'越南'}}},
  { cca2:'TH', region:'Asia',     name:{common:'Thailand'},        translations:{spa:{common:'Tailandia'},      por:{common:'Tailândia'}, fra:{common:'Thaïlande'},   deu:{common:'Thailand'},       ita:{common:'Thailandia'},  jpn:{common:'タイ'},          kor:{common:'태국'},       zho:{common:'泰国'}}},
  { cca2:'MY', region:'Asia',     name:{common:'Malaysia'},        translations:{spa:{common:'Malasia'},        por:{common:'Malásia'},   fra:{common:'Malaisie'},    deu:{common:'Malaysia'},       ita:{common:'Malesia'},     jpn:{common:'マレーシア'},   kor:{common:'말레이시아'}, zho:{common:'马来西亚'}}},
  { cca2:'SG', region:'Asia',     name:{common:'Singapore'},       translations:{spa:{common:'Singapur'},       por:{common:'Singapura'}, fra:{common:'Singapour'},   deu:{common:'Singapur'},       ita:{common:'Singapore'},   jpn:{common:'シンガポール'}, kor:{common:'싱가포르'},   zho:{common:'新加坡'}}},
  { cca2:'PK', region:'Asia',     name:{common:'Pakistan'},        translations:{spa:{common:'Pakistán'},       por:{common:'Paquistão'}, fra:{common:'Pakistan'},    deu:{common:'Pakistan'},       ita:{common:'Pakistan'},    jpn:{common:'パキスタン'},   kor:{common:'파키스탄'},   zho:{common:'巴基斯坦'}}},
  { cca2:'BD', region:'Asia',     name:{common:'Bangladesh'},      translations:{spa:{common:'Bangladesh'},     por:{common:'Bangladesh'},fra:{common:'Bangladesh'},  deu:{common:'Bangladesch'},    ita:{common:'Bangladesh'},  jpn:{common:'バングラデシュ'},kor:{common:'방글라데시'}, zho:{common:'孟加拉国'}}},
  { cca2:'IR', region:'Asia',     name:{common:'Iran'},            translations:{spa:{common:'Irán'},           por:{common:'Irão'},      fra:{common:'Iran'},        deu:{common:'Iran'},           ita:{common:'Iran'},        jpn:{common:'イラン'},        kor:{common:'이란'},       zho:{common:'伊朗'}}},
  { cca2:'SA', region:'Asia',     name:{common:'Saudi Arabia'},    translations:{spa:{common:'Arabia Saudita'}, por:{common:'Arábia Saudita'},fra:{common:'Arabie saoudite'},deu:{common:'Saudi-Arabien'},ita:{common:'Arabia Saudita'},jpn:{common:'サウジアラビア'},kor:{common:'사우디아라비아'},zho:{common:'沙特阿拉伯'}}},
  { cca2:'AF', region:'Asia',     name:{common:'Afghanistan'},     translations:{spa:{common:'Afganistán'},     por:{common:'Afeganistão'},fra:{common:'Afghanistan'}, deu:{common:'Afghanistan'},    ita:{common:'Afghanistan'}, jpn:{common:'アフガニスタン'},kor:{common:'아프가니스탄'},zho:{common:'阿富汗'}}},
  { cca2:'EG', region:'Africa',   name:{common:'Egypt'},           translations:{spa:{common:'Egipto'},         por:{common:'Egito'},     fra:{common:'Égypte'},      deu:{common:'Ägypten'},        ita:{common:'Egitto'},      jpn:{common:'エジプト'},      kor:{common:'이집트'},     zho:{common:'埃及'}}},
  { cca2:'NG', region:'Africa',   name:{common:'Nigeria'},         translations:{spa:{common:'Nigeria'},        por:{common:'Nigéria'},   fra:{common:'Nigéria'},     deu:{common:'Nigeria'},        ita:{common:'Nigeria'},     jpn:{common:'ナイジェリア'}, kor:{common:'나이지리아'}, zho:{common:'尼日利亚'}}},
  { cca2:'ZA', region:'Africa',   name:{common:'South Africa'},    translations:{spa:{common:'Sudáfrica'},      por:{common:'África do Sul'},fra:{common:'Afrique du Sud'},deu:{common:'Südafrika'},  ita:{common:'Sudafrica'},   jpn:{common:'南アフリカ'},   kor:{common:'남아프리카'}, zho:{common:'南非'}}},
  { cca2:'MA', region:'Africa',   name:{common:'Morocco'},         translations:{spa:{common:'Marruecos'},      por:{common:'Marrocos'},  fra:{common:'Maroc'},       deu:{common:'Marokko'},        ita:{common:'Marocco'},     jpn:{common:'モロッコ'},      kor:{common:'모로코'},     zho:{common:'摩洛哥'}}},
  { cca2:'ET', region:'Africa',   name:{common:'Ethiopia'},        translations:{spa:{common:'Etiopía'},        por:{common:'Etiópia'},   fra:{common:'Éthiopie'},    deu:{common:'Äthiopien'},      ita:{common:'Etiopia'},     jpn:{common:'エチオピア'},   kor:{common:'에티오피아'}, zho:{common:'埃塞俄比亚'}}},
  { cca2:'GH', region:'Africa',   name:{common:'Ghana'},           translations:{spa:{common:'Ghana'},          por:{common:'Gana'},      fra:{common:'Ghana'},       deu:{common:'Ghana'},          ita:{common:'Ghana'},       jpn:{common:'ガーナ'},        kor:{common:'가나'},       zho:{common:'加纳'}}},
  { cca2:'KE', region:'Africa',   name:{common:'Kenya'},           translations:{spa:{common:'Kenia'},          por:{common:'Quênia'},    fra:{common:'Kenya'},       deu:{common:'Kenia'},          ita:{common:'Kenya'},       jpn:{common:'ケニア'},        kor:{common:'케냐'},       zho:{common:'肯尼亚'}}},
  { cca2:'AO', region:'Africa',   name:{common:'Angola'},          translations:{spa:{common:'Angola'},         por:{common:'Angola'},    fra:{common:'Angola'},      deu:{common:'Angola'},         ita:{common:'Angola'},      jpn:{common:'アンゴラ'},      kor:{common:'앙골라'},     zho:{common:'安哥拉'}}},
  { cca2:'TZ', region:'Africa',   name:{common:'Tanzania'},        translations:{spa:{common:'Tanzania'},       por:{common:'Tanzânia'},  fra:{common:'Tanzanie'},    deu:{common:'Tansania'},       ita:{common:'Tanzania'},    jpn:{common:'タンザニア'},   kor:{common:'탄자니아'},   zho:{common:'坦桑尼亚'}}},
  { cca2:'UG', region:'Africa',   name:{common:'Uganda'},          translations:{spa:{common:'Uganda'},         por:{common:'Uganda'},    fra:{common:'Ouganda'},     deu:{common:'Uganda'},         ita:{common:'Uganda'},      jpn:{common:'ウガンダ'},      kor:{common:'우간다'},     zho:{common:'乌干达'}}},
  { cca2:'AU', region:'Oceania',  name:{common:'Australia'},       translations:{spa:{common:'Australia'},      por:{common:'Austrália'}, fra:{common:'Australie'},   deu:{common:'Australien'},     ita:{common:'Australia'},   jpn:{common:'オーストラリア'},kor:{common:'호주'},      zho:{common:'澳大利亚'}}},
  { cca2:'NZ', region:'Oceania',  name:{common:'New Zealand'},     translations:{spa:{common:'Nueva Zelanda'},  por:{common:'Nova Zelândia'},fra:{common:'Nouvelle-Zélande'},deu:{common:'Neuseeland'},ita:{common:'Nuova Zelanda'},jpn:{common:'ニュージーランド'},kor:{common:'뉴질랜드'},zho:{common:'新西兰'}}},
  { cca2:'FJ', region:'Oceania',  name:{common:'Fiji'},            translations:{spa:{common:'Fiyi'},           por:{common:'Fiji'},      fra:{common:'Fidji'},       deu:{common:'Fidschi'},        ita:{common:'Figi'},        jpn:{common:'フィジー'},      kor:{common:'피지'},       zho:{common:'斐济'}}},
  { cca2:'PG', region:'Oceania',  name:{common:'Papua New Guinea'},translations:{spa:{common:'Papúa Nueva Guinea'},por:{common:'Papua-Nova Guiné'},fra:{common:'Papouasie-Nouvelle-Guinée'},deu:{common:'Papua-Neuguinea'},ita:{common:'Papua Nuova Guinea'},jpn:{common:'パプアニューギニア'},kor:{common:'파푸아뉴기니'},zho:{common:'巴布亚新几内亚'}}},
];

export async function GET() {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NotaMundial/1.0)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { throw new Error('JSON inválido'); }

    if (!Array.isArray(data)) {
      throw new Error(`no es array, es: ${typeof data} — ${JSON.stringify(data).slice(0, 200)}`);
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });

  } catch (err) {
    console.warn('[api/countries] usando fallback. Razón:', String(err));
    return NextResponse.json(FALLBACK, {
      headers: { 'X-Data-Source': 'fallback', 'Cache-Control': 'public, s-maxage=300' },
    });
  }
}