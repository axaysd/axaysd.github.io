import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { createHash } from 'node:crypto';

// Generate static archive cards so project content works without JavaScript.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const context = createContext({});
runInContext(readFileSync(resolve(root, 'js/projects-data.js'), 'utf8') + '\n;globalThis.projectData = PROJECTS;', context);
const projects = context.projectData.filter(project => project.archived);
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const link = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span></a>`;

const cards = projects.map(project => {
  const links = [link(project.link, project.ctaLabel || 'View project')];
  if (project.github && project.github !== project.link) links.push(link(project.github, 'Source code'));
  if (project.liveLink && project.liveLink !== project.link) links.push(link(project.liveLink, 'Live demo'));
  return `          <article class="project-card" data-category="${escape(project.categories.join(' '))}">
            <img src="${escape(project.image)}" alt="" width="400" height="225" loading="lazy">
            <div class="project-card-body">
              <span class="project-card-type">${escape(project.maturity)}</span>
              <h3>${escape(project.title)}</h3>
              <p>${escape(project.description)}</p>
              <div class="project-card-tags">${project.tech.map(tech => `<span class="tag">${escape(tech)}</span>`).join('')}</div>
              <div class="project-card-links">${links.join('')}</div>
            </div>
          </article>`;
}).join('\n');

const indexPath = resolve(root, 'index.html');
const before = readFileSync(indexPath, 'utf8');
const marker = /<!-- PROJECT_ARCHIVE_START -->[\s\S]*?<!-- PROJECT_ARCHIVE_END -->/;
if (!marker.test(before)) throw new Error('Project archive markers are missing from index.html.');
let after = before.replace(marker, `<!-- PROJECT_ARCHIVE_START -->\n${cards}\n          <!-- PROJECT_ARCHIVE_END -->`);
for (const asset of ['css/style.css', 'css/animations.css', 'js/main.js']) {
  const version = createHash('sha256').update(readFileSync(resolve(root, asset))).digest('hex').slice(0, 10);
  const reference = new RegExp(`((?:href|src)="${asset.replaceAll('.', '[.]')})(?:[?]v=[a-z0-9]+)?"`, 'g');
  after = after.replace(reference, `$1?v=${version}"`);
}
if (after !== before) writeFileSync(indexPath, after);
console.log(`Project archive contains ${projects.length} static cards.`);
