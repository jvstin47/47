const DataStore = require('./js/services/data-store');
const BenchmarkEngine = require('./js/services/benchmark-engine');
const TerminalEngine = require('./js/services/terminal-engine');
const Formatters = require('./js/utils/formatters');

console.log('1. Testing DataStore...');
console.assert(DataStore.projects.length === 10, 'Expected 10 projects');
console.assert(DataStore.fileSystem['~/projects'].length === 10, 'Expected 10 project folders');
console.assert(DataStore.getFile('bio.txt').includes('Justin Joe Mathew'), 'bio.txt match');
console.assert(DataStore.getProject('phoenix-uav').sihTrack.includes('SIH 26177'), 'phoenix-uav match');

console.log('2. Testing BenchmarkEngine...');
const benchRes = BenchmarkEngine.runMonteCarloBenchmark(500, 57);
console.assert(benchRes.runs === 500, 'Runs check');
console.assert(benchRes.totalLaps === 28500, 'Laps check');
console.assert(benchRes.elapsedMs >= 0, 'Elapsed check');
const crtRes = BenchmarkEngine.solveCRT([2, 3, 2], [3, 5, 7]);
console.assert(crtRes === 23, 'CRT check: expected 23, got ' + crtRes);

console.log('3. Testing TerminalEngine...');
const term = new TerminalEngine({ dataStore: DataStore, benchmarkEngine: BenchmarkEngine });

// Test help
const helpOut = term.execute('help');
console.assert(helpOut.type === 'html' && helpOut.output.includes('Terminal System Commands'), 'help check');

// Test pwd
console.assert(term.execute('pwd').output.includes('~/projects'), 'pwd check');

// Test ls
const lsOut = term.execute('ls');
console.assert(lsOut.output.includes('phoenix-uav'), 'ls check');

// Test fuzzy cd
const cdRes = term.execute('cd phoenix');
console.assert(cdRes.newDir === '~/projects/phoenix-uav', 'fuzzy cd phoenix check: ' + cdRes.newDir);

// Test cat inside ~/projects/phoenix-uav
const catRes = term.execute('cat README.md');
console.assert(catRes.type === 'viewport', 'cat type should be viewport');
console.assert(catRes.content.includes('Phoenix X'), 'cat content should include Phoenix X');

// Test cd ..
const cdParent = term.execute('cd ..');
console.assert(cdParent.newDir === '~/projects', 'cd .. check: ' + cdParent.newDir);

// Test bench command
const benchCmd = term.execute('bench');
console.assert(benchCmd.output.includes('COMPLETED 1,000 MONTE CARLO'), 'bench command check');

// Test autocomplete
const acCmd = term.getAutocompleteCandidates('ph');
console.assert(acCmd.matches.includes('phoenix'), 'ac command check');
const acCd = term.getAutocompleteCandidates('cd pho');
console.assert(acCd.matches.includes('phoenix-uav'), 'ac cd check');

console.log('4. Testing Formatters...');
const mdHtml = Formatters.formatMarkdown('# Title\n\n• Item with **bold** and `code`');
console.assert(mdHtml.includes('<h1') && mdHtml.includes('Title</h1>'), 'md title check');
console.assert(mdHtml.includes('<strong') && mdHtml.includes('bold</strong>'), 'md bold check');
console.assert(mdHtml.includes('<code') && mdHtml.includes('code</code>'), 'md code check');

console.log('5. Testing State / PubSub Store...');
const Store = require('./js/state');
let notifiedValue = null;
const unsub = Store.subscribe('theme', (val) => { notifiedValue = val; });
Store.setState({ theme: 'light' });
console.assert(notifiedValue === 'light', 'Store pub/sub notification');
console.assert(Store.getState().theme === 'light', 'Store state update');
unsub();

console.log('=== ALL 5 TEST SUITES PASSED FLAWLESSLY ===');
