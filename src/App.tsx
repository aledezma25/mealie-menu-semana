// Versión C · Mealie · Menú de la semana
// Base: código exportado de Figma Make (B1). Cambios de C marcados con su hallazgo (H01–H13),
// ver Entrega Final/04_resultados_y_hallazgos.md.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from "react";

type IconName =
  | "accessibility" | "arrow" | "calendar" | "check" | "chevron" | "close" | "food" | "help" | "move" | "plus"
  | "search" | "speaker" | "trash" | "undo" | "redo" | "watch" | "dots" | "book" | "saved" | "edit" | "dice"
  | "pot" | "cup" | "plate" | "arepa" | "dessert" | "leaf" | "users";

type DayKey = "lunes" | "martes" | "miércoles" | "jueves" | "viernes" | "sábado" | "domingo";
type Moment = "Desayuno" | "Almuerzo" | "Cena" | "Algo";
type Meal = { id: string; recipe: RecipeName; moment: Moment };
type Meals = Record<DayKey, Meal[]>;
type Weeks = Record<string, Meals>;
type Notice = { id: number; title: string; detail: string; undoable: boolean; recipe?: RecipeName } | null;
type RecipeName = keyof typeof recipeDetails;
type Day = { key: DayKey; label: string; date: string; long: string };
type Editor =
  | { mode: "add"; day: DayKey | null; recipe?: RecipeName }
  | { mode: "edit"; day: DayKey; meal: Meal };
type Preferences = {
  theme: "system" | "light" | "dark" | "contrast";
  textSize: number;
  font: "atkinson" | "lexend" | "system";
  wideSpacing: boolean;
  largeButtons: boolean;
  reduceMotion: boolean;
  persistentNotices: boolean;
  colorVision: "none" | "protanopia" | "deuteranopia" | "tritanopia";
};

const iconPaths: Record<IconName, ReactNode> = {
  accessibility: <><circle cx="12" cy="4" r="2" /><path d="M5 8h14M12 6v15M8 21l4-7 4 7M7 8l2 6M17 8l-2 6" /></>,
  arrow: <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  food: <><path d="M4 3v8a3 3 0 0 0 3 3V3M10 3v18M17 3v18M14 3h2a4 4 0 0 1 4 4v5h-6V3Z" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2M12 17h.01" /></>,
  move: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  speaker: <><path d="M11 5 6 9H3v6h3l5 4V5ZM15 9a4 4 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" /></>,
  undo: <><path d="m9 8-5 5 5 5" /><path d="M4 13h9a6 6 0 0 1 6 6" /></>,
  redo: <><path d="m15 8 5 5-5 5" /><path d="M20 13h-9a6 6 0 0 0-6 6" /></>,
  watch: <><rect x="6" y="5" width="12" height="14" rx="4" /><path d="M9 5V2h6v3M9 19v3h6v-3M12 9v3l2 1" /></>,
  dots: <><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M4 19a2 2 0 0 1 2-2h13M9 7h6" /></>,
  saved: <><path d="M5 4h11l3 3v13H5z" /><path d="M8 4v5h7V4M9 15l2 2 4-4" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13 7 4 4" /></>,
  dice: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9h.01M15 15h.01M15 9h.01M9 15h.01M12 12h.01" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M21 20a6 6 0 0 0-4-5.6" /></>,
  // Piezas de cocina (H10)
  pot: <><path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6Z" /><path d="M2 10h20M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2" /></>,
  cup: <><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" /><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 5c0-1 1-1 1-2M12 5c0-1 1-1 1-2" /></>,
  plate: <><circle cx="12" cy="13" r="8" /><circle cx="12" cy="13" r="4" /><path d="M3 4v4M21 4v4" /></>,
  arepa: <><ellipse cx="12" cy="13" rx="8" ry="6" /><path d="M8 12h.01M12 14h.01M15 11h.01M10 16h.01" /></>,
  dessert: <><path d="M5 11h14l-2 9H7l-2-9Z" /><path d="M7 11a5 5 0 0 1 10 0M12 4v2" /></>,
  leaf: <><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15" /><path d="M5 19 13 11" /></>,
};

const DAY_KEYS: DayKey[] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
const MOMENTS: Moment[] = ["Desayuno", "Almuerzo", "Cena", "Algo"];
const momentIcon: Record<Moment, IconName> = { Desayuno: "cup", Almuerzo: "pot", Cena: "plate", Algo: "dessert" };
const momentArticle: Record<Moment, string> = { Desayuno: "el desayuno", Almuerzo: "el almuerzo", Cena: "la cena", Algo: "el algo" };

// H04: la semana anterior y la siguiente funcionan. Semana 0 = lunes 5 de octubre de 2026.
function weekDays(offset: number): Day[] {
  return DAY_KEYS.map((key, index) => {
    const date = new Date(2026, 9, 5 + offset * 7 + index);
    return { key, label: DAY_LABELS[index], date: `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`, long: `${date.getDate()} de ${MONTHS[date.getMonth()]}` };
  });
}
function weekRange(offset: number) {
  const start = new Date(2026, 9, 5 + offset * 7);
  const end = new Date(2026, 9, 11 + offset * 7);
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()}–${end.getDate()} de ${MONTHS[end.getMonth()]}`
    : `${start.getDate()} de ${MONTHS[start.getMonth()]} – ${end.getDate()} de ${MONTHS[end.getMonth()]}`;
}

// H12: fotos reales de cada plato (Wikimedia Commons, licencias libres; créditos en public/recetas/creditos.json)
const recipeDetails = {
  "Ajiaco santafereño": {
    time: "1 h 30 min", servings: 6, tag: "Sopa bogotana", icon: "pot" as IconName, photo: "ajiaco",
    alt: "Ajiaco santafereño en olla de barro con arroz y aguacate", credit: "Jdvillalobos · CC BY 4.0",
    ingredients: ["Pollo", "Papas criolla, pastusa y sabanera", "Mazorca", "Guascas", "Alcaparras"],
    steps: ["Cocina el pollo y la mazorca.", "Agrega las papas y deja espesar.", "Termina con guascas y sirve con alcaparras."],
  },
  "Arepas de queso": {
    time: "30 min", servings: 4, tag: "Desayuno", icon: "arepa" as IconName, photo: "arepas",
    alt: "Arepa con queso rallado en un plato", credit: "Diana Moon · CC BY 2.0",
    ingredients: ["Harina de maíz", "Queso rallado", "Leche", "Mantequilla"],
    steps: ["Mezcla y amasa los ingredientes.", "Forma las arepas.", "Dora por ambos lados en una sartén."],
  },
  "Bandeja paisa": {
    time: "2 h", servings: 4, tag: "Plato fuerte antioqueño", icon: "plate" as IconName, photo: "bandeja",
    alt: "Bandeja paisa con fríjoles, chicharrón, huevo, arepas y plátano", credit: "Edgar Zuniga Jr. · CC BY 2.0",
    ingredients: ["Fríjoles", "Arroz", "Carne molida", "Chicharrón", "Plátano maduro"],
    steps: ["Cocina los fríjoles hasta que estén suaves.", "Prepara el arroz y las carnes.", "Sirve todo junto con plátano y aguacate."],
  },
  Changua: {
    time: "25 min", servings: 2, tag: "Desayuno santafereño", icon: "cup" as IconName, photo: "changua",
    alt: "Dos platos de changua con huevo, cilantro y calado", credit: "USDA · Dominio público",
    ingredients: ["Leche", "Agua", "Huevos", "Cebolla larga", "Cilantro"],
    steps: ["Hierve el agua con la leche y la cebolla.", "Agrega los huevos con cuidado.", "Sirve con cilantro y calado."],
  },
  "Sancocho de gallina": {
    time: "2 h 15 min", servings: 8, tag: "Para compartir", icon: "pot" as IconName, photo: "sancocho",
    alt: "Sancocho servido sobre hoja de plátano con yuca, mazorca y aguacate", credit: "Daniestrella123 · CC BY-SA 4.0",
    ingredients: ["Gallina", "Yuca", "Plátano verde", "Papa", "Cilantro"],
    steps: ["Cocina la gallina hasta ablandarla.", "Agrega plátano, yuca y papa.", "Rectifica la sazón y termina con cilantro."],
  },
  Natilla: {
    time: "45 min", servings: 10, tag: "Postre navideño", icon: "dessert" as IconName, photo: "natilla",
    alt: "Porción de natilla sobre un plato en mantel navideño", credit: "Jdvillalobos · CC0",
    ingredients: ["Leche", "Fécula de maíz", "Panela", "Canela", "Coco rallado"],
    steps: ["Disuelve la fécula en parte de la leche.", "Cocina todo revolviendo hasta espesar.", "Vierte en un molde y deja enfriar."],
  },
} as const;
const photo = (recipe: RecipeName) => `${import.meta.env.BASE_URL}recetas/${recipeDetails[recipe].photo}.jpg`;

const recipes = Object.keys(recipeDetails) as RecipeName[];
const storageKey = "mealie-c-semanas";
const preferencesKey = "mealie-c-preferencias";
const welcomeKey = "mealie-c-bienvenida-vista";
const defaultPreferences: Preferences = {
  theme: "light", textSize: 100, font: "system", wideSpacing: false, largeButtons: false,
  reduceMotion: false, persistentNotices: false, colorVision: "none",
};
const emptyWeek = (): Meals => ({ lunes: [], martes: [], miércoles: [], jueves: [], viernes: [], sábado: [], domingo: [] });
const initialWeeks: Weeks = {
  "0": {
    ...emptyWeek(),
    lunes: [{ id: "inicial-1", recipe: "Arepas de queso", moment: "Desayuno" }],
    jueves: [{ id: "inicial-2", recipe: "Bandeja paisa", moment: "Almuerzo" }],
    sábado: [{ id: "inicial-3", recipe: "Sancocho de gallina", moment: "Almuerzo" }],
  },
};

function loadWeeks(): Weeks {
  try { const stored = localStorage.getItem(storageKey); return stored ? (JSON.parse(stored) as Weeks) : initialWeeks; } catch { return initialWeeks; }
}
function loadPreferences(): Preferences {
  try { return { ...defaultPreferences, ...JSON.parse(localStorage.getItem(preferencesKey) ?? "{}") } as Preferences; } catch { return defaultPreferences; }
}
function readFlag(key: string) {
  try { return localStorage.getItem(key) === "1"; } catch { return false; }
}
function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase().trim();
}
function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
}
// H08: solo sugiere si de verdad se parece (antes "pizza" sugería Ajiaco santafereño).
function closestRecipe(query: string): RecipeName | null {
  const target = normalize(query);
  if (!target) return null;
  let best: RecipeName | null = null;
  let bestDistance = Infinity;
  for (const recipe of recipes) {
    const words = normalize(recipe).split(" ").filter((word) => word.length > 2);
    const distance = Math.min(...[normalize(recipe), ...words].map((word) => editDistance(target, word.slice(0, Math.max(target.length, 3)))));
    if (distance < bestDistance) { bestDistance = distance; best = recipe; }
  }
  return bestDistance <= Math.max(1, Math.floor(target.length * 0.34)) ? best : null;
}
const countPlanned = (meals: Meals) => DAY_KEYS.filter((key) => meals[key].length > 0).length;
const distinctRecipes = (meals: Meals) => new Set(DAY_KEYS.flatMap((key) => meals[key].map((meal) => meal.recipe))).size;

function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">{iconPaths[name]}</svg>;
}
function trapPanelFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
  if (event.key !== "Tab") return;
  const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select, [href], [tabindex]:not([tabindex='-1'])"));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1)!;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function Header({ view, textSize, onView, onWatch, onAccessibility, onHelp, onTextSize }: {
  view: "plan" | "recipes"; textSize: number;
  onView: (view: "plan" | "recipes") => void; onWatch: () => void;
  onAccessibility: (event: MouseEvent<HTMLButtonElement>) => void; onHelp: (event: MouseEvent<HTMLButtonElement>) => void;
  onTextSize: (value: number) => void;
}) {
  return (
    <header className="app-header">
      <div className="brand"><div className="brand-mark"><Icon name="pot" /></div><span>Mealie</span></div>
      <nav aria-label="Navegación principal">
        <button aria-current={view === "plan" ? "page" : undefined} className={`nav-item ${view === "plan" ? "active" : ""}`} onClick={() => onView("plan")}><Icon name="calendar" />Planificador</button>
        <button aria-current={view === "recipes" ? "page" : undefined} className={`nav-item ${view === "recipes" ? "active" : ""}`} onClick={() => onView("recipes")}><Icon name="book" />Recetas</button>
      </nav>
      <div className="header-actions">
        {/* H05: tamaño de letra a la vista */}
        <div aria-label="Tamaño del texto" className="quick-text" role="group">
          <button aria-label="Reducir tamaño del texto" disabled={textSize <= 100} onClick={() => onTextSize(textSize - 10)}>A−</button>
          <span aria-live="polite">{textSize} %</span>
          <button aria-label="Aumentar tamaño del texto" disabled={textSize >= 200} onClick={() => onTextSize(textSize + 10)}>A+</button>
        </div>
        <button aria-label="Accesibilidad" className="header-link" onClick={onAccessibility}><Icon name="accessibility" />Accesibilidad</button>
        {/* H01: ayuda visible */}
        <button aria-label="Ayuda" className="header-link help-link" onClick={onHelp}><Icon name="help" />Ayuda</button>
        <button aria-label="Vista reloj" className="watch-link" onClick={onWatch}><Icon name="watch" />Vista reloj</button>
        <span className="profile"><span aria-hidden="true">G</span>Gloria</span>
      </div>
    </header>
  );
}

// H10/H12: portada cálida con lo que se cocina hoy
function KitchenHero({ meals, offset, onRecipe, onAddToday }: {
  meals: Meals; offset: number;
  onRecipe: (recipe: RecipeName, event: MouseEvent<HTMLButtonElement>) => void; onAddToday: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const today = offset === 0 ? meals.lunes : [];
  const featured = today[0];
  const planned = countPlanned(meals);
  return (
    <section aria-labelledby="hero-title" className="hero">
      <div className="hero-text">
        <p className="hero-kicker"><Icon name="leaf" />{offset === 0 ? "Hoy, lunes 5 de octubre" : `Semana del ${weekRange(offset)}`}</p>
        <h1 id="hero-title">{offset === 0 ? "¡Buenos días, Gloria!" : "Planeando otra semana"}</h1>
        <p className="hero-lead">
          {featured ? <>Hoy en la cocina: <strong>{featured.recipe}</strong> para {momentArticle[featured.moment]}.</> : offset === 0 ? "Hoy todavía no hay nada en la olla." : "Elija un día y agregue la primera comida."}
          {" "}{planned === 7 ? "La semana ya está completa." : `Lleva ${planned} de 7 días con comida.`}
        </p>
        <div className="hero-actions">
          {featured ? <button className="primary" onClick={(event) => onRecipe(featured.recipe, event)}><Icon name="book" />Ver la receta de hoy</button> : offset === 0 && <button className="primary" onClick={onAddToday}><Icon name="plus" />Agregar comida para hoy</button>}
        </div>
      </div>
      {featured ? (
        <figure className="hero-photo">
          <img alt={recipeDetails[featured.recipe].alt} height={720} src={photo(featured.recipe)} width={960} />
          
        </figure>
      ) : (
        <div aria-hidden="true" className="hero-photo hero-empty"><Icon className="art-icon" name="pot" /><span className="steam s1" /><span className="steam s2" /><span className="steam s3" /></div>
      )}
    </section>
  );
}

function Welcome({ onClose, onHelp }: { onClose: () => void; onHelp: (event: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <section aria-labelledby="welcome-title" className="welcome">
      <div className="welcome-body">
        <h2 id="welcome-title">Así se planea la semana</h2>
        <ol className="welcome-steps">
          <li><span className="step-n">1</span><span>En el día que quiera, pulse <strong>Agregar comida</strong>.</span></li>
          <li><span className="step-n">2</span><span>Busque la receta (o pulse <strong>Sorpréndame</strong>) y elija desayuno, almuerzo, cena o algo.</span></li>
          <li><span className="step-n">3</span><span>¿Se equivocó? En <strong>Opciones</strong> puede editarla, moverla o quitarla, y <strong>Deshacer</strong> la recupera.</span></li>
        </ol>
        <div className="welcome-actions">
          <button className="primary" onClick={onClose}><Icon name="check" />Entendido</button>
          <button className="secondary" onClick={onHelp}><Icon name="help" />Ver toda la ayuda</button>
        </div>
      </div>
    </section>
  );
}

function WeekToolbar({ meals, offset, canUndo, canRedo, savedAt, onListen, onWeek, onUndo, onRedo }: {
  meals: Meals; offset: number; canUndo: boolean; canRedo: boolean; savedAt: string | null;
  onListen: () => void; onWeek: (delta: number) => void; onUndo: () => void; onRedo: () => void;
}) {
  const days = weekDays(offset);
  const planned = countPlanned(meals);
  const missing = days.filter((day) => meals[day.key].length === 0).map((day) => day.key);
  const variety = distinctRecipes(meals);
  return (
    <>
      <div className="title-row">
        <div><p className="eyebrow">PLANIFICACIÓN SEMANAL</p><h2 className="page-title">Mi menú</h2></div>
        <div className="toolbar-actions">
          <button className="listen-button" onClick={onListen}><Icon name="speaker" />Escuchar resumen</button>
          <div className="week-nav">
            <button aria-label="Ver la semana anterior" onClick={() => onWeek(-1)}><Icon name="arrow" /><span>Semana anterior</span></button>
            <strong aria-live="polite">{weekRange(offset)}</strong>
            <button aria-label="Ver la semana siguiente" onClick={() => onWeek(1)}><span>Semana siguiente</span><Icon name="chevron" /></button>
          </div>
        </div>
      </div>
      <div className={`status-bar ${planned === 7 ? "complete" : ""}`}>
        <div className="status-text" aria-label="Progreso del menú semanal" aria-valuemax={7} aria-valuemin={0} aria-valuenow={planned} aria-valuetext={`${planned} de 7 días con comida`} role="progressbar">
          <p><strong>{planned === 7 ? "¡Semana completa! La cocina está lista" : `${planned} de 7 días con comida`}</strong><span>{planned === 7 ? ` · ${variety} recetas distintas` : ` · Faltan: ${missing.join(", ")}`}</span></p>
          {/* H10: la semana como 7 platos que se van llenando */}
          <ol aria-hidden="true" className="plates">
            {days.map((day) => {
              const first = meals[day.key][0];
              return (
                <li className={first ? "full" : ""} key={day.key}>
                  {first ? <img alt="" src={photo(first.recipe)} /> : <span />}
                  <small>{day.label.slice(0, 3)}</small>
                </li>
              );
            })}
          </ol>
        </div>
        {/* H03: deshacer y rehacer siempre visibles · H06: guardado visible */}
        <div className="history-actions">
          <button disabled={!canUndo} onClick={onUndo}><Icon name="undo" />Deshacer</button>
          <button disabled={!canRedo} onClick={onRedo}><Icon name="redo" />Rehacer</button>
          <span className="saved" role="status"><Icon name="saved" />{savedAt ? `Guardado ${savedAt}` : "Se guarda solo en este navegador"}</span>
        </div>
      </div>
    </>
  );
}


// Menús flotantes siempre dentro de la pantalla: se abren abajo del botón y, si no caben, hacia arriba.
function useFixedPopover(open: boolean, anchor: () => HTMLElement | null, floating: RefObject<HTMLElement | null>): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({ position: "fixed", visibility: "hidden" });
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const a = anchor();
      const f = floating.current;
      if (!a || !f) return;
      // Con la escala base (zoom en .app-shell) las medidas son visuales y top/left se multiplican por el zoom
      const z = Number.parseFloat(getComputedStyle(f.closest(".app-shell") ?? f).zoom) || 1;
      const r = a.getBoundingClientRect();
      const h = Math.min(f.getBoundingClientRect().height, window.innerHeight - 16);
      const w = f.getBoundingClientRect().width;
      let top = r.bottom + 6;
      if (top + h > window.innerHeight - 8) top = r.top - h - 6;
      top = Math.max(8, Math.min(top, window.innerHeight - h - 8));
      const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
      setStyle({ position: "fixed", top: top / z, left: left / z, maxHeight: (window.innerHeight - 16) / z, overflowY: "auto", visibility: "visible" });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); };
  }, [open]);
  return style;
}

function MealOptions({ meal, dayKey, onRecipe, onEdit, onMoveStart, onRemove }: {
  meal: Meal; dayKey: DayKey;
  onRecipe: (event: MouseEvent<HTMLButtonElement>) => void; onEdit: (opener: HTMLElement) => void; onMoveStart: (opener: HTMLElement) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) menu.current?.querySelector<HTMLButtonElement>("[role='menuitem']")?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onClick = (event: globalThis.MouseEvent) => {
      if (!menu.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const close = () => { setOpen(false); button.current?.focus(); };
  const menuStyle = useFixedPopover(open, () => button.current, menu);
  return (
    <div className="meal-options-wrap">
      <button aria-expanded={open} aria-haspopup="menu" aria-label={`Opciones de ${meal.recipe} del ${dayKey}`} className="options-button" onClick={() => setOpen(!open)} ref={button}>
        <Icon name="dots" />Opciones
      </button>
      {open && (
        <div
          aria-label={`Opciones de ${meal.recipe}`} className="options-menu" ref={menu} role="menu" style={menuStyle}
          onKeyDown={(event) => {
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[role='menuitem']"));
            const current = items.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
            if (event.key === "Tab") setOpen(false);
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
            items[next]?.focus();
          }}
        >
          <button onClick={(event) => { setOpen(false); onRecipe(event); }} role="menuitem"><Icon name="book" />Ver receta</button>
          {/* H13: editar momento o receta sin borrar y volver a crear */}
          <button onClick={() => { setOpen(false); onEdit(button.current!); }} role="menuitem"><Icon name="edit" /><span>Editar<small>Cambiar momento o receta</small></span></button>
          <button onClick={() => { setOpen(false); onMoveStart(button.current!); }} role="menuitem"><Icon name="move" />Mover a otro día</button>
          {/* H07: dice qué se quita y que se puede deshacer */}
          <button onClick={() => { setOpen(false); onRemove(); }} role="menuitem"><Icon name="trash" /><span>Quitar del {dayKey}<small>Se puede deshacer</small></span></button>
        </div>
      )}
    </div>
  );
}

function MoveMenu({ meal, dayKey, allMeals, onClose, onMove }: { meal: Meal; dayKey: DayKey; allMeals: Meals; onClose: () => void; onMove: (id: string, target: DayKey) => void }) {
  const marker = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const style = useFixedPopover(true, () => marker.current?.parentElement?.querySelector<HTMLElement>(".options-button") ?? marker.current?.parentElement ?? null, panel);
  return (
    <>
      <span hidden ref={marker} />
      <div
        className="move-menu" ref={panel} style={style}
        onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); return; }
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(".move-option"));
          const current = options.indexOf(event.target as HTMLButtonElement);
          if (current < 0) return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
          options[next]?.focus();
        }}
      >
        <div className="move-menu-title">
          <div><strong>Mover {meal.recipe} a</strong><small>Elija otro día de esta semana</small></div>
          <button aria-label="Cerrar lista de días" onClick={onClose}><Icon name="close" /><span>Cerrar</span></button>
        </div>
        {DAY_KEYS.filter((key) => key !== dayKey).map((key) => (
          <button autoFocus={key === DAY_KEYS.find((k) => k !== dayKey && !allMeals[k].length)} className="move-option" key={key} onClick={() => onMove(meal.id, key)}>
            <Icon name="calendar" />
            <span>{DAY_LABELS[DAY_KEYS.indexOf(key)]}<small>{allMeals[key].length ? "ya tiene comida" : "libre"}</small></span>
            <Icon name="chevron" />
          </button>
        ))}
      </div>
    </>
  );
}

function DayCard({ day, meals, allMeals, isToday, movingMeal, onAdd, onEdit, onMoveStart, onMoveClose, onMove, onRemove, onRecipe }: {
  day: Day; meals: Meal[]; allMeals: Meals; isToday: boolean; movingMeal: { day: DayKey; id: string } | null;
  onAdd: (event: MouseEvent<HTMLButtonElement>) => void; onEdit: (meal: Meal, opener: HTMLElement) => void;
  onMoveStart: (id: string, opener: HTMLElement) => void; onMoveClose: () => void;
  onMove: (id: string, target: DayKey) => void; onRemove: (id: string) => void; onRecipe: (recipe: RecipeName, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <article aria-labelledby={`dia-${day.key}`} className={`day-col ${meals.length ? "has-meal" : "is-empty"} ${isToday ? "today-card" : ""}`}>
      <header className="day-head">
        <h3 className="day-title" id={`dia-${day.key}`} tabIndex={-1}>{day.label}</h3>
        <span className="day-date">{day.date}</span>
        {isToday && <span className="today-pill">Hoy</span>}
        <span className="sr-only">{meals.length ? "Con comida" : "Sin comida"}</span>
      </header>
      {meals.map((meal) => {
        const isMoving = movingMeal?.day === day.key && movingMeal.id === meal.id;
        return (
          <div className="dish" key={meal.id}>
            <div className="dish-photo">
              <img alt="" height={720} loading="lazy" src={photo(meal.recipe)} width={960} />
              <span className="dish-moment"><Icon name={momentIcon[meal.moment]} />{meal.moment}</span>
            </div>
            <div className="dish-body">
              <h4>{meal.recipe}</h4>
              <p className="meal-meta"><Icon name="watch" />{recipeDetails[meal.recipe].time}</p>
              {/* H02: una sola puerta de entrada a las acciones de la comida */}
              <MealOptions dayKey={day.key} meal={meal} onEdit={(opener) => onEdit(meal, opener)} onMoveStart={(opener) => onMoveStart(meal.id, opener)} onRecipe={(event) => onRecipe(meal.recipe, event)} onRemove={() => onRemove(meal.id)} />
            </div>
            {isMoving && <MoveMenu allMeals={allMeals} dayKey={day.key} meal={meal} onClose={onMoveClose} onMove={onMove} />}
          </div>
        );
      })}
      {meals.length ? (
        <button aria-label={`Agregar otra comida al ${day.key} ${day.long}`} className="add-more" onClick={onAdd}><Icon name="plus" />Otra comida</button>
      ) : (
        <button aria-label={`Agregar comida al ${day.key} ${day.long}`} className="empty-plate" onClick={onAdd}>
          <span aria-hidden="true" className="plate-art"><Icon className="art-icon" name="plate" /><span className="plate-plus"><Icon name="plus" /></span></span>
          <span className="empty-plate-text">Agregar comida</span>
        </button>
      )}
    </article>
  );
}

// Panel para agregar y para editar (H13). Desde Recetas permite elegir el día.
function MealPanel({ editor, days, meals, onClose, onSubmit }: {
  editor: Editor; days: Day[]; meals: Meals; onClose: () => void; onSubmit: (day: DayKey, meal: Omit<Meal, "id">) => void;
}) {
  const editing = editor.mode === "edit";
  const initialRecipe = editing ? editor.meal.recipe : editor.recipe;
  const [query, setQuery] = useState("");
  const [moment, setMoment] = useState<Moment>(editing ? editor.meal.moment : initialRecipe === "Arepas de queso" || initialRecipe === "Changua" ? "Desayuno" : "Almuerzo");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeName | "">(initialRecipe ?? "");
  const [selectedDay, setSelectedDay] = useState<DayKey | "">(editor.day ?? "");
  const [surprise, setSurprise] = useState("");
  const fixedDay = editor.mode === "add" && editor.day ? days.find((d) => d.key === editor.day)! : null;
  const normalizedQuery = normalize(query);
  const filteredRecipes = recipes.filter((recipe) => normalize(recipe).includes(normalizedQuery));
  const hasNoResults = Boolean(normalizedQuery) && filteredRecipes.length === 0;
  const suggestion = hasNoResults ? closestRecipe(query) : null;
  const target = selectedDay ? days.find((d) => d.key === selectedDay)! : null;
  const unchanged = editing && selectedRecipe === editor.meal.recipe && moment === editor.meal.moment && selectedDay === editor.day;
  const ready = Boolean(selectedRecipe && selectedDay) && !unchanged;
  const surpriseMe = () => {
    const used = new Set(DAY_KEYS.flatMap((key) => meals[key].map((meal) => meal.recipe)));
    const pool = recipes.filter((recipe) => !used.has(recipe) && recipe !== selectedRecipe);
    const options = pool.length ? pool : recipes.filter((recipe) => recipe !== selectedRecipe);
    const pick = options[Math.floor(Math.random() * options.length)];
    setQuery("");
    setSelectedRecipe(pick);
    setSurprise(`¿Qué tal ${pick}? ${pool.length ? "Todavía no está en su semana." : ""}`);
  };
  const title = editing ? "Editar comida" : fixedDay ? `Agregar comida · ${fixedDay.key} ${fixedDay.date}` : `Planear ${initialRecipe ?? "una comida"}`;
  const reason = !selectedDay ? "Elija un día para continuar." : !selectedRecipe ? "Elija una receta para continuar." : unchanged ? "Cambie el momento, la receta o el día para guardar." : "";
  return (
    <div className="panel-backdrop" onKeyDown={trapPanelFocus}>
      <aside aria-labelledby="meal-title" aria-modal="true" className="side-panel" role="dialog">
        <div className="panel-header">
          <div><p className="eyebrow">{editing ? `${editor.meal.recipe.toUpperCase()} · ${editor.day.toUpperCase()}` : "NUEVA COMIDA"}</p><h2 id="meal-title">{title}</h2></div>
          <button className="text-button" onClick={onClose}><Icon name="close" />Cerrar</button>
        </div>
        {!fixedDay && (
          <fieldset>
            <legend>¿Qué día?</legend>
            <div className="day-options">
              {days.map((d) => (
                <label className={selectedDay === d.key ? "checked" : ""} key={d.key}>
                  <input checked={selectedDay === d.key} name="target-day" onChange={() => setSelectedDay(d.key)} type="radio" />{d.label} <small>{d.date}</small>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <fieldset>
          <legend>Momento de la comida</legend>
          <div className="meal-options">
            {MOMENTS.map((option) => (
              <label className={moment === option ? "checked" : ""} key={option}>
                <input autoFocus={editing && option === moment} checked={moment === option} name="meal-type" onChange={() => setMoment(option)} type="radio" /><Icon name={momentIcon[option]} />{option}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="search-row">
          <label className="search-label" htmlFor="recipe-search">Buscar una receta</label>
          {/* H10: sorpresa para cuando no hay ideas */}
          <button className="surprise-button" onClick={surpriseMe} type="button"><Icon name="dice" />Sorpréndame</button>
        </div>
        <div className="search-box">
          <Icon name="search" />
          <input autoFocus={!editing && Boolean(fixedDay)} id="recipe-search" onChange={(event) => { setQuery(event.target.value); setSurprise(""); }} placeholder="Escriba el nombre de una receta" value={query} />
        </div>
        {surprise && <p className="surprise-note" role="status"><Icon name="dice" />{surprise}</p>}
        {hasNoResults ? (
          <div className="warning-state" role="status">
            <div className="state-heading"><span aria-hidden="true">⚠</span><strong>No encontramos “{query}”.</strong></div>
            {suggestion ? (
              <>
                <p>¿Quiso decir {suggestion}?</p>
                <div className="warning-actions">
                  <button onClick={() => { setQuery(suggestion); setSelectedRecipe(suggestion); }}><Icon name="search" />Ver {suggestion}</button>
                  <button onClick={() => setQuery("")}><Icon name="trash" />Borrar búsqueda</button>
                </div>
              </>
            ) : (
              <>
                <p>Esa receta no está en sus recetas guardadas.</p>
                <div className="warning-actions"><button onClick={() => setQuery("")}><Icon name="book" />Ver todas las recetas</button></div>
              </>
            )}
          </div>
        ) : (
          <div className="recipe-list">
            <p className="list-label">{normalizedQuery ? "RESULTADOS" : "TODAS LAS RECETAS"}</p>
            {filteredRecipes.map((recipe) => (
              <label className={`recipe-option ${selectedRecipe === recipe ? "selected" : ""}`} key={recipe}>
                <input checked={selectedRecipe === recipe} name="recipe" onChange={() => { setSelectedRecipe(recipe); setSurprise(""); }} type="radio" />
                <img alt="" className="recipe-thumb" src={photo(recipe)} />
                <span><strong>{recipe}</strong><small>{recipeDetails[recipe].time} · {recipeDetails[recipe].tag}</small></span>
                {selectedRecipe === recipe && <span className="selected-check"><Icon name="check" />Elegida</span>}
              </label>
            ))}
          </div>
        )}
        <div className="panel-footer meal-footer">
          {!ready && <p className="footer-reason" id="meal-disabled-reason">{reason}</p>}
          <div className="footer-buttons">
            <button className="secondary" onClick={onClose}><Icon name="close" />Cancelar</button>
            <button aria-describedby={!ready ? "meal-disabled-reason" : undefined} className="primary" disabled={!ready} onClick={() => selectedRecipe && selectedDay && onSubmit(selectedDay, { recipe: selectedRecipe, moment })}>
              <Icon name={editing ? "check" : "plus"} />{editing ? "Guardar cambios" : target ? `Agregar al ${target.key}` : "Agregar"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function RecipePanel({ recipe, plannedOn, onClose, onPlan }: { recipe: RecipeName; plannedOn: string[]; onClose: () => void; onPlan: () => void }) {
  const details = recipeDetails[recipe];
  const [checked, setChecked] = useState<string[]>([]);
  const toggle = (item: string) => setChecked((current) => (current.includes(item) ? current.filter((x) => x !== item) : [...current, item]));
  return (
    <div className="panel-backdrop" onKeyDown={trapPanelFocus}>
      <aside aria-labelledby="recipe-title" aria-modal="true" className="side-panel recipe-panel" role="dialog">
        <div className="recipe-cover">
          <img alt={details.alt} height={720} src={photo(recipe)} width={960} />
          <button aria-label="Cerrar receta" autoFocus className="cover-close" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="recipe-content">
          <p className="recipe-kicker">{details.tag}</p>
          <h2 id="recipe-title">{recipe}</h2>
          <dl className="recipe-stats">
            <div><dt><Icon name="watch" />Tiempo</dt><dd>{details.time}</dd></div>
            <div><dt><Icon name="users" />Porciones</dt><dd>{details.servings}</dd></div>
            <div><dt><Icon name="food" />Ingredientes</dt><dd>{details.ingredients.length}</dd></div>
          </dl>
          <p className={`planned-line ${plannedOn.length ? "on" : ""}`}><span aria-hidden="true" className="dot" />{plannedOn.length ? `En su menú: ${plannedOn.join(", ")}` : "Aún no está en el menú de esta semana"}</p>
          <section className="recipe-section">
            <div className="section-title"><h3>Ingredientes</h3><span className="muted">{checked.length} de {details.ingredients.length} listos</span></div>
            <ul className="ingredient-list">
              {details.ingredients.map((ingredient) => (
                <li key={ingredient}>
                  <label className={checked.includes(ingredient) ? "done" : ""}>
                    <input checked={checked.includes(ingredient)} onChange={() => toggle(ingredient)} type="checkbox" />
                    <span>{ingredient}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
          <section className="recipe-section">
            <div className="section-title"><h3>Preparación</h3><span className="muted">{details.steps.length} pasos</span></div>
            <ol className="step-list">
              {details.steps.map((step, index) => <li key={step}><span aria-hidden="true" className="step-num">{index + 1}</span><p><span className="sr-only">Paso {index + 1}: </span>{step}</p></li>)}
            </ol>
          </section>
        </div>
        <div className="panel-footer recipe-footer">
          <div className="footer-buttons">
            <button className="secondary" onClick={onClose}><Icon name="close" />Cerrar</button>
            <button className="primary" onClick={onPlan}><Icon name="calendar" />Planear esta receta</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// H04: la sección Recetas funciona · H12: con foto de cada plato
const recipeGroup: Record<RecipeName, "Desayunos" | "Almuerzos" | "Postres"> = {
  "Ajiaco santafereño": "Almuerzos", "Arepas de queso": "Desayunos", "Bandeja paisa": "Almuerzos",
  Changua: "Desayunos", "Sancocho de gallina": "Almuerzos", Natilla: "Postres",
};
function RecipesView({ meals, onRecipe, onPlan }: { meals: Meals; onRecipe: (recipe: RecipeName, event: MouseEvent<HTMLButtonElement>) => void; onPlan: (recipe: RecipeName, event: MouseEvent<HTMLButtonElement>) => void }) {
  const [group, setGroup] = useState<"Todas" | "Desayunos" | "Almuerzos" | "Postres">("Todas");
  const shown = recipes.filter((recipe) => group === "Todas" || recipeGroup[recipe] === group);
  return (
    <main id="menu-semana" tabIndex={-1}>
      <div className="recipes-head">
        <div><p className="eyebrow">RECETAS DEL HOGAR</p><h1>Recetas</h1><p className="recipes-sub">{recipes.length} recetas guardadas · elija una para verla o planearla en la semana</p></div>
        <div aria-label="Filtrar recetas" className="recipe-filters" role="group">
          {(["Todas", "Desayunos", "Almuerzos", "Postres"] as const).map((option) => (
            <button aria-pressed={group === option} className={group === option ? "active" : ""} key={option} onClick={() => setGroup(option)}>{option}</button>
          ))}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">{shown.length} recetas</p>
      <ul className="recipes-grid">
        {shown.map((recipe) => {
          const plannedOn = DAY_KEYS.filter((key) => meals[key].some((meal) => meal.recipe === recipe));
          const details = recipeDetails[recipe];
          return (
            <li className="recipe-card" key={recipe}>
              <figure className="recipe-card-photo">
                <img alt={details.alt} height={720} loading="lazy" src={photo(recipe)} width={960} />
                
              </figure>
              <div className="recipe-card-body">
                <p className="recipe-kicker">{details.tag}</p>
                <h2>{recipe}</h2>
                <ul className="recipe-meta">
                  <li><Icon name="watch" />{details.time}</li>
                  <li><Icon name="users" />{details.servings} porciones</li>
                  <li><Icon name="food" />{details.ingredients.length} ingredientes</li>
                </ul>
                <p className={`planned-line ${plannedOn.length ? "on" : ""}`}>
                  <span aria-hidden="true" className="dot" />{plannedOn.length ? `En el menú: ${plannedOn.join(", ")}` : "Aún no está en el menú de esta semana"}
                </p>
                <div className="recipe-card-actions">
                  <button className="ghost" onClick={(event) => onRecipe(recipe, event)}><Icon name="book" />Ver receta</button>
                  <button className="primary" onClick={(event) => onPlan(recipe, event)}><Icon name="calendar" />Planear</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function AccessibilityPanel({ preferences, onChange, onClose, onReset }: {
  preferences: Preferences; onChange: (next: Preferences) => void; onClose: () => void; onReset: () => void;
}) {
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => onChange({ ...preferences, [key]: value });
  const setTextSize = (value: number) => update("textSize", Math.min(200, Math.max(100, value)));
  return (
    <div className="panel-backdrop" onKeyDown={trapPanelFocus}>
      <aside aria-labelledby="a11y-title" aria-modal="true" className="side-panel accessibility-panel" role="dialog">
        <div className="panel-header">
          <div><p className="eyebrow">PREFERENCIAS</p><h2 id="a11y-title">Accesibilidad</h2></div>
          <button autoFocus className="text-button" onClick={onClose}><Icon name="close" />Cerrar</button>
        </div>
        <fieldset>
          <legend>Tema</legend>
          <div className="choice-grid">
            {([["system", "Del sistema"], ["light", "Claro"], ["dark", "Oscuro"], ["contrast", "Alto contraste"]] as const).map(([value, label]) => (
              <label className={preferences.theme === value ? "checked" : ""} key={value}><input checked={preferences.theme === value} name="theme" onChange={() => update("theme", value)} type="radio" />{label}</label>
            ))}
          </div>
          <p className="field-help">Alto contraste usa texto amarillo sobre fondo negro.</p>
        </fieldset>
        <fieldset>
          <legend>Tamaño del texto: {preferences.textSize} %</legend>
          <div className="text-size-control">
            <button aria-label="Reducir tamaño del texto" disabled={preferences.textSize === 100} onClick={() => setTextSize(preferences.textSize - 10)}>A−</button>
            <input aria-label="Tamaño del texto en porcentaje" max="200" min="100" onChange={(event) => setTextSize(Number(event.target.value))} step="10" type="range" value={preferences.textSize} />
            <button aria-label="Aumentar tamaño del texto" disabled={preferences.textSize === 200} onClick={() => setTextSize(preferences.textSize + 10)}>A+</button>
          </div>
          <p className="field-help">También puede cambiarlo con A− y A+ en la parte de arriba.</p>
        </fieldset>
        <fieldset>
          <legend>Tipo de letra</legend>
          <div className="choice-grid">
            {([["atkinson", "Atkinson Hyperlegible"], ["lexend", "Lexend"], ["system", "Del sistema"]] as const).map(([value, label]) => (
              <label className={preferences.font === value ? "checked" : ""} key={value}><input checked={preferences.font === value} name="font" onChange={() => update("font", value)} type="radio" />{label}</label>
            ))}
          </div>
        </fieldset>
        <div className="switch-list">
          {([
            ["wideSpacing", "Espaciado amplio", "Línea 1.9, letras 0.08 em y palabras 0.16 em."],
            ["largeButtons", "Botones más grandes", "Aumenta las áreas interactivas a 56 px."],
            ["reduceMotion", "Reducir animaciones", "También se respeta la preferencia del sistema."],
            ["persistentNotices", "Avisos sin tiempo límite", "Los avisos permanecen hasta cerrarlos o deshacer."],
          ] as const).map(([key, label, help]) => (
            <label className="switch-row" key={key}>
              <input checked={preferences[key]} onChange={(event) => update(key, event.target.checked)} type="checkbox" />
              <span><strong>{label}</strong><small>{help}</small></span>
            </label>
          ))}
        </div>
        <fieldset>
          <legend>Modo daltonismo</legend>
          <div className="choice-grid">
            {([["none", "Ninguno"], ["protanopia", "Protanopia"], ["deuteranopia", "Deuteranopia"], ["tritanopia", "Tritanopia"]] as const).map(([value, label]) => (
              <label className={preferences.colorVision === value ? "checked" : ""} key={value}><input checked={preferences.colorVision === value} name="color-vision" onChange={() => update("colorVision", value)} type="radio" />{label}</label>
            ))}
          </div>
          <p className="field-help">Los modos adaptados usan azul y naranja, además de íconos y texto.</p>
        </fieldset>
        {/* H09: término "valores por defecto" */}
        <div className="reset-box">
          <p><strong>Restablecer valores por defecto</strong></p>
          <p>Vuelve al tema claro, texto al 100 %, letra del sistema y desactiva las demás opciones. Su menú no se borra.</p>
          <button className="secondary" onClick={onReset}><Icon name="undo" />Restablecer valores por defecto</button>
        </div>
      </aside>
    </div>
  );
}

// H01: ayuda de la tarea + preguntas frecuentes + atajos
function HelpPanel({ onClose, onShowWelcome }: { onClose: () => void; onShowWelcome: () => void }) {
  return (
    <div className="panel-backdrop" onKeyDown={trapPanelFocus}>
      <aside aria-labelledby="help-title" aria-modal="true" className="side-panel help-panel" role="dialog">
        <div className="panel-header">
          <div><p className="eyebrow">AYUDA</p><h2 id="help-title">¿Cómo planear el menú?</h2></div>
          <button autoFocus className="text-button" onClick={onClose}><Icon name="close" />Cerrar</button>
        </div>
        <section className="help-section">
          <h3>Paso a paso</h3>
          <ol className="help-steps">
            <li><Icon name="plus" /><span><strong>Agregar:</strong> en la tarjeta del día pulse <em>Agregar comida</em>, busque la receta (por ejemplo, “ajiaco”) o pulse <em>Sorpréndame</em>, elija el momento y pulse <em>Agregar al martes</em>.</span></li>
            <li><Icon name="edit" /><span><strong>Corregir:</strong> en la comida pulse <em>Opciones → Editar</em> para cambiar el momento (por ejemplo, de almuerzo a desayuno) o la receta.</span></li>
            <li><Icon name="move" /><span><strong>Cambiar de día:</strong> <em>Opciones → Mover a otro día</em>. Los días libres dicen “libre”.</span></li>
            <li><Icon name="undo" /><span><strong>Si se equivoca:</strong> pulse <em>Deshacer</em> en la barra de la semana. <em>Rehacer</em> vuelve a aplicar el cambio.</span></li>
            <li><Icon name="calendar" /><span><strong>Qué falta:</strong> la barra muestra los 7 platos de la semana; los vacíos son los días que faltan.</span></li>
          </ol>
          <button className="secondary" onClick={onShowWelcome}><Icon name="help" />Volver a ver la guía de inicio</button>
        </section>
        <section className="help-section">
          <h3>Preguntas frecuentes</h3>
          <dl className="faq">
            <div><dt>Puse natilla como almuerzo y era desayuno, ¿la borro?</dt><dd>No hace falta: <em>Opciones → Editar</em>, elija <em>Desayuno</em> y pulse <em>Guardar cambios</em>.</dd></div>
            <div><dt>¿Se pierde lo que planeo si cierro la página?</dt><dd>No. Se guarda en este navegador; arriba verá “Guardado” después de cada cambio.</dd></div>
            <div><dt>¿Quitar una comida borra la receta?</dt><dd>No. Solo la quita de ese día; la receta sigue en <em>Recetas</em> y puede deshacer.</dd></div>
            <div><dt>¿Puedo poner varias comidas el mismo día?</dt><dd>Sí: desayuno, almuerzo, cena o algo. Pulse <em>Agregar comida</em> otra vez.</dd></div>
            <div><dt>La letra está muy pequeña, ¿qué hago?</dt><dd>Use <em>A+</em> arriba a la derecha, o <em>Accesibilidad</em> para más opciones.</dd></div>
          </dl>
        </section>
        <section className="help-section">
          <h3>Atajos de teclado</h3>
          <dl className="shortcut-list">
            <div><dt><kbd>Ctrl</kbd> + <kbd>Z</kbd></dt><dd>Deshacer el último cambio</dd></div>
            <div><dt><kbd>Ctrl</kbd> + <kbd>Y</kbd></dt><dd>Rehacer</dd></div>
            <div><dt><kbd>Esc</kbd></dt><dd>Cerrar paneles y menús</dd></div>
            <div><dt><kbd>Alt</kbd> + <kbd>A</kbd></dt><dd>Abrir Accesibilidad</dd></div>
            <div><dt><kbd>Alt</kbd> + <kbd>F</kbd></dt><dd>Agregar comida al primer día que falta</dd></div>
          </dl>
        </section>
        <section className="help-section">
          <h3>Créditos de las fotos</h3>
          <p className="field-help">Fotos de Wikimedia Commons con licencias libres: {recipes.map((recipe) => `${recipe} (${recipeDetails[recipe].credit})`).join("; ")}.</p>
        </section>
      </aside>
    </div>
  );
}

function Toast({ notice, onClose, onUndo, persistent }: { notice: NonNullable<Notice>; onClose: () => void; onUndo: () => void; persistent: boolean }) {
  const remaining = useRef(12000);
  const started = useRef(Date.now());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const start = () => {
    if (timer.current) return;
    started.current = Date.now();
    timer.current = setTimeout(() => { timer.current = null; onClose(); }, Math.max(remaining.current, 0));
  };
  const pause = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current -= Date.now() - started.current;
  };
  useEffect(() => {
    remaining.current = 12000;
    if (!persistent) start();
    return () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  }, [notice.id, persistent]);
  return (
    <div
      aria-label="Aviso del menú" className="toast" role="region"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { focused.current = false; if (!hovered.current && !persistent) start(); } }}
      onFocus={() => { focused.current = true; pause(); }}
      onMouseEnter={() => { hovered.current = true; pause(); }}
      onMouseLeave={() => { hovered.current = false; if (!focused.current && !persistent) start(); }}
    >
      {notice.recipe ? <img alt="" className="toast-photo" src={photo(notice.recipe)} /> : <span className="toast-check"><Icon name="check" /></span>}
      <div><strong>{notice.title}</strong><p>{notice.detail}</p></div>
      {notice.undoable && <button onClick={onUndo}><Icon name="undo" />Deshacer</button>}
      <button aria-label="Cerrar aviso" className="toast-close" onClick={onClose}><Icon name="close" /><span>Cerrar</span></button>
    </div>
  );
}

// H10: celebración al completar la semana (no aparece con "Reducir animaciones")
function Celebration() {
  const pieces = Array.from({ length: 28 }, (_, index) => index);
  const kinds = ["tomate", "mazorca", "aguacate", "aji", "cilantro"];
  return (
    <div aria-hidden="true" className="celebration">
      {pieces.map((index) => (
        <span className={`piece ${kinds[index % kinds.length]}`} key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 7) * 0.12}s`, animationDuration: `${2.2 + (index % 5) * 0.25}s` }} />
      ))}
    </div>
  );
}

function WatchView({ meals, onBack }: { meals: Meals; onBack: () => void }) {
  const [done, setDone] = useState(false);
  const tomorrow = meals.martes.find((meal) => meal.moment === "Almuerzo") ?? meals.martes[0];
  return (
    <main className="watch-page">
      <button className="back-button" onClick={onBack}><Icon name="arrow" />Volver al planificador</button>
      <div className="watch-intro"><p className="eyebrow">VISTA COMPACTA</p><h1>Recordatorio en el reloj</h1><p className="field-help">Así se vería el aviso de la noche anterior en un reloj.</p></div>
      <div className="watch-frame">
        <div className="watch-screen">
          <div className="watch-time">8:42</div>
          {!tomorrow ? (
            <div className="watch-done"><span><Icon name="calendar" /></span><strong>Mañana</strong><p>Todavía no hay comida para el martes</p></div>
          ) : done ? (
            <div className="watch-done" role="status"><span><Icon name="check" /></span><strong>¡Listo!</strong><p>Recordatorio completado</p><button className="watch-undo" onClick={() => setDone(false)}><Icon name="undo" />Deshacer</button></div>
          ) : (
            <><img alt="" className="watch-photo" src={photo(tomorrow.recipe)} /><p className="watch-kicker">MAÑANA · {tomorrow.moment.toUpperCase()}</p><h2>{tomorrow.recipe}</h2><div className="watch-note"><Icon name="calendar" /><span>Revisar ingredientes esta noche</span></div><button onClick={() => setDone(true)}><Icon name="check" />Listo</button></>
          )}
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const [weeks, setWeeks] = useState<Weeks>(loadWeeks);
  const [offset, setOffset] = useState(0);
  const [view, setView] = useState<"plan" | "recipes">("plan");
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [past, setPast] = useState<Weeks[]>([]);
  const [future, setFuture] = useState<Weeks[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [movingMeal, setMovingMeal] = useState<{ day: DayKey; id: string } | null>(null);
  const [recipeOpen, setRecipeOpen] = useState<RecipeName | null>(null);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => !readFlag(welcomeKey));
  const [notice, setNotice] = useState<Notice>(null);
  const [watchOpen, setWatchOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const noticeId = useRef(0);
  const opener = useRef<HTMLElement | null>(null);

  const meals: Meals = weeks[String(offset)] ?? emptyWeek();
  const days = weekDays(offset);
  const reduceMotion = preferences.reduceMotion || (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  const rememberOpener = (element?: HTMLElement | null) => {
    opener.current = element ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  };
  const restoreFocus = () => { const target = opener.current; requestAnimationFrame(() => target?.focus()); };
  const closeOverlays = () => {
    setEditor(null); setRecipeOpen(null); setAccessibilityOpen(false); setHelpOpen(false); setMovingMeal(null);
    restoreFocus();
  };
  const showNotice = (title: string, detail: string, undoable = true, recipe?: RecipeName) => {
    noticeId.current += 1;
    setNotice({ id: noticeId.current, title, detail, undoable, recipe });
  };
  const commit = (nextMeals: Meals, title: string, detail: string, liveMessage: string, recipe?: RecipeName) => {
    const before = countPlanned(meals);
    setPast((current) => [...current, weeks]);
    setFuture([]);
    setWeeks({ ...weeks, [String(offset)]: nextMeals });
    const after = countPlanned(nextMeals);
    if (after === 7 && before < 7) {
      if (!reduceMotion) setCelebrate((value) => value + 1);
      showNotice("¡Semana completa!", `${title}. Los 7 días tienen comida: la cocina está lista.`, true, recipe);
      setAnnouncement(`${liveMessage} ¡Semana completa!`);
      return;
    }
    showNotice(title, detail, true, recipe);
    setAnnouncement(liveMessage);
  };
  const undo = () => {
    const previous = past.at(-1);
    if (!previous) { setAnnouncement("No hay cambios para deshacer."); return; }
    setFuture((current) => [...current, weeks]);
    setPast((current) => current.slice(0, -1));
    setWeeks(previous);
    const count = countPlanned(previous[String(offset)] ?? emptyWeek());
    setAnnouncement(`Se deshizo el último cambio. ${count} de 7 días con comida.`);
    showNotice("Cambio deshecho", `${count} de 7 días con comida · Puede rehacerlo`, false);
  };
  const redo = () => {
    const next = future.at(-1);
    if (!next) { setAnnouncement("No hay cambios para rehacer."); return; }
    setPast((current) => [...current, weeks]);
    setFuture((current) => current.slice(0, -1));
    setWeeks(next);
    const count = countPlanned(next[String(offset)] ?? emptyWeek());
    setAnnouncement(`Se rehízo el cambio. ${count} de 7 días con comida.`);
    showNotice("Cambio rehecho", `${count} de 7 días con comida`, true);
  };

  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(weeks)); } catch { /* sin almacenamiento */ } }, [weeks]);
  useEffect(() => { if (past.length || future.length) setSavedAt("hace un momento"); }, [weeks]);
  useEffect(() => {
    if (!celebrate) return;
    const timer = setTimeout(() => setCelebrate(0), 3600);
    return () => clearTimeout(timer);
  }, [celebrate]);
  useEffect(() => {
    try { localStorage.setItem(preferencesKey, JSON.stringify(preferences)); } catch { /* sin almacenamiento */ }
    const root = document.documentElement;
    root.dataset.theme = preferences.theme;
    root.dataset.font = preferences.font;
    root.dataset.spacing = preferences.wideSpacing ? "wide" : "normal";
    root.dataset.largeButtons = String(preferences.largeButtons);
    root.dataset.reduceMotion = String(preferences.reduceMotion);
    root.dataset.colorVision = preferences.colorVision;
    root.dataset.textSize = preferences.textSize >= 150 ? "large" : "normal";
    root.style.setProperty("--text-scale", String(preferences.textSize / 100));
  }, [preferences]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const inField = event.target instanceof HTMLInputElement && event.target.type !== "radio" && event.target.type !== "checkbox";
      const key = event.key.toLocaleLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z" && !event.shiftKey && !inField) { event.preventDefault(); undo(); }
      if ((event.ctrlKey || event.metaKey) && (key === "y" || (key === "z" && event.shiftKey)) && !inField) { event.preventDefault(); redo(); }
      if (event.key === "Escape" && (editor || recipeOpen || accessibilityOpen || helpOpen || movingMeal)) { event.preventDefault(); closeOverlays(); }
      if (event.altKey && key === "a") {
        event.preventDefault();
        if (!accessibilityOpen) rememberOpener();
        setEditor(null); setRecipeOpen(null); setMovingMeal(null); setHelpOpen(false); setAccessibilityOpen(true);
      }
      if (event.altKey && key === "f") {
        const firstMissing = days.find((day) => meals[day.key].length === 0);
        if (firstMissing) {
          event.preventDefault();
          rememberOpener();
          setWatchOpen(false); setView("plan"); setRecipeOpen(null); setAccessibilityOpen(false); setHelpOpen(false); setMovingMeal(null);
          setEditor({ mode: "add", day: firstMissing.key });
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const submitMeal = (dayKey: DayKey, data: Omit<Meal, "id">) => {
    if (editor?.mode === "edit") {
      const { day: from, meal } = editor;
      const without = { ...meals, [from]: meals[from].filter((item) => item.id !== meal.id) };
      const updated = { ...meal, ...data };
      const next = { ...without, [dayKey]: from === dayKey ? meals[from].map((item) => (item.id === meal.id ? updated : item)) : [...without[dayKey], updated] };
      const changes = [data.moment !== meal.moment && `ahora es ${data.moment.toLowerCase()}`, data.recipe !== meal.recipe && `ahora es ${data.recipe}`, dayKey !== from && `pasó al ${dayKey}`].filter(Boolean).join(" y ");
      commit(next, `${meal.recipe} del ${from}: ${changes}`, `${countPlanned(next)} de 7 días con comida`, `Cambio guardado: ${meal.recipe} del ${from}, ${changes}.`, data.recipe);
      setEditor(null);
      restoreFocus();
      return;
    }
    const next = { ...meals, [dayKey]: [...meals[dayKey], { ...data, id: crypto.randomUUID() }] };
    const count = countPlanned(next);
    commit(next, `¡Qué rico! ${data.recipe} para ${momentArticle[data.moment]} del ${dayKey}`, `Ahora tiene ${count} de 7 días con comida`, `${data.recipe} agregado al ${dayKey}, ${data.moment}. ${count} de 7 días con comida.`, data.recipe);
    setEditor(null);
    if (view === "recipes") setView("plan");
    restoreFocus();
  };
  const moveMealTo = (from: DayKey, id: string, to: DayKey) => {
    const moved = meals[from].find((meal) => meal.id === id);
    if (!moved) return;
    const next = { ...meals, [from]: meals[from].filter((meal) => meal.id !== id), [to]: [...meals[to], moved] };
    const count = countPlanned(next);
    commit(next, `${moved.recipe} movida al ${to}`, `Antes estaba el ${from} · ${count} de 7 días con comida`, `${moved.recipe} movida del ${from} al ${to}. ${count} de 7 días con comida.`, moved.recipe);
    setMovingMeal(null);
    requestAnimationFrame(() => document.getElementById(`dia-${to}`)?.focus());
  };
  const removeMeal = (day: DayKey, id: string) => {
    const removed = meals[day].find((meal) => meal.id === id);
    if (!removed) return;
    const next = { ...meals, [day]: meals[day].filter((meal) => meal.id !== id) };
    const count = countPlanned(next);
    commit(next, `Se quitó ${removed.recipe} del ${day}`, `La receta sigue guardada · ${count} de 7 días con comida`, `Se quitó ${removed.recipe} del ${day}. Puede deshacer. ${count} de 7 días con comida.`);
    requestAnimationFrame(() => document.getElementById(`dia-${day}`)?.focus());
  };
  const changeWeek = (delta: number) => {
    const next = offset + delta;
    setOffset(next);
    setMovingMeal(null);
    setAnnouncement(`Semana del ${weekRange(next)}. ${countPlanned(weeks[String(next)] ?? emptyWeek())} de 7 días con comida.`);
  };
  const listenToSummary = () => {
    if (!("speechSynthesis" in window)) { setAnnouncement("La lectura en voz alta no está disponible en este navegador."); return; }
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); setAnnouncement("Lectura detenida."); return; }
    const summary = days.map((day) => {
      const items = meals[day.key];
      return items.length ? `${day.label}: ${items.map((meal) => `${meal.moment}, ${meal.recipe}`).join("; ")}` : `${day.label}: sin comida`;
    }).join(". ");
    const utterance = new SpeechSynthesisUtterance(`Resumen del menú de la semana del ${weekRange(offset)}. ${summary}.`);
    utterance.lang = "es-CO";
    window.speechSynthesis.speak(utterance);
    setAnnouncement("Leyendo el resumen. Pulse de nuevo para detener.");
  };
  const closeWelcome = () => { setWelcomeOpen(false); try { localStorage.setItem(welcomeKey, "1"); } catch { /* sin almacenamiento */ } };
  const plannedOn = (recipe: RecipeName) => DAY_KEYS.filter((key) => meals[key].some((meal) => meal.recipe === recipe));

  return (
    <div className="app-shell">
      <a className="skip-link" href="#menu-semana">Saltar al menú de la semana</a>
      <Header
        onAccessibility={(event) => { rememberOpener(event.currentTarget); setAccessibilityOpen(true); }}
        onHelp={(event) => { rememberOpener(event.currentTarget); setHelpOpen(true); }}
        onTextSize={(value) => setPreferences({ ...preferences, textSize: Math.min(200, Math.max(100, value)) })}
        onView={(next) => { setWatchOpen(false); setView(next); setNotice(null); }}
        onWatch={() => { setWatchOpen(true); setNotice(null); }}
        textSize={preferences.textSize}
        view={view}
      />
      {watchOpen ? <WatchView meals={weeks["0"] ?? emptyWeek()} onBack={() => setWatchOpen(false)} /> : view === "recipes" ? (
        <RecipesView
          meals={meals}
          onPlan={(recipe, event) => { rememberOpener(event.currentTarget); setEditor({ mode: "add", day: null, recipe }); }}
          onRecipe={(recipe, event) => { rememberOpener(event.currentTarget); setRecipeOpen(recipe); }}
        />
      ) : (
        <main id="menu-semana" tabIndex={-1}>
          <KitchenHero
            meals={meals} offset={offset}
            onAddToday={(event) => { rememberOpener(event.currentTarget); setEditor({ mode: "add", day: "lunes" }); }}
            onRecipe={(recipe, event) => { rememberOpener(event.currentTarget); setRecipeOpen(recipe); }}
          />
          {welcomeOpen && <Welcome onClose={closeWelcome} onHelp={(event) => { rememberOpener(event.currentTarget); closeWelcome(); setHelpOpen(true); }} />}
          <WeekToolbar
            canRedo={future.length > 0} canUndo={past.length > 0} meals={meals} offset={offset} savedAt={savedAt}
            onListen={listenToSummary} onRedo={redo} onUndo={undo} onWeek={changeWeek}
          />
          <div className="week-grid">
            {days.map((day) => (
              <DayCard
                allMeals={meals} day={day} isToday={offset === 0 && day.key === "lunes"} key={day.key} meals={meals[day.key]} movingMeal={movingMeal}
                onAdd={(event) => { rememberOpener(event.currentTarget); setEditor({ mode: "add", day: day.key }); }}
                onEdit={(meal, element) => { rememberOpener(element); setEditor({ mode: "edit", day: day.key, meal }); }}
                onMove={(id, target) => moveMealTo(day.key, id, target)}
                onMoveClose={() => { setMovingMeal(null); restoreFocus(); }}
                onMoveStart={(id, element) => { rememberOpener(element); setMovingMeal({ day: day.key, id }); }}
                onRecipe={(recipe, event) => { rememberOpener(event.currentTarget); setRecipeOpen(recipe); }}
                onRemove={(id) => removeMeal(day.key, id)}
              />
            ))}
          </div>
          <p className="version-note">Versión C · 15 oct 2026 · Prototipo funcional del equipo (Entrega final, IHC · UNAL Manizales). Datos de ejemplo. Fotos: Wikimedia Commons (ver Ayuda → Créditos).</p>
        </main>
      )}
      {editor && <MealPanel days={days} editor={editor} meals={meals} onClose={closeOverlays} onSubmit={submitMeal} />}
      {recipeOpen && <RecipePanel onClose={closeOverlays} onPlan={() => { const recipe = recipeOpen; setRecipeOpen(null); setEditor({ mode: "add", day: null, recipe }); }} plannedOn={plannedOn(recipeOpen)} recipe={recipeOpen} />}
      {accessibilityOpen && <AccessibilityPanel onChange={setPreferences} onClose={closeOverlays} onReset={() => setPreferences(defaultPreferences)} preferences={preferences} />}
      {helpOpen && <HelpPanel onClose={closeOverlays} onShowWelcome={() => { setHelpOpen(false); setWatchOpen(false); setView("plan"); setWelcomeOpen(true); }} />}
      {notice && !watchOpen && <Toast notice={notice} onClose={() => setNotice(null)} onUndo={undo} persistent={preferences.persistentNotices} />}
      {celebrate > 0 && !reduceMotion && <Celebration key={celebrate} />}
      <span aria-atomic="true" aria-live="polite" className="sr-only">{announcement}</span>
    </div>
  );
}
