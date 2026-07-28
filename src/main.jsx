import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, BarChart3,
  Bell, Boxes, Building2, Check, ChevronDown, ChevronRight, CircleDollarSign,
  CircleHelp, ClipboardCheck, Clock3, FileCheck2, FileText, Gauge, Heart,
  LayoutDashboard, LifeBuoy, Link2, ListChecks, Menu, Minus, Package,
  PackageCheck, Plus, Search, Settings, ShieldCheck, ShoppingBag, SlidersHorizontal,
  Store, Truck, Upload, UserRound, Users, WalletCards, Warehouse, X
} from "lucide-react";
import "./styles.css";

const money = n => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const products = [
  {id:1,name:"Сервер Dell PowerEdge R760",category:"Серверы",seller:"IT Distribution",rating:"4.9",stock:18,price:782400,old:815000,code:"DELL-R760-4410Y",kind:"server",status:"В наличии"},
  {id:2,name:"Коммутатор Cisco C9300-48P",category:"Сетевое оборудование",seller:"NetSystems",rating:"4.8",stock:42,price:526900,code:"C9300-48P-A",kind:"switch",status:"В наличии"},
  {id:3,name:"ThinkPad X1 Carbon Gen 12",category:"Ноутбуки",seller:"ProDevice",rating:"4.7",stock:63,price:214500,old:229900,code:"21KC00AERT",kind:"laptop",status:"В наличии"},
  {id:4,name:"СХД Synology RS3621xs+",category:"Хранение данных",seller:"DataCore",rating:"4.9",stock:7,price:648000,code:"RS3621XS-RU",kind:"storage",status:"Осталось мало"},
  {id:5,name:"Монитор Dell UltraSharp U2724D",category:"Периферия",seller:"Office Tech",rating:"4.6",stock:124,price:68400,code:"DELL-U2724D",kind:"monitor",status:"В наличии"},
  {id:6,name:"ИБП APC Smart-UPS SRT 3000VA",category:"Электропитание",seller:"Powerline",rating:"4.8",stock:21,price:297600,code:"SRT3000XLI",kind:"ups",status:"В наличии"},
  {id:7,name:"HPE ProLiant DL380 Gen11",category:"Серверы",seller:"ServerLab",rating:"4.9",stock:11,price:914000,code:"HPE-DL380-G11",kind:"server",status:"Под заказ"},
  {id:8,name:"МФУ Kyocera ECOSYS M3645idn",category:"Периферия",seller:"Office Tech",rating:"4.7",stock:35,price:167900,code:"1102V73NL0",kind:"printer",status:"В наличии"},
];

const purchases = [
  {id:"TM-2480",date:"24 июл 2026",company:"ООО «Вектор»",amount:2637300,status:"Комплектация",tone:"dark",orders:2,progress:62},
  {id:"TM-2461",date:"18 июл 2026",company:"ООО «Вектор»",amount:648000,status:"Готов к получению",tone:"success",orders:1,progress:88},
  {id:"TM-2424",date:"02 июл 2026",company:"ООО «Вектор»",amount:1124900,status:"Завершено",tone:"neutral",orders:3,progress:100},
  {id:"TM-2398",date:"21 июн 2026",company:"ООО «Вектор»",amount:297600,status:"Ожидает счёт",tone:"warning",orders:1,progress:28},
];

const sellerProducts = [
  {name:"Сервер Dell PowerEdge R760",sku:"DELL-R760-4410Y",category:"Серверы",price:782400,stock:18,status:"Опубликован",views:1842},
  {name:"Dell PowerEdge R660",sku:"DELL-R660-4314",category:"Серверы",price:641900,stock:9,status:"Опубликован",views:1204},
  {name:"Dell PowerVault ME5024",sku:"ME5024-16GB",category:"Хранение данных",price:1348000,stock:3,status:"На модерации",views:0},
  {name:"Dell EMC R250",sku:"R250-E2334",category:"Серверы",price:318600,stock:0,status:"Черновик",views:0},
];

const roleNavigation = {
  buyer: [
    ["Обзор","dashboard",LayoutDashboard],["Каталог","catalog",Search],["Избранное","favorites",Heart],
    ["Корзина","cart",ShoppingBag],["Закупки","purchases",PackageCheck],["Документы","documents",FileText],
    ["Жалобы","complaints",LifeBuoy],["Компания","company",Building2]
  ],
  seller: [
    ["Обзор","seller-dashboard",LayoutDashboard],["Товары","seller-products",Boxes],["Склады","inventory",Warehouse],
    ["Заказы","seller-orders",Package],["Финансы","finance",WalletCards],["Подписка","subscription",CircleDollarSign],
    ["Интеграции","integrations",Link2],["Профиль продавца","seller-profile",Store]
  ],
  admin: [
    ["Операционный центр","admin-dashboard",Gauge],["Модерация","moderation",ClipboardCheck],
    ["Жалобы","trust",ShieldCheck],["Компании","admin-companies",Building2],["Аудит","audit",Activity]
  ]
};

function ProductVisual({kind="server",large=false}) {
  return <div className={`product-visual ${kind} ${large?"large":""}`} aria-hidden="true">
    <div className="hardware"><span/><span/><span/><i/></div>
  </div>;
}

function Status({children,tone="neutral"}) { return <span className={`status ${tone}`}>{children}</span>; }
function Kpi({label,value,delta,icon:Icon}) {
  return <div className="kpi"><div className="kpi-top"><span>{label}</span>{Icon&&<Icon/>}</div><b>{value}</b>{delta&&<small>{delta}</small>}</div>;
}
function Empty({title,text,action,onClick}) {
  return <div className="empty"><div className="empty-icon"><Package/></div><h2>{title}</h2><p>{text}</p>{action&&<button className="btn dark" onClick={onClick}>{action}<ArrowRight/></button>}</div>;
}
function PageHead({eyebrow,title,subtitle,action,actionIcon:Icon=Plus,onAction}) {
  return <div className="page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action&&<button className="btn dark" onClick={onAction}>{action}<Icon/></button>}</div>;
}

function App() {
  const [role,setRole] = useState("buyer");
  const [view,setView] = useState("dashboard");
  const [query,setQuery] = useState("");
  const [cart,setCart] = useState({1:2,3:5});
  const [favorites,setFavorites] = useState([2,4]);
  const [selected,setSelected] = useState(products[0]);
  const [toast,setToast] = useState("");
  const [mobileNav,setMobileNav] = useState(false);
  const [checkoutStep,setCheckoutStep] = useState(1);
  const [catalogLayout,setCatalogLayout] = useState("grid");
  const [modal,setModal] = useState(null);
  const [sellerTab,setSellerTab] = useState("all");
  const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);
  const cartProducts = products.filter(p=>cart[p.id]);
  const total = cartProducts.reduce((s,p)=>s+p.price*cart[p.id],0);
  const filtered = useMemo(()=>products.filter(p=>(p.name+p.category+p.seller+p.code).toLowerCase().includes(query.toLowerCase())),[query]);
  const notify = msg => {setToast(msg);setTimeout(()=>setToast(""),2200)};
  const navigate = next => {setView(next);setMobileNav(false);window.scrollTo({top:0,behavior:"smooth"})};
  const switchRole = next => {
    setRole(next);
    navigate(next==="buyer"?"dashboard":next==="seller"?"seller-dashboard":"admin-dashboard");
  };
  const add = id => {setCart(c=>({...c,[id]:(c[id]||0)+1}));notify("Добавлено в корпоративную корзину")};
  const toggleFavorite = id => setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);
  const titleMap = {buyer:"Покупатель",seller:"Продавец",admin:"TechM"};

  return <div className="portal">
    <aside className={`sidebar ${mobileNav?"show":""}`}>
      <div className="side-brand"><button onClick={()=>navigate(role==="buyer"?"dashboard":role==="seller"?"seller-dashboard":"admin-dashboard")}><span>TECH</span><b>M</b></button><small>B2B IT MARKETPLACE</small></div>
      <div className="role-switch">
        <label>Рабочий контур</label>
        <button onClick={()=>setModal("roles")}><span className={`role-dot ${role}`}/><div><b>{titleMap[role]}</b><small>{role==="buyer"?"ООО «Вектор»":role==="seller"?"IT Distribution":"Operations"}</small></div><ChevronDown/></button>
      </div>
      <nav className="side-nav">
        {roleNavigation[role].map(([label,key,Icon])=><button key={key} className={view===key||(key==="catalog"&&view==="product")?"active":""} onClick={()=>navigate(key)}><Icon/><span>{label}</span>{key==="cart"&&cartCount>0&&<em>{cartCount}</em>}{key==="moderation"&&<em>12</em>}</button>)}
      </nav>
      <div className="side-bottom"><button><CircleHelp/>Центр поддержки</button><button><Settings/>Настройки</button><div className="user-card"><div className="avatar">АК</div><div><b>Алексей Ковалёв</b><small>alexey@vector.ru</small></div></div></div>
    </aside>
    {mobileNav&&<button className="nav-backdrop" onClick={()=>setMobileNav(false)} aria-label="Закрыть меню"/>}

    <div className="workspace">
      <header className="topbar">
        <button className="mobile-trigger" onClick={()=>setMobileNav(true)} aria-label="Открыть меню"><Menu/></button>
        <div className="global-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&role==="buyer"&&navigate("catalog")} placeholder={role==="buyer"?"Поиск по каталогу и артикулу":"Поиск по разделу"}/><kbd>⌘ K</kbd></div>
        <div className="top-actions"><span className="context"><Building2/> {role==="admin"?"TechM Operations":role==="seller"?"IT Distribution":"ООО «Вектор»"}</span><button aria-label="Уведомления"><Bell/><i/></button><button className="avatar small">АК</button></div>
      </header>

      <main className="content">
        {view==="dashboard"&&<BuyerDashboard navigate={navigate}/>}
        {view==="catalog"&&<Catalog products={filtered} layout={catalogLayout} setLayout={setCatalogLayout} favorites={favorites} toggleFavorite={toggleFavorite} add={add} open={p=>{setSelected(p);navigate("product")}} query={query} setQuery={setQuery}/>}
        {view==="product"&&<ProductPage product={selected} add={add} toggleFavorite={toggleFavorite} favorite={favorites.includes(selected.id)} back={()=>navigate("catalog")}/>}
        {view==="favorites"&&<ProductCollection title="Избранное" eyebrow="СОХРАНЁННЫЕ ПРЕДЛОЖЕНИЯ" subtitle={`${favorites.length} предложения для быстрого доступа`} products={products.filter(p=>favorites.includes(p.id))} add={add} open={p=>{setSelected(p);navigate("product")}} emptyAction={()=>navigate("catalog")}/>}
        {view==="cart"&&<Cart cart={cart} setCart={setCart} products={cartProducts} total={total} next={()=>{setCheckoutStep(1);navigate("checkout")}}/>}
        {view==="checkout"&&<Checkout step={checkoutStep} setStep={setCheckoutStep} products={cartProducts} total={total} finish={()=>{notify("Закупка TM-2481 создана");setCart({});navigate("purchases")}}/>}
        {view==="purchases"&&<Purchases navigate={navigate}/>}
        {view==="purchase-detail"&&<PurchaseDetail back={()=>navigate("purchases")}/>}
        {view==="documents"&&<Documents notify={notify}/>}
        {view==="complaints"&&<BuyerComplaints open={()=>setModal("complaint")}/>}
        {view==="company"&&<Company notify={notify} openInvite={()=>setModal("invite")}/>}

        {view==="seller-dashboard"&&<SellerDashboard navigate={navigate}/>}
        {view==="seller-products"&&<SellerProducts tab={sellerTab} setTab={setSellerTab} notify={notify} create={()=>setModal("product")}/>}
        {view==="inventory"&&<Inventory notify={notify}/>}
        {view==="seller-orders"&&<SellerOrders notify={notify}/>}
        {view==="finance"&&<Finance/>}
        {view==="subscription"&&<Subscription notify={notify}/>}
        {view==="integrations"&&<Integrations notify={notify}/>}
        {view==="seller-profile"&&<SellerProfile notify={notify}/>}

        {view==="admin-dashboard"&&<AdminDashboard navigate={navigate}/>}
        {view==="moderation"&&<Moderation notify={notify}/>}
        {view==="trust"&&<Trust notify={notify}/>}
        {view==="admin-companies"&&<AdminCompanies/>}
        {view==="audit"&&<Audit/>}
      </main>
    </div>

    {modal==="roles"&&<Modal title="Выберите рабочий контур" close={()=>setModal(null)}>
      <div className="role-options">{[["buyer","Покупатель","Закупки для ООО «Вектор»",Building2],["seller","Продавец","Кабинет IT Distribution",Store],["admin","TechM","Операционный центр",ShieldCheck]].map(([key,label,desc,Icon])=><button key={key} className={role===key?"active":""} onClick={()=>{switchRole(key);setModal(null)}}><Icon/><div><b>{label}</b><small>{desc}</small></div>{role===key&&<Check/>}</button>)}</div>
    </Modal>}
    {modal==="complaint"&&<Modal title="Новая жалоба" close={()=>setModal(null)}>
      <FormStack><label>Заказ<select><option>TM-2461 · DataCore</option><option>TM-2424 · NetSystems</option></select></label><label>Тип проблемы<select><option>Несоответствие комплектации</option><option>Задержка отгрузки</option><option>Повреждение товара</option></select></label><label>Описание<textarea placeholder="Опишите ситуацию и ожидаемое решение"/></label><button className="upload"><Upload/>Прикрепить доказательства</button><button className="btn dark" onClick={()=>{setModal(null);notify("Жалоба CMP-104 создана")}}>Отправить жалобу<ArrowRight/></button></FormStack>
    </Modal>}
    {modal==="invite"&&<Modal title="Пригласить сотрудника" close={()=>setModal(null)}>
      <FormStack><label>Рабочая почта<input placeholder="name@vector.ru"/></label><label>Роль<select><option>Покупатель</option><option>Финансовый контролёр</option><option>Администратор компании</option></select></label><button className="btn dark" onClick={()=>{setModal(null);notify("Приглашение отправлено")}}>Отправить приглашение<ArrowRight/></button></FormStack>
    </Modal>}
    {modal==="product"&&<Modal title="Новая карточка товара" close={()=>setModal(null)} wide>
      <FormStack><div className="form-grid"><label>Название<input placeholder="Например, Dell PowerEdge R760"/></label><label>Категория<select><option>Серверы</option><option>Сетевое оборудование</option><option>Хранение данных</option></select></label><label>Артикул / SKU<input placeholder="SKU-0001"/></label><label>Цена с НДС<input placeholder="0 ₽"/></label></div><label>Описание<textarea placeholder="Ключевые характеристики и комплектация"/></label><button className="upload"><Upload/>Загрузить изображения и спецификацию</button><div className="modal-actions"><button className="btn outline" onClick={()=>setModal(null)}>Сохранить черновик</button><button className="btn dark" onClick={()=>{setModal(null);notify("Карточка отправлена на модерацию")}}>Отправить на модерацию<ArrowRight/></button></div></FormStack>
    </Modal>}
    {toast&&<div className="toast"><Check/>{toast}</div>}
  </div>;
}

function BuyerDashboard({navigate}) {
  return <>
    <PageHead eyebrow="ДОБРЫЙ ДЕНЬ, АЛЕКСЕЙ" title="Центр закупок" subtitle="Сводка по ООО «Вектор» на 28 июля 2026"/>
    <div className="kpi-grid"><Kpi label="Закупки в работе" value="4" delta="2 требуют внимания" icon={PackageCheck}/><Kpi label="Сумма за июль" value="4,71 млн ₽" delta="+12% к июню" icon={BarChart3}/><Kpi label="Документы" value="18 / 20" delta="2 ожидаются" icon={FileCheck2}/><Kpi label="Экономия" value="286 400 ₽" delta="По сравнению с базовой ценой" icon={CircleDollarSign}/></div>
    <div className="dash-grid">
      <section className="panel span-2"><div className="panel-head"><div><span className="eyebrow">АКТИВНЫЕ ЗАКУПКИ</span><h2>Исполнение заказов</h2></div><button className="text-btn" onClick={()=>navigate("purchases")}>Все закупки<ArrowRight/></button></div>
        <div className="purchase-list">{purchases.slice(0,3).map(p=><button key={p.id} className="purchase-row" onClick={()=>navigate("purchase-detail")}><div><b>{p.id}</b><small>{p.date} · {p.orders} заказа</small></div><Status tone={p.tone}>{p.status}</Status><div className="progress-cell"><span><i style={{width:`${p.progress}%`}}/></span><small>{p.progress}%</small></div><strong>{money(p.amount)}</strong><ChevronRight/></button>)}</div>
      </section>
      <section className="panel action-panel"><div className="panel-head"><div><span className="eyebrow">БЫСТРЫЕ ДЕЙСТВИЯ</span><h2>Новая закупка</h2></div></div><p>Найдите оборудование у проверенных поставщиков и соберите корпоративную корзину.</p><button className="btn light" onClick={()=>navigate("catalog")}>Перейти в каталог<Search/></button><div className="mini-actions"><button onClick={()=>navigate("documents")}><FileText/>Скачать документы</button><button onClick={()=>navigate("company")}><Users/>Управлять командой</button></div></section>
    </div>
    <div className="dash-grid lower"><section className="panel span-2"><div className="panel-head"><div><span className="eyebrow">РАСХОДЫ</span><h2>Динамика закупок</h2></div><button className="period">Последние 6 месяцев<ChevronDown/></button></div><Chart/></section><section className="panel"><div className="panel-head"><div><span className="eyebrow">БЮДЖЕТ</span><h2>IT-инфраструктура</h2></div></div><div className="budget-ring"><div><b>62%</b><small>использовано</small></div></div><div className="budget-values"><span><small>Потрачено</small><b>9,3 млн ₽</b></span><span><small>Лимит</small><b>15 млн ₽</b></span></div></section></div>
  </>;
}

function Chart() {
  const values=[35,48,40,65,57,82];
  return <div className="chart"><div className="chart-y"><span>3 млн</span><span>2 млн</span><span>1 млн</span><span>0</span></div><div className="bars">{values.map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><span>{["Фев","Мар","Апр","Май","Июн","Июл"][i]}</span></div>)}</div></div>;
}

function Catalog({products,layout,setLayout,favorites,toggleFavorite,add,open,query,setQuery}) {
  return <>
    <PageHead eyebrow="B2B-КАТАЛОГ" title="IT-оборудование" subtitle="Предложения независимых продавцов с актуальными ценами и остатками"/>
    <div className="catalog-toolbar"><div className="catalog-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Название, бренд, модель или артикул"/><button className="btn dark">Найти</button></div><button className="btn outline"><SlidersHorizontal/>Фильтры</button></div>
    <div className="category-strip">{["Все","Серверы","Сетевое оборудование","Ноутбуки","Хранение данных","Периферия"].map((x,i)=><button className={i===0?"active":""} onClick={()=>i===0?setQuery(""):setQuery(x)} key={x}>{x}<small>{[1284,186,312,248,94,444][i]}</small></button>)}</div>
    <div className="results-head"><span>Найдено: <b>{products.length} предложений</b></span><div><button className={layout==="grid"?"active":""} onClick={()=>setLayout("grid")}><Boxes/></button><button className={layout==="list"?"active":""} onClick={()=>setLayout("list")}><ListChecks/></button><button className="sort">По релевантности<ChevronDown/></button></div></div>
    {products.length?<div className={`product-grid ${layout}`}>{products.map(p=><ProductCard key={p.id} p={p} favorite={favorites.includes(p.id)} toggleFavorite={toggleFavorite} add={add} open={open}/>)}</div>:<Empty title="Ничего не найдено" text="Попробуйте изменить запрос или сбросить фильтры." action="Сбросить поиск" onClick={()=>setQuery("")}/>}
  </>;
}

function ProductCard({p,favorite,toggleFavorite,add,open}) {
  return <article className="product-card" onClick={()=>open(p)}>
    <div className="visual-wrap">{p.old&&<span className="discount">−{Math.round((1-p.price/p.old)*100)}%</span>}<button className={`favorite ${favorite?"active":""}`} onClick={e=>{e.stopPropagation();toggleFavorite(p.id)}} aria-label="В избранное"><Heart/></button><ProductVisual kind={p.kind}/></div>
    <div className="product-copy"><span className="product-category">{p.category}</span><h3>{p.name}</h3><p className="sku">{p.code}</p><div className="seller-line"><BadgeCheck/> {p.seller}<b>★ {p.rating}</b></div><div className={`availability ${p.stock<10?"low":""}`}>● {p.status} · {p.stock} шт.</div><div className="price-line"><div><strong>{money(p.price)}</strong>{p.old&&<del>{money(p.old)}</del>}</div><button onClick={e=>{e.stopPropagation();add(p.id)}} aria-label="Добавить в корзину"><Plus/></button></div></div>
  </article>;
}

function ProductPage({product,add,toggleFavorite,favorite,back}) {
  const [qty,setQty]=useState(1);
  return <>
    <button className="back-btn" onClick={back}><ArrowLeft/>Вернуться в каталог</button>
    <div className="product-detail"><div><ProductVisual kind={product.kind} large/><div className="thumbs"><button className="active"><ProductVisual kind={product.kind}/></button><button><ProductVisual kind={product.kind}/></button><button><ProductVisual kind={product.kind}/></button></div></div>
      <div className="detail-copy"><span className="product-category">{product.category} · {product.code}</span><h1>{product.name}</h1><div className="seller-profile"><div className="seller-logo">{product.seller.slice(0,2).toUpperCase()}</div><div><b>{product.seller}<BadgeCheck/></b><small>Проверенный поставщик · ★ {product.rating}</small></div><button>Профиль продавца</button></div>
        <div className="fulfilment"><span><PackageCheck/><b>В наличии: {product.stock} шт.</b><small>Склад: Москва, Варшавское ш.</small></span><span><Truck/><b>Отгрузка 1–3 дня</b><small>Самовывоз или доставка продавца</small></span></div>
        <div className="purchase-box"><div><small>Цена за единицу с НДС</small><strong>{money(product.price)}</strong>{product.old&&<del>{money(product.old)}</del>}</div><div className="quantity"><button onClick={()=>setQty(Math.max(1,qty-1))}><Minus/></button><span>{qty}</span><button onClick={()=>setQty(qty+1)}><Plus/></button></div><button className="btn dark" onClick={()=>{for(let i=0;i<qty;i++)add(product.id)}}>Добавить в корзину<ShoppingBag/></button><button className={`icon-square ${favorite?"active":""}`} onClick={()=>toggleFavorite(product.id)}><Heart/></button></div>
        <p className="validation-note"><ShieldCheck/>Цена, остаток и статус продавца будут повторно проверены на checkout.</p>
        <section className="specs"><h2>Основные характеристики</h2>{[["Состояние","Новое"],["Процессор","2 × Intel Xeon Silver 4410Y"],["Оперативная память","128 ГБ DDR5"],["Форм-фактор","2U Rack"],["Гарантия","36 месяцев"],["Страна производства","Китай"]].map(([a,b])=><div key={a}><span>{a}</span><b>{b}</b></div>)}</section>
      </div>
    </div>
  </>;
}

function ProductCollection({eyebrow,title,subtitle,products,add,open,emptyAction}) {
  return <><PageHead eyebrow={eyebrow} title={title} subtitle={subtitle}/>{products.length?<div className="product-grid">{products.map(p=><ProductCard key={p.id} p={p} favorite toggleFavorite={()=>{}} add={add} open={open}/>)}</div>:<Empty title="Пока пусто" text="Сохраняйте предложения, чтобы быстро вернуться к ним." action="Перейти в каталог" onClick={emptyAction}/>}</>;
}

function Cart({cart,setCart,products,total,next}) {
  return <><PageHead eyebrow="КОРПОРАТИВНАЯ КОРЗИНА" title="Подготовка закупки" subtitle={`ООО «Вектор» · ${products.length} поставщика`}/>{products.length?<div className="checkout-layout"><section className="cart-lines">
    {products.map(p=><article className="cart-line" key={p.id}><ProductVisual kind={p.kind}/><div><span className="product-category">{p.seller}</span><h3>{p.name}</h3><p>{p.code} · {p.status}</p><button className="link-danger" onClick={()=>setCart(c=>{const n={...c};delete n[p.id];return n})}>Удалить</button></div><div className="line-price"><strong>{money(p.price*cart[p.id])}</strong><small>{money(p.price)} / шт.</small><div className="quantity"><button onClick={()=>setCart(c=>({...c,[p.id]:Math.max(1,c[p.id]-1)}))}><Minus/></button><span>{cart[p.id]}</span><button onClick={()=>setCart(c=>({...c,[p.id]:c[p.id]+1}))}><Plus/></button></div></div></article>)}
  </section><OrderSummary total={total} count={Object.values(cart).reduce((a,b)=>a+b,0)} action="Перейти к оформлению" onAction={next}/></div>:<Empty title="Корзина пуста" text="Добавьте предложения из каталога, чтобы сформировать закупку." action="Перейти в каталог" onClick={()=>location.reload()}/>}</>;
}

function OrderSummary({total,count,action,onAction}) {
  return <aside className="order-summary"><h2>Итого</h2><div><span>Товары ({count})</span><b>{money(total)}</b></div><div><span>В том числе НДС</span><b>{money(Math.round(total/6))}</b></div><div><span>Доставка</span><b>Уточняется</b></div><div className="summary-total"><span>К оплате</span><b>{money(total)}</b></div><button className="btn dark" onClick={onAction}>{action}<ArrowRight/></button><p><ShieldCheck/>Цена и остатки будут зафиксированы после выбора складов.</p></aside>;
}

function Checkout({step,setStep,products,total,finish}) {
  const steps=["Получение","Реквизиты","Оплата","Проверка"];
  return <><PageHead eyebrow="CHECKOUT" title="Оформление закупки" subtitle="Проверка условий и резервирование товаров"/><div className="stepper">{steps.map((s,i)=><div className={step>i?"active":""} key={s}><i>{step>i+1?<Check/>:i+1}</i><span>{s}</span></div>)}</div>
    <div className="checkout-layout"><section className="checkout-form">
      {step===1&&<><h2>Способ получения</h2><p>Выберите склад и способ получения для каждого продавца.</p>{[...new Set(products.map(p=>p.seller))].map((s,i)=><div className="seller-shipment" key={s}><div><b>{s}</b><small>{products.filter(p=>p.seller===s).length} позиции</small></div><label className="radio-card"><input type="radio" name={`ship${i}`} defaultChecked/><span><Truck/><b>Доставка продавца</b><small>2–4 рабочих дня · стоимость уточняется</small></span></label><label className="radio-card"><input type="radio" name={`ship${i}`}/><span><Warehouse/><b>Самовывоз</b><small>Москва, склад продавца</small></span></label></div>)}</>}
      {step===2&&<><h2>Реквизиты и документы</h2><p>Данные покупателя будут указаны в заказах и закрывающих документах.</p><div className="company-check"><BadgeCheck/><div><b>ООО «Вектор»</b><small>ИНН 7705123456 · КПП 770501001</small><small>Москва, ул. Деловая, 12</small></div><button>Изменить</button></div><FormStack><label>Получатель<input defaultValue="Ковалёв Алексей Сергеевич"/></label><label>Телефон<input defaultValue="+7 999 123-45-67"/></label><label>Комментарий<textarea placeholder="Особые условия поставки или доступ на территорию"/></label></FormStack></>}
      {step===3&&<><h2>Способ оплаты</h2><p>Для этой закупки доступны два сценария оплаты.</p><label className="payment-card"><input type="radio" name="pay" defaultChecked/><WalletCards/><div><b>Оплата через TechM</b><small>Единый платёж, резервирование и автоматическая фиксация статуса.</small></div><Status tone="success">Рекомендуется</Status></label><label className="payment-card"><input type="radio" name="pay"/><FileText/><div><b>Напрямую продавцам</b><small>Отдельные счета и ручное подтверждение по каждому заказу.</small></div></label></>}
      {step===4&&<><h2>Проверка закупки</h2><p>После подтверждения TechM повторно проверит коммерческие данные и создаст заказы по продавцам и складам.</p><div className="review-box"><div><span>Компания</span><b>ООО «Вектор»</b></div><div><span>Позиций</span><b>{products.length}</b></div><div><span>Способ оплаты</span><b>Через TechM</b></div><div><span>Сумма</span><b>{money(total)}</b></div></div><div className="warning-box"><Clock3/><div><b>Резерв действует 30 минут</b><p>После создания закупки завершите оплату до истечения срока резерва.</p></div></div></>}
      <div className="form-actions">{step>1&&<button className="btn outline" onClick={()=>setStep(step-1)}><ArrowLeft/>Назад</button>}<button className="btn dark" onClick={()=>step<4?setStep(step+1):finish()}>{step<4?"Продолжить":"Создать закупку"}<ArrowRight/></button></div>
    </section><OrderSummary total={total} count={products.length} action={step<4?"Продолжить":"Подтвердить"} onAction={()=>step<4?setStep(step+1):finish()}/></div>
  </>;
}

function Purchases({navigate}) {
  return <><PageHead eyebrow="КОММЕРЧЕСКИЕ ОПЕРАЦИИ" title="Закупки" subtitle="Единый контроль заказов, оплаты, исполнения и документов" action="Новая закупка" actionIcon={ShoppingBag} onAction={()=>navigate("catalog")}/>
    <div className="tabbar"><button className="active">Все <em>24</em></button><button>В работе <em>4</em></button><button>Требуют действия <em>1</em></button><button>Завершённые <em>19</em></button></div>
    <section className="data-card"><div className="table-tools"><div className="inline-search"><Search/><input placeholder="Номер закупки или продавец"/></div><button className="btn outline"><SlidersHorizontal/>Фильтры</button></div><div className="data-table purchase-table"><div className="tr th"><span>Закупка</span><span>Статус</span><span>Заказы</span><span>Прогресс</span><span>Сумма</span><span/></div>{purchases.map(p=><button className="tr" key={p.id} onClick={()=>navigate("purchase-detail")}><span><b>{p.id}</b><small>{p.date}</small></span><span><Status tone={p.tone}>{p.status}</Status></span><span>{p.orders}</span><span className="table-progress"><i><b style={{width:`${p.progress}%`}}/></i><small>{p.progress}%</small></span><strong>{money(p.amount)}</strong><ChevronRight/></button>)}</div></section>
  </>;
}

function PurchaseDetail({back}) {
  return <><button className="back-btn" onClick={back}><ArrowLeft/>Все закупки</button><div className="purchase-title"><div><Status tone="dark">В КОМПЛЕКТАЦИИ</Status><h1>Закупка TM-2480</h1><p>Создана 24 июля 2026 · ООО «Вектор»</p></div><div><button className="btn outline"><FileText/>Документы</button><button className="btn dark">Связаться с поддержкой<LifeBuoy/></button></div></div>
    <section className="panel"><h2>Ход исполнения</h2><div className="timeline">{[["Оформлено","24 июл, 11:42",Check,"done"],["Оплачено","24 июл, 12:08",Check,"done"],["Комплектация","до 29 июля",Boxes,"active"],["Передача","ожидается",Truck,""],["Завершено","ожидается",PackageCheck,""]].map(([a,b,I,c])=><div className={c} key={a}><i><I/></i><b>{a}</b><small>{b}</small></div>)}</div></section>
    <div className="detail-grid"><section className="panel span-2"><div className="panel-head"><div><span className="eyebrow">ЗАКАЗЫ ПРОДАВЦОВ</span><h2>2 независимых заказа</h2></div></div>{[["IT Distribution","#ID-8821","2 позиции","Комплектуется","782 400 ₽"],["ProDevice","#PD-1094","5 позиций","Готов к отгрузке","1 072 500 ₽"]].map(x=><div className="seller-order" key={x[0]}><div className="seller-logo">{x[0].slice(0,2)}</div><div><b>{x[0]}</b><small>{x[1]} · {x[2]}</small></div><Status tone={x[3].startsWith("Готов")?"success":"dark"}>{x[3]}</Status><strong>{x[4]}</strong><ChevronRight/></div>)}</section><section className="panel compact"><span className="eyebrow">ОПЛАТА</span><h2>Через TechM</h2><div className="payment-state"><Check/><div><b>Оплачено</b><small>24 июля, 12:08</small></div></div><hr/><div className="kv"><span>Товары</span><b>1 854 900 ₽</b></div><div className="kv"><span>Доставка</span><b>Уточняется</b></div><div className="kv total"><span>Итого</span><b>2 637 300 ₽</b></div></section></div>
  </>;
}

function Documents({notify}) {
  const docs=[["Счёт на оплату","INV-2480-01","IT Distribution","24.07.2026","284 КБ"],["УПД","UPD-2461-01","DataCore","22.07.2026","418 КБ"],["Акт сверки","ACT-0726","TechM","20.07.2026","192 КБ"],["Товарная накладная","TORG12-2424","NetSystems","05.07.2026","356 КБ"]];
  return <><PageHead eyebrow="ДОКУМЕНТООБОРОТ" title="Документы" subtitle="Счета, УПД, накладные и акты по всем закупкам"/><div className="document-stats"><div><FileCheck2/><span><b>18</b><small>Получено</small></span></div><div><Clock3/><span><b>2</b><small>Ожидаются</small></span></div><div><AlertTriangle/><span><b>1</b><small>Требует проверки</small></span></div></div><section className="data-card"><div className="table-tools"><div className="inline-search"><Search/><input placeholder="Название или номер документа"/></div><button className="btn outline"><SlidersHorizontal/>Фильтры</button></div><div className="document-list">{docs.map(d=><div key={d[1]}><div className="doc-icon"><FileText/></div><span><b>{d[0]}</b><small>{d[1]} · {d[2]}</small></span><time>{d[3]}</time><small>{d[4]}</small><button className="btn outline" onClick={()=>notify(`${d[0]} подготовлен к скачиванию`)}>Скачать</button></div>)}</div></section></>;
}

function BuyerComplaints({open}) {
  return <><PageHead eyebrow="TRUST & SAFETY" title="Жалобы и обращения" subtitle="Контроль проблем по товарам и заказам" action="Новая жалоба" actionIcon={Plus} onAction={open}/><div className="complaint-grid"><section className="panel"><Status tone="warning">РАССЛЕДОВАНИЕ</Status><h2>CMP-097 · Задержка отгрузки</h2><p>Заказ #NS-7710 · NetSystems</p><div className="complaint-meta"><span><small>Создана</small><b>21 июля</b></span><span><small>Обновлена</small><b>Сегодня, 10:14</b></span><span><small>Ответственный</small><b>Trust & Safety</b></span></div><button className="text-btn">Открыть обращение<ArrowRight/></button></section><section className="panel"><Status tone="success">РЕШЕНО</Status><h2>CMP-081 · Комплектация</h2><p>Заказ #PD-1002 · ProDevice</p><div className="complaint-meta"><span><small>Решение</small><b>Частичный возврат</b></span><span><small>Сумма</small><b>12 400 ₽</b></span></div><button className="text-btn">Посмотреть решение<ArrowRight/></button></section></div></>;
}

function Company({notify,openInvite}) {
  const users=[["Алексей Ковалёв","alexey@vector.ru","Владелец","Активен"],["Мария Соколова","m.sokolova@vector.ru","Покупатель","Активен"],["Илья Романов","i.romanov@vector.ru","Финансовый контролёр","Активен"],["Анна Литвинова","a.litvinova@vector.ru","Покупатель","Приглашён"]];
  return <><PageHead eyebrow="КОРПОРАТИВНЫЙ КОНТЕКСТ" title="ООО «Вектор»" subtitle="Реквизиты, пользователи, роли и лимиты компании" action="Пригласить сотрудника" actionIcon={Users} onAction={openInvite}/><div className="settings-grid"><aside className="settings-menu"><button className="active">Профиль компании</button><button>Пользователи и роли</button><button>Адреса</button><button>Бюджеты и лимиты</button><button>История изменений</button></aside><section><div className="company-banner"><div className="company-mark">В</div><div><h2>ООО «Вектор»<BadgeCheck/></h2><p>ИНН 7705123456 · КПП 770501001</p></div><Status tone="success">Реквизиты подтверждены</Status></div><div className="panel"><div className="panel-head"><div><span className="eyebrow">КОМАНДА</span><h2>Пользователи и роли</h2></div></div><div className="user-list">{users.map(u=><div key={u[1]}><div className="avatar">{u[0].split(" ").map(x=>x[0]).join("").slice(0,2)}</div><span><b>{u[0]}</b><small>{u[1]}</small></span><em>{u[2]}</em><Status tone={u[3]==="Активен"?"success":"warning"}>{u[3]}</Status><button onClick={()=>notify("Настройки пользователя открыты")}><Settings/></button></div>)}</div></div></section></div></>;
}

function SellerDashboard({navigate}) {
  return <><PageHead eyebrow="КАБИНЕТ ПРОДАВЦА" title="IT Distribution" subtitle="Операционная сводка на 28 июля 2026"/><div className="kpi-grid"><Kpi label="Заказы в работе" value="17" delta="4 требуют действия" icon={Package}/><Kpi label="Оборот за июль" value="8,42 млн ₽" delta="+18% к июню" icon={BarChart3}/><Kpi label="Конверсия" value="3,8%" delta="+0,4 п.п." icon={Activity}/><Kpi label="Рейтинг" value="4,9" delta="326 оценок" icon={BadgeCheck}/></div><div className="dash-grid"><section className="panel span-2"><div className="panel-head"><div><span className="eyebrow">ЗАКАЗЫ</span><h2>Требуют внимания</h2></div><button className="text-btn" onClick={()=>navigate("seller-orders")}>Все заказы<ArrowRight/></button></div>{[["#ID-8821","ООО «Вектор»","Комплектация","782 400 ₽","до 29 июля"],["#ID-8818","АО «Контур»","Новый заказ","1 564 800 ₽","подтвердить до 15:20"],["#ID-8804","ООО «Сфера»","Ожидает отгрузку","318 600 ₽","сегодня"]].map(x=><div className="seller-order" key={x[0]}><div className="seller-logo">{x[1][0]}</div><div><b>{x[0]} · {x[1]}</b><small>{x[4]}</small></div><Status tone={x[2]==="Новый заказ"?"warning":"dark"}>{x[2]}</Status><strong>{x[3]}</strong><ChevronRight/></div>)}</section><section className="panel action-panel seller-action"><span className="eyebrow">КАТАЛОГ</span><h2>Управляйте ассортиментом</h2><p>4 карточки требуют обновления остатков, 1 ожидает модерации.</p><button className="btn light" onClick={()=>navigate("seller-products")}>Открыть товары<Boxes/></button><div className="health"><span><i style={{width:"86%"}}/></span><b>86%</b><small>качество каталога</small></div></section></div><div className="dash-grid lower"><section className="panel span-2"><div className="panel-head"><div><span className="eyebrow">ПРОДАЖИ</span><h2>Оборот и заказы</h2></div><button className="period">Последние 6 месяцев<ChevronDown/></button></div><Chart/></section><section className="panel"><span className="eyebrow">СКЛАДЫ</span><h2>Контроль остатков</h2>{[["Основной · Москва","142 SKU","94%"],["Север · СПб","86 SKU","81%"],["Резервный · Казань","34 SKU","76%"]].map(x=><div className="warehouse-health" key={x[0]}><div><b>{x[0]}</b><small>{x[1]}</small></div><strong>{x[2]}</strong></div>)}</section></div></>;
}

function SellerProducts({tab,setTab,notify,create}) {
  const shown=sellerProducts.filter(p=>tab==="all"||p.status===tab);
  return <><PageHead eyebrow="SELLER · CATALOG" title="Товары" subtitle="Карточки, SKU, цены и статус публикации" action="Новый товар" onAction={create}/><div className="tabbar">{[["all","Все",4],["Опубликован","Опубликованы",2],["На модерации","На модерации",1],["Черновик","Черновики",1]].map(x=><button key={x[0]} className={tab===x[0]?"active":""} onClick={()=>setTab(x[0])}>{x[1]} <em>{x[2]}</em></button>)}</div><section className="data-card"><div className="table-tools"><div className="inline-search"><Search/><input placeholder="Название или SKU"/></div><button className="btn outline"><Upload/>Импорт CSV/XLSX</button></div><div className="data-table product-admin-table"><div className="tr th"><span>Товар</span><span>Цена</span><span>Остаток</span><span>Просмотры</span><span>Статус</span><span/></div>{shown.map((p,i)=><div className="tr" key={p.sku}><span className="admin-product"><ProductVisual kind={i===2?"storage":"server"}/><span><b>{p.name}</b><small>{p.sku} · {p.category}</small></span></span><strong>{money(p.price)}</strong><span>{p.stock} шт.</span><span>{p.views}</span><span><Status tone={p.status==="Опубликован"?"success":p.status==="На модерации"?"warning":"neutral"}>{p.status}</Status></span><button onClick={()=>notify(`Открыто редактирование ${p.sku}`)}><ChevronRight/></button></div>)}</div></section></>;
}

function Inventory({notify}) {
  return <><PageHead eyebrow="INVENTORY" title="Склады и остатки" subtitle="Источник истины по доступности SKU" action="Добавить склад" actionIcon={Warehouse} onAction={()=>notify("Форма нового склада открыта")}/><div className="warehouse-grid">{[["Основной склад","Москва, Варшавское ш., 125","142","94%","API · 3 мин назад"],["Северный склад","Санкт-Петербург, Парнас","86","81%","CSV · 27 мин назад"],["Резервный склад","Казань, ул. Техническая, 9","34","76%","Вручную · 2 ч назад"]].map((w,i)=><section className="warehouse-card" key={w[0]}><div className="warehouse-icon"><Warehouse/></div><Status tone={i===2?"warning":"success"}>{i===2?"Требует синхронизации":"Активен"}</Status><h2>{w[0]}</h2><p>{w[1]}</p><div><span><small>SKU</small><b>{w[2]}</b></span><span><small>Актуальность</small><b>{w[3]}</b></span></div><footer><Activity/><span>{w[4]}</span><button onClick={()=>notify(`${w[0]} открыт`)}>Управлять<ArrowRight/></button></footer></section>)}</div><section className="panel"><div className="panel-head"><div><span className="eyebrow">СИНХРОНИЗАЦИЯ</span><h2>Последние операции</h2></div><button className="btn outline" onClick={()=>notify("Синхронизация запущена")}><Activity/>Синхронизировать</button></div><div className="event-list">{[["Остатки обновлены","Основной склад · 142 SKU","Успешно","3 мин назад"],["Импорт завершён с предупреждениями","Северный склад · 4 строки пропущено","Проверить","27 мин назад"],["Цена изменена","DELL-R760-4410Y · 782 400 ₽","Успешно","1 ч назад"]].map(x=><div key={x[0]}><i className={x[2]==="Проверить"?"warn":""}><Check/></i><span><b>{x[0]}</b><small>{x[1]}</small></span><Status tone={x[2]==="Проверить"?"warning":"success"}>{x[2]}</Status><time>{x[3]}</time></div>)}</div></section></>;
}

function SellerOrders({notify}) {
  const rows=[["#ID-8821","ООО «Вектор»","24 июл","Комплектация","782 400 ₽"],["#ID-8818","АО «Контур»","27 июл","Новый заказ","1 564 800 ₽"],["#ID-8804","ООО «Сфера»","26 июл","Ожидает отгрузку","318 600 ₽"],["#ID-8799","АО «Орбита»","23 июл","Завершён","641 900 ₽"]];
  return <><PageHead eyebrow="ORDER MANAGEMENT" title="Заказы" subtitle="Комплектация, готовность, отгрузка и документы"/><div className="tabbar"><button className="active">Все <em>48</em></button><button>Новые <em>3</em></button><button>Комплектация <em>8</em></button><button>К отгрузке <em>6</em></button><button>Завершены <em>31</em></button></div><section className="data-card"><div className="data-table orders-table"><div className="tr th"><span>Заказ</span><span>Покупатель</span><span>Дата</span><span>Статус</span><span>Сумма</span><span/></div>{rows.map(x=><div className="tr" key={x[0]}><b>{x[0]}</b><span>{x[1]}</span><span>{x[2]}</span><span><Status tone={x[3]==="Новый заказ"?"warning":x[3]==="Завершён"?"neutral":"dark"}>{x[3]}</Status></span><strong>{x[4]}</strong><button onClick={()=>notify(`Заказ ${x[0]} открыт`)}><ChevronRight/></button></div>)}</div></section></>;
}

function Finance() {
  return <><PageHead eyebrow="FINANCE" title="Финансы" subtitle="Оборот, выплаты, корректировки и документы"/><div className="kpi-grid"><Kpi label="Доступно к выплате" value="2,14 млн ₽" delta="Следующая выплата 31 июля" icon={WalletCards}/><Kpi label="В обработке" value="1,86 млн ₽" delta="5 заказов" icon={Clock3}/><Kpi label="Оборот за месяц" value="8,42 млн ₽" delta="+18% к июню" icon={BarChart3}/><Kpi label="Корректировки" value="−12 400 ₽" delta="1 возврат" icon={AlertTriangle}/></div><div className="dash-grid"><section className="panel span-2"><span className="eyebrow">ДЕНЕЖНЫЙ ПОТОК</span><h2>Начисления и выплаты</h2><Chart/></section><section className="panel"><span className="eyebrow">БЛИЖАЙШАЯ ВЫПЛАТА</span><h2>31 июля 2026</h2><div className="payout"><strong>2 140 800 ₽</strong><small>Расчётный счёт •• 4582</small><div><span>Заказы</span><b>7</b></div><div><span>Корректировки</span><b>−12 400 ₽</b></div></div><button className="btn outline">Скачать реестр<FileText/></button></section></div></>;
}

function Subscription({notify}) {
  return <><PageHead eyebrow="SELLER PLAN" title="Подписка" subtitle="Тариф зависит от завершённого оборота продавца"/><div className="plan-card"><div><Status tone="dark">ТЕКУЩИЙ ПЛАН</Status><h1>Business</h1><p>Для растущих продавцов с несколькими складами и интеграциями.</p></div><div className="plan-price"><strong>24 900 ₽</strong><small>в месяц · с НДС</small></div><div className="plan-progress"><span><b>Оборот: 8,42 млн ₽</b><small>До следующего уровня — 6,58 млн ₽</small></span><div><i style={{width:"56%"}}/></div></div><ul><li><Check/>До 5 000 активных SKU</li><li><Check/>3 склада</li><li><Check/>API, webhooks и импорт</li><li><Check/>Приоритетная поддержка</li></ul><button className="btn dark" onClick={()=>notify("Управление тарифом открыто")}>Управлять подпиской<ArrowRight/></button></div><section className="panel"><span className="eyebrow">ИСТОРИЯ</span><h2>Счета за подписку</h2><div className="document-list">{["Июль 2026","Июнь 2026","Май 2026"].map(m=><div key={m}><div className="doc-icon"><FileText/></div><span><b>{m}</b><small>Тариф Business</small></span><strong>24 900 ₽</strong><Status tone="success">Оплачен</Status><button className="btn outline">Счёт</button></div>)}</div></section></>;
}

function Integrations({notify}) {
  return <><PageHead eyebrow="API-FIRST" title="Интеграции" subtitle="API-клиенты, webhooks, импорт и подключение ERP/WMS" action="Новая интеграция" actionIcon={Plus} onAction={()=>notify("Мастер интеграции открыт")}/><div className="integration-grid">{[["REST API","Синхронизация каталога и заказов","Подключено","Последний запрос 2 мин назад",Link2],["Webhooks","Уведомления о заказах и остатках","Подключено","98,7% доставлено",Activity],["CSV / XLSX","Ручной импорт товаров и остатков","Доступно","Последний импорт 27 мин назад",Upload],["1С:Управление торговлей","Обмен каталогом и документами","Не настроено","",Boxes]].map(([a,b,c,d,I])=><section key={a}><I/><Status tone={c==="Подключено"?"success":"neutral"}>{c}</Status><h2>{a}</h2><p>{b}</p><small>{d}</small><button className="text-btn" onClick={()=>notify(`${a}: настройки открыты`)}>Настроить<ArrowRight/></button></section>)}</div><section className="panel"><span className="eyebrow">API-КЛИЕНТЫ</span><h2>Доступы</h2><div className="api-client"><div className="avatar">PR</div><span><b>production-erp</b><small>catalog:write · inventory:write · orders:read</small></span><Status tone="success">Активен</Status><time>Использован 2 мин назад</time><button><Settings/></button></div></section></>;
}

function SellerProfile({notify}) {
  return <><PageHead eyebrow="SELLER PROFILE" title="Профиль продавца" subtitle="Юридические данные, коммерческие условия и публичная информация"/><div className="settings-grid"><aside className="settings-menu"><button className="active">Основные данные</button><button>Юридические реквизиты</button><button>Контактные лица</button><button>Условия оплаты</button><button>Доставка и возвраты</button></aside><section className="panel"><div className="company-banner plain"><div className="company-mark">ID</div><div><h2>IT Distribution<BadgeCheck/></h2><p>Продавец с 14 марта 2025 · Рейтинг 4,9</p></div><Status tone="success">Активен</Status></div><FormStack><div className="form-grid"><label>Публичное название<input defaultValue="IT Distribution"/></label><label>Сайт<input defaultValue="it-distribution.ru"/></label></div><label>Описание<textarea defaultValue="Поставщик серверного и сетевого оборудования для корпоративной инфраструктуры."/></label><div className="form-grid"><label>Телефон<input defaultValue="+7 495 000-10-20"/></label><label>Почта<input defaultValue="sales@it-distribution.ru"/></label></div><button className="btn dark" onClick={()=>notify("Изменения сохранены")}>Сохранить изменения<Check/></button></FormStack></section></div></>;
}

function AdminDashboard({navigate}) {
  return <><PageHead eyebrow="TECHM · OPERATIONS" title="Операционный центр" subtitle="Состояние платформы и очереди на 28 июля 2026"/><div className="kpi-grid"><Kpi label="GMV за июль" value="84,2 млн ₽" delta="+21% к июню" icon={BarChart3}/><Kpi label="Активные продавцы" value="184" delta="12 на онбординге" icon={Store}/><Kpi label="Модерация" value="12" delta="3 старше 2 часов" icon={ClipboardCheck}/><Kpi label="Открытые жалобы" value="7" delta="1 высокий приоритет" icon={ShieldCheck}/></div><div className="dash-grid"><section className="panel span-2"><div className="panel-head"><div><span className="eyebrow">ОПЕРАЦИОННАЯ ОЧЕРЕДЬ</span><h2>Требуют внимания</h2></div></div>{[["Карточки ожидают модерации","12","3 с риском SLO","moderation"],["Жалобы в расследовании","7","1 высокий приоритет","trust"],["Заявки продавцов","5","2 требуют документов","admin-companies"]].map(([a,b,c,v])=><button className="ops-row" key={a} onClick={()=>navigate(v)}><div><b>{b}</b></div><span><strong>{a}</strong><small>{c}</small></span><ChevronRight/></button>)}</section><section className="panel system-health"><span className="eyebrow">ПЛАТФОРМА</span><h2>Состояние сервисов</h2>{[["Checkout","99,98%"],["Search","99,95%"],["Payments","99,99%"],["Notifications","99,91%"]].map(x=><div key={x[0]}><i/><span>{x[0]}</span><b>{x[1]}</b></div>)}<footer><Check/>Все критичные сервисы в норме</footer></section></div><div className="dash-grid lower"><section className="panel span-2"><span className="eyebrow">ОБОРОТ ПЛАТФОРМЫ</span><h2>GMV по месяцам</h2><Chart/></section><section className="panel"><span className="eyebrow">МОДЕРАЦИЯ</span><h2>Автоматические решения</h2><div className="moderation-ring"><div><b>92%</b><small>без участия человека</small></div></div><div className="kv"><span>Одобрено</span><b>1 842</b></div><div className="kv"><span>Отклонено</span><b>164</b></div><div className="kv"><span>На проверке</span><b>12</b></div></section></div></>;
}

function Moderation({notify}) {
  const cards=[["Dell PowerVault ME5024","IT Distribution","СХД","Низкий риск","1 ч 12 мин"],["Cisco Catalyst 9200L-48P","NetSystems","Сетевое оборудование","Средний риск","1 ч 48 мин"],["HPE Alletra 5000","ServerLab","СХД","Высокий риск","2 ч 31 мин"]];
  return <><PageHead eyebrow="TRUST · CONTENT" title="Модерация" subtitle="Автоматические проверки и разбор спорных карточек"/><div className="tabbar"><button className="active">Очередь <em>12</em></button><button>Высокий риск <em>3</em></button><button>Жалобы <em>2</em></button><button>История</button></div><div className="moderation-list">{cards.map((c,i)=><section key={c[0]}><div className="moderation-visual"><ProductVisual kind={i===1?"switch":"storage"}/></div><div className="moderation-copy"><div><Status tone={i===2?"danger":i===1?"warning":"success"}>{c[3]}</Status><time>В очереди {c[4]}</time></div><h2>{c[0]}</h2><p>{c[1]} · {c[2]}</p><div className="check-list"><span><Check/>Текст</span><span><Check/>Изображения</span><span className={i===2?"fail":""}>{i===2?<AlertTriangle/>:<Check/>}Дубликаты</span><span><Check/>Характеристики</span></div></div><div className="moderation-actions"><button className="btn outline" onClick={()=>notify("Карточка отклонена")}>Отклонить</button><button className="btn dark" onClick={()=>notify("Карточка одобрена")}>Одобрить<Check/></button></div></section>)}</div></>;
}

function Trust({notify}) {
  const cases=[["CMP-104","Несоответствие комплектации","ООО «Вектор» → DataCore","Новая","28 июл, 12:14"],["CMP-097","Задержка отгрузки","ООО «Вектор» → NetSystems","Расследование","21 июл, 09:32"],["CMP-094","Повреждение товара","АО «Контур» → Office Tech","Ожидает продавца","19 июл, 16:08"]];
  return <><PageHead eyebrow="TRUST & SAFETY" title="Жалобы и расследования" subtitle="Решения, санкции и финансовые корректировки"/><div className="case-grid">{cases.map((c,i)=><section key={c[0]}><div><Status tone={i===0?"danger":i===1?"warning":"neutral"}>{c[3]}</Status><time>{c[4]}</time></div><span className="eyebrow">{c[0]}</span><h2>{c[1]}</h2><p>{c[2]}</p><div className="case-risk"><AlertTriangle/><span><small>Приоритет</small><b>{i===0?"Высокий":"Обычный"}</b></span></div><button className="btn dark" onClick={()=>notify(`Расследование ${c[0]} открыто`)}>Открыть дело<ArrowRight/></button></section>)}</div></>;
}

function AdminCompanies() {
  const companies=[["IT Distribution","Продавец","Активен","8,42 млн ₽"],["ООО «Вектор»","Покупатель","Активен","4,71 млн ₽"],["ServerLab","Продавец","Проверка","1,24 млн ₽"],["АО «Контур»","Покупатель","Активен","6,18 млн ₽"]];
  return <><PageHead eyebrow="IDENTITY · SELLER" title="Компании" subtitle="Корпоративные профили, статусы и онбординг"/><section className="data-card"><div className="table-tools"><div className="inline-search"><Search/><input placeholder="Название, ИНН или идентификатор"/></div><button className="btn outline"><SlidersHorizontal/>Фильтры</button></div><div className="data-table company-table"><div className="tr th"><span>Компания</span><span>Тип</span><span>Статус</span><span>Оборот за месяц</span><span/></div>{companies.map(c=><div className="tr" key={c[0]}><span className="company-cell"><div className="avatar">{c[0].slice(0,2).toUpperCase()}</div><b>{c[0]}</b></span><span>{c[1]}</span><span><Status tone={c[2]==="Активен"?"success":"warning"}>{c[2]}</Status></span><strong>{c[3]}</strong><button><ChevronRight/></button></div>)}</div></section></>;
}

function Audit() {
  const events=[["Алексей Ковалёв","purchase.created","Закупка TM-2481","28.07.2026 12:42:18"],["Moderation Orchestrator","product.approved","Product prd_8f214","28.07.2026 12:38:04"],["Мария Соколова","company.member.invited","ООО «Вектор»","28.07.2026 12:21:49"],["Finance Service","payment.captured","Payment pay_72bc1","28.07.2026 12:08:11"],["Trust & Safety","complaint.opened","CMP-104","28.07.2026 11:52:30"]];
  return <><PageHead eyebrow="AUDIT LOG" title="История операций" subtitle="Неизменяемый журнал критических действий платформы"/><section className="data-card"><div className="table-tools"><div className="inline-search"><Search/><input placeholder="Событие, субъект или объект"/></div><button className="btn outline"><SlidersHorizontal/>Период и фильтры</button></div><div className="audit-list">{events.map((e,i)=><div key={e[3]}><i className={i===1||i===3?"system":""}><Activity/></i><span><b>{e[1]}</b><small>{e[0]}</small></span><code>{e[2]}</code><time>{e[3]}</time><button><ChevronRight/></button></div>)}</div></section></>;
}

function Modal({title,close,children,wide=false}) {
  return <div className="modal-layer" role="dialog" aria-modal="true"><button className="modal-backdrop" onClick={close} aria-label="Закрыть"/><section className={`modal ${wide?"wide":""}`}><header><h2>{title}</h2><button onClick={close} aria-label="Закрыть"><X/></button></header>{children}</section></div>;
}
function FormStack({children}) { return <div className="form-stack">{children}</div>; }

createRoot(document.getElementById("root")).render(<App/>);
