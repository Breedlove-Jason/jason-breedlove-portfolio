/* Original KeyForge exercises, AGPL-3.0-or-later. Typing targets, never executed. */
export const LANGUAGES = ['JavaScript', 'TypeScript', 'React', 'Python', 'Flask', 'Django', 'HTML', 'CSS', 'SQL', 'Bash', 'Git', 'JSON', 'Java', 'C++', 'Rust', 'Go'];
export const DRILLS = [
  ['code', 'Code snippets', 'Real syntax, one deliberate keystroke at a time.', '</>'],
  ['symbols', 'Symbol forge', 'Make brackets, quotes, and operators familiar.', '{}'],
  ['names', 'Naming rhythm', 'camelCase, snake_case, paths, and identifiers.', 'aA'],
  ['indent', 'Indentation', 'Practice spaces and line breaks without assistance.', '↳'],
  ['weak', 'Weak-key repair', 'Practice your least accurate characters.', '⌁'],
  ['daily', 'Daily commit', 'One reproducible challenge per UTC day and language.', '◈'],
  ['custom', 'Your own code', 'Paste a snippet. It stays in this tab and is never run.', '+'],
];
export const SYMBOLS = ['() => {}', '[] {} () <>', '=== !== == !=', '&& || ! ?? ?.', '+= -= *= /= ** %', "'hello' \"world\" `code`", 'user.name user_id $PATH', 'a[i] arr[0] obj[key]', '<div></div> <br />', '0 1 2 3 4 5 6 7 8 9', '# @ $ & * \\ / : ;', 'foo(bar); { return x; }'];
const snippets = {
JavaScript: [
['A clear beginning', 'const name = "Jason";\nconst greeting = `Hello, ${name}!`;\nconsole.log(greeting);'],
['An intentional filter', 'const activeUsers = users.filter((user) => user.active);\nconst names = activeUsers.map((user) => user.name);\nconsole.log(names.join(", "));'],
['Fetch with a safety net', 'async function loadProject(id) {\n  const response = await fetch(`/api/projects/${id}`);\n  if (!response.ok) {\n    throw new Error(`Request failed: ${response.status}`);\n  }\n  return response.json();\n}'],
['Reduce the noise', 'const totals = items.reduce((acc, { category, price }) => {\n  acc[category] = (acc[category] ?? 0) + price;\n  return acc;\n}, {});'],
],
TypeScript: [
['Types with intent', 'type User = {\n  id: number;\n  name: string;\n  active: boolean;\n};'],
['Small, typed functions', 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\nconst message: string = greet("Jason");'],
['Generic confidence', 'function first<T>(items: readonly T[]): T | undefined {\n  return items[0];\n}\nconst value = first<number>([1, 2, 3]);'],
['A discriminated union', 'type Result<T> =\n  | { ok: true; data: T }\n  | { ok: false; error: string };\n\nfunction unwrap<T>(result: Result<T>): T {\n  if (!result.ok) throw new Error(result.error);\n  return result.data;\n}'],
],
React: [
['Your first component', 'function Welcome() {\n  return <h1>Hello, developer!</h1>;\n}'],
['State in motion', 'const [count, setCount] = useState(0);\n\nreturn (\n  <button onClick={() => setCount((n) => n + 1)}>\n    Count: {count}\n  </button>\n);'],
['A focused effect', 'useEffect(() => {\n  const controller = new AbortController();\n  loadData(controller.signal).catch(handleError);\n  return () => controller.abort();\n}, [projectId]);'],
['Render a collection', 'return (\n  <ul aria-label="Projects">\n    {projects.map(({ id, title }) => (\n      <li key={id}>\n        <a href={`/projects/${id}`}>{title}</a>\n      </li>\n    ))}\n  </ul>\n);'],
],
Python: [
['Spaces matter', 'def greet(name):\n    message = f"Hello, {name}!"\n    return message\n\nprint(greet("Jason"))'],
['One useful comprehension', 'numbers = [1, 2, 3, 4, 5]\nsquares = [n ** 2 for n in numbers if n % 2 == 0]\nprint(squares)'],
['A little validation', 'def average(values: list[float]) -> float:\n    if not values:\n        raise ValueError("Expected at least one value")\n    return sum(values) / len(values)'],
['A dataclass record', 'from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Project:\n    name: str\n    language: str\n    stars: int = 0\n\nproject = Project("KeyForge", "Python", 1)'],
],
Flask: [
['A small route', '@app.get("/hello")\ndef hello():\n    return {"message": "Hello, developer!"}'],
['Read a query parameter', '@app.get("/search")\ndef search():\n    query = request.args.get("q", "").strip()\n    return jsonify({"query": query})'],
['An explicit response', '@app.post("/projects")\ndef create_project():\n    data = request.get_json(silent=True) or {}\n    name = data.get("name", "").strip()\n    if not name:\n        return jsonify(error="Name is required"), 400\n    return jsonify(name=name), 201'],
['An application factory', 'def create_app(config):\n    app = Flask(__name__)\n    app.config.from_mapping(config)\n    db.init_app(app)\n    app.register_blueprint(projects_bp, url_prefix="/api")\n    return app'],
],
Django: [
['A readable model', 'class Project(models.Model):\n    title = models.CharField(max_length=120)\n    active = models.BooleanField(default=True)'],
['A simple view', 'def project_list(request):\n    projects = Project.objects.filter(active=True)\n    return render(request, "projects/list.html", {\n        "projects": projects,\n    })'],
['Define the URL', 'urlpatterns = [\n    path("projects/", views.project_list, name="project-list"),\n    path("projects/<int:pk>/", views.project_detail, name="project-detail"),\n]'],
['Keep queries intentional', 'projects = (\n    Project.objects\n    .filter(owner=request.user, active=True)\n    .select_related("owner")\n    .order_by("-created_at")[:20]\n)'],
],
HTML: [
['A semantic start', '<main>\n  <h1>Build something useful.</h1>\n  <p>One small improvement at a time.</p>\n</main>'],
['A useful button', '<button type="button" aria-label="Save project">\n  Save changes\n</button>'],
['An accessible form', '<form action="/search" method="get">\n  <label for="query">Search projects</label>\n  <input id="query" name="q" type="search" required />\n  <button type="submit">Search</button>\n</form>'],
['Content with structure', '<article class="project-card">\n  <header>\n    <h2>KeyForge</h2>\n    <time datetime="2026-09-26">September 26</time>\n  </header>\n  <p>A quieter place to practice.</p>\n</article>'],
],
CSS: [
['Space to breathe', '.card {\n  padding: 1.5rem;\n  border-radius: 12px;\n  background: #101820;\n}'],
['A flexible row', '.toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}'],
['A responsive grid', '.projects {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: clamp(1rem, 3vw, 2rem);\n}'],
['Respect motion preferences', '@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation: none !important;\n    scroll-behavior: auto !important;\n  }\n}'],
],
SQL: [
['A focused query', 'SELECT id, name, language\nFROM projects\nWHERE active = TRUE\nORDER BY name;'],
['Count what matters', 'SELECT language, COUNT(*) AS total\nFROM projects\nGROUP BY language\nORDER BY total DESC;'],
['Join the dots', 'SELECT p.title, u.name AS owner\nFROM projects AS p\nINNER JOIN users AS u ON u.id = p.owner_id\nWHERE p.created_at >= :start_date\nORDER BY p.created_at DESC;'],
['A clear transaction', 'BEGIN;\nUPDATE accounts\nSET balance = balance - :amount\nWHERE id = :sender_id;\nUPDATE accounts\nSET balance = balance + :amount\nWHERE id = :recipient_id;\nCOMMIT;'],
],
Bash: [
['An everyday shell', 'pwd\nls -lah\ncd ~/projects\nprintf "%s\\n" "Ready to build"'],
['Quote your variables', 'project="keyforge"\nmkdir -p "$HOME/projects/$project"\ncd "$HOME/projects/$project" || exit 1'],
['A careful script', '#!/usr/bin/env bash\nset -euo pipefail\n\nfor file in src/*.ts; do\n  printf "Checking: %s\\n" "$file"\ndone'],
['Readable pipelines', 'find ./src -type f -name "*.tsx" -print0 |\n  xargs -0 grep -n "useEffect" |\n  sort -u'],
],
Git: [
['Know your working tree', 'git status --short\ngit diff --stat\ngit log --oneline -5'],
['A focused branch', 'git switch -c feature/code-lab\ngit add src/code-lab.ts\ngit commit -m "feat: add code typing practice"'],
['Review before merging', 'git fetch origin\ngit diff origin/main...HEAD\ngit log --oneline --graph --decorate -10'],
['Find the story', 'git log --all --format="%h %s" -- src/\ngit show --stat HEAD\ngit blame -L 1,25 -- src/main.ts'],
],
JSON: [
['A tiny configuration', '{\n  "name": "keyforge",\n  "private": true,\n  "version": "1.0.0"\n}'],
['Build a data structure', '{\n  "languages": ["JavaScript", "Python"],\n  "settings": {\n    "duration": 60,\n    "showKeyboard": true\n  }\n}'],
['Nested data', '{\n  "project": {\n    "id": 42,\n    "tags": ["typing", "developer"],\n    "owner": { "name": "Jason", "active": true }\n  },\n  "error": null\n}'],
['A structured result', '{\n  "status": "ok",\n  "data": [\n    { "language": "TypeScript", "accuracy": 98.4 },\n    { "language": "Python", "accuracy": 97.2 }\n  ],\n  "pagination": { "page": 1, "hasNext": false }\n}'],
],
Java: [
['A familiar entry point', 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, developer!");\n    }\n}'],
['A typed method', 'public static int add(int left, int right) {\n    return left + right;\n}'],
['Filter a stream', 'List<String> names = users.stream()\n    .filter(User::isActive)\n    .map(User::getName)\n    .sorted()\n    .toList();'],
['A compact record', 'public record Project(String name, int stars) {\n    public Project {\n        if (name == null || name.isBlank()) {\n            throw new IllegalArgumentException("Name is required");\n        }\n    }\n}'],
],
'C++': [
['A small program', '#include <iostream>\n\nint main() {\n    std::cout << "Hello, developer!" << std::endl;\n    return 0;\n}'],
['Working with a vector', 'std::vector<int> values{1, 2, 3};\nfor (const auto value : values) {\n    std::cout << value << "\\n";\n}'],
['Ownership made explicit', 'auto project = std::make_unique<Project>("KeyForge");\nif (project != nullptr) {\n    project->save();\n}'],
['A reusable template', 'template <typename T>\nT maximum(const T& left, const T& right) {\n    return (left < right) ? right : left;\n}'],
],
Rust: [
['Start with a binding', 'fn main() {\n    let name = "Jason";\n    println!("Hello, {}!", name);\n}'],
['A typed function', 'fn add(left: i32, right: i32) -> i32 {\n    left + right\n}'],
['Handle both outcomes', 'match read_file("config.json") {\n    Ok(content) => println!("{}", content),\n    Err(error) => eprintln!("Failed: {}", error),\n}'],
['Collect with intent', 'let squares: Vec<i32> = (1..=10)\n    .filter(|n| n % 2 == 0)\n    .map(|n| n * n)\n    .collect();'],
],
Go: [
['A simple greeting', 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, developer!")\n}'],
['Return two values', 'func divide(a, b float64) (float64, error) {\n    if b == 0 {\n        return 0, fmt.Errorf("division by zero")\n    }\n    return a / b, nil\n}'],
['A small struct', 'type Project struct {\n    Name     string `json:"name"`\n    Language string `json:"language"`\n    Active   bool   `json:"active"`\n}'],
['Context matters', 'select {\ncase result := <-results:\n    fmt.Println(result)\ncase <-ctx.Done():\n    return ctx.Err()\n}'],
],
};
export function seeded(seed) {
  let n = 2166136261;
  for (const c of seed) { n ^= c.charCodeAt(0); n = Math.imul(n, 16777619); }
  return () => { n += 0x6D2B79F5; let t = Math.imul(n ^ n >>> 15, 1 | n); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function makeLesson({ language = 'JavaScript', drill = 'code', level = 'foundation', seconds = 0, custom = '', weak = [], date = new Date().toISOString().slice(0, 10), seed = String(Math.random()) } = {}) {
  const rng = seeded(drill === 'daily' ? `${date}:${language}` : seed);
  const pick = list => list[Math.floor(rng() * list.length)];
  let pool = snippets[language] ?? snippets.JavaScript;
  pool = level === 'foundation' ? pool.slice(0, 2) : level === 'fluent' ? pool.slice(2) : pool;
  let [title, text] = pick(pool);
  if (drill === 'symbols') {
    const tokens = level === 'foundation' ? SYMBOLS.slice(0, 5) : SYMBOLS;
    text = Array.from({ length: 8 }, () => pick(tokens)).join('\n'); title = 'Symbol forge';
  } else if (drill === 'names') {
    const names = ['getUserById', 'setIsLoading', 'handleSubmit', 'request.user.id', 'user_profile', 'created_at', 'MAX_RETRY_COUNT', 'src/components/Button.tsx', 'isAuthenticated', 'onValueChange', 'fetchProjectData', 'total_count'];
    text = Array.from({ length: 12 }, () => pick(names)).join(' '); title = 'Naming rhythm';
  } else if (drill === 'indent') {
    text = language === 'Python' || language === 'Django' || language === 'Flask'
      ? 'def process(items):\n    for item in items:\n        if item.is_valid:\n            save(item)\n    return len(items)'
      : 'function process(items) {\n  for (const item of items) {\n    if (item.isValid) {\n      save(item);\n    }\n  }\n  return items.length;\n}';
    title = 'Whitespace, deliberately';
  } else if (drill === 'weak') {
    const keys = weak.filter(c => !/\s/u.test(c)).slice(0, 6);
    const candidates = SYMBOLS.filter(s => keys.some(c => s.includes(c)));
    const tokens = keys.length ? [...keys.map(c => `${c}${c} ${c}${c}${c}`), ...candidates] : SYMBOLS.slice(0, 6);
    text = Array.from({ length: 10 }, () => pick(tokens)).join('\n');
    title = keys.length ? `Repair: ${keys.join(' ')}` : 'Calibration: build your key profile';
  } else if (drill === 'daily') {
    [title, text] = pick(snippets[language] ?? snippets.JavaScript);
    title = `Daily commit · ${date} UTC`;
    seconds = 0;
  } else if (drill === 'custom') {
    text = custom.replace(/\r\n?/g, '\n').replace(/\t/g, '  ').slice(0, 10000);
    if (!text.trim()) text = '// Paste your own code in the panel above.\nconst practice = "one line at a time";';
    title = 'Your own code (never executed)';
  }
  if (seconds && drill !== 'daily') {
    const blocks = [text];
    let size = text.length;
    while (size < 24000) {
      const next = drill === 'code' ? pick(pool)[1] : text;
      blocks.push(next); size += next.length + 2;
    }
    text = blocks.join('\n\n');
  }
  return { title, text, seconds, language, drill, level };
}
export function fileName(language) {
  return { JavaScript: 'practice.js', TypeScript: 'practice.ts', React: 'Component.jsx', Python: 'practice.py', Flask: 'routes.py', Django: 'views.py', HTML: 'index.html', CSS: 'styles.css', SQL: 'query.sql', Bash: 'script.sh', Git: 'workflow.sh', JSON: 'config.json', Java: 'Main.java', 'C++': 'main.cpp', Rust: 'main.rs', Go: 'main.go' }[language] ?? 'practice.txt';
}
export const SNIPPET_COUNT = Object.values(snippets).reduce((n, rows) => n + rows.length, 0);
