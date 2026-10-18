const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const moment = require('moment');

class TFile {
    constructor(path) {
        this.path = path;
        this.extension = path.split('.').pop();
        this.basename = path.split('/').pop().replace(/\.[^/.]+$/, '');
    }
}

async function rename(oldPath, newPath, frontmatter) {
    let handler;
    let writes = 0;
    const notices = [];
    const app = {
        vault: { on(event, callback) { assert.equal(event, 'rename'); handler = callback; } },
        fileManager: { async processFrontMatter(file, callback) { writes++; callback(frontmatter); } },
    };
    const module = { exports: {} };
    vm.runInNewContext(readFileSync('main.js', 'utf8'), {
        module, exports: module.exports,
        console: { log() {} },
        require(name) {
            assert.equal(name, 'obsidian');
            return {
                moment, TFile,
                Plugin: class {
                    constructor() { this.app = app; }
                    async loadData() { return { targetKeys: ['date', 'created_at'] }; }
                    addSettingTab() {}
                    registerEvent() {}
                },
                PluginSettingTab: class {},
                Notice: class { constructor(message) { notices.push(message); } },
            };
        },
    });
    const plugin = new module.exports();
    await plugin.onload();
    await handler(new TFile(newPath), oldPath);
    return { writes, notices };
}

for (const [name, oldPath, newPath] of [
    ['same-day title edit', '240122 note.md', '240122 revised.md'],
    ['folder move', 'draft/240122 note.md', 'archive/240122 note.md'],
]) {
    test(`${name} preserves deliberately different frontmatter`, async () => {
        const data = { date: '2024-01-20', created_at: '2024-01-01' };
        const result = await rename(oldPath, newPath, data);
        assert.deepEqual(data, { date: '2024-01-20', created_at: '2024-01-01' });
        assert.equal(result.writes, 0);
        assert.equal(result.notices.length, 0);
    });
}

for (const oldPath of ['240121 note.md', 'undated note.md']) {
    test(`${oldPath} to dated title updates existing fields only`, async () => {
        const data = { date: '2024-01-01', unrelated: 'keep' };
        const result = await rename(oldPath, '240122 note.md', data);
        assert.deepEqual(data, { date: '2024-01-22', unrelated: 'keep' });
        assert.equal(result.writes, 1);
        assert.equal(result.notices.length, 1);
    });
}

test('removing the date leaves metadata unchanged', async () => {
    const data = { date: '2024-01-22' };
    assert.equal((await rename('240122 note.md', 'undated note.md', data)).writes, 0);
    assert.equal(data.date, '2024-01-22');
});

test('non-Markdown files are ignored', async () => {
    assert.equal((await rename('240121.txt', '240122.txt', {})).writes, 0);
});
